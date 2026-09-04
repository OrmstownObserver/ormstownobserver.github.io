// Run: node finances/tools/extract-annexe.js <pv.pdf> <firstPage> <lastPage> [out.json]
//
// Extracts an Ormstown PV "Annexe A" payment table into [{payee, desc, amount,
// credit, page, y}], preserving the printed line order. Written for the 2025
// backfill, where `pdftotext -layout` scrambles the wrapped description column
// and silently drops parenthesised credits.
//
// How it works: `pdftotext -bbox-layout` gives every word an (x, y) box. Words
// are bucketed into three columns by x (payee / description / amount), grouped
// into text lines by y, and each line is attached to a payment row.
//
// Two cell alignments appear in the same document, so the alignment is detected
// per page from how often an amount's y coincides with a description line:
//   - "bottom": the amount sits on the LAST line of its cell (seen on the
//     « paiements à effectuer » pages)
//   - "centre": the amount is vertically centred in its cell (seen on the
//     « paiements émis durant le mois » pages)
// Getting this wrong shifts descriptions by one line without changing any
// amount, so ALWAYS reconcile the output against the printed block subtotals
// before trusting it.
//
// Credits print as "(1 234,56 $)" and are returned negative.
'use strict';
const fs = require('fs');
const { execFileSync } = require('child_process');

const [pdf, first, last, out] = process.argv.slice(2);
if (!pdf || !first || !last) {
  console.error('usage: node extract-annexe.js <pv.pdf> <firstPage> <lastPage> [out.json]');
  process.exit(1);
}

// Column boundaries in PDF points, measured from the 2025 PV template.
const PAYEE_MAX = 330, DESC_MAX = 515;
const PAGENUM = /^\d{3}$/;          // register page numbers sit alone in a column
const LABEL = /Paiements à effectuer|Salaire à autoriser|Total paiement émis|Grand total/i;

const tmp = `${require('os').tmpdir()}/annexe-${process.pid}.xml`;
execFileSync('pdftotext', ['-bbox-layout', '-f', String(first), '-l', String(last), pdf, tmp]);
const xml = fs.readFileSync(tmp, 'utf8');
fs.unlinkSync(tmp);

const words = [];
xml.split('<page ').slice(1).forEach((page, i) => {
  const re = /<word xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)<\/word>/g;
  let m;
  while ((m = re.exec(page))) {
    words.push({
      page: Number(first) + i, x0: +m[1], y0: +m[2], y1: +m[4],
      t: m[5].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    });
  }
});

const yc = (w) => (w.y0 + w.y1) / 2;
function lines(ws) {
  const out = [];
  ws.slice().sort((a, b) => yc(a) - yc(b) || a.x0 - b.x0).forEach((w) => {
    const l = out[out.length - 1];
    if (l && Math.abs(yc(l.ws[0]) - yc(w)) < 4) l.ws.push(w);
    else out.push({ ws: [w] });
  });
  return out
    .map((l) => ({ y: yc(l.ws[0]), text: l.ws.slice().sort((a, b) => a.x0 - b.x0).map((w) => w.t).join(' ') }))
    .filter((l) => !PAGENUM.test(l.text.trim()));
}
const assignBottom = (ls, an) => {
  const acc = an.map(() => []); let k = 0;
  ls.forEach((l) => { while (k < an.length - 1 && l.y > an[k].y + 2) k++; acc[k].push(l.text); });
  return acc.map((a) => a.join(' ').trim());
};
const assignNearest = (ls, an) => {
  const acc = an.map(() => []); let k = 0;
  ls.forEach((l) => {
    while (k < an.length - 1 && Math.abs(l.y - an[k + 1].y) < Math.abs(l.y - an[k].y)) k++;
    acc[k].push(l.text);
  });
  return acc.map((a) => a.join(' ').trim());
};

const byPage = {};
words.forEach((w) => { (byPage[w.page] = byPage[w.page] || []).push(w); });
const rows = [];
Object.keys(byPage).map(Number).sort((a, b) => a - b).forEach((pg) => {
  const ws = byPage[pg];
  const anchors = lines(ws.filter((w) => w.x0 >= DESC_MAX)).map((l) => {
    const j = l.text.replace(/\$/g, '').replace(/[\s  ]/g, '');
    if (!/,\d{2}\)?$/.test(j)) return null;
    const credit = /^\(/.test(j) && /\)$/.test(j);
    return { y: l.y, credit, amount: (credit ? -1 : 1) * parseFloat(j.replace(/[()]/g, '').replace(',', '.')) };
  }).filter(Boolean);
  if (!anchors.length) return;
  const dl = lines(ws.filter((w) => w.x0 >= PAYEE_MAX && w.x0 < DESC_MAX));
  const coincide = anchors.filter((a) => dl.some((l) => Math.abs(l.y - a.y) < 3)).length / anchors.length;
  const assign = coincide >= 0.9 ? assignBottom : assignNearest;
  const payees = assign(lines(ws.filter((w) => w.x0 < PAYEE_MAX)), anchors);
  const descs = assign(dl, anchors);
  anchors.forEach((a, i) => rows.push({
    page: pg, y: Math.round(a.y), align: coincide >= 0.9 ? 'bottom' : 'centre',
    payee: payees[i], desc: descs[i], amount: a.amount, credit: a.credit
  }));
});

const labels = rows.filter((r) => LABEL.test(`${r.payee} ${r.desc}`));
const data = rows.filter((r) => !LABEL.test(`${r.payee} ${r.desc}`));
const r2 = (x) => Math.round(x * 100) / 100;
console.error(`pages ${first}-${last}: ${data.length} payment rows, ${data.filter((r) => r.credit).length} credits`);
console.error(`alignment: ${[...new Set(rows.map((r) => `p${r.page}=${r.align}`))].join(' ')}`);
console.error(`sum of all rows: ${r2(data.reduce((s, r) => s + r.amount, 0)).toFixed(2)}  ` +
              '(split by block and reconcile against each printed subtotal before use)');
if (labels.length) console.error(`label rows skipped: ${labels.map((l) => `p${l.page}/${l.y}`).join(' ')}`);
const json = JSON.stringify(data, null, 1);
if (out) { fs.writeFileSync(out, json); console.error(`wrote ${out}`); } else console.log(json);
