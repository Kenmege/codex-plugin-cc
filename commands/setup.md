---
description: Verify that the local Claude review runtime is installed and authenticated.
---

# /claude-review:setup

## Preflight

1. Prefer the helper binary `codex-claude-review` if it is available on PATH.
2. If it is not available, fall back to:
   `node /Users/kenmege/codex-plugin-cc/scripts/claude-review-companion.mjs`

## Plan

Run the helper once in setup mode and report readiness.

## Commands

- Preferred:
  `codex-claude-review setup`
- Fallback:
  `node /Users/kenmege/codex-plugin-cc/scripts/claude-review-companion.mjs setup`

## Verification

Do not invent readiness. Use the helper output only.

## Summary

Return the helper stdout verbatim.

## Next Steps

If setup is not ready, follow the concrete next steps listed by the helper.
