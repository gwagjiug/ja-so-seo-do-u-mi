import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export function validTitle(title) {
  return typeof title === "string" && /^(feat|fix|perf|docs|test|ci|chore|refactor|build|style|revert)(\([^()\r\n]+\))?!?: \S[^\r\n]*$/.test(title);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, "utf8"));
  if (!validTitle(event.pull_request?.title)) {
    throw new Error("PR 제목은 'fix: 설명', 'feat: 설명', 'feat!: 호환성 변경' 등의 형식이어야 합니다. Squash merge 시 같은 제목을 사용하세요.");
  }
}
