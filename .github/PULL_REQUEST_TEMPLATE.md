<!-- Thanks for the contribution. Fill in each section; CI and reviewers will reference these. -->

## Summary

<!-- One paragraph: what changed and why. Link the issue this closes (if any) with `Closes #N`. -->

## Type of change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds capability)
- [ ] Breaking change (fix or feature that would change existing behavior in a way callers must notice)
- [ ] Documentation update only
- [ ] Workflow / CI / lint change only
- [ ] Refactor (no behavior change)

## Affected review lane(s)

<!-- Tick all that apply, or "n/a" for tooling-only changes. -->

- [ ] `review`
- [ ] `adversarial-review`
- [ ] `elite-review`
- [ ] `deep-review`
- [ ] `security-review`
- [ ] `setup` / `status` / `result` / `cancel`
- [ ] schemas (`review-output`, `elite-review-output`, `agentic-review-output`)
- [ ] workflow (`pull-request-ci.yml`, `release.yml`, `claude.yml`)
- [ ] documentation (`README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md`, `docs/architecture.md`)
- [ ] n/a

## Test plan

<!-- Concrete commands you ran. CI runs `npm run check`, but reviewers want to see local proof too. -->

```
npm run lint
npm test
npm run pack:check
```

## Pre-merge checklist

- [ ] Tests added or updated for behavior changes (no `.skip`, no weakened assertions).
- [ ] `CHANGELOG.md` entry added under `[Unreleased]` (or under the current version section if cutting a release).
- [ ] No edits to `plugins/codex/` (preserved upstream-port subtree).
- [ ] No tokens, API keys, or credentials added to any committed file (the hygiene grep in `CONTRIBUTING.md` should be clean).
- [ ] Schema changes have matching regression tests in `test/`.
- [ ] No version bumps unless this PR is itself a release-cut.
- [ ] No force-pushes to shared branches; no `--no-verify`; no hook bypass.

## Notes for reviewers

<!--
  This repo runs four reviewers automatically on every PR. Heads-up:
  - GitHub Copilot will leave breadth-and-style comments on PR open.
  - Claude (this very plugin) auto-reviews on PR open and replies to `@claude` mentions.
  - Codex (ChatGPT Codex Connector) auto-reviews per its connector settings.
  - Devin reviews per app.devin.ai → Settings → Review configuration.

  Disagreements between reviewers are productive. The maintainer makes the final merge call.

  Anything else reviewers should know? Performance considerations, security implications, deprecations, related issues?
-->
