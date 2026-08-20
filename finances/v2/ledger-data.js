/* ============================================================
   Ormstown Observer — municipal ledger: DATA LAYER
   ------------------------------------------------------------
   Builds the line store every view renders from, out of
   payments.json (2,138 payment lines) anchored to spending-data.js
   (the official adopted totals).

   THIS FILE TOUCHES NO DOM AND NO i18n. That is deliberate and
   load-bearing: finances/tests/validate-lines.js evals it under a
   fake `window` in Node so the test asserts against *the exact
   store the browser builds*, not a reimplementation of it.
   Anything needing document, localStorage, Intl-per-language or a
   translated string belongs in ledger-views.js or ledger-app.js.

   THE RECONCILIATION RULE, enforced here and in the test:
     months[].total is the ADOPTED figure and is never computed.
     Sum of lines is the ITEMIZED figure.
     Where they differ the gap is carried, never absorbed.
   ============================================================ */
(function (global) {
  'use strict';

  /* ------------------------------------------------------------
     Lifted verbatim from finances/app.js (the classic explorer).
     Comments come with them - several encode real bug history.
     ------------------------------------------------------------ */

  // {slot} interpolation used by every i18n string.  app.js:18
  function tpl(s, map) {
    return String(s).replace(/\{(\w+)\}/g, function (_, k) { return map[k] != null ? map[k] : ''; });
  }

  var COMBINING = /[̀-ͯ]/g;

  // Accent-insensitive identity key for a payee.  app.js:199-201
  // This is what collapses the 363 raw spellings in payments.json onto
  // 344 real payees ("Pieces D'Auto Valleyfield" === "Pieces d'Auto...").
  function normKey(name) {
    return String(name).normalize('NFD').replace(COMBINING, '')
      .toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  // Search normalisation: normKey, but single spaces survive so a query
  // can match across word boundaries ("robert daoust"). Used only to
  // build line.hay and to normalise the query - never for identity.
  function searchNorm(s) {
    return String(s).normalize('NFD').replace(COMBINING, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  }

  // URL-stable, language-free category slugs.  app.js:27-45
  // BYTE-IDENTICAL TO CLASSIC ON PURPOSE. These appear in ?category= in
  // published article links and in browser histories. Never rename one.
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
    'Regional shares & memberships': 'regional-shares',
    'Insurance': 'insurance',
    'Policing — SQ': 'policing-sq',
    'Software & IT': 'software-it',
    'Other': 'other'
  };
  var KEY_BY_SLUG = {};
  Object.keys(SLUGS).forEach(function (k) { KEY_BY_SLUG[SLUGS[k]] = k; });

  // Observer-created sentinel payees.  app.js:51-52
  function isPayroll(name) { return /paie municipale|municipal payroll/i.test(name); }
  function isRest(name) { return /^— (Autres fournisseurs|Other suppliers)/i.test(name) || /^— Autres fournisseurs/.test(name); }

  // Reconciliation tolerance for a sitting.  app.js:621-624
  // 2026-01 carries a documented 0.12 gap (two digits unreadable in the
  // scanned annexe). Everything else is penny-exact.
  function tol(D, monthId) {
    var tset = (D.provenance && D.provenance.tolerances) || {};
    return tset[monthId] != null ? tset[monthId] + 0.005 : 0.005;
  }

  // CSV field escaping.  app.js:817
  // The BOM and the actual download live in ledger-views.js - this file
  // stays free of Blob/URL/document so Node can eval it.
  function csvEscape(v) { return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'; }
  function buildCSV(header, rows) {
    return [header].concat(rows).map(function (r) { return r.map(csvEscape).join(','); }).join('\n');
  }

  /* ------------------------------------------------------------
     Money. Every sum is accumulated in integer cents and converted
     back once, so 2,138 float additions cannot drift a penny away
     from the adopted total.
     ------------------------------------------------------------ */
  function cents(v) { return Math.round(v * 100); }
  function dollars(c) { return c / 100; }
  function sum(nums) {
    var c = 0;
    for (var i = 0; i < nums.length; i++) c += cents(nums[i]);
    return dollars(c);
  }

  /* ------------------------------------------------------------
     Payee slugs - these become PERMANENT PUBLIC URLS (?payee=...).
     finances/tests/payee-slugs.json freezes every slug ever shipped
     and validate-lines.js fails if one moves, so a data update can
     never silently break a link pasted into an article.
     ------------------------------------------------------------ */
  function slugify(name) {
    var s = String(name).normalize('NFD').replace(COMBINING, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (s.length > 64) s = s.slice(0, 64).replace(/-+$/, '');
    return s || 'payee';
  }

  // Display name, 3-tier and fully deterministic - it decides a URL.
  //  1. the spelling used in D.entries[], which is editor-vetted and is
  //     what D.gloss is keyed on (generalises canonName(), app.js:192-198)
  //  2. otherwise: most accented characters, then most frequent, then
  //     longest, then lexicographic. Yields "Pieces d'Auto Valleyfield
  //     Inc." with its accents over the unaccented spelling every time.
  //  3. sentinels are left exactly as written; views localise them.
  function accentCount(s) {
    var m = String(s).normalize('NFD').match(COMBINING);
    return m ? m.length : 0;
  }
  function pickDisplayName(variants, entryCanon, key) {
    if (entryCanon[key]) return entryCanon[key];
    var names = Object.keys(variants);
    names.sort(function (a, b) {
      var d = accentCount(b) - accentCount(a); if (d) return d;
      d = variants[b] - variants[a];            if (d) return d;
      d = b.length - a.length;                  if (d) return d;
      return a < b ? -1 : a > b ? 1 : 0;
    });
    return names[0];
  }

  /* ------------------------------------------------------------
     Colour: dark-mode lightness lift.
     The 15 category hues in spending-data.js are fixed Tableau
     colours chosen for a light ground; several go muddy on #16150f.
     Rather than fork the data, raise each hue's HSL lightness to a
     floor at render time. Pure maths, so it is testable and can
     never drift from the source palette.
     ------------------------------------------------------------ */
  function hexToRgb(hex) {
    var h = String(hex).replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function rgbToHex(r, g, b) {
    function p(v) { var s = Math.max(0, Math.min(255, Math.round(v))).toString(16); return s.length === 1 ? '0' + s : s; }
    return '#' + p(r) + p(g) + p(b);
  }
  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, h = 0, s = 0;
    if (mx !== mn) {
      var d = mx - mn;
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return { h: h, s: s, l: l };
  }
  function hslToRgb(h, s, l) {
    function hue(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    if (s === 0) return { r: l * 255, g: l * 255, b: l * 255 };
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    return { r: hue(p, q, h + 1 / 3) * 255, g: hue(p, q, h) * 255, b: hue(p, q, h - 1 / 3) * 255 };
  }
  // Raise lightness to `floor` (0..1) without touching hue. Colours already
  // light enough are returned unchanged, so the palette stays recognisable.
  function liftHex(hex, floor) {
    var c = hexToRgb(hex), hsl = rgbToHsl(c.r, c.g, c.b);
    if (hsl.l >= floor) return String(hex);
    var out = hslToRgb(hsl.h, hsl.s, floor);
    return rgbToHex(out.r, out.g, out.b);
  }

  /* ------------------------------------------------------------
     BUILD
     ------------------------------------------------------------ */
  function build(D, payments) {
    var store = {
      D: D,
      lines: [], bySitting: {}, byPayee: {}, byCat: {},
      payees: {}, payeeList: [],
      sittings: [], sittingById: {},
      categories: [], catByKey: {},
      totals: null
    };

    /* -- sittings, from the OFFICIAL months[] -- */
    var months = D.months.slice().sort(function (a, b) { return a.m < b.m ? -1 : a.m > b.m ? 1 : 0; });
    months.forEach(function (m, i) {
      var d = /(\d{4}-\d{2}-\d{2})/.exec(m.session);
      var r = /rés\.\s*([0-9\-]+)/.exec(m.session);
      var s = {
        m: m.m, si: i,
        label_fr: m.label_fr, label_en: m.label_en,
        year: m.m.slice(0, 4),
        total: m.total,                    // ADOPTED - never recomputed
        coverage: m.coverage,
        session: m.session,
        url: m.url,
        cats: m.cats,
        note_fr: m.note_fr || '', note_en: m.note_en || '',
        // 2026-02's session string carries no "res." number; classic
        // silently dropped the suffix, we render the sitting without one.
        sittingDate: d ? d[1] : (m.m + '-01'),
        resolution: r ? r[1] : '',
        extraordinary: /extraordinaire/i.test(m.session),
        lineTotal: 0, lineCount: 0, gap: 0, tol: tol(D, m.m), reconciles: true
      };
      store.sittings.push(s);
      store.sittingById[m.m] = s;
      store.bySitting[m.m] = [];
    });

    /* -- pass 1: collect payee spellings so display names are decided
          before any line is built (a line stores its payee's slug) -- */
    var entryCanon = {};
    (D.entries || []).forEach(function (e) {
      var k = normKey(e[1]);
      if (!entryCanon[k]) entryCanon[k] = e[1];
    });

    var variants = {};   // key -> { rawSpelling: count }
    Object.keys(payments).forEach(function (mo) {
      payments[mo].forEach(function (row) {
        var k = normKey(row[0]);
        (variants[k] = variants[k] || {});
        variants[k][row[0]] = (variants[k][row[0]] || 0) + 1;
      });
    });

    var nameByKey = {}, slugByKey = {}, usedSlug = {};
    Object.keys(variants).sort().forEach(function (k) {
      var name = pickDisplayName(variants[k], entryCanon, k);
      nameByKey[k] = name;
      var slug = slugify(name);
      // Verified zero collisions across all 344 payees. The suffix is a
      // guard for a future ingest, not a live code path.
      if (usedSlug[slug] && usedSlug[slug] !== k) {
        var n = 2;
        while (usedSlug[slug + '-' + n]) n++;
        slug = slug + '-' + n;
      }
      usedSlug[slug] = k;
      slugByKey[k] = slug;
    });

    /* -- pass 2: the lines -- */
    var SEP = ' — ';
    store.sittings.forEach(function (s) {
      var rows = payments[s.m] || [];
      rows.forEach(function (row) {
        var raw = row[0], entry = String(row[1]), amt = row[2], cat = row[3];
        var key = normKey(raw), name = nameByKey[key], slug = slugByKey[key];

        // Split "Payee - description". 2,128 of 2,138 lines have the
        // separator; the 10 that don't are the payroll aggregates, which
        // views render whole.
        var d = '', pre = '';
        var at = entry.indexOf(SEP);
        if (at > -1) {
          var prefix = entry.slice(0, at).trim();
          d = entry.slice(at + SEP.length).trim();
          // Keep the prefix ONLY when it is real information. 235 lines
          // carry a trade name the payee field does not ("9534-8702
          // Quebec Inc. (Petro Canada)" / "Petro-Canada - Essence...").
          // Matching or containing prefixes are just the payee again.
          var pk = normKey(prefix), nk = normKey(name), rk = normKey(raw);
          if (pk && pk !== nk && pk !== rk &&
              nk.indexOf(pk) < 0 && pk.indexOf(nk) < 0 &&
              rk.indexOf(pk) < 0 && pk.indexOf(rk) < 0) pre = prefix;
        }

        var i = store.lines.length;
        store.lines.push({
          s: s.m, si: s.si,
          p: slug, raw: raw,
          e: entry, d: d, pre: pre,
          a: amt, c: cat,
          hay: ''            // filled below, once every spelling is known
        });
        store.bySitting[s.m].push(i);
        (store.byPayee[slug] = store.byPayee[slug] || []).push(i);
        (store.byCat[cat] = store.byCat[cat] || []).push(i);
      });
    });

    /* -- payees -- */
    Object.keys(slugByKey).forEach(function (key) {
      var slug = slugByKey[key], name = nameByKey[key];
      var idx = store.byPayee[slug] || [];
      var aliases = Object.keys(variants[key]).filter(function (v) { return v !== name; }).sort();
      var byCat = {}, seenSit = {}, sits = [], c = 0, maxLine = 0;
      idx.forEach(function (i) {
        var L = store.lines[i];
        c += cents(L.a);
        byCat[L.c] = byCat[L.c] || { amt: 0, lines: 0 };
        byCat[L.c].amt += cents(L.a);
        byCat[L.c].lines++;
        if (!seenSit[L.s]) { seenSit[L.s] = 1; sits.push(L.s); }
        if (Math.abs(L.a) > Math.abs(maxLine)) maxLine = L.a;
      });
      Object.keys(byCat).forEach(function (k) { byCat[k].amt = dollars(byCat[k].amt); });
      sits.sort();
      var P = {
        slug: slug, key: key, name: name, aliases: aliases,
        total: dollars(c), lines: idx.length,
        sittings: sits, nSittings: sits.length,
        byCat: byCat, first: sits[0] || '', last: sits[sits.length - 1] || '',
        maxLine: maxLine,
        isPayroll: isPayroll(name), isRest: isRest(name)
      };
      store.payees[slug] = P;
      store.payeeList.push(P);

      // The haystack: canonical name + every raw spelling + the full entry
      // text. Searching "petro" must reach the 311 lines whose payee reads
      // "9534-8702 Quebec Inc. (Petro Canada)". Category names are
      // deliberately absent - they have their own filter, and folding them
      // in would make one word return hundreds of unrelated lines.
      var nameHay = searchNorm(name + ' ' + aliases.join(' '));
      idx.forEach(function (i) {
        store.lines[i].hay = nameHay + ' ' + searchNorm(store.lines[i].e);
      });
    });
    store.payeeList.sort(function (a, b) { return b.total - a.total; });

    /* -- sitting reconciliation: itemized vs adopted, gap carried -- */
    var gcI = 0, gcA = 0;
    store.sittings.forEach(function (s) {
      var c = 0;
      store.bySitting[s.m].forEach(function (i) { c += cents(store.lines[i].a); });
      s.lineTotal = dollars(c);
      s.lineCount = store.bySitting[s.m].length;
      s.gap = dollars(cents(s.total) - c);
      s.reconciles = Math.abs(s.gap) <= s.tol;
      gcI += c; gcA += cents(s.total);
    });
    store.totals = {
      itemized: dollars(gcI),
      adopted: dollars(gcA),
      gap: dollars(gcA - gcI),
      lines: store.lines.length,
      payees: store.payeeList.length,
      sittings: store.sittings.length
    };

    /* -- categories -- */
    Object.keys(D.categories).forEach(function (key) {
      if (key === '__rest') return;
      var idx = store.byCat[key] || [];
      if (!idx.length) return;
      var c = 0, seen = {}, nP = 0, bySit = [];
      store.sittings.forEach(function () { bySit.push(0); });
      idx.forEach(function (i) {
        var L = store.lines[i];
        c += cents(L.a);
        bySit[L.si] += cents(L.a);
        if (!seen[L.p]) { seen[L.p] = 1; nP++; }
      });
      var C = {
        key: key, slug: SLUGS[key] || slugify(key),
        color: (D.categories[key] || {}).color || '#888888',
        total: dollars(c), lines: idx.length, nPayees: nP,
        bySitting: bySit.map(dollars)
      };
      store.categories.push(C);
      store.catByKey[key] = C;
    });
    store.categories.sort(function (a, b) { return b.total - a.total; });

    return store;
  }

  /* ------------------------------------------------------------
     FILTER / SORT / AGGREGATE - pure, operating on line indices.
     Never on line objects: sorting 2,138 integers is what keeps a
     keystroke under a frame on a phone.
     ------------------------------------------------------------ */

  // f = { q, sittings:[ids], categories:[keys], min, max, scope }
  function filterLines(store, f) {
    var out = [];
    var sitSet = null, catSet = null;
    if (f.sittings && f.sittings.length) {
      sitSet = {};
      f.sittings.forEach(function (s) { sitSet[s] = 1; });
    } else if (f.scope && f.scope !== 'all') {
      sitSet = {};
      store.sittings.forEach(function (s) { if (s.year === f.scope) sitSet[s.m] = 1; });
    }
    if (f.categories && f.categories.length) {
      catSet = {};
      f.categories.forEach(function (c) { catSet[c] = 1; });
    }
    var toks = f.q ? searchNorm(f.q).split(' ').filter(Boolean) : [];
    var hasMin = f.min != null && f.min !== '' && isFinite(f.min);
    var hasMax = f.max != null && f.max !== '' && isFinite(f.max);
    var mn = hasMin ? Number(f.min) : 0, mx = hasMax ? Number(f.max) : 0;

    for (var i = 0; i < store.lines.length; i++) {
      var L = store.lines[i];
      if (sitSet && !sitSet[L.s]) continue;          // cheapest first
      if (catSet && !catSet[L.c]) continue;
      if (hasMin && L.a < mn) continue;
      if (hasMax && L.a > mx) continue;
      if (toks.length) {
        var ok = true;
        for (var t = 0; t < toks.length; t++) {
          if (L.hay.indexOf(toks[t]) < 0) { ok = false; break; }
        }
        if (!ok) continue;
      }
      out.push(i);
    }
    return out;
  }

  function aggregate(store, indices) {
    var c = 0, seenP = {}, seenS = {}, nP = 0, nS = 0, byCat = {};
    for (var i = 0; i < indices.length; i++) {
      var L = store.lines[indices[i]];
      c += cents(L.a);
      byCat[L.c] = (byCat[L.c] || 0) + cents(L.a);
      if (!seenP[L.p]) { seenP[L.p] = 1; nP++; }
      if (!seenS[L.s]) { seenS[L.s] = 1; nS++; }
    }
    var mix = Object.keys(byCat).map(function (k) { return { key: k, amt: dollars(byCat[k]) }; })
      .sort(function (a, b) { return b.amt - a.amt; });
    return { total: dollars(c), lines: indices.length, payees: nP, sittings: nS, mix: mix };
  }

  // sort = "field:dir". `names` supplies the language-dependent strings
  // (display payee, category name) so this file stays i18n-free.
  function sortIndices(store, indices, sort, names) {
    names = names || {};
    var parts = String(sort || 'amount:desc').split(':');
    var field = parts[0], dir = parts[1] === 'asc' ? 1 : -1;
    var coll = { payee: 1, category: 1, description: 1 };
    var cmp;
    if (field === 'sitting') {
      cmp = function (a, b) { return (store.lines[a].si - store.lines[b].si) * dir; };
    } else if (coll[field]) {
      var val = function (i) {
        var L = store.lines[i];
        if (field === 'payee') return names.payee ? names.payee(L) : L.raw;
        if (field === 'category') return names.category ? names.category(L.c) : L.c;
        return L.d || L.e;
      };
      cmp = function (a, b) {
        return String(val(a)).localeCompare(String(val(b)), names.locale || 'fr-CA',
          { sensitivity: 'base', numeric: true }) * dir;
      };
    } else {
      cmp = function (a, b) { return (store.lines[a].a - store.lines[b].a) * dir; };
    }
    // Stable tiebreak on amount then index, so equal keys never reshuffle
    // between renders (which reads as the table flickering).
    return indices.slice().sort(function (a, b) {
      var r = cmp(a, b); if (r) return r;
      r = store.lines[b].a - store.lines[a].a; if (r) return r;
      return a - b;
    });
  }

  global.OO_LEDGER = {
    tpl: tpl, normKey: normKey, searchNorm: searchNorm,
    SLUGS: SLUGS, KEY_BY_SLUG: KEY_BY_SLUG,
    isPayroll: isPayroll, isRest: isRest, tol: tol,
    csvEscape: csvEscape, buildCSV: buildCSV,
    cents: cents, dollars: dollars, sum: sum,
    slugify: slugify, liftHex: liftHex,
    build: build, filterLines: filterLines, aggregate: aggregate, sortIndices: sortIndices
  };
})(typeof window !== 'undefined' ? window : this);
