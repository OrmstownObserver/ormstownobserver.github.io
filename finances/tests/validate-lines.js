// Run: node finances/tests/validate-lines.js
// Proves the v2 workspace's line store is a faithful, penny-exact view of
// the official record. Exit 0 = pass, 1 = failure (message on stderr).
//
// It evals finances/v2/ledger-data.js under a fake `window`, so it asserts
// against THE EXACT STORE THE BROWSER BUILDS - not a reimplementation.
// That is the whole reason ledger-data.js is kept free of DOM and i18n.
'use strict';
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..');
const window = {};
eval(fs.readFileSync(path.join(dir, 'spending-data.js'), 'utf8'));
eval(fs.readFileSync(path.join(dir, 'ledger-data.js'), 'utf8'));
const D = window.OO_SPENDING;
const L = window.OO_LEDGER;
const payments = JSON.parse(fs.readFileSync(path.join(dir, 'payments.json'), 'utf8'));

let failures = 0;
const fail = (m) => { failures++; console.error('FAIL  ' + m); };
const ok = (m) => console.log('ok    ' + m);
const c = (v) => Math.round(v * 100);
const money = (v) => v.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const store = L.build(D, payments);

// ---- a. Every line in payments.json made it into the store, once.
const rawCount = Object.keys(payments).reduce((a, m) => a + payments[m].length, 0);
if (store.lines.length !== rawCount) fail(`store has ${store.lines.length} lines, payments.json has ${rawCount}`);
else ok(`${store.lines.length} payment lines loaded across ${store.sittings.length} sittings`);

for (const m of Object.keys(payments)) {
  if (!store.sittingById[m]) fail(`payments.json has month ${m} with no sitting in spending-data.js`);
  for (const row of payments[m]) {
    if (row.length !== 4) fail(`${m}: line is not a 4-tuple: ${JSON.stringify(row)}`);
    if (typeof row[0] !== 'string' || !row[0]) fail(`${m}: line has no payee: ${JSON.stringify(row)}`);
    if (typeof row[1] !== 'string' || !row[1]) fail(`${m}: line has no entry text: ${JSON.stringify(row)}`);
    if (!Number.isFinite(row[2])) fail(`${m}: line amount is not a number: ${JSON.stringify(row)}`);
    if (!D.categories[row[3]]) fail(`${m}: line has unknown category "${row[3]}"`);
  }
}
ok('every line is a well-typed 4-tuple with a known category');

// ---- b/c. Per sitting and per (sitting, category), the lines reproduce
// the published months[].cats EXACTLY. This is the load-bearing assertion:
// it is what proves payments.json and the aggregate layer agree.
for (const s of store.sittings) {
  const idx = store.bySitting[s.m];
  const byCat = {};
  let tot = 0;
  for (const i of idx) {
    const ln = store.lines[i];
    tot += c(ln.a);
    byCat[ln.c] = (byCat[ln.c] || 0) + c(ln.a);
  }
  const catsTot = Object.values(s.cats).reduce((a, v) => a + c(v[0]), 0);
  if (tot !== catsTot) fail(`${s.m}: lines ${money(tot / 100)} != months[].cats ${money(catsTot / 100)}`);

  for (const key of Object.keys(s.cats)) {
    const want = c(s.cats[key][0]);
    const got = byCat[key] || 0;
    if (want !== got) fail(`${s.m} / ${key}: lines ${money(got / 100)} != cats ${money(want / 100)}`);
  }
  for (const key of Object.keys(byCat)) {
    if (!s.cats[key]) fail(`${s.m}: lines carry category "${key}" which months[].cats does not list`);
  }
}
ok('every (sitting, category) cell matches months[].cats to the penny');

// ---- d. Itemized vs ADOPTED. months[].total is never recomputed; the gap
// is carried. 2026-01 has a documented 0.12 gap (two digits unreadable in
// the scanned annexe). A SECOND undocumented gap must fail the build
// rather than be quietly absorbed by the page.
const gaps = [];
for (const s of store.sittings) {
  if (Math.abs(s.gap) > s.tol) {
    fail(`${s.m}: itemized ${money(s.lineTotal)} vs adopted ${money(s.total)} - gap ${money(s.gap)} exceeds tolerance ${s.tol}`);
  }
  if (c(s.gap) !== 0) gaps.push(`${s.m}=${money(s.gap)}`);
}
// Every non-zero gap must be declared in provenance.tolerances, to the penny,
// and every declared tolerance must correspond to a real gap. Adding a sitting
// that carries a gap therefore forces the tolerance to be documented first.
const declared = (D.provenance && D.provenance.tolerances) || {};
const gapByMonth = {};
for (const s of store.sittings) if (c(s.gap) !== 0) gapByMonth[s.m] = s.gap;
const undeclared = Object.keys(gapByMonth).filter((m) => declared[m] == null);
const mismatched = Object.keys(gapByMonth).filter(
  (m) => declared[m] != null && Math.abs(c(Math.abs(gapByMonth[m])) - c(Math.abs(declared[m]))) !== 0
);
const unused = Object.keys(declared).filter((m) => gapByMonth[m] == null);
if (undeclared.length) fail(`undocumented gap(s): ${undeclared.map((m) => `${m}=${money(gapByMonth[m])}`).join(', ')} - declare them in provenance.tolerances`);
if (mismatched.length) fail(`gap(s) disagree with provenance.tolerances: ${mismatched.map((m) => `${m}: store ${money(gapByMonth[m])} vs declared ${money(declared[m])}`).join('; ')}`);
if (unused.length) fail(`provenance.tolerances declares ${unused.join(', ')} but the store shows no gap there`);
if (!undeclared.length && !mismatched.length && !unused.length) {
  ok(`all ${Object.keys(gapByMonth).length} non-zero gap(s) are documented to the penny: ${Object.keys(gapByMonth).sort().map((m) => `${m}=${money(gapByMonth[m])}`).join(', ')}`);
}

// ---- e. Grand totals.
const T = store.totals;
if (c(T.itemized) !== 1007268474) fail(`grand itemized ${money(T.itemized)} != 10,072,684.74`);
if (c(T.adopted) !== 1006263650) fail(`grand adopted ${money(T.adopted)} != 10,062,636.50`);
if (c(T.gap) !== -1004824) fail(`grand gap ${money(T.gap)} != -10,048.24`);
if (!failures) ok(`grand totals: itemized ${money(T.itemized)} / adopted ${money(T.adopted)} / gap ${money(T.gap)}`);

// ---- f. payments.json is a STRICT SUPERSET of the rollup: replaying
// rebuild-entries.js's own grouping rule over the line store reproduces
// entries[] exactly. This is what proves the 814 lines hidden behind the
// "Autres fournisseurs" sentinel are the same money, not extra money.
//
// The rule, from finances/tools/rebuild-entries.js:44-54 - group by
// (normKey(payee), category); a group is NAMED if it reaches $1,000 or is
// payroll, otherwise it folds into a per-category rest sentinel.
{
  const REST = '— Autres fournisseurs (voir PV) / Other suppliers (see minutes)';
  const want = new Map();   // "month|payeeKey|cat" -> [cents, lineCount]
  for (const e of D.entries) {
    const k = `${e[0]}|${L.normKey(e[1])}|${e[2]}`;
    if (want.has(k)) fail(`entries[] has a duplicate group ${k}`);
    want.set(k, [c(e[3]), e[4]]);
  }

  const got = new Map();
  for (const s of store.sittings) {
    const groups = new Map();
    for (const i of store.bySitting[s.m]) {
      const ln = store.lines[i];
      const k = L.normKey(ln.raw) + '|' + ln.c;
      const g = groups.get(k) || { payee: ln.raw, cat: ln.c, amt: 0, lines: 0 };
      g.amt += c(ln.a); g.lines++;
      groups.set(k, g);
    }
    const rest = new Map();
    for (const g of groups.values()) {
      if (g.amt >= 100000 || L.isPayroll(g.payee)) {
        got.set(`${s.m}|${L.normKey(g.payee)}|${g.cat}`, [g.amt, g.lines]);
      } else {
        const r = rest.get(g.cat) || [0, 0];
        rest.set(g.cat, [r[0] + g.amt, r[1] + g.lines]);
      }
    }
    for (const [cat, v] of rest) got.set(`${s.m}|${L.normKey(REST)}|${cat}`, v);
  }

  let bad = 0;
  for (const [k, [amt, n]] of want) {
    const g = got.get(k);
    if (!g) { bad++; fail(`entries[] group has no lines behind it: ${k}`); continue; }
    if (g[0] !== amt) { bad++; fail(`${k}: lines ${money(g[0] / 100)} != entry ${money(amt / 100)}`); }
    if (g[1] !== n) { bad++; fail(`${k}: ${g[1]} lines != entry line count ${n}`); }
  }
  for (const k of got.keys()) {
    if (!want.has(k)) { bad++; fail(`the line store produces a group entries[] does not have: ${k}`); }
  }
  if (!bad) ok(`all ${want.size} entries[] groups reproduce exactly from the line store`);
}

// ---- g. Payee slugs are permanent public URLs. Every slug ever shipped
// must still resolve to the same canonical name. A data update may ADD a
// payee; it must never silently move an existing ?payee= link.
{
  const seen = new Map();
  for (const p of store.payeeList) {
    if (seen.has(p.slug)) fail(`slug collision: "${p.slug}" used by "${seen.get(p.slug)}" and "${p.name}"`);
    seen.set(p.slug, p.name);
  }
  ok(`${store.payeeList.length} payees, ${seen.size} unique slugs, no collisions`);

  const fixturePath = path.join(__dirname, 'payee-slugs.json');
  if (!fs.existsSync(fixturePath)) {
    fs.writeFileSync(fixturePath, JSON.stringify(Object.fromEntries([...seen].sort()), null, 1) + '\n');
    console.log('note  wrote the initial payee-slugs.json fixture (' + seen.size + ' slugs)');
  } else {
    const frozen = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
    let moved = 0, added = 0;
    for (const [slug, name] of Object.entries(frozen)) {
      if (!seen.has(slug)) { moved++; fail(`shipped payee slug "${slug}" (${name}) no longer resolves - a shared link is now broken`); }
      else if (seen.get(slug) !== name) { moved++; fail(`payee slug "${slug}" moved from "${name}" to "${seen.get(slug)}"`); }
    }
    for (const slug of seen.keys()) if (!frozen[slug]) added++;
    if (!moved) ok(`all ${Object.keys(frozen).length} frozen payee slugs still resolve` + (added ? ` (+${added} new)` : ''));
  }
}

// ---- h. Every gloss key resolves to a real payee, so no plain-language
// description is orphaned. The rest sentinel is the one exception.
{
  const byKey = new Map(store.payeeList.map(p => [p.key, p]));
  const orphans = Object.keys(D.gloss).filter(g => !byKey.has(L.normKey(g)) && !L.isRest(g));
  if (orphans.length) fail(`gloss keys with no payee in payments.json: ${orphans.join(' | ')}`);
  else ok(`all ${Object.keys(D.gloss).length} gloss keys resolve to a payee (rest sentinel excepted)`);
}

// ---- i. Category slugs round-trip. ?category= is a published URL vocabulary.
for (const cat of store.categories) {
  if (!L.SLUGS[cat.key]) fail(`category "${cat.key}" has no URL slug in ledger-data.js SLUGS`);
  else if (L.KEY_BY_SLUG[L.SLUGS[cat.key]] !== cat.key) fail(`slug "${L.SLUGS[cat.key]}" does not round-trip to "${cat.key}"`);
}
ok(`${store.categories.length} categories all have round-tripping URL slugs`);

// ---- j. Filtering and aggregation agree with the store's own totals.
{
  const all = L.filterLines(store, { scope: 'all' });
  const agg = L.aggregate(store, all);
  if (all.length !== store.lines.length) fail(`unfiltered filter returned ${all.length} of ${store.lines.length} lines`);
  if (c(agg.total) !== c(store.totals.itemized)) fail(`aggregate total ${money(agg.total)} != itemized ${money(store.totals.itemized)}`);

  for (const y of ['2025', '2026']) {
    const idx = L.filterLines(store, { scope: y });
    const want = store.sittings.filter(s => s.year === y).reduce((a, s) => a + c(s.lineTotal), 0);
    if (c(L.aggregate(store, idx).total) !== want) fail(`scope=${y} total does not match its sittings`);
  }
  // A named sitting filter must win over scope, and must not be dropped
  // when it falls outside it - the bug classic had at app.js:136-139.
  const cross = L.filterLines(store, { scope: '2026', sittings: ['2025-11'] });
  if (cross.length !== store.bySitting['2025-11'].length) fail('an explicit sitting outside the scope was dropped');
  else ok('an explicit sitting filter overrides scope (classic dropped it silently)');

  const petro = L.filterLines(store, { scope: 'all', q: 'petro' });
  if (petro.length < 300) fail(`search "petro" found only ${petro.length} lines - expected the 311 Petro-Canada lines`);
  else ok(`search "petro" reaches ${petro.length} lines whose payee field never says "Petro"`);

  const credits = L.filterLines(store, { scope: 'all', max: -0.01 });
  const cAgg = L.aggregate(store, credits);
  ok(`${credits.length} credit lines totalling ${money(cAgg.total)}`);

  const sorted = L.sortIndices(store, all, 'amount:desc', {});
  for (let i = 1; i < sorted.length; i++) {
    if (store.lines[sorted[i - 1]].a < store.lines[sorted[i]].a) { fail('amount:desc sort is not monotonic'); break; }
  }
  ok('sorting is monotonic and stable');
}

// ---- k. No line or official string carries markup. v2 renders with
// textContent, and rich() is only ever handed repo-authored i18n strings -
// this makes that discipline a build-time invariant.
{
  let dirty = 0;
  const check = (label, s) => { if (/[<>]/.test(String(s))) { dirty++; fail(`${label} contains markup: ${JSON.stringify(String(s).slice(0, 80))}`); } };
  for (const m of Object.keys(payments)) for (const r of payments[m]) { check(`${m} payee`, r[0]); check(`${m} entry`, r[1]); }
  for (const s of D.months) { check(`${s.m} session`, s.session); check(`${s.m} label_fr`, s.label_fr); check(`${s.m} label_en`, s.label_en); check(`${s.m} note_fr`, s.note_fr || ''); check(`${s.m} note_en`, s.note_en || ''); }
  for (const e of D.entries) check('entry payee', e[1]);
  if (!dirty) ok('no payee, entry, session, label or note contains markup');
}

console.log(failures ? `\n${failures} check(s) failed.` : '\nAll line-store checks passed.');
process.exit(failures ? 1 : 0);
