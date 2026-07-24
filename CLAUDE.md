# CLAUDE.md

## Project overview
This repository contains the static bilingual website for The Ormstown Observer. The site is built as a collection of standalone HTML pages with shared styling and a small JavaScript helper for the language toggle.

## Working conventions
- Preserve the existing bilingual structure under the `en/` and `fr/` directories.
- Keep pages as simple, semantic HTML. Prefer small, targeted edits over large rewrites.
- Maintain relative links and asset paths so pages continue to work when previewed locally or published to GitHub Pages.
- Reuse the existing visual language and typography rather than introducing a new design system.
- Keep new content clear, concise, and appropriate for a civic journalism publication.

## File guidance
- `index.html` is the homepage. Its four story zones (hero / side rail / photo cards / Latest list) are rendered at runtime by `front-page.js` from `front-page.json`; the static markup inside them is only a fallback shown when the JSON fails to load. To change what's on the front page, change the Notion Articles DB (Front Page Slot 1–7 + Headline/Deck/Image fields), not the HTML.
- **`front-page.json` is generated — never hand-edit it.** The n8n workflow "🗞️ Observer — Front Page Builder" (NEST instance) rebuilds and commits it from Notion via the webhook `https://seneca.strai.ca/webhook/front-page-build` and on a 30-minute schedule. It also downloads any Notion-hosted story image and commits it as `images/<story-slug>.jpg`.
- `front-page.js` is the renderer: textContent-only DOM building, per-zone fallback, whitelisted SVG icons, `image.src` must match `/images/...`. Update carefully and test with a corrupted/missing JSON (static fallback must survive).
- `/en/index.html` and `/fr/index.html` are redirect stubs to the bilingual root homepage — do not rebuild them as standalone homepages.
- `observer-header.js` contains shared header behavior and should be updated carefully.
- **`ask-sources.json` is generated — never hand-edit it.** The n8n workflow "📚 Observer — Ask Index Builder" (NEST instance) syncs the Drive `PUBLIC DOCUMENTS` folder into a Gemini File Search store, maintains the document manifest in n8n Data Tables (`ask_documents`, `ask_config`), and commits `ask-sources.json` — rebuild via `https://seneca.strai.ca/webhook/observer-ask-index-build` or the daily 05:00 schedule.
- **OrmstownGPT is DEACTIVATED (2026-07-23)** pending refinement. Pages moved to `_inactive/en/ask/` and `_inactive/fr/posez-une-question/` (Jekyll excludes `_`-prefixed dirs, so they are not served). Drawer nav entry, homepage tab-bar entry and homepage banner removed; the `.ogpt-banner` CSS is left in `index.html` for easy restore. `ask.js` and `ask-sources.json` remain at root, inert. To restore: `git mv` the two dirs back and re-add the three nav/banner blocks.
- The "Ask the Observer" pages (`en/ask/`, `fr/posez-une-question/`) and `ask.js` POST questions to `https://seneca.strai.ca/webhook/observer-ask` (n8n workflow "💬 Observer — Ask the Observer": validation, rate limiting via `ask_rate_limits`, Gemini File Search answer, citations from the manifest, logging to `ask_log`). `ask.js` follows the `front-page.js` discipline — textContent-only rendering and whitelisted citation URLs; keep it that way.
- `images/` holds site assets and should be referenced with stable paths. Front-page images are named `<story-slug>.jpg` (GitHub Path minus `en/`, slashes → hyphens).
- New stories should follow the existing folder pattern for English and French pages, get an Articles row in Notion (Status ✅ Published + GitHub Path + Path FR + Headline EN/FR), and use the `figure.article-figure` pattern from `en/toit-vert-development/index.html` for in-article images (skeleton in `templates/page-template.html`).

## Local preview
Use a simple local server from the repository root:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000/.

## Notes
- Do not commit or push changes unless explicitly requested.
- Keep edits focused on the current task and avoid unrelated refactors.

## Source of truth (all AI tools + Claude Code)
- Notion is the source of truth for decisions, statuses, and IDs — not chat history.
- Canonical IDs (databases, repos, credentials, Drive folders) live in ONE place: the **🧭 System Registry — Live DBs, Repos & Files** page in Notion (Seneca OS). Never hardcode a DB ID here; link to the registry.
- Session logging: write a handoff to the **🗒️ Session Archive** DB at session close (venture = Observer); check the **Daily Log** unreviewed view at session start. (The legacy "Session Handoffs DB" was retired 2026-06-25 — do not use it.)
- Before any push/API/publish task, read credentials silently from the Notion Claude Credentials page. Never print token values.
