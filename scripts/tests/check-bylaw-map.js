// Run: node scripts/tests/check-bylaw-map.js
// Checks the hand-authored question map (bylaw-map.json) against the REAL
// register snapshot, then boots bylaw-map.js unmodified under the ledger's
// DOM shim on the REAL hub pages and clicks through it in English and French.
// Exit 0 = pass, 1 = failure.
//
// Covers: every bylaw the map names exists in dist/bylaws.json and is not
// repealed; both languages are present for every label and point; links in
// the map are same-site and lead to pages that exist; textContent-only
// rendering; the path, the answer, the explainer and official links; the
// direct-list subjects; reset; the "every path" list; the failed-load case.
// What it cannot check (wires, layout, touch) needs a real browser.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { document, mountFromHTML } = require('../../finances/tests/dom-shim.js');

const ROOT = path.join(__dirname, '..', '..');
const MAP = JSON.parse(fs.readFileSync(path.join(ROOT, 'bylaw-map.json'), 'utf8'));
const SNAPSHOT = JSON.parse(fs.readFileSync(path.join(ROOT, 'dist', 'bylaws.json'), 'utf8'));
const SRC = fs.readFileSync(path.join(ROOT, 'bylaw-map.js'), 'utf8');
const SRC_CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

let failures = 0;
const fail = (m) => { failures++; console.error('FAIL  ' + m); };
const ok = (m) => console.log('ok    ' + m);
const check = (cond, m) => (cond ? ok(m) : fail(m));
const eq = (got, want, m) => (got === want ? ok(m) : fail(`${m}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`));
const settle = async () => { for (let i = 0; i < 6; i++) await new Promise((r) => setTimeout(r, 0)); };

const BY_NUMBER = {};
SNAPSHOT.records.forEach((r) => { BY_NUMBER[r.bylaw_number] = r; });
const SHOWN = ['In force', 'Amended', 'Draft'];

// every node, with its path of ids
const NODES = [];
(function walk(n, trail) {
  (n.children || []).forEach((c) => { NODES.push({ node: c, trail: trail.concat(c.id) }); walk(c, trail.concat(c.id)); });
})(MAP.root, []);
const LEAVES = NODES.filter((x) => !x.node.children);

async function boot(langPath, opts) {
  opts = opts || {};
  mountFromHTML(path.join(ROOT, langPath.replace(/^\//, ''), 'index.html'));
  const win = {
    document,
    location: { pathname: langPath, search: '', hash: '' },
    addEventListener() {},
    setTimeout, clearTimeout, Promise, JSON, Math, Array, Object, String, Number, RegExp, console,
    fetch: (url) => {
      if (opts.fail) return Promise.reject(new Error('offline'));
      const body = url === '/bylaw-map.json' ? MAP : url === '/dist/bylaws.json' ? SNAPSHOT : null;
      if (!body) return Promise.resolve({ ok: false, status: 404, json: () => Promise.reject(new Error('404')) });
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve(JSON.parse(JSON.stringify(body))) });
    }
  };
  win.window = win;
  document.defaultView = win;
  vm.runInContext(SRC, vm.createContext(win), { filename: 'bylaw-map.js' });
  await settle();
  return win;
}
const $ = (id) => document.getElementById(id);
const byClass = (cls, root) => (root || document.body).find((n) => n.classList && n.classList.contains(cls));
const nodesAt = (d) => {
  const lv = byClass('bmap-level').filter((l) => !l.classList.contains('bmap-result'))[d];
  return lv ? byClass('bmap-node', lv) : [];
};
const label = (b) => byClass('bmap-lbl', b)[0].textContent;
const click = async (d, text) => {
  const b = nodesAt(d).find((n) => label(n) === text);
  if (!b) { fail(`no box "${text}" at step ${d + 1}`); return; }
  b.click(); await settle();
};
const laws = () => byClass('bmap-law');
const hrefs = (n) => n.find((x) => x.tagName === 'A').map((a) => a.getAttribute('href'));

(async function main() {
  /* ---------- static ---------- */
  check(!/\binnerHTML\b|outerHTML\s*=|insertAdjacentHTML|document\.write/.test(SRC_CODE), 'renderer builds DOM with textContent only (no innerHTML)');

  {
    const ids = NODES.map((x) => x.node.id);
    eq(new Set(ids).size, ids.length, 'every map node has a unique id');
    check(ids.every((id) => /^[a-z0-9-]+$/.test(id)), 'ids are lowercase slugs');
    const both = (o) => o && typeof o.en === 'string' && o.en.trim() && typeof o.fr === 'string' && o.fr.trim();
    check(both(MAP.root.prompt), 'the first question exists in both languages');
    const missing = NODES.filter((x) => !both(x.node.label) || (x.node.hint && !both(x.node.hint)) || (x.node.children && !both(x.node.prompt)));
    check(!missing.length, 'every label, hint and question exists in English and French' + (missing.length ? ': ' + missing.map((x) => x.node.id).join(', ') : ''));
    const shapeless = NODES.filter((x) => !!x.node.children === !!x.node.answer);
    check(!shapeless.length, 'every node either asks a further question or gives an answer, never both' + (shapeless.length ? ': ' + shapeless.map((x) => x.node.id).join(', ') : ''));

    const problems = [];
    LEAVES.forEach(({ node }) => {
      const items = (node.answer && node.answer.items) || [];
      if (!items.length) problems.push(`${node.id}: no bylaws`);
      if (node.answer.intro && !both(node.answer.intro)) problems.push(`${node.id}: intro not in both languages`);
      items.forEach((it) => {
        const r = BY_NUMBER[it.bylaw];
        if (!r) { problems.push(`${node.id}: "${it.bylaw}" is not in dist/bylaws.json`); return; }
        if (!SHOWN.includes(r.status)) problems.push(`${node.id}: "${it.bylaw}" is ${r.status || 'unverified'}, not current`);
        if (it.points) {
          const en = it.points.en || [], fr = it.points.fr || [];
          if (en.length !== fr.length || !en.length) problems.push(`${node.id}: ${it.bylaw} points differ between languages`);
        }
        if (it.link) {
          for (const lg of ['en', 'fr']) {
            const href = it.link.href && it.link.href[lg];
            if (!/^\/(en|fr)\/[a-z0-9\-\/]*$/.test(href || '') || !href.startsWith('/' + lg + '/')) problems.push(`${node.id}: ${lg} link "${href}" is not a same-site ${lg} path`);
            else if (!fs.existsSync(path.join(ROOT, href, 'index.html'))) problems.push(`${node.id}: ${lg} link "${href}" has no page`);
          }
          if (!both(it.link.label)) problems.push(`${node.id}: link label not in both languages`);
        }
      });
    });
    check(!problems.length, `every answer names current bylaws from the snapshot, in both languages (${LEAVES.length} answers)` + (problems.length ? ':\n      ' + problems.join('\n      ') : ''));

    // Not a failure: tells the editor which current bylaws no path reaches yet.
    const reached = new Set(LEAVES.flatMap(({ node }) => node.answer.items.map((it) => it.bylaw)));
    const current = SNAPSHOT.records.filter((r) => ['In force', 'Amended'].includes(r.status));
    const unreached = current.filter((r) => !reached.has(r.bylaw_number));
    console.log(`info  the map reaches ${current.length - unreached.length} of ${current.length} current bylaws; not yet on any path: ${unreached.map((r) => r.bylaw_number.replace(/^Règlement\s+/, '')).join(', ')}`);

    for (const page of ['en/bylaws-regulations/index.html', 'fr/bylaws-regulations/index.html']) {
      const html = fs.readFileSync(path.join(ROOT, page), 'utf8');
      check(/<section class="bmap" id="bylaw-map"[^>]*\bhidden\b/.test(html), `${page}: the map section ships hidden (no-JS readers get the register only)`);
      check(/<script src="\/bylaw-map\.js\?v=\d{8}-\d+" defer><\/script>/.test(html), `${page}: loads bylaw-map.js with a version pin`);
    }
  }

  /* ---------- EN ---------- */
  await boot('/en/bylaws-regulations/');
  check(!$('bylaw-map').hidden, 'EN: both files load and the map section appears');
  eq(nodesAt(0).length, MAP.root.children.length, 'EN: step 1 offers every top-level subject');
  check($('bmap-reset').hidden, 'EN: "Start over" is hidden before any choice');
  {
    const home = nodesAt(0).find((b) => label(b) === 'Your house & lot');
    const count = byClass('bmap-count', home)[0];
    check(!!count && /^\d+ explainers?$/.test(count.textContent), 'EN: a subject shows how many explainers lie down its branch');
  }
  await click(0, 'Your house & lot');
  eq(nodesAt(1).length, 4, 'EN: choosing a subject opens step 2 below it');
  check(!$('bmap-reset').hidden, 'EN: "Start over" appears once a choice is made');
  await click(1, 'Trees & land');
  await click(2, 'Cut down a tree');
  {
    const L = laws();
    eq(L.length, 1, 'EN: "Cut down a tree" names one bylaw');
    const r = BY_NUMBER['Règlement 148-2023'];
    eq(byClass('bmap-num', L[0])[0].textContent, 'Règlement 148-2023', 'EN: the answer shows the bylaw number from the snapshot');
    eq(byClass('bmap-title', L[0])[0].textContent, r.title_en, 'EN: the title comes from the snapshot');
    check(hrefs(L[0]).includes(r.official_url), 'EN: the official link is the snapshot URL');
    check(hrefs(L[0]).includes(r.explainer.en), 'EN: the explainer link is the English explainer');
    check(/12\.8/.test(L[0].textContent), 'EN: the answer carries the map\'s points');
    const off = L[0].find((a) => a.tagName === 'A' && a.getAttribute('href') === r.official_url)[0];
    eq(off.getAttribute('rel'), 'noopener', 'EN: the official link opens with rel=noopener');
  }
  // choosing the same box again changes nothing; changing an early step drops the rest
  await click(0, 'Your house & lot');
  eq(laws().length, 1, 'EN: clicking the current choice again keeps the answer');
  await click(0, 'Pets & animals');
  eq(laws().length, 0, 'EN: changing step 1 clears the old answer');
  eq(nodesAt(1).length, 3, 'EN: and opens the new subject\'s step 2');
  // a subject that goes straight to a list
  await click(0, 'Roads & parking');
  eq(laws().length, MAP.root.children.find((c) => c.id === 'roads').answer.items.length, 'EN: a direct-list subject lists its bylaws at once');
  check(byClass('bmap-q').some((n) => n.textContent === 'Bylaws on this subject'), 'EN: and labels them as bylaws on this subject');
  // every law card has an official link or says it has none, and never shows a repealed bylaw
  for (const { trail } of LEAVES) {
    $('bmap-reset').click(); await settle();
    for (let d = 0; d < trail.length; d++) {
      const target = NODES.find((x) => x.node.id === trail[d]).node;
      await click(d, target.label.en);
    }
  }
  ok(`EN: all ${LEAVES.length} answers were reached by clicking through the map`);
  $('bmap-reset').click(); await settle();
  eq(laws().length, 0, 'EN: "Start over" returns to step 1');
  eq(nodesAt(1).length, 0, 'EN: with nothing below it');
  // every path list
  eq(byClass('bmap-t-branch').length + byClass('bmap-t-leaf').length, NODES.length, 'EN: "See every path" lists every node');
  $('bmap-whole').click(); await settle();
  check(!$('bmap-outline').hidden, 'EN: "See every path" opens the list');
  eq($('bmap-whole').getAttribute('aria-expanded'), 'true', 'EN: and says so to screen readers');
  byClass('bmap-t-leaf').find((b) => b.textContent === 'Keeping backyard hens').click(); await settle();
  eq(laws().length, 1, 'EN: choosing a line in the list opens that answer in the map');
  check(nodesAt(0).some((b) => b.classList.contains('is-on') && label(b) === 'Pets & animals'), 'EN: with its path marked');

  /* ---------- FR ---------- */
  await boot('/fr/bylaws-regulations/');
  check(!$('bylaw-map').hidden, 'FR: the map section appears');
  check(byClass('bmap-n')[0].textContent === 'Étape 1', 'FR: steps are labelled in French');
  check(nodesAt(0).some((b) => label(b) === 'Votre maison et votre terrain'), 'FR: subjects are in French');
  await click(0, 'Animaux');
  await click(1, 'Garder des poules');
  {
    const L = laws(), r = BY_NUMBER['Règlement 131-2026'];
    eq(byClass('bmap-title', L[0])[0].textContent, r.title_fr, 'FR: the French page shows the French title');
    check(hrefs(L[0]).includes(r.explainer.fr), 'FR: the explainer link is the French explainer');
    eq(byClass('status', L[0])[0].textContent, 'En vigueur', 'FR: status is in French');
    check(/poules/.test(L[0].textContent) && !/hens/.test(L[0].textContent), 'FR: the points are the French ones');
  }

  /* ---------- failed load ---------- */
  await boot('/en/bylaws-regulations/', { fail: true });
  check($('bylaw-map').hidden, 'a failed load leaves the map hidden (the register still works)');

  console.log(failures ? `\n${failures} check(s) FAILED.` : '\nAll bylaw map checks passed.');
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
