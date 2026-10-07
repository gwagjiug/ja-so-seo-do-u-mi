import { updateRelease } from "./files.mjs";

export async function prepare(_config, { cwd, nextRelease, logger }) {
  await updateRelease(cwd, nextRelease.version, nextRelease.notes);
  logger.log("Synchronized plugin, skill, and changelog for %s", nextRelease.version);
}
