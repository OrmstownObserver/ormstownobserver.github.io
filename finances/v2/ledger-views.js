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
  var OK_URL = /^https:\/\/www\.ormstown\.ca\//;

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
  function frag(kids) { return append(document.createDocumentFragment(), kids); }

  // A safe external link. The href is only set when it points at the
  // municipality's own site — the same domain rule validate.js enforces.
  function pvLink(url, label, title) {
    if (!OK_URL.test(String(url || ''))) return el('span', { cls: 'pv' }, label);
    return el('a', { cls: 'pv', href: url, target: '_blank', rel: 'noopener', title: title || null }, label);
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
     every cell (app.js:20); across 2,138 rows that was the single
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
     One row per payment line, all 2,138 of them reachable.
     ============================================================ */
  function payments(ctx) {
    var t = ctx.T, f = ctx.f, out = document.createDocumentFragment();

    if (ctx.loading) return frag(el('div', { cls: 'skeleton', 'aria-busy': 'true', text: L.tpl(t.loadingLines, { n: f.num(ctx.expectedLines || 0) }) }));
    if (ctx.linesFailed) return frag(linesFailed(ctx));

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

    var body = el('tbody'), nSit = ctx.store.sittings.length;
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
    ctx.store.sittings.forEach(function (s) {
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
        el('th', { scope: 'row' }, [
          catDot(ctx, r.key),
          el('button', { type: 'button', cls: 'linkbtn', text: ' ' + ctx.catName(r.key), on: { click: function () { ctx.on.category(r.key); } } })
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
    });
    body.appendChild(el('tr', { cls: 'totals' }, [
      el('th', { scope: 'row', text: t.totalsLabel }),
      el('td', { cls: 'num', text: '100 %' }),
      el('td', { cls: 'num', text: f.num(ctx.agg.payees) }),
      el('td', { cls: 'num', text: f.num(ctx.agg.lines) }),
      el('td'),
      el('td', { cls: 'num', text: f.money(ctx.agg.total) })
    ]));
    table.appendChild(body);
    out.appendChild(table);
    out.appendChild(csvButton(ctx, t.csvView, function () { ctx.on.csv(); }));
    return out;
  }

  function heatStrip(ctx, r) {
    var strip = el('span', { cls: 'strip' });
    var mx = 0;
    r.bySitting.forEach(function (v) { if (v > mx) mx = v; });
    ctx.store.sittings.forEach(function (s, i) {
      var v = r.bySitting[i] || 0;
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
  function sittings(ctx) {
    var t = ctx.T, f = ctx.f, out = document.createDocumentFragment();
    var rows = ctx.sittingRows();                 // newest first, for the table
    var chrono = ctx.store.sittings;              // oldest first, for the chart

    var cv = el('div', { cls: 'chartbox trend' }, el('canvas', { id: 'chart-trend' }));
    out.appendChild(el('figure', null, [cv, el('figcaption', { id: 'cap-trend' })]));
    ctx.chart('trend', 'chart-trend', 'cap-trend', chrono.map(function (s) {
      return {
        label: ctx.sittingShort(s) + (s.coverage !== 'full' ? ' *' : ''),
        value: s.total, id: s.m,
        hatched: s.coverage !== 'full',
        selected: ctx.state.sittings.indexOf(s.m) >= 0
      };
    }), { onPick: function (id) { ctx.on.sitting(id); }, vertical: true });

    var table = el('table', { cls: 'lt', id: 'sittings-table' });
    table.appendChild(el('caption', { cls: 'visually-hidden', text: t.capSittings }));
    table.appendChild(el('thead', null, el('tr', null, [
      plainTh(t.colSitting), plainTh(t.colStatus), plainTh(t.colLines, true),
      plainTh(t.colItemized, true), plainTh(t.colAdopted, true), plainTh(t.colGap, true), plainTh(t.colSource)
    ])));

    var body = el('tbody');
    rows.forEach(function (s) {
      var note = ctx.lang === 'fr' ? s.note_fr : s.note_en;
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
          el('button', { type: 'button', cls: 'linkbtn', text: ctx.sittingLabel(s), on: { click: function () { ctx.on.sitting(s.m); } } }),
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
        el('td', null, pvLink(s.url, t.pvShort, t.newTab))
      ]));
      if (note) {
        body.appendChild(el('tr', null, el('td', { colspan: '7' },
          el('details', { cls: 'ref' }, [
            el('summary', { text: t.sitNoteToggle }),
            el('div', { cls: 'inner' }, el('p', { text: note }))
          ]))));
      }
    });

    var T2 = ctx.store.totals;
    body.appendChild(el('tr', { cls: 'totals' }, [
      el('th', { scope: 'row', text: t.totalsLabel }),
      el('td'),
      el('td', { cls: 'num', text: f.num(T2.lines) }),
      el('td', { cls: 'num', text: f.money(T2.itemized) }),
      el('td', { cls: 'num', text: f.money(T2.adopted) }),
      el('td', { cls: 'num', text: f.money(T2.gap) }),
      el('td')
    ]));
    table.appendChild(body);
    out.appendChild(table);
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

    var share = ctx.store.totals.itemized ? pd.total / ctx.store.totals.itemized : 0;
    out.appendChild(el('div', { cls: 'facts' }, [
      fact(t.pfTotal, f.money(pd.total), pd.scoped ? '' : t.pfTotalSub),
      fact(t.pfLines, f.num(pd.lines), ''),
      fact(t.pfSittings, L.tpl(t.sittingsPaidVal, { n: pd.nSittings, total: ctx.store.sittings.length }), ''),
      fact(t.pfShare, f.pct(share), ''),
      fact(t.pfMax, f.money(pd.maxLine), ''),
      fact(t.pfFirst, ctx.sittingShort(ctx.store.sittingById[pd.first]), t.pfLast + ' : ' + ctx.sittingShort(ctx.store.sittingById[pd.last]))
    ]));

    // Sitting by sitting — the "did they get paid every month" question.
    out.appendChild(el('h3', { text: t.pfBySitting }));
    var cv = el('div', { cls: 'chartbox mini' }, el('canvas', { id: 'chart-profile' }));
    out.appendChild(el('figure', null, [cv, el('figcaption', { id: 'cap-profile' })]));
    var perSit = ctx.payeeBySitting(pd);
    ctx.chart('profile', 'chart-profile', 'cap-profile', perSit.map(function (r) {
      return { label: ctx.sittingShort(r.s), value: r.amt, id: r.s.m };
    }), { onPick: function (id) { ctx.on.sitting(id); }, vertical: true });

    var st = el('table', { cls: 'lt' });
    st.appendChild(el('thead', null, el('tr', null, [plainTh(t.colSitting), plainTh(t.colLines, true), plainTh(t.colAmount, true), plainTh(t.colSource)])));
    var sb = el('tbody');
    perSit.forEach(function (r) {
      if (!r.lines) return;
      sb.appendChild(el('tr', null, [
        el('th', { scope: 'row', text: ctx.sittingLabel(r.s) }),
        el('td', { cls: 'num', text: f.num(r.lines) }),
        el('td', { cls: 'num' + (r.amt < 0 ? ' credit' : ''), text: f.money(r.amt) }),
        el('td', null, pvLink(r.s.url, t.pvShort, t.newTab))
      ]));
    });
    st.appendChild(sb);
    out.appendChild(st);

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
    out.appendChild(ct);

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
      out.appendChild(el('span', { cls: 'chip' }, [
        txt(label),
        el('button', { type: 'button', 'aria-label': t.chipRemove + ' — ' + label, text: '✕', on: { click: onRemove } })
      ]));
    }
    var s = ctx.state;
    if (s.q) chip(L.tpl(t.chipSearch, { v: s.q }), function () { ctx.on.clearQ(); });
    if (s.scope !== 'all') chip(L.tpl(t.chipScope, { v: s.scope }), function () { ctx.on.setScope('all'); });
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

  global.OO_LEDGER_VIEWS = {
    el: el, txt: txt, frag: frag, append: append, rich: rich, pvLink: pvLink,
    fmt: fmt, downloadCSV: downloadCSV, distStrip: distStrip, chips: chips,
    payments: payments, payees: payees, categories: categories, sittings: sittings,
    profile: profile, emptyBlock: emptyBlock
  };
})(window);
