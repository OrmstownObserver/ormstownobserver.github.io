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
    eq(order.join(' '), 'categories sittings payees payments', 'tabs run Categories, Sittings, Suppliers, Payments');
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
    if (/7[\s  ]?985[\s  ]?803/.test(scopedStatus)) fail('the default view shows the all-years total, not the current year');
    else ok('the default view is scoped to the current year, not all years: ' + scopedStatus.slice(0, 50));

    // the header status line still describes the WHOLE dataset
    const head = textOf($('status'));
    if (!/2[\s  ]?356/.test(head)) fail('the page head no longer states the full dataset: ' + head);
    else ok('the page head still states the whole dataset (2,356 lines, 11 sittings)');
  }

  // ---- 3. the rail is populated (it lists every sitting and category,
  // whatever the current scope is)
  eq(rowsChildren('sitting-list'), 13, 'sitting checklist lists 11 sittings under 2 year headings');
  eq(rowsChildren('category-list'), 14, 'category checklist lists all 14 used categories');
  if (!textOf($('q-help'))) fail('search help text is empty');
  else ok('search help text explains what is and is not searched');

  // ---- 3b. from here on, the payments assertions need the Payments tab and
  // the full record, so ask for both explicitly.
  navigateTo('?lang=fr&tab=payments&scope=all');
  await tick();
  eq(rowsIn('payments-table').length, 150, 'Payments renders the 150-row first page, not all 2,356');
  {
    const status = textOf($('results-status'));
    if (!/2\s?356/.test(status.replace(/ | /g, ' '))) fail('status line does not report 2,356 lines: ' + status);
    else ok('status line reports the full 2,356-line result set');
    if (!/7[\s  ]?985[\s  ]?803/.test(status)) fail('status line total is not the itemized grand total: ' + status);
    else ok('status line total is the itemized grand total');
  }

  // ---- 4. a hidden payee is reachable by search - the whole point
  const q = $('q');
  q.value = 'petro';
  q.dispatch('input');
  await new Promise((r) => setTimeout(r, 220));
  const petroRows = rowsIn('payments-table');
  const petroStatus = textOf($('results-status'));
  if (!/319/.test(petroStatus)) fail('search "petro" did not reach all 319 lines: ' + petroStatus);
  else ok('search "petro" reaches all 319 lines of a payee whose name never says "Petro"');
  eq(petroRows.length, 150, 'the search result set is still paged at 150 rows');
  const firstPayee = textOf(petroRows[0].children[0]);
  if (!/9534-8702/.test(firstPayee)) fail('first petro row is not the Petro-Canada payee: ' + firstPayee);
  else ok('the trade name resolves to its canonical payee');
  if (!petroRows.some((r) => /Petro-Canada/.test(textOf(r.children[1])))) fail('no trade-name chip rendered');
  else ok('the trade-name prefix is kept as a chip, not discarded');

  // ---- 5. clearing the search restores everything
  $('q-clear').click();
  await tick();
  eq(rowsIn('payments-table').length, 150, 'clearing the search restores the full result set');

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
  eq(creditRows.length, 26, 'the Credits-only chip finds all 26 negative lines');
  if (!/credit|crédit/i.test(textOf(creditRows[0]))) fail('a negative line is not tagged as a credit');
  else ok('negative lines are tagged as credits');
  chips[3].click();
  await tick();

  // ---- 9. tabs
  for (const tab of ['payees', 'categories', 'sittings', 'payments']) {
    $('tab-' + tab).click();
    await tick();
    if (panel(tab).hidden) fail(`the ${tab} panel is still hidden after selecting its tab`);
    if ($('tab-' + tab).getAttribute('aria-selected') !== 'true') fail(`tab-${tab} is not aria-selected`);
    if (!panel(tab).children.length) fail(`the ${tab} panel rendered nothing`);
  }
  ok('all four tabs select, unhide and render');

  // ---- 10. the Sittings view states the reconciliation in public.
  // (The tab loop above ends on Payments, so ask for Sittings again.)
  $('tab-sittings').click();
  await tick();
  const sitRows = rowsIn('sittings-table');
  const sitText = textOf($('panel-sittings'));
  if (!/0[.,]12/.test(sitText)) fail('the Sittings view does not show the documented 0.12 gap');
  else ok('the Sittings view shows the documented 2026-01 gap of 0.12');
  if (!/7[\s  ]?985[\s  ]?803[.,]94/.test(sitText)) fail('no itemized grand total in the totals row');
  else ok('the totals row shows itemized 7,985,803.94');
  if (!/7[\s  ]?985[\s  ]?804[.,]06/.test(sitText)) fail('no adopted grand total in the totals row');
  else ok('the totals row shows adopted 7,985,804.06');
  if (!/329[\s  ]?508/.test(sitText)) fail('the October 2025 note is not reachable in the Sittings view');
  else ok('the October 2025 resolution-vs-annexe note is on the page');
  if (sitRows.length < 10) fail('fewer than 10 sitting rows');

  // ---- 11. payee profile, and it ignores the filters
  $('tab-payments').click(); await tick();
  win.OO_LEDGER_VIEWS; // noop
  navigateTo('?lang=fr&payee=les-industries-simexco-inc');
  await tick();
  const prof = $('profile');
  if (prof.hidden) fail('the profile did not open from ?payee=');
  else ok('?payee= opens the profile');
  const ptext = textOf(prof);
  if (!/Simexco/.test(ptext)) fail('profile does not name the payee');
  else ok('the profile names the payee');
  if (!/136[\s  ]?527[.,]50/.test(ptext)) fail('profile does not show the known Simexco amount');
  else ok('the profile shows the payee total across all sittings');

  // filters are paused on a profile
  navigateTo('?lang=fr&sitting=2026-07&payee=les-industries-simexco-inc');
  await tick();
  if (!/136[\s  ]?527[.,]50/.test(textOf($('profile')))) fail('the profile changed when a sitting filter was set - a shared link must not');
  else ok('the profile ignores the rail: a shared link means the same thing to everyone');

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
  const presetLinks = $('presets').children.filter((n) => n.tagName === 'A');
  eq(presetLinks.length, 4, 'four preset links are offered');
  for (const a of presetLinks) {
    const href = a.getAttribute('href');
    const label = a.textContent;
    navigateTo(href);
    await tick();
    const showing = $('profile').hidden
      ? ['payments-table', 'payees-table', 'categories-table', 'sittings-table']
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
  // whose absence would be a real-world problem, so it is checked hard: it
  // exists, it is visible, it is not collapsed behind anything, it says all
  // three things, and it survives a language switch.
  for (const lang of ['fr', 'en']) {
    navigateTo('?lang=' + lang);
    await tick();
    // NB the shim mounts id-bearing elements as flat siblings, so the
    // heading and body are read directly rather than through the container.
    // That the two ARE nested inside it is markup, checked below.
    const d = $('disclaimer');
    if (!d) { fail(`no disclaimer element (${lang})`); continue; }
    if (d.hidden) fail(`the disclaimer is hidden (${lang})`);
    if (d.tagName === 'DETAILS') fail('the disclaimer is collapsible - it must always be open');
    const body = $('disclaimer-h').textContent + ' ' + $('disclaimer-b').textContent;
    // The non-affiliation sentence is the point of the whole block: it is
    // what stops a reader taking this for a municipal publication.
    const must = lang === 'fr'
      ? [/ni affiliée à la Municipalité/i, /ni approuvée/i, /ne parle pas en son nom/i,
         /encore enrichie/i, /pas un document officiel/i, /référence/i, /procès-verbaux officiels/i]
      : [/not affiliated with/i, /endorsed by/i, /speaking for/i,
         /still being extended/i, /not an official document/i, /reference/i, /official minutes/i];
    const missing = must.filter((re) => !re.test(body));
    if (missing.length) fail(`the ${lang} disclaimer is missing ${missing.length} required point(s): ${body.slice(0, 80)}`);
    else ok(`the ${lang} disclaimer states: under development, unofficial, not a reference, minutes are authoritative`);
  }
  navigateTo('?lang=fr');
  await tick();

  // The container must actually wrap the text, be a plain always-visible
  // block, and sit above the fold on every surface. Checked against the
  // shipped HTML rather than the shim's flattened tree.
  {
    const fsMod = require('fs');
    for (const page of ['index.html', 'budget/index.html']) {
      const html = fsMod.readFileSync(path.join(dir, page), 'utf8');
      const m = /<div class="lw-disclaimer"[^>]*>([\s\S]*?)<\/div>/.exec(html);
      if (!m) { fail(`${page} has no .lw-disclaimer block`); continue; }
      if (!/id="disclaimer-h"/.test(m[1]) || !/id="disclaimer-b"/.test(m[1])) fail(`${page}: the disclaimer text is not inside the disclaimer box`);
      else if (/hidden/.test(m[0])) fail(`${page}: the disclaimer ships hidden`);
      else ok(`${page} ships the disclaimer as an always-visible block`);
      // it must say something even if no script ever runs
      const staticText = m[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      if (staticText.length < 80) fail(`${page}: the disclaimer is empty without JS ("${staticText}")`);
      else if (!/officiel/i.test(staticText) || !/official/i.test(staticText)) fail(`${page}: the no-JS fallback is not bilingual`);
      else if (!/ni affiliée/i.test(staticText) || !/not affiliated with/i.test(staticText)) fail(`${page}: the no-JS fallback omits the non-affiliation sentence`);
      else ok(`${page} states the disclaimer in both languages with no JS at all`);
      // above the fold: before the first tab/section of real content
      const marker = page === 'index.html' ? '<div class="lw-tabs"' : '<section id="budget"';
      if (html.indexOf('lw-disclaimer') > html.indexOf(marker)) fail(`${page}: the disclaimer sits below the main content`);
      else ok(`${page} puts the disclaimer above the content`);
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
    if (!/^https:\/\/www\.ormstown\.ca\//.test(href)) { badLink++; fail('external link is not ormstown.ca: ' + href); }
    if (n.getAttribute('rel') !== 'noopener') { badLink++; fail('external link lacks rel=noopener: ' + href); }
  });
  if (!badLink) ok('every external link points at ormstown.ca and carries rel=noopener');

  // ---- 15. accessibility surface
  navigateTo('?lang=fr&tab=payments');
  await tick();
  const sorted = document.body.find((n) => n.hasAttribute && n.hasAttribute('aria-sort'));
  if (sorted.length < 5) fail('sortable headers do not carry aria-sort (' + sorted.length + ')');
  else ok(`${sorted.length} sortable headers carry aria-sort`);
  const live = document.body.find((n) => n.getAttribute && n.getAttribute('aria-live'));
  eq(live.length, 1, 'exactly one aria-live region on the page');
  const tabs = document.body.find((n) => n.getAttribute && n.getAttribute('role') === 'tab');
  eq(tabs.length, 4, 'four elements with role=tab');
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
