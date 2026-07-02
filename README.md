# The Ormstown Observer

This repository hosts the public website for The Ormstown Observer, a bilingual civic journalism publication serving Ormstown and the Haut-Saint-Laurent region.

## What is in this repo
- Static HTML pages for the English and French versions of the site
- Shared scripts and styling for the header and language switcher
- A small set of documentation files and page templates for future content updates

## Local development
From the repository root, start a simple web server:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000/ in your browser.

## Repository structure

```text
.
├── CNAME
├── index.html
├── observer-header.js
├── events.json
├── en/
├── fr/
├── images/
├── docs/
└── templates/
```

## Publishing
The site is intended to be published via GitHub Pages using the repository root as the site source.

## Notes
- The content is primarily static HTML, so changes are straightforward to review.
- Keep the English and French versions aligned when adding or updating stories.
