/* ============================================================
   Ormstown Observer — municipal ledger: APP
   ------------------------------------------------------------
   Owns state, the URL, the filter rail, the tab router and boot.

   ── THE URL CONTRACT (frozen; do not change a name or a value
      without a migration entry below) ─────────────────────────
     lang      fr | en                       localStorage > navigator > fr
     tab       categories|sittings|payees|payments|disclosures   categories
     scope     2025 | 2026 (a year; 'all' is a legacy alias)   latest year
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
     supplier  comma list of payee slugs — narrows the LINES to them
               (added 2026-10-30 with the query bar; ?payee= opens a
                profile, ?supplier= filters)                none (= all)
     ask       plain words ("gas june 2025"), parsed by parseAsk into
               the params above at read time and then DROPPED from the
               address (added 2026-10-30). Never written back: the
               address a reader copies is always the explicit one, so
               the lexicon can grow without moving a published link.

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
  // The Observer's context (ledger-context.js). Optional: without it the
  // ledger is exactly the ledger.
  var CX = global.OO_LEDGER_CONTEXT || {};
  // The Disclosures tab's data (ledger-disclosures.js). Optional too.
  var DX = global.OO_LEDGER_DISCLOSURES || null;
  function cxGet(group, id) {
    var g = CX[group];
    return (g && id && Object.prototype.hasOwnProperty.call(g, id)) ? g[id] : null;
  }
  var I18N = global.OO_I18N;
  var $ = function (id) { return document.getElementById(id); };

  var PAYMENTS_URL = '/finances/payments.json?v=20261030-3';
  var PAGE_SIZE = 150, PAGE_STEP = 250, PROFILE_PAGE = 100, PROFILE_STEP = 200;
  // Rollups carry the exact line counts, so the loading message stays current
  // before payments.json has arrived and needs no hand-maintained constant.
  var EXPECTED_LINES = D ? D.entries.reduce(function (sum, entry) { return sum + entry[4]; }, 0) : 0;

  var store = null, loading = true, linesFailed = false;
  var state = {
    lang: 'fr', tab: 'categories', scope: '',
    sittings: [], categories: [], q: '', min: '', max: '',
    sort: 'amount:desc', payee: '', payeeScope: '', supplier: []
  };
  var revealed = PAGE_SIZE, profileRevealed = PROFILE_PAGE;
  var idxCache = null, aggCache = null, printRestore = null;
  var pendingCharts = [];
  var lastFocus = null;
  // Where the reader was when they opened a payee profile: the reveal
  // count, the scroll position and the row they clicked. Closing the
  // profile puts all three back, so a payee is a detour, not a reset.
  // profileEntry is the query string of the history entry the profile
  // was pushed as; closing from that same entry steps Back instead of
  // pushing, so the browser's Back button never reopens the profile.
  var returnTo = null, profileEntry = null;
  // A burst of typing in the search or amount boxes is ONE history entry:
  // the first keystroke pushes, the rest replace, until the box loses focus.
  var typingPushed = false;
  // The query bar's words as submitted (shown in the box until a filter is
  // changed by hand), and the one thing a parse can fail to place: a month
  // the ledger has no list for yet.
  var askText = '', askNote = null;

  function T() { return I18N[state.lang]; }
  function f() { return V.fmt(state.lang); }

  /* ============================================================
     URL
     ============================================================ */
  // Tab order runs from the overview to the raw record: where the money went,
  // which sitting approved it, who was paid, then every individual line.
  var DEFAULTS = { tab: 'categories', sort: 'amount:desc' };
  var TABS = ['categories', 'sittings', 'payees', 'payments', 'disclosures'];
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

    // scope, with ?year= as a permanent alias. The year is the only
    // timeframe: disclosure and financial review happen year by year, and
    // "every sitting itemized so far" is an accident of how far the
    // Observer has got. A legacy ?scope=all resolves to the latest year.
    var scope = p.get('scope') || p.get('year') || defaultScope();
    state.scope = years().indexOf(scope) >= 0 ? scope : defaultScope();

    // sitting, with ?period= as a permanent alias
    var sit = (p.get('sitting') || p.get('period') || '').split(',')
      .filter(function (id) { return !!(D.months || []).filter(function (m) { return m.m === id; })[0]; });
    state.sittings = sit.sort();
    // A requested sitting outside the year moves the year to it rather
    // than being dropped — a legacy link must never resolve to an empty
    // page. Sittings from a second year are let go.
    if (state.sittings.some(function (id) { return id.slice(0, 4) !== state.scope; })) {
      state.scope = state.sittings[0].slice(0, 4);
      state.sittings = state.sittings.filter(function (id) { return id.slice(0, 4) === state.scope; });
    }

    state.categories = (p.get('category') || '').split(',').filter(function (c) { return L.KEY_BY_SLUG[c]; });
    state.q = (p.get('q') || '').trim().slice(0, 120);
    state.min = numParam(p.get('min'));
    state.max = numParam(p.get('max'));
    state.sort = validSort(p.get('sort'));
    state.payee = (p.get('payee') || '').trim();
    state.payeeScope = p.get('payeeScope') === 'filters' ? 'filters' : '';
    state.supplier = (p.get('supplier') || '').split(',').map(function (v) { return v.trim(); })
      .filter(function (v) { return /^[a-z0-9-]{1,64}$/.test(v); }).sort();

    // ?ask= is read LAST so its words win over the explicit params it was
    // linked with; writeURL then normalises everything to explicit params.
    var ask = (p.get('ask') || '').trim().slice(0, 120);
    askText = ''; askNote = null;
    if (ask) {
      var r = parseAsk(ask);
      if (r.tab) state.tab = r.tab; else if (r.matched && !p.get('tab')) state.tab = 'payments';
      if (r.scope) { state.scope = r.scope; state.sittings = []; }
      if (r.sittings.length) state.sittings = r.sittings;
      if (r.categories.length) state.categories = r.categories;
      if (r.supplierSlugs.length) state.supplier = r.supplierSlugs;
      if (r.min !== '') state.min = r.min;
      if (r.max !== '') state.max = r.max;
      if (r.q) state.q = r.q;
      askText = ask; askNote = r.noSitting;
    }
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
    if (state.supplier.length) p.set('supplier', state.supplier.join(','));
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
    // Remembered for this tab only, so the budget page's "Back to The
    // Ledger" returns to this exact view instead of the default one.
    try { global.sessionStorage.setItem('ledgerReturn', url); } catch (e) {}
  }
  // The URL a view WOULD have, without going there: lets the views render
  // real links (open in a new tab, copy the address) for in-page moves.
  function hrefFor(patch) {
    var saved = {};
    Object.keys(patch).forEach(function (k) { saved[k] = state[k]; state[k] = patch[k]; });
    var qs = buildQuery().toString();
    Object.keys(saved).forEach(function (k) { state[k] = saved[k]; });
    return location.pathname + '?' + qs;
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
    if (!opts.keepReturn) returnTo = null;
    if (!store) { Object.keys(patch).forEach(function (k) { state[k] = patch[k]; }); writeURL(false); renderStandalone(); return; }
    var langChanged = patch.lang && patch.lang !== state.lang;
    if (!opts.fromAsk && Object.keys(patch).some(function (k) { return FILTER_KEYS[k]; })) { askText = ''; askNote = null; }
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

  var FILTER_KEYS = { q: 1, scope: 1, sittings: 1, categories: 1, supplier: 1, min: 1, max: 1 };
  function toggleIn(list, v) {
    var out = list.slice(), i = out.indexOf(v);
    if (i >= 0) out.splice(i, 1); else out.push(v);
    return out.sort();
  }

  // The year is the frame, not a filter: changing it is not "filtering".
  function hasFilters() {
    return !!(state.q || state.sittings.length || state.supplier.length ||
              state.categories.length || state.min !== '' || state.max !== '');
  }
  function filterSpec(over) {
    var spec = {
      q: state.q,
      sittings: state.sittings,
      categories: state.categories.map(function (s) { return L.KEY_BY_SLUG[s]; }),
      payees: state.supplier,
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

  // The year's sittings, oldest first. Every per-sitting surface (the
  // Sittings table, presence and heat strips, a profile's chart) runs over
  // these, so a year reads as a year.
  function yearSittings() { return store.sittings.filter(function (s) { return s.year === state.scope; }); }
  // The Sittings tab shows the whole year, whatever the rail says: it is the
  // reconciliation table, and a partial one would be worse than none.
  function sittingRows() { return yearSittings().slice().reverse(); }
  // "2026 · sittings of January 19 to August 3": the period the numbers
  // cover, said in dates, because a year on its own hides that 2026 is
  // only itemized up to its last published sitting.
  // The period the RESULT covers: the picked sittings when the rail narrows
  // them, otherwise the whole year.
  // A status part with the date range set apart: "8 sittings, <b>Jan 19 to
  // Aug 3, 2026</b>". renderStatus accepts a node as a part.
  function periodText() {
    var pf = resultPeriod(), t = T();
    return V.el('span', null, [
      document.createTextNode(L.tpl(pf.n === 1 ? t.statusPeriodOne : t.statusPeriod, pf) + ' '),
      V.el('strong', { cls: 'range', text: L.tpl(pf.n === 1 ? t.statusRangeOne : t.statusRange, pf) })
    ]);
  }
  function resultPeriod() {
    if (!state.sittings.length) return periodFields();
    var ids = state.sittings.slice().sort(), f0 = f();
    var a = store.sittingById[ids[0]], b = store.sittingById[ids[ids.length - 1]];
    return { year: state.scope, first: f0.dateLong(a.sittingDate), last: f0.dateLong(b.sittingDate), n: ids.length };
  }
  function periodFields() {
    var ys = yearSittings(), f0 = f();
    if (!ys.length) return { year: state.scope, first: '', last: '', n: 0 };
    return { year: state.scope, first: f0.dateLong(ys[0].sittingDate), last: f0.dateLong(ys[ys.length - 1].sittingDate), n: ys.length };
  }

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
    var all = store.byPayee[slug] || [];
    // What the payee was paid in each year, for the "other years" line.
    var byYear = {};
    all.forEach(function (i) {
      var ln = store.lines[i], y = ln.s.slice(0, 4);
      byYear[y] = byYear[y] || { amt: 0, lines: 0 };
      byYear[y].amt += L.cents(ln.a); byYear[y].lines++;
    });
    Object.keys(byYear).forEach(function (y) { byYear[y].amt = L.dollars(byYear[y].amt); });
    // A profile shows the year in the URL: a shared link means the same
    // thing to everyone, and the year is the unit of account.
    var idx = all.filter(function (i) { return store.lines[i].s.slice(0, 4) === state.scope; });
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
      first: sits[0] || P.first, last: sits[sits.length - 1] || P.last,
      year: state.scope, byYear: byYear
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
    return yearSittings().map(function (s) {
      return { s: s, amt: L.dollars((by[s.m] || {}).amt || 0), lines: (by[s.m] || {}).lines || 0 };
    });
  }

  /* ============================================================
     the render context handed to ledger-views.js
     ============================================================ */
  function ctx() {
    return {
      store: store, D: D, dx: DX, T: T(), lang: state.lang, f: f(), state: state,
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
      supplierGroups: supplierGroups,
      context: {
        category: function (key) { return cxGet('categories', L.SLUGS[key]); },
        sitting: function (id) { return cxGet('sittings', id); },
        payee: function (slug) { return cxGet('payees', slug); }
      },
      hrefSitting: function (id) { return hrefFor(sittingPatch(id)); },
      hrefCategory: function (key) { return hrefFor(categoryPatch(key)); },
      hrefTab: function (tab) { return hrefFor({ tab: tab, payee: '', payeeScope: '' }); },
      hrefYear: function (y) { return hrefFor({ scope: y, sittings: [] }); },
      payeeMatches: payeeMatches,
      payeeRows: payeeRows, categoryRows: categoryRows, sittingRows: sittingRows, yearSittings: yearSittings, periodFields: periodFields,
      payeeBySitting: payeeBySitting, profileData: profileData,
      widenOffers: widenOffers,
      chart: function (name, canvasId, capId, items, opts) {
        pendingCharts.push({ name: name, canvasId: canvasId, capId: capId, items: items, opts: opts || {} });
      },
      on: {
        payee: openProfile,
        closeProfile: closeProfile,
        sittingOnly: function (id) { setState(sittingPatch(id)); focusPanel(); },
        profileAll: function () { profileRevealed = 1e9; renderAll(); },
        profileCsv: function (slug) { exportPayeeCSV(slug); },
        copyLink: copyLink,
        category: function (key) { setState({ categories: toggleIn(state.categories, L.SLUGS[key]) }); },
        categoryOnly: function (key) { setState(categoryPatch(key)); focusPanel(); },
        supplier: function (slugs) { setState({ supplier: state.supplier.filter(function (s) { return slugs.indexOf(s) < 0; }) }); },
        togglePayeeScope: function () { setState({ payeeScope: state.payeeScope === 'filters' ? '' : 'filters' }, { resetReveal: false }); },
        sitting: function (id) { setState({ sittings: toggleIn(state.sittings, id), tab: state.tab }); },
        setScope: function (v) { setState({ scope: v, sittings: [] }); },
        setScopeKeep: function (v) { setState({ scope: v, sittings: [] }, { resetReveal: false }); },
        setAmount: function (mn, mx) { setState({ min: mn, max: mx }); },
        clearQ: function () { setState({ q: '' }); },
        sort: function (v) { setState({ sort: validSort(v) }, { resetReveal: false }); },
        more: function () { revealed += PAGE_STEP; renderAll(); },
        all: function () { revealAll(); },
        csv: exportCSV,
        disclosuresCsv: exportSuppliersCSV,
        clearFilters: resetFilters,
        retry: function () { linesFailed = false; loading = true; renderAll(); loadPayments(); }
      }
    };
  }

  // "What did this sitting approve?" Every line of that one sitting, with
  // nothing else narrowing it, so the Payments total equals the row the
  // reader clicked (the Sittings table ignores the rail, so must this).
  function sittingPatch(id) {
    return { sittings: [id], scope: String(id).slice(0, 4), tab: 'payments', payee: '', payeeScope: '',
             q: '', categories: [], supplier: [], min: '', max: '' };
  }
  // A category's lines within whatever else is filtered: the Categories
  // table it is clicked from respects the rail, so the total carries over.
  function categoryPatch(key) {
    return { categories: [L.SLUGS[key]], tab: 'payments', payee: '', payeeScope: '' };
  }

  // Suppliers whose NAME (or any spelling of it in the minutes) matches the
  // search, so a search for a supplier offers the supplier itself, from any
  // tab. Ranked by what they were paid across the whole ledger.
  function payeeMatches(limit) {
    var toks = state.q ? L.searchNorm(state.q).split(' ').filter(Boolean) : [];
    if (!toks.length || !store) return { list: [], n: 0 };
    var out = [];
    Object.keys(store.payees).forEach(function (slug) {
      var P = store.payees[slug];
      var hay = L.searchNorm([P.name, payeeName(P)].concat(P.aliases || []).join(' '));
      for (var t = 0; t < toks.length; t++) if (hay.indexOf(toks[t]) < 0) return;
      var c = 0;
      (store.byPayee[slug] || []).forEach(function (i) { c += L.cents(store.lines[i].a); });
      out.push({ slug: slug, name: payeeName(P), total: L.dollars(c) });
    });
    out.sort(function (a, b) { return b.total - a.total; });
    return { list: out.slice(0, limit || 5), n: out.length };
  }

  function openProfile(slug) {
    lastFocus = document.activeElement;
    var place = { revealed: revealed, y: global.pageYOffset || 0, tab: state.tab, row: rowKey(lastFocus) };
    profileRevealed = PROFILE_PAGE;
    setState({ payee: slug }, { resetReveal: false });
    returnTo = place;
    profileEntry = location.search;
  }
  function closeProfile() {
    if (!state.payee) return;
    // Opened in this page and not navigated since: step Back, so history
    // holds one entry for the detour. popstate restores the place.
    if (returnTo && profileEntry === location.search && global.history && global.history.back) {
      global.history.back();
      return;
    }
    var place = returnTo;
    setState({ payee: '' }, { resetReveal: false });
    restorePlace(place);
  }
  // Remember a row by table and position, not by node: the re-render that
  // closes the profile replaces every row.
  function rowKey(node) {
    var n = node;
    while (n && n.tagName !== 'TR') n = n.parentNode;
    if (!n || !n.parentNode || !n.parentNode.children) return null;
    var idx = Array.prototype.indexOf.call(n.parentNode.children, n);
    var tbl = n.parentNode.parentNode;
    var id = tbl && tbl.getAttribute && tbl.getAttribute('id');
    return id && idx >= 0 ? { table: id, i: idx } : null;
  }
  function restorePlace(place) {
    returnTo = null; profileEntry = null;
    if (!place || place.tab !== state.tab) { restoreFocus(); return; }
    var target = null, tbl = place.row && $(place.row.table);
    if (tbl) {
      var body = tbl.getElementsByTagName('tbody')[0];
      var tr = body && body.children[place.row.i];
      target = tr && (tr.getElementsByTagName('button')[0] || tr.getElementsByTagName('a')[0]);
    }
    if (target && target.focus) { try { target.focus({ preventScroll: true }); } catch (e) {} }
    else restoreFocus();
    lastFocus = null;
    if (global.scrollTo) { try { global.scrollTo(0, place.y); } catch (e) {} }
  }

  // "142 matching lines in other sittings — search all sittings". The empty
  // state does research work instead of apologising.
  function widenOffers() {
    var t = T(), out = [];
    if (state.sittings.length) {
      var n = L.filterLines(store, filterSpec({ sittings: [] })).length;
      if (n > indices().length) {
        out.push(V.el('p', null, V.el('button', {
          type: 'button', cls: 'btn ghost',
          text: L.tpl(t.widenYear, { n: f().num(n), year: state.scope }),
          on: { click: function () { setState({ sittings: [] }); } }
        })));
      }
    }
    years().forEach(function (y) {
      if (y === state.scope) return;
      var ny = L.filterLines(store, filterSpec({ sittings: [], scope: y })).length;
      if (!ny) return;
      out.push(V.el('p', null, V.el('button', {
        type: 'button', cls: 'btn ghost',
        text: L.tpl(t.widenYear, { n: f().num(ny), year: y }),
        on: { click: function () { setState({ sittings: [], scope: y }); } }
      })));
    });
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
    setState({ q: '', scope: defaultScope(), sittings: [], categories: [], supplier: [], min: '', max: '', payee: '', payeeScope: '' });
    closeSheet();
    var q = $('door-q'); if (q) { q.value = ''; q.focus(); }
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
  // The suppliers-over-threshold table, every year, one row per supplier.
  function exportSuppliersCSV() {
    var t = T(), thr = (DX && DX.threshold) || 25000, rows = [];
    var years = [];
    store.sittings.forEach(function (s) { if (years.indexOf(s.year) < 0) years.push(s.year); });
    years.sort().forEach(function (y) {
      V.yearTotals(ctx(), y).forEach(function (r) {
        var P = store.payees[r.slug];
        if (r.amt < thr || !P || P.isRest) return;
        rows.push([y, payeeName(P), r.n, r.amt.toFixed(2),
          (P.isPayroll || V.NOT_CONTRACT.test(r.slug)) ? t.discCsvNotContract : t.discCsvContract,
          (D.provenance && D.provenance.source) || '']);
      });
    });
    V.downloadCSV(L.buildCSV(t.csvHeadSuppliers, rows), t.csvFileStem + '-suppliers-' + thr + '.csv');
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
    renderAnswer();
    renderStatus();
    renderJump();
    renderYearJump();
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
    setText('disclaimer-h', t.devShortH);
    setText('disclaimer-b', t.devShort);
    setText('disclaimer-more', t.devMore);
    setText('notice-h', t.devBannerH);
    setText('notice-b', t.devBanner);
    setText('ref-budget', t.refBudget);
    setText('l-door-q', t.railSearch);
    setText('door-go', t.doorGo);
    setText('door-lead', t.doorLead);
    setText('door-help', t.doorHelp);
    var dq = $('door-q');
    if (dq) {
      dq.setAttribute('placeholder', t.doorPlaceholder);
      if (document.activeElement !== dq) dq.value = askText || state.q;
    }
    var dc = $('door-clear');
    if (dc) { dc.setAttribute('aria-label', t.doorClear); dc.hidden = !(askText || hasFilters()); }
    var sk = document.getElementsByClassName('lw-skip');
    if (sk[0]) sk[0].textContent = t.skipResults;
    if (sk[1]) sk[1].textContent = t.skipFilters;
    var rb = $('ref-budget'); if (rb) rb.setAttribute('href', '/finances/budget/?lang=' + state.lang);
    setText('basis-note', t.basisNote);
    setText('basis-link', t.basisLink);
    var basis = $('basis'); if (basis) basis.hidden = state.tab === 'disclosures';
    var bl = $('basis-link'); if (bl) bl.setAttribute('href', '/finances/budget/?lang=' + state.lang + '#budget');

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

  // The front door's questions: each one is WORDS the query bar understands,
  // so the card teaches by example — the reader sees the words land in the
  // bar and turn into chips — and its link (?ask=…) gives an article
  // something to point at. The first three follow the data (latest year,
  // latest sitting) so they never need editing when a sitting lands.
  var PRESETS = ['presetTop', 'presetLast', 'presetWhere', 'presetLaw', 'presetBig', 'presetLegal'];
  function presetWords(key) { return L.tpl(T()[key + 'Ask'], { year: defaultScope() }); }
  function renderPresets() {
    var box = $('presets'); if (!box || !store) return;
    var t = T();
    box.textContent = '';
    PRESETS.forEach(function (key) {
      var words = presetWords(key);
      var sub = L.tpl(t[key + 'Sub'], { year: defaultScope(), date: f().dateLong(store.sittings[store.sittings.length - 1].sittingDate) });
      var p = new URLSearchParams(); p.set('lang', state.lang); p.set('ask', words);
      box.appendChild(V.el('li', null, V.el('a', {
        href: '?' + p.toString(),
        on: { click: function (e) { if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button > 0) return; e.preventDefault(); applyAsk(words); } }
      }, [V.el('strong', { text: t[key] }), V.el('span', { text: sub })])));
    });
  }

  /* ============================================================
     the query bar: plain words → filters. Deterministic, offline, and
     the lexicon (ledger-lexicon.js) is the whole of what it knows.
     ============================================================ */
  var LX = global.OO_LEDGER_LEXICON || null;
  var lexIndex = null;           // [{ words, kind, value }], longest phrase first
  function lexicon() {
    if (lexIndex) return lexIndex;
    var out = [];
    function add(kind, value, words) {
      (words || []).forEach(function (w) {
        var norm = L.searchNorm(w);
        if (norm) out.push({ words: norm.split(' '), kind: kind, value: value });
      });
    }
    function both(e) { return ((e && e.en) || []).concat((e && e.fr) || []); }
    if (LX) {
      Object.keys(LX.categories || {}).forEach(function (slug) { add('category', slug, both(LX.categories[slug])); });
      Object.keys(LX.suppliers || {}).forEach(function (k) { add('supplier', k, LX.suppliers[k].words); });
      Object.keys(LX.views || {}).forEach(function (tab) { if (TABS.indexOf(tab) >= 0) add('view', tab, both(LX.views[tab])); });
      Object.keys(LX.amount || {}).forEach(function (k) { add('amount', k, both(LX.amount[k])); });
      Object.keys(LX.months || {}).forEach(function (m) { add('month', Number(m), both(LX.months[m])); });
      Object.keys(LX.time || {}).forEach(function (k) { add('time', k, both(LX.time[k])); });
      add('stop', null, both(LX.stop));
    }
    out.sort(function (a, b) { return b.words.length - a.words.length; });
    lexIndex = out;
    return out;
  }
  function monthIds() { return (D.months || []).map(function (m) { return m.m; }).sort(); }
  function supplierSlugs(keys) {
    var out = [];
    keys.forEach(function (k) {
      ((LX && LX.suppliers[k] && LX.suppliers[k].slugs) || []).forEach(function (s) { if (out.indexOf(s) < 0) out.push(s); });
    });
    return out.sort();
  }
  // Tokens are matched against the lexicon longest phrase first; what is
  // left is the free-text search. month + year → that month's list; a month
  // alone → the latest year that has it; a year alone → the frame. Nothing
  // recognised → the whole text is searched, exactly as before.
  function parseAsk(text) {
    var raw = String(text || '').trim().slice(0, 120);
    var res = { text: raw, categories: [], suppliers: [], supplierSlugs: [], tab: '', scope: '', sittings: [], min: '', max: '', q: '', matched: false, noSitting: null };
    if (!raw) return res;
    // "25,000" / "25 000" / "1 112 884" → one number token
    var pre = raw.replace(/(\d)[ ,\u00a0\u202f](?=\d{3}(?!\d))/g, '$1');
    var toks = L.searchNorm(pre).split(' ').filter(Boolean);
    var lex = lexicon(), free = [], month = null, year = '', qual = null, parts = 0, ys = years();
    for (var i = 0; i < toks.length;) {
      var hit = null;
      for (var k = 0; k < lex.length && !hit; k++) {
        var e = lex[k], n = e.words.length;
        if (i + n > toks.length) continue;
        var same = true;
        for (var w = 0; w < n; w++) if (toks[i + w] !== e.words[w]) { same = false; break; }
        if (same) hit = e;
      }
      if (hit) {
        i += hit.words.length;
        if (hit.kind === 'stop') continue;
        parts++;
        if (hit.kind === 'category') { if (res.categories.indexOf(hit.value) < 0) res.categories.push(hit.value); }
        else if (hit.kind === 'supplier') { if (res.suppliers.indexOf(hit.value) < 0) res.suppliers.push(hit.value); }
        else if (hit.kind === 'view') res.tab = hit.value;
        else if (hit.kind === 'month') month = hit.value;
        else if (hit.kind === 'time') {
          var ms = monthIds();
          if (hit.value === 'lastSitting' && ms.length) { res.sittings = [ms[ms.length - 1]]; year = ms[ms.length - 1].slice(0, 4); }
          else if (hit.value === 'thisYear') year = defaultScope();
          else if (hit.value === 'lastYear') year = ys[ys.length - 2] || ys[0] || '';
        }
        else if (hit.kind === 'amount') { if (hit.value === 'credits') res.max = '-0.01'; else qual = hit.value; }
        continue;
      }
      var tok = toks[i++];
      var num = /^(\d+)(k)?$/.exec(tok);
      if (num) {
        if (!num[2] && !qual && ys.indexOf(tok) >= 0) { year = tok; parts++; continue; }
        if (qual) {
          var v = Number(num[1]) * (num[2] ? 1000 : 1);
          if (qual === 'over') res.min = String(v); else res.max = String(v);
          qual = null; parts++; continue;
        }
      }
      free.push(tok);
    }
    if (month) {
      var mm = (month < 10 ? '0' : '') + month, found = null, ids = monthIds();
      if (year) found = ids.indexOf(year + '-' + mm) >= 0 ? year + '-' + mm : null;
      else for (var j = ids.length - 1; j >= 0; j--) if (ids[j].slice(5) === mm) { found = ids[j]; break; }
      if (found) { res.sittings = [found]; year = found.slice(0, 4); }
      else res.noSitting = { month: month, year: year || defaultScope() };
      parts++;
    }
    res.scope = year && ys.indexOf(year) >= 0 ? year : '';
    res.supplierSlugs = supplierSlugs(res.suppliers);
    res.matched = parts > 0;
    res.q = res.matched ? free.join(' ') : raw;
    return res;
  }
  // A question replaces the filters: the chips under the bar ARE the
  // answer's terms, so two questions must never compound.
  function applyAsk(text) {
    var r = parseAsk(text);
    var patch = {
      q: r.q, scope: r.scope || state.scope, sittings: r.sittings, categories: r.categories,
      supplier: r.supplierSlugs, min: r.min, max: r.max, payee: '', payeeScope: ''
    };
    patch.tab = r.tab || ((r.matched || state.tab === 'disclosures' || state.tab === 'categories' || state.tab === 'sittings') ? 'payments' : state.tab);
    askText = r.text; askNote = r.noSitting;
    setState(patch, { fromAsk: true });
    var dq = $('door-q'); if (dq) dq.value = r.text;
    focusPanel();
  }
  // The supplier chips: one per lexicon entry whose slugs are all selected
  // ("Dunton Rainville" over three spellings), then one per stray slug.
  function supplierGroups() {
    var left = state.supplier.slice(), out = [];
    if (LX) Object.keys(LX.suppliers || {}).forEach(function (k) {
      var e = LX.suppliers[k], slugs = e.slugs || [];
      if (!slugs.length || !slugs.every(function (s) { return left.indexOf(s) >= 0; })) return;
      out.push({ label: e[state.lang] || e.en, slugs: slugs.slice() });
      left = left.filter(function (s) { return slugs.indexOf(s) < 0; });
    });
    left.forEach(function (s) { out.push({ label: store && store.payees[s] ? payeeName(store.payees[s]) : s, slugs: [s] }); });
    return out;
  }
  // One sentence above the results: the amount, what it is for, which list
  // or year, how many lines and suppliers — the answer to the words typed.
  function renderAnswer() {
    var box = $('answer'); if (!box) return;
    box.textContent = '';
    var show = !!store && !state.payee && state.tab !== 'disclosures' && state.tab !== 'sittings' && (hasFilters() || !!askText);
    box.hidden = !show;
    if (!show) return;
    var t = T(), a = agg(), what = [];
    state.categories.forEach(function (sl) { var key = L.KEY_BY_SLUG[sl]; if (key) what.push(L.tpl(t.answerCat, { v: catName(key) })); });
    supplierGroups().forEach(function (g) { what.push(L.tpl(t.answerSupplier, { v: g.label })); });
    if (state.min === '' && state.max === '-0.01') what.push(t.answerCredits);
    else {
      if (state.min !== '') what.push(L.tpl(t.answerMin, { v: f().money(Number(state.min)) }));
      if (state.max !== '') what.push(L.tpl(t.answerMax, { v: f().money(Number(state.max)) }));
    }
    if (state.q) what.push(L.tpl(t.answerSearch, { v: state.q }));
    var frame;
    if (state.sittings.length === 1) frame = L.tpl(t.answerSitting, { date: f().dateLong(store.sittingById[state.sittings[0]].sittingDate) });
    else if (state.sittings.length) frame = L.tpl(t.answerSittings, { n: f().num(state.sittings.length), year: state.scope });
    else frame = L.tpl(t.answerYear, { year: state.scope });
    box.appendChild(V.el('strong', { text: L.tpl(t.answerLine, {
      amt: f().money(a.total), what: what.length ? what.join(t.answerJoin) : t.answerAll, frame: frame,
      lines: count('nLines', a.lines), payees: count('nPayees', a.payees)
    }) }));
    if (askNote) {
      var mname = '';
      try { mname = new Intl.DateTimeFormat(f().locale, { month: 'long' }).format(new Date(askNote.year + '-' + (askNote.month < 10 ? '0' : '') + askNote.month + '-15T12:00:00')); } catch (e) { mname = String(askNote.month); }
      box.appendChild(V.el('span', { cls: 'note', text: L.tpl(t.answerNoSitting, { month: mname, year: askNote.year }) }));
    }
    if (state.sittings.length) box.appendChild(V.el('span', { cls: 'note', text: t.answerNote }));
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
    setText('sheet-open-label', t.filtersBtn);
    setText('l-sort-mobile', t.sortLabel);
    var sc = $('sheet-close'); if (sc) sc.setAttribute('aria-label', t.sheetClose);
    var sa = $('sheet-apply'); if (sa) sa.textContent = L.tpl(t.sheetApply, { n: f().num(indices().length) });
    var mn = $('amt-min'), mx = $('amt-max');
    if (mn) { mn.setAttribute('placeholder', t.amtMin); if (mn.value !== state.min) mn.value = state.min; }
    if (mx) { mx.setAttribute('placeholder', t.amtMax); if (mx.value !== state.max) mx.value = state.max; }

    // scope segment
    var sg = $('scope-group');
    if (sg) {
      sg.textContent = '';
      years().map(function (y) { return { v: y, label: y }; })
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
      // Sort only means something on the two sortable views.
      sm.hidden = !(state.tab === 'payments' || state.tab === 'payees');
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
    n += state.sittings.length + state.categories.length + supplierGroups().length;
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
    var labels = { payments: t.tabPayments, payees: t.tabPayees, categories: t.tabCategories, sittings: t.tabSittings, disclosures: t.tabDisclosures };
    TABS.forEach(function (id) {
      var b = $('tab-' + id);
      if (!b) return;
      b.textContent = '';
      b.appendChild(document.createTextNode(labels[id] + ' '));
      // Disclosures is a register, not a result set: no count on its tab.
      if (counts[id] != null) b.appendChild(V.el('span', { cls: 'ct', text: '(' + f().num(counts[id]) + ')' }));
      var on = state.tab === id && !state.payee;
      b.setAttribute('aria-selected', String(on));
      b.setAttribute('tabindex', on ? '0' : '-1');
    });
    setText('orient', t['orient' + state.tab.charAt(0).toUpperCase() + state.tab.slice(1)]);
  }

  // The scope row says, in one line, everything that is narrowing the
  // result: a lead label, one removable chip per filter, and a single
  // "clear all" once anything beyond the default year is applied. The
  // default year shows as a chip too, so the reader always sees the scope.
  function renderChips() {
    var box = $('chips'); if (!box) return;
    var t = T();
    box.textContent = '';
    // The Disclosures register ignores the rail, so its chips would promise
    // a narrowing that is not happening.
    if (state.tab === 'disclosures') return;
    var chips = V.chips(ctx());
    if (!chips.children.length) return;
    box.appendChild(V.el('span', { cls: 'lead', id: 'chips-lead', text: t.chipsLead }));
    box.appendChild(chips);
    if (hasFilters()) {
      box.appendChild(V.el('button', {
        type: 'button', cls: 'linkbtn chips-reset', text: t.chipsReset,
        on: { click: resetFilters }
      }));
    }
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
      // The period already counts the year's sittings; count them separately
      // only when a filter narrows to fewer.
      parts.push(periodText());
      parts.push(L.tpl(t.statusSorted, { field: sortLabel() }));
    } else if (state.tab === 'payees') {
      parts.push(count('nPayees', a.payees));
      parts.push(f().money(a.total));
      parts.push(periodText());
      parts.push(L.tpl(t.statusSorted, { field: sortLabel() }));
    } else if (state.tab === 'categories') {
      parts.push(count('nCategories', a.mix.length));
      parts.push(f().money(a.total));
      parts.push(periodText());
    } else if (state.tab === 'disclosures') {
      parts.push(t.statusDisclosures);
    } else {
      var ys = yearSittings();
      parts.push(count('nSittings', ys.length));
      parts.push(L.tpl(t.statusAdopted, { amt: f().money(ys.reduce(function (a, s) { return a + s.total; }, 0)) }));
      parts.push(L.tpl(t.statusPeriod, periodFields()));
    }
    var box = $('results-status');
    box.textContent = '';
    parts.forEach(function (p, i) {
      if (i) box.appendChild(V.el('span', { cls: 'sep', text: '·' }));
      if (typeof p === 'string') box.appendChild(V.el('span', { cls: i === 0 ? 'big' : null, text: p }));
      else box.appendChild(p);
    });
  }
  // A search names a supplier more often than not. Whatever tab the reader
  // is on, offer the matching suppliers' profiles one click away, instead
  // of leaving them to find the Suppliers tab and then the name.
  function renderJump() {
    var box = $('payee-jump'); if (!box) return;
    box.textContent = '';
    var m = (state.q && !state.payee && state.tab !== 'payees') ? payeeMatches(5) : { list: [], n: 0 };
    if (!m.list.length && state.supplier.length && !state.payee && state.tab !== 'payees') {
      var list = [];
      state.supplier.forEach(function (slug) {
        var P = store.payees[slug]; if (!P) return;
        var c = 0; (store.byPayee[slug] || []).forEach(function (i) { c += L.cents(store.lines[i].a); });
        list.push({ slug: slug, name: payeeName(P), total: L.dollars(c) });
      });
      list.sort(function (a, b) { return b.total - a.total; });
      m = { list: list.slice(0, 5), n: list.length };
    }
    box.hidden = !m.list.length;
    if (!m.list.length) return;
    var t = T();
    box.appendChild(V.el('span', { cls: 'lead', text: t.jumpLead }));
    m.list.forEach(function (r, i) {
      if (i) box.appendChild(document.createTextNode(' · '));
      box.appendChild(V.navLink(hrefFor({ payee: r.slug }), r.name, function () { openProfile(r.slug); }));
    });
    if (m.n > m.list.length) {
      box.appendChild(document.createTextNode(' · '));
      box.appendChild(V.navLink(hrefFor({ tab: 'payees' }), L.tpl(t.jumpMore, { n: f().num(m.n - m.list.length) }),
        function () { setState({ tab: 'payees' }); focusPanel(); }));
    }
  }

  // "Also in 2025: 3 lines" — the reader's filters, run against the other
  // years, so a year frame never hides a hit.
  function renderYearJump() {
    var box = $('year-jump'); if (!box) return;
    box.textContent = '';
    var show = !state.payee && (state.tab === 'payments' || state.tab === 'payees') && hasFilters();
    var hits = [];
    if (show) {
      years().forEach(function (y) {
        if (y === state.scope) return;
        var n = L.filterLines(store, filterSpec({ sittings: [], scope: y })).length;
        if (n) hits.push({ y: y, n: n });
      });
    }
    box.hidden = !hits.length;
    if (!hits.length) return;
    var t = T();
    box.appendChild(V.el('span', { cls: 'lead', text: t.yearJumpLead }));
    hits.forEach(function (h, i) {
      if (i) box.appendChild(document.createTextNode(' · '));
      box.appendChild(V.navLink(hrefFor({ scope: h.y, sittings: [] }), L.tpl(t.yearJumpItem, { year: h.y, n: f().num(h.n) }),
        function () { setState({ scope: h.y, sittings: [] }); focusPanel(); }));
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
      // Land on the profile's top (its name and Back button), not wherever
      // focus() happens to scroll to: from deep in a long table the reader
      // used to arrive mid-profile, under the phone's sticky filter bar.
      if (!wasOpen && pf.focus) {
        try { pf.focus({ preventScroll: true }); } catch (e) {}
        if (pf.scrollIntoView) { try { pf.scrollIntoView({ block: 'start' }); } catch (e) {} }
      }
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
    bits.push(L.tpl(t.chipScope, periodFields()));
    state.sittings.forEach(function (id) { bits.push(L.tpl(t.chipSitting, { v: sittingLabel(store.sittingById[id]) })); });
    state.categories.forEach(function (s) { bits.push(L.tpl(t.chipCategory, { v: catName(L.KEY_BY_SLUG[s]) })); });
    supplierGroups().forEach(function (g) { bits.push(L.tpl(t.chipSupplier, { v: g.label })); });
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
  var amtTimer = null;
  function wire() {
    var df = $('door-form');
    if (df) df.addEventListener('submit', function (e) {
      e.preventDefault();
      applyAsk(($('door-q') || {}).value || '');
    });
    on('door-clear', resetFilters);

    ['amt-min', 'amt-max'].forEach(function (id) {
      var n = $(id); if (!n) return;
      n.addEventListener('input', function () {
        clearTimeout(amtTimer);
        amtTimer = setTimeout(function () {
          typed({ min: numParam($('amt-min').value), max: numParam($('amt-max').value) });
        }, 300);
      });
      n.addEventListener('blur', function () { typingPushed = false; });
    });

    on('sit-all', function () { setState({ sittings: [] }); });
    on('sit-none', function () { if (store) setState({ sittings: store.sittings.map(function (s) { return s.m; }) }); });
    on('cat-all', function () { setState({ categories: [] }); });
    on('cat-none', function () { if (store) setState({ categories: store.categories.map(function (c) { return L.SLUGS[c.key]; }) }); });
    on('reset', resetFilters);
    on('sheet-reset', resetFilters);
    on('sheet-apply', closeSheet);
    on('sheet-close', closeSheet);
    on('sheet-open', openSheet);
    var scrim = $('lw-scrim'); if (scrim) scrim.addEventListener('click', closeSheet);
    // Below 900px the rail is a closed sheet (display:none), so "Skip to
    // the filters" would land nowhere. There it opens the sheet instead.
    var skips = document.getElementsByClassName('lw-skip');
    if (skips[1]) skips[1].addEventListener('click', function (e) {
      if (!isMobile()) return;
      if (e && e.preventDefault) e.preventDefault();
      openSheet();
    });

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
      if (state.payee) closeProfile();
    });

    global.addEventListener('popstate', function () {
      readURL();
      // Back out of a profile opened here: put the reader where they were.
      var place = !state.payee && returnTo ? returnTo : null;
      if (!state.payee) { returnTo = null; profileEntry = null; }
      revealed = place ? place.revealed : PAGE_SIZE;
      profileRevealed = PROFILE_PAGE;
      idxCache = aggCache = null;
      typingPushed = false;
      applyLangChrome();
      renderAll();
      if (place) restorePlace(place);
    });

    // Print the whole filtered set, never the reveal window - then put the
    // window back, so the screen isn't left with every row after printing.
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
  function typed(patch) {
    setState(patch, { push: !typingPushed });
    typingPushed = true;
  }

  function focusPanel() {
    var p = $('panel-' + state.tab);
    if (p && !p.hidden && p.focus) p.focus();
  }

  /* ---------- mobile sheet ---------- */
  function isMobile() { try { return global.matchMedia('(max-width: 900px)').matches; } catch (e) { return false; } }
  function sheetOpen() { var r = $('rail'); return !!(r && r.classList.contains('is-open')); }
  function openSheet() {
    if (!isMobile()) { var q = $('door-q'); if (q) q.focus(); return; }
    var r = $('rail'), s = $('lw-scrim'), b = $('sheet-open');
    r.classList.add('is-open');
    r.setAttribute('role', 'dialog');
    r.setAttribute('aria-modal', 'true');
    s.classList.add('is-open');
    b.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
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

  // For finances/tests/render-check.js only: the parser, so a case can be
  // asserted without typing it into the box.
  global.OO_LEDGER_APP = { parseAsk: parseAsk };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
