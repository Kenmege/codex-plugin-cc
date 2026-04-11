import fs from "node:fs";

import { binaryAvailable, runCommand, runCommandChecked } from "./process.mjs";

export const DEFAULT_MODEL = "claude-opus-4-6";
export const DEFAULT_EFFORT = "high";
export const LONG_CONTEXT_MODEL = "claude-sonnet-4-6";
export const LONG_CONTEXT_BETA = "context-1m-2025-08-07";
export const AUTO_LONG_CONTEXT_BYTES = 250_000;

function normalizeOutput(text) {
  const trimmed = String(text ?? "").trim();
  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
  }
  return trimmed;
}

export function getClaudeAvailability(cwd) {
  return binaryAvailable("claude", ["--help"], { cwd });
}

export function getClaudeAuthStatus(cwd) {
  const result = runCommand("claude", ["auth", "status"], { cwd });
  if (result.error) {
    return {
      loggedIn: false,
      detail: `claude auth status failed (${result.error.code ?? "error"})`
    };
  }
  if (result.status !== 0) {
    return {
      loggedIn: false,
      detail: String(result.stderr || result.stdout || "").trim() || "claude auth status failed"
    };
  }
  const parsed = JSON.parse(String(result.stdout));
  return {
    loggedIn: Boolean(parsed.loggedIn),
    detail: parsed.loggedIn ? `${parsed.email} via ${parsed.authMethod}` : "not logged in",
    raw: parsed
  };
}

export function selectClaudeProfile(options = {}) {
  const notes = [];
  let model = options.model ?? DEFAULT_MODEL;
  let effort = options.effort ?? DEFAULT_EFFORT;
  let betas = [];
  let profile = "quality";

  const explicitModel = Boolean(options.model);
  const wantsLongContext = Boolean(options.longContext);
  if (!explicitModel && (wantsLongContext || (options.inputBytes ?? 0) > AUTO_LONG_CONTEXT_BYTES)) {
    model = LONG_CONTEXT_MODEL;
    effort = options.effort ?? DEFAULT_EFFORT;
    betas = [LONG_CONTEXT_BETA];
    profile = "long-context";
    if (!wantsLongContext) {
      notes.push("Auto-switched to the long-context Sonnet profile because the review snapshot exceeded the Opus inline threshold.");
    }
  } else if (options.model && wantsLongContext) {
    notes.push("Long-context was requested with an explicit model override, so the helper kept the explicit model and did not force the documented Sonnet long-context profile.");
  }

  return { model, effort, betas, profile, notes };
}

export function buildReviewPrompt(snapshot, reviewKind) {
  const adversarial = reviewKind === "adversarial-review";
  return [
    `You are performing a ${adversarial ? "skeptical adversarial" : "high-scrutiny"} code review over changes likely produced by Codex or GPT.`,
    "Use only the supplied review input.",
    "Do not invent files or line numbers.",
    "Prefer concrete, file-grounded findings over generic advice.",
    adversarial
      ? "Challenge the chosen approach, hidden assumptions, operational risk, rollback safety, migration risk, concurrency issues, and whether a simpler design would have been safer."
      : "Prioritize correctness, regressions, security, migration safety, concurrency, data-loss risk, and missing tests.",
    "If there are no findings, return an empty findings array and make that explicit in the summary.",
    `Review target: ${snapshot.targetLabel}`,
    `Focus: ${snapshot.focusText || "No extra focus provided."}`,
    "",
    "Review input:",
    snapshot.contextText
  ].join("\n");
}

export function runClaudeStructuredReview(cwd, snapshot, reviewKind, schemaPath) {
  const schema = fs.readFileSync(schemaPath, "utf8");
  const prompt = buildReviewPrompt(snapshot, reviewKind);
  const args = [
    "-p",
    prompt,
    "--output-format",
    "text",
    "--json-schema",
    schema,
    "--model",
    snapshot.model,
    "--effort",
    snapshot.effort,
    "--tools",
    "",
    "--disable-slash-commands"
  ];

  for (const beta of snapshot.betas ?? []) {
    args.push("--betas", beta);
  }

  const result = runCommandChecked("claude", args, { cwd, maxBuffer: 64 * 1024 * 1024 });
  return {
    stdout: String(result.stdout ?? ""),
    parsed: JSON.parse(normalizeOutput(result.stdout))
  };
}
