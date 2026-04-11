import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

import { buildJobRecord, generateJobId, listJobs, updateJob, writeJob } from "../scripts/lib/state.mjs";

test("state helpers write and update jobs", () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), "claude-review-state-"));
  const jobId = generateJobId("review");
  writeJob(cwd, jobId, buildJobRecord(cwd, jobId, { kind: "review", title: "test job" }));
  updateJob(cwd, jobId, { status: "completed" });
  const jobs = listJobs(cwd);
  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].status, "completed");
});
