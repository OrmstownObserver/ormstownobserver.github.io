# App notifications — plan

Status: **plan, nothing built yet** (2026-10-16). The install button that
comes before it is live in `observer-header.js` (drawer menu only, EN/FR; removed from the footer 2026-10-16 at the
editor's request).

## Goal
Readers who install the Observer get an alert when a story they care about is
published: a Council Watch recap or preview, a new bylaw explainer, a public
notice. The alert is in their language, and tapping it opens the story.

## What the platforms allow
- **Android (Chrome, Edge, Samsung Internet):** web push works from the
  website and from the installed app.
- **iPhone/iPad (iOS 16.4+):** web push works **only once the Observer is on
  the home screen**. That's why the install button had to come first. A
  reader in Safari who taps "Get alerts" is shown the install steps instead.
- Every push must show a visible notification (no silent pushes on iOS).
- Permission can only be asked from a tap. Never ask on page load: browsers
  penalise sites that do, and readers say no.

## How it fits together

```
Reader taps "Get alerts"        n8n (seneca.strai.ca)              Notion Articles
  → picks topics + EN/FR   ──►  observer-push-subscribe webhook    Status ✅ Published
  → browser permission          → Data Table observer_push_subs    + 🔔 Send alert = Yes
                                                                         │
sw.js "push" handler       ◄──  "Observer — Push Sender" workflow ◄─────┘
  shows the notification        signs (VAPID) + encrypts per sub,
  tap → opens the story         removes subs that answer 404/410,
                                records the send in observer_push_sent
```

### 1. Site (this repo)
- **`sw.js`:** add a `push` handler (title, body, `/app/icon-192.png`, a
  `tag` per story so repeats collapse) and a `notificationclick` handler that
  focuses an open Observer window or opens the story URL. URLs must be
  same-origin (`/en/...`, `/fr/...`). Ignore anything else, the same
  allow-list discipline as `front-page.js`. Bump `VERSION`.
- **`observer-header.js`:** add a "Get alerts / Recevoir les alertes" control
  next to the install button. In the installed app (or on Android) it opens a
  small sheet with topic checkboxes (Council Watch · Bylaws & regulations ·
  Public notices · Everything) and the reader's language, preset from the
  language toggle. The permission prompt comes after they confirm. Readers
  can change topics or turn alerts off from the same sheet.
- Subscribe with `PushManager.subscribe` and the public VAPID key (safe to
  ship in the JS). POST `{subscription, topics, lang}` to the subscribe
  webhook. Store nothing about the reader beyond that.

### 2. n8n (NEST instance)
- **Data Table `observer_push_subs`:** endpoint (unique), p256dh, auth,
  topics, lang, created, lastSent, failCount.
- **Webhook `observer-push-subscribe`:** validate the shape, allow only
  `https://` endpoints on known push services (fcm.googleapis.com,
  web.push.apple.com, updates.push.services.mozilla.com,
  \*.notify.windows.com), upsert by endpoint, rate-limit like
  `ask_rate_limits`. A matching `observer-push-unsubscribe` deletes the row.
- **"🔔 Observer — Push Sender" workflow:** runs after the Front Page Builder
  (or on its 30-minute schedule). It picks Articles that are ✅ Published,
  have **🔔 Send alert = Yes**, and are not yet in `observer_push_sent`. For
  each subscriber whose topics match, it sends Headline EN or FR (with Deck
  as the body) and the GitHub Path or Path FR as the URL. A 404/410 answer
  deletes that subscriber. Anything else bumps failCount, and the row is
  dropped after 5 failures.
- **Signing and encryption:** web push needs VAPID-signed, RFC 8291-encrypted
  payloads. On self-hosted n8n the simplest route is the `web-push` npm
  module in a Code node (`NODE_FUNCTION_ALLOW_EXTERNAL=web-push` on the
  instance). The VAPID private key goes in n8n credentials and in the Claude
  Credentials page in Notion, never in this repo.

### 3. Notion (the one place the editor acts)
Per the standing rule, sending is a property the editor sets, not a chat
request:
- **🔔 Send alert** (checkbox, Articles DB). Ticked → sent once, on the next
  run after the story is published.
- **Alert topic** (select: Council Watch / Bylaws / Public notices). Defaults
  can be derived from GitHub Path (`en/council-watch/…` → Council Watch).
- **Alert sent** (date, written back by n8n) so the editor can see it went
  out. The sender refuses to send twice for the same article.

## Before launch: privacy
Collecting push subscriptions is collecting personal information by a
technological means. Québec's Law 25 requires a published confidentiality
policy for that. It now exists at `/en/privacy/` + `/fr/confidentialite/`
(2026-10-16), linked from the bottom of the drawer menu only (the editor's
choice: tucked away, not in the footer). The person responsible is published
by title, "the publisher / l'éditeur", which Law 25 allows instead of a
name. Subscriber data stays on the Observer's own server in Québec (the n8n
instance behind seneca.strai.ca), so no transfer outside Québec is involved.
If the n8n server ever moves, update the page first. When alerts ship, also
link the page from the alerts sheet, next to the permission button.

## Editorial guard-rails
- At most about 3 alerts a week. An alert is for a story, never for an
  update or correction (unless the editor ticks it again on purpose).
- One alert per story, in the reader's language only. Never send both.
- No alerts between 21:00 and 07:00 Montréal time. Hold them for the
  morning.

## Order of work
1. Privacy page (EN/FR), then VAPID keys generated and stored.
2. n8n: Data Tables, subscribe/unsubscribe webhooks, sender workflow
   (dry-run mode that logs instead of sending).
3. Site: `sw.js` handlers + the alerts sheet, tested on Android Chrome and on
   a real iPhone with the app installed. Check the iOS Simulator before
   relying on it for push.
4. Notion properties, then the first real alert on the next Council Watch.

## Decisions for the editor
1. Topics: are Council Watch / Bylaws / Public notices the right three, or
   should investigations and editorials be their own topics?
2. Automatic or ticked: should every Council Watch recap alert
   automatically, or does every alert need 🔔 ticked? (The plan assumes
   ticked.)
