# CLAUDE.md

## Project overview
This repository contains the static bilingual website for The Ormstown Observer. The site is built as a collection of standalone HTML pages with shared styling and a small JavaScript helper for the language toggle.

For Community Compass and Bylaw Registries work, read `docs/community-compass.md`
before touching Q&A pages, municipal-source ingestion, bylaw registry exports,
summaries, translations, explainers, indexing, or publication workflow.

## Working conventions
- Preserve the existing bilingual structure under the `en/` and `fr/` directories.
- Keep pages as simple, semantic HTML. Prefer small, targeted edits over large rewrites.
- Maintain relative links and asset paths so pages continue to work when previewed locally or published to GitHub Pages.
- Reuse the existing visual language and typography rather than introducing a new design system.
- Keep new content clear, concise, and appropriate for a civic journalism publication.

## File guidance
- `index.html` is the homepage. Its story zones (hero + the three photo cards) are rendered at runtime by `front-page.js` from `front-page.json`; the static markup inside them is only a fallback shown when the JSON fails to load. To change those, change the Notion Articles DB (Front Page Slot 1–4 + Headline/Deck/Image fields), not the HTML. Below them, **"Explore by topic" is hand-authored HTML** (since 2026-10-13; it replaced the Latest lists): one card per subject, each linking to a page dedicated to it (`/en/<topic>/` + `/fr/<sujet>/`, styled by `/topic.css`). Add a card only when its topic page exists in both languages. The Ledger card's total is checked by `finances/tests/validate.js` check 12.
- **`front-page.json` is generated — never hand-edit it.** The n8n workflow "🗞️ Observer — Front Page Builder" (NEST instance) rebuilds and commits it from Notion via the webhook `https://seneca.strai.ca/webhook/front-page-build` and on a 30-minute schedule. It also downloads any Notion-hosted story image and commits it as `images/<story-slug>.jpg`.
- `front-page.js` is the renderer: textContent-only DOM building, per-zone fallback, whitelisted SVG icons, `image.src` must match `/images/...`. Update carefully and test with a corrupted/missing JSON (static fallback must survive).
- `/en/index.html` and `/fr/index.html` are redirect stubs to the bilingual root homepage — do not rebuild them as standalone homepages.
- `observer-header.js` contains shared header behavior and should be updated carefully.
- **Dark ("Night Edition") is the default theme (since 2026-10-15).** Pages on `observer.css` have it built in. Article pages (explainers, Council Watch, PIIA, editorials, investigations) keep their own inline light palette and get dark from `/article-night.css`, the last stylesheet in `<head>`, plus the pre-paint theme script at the top of `<head>`. Every new article page needs both (they are in `templates/page-template.html`, the Council Watch skill templates, and `publish_explainer.py` adds them). If a new component hard-codes a colour, add its dark override to `article-night.css`.
- **`ogpt-sources.json` is generated — never hand-edit it.** The n8n workflow "🏛️ OrmstownGPT — Site Scanner & Ingest" (`pfe4w4SLTJuRaDHe`, NEST instance) scrapes the official ormstown.ca document sections, indexes each PDF into the Gemini File Search store `ormstowngpt-docs`, maintains the manifest in the `ogpt_documents` Data Table, and commits `ogpt-sources.json` — rebuild via `https://seneca.strai.ca/webhook/observer-ogpt-build` or the daily 05:30 schedule. Documents left in `state: failed` are automatically retried on the next run unless `linkOk` is false (dead source URL); `lastError` records why a document failed.
- **v1 "Ask Index Builder" is fully retired (cutover completed 2026-07-29).** Removed: Gemini stores `observer-municipal-docs` + `ogpt-smoke-test` (deleted to free the indexing quota that was blocking 20 public notices), the `ask_documents` Data Table, `ask-sources.json`, and the stale `file_search_store` row in `ask_config`. Builder `qZQg4E4vQPhwxmeH` is deactivated and renamed "🗄️ RETIRED — do not reactivate". `ask_rate_limits`, `ask_config` (row `ogpt_store_name` only) and `ask_log` are still in use — do not delete those.
- **Link rot is monitored.** Workflow "🔗 OrmstownGPT — Link Health Sweep" (`p4DAsCTA5k5sTZ4J`, weekly Mon 06:00 + `https://seneca.strai.ca/webhook/observer-ogpt-linkcheck`) HEADs every indexed document against a fresh scrape and flips `linkOk` false on a confirmed 404/410, which makes `ask.js` citations fall back to the section page instead of a dead PDF. It only condemns on a definitive 404/410 — transient failures are reported as "unverified" and never written, and documents that come back are automatically restored.
- **Documents are archived to the Wayback Machine.** Workflow "🏛️ OrmstownGPT — Wayback Archive" (`QpjQcza0KV4FUtgt`, daily 04:00 + `https://seneca.strai.ca/webhook/observer-ogpt-archive`) records a public snapshot of every active document in the `ogpt_archive` Data Table (`mZ6JVFuv8TM22YsB`). It looks each URL up via the **CDX API** — never `/wayback/available`, which rate-limits unauthenticated callers and then falsely reports "no snapshot" — and only calls Save Page Now when no capture exists. Expect a first full pass to span several daily runs. This is what preserves the evidence when the municipality deletes a document from its site.
- **The reader-facing name is "Community Compass" — renamed from "OrmstownGPT" on 2026-08-01. Never reintroduce the old name in anything a reader sees.** Two independent reasons it was dropped: a municipality-named tool published by an independent newspaper invites a passing-off / "residents assume this is official" claim, and OpenAI's brand guidelines restrict "GPT" in product names while this tool actually runs on Gemini. Community Compass is also a standalone StrAI product (regional, Haut-Saint-Laurent, four pillars) — these pages are the first use of the name, not the whole product.
- **Internal identifiers were deliberately NOT renamed.** `ogpt-sources.json`, the `observer-ogpt-*` webhook paths, the `ogpt_*` Data Tables and the n8n workflow display names stay as they are: they are internal, carry no legal exposure, and are coupled to a running backend. Do not "finish the rename" by touching them without coordinating n8n.
- The Community Compass pages (`en/ask/`, `fr/posez-une-question/`) and `ask.js` POST questions to `https://seneca.strai.ca/webhook/observer-ask` (n8n workflow "💬 Observer — Ask the Observer": validation, rate limiting via `ask_rate_limits`, Gemini File Search answer, citations from the manifest, logging to `ask_log`). `ask.js` follows the `front-page.js` discipline — textContent-only rendering and whitelisted citation URLs; keep it that way.
- **Community Compass is hidden from the site (since 2026-10-13).** The editor wants readers focused on the bylaw explainers while Compass is built outside this site. Its pages and backend still work, but they are `noindex` and nothing links to them: not the header nav (`observer-header.js`), not the homepage nav or "Explore by topic", and not the bylaw pages' call-out. Do not add links back until the editor says Compass is returning.
- **The bylaw map** ("Find the rule that applies to you", top of `/en/` + `/fr/bylaws-regulations/`, since 2026-10-13) replaced the "I want to…" topic grid. `bylaw-map.json` is **hand-authored**: the questions, in EN + FR, plus short points per answer. Answers name bylaws only by their exact `bylaw_number`; title, status and links come from `dist/bylaws.json`. A point must quote a published explainer or the register, never a draft in `drafts/`. `bylaw-map.js` renders it with the same textContent-only and link-allowlist rules as `bylaws-register.js`. Run `node scripts/tests/check-bylaw-map.js` after any edit: it fails on a missing, repealed or one-language entry, and reports which current bylaws no path reaches yet.
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
