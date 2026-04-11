import path from "node:path";

import { runCommand } from "./process.mjs";

export function resolveWorkspaceRoot(cwd) {
  const result = runCommand("git", ["rev-parse", "--show-toplevel"], { cwd });
  if (result.status === 0) {
    return String(result.stdout).trim();
  }
  return path.resolve(cwd);
}
