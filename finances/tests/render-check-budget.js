// Run: node finances/tests/render-check-budget.js
// Boots /finances/budget/ under the DOM shim and asserts the reference
// content survived the move out of app.js intact — including the accounting
// rule (tools/README.md:56-60), which is the one thing here that would be a
// genuine editorial regression rather than a cosmetic one.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { document, mountFromHTML } = require('./dom-shim.js');

const dir = path.join(__dirname, '..');
const PAGE = path.join(dir, 'budget');
let failures = 0;
const fail = (m) => { failures++; console.error('FAIL  ' + m); };
const ok = (m) => console.log('ok    ' + m);

mountFromHTML(path.join(PAGE, 'index.html'));

const ls = {};
const win = {
  document,
  navigator: { language: 'fr-CA' },
  localStorage: { getItem: (k) => (k in ls ? ls[k] : null), setItem: (k, v) => { ls[k] = String(v); } },
  location: { pathname: '/finances/budget/', search: '', hash: '', origin: 'http://localhost:8000' },
  history: { replaceState() {} },
  matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
  MutationObserver: class { observe() {} },
  getComputedStyle: () => ({ getPropertyValue: () => '' }),
  setTimeout, clearTimeout, Promise, URLSearchParams, Intl, Math, JSON, Date, isFinite,
  Number, String, Object, Array, console,
  URL: { createObjectURL: () => 'blob:x', revokeObjectURL() {} },
  Blob: class {},
  addEventListener() {},
  fetch: () => Promise.reject(new Error('no network in tests'))
};
win.window = win;
const ctx = vm.createContext(win);
const run = (p) => vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: p });
run(path.join(dir, 'spending-data.js'));
run(path.join(dir, 'i18n.js'));
run(path.join(dir, 'v2', 'ledger-data.js'));
run(path.join(dir, 'v2', 'ledger-charts.js'));
run(path.join(dir, 'v2', 'ledger-views.js'));
run(path.join(PAGE, 'budget.js'));

const $ = (id) => document.getElementById(id);
const txt = (id) => ($(id) ? $(id).textContent : '');
const D = win.OO_SPENDING;

setTimeout(() => {
  // ---- the reference page carries the same standing disclaimer
  {
    const d = $('disclaimer');
    const body = ($('disclaimer-h') ? $('disclaimer-h').textContent : '') + ' ' +
                 ($('disclaimer-b') ? $('disclaimer-b').textContent : '');
    if (!d || d.hidden || !body.trim()) fail('the reference page has no visible disclaimer');
    else if (!/ni affiliée à la Municipalité/i.test(body)) fail('the disclaimer omits the non-affiliation sentence');
    else if (!/pas un document officiel/i.test(body)) fail('the disclaimer does not say the page is unofficial');
    else if (!/référence/i.test(body)) fail('the disclaimer does not say not to use it as a reference');
    else ok('the reference page carries the same standing disclaimer');
  }

  // ---- the accounting rule, which is the reason this section is careful
  if (!txt('acct-note')) fail('the explanatory accounting note is missing');
  else ok('the accounting note is present');
  if (!txt('scale-tag')) fail('the "scale reference — not budget used" label is missing');
  else ok('the "scale reference — not budget used" label is present: ' + txt('scale-tag'));
  const html = document.body.innerHTML;
  if (/<progress|role="progressbar"/i.test(html)) fail('a progress bar was introduced for approved-vs-budget — forbidden');
  else ok('no progress bar anywhere (approved lists are not budget spending)');
  if (!/8[\s  ]?339[\s  ]?162|8,339,162/.test(txt('scale-line') + txt('budget-table'))) fail('the adopted expense total 8,339,162 is not on the page');
  else ok('the adopted 2026 expense total is on the page');

  // ---- budget table
  const brows = $('budget-body').children.filter((c) => c.tagName === 'TR');
  if (brows.length !== D.budget.functions.length + 1) fail(`budget table has ${brows.length} rows, want ${D.budget.functions.length + 1} (functions + totals)`);
  else ok(`budget table lists all ${D.budget.functions.length} functions plus a totals row`);

  // ---- capital cards
  const cards = $('pti-cards').children;
  if (cards.length !== D.budget.pti.length) fail(`${cards.length} PTI cards, want ${D.budget.pti.length}`);
  else ok(`all ${cards.length} PTI capital cards rendered`);

  // ---- coverage
  const crows = $('coverage-body').children.filter((c) => c.tagName === 'TR');
  if (crows.length !== D.months.length) fail(`coverage table has ${crows.length} rows, want ${D.months.length}`);
  else ok(`coverage table lists all ${crows.length} sittings`);

  // ---- method / documents / dictionary
  if ($('meth-list').children.length !== win.OO_I18N.fr.meth.length) fail('methodology list is incomplete');
  else ok(`methodology lists all ${$('meth-list').children.length} points`);
  const wantDocs = D.months.length + 2;
  if ($('doc-list').children.length !== wantDocs) fail(`document list has ${$('doc-list').children.length} entries, want ${wantDocs}`);
  else ok(`document list has all ${wantDocs} official sources (${D.months.length} minutes + budget + PTI)`);
  if ($('dict-list').children.length !== win.OO_I18N.fr.dict.length) fail('data dictionary is incomplete');
  else ok(`data dictionary lists all ${$('dict-list').children.length} terms`);

  // ---- links back, and the anchors the workspace redirects to
  ['back-link', 'back-link-2'].forEach((id) => {
    if (!/^\/finances\/\?lang=/.test($(id).getAttribute('href') || '')) fail(id + ' does not link back to the workspace');
  });
  ok('both back-links return to the workspace in the reader\'s language');
  ['budget', 'capital', 'coverage', 'method', 'documents', 'dictionary'].forEach((a) => {
    if (!$(a)) fail('missing section anchor #' + a + ' (the workspace hash router redirects to it)');
  });
  ok('every section anchor the workspace redirects to exists');

  // ---- no markup injected from data
  if (/<(script|iframe|object|embed)\b/i.test(html)) fail('rendered DOM contains a script/iframe/object/embed');
  else ok('no script/iframe/object/embed in the rendered DOM');
  let bad = 0;
  document.body.walk((n) => {
    if (n.tagName !== 'A') return;
    const href = n.getAttribute('href') || '';
    if (href[0] === '#' || href[0] === '/' || href[0] === '?') return;
    if (!/^https:\/\/(www\.)?ormstown\.ca\//.test(href)) { bad++; fail('external link is not ormstown.ca: ' + href); }
  });
  if (!bad) ok('every external link points at ormstown.ca');

  // ---- English renders too
  win.obsSetLang('en');
  if (!/Function/.test($('budget-head').textContent)) fail('English budget table did not render');
  else ok('the page re-renders in English in place');

  console.log(failures ? `\n${failures} check(s) failed.` : '\nAll reference-page checks passed.');
  process.exit(failures ? 1 : 0);
}, 30);
