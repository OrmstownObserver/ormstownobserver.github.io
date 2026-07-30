# AGENTS.md

**This file is intentionally a pointer, not a copy.**

All conventions, file guidance and operational notes for this repository live in
[`CLAUDE.md`](./CLAUDE.md) — that is the single source of truth for this repo. Read it first.

Only one thing differs for Codex: read credentials from the Notion **Codex Credentials**
page (where `CLAUDE.md` says *Claude Credentials*). Everything else — working conventions,
file guidance, local preview, Notion/System Registry rules, session logging — applies as
written in `CLAUDE.md`.

## Why this is a stub

This file used to hold a full duplicate of `CLAUDE.md`. It was never updated and silently
went stale: months after the v1 "Ask the Observer" system was retired and deleted, this
file still described it — along with `ask-sources.json` and the `ask_documents` table — as
live infrastructure. Any agent trusting it would have built on a system that no longer
exists.

Please don't re-expand it into a second copy. Update `CLAUDE.md` instead.
