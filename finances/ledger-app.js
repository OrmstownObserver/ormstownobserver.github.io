/* ============================================================
   Ormstown Observer — municipal ledger: APP
   ------------------------------------------------------------
   Owns state, the URL, the filter rail, the tab router and boot.

   ── THE URL CONTRACT (frozen; do not change a name or a value
      without a migration entry below) ─────────────────────────
     lang      fr | en                       localStorage > navigator > fr
     tab       payments|payees|categories|sittings      payments
     scope     all | 2025 | 2026                        all
     sitting   comma list of YYYY-MM                    none (= all in scope)
     category  comma list of category slugs             none (= all)
     q         free text, trimmed, <=120 chars          none
     min,max   number in CAD, may be negative           none
     sort      field:dir, field in
               payee|category|sitting|amount|description|lines|sittings
                                                        amount:desc
     payee     payee slug — opens the profile           none
     payeeScope filters — opt the profile into the rail's filters
                (absent = the profile shows every sitting, so a link
                 pasted into an article means the same to everyone)

   Deliberately NOT in the URL: the reveal count, which rail groups
   are open, whether the mobile sheet is open. A shared link should
   reproduce a RESULT SET, not a scroll position.

   ── LEGACY URLs THAT MUST RESOLVE FOREVER ──────────────────────
   Published in articles, in the site nav (observer-header.js:242)
   and in readers' histories:
     /finances/                    -> tab=payments, scope=all
     ?lang=fr | ?lang=en           -> unchanged
     ?year=2025                    -> scope=2025      (permanent alias)
     ?period=2026-05,2026-06       -> sitting=…       (permanent alias)
     ?category=legal-services      -> unchanged; NEVER rename a slug
   One behaviour change, and it is a fix: classic validated ?period=
   against the selected year's months and silently dropped the rest
   (app.js:136-139), so ?period=2025-11 with no ?year= resolved to an
   empty page. Here an out-of-scope sitting WIDENS scope to all.
   ============================================================ */
(function (global) {
  'use strict';

  var L = global.OO_LEDGER, V = global.OO_LEDGER_VIEWS, C = global.OO_LEDGER_CHARTS;
  var D = global.OO_SPENDING || null;
  var I18N = global.OO_I18N;
  var $ = function (id) { return document.getElementById(id); };

  var PAYMENTS_URL = '/finances/payments.json?v=20260902-2';
  var PAGE_SIZE = 150, PAGE_STEP = 250, PROFILE_PAGE = 100, PROFILE_STEP = 200;
  var EXPECTED_LINES = 2138;   // only ever used to word the loading message

  var store = null, loading = true, linesFailed = false;
  var state = {
    lang: 'fr', tab: 'categories', scope: '',
    sittings: [], categories: [], q: '', min: '', max: '',
    sort: 'amount:desc', payee: '', payeeScope: ''
  };
  var revealed = PAGE_SIZE, profileRevealed = PROFILE_PAGE;
  var idxCache = null, aggCache = null, printRestore = null;
  var pendingCharts = [];
  var lastFocus = null;

  function T() { return I18N[state.lang]; }
  function f() { return V.fmt(state.lang); }

  /* ============================================================
     URL
     ============================================================ */
  // Tab order runs from the overview to the raw record: where the money went,
  // which sitting approved it, who was paid, then every individual line.
  var DEFAULTS = { tab: 'categories', sort: 'amount:desc' };
  var TABS = ['categories', 'sittings', 'payees', 'payments'];
  // The default year is the most recent one in the data, not a hardcoded
  // year — this must not need editing when 2027's first sitting lands.
  // "All" stays one pill away, and it is what cross-year work uses.
  function defaultScope() {
    var y = years();
    return y[y.length - 1] || 'all';
  }

  function readURL() {
    var p = new URLSearchParams(location.search);

    var lang = p.get('lang');
    if (lang === 'fr' || lang === 'en') state.lang = lang;
    else {
      try {
        var l = localStorage.getItem('observerLang');
        state.lang = (l === 'fr' || l === 'en') ? l
          : ((navigator.language || 'fr').toLowerCase().indexOf('en') === 0 ? 'en' : 'fr');
      } catch (e) { state.lang = 'fr'; }
    }

    var tab = p.get('tab');
    state.tab = TABS.indexOf(tab) >= 0 ? tab : DEFAULTS.tab;

    // scope, with ?year= as a permanent alias
    var scope = p.get('scope') || p.get('year') || defaultScope();
    state.scope = (scope === 'all' || years().indexOf(scope) >= 0) ? scope : defaultScope();

    // sitting, with ?period= as a permanent alias
    var sit = (p.get('sitting') || p.get('period') || '').split(',')
      .filter(function (id) { return !!(D.months || []).filter(function (m) { return m.m === id; })[0]; });
    state.sittings = sit.sort();
    // A requested sitting outside the scope widens the scope rather than
    // being dropped — a legacy link must never resolve to an empty page.
    if (state.scope !== 'all' && state.sittings.some(function (id) { return id.slice(0, 4) !== state.scope; })) {
      state.scope = 'all';
    }

    state.categories = (p.get('category') || '').split(',').filter(function (c) { return L.KEY_BY_SLUG[c]; });
    state.q = (p.get('q') || '').trim().slice(0, 120);
    state.min = numParam(p.get('min'));
    state.max = numParam(p.get('max'));
    state.sort = validSort(p.get('sort'));
    state.payee = (p.get('payee') || '').trim();
    state.payeeScope = p.get('payeeScope') === 'filters' ? 'filters' : '';
  }
  function numParam(v) {
    if (v == null || v === '') return '';
    var n = Number(v);
    return isFinite(n) ? String(n) : '';
  }
  var SORT_FIELDS = { payee: 1, category: 1, sitting: 1, amount: 1, description: 1, lines: 1, sittings: 1 };
  function validSort(v) {
    if (!v) return DEFAULTS.sort;
    var parts = String(v).split(':');
    if (!SORT_FIELDS[parts[0]]) return DEFAULTS.sort;
    return parts[0] + ':' + (parts[1] === 'asc' ? 'asc' : 'desc');
  }
  function years() {
    return (D.months || []).map(function (m) { return m.m.slice(0, 4); })
      .filter(function (y, i, a) { return a.indexOf(y) === i; }).sort();
  }

  function buildQuery() {
    var p = new URLSearchParams();
    p.set('lang', state.lang);
    if (state.tab !== DEFAULTS.tab) p.set('tab', state.tab);
    if (state.scope !== defaultScope()) p.set('scope', state.scope);
    if (state.sittings.length) p.set('sitting', state.sittings.join(','));
    if (state.categories.length) p.set('category', state.categories.join(','));
    if (state.q) p.set('q', state.q);
    if (state.min !== '') p.set('min', state.min);
    if (state.max !== '') p.set('max', state.max);
    if (state.sort !== DEFAULTS.sort) p.set('sort', state.sort);
    if (state.payee) p.set('payee', state.payee);
    if (state.payee && state.payeeScope) p.set('payeeScope', state.payeeScope);
    return p;
  }
  function writeURL(push) {
    var url = location.pathname + '?' + buildQuery().toString();
    try { history[push ? 'pushState' : 'replaceState'](null, '', url); } catch (e) {}
    syncAlternates();
  }
  // Keep the hreflang alternates pointing at the CURRENT result set, so the
  // no-JS path and any crawler see the same view in the other language.
  function syncAlternates() {
    ['fr', 'en'].forEach(function (lg) {
      var link = document.head.querySelector('link[rel="alternate"][hreflang="' + lg + '"]');
      if (!link) return;
      var p = buildQuery(); p.set('lang', lg);
      link.setAttribute('href', location.origin + location.pathname + '?' + p.toString());
    });
  }

  /* ============================================================
     state changes
     ============================================================ */
  function setState(patch, opts) {
    opts = opts || {};
    if (!store) { Object.keys(patch).forEach(function (k) { state[k] = patch[k]; }); writeURL(false); renderStandalone(); return; }
    var langChanged = patch.lang && patch.lang !== state.lang;
    Object.keys(patch).forEach(function (k) { state[k] = patch[k]; });
    if (opts.resetReveal !== false) revealed = PAGE_SIZE;
    idxCache = aggCache = null;
    writeURL(opts.push !== false);
    if (langChanged) {
      try { localStorage.setItem('observerLang', state.lang); localStorage.setItem('oo_lang', state.lang); } catch (e) {}
      applyLangChrome();
      renderAll();
    } else {
      renderAll();
    }
  }

  function toggleIn(list, v) {
    var out = list.slice(), i = out.indexOf(v);
    if (i >= 0) out.splice(i, 1); else out.push(v);
    return out.sort();
  }

  function hasFilters() {
    return !!(state.q || state.scope !== defaultScope() || state.sittings.length ||
              state.categories.length || state.min !== '' || state.max !== '');
  }
  function filterSpec(over) {
    var spec = {
      q: state.q,
      sittings: state.sittings,
      categories: state.categories.map(function (s) { return L.KEY_BY_SLUG[s]; }),
      min: state.min, max: state.max, scope: state.scope
    };
    if (over) Object.keys(over).forEach(function (k) { spec[k] = over[k]; });
    return spec;
  }
  function indices() {
    if (idxCache) return idxCache;
    var raw = L.filterLines(store, filterSpec());
    idxCache = L.sortIndices(store, raw, state.sort, {
      locale: f().locale,
      payee: function (line) { return payeeName(store.payees[line.p]); },
      category: catName
    });
    return idxCache;
  }
  function agg() {
    if (!aggCache) aggCache = L.aggregate(store, indices());
    return aggCache;
  }

  /* ============================================================
     naming helpers (language-dependent, so they live here)
     ============================================================ */
  function catName(key) {
    return (D.categories[key] && D.categories[key][state.lang]) || key;
  }
  function payeeName(P) {
    if (!P) return '';
    if (P.isPayroll) return T().payeePayroll;
    if (P.isRest) return T().payeeRest;
    return P.name;
  }
  function glossFor(P) {
    if (!P || !D.gloss) return '';
    var g = D.gloss[P.name];
    return g ? (g[state.lang] || '') : '';
  }
  function sittingLabel(s) { return s ? (state.lang === 'fr' ? s.label_fr : s.label_en) : ''; }
  function sittingShort(s) {
    if (!s) return '';
    var m = f().monthShort(s.m);
    return m.charAt(0).toUpperCase() + m.slice(1);
  }
  function tolNote() {
    return (D.provenance && D.provenance.tolerance_note) || '';
  }

  /* ============================================================
     row builders for the aggregate tabs
     ============================================================ */
  function payeeRows() {
    var by = {};
    indices().forEach(function (i) {
      var ln = store.lines[i];
      var r = by[ln.p];
      if (!r) {
        var P = store.payees[ln.p];
        r = by[ln.p] = {
          slug: ln.p, payee: P, name: payeeName(P), aliases: P.aliases,
          total: 0, lines: 0, byCat: {}, seen: {}, sittings: [], nSittings: 0
        };
      }
      r.total += L.cents(ln.a);
      r.lines++;
      r.byCat[ln.c] = r.byCat[ln.c] || { amt: 0, lines: 0 };
      r.byCat[ln.c].amt += L.cents(ln.a);
      r.byCat[ln.c].lines++;
      if (!r.seen[ln.s]) { r.seen[ln.s] = 1; r.sittings.push(ln.s); r.nSittings++; }
    });
    var rows = Object.keys(by).map(function (k) {
      var r = by[k];
      r.total = L.dollars(r.total);
      Object.keys(r.byCat).forEach(function (c) { r.byCat[c].amt = L.dollars(r.byCat[c].amt); });
      r.sittings.sort();
      return r;
    });
    return sortRows(rows, { payee: 'name', amount: 'total', lines: 'lines', sittings: 'nSittings' }, 'total');
  }

  function categoryRows() {
    var by = {}, nSit = store.sittings.length;
    indices().forEach(function (i) {
      var ln = store.lines[i];
      var r = by[ln.c];
      if (!r) {
        var C0 = store.catByKey[ln.c];
        r = by[ln.c] = { key: ln.c, color: C0 ? C0.color : '#888888', amt: 0, lines: 0, seen: {}, payees: 0, bySitting: [] };
        for (var k = 0; k < nSit; k++) r.bySitting.push(0);
      }
      r.amt += L.cents(ln.a);
      r.lines++;
      r.bySitting[ln.si] += L.cents(ln.a);
      if (!r.seen[ln.p]) { r.seen[ln.p] = 1; r.payees++; }
    });
    return Object.keys(by).map(function (k) {
      var r = by[k];
      r.amt = L.dollars(r.amt);
      r.bySitting = r.bySitting.map(L.dollars);
      return r;
    }).sort(function (a, b) { return b.amt - a.amt; });
  }

  // The Sittings tab always shows every sitting: it is the reconciliation
  // table, and a partial one would be worse than none.
  function sittingRows() { return store.sittings.slice().reverse(); }

  function sortRows(rows, map, dflt) {
    var parts = state.sort.split(':'), field = map[parts[0]] || dflt, dir = parts[1] === 'asc' ? 1 : -1;
    var loc = f().locale;
    return rows.sort(function (a, b) {
      var x = a[field], y = b[field], r;
      if (typeof x === 'string') r = x.localeCompare(y, loc, { sensitivity: 'base', numeric: true });
      else r = x - y;
      if (r) return r * dir;
      return b.total - a.total;
    });
  }

  // A profile's numbers. By default they cover EVERY sitting regardless of
  // the rail, so a ?payee= link is self-contained; ?payeeScope=filters opts
  // into the reader's own filters instead.
  function profileData(slug) {
    var P = store.payees[slug];
    if (!P) return null;
    var scoped = state.payeeScope === 'filters' && hasFilters();
    var idx = store.byPayee[slug] || [];
    if (scoped) {
      var keep = {};
      indices().forEach(function (i) { keep[i] = 1; });
      idx = idx.filter(function (i) { return keep[i]; });
    }
    var c = 0, byCat = {}, seen = {}, sits = [], maxLine = 0;
    idx.forEach(function (i) {
      var ln = store.lines[i];
      c += L.cents(ln.a);
      byCat[ln.c] = byCat[ln.c] || { amt: 0, lines: 0 };
      byCat[ln.c].amt += L.cents(ln.a);
      byCat[ln.c].lines++;
      if (!seen[ln.s]) { seen[ln.s] = 1; sits.push(ln.s); }
      if (Math.abs(ln.a) > Math.abs(maxLine)) maxLine = ln.a;
    });
    Object.keys(byCat).forEach(function (k) { byCat[k].amt = L.dollars(byCat[k].amt); });
    sits.sort();
    return {
      P: P, slug: slug, idx: idx, scoped: scoped,
      total: L.dollars(c), lines: idx.length,
      sittings: sits, nSittings: sits.length, byCat: byCat, maxLine: maxLine,
      first: sits[0] || P.first, last: sits[sits.length - 1] || P.last
    };
  }

  function payeeBySitting(pd) {
    var by = {};
    pd.idx.forEach(function (i) {
      var ln = store.lines[i];
      by[ln.s] = by[ln.s] || { amt: 0, lines: 0 };
      by[ln.s].amt += L.cents(ln.a);
      by[ln.s].lines++;
    });
    return store.sittings.map(function (s) {
      return { s: s, amt: L.dollars((by[s.m] || {}).amt || 0), lines: (by[s.m] || {}).lines || 0 };
    });
  }

  /* ============================================================
     the render context handed to ledger-views.js
     ============================================================ */
  function ctx() {
    return {
      store: store, D: D, T: T(), lang: state.lang, f: f(), state: state,
      idx: indices(), agg: agg(), revealed: revealed, profileRevealed: profileRevealed,
      loading: loading, linesFailed: linesFailed, expectedLines: EXPECTED_LINES,
      catName: catName, payeeName: payeeName, gloss: glossFor,
      sittingLabel: sittingLabel, sittingShort: sittingShort, tolNote: tolNote,
      color: function (hex) { return C.catColor(hex); },
      dim: function (hex) { return C.dim(hex); },
      topCatColor: function (r) {
        var best = null, bv = -Infinity;
        Object.keys(r.byCat).forEach(function (k) { if (r.byCat[k].amt > bv) { bv = r.byCat[k].amt; best = k; } });
        var C0 = best && store.catByKey[best];
        return C0 ? C0.color : '#888888';
      },
      hasFilters: hasFilters,
      payeeRows: payeeRows, categoryRows: categoryRows, sittingRows: sittingRows,
      payeeBySitting: payeeBySitting, profileData: profileData,
      widenOffers: widenOffers,
      chart: function (name, canvasId, capId, items, opts) {
        pendingCharts.push({ name: name, canvasId: canvasId, capId: capId, items: items, opts: opts || {} });
      },
      on: {
        payee: function (slug) { lastFocus = document.activeElement; profileRevealed = PROFILE_PAGE; setState({ payee: slug }); },
        closeProfile: function () { setState({ payee: '' }); restoreFocus(); },
        profileAll: function () { profileRevealed = 1e9; renderAll(); },
        profileCsv: function (slug) { exportPayeeCSV(slug); },
        copyLink: copyLink,
        category: function (key) { setState({ categories: toggleIn(state.categories, L.SLUGS[key]) }); },
        categoryOnly: function (key) { setState({ categories: [L.SLUGS[key]], tab: 'payments', payee: '' }); },
        togglePayeeScope: function () { setState({ payeeScope: state.payeeScope === 'filters' ? '' : 'filters' }, { resetReveal: false }); },
        sitting: function (id) { setState({ sittings: toggleIn(state.sittings, id), tab: state.tab }); },
        setScope: function (v) { setState({ scope: v, sittings: [] }); },
        setAmount: function (mn, mx) { setState({ min: mn, max: mx }); },
        clearQ: function () { setState({ q: '' }); },
        sort: function (v) { setState({ sort: validSort(v) }, { resetReveal: false }); },
        more: function () { revealed += PAGE_STEP; renderAll(); },
        all: function () { revealAll(); },
        csv: exportCSV,
        clearFilters: resetFilters,
        retry: function () { linesFailed = false; loading = true; renderAll(); loadPayments(); }
      }
    };
  }

  // "142 matching lines in other sittings — search all sittings". The empty
  // state does research work instead of apologising.
  function widenOffers() {
    var t = T(), out = [];
    if (state.sittings.length || state.scope !== 'all') {
      var n = L.filterLines(store, filterSpec({ sittings: [], scope: 'all' })).length;
      if (n > indices().length) {
        out.push(V.el('p', null, V.el('button', {
          type: 'button', cls: 'btn ghost',
          text: L.tpl(t.widenSittings, { n: f().num(n) }),
          on: { click: function () { setState({ sittings: [], scope: 'all' }); } }
        })));
      }
    }
    if (state.min !== '' || state.max !== '') {
      var n2 = L.filterLines(store, filterSpec({ min: '', max: '' })).length;
      if (n2 > indices().length) {
        out.push(V.el('p', null, V.el('button', {
          type: 'button', cls: 'btn ghost',
          text: L.tpl(t.widenAmount, { n: f().num(n2) }),
          on: { click: function () { setState({ min: '', max: '' }); } }
        })));
      }
    }
    return out;
  }

  function revealAll() {
    // Render the remainder in frames so the main thread never blocks past
    // one, however many rows are left.
    var total = indices().length;
    (function step() {
      revealed = Math.min(revealed + PAGE_STEP, total);
      renderAll();
      if (revealed < total) {
        if (global.requestAnimationFrame) global.requestAnimationFrame(step);
        else setTimeout(step, 0);
      }
    })();
  }

  function resetFilters() {
    // Reset clears the FILTERS; language, tab and sort are the reader's
    // workspace, not a filter, so they survive.
    setState({ q: '', scope: defaultScope(), sittings: [], categories: [], min: '', max: '', payee: '', payeeScope: '' });
    closeSheet();
    var q = $('q'); if (q) { q.value = ''; q.focus(); }
  }
  function restoreFocus() {
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
    lastFocus = null;
  }
  function copyLink() {
    var url = location.origin + location.pathname + '?' + buildQuery().toString();
    var done = function () {
      var b = $('pf-copy'); if (b) b.textContent = T().pfCopied;
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(url).then(done, function () {});
    else done();
  }

  /* ============================================================
     CSV
     ============================================================ */
  function lineCSVRow(i) {
    var ln = store.lines[i], s = store.sittingById[ln.s];
    return [
      sittingLabel(s), s.sittingDate, s.resolution,
      payeeName(store.payees[ln.p]),
      (ln.pre ? ln.pre + ' — ' : '') + (ln.d || ln.e),
      catName(ln.c),
      ln.a.toFixed(2),
      s.url,
      (D.provenance && D.provenance.categories_method) || ''
    ];
  }
  function exportCSV() {
    var t = T(), idx = indices();
    if (idx.length > 1000 && !global.confirm(L.tpl(t.csvBigConfirm, { n: f().num(idx.length) }))) return;
    V.downloadCSV(L.buildCSV(t.csvHeadLines, idx.map(lineCSVRow)), t.csvFileStem + '-' + state.tab + '.csv');
  }
  function exportPayeeCSV(slug) {
    var t = T();
    V.downloadCSV(L.buildCSV(t.csvHeadLines, (store.byPayee[slug] || []).map(lineCSVRow)),
      t.csvFileStem + '-' + slug + '.csv');
  }

  /* ============================================================
     rendering
     ============================================================ */
  // Before the line store exists there is no rail and no tabs to render,
  // but the reader still needs to be told what is happening. A failed load
  // must never leave a blank page: this page's whole claim is verifiability.
  function renderStandalone() {
    renderChrome();
    var t = T(), p = $('panel-payments');
    if (!p) return;
    p.hidden = false;
    p.textContent = '';
    if (linesFailed) {
      p.removeAttribute('aria-busy');
      p.appendChild(V.el('div', { cls: 'notice warn' }, [
        V.el('p', null, V.rich(t.linesUnavailable)),
        V.el('p', null, V.el('button', {
          type: 'button', cls: 'btn ghost', text: t.retry,
          on: { click: function () { linesFailed = false; loading = true; renderStandalone(); loadPayments(); } }
        }))
      ]));
    } else {
      p.setAttribute('aria-busy', 'true');
      p.appendChild(V.el('div', { cls: 'skeleton', text: L.tpl(t.loadingLines, { n: f().num(EXPECTED_LINES) }) }));
    }
  }

  function renderAll() {
    if (!store) { renderStandalone(); return; }
    var pp = $('panel-payments');
    if (pp) pp.removeAttribute('aria-busy');
    pendingCharts = [];
    renderChrome();
    renderRail();
    renderTabs();
    renderChips();
    renderStatus();
    renderPanels();
    flushCharts();
    renderPrintMeta();
  }

  function renderChrome() {
    var t = T();
    document.documentElement.lang = state.lang;
    document.title = t.htmlTitle;
    setText('eyebrow', t.eyebrow);
    setText('title', t.title);
    setText('deck', t.wsDeck);
    setText('disclaimer-h', t.devBannerH);
    setText('disclaimer-b', t.devBanner);
    setText('ref-lbl', t.refLabel);
    setText('ref-budget', t.refBudget);
    setText('preset-lbl', t.presetLabel);
    var sk = document.getElementsByClassName('lw-skip');
    if (sk[0]) sk[0].textContent = t.skipResults;
    if (sk[1]) sk[1].textContent = t.skipFilters;
    var rb = $('ref-budget'); if (rb) rb.setAttribute('href', '/finances/budget/?lang=' + state.lang);

    if (store) {
      setText('status', L.tpl(t.wsStatus, {
        lines: f().num(store.totals.lines), payees: f().num(store.totals.payees),
        sittings: store.totals.sittings,
        first: sittingShort(store.sittings[0]),
        last: sittingShort(store.sittings[store.sittings.length - 1])
      }));
    }
    setText('updated', L.tpl(t.updated, { date: f().dateLong(D.generated) }));
    renderPresets();
  }
  function setText(id, s) { var n = $(id); if (n) n.textContent = s; }

  // Preset links are just v2 URLs. They cost nothing, they teach the tool by
  // example, and they give an article something specific to link to.
  // Each preset carries its own tab, so following the LINK lands exactly
  // where clicking it does. (They used to disagree: the click handler forced
  // Payments while the href inherited the default tab.)
  var PRESETS = [
    { key: 'presetLegal',   q: { category: 'legal-services', scope: 'all', tab: 'payments' } },
    { key: 'presetBig',     q: { min: '100000', scope: 'all', tab: 'payments' } },
    { key: 'presetPayroll', q: { payee: 'paie-municipale', scope: 'all' } },
    { key: 'presetCredits', q: { max: '-0.01', scope: 'all', tab: 'payments' } }
  ];
  function renderPresets() {
    var box = $('presets'); if (!box) return;
    box.textContent = '';
    PRESETS.forEach(function (p, i) {
      if (i) box.appendChild(document.createTextNode(' · '));
      box.appendChild(V.el('a', {
        href: '?' + presetQuery(p.q), text: T()[p.key],
        on: { click: function (e) { e.preventDefault(); applyPreset(p.q); } }
      }));
    });
  }
  function presetQuery(q) {
    var p = new URLSearchParams();
    p.set('lang', state.lang);
    Object.keys(q).forEach(function (k) { p.set(k, q[k]); });
    return p.toString();
  }
  function applyPreset(q) {
    // Start from a clean slate so presets never compound with each other.
    var patch = { q: '', scope: 'all', sittings: [], categories: [], min: '', max: '', payee: '', payeeScope: '', tab: DEFAULTS.tab };
    Object.keys(q).forEach(function (k) {
      if (k === 'category') patch.categories = [q[k]];
      else if (k === 'sitting') patch.sittings = String(q[k]).split(',');
      else patch[k] = q[k];
    });
    setState(patch);
    var qi = $('q'); if (qi) qi.value = patch.q;
  }

  /* ---------- rail ---------- */
  // The rail is rebuilt wholesale on every render (the facet amounts change
  // with every filter), which would drop keyboard focus mid-list. Remember
  // which rail control had it and hand it back afterwards.
  function railFocusId() {
    var a = document.activeElement;
    var id = a && a.getAttribute && a.getAttribute('id');
    return id && /^cb-(sit|cat)-/.test(id) ? id : null;
  }
  function restoreRailFocus(id) {
    if (!id) return;
    var n = $(id);
    if (n && n.focus) { try { n.focus(); } catch (e) {} }
  }

  function renderRail() {
    var t = T();
    var refocus = railFocusId();
    setText('rail-h', t.railTitle);
    setText('rail-h-desktop', t.railTitle);
    setText('l-search', t.railSearch);
    setText('l-scope', t.railScope);
    setText('l-sittings', t.railSittings);
    setText('l-cats', t.railCats);
    setText('l-amount', t.railAmount);
    setText('l-min', t.amtMin);
    setText('l-max', t.amtMax);
    setText('l-reset-group', t.wsReset);
    setText('reset', t.wsReset);
    setText('sheet-reset', t.wsReset);
    setText('sit-all', t.selAll); setText('sit-none', t.selNone);
    setText('cat-all', t.selAll); setText('cat-none', t.selNone);
    setText('q-help', t.railSearchHelp);
    setText('sheet-open-label', t.filtersBtn);
    setText('l-sort-mobile', t.sortLabel);
    var qEl = $('q');
    if (qEl) {
      qEl.setAttribute('placeholder', t.railSearchPh);
      qEl.setAttribute('aria-label', t.railSearch);
      if (qEl.value !== state.q) qEl.value = state.q;
    }
    var qc = $('q-clear');
    if (qc) { qc.hidden = !state.q; qc.setAttribute('aria-label', t.railSearchClear); }
    var sc = $('sheet-close'); if (sc) sc.setAttribute('aria-label', t.sheetClose);
    var sa = $('sheet-apply'); if (sa) sa.textContent = L.tpl(t.sheetApply, { n: f().num(indices().length) });
    var mn = $('amt-min'), mx = $('amt-max');
    if (mn) { mn.setAttribute('placeholder', t.amtMin); if (mn.value !== state.min) mn.value = state.min; }
    if (mx) { mx.setAttribute('placeholder', t.amtMax); if (mx.value !== state.max) mx.value = state.max; }

    // scope segment
    var sg = $('scope-group');
    if (sg) {
      sg.textContent = '';
      [{ v: 'all', label: t.scopeAllYears }].concat(years().map(function (y) { return { v: y, label: y }; }))
        .forEach(function (o) {
          sg.appendChild(V.el('button', {
            type: 'button', 'aria-pressed': String(state.scope === o.v), text: o.label,
            on: { click: function () { setState({ scope: o.v, sittings: [] }); } }
          }));
        });
    }

    // facet counts are computed against the OTHER filters, so a reader can
    // see the consequence of a click before making it
    var sitFacet = facet('sittings'), catFacet = facet('categories');

    var sl = $('sitting-list');
    if (sl) {
      sl.textContent = '';
      var curYear = null;
      store.sittings.slice().reverse().forEach(function (s) {
        if (s.year !== curYear) {
          curYear = s.year;
          sl.appendChild(V.el('li', null, V.el('div', { cls: 'rail-groupyear', text: curYear })));
        }
        var on = state.sittings.indexOf(s.m) >= 0;
        sl.appendChild(V.el('li', null, V.el('label', null, [
          V.el('input', { type: 'checkbox', id: 'cb-sit-' + s.m, checked: on || null, on: { change: function () { setState({ sittings: toggleIn(state.sittings, s.m) }); } } }),
          V.el('span', { cls: 'nm' }, [
            V.el('span', { text: sittingLabel(s) }),
            V.el('span', { cls: 'sub', text: f().dateLong(s.sittingDate) })
          ]),
          V.el('span', { cls: 'amt', text: f().money0(sitFacet[s.m] || 0) })
        ])));
      });
    }

    var cl = $('category-list');
    if (cl) {
      cl.textContent = '';
      store.categories.forEach(function (c) {
        var slug = L.SLUGS[c.key], on = state.categories.indexOf(slug) >= 0;
        cl.appendChild(V.el('li', null, V.el('label', null, [
          V.el('input', { type: 'checkbox', id: 'cb-cat-' + slug, checked: on || null, on: { change: function () { setState({ categories: toggleIn(state.categories, slug) }); } } }),
          V.el('span', { cls: 'dot', style: 'background:' + C.catColor(c.color), 'aria-hidden': 'true' }),
          V.el('span', { cls: 'nm', text: catName(c.key) }),
          V.el('span', { cls: 'amt', text: f().money0(catFacet[c.key] || 0) })
        ])));
      });
    }

    var ac = $('amount-chips');
    if (ac) {
      ac.textContent = '';
      [{ label: t.chip10k, min: '10000', max: '' },
       { label: t.chip100k, min: '100000', max: '' },
       { label: t.chipSmall, min: '', max: '999.99' },
       { label: t.chipCredits, min: '', max: '-0.01' }].forEach(function (o) {
        var on = state.min === o.min && state.max === o.max;
        ac.appendChild(V.el('button', {
          type: 'button', 'aria-pressed': String(on), text: o.label,
          on: { click: function () { setState(on ? { min: '', max: '' } : { min: o.min, max: o.max }); } }
        }));
      });
    }

    var badge = $('filter-count'), n = activeFilterCount();
    if (badge) { badge.textContent = String(n); badge.hidden = !n; }

    var sm = $('sort-mobile');
    if (sm) {
      sm.textContent = '';
      sortOptions().forEach(function (o) {
        sm.appendChild(V.el('option', { value: o.v, selected: state.sort === o.v || null, text: o.label }));
      });
    }

    restoreRailFocus(refocus);
  }

  function facet(which) {
    var out = {};
    var over = which === 'sittings' ? { sittings: [], scope: 'all' } : { categories: [] };
    L.filterLines(store, filterSpec(over)).forEach(function (i) {
      var ln = store.lines[i];
      var k = which === 'sittings' ? ln.s : ln.c;
      out[k] = (out[k] || 0) + L.cents(ln.a);
    });
    Object.keys(out).forEach(function (k) { out[k] = L.dollars(out[k]); });
    return out;
  }
  function activeFilterCount() {
    var n = 0;
    if (state.q) n++;
    if (state.scope !== defaultScope()) n++;
    n += state.sittings.length + state.categories.length;
    if (state.min !== '') n++;
    if (state.max !== '') n++;
    return n;
  }
  function sortOptions() {
    var t = T();
    return [
      { v: 'amount:desc', label: t.sortAmountDesc }, { v: 'amount:asc', label: t.sortAmountAsc },
      { v: 'payee:asc', label: t.sortPayeeAsc }, { v: 'payee:desc', label: t.sortPayeeDesc },
      { v: 'category:asc', label: t.sortCategoryAsc }, { v: 'category:desc', label: t.sortCategoryDesc },
      { v: 'sitting:desc', label: t.sortSittingDesc }, { v: 'sitting:asc', label: t.sortSittingAsc },
      { v: 'description:asc', label: t.sortDescriptionAsc }, { v: 'description:desc', label: t.sortDescriptionDesc }
    ];
  }

  /* ---------- tabs ---------- */
  function renderTabs() {
    var t = T(), a = agg();
    var counts = {
      payments: a.lines, payees: a.payees,
      categories: a.mix.length, sittings: store.sittings.length
    };
    var labels = { payments: t.tabPayments, payees: t.tabPayees, categories: t.tabCategories, sittings: t.tabSittings };
    TABS.forEach(function (id) {
      var b = $('tab-' + id);
      if (!b) return;
      b.textContent = '';
      b.appendChild(document.createTextNode(labels[id] + ' '));
      b.appendChild(V.el('span', { cls: 'ct', text: '(' + f().num(counts[id]) + ')' }));
      var on = state.tab === id && !state.payee;
      b.setAttribute('aria-selected', String(on));
      b.setAttribute('tabindex', on ? '0' : '-1');
    });
    setText('orient', t['orient' + state.tab.charAt(0).toUpperCase() + state.tab.slice(1)]);
  }

  function renderChips() {
    var box = $('chips'); if (!box) return;
    box.textContent = '';
    box.appendChild(V.chips(ctx()));
  }

  // Counts are assembled from singular/plural atoms rather than one
  // composite string, so the line never reads "1 sittings".
  function count(key, n) {
    var t = T();
    return n === 1 ? t[key + 'One'] : L.tpl(t[key], { n: f().num(n) });
  }
  function renderStatus() {
    var t = T(), a = agg(), parts = [];
    if (state.payee) { setText('results-status', ''); return; }
    if (state.tab === 'payments') {
      var shown = Math.min(revealed, a.lines);
      parts.push(shown < a.lines
        ? L.tpl(t.statusShowing, { shown: f().num(shown), n: f().num(a.lines) })
        : count('nLines', a.lines));
      parts.push(f().money(a.total));
      parts.push(count('nPayees', a.payees));
      parts.push(count('nSittings', a.sittings));
      parts.push(L.tpl(t.statusSorted, { field: sortLabel() }));
    } else if (state.tab === 'payees') {
      parts.push(count('nPayees', a.payees));
      parts.push(f().money(a.total));
      parts.push(L.tpl(t.statusSorted, { field: sortLabel() }));
    } else if (state.tab === 'categories') {
      parts.push(count('nCategories', a.mix.length));
      parts.push(f().money(a.total));
    } else {
      parts.push(count('nSittings', store.sittings.length));
      parts.push(L.tpl(t.statusAdopted, { amt: f().money(store.totals.adopted) }));
    }
    var box = $('results-status');
    box.textContent = '';
    parts.forEach(function (p, i) {
      if (i) box.appendChild(V.el('span', { cls: 'sep', text: '·' }));
      box.appendChild(V.el('span', { cls: i === 0 ? 'big' : null, text: p }));
    });
  }
  function sortLabel() {
    var o = sortOptions().filter(function (x) { return x.v === state.sort; })[0];
    return o ? o.label : state.sort;
  }

  function renderPanels() {
    var c = ctx(), showProfile = !!state.payee;
    TABS.forEach(function (id) {
      var p = $('panel-' + id);
      if (!p) return;
      p.hidden = showProfile || state.tab !== id;
      if (p.hidden) { p.textContent = ''; return; }
      p.textContent = '';
      p.appendChild(V[id](c));
    });
    var pf = $('profile');
    var wasOpen = !pf.hidden;
    pf.hidden = !showProfile;
    pf.textContent = '';
    if (showProfile) {
      pf.appendChild(V.profile(c, state.payee));
      // Move focus into the profile the first time it opens, so a keyboard
      // or screen-reader user lands on it rather than staying in the table
      // that is no longer displayed.
      if (!wasOpen && pf.focus) { try { pf.focus(); } catch (e) {} }
    }
  }

  function flushCharts() {
    if (!pendingCharts.length) return;
    var jobs = pendingCharts.slice();
    pendingCharts = [];
    C.ensureChart().then(function (okLib) {
      jobs.forEach(function (j) {
        var canvas = $(j.canvasId), cap = $(j.capId);
        if (!canvas) return;
        if (!okLib) { if (cap) cap.textContent = T().chartFail; return; }
        var opts = {
          fmt: f().money, fmtAxis: function (v) { return f().money0(v); },
          onPick: j.opts.onPick
        };
        var fail = function () { if (cap) cap.textContent = T().chartFail; };
        if (j.opts.vertical) C.vbar(j.name, canvas, j.items, opts, fail);
        else C.hbar(j.name, canvas, j.items, opts, fail);
      });
    });
  }

  function renderPrintMeta() {
    var t = T(), box = $('print-meta'); if (!box) return;
    var bits = [];
    if (state.q) bits.push(L.tpl(t.chipSearch, { v: state.q }));
    if (state.scope !== 'all') bits.push(L.tpl(t.chipScope, { v: state.scope }));
    state.sittings.forEach(function (id) { bits.push(L.tpl(t.chipSitting, { v: sittingLabel(store.sittingById[id]) })); });
    state.categories.forEach(function (s) { bits.push(L.tpl(t.chipCategory, { v: catName(L.KEY_BY_SLUG[s]) })); });
    if (state.min !== '') bits.push(L.tpl(t.chipMin, { v: f().money(Number(state.min)) }));
    if (state.max !== '') bits.push(L.tpl(t.chipMax, { v: f().money(Number(state.max)) }));
    box.textContent = '';
    box.appendChild(V.el('div', { text: L.tpl(t.printActiveFilters, { v: bits.length ? bits.join(' · ') : t.printNone }) }));
    box.appendChild(V.el('div', { text: T().printSource }));
    box.appendChild(V.el('div', { text: t.devBannerH + ' — ' + t.devBanner }));
  }

  /* ============================================================
     wiring
     ============================================================ */
  var qTimer = null, amtTimer = null;
  function wire() {
    var q = $('q');
    if (q) {
      q.addEventListener('input', function () {
        clearTimeout(qTimer);
        var v = q.value.trim().slice(0, 120);
        qTimer = setTimeout(function () { if (v !== state.q) setState({ q: v }); }, 150);
      });
      q.addEventListener('keydown', function (e) { if (e.key === 'Enter') e.preventDefault(); });
    }
    var qc = $('q-clear');
    if (qc) qc.addEventListener('click', function () { if (q) q.value = ''; setState({ q: '' }); if (q) q.focus(); });

    ['amt-min', 'amt-max'].forEach(function (id) {
      var n = $(id); if (!n) return;
      n.addEventListener('input', function () {
        clearTimeout(amtTimer);
        amtTimer = setTimeout(function () {
          setState({ min: numParam($('amt-min').value), max: numParam($('amt-max').value) });
        }, 300);
      });
    });

    on('sit-all', function () { setState({ sittings: [], scope: 'all' }); });
    on('sit-none', function () { if (store) setState({ sittings: store.sittings.map(function (s) { return s.m; }) }); });
    on('cat-all', function () { setState({ categories: [] }); });
    on('cat-none', function () { if (store) setState({ categories: store.categories.map(function (c) { return L.SLUGS[c.key]; }) }); });
    on('reset', resetFilters);
    on('sheet-reset', resetFilters);
    on('sheet-apply', closeSheet);
    on('sheet-close', closeSheet);
    on('sheet-open', openSheet);
    var scrim = $('lw-scrim'); if (scrim) scrim.addEventListener('click', closeSheet);

    var sm = $('sort-mobile');
    if (sm) sm.addEventListener('change', function () { setState({ sort: validSort(sm.value) }, { resetReveal: false }); });

    // tabs: roving tabindex + arrow keys
    TABS.forEach(function (id, i) {
      var b = $('tab-' + id); if (!b) return;
      b.addEventListener('click', function () { setState({ tab: id, payee: '' }); focusPanel(); });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        var to = e.key === 'Home' ? 0 : e.key === 'End' ? TABS.length - 1 : (d ? (i + d + TABS.length) % TABS.length : -1);
        if (to < 0) return;
        e.preventDefault();
        setState({ tab: TABS[to], payee: '' });
        var nb = $('tab-' + TABS[to]); if (nb) nb.focus();
      });
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (sheetOpen()) { closeSheet(); return; }
      if (state.payee) { setState({ payee: '' }); restoreFocus(); }
    });

    global.addEventListener('popstate', function () {
      readURL();
      revealed = PAGE_SIZE; profileRevealed = PROFILE_PAGE;
      idxCache = aggCache = null;
      applyLangChrome();
      renderAll();
    });

    // Print the whole filtered set, never the reveal window - then put the
    // window back, so the screen isn't left with 2,138 rows after printing.
    global.addEventListener('beforeprint', function () {
      if (!store) return;
      printRestore = revealed;
      revealed = indices().length;
      profileRevealed = 1e9;
      renderAll();
    });
    global.addEventListener('afterprint', function () {
      if (!store || printRestore == null) return;
      revealed = printRestore; printRestore = null;
      profileRevealed = PROFILE_PAGE;
      renderAll();
    });

    C.onThemeChange(function () { if (store) renderAll(); });

    // The house header's FR/EN buttons call window.obsSetLang at CLICK time
    // (observer-header.js:185-186), so replacing it here makes them re-render
    // the workspace in place instead of navigating and losing tab/q/sort.
    var houseSetLang = global.obsSetLang;
    global.obsSetLang = function (lang) {
      if (lang !== 'fr' && lang !== 'en') { if (houseSetLang) houseSetLang(lang); return; }
      setState({ lang: lang }, { resetReveal: false });
    };
  }
  function on(id, fn) { var n = $(id); if (n) n.addEventListener('click', fn); }

  function focusPanel() {
    var p = $('panel-' + state.tab);
    if (p && !p.hidden && p.focus) p.focus();
  }

  /* ---------- mobile sheet ---------- */
  function isMobile() { try { return global.matchMedia('(max-width: 900px)').matches; } catch (e) { return false; } }
  function sheetOpen() { var r = $('rail'); return !!(r && r.classList.contains('is-open')); }
  function openSheet() {
    if (!isMobile()) { var q = $('q'); if (q) q.focus(); return; }
    var r = $('rail'), s = $('lw-scrim'), b = $('sheet-open');
    r.classList.add('is-open');
    r.setAttribute('role', 'dialog');
    r.setAttribute('aria-modal', 'true');
    s.classList.add('is-open');
    b.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    var q2 = $('q'); if (q2) q2.focus();
  }
  function closeSheet() {
    var r = $('rail'), s = $('lw-scrim'), b = $('sheet-open');
    if (!r) return;
    r.classList.remove('is-open');
    r.removeAttribute('role');
    r.removeAttribute('aria-modal');
    if (s) s.classList.remove('is-open');
    if (b) { b.setAttribute('aria-expanded', 'false'); if (isMobile()) b.focus(); }
    document.body.style.overflow = '';
  }

  /* ---------- language chrome shared with the house header ---------- */
  function applyLangChrome() {
    var html = document.documentElement;
    html.setAttribute('lang', state.lang);
    if (state.lang === 'fr') html.classList.add('lang-fr'); else html.classList.remove('lang-fr');
    // Mirror everything the house function does to its own buttons
    // (observer-header.js). It sets aria-pressed as well as .is-active — miss
    // that and this page alone announces a stale language to a screen reader.
    var be = $('obs-btn-en'), bf = $('obs-btn-fr');
    if (be) { be.classList.toggle('is-active', state.lang === 'en'); be.setAttribute('aria-pressed', String(state.lang === 'en')); }
    if (bf) { bf.classList.toggle('is-active', state.lang === 'fr'); bf.setAttribute('aria-pressed', String(state.lang === 'fr')); }
    var links = document.querySelectorAll('[data-href-en]');
    for (var i = 0; i < links.length; i++) {
      links[i].setAttribute('href', links[i].getAttribute(state.lang === 'fr' ? 'data-href-fr' : 'data-href-en'));
    }
  }

  /* ============================================================
     boot
     ============================================================ */
  function hashRoute() {
    var h = location.hash;
    if (!h) return false;
    var ref = { '#annual': 'budget', '#capital': 'capital', '#verify': 'coverage' };
    if (ref[h]) {
      location.replace('/finances/budget/?lang=' + state.lang + '#' + ref[h]);
      return true;
    }
    var tabFor = { '#explore': 'payments', '#snapshot': 'payments', '#trend': 'sittings' };
    if (tabFor[h]) {
      state.tab = tabFor[h];
      try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}
    }
    return false;
  }

  function loadPayments() {
    fetch(PAYMENTS_URL).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    }).then(function (j) {
      store = L.build(D, j);
      loading = false; linesFailed = false;
      idxCache = aggCache = null;
      renderAll();
    }).catch(function () {
      loading = false; linesFailed = true;
      renderAll();
    });
  }

  var wired = false;
  function wireOnce() { if (!wired) { wired = true; wire(); } }

  function boot() {
    if (!D || !D.months || !I18N) {
      var box = $('data-error');
      if (box) {
        box.hidden = false;
        box.textContent = (I18N && I18N.fr ? I18N.fr.errorData : 'Les données n\'ont pas pu être chargées.') +
          ' / ' + (I18N && I18N.en ? I18N.en.errorData : 'The data could not be loaded.');
      }
      return;
    }
    readURL();
    if (hashRoute()) return;
    applyLangChrome();
    writeURL(false);         // normalise legacy params in place, never pushState
    // Wire BEFORE the fetch: if payments.json never arrives, the language
    // toggle, Escape and the retry button must still work.
    wireOnce();
    renderStandalone();
    loadPayments();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
