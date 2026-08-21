// Run: node finances/tests/render-check-offline.js
// The degraded paths. /finances/ claims every figure is verifiable, so the
// one thing it must never do is go blank: if payments.json is slow the
// reader is told, and if it never arrives they get an honest notice plus the
// official sources — not an empty table.
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dir = path.join(__dirname, '..');
let failures = 0;
const fail = (m) => { failures++; console.error('FAIL  ' + m); };
const ok = (m) => console.log('ok    ' + m);

function boot(fetchImpl) {
  // A fresh shim per scenario: the shim's document is a module singleton.
  delete require.cache[require.resolve('./dom-shim.js')];
  const shim = require('./dom-shim.js');
  const { document } = shim;
  shim.mountFromHTML(path.join(dir, 'index.html'));
  const ls = {};
  const win = {
    document,
    navigator: { language: 'fr-CA' },
    localStorage: { getItem: (k) => (k in ls ? ls[k] : null), setItem: (k, v) => { ls[k] = String(v); } },
    location: { pathname: '/finances/', search: '', hash: '', origin: 'http://x' },
    history: { pushState() {}, replaceState() {} },
    matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
    MutationObserver: class { observe() {} },
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    setTimeout, clearTimeout, Promise, URLSearchParams, Intl, Math, JSON, Date, isFinite,
    Number, String, Object, Array, console,
    URL: { createObjectURL: () => 'b' }, Blob: class {},
    addEventListener() {},
    obsSetLang: function () { win._houseCalled = true; },
    fetch: fetchImpl
  };
  win.window = win;
  const ctx = vm.createContext(win);
  const run = (p) => vm.runInContext(fs.readFileSync(p, 'utf8'), ctx, { filename: p });
  run(path.join(dir, 'spending-data.js'));
  run(path.join(dir, 'i18n.js'));
  run(path.join(dir, 'ledger-data.js'));
  run(path.join(dir, 'ledger-charts.js'));
  run(path.join(dir, 'ledger-views.js'));
  run(path.join(dir, 'ledger-app.js'));
  return { win, document };
}

(async function () {
  const tick = () => new Promise((r) => setTimeout(r, 10));

  // ---- 1. slow network: the reader is told, and the page is not blank
  {
    const { document } = boot(() => new Promise(() => {}));   // never settles
    await tick();
    const p = document.getElementById('panel-payments');
    if (p.hidden) fail('the payments panel is hidden while loading');
    else if (!p.textContent.trim()) fail('the page is BLANK while payments.json is in flight');
    else ok('while loading, the reader sees: "' + p.textContent.trim().slice(0, 60) + '"');
    if (p.getAttribute('aria-busy') !== 'true') fail('the loading panel is not marked aria-busy');
    else ok('the loading panel is marked aria-busy');
  }

  // ---- 2. the fetch fails: an honest notice, a retry, and a live page
  {
    const { win, document } = boot(() => Promise.reject(new Error('offline')));
    await tick(); await tick();
    const p = document.getElementById('panel-payments');
    const txt = p.textContent;
    if (!txt.trim()) { fail('the page is BLANK when payments.json fails - the worst outcome'); }
    else ok('a failed load still renders something');
    if (!/vérifiable|verifiable/i.test(txt)) fail('the failure notice does not say the figures are still verifiable in the minutes');
    else ok('the failure notice points the reader at the official minutes');
    const retry = p.find((n) => n.tagName === 'BUTTON');
    if (!retry.length) fail('no retry button on the failure notice');
    else ok('the failure notice offers a retry');
    if (p.getAttribute('aria-busy') === 'true') fail('the failed panel is still marked aria-busy');
    else ok('aria-busy is cleared on failure');

    // the language toggle must survive a failed load: wiring happens on boot,
    // not on the fetch's success path
    if (typeof win.obsSetLang !== 'function') fail('obsSetLang is missing');
    win.obsSetLang('en');
    const t2 = document.getElementById('panel-payments').textContent;
    if (!/verifiable/i.test(t2)) fail('the language toggle is dead after a failed load');
    else ok('the language toggle still works after a failed load');
    if (!document.getElementById('deck').textContent) fail('the page head did not render after a failed load');
    else ok('the page head and status line still render');
  }

  // ---- 3. spending-data.js itself missing: the bilingual hard-fail
  {
    delete require.cache[require.resolve('./dom-shim.js')];
    const shim = require('./dom-shim.js');
    shim.mountFromHTML(path.join(dir, 'index.html'));
    const win = {
      document: shim.document, navigator: { language: 'fr' },
      localStorage: { getItem: () => null, setItem() {} },
      location: { pathname: '/finances/', search: '', hash: '', origin: 'http://x' },
      history: { replaceState() {}, pushState() {} },
      matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
      MutationObserver: class { observe() {} },
      getComputedStyle: () => ({ getPropertyValue: () => '' }),
      setTimeout, clearTimeout, Promise, URLSearchParams, Intl, Math, JSON, Date, isFinite,
      Number, String, Object, Array, console,
      URL: { createObjectURL: () => 'b' }, Blob: class {}, addEventListener() {},
      fetch: () => Promise.reject(new Error('x'))
    };
    win.window = win;
    const ctx = vm.createContext(win);
    // i18n loads, spending-data.js does NOT
    vm.runInContext(fs.readFileSync(path.join(dir, 'i18n.js'), 'utf8'), ctx);
    ['ledger-data.js', 'ledger-charts.js', 'ledger-views.js', 'ledger-app.js']
      .forEach((f) => vm.runInContext(fs.readFileSync(path.join(dir, f), 'utf8'), ctx, { filename: f }));
    const err = shim.document.getElementById('data-error');
    if (err.hidden) fail('no visible error when spending-data.js is missing');
    else if (!/\/ /.test(err.textContent)) fail('the hard-fail message is not bilingual: ' + err.textContent);
    else ok('a missing spending-data.js produces a visible bilingual failure');
  }

  console.log(failures ? `\n${failures} check(s) failed.` : '\nAll degraded-path checks passed.');
  process.exit(failures ? 1 : 0);
})();
