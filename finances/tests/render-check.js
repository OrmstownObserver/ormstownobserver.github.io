// Run: node finances/tests/render-check.js
// Boots the whole v2 workspace under the DOM shim and asserts what it
// actually renders. Exit 0 = pass, 1 = failure.
//
// This is the workspace's stand-in for a browser: it runs ledger-data.js,
// ledger-charts.js, ledger-views.js and ledger-app.js unmodified, drives
// them through real interactions (search, filter, sort, tab, profile,
// language, back), and checks the rendered DOM. What it CANNOT check is
// visual layout, dark-mode contrast and real touch targets - those stay
// manual, on a real device.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { document, mountFromHTML } = require('./dom-shim.js');

const dir = path.join(__dirname, '..');
const V2 = dir;
let failures = 0;
const fail = (m) => { failures++; console.error('FAIL  ' + m); };
const ok = (m) => console.log('ok    ' + m);
const eq = (got, want, m) => { if (got !== want) fail(`${m}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); else ok(m); };

mountFromHTML(path.join(V2, 'index.html'));
// observer-header.js injects the masthead at runtime and is not loaded here,
// so stand in for the two controls the workspace reaches into.
for (const [id, lang] of [['obs-btn-en', 'en'], ['obs-btn-fr', 'fr']]) {
  const b = document.createElement('button');
  b.setAttribute('id', id);
  b.setAttribute('aria-pressed', 'false');
  b.setAttribute('lang', lang);
  document.body.appendChild(b);
  document._byId[id] = b;
}
const payments = JSON.parse(fs.readFileSync(path.join(dir, 'payments.json'), 'utf8'));

/* ---------- browser stubs ---------- */
const store = {};
const win = {
  document,
  navigator: { language: 'fr-CA', clipboard: null },
  localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
  location: { pathname: '/finances/', search: '', hash: '', origin: 'http://localhost:8000', href: 'http://localhost:8000/finances/', replace(u) { this.href = u; } },
  history: {
    _stack: [],
    pushState(_s, _t, url) { this._stack.push(url); win.location.search = url.slice(url.indexOf('?')); },
    replaceState(_s, _t, url) { win.location.search = url.slice(url.indexOf('?')); }
  },
  matchMedia: (q) => ({ matches: false, media: q, addEventListener() {}, addListener() {} }),
  MutationObserver: class { observe() {} disconnect() {} },
  getComputedStyle: () => ({ getPropertyValue: () => '' }),
  requestAnimationFrame: (fn) => setTimeout(fn, 0),
  setTimeout, clearTimeout, Promise, URLSearchParams, Intl, Math, JSON, Date, isFinite, Number, String, Object, Array, console,
  confirm: () => true,
  URL: { createObjectURL: () => 'blob:x', revokeObjectURL() {} },
  Blob: class { constructor(p) { this.parts = p; } },
  addEventListener(t, fn) { (win._on = win._on || {})[t] = fn; },
  fetch: (u) => Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(payments), _u: u })
};
win.window = win;
win.self = win;
document.defaultView = win;

const ctxv = vm.createContext(win);
const run = (p) => vm.runInContext(fs.readFileSync(p, 'utf8'), ctxv, { filename: p });
run(path.join(dir, 'spending-data.js'));
run(path.join(dir, 'i18n.js'));
run(path.join(dir, 'ledger-context.js'));
run(path.join(dir, 'ledger-disclosures.js'));
run(path.join(dir, 'ledger-lexicon.js'));
run(path.join(V2, 'ledger-data.js'));
run(path.join(V2, 'ledger-charts.js'));
run(path.join(V2, 'ledger-views.js'));
run(path.join(V2, 'ledger-app.js'));

const $ = (id) => document.getElementById(id);
const rowsIn = (id) => {
  const t = $(id) ? null : null; void t;
  const table = document.body.find((n) => n.getAttribute && n.getAttribute('id') === id)[0];
  if (!table) return [];
  const tb = table.find((n) => n.tagName === 'TBODY')[0];
  return tb ? tb.children.filter((c) => c.tagName === 'TR') : [];
};
const panel = (name) => $('panel-' + name);
const textOf = (n) => (n ? n.textContent : '');
const money = (s) => Number(String(s).replace(/[^0-9.,-]/g, '').replace(/\s/g, '').replace(/,/g, ''));

/* ---------- let boot's fetch promise settle ---------- */
const tick = () => new Promise((r) => setTimeout(r, 0));

(async function main() {
  await tick(); await tick(); await tick();

  // ---- 1. it booted into the DEFAULT view: Categories, current year
  const L = win.OO_LEDGER;
  if (!win.OO_LEDGER_VIEWS) { fail('views never loaded'); process.exit(1); }
  if (panel('categories').hidden) fail('the default view is not Categories');
  else ok('the default view is Categories');
  if ($('tab-categories').getAttribute('aria-selected') !== 'true') fail('the Categories tab is not selected on load');
  if (!panel('payments') || !panel('payments').hidden) fail('Payments is not hidden on load');
  else ok('Payments is one tab away, not the landing view');

  // tab order, left to right: overview -> raw record
  {
    const order = document.body.find((n) => n.getAttribute && n.getAttribute('role') === 'tab')
      .map((n) => n.getAttribute('data-tab'));
    eq(order.join(' '), 'categories sittings payees payments disclosures', 'tabs run Categories, Sittings, Suppliers, Payments, Disclosures');
  }

  // ---- 2. default scope is the most recent year in the data, and "All"
  // widens. The default must never be a hardcoded year.
  {
    const years = [...new Set(win.OO_SPENDING.months.map((m) => m.m.slice(0, 4)))].sort();
    const latest = years[years.length - 1];
    if (!win.location.search.includes('scope=')) ok(`the default year (${latest}) is implied, not written into the URL`);
    const chips = textOf($('chips'));
    if (!chips.includes(latest)) fail(`the active-filter chips do not show the default year: "${chips}"`);
    else ok(`the default year ${latest} is visible as a removable chip, so the reader can see and widen it`);

    const scopedStatus = textOf($('results-status'));
    if (/15[\s  ]?559[\s  ]?623/.test(scopedStatus)) fail('the default view shows the all-years total, not the current year');
    else ok('the default view is scoped to the current year, not all years: ' + scopedStatus.slice(0, 50));

    // the header status line still describes the WHOLE dataset
    const head = textOf($('status'));
    if (!/4[\s  ]?439/.test(head)) fail('the page head no longer states the full dataset: ' + head);
    else ok('the page head still states the whole dataset (4,439 lines, 20 sittings)');
  }

  // ---- 3. the rail is populated (it lists every sitting and category,
  // whatever the current scope is)
  eq(rowsChildren('sitting-list'), 22, 'sitting checklist lists 20 sittings under 2 year headings');
  eq(rowsChildren('category-list'), 14, 'category checklist lists all 14 used categories');
  if ($('q')) fail('the rail still has a search box (#q) — the query bar at the top is the only one');
  else ok('the rail has no search box of its own');
  if (!textOf($('door-help'))) fail('the query bar has no help text');
  else ok('the query bar explains what plain words it understands');

  // ---- 3b. from here on, the payments assertions need the Payments tab.
  // The year is the only timeframe: a legacy ?scope=all resolves to the
  // latest year (2026: 1,769 lines, $5,438,482.77), never to every year.
  navigateTo('?lang=fr&tab=payments&scope=all');
  await tick();
  eq(rowsIn('payments-table').length, 150, 'Payments renders the 150-row first page, not all 1,769');
  {
    const status = textOf($('results-status'));
    if (!/1\s?769/.test(status.replace(/[\u00a0\u202f]/g, ' '))) fail('status line does not report the year\'s 1,769 lines: ' + status);
    else ok('legacy ?scope=all resolves to the latest year: 1,769 lines');
    if (!/5[\s\u00a0\u202f]?438[\s\u00a0\u202f]?482/.test(status)) fail('status line total is not the year\'s itemized total: ' + status);
    else ok('status line total is the year\'s itemized total');
    if ($('scope-group').find((n) => n.tagName === 'BUTTON').some((b) => /all|toutes/i.test(b.textContent))) fail('the year selector still offers an "all years" pill');
    else ok('the year selector offers no "all years" pill');
  }

  // ---- 4. a hidden payee is reachable by search - the whole point.
  // "petro" is a lexicon supplier now, so it narrows by slug; the free-text
  // path is exercised in 4b with a word the lexicon does not know.
  const q = $('door-q');
  q.value = 'petro';
  $('door-form').dispatch('submit');
  await tick();
  const petroRows = rowsIn('payments-table');
  const petroStatus = textOf($('results-status'));
  // 311, not the 310 a text search found: the supplier filter also takes the
  // one line billed under the bare numbered company, with no trade name.
  if (!/311/.test(petroStatus)) fail('"petro" did not reach all 311 lines of 2026: ' + petroStatus);
  else ok('"petro" reaches all 311 lines of a payee whose name never says "Petro", one more than text search did');
  eq(petroRows.length, 150, 'the search result set is still paged at 150 rows');
  const firstPayee = textOf(petroRows[0].children[0]);
  if (!/9534-8702/.test(firstPayee)) fail('first petro row is not the Petro-Canada payee: ' + firstPayee);
  else ok('the trade name resolves to its canonical payee');
  if (!petroRows.some((r) => /Petro-Canada/.test(textOf(r.children[1])))) fail('no trade-name chip rendered');
  else ok('the trade-name prefix is kept as a chip, not discarded');

  // ---- 4b. free text still reaches the line descriptions
  q.value = 'déneigement';
  $('door-form').dispatch('submit');
  await tick();
  if (!rowsIn('payments-table').length) fail('free-text search "déneigement" found nothing');
  else ok(`free-text search still reaches line descriptions (${rowsIn('payments-table').length} rows for "déneigement")`);
  if (!/Recherche/.test(textOf($('chips')))) fail('a free-text search shows no search chip');
  else ok('a free-text search is shown as a chip under the bar');

  // ---- 5. clearing the bar restores everything
  $('door-clear').click();
  await tick();
  navigateTo('?lang=fr&tab=payments&scope=all');
  await tick();
  eq(rowsIn('payments-table').length, 150, 'clearing the bar restores the full result set');

  // ---- 5b. THE QUERY BAR: plain words become chips and an answer line.
  // Each case is driven through the box exactly as a reader types it.
  {
    const parse = win.OO_LEDGER_APP.parseAsk;
    const ask = async (text, lang) => {
      navigateTo('?lang=' + (lang || 'en'));
      await tick();
      $('door-q').value = text;
      $('door-form').dispatch('submit');
      await tick();
      return { chips: textOf($('chips')), answer: textOf($('answer')), search: win.location.search, rows: rowsIn('payments-table').length };
    };
    let r = await ask('gas june 2025', 'en');
    if (!/category=vehicle-fuel-maintenance/.test(r.search) || !/sitting=2025-06/.test(r.search)) fail('"gas june 2025" did not resolve to the fuel category on the June 2025 list: ' + r.search);
    else ok('"gas june 2025" → fuel category + the June 2025 sitting, both as explicit URL params');
    if (/[?&]q=/.test(r.search)) fail('"gas june 2025" left words in the free-text search: ' + r.search);
    else ok('"gas june 2025" leaves no free text behind');
    if (!/Vehicle fuel/.test(r.chips) || !/Sitting/.test(r.chips)) fail('chips do not show the category and the sitting: ' + r.chips);
    else ok('the chips under the bar name the category and the sitting');
    if (!/\$[\d,]+\.\d\d on Vehicle fuel & maintenance on the June 2, 2025 list: \d+ lines, \d+ suppliers\./.test(r.answer)) fail('EN answer line is not "$X on <category> on the <date> list: N lines, M suppliers.": ' + r.answer);
    else ok('EN answer line: ' + r.answer.slice(0, 90));
    if (!/previous month/.test(r.answer)) fail('the answer line does not say a list mostly pays the previous month\'s invoices');
    else ok('the answer line carries the previous-month note');
    if (!r.rows) fail('"gas june 2025" rendered no rows');
    if (/[?&]ask=/.test(r.search)) fail('the address still carries ?ask= after parsing');
    else ok('the address is normalised to explicit params, never ?ask=');

    const r2 = await ask('essence juin 2025', 'fr');
    if (r2.search.replace('lang=fr', 'lang=en') !== r.search) fail(`FR "essence juin 2025" (${r2.search}) differs from EN "gas june 2025" (${r.search})`);
    else ok('"essence juin 2025" resolves to exactly the same view as "gas june 2025"');
    if (!/Carburant et entretien des véhicules à la liste du 2 juin 2025 : \d+ lignes, \d+ fournisseurs\./.test(r2.answer)) fail('FR answer line: ' + r2.answer);
    else ok('FR answer line: ' + r2.answer.slice(0, 90));
    if (!/mois précédent/.test(r2.answer)) fail('FR answer line lacks the previous-month note');

    r = await ask('dunton', 'en');
    if (!/supplier=/.test(r.search)) fail('"dunton" did not become a supplier filter: ' + r.search);
    else ok('"dunton" → a supplier filter over every spelling of the name: ' + decodeURIComponent(r.search).slice(0, 110));
    if (!/Supplier: Dunton Rainville/.test(r.chips)) fail('no single "Supplier: Dunton Rainville" chip: ' + r.chips);
    else ok('three slugs, one chip: "Supplier: Dunton Rainville"');
    if (!r.rows) fail('"dunton" rendered no rows');
    else ok(`"dunton" renders ${r.rows} rows`);
    if (!/to Dunton Rainville in 2026/.test(r.answer)) fail('"dunton" answer line: ' + r.answer);
    else ok('"dunton" answer: ' + r.answer.slice(0, 80));
    const cnt = rowsIn('payments-table');
    if (cnt.some((tr) => !/dunton/i.test(textOf(tr.children[0])))) fail('a non-Dunton row is in the Dunton result');
    else ok('every row of the supplier filter is a Dunton Rainville line');

    r = await ask('over 25000 2026', 'en');
    if (!/min=25000/.test(r.search) || /scope=/.test(r.search)) fail('"over 25000 2026" did not resolve to min=25000 in the default year: ' + r.search);
    else ok('"over 25000 2026" → $25,000 and up, 2026 as the frame');
    if (!/\$25,000\.00 and up/.test(r.chips)) fail('no amount chip: ' + r.chips);
    r = await ask('plus de 25 000 $ en 2025', 'fr');
    if (!/min=25000/.test(r.search) || !/scope=2025/.test(r.search)) fail('"plus de 25 000 $ en 2025" → ' + r.search);
    else ok('"plus de 25 000 $ en 2025" → 25 000 $ et plus, en 2025 (spaces and $ understood)');

    r = await ask('last sitting', 'en');
    if (!/sitting=2026-08/.test(r.search)) fail('"last sitting" is not the August 2026 list: ' + r.search);
    else ok('"last sitting" → the latest itemized sitting');
    r = await ask('dernière séance', 'fr');
    if (!/sitting=2026-08/.test(r.search)) fail('"dernière séance" is not the August 2026 list: ' + r.search);
    else ok('"dernière séance" → the same');

    // month without a year → the latest year that has that sitting
    r = await ask('september', 'en');
    if (!/sitting=2025-09/.test(r.search)) fail('"september" (no 2026 list yet) did not fall back to 2025-09: ' + r.search);
    else ok('"september" alone → September 2025, the latest year with that list');
    // month + year with no list → the year, and a note
    r = await ask('september 2026', 'en');
    if (/sitting=/.test(r.search)) fail('"september 2026" invented a sitting: ' + r.search);
    else if (!/No September 2026 list/.test(r.answer)) fail('"september 2026" does not explain the missing list: ' + r.answer);
    else ok('"september 2026" → the 2026 frame with a note that no such list exists yet');

    // a full sentence: stop words vanish, the rest is parsed
    r = await ask('how much did the Town spend on lawyers in March 2026', 'en');
    if (!/category=legal-services/.test(r.search) || !/sitting=2026-03/.test(r.search) || /[?&]q=/.test(r.search)) fail('the sentence did not parse clean: ' + r.search);
    else ok('"how much did the Town spend on lawyers in March 2026" → legal services, March 2026 list, no leftovers');

    // nonsense: exactly today's text search
    r = await ask('zorblax quux', 'en');
    if (!/q=zorblax\+quux/.test(r.search) || /category=|sitting=|supplier=|min=|max=/.test(r.search)) fail('a nonsense query did not fall back to plain text search: ' + r.search);
    else ok('a nonsense query falls back to the plain text search: ' + r.search);
    if (!/matching “zorblax quux”/.test(r.answer)) fail('the answer line for a text search: ' + r.answer);
    else ok('a text search still gets an answer line (0 lines, honestly)');

    // the parser is pure: same words, same result, no store needed
    const p1 = parse('Essence JUIN 2025'), p2 = parse('essence juin 2025');
    delete p1.text; delete p2.text;
    eq(JSON.stringify(p1), JSON.stringify(p2), 'the parser ignores case and accents');
    eq(parse('').matched, false, 'an empty question matches nothing');

    // ?ask= in a link reproduces the parsed state
    navigateTo('?lang=en&ask=' + encodeURIComponent('gas june 2025'));
    await tick();
    if (!/Vehicle fuel/.test(textOf($('chips'))) || !/Sitting/.test(textOf($('chips')))) fail('?ask= link did not reproduce the parsed state: ' + textOf($('chips')));
    else ok('a ?ask= link reproduces the parsed state (boot then normalises the address to explicit params)');
  }

  // ---- 6. sorting
  clickSort('payments-table', 4);            // Amount
  await tick();
  let rows = rowsIn('payments-table');
  let a0 = money(textOf(rows[0].children[4])), a1 = money(textOf(rows[1].children[4]));
  if (!(a0 <= a1)) fail(`amount:asc is not ascending (${a0} then ${a1})`);
  else ok('clicking the Amount header flips to ascending');
  clickSort('payments-table', 0);            // Payee
  await tick();
  rows = rowsIn('payments-table');
  ok(`sorting by payee renders (first: ${textOf(rows[0].children[0]).slice(0, 40)})`);

  // ---- 7. reset restores the default sort target and clears filters
  $('reset').click();
  await tick();
  if (!textOf($('chips')).includes('2026')) fail('reset did not return to the default year');
  else ok('reset returns to the default year rather than to every year');
  navigateTo('?lang=fr&tab=payments&scope=all');
  await tick();
  eq(rowsIn('payments-table').length, 150, 'reset restores the unfiltered view');

  // ---- 8. amount filter + credits
  win.OO_LEDGER; // noop
  const chips = $('amount-chips').children;
  chips[3].click();                          // "Credits only"
  await tick();
  const creditRows = rowsIn('payments-table');
  eq(creditRows.length, 20, 'the Credits-only chip finds all 20 negative lines of 2026');
  if (!/credit|crédit/i.test(textOf(creditRows[0]))) fail('a negative line is not tagged as a credit');
  else ok('negative lines are tagged as credits');
  chips[3].click();
  await tick();

  // ---- 9. tabs
  for (const tab of ['payees', 'categories', 'sittings', 'disclosures', 'payments']) {
    $('tab-' + tab).click();
    await tick();
    if (panel(tab).hidden) fail(`the ${tab} panel is still hidden after selecting its tab`);
    if ($('tab-' + tab).getAttribute('aria-selected') !== 'true') fail(`tab-${tab} is not aria-selected`);
    if (!panel(tab).children.length) fail(`the ${tab} panel rendered nothing`);
  }
  ok('all five tabs select, unhide and render');

  // ---- 10. the Sittings view states the reconciliation in public.
  // (The tab loop above ends on Payments, so ask for Sittings again.)
  $('tab-sittings').click();
  await tick();
  const sitRows = rowsIn('sittings-table');
  const sitText = textOf($('panel-sittings'));
  if (!/0[.,]12/.test(sitText)) fail('the Sittings view does not show the documented 0.12 gap');
  else ok('the Sittings view shows the documented 2026-01 gap of 0.12');
  if (!/5[\s\u00a0\u202f]?438[\s\u00a0\u202f]?482[.,]77/.test(sitText)) fail('no itemized year total in the totals row');
  else ok('the totals row shows the year\'s itemized total');
  if (!/5[\s\u00a0\u202f]?438[\s\u00a0\u202f]?482[.,]89/.test(sitText)) fail('no adopted year total in the totals row');
  else ok('the totals row shows the year\'s adopted total');
  if (sitRows.length < 8) fail('fewer than 8 sitting rows for 2026');
  if (/2025/.test(textOf(sitRows[0].children[0]))) fail('a 2025 sitting is listed under the 2026 frame');
  else ok('the Sittings view lists only the year in view');
  navigateTo('?lang=fr&tab=sittings&scope=2025');
  await tick();
  if (!/329[\s\u00a0\u202f]?508/.test(textOf($('panel-sittings')))) fail('the October 2025 note is not reachable in the Sittings view');
  else ok('the October 2025 resolution-vs-annexe note is on the page under 2025');

  // ---- 11. payee profile, and it ignores the filters
  $('tab-payments').click(); await tick();
  win.OO_LEDGER_VIEWS; // noop
  navigateTo('?lang=fr&scope=2025&payee=les-industries-simexco-inc');
  await tick();
  const prof = $('profile');
  if (prof.hidden) fail('the profile did not open from ?payee=');
  else ok('?payee= opens the profile');
  const ptext = textOf(prof);
  if (!/Simexco/.test(ptext)) fail('profile does not name the payee');
  else ok('the profile names the payee');
  if (!/136[\s  ]?527[.,]50/.test(ptext)) fail('profile does not show the known Simexco amount');
  else ok('the profile shows the payee\'s largest 2025 line');
  if (!/2026/.test(ptext)) fail('the profile does not offer the payee\'s other year');
  else ok('the profile links the payee\'s other years');

  // filters are paused on a profile; the year in the URL is the frame
  navigateTo('?lang=fr&sitting=2025-07&payee=les-industries-simexco-inc');
  await tick();
  if (!/136[\s\u00a0\u202f]?527[.,]50/.test(textOf($('profile')))) fail('the profile changed when a sitting filter was set - a shared link must not');
  else ok('the profile ignores the rail: a shared link means the same thing to everyone');
  navigateTo('?lang=fr&scope=2026&payee=les-industries-simexco-inc');
  await tick();
  if (/136[\s\u00a0\u202f]?527[.,]50/.test(textOf($('profile')))) fail('a 2026-framed profile still shows a 2025 line');
  else ok('the profile follows the year in the URL');

  // ---- 12. legacy URLs
  navigateTo('?lang=en&tab=payments&year=2025&period=2025-11&category=legal-services');
  await tick();
  const legacyStatus = textOf($('results-status'));
  if (!legacyStatus) fail('a legacy ?year=/?period=/?category= URL rendered nothing');
  else ok('legacy ?year= / ?period= / ?category= resolves: ' + legacyStatus.slice(0, 70));
  if (rowsIn('payments-table').length === 0) fail('the legacy URL resolved to an EMPTY result set');
  else ok('the legacy URL resolves to a non-empty result set');

  // the classic bug: a sitting outside the year must widen, not vanish
  navigateTo('?lang=fr&tab=payments&scope=2026&sitting=2025-11');
  await tick();
  const widened = rowsIn('payments-table');
  if (!widened.length) fail('an out-of-scope sitting still resolves to an empty page');
  else ok(`an out-of-scope sitting widens the scope instead of emptying the page (${widened.length} rows)`);

  // ---- 12b. "See the lines" jumps from a category to its payments
  navigateTo('?lang=fr&tab=categories');
  await tick();
  const catRows = rowsIn('categories-table').filter((r) => !r.classList.contains('totals'));
  const seeBtn = catRows[0].find((n) => n.tagName === 'BUTTON' && /Voir les lignes/.test(n.textContent))[0];
  if (!seeBtn) fail('the Categories view has no "see the lines" affordance');
  else {
    seeBtn.click();
    await tick();
    if (panel('payments').hidden) fail('"see the lines" did not switch to the Payments tab');
    else if (!/Catégorie/.test(textOf($('chips')))) fail('"see the lines" did not apply the category filter');
    else ok('"see the lines" jumps to Payments with only that category filtered');
  }

  // ---- 12c. a profile can opt into the reader's filters
  navigateTo('?lang=fr&sitting=2026-07&payee=les-industries-simexco-inc&payeeScope=filters');
  await tick();
  const scopedText = textOf($('profile'));
  if (/136[\s  ]?527[.,]50/.test(scopedText)) fail('payeeScope=filters did not narrow the profile');
  else ok('?payeeScope=filters narrows the profile to the reader\'s filters');

  // ---- 12d. every preset link resolves to a real, non-empty view.
  // Presets are the workspace's teaching surface and are meant to be linked
  // from articles, so a dead one is a published broken link.
  navigateTo('?lang=fr');
  await tick();
  const presetLinks = $('presets').find((n) => n.tagName === 'A');
  eq(presetLinks.length, 6, 'six question links are offered');
  for (const a of presetLinks) {
    const href = a.getAttribute('href');
    const label = a.textContent;
    navigateTo(href);
    await tick();
    const showing = $('profile').hidden
      ? ['payments-table', 'payees-table', 'categories-table', 'sittings-table', 'contracts-table']
          .reduce((n, t) => n + rowsIn(t).length, 0)
      : $('profile').children.length;
    if (!showing) fail(`preset "${label}" (${href}) resolves to an empty view`);
    else ok(`preset "${label}" resolves to a populated view`);
  }

  // ---- 13. both languages render, and the columns are translated
  navigateTo('?lang=en&tab=payments');
  await tick();
  const enHead = textOf($('panel-payments')).slice(0, 400);
  if (!/Supplier/.test(enHead)) fail('English column headers not rendered: ' + enHead.slice(0, 120));
  else ok('English renders with English column headers');
  navigateTo('?lang=fr&tab=payments');
  await tick();
  if (!/Fournisseur/.test(textOf($('panel-payments')))) fail('French column headers not rendered');
  else ok('French renders with French column headers');

  // ---- 13b. the house header's language buttons must end up in the state
  // the house function would have left them in. We replace window.obsSetLang,
  // so anything it does to its own buttons we must do too.
  {
    const en = document.getElementById('obs-btn-en');
    const fr = document.getElementById('obs-btn-fr');
    if (!en || !fr) {
      ok('(header buttons absent under the shim — checked in the browser harness)');
    } else {
      win.obsSetLang('en');
      await tick();
      if (en.getAttribute('aria-pressed') !== 'true' || fr.getAttribute('aria-pressed') !== 'false') {
        fail('aria-pressed on the language buttons is stale after switching to EN');
      } else ok('the language buttons carry the right aria-pressed after a switch');
      win.obsSetLang('fr');
      await tick();
    }
  }

  // ---- 13c. the standing disclaimer. This is the one element on the page
  // whose absence would be a real-world problem, so it is checked hard: a
  // one-line notice tops the page and links to the full notice at the foot;
  // neither is hidden or collapsed; the full one says every required point;
  // both survive a language switch.
  for (const lang of ['fr', 'en']) {
    navigateTo('?lang=' + lang);
    await tick();
    // NB the shim mounts id-bearing elements as flat siblings, so text is
    // read directly by id. That they ARE nested is markup, checked below.
    const d = $('disclaimer'), n = $('notice');
    if (!d) { fail(`no one-line notice (${lang})`); continue; }
    if (!n) { fail(`no full notice (${lang})`); continue; }
    if (d.hidden || n.hidden) fail(`a disclaimer element is hidden (${lang})`);
    if (d.tagName === 'DETAILS' || n.tagName === 'DETAILS') fail('the disclaimer is collapsible - it must always be open');
    const top = $('disclaimer-h').textContent + ' ' + $('disclaimer-b').textContent;
    const topMust = lang === 'fr' ? [/non officiel/i, /procès-verbaux officiels/i] : [/not official/i, /official minutes/i];
    if (topMust.some((re) => !re.test(top))) fail(`the ${lang} one-line notice must say unofficial + minutes authoritative: ${top}`);
    else ok(`the ${lang} one-line notice says unofficial, minutes authoritative`);
    if (!$('disclaimer-more') || !$('disclaimer-more').textContent.trim()) fail(`the ${lang} one-line notice has no link to the full notice`);
    const body = $('notice-h').textContent + ' ' + $('notice-b').textContent;
    // The non-affiliation sentence is the point of the whole notice: it is
    // what stops a reader taking this for a municipal publication.
    const must = lang === 'fr'
      ? [/ni affiliée à la Municipalité/i, /ni approuvée/i, /ne parle pas en son nom/i,
         /encore enrichie/i, /pas un document officiel/i, /référence/i, /procès-verbaux officiels/i]
      : [/not affiliated with/i, /endorsed by/i, /speaking for/i,
         /still being extended/i, /not an official document/i, /reference/i, /official minutes/i];
    const missing = must.filter((re) => !re.test(body));
    if (missing.length) fail(`the ${lang} full notice is missing ${missing.length} required point(s): ${body.slice(0, 80)}`);
    else ok(`the ${lang} full notice states: under development, unofficial, not a reference, minutes are authoritative`);
  }
  navigateTo('?lang=fr');
  await tick();

  // Checked against the shipped HTML rather than the shim's flattened tree:
  // the one-liner sits above the content and links to #notice; the full
  // notice wraps its text; both say their piece in both languages with no JS.
  {
    const fsMod = require('fs');
    for (const page of ['index.html', 'budget/index.html']) {
      const html = fsMod.readFileSync(path.join(dir, page), 'utf8');
      const t = /<p class="lw-disclaimer"[^>]*>([\s\S]*?)<\/p>/.exec(html);
      const n = /<section class="lw-notice"[^>]*>([\s\S]*?)<\/section>/.exec(html);
      if (!t) { fail(`${page} has no .lw-disclaimer line`); continue; }
      if (!n) { fail(`${page} has no .lw-notice section`); continue; }
      if (/hidden/.test(t[0]) || /hidden/.test(n[0].split('>')[0])) fail(`${page}: a disclaimer ships hidden`);
      else ok(`${page} ships both disclaimer parts always visible`);
      if (!/href="#notice"/.test(t[1])) fail(`${page}: the one-line notice does not link to the full notice`);
      if (!/id="notice-h"/.test(n[1]) || !/id="notice-b"/.test(n[1])) fail(`${page}: the notice text is not inside the notice section`);
      const topText = t[1].replace(/<[^>]*>/g, ' ');
      if (!/non officiel/i.test(topText) || !/not official/i.test(topText)) fail(`${page}: the no-JS one-liner is not bilingual`);
      const staticText = n[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      if (staticText.length < 80) fail(`${page}: the full notice is empty without JS ("${staticText}")`);
      else if (!/ni affiliée/i.test(staticText) || !/not affiliated with/i.test(staticText)) fail(`${page}: the no-JS full notice omits the non-affiliation sentence`);
      else ok(`${page} states the full notice in both languages with no JS at all`);
      // the one-liner is above the fold: before the first tab/section of real content
      const marker = page === 'index.html' ? '<div class="lw-tabs"' : '<section id="budget"';
      if (html.indexOf('class="lw-disclaimer"') > html.indexOf(marker)) fail(`${page}: the one-line notice sits below the main content`);
      else ok(`${page} puts the one-line notice above the content`);
    }
  }

  // ---- 14. NOTHING is injected as markup
  const html = document.body.innerHTML;
  const suspicious = html.match(/<(script|iframe|object|embed)\b/gi);
  if (suspicious) fail('rendered DOM contains ' + suspicious.join(', '));
  else ok('no script/iframe/object/embed anywhere in the rendered DOM');
  // every external link is on ormstown.ca and opens safely
  let badLink = 0;
  document.body.walk((n) => {
    if (n.tagName !== 'A') return;
    const href = n.getAttribute('href');
    if (!href || href[0] === '?' || href[0] === '/' || href[0] === '#') return;
    if (!/^https:\/\/(?:www\.ormstown\.ca|(?:www\.)?seao\.gouv\.qc\.ca|www\.legisquebec\.gouv\.qc\.ca)\//.test(href)) { badLink++; fail('external link is not an allowed official host: ' + href); }
    if (n.getAttribute('rel') !== 'noopener') { badLink++; fail('external link lacks rel=noopener: ' + href); }
  });
  if (!badLink) ok('every external link points at an allowed official host and carries rel=noopener');

  // ---- 15. accessibility surface
  navigateTo('?lang=fr&tab=payments');
  await tick();
  const sorted = document.body.find((n) => n.hasAttribute && n.hasAttribute('aria-sort'));
  if (sorted.length < 5) fail('sortable headers do not carry aria-sort (' + sorted.length + ')');
  else ok(`${sorted.length} sortable headers carry aria-sort`);
  const live = document.body.find((n) => n.getAttribute && n.getAttribute('aria-live'));
  eq(live.length, 1, 'exactly one aria-live region on the page');
  const tabs = document.body.find((n) => n.getAttribute && n.getAttribute('role') === 'tab');
  eq(tabs.length, 5, 'five elements with role=tab');
  eq(tabs.filter((t) => t.getAttribute('tabindex') === '0').length, 1, 'exactly one tab is in the tab order (roving tabindex)');

  console.log(failures ? `\n${failures} check(s) failed.` : '\nAll render checks passed.');
  process.exit(failures ? 1 : 0);
})();

function rowsChildren(id) { const n = document.getElementById(id); return n ? n.children.length : -1; }
function clickSort(tableId, colIndex) {
  const table = document.body.find((n) => n.getAttribute && n.getAttribute('id') === tableId)[0];
  const th = table.find((n) => n.tagName === 'TH' && n.hasAttribute('aria-sort'))[colIndex];
  th.find((n) => n.tagName === 'BUTTON')[0].click();
}
function navigateTo(search) {
  win.location.search = search;
  if (win._on && win._on.popstate) win._on.popstate();
}
