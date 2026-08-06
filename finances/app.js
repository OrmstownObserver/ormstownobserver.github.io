/* ============================================================
   Ormstown Observer — public money explorer.
   One normalized state {lang, period, category} drives summary,
   charts, results, exports and the URL. Sorting is fixed (largest
   amount first) and the default period is the year-to-date view.
   Official values come from spending-data.js and are never altered here.
   ============================================================ */
(function () {
  'use strict';

  var D = window.OO_SPENDING || null;
  var I18N = window.OO_I18N;
  var $ = function (id) { return document.getElementById(id); };
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- language + copy helpers ----------
  function T() { return I18N[state.lang]; }
  function tpl(s, map) { return s.replace(/\{(\w+)\}/g, function (_, k) { return map[k] != null ? map[k] : ''; }); }
  function locale() { return state.lang === 'fr' ? 'fr-CA' : 'en-CA'; }
  function money(v) { return new Intl.NumberFormat(locale(), { style: 'currency', currency: 'CAD' }).format(v); }
  function money0(v) { return new Intl.NumberFormat(locale(), { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(v); }
  function pct(v) { return new Intl.NumberFormat(locale(), { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v); }
  function dateLong(iso) { return new Intl.DateTimeFormat(locale(), { dateStyle: 'long' }).format(new Date(iso + 'T12:00:00')); }
  function monthShort(ym) { return new Intl.DateTimeFormat(locale(), { month: 'short' }).format(new Date(ym + '-15T12:00:00')); }

  // ---------- category slugs (URL-stable, language-free) ----------
  var SLUGS = {
    'Salaries & HR': 'salaries-hr',
    'Contracts — works': 'contracts-works',
    'Supplies & operations': 'supplies-operations',
    'Professional services': 'professional-services',
    'Legal — external counsel': 'legal-services',
    'Subsidies & community': 'subsidies-community',
    'Financing & debt': 'financing-debt',
    'Utilities': 'utilities',
    'Vehicle fuel & maintenance': 'vehicle-fuel-maintenance',
    'Waste & recycling': 'waste-recycling',
    'Other': 'other'
  };
  var KEY_BY_SLUG = {};
  Object.keys(SLUGS).forEach(function (k) { KEY_BY_SLUG[SLUGS[k]] = k; });
  function catName(key) {
    return (D.categories[key] && D.categories[key][state.lang]) || key;
  }

  // ---------- sentinel payees (Observer-created labels, localized) ----------
  function isPayroll(name) { return /paie municipale|municipal payroll/i.test(name); }
  function isRest(name) { return /^— (Autres fournisseurs|Other suppliers)/i.test(name) || /^— Autres fournisseurs/.test(name); }
  function localPayee(name) {
    if (isPayroll(name)) return T().payeePayroll;
    if (isRest(name)) return T().payeeRest;
    return name;
  }

  // ---------- data preparation (derived only; official values untouched) ----------
  var FY, MONTHS = [], PERIODS = [], YTD = null, LAST_FULL = null;
  function prepare() {
    D.months.forEach(function (m) {
      m.payees = D.entries.filter(function (e) { return e[0] === m.m; })
        .map(function (e) { return { payee: e[1], cat: e[2], amt: e[3], lines: e[4], month: m.m }; });
      var d = /(\d{4}-\d{2}-\d{2})/.exec(m.session); m.sittingDate = d ? d[1] : (m.m + '-01');
      var r = /rés\.\s*([0-9\-]+)/.exec(m.session); m.resolution = r ? r[1] : '';
    });
    FY = D.months.map(function (m) { return m.m.slice(0, 4); }).sort().slice(-1)[0];
    MONTHS = D.months.filter(function (m) { return m.m.slice(0, 4) === FY; });
    var fulls = MONTHS.filter(function (m) { return m.coverage === 'full'; });
    LAST_FULL = fulls[fulls.length - 1] || MONTHS[MONTHS.length - 1];
    YTD = {
      m: 'ytd-' + FY, isYTD: true,
      total: Math.round(MONTHS.reduce(function (a, m) { return a + m.total; }, 0) * 100) / 100,
      coverage: MONTHS.every(function (m) { return m.coverage === 'full'; }) ? 'full' : 'partial',
      nSittings: MONTHS.length,
      url: 'https://www.ormstown.ca/ma-municipalite/vie-democratique/seances-du-conseil-municipal',
      payees: MONTHS.reduce(function (a, m) { return a.concat(m.payees); }, [])
    };
    // The period picker offers the year-to-date view plus each sitting of
    // the current fiscal year; months and categories are both multi-select
    // (older sittings stay in the coverage table and the full CSV).
    CAT_ORDER = catAggregates(YTD.payees).map(function (a) { return a.key; });
  }
  var CAT_ORDER = [];
  // The combined view for whatever months/categories are pressed.
  function selection() {
    var ms = state.months.length
      ? MONTHS.filter(function (m) { return state.months.indexOf(m.m) >= 0; })
      : MONTHS;
    return {
      months: ms,
      isYTD: !state.months.length,
      single: ms.length === 1 ? ms[0] : null,
      total: Math.round(ms.reduce(function (a, m) { return a + m.total; }, 0) * 100) / 100,
      coverage: ms.every(function (m) { return m.coverage === 'full'; }) ? 'full' : 'partial',
      payees: ms.reduce(function (a, m) { return a.concat(m.payees); }, []),
      url: ms.length === 1 ? ms[0].url : YTD.url
    };
  }
  function monthBtnLabel(m) {
    var s = monthShort(m.m);
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  function selectionLabel(sel) {
    if (sel.isYTD) return tpl(T().ytdLabel, { year: FY });
    if (sel.single) return periodLabel(sel.single);
    return sel.months.map(monthBtnLabel).join(' + ') + ' ' + FY;
  }
  function periodLabel(p) {
    if (p.isYTD) return tpl(T().ytdLabel, { year: FY });
    return state.lang === 'fr' ? p.label_fr : p.label_en;
  }
  function monthById(id) { return D.months.filter(function (m) { return m.m === id; })[0]; }

  // ---------- state <-> URL ----------
  // Sorting is fixed: categories and payees always largest amount first.
  // months: [] means the full year to date; categories: [] means all.
  var state = { lang: 'fr', months: [], categories: [] };

  function readURL() {
    var p = new URLSearchParams(location.search);
    var lang = p.get('lang'); if (lang === 'fr' || lang === 'en') state.lang = lang;
    else { try { var l = localStorage.getItem('observerLang'); if (l === 'fr' || l === 'en') state.lang = l; else state.lang = (navigator.language || 'fr').indexOf('en') === 0 ? 'en' : 'fr'; } catch (e) {} }
    var per = (p.get('period') || '').split(',').filter(function (id) {
      return MONTHS.some(function (m) { return m.m === id; });
    });
    state.months = (per.length && per.length < MONTHS.length) ? per.sort() : [];
    state.categories = (p.get('category') || '').split(',').filter(function (c) { return KEY_BY_SLUG[c]; });
  }
  function writeURL(push) {
    var p = new URLSearchParams();
    p.set('lang', state.lang);
    if (state.months.length) p.set('period', state.months.join(','));
    if (state.categories.length) p.set('category', state.categories.join(','));
    var url = location.pathname + '?' + p.toString();
    try { history[push ? 'pushState' : 'replaceState'](null, '', url); } catch (e) {}
  }
  function toggleMonth(id) {
    var ms = state.months.slice();
    if (!ms.length) ms = [id]; // leaving the year-to-date view for one month
    else { var i = ms.indexOf(id); if (i >= 0) ms.splice(i, 1); else ms.push(id); }
    if (ms.length === 0 || ms.length === MONTHS.length) ms = [];
    setState({ months: ms.sort() }, { push: true });
  }
  function toggleCat(slug) {
    var cs = state.categories.slice();
    var i = cs.indexOf(slug);
    if (i >= 0) cs.splice(i, 1); else cs.push(slug);
    setState({ categories: cs }, { push: true });
  }
  function setState(patch, opts) {
    opts = opts || {};
    var langChanged = patch.lang && patch.lang !== state.lang;
    Object.keys(patch).forEach(function (k) { state[k] = patch[k]; });
    writeURL(!!opts.push);
    if (langChanged) {
      try { localStorage.setItem('observerLang', state.lang); localStorage.setItem('oo_lang', state.lang); } catch (e) {}
      renderAll();
    } else {
      renderSnapshot(); updateTrend(); renderExplore();
    }
  }

  // ---------- filtering ----------
  function currentRows(sel) {
    var keys = state.categories.map(function (s) { return KEY_BY_SLUG[s]; });
    return sel.payees.filter(function (r) { return !keys.length || keys.indexOf(r.cat) >= 0; });
  }
  function sortRows(rows) {
    return rows.slice().sort(function (a, b) { return b.amt - a.amt; });
  }

  // ---------- charts ----------
  var charts = {};
  function chartDefaults() {
    if (typeof Chart === 'undefined') return false;
    Chart.defaults.animation = REDUCED ? false : { duration: 350 };
    Chart.defaults.font.family = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
    return true;
  }
  function hatch(ctx, color) {
    var c = document.createElement('canvas'); c.width = c.height = 8;
    var x = c.getContext('2d');
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, 8, 8);
    x.strokeStyle = color; x.lineWidth = 2;
    x.beginPath(); x.moveTo(-2, 10); x.lineTo(10, -2); x.stroke();
    return ctx.createPattern(c, 'repeat');
  }
  function killChart(name) { if (charts[name]) { charts[name].destroy(); charts[name] = null; } }
  function chartFail(figId) {
    var cap = $(figId); if (cap) cap.textContent = T().chartFail;
  }

  function drawTrend() {
    killChart('trend');
    if (!chartDefaults()) { chartFail('trend-legend'); return; }
    try {
      var ctx = $('chart-trend').getContext('2d');
      var accent = '#2c5f7c', ink = '#1f2733';
      charts.trend = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: MONTHS.map(function (m) { return monthShort(m.m) + (m.coverage !== 'full' ? ' *' : ''); }),
          datasets: [{
            data: MONTHS.map(function (m) { return m.total; }),
            backgroundColor: MONTHS.map(function (m) { return m.coverage === 'full' ? accent : hatch(ctx, accent); }),
            borderColor: MONTHS.map(function (m) { return state.months.indexOf(m.m) >= 0 ? ink : 'transparent'; }),
            borderWidth: MONTHS.map(function (m) { return state.months.indexOf(m.m) >= 0 ? 3 : 0; }),
            borderRadius: 3
          }]
        },
        options: {
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true, ticks: { callback: function (v) { return money0(v); } } } },
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (c) { return money(c.parsed.y); } } } },
          onClick: function (e, els) { if (els.length) toggleMonth(MONTHS[els[0].index].m); }
        }
      });
    } catch (e) { chartFail('trend-legend'); }
  }
  function updateTrend() {
    if (!charts.trend) { drawTrend(); return; }
    var ink = '#1f2733';
    charts.trend.data.datasets[0].borderColor = MONTHS.map(function (m) { return state.months.indexOf(m.m) >= 0 ? ink : 'transparent'; });
    charts.trend.data.datasets[0].borderWidth = MONTHS.map(function (m) { return state.months.indexOf(m.m) >= 0 ? 3 : 0; });
    charts.trend.update(REDUCED ? 'none' : undefined);
  }

  function catAggregates(rows) {
    var by = {};
    rows.forEach(function (r) { by[r.cat] = by[r.cat] || { amt: 0, lines: 0, n: 0 }; by[r.cat].amt += r.amt; by[r.cat].lines += r.lines; by[r.cat].n++; });
    return Object.keys(by).map(function (k) { return { key: k, amt: Math.round(by[k].amt * 100) / 100, lines: by[k].lines, n: by[k].n }; })
      .sort(function (a, b) { return b.amt - a.amt; });
  }
  function drawCats(aggs, restAmt) {
    killChart('cats');
    if (!chartDefaults()) { chartFail('cats-caption'); return; }
    try {
      var ctx = $('chart-cats').getContext('2d');
      var selKeys = state.categories.map(function (s) { return KEY_BY_SLUG[s]; });
      var labels = aggs.map(function (a) { return catName(a.key); });
      var data = aggs.map(function (a) { return a.amt; });
      var colors = aggs.map(function (a) {
        var c = (D.categories[a.key] || {}).color || '#888888';
        return (selKeys.length && selKeys.indexOf(a.key) < 0) ? c + '4d' : c; // dim unselected to keep chart and list in sync
      });
      if (restAmt > 0.5) { labels.push(D.categories.__rest[state.lang]); data.push(restAmt); colors.push(D.categories.__rest.color); }
      charts.cats = new Chart(ctx, {
        type: 'bar',
        data: { labels: labels, datasets: [{ data: data, backgroundColor: colors, borderRadius: 3 }] },
        options: {
          indexAxis: 'y', maintainAspectRatio: false,
          scales: { x: { beginAtZero: true, ticks: { callback: function (v) { return money0(v); } } } },
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (c) { return money(c.parsed.x); } } } },
          onClick: function (e, els) {
            if (!els.length) return;
            var a = aggs[els[0].index]; if (!a) return;
            toggleCat(SLUGS[a.key]);
          }
        }
      });
    } catch (e) { chartFail('cats-caption'); }
  }

  var budgetSort = 'amount';
  function drawBudget() {
    killChart('budget');
    var B = D.budget;
    var fns = B.functions.slice().sort(function (a, b) {
      if (budgetSort === 'change') return (b.b - b.prev) - (a.b - a.prev);
      return b.b - a.b;
    });
    buildBudgetTable(fns);
    if (!chartDefaults()) { chartFail('budget-figcap'); return; }
    try {
      var ctx = $('chart-budget').getContext('2d');
      charts.budget = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: fns.map(function (f) { return state.lang === 'fr' ? f.fr : f.en; }),
          datasets: [
            { label: String(B.year), data: fns.map(function (f) { return f.b; }), backgroundColor: '#2c5f7c', borderRadius: 2 },
            { label: String(B.year - 1), data: fns.map(function (f) { return f.prev; }), backgroundColor: '#a8c4d4', borderRadius: 2 }
          ]
        },
        options: {
          indexAxis: 'y', maintainAspectRatio: false,
          scales: { x: { ticks: { callback: function (v) { return money0(v); } } } },
          plugins: { tooltip: { callbacks: { label: function (c) { return c.dataset.label + ' : ' + money0(c.parsed.x); } } } }
        }
      });
      $('budget-figcap').textContent = '';
    } catch (e) { chartFail('budget-figcap'); }
  }

  // ---------- rendering: chrome (language-dependent, filter-independent) ----------
  function renderAll() {
    var t = T();
    document.documentElement.lang = state.lang;
    document.title = t.htmlTitle;
    $('skiplink').textContent = t.skip;
    $('home-link').textContent = t.back;
    $('eyebrow').textContent = t.eyebrow;
    $('btn-fr').setAttribute('aria-pressed', String(state.lang === 'fr'));
    $('btn-en').setAttribute('aria-pressed', String(state.lang === 'en'));
    $('title').textContent = t.title;
    $('deck').textContent = t.deck;
    $('status').textContent = tpl(t.status, { date: dateLong(LAST_FULL.sittingDate) });
    $('updated').textContent = tpl(t.updated, { date: dateLong(D.generated) });
    $('courtesy').innerHTML = t.courtesy;
    $('footer').innerHTML = t.footer + ' · ' + tpl(t.updated, { date: dateLong(D.generated) });
    $('snap-h').textContent = t.snapH;

    // Trend chrome + table
    $('trend-h').textContent = t.trendH;
    $('trend-sub').textContent = tpl(t.trendSub, { year: FY });
    $('trend-legend').innerHTML = [t.legendFull, t.legendPartial, t.legendSelected]
      .map(function (x) { return '<li>' + x + '</li>'; }).join('');
    $('trend-summary').textContent = t.trendCaption ? tpl(t.trendCaption, { year: FY }) : '';
    $('trend-caption').textContent = tpl(t.trendCaption, { year: FY });
    document.querySelector('#trend-table thead tr').innerHTML =
      '<th scope="col">' + t.thSitting + '</th><th scope="col" class="num">' + t.thTotal + '</th><th scope="col">' + t.thStatus + '</th><th scope="col">' + t.thNote + '</th>';
    document.querySelector('#trend-table tbody').innerHTML = MONTHS.map(function (m) {
      var note = state.lang === 'fr' ? (m.note_fr || '') : (m.note_en || '');
      return '<tr><th scope="row" data-l="' + t.thSitting + '">' + periodLabel(m) + '</th>' +
        '<td class="num" data-l="' + t.thTotal + '">' + money(m.total) + '</td>' +
        '<td data-l="' + t.thStatus + '">' + (m.coverage === 'full' ? t.statusFull : t.statusPartial) + '</td>' +
        '<td data-l="' + t.thNote + '">' + (note || '—') + '</td></tr>';
    }).join('');

    // Explore chrome
    $('explore-tag').textContent = t.eyebrow.split('·')[1] ? t.eyebrow.split('·')[1].trim() : '';
    $('explore-h').textContent = t.exploreH;
    $('explore-sub').textContent = t.exploreSub;
    $('l-period').textContent = t.periodLabel;
    $('l-category').textContent = t.categoryLabel;
    $('f-reset').textContent = t.reset;
    buildControls();
    $('cats-caption').textContent = t.catChartCaption;
    $('catlist-h').textContent = t.catListCaption;
    $('results-caption').textContent = t.resultsCaption;
    $('dl-view').textContent = t.downloadView;
    $('src-link').textContent = t.viewSource;
    $('signals-h').textContent = t.signalsH;
    $('signals-note').textContent = t.signalsNote;

    // Annual chrome
    var B = D.budget;
    $('annual-h').textContent = t.annualH;
    $('acct-note').innerHTML = t.accountingNote;
    $('scale-tag').textContent = t.scaleTag;
    var approved = YTD.total;
    $('scale-line').textContent = tpl(t.scaleSentence, {
      n: MONTHS.length, year: FY, amt: money0(approved),
      pct: pct(approved / B.expenses_total), budget: money0(B.expenses_total), adopted: dateLong(B.adopted)
    });
    $('budget-h').textContent = tpl(t.budgetH, { year: B.year, prev: B.year - 1 });
    $('budget-sub').textContent = t.budgetSub;
    $('l-bsort').textContent = t.budgetSort;
    $('b-sort').innerHTML =
      '<option value="amount">' + tpl(t.budgetSortAmount, { year: B.year }) + '</option>' +
      '<option value="change">' + tpl(t.budgetSortChange, { prev: B.year - 1 }) + '</option>';
    $('b-sort').value = budgetSort;
    $('budget-summary').textContent = tpl(t.budgetCaption, { year: B.year, prev: B.year - 1 });
    $('budget-caption').textContent = tpl(t.budgetCaption, { year: B.year, prev: B.year - 1 });
    $('budget-src').innerHTML = t.budgetSrc + ' <a href="' + B.url + '" target="_blank" rel="noopener">' +
      tpl(t.budgetLeaflet, { year: B.year }) + '</a> · <a href="' + B.url_pti + '" target="_blank" rel="noopener">' + t.ptiLeaflet + '</a>';
    drawBudget();

    // Capital
    $('capital-h').textContent = t.capitalH;
    $('capital-sub').textContent = t.capitalSub;
    $('pti-cards').innerHTML = B.pti.map(function (p) {
      var note = state.lang === 'fr' ? p.note_fr : p.note_en;
      return '<article class="pcard"><h3>' + (state.lang === 'fr' ? p.fr : p.en) + '</h3>' +
        '<dl><dt>' + t.plan2026 + '</dt><dd>' + (p.y2026 != null ? money0(p.y2026) : '<span style="font-weight:400;color:var(--ink-soft)">' + t.noPlan + '</span>') + '</dd>' +
        '<dt>' + t.envelope + '</dt><dd>' + money0(p.total) + '</dd></dl>' +
        '<p class="fund"><strong>' + t.fundingLabel + '</strong> — ' + p.fund + '</p>' +
        (note ? '<p class="pnote">' + note + '</p>' : '') + '</article>';
    }).join('');
    $('acronyms-h').textContent = t.acronymsH;
    $('acronyms-list').innerHTML = t.acronyms.map(function (a) {
      return '<div style="margin:4px 0"><dt style="display:inline;font-weight:700">' + a[0] + '</dt> — <dd style="display:inline">' + a[1] + '</dd></div>';
    }).join('');

    // Verify
    $('verify-h').textContent = t.verifyH;
    $('coverage-h').textContent = t.coverageH;
    $('coverage-sub').textContent = t.coverageSub;
    $('coverage-caption').textContent = t.coverageH;
    document.querySelector('#coverage-table thead tr').innerHTML =
      '<th scope="col">' + t.thSitting + '</th><th scope="col">' + t.thStatus + '</th><th scope="col" class="num">' + t.thTotal + '</th><th scope="col">' + t.sourceLabel + '</th>';
    document.querySelector('#coverage-table tbody').innerHTML = D.months.map(function (m) {
      return '<tr><th scope="row" data-l="' + t.thSitting + '">' + periodLabel(m) + '<span class="gloss">' + m.session + '</span></th>' +
        '<td data-l="' + t.thStatus + '">' + (m.coverage === 'full' ? t.statusFull : t.statusPartial) + '</td>' +
        '<td class="num" data-l="' + t.thTotal + '">' + money(m.total) + '</td>' +
        '<td data-l="' + t.sourceLabel + '"><a href="' + m.url + '" target="_blank" rel="noopener">' + t.covSource + '</a></td></tr>';
    }).join('');
    $('methodology-h').textContent = t.methodologyH;
    $('meth-list').innerHTML = t.meth.map(function (x) { return '<li>' + x + '</li>'; }).join('');
    $('docs-h').textContent = t.docsH;
    var docs = D.months.map(function (m) { return { label: periodLabel(m) + ' — ' + m.session, url: m.url }; });
    docs.push({ label: tpl(t.budgetLeaflet, { year: B.year }), url: B.url });
    docs.push({ label: t.ptiLeaflet, url: B.url_pti });
    $('doc-list').innerHTML = docs.map(function (d) {
      return '<li><a href="' + d.url + '" target="_blank" rel="noopener">' + d.label + ' ' + t.newTab + '</a></li>';
    }).join('');
    $('dict-h').textContent = t.dictH;
    $('dict-list').innerHTML = t.dict.map(function (row) {
      return '<div style="margin:4px 0"><dt style="display:inline;font-weight:700">' + row[0] + '</dt> — <dd style="display:inline">' + row[1] + '</dd></div>';
    }).join('');
    $('dl-all').textContent = t.downloadAll;
    $('print-btn').textContent = t.printBtn;

    drawTrend();
    renderSnapshot();
    renderExplore();
  }

  function buildControls() {
    var t = T();
    $('l-period').textContent = t.periodLabel;
    $('period-group').innerHTML =
      '<button type="button" data-period="__ytd__">' + tpl(t.ytdShort, { year: FY }) + '</button>' +
      MONTHS.map(function (m) {
        return '<button type="button" data-period="' + m.m + '">' + monthBtnLabel(m) + '</button>';
      }).join('');
    $('l-category').textContent = t.categoryLabel;
    $('category-group').innerHTML =
      '<button type="button" data-cat="__all__">' + t.catAllShort + '</button>' +
      CAT_ORDER.map(function (k) {
        return '<button type="button" data-cat="' + SLUGS[k] + '"><span class="dot" style="background:' + ((D.categories[k] || {}).color || '#888') + '"></span>' + catName(k) + '</button>';
      }).join('');
  }
  function syncPills() {
    document.querySelectorAll('#period-group button').forEach(function (b) {
      var id = b.getAttribute('data-period');
      b.setAttribute('aria-pressed', String(id === '__ytd__' ? !state.months.length : state.months.indexOf(id) >= 0));
    });
    document.querySelectorAll('#category-group button').forEach(function (b) {
      var s = b.getAttribute('data-cat');
      b.setAttribute('aria-pressed', String(s === '__all__' ? !state.categories.length : state.categories.indexOf(s) >= 0));
    });
  }

  // ---------- rendering: snapshot ----------
  function renderSnapshot() {
    var t = T(), p = selection();
    var rows = p.payees;
    var payroll = rows.filter(function (r) { return isPayroll(r.payee); }).reduce(function (a, r) { return a + r.amt; }, 0);
    var top = rows.filter(function (r) { return !isPayroll(r.payee) && !isRest(r.payee); })
      .sort(function (a, b) { return b.amt - a.amt; })[0];
    var itemized = Math.round(rows.reduce(function (a, r) { return a + r.amt; }, 0) * 100) / 100;
    var nLines = rows.reduce(function (a, r) { return a + r.lines; }, 0);
    var gap = Math.round((p.total - itemized) * 100) / 100;

    var facts = [];
    facts.push({
      l: t.factTotal, v: money(p.total),
      s: p.isYTD ? tpl(t.factTotalSubYtd, { n: p.months.length, year: FY })
        : (p.single
          ? periodLabel(p.single) + (p.single.resolution ? ' · ' + t.resLabel + ' ' + p.single.resolution : '')
          : tpl(t.factTotalSubSel, { n: p.months.length }) + ' — ' + selectionLabel(p))
    });
    facts.push({
      l: t.factPayroll,
      v: payroll > 0 ? money(payroll) : '—',
      s: payroll > 0 ? tpl(t.factPayrollSub, { pct: pct(payroll / p.total) }) : t.factPayrollNone
    });
    facts.push({
      l: t.factTop,
      v: top ? money(top.amt) : '—',
      s: top ? (localPayee(top.payee) + ((D.gloss[top.payee] || {})[state.lang] ? ' — ' + D.gloss[top.payee][state.lang] : '')) : '—'
    });
    var reconV, reconS;
    if (!p.single) {
      var ok = p.months.filter(function (m) {
        var s = m.payees.reduce(function (a, r) { return a + r.amt; }, 0);
        return m.coverage === 'full' && Math.abs(s - m.total) <= tol(m.m);
      }).length;
      reconV = tpl(t.reconYtd, { ok: ok, n: p.months.length }); reconS = tpl(t.reconLines, { n: nLines.toLocaleString(locale()) });
    } else if (p.coverage === 'full') {
      reconV = Math.abs(gap) < 0.005 ? t.reconOk : tpl(t.reconOkGap, { gap: money(Math.abs(gap)) });
      reconS = tpl(t.reconLines, { n: nLines.toLocaleString(locale()) });
    } else {
      reconV = t.reconPartial; reconS = tpl(t.reconLines, { n: nLines.toLocaleString(locale()) });
    }
    facts.push({ l: t.factRecon, v: reconV, s: reconS });

    $('snap-grid').innerHTML = facts.map(function (f) {
      return '<div class="fact sans"><div class="l">' + f.l + '</div><div class="v">' + f.v + '</div><div class="s">' + f.s + '</div></div>';
    }).join('');

    var ev;
    if (!p.single && p.coverage === 'full') ev = tpl(t.evidenceYtd, { n: nLines.toLocaleString(locale()), sittings: p.months.length });
    else if (!p.single) ev = tpl(t.evidencePartial, { n: nLines.toLocaleString(locale()), amt: money(itemized), total: money(p.total) });
    else if (p.coverage !== 'full') ev = tpl(t.evidencePartial, { n: nLines.toLocaleString(locale()), amt: money(itemized), total: money(p.total) });
    else if (Math.abs(gap) < 0.005) ev = tpl(t.evidence, { n: nLines.toLocaleString(locale()), amt: money(itemized) });
    else ev = tpl(t.evidenceGap, { n: nLines.toLocaleString(locale()), amt: money(itemized), total: money(p.total), gap: money(Math.abs(gap)) });
    var src = p.single ? ' <a href="' + p.url + '" target="_blank" rel="noopener">' + t.openPV + '</a>' : '';
    $('evidence').innerHTML = ev + src;
  }
  function tol(monthId) {
    var tset = (D.provenance && D.provenance.tolerances) || {};
    return tset[monthId] != null ? tset[monthId] + 0.005 : 0.005;
  }

  // ---------- rendering: explore ----------
  function renderExplore() {
    var t = T(), sel = selection();
    // controls reflect state (they may have been changed by URL/back navigation)
    syncPills();

    // tokens: one per pressed category, removable
    var tokens = state.categories.map(function (slug) {
      return { label: tpl(t.filterCat, { name: catName(KEY_BY_SLUG[slug]) }), slug: slug };
    });
    var tk = $('tokens');
    if (tokens.length) {
      tk.hidden = false;
      tk.innerHTML = '<span>' + t.activeFilters + '</span>' + tokens.map(function (x, i) {
        return '<span class="token">' + x.label + '<button type="button" data-tk="' + i + '" aria-label="' + tpl(t.removeFilter, { name: x.label }) + '">×</button></span>';
      }).join('') + '<button type="button" class="btn secondary" id="clear-all" style="min-height:44px">' + t.clearAll + '</button>';
      tk.querySelectorAll('button[data-tk]').forEach(function (b) {
        b.addEventListener('click', function () {
          toggleCat(tokens[+b.getAttribute('data-tk')].slug);
          $('f-reset').focus();
        });
      });
      $('clear-all').addEventListener('click', function () { setState({ categories: [] }, { push: true }); });
    } else { tk.hidden = true; tk.innerHTML = ''; }

    var rows = currentRows(sel);
    var totSel = Math.round(rows.reduce(function (a, r) { return a + r.amt; }, 0) * 100) / 100;
    var linesSel = rows.reduce(function (a, r) { return a + r.lines; }, 0);
    var scope = state.categories.length
      ? state.categories.map(function (s) { return catName(KEY_BY_SLUG[s]); }).join(' + ')
      : t.scopeAll;
    $('summary').innerHTML = tpl(t.summary, {
      nSup: '<span class="big">' + rows.length.toLocaleString(locale()) + '</span>',
      amt: '<span class="big">' + money(totSel) + '</span>',
      scope: scope + ', ' + selectionLabel(sel)
    }) + ' ' + tpl(t.summaryLines, { n: linesSel.toLocaleString(locale()) });

    // category chart + list reflect the selected months (all categories) with rest for partial
    var p = sel;
    var allAggs = catAggregates(sel.payees);
    var knownAmt = allAggs.reduce(function (a, x) { return a + x.amt; }, 0);
    var restAmt = (sel.coverage !== 'full') ? Math.max(0, Math.round((sel.total - knownAmt) * 100) / 100) : 0;
    drawCats(allAggs, restAmt);
    $('cat-list').innerHTML = allAggs.map(function (a) {
      var slug = SLUGS[a.key];
      var selected = state.categories.indexOf(slug) >= 0;
      return '<li><button type="button" class="catbtn" data-cat="' + slug + '" aria-pressed="' + selected + '"><span class="rowline">' +
        '<span class="dot" style="background:' + ((D.categories[a.key] || {}).color || '#888') + '"></span>' +
        '<span class="nm">' + catName(a.key) + '</span>' +
        '<span class="share">' + pct(a.amt / p.total) + '</span>' +
        '<span class="num" style="font-weight:700">' + money(a.amt) + '</span></span></button></li>';
    }).join('') + (restAmt > 0.5
      ? '<li><span class="rowline"><span class="dot" style="background:' + D.categories.__rest.color + '"></span><span class="nm">' + D.categories.__rest[state.lang] + '</span><span class="share">' + pct(restAmt / p.total) + '</span><span class="num" style="font-weight:700">' + money(restAmt) + '</span></span></li>'
      : '');

    renderResults(rows, sel);
    renderSignals(sel);

    $('src-link').href = sel.url;
    $('src-link').textContent = t.viewSource;
    renderPrintMeta(tokens, sel);
  }

  function renderResults(rows, sel) {
    var t = T(), p = sel;
    var table = $('results'), empty = $('results-empty');
    if (!rows.length) {
      table.hidden = true; empty.hidden = false; empty.textContent = t.empty;
      return;
    }
    table.hidden = false; empty.hidden = true;

    document.querySelector('#results thead tr').innerHTML =
      '<th scope="col">' + t.thSupplier + '</th>' +
      '<th scope="col">' + t.thCategory + '</th>' +
      '<th scope="col" class="num">' + t.thLines + '</th>' +
      '<th scope="col" class="num" aria-sort="descending">' + t.thAmount + '</th>';

    var sorted = sortRows(rows);
    var payrollRows = sorted.filter(function (r) { return isPayroll(r.payee); });
    var others = sorted.filter(function (r) { return !isPayroll(r.payee); });

    function rowHtml(r) {
      var g = (D.gloss[r.payee] || {})[state.lang];
      var mth = monthById(r.month);
      var sub = [];
      if (g) sub.push(g);
      if (p.months.length > 1 && mth) sub.push('<a href="' + mth.url + '" target="_blank" rel="noopener">' + periodLabel(mth) + ' ' + t.newTab + '</a>');
      return '<tr><th scope="row" data-l="' + t.thSupplier + '">' + localPayee(r.payee) +
        (sub.length ? '<span class="gloss">' + sub.join(' · ') + '</span>' : '') + '</th>' +
        '<td data-l="' + t.thCategory + '"><span class="dot" style="background:' + ((D.categories[r.cat] || {}).color || '#888') + '"></span>' + catName(r.cat) + '</td>' +
        '<td class="num" data-l="' + t.thLines + '">' + r.lines.toLocaleString(locale()) + '</td>' +
        '<td class="num" data-l="' + t.thAmount + '"><strong>' + money(r.amt) + '</strong></td></tr>';
    }
    var html = '';
    if (payrollRows.length) {
      html += '<tr class="grouphead"><td colspan="4">' + t.payrollGroup + '</td></tr>' + payrollRows.map(rowHtml).join('');
      html += '<tr class="grouphead"><td colspan="4">' + t.suppliersGroup + '</td></tr>';
    }
    html += others.map(rowHtml).join('');
    document.querySelector('#results tbody').innerHTML = html;
  }

  function renderSignals(p) {
    var t = T(), items = [];
    if (p.coverage !== 'full') items.push(t.sigPartial);
    var top = p.payees.filter(function (r) { return !isPayroll(r.payee) && !isRest(r.payee); })
      .sort(function (a, b) { return b.amt - a.amt; })[0];
    if (top) items.push(tpl(t.sigTop, { name: localPayee(top.payee), pct: pct(top.amt / p.total) }));
    if (p.single) {
      var fulls = MONTHS.filter(function (m) { return m.coverage === 'full'; });
      if (fulls.length > 1) {
        var avg = fulls.reduce(function (a, m) { return a + m.total; }, 0) / fulls.length;
        items.push(tpl(p.total >= avg ? t.sigAbove : t.sigBelow, { period: periodLabel(p.single), avg: money0(avg) }));
      }
    }
    var rec = {};
    MONTHS.forEach(function (m) {
      var seen = {};
      m.payees.forEach(function (r) { if (!isPayroll(r.payee) && !isRest(r.payee) && !seen[r.payee]) { seen[r.payee] = 1; rec[r.payee] = (rec[r.payee] || 0) + 1; } });
    });
    var recurring = Object.keys(rec).filter(function (k) { return rec[k] >= 3; })
      .sort(function (a, b) { return rec[b] - rec[a]; }).slice(0, 3);
    if (recurring.length) items.push(tpl(t.sigRecurring, { list: recurring.join(' · ') }));
    $('signals-list').innerHTML = items.map(function (x) { return '<li>' + x + '</li>'; }).join('');
  }

  // ---------- budget table ----------
  function buildBudgetTable(fns) {
    var t = T(), B = D.budget;
    document.querySelector('#budget-table thead tr').innerHTML =
      '<th scope="col">' + t.thFunction + '</th><th scope="col" class="num">' + B.year + '</th><th scope="col" class="num">' + (B.year - 1) + '</th><th scope="col" class="num">' + t.thChangeAbs + '</th><th scope="col" class="num">' + t.thChangePct + '</th>';
    var rows = fns.map(function (f) {
      var d = f.b - f.prev;
      var dp = f.prev ? d / Math.abs(f.prev) : 0;
      return '<tr><th scope="row" data-l="' + t.thFunction + '">' + (state.lang === 'fr' ? f.fr : f.en) + '</th>' +
        '<td class="num" data-l="' + B.year + '">' + money0(f.b) + '</td>' +
        '<td class="num" data-l="' + (B.year - 1) + '">' + money0(f.prev) + '</td>' +
        '<td class="num" data-l="' + t.thChangeAbs + '">' + (d >= 0 ? '+' : '−') + money0(Math.abs(d)) + '</td>' +
        '<td class="num" data-l="' + t.thChangePct + '">' + (d >= 0 ? '+' : '−') + pct(Math.abs(dp)) + '</td></tr>';
    });
    var dTot = B.expenses_total - B.expenses_total_prev;
    rows.push('<tr style="font-weight:700"><th scope="row" data-l="' + t.thFunction + '">' + t.budgetTotal + '</th>' +
      '<td class="num">' + money0(B.expenses_total) + '</td><td class="num">' + money0(B.expenses_total_prev) + '</td>' +
      '<td class="num">' + (dTot >= 0 ? '+' : '−') + money0(Math.abs(dTot)) + '</td>' +
      '<td class="num">' + (dTot >= 0 ? '+' : '−') + pct(Math.abs(dTot / B.expenses_total_prev)) + '</td></tr>');
    document.querySelector('#budget-table tbody').innerHTML = rows.join('');
  }

  // ---------- CSV + print ----------
  function csvEscape(v) { return '"' + String(v).replace(/"/g, '""') + '"'; }
  function downloadCSV(rowsData, filename) {
    var t = T();
    var csv = '﻿' + [t.csvHead].concat(rowsData).map(function (r) { return r.map(csvEscape).join(','); }).join('\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 500);
  }
  function csvRow(r) {
    var t = T(), m = monthById(r.month);
    var method = (D.provenance && D.provenance.categories_method) || 'observer-manual-v1';
    return [
      localPayee(r.payee),
      (D.gloss[r.payee] || {})[state.lang] || '',
      catName(r.cat),
      r.lines,
      r.amt.toFixed(2),
      periodLabel(m),
      m.sittingDate || '',
      m.resolution || '',
      m.url || '',
      (m.coverage === 'full') ? t.csvItemFull : t.csvItemPartial,
      method,
      D.generated
    ];
  }
  function renderPrintMeta(tokens, sel) {
    var t = T();
    var f = selectionLabel(sel) + (tokens && tokens.length ? ' · ' + tokens.map(function (x) { return x.label; }).join(' · ') : ' · ' + t.printNoFilters);
    $('print-meta').innerHTML = '<strong>' + t.printFilters + '</strong> ' + f +
      ' · ' + tpl(t.updated, { date: dateLong(D.generated) }) +
      '<br>' + $('acct-note').textContent;
  }

  // ---------- reset / events ----------
  function resetFilters() {
    setState({ months: [], categories: [] }, { push: true });
    var first = document.querySelector('#period-group button');
    if (first) first.focus();
  }
  function bindEvents() {
    $('btn-fr').addEventListener('click', function () { setState({ lang: 'fr' }, { push: true }); });
    $('btn-en').addEventListener('click', function () { setState({ lang: 'en' }, { push: true }); });
    $('period-group').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-period]');
      if (!b) return;
      var id = b.getAttribute('data-period');
      if (id === '__ytd__') setState({ months: [] }, { push: true });
      else toggleMonth(id);
    });
    $('category-group').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-cat]');
      if (!b) return;
      var s = b.getAttribute('data-cat');
      if (s === '__all__') setState({ categories: [] }, { push: true });
      else toggleCat(s);
    });
    $('cat-list').addEventListener('click', function (e) {
      var b = e.target.closest('button[data-cat]');
      if (b) toggleCat(b.getAttribute('data-cat'));
    });
    $('f-reset').addEventListener('click', resetFilters);
    $('b-sort').addEventListener('change', function () { budgetSort = this.value; drawBudget(); });
    $('dl-view').addEventListener('click', function () {
      var suffix = state.months.length ? state.months.join('+') : 'ytd-' + FY;
      downloadCSV(sortRows(currentRows(selection())).map(csvRow), T().fileView + '_' + suffix + '.csv');
    });
    $('dl-all').addEventListener('click', function () {
      var all = [];
      D.months.forEach(function (m) { m.payees.forEach(function (r) { all.push(csvRow(r)); }); });
      downloadCSV(all, T().fileAll + '_' + D.generated + '.csv');
    });
    $('print-btn').addEventListener('click', function () { window.print(); });
    window.addEventListener('popstate', function () {
      var prevLang = state.lang;
      readURL();
      if (state.lang !== prevLang) renderAll();
      else { buildControls(); renderSnapshot(); updateTrend(); renderExplore(); }
    });
  }

  // ---------- boot ----------
  function boot() {
    if (!D || !D.months || !D.entries) {
      document.documentElement.lang = 'fr';
      var e = $('data-error'); e.hidden = false;
      e.textContent = (I18N && I18N.fr ? I18N.fr.errorData : 'Data unavailable.') + ' / ' + (I18N && I18N.en ? I18N.en.errorData : '');
      return;
    }
    prepare();
    readURL();
    writeURL(false);
    bindEvents();
    renderAll();
  }
  boot();
})();
