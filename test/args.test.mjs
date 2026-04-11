import test from "node:test";
import assert from "node:assert/strict";

import { parseArgs, splitRawArgumentString } from "../scripts/lib/args.mjs";

test("parseArgs handles booleans, values, and positionals", () => {
  const parsed = parseArgs(["--background", "--base", "main", "focus", "text"], {
    booleanOptions: ["background"],
    valueOptions: ["base"]
  });
  assert.equal(parsed.options.background, true);
  assert.equal(parsed.options.base, "main");
  assert.deepEqual(parsed.positionals, ["focus", "text"]);
});

test("splitRawArgumentString keeps quoted groups together", () => {
  assert.deepEqual(splitRawArgumentString('--base main "look for race conditions"'), [
    "--base",
    "main",
    "look for race conditions"
  ]);
});
