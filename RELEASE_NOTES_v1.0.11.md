# codex-plugin-cc v1.0.11 - launch-gate hardening

This release tightens the public security posture before the X.com launch
announcement.

## Install

```bash
npm install -g codex-plugin-cc
codex-claude-review enable
codex-claude-review doctor
```

## Changes

- Reduced the release workflow's default token permissions to read-only and
  grants write/provenance permissions only to the release job.
- Focused CodeQL on the shipped npm package and GitHub Actions trust boundary,
  excluding upstream reference code and test fixtures from public alerts.
- Removed CodeQL file-race findings in MCP config and review-file reads by
  reading from the same opened file descriptor used for metadata checks.
- Hardened child-process execution helpers by resolving simple executable names
  from the current process path before spawning with caller-supplied env vars.

## Verification

- `npm run check`
- `npm run pack:check`
- `npm audit --audit-level=moderate`
