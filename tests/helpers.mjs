import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { spawnSync } from "node:child_process";

import { terminateProcessTree } from "../plugins/codex/scripts/lib/process.mjs";
import {
  clearBrokerSession,
  loadBrokerSession,
  sendBrokerShutdown,
  teardownBrokerSession
} from "../plugins/codex/scripts/lib/broker-lifecycle.mjs";

const tempDirs = new Set();

export function makeTempDir(prefix = "codex-plugin-test-") {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  tempDirs.add(dir);
  return dir;
}

export async function cleanupBrokerSessions() {
  for (const dir of tempDirs) {
    try {
      const brokerSession = loadBrokerSession(dir);
      if (!brokerSession) {
        continue;
      }
      if (brokerSession.endpoint) {
        await sendBrokerShutdown(brokerSession.endpoint);
      }
      teardownBrokerSession({
        endpoint: brokerSession.endpoint ?? null,
        pidFile: brokerSession.pidFile ?? null,
        logFile: brokerSession.logFile ?? null,
        sessionDir: brokerSession.sessionDir ?? null,
        pid: brokerSession.pid ?? null,
        killProcess: terminateProcessTree
      });
      clearBrokerSession(dir);
    } catch {
      // A failed cleanup must not abort the remaining directories or the test run.
    }
  }
  tempDirs.clear();
}

export function writeExecutable(filePath, source) {
  fs.writeFileSync(filePath, source, { encoding: "utf8", mode: 0o755 });
}

export function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: options.cwd,
    env: options.env,
    encoding: "utf8",
    input: options.input,
    shell: options.shell ?? (process.platform === "win32" && !path.isAbsolute(command)),
    windowsHide: true
  });
}

export function initGitRepo(cwd) {
  run("git", ["init", "-b", "main"], { cwd });
  run("git", ["config", "user.name", "Codex Plugin Tests"], { cwd });
  run("git", ["config", "user.email", "tests@example.com"], { cwd });
  run("git", ["config", "commit.gpgsign", "false"], { cwd });
  run("git", ["config", "tag.gpgsign", "false"], { cwd });
}
