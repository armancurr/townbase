Use Bun.
Do not run the dev server.
After each run, update topic-based files in `docs/memory/` — don't create a new file per run.

- `architecture.md` — structural decisions + why
- `gotchas.md` — bugs, quirks, silent failures
- `conventions.md` — naming/style patterns
- `todo-followups.md` — noticed but unaddressed

Check for an existing entry first; update/append instead of duplicating.

Entry format:

## [YYYY-MM-DD] Short title
- Learned: 1-2 lines
- Files: paths touched
- Status: resolved / open

One idea per entry. If a file exceeds ~300 lines, move old/resolved entries to a matching `archive.md`.

<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->
