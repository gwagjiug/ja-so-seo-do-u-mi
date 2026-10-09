import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Writable } from "node:stream";
import { analyzeCommits } from "@semantic-release/commit-analyzer";
import semanticRelease from "semantic-release";
import config from "../../release.config.mjs";
import { updateRelease, readVersions, releaseNotes, pluginPath, skillPath } from "../../scripts/release/files.mjs";
import { validTitle } from "../../scripts/release/check-pr-title.mjs";
import { git } from "../../scripts/release/git.mjs";
import { ensureBaseline, reconcileReleases, taggedRelease } from "../../scripts/release/lifecycle.mjs";

const project = fileURLToPath(new URL("../../", import.meta.url));
const quiet = { log() {} };

async function fixture(t) {
  const root = await mkdtemp(join(tmpdir(), "jasoseo-release-test-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const cwd = join(root, "work");
  const remote = join(root, "origin.git");
  await mkdir(cwd);
  git(root, "init", "--bare", "-b", "main", remote);
  git(cwd, "init", "-b", "main");
  git(cwd, "config", "user.name", "Release test");
  git(cwd, "config", "user.email", "release-test@example.invalid");
  git(cwd, "config", "commit.gpgsign", "false");
  git(cwd, "config", "tag.gpgsign", "false");
  git(cwd, "remote", "add", "origin", `file://${remote}`);
  await writeFile(join(cwd, "README.md"), "Historical content\n");
  git(cwd, "add", ".");
  git(cwd, "commit", "-m", "feat!: historical breaking change");
  // Keep the bootstrap snapshot independent of the project's current release.
  const files = [
    [pluginPath, `${JSON.stringify({ name: "release-fixture", version: "0.2.0", skills: "./skills/" }, null, 2)}\n`],
    [skillPath, [
      "---",
      "name: release-fixture",
      'version: "0.2.0"',
      "description: Synthetic skill for release tests",
      "---",
      "",
      "# Release fixture",
      "",
      "Preserve user-provided facts.",
      "",
      "```text",
      'version: "0.2.0"',
      "```",
      ""
    ].join("\n")],
    ["CHANGELOG.md", "# Changelog\n\n<!-- release:0.2.0 -->\n## 0.2.0\n\nBaseline release notes.\n<!-- /release:0.2.0 -->\n"],
    [".release-baseline.json", '{\n  "version": "0.2.0"\n}\n']
  ];
  for (const [path, content] of files) {
    await mkdir(join(cwd, path, ".."), { recursive: true });
    await writeFile(join(cwd, path), content);
  }
  git(cwd, "add", ".");
  git(cwd, "commit", "-m", "ci: configure automatic releases");
  const baseline = git(cwd, "rev-parse", "HEAD");
  git(cwd, "push", "-u", "origin", "main");
  return { cwd, remote, baseline };
}

for (const [messages, expected] of [
  [["fix: 모드 분기 수정"], "patch"],
  [["perf: 글자수 처리 최적화"], "patch"],
  [["feat: 일괄 처리"], "minor"],
  [["feat!: 입력 형식 변경"], "major"],
  [["fix: 입력 변경\n\nBREAKING CHANGE: 이전 입력은 지원하지 않음"], "major"],
  [["docs: 설명", "test: 사례 추가", "ci: 설정", "chore(release): 0.2.1 [skip ci]"], null],
  [["fix: 오류 수정", "feat: 일괄 처리"], "minor"]
]) {
  test(`commit classification: ${messages.join(" / ")}`, async () => {
    const actual = await analyzeCommits(config.plugins[0][1], {
      cwd: project, commits: messages.map(message => ({ message })), logger: quiet
    });
    assert.equal(actual, expected);
  });
}

test("PR title validation accepts scope/breaking changes and rejects ambiguous titles", () => {
  for (const title of ["fix: 모드 수정", "feat(batch)!: 새 입력", "docs: 사용법"]) assert.ok(validTitle(title));
  for (const title of ["모드 수정", "fix:", "fix: \n명령", "feat: ", "Fix: 내용"]) assert.ok(!validTitle(title));
});

test("version update preserves skill prose and is idempotent", async t => {
  const { cwd } = await fixture(t);
  const original = await readFile(join(cwd, skillPath), "utf8");
  const notes = "## 0.2.1\n\nFixture release notes.";
  await updateRelease(cwd, "0.2.1", notes);
  assert.equal((await readVersions(cwd)).version, "0.2.1");
  assert.equal(await readFile(join(cwd, skillPath), "utf8"), original.replace('version: "0.2.0"', 'version: "0.2.1"'));
  const changelog = await readFile(join(cwd, "CHANGELOG.md"), "utf8");
  await updateRelease(cwd, "0.2.1", "Retried notes");
  assert.equal(await readFile(join(cwd, "CHANGELOG.md"), "utf8"), changelog);
  assert.equal(releaseNotes(changelog, "0.2.1"), notes);
  await assert.rejects(updateRelease(cwd, "0.1.0", "Downgrade"), /downgrade/);
});

test("inconsistent versions fail before any files are written", async t => {
  const { cwd } = await fixture(t);
  const original = await readFile(join(cwd, pluginPath), "utf8");
  await writeFile(join(cwd, skillPath), '---\nversion: "0.1.0"\n---\n');
  await assert.rejects(updateRelease(cwd, "0.2.1", "Notes"), /versions differ/);
  assert.equal(await readFile(join(cwd, pluginPath), "utf8"), original);
});

test("delayed bootstrap uses introduction commit, not newer fixes, and dry-run never pushes", async t => {
  const { cwd, remote, baseline } = await fixture(t);
  await writeFile(join(cwd, "later.txt"), "later fix");
  git(cwd, "add", ".");
  git(cwd, "commit", "-m", "fix: later fix");
  await ensureBaseline(cwd, { dryRun: true, log() {} });
  assert.equal(git(cwd, "rev-parse", "v0.2.0"), baseline);
  assert.equal(git(remote, "tag", "--list"), "");
  await ensureBaseline(cwd, { log() {} });
  await ensureBaseline(cwd, { log() {} });
  assert.equal(git(remote, "tag", "--list"), "v0.2.0");
});

test("bootstrap selects main merge commit when setup was developed on another branch", async t => {
  const { cwd, baseline } = await fixture(t);
  git(cwd, "branch", "setup", baseline);
  git(cwd, "checkout", "-B", "main", `${baseline}^`);
  git(cwd, "merge", "--no-ff", "setup", "-m", "Merge release setup");
  const merge = git(cwd, "rev-parse", "HEAD");
  await ensureBaseline(cwd, { dryRun: true, log() {} });
  assert.equal(git(cwd, "rev-parse", "v0.2.0"), merge);
});

test("missing GitHub Release is recovered once from tagged notes; dry-run does not publish", async t => {
  const { cwd } = await fixture(t);
  await ensureBaseline(cwd, { log() {} });
  await writeFile(join(cwd, "CHANGELOG.md"), "unreleased notes must not leak");
  const stored = new Map();
  const created = [];
  const request = async (method, path, body) => {
    if (method === "GET") return stored.get(path.split("/").at(-1)) ?? null;
    created.push(body);
    stored.set(body.tag_name, body);
    return body;
  };
  await reconcileReleases(cwd, request, { dryRun: true, log() {} });
  assert.equal(created.length, 0);
  await reconcileReleases(cwd, request, { log() {} });
  await reconcileReleases(cwd, request, { log() {} });
  assert.equal(created.length, 1);
  assert.equal(created[0].tag_name, "v0.2.0");
  assert.ok(!created[0].body.includes("unreleased"));
  assert.equal(created[0].make_latest, "true");
});

test("mismatched tag contents cannot be published", async t => {
  const { cwd } = await fixture(t);
  git(cwd, "tag", "v0.2.1");
  assert.throws(() => taggedRelease(cwd, "v0.2.1"), /does not match/);
});

test("real semantic-release publishes a local patch commit/tag and reruns without another bump", async t => {
  const { cwd, remote } = await fixture(t);
  await ensureBaseline(cwd, { log() {} });
  await writeFile(join(cwd, "fix.txt"), "mode fix");
  git(cwd, "add", ".");
  git(cwd, "commit", "-m", "fix: clarify mode routing");
  git(cwd, "push", "origin", "main");
  const plugins = config.plugins.filter(plugin => !(Array.isArray(plugin) && plugin[0] === "@semantic-release/github"))
    .map(plugin => {
      const [name, options] = Array.isArray(plugin) ? plugin : [plugin, undefined];
      const path = name.startsWith("./") ? resolve(project, name) : fileURLToPath(import.meta.resolve(name));
      return options ? [path, options] : path;
    });
  const env = { ...process.env, GIT_AUTHOR_NAME: "Release test", GIT_AUTHOR_EMAIL: "test@example.invalid", GIT_COMMITTER_NAME: "Release test", GIT_COMMITTER_EMAIL: "test@example.invalid" };
  for (const key of ["GITHUB_ACTIONS", "GITHUB_TOKEN", "GH_TOKEN", "GITHUB_REF", "CI"]) delete env[key];
  const sink = new Writable({ write(_chunk, _encoding, callback) { callback(); } });
  const options = { ...config, repositoryUrl: `file://${remote}`, plugins, ci: false };
  const context = { cwd, env, stdout: sink, stderr: sink };
  const preview = await semanticRelease({ ...options, dryRun: true }, context);
  assert.equal(preview.nextRelease.version, "0.2.1");
  assert.equal((await readVersions(cwd)).version, "0.2.0");
  assert.equal(git(remote, "tag", "--list"), "v0.2.0");
  const result = await semanticRelease(options, context);
  assert.equal(result.nextRelease.version, "0.2.1");
  assert.equal((await readVersions(cwd)).version, "0.2.1");
  assert.equal(git(cwd, "rev-parse", "v0.2.1"), git(remote, "rev-parse", "main"));
  assert.match(git(cwd, "log", "-1", "--format=%s"), /^chore\(release\): 0\.2\.1/);
  assert.match(taggedRelease(cwd, "v0.2.1").body, /clarify mode routing/);
  assert.equal(await semanticRelease(options, context), false);
});
