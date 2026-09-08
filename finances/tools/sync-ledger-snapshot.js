// Run:
//   node finances/tools/sync-ledger-snapshot.js <notion-view-export.json>
//   node finances/tools/sync-ledger-snapshot.js <notion-view-export.json> --apply YYYY-MM[,YYYY-MM]
//
// Audits a full Notion ledger view export against the public dataset. With
// --apply, adds or replaces only the named, penny-reconciled sittings while
// preserving every other published month. This deliberately refuses partial,
// staged, duplicate, or source-less data.
'use strict';

const fs = require('fs');
const path = require('path');
const { mapCategory, METHOD } = require('./category-rules.js');

const snapshotPath = process.argv[2];
const applyAt = process.argv.indexOf('--apply');
const applyMonths = applyAt === -1 ? [] : String(process.argv[applyAt + 1] || '').split(',').filter(Boolean);
if (!snapshotPath || (applyAt !== -1 && !applyMonths.length)) {
  console.error('usage: node sync-ledger-snapshot.js <notion-view-export.json> [--apply YYYY-MM[,YYYY-MM]]');
  process.exit(1);
}

const dir = path.join(__dirname, '..');
const dataFile = path.join(dir, 'spending-data.js');
const paymentsFile = path.join(dir, 'payments.json');
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
const payments = JSON.parse(fs.readFileSync(paymentsFile, 'utf8'));
const window = {};
eval(fs.readFileSync(dataFile, 'utf8'));
const D = window.OO_SPENDING;

if (!Array.isArray(snapshot)) throw new Error('snapshot must be a JSON array');
const cents = value => Math.round(Number(value) * 100);
const money = value => (value / 100).toFixed(2);
const monthOf = row => String(row['date:Date:start'] || '').slice(0, 7);
const included = row => row.Status === 'Verified' && row['Line Type'] === 'Line item' && row['Excluded from total'] !== '__YES__';
const totals = row => row.Status === 'Verified' && row['Line Type'] === 'Monthly list total' && row['Excluded from total'] !== '__YES__';
const required = ['Entry', 'Payee', 'Amount', 'Category', 'Fiscal Year', 'Council Session', 'Source URL', 'Source Detail', 'Status', 'Line Type', 'url'];

const ids = new Set();
for (const row of snapshot) {
  if (!row.url || ids.has(row.url)) throw new Error('missing or duplicate stable row URL: ' + (row.url || '(empty)'));
  ids.add(row.url);
}

const byMonth = {};
snapshot.forEach(row => {
  const month = monthOf(row);
  if (month) (byMonth[month] ||= []).push(row);
});

const publicMonths = new Set(D.months.map(month => month.m));
const sourceMonths = Object.keys(byMonth).filter(month => byMonth[month].some(totals)).sort();
let auditFailures = 0;
for (const month of sourceMonths) {
  const rows = byMonth[month].filter(included);
  const totalRows = byMonth[month].filter(totals);
  if (totalRows.length !== 1) {
    auditFailures++;
    console.error(`FAIL  ${month}: expected one verified monthly-total row, found ${totalRows.length}`);
    continue;
  }
  const lineCents = rows.reduce((sum, row) => sum + cents(row.Amount), 0);
  const adoptedCents = cents(totalRows[0].Amount);
  const toleranceCents = cents((D.provenance.tolerances || {})[month] || 0);
  const gapCents = adoptedCents - lineCents;
  const reconciled = Math.abs(gapCents) === Math.abs(toleranceCents);
  const published = publicMonths.has(month);
  const tag = reconciled ? 'OK  ' : 'FAIL';
  if (!reconciled) auditFailures++;
  console.log(`${tag}  ${month}: ${rows.length} verified lines = ${money(lineCents)}; adopted ${money(adoptedCents)}; gap ${money(gapCents)}${published ? '' : ' — MISSING FROM SITE'}`);
}

if (!applyMonths.length) {
  if (sourceMonths.some(month => !publicMonths.has(month))) process.exitCode = 2;
  else if (auditFailures) process.exitCode = 1;
  return;
}

const monthNames = {
  fr: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
};
const REST = '— Autres fournisseurs (voir PV) / Other suppliers (see minutes)';
const normKey = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const canon = {};
D.entries.forEach(entry => { const key = normKey(entry[1]); if (!canon[key]) canon[key] = entry[1]; });
const slugFixture = JSON.parse(fs.readFileSync(path.join(dir, 'tests', 'payee-slugs.json'), 'utf8'));
// Published slugs are a compatibility contract, so the fixture wins over a
// spelling already present in generated rollups.
Object.values(slugFixture).forEach(name => { canon[normKey(name)] = name; });
const canonical = name => canon[normKey(name)] || String(name).normalize('NFC');
const isPayroll = name => /paie municipale|municipal payroll/i.test(name);

for (const month of applyMonths) {
  const allRows = byMonth[month] || [];
  const rows = allRows.filter(included);
  const totalRows = allRows.filter(totals);
  if (totalRows.length !== 1) throw new Error(`${month}: expected exactly one verified monthly-total row`);
  if (!rows.length) throw new Error(`${month}: no verified, included line items`);
  for (const row of rows) {
    const missing = required.filter(field => row[field] === '' || row[field] === null || row[field] === undefined);
    if (missing.length) throw new Error(`${month}: ${row.url} missing ${missing.join(', ')}`);
    if (!/^https:\/\/www\.ormstown\.ca\//.test(row['Source URL'])) throw new Error(`${month}: non-official Source URL on ${row.url}`);
    if (String(row['Fiscal Year']) !== month.slice(0, 4)) throw new Error(`${month}: fiscal year mismatch on ${row.url}`);
  }
  const lineCents = rows.reduce((sum, row) => sum + cents(row.Amount), 0);
  const adoptedCents = cents(totalRows[0].Amount);
  const toleranceCents = cents((D.provenance.tolerances || {})[month] || 0);
  if (Math.abs(adoptedCents - lineCents) !== Math.abs(toleranceCents)) {
    throw new Error(`${month}: refusing unreconciled data (${money(lineCents)} lines vs ${money(adoptedCents)} adopted)`);
  }

  payments[month] = rows.map(row => [
    canonical(row.Payee),
    row.Entry,
    cents(row.Amount) / 100,
    mapCategory(row.Payee, row.Entry, row.Category)
  ]);

  const total = totalRows[0];
  const year = Number(month.slice(0, 4));
  const monthIndex = Number(month.slice(5, 7)) - 1;
  const existingMonth = D.months.find(item => item.m === month);
  const monthRecord = existingMonth || {
    m: month,
    label_fr: `${monthNames.fr[monthIndex]} ${year}`,
    label_en: `${monthNames.en[monthIndex]} ${year}`,
    total: cents(total.Amount) / 100,
    coverage: 'full',
    session: total['Council Session'],
    url: total['Source URL'],
    cats: {}
  };
  monthRecord.total = cents(total.Amount) / 100;
  monthRecord.coverage = 'full';
  monthRecord.session = total['Council Session'];
  monthRecord.url = total['Source URL'];

  const groups = {};
  payments[month].forEach(([payee, entry, amount, category]) => {
    const key = normKey(payee) + '|' + category;
    const group = groups[key] ||= { payee, category, amount: 0, lines: 0 };
    group.amount += cents(amount);
    group.lines++;
  });
  const named = [], rest = {};
  Object.values(groups).forEach(group => {
    if (group.amount >= 100000 || isPayroll(group.payee)) named.push(group);
    else {
      const bucket = rest[group.category] ||= [0, 0];
      bucket[0] += group.amount;
      bucket[1] += group.lines;
    }
  });
  const entries = [
    ...named.sort((a, b) => b.amount - a.amount).map(group => [month, group.payee, group.category, group.amount / 100, group.lines]),
    ...Object.entries(rest).map(([category, [amount, lines]]) => [month, REST, category, amount / 100, lines])
  ];
  monthRecord.cats = {};
  entries.forEach(entry => {
    const bucket = monthRecord.cats[entry[2]] ||= [0, 0];
    bucket[0] += cents(entry[3]);
    bucket[1] += entry[4];
  });
  monthRecord.cats = Object.fromEntries(Object.entries(monthRecord.cats)
    .map(([category, [amount, lines]]) => [category, [amount / 100, lines]])
    .sort((a, b) => b[1][0] - a[1][0]));

  D.entries = D.entries.filter(entry => entry[0] !== month).concat(entries);
  if (!existingMonth) D.months.push(monthRecord);
  console.log(`APPLY ${month}: ${rows.length} lines, ${entries.length} public groups`);
}

D.months.sort((a, b) => a.m.localeCompare(b.m));
D.entries.sort((a, b) => a[0].localeCompare(b[0]));
D.generated = new Date().toISOString().slice(0, 10);
D.provenance.categories_method = METHOD;

fs.writeFileSync(paymentsFile, JSON.stringify(Object.fromEntries(Object.entries(payments).sort()), null, 0));
const source = fs.readFileSync(dataFile, 'utf8');
const objectAt = source.search(/^window\.OO_SPENDING/m);
const header = source.slice(0, objectAt).replace(/\/\/ Generated: \d{4}-\d{2}-\d{2}/, `// Generated: ${D.generated}`);
fs.writeFileSync(dataFile, header + 'window.OO_SPENDING = ' + JSON.stringify(D, null, 1) + ';\n');
console.log(`Wrote ${path.relative(process.cwd(), dataFile)} and ${path.relative(process.cwd(), paymentsFile)}`);
