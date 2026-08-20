/* ============================================================
   Ormstown Observer — municipal ledger: CHARTS + THEME PALETTE
   ------------------------------------------------------------
   Two jobs:

   1. THE PALETTE. The 15 category hues in spending-data.js are fixed
      Tableau colours picked for a light ground; several go muddy on
      the dark paper (#16150f). Rather than fork the data, this reads
      the live theme and raises each hue's lightness to a floor
      (OO_LEDGER.liftHex). Results are memoised per theme and thrown
      away when the theme changes.

   2. CHART.JS, LAZILY. The default Payments tab has no Chart.js
      chart, so the library is NOT on the first-paint path any more —
      it is injected the first time a chart-bearing tab is opened,
      with the same SRI attributes classic used (finances/index.html:368).

   The killChart / deferred pair below is lifted verbatim from
   finances/app.js:263-272. Both exist because of real crashes. Read
   their comments before touching either.
   ============================================================ */
(function (global) {
  'use strict';

  var L = global.OO_LEDGER;
  var REDUCED = global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var CHART_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js';
  var CHART_SRI = 'sha384-bs/nf9FbdNouRbMiFcrcZfLXYPKiPaGVGplVbv7dLGECccEXDW+S3zjqSKR5ZEaD';

  /* ---------- theme ---------- */
  // Three states, matching observer.css: an explicit data-theme wins;
  // otherwise the system preference decides.
  function mode() {
    var set = document.documentElement.getAttribute('data-theme');
    if (set === 'dark' || set === 'light') return set;
    try { return global.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
    catch (e) { return 'light'; }
  }
  function token(name, fallback) {
    try {
      var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
      return v || fallback;
    } catch (e) { return fallback; }
  }

  var DARK_L_FLOOR = 0.60;
  var palette = null, paletteMode = null;
  function catColor(hex) {
    var m = mode();
    if (paletteMode !== m) { palette = {}; paletteMode = m; }
    if (palette[hex] != null) return palette[hex];
    var out = m === 'dark' ? L.liftHex(hex, DARK_L_FLOOR) : String(hex);
    palette[hex] = out;
    return out;
  }
  // Same hue, translucent — used to dim categories the reader has
  // filtered out, so the chart and the checkbox list never disagree.
  function dim(hex) { return catColor(hex) + '40'; }

  var themeListeners = [];
  function onThemeChange(fn) { themeListeners.push(fn); }
  function fireTheme() {
    palette = null; paletteMode = null;
    themeListeners.forEach(function (fn) { try { fn(); } catch (e) {} });
  }
  if (global.MutationObserver) {
    new MutationObserver(function (recs) {
      for (var i = 0; i < recs.length; i++) {
        if (recs[i].attributeName === 'data-theme') { fireTheme(); return; }
      }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }
  try {
    var mq = global.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', fireTheme);
    else if (mq.addListener) mq.addListener(fireTheme);
  } catch (e) {}

  /* ---------- lazy Chart.js ---------- */
  var chartPromise = null;
  function ensureChart() {
    if (typeof global.Chart !== 'undefined') return Promise.resolve(true);
    if (chartPromise) return chartPromise;
    chartPromise = new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = CHART_SRC;
      s.integrity = CHART_SRI;
      s.crossOrigin = 'anonymous';
      s.onload = function () { resolve(typeof global.Chart !== 'undefined'); };
      s.onerror = function () { resolve(false); };
      document.head.appendChild(s);
    });
    return chartPromise;
  }

  /* ---------- lifted from app.js:240-272 ---------- */
  function chartDefaults() {
    if (typeof global.Chart === 'undefined') return false;
    var Chart = global.Chart;
    if (REDUCED) {
      Chart.defaults.animation = false;
    } else if (Chart.defaults.animation && typeof Chart.defaults.animation === 'object') {
      // Mutate, never replace: assigning a bare {duration} object wipes the
      // easing config and Chart.js later throws "this._fn is not a function".
      Chart.defaults.animation.duration = 350;
    }
    Chart.defaults.font.family = token('--sans', 'system-ui, sans-serif');
    Chart.defaults.color = token('--ink-soft', '#575048');
    Chart.defaults.borderColor = token('--hair', '#ddd7ca');
    return true;
  }
  // Diagonal hatch for a sitting that is not yet fully itemized. The ground
  // is the page's paper, NOT #ffffff — classic hardcoded white, which shows
  // as a bright patch on the dark theme.
  function hatch(ctx, color) {
    var c = document.createElement('canvas'); c.width = c.height = 8;
    var x = c.getContext('2d');
    x.fillStyle = token('--surface-card', '#ffffff'); x.fillRect(0, 0, 8, 8);
    x.strokeStyle = color; x.lineWidth = 2;
    x.beginPath(); x.moveTo(-2, 10); x.lineTo(10, -2); x.stroke();
    return ctx.createPattern(c, 'repeat');
  }
  // Destroy both our reference AND whatever Chart.js has attached to the
  // canvas — if a rebuild ever failed halfway, the canvas would otherwise
  // stay "in use" and every later rebuild would fail too (blank chart).
  var charts = {};
  function killChart(name, canvas) {
    if (charts[name]) { try { charts[name].destroy(); } catch (e) {} charts[name] = null; }
    if (typeof global.Chart !== 'undefined' && global.Chart.getChart && canvas) {
      var attached = global.Chart.getChart(canvas);
      if (attached) { try { attached.destroy(); } catch (e) {} }
    }
  }
  // Never rebuild charts from inside their own click handlers: destroying a
  // chart while it is still dispatching its event corrupts it. Defer instead.
  function deferred(fn) {
    return function () { var args = arguments; setTimeout(function () { fn.apply(null, args); }, 0); };
  }
  function killAll() { Object.keys(charts).forEach(function (k) { killChart(k, null); }); }

  /* ---------- builders ----------
     Every builder is destroy-then-create rather than update-in-place.
     Classic updated in place because it had three long-lived charts on one
     scrolling page; here a chart's canvas is inside a tabpanel that gets
     rebuilt wholesale, so the canvas node itself is new each time and there
     is nothing to update. killChart() before create keeps a half-failed
     rebuild from poisoning the canvas.                                    */

  function make(name, canvas, cfg, onFail) {
    if (!canvas) return null;
    if (!chartDefaults()) { if (onFail) onFail(); return null; }
    killChart(name, canvas);
    try {
      charts[name] = new global.Chart(canvas.getContext('2d'), cfg);
      return charts[name];
    } catch (e) {
      killChart(name, canvas);
      if (onFail) onFail();
      return null;
    }
  }

  // Horizontal bars: categories, top payees. `items` = [{label, value, color, id}]
  function hbar(name, canvas, items, opts, onFail) {
    opts = opts || {};
    return make(name, canvas, {
      type: 'bar',
      data: {
        labels: items.map(function (i) { return i.label; }),
        datasets: [{
          data: items.map(function (i) { return i.value; }),
          backgroundColor: items.map(function (i) { return i.color; }),
          borderRadius: 0
        }]
      },
      options: {
        indexAxis: 'y',
        maintainAspectRatio: false,
        scales: {
          x: { beginAtZero: true, ticks: { callback: opts.fmtAxis }, grid: { color: token('--hair', '#ddd7ca') } },
          y: { grid: { display: false } }
        },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: function (c) { return opts.fmt ? opts.fmt(c.parsed.x) : c.parsed.x; } } }
        },
        onClick: function (e, els) {
          if (!els.length || !opts.onPick) return;
          var it = items[els[0].index];
          if (it) deferred(opts.onPick)(it.id);
        }
      }
    }, onFail);
  }

  // Vertical bars over the sittings: the trend, and a payee's per-sitting run.
  function vbar(name, canvas, items, opts, onFail) {
    opts = opts || {};
    var ctx = canvas && canvas.getContext('2d');
    var accent = token('--accent', '#b5161b');
    return make(name, canvas, {
      type: 'bar',
      data: {
        labels: items.map(function (i) { return i.label; }),
        datasets: [{
          data: items.map(function (i) { return i.value; }),
          backgroundColor: items.map(function (i) {
            return i.hatched && ctx ? hatch(ctx, i.color || accent) : (i.color || accent);
          }),
          borderColor: items.map(function (i) { return i.selected ? token('--ink', '#1a1a1a') : 'transparent'; }),
          borderWidth: items.map(function (i) { return i.selected ? 3 : 0; }),
          borderRadius: 0
        }]
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, ticks: { callback: opts.fmtAxis }, grid: { color: token('--hair', '#ddd7ca') } },
          x: { grid: { display: false } }
        },
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: function (c) { return opts.fmt ? opts.fmt(c.parsed.y) : c.parsed.y; } } }
        },
        onClick: function (e, els) {
          if (!els.length || !opts.onPick) return;
          var it = items[els[0].index];
          if (it) deferred(opts.onPick)(it.id);
        }
      }
    }, onFail);
  }

  global.OO_LEDGER_CHARTS = {
    mode: mode, token: token, catColor: catColor, dim: dim,
    onThemeChange: onThemeChange,
    ensureChart: ensureChart, chartDefaults: chartDefaults,
    hatch: hatch, killChart: killChart, killAll: killAll, deferred: deferred,
    hbar: hbar, vbar: vbar, reduced: REDUCED
  };
})(window);
