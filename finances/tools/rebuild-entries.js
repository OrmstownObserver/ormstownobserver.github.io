// Run: node finances/tools/rebuild-entries.js <raw-export.json>
// Regenerates spending-data.js entries and months[].cats from the
// line-level ledger export ([Payee, Entry, Amount, Category] per month),
// applying the Observer's payee rules per line. This makes the published
// category totals exact everywhere — previously, small lines grouped as
// "rest" kept their broad category, so refined categories were floors.
// Month totals are asserted unchanged to the penny. Payee spellings are
// canonicalized to the site's existing spellings (accent/case variants in
// the ledger collapse onto one name, preserving glosses).
'use strict';
const fs = require('fs');
const path = require('path');
const { NEW_CATS, mapCategory, METHOD } = require('./category-rules.js');

const rawPath = process.argv[2];
if (!rawPath) { console.error('usage: node rebuild-entries.js <raw-export.json>'); process.exit(1); }
const dir = path.join(__dirname, '..');
const FILE = path.join(dir, 'spending-data.js');
const raw = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
const window = {};
eval(fs.readFileSync(FILE, 'utf8'));
const D = window.OO_SPENDING;
const r2 = (x) => Math.round(x * 100) / 100;
const REST = '— Autres fournisseurs (voir PV) / Other suppliers (see minutes)';

const normKey = (s) => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
// canonical spellings from the current site data (before replacement)
const CANON = {};
D.entries.forEach(e => { const k = normKey(e[1]); if (!CANON[k]) CANON[k] = e[1]; });
function canonical(name) { return CANON[normKey(name)] || String(name).normalize('NFC'); }
const isPayroll = (n) => /paie municipale|municipal payroll/i.test(n);

let allOk = true;
const newEntries = [];
for (const month of Object.keys(raw).sort()) {
  const m = D.months.find(x => x.m === month);
  if (!m) { console.error('unknown month', month); process.exit(1); }
  const oldSum = r2(D.entries.filter(e => e[0] === month).reduce((a, e) => a + e[3], 0));

  const groups = {};
  for (const rrow of raw[month]) {
    const payee = canonical(rrow[0]);
    const cat = mapCategory(payee, rrow[1], rrow[3]);
    const k = normKey(payee) + '|' + cat;
    const g = groups[k] = groups[k] || { payee, cat, amt: 0, lines: 0 };
    g.amt = r2(g.amt + r2(Number(rrow[2])));
    g.lines += 1;
  }
  const named = [], rest = {};
  Object.values(groups).forEach(g => {
    if (g.amt >= 1000 || isPayroll(g.payee)) named.push(g);
    else { const r = rest[g.cat] = rest[g.cat] || [0, 0]; r[0] = r2(r[0] + g.amt); r[1] += g.lines; }
  });
  const monthEntries = [
    ...named.sort((a, b) => b.amt - a.amt).map(g => [month, g.payee, g.cat, g.amt, g.lines]),
    ...Object.entries(rest).map(([c, [a, n]]) => [month, REST, c, a, n])
  ];
  const newSum = r2(monthEntries.reduce((a, e) => a + e[3], 0));
  if (newSum !== oldSum) { allOk = false; console.error(`SUM CHANGED ${month}: ${oldSum} -> ${newSum}`); }

  const cats = {};
  monthEntries.forEach(e => { cats[e[2]] = cats[e[2]] || [0, 0]; cats[e[2]][0] = r2(cats[e[2]][0] + e[3]); cats[e[2]][1] += e[4]; });
  m.cats = Object.fromEntries(Object.entries(cats).sort((a, b) => b[1][0] - a[1][0]));
  newEntries.push(...monthEntries);
  console.log(`${month}: ${raw[month].length} lines -> ${monthEntries.length} entry groups, sum ${newSum} (unchanged: ${newSum === oldSum})`);
}
if (!allOk) { console.error('aborting — month totals changed'); process.exit(1); }

D.entries = newEntries;
Object.keys(NEW_CATS).forEach(k => { if (!D.categories[k]) D.categories[k] = NEW_CATS[k]; });
D.provenance.categories_method = METHOD;
D.provenance.categories_note = 'v4 (2026-08-14): content-aware mapping (finances/tools/category-rules.js) applied per ledger line by rebuild-entries.js. v3 added Regional shares & memberships and Insurance; v4 adds Policing — Sûreté du Québec (the provincial policing bill, previously inside Regional shares) and Software & IT (software, subscriptions and IT services previously split between Professional services and Supplies & operations). Each line is assigned by its payee AND entry text, leaving Other for genuinely unclassifiable items such as resident damage reimbursements.';

const src = fs.readFileSync(FILE, 'utf8');
const idx = src.search(/^window\.OO_SPENDING/m);
fs.writeFileSync(FILE, src.slice(0, idx) + 'window.OO_SPENDING = ' + JSON.stringify(D, null, 1) + ';\n');
console.log('Wrote spending-data.js with', newEntries.length, 'entry groups.');
