import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

export const pluginPath = ".codex-plugin/plugin.json";
export const skillPath = "skills/ja-so-seo-do-u-mi/SKILL.md";
const versionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

export function assertVersion(version) {
  if (typeof version !== "string" || !versionPattern.test(version)) {
    throw new Error(`Invalid stable release version: ${version}`);
  }
  return version;
}

export function skillVersion(text) {
  const header = text.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
  const matches = [...(header ?? "").matchAll(/^version: "([^"]+)"\s*$/gm)];
  if (matches.length !== 1) throw new Error("SKILL.md must contain one quoted version in frontmatter");
  return assertVersion(matches[0][1]);
}

export function releaseNotes(changelog, version) {
  assertVersion(version);
  const start = `<!-- release:${version} -->`;
  const end = `<!-- /release:${version} -->`;
  if (changelog.split(start).length !== 2 || changelog.split(end).length !== 2) {
    throw new Error(`CHANGELOG.md must contain exactly one entry for ${version}`);
  }
  const notes = changelog.split(start)[1].split(end)[0].trim();
  if (!notes || changelog.indexOf(end) < changelog.indexOf(start)) {
    throw new Error(`Invalid changelog entry for ${version}`);
  }
  return notes;
}

export async function readVersions(cwd) {
  const [pluginText, skillText] = await Promise.all([
    readFile(join(cwd, pluginPath), "utf8"), readFile(join(cwd, skillPath), "utf8")
  ]);
  const plugin = JSON.parse(pluginText);
  assertVersion(plugin.version);
  if (plugin.version !== skillVersion(skillText)) throw new Error("Plugin and skill versions differ");
  return { plugin, skillText, version: plugin.version };
}

export async function updateRelease(cwd, version, notes) {
  assertVersion(version);
  if (!notes?.trim()) throw new Error("Release notes cannot be empty");
  const { plugin, skillText, version: previous } = await readVersions(cwd);
  const changelogPath = join(cwd, "CHANGELOG.md");
  const changelog = await readFile(changelogPath, "utf8");
  if (!changelog.startsWith("# Changelog\n")) throw new Error("Invalid CHANGELOG.md heading");
  // A failed push/tag may leave a release commit on main. Preparing it again is idempotent.
  if (previous === version) {
    releaseNotes(changelog, version);
    return;
  }
  const a = previous.split(".").map(Number);
  const b = version.split(".").map(Number);
  const firstDifference = b.findIndex((part, i) => part !== a[i]);
  if (firstDifference < 0 || b[firstDifference] < a[firstDifference]) {
    throw new Error(`Refusing version downgrade: ${previous} -> ${version}`);
  }
  if (changelog.includes(`<!-- release:${version} -->`)) throw new Error("Version already in changelog");
  releaseNotes(changelog, previous);
  const nextSkill = skillText.replace(/^version: "[^"]+"/m, `version: "${version}"`);
  const nextChangelog = `# Changelog\n\n<!-- release:${version} -->\n${notes.trim()}\n<!-- /release:${version} -->\n\n${changelog.slice("# Changelog\n".length).trimStart()}`;
  await writeFile(join(cwd, pluginPath), `${JSON.stringify({ ...plugin, version }, null, 2)}\n`);
  await writeFile(join(cwd, skillPath), nextSkill);
  await writeFile(changelogPath, nextChangelog);
}
