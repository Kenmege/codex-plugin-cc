---
description: Show running and recent Claude review jobs for the current workspace.
---

# /claude-review:status

## Preflight

1. Prefer the helper binary `codex-claude-review` if it is available on PATH.
2. If it is not available, fall back to:
   `node /Users/kenmege/codex-plugin-cc/scripts/claude-review-companion.mjs`

## Plan

Run the helper in status mode and return the result.

## Commands

Use the exact argument tail the user supplied after `/claude-review:status`.

- Preferred:
  `codex-claude-review status <user-arguments>`
- Fallback:
  `node /Users/kenmege/codex-plugin-cc/scripts/claude-review-companion.mjs status <user-arguments>`

## Verification

Treat the helper output as the source of truth for job state.

## Summary

Return the helper stdout verbatim.

## Next Steps

If a job is finished, suggest `/claude-review:result`.
