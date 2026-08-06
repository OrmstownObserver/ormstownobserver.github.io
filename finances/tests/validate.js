// Run: node finances/tests/validate.js
// Validates the public-money explorer's data and interface strings.
// Exit code 0 = all checks pass; 1 = failure (message on stderr).
'use strict';
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..');
const window = {};
eval(fs.readFileSync(path.join(dir, 'spending-data.js'), 'utf8'));
eval(fs.readFileSync(path.join(dir, 'i18n.js'), 'utf8'));
const D = window.OO_SPENDING;
const I = window.OO_I18N;

let failures = 0;
const fail = (msg) => { failures++; console.error('FAIL  ' + msg); };
const ok = (msg) => console.log('ok    ' + msg);
const r2 = (x) => Math.round(x * 100) / 100;

// ---- 1. Reconciliation: every itemized period's lines sum to the adopted
// total within the documented tolerance (provenance.tolerances).
const tolerances = (D.provenance && D.provenance.tolerances) || {};
for (const m of D.months) {
  const sum = r2(D.entries.filter(e => e[0] === m.m).reduce((a, e) => a + e[3], 0));
  const catSum = r2(Object.values(m.cats).reduce((a, v) => a + v[0], 0));
  if (sum !== catSum) fail(`${m.m}: entries (${sum}) != category totals (${catSum})`);
  if (m.coverage === 'full') {
    const tol = (tolerances[m.m] != null ? tolerances[m.m] : 0) + 0.005;
    const gap = Math.abs(sum - m.total);
    if (gap > tol) fail(`${m.m}: itemized ${sum} vs adopted ${m.total} — gap ${r2(gap)} exceeds tolerance ${tol}`);
    else ok(`${m.m} reconciles (gap ${r2(m.total - sum)}, tolerance ${tol})`);
  } else {
    if (sum > m.total + 0.005) fail(`${m.m}: partial itemization (${sum}) exceeds adopted total (${m.total})`);
    else ok(`${m.m} partial: ${sum} of ${m.total}`);
  }
}

// ---- 2. Schema: every entry references a known month and category;
// amounts are finite numbers; line counts are positive integers.
const monthIds = new Set(D.months.map(m => m.m));
for (const e of D.entries) {
  if (!monthIds.has(e[0])) fail(`entry references unknown month ${e[0]}`);
  if (!D.categories[e[2]]) fail(`entry references unknown category "${e[2]}"`);
  if (!Number.isFinite(e[3])) fail(`entry has non-numeric amount: ${JSON.stringify(e)}`);
  if (!Number.isInteger(e[4]) || e[4] < 1) fail(`entry has bad line count: ${JSON.stringify(e)}`);
}
ok(`${D.entries.length} entries reference valid months/categories`);

// ---- 3. Every month has a source URL, session string with a parseable
// sitting date, and coverage flag.
for (const m of D.months) {
  if (!/^https:\/\/www\.ormstown\.ca\//.test(m.url)) fail(`${m.m}: source URL is not ormstown.ca (${m.url})`);
  if (!/\d{4}-\d{2}-\d{2}/.test(m.session)) fail(`${m.m}: session string has no sitting date ("${m.session}")`);
  if (m.coverage !== 'full' && m.coverage !== 'partial') fail(`${m.m}: bad coverage "${m.coverage}"`);
}
ok('all months carry ormstown.ca sources, sitting dates and coverage flags');

// ---- 4. Provenance metadata present (official vs Observer-made fields).
if (!D.provenance || !D.provenance.categories_method) fail('provenance metadata missing');
else ok(`provenance: ${D.provenance.categories_method}`);

// ---- 5. i18n: FR and EN expose exactly the same keys; templates use the
// same {slots}; arrays have equal lengths; no mixed-language sentinel.
const kf = Object.keys(I.fr).sort(), ke = Object.keys(I.en).sort();
const missEn = kf.filter(k => !(k in I.en)), missFr = ke.filter(k => !(k in I.fr));
if (missEn.length) fail('i18n keys missing in EN: ' + missEn.join(', '));
if (missFr.length) fail('i18n keys missing in FR: ' + missFr.join(', '));
const slots = s => (String(s).match(/\{(\w+)\}/g) || []).sort().join(',');
for (const k of kf) {
  const f = I.fr[k], e = I.en[k];
  if (typeof f === 'string' && typeof e === 'string' && slots(f) !== slots(e))
    fail(`i18n template slots differ for "${k}": FR(${slots(f)}) vs EN(${slots(e)})`);
  if (Array.isArray(f) && (!Array.isArray(e) || f.length !== e.length))
    fail(`i18n array length differs for "${k}"`);
}
for (const lang of ['fr', 'en']) {
  for (const k of ['payeeRest', 'payeePayroll']) {
    if (/\//.test(I[lang][k])) fail(`i18n ${lang}.${k} still contains a mixed-language slash label`);
  }
}
ok('i18n key parity, template slots, and single-language sentinels');

// ---- 6. Budget: functions sum to the adopted totals (both years).
const B = D.budget;
const sum26 = B.functions.reduce((a, f) => a + f.b, 0);
const sum25 = B.functions.reduce((a, f) => a + f.prev, 0);
if (sum26 !== B.expenses_total) fail(`budget functions sum ${sum26} != expenses_total ${B.expenses_total}`);
else ok(`budget ${B.year} functions sum to adopted total`);
if (sum25 !== B.expenses_total_prev) fail(`budget prev functions sum ${sum25} != expenses_total_prev ${B.expenses_total_prev}`);
else ok(`budget ${B.year - 1} functions sum to adopted total`);

// ---- 7. Category slugs in app.js cover every category used by entries.
const app = fs.readFileSync(path.join(dir, 'app.js'), 'utf8');
const usedCats = new Set(D.entries.map(e => e[2]));
for (const c of usedCats) {
  if (!app.includes(`'${c}'`)) fail(`app.js SLUGS map is missing category "${c}"`);
}
ok('every used category has a URL slug in app.js');

// ---- Result
if (failures) { console.error(`\n${failures} check(s) failed.`); process.exit(1); }
console.log('\nAll checks passed.');
