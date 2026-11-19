# Valley events calendar

`/en/events/` + `/fr/evenements/` (since 2026-11-19; `/fr/events/` redirects
to the French page). A list of upcoming community events across the 13
municipalities of the MRC du Haut-Saint-Laurent, grouped by day, with filters
for town and kind that live in the URL (`?town=huntingdon&kind=market`), and a
link per event (`#<id>`) for sharing on Facebook.

An earlier Ormstown-only events page was removed on 2026-10-12 (1571aa9). This
is a new build: textContent-only rendering, bilingual data, sourced listings.

## Files

| File | What it is |
| --- | --- |
| `events.json` | The data. Hand-written or written by the weekly sweep. |
| `events.js` | Renderer. Holds `HOSTS` (source-link allowlist), `TOWNS`, `KINDS`. |
| `events.css` | Styles on top of `topic.css`; observer.css tokens only. |
| `en/events/index.html`, `fr/evenements/index.html` | The pages. |
| `images/events-calendar-{en,fr}.png` | Facebook/OG share images (1200×630). |
| `scripts/tests/check-events.js` | Validator. Run after every edit. |

Linked from the drawer menu ("Events in the Valley") and from a line under the
homepage Bulletin. Not in the top nav (it stays short).

## Editorial rules (editor, 2026-11-19)

- **Auto-publish.** Unlike the Bulletin, calendar events do not wait for
  approval: the weekly sweep adds them to `events.json` and pushes. The rules
  below are what keeps that safe; when in doubt, leave the event out.
- **Area:** the 13 municipalities of the MRC du Haut-Saint-Laurent only
  (`TOWNS` in events.js). An event elsewhere (Valleyfield, Hemmingford,
  Sainte-Martine, Châteauguay…) is not listed, even if Valley groups run it.
- **Read it yourself.** Every event comes from a source read during the run,
  linked as `source` with a label saying what it is and its date: "Town of
  Huntingdon on Facebook (post of Nov. 4)", "Facebook event", "The Gleaner
  (Nov. 18)", "Marché Fermier Huntingdon, market calendar". Prefer the most
  specific URL (the Facebook event, the article).
- **Check the year.** Search results surface old articles (2021, 2023, 2024
  Christmas-market roundups). Use only sources whose own date or text makes the
  event's year clear.
- **Only what the source says.** No adjectives the source didn't use, no
  guessing times or prices. Say what isn't known yet ("times not posted yet").
- **What goes in:** markets and craft fairs, holiday celebrations, shows,
  talks, exhibits, suppers, benefits and fundraisers, church and community-group
  events, family and sports events open to the public, public consultations and
  information sessions.
- **What stays out:** private commercial promotions and sales, bar nights,
  events with no date, anything about the Observer's legal matters, and
  anything that would name a private individual who isn't a performer or an
  organizer acting publicly.
- **Language:** EN and FR for every title and text (plain language, Québec
  French). Event names stay in their original language when they are proper
  names; say "(in French)" / "(en anglais)" in the source label when the
  source is in one language only.
- **Hosts:** a source URL must be on a host in `HOSTS` in events.js. To use a
  new organizer's or municipality's own site, add its exact host with the date
  in a comment, in the same commit.
- **Keep it current:** each sweep removes events whose last day has passed and
  updates events whose details changed (keep the same `id`).

## Fields

`id` (lowercase slug, unique, e.g. `marche-de-noel-saint-anicet-2026`),
`date` (first day), optional `end` (last day), `town` (TOWNS key), `kind`
(`market`, `holiday`, `culture`, `community`, `sport`, `civic`), `title_en/fr`,
optional `times_en/fr` (both or neither), optional `place` / `place_fr`,
`text_en/fr` (1–3 sentences), `source {label_en, label_fr, url}`, `added`.
Top level: `updated` (YYYY-MM-DD).

## Sweep (Mon, Wed, Fri) and Facebook post

The scheduled task "Observer events calendar sweep" runs Monday, Wednesday and
Friday evenings (editor, 2026-11-19: Facebook is a key source and moves fast).
Each run processes the Flyer Inbox, reads the sources below, updates
`events.json`, runs the validator, commits as
"Calendar: +<added> / ~<updated> / -<removed> events" and pushes.

The **Wednesday** run also writes one row in the Notion database **📣 Calendar
Facebook Posts** (under 📰 Publishing; data source
`collection://41d3a459-dbd8-812c-9daa-000bc134b9ff`): a bilingual "This
weekend in the Valley" post for the coming Friday to Thursday, with the
calendar link. The Friday run refreshes that row if it is still a Draft and new
events in its window were added. Jesse posts it on Facebook himself; Claude
never posts, likes, comments or RSVPs.

## Flyers

Jesse photographs flyers he sees and either sends them in a chat or adds a row
to the Notion database **📸 Flyer Inbox** (under 📰 Publishing; data source
`collection://41d3a459-dbd8-81de-89a2-000b27cdc412`): photo, Seen on, Status =
New. A flyer is a valid source on its own:

- `source` has no `url`; it has `seen` (the date the photo was taken or sent)
  and labels such as "Event flyer (photographed Nov. 19)" / "Affiche de
  l'événement (photographiée le 19 nov.)" (add ", in French" / "en anglais"
  when the flyer is in one language). The validator requires both labels to
  say flyer / affiche.
- The photo stays in Notion; it is not published on the site.
- Copy only what is printed. Leave out private individuals' phone numbers and
  first names printed as contacts; give the organization instead. If the year
  isn't printed, check that the weekday matches the current year, and say so
  in the Flyer Inbox notes.
- Set the inbox row to Added with the event id, or Skipped with the reason
  (out of area, past, unreadable, private sale…).

Sources: Facebook events searches (one per town), each town's own website and
Facebook page, The Gleaner (homepage, "This & That" columns, Arts & Life),
mrchsl.com, the Marché Fermier Huntingdon calendar, and the school service
centre (CSSVT) pages.

Events in Ormstown can also go to the Bulletin queue as proposals, as before;
the Bulletin still needs Jesse's approval.
