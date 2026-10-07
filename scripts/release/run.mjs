import semanticRelease from "semantic-release";
import { git } from "./git.mjs";
import { verify } from "./verify.mjs";
import { ensureBaseline, reconcileReleases } from "./lifecycle.mjs";

const cwd = process.cwd();
const dryRun = process.argv.includes("--dry-run");
const repository = "gwagjiug/ja-so-seo-do-u-mi";
if (git(cwd, "branch", "--show-current") !== "main") throw new Error("Releases run only on main");
if (process.env.GITHUB_ACTIONS && process.env.GITHUB_REF !== "refs/heads/main") throw new Error("Workflow must run from main");
if (git(cwd, "status", "--porcelain")) throw new Error("Release checkout must be clean");
if (process.env.GITHUB_REPOSITORY && process.env.GITHUB_REPOSITORY !== repository) throw new Error("Unexpected release repository");
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
if (!token) throw new Error("A release GitHub App token is required");

async function request(method, path, body) {
  const response = await fetch(`https://api.github.com/repos/${repository}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json"
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (method === "GET" && response.status === 404) return null;
  if (!response.ok) throw new Error(`GitHub ${method} ${path}: ${response.status}`);
  return response.json();
}

await verify(cwd);
await ensureBaseline(cwd, { dryRun });
await reconcileReleases(cwd, request, { dryRun });
await semanticRelease({ dryRun }, { cwd, env: process.env });
