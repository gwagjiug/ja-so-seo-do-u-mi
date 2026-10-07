export default {
  branches: ["main"],
  repositoryUrl: "https://github.com/gwagjiug/ja-so-seo-do-u-mi.git",
  tagFormat: "v${version}",
  plugins: [
    ["@semantic-release/commit-analyzer", { preset: "conventionalcommits" }],
    ["@semantic-release/release-notes-generator", { preset: "conventionalcommits" }],
    "./scripts/release/prepare.mjs",
    ["@semantic-release/git", {
      assets: [
        ".codex-plugin/plugin.json",
        "skills/ja-so-seo-do-u-mi/SKILL.md",
        "CHANGELOG.md"
      ],
      message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
    }],
    ["@semantic-release/github", {
      successCommentCondition: false,
      failCommentCondition: false,
      releasedLabels: false
    }]
  ]
};
