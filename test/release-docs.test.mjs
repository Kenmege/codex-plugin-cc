import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("pull request workflow cancels superseded matrix runs", () => {
  const source = read(".github/workflows/pull-request-ci.yml");
  assert.match(source, /concurrency:/);
  assert.match(source, /group: pr-\$\{\{ github\.workflow \}\}-\$\{\{ github\.ref \}\}/);
  assert.match(source, /cancel-in-progress: true/);
});

test("package files list excludes bump-version from the shipped tarball surface", () => {
  const packageJson = JSON.parse(read("package.json"));
  assert.ok(packageJson.files.includes("scripts/claude-review-companion.mjs"));
  assert.ok(packageJson.files.includes("scripts/bin/"));
  assert.ok(packageJson.files.includes("scripts/lib/"));
  assert.ok(!packageJson.files.includes("scripts/"));
});

test("GitHub Packages release configuration is scoped and token-safe", () => {
  const packageJson = JSON.parse(read("package.json"));
  const npmrc = read(".npmrc");
  const workflow = read(".github/workflows/release.yml");

  assert.equal(packageJson.name, "@kenmege/codex-plugin-cc");
  assert.equal(packageJson.private, true);
  assert.match(
    packageJson.repository.url,
    /^(git\+)?https:\/\/github\.com\/Kenmege\/codex-plugin-cc\.git$/
  );
  assert.deepEqual(packageJson.publishConfig, {
    registry: "https://npm.pkg.github.com",
    access: "restricted",
    provenance: true
  });
  assert.match(npmrc, /^@kenmege:registry=https:\/\/npm\.pkg\.github\.com$/m);
  assert.doesNotMatch(npmrc, new RegExp("_auth" + "Token|" + "YOUR_CLASSIC_PAT"));
  assert.match(workflow, /packages: write/);
  assert.match(workflow, /registry-url: https:\/\/npm\.pkg\.github\.com/);
  assert.match(workflow, /scope: "@kenmege"/);
  assert.match(workflow, /NODE_AUTH_TOKEN: \$\{\{ secrets\.GITHUB_TOKEN \}\}/);
  assert.match(workflow, /GH_PACKAGES_PUBLISH_ENABLED/);
  assert.match(workflow, /npm pkg set private=false/);
  assert.match(workflow, /npm publish --provenance --access restricted/);
  assert.doesNotMatch(workflow, new RegExp("NPM" + "_TOKEN|registry\\.npmjs\\.org"));
});

test("release workflow fails closed when tag and package version differ", () => {
  const workflow = read(".github/workflows/release.yml");
  const contributing = read("CONTRIBUTING.md");

  assert.match(workflow, /Verify tag matches package version/);
  assert.match(workflow, /PACKAGE_VERSION="\$\(node -p "require\('\.\/package\.json'\)\.version"\)"/);
  assert.match(workflow, /TAG_VERSION="\$\{GITHUB_REF_NAME#v\}"/);
  assert.match(workflow, /Release tag v\$\{TAG_VERSION\} does not match package\.json version \$\{PACKAGE_VERSION\}/);
  assert.match(contributing, /tag and package version differ/);
  assert.match(contributing, /1\.0\.0-rc\.1/);
});

test("public-facing docs do not contain private local machine paths", () => {
  for (const relativePath of [
    "README.md",
    "commands/review.md",
    "commands/adversarial-review.md",
    "commands/elite-review.md",
    "commands/deep-review.md",
    "commands/security-review.md",
    "commands/setup.md",
    "commands/status.md",
    "commands/result.md",
    "commands/cancel.md"
  ]) {
    assert.doesNotMatch(read(relativePath), /\/Users\/kenmege/, relativePath);
  }
});

test("internal prompt artifacts are not tracked for public release", () => {
  const trackedPromptFiles = execFileSync("git", ["ls-files", "docs/*_PROMPT.md"], {
    cwd: root,
    encoding: "utf8"
  }).trim();
  assert.equal(trackedPromptFiles, "");
  assert.match(read(".gitignore"), /^docs\/\*_PROMPT\.md$/m);
});

test("release hygiene grep scope preserves reviewer WebFetch allowlist domains", () => {
  const contributing = read("CONTRIBUTING.md");
  const claude = read("scripts/lib/claude.mjs");
  assert.match(claude, /https:\/\/registry\.npmjs\.org\/\*/);
  assert.match(contributing, /scripts\/lib\/claude\.mjs/);
  assert.match(contributing, /WebFetch allowlist/);
});

test("Copilot code review instructions are present for GitHub review agents", () => {
  const source = read(".github/copilot-instructions.md");
  assert.match(source, /Copilot Code Review Instructions/);
  assert.match(source, /security-sensitive CLI plugin/);
  assert.match(source, /JSON schemas and `validateStructuredReviewOutput` stay in sync/);
});

test("security docs describe inherit-mcp Task subagent trust expansion", () => {
  const architecture = read("docs/architecture.md");
  const security = read("SECURITY.md");
  for (const source of [architecture, security]) {
    assert.match(source, /--inherit-mcp/);
    assert.match(source, /Task subagents?/i);
    assert.match(source, /second-order trust expansion|expands trust indirectly/i);
    assert.match(source, /docs\.anthropic\.com\/en\/docs\/claude-code\/sub-agents/);
  }
});

test("public docs document the add-dir boundary override", () => {
  const readme = read("README.md");
  const security = read("SECURITY.md");
  for (const source of [readme, security]) {
    assert.match(source, /CODEX_CLAUDE_ADD_DIR_BOUNDARY/);
    assert.match(source, /--add-dir/);
    assert.match(source, /workspace root/);
  }
});

test("release checklist documents GitHub Packages publish switch and v-tag trigger", () => {
  const source = read("CONTRIBUTING.md");
  assert.match(source, /GH_PACKAGES_PUBLISH_ENABLED=true/);
  assert.match(source, /GITHUB_TOKEN/);
  assert.doesNotMatch(source, new RegExp("NPM" + "_TOKEN"));
  assert.match(source, /v1\.0\.0/);
  assert.match(source, /matching the package version exactly/);
});

test("architecture docs reference the exported structured parser name", () => {
  const source = read("docs/architecture.md");
  assert.match(source, /parseClaudeStructuredOutput/);
  assert.doesNotMatch(source, new RegExp("parseClaudeStructured" + "Review"));
});
