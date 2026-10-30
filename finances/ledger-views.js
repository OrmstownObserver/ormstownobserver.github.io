/* ============================================================
   Ormstown Observer — municipal ledger: VIEWS
   ------------------------------------------------------------
   Every renderer here builds real DOM nodes and puts data-derived
   text in with textContent. NOTHING in this file assigns innerHTML
   to a string containing data.

   Why it matters: classic (finances/app.js) injected payee names,
   entry descriptions, session strings and month notes straight into
   innerHTML at a dozen call sites. The data is committed and
   validated so the risk was low — but it contradicts the rule
   CLAUDE.md sets for front-page.js and ask.js, and both data files
   are produced by hand-run tools over a Notion export. rich() below
   is the ONLY path that produces markup, it accepts four tags, and
   it is only ever handed repo-authored i18n strings.

   This file also avoids querySelector and Chart.js entirely, so
   finances/tests/render-check.js can run every renderer under a
   minimal DOM shim in Node. Charts are requested through
   ctx.chart(), which the app fulfils.
   ============================================================ */
(function (global) {
  'use strict';

  var L = global.OO_LEDGER;
  // Official hosts a link may point at: the municipality's own site, SEAO
  // (the provincial contract register) and LegisQuébec (the law itself).
  // Nothing else — validate.js and render-check.js enforce the same list.
  var OK_URL = /^https:\/\/(?:www\.ormstown\.ca|(?:www\.)?seao\.gouv\.qc\.ca|www\.legisquebec\.gouv\.qc\.ca)\//;

  /* ---------- DOM helpers ---------- */
  function append(node, kids) {
    if (kids == null || kids === false) return node;
    if (Array.isArray(kids)) { kids.forEach(function (k) { append(node, k); }); return node; }
    node.appendChild(typeof kids === 'object' ? kids : document.createTextNode(String(kids)));
    return node;
  }
  function el(tag, props, kids) {
    var n = document.createElement(tag), k;
    if (props) {
      for (k in props) {
        if (!Object.prototype.hasOwnProperty.call(props, k)) continue;
        var v = props[k];
        if (v == null || v === false) continue;
        if (k === 'text') n.textContent = String(v);
        else if (k === 'cls') n.setAttribute('class', v);
        else if (k === 'on') { for (var ev in v) n.addEventListener(ev, v[ev]); }
        else if (v === true) n.setAttribute(k, '');
        else n.setAttribute(k, String(v));
      }
    }
    return append(n, kids);
  }
  function txt(s) { return document.createTextNode(String(s == null ? '' : s)); }
  // Wide real-row tables (Categories, Sittings, the profile summaries) keep
  // their columns on a phone and scroll sideways inside this box, instead of
  // widening the whole page. ledger.css only turns the scrolling on below
  // 900px, so the sticky header still works on a desktop.
  function scrollWrap(table) { return el('div', { cls: 'lt-wrap' }, table); }
  function frag(kids) { return append(document.createDocumentFragment(), kids); }

  // A safe external link. The href is only set when it points at the
  // municipality's own site — the same domain rule validate.js enforces.
  function pvLink(url, label, title) {
    if (!OK_URL.test(String(url || ''))) return el('span', { cls: 'pv' }, label);
    return el('a', { cls: 'pv', href: url, target: '_blank', rel: 'noopener', title: title || null }, label);
  }

  // An in-page move that is also a real link. A plain click is handled in
  // place (no reload); the href is the full deep link, so a modified click,
  // a middle click or "copy link address" all get the destination view.
  function navLink(href, label, onGo, extra) {
    var props = {
      href: href, cls: 'linkbtn',
      on: { click: function (e) {
        if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button > 0)) return;
        if (e && e.preventDefault) e.preventDefault();
        onGo();
      } }
    };
    if (extra) Object.keys(extra).forEach(function (k) { props[k] = extra[k]; });
    return el('a', props, label);
  }

  /* ---------- rich(): the one markup path ----------
     Accepts <strong>, <em>, <br> and <a href="https://…"> from
     REPO-AUTHORED i18n strings only. Never pass it data. Anything
     else in the string is emitted as literal text. */
  var RICH = /<(\/?)(strong|em|b|i|br)\s*\/?>|<a href="(https:\/\/[^"<>]+)">([^<]*)<\/a>/gi;
  function rich(s) {
    var out = document.createDocumentFragment();
    var str = String(s == null ? '' : s), last = 0, m;
    var stack = [out];
    var top = function () { return stack[stack.length - 1]; };
    RICH.lastIndex = 0;
    while ((m = RICH.exec(str)) !== null) {
      if (m.index > last) top().appendChild(txt(str.slice(last, m.index)));
      last = RICH.lastIndex;
      if (m[3]) {                                   // <a href="https://…">text</a>
        top().appendChild(el('a', { href: m[3], target: '_blank', rel: 'noopener' }, m[4]));
      } else if (m[2].toLowerCase() === 'br') {
        top().appendChild(document.createElement('br'));
      } else if (m[1]) {                            // closing tag
        if (stack.length > 1) stack.pop();
      } else {
        var tag = m[2].toLowerCase();
        var n = document.createElement(tag === 'b' ? 'strong' : tag === 'i' ? 'em' : tag);
        top().appendChild(n);
        stack.push(n);
      }
    }
    if (last < str.length) top().appendChild(txt(str.slice(last)));
    return out;
  }

  /* ---------- formatters ----------
     Memoised per locale. classic built a fresh Intl.NumberFormat for
     every cell (app.js:20); across thousands of rows that was the single
     biggest avoidable render cost. */
  var FMT = {};
  function fmt(lang) {
    var loc = lang === 'fr' ? 'fr-CA' : 'en-CA';
    if (FMT[loc]) return FMT[loc];
    var cur = new Intl.NumberFormat(loc, { style: 'currency', currency: 'CAD' });
    var cur0 = new Intl.NumberFormat(loc, { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
    var pc = new Intl.NumberFormat(loc, { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 });
    var nm = new Intl.NumberFormat(loc);
    var dl = new Intl.DateTimeFormat(loc, { dateStyle: 'long' });
    var ms = new Intl.DateTimeFormat(loc, { month: 'short', year: 'numeric' });
    FMT[loc] = {
      locale: loc,
      money: function (v) { return cur.format(v); },
      money0: function (v) { return cur0.format(v); },
      pct: function (v) { return pc.format(v); },
      num: function (v) { return nm.format(v); },
      dateLong: function (iso) { return dl.format(new Date(iso + 'T12:00:00')); },
      monthShort: function (ym) { return ms.format(new Date(ym + '-15T12:00:00')); }
    };
    return FMT[loc];
  }

  /* ---------- CSV download (the only browser-API bit) ---------- */
  function downloadCSV(text, filename) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' }));
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 500);
  }

  /* ---------- small shared pieces ---------- */
  function catDot(ctx, key) {
    var c = ctx.store.catByKey[key];
    return el('span', { cls: 'dot', style: 'background:' + ctx.color(c ? c.color : '#888888'), 'aria-hidden': 'true' });
  }

  // The category distribution strip: a CSS flex bar of the filtered total
  // split by category. Deliberately not a Chart.js chart — it is legible at
  // 320px, needs no library, and is theme-aware for free.
  function distStrip(ctx, mix, total) {
    var t = ctx.T, wrap = el('div', { cls: 'dist', role: 'group', 'aria-label': t.colMix });
    var pos = mix.filter(function (m) { return m.amt > 0; });
    var posTotal = pos.reduce(function (a, m) { return a + m.amt; }, 0) || 1;
    pos.forEach(function (m) {
      var c = ctx.store.catByKey[m.key];
      wrap.appendChild(el('button', {
        type: 'button',
        style: 'flex:' + (m.amt / posTotal) + ';background:' + ctx.color(c ? c.color : '#888888'),
        title: ctx.catName(m.key) + ' — ' + ctx.f.money(m.amt),
        'aria-label': ctx.catName(m.key) + ' — ' + ctx.f.money(m.amt),
        on: { click: function () { ctx.on.category(m.key); } }
      }));
    });
    var legend = el('ul', { cls: 'dist-legend' });
    pos.slice(0, 6).forEach(function (m) {
      legend.appendChild(el('li', null, [
        catDot(ctx, m.key),
        txt(ctx.catName(m.key) + ' ' + ctx.f.pct(m.amt / posTotal))
      ]));
    });
    if (pos.length > 6) legend.appendChild(el('li', { text: L.tpl(t.distLegendMore, { n: pos.length - 6 }) }));
    void total;
    return frag([wrap, legend]);
  }

  function sortableTh(ctx, field, label, isNum) {
    var cur = String(ctx.state.sort || 'amount:desc').split(':');
    var on = cur[0] === field;
    var dir = on ? cur[1] : null;
    var next = on && dir === 'desc' ? 'asc' : on && dir === 'asc' ? 'desc' : (isNum ? 'desc' : 'asc');
    return el('th', {
      scope: 'col',
      cls: isNum ? 'num' : null,
      'aria-sort': on ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'
    }, el('button', {
      type: 'button', cls: 'sortbtn',
      on: { click: function () { ctx.on.sort(field + ':' + next); } }
    }, [txt(label), el('span', { cls: 'ar', 'aria-hidden': 'true', text: on ? (dir === 'asc' ? '▲' : '▼') : '↕' })]));
  }

  function plainTh(label, isNum) {
    return el('th', { scope: 'col', cls: isNum ? 'num' : null }, el('span', { cls: 'sortbtn', text: label }));
  }

  function emptyBlock(ctx, title, extras) {
    var box = el('div', { cls: 'empty' }, el('p', null, el('strong', { text: title })));
    (extras || []).forEach(function (e) { if (e) box.appendChild(e); });
    box.appendChild(el('p', null, el('button', {
      type: 'button', cls: 'btn ghost', text: ctx.T.emptyClear,
      on: { click: function () { ctx.on.clearFilters(); } }
    })));
    return box;
  }

  // "Showing 150 of 1,204" + Show more / Show all.
  function revealBlock(ctx, shown, total) {
    if (total <= shown) return null;
    var t = ctx.T, step = Math.min(250, total - shown);
    return el('div', { cls: 'reveal' }, [
      el('button', { type: 'button', cls: 'btn ghost', text: L.tpl(t.showMore, { n: ctx.f.num(step) }), on: { click: function () { ctx.on.more(); } } }),
      el('button', { type: 'button', cls: 'btn ghost', text: L.tpl(t.showAll, { n: ctx.f.num(total) }), on: { click: function () { ctx.on.all(); } } }),
      el('span', { cls: 'of', text: L.tpl(t.statusShowing, { shown: ctx.f.num(shown), n: ctx.f.num(total) }) })
    ]);
  }

  function csvButton(ctx, label, handler) {
    return el('div', { cls: 'reveal' }, el('button', {
      type: 'button', cls: 'btn', text: label, on: { click: handler }
    }));
  }

  /* ============================================================
     PAYMENTS — the default view and the search job.
     One row per payment line, all of them reachable.
     ============================================================ */
  function payments(ctx) {
    var t = ctx.T, f = ctx.f, out = document.createDocumentFragment();

    if (ctx.loading) return frag(el('div', { cls: 'skeleton', 'aria-busy': 'true', text: L.tpl(t.loadingLines, { n: f.num(ctx.expectedLines || 0) }) }));
    if (ctx.linesFailed) return frag(linesFailed(ctx));

    // One sitting or one category in view: say why, before the lines.
    var st = ctx.state;
    if (st.sittings.length === 1 && !st.payee) {
      var se = ctx.context.sitting(st.sittings[0]);
      if (se) out.appendChild(contextBlock(ctx, se, { title: ctx.sittingLabel(ctx.store.sittingById[st.sittings[0]]) }));
    }
    if (st.categories.length === 1) {
      var ck = L.KEY_BY_SLUG[st.categories[0]], ce = ctx.context.category(ck);
      if (ce) out.appendChild(contextBlock(ctx, ce, { title: ctx.catName(ck), ask: st.sittings.length !== 1 }));
    }
    out.appendChild(distStrip(ctx, ctx.agg.mix, ctx.agg.total));

    if (!ctx.idx.length) {
      out.appendChild(emptyBlock(ctx, t.emptyTitle, ctx.widenOffers()));
      return out;
    }

    var table = el('table', { cls: 'lt stack', id: 'payments-table' });
    table.appendChild(el('caption', { cls: 'visually-hidden', text: t.capPayments }));
    table.appendChild(el('thead', null, el('tr', null, [
      sortableTh(ctx, 'payee', t.colPayee),
      sortableTh(ctx, 'description', t.colDescription),
      sortableTh(ctx, 'category', t.colCategory),
      sortableTh(ctx, 'sitting', t.colSitting),
      sortableTh(ctx, 'amount', t.colAmount, true)
    ])));

    var body = el('tbody');
    var shown = Math.min(ctx.revealed, ctx.idx.length);
    for (var i = 0; i < shown; i++) body.appendChild(paymentRow(ctx, ctx.store.lines[ctx.idx[i]]));
    table.appendChild(body);
    out.appendChild(table);

    var rev = revealBlock(ctx, shown, ctx.idx.length);
    if (rev) out.appendChild(rev);
    out.appendChild(csvButton(ctx, t.csvView, function () { ctx.on.csv(); }));
    return out;
  }

  function paymentRow(ctx, line) {
    var t = ctx.T, f = ctx.f;
    var P = ctx.store.payees[line.p];
    var gloss = ctx.gloss(P);

    var payeeCell = el('th', { scope: 'row', 'data-l': t.colPayee }, [
      el('button', {
        type: 'button', cls: 'linkbtn', text: ctx.payeeName(P),
        on: { click: function () { ctx.on.payee(line.p); } }
      }),
      gloss ? el('span', { cls: 'gloss', text: gloss }) : null
    ]);

    // The description. Where the entry's own prefix carries a trade name
    // the payee field does not, it is kept as a chip — never discarded.
    var desc = el('td', { 'data-l': t.colDescription });
    if (line.pre) desc.appendChild(el('span', { cls: 'tradechip', text: line.pre }));
    desc.appendChild(txt(line.d || line.e));

    var s = ctx.store.sittingById[line.s];
    var neg = line.a < 0;
    var amtCell = el('td', { cls: 'num' + (neg ? ' credit' : ''), 'data-l': t.colAmount }, [
      txt(f.money(line.a)),
      neg ? el('span', { cls: 'tag', text: t.creditTag }) : null
    ]);

    return el('tr', null, [
      payeeCell,
      desc,
      el('td', { 'data-l': t.colCategory }, el('button', {
        type: 'button', cls: 'linkbtn',
        on: { click: function () { ctx.on.category(line.c); } }
      }, [catDot(ctx, line.c), txt(' ' + ctx.catName(line.c))])),
      el('td', { 'data-l': t.colSitting }, [
        txt(ctx.sittingShort(s) + ' '),
        pvLink(s.url, t.pvShort, t.newTab)
      ]),
      amtCell
    ]);
  }

  function linesFailed(ctx) {
    var t = ctx.T;
    return el('div', { cls: 'notice warn' }, [
      el('p', null, rich(t.linesUnavailable)),
      el('p', null, el('button', { type: 'button', cls: 'btn ghost', text: t.retry, on: { click: function () { ctx.on.retry(); } } }))
    ]);
  }

  /* ============================================================
     PAYEES — the index into the profiles.
     ============================================================ */
  function payees(ctx) {
    var t = ctx.T, f = ctx.f, out = document.createDocumentFragment();
    if (ctx.loading) return frag(el('div', { cls: 'skeleton', 'aria-busy': 'true', text: L.tpl(t.loadingLines, { n: f.num(ctx.expectedLines || 0) }) }));
    if (ctx.linesFailed) return frag(linesFailed(ctx));

    var rows = ctx.payeeRows();
    if (!rows.length) { out.appendChild(emptyBlock(ctx, t.emptyPayees, ctx.widenOffers())); return out; }

    var cv = el('div', { cls: 'chartbox top' }, el('canvas', { id: 'chart-payees' }));
    out.appendChild(el('figure', null, [cv, el('figcaption', { id: 'cap-payees' })]));
    // Ranked by total regardless of how the table is sorted: a chart titled
    // "top payees" that showed the alphabetical first 20 would be a lie.
    var top = rows.slice().sort(function (a, b) { return b.total - a.total; }).slice(0, 20);
    ctx.chart('payees', 'chart-payees', 'cap-payees', top.map(function (r) {
      return { label: r.name, value: r.total, color: ctx.color(ctx.topCatColor(r)), id: r.slug };
    }), { onPick: function (slug) { ctx.on.payee(slug); } });

    var table = el('table', { cls: 'lt stack', id: 'payees-table' });
    table.appendChild(el('caption', { cls: 'visually-hidden', text: t.capPayees }));
    table.appendChild(el('thead', null, el('tr', null, [
      sortableTh(ctx, 'payee', t.colPayee),
      plainTh(t.colMix),
      sortableTh(ctx, 'sittings', t.colSittingsPaid, true),
      sortableTh(ctx, 'lines', t.colLines, true),
      sortableTh(ctx, 'amount', t.colTotal, true)
    ])));

    var body = el('tbody'), nSit = ctx.yearSittings().length;
    rows.forEach(function (r) {
      var aliasN = r.aliases.length;
      body.appendChild(el('tr', null, [
        el('th', { scope: 'row', 'data-l': t.colPayee }, [
          el('button', { type: 'button', cls: 'linkbtn', text: r.name, on: { click: function () { ctx.on.payee(r.slug); } } }),
          ctx.gloss(r.payee) ? el('span', { cls: 'gloss', text: ctx.gloss(r.payee) }) : null,
          aliasN ? el('span', { cls: 'gloss', text: L.tpl(aliasN === 1 ? t.aliasCount : t.aliasCountN, { n: aliasN }) }) : null
        ]),
        el('td', { 'data-l': t.colMix }, mixBar(ctx, r)),
        el('td', { cls: 'num', 'data-l': t.colSittingsPaid }, [
          txt(L.tpl(t.sittingsPaidVal, { n: r.nSittings, total: nSit }) + ' '),
          presenceStrip(ctx, r)
        ]),
        el('td', { cls: 'num', 'data-l': t.colLines, text: ctx.f.num(r.lines) }),
        el('td', { cls: 'num' + (r.total < 0 ? ' credit' : ''), 'data-l': t.colTotal, text: f.money(r.total) })
      ]));
    });
    table.appendChild(body);
    out.appendChild(table);
    out.appendChild(csvButton(ctx, t.csvView, function () { ctx.on.csv(); }));
    return out;
  }

  function mixBar(ctx, r) {
    var bar = el('span', { cls: 'mix', 'aria-hidden': 'true' });
    var tot = 0;
    Object.keys(r.byCat).forEach(function (k) { if (r.byCat[k].amt > 0) tot += r.byCat[k].amt; });
    if (!tot) return bar;
    Object.keys(r.byCat).sort(function (a, b) { return r.byCat[b].amt - r.byCat[a].amt; }).forEach(function (k) {
      if (r.byCat[k].amt <= 0) return;
      var c = ctx.store.catByKey[k];
      bar.appendChild(el('i', {
        style: 'flex:' + (r.byCat[k].amt / tot) + ';background:' + ctx.color(c ? c.color : '#888888'),
        title: ctx.catName(k)
      }));
    });
    return bar;
  }
  function presenceStrip(ctx, r) {
    var strip = el('span', { cls: 'strip', 'aria-hidden': 'true' });
    var paid = {};
    r.sittings.forEach(function (s) { paid[s] = 1; });
    ctx.yearSittings().forEach(function (s) {
      strip.appendChild(el('i', { cls: paid[s.m] ? 'on' : null, title: ctx.sittingShort(s) }));
    });
    return strip;
  }

  /* ============================================================
     CATEGORIES
     ============================================================ */
  function categories(ctx) {
    var t = ctx.T, f = ctx.f, out = document.createDocumentFragment();
    var rows = ctx.categoryRows();
    if (!rows.length) { out.appendChild(emptyBlock(ctx, t.emptyCats, ctx.widenOffers())); return out; }
    var total = rows.reduce(function (a, r) { return a + r.amt; }, 0) || 1;

    var cv = el('div', { cls: 'chartbox cats' }, el('canvas', { id: 'chart-cats' }));
    out.appendChild(el('figure', null, [cv, el('figcaption', { id: 'cap-cats' })]));
    ctx.chart('cats', 'chart-cats', 'cap-cats', rows.map(function (r) {
      var picked = ctx.state.categories.length && ctx.state.categories.indexOf(L.SLUGS[r.key]) < 0;
      return { label: ctx.catName(r.key), value: r.amt, color: picked ? ctx.dim(r.color) : ctx.color(r.color), id: r.key };
    }), { onPick: function (key) { ctx.on.category(key); } });

    var table = el('table', { cls: 'lt', id: 'categories-table' });
    table.appendChild(el('caption', { cls: 'visually-hidden', text: t.capCategories }));
    table.appendChild(el('thead', null, el('tr', null, [
      plainTh(t.colCategory), plainTh(t.colShare, true), plainTh(t.colPayeesN, true),
      plainTh(t.colLines, true), plainTh(t.colAcross), plainTh(t.colTotal, true)
    ])));
    var body = el('tbody');
    rows.forEach(function (r) {
      body.appendChild(el('tr', null, [
        // The name opens the category's lines, as a sitting's name does in
        // the Sittings tab. On a phone "See the lines" sits in the last
        // column, off-screen in the sideways scroll, so the name must do it.
        el('th', { scope: 'row' }, [
          catDot(ctx, r.key), txt(' '),
          navLink(ctx.hrefCategory(r.key), ctx.catName(r.key), function () { ctx.on.categoryOnly(r.key); },
            { title: t.catSeeLines })
        ]),
        el('td', { cls: 'num', text: f.pct(r.amt / total) }),
        el('td', { cls: 'num', text: f.num(r.payees) }),
        el('td', { cls: 'num', text: f.num(r.lines) }),
        el('td', null, heatStrip(ctx, r)),
        el('td', { cls: 'num' }, [
          txt(f.money(r.amt)),
          el('span', { cls: 'gloss' }, el('button', {
            type: 'button', cls: 'linkbtn', text: t.catSeeLines,
            on: { click: function () { ctx.on.categoryOnly(r.key); } }
          }))
        ])
      ]));
      var ce = ctx.context.category(r.key);
      if (ce) {
        body.appendChild(el('tr', { cls: 'ctx-row' }, el('td', { colspan: '6' },
          el('details', { cls: 'ref' }, [
            el('summary', { text: L.tpl(t.ctxCatToggle, { v: ctx.catName(r.key) }) }),
            el('div', { cls: 'inner' }, contextBlock(ctx, ce, {
              inline: true, title: ctx.catName(r.key),
              extra: topPayees(ctx, function (ln) { return ln.c === r.key; }, 3)
            }))
          ]))));
      }
    });
    body.appendChild(el('tr', { cls: 'totals' }, [
      el('th', { scope: 'row', text: L.tpl(t.totalsYear, { year: ctx.state.scope }) }),
      el('td', { cls: 'num', text: '100 %' }),
      el('td', { cls: 'num', text: f.num(ctx.agg.payees) }),
      el('td', { cls: 'num', text: f.num(ctx.agg.lines) }),
      el('td'),
      el('td', { cls: 'num', text: f.money(ctx.agg.total) })
    ]));
    table.appendChild(body);
    out.appendChild(scrollWrap(table));
    out.appendChild(csvButton(ctx, t.csvView, function () { ctx.on.csv(); }));
    return out;
  }

  function heatStrip(ctx, r) {
    var strip = el('span', { cls: 'strip' });
    var mx = 0;
    r.bySitting.forEach(function (v) { if (v > mx) mx = v; });
    ctx.yearSittings().forEach(function (s) {
      var v = r.bySitting[s.si] || 0;
      strip.appendChild(el('i', {
        style: mx > 0 && v > 0 ? 'background:' + ctx.color(r.color) + ';opacity:' + (0.25 + 0.75 * (v / mx)) : null,
        title: ctx.sittingShort(s) + ' — ' + ctx.f.money(v)
      }));
    });
    return strip;
  }

  /* ============================================================
     SITTINGS — where the reconciliation is stated in public.
     The Gap column is permanent, not a footnote.
     ============================================================ */
  // The Observer's account of a sitting, beside the official minutes.
  function recapLink(ctx, entry) {
    var lk = ((entry && entry.links) || []).filter(function (l) { return l.kind === 'recap' && ctxHref(l, ctx.lang); })[0];
    if (!lk) return null;
    return el('span', { cls: 'gloss' }, el('a', { href: ctxHref(lk, ctx.lang), cls: 'ctx-recap' }, ctx.T.ctxKind_recap));
  }

  function sittings(ctx) {
    var t = ctx.T, f = ctx.f, out = document.createDocumentFragment();
    var rows = ctx.sittingRows();                 // newest first, for the table
    var chrono = ctx.yearSittings();              // oldest first, for the chart

    var cv = el('div', { cls: 'chartbox trend' }, el('canvas', { id: 'chart-trend' }));
    out.appendChild(el('figure', null, [cv, el('figcaption', { id: 'cap-trend' })]));
    ctx.chart('trend', 'chart-trend', 'cap-trend', chrono.map(function (s) {
      return {
        label: ctx.sittingShort(s) + (s.coverage !== 'full' ? ' *' : ''),
        value: s.total, id: s.m,
        hatched: s.coverage !== 'full',
        selected: ctx.state.sittings.indexOf(s.m) >= 0
      };
    }), { onPick: function (id) { ctx.on.sittingOnly(id); }, vertical: true });

    var table = el('table', { cls: 'lt', id: 'sittings-table' });
    table.appendChild(el('caption', { cls: 'visually-hidden', text: t.capSittings }));
    table.appendChild(el('thead', null, el('tr', null, [
      plainTh(t.colSitting), plainTh(t.colStatus), plainTh(t.colLines, true),
      plainTh(t.colItemized, true), plainTh(t.colAdopted, true), plainTh(t.colGap, true), plainTh(t.colSource)
    ])));

    var body = el('tbody');
    rows.forEach(function (s) {
      var note = ctx.lang === 'fr' ? s.note_fr : s.note_en;
      var se = ctx.context.sitting(s.m);
      var gapCell;
      if (L.cents(s.gap) === 0) {
        gapCell = el('td', { cls: 'num ok', text: t.gapOk });
      } else {
        gapCell = el('td', { cls: 'num flag' }, [
          txt(L.tpl(t.gapDocumented, { gap: f.money(Math.abs(s.gap)) })),
          el('span', { cls: 'gloss', text: ctx.tolNote() })
        ]);
      }
      body.appendChild(el('tr', null, [
        el('th', { scope: 'row' }, [
          // "What did this sitting approve?" answered in one click: its
          // lines, in Payments. (It used to toggle a filter this table
          // ignores, so nothing visible happened.)
          navLink(ctx.hrefSitting(s.m), ctx.sittingLabel(s), function () { ctx.on.sittingOnly(s.m); },
            { title: t.sitSeeLines }),
          el('span', {
            cls: 'gloss',
            text: (s.extraordinary ? t.sitExtra : t.sitOrdinary) + ' · ' + f.dateLong(s.sittingDate) +
                  (s.resolution ? ' · ' + L.tpl(t.sitResolution, { n: s.resolution }) : '')
          })
        ]),
        el('td', { text: s.coverage === 'full' ? t.sitFull : t.sitPartial }),
        el('td', { cls: 'num', text: f.num(s.lineCount) }),
        el('td', { cls: 'num', text: f.money(s.lineTotal) }),
        el('td', { cls: 'num', text: f.money(s.total) }),
        gapCell,
        el('td', null, [pvLink(s.url, t.pvShort, t.newTab), recapLink(ctx, se)])
      ]));
      if (se) {
        body.appendChild(el('tr', { cls: 'ctx-row' }, el('td', { colspan: '7' },
          el('details', { cls: 'ref' }, [
            el('summary', { text: t.ctxSitToggle }),
            el('div', { cls: 'inner' }, contextBlock(ctx, se, { inline: true, title: ctx.sittingLabel(s) }))
          ]))));
      }
      if (note) {
        body.appendChild(el('tr', null, el('td', { colspan: '7' },
          el('details', { cls: 'ref' }, [
            el('summary', { text: t.sitNoteToggle }),
            el('div', { cls: 'inner' }, el('p', { text: note }))
          ]))));
      }
    });

    var T2 = { lines: 0, itemized: 0, adopted: 0, gap: 0 };
    rows.forEach(function (s) { T2.lines += s.lineCount; T2.itemized += s.lineTotal; T2.adopted += s.total; T2.gap += s.gap; });
    body.appendChild(el('tr', { cls: 'totals' }, [
      el('th', { scope: 'row', text: L.tpl(t.totalsYear, { year: ctx.state.scope }) }),
      el('td'),
      el('td', { cls: 'num', text: f.num(T2.lines) }),
      el('td', { cls: 'num', text: f.money(T2.itemized) }),
      el('td', { cls: 'num', text: f.money(T2.adopted) }),
      el('td', { cls: 'num', text: f.money(T2.gap) }),
      el('td')
    ]));
    table.appendChild(body);
    out.appendChild(scrollWrap(table));
    out.appendChild(csvButton(ctx, t.csvView, function () { ctx.on.csv(); }));
    return out;
  }

  /* ============================================================
     PAYEE PROFILE — the shareable artifact (?payee=slug).
     Always all sittings: a link pasted into an article must mean the
     same thing for every reader, whatever they had filtered.
     ============================================================ */
  function profile(ctx, slug) {
    var t = ctx.T, f = ctx.f, out = document.createDocumentFragment();
    var pd = ctx.profileData(slug);
    var P = pd && pd.P;
    if (!P) {
      out.appendChild(el('h2', { id: 'profile-h', text: t.pfNotFound }));
      out.appendChild(el('p', null, el('button', { type: 'button', cls: 'btn ghost', text: t.profileBack, on: { click: function () { ctx.on.closeProfile(); } } })));
      return out;
    }

    out.appendChild(el('p', null, el('button', {
      type: 'button', cls: 'btn ghost', text: t.profileBack,
      on: { click: function () { ctx.on.closeProfile(); } }
    })));

    out.appendChild(el('div', { cls: 'profile-top' }, el('h2', { id: 'profile-h', text: ctx.payeeName(P) })));
    var gl = ctx.gloss(P);
    if (gl) out.appendChild(el('p', { cls: 'lw-deck', text: gl }));
    if (P.aliases.length) out.appendChild(el('p', { cls: 'aka', text: L.tpl(t.alsoWritten, { list: P.aliases.join(' · ') }) }));
    var pe = ctx.context.payee(slug);
    if (pe) out.appendChild(contextBlock(ctx, pe, { title: ctx.payeeName(P) }));
    if (P.isPayroll) out.appendChild(el('div', { cls: 'notice', text: t.payrollNote }));
    if (P.isRest) out.appendChild(el('div', { cls: 'notice', text: t.restNote }));
    // A profile shows every sitting by default so a shared link means the
    // same thing to everyone; the reader can opt into their own filters.
    if (ctx.hasFilters()) {
      out.appendChild(el('div', { cls: 'notice' }, [
        el('p', { text: pd.scoped ? t.pfApplyFilters : t.pfPaused }),
        el('p', null, el('button', {
          type: 'button', cls: 'btn ghost',
          text: pd.scoped ? t.pfTotalSub : t.pfApplyFilters,
          on: { click: function () { ctx.on.togglePayeeScope(); } }
        }))
      ]));
    }

    var ys = ctx.yearSittings();
    var yearItemized = ys.reduce(function (a, s) { return a + s.lineTotal; }, 0);
    var share = yearItemized ? pd.total / yearItemized : 0;
    out.appendChild(el('div', { cls: 'facts' }, [
      fact(t.pfTotal, f.money(pd.total), pd.scoped ? '' : L.tpl(t.pfTotalSub, { year: pd.year })),
      fact(t.pfLines, f.num(pd.lines), ''),
      fact(t.pfSittings, L.tpl(t.sittingsPaidVal, { n: pd.nSittings, total: ys.length }), ''),
      fact(t.pfShare, f.pct(share), ''),
      fact(t.pfMax, f.money(pd.maxLine), ''),
      fact(t.pfFirst, ctx.sittingShort(ctx.store.sittingById[pd.first]), t.pfLast + ' : ' + ctx.sittingShort(ctx.store.sittingById[pd.last]))
    ]));
    // The same supplier in the other years, one click away.
    var others = Object.keys(pd.byYear).filter(function (y) { return y !== pd.year; }).sort().reverse();
    if (others.length) {
      var oy = el('p', { cls: 'pf-years' }, el('span', { cls: 'lbl', text: t.pfOtherYears }));
      others.forEach(function (y, i) {
        if (i) oy.appendChild(txt(' · '));
        oy.appendChild(navLink(ctx.hrefYear(y), L.tpl(t.pfOtherYear, { year: y, amt: f.money(pd.byYear[y].amt), n: f.num(pd.byYear[y].lines) }),
          function () { ctx.on.setScopeKeep(y); }));
      });
      out.appendChild(oy);
    }

    // Sitting by sitting — the "did they get paid every month" question.
    out.appendChild(el('h3', { text: t.pfBySitting }));
    var cv = el('div', { cls: 'chartbox mini' }, el('canvas', { id: 'chart-profile' }));
    out.appendChild(el('figure', null, [cv, el('figcaption', { id: 'cap-profile' })]));
    var perSit = ctx.payeeBySitting(pd);
    ctx.chart('profile', 'chart-profile', 'cap-profile', perSit.map(function (r) {
      return { label: ctx.sittingShort(r.s), value: r.amt, id: r.s.m };
    }), { onPick: function (id) { ctx.on.sittingOnly(id); }, vertical: true });

    var st = el('table', { cls: 'lt' });
    st.appendChild(el('thead', null, el('tr', null, [plainTh(t.colSitting), plainTh(t.colLines, true), plainTh(t.colAmount, true), plainTh(t.colSource)])));
    var sb = el('tbody');
    perSit.forEach(function (r) {
      if (!r.lines) return;
      sb.appendChild(el('tr', null, [
        el('th', { scope: 'row' }, navLink(ctx.hrefSitting(r.s.m), ctx.sittingLabel(r.s),
          function () { ctx.on.sittingOnly(r.s.m); }, { title: t.sitSeeLines })),
        el('td', { cls: 'num', text: f.num(r.lines) }),
        el('td', { cls: 'num' + (r.amt < 0 ? ' credit' : ''), text: f.money(r.amt) }),
        el('td', null, pvLink(r.s.url, t.pvShort, t.newTab))
      ]));
    });
    st.appendChild(sb);
    out.appendChild(scrollWrap(st));

    // By category
    out.appendChild(el('h3', { text: t.pfByCat }));
    var ct = el('table', { cls: 'lt' });
    ct.appendChild(el('thead', null, el('tr', null, [plainTh(t.colCategory), plainTh(t.colLines, true), plainTh(t.colShare, true), plainTh(t.colAmount, true)])));
    var cb = el('tbody');
    var ptot = 0;
    Object.keys(pd.byCat).forEach(function (k) { if (pd.byCat[k].amt > 0) ptot += pd.byCat[k].amt; });
    Object.keys(pd.byCat).sort(function (a, b) { return pd.byCat[b].amt - pd.byCat[a].amt; }).forEach(function (k) {
      cb.appendChild(el('tr', null, [
        el('th', { scope: 'row' }, [catDot(ctx, k), txt(' ' + ctx.catName(k))]),
        el('td', { cls: 'num', text: f.num(pd.byCat[k].lines) }),
        el('td', { cls: 'num', text: ptot > 0 ? f.pct(pd.byCat[k].amt / ptot) : '—' }),
        el('td', { cls: 'num', text: f.money(pd.byCat[k].amt) })
      ]));
    });
    ct.appendChild(cb);
    out.appendChild(scrollWrap(ct));

    // Every line
    out.appendChild(el('h3', { text: t.pfAllLines }));
    var idx = pd.idx;
    var shown = Math.min(ctx.profileRevealed, idx.length);
    var lt = el('table', { cls: 'lt stack', id: 'profile-lines' });
    lt.appendChild(el('thead', null, el('tr', null, [plainTh(t.colSitting), plainTh(t.colDescription), plainTh(t.colAmount, true), plainTh(t.colSource)])));
    var lb = el('tbody');
    for (var i = 0; i < shown; i++) {
      var ln = ctx.store.lines[idx[i]], s = ctx.store.sittingById[ln.s];
      var dcell = el('td', { 'data-l': t.colDescription });
      if (ln.pre) dcell.appendChild(el('span', { cls: 'tradechip', text: ln.pre }));
      dcell.appendChild(txt(ln.d || ln.e));
      lb.appendChild(el('tr', null, [
        el('th', { scope: 'row', 'data-l': t.colSitting, text: ctx.sittingShort(s) }),
        dcell,
        el('td', { cls: 'num' + (ln.a < 0 ? ' credit' : ''), 'data-l': t.colAmount, text: f.money(ln.a) }),
        el('td', { 'data-l': t.colSource }, pvLink(s.url, t.pvShort, t.newTab))
      ]));
    }
    lt.appendChild(lb);
    out.appendChild(lt);
    if (shown < idx.length) {
      out.appendChild(el('div', { cls: 'reveal' }, [
        el('button', { type: 'button', cls: 'btn ghost', text: L.tpl(t.showAll, { n: f.num(idx.length) }), on: { click: function () { ctx.on.profileAll(); } } }),
        el('span', { cls: 'of', text: L.tpl(t.statusShowing, { shown: f.num(shown), n: f.num(idx.length) }) })
      ]));
    }

    out.appendChild(el('div', { cls: 'profile-actions' }, [
      el('button', { type: 'button', cls: 'btn', text: t.pfCsv, on: { click: function () { ctx.on.profileCsv(slug); } } }),
      el('button', { type: 'button', cls: 'btn ghost', id: 'pf-copy', text: t.pfCopy, on: { click: function () { ctx.on.copyLink(); } } }),
      el('button', { type: 'button', cls: 'btn ghost', text: t.profileBack, on: { click: function () { ctx.on.closeProfile(); } } })
    ]));
    return out;
  }

  function fact(label, value, sub) {
    return el('div', { cls: 'fact' }, [
      el('div', { cls: 'l', text: label }),
      el('div', { cls: 'v', text: value }),
      sub ? el('div', { cls: 's', text: sub }) : null
    ]);
  }

  /* ---------- active-filter chips ---------- */
  function chips(ctx) {
    var t = ctx.T, out = document.createDocumentFragment();
    function chip(label, onRemove) {
      out.appendChild(el('span', { cls: 'chip' + (onRemove ? '' : ' fixed') }, [
        txt(label),
        onRemove ? el('button', { type: 'button', 'aria-label': t.chipRemove + ' — ' + label, text: '✕', on: { click: onRemove } }) : null
      ]));
    }
    var s = ctx.state;
    if (s.q) chip(L.tpl(t.chipSearch, { v: s.q }), function () { ctx.on.clearQ(); });
    // The year is the frame, not a filter: shown, never removable.
    chip(L.tpl(t.chipScope, ctx.periodFields()), null);
    s.sittings.forEach(function (id) {
      var sit = ctx.store.sittingById[id];
      if (sit) chip(L.tpl(t.chipSitting, { v: ctx.sittingShort(sit) }), function () { ctx.on.sitting(id); });
    });
    s.categories.forEach(function (slug) {
      var key = L.KEY_BY_SLUG[slug];
      if (key) chip(L.tpl(t.chipCategory, { v: ctx.catName(key) }), function () { ctx.on.category(key); });
    });
    if (s.min !== '') chip(L.tpl(t.chipMin, { v: ctx.f.money(Number(s.min)) }), function () { ctx.on.setAmount('', s.max); });
    if (s.max !== '') chip(L.tpl(t.chipMax, { v: ctx.f.money(Number(s.max)) }), function () { ctx.on.setAmount(s.min, ''); });
    return out;
  }

  /* ============================================================
     CONTEXT — the Observer's "why" beside the numbers.
     Hand-authored in ledger-context.js (validate.js check 13 holds it
     to its rules). Every point carries its own source; nothing here
     is ever parsed as HTML. A link is only made for a page of this
     site or a document on ormstown.ca — anything else stays text.
     ============================================================ */
  var CTX_SITE = /^\/(en|fr|finances)\/[A-Za-z0-9\-\/]*(#[A-Za-z0-9\-_]+)?$/;
  var CTX_EXT = /^https:\/\/(?:www\.ormstown\.ca|(?:www\.)?seao\.gouv\.qc\.ca|www\.legisquebec\.gouv\.qc\.ca)\/[^\s"<>]+$/;
  function ctxHref(src, lang) {
    var h = src && (lang === 'fr' ? src.href_fr : src.href_en);
    if (!h || h.indexOf('..') >= 0) return null;
    return (CTX_SITE.test(h) || CTX_EXT.test(h)) ? h : null;
  }
  // A source chip: "Council Watch", "Minutes", "Budget"… linking to it.
  function ctxSource(ctx, src) {
    var t = ctx.T, h = ctxHref(src, ctx.lang);
    var label = (src && src[ctx.lang]) || t['ctxKind_' + (src && src.kind)] || t.ctxKind_document;
    if (!h) return el('span', { cls: 'ctx-src', text: label });
    var ext = CTX_EXT.test(h);
    return el('a', {
      cls: 'ctx-src', href: h,
      target: ext ? '_blank' : null, rel: ext ? 'noopener' : null,
      title: ext ? t.newTab : null
    }, label);
  }
  function ctxText(o, lang) { return (o && o[lang]) || ''; }

  // entry: one record of ledger-context.js. opts.title names what the
  // block is about (a category, a sitting, a supplier); opts.extra is an
  // optional node of data-derived context (largest payees) built by the
  // caller from the ledger itself.
  function contextBlock(ctx, entry, opts) {
    var t = ctx.T, lang = ctx.lang;
    opts = opts || {};
    var box = el('section', { cls: 'ctx' + (opts.inline ? ' inline' : ''), 'aria-label': L.tpl(t.ctxAria, { v: opts.title || '' }) });
    if (!opts.inline) {
      box.appendChild(el('p', { cls: 'ctx-kick' }, [
        el('span', { cls: 'o', 'aria-hidden': 'true', text: 'O' }),
        txt(t.ctxKicker + (opts.title ? ' · ' + opts.title : ''))
      ]));
    }
    var lead = entry && ctxText(entry, lang);
    if (lead) box.appendChild(el('p', { cls: 'ctx-lead', text: lead }));

    var pts = (entry && entry.points) || [];
    if (pts.length) {
      var ul = el('ul', { cls: 'ctx-points' });
      pts.forEach(function (p) {
        var s = ctxText(p, lang);
        if (!s) return;
        ul.appendChild(el('li', null, [txt(s + ' '), ctxSource(ctx, p.src)]));
      });
      box.appendChild(ul);
    }

    var q = entry && entry.quote;
    if (q && ctxText(q, lang)) {
      box.appendChild(el('blockquote', { cls: 'ctx-quote' }, [
        el('p', { text: (lang === 'fr' ? '« ' : '“') + ctxText(q, lang) + (lang === 'fr' ? ' »' : '”') }),
        el('footer', null, [txt('— ' + ctxText(q.who, lang) + ' '), ctxSource(ctx, q.src)])
      ]));
    }

    if (opts.extra) box.appendChild(opts.extra);

    var links = (entry && entry.links) || [];
    var made = links.map(function (lk) { return ctxHref(lk, lang) ? lk : null; }).filter(Boolean);
    if (made.length) {
      var more = el('p', { cls: 'ctx-more' }, el('span', { cls: 'lbl', text: t.ctxReadMore }));
      made.forEach(function (lk, i) {
        if (i) more.appendChild(txt(' · '));
        var h = ctxHref(lk, lang), ext = CTX_EXT.test(h);
        more.appendChild(el('a', {
          href: h, target: ext ? '_blank' : null, rel: ext ? 'noopener' : null
        }, [el('span', { cls: 'k', text: t['ctxKind_' + lk.kind] || t.ctxKind_document }), txt(' ' + ctxText(lk, lang))]));
      });
      box.appendChild(more);
    }

    // The standing invitation: a number the Observer has not explained yet
    // is a question a reader can put to it.
    if (opts.ask !== false && !opts.inline) {
      box.appendChild(el('p', { cls: 'ctx-ask' }, [
        txt(t.ctxAsk + ' '),
        el('a', { href: 'mailto:ormstownobserver@gmail.com?subject=' + encodeURIComponent(L.tpl(t.ctxAskSubject, { v: opts.title || '' })) }, t.ctxAskLink)
      ]));
    }
    return box;
  }

  // The data's own context: the largest payees inside one category (or
  // sitting), from the lines the reader is looking at. pick(line) says
  // whether a line belongs.
  function topPayees(ctx, pick, n) {
    if (ctx.loading || ctx.linesFailed) return null;
    var by = {}, f = ctx.f, t = ctx.T;
    ctx.idx.forEach(function (i) {
      var ln = ctx.store.lines[i];
      if (pick(ln)) by[ln.p] = (by[ln.p] || 0) + ln.a;
    });
    var rows = Object.keys(by).map(function (k) { return { slug: k, amt: by[k] }; })
      .filter(function (r) { var P = ctx.store.payees[r.slug]; return r.amt > 0 && P && !P.isRest; })
      .sort(function (a, b) { return b.amt - a.amt; }).slice(0, n || 3);
    if (!rows.length) return null;
    var wrap = el('div', { cls: 'ctx-top' }, el('p', { cls: 'lbl', text: t.ctxTopPayees }));
    var ol = el('ol');
    rows.forEach(function (r) {
      var P = ctx.store.payees[r.slug], g = ctx.gloss(P);
      ol.appendChild(el('li', null, [
        el('button', { type: 'button', cls: 'linkbtn', text: ctx.payeeName(P), on: { click: function () { ctx.on.payee(r.slug); } } }),
        g ? el('span', { cls: 'gloss', text: ' — ' + g }) : null,
        el('span', { cls: 'amt', text: f.money(r.amt) })
      ]));
    });
    wrap.appendChild(ol);
    return wrap;
  }

  /* ============================================================
     DISCLOSURES — what the law makes the Town publish, what it has
     published, and the Observer's substitute. Data: ledger-disclosures.js
     (hand-authored, validate.js check 14). Three sections, each with an
     id so the register can point into the page: #suppliers, #contracts,
     #register.
     ============================================================ */
  // Payees that cross the threshold but are not supplier contracts: the
  // payroll sentinels, source deductions, the provincial policing bill,
  // regional shares. Listed apart, never silently dropped.
  var NOT_CONTRACT = /^(paie-municipale|salaire-personnel-municipal|municipalite-d-ormstown-paie|ministre-du-revenu|receveur-general|receveur-general-du-canada|ministre-des-finances|m-r-c-haut-saint-laurent|regie-intermunicipale-de-la-patinoire|oh-du-haut-saint-laurent|crsbp-monteregie-inc|caisse-desjardins|saaq-societe-ass-automobile)$/;

  function yearTotals(ctx, year) {
    var by = {};
    ctx.store.lines.forEach(function (ln) {
      if (ln.s.slice(0, 4) !== year) return;
      var r = by[ln.p] || (by[ln.p] = { slug: ln.p, amt: 0, n: 0, max: 0, maxLine: null });
      r.amt += ln.a; r.n++;
      if (ln.a > r.max) { r.max = ln.a; r.maxLine = ln; }
    });
    return Object.keys(by).map(function (k) { return by[k]; }).sort(function (a, b) { return b.amt - a.amt; });
  }

  function suppliersSection(ctx) {
    var t = ctx.T, f = ctx.f, dx = ctx.dx, out = el('section', { id: 'suppliers', cls: 'disc-sec', 'aria-labelledby': 'disc-sup-h' });
    var thr = (dx && dx.threshold) || 25000;
    out.appendChild(el('h2', { id: 'disc-sup-h', cls: 'disc-h', text: L.tpl(t.discSuppliersH, { amt: f.money0(thr) }) }));
    out.appendChild(el('p', { cls: 'disc-lead', text: t.discSuppliersLead }));
    out.appendChild(el('p', { cls: 'disc-basis', text: t.discSuppliersBasis }));

    var years = [];
    ctx.store.sittings.forEach(function (s) { if (years.indexOf(s.year) < 0) years.push(s.year); });
    years.sort().reverse();
    years.forEach(function (y) {
      var rows = yearTotals(ctx, y).filter(function (r) { return r.amt >= thr; });
      var main = rows.filter(function (r) { var P = ctx.store.payees[r.slug]; return P && !P.isRest && !P.isPayroll && !NOT_CONTRACT.test(r.slug); });
      var other = rows.filter(function (r) { return main.indexOf(r) < 0; });
      var last = ctx.store.sittings.filter(function (s) { return s.year === y; }).slice(-1)[0];
      var ytot = main.reduce(function (a, r) { return a + r.amt; }, 0);
      out.appendChild(el('h3', { cls: 'disc-year', text: L.tpl(t.discYear, { year: y, last: ctx.sittingShort(last), n: f.num(main.length), amt: f.money(ytot) }) }));

      var table = el('table', { cls: 'lt stack disc-table', id: 'suppliers-' + y });
      table.appendChild(el('caption', { cls: 'visually-hidden', text: L.tpl(t.capSuppliers, { year: y }) }));
      table.appendChild(el('thead', null, el('tr', null, [
        plainTh(t.colPayee), plainTh(t.colLines, true), plainTh(t.colLargest), plainTh(t.colTotal, true)
      ])));
      var body = el('tbody');
      main.forEach(function (r, i) {
        var P = ctx.store.payees[r.slug];
        var ml = r.maxLine, ms = ml && ctx.store.sittingById[ml.s];
        body.appendChild(el('tr', null, [
          el('th', { scope: 'row', 'data-l': t.colPayee }, [
            el('span', { cls: 'rank', text: (i + 1) + '. ' }),
            el('button', { type: 'button', cls: 'linkbtn', text: ctx.payeeName(P), on: { click: function () { ctx.on.payee(r.slug); } } }),
            ctx.gloss(P) ? el('span', { cls: 'gloss', text: ctx.gloss(P) }) : null
          ]),
          el('td', { cls: 'num', 'data-l': t.colLines, text: f.num(r.n) }),
          el('td', { 'data-l': t.colLargest }, ml ? [
            txt(f.money(ml.a) + ' · ' + ctx.sittingShort(ms) + ' '),
            pvLink(ms.url, t.pvShort, t.newTab),
            el('span', { cls: 'gloss', text: ml.d || ml.e })
          ] : null),
          el('td', { cls: 'num', 'data-l': t.colTotal, text: f.money(r.amt) })
        ]));
      });
      table.appendChild(body);
      out.appendChild(table);

      if (other.length) {
        var ul = el('ul', { cls: 'disc-other' });
        other.forEach(function (r) {
          var P = ctx.store.payees[r.slug];
          ul.appendChild(el('li', null, [
            el('button', { type: 'button', cls: 'linkbtn', text: ctx.payeeName(P), on: { click: function () { ctx.on.payee(r.slug); } } }),
            txt(' ' + f.money(r.amt))
          ]));
        });
        out.appendChild(el('details', { cls: 'ref' }, [
          el('summary', { text: L.tpl(t.discNotContracts, { n: f.num(other.length) }) }),
          el('div', { cls: 'inner' }, [el('p', { text: t.discNotContractsNote }), ul])
        ]));
      }
    });
    out.appendChild(el('p', { cls: 'disc-note', text: t.discSpellingNote }));
    out.appendChild(csvButton(ctx, t.discCsv, function () { ctx.on.disclosuresCsv(); }));
    return out;
  }

  // The lines of one contract, by the contractor's slug and the contract's
  // match rule. Returns { amt, n, first, last } or null when the contractor
  // is not on the lists yet.
  // A contractor spelled two ways in the minutes has two slugs; `payees`
  // lists the extra ones, and their lines count too.
  function contractSlugs(c) { return c.payee ? [c.payee].concat(c.payees || []) : []; }
  function paidToDate(ctx, c) {
    if (!c.payee) return null;
    var res = { amt: 0, n: 0, first: null, last: null }, idx = [];
    contractSlugs(c).forEach(function (sl) { idx = idx.concat(ctx.store.byPayee[sl] || []); });
    if (!idx.length) return null;
    var pats = (c.match && c.match.text || []).map(function (src) { return new RegExp(src, 'i'); });
    var all = !!(c.match && c.match.all);
    idx.forEach(function (i) {
      var ln = ctx.store.lines[i];
      if (!all && !pats.some(function (re) { return re.test(ln.e); })) return;
      res.amt += ln.a; res.n++;
      if (!res.first || ln.s < res.first) res.first = ln.s;
      if (!res.last || ln.s > res.last) res.last = ln.s;
    });
    return res;
  }
  function seaoHref(dx, year) {
    if (!dx || !dx.seao) return null;
    var h = dx.seao['href_' + year] || dx.seao.href;
    return CTX_EXT.test(h) ? h : null;
  }
  function taxWord(t, c) {
    return c.tax === 'before' ? t.discTaxBefore : c.tax === 'included' ? t.discTaxIncluded : t.discTaxUnstated;
  }

  function contractsSection(ctx) {
    var t = ctx.T, f = ctx.f, dx = ctx.dx, lang = ctx.lang;
    var out = el('section', { id: 'contracts', cls: 'disc-sec', 'aria-labelledby': 'disc-con-h' });
    var thr = (dx && dx.threshold) || 25000;
    var list = (dx && dx.contracts || []).slice().sort(function (a, b) { return String(b.awarded).localeCompare(String(a.awarded)); });
    out.appendChild(el('h2', { id: 'disc-con-h', cls: 'disc-h', text: L.tpl(t.discContractsH, { amt: f.money0(thr) }) }));
    out.appendChild(el('p', { cls: 'disc-lead', text: L.tpl(t.discContractsLead, { n: f.num(list.length), date: f.dateLong(dx.checked) }) }));
    var sh = seaoHref(dx, 2026);
    if (sh) out.appendChild(el('p', { cls: 'disc-basis' }, [txt(t.discSeaoWhere + ' '), el('a', { href: sh, target: '_blank', rel: 'noopener' }, t.discSeaoReport)]));

    var table = el('table', { cls: 'lt stack disc-table', id: 'contracts-table' });
    table.appendChild(el('caption', { cls: 'visually-hidden', text: t.capContracts }));
    table.appendChild(el('thead', null, el('tr', null, [
      plainTh(t.colObject), plainTh(t.colAwarded), plainTh(t.colPrice, true), plainTh(t.colPaid, true), plainTh(t.colSource)
    ])));
    var body = el('tbody');
    list.forEach(function (c) {
      var paid = paidToDate(ctx, c);
      var P = c.payee && ctx.store.payees[c.payee];
      var sit = ctx.store.sittings.filter(function (s) { return s.sittingDate === c.awarded; })[0];

      var paidCell;
      if (!c.payee) paidCell = el('td', { cls: 'num', 'data-l': t.colPaid }, el('span', { cls: 'gloss', text: t.discNoPayee }));
      else if (!paid || !paid.n) paidCell = el('td', { cls: 'num', 'data-l': t.colPaid }, [txt(f.money(0)), el('span', { cls: 'gloss', text: t.discNoLines })]);
      else paidCell = el('td', { cls: 'num', 'data-l': t.colPaid }, [
        txt(f.money(paid.amt)),
        el('span', { cls: 'gloss' }, [
          txt(L.tpl(t.discPaidLines, { n: f.num(paid.n), first: ctx.sittingShort(ctx.store.sittingById[paid.first]), last: ctx.sittingShort(ctx.store.sittingById[paid.last]) }) + ' · '),
          el('button', { type: 'button', cls: 'linkbtn', text: t.discProfile, on: { click: function () { ctx.on.payee(c.payee); } } })
        ])
      ]);

      var src = el('td', { 'data-l': t.colSource, cls: 'disc-src' });
      var yh = seaoHref(dx, c.seao && c.seao.year);
      if (c.seao && c.seao.notice && yh) {
        src.appendChild(el('a', { cls: 'ctx-src', href: yh, target: '_blank', rel: 'noopener', title: t.newTab }, 'SEAO'));
        src.appendChild(el('span', { cls: 'gloss', text: c.seao.notice }));
      } else if (c.seao && c.seao.final === 'absent') {
        src.appendChild(el('span', { cls: 'flag', text: t.discSeaoAbsent }));
      }
      if (sit) { src.appendChild(txt(' ')); src.appendChild(pvLink(sit.url, t.pvShort, t.newTab)); }
      if (c.src) { src.appendChild(txt(' ')); src.appendChild(ctxSource(ctx, c.src)); }
      if (c.seao && c.seao.final === 'blank') src.appendChild(el('span', { cls: 'gloss flag', text: t.discFinalBlank }));

      body.appendChild(el('tr', null, [
        el('th', { scope: 'row', 'data-l': t.colObject }, [
          txt(ctxText(c.object, lang)),
          el('span', { cls: 'gloss', text: c.contractor + (P ? '' : '') })
        ]),
        el('td', { 'data-l': t.colAwarded }, [
          txt(/^\d{4}-\d{2}-\d{2}$/.test(c.awarded) ? f.dateLong(c.awarded) : String(c.awarded)),
          c.resolution ? el('span', { cls: 'gloss', text: L.tpl(t.sitResolution, { n: c.resolution }) }) : null
        ]),
        el('td', { cls: 'num', 'data-l': t.colPrice }, [
          txt(f.money(c.amount)),
          el('span', { cls: 'gloss', text: taxWord(t, c) + (c.estimate ? ' · ' + L.tpl(t.discEstimate, { amt: f.money(c.estimate) }) : '') })
        ]),
        paidCell,
        src
      ]));

      // Details: mode, bidders, financing, note, further reading.
      var inner = el('div', { cls: 'inner' });
      inner.appendChild(el('p', null, [el('strong', { text: t.discMode + ' ' }), txt(ctxText(c.mode, lang))]));
      if (c.bidders && c.bidders.length) {
        var bl = el('ul', { cls: 'disc-bidders' });
        c.bidders.forEach(function (b) { bl.appendChild(el('li', { text: b[0] + (b[1] != null ? ' — ' + f.money(b[1]) : '') })); });
        inner.appendChild(el('p', null, el('strong', { text: t.discBidders })));
        inner.appendChild(bl);
      }
      if (c.financing) inner.appendChild(el('p', null, [el('strong', { text: t.discFinancing + ' ' }), txt(ctxText(c.financing, lang))]));
      if (c.note) inner.appendChild(el('p', { text: ctxText(c.note, lang) }));
      var made = (c.links || []).filter(function (lk) { return ctxHref(lk, lang); });
      if (made.length) {
        var more = el('p', { cls: 'ctx-more' }, el('span', { cls: 'lbl', text: t.ctxReadMore }));
        made.forEach(function (lk, i) {
          if (i) more.appendChild(txt(' · '));
          var h = ctxHref(lk, lang), ext = CTX_EXT.test(h);
          more.appendChild(el('a', { href: h, target: ext ? '_blank' : null, rel: ext ? 'noopener' : null }, [el('span', { cls: 'k', text: t['ctxKind_' + lk.kind] || t.ctxKind_document }), txt(' ' + ctxText(lk, lang))]));
        });
        inner.appendChild(more);
      }
      body.appendChild(el('tr', { cls: 'ctx-row' }, el('td', { colspan: '5' }, el('details', { cls: 'ref' }, [
        el('summary', { text: t.discDetails }), inner
      ]))));
    });
    table.appendChild(body);
    out.appendChild(table);
    out.appendChild(el('p', { cls: 'disc-note', text: t.discPaidNote }));
    return out;
  }

  function registerSection(ctx) {
    var t = ctx.T, f = ctx.f, dx = ctx.dx, lang = ctx.lang;
    var out = el('section', { id: 'register', cls: 'disc-sec', 'aria-labelledby': 'disc-reg-h' });
    out.appendChild(el('h2', { id: 'disc-reg-h', cls: 'disc-h', text: t.discRegisterH }));
    out.appendChild(el('p', { cls: 'disc-lead', text: L.tpl(t.discRegisterLead, { date: f.dateLong(dx.checked) }) }));
    var STATUS = { found: 'discStatusFound', partial: 'discStatusPartial', stale: 'discStatusStale', missing: 'discStatusMissing' };
    (dx.items || []).forEach(function (it) {
      var box = el('article', { cls: 'disc-item', id: 'disc-' + it.id });
      box.appendChild(el('h3', null, [
        el('span', { cls: 'status s-' + it.status, text: t[STATUS[it.status]] || it.status }),
        txt(' ' + ctxText(it, lang))
      ]));
      var dl = el('dl');
      // the law
      var lawHref = it.law && CTX_EXT.test(it.law.href || '') ? it.law.href : null;
      dl.appendChild(el('dt', { text: t.discLaw }));
      dl.appendChild(el('dd', null, [
        lawHref ? el('a', { href: lawHref, target: '_blank', rel: 'noopener' }, ctxText(it.law, lang)) : txt(ctxText(it.law, lang)),
        it.law && it.law['note_' + lang] ? el('span', { cls: 'gloss', text: it.law['note_' + lang] }) : null
      ]));
      dl.appendChild(el('dt', { text: t.discRequires }));
      dl.appendChild(el('dd', { text: ctxText(it.requires, lang) + (it.due ? ' ' + L.tpl(t.discDue, { date: f.dateLong(it.due) }) : '') }));
      // the Town
      var th = it.town && CTX_EXT.test(it.town.href || '') ? it.town.href : null;
      dl.appendChild(el('dt', { text: L.tpl(t.discTown, { date: f.dateLong(dx.checked) }) }));
      dl.appendChild(el('dd', null, [
        txt(ctxText(it.town, lang) + ' '),
        th ? el('a', { cls: 'ctx-src', href: th, target: '_blank', rel: 'noopener', title: t.newTab }, it.town['href_label_' + lang] || 'ormstown.ca') : null
      ]));
      // the Observer
      if (it.observer) {
        var ob = it.observer, kids = [txt(ctxText(ob, lang) + ' ')];
        if (ob.anchor) kids.push(navLink(ctx.hrefTab('disclosures') + '#' + ob.anchor, t.discGoSection, function () {
          var n = document.getElementById(ob.anchor); if (n && n.scrollIntoView) n.scrollIntoView({ block: 'start' });
        }, { cls: 'linkbtn disc-go' }));
        else if (ob.payee && ctx.store.payees[ob.payee]) kids.push(el('button', { type: 'button', cls: 'linkbtn', text: ctx.payeeName(ctx.store.payees[ob.payee]) + ' →', on: { click: function () { ctx.on.payee(ob.payee); } } }));
        else if (ctxHref(ob, lang)) kids.push(el('a', { href: ctxHref(ob, lang) }, t.discReadObserver));
        dl.appendChild(el('dt', { text: t.discObserver }));
        dl.appendChild(el('dd', null, kids));
      }
      box.appendChild(dl);
      out.appendChild(box);
    });
    return out;
  }

  function disclosures(ctx) {
    var t = ctx.T, out = document.createDocumentFragment();
    if (!ctx.dx || !ctx.dx.items) {
      out.appendChild(el('div', { cls: 'notice warn', text: t.discUnavailable }));
      return out;
    }
    if (ctx.loading) return frag(el('div', { cls: 'skeleton', 'aria-busy': 'true', text: L.tpl(t.loadingLines, { n: ctx.f.num(ctx.expectedLines || 0) }) }));
    if (ctx.linesFailed) return frag(linesFailed(ctx));
    out.appendChild(el('p', { cls: 'disc-intro', text: t.discIntro }));
    out.appendChild(el('nav', { cls: 'disc-toc', 'aria-label': t.tabDisclosures }, [
      el('a', { href: '#suppliers', text: t.discTocSuppliers }), txt(' · '),
      el('a', { href: '#contracts', text: t.discTocContracts }), txt(' · '),
      el('a', { href: '#register', text: t.discTocRegister })
    ]));
    out.appendChild(suppliersSection(ctx));
    out.appendChild(contractsSection(ctx));
    out.appendChild(registerSection(ctx));
    return out;
  }

  global.OO_LEDGER_VIEWS = {
    el: el, txt: txt, frag: frag, append: append, rich: rich, pvLink: pvLink, navLink: navLink,
    fmt: fmt, downloadCSV: downloadCSV, distStrip: distStrip, chips: chips,
    payments: payments, payees: payees, categories: categories, sittings: sittings,
    profile: profile, emptyBlock: emptyBlock, contextBlock: contextBlock,
    disclosures: disclosures, yearTotals: yearTotals, NOT_CONTRACT: NOT_CONTRACT
  };
})(window);
