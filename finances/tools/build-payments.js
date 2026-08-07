// Run: node finances/tools/build-payments.js <raw-export.json>
// Builds finances/payments.json from a raw ledger export of
// [Payee, Entry, Amount, Category] quadruplets keyed by month.
// Applies the Observer's payee-based category rules (v2) per line — the
// ledger's Jan–May lines still carry v1 categories — then verifies that
// every month's per-category line sums reproduce the published category
// totals in spending-data.js exactly.
'use strict';
const fs = require('fs');
const path = require('path');
const { mapCategory } = require('./category-rules.js');

const rawPath = process.argv[2];
if (!rawPath) { console.error('usage: node build-payments.js <raw-export.json>'); process.exit(1); }
const dir = path.join(__dirname, '..');
const raw = JSON.parse(fs.readFileSync(rawPath, 'utf8'));
const window = {};
eval(fs.readFileSync(path.join(dir, 'spending-data.js'), 'utf8'));
const D = window.OO_SPENDING;
const r2 = (x) => Math.round(x * 100) / 100;


const out = {};
let failures = 0;
for (const month of Object.keys(raw).sort()) {
  const rows = raw[month].map(r => {
    if (!Array.isArray(r) || r.length !== 4) { console.error('bad row', month, JSON.stringify(r)); process.exit(1); }
    return [r[0], r[1], r2(Number(r[2])), mapCategory(r[0], r[1], r[3])];
  });
  out[month] = rows;
  const m = D.months.find(x => x.m === month);
  if (!m) { console.error('unknown month', month); process.exit(1); }
  // per-category sums must reproduce the published category totals
  const byCat = {};
  rows.forEach(r => { byCat[r[3]] = r2((byCat[r[3]] || 0) + r[2]); });
  for (const [cat, [amt]] of Object.entries(m.cats)) {
    const got = r2(byCat[cat] || 0);
    if (got !== r2(amt)) { failures++; console.error(`MISMATCH ${month} / ${cat}: lines ${got} vs published ${amt}`); }
  }
  for (const cat of Object.keys(byCat)) {
    if (!(cat in m.cats)) { failures++; console.error(`MISMATCH ${month}: lines carry category "${cat}" absent from published cats`); }
  }
  const tot = r2(rows.reduce((a, r) => a + r[2], 0));
  console.log(`${month}: ${rows.length} lines, ${tot}, categories ok=${failures === 0}`);
}
if (failures) { console.error(failures + ' mismatch(es) — payments.json NOT written'); process.exit(1); }
fs.writeFileSync(path.join(dir, 'payments.json'), JSON.stringify(out));
console.log('Wrote finances/payments.json (' + fs.statSync(path.join(dir, 'payments.json')).size + ' bytes)');
