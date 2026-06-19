---
name: claude-review
description: Use when the user asks Codex to get Claude to review code, run adversarial or ship/no-ship review, audit security risks, or inspect a large diff/folder with Claude Opus/Opus 1M.
---

# Claude Review

Use the local helper rather than trying to perform the review yourself. The helper snapshots the target, starts Claude Code in read-only agentic mode, validates structured output, and renders the result.

## Default command

```bash
codex-claude-review review "$ARGUMENTS"
```

## Route by intent

- Everyday diff review: `codex-claude-review review "$ARGUMENTS"`
- Release gate / ship-no-ship: `codex-claude-review review --preset ship "$ARGUMENTS"`
- Security review: `codex-claude-review review --preset security "$ARGUMENTS"`
- Research or evidence-heavy folder: `codex-claude-review folder <path> --preset research --long-context "$ARGUMENTS"`
- Deep multi-agent review: `codex-claude-review review --preset deep --background "$ARGUMENTS"`

## Operating rules

- Keep the workflow read-only unless the user explicitly asks for implementation outside this skill.
- Return the helper output verbatim.
- If the helper exits non-zero, report the exact failure and stop.
- For first-run problems, ask the user to run `codex-claude-review enable` and `codex-claude-review doctor`.
