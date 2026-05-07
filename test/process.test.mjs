import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { runCommandCapture, spawnDetached } from "../scripts/lib/process.mjs";

test("runCommandCapture escalates timeout to SIGKILL when SIGTERM is ignored", { skip: process.platform === "win32" }, async () => {
  const result = await runCommandCapture(
    "sh",
    ["-c", "trap '' TERM; while :; do sleep 1; done"],
    { timeout: 50, terminationGraceMs: 50 }
  );

  assert.equal(result.error?.code, "ETIMEDOUT_KILL");
});

test("spawnDetached redirects early stdout and stderr to a log file", async () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "claude-review-process-"));
  const logFile = path.join(cwd, "child.log");

  const pid = spawnDetached(
    process.execPath,
    ["-e", "console.log('early stdout'); console.error('early stderr')"],
    { cwd, logFile }
  );

  assert.equal(typeof pid, "number");
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (fs.existsSync(logFile)) {
      const source = fs.readFileSync(logFile, "utf8");
      if (source.includes("early stdout") && source.includes("early stderr")) {
        assert.match(source, /early stdout/);
        assert.match(source, /early stderr/);
        return;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 20));
  }

  assert.fail(`detached child output was not written to ${logFile}`);
});
