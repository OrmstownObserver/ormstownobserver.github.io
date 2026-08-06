/* ============================================================
   Ormstown Observer — public money explorer.
   One normalized state {lang, period, category, q, sort} drives
   summary, charts, results, exports and the URL. Official values
   come from spending-data.js and are never altered here.
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
    PERIODS = D.months.slice().concat([YTD]);
  }
  function periodObj() {
    return PERIODS.filter(function (p) { return p.m === state.period; })[0] || LAST_FULL;
  }
  function periodLabel(p) {
    if (p.isYTD) return tpl(T().ytdLabel, { year: FY });
    return state.lang === 'fr' ? p.label_fr : p.label_en;
  }
  function monthById(id) { return D.months.filter(function (m) { return m.m === id; })[0]; }

  // ---------- state <-> URL ----------
  var SORTS = ['amount-desc', 'name-asc', 'lines-desc'];
  var state = { lang: 'fr', period: null, category: null, q: '', sort: 'amount-desc' };

  function readURL() {
    var p = new URLSearchParams(location.search);
    var lang = p.get('lang'); if (lang === 'fr' || lang === 'en') state.lang = lang;
    else { try { var l = localStorage.getItem('observerLang'); if (l === 'fr' || l === 'en') state.lang = l; else state.lang = (navigator.language || 'fr').indexOf('en') === 0 ? 'en' : 'fr'; } catch (e) {} }
    var period = p.get('period');
    state.period = PERIODS.some(function (x) { return x.m === period; }) ? period : LAST_FULL.m;
    var cat = p.get('category');
    state.category = KEY_BY_SLUG[cat] ? cat : null;
    state.q = (p.get('q') || '').slice(0, 80);
    var sort = p.get('sort');
    state.sort = SORTS.indexOf(sort) >= 0 ? sort : 'amount-desc';
  }
  function writeURL(push) {
    var p = new URLSearchParams();
    p.set('lang', state.lang);
    if (state.period !== LAST_FULL.m) p.set('period', state.period);
    if (state.category) p.set('category', state.category);
    if (state.q) p.set('q', state.q);
    if (state.sort !== 'amount-desc') p.set('sort', state.sort);
    var url = location.pathname + '?' + p.toString();
    try { history[push ? 'pushState' : 'replaceState'](null, '', url); } catch (e) {}
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
  function currentRows() {
    var p = periodObj();
    var catKey = state.category ? KEY_BY_SLUG[state.category] : null;
    var q = state.q.trim().toLowerCase();
    return p.payees.filter(function (r) {
      if (catKey && r.cat !== catKey) return false;
      if (!q) return true;
      var g = (D.gloss[r.payee] || {})[state.lang] || '';
      return (localPayee(r.payee) + ' ' + r.payee + ' ' + catName(r.cat) + ' ' + g).toLowerCase().indexOf(q) >= 0;
    });
  }
  function sortRows(rows) {
    var s = state.sort;
    return rows.slice().sort(function (a, b) {
      if (s === 'name-asc') return localPayee(a.payee).localeCompare(localPayee(b.payee), locale());
      if (s === 'lines-desc') return b.lines - a.lines || b.amt - a.amt;
      return b.amt - a.amt;
    });
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
            borderColor: MONTHS.map(function (m) { return m.m === state.period ? ink : 'transparent'; }),
            borderWidth: MONTHS.map(function (m) { return m.m === state.period ? 3 : 0; }),
            borderRadius: 3
          }]
        },
        options: {
          maintainAspectRatio: false,
          scales: { y: { beginAtZero: true, ticks: { callback: function (v) { return money0(v); } } } },
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (c) { return money(c.parsed.y); } } } },
          onClick: function (e, els) { if (els.length) setState({ period: MONTHS[els[0].index].m }, { push: true }); }
        }
      });
    } catch (e) { chartFail('trend-legend'); }
  }
  function updateTrend() {
    if (!charts.trend) { drawTrend(); return; }
    var ink = '#1f2733';
    charts.trend.data.datasets[0].borderColor = MONTHS.map(function (m) { return m.m === state.period ? ink : 'transparent'; });
    charts.trend.data.datasets[0].borderWidth = MONTHS.map(function (m) { return m.m === state.period ? 3 : 0; });
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
      var labels = aggs.map(function (a) { return catName(a.key); });
      var data = aggs.map(function (a) { return a.amt; });
      var colors = aggs.map(function (a) { return (D.categories[a.key] || {}).color || '#888'; });
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
            var slug = SLUGS[a.key];
            setState({ category: state.category === slug ? null : slug }, { push: true });
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
    $('l-q').textContent = t.searchLabel;
    $('l-sort').textContent = t.sortLabel;
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
    $('f-period').innerHTML = PERIODS.map(function (p) {
      return '<option value="' + p.m + '">' + periodLabel(p) + '</option>';
    }).join('');
    $('f-period').value = state.period;
    var cats = Object.keys(SLUGS);
    $('f-category').innerHTML = '<option value="">' + t.allCategories + '</option>' + cats.map(function (k) {
      return '<option value="' + SLUGS[k] + '">' + catName(k) + '</option>';
    }).join('');
    $('f-category').value = state.category || '';
    $('f-q').value = state.q;
    $('f-sort').innerHTML =
      '<option value="amount-desc">' + t.sortAmount + '</option>' +
      '<option value="name-asc">' + t.sortName + '</option>' +
      '<option value="lines-desc">' + t.sortLines + '</option>';
    $('f-sort').value = state.sort;
  }

  // ---------- rendering: snapshot ----------
  function renderSnapshot() {
    var t = T(), p = periodObj();
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
      s: p.isYTD ? tpl(t.factTotalSubYtd, { n: p.nSittings, year: FY })
        : periodLabel(p) + (p.resolution ? ' · ' + t.resLabel + ' ' + p.resolution : '')
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
    if (p.isYTD) {
      var ok = MONTHS.filter(function (m) {
        var s = m.payees.reduce(function (a, r) { return a + r.amt; }, 0);
        return m.coverage === 'full' && Math.abs(s - m.total) <= tol(m.m);
      }).length;
      reconV = tpl(t.reconYtd, { ok: ok, n: MONTHS.length }); reconS = tpl(t.reconLines, { n: nLines.toLocaleString(locale()) });
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
    if (p.isYTD) ev = tpl(t.evidencePartial, { n: nLines.toLocaleString(locale()), amt: money(itemized), total: money(p.total) });
    else if (p.coverage !== 'full') ev = tpl(t.evidencePartial, { n: nLines.toLocaleString(locale()), amt: money(itemized), total: money(p.total) });
    else if (Math.abs(gap) < 0.005) ev = tpl(t.evidence, { n: nLines.toLocaleString(locale()), amt: money(itemized) });
    else ev = tpl(t.evidenceGap, { n: nLines.toLocaleString(locale()), amt: money(itemized), total: money(p.total), gap: money(Math.abs(gap)) });
    var src = p.isYTD ? '' : ' <a href="' + p.url + '" target="_blank" rel="noopener">' + t.openPV + '</a>';
    $('evidence').innerHTML = ev + src;
  }
  function tol(monthId) {
    var tset = (D.provenance && D.provenance.tolerances) || {};
    return tset[monthId] != null ? tset[monthId] + 0.005 : 0.005;
  }

  // ---------- rendering: explore ----------
  function renderExplore() {
    var t = T(), p = periodObj();
    // controls reflect state (they may have been changed by URL/back navigation)
    $('f-period').value = state.period;
    $('f-category').value = state.category || '';
    if ($('f-q').value !== state.q) $('f-q').value = state.q;
    $('f-sort').value = state.sort;

    // tokens
    var tokens = [];
    if (state.category) tokens.push({ label: tpl(t.filterCat, { name: catName(KEY_BY_SLUG[state.category]) }), clear: { category: null } });
    if (state.q.trim()) tokens.push({ label: tpl(t.filterQ, { q: state.q.trim() }), clear: { q: '' } });
    var tk = $('tokens');
    if (tokens.length) {
      tk.hidden = false;
      tk.innerHTML = '<span>' + t.activeFilters + '</span>' + tokens.map(function (x, i) {
        return '<span class="token">' + x.label + '<button type="button" data-tk="' + i + '" aria-label="' + tpl(t.removeFilter, { name: x.label }) + '">×</button></span>';
      }).join('') + '<button type="button" class="btn secondary" id="clear-all" style="min-height:44px">' + t.clearAll + '</button>';
      tk.querySelectorAll('button[data-tk]').forEach(function (b) {
        b.addEventListener('click', function () {
          setState(tokens[+b.getAttribute('data-tk')].clear, { push: true });
          $('f-reset').focus();
        });
      });
      $('clear-all').addEventListener('click', function () { resetFilters(); });
    } else { tk.hidden = true; tk.innerHTML = ''; }

    var rows = currentRows();
    var aggs = catAggregates(rows);
    var totSel = Math.round(rows.reduce(function (a, r) { return a + r.amt; }, 0) * 100) / 100;
    var linesSel = rows.reduce(function (a, r) { return a + r.lines; }, 0);
    var scope = state.category ? catName(KEY_BY_SLUG[state.category]) : t.scopeAll;
    $('summary').innerHTML = tpl(t.summary, {
      nSup: '<span class="big">' + rows.length.toLocaleString(locale()) + '</span>',
      amt: '<span class="big">' + money(totSel) + '</span>',
      scope: scope + (state.q.trim() ? ' · ' + tpl(t.filterQ, { q: state.q.trim() }) : '') + ', ' + periodLabel(p)
    }) + ' ' + tpl(t.summaryLines, { n: linesSel.toLocaleString(locale()) });

    // category chart + list reflect the current period (all categories) with rest for partial
    var allAggs = catAggregates(p.payees);
    var knownAmt = allAggs.reduce(function (a, x) { return a + x.amt; }, 0);
    var restAmt = (p.coverage !== 'full' && !p.isYTD) ? Math.max(0, Math.round((p.total - knownAmt) * 100) / 100) : 0;
    drawCats(allAggs, restAmt);
    $('cat-list').innerHTML = allAggs.map(function (a) {
      var selected = state.category === SLUGS[a.key];
      return '<li' + (selected ? ' style="background:var(--accent-soft)"' : '') + '>' +
        '<span class="dot" style="background:' + ((D.categories[a.key] || {}).color || '#888') + '"></span>' +
        '<span class="nm">' + catName(a.key) + '</span>' +
        '<span class="share">' + pct(a.amt / p.total) + '</span>' +
        '<span class="num" style="font-weight:700">' + money(a.amt) + '</span></li>';
    }).join('') + (restAmt > 0.5
      ? '<li><span class="dot" style="background:' + D.categories.__rest.color + '"></span><span class="nm">' + D.categories.__rest[state.lang] + '</span><span class="share">' + pct(restAmt / p.total) + '</span><span class="num" style="font-weight:700">' + money(restAmt) + '</span></li>'
      : '');

    renderResults(rows);
    renderSignals(p, rows);

    $('src-link').href = p.url;
    $('src-link').textContent = t.viewSource;
    renderPrintMeta(tokens);
  }

  function ariaSort(col) {
    if (state.sort === 'amount-desc' && col === 'amount') return 'descending';
    if (state.sort === 'lines-desc' && col === 'lines') return 'descending';
    if (state.sort === 'name-asc' && col === 'name') return 'ascending';
    return 'none';
  }
  function renderResults(rows) {
    var t = T(), p = periodObj();
    var table = $('results'), empty = $('results-empty');
    if (!rows.length) {
      table.hidden = true; empty.hidden = false; empty.textContent = t.empty;
      return;
    }
    table.hidden = false; empty.hidden = true;

    var headBtn = function (col, label, sortVal) {
      return '<th scope="col" class="' + (col === 'name' ? '' : 'num') + '" aria-sort="' + ariaSort(col) + '">' +
        '<button type="button" class="sortbtn" data-sort="' + sortVal + '" title="' + t.sortHint + '">' + label + '</button></th>';
    };
    document.querySelector('#results thead tr').innerHTML =
      headBtn('name', t.thSupplier, 'name-asc') +
      '<th scope="col">' + t.thCategory + '</th>' +
      headBtn('lines', t.thLines, 'lines-desc') +
      headBtn('amount', t.thAmount, 'amount-desc');
    document.querySelectorAll('#results .sortbtn').forEach(function (b) {
      b.addEventListener('click', function () { setState({ sort: b.getAttribute('data-sort') }, { push: true }); });
    });

    var sorted = sortRows(rows);
    var payrollRows = sorted.filter(function (r) { return isPayroll(r.payee); });
    var others = sorted.filter(function (r) { return !isPayroll(r.payee); });

    function rowHtml(r) {
      var g = (D.gloss[r.payee] || {})[state.lang];
      var mth = monthById(r.month);
      var sub = [];
      if (g) sub.push(g);
      if (p.isYTD && mth) sub.push('<a href="' + mth.url + '" target="_blank" rel="noopener">' + periodLabel(mth) + ' ' + t.newTab + '</a>');
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

  function renderSignals(p, rows) {
    var t = T(), items = [];
    if (p.coverage !== 'full') items.push(t.sigPartial);
    var top = p.payees.filter(function (r) { return !isPayroll(r.payee) && !isRest(r.payee); })
      .sort(function (a, b) { return b.amt - a.amt; })[0];
    if (top) items.push(tpl(t.sigTop, { name: localPayee(top.payee), pct: pct(top.amt / p.total) }));
    if (!p.isYTD) {
      var fulls = MONTHS.filter(function (m) { return m.coverage === 'full'; });
      if (fulls.length > 1) {
        var avg = fulls.reduce(function (a, m) { return a + m.total; }, 0) / fulls.length;
        items.push(tpl(p.total >= avg ? t.sigAbove : t.sigBelow, { period: periodLabel(p), avg: money0(avg) }));
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
    var t = T(), m = monthById(r.month), p = periodObj();
    var method = (D.provenance && D.provenance.categories_method) || 'observer-manual-v1';
    return [
      localPayee(r.payee),
      (D.gloss[r.payee] || {})[state.lang] || '',
      catName(r.cat),
      r.lines,
      r.amt.toFixed(2),
      p.isYTD ? tpl(t.ytdLabel, { year: FY }) : periodLabel(m || p),
      (m || p).sittingDate || '',
      (m || p).resolution || '',
      (m || p).url || '',
      ((m || p).coverage === 'full') ? t.csvItemFull : t.csvItemPartial,
      method,
      D.generated
    ];
  }
  function renderPrintMeta(tokens) {
    var t = T();
    var f = tokens && tokens.length ? tokens.map(function (x) { return x.label; }).join(' · ') : t.printNoFilters;
    $('print-meta').innerHTML = '<strong>' + t.printFilters + '</strong> ' + f +
      ' · ' + tpl(t.updated, { date: dateLong(D.generated) }) +
      '<br>' + $('acct-note').textContent;
  }

  // ---------- reset / events ----------
  function resetFilters() {
    setState({ category: null, q: '', sort: 'amount-desc' }, { push: true });
    $('f-period').focus();
  }
  function bindEvents() {
    $('btn-fr').addEventListener('click', function () { setState({ lang: 'fr' }, { push: true }); });
    $('btn-en').addEventListener('click', function () { setState({ lang: 'en' }, { push: true }); });
    $('f-period').addEventListener('change', function () { setState({ period: this.value }, { push: true }); });
    $('f-category').addEventListener('change', function () { setState({ category: this.value || null }, { push: true }); });
    var qTimer = null;
    $('f-q').addEventListener('input', function () {
      var v = this.value;
      clearTimeout(qTimer);
      qTimer = setTimeout(function () { setState({ q: v }, { push: false }); }, 200);
    });
    $('f-q').addEventListener('change', function () { setState({ q: this.value }, { push: true }); });
    $('f-sort').addEventListener('change', function () { setState({ sort: this.value }, { push: true }); });
    $('f-reset').addEventListener('click', resetFilters);
    $('b-sort').addEventListener('change', function () { budgetSort = this.value; drawBudget(); });
    $('dl-view').addEventListener('click', function () {
      downloadCSV(sortRows(currentRows()).map(csvRow), T().fileView + '_' + state.period + '.csv');
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
