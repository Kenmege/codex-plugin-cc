import fs from "node:fs";
import path from "node:path";

import { resolveWorkspaceRoot } from "./workspace.mjs";

const STATE_DIR_NAME = ".claude-review";
const JOBS_DIR_NAME = "jobs";

function nowIso() {
  return new Date().toISOString();
}

export function generateJobId(kind = "review") {
  return `${kind}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function resolveStateDir(cwd) {
  return path.join(resolveWorkspaceRoot(cwd), STATE_DIR_NAME);
}

export function resolveJobsDir(cwd) {
  return path.join(resolveStateDir(cwd), JOBS_DIR_NAME);
}

export function ensureStateDir(cwd) {
  fs.mkdirSync(resolveJobsDir(cwd), { recursive: true });
}

export function resolveJobFile(cwd, jobId) {
  ensureStateDir(cwd);
  return path.join(resolveJobsDir(cwd), `${jobId}.job.json`);
}

export function resolveJobInputFile(cwd, jobId) {
  ensureStateDir(cwd);
  return path.join(resolveJobsDir(cwd), `${jobId}.input.json`);
}

export function resolveJobLogFile(cwd, jobId) {
  ensureStateDir(cwd);
  return path.join(resolveJobsDir(cwd), `${jobId}.log`);
}

export function readJob(cwd, jobId) {
  const file = resolveJobFile(cwd, jobId);
  if (!fs.existsSync(file)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeJob(cwd, jobId, payload) {
  ensureStateDir(cwd);
  fs.writeFileSync(resolveJobFile(cwd, jobId), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

export function updateJob(cwd, jobId, patch) {
  const current = readJob(cwd, jobId);
  if (!current) {
    throw new Error(`Unknown job ${jobId}`);
  }
  const next = {
    ...current,
    ...patch,
    updatedAt: nowIso()
  };
  writeJob(cwd, jobId, next);
  return next;
}

export function writeJobInput(cwd, jobId, payload) {
  fs.writeFileSync(resolveJobInputFile(cwd, jobId), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

export function readJobInput(cwd, jobId) {
  return JSON.parse(fs.readFileSync(resolveJobInputFile(cwd, jobId), "utf8"));
}

export function appendLogLine(cwd, jobId, line) {
  fs.appendFileSync(resolveJobLogFile(cwd, jobId), `[${nowIso()}] ${line}\n`, "utf8");
}

export function readLogTail(cwd, jobId, maxLines = 6) {
  const file = resolveJobLogFile(cwd, jobId);
  if (!fs.existsSync(file)) {
    return [];
  }
  return fs
    .readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter(Boolean)
    .slice(-maxLines);
}

export function listJobs(cwd) {
  ensureStateDir(cwd);
  const jobs = [];
  for (const entry of fs.readdirSync(resolveJobsDir(cwd))) {
    if (!entry.endsWith(".job.json")) {
      continue;
    }
    jobs.push(JSON.parse(fs.readFileSync(path.join(resolveJobsDir(cwd), entry), "utf8")));
  }
  return jobs.sort((left, right) => String(right.updatedAt ?? right.createdAt).localeCompare(String(left.updatedAt ?? left.createdAt)));
}

export function buildJobRecord(cwd, jobId, patch) {
  const timestamp = nowIso();
  return {
    id: jobId,
    cwd: path.resolve(cwd),
    workspaceRoot: resolveWorkspaceRoot(cwd),
    createdAt: timestamp,
    updatedAt: timestamp,
    status: "queued",
    ...patch
  };
}
