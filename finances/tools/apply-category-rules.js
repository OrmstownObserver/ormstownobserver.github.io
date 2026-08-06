// Run: node finances/tools/apply-category-rules.js
// Applies the Observer's payee-based category refinement rules (v2) to
// spending-data.js: moves named payees from the broad categories into
// Utilities, Vehicle fuel & maintenance, and Waste & recycling collection,
// then recomputes every month's category totals from its entries.
// Official amounts and line counts are never changed — only the
// Observer-assigned category labels. Idempotent.
'use strict';
const fs = require('fs');
const path = require('path');
const FILE = path.join(__dirname, '..', 'spending-data.js');

const window = {};
eval(fs.readFileSync(FILE, 'utf8'));
const D = window.OO_SPENDING;
const r2 = (x) => Math.round(x * 100) / 100;

// ---- Category definitions (added if missing) ----
const NEW_CATS = {
  'Utilities': { fr: 'Services publics (électricité, télécom, propane)', en: 'Utilities (electricity, telecom, propane)', color: '#8175aa' },
  'Vehicle fuel & maintenance': { fr: 'Carburant et entretien des véhicules', en: 'Vehicle fuel & maintenance', color: '#9c755f' },
  'Waste & recycling': { fr: 'Collecte des ordures et du recyclage', en: 'Garbage & recycling collection', color: '#d37295' }
};

// ---- Payee rules: regex on the payee name → new category.
// Grouped "— Autres fournisseurs" rest lines are never touched (mixed payees).
const RULES = [
  [/^Hydro-Québec$/i, 'Utilities'],
  [/^Bell Canada$/i, 'Utilities'],
  [/^Bell Mobilité$/i, 'Utilities'],
  [/^Énergie P38/i, 'Utilities'],
  [/9534-8702/, 'Vehicle fuel & maintenance'],           // Petro Canada
  [/^C\.?\s?S\.? Brunette/i, 'Vehicle fuel & maintenance'],
  [/^Harnois Énergies/i, 'Vehicle fuel & maintenance'],
  [/^SPH Services Pétrolier/i, 'Vehicle fuel & maintenance'],
  [/^9141855 Canada/, 'Vehicle fuel & maintenance'],      // vehicle maintenance
  [/^Garage C\.P\./i, 'Vehicle fuel & maintenance'],
  [/^Garage S\.D\./i, 'Vehicle fuel & maintenance'],
  [/^Remorquage Brunette/i, 'Vehicle fuel & maintenance'],
  [/^Pièces d'Auto Valleyfield/i, 'Vehicle fuel & maintenance'],
  [/^SAAQ/i, 'Vehicle fuel & maintenance'],               // vehicle registrations
  [/^Robert Daoust/i, 'Waste & recycling']                // garbage & recycling collection
];

Object.keys(NEW_CATS).forEach(function (k) { if (!D.categories[k]) D.categories[k] = NEW_CATS[k]; });

// ---- Apply rules to entries ----
let moved = 0;
const moves = {};
D.entries.forEach(function (e) {
  const payee = e[1];
  if (/^—/.test(payee)) return; // sentinels (payroll, grouped rest) stay put
  for (const [re, cat] of RULES) {
    if (re.test(payee)) {
      if (e[2] !== cat) {
        moves[payee + ': ' + e[2] + ' → ' + cat] = (moves[payee + ': ' + e[2] + ' → ' + cat] || 0) + 1;
        e[2] = cat; moved++;
      }
      return;
    }
  }
});

// ---- Recompute months[].cats from entries (amounts + line counts) ----
D.months.forEach(function (m) {
  const by = {};
  D.entries.filter(function (e) { return e[0] === m.m; }).forEach(function (e) {
    by[e[2]] = by[e[2]] || [0, 0];
    by[e[2]][0] = r2(by[e[2]][0] + e[3]);
    by[e[2]][1] += e[4];
  });
  m.cats = Object.fromEntries(Object.entries(by).sort(function (a, b) { return b[1][0] - a[1][0]; }));
});

// ---- Provenance bump ----
D.provenance = D.provenance || {};
D.provenance.categories_method = 'observer-rules-v2';
D.provenance.categories_note = 'v2 (2026-08-06): payee-based refinement rules split Utilities, Vehicle fuel & maintenance, and Waste & recycling collection out of the broad categories. Rules live in finances/tools/apply-category-rules.js and are re-applied after each data regeneration. Grouped small-line rest rows keep their original broad category.';

// ---- Verify: every month's entries still sum to its category totals and,
// for full months, to the adopted total (within documented tolerance) ----
const tolerances = D.provenance.tolerances || {};
let ok = true;
D.months.forEach(function (m) {
  const sum = r2(D.entries.filter(function (e) { return e[0] === m.m; }).reduce(function (a, e) { return a + e[3]; }, 0));
  const catSum = r2(Object.values(m.cats).reduce(function (a, v) { return a + v[0]; }, 0));
  if (sum !== catSum) { ok = false; console.error('MISMATCH', m.m, sum, catSum); }
  if (m.coverage === 'full') {
    const tol = (tolerances[m.m] != null ? tolerances[m.m] : 0) + 0.005;
    if (Math.abs(sum - m.total) > tol) { ok = false; console.error('RECON FAIL', m.m, sum, m.total); }
  }
});
if (!ok) process.exit(1);

// ---- Write back, preserving the header comment ----
const src = fs.readFileSync(FILE, 'utf8');
// The header comment mentions "window.OO_SPENDING", so anchor on the
// assignment at line start, not the first occurrence of the name.
const idx = src.search(/^window\.OO_SPENDING/m);
if (idx < 0) { console.error('Could not find the window.OO_SPENDING assignment.'); process.exit(1); }
const header = src.slice(0, idx);
fs.writeFileSync(FILE, header + 'window.OO_SPENDING = ' + JSON.stringify(D, null, 1) + ';\n');

console.log(moved + ' entry group(s) recategorized:');
Object.keys(moves).sort().forEach(function (k) { console.log('  ' + k + ' (' + moves[k] + ')'); });
console.log('Category totals recomputed for ' + D.months.length + ' months; all reconciliation checks pass.');
