# Press kits — how to publish another one

A press kit is a **briefing package for journalists**: the story in three minutes,
the strongest angle, the primary-source documents, the chronology, what is
confirmed versus disputed versus unanswered, the other side's position, media
files, and how to reach us.

**You add content. You do not rebuild the page.**

Everything a reader sees comes from one JSON file. The renderer, the components
and the print stylesheet are shared by every kit and are not touched when you
publish a new one.

---

## What lives where

```
/press/
  press-kit.css          shared components (built on observer.css tokens)
  press-kit.js           shared renderer — never edit to publish a kit
  index.html             the public list of press kits
  _template/             copy this to start a new one
    kit.json             every supported field, annotated
    index.html           EN shell
    fr/index.html        FR shell
  bell-tower/            a real, complete example — read it before writing yours
    kit.json             ← ALL the content, both languages
    index.html           EN shell: title, description, OG tags, JSON-LD
    fr/index.html        FR shell: same, in French
```

URLs are clean and permanent:

| | |
|---|---|
| English | `https://ormstownobserver.ca/press/<slug>/` |
| French  | `https://ormstownobserver.ca/press/<slug>/fr/` |

---

## Publishing a new kit — the whole procedure

**1. Copy the starter.**

```bash
cd ~/GitHub/ormstownobserver.github.io/press
cp -R _template church-street          # use your slug
```

**2. Fix the shells** (`church-street/index.html` and `church-street/fr/index.html`).
These carry only metadata — the title, the description, the Open Graph tags and
the JSON-LD block. Crawlers and social previews read static HTML, which is why
this cannot live in the JSON.

- replace every `REPLACE-SLUG` with your folder name
- replace every `REPLACE-…` placeholder with real text
- set the share image (`og:image`) to a real file in `/images/`
- delete the `<meta name="robots" content="noindex">` line and the starter comment

**3. Write `kit.json`.** This is the actual work. Every section is optional —
delete a key and its section disappears from the page *and* from the sticky nav.

**4. Preview.**

```bash
python3 -m http.server 8000
# http://localhost:8000/press/church-street/
# http://localhost:8000/press/church-street/fr/
```

Check both languages, both themes (the ☀/🌙 toggle in the masthead), and a print
preview (⌘P) before publishing.

**5. Add a card to `/press/index.html`** — copy the existing `<li class="idx-kit">`
block and change the text and hrefs.

---

## The content model

Every human-readable string is a **pair of sibling keys**, `x_en` and `x_fr` —
the same convention as `front-page.json`. A missing `_fr` falls back to `_en`, so
a half-translated kit degrades to readable rather than blank.

Inside any text you may write `**bold**`, `*italic*` and `[link text](https://…)`.
Nothing else — no raw HTML. The renderer builds those as real DOM nodes; it never
uses `innerHTML`, because this content is destined to come out of a CMS.

### Sections, in page order

| Key | Becomes |
|---|---|
| `hed` / `deck` / `case` / `kicker` / `hero` / dates | the hero |
| `notices` | standing banners under the hero — see below |
| `glance.items` | **Story at a glance** — 4–6 key facts, each with a status label |
| `numbers` | **Key numbers** — statistic cards |
| `why.body` | **Why it matters** |
| `people` | **Key parties** |
| `timeline` | the responsive chronology |
| `narrative` | **The findings** — the editorial body |
| `questions` | **Questions raised** |
| `documents` | **Document evidence** cards *and* the **Source library** |
| `responses` | **Other parties' position** (right of reply) |
| `context` | **Legal & procedural context** explainer cards |
| `media` | **Media assets** downloads |
| `contact` / `terms` | **Media contact** and the terms of use |

Any section's heading can be overridden with `<key>_title_en` / `_fr`, and given
a standfirst with `<key>_sub_en` / `_fr`.

### Notices

`notices` is an array of standing banners rendered directly under the hero,
before anything a reporter might otherwise quote. Each has a `tone`:

| Tone | Use it for |
|---|---|
| `hold` | an embargo or a verification hold — **do not distribute** |
| `disclosure` | a conflict of interest, or who wrote the briefing and why |
| `update` | a material change since publication |
| `correction` | a published, dated correction |

```json
{ "tone": "hold",
  "label_en": "Hold for verification — do not distribute",
  "head_en": "The written order has been requested and is not yet in hand.",
  "body_en": ["Check every date against it before circulating."] }
```

A `hold` notice is a statement to readers, not a technical guard. If a briefing
must not be published yet, also add `<meta name="robots" content="noindex,
nofollow">` to both shells and leave it off `/press/index.html` until the hold
clears. `/press/ormstown-v-roskies/` is set up exactly that way and its index
card is staged as an HTML comment with the steps to publish.

### Status labels

Set `"status"` on a glance item, a timeline entry, a `fact` block, a question or
a document:

| Value | Means |
|---|---|
| `confirmed` | verified against more than one independent source |
| `documented` | stated in a published document linked on the page |
| `disputed` | the parties give different accounts of the same fact |
| `alleged` | asserted by someone, not independently verified |
|  | *contested allegations in live litigation belong here, on both sides* |
| `unanswered` | a question put and not answered |
| `analysis` | the Observer's own reading, not a finding of fact |

The legend under the glance panel builds itself from the labels the page actually
uses — you never maintain it. Evidentiary labels get a solid border; `analysis`
gets a dashed one, so a reader can tell fact from reading at a glance.

### Documents, and the two views of them

There is **one** `documents` array. It renders twice:

- as **evidence cards** — everything except entries marked `"featured": false`
- as the **grouped, filterable source library** — everything, bucketed by
  `category`: `court`, `municipal`, `correspondence`, `ati`, `regulation`,
  `photo`, `video`, `other`

Never keep a second list. Set `"primary": true` on originals — municipal records,
correspondence, regulations — and they get the red border and the PRIMARY SOURCE
flag that separates them from the Observer's account of them.

Give each document an `"id"`, then point at it from anywhere else with
`"source_ref": "<id>"` (or `"doc": "<id>"` on a timeline entry). The renderer
resolves it into a clickable "Source: …" chip. If a document lives at a different
URL in each language — as the Observer's own coverage does — use `view_en` and
`view_fr` instead of `view`.

### Right of reply, and response states

`responses` is where the other side gets equal weight — same measure, same
heavy rule, never a sidebar. Set `status` to one of:

| Status | Means |
|---|---|
| `received` | they gave a statement **to this briefing** |
| `pleaded` | their position taken from their own filing — *not* a statement to you |
| `invited` | asked to respond; nothing received yet |
| `declined` | they declined to comment |
| `none` | no response received |

The `pleaded` / `received` distinction matters. Never label a position lifted
from a court document as a response the party gave you.

### Quotes and paraphrase

A `quote` block wraps its text in quotation marks for you — **do not type them**.

If you are summarising rather than quoting, set `"paraphrase": true`. The block
then renders without quotation marks, in body type rather than display italic,
and carries an explicit "Paraphrase — not a direct quotation" label. Use it. Never
dress a summary as a direct quote.

### Images

`src`, `thumb` and `preview` must point inside `/images/`, `/press/` or
`/downloads/` — anything else is silently rejected. This is deliberate: the same
whitelisting discipline as `front-page.js` and `ask.js`.

---

## Design notes, if you are extending the components

The kit is built on `observer.css` tokens and inherits dark mode from them. Two
hazards are worked around in `press-kit.css` and are worth knowing before you add
a rule:

1. **`observer-header.js` appends a `<style>` block at runtime** that re-declares
   a bare `:root` with hardcoded *light* values for `--muted`, `--ink-light` and
   `--border`. Being appended last it beats `observer.css`, and those three are
   never restated for dark. **Use `--ink-soft` and `--hair` instead.** Tokens the
   header also sets (`--ink`, `--paper`, `--paper-dark`, `--accent`, `--rule`) are
   safe, because `observer.css` restates them inside `:root[data-theme=dark]`,
   which outranks a bare `:root`.

2. **`--text-on-accent` and `--accent-press` are light-only.** Dark mode lifts the
   accent to a pale `#e8686c`, on which white text falls to about 2.4:1.
   `press-kit.css` declares `--kit-on-accent` and `--kit-accent-press` for this.

Status chips tint themselves from `currentColor` with `color-mix`, so one rule
serves every status in both themes — add a status by adding one `color:` line.

---

## Notion → press kit, when you want it

The content model was shaped for this. It is a flat set of arrays of records with
stable ids and paired `_en`/`_fr` fields — which is what a Notion database export
already looks like. **Do not add a Notion API call to the page.** These pages are
static, and a runtime API call would put a token in the browser and make a
journalist's page load depend on Notion being up.

The recommended path, when you build it, mirrors the two generators this repo
already runs (`front-page.json`, `ogpt-sources.json`):

**One Notion database per array, related to a parent "Press kits" database.**

| Notion DB | Produces | Key properties |
|---|---|---|
| 📰 Press Kits | the kit's own fields | Slug, Headline EN/FR, Deck EN/FR, Case EN/FR, Published, Updated, Status, Hero image |
| 📌 Key Facts | `glance.items` | Text EN/FR, Status, Order |
| 🔢 Key Numbers | `numbers` | Value EN/FR, Label EN/FR, Note EN/FR, Source (relation → Documents) |
| 🕐 Timeline | `timeline` | Date, Headline EN/FR, Summary EN/FR, Status, Document (relation) |
| ❓ Questions | `questions` | Question EN/FR, Why EN/FR, Asked of, Asked on, Status |
| 📄 Documents | `documents` | Doc ID, Name EN/FR, Type EN/FR, Source EN/FR, Date, Category, Primary?, Featured?, Why EN/FR, View URL, Download URL |
| 💬 Responses | `responses` | Party EN/FR, Role EN/FR, Status, Date, Body EN/FR, Source (relation) |
| 🖼 Media Assets | `media` | Kind, Title EN/FR, Caption EN/FR, Credit EN/FR, File |

**The generator** — an n8n workflow, "🗞️ Observer — Press Kit Builder", following
the Front Page Builder pattern exactly:

1. webhook `https://seneca.strai.ca/webhook/press-kit-build` plus a schedule
2. query each database filtered to the kit's slug, ordered by `Order` / `Date`
3. map Notion properties to the `x_en` / `x_fr` key pairs — the mapping is
   mechanical, one line per property
4. download any Notion-hosted image and commit it as `/images/<slug>-<n>.jpg`,
   because a Notion file URL expires after an hour and would rot the page
5. commit `press/<slug>/kit.json` to this repo

The build must **fail loudly rather than commit a partial file**: a truncated
`kit.json` would empty a live briefing. Validate that `hed_en`, `deck_en` and at
least one document survive the mapping before writing.

The narrative body is the one part that does not map cleanly — Notion blocks are
richer than the `p` / `list` / `callout` / `fact` / `quote` / `figure` vocabulary
here. Either keep `narrative` hand-authored in the JSON and let the generator
merge it, or restrict the Notion page to those block types and write a converter.
Start with the merge; it is the smaller problem.

Until that exists, `kit.json` is hand-authored, and that is a perfectly good
place to stay for the first few kits.

---

## Before you publish

- both languages render, and the FR/EN switch in the hero goes to the right page
- light **and** dark (masthead toggle) — no grey-on-grey anywhere
- 390 px wide: no horizontal scroll, the section nav collapses to a
  "current section ▾" button
- ⌘P: no masthead, no nav, no buttons, black on white, document URLs printed
- every document link opens; nothing 404s
- the browser console is clean
- the status label on every fact is the *right* one — this is the part a reporter
  will trust you on
