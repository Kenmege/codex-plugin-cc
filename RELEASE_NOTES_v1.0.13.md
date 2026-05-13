# codex-plugin-cc v1.0.13 - launch attribution cleanup

This release removes the final public-readiness drift found by the adversarial
X.com launch review.

## Install

```bash
npm install -g codex-plugin-cc
codex-claude-review enable
codex-claude-review doctor
```

## Changes

- Corrected README upstream attribution to reference OpenAI's Apache-2.0 Codex
  plugin reference preserved under `plugins/codex/`, instead of implying an
  upstream `openai/codex-plugin-cc` repository.
- Replaced launch-adjacent fixed version placeholders with commands or generic
  instructions so future releases do not carry stale example versions.
- Added a release-docs regression check preventing the incorrect upstream repo
  reference from returning.

## Verification

- `npm run check`
- `npm run pack:check`
- `npm audit --audit-level=moderate`
