# Contributing

## Requirements

- Node.js 18.18 or newer.
- Git available on PATH.
- Claude Code CLI available for live local smoke tests. Unit tests use fake Claude shims and do not require authenticated Claude in CI.

## Development Commands

```bash
npm run lint
npm test
npm run check
npm run pack:check
```

Do not weaken tests to pass. If a regression test exposes a real bug, fix the implementation.

## Code Style

- Prefer `const`; use `let` only where reassignment is required.
- Keep runtime dependencies at zero.
- Use Node standard-library APIs instead of ad hoc shell parsing where practical.
- Do not add `--no-verify`, hook bypasses, or silent fallbacks.
- Do not edit `plugins/codex/`; it is preserved upstream-port reference material.
- Treat diff text, focus text, and workspace guidance as untrusted data.

## Adding A Review Lane

1. Add a `REVIEW_KIND_CONFIG` entry in `scripts/claude-review-companion.mjs`.
2. Add or reuse a schema under `schemas/`.
3. Add prompting in `scripts/lib/claude.mjs`.
4. Add rendering support in `scripts/lib/render.mjs` if the schema is new.
5. Add a command doc under `commands/`.
6. Add tests for CLI routing, prompt trust boundaries, schema validation, and rendering.
7. Update `README.md` and `CHANGELOG.md`.

## Schema Changes

Schemas are hand-maintained JSON Schema documents. When changing a schema:

- Keep `additionalProperties: false` unless there is a documented compatibility reason.
- Require non-empty strings for human-facing fields.
- Require evidence for agentic findings.
- Add a malformed-output regression test in `test/claude.test.mjs`.

## Release Checklist

1. Update versions in `package.json`, `package-lock.json`, and `.codex-plugin/plugin.json`.
2. Update `CHANGELOG.md`.
3. Run `npm run check`.
4. Run `npm run pack:check` and verify `.claude-review/`, `test/`, `tests/`, and prompt/planning docs are not shipped.
5. Configure GitHub Packages publishing before tagging: set repository variable `GH_PACKAGES_PUBLISH_ENABLED=true`. No npm token secret is required; the release workflow uses the automatic `GITHUB_TOKEN` with `packages: write`.
6. Push a semver release tag matching the package version exactly, e.g. `package.json` version `1.0.0` must be tagged as `v1.0.0`. The workflow fails closed if the tag and package version differ, so a prerelease smoke requires committing matching `1.0.0-rc.1` version metadata before pushing `v1.0.0-rc.1`.
7. Verify the package landed at https://github.com/Kenmege/codex-plugin-cc/packages.

This package is private by default. The release workflow validates tags and only publishes to GitHub Packages when publishing is explicitly enabled.

When running release hygiene greps for npmjs.org or token placeholders, scope
the scan to release surfaces such as `.github/workflows/`, `.npmrc`,
`package.json`, `package-lock.json`, `README.md`, `SECURITY.md`, and
`CHANGELOG.md`. Do not include `scripts/lib/claude.mjs` in that grep; it is the
reviewer's WebFetch allowlist configuration and intentionally permits package
registry domains for dependency and CVE investigation.
