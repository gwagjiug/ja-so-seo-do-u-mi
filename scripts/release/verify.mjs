import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { parse } from "yaml";
import { assertVersion, readVersions, releaseNotes } from "./files.mjs";

export async function verify(cwd) {
  const { version } = await readVersions(cwd);
  releaseNotes(await readFile(join(cwd, "CHANGELOG.md"), "utf8"), version);
  const baseline = JSON.parse(await readFile(join(cwd, ".release-baseline.json"), "utf8"));
  assertVersion(baseline.version);
  for (const name of ["verify.yml", "release.yml"]) {
    const workflow = parse(await readFile(join(cwd, ".github/workflows", name), "utf8"), { uniqueKeys: true });
    if (!workflow.on || !workflow.jobs) throw new Error(`Invalid workflow: ${name}`);
  }
  console.log(`Version files and changelog agree: ${version}; workflow YAML parsed successfully`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await verify(process.cwd());
