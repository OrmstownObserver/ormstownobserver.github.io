/* ============================================================
   Ormstown Observer — /finances/budget/
   The ledger's reference layer: the adopted budget, the capital
   plan, how far the itemization reaches, the Observer's method,
   the official documents and the dictionary.

   Moved wholesale out of finances/app.js (L364-401, L455-520,
   L795-814) when /finances/ became a research workspace, reusing
   the same i18n keys unchanged.

   ── ACCOUNTING RULE, DO NOT REGRESS (tools/README.md:56-60) ──
   Approved council expense lists are NOT annual budget spending and
   NOT actual incurred expenses. This section must keep its
   explanatory note and its "scale reference — not budget used"
   label, and must NEVER draw a progress bar for the approved-vs-
   budget comparison.
   ============================================================ */
(function (global) {
  'use strict';

  var L = global.OO_LEDGER, V = global.OO_LEDGER_VIEWS, C = global.OO_LEDGER_CHARTS;
  var D = global.OO_SPENDING || null, I18N = global.OO_I18N;
  var $ = function (id) { return document.getElementById(id); };

  var lang = 'fr', budgetSort = 'amount';
  function T() { return I18N[lang]; }
  function f() { return V.fmt(lang); }
  function setText(id, s) { var n = $(id); if (n) n.textContent = s; }
  function fill(id, node) { var n = $(id); if (!n) return; n.textContent = ''; if (node) n.appendChild(node); }

  function readLang() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'fr' || q === 'en') return q;
    try {
      var l = localStorage.getItem('observerLang');
      if (l === 'fr' || l === 'en') return l;
    } catch (e) {}
    return (navigator.language || 'fr').toLowerCase().indexOf('en') === 0 ? 'en' : 'fr';
  }
  function setLang(v) {
    if (v !== 'fr' && v !== 'en') return;
    lang = v;
    try { localStorage.setItem('observerLang', v); localStorage.setItem('oo_lang', v); } catch (e) {}
    var p = new URLSearchParams(location.search); p.set('lang', v);
    try { history.replaceState(null, '', location.pathname + '?' + p.toString() + location.hash); } catch (e) {}
    applyLangChrome();
    render();
  }
  function applyLangChrome() {
    var html = document.documentElement;
    html.setAttribute('lang', lang);
    if (lang === 'fr') html.classList.add('lang-fr'); else html.classList.remove('lang-fr');
    // Mirror the house function exactly, aria-pressed included — see the
    // same note in v2/ledger-app.js.
    var be = $('obs-btn-en'), bf = $('obs-btn-fr');
    if (be) { be.classList.toggle('is-active', lang === 'en'); be.setAttribute('aria-pressed', String(lang === 'en')); }
    if (bf) { bf.classList.toggle('is-active', lang === 'fr'); bf.setAttribute('aria-pressed', String(lang === 'fr')); }
    var links = document.querySelectorAll('[data-href-en]');
    for (var i = 0; i < links.length; i++) {
      links[i].setAttribute('href', links[i].getAttribute(lang === 'fr' ? 'data-href-fr' : 'data-href-en'));
    }
    ['fr', 'en'].forEach(function (lg) {
      var link = document.head.querySelector('link[rel="alternate"][hreflang="' + lg + '"]');
      if (link) link.setAttribute('href', location.origin + location.pathname + '?lang=' + lg);
    });
  }

  var TOC = [
    ['budget', 'tocBudget'], ['capital', 'tocCapital'], ['coverage', 'tocCoverage'],
    ['method', 'tocMethod'], ['documents', 'tocDocuments'], ['dictionary', 'tocDictionary']
  ];

  function render() {
    var t = T(), B = D.budget, F = f();
    document.title = t.refHtmlTitle;
    setText('eyebrow', t.eyebrow);
    setText('title', t.refTitle);
    setText('deck', t.refDeck);
    setText('back-lbl', t.refBackLabel);
    ['back-link', 'back-link-2'].forEach(function (id) {
      var n = $(id);
      if (n) { n.textContent = t.refBack; n.setAttribute('href', '/finances/?lang=' + lang); }
    });
    var sk = document.getElementsByClassName('lw-skip')[0];
    if (sk) sk.textContent = t.tocBudget;

    var toc = $('toc');
    if (toc) {
      toc.textContent = '';
      TOC.forEach(function (row, i) {
        if (i) toc.appendChild(document.createTextNode('·'));
        toc.appendChild(V.el('a', { href: '#' + row[0], text: t[row[1]] }));
      });
    }

    /* ---- budget ---- */
    setText('annual-h', t.annualH);
    fill('acct-note', V.rich(t.accountingNote));
    setText('scale-tag', t.scaleTag);

    // The scale sentence compares the year's APPROVED expense lists with the
    // adopted budget. It is a sense of scale, never a "% of budget used".
    var yr = String(B.year);
    var months = D.months.filter(function (m) { return m.m.slice(0, 4) === yr; });
    var approved = L.sum(months.map(function (m) { return m.total; }));
    setText('scale-line', L.tpl(t.scaleSentence, {
      n: months.length, year: yr, amt: F.money0(approved),
      pct: F.pct(approved / B.expenses_total), budget: F.money0(B.expenses_total),
      adopted: F.dateLong(B.adopted)
    }));
    setText('budget-h', L.tpl(t.budgetH, { year: B.year, prev: B.year - 1 }));
    setText('budget-sub', t.budgetSub);
    setText('l-bsort', t.budgetSort);
    var sel = $('b-sort');
    if (sel) {
      sel.textContent = '';
      sel.appendChild(V.el('option', { value: 'amount', text: L.tpl(t.budgetSortAmount, { year: B.year }) }));
      sel.appendChild(V.el('option', { value: 'change', text: L.tpl(t.budgetSortChange, { prev: B.year - 1 }) }));
      sel.value = budgetSort;
    }
    setText('budget-caption', L.tpl(t.budgetCaption, { year: B.year, prev: B.year - 1 }));
    fill('budget-src', V.frag([
      V.rich(t.budgetSrc), document.createTextNode(' '),
      V.pvLink(B.url, L.tpl(t.budgetLeaflet, { year: B.year }), t.newTab),
      document.createTextNode(' · '),
      V.pvLink(B.url_pti, t.ptiLeaflet, t.newTab)
    ]));
    drawBudget();

    /* ---- capital ---- */
    setText('capital-h', t.capitalH);
    setText('capital-sub', t.capitalSub);
    var cards = $('pti-cards');
    cards.textContent = '';
    B.pti.forEach(function (p) {
      var note = lang === 'fr' ? p.note_fr : p.note_en;
      cards.appendChild(V.el('article', { cls: 'pcard' }, [
        V.el('h3', { text: lang === 'fr' ? p.fr : p.en }),
        V.el('dl', null, [
          V.el('dt', { text: t.plan2026 }),
          p.y2026 != null ? V.el('dd', { text: F.money0(p.y2026) })
                          : V.el('dd', { style: 'font-weight:400;color:var(--ink-soft)', text: t.noPlan }),
          V.el('dt', { text: t.envelope }),
          V.el('dd', { text: F.money0(p.total) })
        ]),
        V.el('p', { cls: 'fund' }, [V.el('strong', { text: t.fundingLabel }), document.createTextNode(' — ' + p.fund)]),
        note ? V.el('p', { cls: 'pnote', text: note }) : null
      ]));
    });
    setText('acronyms-h', t.acronymsH);
    var ac = $('acronyms-list');
    ac.textContent = '';
    t.acronyms.forEach(function (a) {
      ac.appendChild(V.el('div', null, [
        V.el('dt', { text: a[0] }), V.el('dd', { text: a[1] })
      ]));
    });

    /* ---- coverage ---- */
    setText('coverage-h', t.coverageH);
    setText('coverage-sub', t.coverageSub);
    setText('coverage-caption', t.coverageH);
    var chead = $('coverage-head');
    chead.textContent = '';
    [[t.thSitting], [t.thStatus], [t.thTotal, 1], [t.sourceLabel]].forEach(function (c) {
      chead.appendChild(V.el('th', { scope: 'col', cls: c[1] ? 'num' : null, text: c[0] }));
    });
    var cbody = $('coverage-body');
    cbody.textContent = '';
    D.months.slice().reverse().forEach(function (m) {
      cbody.appendChild(V.el('tr', null, [
        V.el('th', { scope: 'row', 'data-l': t.thSitting }, [
          document.createTextNode(lang === 'fr' ? m.label_fr : m.label_en),
          V.el('span', { cls: 'gloss', text: m.session })
        ]),
        V.el('td', { 'data-l': t.thStatus, text: m.coverage === 'full' ? t.statusFull : t.statusPartial }),
        V.el('td', { cls: 'num', 'data-l': t.thTotal, text: F.money(m.total) }),
        V.el('td', { 'data-l': t.sourceLabel }, V.pvLink(m.url, t.covSource, t.newTab))
      ]));
    });

    /* ---- method ---- */
    setText('methodology-h', t.methodologyH);
    var ml = $('meth-list');
    ml.textContent = '';
    t.meth.forEach(function (x) { ml.appendChild(V.el('li', null, V.rich(x))); });

    /* ---- documents ---- */
    setText('docs-h', t.docsH);
    var dl = $('doc-list');
    dl.textContent = '';
    var docs = D.months.slice().reverse().map(function (m) {
      return { label: (lang === 'fr' ? m.label_fr : m.label_en) + ' — ' + m.session, url: m.url };
    });
    docs.push({ label: L.tpl(t.budgetLeaflet, { year: B.year }), url: B.url });
    docs.push({ label: t.ptiLeaflet, url: B.url_pti });
    docs.forEach(function (d) {
      dl.appendChild(V.el('li', null, V.pvLink(d.url, d.label + ' ' + t.newTab, null)));
    });

    /* ---- dictionary ---- */
    setText('dict-h', t.dictH);
    var dict = $('dict-list');
    dict.textContent = '';
    t.dict.forEach(function (row) {
      dict.appendChild(V.el('div', null, [V.el('dt', { text: row[0] }), V.el('dd', { text: row[1] })]));
    });
  }

  function buildBudgetTable(fns) {
    var t = T(), B = D.budget, F = f();
    var head = $('budget-head');
    head.textContent = '';
    [[t.thFunction], [String(B.year), 1], [String(B.year - 1), 1], [t.thChangeAbs, 1], [t.thChangePct, 1]]
      .forEach(function (c) { head.appendChild(V.el('th', { scope: 'col', cls: c[1] ? 'num' : null, text: c[0] })); });
    var body = $('budget-body');
    body.textContent = '';
    fns.forEach(function (fn) {
      var d = fn.b - fn.prev;
      body.appendChild(V.el('tr', null, [
        V.el('th', { scope: 'row', 'data-l': t.thFunction, text: lang === 'fr' ? fn.fr : fn.en }),
        V.el('td', { cls: 'num', 'data-l': String(B.year), text: F.money0(fn.b) }),
        V.el('td', { cls: 'num', 'data-l': String(B.year - 1), text: F.money0(fn.prev) }),
        V.el('td', { cls: 'num' + (d < 0 ? ' credit' : ''), 'data-l': t.thChangeAbs, text: (d >= 0 ? '+' : '') + F.money0(d) }),
        V.el('td', { cls: 'num', 'data-l': t.thChangePct, text: fn.prev ? (d >= 0 ? '+' : '') + F.pct(d / fn.prev) : '—' })
      ]));
    });
    body.appendChild(V.el('tr', { cls: 'totals' }, [
      V.el('th', { scope: 'row', text: t.budgetTotal }),
      V.el('td', { cls: 'num', text: F.money0(B.expenses_total) }),
      V.el('td', { cls: 'num', text: F.money0(B.expenses_total_prev) }),
      V.el('td', { cls: 'num', text: '+' + F.money0(B.expenses_total - B.expenses_total_prev) }),
      V.el('td', { cls: 'num', text: '+' + F.pct((B.expenses_total - B.expenses_total_prev) / B.expenses_total_prev) })
    ]));
  }

  function drawBudget() {
    var B = D.budget, F = f();
    var fns = B.functions.slice().sort(function (a, b) {
      if (budgetSort === 'change') return (b.b - b.prev) - (a.b - a.prev);
      return b.b - a.b;
    });
    buildBudgetTable(fns);

    var canvas = $('chart-budget'), cap = $('budget-figcap');
    var fail = function () { if (cap) cap.textContent = T().chartFail; };
    C.ensureChart().then(function (okLib) {
      if (!okLib || !C.chartDefaults()) { fail(); return; }
      C.killChart('budget', canvas);
      var cur = C.token('--accent', '#b5161b'), prev = C.token('--ink-soft', '#575048');
      try {
        new global.Chart(canvas.getContext('2d'), {
          type: 'bar',
          data: {
            labels: fns.map(function (x) { return lang === 'fr' ? x.fr : x.en; }),
            datasets: [
              { label: String(B.year), data: fns.map(function (x) { return x.b; }), backgroundColor: cur, borderRadius: 0 },
              { label: String(B.year - 1), data: fns.map(function (x) { return x.prev; }), backgroundColor: prev, borderRadius: 0 }
            ]
          },
          options: {
            indexAxis: 'y', maintainAspectRatio: false,
            scales: { x: { ticks: { callback: function (v) { return F.money0(v); } }, grid: { color: C.token('--hair', '#ddd7ca') } }, y: { grid: { display: false } } },
            plugins: { tooltip: { callbacks: { label: function (c) { return c.dataset.label + ' : ' + F.money0(c.parsed.x); } } } }
          }
        });
        if (cap) cap.textContent = '';
      } catch (e) { C.killChart('budget', canvas); fail(); }
    });
  }

  function boot() {
    if (!D || !D.budget || !I18N) {
      var box = $('data-error');
      if (box) {
        box.hidden = false;
        box.textContent = (I18N && I18N.fr ? I18N.fr.errorData : '') + ' / ' + (I18N && I18N.en ? I18N.en.errorData : '');
      }
      return;
    }
    lang = readLang();
    applyLangChrome();
    render();

    var sel = $('b-sort');
    if (sel) sel.addEventListener('change', function () { budgetSort = sel.value; drawBudget(); });
    C.onThemeChange(function () { drawBudget(); });

    // Same trick as the workspace: the house header's FR/EN buttons resolve
    // window.obsSetLang at click time (observer-header.js:185-186), so
    // replacing it re-renders this page in place instead of navigating.
    var houseSetLang = global.obsSetLang;
    global.obsSetLang = function (v) {
      if (v !== 'fr' && v !== 'en') { if (houseSetLang) houseSetLang(v); return; }
      setLang(v);
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(window);
