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
- `index.html` is the homepage.
- `observer-header.js` contains shared header behavior and should be updated carefully.
- `images/` holds site assets and should be referenced with stable paths.
- New stories should follow the existing folder pattern for English and French pages.

## Local preview
Use a simple local server from the repository root:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000/.

## Notes
- Do not commit or push changes unless explicitly requested.
- Keep edits focused on the current task and avoid unrelated refactors.
