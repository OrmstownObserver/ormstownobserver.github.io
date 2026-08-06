# Public money explorer — maintenance notes

## Files
- `index.html` — markup + styles (layers: masthead → snapshot → trend → explore → annual context → capital → verify).
- `app.js` — all behaviour. One state object `{lang, period, category, q, sort}` mirrored to URL query parameters (`?lang=fr&period=2026-05&category=professional-services&q=hydro&sort=name-asc`). Back/Forward restores state.
- `i18n.js` — every interface string, FR + EN. Data-side strings (glosses, month notes) live in `spending-data.js`.
- `spending-data.js` — **generated** from the Notion 💰 Municipal Spending Ledger; do not hand-edit amounts. Official values (adopted totals, sessions, budget figures) are immutable; Observer-made fields (categories, glosses, notes) are listed in `provenance`.

## Regenerating the data (after a new PV is itemized in the ledger)
1. Itemize the sitting in the Notion ledger (Line items + Monthly list total; use the
   `Excluded from total` checkbox + `Exclusion reason` for credit-line décomptes and
   documented duplicates — never delete rows).
2. Query the ledger for the new sitting's payee/category groups (included lines only),
   add the month + entries to `spending-data.js` (named payees ≥ ~$1,000, smaller lines
   grouped per category as the rest sentinel), update `generated` and, if needed,
   `provenance.tolerances`.
3. Update the "June minutes are being added" status line in `i18n.js` (`status` key, both languages).
4. Run the tests (below) — they fail loudly if any itemized month stops reconciling.

## Tests / checks
```bash
node finances/tests/validate.js   # data reconciliation, schema, i18n parity, budget sums
node --check finances/app.js      # syntax
```
Responsive check: serve the repo root (`python3 -m http.server 8000`) and open
`/finances/tests/viewport-harness.html` — it renders the page at 320/375/390/768/1024/1440 px
and prints PASS/FAIL for page-level horizontal overflow over each frame.

Interaction check: `/finances/tests/interact-harness.html` toggles pills and clicks the
chart canvases repeatedly, then verifies both charts are still alive (regression guard
for the destroy-during-chart-click bug). Charts must never be rebuilt synchronously from
inside their own onClick — state changes there go through `deferred()`.
There is no build step; the site is served as-is by GitHub Pages.

## Accounting rule (do not regress)
Approved council expense lists are **not** annual budget spending nor actual incurred
expenses. The annual-context section must keep its explanatory note, the
"scale reference — not budget used" label, and must never use a progress bar for
the approved-vs-budget comparison.
