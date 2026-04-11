# Claude Review Plugin Design

## Goal

Build a Codex-native plugin that lets Codex sessions delegate review work to the
local Claude CLI with a quality-first default profile and durable background-job
management.

## Constraints

- The runtime must use the locally authenticated `claude` CLI rather than a new
  Anthropic API wrapper.
- Reviews must stay read-only.
- The plugin must work from arbitrary git workspaces, not only inside its own
  repository.
- Background jobs must survive across Codex turns and expose `status`,
  `result`, and `cancel`.
- The implementation must not falsely claim official 1M support for Opus 4.6.

## Chosen Architecture

1. Codex plugin commands stay thin.
2. A local helper CLI performs all real work.
3. Review input is snapshotted from git state at launch time.
4. Job metadata, logs, and snapshots are stored per workspace under
   `.claude-review/jobs/`.
5. Claude output is constrained to a strict JSON schema and then rendered back
   into readable markdown.

## Review Profiles

### `quality`

- model: `claude-opus-4-6`
- effort: `high`
- intended for normal and adversarial reviews when the review snapshot is small
  enough to fit comfortably

### `long-context`

- model: `claude-sonnet-4-6`
- effort: `high`
- beta header: `context-1m-2025-08-07`
- used when explicitly requested or when the review snapshot exceeds the normal
  Opus-safe inline threshold

## Commands

- `setup`
- `review`
- `adversarial-review`
- `status`
- `result`
- `cancel`

## Data Flow

1. Resolve the git workspace root.
2. Determine the review target from working tree or `--base`.
3. Snapshot the diff context.
4. Choose the review profile.
5. Persist snapshot and job state.
6. Invoke `claude -p` with tools disabled and JSON-schema-constrained output.
7. Parse and render findings.
8. Persist logs and final result.

## Verification Plan

- unit-test command docs for the expected helper invocation contract
- unit-test flag parsing
- unit-test workspace/job state handling
- integration-test git review snapshot generation in a temporary repository
- run repo validation plus test suite before commit

## Risks

- Codex command argument interpolation is not fully documented, so command docs
  must be resilient and rely on the helper binary first.
- Claude CLI latency can be high even for small prompts, so background mode must
  be first-class.
- Extremely large diffs still need summarization even when long-context mode is
  available.
