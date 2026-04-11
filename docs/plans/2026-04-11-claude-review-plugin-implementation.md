# Claude Review Plugin Implementation Plan

1. Replace the repo metadata so the root is a Codex plugin, not a Claude Code
   plugin.
2. Add a plugin manifest under `.codex-plugin/plugin.json`.
3. Add command docs under `commands/` that route to the helper runtime.
4. Add a helper CLI with subcommands for setup, review, adversarial review,
   status, result, and cancel.
5. Add git snapshot collection and per-workspace state storage.
6. Add Claude runtime selection and structured review parsing.
7. Add repository validation and tests.
8. Run `npm run check`.
9. Commit with a Lore-format message and push to the private GitHub remote.
