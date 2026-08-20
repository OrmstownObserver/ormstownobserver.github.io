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

// ---- 7. Category slugs cover every category used by entries.
// Reads EVERY shipped script under finances/ rather than app.js alone: the
// SLUGS map lives in app.js for classic and in v2/ledger-data.js for the
// workspace, and app.js goes away at the swap.
const shipped = listScripts(dir);
const allScriptSrc = shipped.map(p => fs.readFileSync(p, 'utf8')).join('\n');
const usedCats = new Set(D.entries.map(e => e[2]));
for (const c of usedCats) {
  if (!allScriptSrc.includes(`'${c}'`)) fail(`no shipped script maps category "${c}" to a URL slug`);
}
ok(`every used category has a URL slug (${shipped.length} scripts scanned)`);

// ---- 8. payments.json (per-line detail): every month's lines sum to that
// month's itemized entries sum exactly (both derive from the ledger).
const payPath = path.join(dir, 'payments.json');
if (fs.existsSync(payPath)) {
  const P = JSON.parse(fs.readFileSync(payPath, 'utf8'));
  for (const m of D.months) {
    const entriesSum = r2(D.entries.filter(e => e[0] === m.m).reduce((a, e) => a + e[3], 0));
    const lines = P[m.m];
    if (!lines) { fail(`payments.json missing month ${m.m}`); continue; }
    const linesSum = r2(lines.reduce((a, l) => a + l[2], 0));
    if (linesSum !== entriesSum) fail(`payments.json ${m.m}: lines sum ${linesSum} != entries sum ${entriesSum}`);
    else ok(`payments.json ${m.m}: ${lines.length} lines sum to entries (${linesSum})`);
    for (const l of lines) {
      if (!Array.isArray(l) || l.length !== 4 || typeof l[0] !== 'string' || typeof l[1] !== 'string' || !Number.isFinite(l[2]) || typeof l[3] !== 'string') {
        fail(`payments.json ${m.m}: malformed line ${JSON.stringify(l)}`); break;
      }
    }
    // per-category line sums must reproduce the published category totals
    const byCat = {};
    lines.forEach(l => { byCat[l[3]] = r2((byCat[l[3]] || 0) + l[2]); });
    for (const [cat, [amt]] of Object.entries(m.cats)) {
      if (r2(byCat[cat] || 0) !== r2(amt)) fail(`payments.json ${m.m}/${cat}: lines ${byCat[cat] || 0} != published ${amt}`);
    }
    for (const cat of Object.keys(byCat)) {
      if (!(cat in m.cats)) fail(`payments.json ${m.m}: unknown category "${cat}" in lines`);
    }
  }
} else {
  ok('payments.json not present (per-line detail disabled)');
}

// ---- 9. i18n usage: every key a script reads exists in BOTH languages, and
// every key defined is read by something. Catches the typo class that only
// ever surfaced as "undefined" in the live UI, and the dead keys left behind
// when the workspace/reference split moved content around.
{
  const used = new Set();
  for (const src of shipped.map(p => fs.readFileSync(p, 'utf8'))) {
    for (const m of src.matchAll(/\bT\(\)\.([A-Za-z0-9_]+)/g)) used.add(m[1]);
    for (const m of src.matchAll(/\bt\.([A-Za-z0-9_]+)/g)) used.add(m[1]);
    for (const m of src.matchAll(/\.T\.([A-Za-z0-9_]+)/g)) used.add(m[1]);   // ctx.T.someKey
    for (const m of src.matchAll(/count\('([A-Za-z0-9_]+)'/g)) { used.add(m[1]); used.add(m[1] + 'One'); }
    for (const m of src.matchAll(/\bI18N\.(?:fr|en)\.([A-Za-z0-9_]+)/g)) used.add(m[1]);
  }
  // Keys reached through a computed name rather than a literal.
  const DYNAMIC = new Set([
    'orientPayments', 'orientPayees', 'orientCategories', 'orientSittings',
    'tocBudget', 'tocCapital', 'tocCoverage', 'tocMethod', 'tocDocuments', 'tocDictionary',
    'presetLegal', 'presetBig', 'presetPayroll', 'presetCredits'
  ]);
  let missing = 0, dead = 0;
  for (const k of used) {
    if (!(k in I.fr)) { missing++; fail(`a script reads t.${k} but the fr strings have no such key`); }
    if (!(k in I.en)) { missing++; fail(`a script reads t.${k} but the en strings have no such key`); }
  }
  for (const k of Object.keys(I.fr)) {
    if (!used.has(k) && !DYNAMIC.has(k)) { dead++; fail(`i18n key "${k}" is defined but no shipped script reads it`); }
  }
  if (!missing && !dead) ok(`all ${used.size} i18n keys read by scripts exist in both languages, and none are dead`);
}

// ---- 10. Cache-busting is manual and load-bearing (tools/README.md:35-39):
// a page served fresh alongside a stale script renders without charts. The
// invariant is per PAGE, not global — classic and the workspace are allowed
// to sit on different stamps while they run side by side, but a page and
// every script it loads must agree, INCLUDING a stamp a script carries
// internally (app.js's PAYMENTS_URL was stale for a week that way).
{
  const stampOf = new Map();      // finances-relative .js path -> its internal stamp
  for (const p of listFiles(dir, /\.js$/)) {
    const rel = path.relative(dir, p).split(path.sep).join('/');
    if (rel.startsWith('tools/') || rel.startsWith('tests/')) continue;
    const m = [...fs.readFileSync(p, 'utf8').matchAll(/\?v=([0-9a-zA-Z-]+)/g)].map(x => x[1]);
    const uniq = [...new Set(m)];
    if (uniq.length > 1) fail(`${rel} carries more than one ?v= stamp: ${uniq.join(', ')}`);
    if (uniq.length === 1) stampOf.set(rel, uniq[0]);
  }
  for (const p of listFiles(dir, /\.html$/)) {
    const rel = path.relative(dir, p).split(path.sep).join('/');
    if (rel.startsWith('tools/') || rel.startsWith('tests/')) continue;
    const src = fs.readFileSync(p, 'utf8');
    const own = [...new Set([...src.matchAll(/\?v=([0-9a-zA-Z-]+)/g)].map(x => x[1]))];
    if (own.length > 1) { fail(`${rel} mixes ?v= stamps: ${own.join(', ')}`); continue; }
    if (!own.length) continue;
    const stamp = own[0];
    // every script this page loads from finances/ must carry the same stamp
    const pageDir = path.posix.dirname(rel);
    for (const m of src.matchAll(/src="([^"]+?\.js)(?:\?[^"]*)?"/g)) {
      let ref = m[1];
      if (ref.startsWith('/finances/')) ref = ref.slice('/finances/'.length);
      else if (ref.startsWith('/') || /^https?:/.test(ref)) continue;
      else ref = path.posix.normalize(path.posix.join(pageDir === '.' ? '' : pageDir, ref));
      if (stampOf.has(ref) && stampOf.get(ref) !== stamp) {
        fail(`${rel} is stamped ${stamp} but loads ${ref}, which carries ${stampOf.get(ref)} internally`);
      }
    }
    ok(`${rel} and its scripts agree on ?v=${stamp}`);
  }
}

// ---- 11. The dark-mode category palette. The first attempt lifted the light
// hues at runtime and produced two categories 3 ΔE apart — indistinguishable.
// This asserts the shipped set stays separable and legible, so that failure
// cannot come back quietly.
{
  const src = fs.readFileSync(path.join(dir, 'v2', 'ledger-charts.js'), 'utf8');
  const block = /var DARK_CATS = \{([\s\S]*?)\n  \};/.exec(src);
  if (!block) fail('ledger-charts.js has no DARK_CATS palette');
  else {
    const dark = {};
    for (const m of block[1].matchAll(/'((?:[^'\\]|\\.)*)':\s*'(#[0-9a-f]{6})'/g)) dark[m[1]] = m[2];

    const used = new Set(D.entries.map(e => e[2]));
    for (const c of used) if (!dark[c]) fail(`category "${c}" has no dark-mode colour — it would fall back to the runtime lift`);

    const h2r = (h) => [1, 3, 5].map(i => parseInt(h.substr(i, 2), 16));
    const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    const lum = (h) => { const [r, g, b] = h2r(h); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
    const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const fl = (t) => t > 0.008856 ? Math.cbrt(t) : (7.787 * t + 16 / 116);
    const lab = (h) => {
      const [r, g, b] = h2r(h).map(v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
      const X = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047,
            Y = r * 0.2126 + g * 0.7152 + b * 0.0722,
            Z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
      return [116 * fl(Y) - 16, 500 * (fl(X) - fl(Y)), 200 * (fl(Y) - fl(Z))];
    };
    const dE = (a, b) => { const A = lab(a), B = lab(b); return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]); };

    const keys = Object.keys(dark);
    let min = Infinity, pair = null;
    for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) {
      const d = dE(dark[keys[i]], dark[keys[j]]);
      if (d < min) { min = d; pair = [keys[i], keys[j]]; }
    }
    const MIN_DE = 12;
    if (min < MIN_DE) fail(`dark palette: "${pair[0]}" and "${pair[1]}" are only ${min.toFixed(1)} ΔE apart (floor ${MIN_DE})`);

    // 4.5:1 against BOTH dark grounds observer.css defines
    let low = null;
    for (const g of ['#16150f', '#201e18']) {
      for (const k of keys) if (cr(dark[k], g) < 4.5) low = `${k} is ${cr(dark[k], g).toFixed(2)}:1 on ${g}`;
    }
    if (low) fail(`dark palette contrast below 4.5:1 — ${low}`);
    if (min >= MIN_DE && !low) ok(`dark palette: ${keys.length} colours, worst pair ${min.toFixed(1)} ΔE, all >= 4.5:1 on both dark grounds`);
  }
}

// ---- Result
if (failures) { console.error(`\n${failures} check(s) failed.`); process.exit(1); }
console.log('\nAll checks passed.');

function listFiles(root, re) {
  const out = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else if (re.test(e.name)) out.push(p);
    }
  })(root);
  return out.sort();
}
function listScripts(root) {
  return listFiles(root, /\.js$/).filter(p => {
    const rel = path.relative(root, p);
    return !rel.startsWith('tools' + path.sep) && !rel.startsWith('tests' + path.sep) && rel !== 'i18n.js' && rel !== 'spending-data.js';
  });
}
