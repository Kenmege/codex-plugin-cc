# codex-plugin-cc v1.0.4 — public launch hardening

This release updates the public package to the launch-ready state currently on
`main`. It is the version to announce and install.

## Highlights

- Fixed `codex-claude-review folder <path>` and `--scope directory` so non-Git
  and folder reviews inspect the copied snapshot contents instead of producing
  a no-op branch diff.
- Raised directory review fidelity with a separate 1 MB per-file review ceiling
  and visible reporting for oversized or binary skipped files.
- Hardened directory snapshots by excluding common secret-bearing files,
  honoring source `.gitignore`, cleaning foreground temp snapshots, and reaping
  stale snapshot directories.
- Removed short default review ceilings. Structured agentic reviews can now use
  the full review timeout by default, while no-output timers act as long stall
  detectors rather than cutting off real Opus work.
- Updated the long-context profile to current Claude Code behavior:
  `--long-context` now selects explicit `claude-opus-4-7[1m]`.
- Hardened public repository governance: `main` requires CODEOWNER review,
  passing CI/security checks, resolved conversations, linear history, stale
  approval dismissal, and approval of the latest reviewable push.

## Verification

- Local `npm run check` passed with 186 tests.
- Local `npm run pack:check` passed.
- Local `npm audit --audit-level=moderate` reported 0 vulnerabilities.
- GitHub checks on the release base passed: Pull Request CI, CodeQL, and OpenSSF
  Scorecard.
- `codex-claude-review setup --json` and `doctor --json` passed locally.

## Notes

- GitHub Packages installs still require npm authentication for
  `npm.pkg.github.com`.
- Claude Code must be installed and authenticated locally for live review runs.
- Review lanes are read-only by default; `--unrestricted` remains an explicit
  trust-boundary escape hatch and should not be used on untrusted diffs.
