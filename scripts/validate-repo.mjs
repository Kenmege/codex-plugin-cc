#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(new URL("..", import.meta.url).pathname);

const required = [
  ".codex-plugin/plugin.json",
  "commands/review.md",
  "commands/adversarial-review.md",
  "commands/setup.md",
  "commands/status.md",
  "commands/result.md",
  "commands/cancel.md",
  "scripts/claude-review-companion.mjs",
  "schemas/review-output.schema.json"
];

for (const relative of required) {
  const fullPath = path.join(root, relative);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing required file: ${relative}`);
  }
}

JSON.parse(fs.readFileSync(path.join(root, ".codex-plugin/plugin.json"), "utf8"));
JSON.parse(fs.readFileSync(path.join(root, "schemas/review-output.schema.json"), "utf8"));

for (const file of [
  "scripts/claude-review-companion.mjs",
  ...fs.readdirSync(path.join(root, "scripts", "lib")).map((name) => path.join("scripts", "lib", name))
]) {
  const result = spawnSync("node", ["--check", path.join(root, file)], { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`Syntax check failed for ${file}\n${result.stderr || result.stdout}`);
  }
}

console.log("Repository validation passed.");
