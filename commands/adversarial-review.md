---
description: Run a harder Claude challenge review against the current git workspace.
---

# /claude-review:adversarial-review

## Preflight

1. Prefer the helper binary `codex-claude-review` if it is available on PATH.
2. If it is not available, fall back to:
   `node /Users/kenmege/codex-plugin-cc/scripts/claude-review-companion.mjs`
3. If neither is available, tell the user to install the helper with:
   `npm install -g /Users/kenmege/codex-plugin-cc`

## Plan

Run one adversarial review pass through the helper and return the helper output
without paraphrasing it.

## Commands

Use the exact argument tail the user supplied after
`/claude-review:adversarial-review`.

- Preferred:
  `codex-claude-review adversarial-review <user-arguments>`
- Fallback:
  `node /Users/kenmege/codex-plugin-cc/scripts/claude-review-companion.mjs adversarial-review <user-arguments>`

Keep this command read-only.

## Verification

If the helper exits non-zero, report that failure exactly and stop.

## Summary

Return the helper stdout verbatim.

## Next Steps

If the user wants a persistent record, suggest `--background` plus
`/claude-review:status`.
