# Public money explorer — maintenance notes

## Files

The ledger ships as three surfaces that share one dataset.

**`/finances/classic/` — the previous explorer (archived 2026-08-20).**
Kept so links published before the swap keep resolving. `noindex`, canonical
points at `/finances/`, and it carries a static bilingual "archived view"
banner. Its script paths are absolute so the directory move did not break it —
including `PAYMENTS_URL` in `app.js`, which fails silently if it is wrong
(only the expand-a-payee detail dies).
- `index.html` — markup + inline styles, seven scrolling layers.
- `app.js` — all behaviour. State `{lang, year, months[], categories[]}` mirrored to
  `?lang=&year=&period=&category=`. (An older note here described `q` and `sort`
  parameters and a search box; those never shipped — the workspace below is where
  search and sorting live.)

**`/finances/` — the research workspace (published 2026-08-20).**
`finances/v2/` is now a redirect stub that forwards to `/finances/` preserving
the query string, so links shared during the review window still resolve.
- `index.html` — shell only. No inline `:root`, no masthead, no footer: it links
  `/observer.css` and `/observer-header.js` like the rest of the paper, and gets
  dark mode and the site nav from them.
- `ledger-data.js` — **no DOM, no i18n, on purpose.** Builds the line store from
  `payments.json` anchored to `spending-data.js`. `finances/tests/validate-lines.js`
  evals this same file in Node, so the test asserts against the exact store the
  browser builds. Keep it free of `document` and of translated strings.
- `ledger-charts.js` — theme-aware category palette (dark-mode lightness lift),
  lazy Chart.js injection, and the `killChart`/`deferred` pair lifted from `app.js`.
- `ledger-views.js` — every renderer. **textContent-only**; `rich()` is the single
  markup path and only ever takes repo-authored i18n strings, never data.
- `ledger-app.js` — state, the URL contract (documented in a comment block at the
  top of the file — read it before changing a parameter), the rail, tabs, boot.

**`/finances/budget/` — the reference page.** Budget, PTI, coverage, method,
documents and the dictionary, moved wholesale out of `app.js`. Shares
`/finances/ledger.css` and the workspace's data/views modules.

**Shared data (unchanged by the workspace):**
- `i18n.js` — every interface string, FR + EN, for all three surfaces.
- `spending-data.js` — **generated**; do not hand-edit amounts. `months[].total` is
  the ADOPTED figure and is never recomputed.
- `payments.json` — **generated**; the 2,138 line-level payments. This is the
  workspace's primary dataset.
- `ledger.css` — component CSS for the workspace and the reference page, written
  entirely against `observer.css` tokens. **Never use `var(--muted)`,
  `var(--ink-light)` or `var(--border)` in it:** `observer-header.js:5-8` injects a
  `:root` block after the stylesheet that pins those three to light values, and
  `observer.css`'s dark blocks do not redefine them.

## Regenerating the data (after a new PV is itemized in the ledger)
1. Itemize the sitting in the Notion ledger (Line items + Monthly list total; use the
   `Excluded from total` checkbox + `Exclusion reason` for credit-line décomptes and
   documented duplicates — never delete rows).
2. Query the ledger for the new sitting's payee/category groups (included lines only),
   add the month + entries to `spending-data.js` (named payees ≥ ~$1,000, smaller lines
   grouped per category as the rest sentinel), update `generated` and, if needed,
   `provenance.tolerances`.
3. Update the pending-minutes status line in `i18n.js` (`status` key, both languages).
4. Regenerate `payments.json` (per-line payee detail behind the expandable rows): export the
   sitting's included line items from the ledger as `[Payee, Entry, Amount]` triplets and add
   them under the month key. Every month's lines must sum exactly to that month's entries —
   validate.js enforces this.
5. Run the tests (below) — they fail loudly if any itemized month stops reconciling.

## After an ingest, update the front page too
The homepage carries a Municipal Ledger module in the side column showing the
**current year's approved total**, hardcoded (the front page must not fetch
`spending-data.js` just for a teaser). It shows the year rather than the
all-time figure so that the front page and the ledger — which opens on the
current year — say the same thing.

**Update `index.html`'s `.ledger-mod` in the same commit as a new sitting**:
the figure in both languages' number formatting, and the year itself each
January. `validate.js` check 12 fails the build on all three failure modes —
a drifted total, a year that rolled over without the copy following, and an
older year's total left behind in the markup.

## Ledger sync (standing rule — do not skip)
The Notion ledger's Category field is kept in lockstep with `category-rules.js`
(observer-rules-v4). **Whenever a category rule changes, or a new sitting is
ingested, sync the ledger:** export each sitting's included line items with ids
(`json_group_array(json_array(id, Payee, Entry, Amount, Category))`), compute
`mapCategory(Payee, Entry, Category)` per row, and update every row where the
result differs. Then verify: per sitting, the ledger's per-Category (count, sum)
must exactly match `months[].cats` in spending-data.js. This keeps the Cowork
Finance Tracker (which reads the ledger) showing the same categories as the
public page.

## Cache busting (do not skip)
Every page references its scripts with a `?v=` query string. GitHub Pages caches for
~10 minutes and browsers longer, so a stale script paired with a fresh page renders
without charts. **A page and every script it loads must carry the same stamp**, and
that includes a stamp a script holds internally:

| File | Where the stamp lives |
|---|---|
| `classic/index.html` | 3 script tags |
| `classic/app.js` | `PAYMENTS_URL`, ~line 187 |
| `index.html` (workspace) | the stylesheet link + 6 script tags |
| `ledger-app.js` | `PAYMENTS_URL`, near the top |
| `budget/index.html` | the stylesheet link + 5 script tags |

Every page under `finances/` currently shares one stamp. They are *allowed* to
diverge — `validate.js` check 10 enforces the rule per page, not globally — but
bumping them together is simpler. Check 10 would have caught the week
`app.js`'s `PAYMENTS_URL` was stale while its page was fresh.

## Tests / checks
```bash
node finances/tests/validate.js         # reconciliation, schema, i18n parity + usage,
                                        # category slugs, budget sums, ?v= stamps
node finances/tests/validate-lines.js   # THE ONE THAT MATTERS for the workspace:
                                        # builds the browser's real line store and
                                        # proves it reproduces months[].cats and
                                        # entries[] to the penny
node finances/tests/render-check.js         # boots the whole workspace under a DOM
                                            # shim and drives it: search, filter,
                                            # sort, tabs, profile, legacy URLs, both
                                            # languages, no injected markup
node finances/tests/render-check-budget.js  # the reference page, incl. the
                                            # accounting rule below
node finances/tests/render-check-offline.js # the degraded paths: slow network,
                                            # failed payments.json, missing
                                            # spending-data.js. The page must
                                            # never go blank.
node --check finances/*.js finances/budget/budget.js finances/classic/app.js
```

`validate-lines.js` also maintains `finances/tests/payee-slugs.json`, which freezes
every payee slug ever shipped. A `?payee=` link may appear in a published article, so
a data update may ADD a payee but must never move an existing slug — the test fails if
one does. If a rename is genuinely intended, edit the fixture in the same commit and
say why in the message.

What these cannot check: visual layout, dark-mode contrast, and real touch targets.
Those stay manual:

```bash
python3 -m http.server 8000     # from the repo root
```
- `/finances/tests/viewport-harness-v2.html` — 320/375/390/768/1024/1440 px, in two
  passes: as loaded, and with the mobile filter sheet forced open (the likeliest
  overflow source, invisible to the original harness). Also covers `/finances/budget/`.
- `/finances/tests/interact-harness-v2.html` — tabs, search, checkboxes, chart clicks,
  a payee profile opened and closed with Back, and "Showing N of M" against the rows
  actually in the DOM. Charts must never be rebuilt synchronously from inside their
  own `onClick` — state changes there go through `deferred()`.
- `/finances/tests/viewport-harness.html` and `interact-harness.html` now point at
  `/finances/classic/` and keep guarding the archived view.
- By hand: system dark / explicit dark / explicit light, keyboard-only from the skip
  links through to "Show more", Back and Forward five deep, and printing with a filter
  applied (all filtered rows must print, not just the 150 on screen).

## Accounting rule (do not regress)
Approved council expense lists are **not** annual budget spending nor actual incurred
expenses. The annual-context section must keep its explanatory note, the
"scale reference — not budget used" label, and must never use a progress bar for
the approved-vs-budget comparison.

## extract-annexe.js — transcribing a 2025 annexe

`node finances/tools/extract-annexe.js <pv.pdf> <firstPage> <lastPage> [out.json]`

Column-aware extraction of an Annexe A payment table, written for the 2025
backfill. Use it instead of `pdftotext -layout`, which on these PVs scrambles
the wrapped description column and silently drops parenthesised credits.

It reads word positions (`pdftotext -bbox-layout`), splits payee / description /
amount by x, and attaches wrapped description lines to the right row. The 2025
PVs use two cell alignments in the same document — the amount on the last line
of its cell in the « paiements à effectuer » pages, vertically centred in the
« paiements émis » pages — so the alignment is detected per page. A wrong guess
shifts descriptions by one line WITHOUT changing any amount, so always split the
output by block and reconcile each block against its printed subtotal before
writing anything to Notion or the site. Credits come back negative.
