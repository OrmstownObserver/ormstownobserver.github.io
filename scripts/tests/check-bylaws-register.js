// Run: node scripts/tests/check-bylaws-register.js
// Boots bylaws-register.js unmodified under the ledger's DOM shim, against
// the REAL hub pages and the REAL published snapshot (plus a synthetic v2
// record set), and asserts what it renders. Exit 0 = pass, 1 = failure.
//
// Covers: the snapshot/renderer schema, date semantics (an "In force" cell
// never shows the adoption date), missing-data labels, French localisation,
// URL safety, search/filter/reset/deep links, the failed-load fallback, and
// a static check that no stylesheet rule hides status or dates at any width.
// What it cannot check — layout, contrast, touch — is covered by screenshots.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { document, mountFromHTML } = require('../../finances/tests/dom-shim.js');

const ROOT = path.join(__dirname, '..', '..');
const SNAPSHOT = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist', 'bylaws.json'), 'utf8'));
const SRC = fs.readFileSync(path.join(ROOT, 'bylaws-register.js'), 'utf8');
const CSS = fs.readFileSync(path.join(ROOT, 'bylaws-register.css'), 'utf8');
// Static scans read code, not the comments that document the rules.
const SRC_CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const CSS_CODE = CSS.replace(/\/\*[\s\S]*?\*\//g, '');

let failures = 0;
const fail = (m) => { failures++; console.error('FAIL  ' + m); };
const ok = (m) => console.log('ok    ' + m);
const check = (cond, m) => (cond ? ok(m) : fail(m));
const eq = (got, want, m) => (got === want ? ok(m) : fail(`${m}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`));
const tick = () => new Promise((r) => setTimeout(r, 0));
const settle = async () => { for (let i = 0; i < 6; i++) await tick(); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------- boot one page in a fresh context ---------- */
async function boot(langPath, data, opts) {
  opts = opts || {};
  const page = path.join(ROOT, langPath.replace(/^\//, ''), 'index.html');
  mountFromHTML(page);
  const pathname = langPath;
  const win = {
    document,
    location: { pathname, search: opts.search || '', hash: opts.hash || '' },
    history: {
      pushes: 0,
      pushState(_s, _t, url) { this.pushes++; apply(url); },
      replaceState(_s, _t, url) { apply(url); }
    },
    addEventListener(t, fn) { (win._on = win._on || {})[t] = fn; },
    setTimeout, clearTimeout, URLSearchParams, Promise, JSON, Math, Array, Object, String, Number, console,
    fetch: () => (opts.fail
      ? Promise.reject(new Error('offline'))
      : Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(JSON.parse(JSON.stringify(data))) }))
  };
  function apply(url) {
    const q = url.indexOf('?'), h = url.indexOf('#');
    win.location.search = q >= 0 ? url.slice(q, h >= 0 ? h : undefined) : '';
    win.location.hash = h >= 0 ? url.slice(h) : '';
  }
  win.window = win;
  document.defaultView = win;
  vm.runInContext(SRC, vm.createContext(win), { filename: 'bylaws-register.js' });
  await settle();
  return win;
}
const $ = (id) => document.getElementById(id);
const all = (pred) => document.body.find(pred);
const cls = (n, c) => n.classList && n.classList.contains(c);
const cards = () => all((n) => n.tagName === 'ARTICLE' && cls(n, 'bylaw') && n.parentNode === $('bylaw-list'));
const card = (slug) => all((n) => n.tagName === 'ARTICLE' && n.getAttribute('id') === 'r-' + slug)[0];
const dd = (art, label) => {
  const dt = art.find((n) => n.tagName === 'DT' && n.textContent.replace(/\s*:$/, '').replace(/ :$/, '') === label)[0];
  if (!dt) return null;
  const row = dt.parentNode;
  return row.children.filter((c) => c.tagName === 'DD')[0];
};
const statusText = (art) => (art.find((n) => n.tagName === 'SPAN' && cls(n, 'status'))[0] || { textContent: '' }).textContent;
const links = (art) => art.find((n) => n.tagName === 'A');
const btns = (id) => ($(id) ? $(id).children.filter((c) => c.tagName === 'BUTTON') : []);
const typeSearch = async (win, v) => { const s = $('search'); s.value = v; s.dispatch('input'); await wait(160); await settle(); };

const CURRENT = SNAPSHOT.records.filter((r) => r.status === 'In force' || r.status === 'Amended').length;
const TOTAL = SNAPSHOT.records.length;

/* A small v2 set exercising every field the exporter can emit. */
const V2 = {
  version: 2, generated_at: '2026-10-10T12:00:00Z',
  records: [
    { bylaw_number: 'Règlement 900-2026', title_en: 'Test Animals Bylaw', title_fr: 'Règlement test sur les animaux', status: 'In force',
      category: 'Other', topics: ['Animals'], adopted_date: '2026-04-13', in_force_date: '2026-04-17', amended_date: null,
      enforced_by: 'Fire service', fines: '$300–$2,000', official_url: 'https://www.ormstown.ca/a.pdf',
      key_facts_en: ['Licence required (art. 14)'], key_facts_fr: ['Licence obligatoire (art. 14)'],
      summary_en: 'English summary.', summary_fr: 'Résumé français.', amends: ['Règlement 900-2020'], amended_by: [],
      explainer: { en: '/en/bylaws-regulations/x/', fr: '/fr/bylaws-regulations/x/' } },
    { bylaw_number: 'Règlement 900-2020', title_en: 'Old test bylaw', status: 'Repealed', topics: ['Animals'],
      in_force_date: '2011', amended_by: ['Règlement 900-2026'], official_url: 'http://www.ormstown.ca/insecure.pdf' },
    { bylaw_number: 'Projet de règlement 901.1-2026', title_en: 'Test draft', title_fr: 'Projet test', status: 'Draft',
      next_step: 'Adoption of second draft', next_step_date: '2026-11-02', official_url: 'https://evil.example/a.pdf',
      explainer: { en: 'javascript:alert(1)', fr: 'https://evil.example/' } },
    { bylaw_number: 'Règlement 902-2018' },
    { bylaw_number: 'Règlement 903-2015', status: 'Superseded?', key_facts_en: ['Only in English'] }
  ]
};

(async function main() {
  /* ---------- static: safe rendering + CSS never hides status/dates ---------- */
  check(!/\binnerHTML\b|outerHTML\s*=|insertAdjacentHTML|document\.write/.test(SRC_CODE), 'renderer builds DOM with textContent only (no innerHTML)');
  {
    const offenders = [];
    for (const m of CSS_CODE.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const sel = m[1], body = m[2];
      if (/(display\s*:\s*none|visibility\s*:\s*hidden)/.test(body) &&
          /\.(status|bylaw-dates|bylaw-head|bylaw-num)\b/.test(sel) && !/\[hidden\]|@media print/.test(sel)) offenders.push(sel.trim());
    }
    check(!offenders.length, 'no stylesheet rule hides status, number or dates at any width' + (offenders.length ? ': ' + offenders.join(' | ') : ''));
    check(!/var\(--(muted|ink-light|border)\)/.test(CSS_CODE), 'register CSS avoids the three tokens observer-header.js pins light');
  }

  /* ---------- EN, real snapshot ---------- */
  let win = await boot('/en/bylaws-regulations/', SNAPSHOT);
  eq($('register-shell').getAttribute('data-state'), 'live', 'EN: snapshot loads and the shell goes live');
  eq(cards().length, CURRENT, `EN: default view is current law (${CURRENT} In force + Amended)`);
  check(cards().every((a) => statusText(a).trim().length > 0), 'EN: every card carries a status label');
  check(cards().every((a) => dd(a, 'Adopted') && dd(a, 'In force') && dd(a, 'Last amended')), 'EN: every card has Adopted, In force and Last amended rows');
  {
    const snapRec = SNAPSHOT.records.find((r) => r.bylaw_number === 'Règlement 131-2026');
    const a = card('131-2026');
    check(!!a, 'EN: 131-2026 card exists with a stable id');
    eq(dd(a, 'Adopted').textContent, 'Apr. 13, 2026', 'EN: Adopted shows adopted_date');
    if (!snapRec.in_force_date) {
      eq(dd(a, 'In force').textContent, 'Not recorded', 'EN: In force is "Not recorded" when the snapshot has no in-force date (never the adoption date)');
      check(cls(dd(a, 'In force'), 'missing'), 'EN: a missing date is styled as missing');
    }
    const l = links(a).map((n) => n.getAttribute('href'));
    check(l.includes(snapRec.official_url), 'EN: official link uses the snapshot URL');
    check(l.includes(snapRec.explainer.en), 'EN: explainer link is separate and same-site');
    const off = links(a).find((n) => cls(n, 'lk-official'));
    eq(off.getAttribute('rel'), 'noopener', 'EN: official link opens with rel=noopener');
  }
  {
    const cov = card('167-1-2026');
    const ex = cov && links(cov).find((n) => cls(n, 'lk-explainer'));
    eq(ex && ex.textContent, 'Observer coverage', 'EN: a Council Watch link is labelled coverage, not explainer');
  }
  // counts on the controls agree with the data
  const segs = btns('status-filter');
  check(segs.length >= 4, 'EN: status control renders its segments');
  check(segs[0].textContent.indexOf(String(CURRENT)) >= 0, 'EN: Current-law segment shows its count');
  eq(btns('topics').length, 10, 'EN: "I want to…" grid has ten topics');

  // status filters
  segs[segs.length - 1].click(); await settle();
  eq(cards().length, TOTAL, 'EN: "All" shows every record');
  eq(win.location.search, '?status=all', 'EN: status is reflected in the URL');
  check(!$('repealed-note').hidden, 'EN: the repealed-is-history note shows when repealed bylaws are listed');
  btns('status-filter')[2].click(); await settle();
  check(cards().length > 0 && cards().every((a) => statusText(a) === 'Repealed'), 'EN: Repealed segment lists only repealed bylaws');

  // search
  btns('status-filter')[0].click(); await settle();
  await typeSearch(win, '131-2026');
  check(cards().some((a) => a.getAttribute('id') === 'r-131-2026'), 'EN: search by number finds 131-2026');
  await typeSearch(win, 'chiens dangereux');
  check(cards().some((a) => a.getAttribute('id') === 'r-131-2026'), 'EN: search matches French title words');
  await typeSearch(win, 'reglement 131');
  check(cards().some((a) => a.getAttribute('id') === 'r-131-2026'), 'EN: search is accent-insensitive');
  check(!$('reset').hidden, 'EN: reset appears once anything is filtered');
  await typeSearch(win, 'zzzzqqq');
  eq(cards().length, 0, 'EN: nonsense query yields no cards');
  check(!$('no-results').hidden, 'EN: empty state is shown');
  const emptyBtns = $('no-results').find((n) => n.tagName === 'BUTTON');
  check(emptyBtns.length >= 1, 'EN: empty state offers a way out');
  emptyBtns[emptyBtns.length - 1].click(); await settle();
  eq(cards().length, CURRENT, 'EN: reset from the empty state restores the default view');
  eq(win.location.search, '', 'EN: reset clears the URL');
  check($('reset').hidden, 'EN: reset hides again at the default view');

  // repeated topic toggling is idempotent
  const animals = () => btns('topics').find((b) => /animals/i.test(b.textContent));
  animals().click(); await settle();
  const nAnimals = cards().length;
  check(nAnimals > 0 && nAnimals < CURRENT, 'EN: a topic narrows the list');
  eq(animals().getAttribute('aria-pressed'), 'true', 'EN: the active topic is pressed');
  animals().click(); await settle(); animals().click(); await settle();
  eq(cards().length, nAnimals, 'EN: toggling a topic off and on again gives the same result');
  animals().click(); await settle();
  eq(cards().length, CURRENT, 'EN: toggling the topic off restores the list');

  // keyboard focus survives the re-render a click causes
  {
    const b = animals();
    b.focus(); b.click(); await settle();
    const a = document.activeElement;
    eq(a && a.getAttribute('data-k'), 'topic-animals', 'EN: focus stays on the topic button after it re-renders');
    a.click(); await settle();
    const st = btns('status-filter')[2];
    st.focus(); st.click(); await settle();
    eq(document.activeElement && document.activeElement.getAttribute('data-k'), 'status-repealed', 'EN: focus stays on the status button after it re-renders');
    btns('status-filter')[0].click(); await settle();
  }

  // every example in the search placeholder actually finds something
  for (const [lg, page] of [['en', '/en/bylaws-regulations/'], ['fr', '/fr/bylaws-regulations/']]) {
    win = await boot(page, SNAPSHOT);
    const ph = $('search').getAttribute('placeholder').replace(/^(e\.g\.|ex\.)\s*/, '');
    for (const ex of ph.split(',').map((x) => x.trim()).filter(Boolean)) {
      await typeSearch(win, ex);
      check(cards().length > 0, `${lg}: placeholder example "${ex}" returns at least one current bylaw`);
    }
  }
  win = await boot('/en/bylaws-regulations/', SNAPSHOT);

  // Back/Forward
  const pushes = win.history.pushes;
  btns('status-filter')[2].click(); await settle();
  check(win.history.pushes === pushes + 1, 'EN: a filter click pushes a history entry');
  win.location.search = ''; win._on.popstate(); await settle();
  eq(cards().length, CURRENT, 'EN: Back (popstate) restores the earlier result set');

  // deep link to a repealed bylaw widens the filter
  const repealed = SNAPSHOT.records.find((r) => r.status === 'Repealed');
  const slug = repealed.bylaw_number.replace(/^Règlement\s+/, '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  win = await boot('/en/bylaws-regulations/', SNAPSHOT, { hash: '#r-' + slug });
  check(!!card(slug), 'EN: a #r- deep link to a repealed bylaw resolves (filter widens)');

  // legacy/bad params degrade to the default view
  win = await boot('/en/bylaws-regulations/', SNAPSHOT, { search: '?status=nonsense&topic=nope&category=evil' });
  eq(cards().length, CURRENT, 'EN: unknown URL params fall back to the default view');

  /* ---------- FR, real snapshot ---------- */
  win = await boot('/fr/bylaws-regulations/', SNAPSHOT);
  {
    const a = card('131-2026');
    eq(statusText(a), 'En vigueur', 'FR: status is translated');
    eq(dd(a, 'Adopté').textContent, '13 avr. 2026', 'FR: dates are formatted in French');
    eq(dd(a, 'En vigueur').textContent, 'Non consigné', 'FR: missing in-force date is labelled in French');
    const catDd = dd(a, 'Catégorie');
    eq(catDd && catDd.textContent, 'Autre', 'FR: category is translated');
    const topDd = dd(a, 'Sujets');
    eq(topDd && topDd.textContent, 'Animaux', 'FR: topic tags are translated');
    const ul = a.find((n) => n.tagName === 'UL')[0];
    eq(ul && ul.getAttribute('lang'), 'en', 'FR: English-only key facts are tagged lang="en"');
    check(a.find((n) => cls(n, 'otherlang')).length === 1, 'FR: and say plainly that they are not yet translated');
    const ex = links(a).find((n) => cls(n, 'lk-explainer'));
    eq(ex && ex.getAttribute('href'), '/fr/bylaws-regulations/reglement-animaux-131-2026/', 'FR: explainer link points at the French article');
    check(cards().every((c) => !/In force|Repealed|Draft/.test(statusText(c))), 'FR: no English status labels on the French page');
    check(btns('topics').every((b) => !/Build|Keep|Park|Follow/.test(b.textContent)), 'FR: topic grid is in French');
  }

  /* ---------- v2 fields (what a future export carries) ---------- */
  win = await boot('/en/bylaws-regulations/', V2, { search: '?status=all' });
  {
    const a = card('900-2026');
    eq(dd(a, 'In force').textContent, 'Apr. 17, 2026', 'v2: In force shows in_force_date, not adopted_date');
    eq(dd(a, 'Adopted').textContent, 'Apr. 13, 2026', 'v2: Adopted shows adopted_date');
    check(links(a).some((n) => n.getAttribute('href') === '#r-900-2020'), 'v2: "Amends" links to the older bylaw card');
    eq(dd(card('900-2020'), 'In force').textContent, '2011', 'v2: a year-only date shows as the year');
    eq(dd(card('900-2020'), 'Last amended').textContent, 'Not recorded', 'v2: amended-by present means "Not recorded", never "None recorded"');
    check(!links(card('900-2020')).some((n) => cls(n, 'lk-official')), 'v2: an http:// official URL is not linked');
    const d = card('projet-de-reglement-901-1-2026');
    check(!links(d).some((n) => cls(n, 'lk-official') || cls(n, 'lk-explainer')), 'v2: off-host official URL and javascript: explainer are not linked');
    eq(dd(d, 'Adopted').textContent, 'Not adopted', 'v2: a draft reads "Not adopted", not "Not recorded"');
    check(d.textContent.indexOf('Adoption of second draft') >= 0, 'v2: draft shows its recorded next step');
    const bare = card('902-2018');
    eq(statusText(bare), 'Status not verified', 'v2: a blank status is shown as not verified');
    eq(dd(bare, 'Adopted').textContent, 'Not recorded', 'v2: bare record labels every gap');
    check(bare.textContent.indexOf('No official link recorded yet') >= 0, 'v2: bare record says it has no official link');
    eq(statusText(card('903-2015')), 'Status not verified', 'v2: an unknown status is never shown as in force');
    check(btns('status-filter').some((b) => /not verified/i.test(b.textContent)), 'v2: an unverified segment appears when such records exist');
    check(!$('drafts').hidden && $('drafts-list').children.length === 1, 'v2: the draft tracker lists the one draft');
  }
  win = await boot('/fr/bylaws-regulations/', V2, { search: '?status=all' });
  {
    const a = card('900-2026');
    eq(a.find((n) => cls(n, 'bylaw-summary'))[0].textContent, 'Résumé français.', 'v2 FR: French summary is used');
    eq(dd(a, 'Appliqué par').textContent, 'Service de sécurité incendie', 'v2 FR: enforcer is translated');
    check(!a.find((n) => n.tagName === 'UL')[0].getAttribute('lang'), 'v2 FR: French key facts carry no foreign-language tag');
  }

  /* ---------- failed load ---------- */
  win = await boot('/en/bylaws-regulations/', null, { fail: true });
  eq($('register-shell').getAttribute('data-state'), 'fallback', 'offline: shell switches to the fallback state');
  check(!$('fallback-note').hidden && $('fallback-note').textContent.length > 0, 'offline: the reader is told the full register did not load');
  win = await boot('/en/bylaws-regulations/', { records: 'nope' });
  eq($('register-shell').getAttribute('data-state'), 'fallback', 'bad JSON shape: falls back instead of rendering nothing');
  win = await boot('/en/bylaws-regulations/', { bylaws: SNAPSHOT.records });
  eq($('register-shell').getAttribute('data-state'), 'fallback', 'the old exporter key `bylaws` is rejected, not half-rendered');

  /* ---------- static fallback markup in both pages ---------- */
  for (const lg of ['en', 'fr']) {
    const html = fs.readFileSync(path.join(ROOT, lg, 'bylaws-regulations', 'index.html'), 'utf8');
    const explainers = SNAPSHOT.records.filter((r) => r.explainer && r.explainer[lg]).map((r) => r.explainer[lg]);
    const missing = explainers.filter((href) => html.indexOf('href="' + href + '"') < 0);
    check(!missing.length, `${lg}: every explainer in the snapshot also has a no-JS fallback card` + (missing.length ? ': ' + missing.join(', ') : ''));
    check(/<link rel="stylesheet" href="\/observer\.css">/.test(html) && html.indexOf("localStorage.getItem('observerTheme')") > 0, `${lg}: page is on observer.css with the pre-paint theme script`);
    check(!/\sdata-(en|fr)[=\s>]/.test(html), `${lg}: no data-en/data-fr attributes (observer-header.js would hide them)`);
  }

  console.log(failures ? `\n${failures} check(s) failed.` : '\nAll bylaw register checks passed.');
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
