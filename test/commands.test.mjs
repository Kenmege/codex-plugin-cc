import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

test("review command prefers the helper binary and repo-local fallback", () => {
  const source = read("commands/review.md");
  assert.match(source, /codex-claude-review review/);
  assert.match(source, /node \/Users\/kenmege\/codex-plugin-cc\/scripts\/claude-review-companion\.mjs review/);
  assert.match(source, /Return the helper stdout verbatim/i);
});

test("adversarial command stays read-only", () => {
  const source = read("commands/adversarial-review.md");
  assert.match(source, /Keep this command read-only/i);
  assert.match(source, /codex-claude-review adversarial-review/);
});

test("plugin manifest has the expected plugin name", () => {
  const manifest = JSON.parse(read(".codex-plugin/plugin.json"));
  assert.equal(manifest.name, "claude-review");
  assert.equal(manifest.interface.displayName, "Claude Review");
});
