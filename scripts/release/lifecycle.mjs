import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { git } from "./git.mjs";
import { assertVersion, pluginPath, skillPath, skillVersion, releaseNotes } from "./files.mjs";

export function stableTags(cwd) {
  return git(cwd, "tag", "--merged", "HEAD", "--list", "v*")
    .split("\n").filter(tag => /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(tag))
    .sort((a, b) => {
      const left = a.slice(1).split(".").map(Number);
      const right = b.slice(1).split(".").map(Number);
      for (let i = 0; i < 3; i++) if (left[i] !== right[i]) return left[i] - right[i];
      return 0;
    });
}

export function taggedRelease(cwd, tag) {
  const version = assertVersion(tag.slice(1));
  const plugin = JSON.parse(git(cwd, "show", `${tag}:${pluginPath}`));
  const skill = git(cwd, "show", `${tag}:${skillPath}`);
  if (plugin.version !== version || skillVersion(skill) !== version) {
    throw new Error(`Tag ${tag} does not match its version files; refusing publication`);
  }
  return { tag_name: tag, name: tag, body: releaseNotes(git(cwd, "show", `${tag}:CHANGELOG.md`), version) };
}

export async function ensureBaseline(cwd, { dryRun = false, log = console.log } = {}) {
  const baseline = JSON.parse(await readFile(join(cwd, ".release-baseline.json"), "utf8"));
  const tag = `v${assertVersion(baseline.version)}`;
  const tags = stableTags(cwd);
  if (!tags.includes(tag)) {
    if (tags.length) throw new Error(`Existing releases lack baseline ${tag}; reconcile manually`);
    // First-parent history selects the main merge commit, not a feature branch's older commit.
    const commit = git(cwd, "log", "--first-parent", "--reverse", "--format=%H", "--", ".release-baseline.json").split("\n")[0];
    if (!commit) throw new Error("The release baseline must be committed on main before bootstrap");
    const snapshot = JSON.parse(git(cwd, "show", `${commit}:.release-baseline.json`));
    if (snapshot.version !== baseline.version) throw new Error("The release baseline is immutable");
    // Validate the snapshot before creating even a local tag.
    const plugin = JSON.parse(git(cwd, "show", `${commit}:${pluginPath}`));
    if (plugin.version !== baseline.version || skillVersion(git(cwd, "show", `${commit}:${skillPath}`)) !== baseline.version) {
      throw new Error("Baseline commit has inconsistent version files");
    }
    releaseNotes(git(cwd, "show", `${commit}:CHANGELOG.md`), baseline.version);
    git(cwd, "tag", tag, commit);
    log(`Baseline: ${tag} at ${commit}${dryRun ? " (local-only dry run)" : ""}`);
  }
  taggedRelease(cwd, tag);
  const remote = git(cwd, "ls-remote", "--tags", "origin", `refs/tags/${tag}`);
  if (remote && remote.split(/\s+/)[0] !== git(cwd, "rev-parse", `refs/tags/${tag}`)) {
    throw new Error(`Remote ${tag} differs from local tag; refusing overwrite`);
  }
  if (!remote) {
    if (dryRun) log(`Would push ${tag}`);
    else git(cwd, "push", "origin", `refs/tags/${tag}`);
  }
}

export async function reconcileReleases(cwd, request, { dryRun = false, log = console.log } = {}) {
  const tags = stableTags(cwd);
  for (const tag of tags) {
    const release = taggedRelease(cwd, tag);
    const existing = await request("GET", `/releases/tags/${tag}`);
    if (existing) {
      if (existing.draft) throw new Error(`${tag} has an existing draft release; resolve it before continuing`);
      continue;
    }
    if (dryRun) log(`Would publish missing GitHub Release ${tag}`);
    else {
      // Recover the notes stored in that tag, never notes from today's main.
      await request("POST", "/releases", { ...release, make_latest: tag === tags.at(-1) ? "true" : "false" });
      log(`Published missing GitHub Release ${tag}`);
    }
  }
}
