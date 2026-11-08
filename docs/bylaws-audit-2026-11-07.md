# Bylaws & Regulations: audit and improvement plan (2026-11-07)

Scope: the `/en/bylaws-regulations/` register and map, the 32 live explainer
pages, `dist/bylaws.json`, `bylaw-map.json`, and the draft pipeline in
`drafts/bylaw-explainers/`. Read-only audit; nothing was changed. French pages
were not audited line by line.

## 1. What exists

| Piece | State |
|---|---|
| Register (`bylaws-register.js`, `dist/bylaws.json`) | 87 records: 53 in force, 9 amended, 22 repealed, 2 draft, 1 no status |
| Question map (`bylaw-map.json`) | 3 levels deep; reaches 61 of 65 current bylaws |
| Live explainers | 30 bylaw explainers + "How bylaws are made" + "Rules in plain language" (EN and FR) |
| Drafts not live | about 14 unpublished units in `drafts/` (see 3) |
| Images | 0 of 32 explainer pages show an image in the page body. 5 hero JPGs exist (`images/bylaws-regulations-*.jpg`), used only for homepage cards. One diagram: `how-bylaws-are-made-flow-*.png`. |

## 2. Fix first: the register is out of date

- `dist/bylaws.json` was generated 2026-10-08. It still lists **129-2026 as a
  Draft** and **149.1-2026 as a Draft**; the Nov 2 sitting adopted both
  (council-watch/november-2-2026). The homepage card already says "Adopted
  Nov. 2", so the site contradicts itself.
- The 129-2026 explainer is still written as "if adopted, it would replace
  129-2020 and 129-2021". It needs a "now adopted, in force on …" pass once the
  MRC certificate / notice of coming into force is known, and 129-2020/-2021
  should flip to Repealed in the register.
- 149.1-2026 has no explainer and no link from `subdivision-149-2023`.
- Borrowing bylaws 172-2026 / 173-2026 carry no status (None / Amended) and no
  key facts. 1 record has no status at all.
- The register has no "last checked" date visible to readers; the Notion
  registry reportedly holds 92 rows against 87 public.

## 3. Coverage: what is not covered or not explained

**Live explainers cover 30 of 65 current bylaws.** Of the other 35, about half
are loan/works bylaws, which the editor has said to leave out of the guide
(keep them in the register, collapsed). The resident-relevant gaps:

| Gap | Why it matters | Status |
|---|---|---|
| **1-2026 taxation bylaw** | Every owner is affected; fines, rates, due dates | No draft; text not reachable |
| **148-2023 zoning** (only ch. 12, trees, is explained) | The bylaw people actually need: zones, uses, setbacks, accessory buildings | No draft for the rest |
| **91.1-2018 nuisances / noise** | Most common neighbour question | Draft, needs editor decision |
| **50.1-2011 exterior water use** (summer watering) | Seasonal, high-traffic | Draft, on hold (current version?) |
| **151-2023 permits and certificates** | "Do I need a permit?" is the top question | Draft, needs decision |
| **114-2021 + 169-2025 PPCMOI** | The Church Street file turned on it | Draft, needs decision; 169-2025 text not posted |
| **136-2023 watercourse, 44-2024 budget control, 74-2021 ethics, 140/140.1 fire fees** | Governance and money | Drafts, mix of ready and decision |
| **149.1-2026** | Just adopted | No draft |
| 5 bylaws with no public text (1-2026, 120-2020, 120-2022, 57.1-2014, 51-2012) | Cannot be explained until the Town posts them | Blocked |

The drafts folder and `STATUS.md` are themselves stale (STATUS says 9 live; 32
pages are live), so nobody can see at a glance what is waiting on the editor.

**Answers residents look for that no single bylaw page gives.** Each is spread
across 3 to 5 bylaws, which is why the map helps but does not finish the job:
build a shed, fence or pool (148 + 150 + 151 + 39); burning and fireworks (155
+ 39); dogs, hens and licences (131 + 39); watering and water meters (86, 134,
50.1); parking, trucks and snow (7, 12, 154); noise and neighbours (91.1,
MRC 352). These want **task guides** ("I want to build a shed"): one page, a
checklist, what to apply for, what it costs, fines, who to call, with links
into the bylaw pages.

## 4. Visual and usability problems

Register page (`/en/bylaws-regulations/`):
- **18,200 px tall** on desktop: a flat list of 62 "in force" cards. Reaching
  the last bylaw takes about 20 screens.
- Cards print empty fields: "Not recorded" appears **97 times**; adopted date is
  missing on 44 of 87 records, amended date on 83, fines on 83. Empty rows read
  as clutter and as "the Observer didn't do the work". Hide empty fields.
- Key rules appear on about 10 cards; the other cards are a title plus a status
  pill. Cards for a loan bylaw and for the dog bylaw look identical.
- Filters exist (status, topic, category, search) but sit below a long map and
  there is no "has an explainer" filter or sort. (Corrected 2026-11-07: this
  first said there was only a search box.)
- The map is a good idea (tree with the red O as the start) but is text-only:
  10 plain cards with no icons, no pictures of what the topic is.

Explainer pages:
- Strong writing, but visually one pattern: kicker, headline, Key Takeaway box,
  long prose and tables. No image, no diagram, no at-a-glance strip.
- Fees page is 6,500 px with 6 tables; nothing shows the fee ranges visually.
- Each page is hand-built standalone HTML with inline CSS (about 15 KB of
  duplicated styles), so one design change means 64 edits (32 pages x 2
  languages). A shared stylesheet is the prerequisite for any redesign.

## 5. Recommendations

### A. Register redesign (biggest utility gain)
1. Default view = **explainers first**: "Start here" row of the 6 to 8 topics
   (with icons), then a compact table, not 62 tall cards.
2. Compact rows: number, plain title, status dot, topic chip, "Explainer" /
   "Official PDF" buttons. Expand a row for key rules and dates; hide any empty
   field instead of printing "Not recorded".
3. Keep the existing filters (they already live in the URL) but move them up
   above the map, and add "has an explainer" and a sort.
4. Group loan and works bylaws under one collapsed "Borrowing and works
   (history)" heading, and repealed ones under "Repealed", so the live rulebook
   is short and obvious.
5. Show "Register last checked <date>" and wire the export to a dated check, so
   stale entries like 129-2026 cannot sit for weeks.
6. Surface what is pending: a "Coming into force" strip for bylaws adopted but
   not yet in force (129-2026, 149.1-2026) with the lifecycle timeline below.

### B. Explainer template upgrade
Move shared CSS into one `bylaw-explainer.css`, then add to every explainer:
- **At a glance** strip: status, in force since, who enforces, fines range, "do
  I need to apply?", official PDF; icons, one line each.
- **What to do** box at the end: apply here, call this number, deadline.
- A **"Related rules"** footer linking the other bylaws on the same topic.
- A hero image or graphic (see C).

### C. Images and graphics: make them a standing practice
Precedents already on the site: the Ledger donut and bars, the homepage
calendar graphic, the Church Street timeline, the bylaw flow PNG. Proposal:

| Graphic | Where | Notes |
|---|---|---|
| **Topic icon set** (SVG, one line style, red O as accent) | map cards, register chips, nav | 10 icons cover all categories; inline SVG so dark/light and FR/EN work |
| **At-a-glance icons** | every explainer | status, date, fine, enforcer, permit |
| **Process diagrams** | permits, how bylaws are made, PIIA, PPCMOI, minor variance | rebuild the flow PNG as inline SVG with EN/FR labels, dark-mode aware |
| **Lifecycle timeline** (notice of motion, draft, adopted, MRC certificate, in force) | pending and recent bylaws | reuse the Church Street timeline code |
| **Fee and fine charts** | fees-39-2026, fire fees, MRC 352 | reuse the Ledger bar code; data comes from the page tables |
| **Hero photo** per explainer | top of page | Ormstown photos (town hall, streets, parks); each needs credit and alt text |
| **Zone / site diagrams** | zoning, setbacks, accessory buildings | simple labelled drawings, not the official map |

Process rule to add to CLAUDE.md and the templates (`page-template.html`,
Council Watch templates, `publish_explainer.py`): **every new article or
explainer ships with a hero image or a graphic, alt text in both languages,
and an `images/<slug>.jpg` for the homepage card.** Add a check to the existing
lint so a page without an image fails.

**Editor decisions needed for images:** photos you take or have rights to vs.
stock vs. generated illustration (the Observer's credibility argues for real
photos and hand-built diagrams; generated art only if clearly labelled as
illustration); and whether pictures of private property or named people are
ever used.

### D. Coverage plan
1. Immediately: refresh `dist/bylaws.json` (129-2026, 149.1-2026 adopted),
   update the 129-2026 explainer, add a short 149.1-2026 explainer.
2. Editor decisions on the 8 to 10 drafts that already exist (91.1 noise,
   151 permits, 50.1 watering, 114/169 PPCMOI first), then publish.
3. Write the missing big two: **148-2023 zoning** by chapter (zones, uses,
   accessory buildings, setbacks) and **1-2026 taxation** (once the text is
   public; request it from the Town if not).
4. Build 5 to 6 **task guides** from the bylaws already live: shed/fence/pool,
   burning, dogs and hens, watering, parking and snow, neighbours and noise.
5. Add a "What changed" feed on the register: bylaws newly adopted, amended or
   repealed, each linked to the Council Watch recap that voted it.

## 6. Suggested order (smallest useful steps first)

1. **Refresh the register + 129-2026 / 149.1-2026 currency** (small; fixes a
   visible contradiction).
2. **Shared explainer stylesheet + at-a-glance strip + topic icons** (medium;
   unlocks everything visual).
3. **Register redesign: compact rows, filters, hide empty fields** (medium).
4. **Images policy and template check** (small; applies to all Observer work).
5. **Publish the ready drafts, then zoning and taxation** (editor time).
6. **Task guides** (medium each, reuse existing content).

## 7. Not checked
- French page parity and wording; link rot in explainer sources; accessibility
  contrast beyond what the screenshots showed; the PWA/offline behaviour of the
  register.
