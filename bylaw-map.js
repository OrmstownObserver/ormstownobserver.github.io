/* ============================================================
   Ormstown Observer — bylaw map (EN + FR hub pages)
   ------------------------------------------------------------
   The "Find the rule that applies to you" map at the top of
   /en/bylaws-regulations/ and /fr/bylaws-regulations/. Readers
   answer one question per step; each answer opens the next column
   to the right (on phones, the next step below), and the last one
   names the bylaws that apply.

   DATA — two files, fetched together:
     /bylaw-map.json     hand-authored questions (see its "about")
     /dist/bylaws.json   the register snapshot (bylaws-register.js
                         reads the same file)
   The map names bylaws only by bylaw_number. Number, title, status,
   official link and explainer link always come from the snapshot,
   so the map can never disagree with the register. A map item whose
   bylaw is missing from the snapshot, or repealed, is skipped.

   SAFETY — same rules as bylaws-register.js: textContent only, no
   innerHTML anywhere. Official links must be https on an allowlisted
   host; Observer links must be same-site /en/ or /fr/ paths.

   Without JavaScript, or if either file fails to load, the section
   stays hidden and the register below works on its own.
   ============================================================ */
(function (global) {
  'use strict';

  var MAP_URL = '/bylaw-map.json';
  var DATA_URL = '/dist/bylaws.json';
  var doc = global.document;
  var lang = /\/fr\//.test(global.location.pathname) ? 'fr' : 'en';

  // Kept in step with bylaws-register.js.
  var OFFICIAL_HOSTS = { 'www.ormstown.ca': 1, 'ormstown.ca': 1, 'drive.google.com': 1, 'docs.google.com': 1, 'www.mrchsl.com': 1, 'mrchsl.com': 1 };

  var UI = {
    en: {
      start: 'Start here', step: 'Step', result: 'Result', applies: 'What applies', subject: 'Bylaws on this subject',
      nudgeFirst: 'Choose the one closest to your situation.', nudge: 'Choose one to continue.',
      explainers: function (n) { return n === 1 ? '1 explainer' : n + ' explainers'; },
      explainer: 'Read the Observer explainer', coverage: 'Observer coverage', official: 'Official document',
      noExplainer: 'No plain-language explainer yet.', noOfficial: 'No official link recorded yet.',
      notQuite: 'Not quite it? Choose another box, or ', searchAll: 'search the full register', end: '.',
      disclaim: 'Unofficial public-interest summary. The French text published by the municipality is the authoritative version. Not legal advice.',
      whole: 'See every path', hideWhole: 'Hide every path',
      status: { 'In force': ['st-in', 'In force'], 'Amended': ['st-am', 'In force, amended'], 'Draft': ['st-draft', 'Draft'] }
    },
    fr: {
      start: 'Départ', step: 'Étape', result: 'Résultat', applies: 'Ce qui s’applique', subject: 'Règlements sur ce sujet',
      nudgeFirst: 'Choisissez ce qui se rapproche le plus de votre situation.', nudge: 'Faites un choix pour continuer.',
      explainers: function (n) { return n === 1 ? '1 explicateur' : n + ' explicateurs'; },
      explainer: 'Lire l’explicateur de l’Observer', coverage: 'Couverture de l’Observer', official: 'Document officiel',
      noExplainer: 'Pas encore d’explicateur en langage clair.', noOfficial: 'Aucun lien officiel consigné pour l’instant.',
      notQuite: 'Ce n’est pas tout à fait ça ? Choisissez une autre case, ou ', searchAll: 'cherchez dans le registre complet', end: '.',
      disclaim: 'Résumé non officiel d’intérêt public. Le texte français publié par la Municipalité fait autorité. Pas un avis juridique.',
      whole: 'Voir tous les parcours', hideWhole: 'Masquer les parcours',
      status: { 'In force': ['st-in', 'En vigueur'], 'Amended': ['st-am', 'En vigueur, modifié'], 'Draft': ['st-draft', 'Projet'] }
    }
  }[lang];

  /* ---------- small helpers ---------- */
  function $(id) { return doc.getElementById(id); }
  function el(tag, cls, text) {
    var n = doc.createElement(tag);
    if (cls) n.setAttribute('class', cls);
    if (text != null) n.textContent = String(text);
    return n;
  }
  function add(parent, child) { parent.appendChild(child); return child; }
  function str(v) { return v == null ? '' : String(v).trim(); }
  function tr(o) { return o && typeof o === 'object' ? str(o[lang]) : ''; }
  function officialHref(url) {
    url = str(url);
    var m = /^https:\/\/([^\/?#:]+)(?:[\/?#]|$)/i.exec(url);
    return m && OFFICIAL_HOSTS[m[1].toLowerCase()] ? url : null;
  }
  function observerHref(path) {
    path = str(path);
    return /^\/(en|fr)\/[a-z0-9\-\/]*$/i.test(path) && path.indexOf('//') < 0 ? path : null;
  }
  function isCoverage(path) { return /\/(council-watch|conseil-municipal)\//.test(path); }
  function reducedMotion() {
    try { return !!(global.matchMedia && global.matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  }

  /* ---------- state ---------- */
  var root = null, byNumber = {}, byId = {}, parentOf = {};
  var path = [];
  var refs = [];   // [{ chosen: buttonEl|null, targets: [el] }] per drawn step, for the wires

  function index(node, parent) {
    (node.children || []).forEach(function (c) {
      byId[c.id] = c; parentOf[c.id] = parent;
      index(c, c.id);
    });
  }
  function pathTo(id) { var p = []; while (id) { p.unshift(id); id = parentOf[id]; } return p; }

  // Only bylaws the snapshot has, and never a repealed one.
  function itemsOf(node) {
    return ((node.answer && node.answer.items) || []).filter(function (it) {
      var r = byNumber[str(it.bylaw)];
      return r && UI.status[str(r.status)];
    });
  }
  function explainerOf(r) {
    var p = observerHref(r.explainer && r.explainer[lang]);
    return p && !isCoverage(p) ? p : null;
  }
  function explainersUnder(node) {
    var seen = {};
    (function walk(n) {
      itemsOf(n).forEach(function (it) { if (explainerOf(byNumber[str(it.bylaw)])) seen[str(it.bylaw)] = 1; });
      (n.children || []).forEach(walk);
    })(node);
    return Object.keys(seen).length;
  }

  /* ---------- the map ---------- */
  // Desktop: a "Start here" circle, then one column per step left to right,
  // then the answer. Phones (stylesheet, under 760px): the same steps stacked
  // as an indented tree. One DOM serves both.
  function narrow() {
    try { return !!(global.matchMedia && global.matchMedia('(max-width: 760px)').matches); } catch (e) { return false; }
  }

  function render(moved) {
    var map = $('bmap-map');
    map.textContent = '';
    refs = [];
    var track = add(map, el('div', 'bmap-track'));
    var start = add(track, el('div', 'bmap-root', UI.start));
    start.setAttribute('aria-hidden', 'true');
    var node = root, d = 0, last = null, lastFocus = null, prevChosen = start;

    while (node.children && node.children.length) {
      var chosen = path[d] || '';
      var lv = add(track, el('section', 'bmap-level bmap-d' + Math.min(d, 3) + (chosen ? ' is-decided' : ' is-open')));
      var lab = add(lv, el('div', 'bmap-label'));
      add(lab, el('span', 'bmap-n', UI.step + ' ' + (d + 1)));
      var q = add(lab, el('span', 'bmap-q', tr(node.prompt)));
      q.setAttribute('id', 'bmap-q' + d);
      var row = add(lv, el('div', 'bmap-row'));
      row.setAttribute('role', 'group');
      row.setAttribute('aria-labelledby', 'bmap-q' + d);

      var step = { chosen: prevChosen, targets: [] }, onBtn = null;
      node.children.forEach(function (c) {
        var b = add(row, el('button', 'bmap-node' + (c.id === chosen ? ' is-on' : '')));
        b.setAttribute('type', 'button');
        b.setAttribute('aria-pressed', String(c.id === chosen));
        add(b, el('span', 'bmap-lbl', tr(c.label)));
        if (tr(c.hint)) add(b, el('span', 'bmap-hint', tr(c.hint)));
        var end = add(b, el('span', 'bmap-end'));
        var n = explainersUnder(c);
        if (n) add(end, el('span', 'bmap-count', UI.explainers(n)));
        add(end, el('span', 'bmap-arrow', c.children ? '›' : '→')).setAttribute('aria-hidden', 'true');
        var depth = d;
        b.addEventListener('click', function () { pick(depth, c.id); });
        step.targets.push(b);
        if (c.id === chosen) onBtn = b;
      });
      refs.push(step);
      last = lv;
      if (!chosen || !byId[chosen]) {
        add(lv, el('p', 'bmap-nudge', d === 0 ? UI.nudgeFirst : UI.nudge));
        lastFocus = step.targets[0];
        break;
      }
      prevChosen = onBtn;
      node = byId[chosen];
      d++;
    }

    if (node !== root && !(node.children && node.children.length)) {
      var res = add(track, el('section', 'bmap-level bmap-result bmap-d' + Math.min(d, 3)));
      var rl = add(res, el('div', 'bmap-label'));
      add(rl, el('span', 'bmap-n', UI.result));
      // A top-level subject that goes straight to a list has no question to answer.
      add(rl, el('span', 'bmap-q', path.length === 1 ? UI.subject : UI.applies));
      var answer = add(res, renderAnswer(node));
      refs.push({ chosen: prevChosen, targets: [answer] });
      last = res;
      lastFocus = answer.firstChild;
    }

    renderTrail();
    var reset = $('bmap-reset'); if (reset) reset.hidden = !path.length;
    var raf = global.requestAnimationFrame || function (f) { f(); };
    raf(drawWires);
    if (moved) {
      if (narrow()) {
        if (last && last.scrollIntoView) {
          try { last.scrollIntoView({ block: 'nearest', behavior: reducedMotion() ? 'auto' : 'smooth' }); } catch (e) { last.scrollIntoView(); }
        }
      } else if ('scrollLeft' in map) {
        // keep the newest column in view; back at the start, show the start
        map.scrollLeft = path.length ? map.scrollWidth : 0;
      }
      if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) { lastFocus.focus(); } }
    }
  }

  function pick(depth, id) {
    if (path[depth] === id) return;
    path = path.slice(0, depth).concat(id);
    render(true);
  }

  // "Start here › Your house & lot › Trees & land": every earlier step is a
  // button that goes back to it. Useful once the first columns scroll away.
  function renderTrail() {
    var trail = $('bmap-trail'); if (!trail) return;
    trail.textContent = '';
    trail.hidden = !path.length;
    var steps = [UI.start].concat(path.map(function (id) { return tr(byId[id].label); }));
    steps.forEach(function (text, i) {
      if (i) add(trail, el('span', 'bmap-sep', '›')).setAttribute('aria-hidden', 'true');
      if (i === steps.length - 1) { add(trail, el('span', 'bmap-here', text)).setAttribute('aria-current', 'step'); return; }
      var b = add(trail, el('button', 'linkbtn', text));
      b.setAttribute('type', 'button');
      b.addEventListener('click', function () { path = path.slice(0, i); render(true); });
    });
  }

  function renderAnswer(node) {
    var box = el('article', 'bmap-answer');
    var h = add(box, el('h3', null, tr(node.label)));
    h.setAttribute('tabindex', '-1');
    if (node.answer && tr(node.answer.intro)) add(box, el('p', 'bmap-intro', tr(node.answer.intro)));
    var laws = add(box, el('div', 'bmap-laws'));
    itemsOf(node).forEach(function (it) {
      var r = byNumber[str(it.bylaw)];
      var law = add(laws, el('section', 'bmap-law'));
      var top = add(law, el('div', 'bmap-law-top'));
      add(top, el('span', 'bmap-num', r.bylaw_number));
      var st = UI.status[str(r.status)];
      add(top, el('span', 'status ' + st[0], st[1]));
      add(law, el('p', 'bmap-title', lang === 'fr' ? (str(r.title_fr) || str(r.title_en)) : (str(r.title_en) || str(r.title_fr))));
      if (lang === 'en' && str(r.title_fr)) {
        var alt = add(law, el('p', 'bmap-alt', str(r.title_fr)));
        alt.setAttribute('lang', 'fr');
      }
      var points = it.points && Array.isArray(it.points[lang]) ? it.points[lang].map(str).filter(Boolean) : [];
      if (points.length) {
        var ul = add(law, el('ul', 'bmap-points'));
        points.forEach(function (p) { add(ul, el('li', null, p)); });
      }
      var acts = add(law, el('p', 'bmap-acts'));
      var ex = explainerOf(r);
      if (ex) { var a = add(acts, el('a', 'btn', UI.explainer + ' →')); a.setAttribute('href', ex); }
      var cov = observerHref(r.explainer && r.explainer[lang]);
      if (!ex && cov) { var c = add(acts, el('a', 'btn ghost', UI.coverage + ' →')); c.setAttribute('href', cov); }
      var extra = it.link && observerHref(tr(it.link.href));
      if (extra && tr(it.link.label)) { var l = add(acts, el('a', 'btn ghost', tr(it.link.label) + ' →')); l.setAttribute('href', extra); }
      var off = officialHref(r.official_url);
      if (off) {
        var o = add(acts, el('a', ex ? 'btn ghost' : 'btn', UI.official + ' ↗'));
        o.setAttribute('href', off); o.setAttribute('target', '_blank'); o.setAttribute('rel', 'noopener');
      }
      var notes = [];
      if (!ex) notes.push(UI.noExplainer);
      if (!off) notes.push(UI.noOfficial);
      if (notes.length) add(law, el('p', 'bmap-note', notes.join(' ')));
    });
    var after = add(box, el('p', 'bmap-after'));
    after.appendChild(doc.createTextNode(UI.notQuite));
    var s = add(after, el('button', 'linkbtn', UI.searchAll));
    s.setAttribute('type', 'button');
    s.addEventListener('click', function () {
      var input = $('search');
      if (!input) return;
      if (input.scrollIntoView) { try { input.scrollIntoView({ block: 'center' }); } catch (e) { input.scrollIntoView(); } }
      if (input.focus) input.focus();
    });
    after.appendChild(doc.createTextNode(UI.end));
    add(box, el('p', 'bmap-disclaim', UI.disclaim));
    return box;
  }

  // Curved wires, red along the reader's path. Wide screens: from the chosen
  // box in one column to every box in the next (from the "Start here" circle
  // into the first), and from the last choice into the answer. Narrow screens
  // (stylesheet, under 760px): the steps stack as an indented tree, and each
  // wire drops from the chosen box down the gutter and curves into a box of
  // the step below.
  function drawWires() {
    var map = $('bmap-map');
    var track = map && map.getElementsByClassName('bmap-track')[0];
    if (!track || !doc.createElementNS || !track.getBoundingClientRect) return;
    var old = track.getElementsByClassName('bmap-wires')[0];
    if (old) old.parentNode.removeChild(old);
    var svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'bmap-wires');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    track.insertBefore(svg, track.firstChild);
    if (global.getComputedStyle && global.getComputedStyle(svg).display === 'none') return;
    var down = narrow();
    var box = track.getBoundingClientRect();
    function path(d, hot) {
      var p = doc.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', d);
      if (hot) p.setAttribute('class', 'is-hot');
      svg.appendChild(p);
    }
    function across(from, to, hot) {
      var a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
      var round = /\bbmap-root\b/.test(from.getAttribute('class'));
      var x1 = a.right - box.left, y1 = a.top - box.top + (round ? a.height / 2 : Math.min(a.height / 2, 26));
      var x2 = b.left - box.left, y2 = b.top - box.top + Math.min(b.height / 2, 26);
      var dx = (x2 - x1) / 2;
      path('M' + x1 + ',' + y1 + ' C' + (x1 + dx) + ',' + y1 + ' ' + (x2 - dx) + ',' + y2 + ' ' + x2 + ',' + y2, hot);
    }
    // In the narrow tree the answer card runs full width, so its wire lands on
    // the "Result" label, which sits indented like a further step.
    function landing(t) {
      if (!/\bbmap-answer\b/.test(t.getAttribute('class'))) return t;
      return t.parentNode.getElementsByClassName('bmap-label')[0] || t;
    }
    // Out of the chosen box's left edge, down the margin to the left of every
    // box in its step, then a curve into the left edge of a box one step in.
    function downward(from, to, hot) {
      var a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
      var gx = a.left - box.left - 8, sx = a.left - box.left, sy = a.top - box.top + Math.min(a.height / 2, 22);
      var x2 = b.left - box.left, y2 = b.top - box.top + Math.min(b.height / 2, 22);
      path('M' + sx + ',' + sy + ' Q' + gx + ',' + sy + ' ' + gx + ',' + (sy + 8) +
           ' L' + gx + ',' + (y2 - 14) + ' C' + gx + ',' + y2 + ' ' + gx + ',' + y2 + ' ' + x2 + ',' + y2, hot);
    }
    refs.forEach(function (step) {
      if (!step.chosen) return;
      if (down && /\bbmap-root\b/.test(step.chosen.getAttribute('class'))) return;
      var isHot = function (t) { return /\b(is-on|bmap-answer)\b/.test(t.getAttribute('class')); };
      // grey wires first, so the red one is never painted over
      step.targets.filter(function (t) { return !isHot(t); }).concat(step.targets.filter(isHot)).forEach(function (t) {
        if (down) downward(step.chosen, landing(t), isHot(t)); else across(step.chosen, t, isHot(t));
      });
    });
  }

  /* ---------- every path, as a list ---------- */
  function renderOutline() {
    var list = $('bmap-tree'); if (!list) return;
    list.textContent = '';
    (function walk(node, ul) {
      (node.children || []).forEach(function (c) {
        var li = add(ul, el('li'));
        var b = add(li, el('button', c.children ? 'bmap-t-branch' : 'bmap-t-leaf', tr(c.label)));
        b.setAttribute('type', 'button');
        b.addEventListener('click', function () { path = pathTo(c.id); render(true); });
        if (!c.children) {
          var nums = itemsOf(c).map(function (it) { return str(it.bylaw).replace(/^(Projet de règlement|Règlement d'emprunt|Règlement)\s+/, ''); });
          if (nums.length) add(li, el('span', 'bmap-t-nums', nums.join(' · ')));
        }
        if (c.children) walk(c, add(li, el('ul')));
      });
    })(root, list);
  }

  /* ---------- boot ---------- */
  function wire() {
    var reset = $('bmap-reset');
    if (reset) reset.addEventListener('click', function () { path = []; render(true); });
    var whole = $('bmap-whole'), outline = $('bmap-outline');
    if (whole && outline) {
      whole.textContent = UI.whole;
      whole.addEventListener('click', function () {
        var open = outline.hidden;
        outline.hidden = !open;
        whole.setAttribute('aria-expanded', String(open));
        whole.textContent = open ? UI.hideWhole : UI.whole;
      });
    }
    var timer = null;
    if (global.addEventListener) global.addEventListener('resize', function () {
      clearTimeout(timer); timer = setTimeout(drawWires, 80);
    });
    if (doc.fonts && doc.fonts.ready && doc.fonts.ready.then) doc.fonts.ready.then(drawWires);
  }

  function init(results) {
    var map = results[0], data = results[1];
    if (!map || !map.root || !Array.isArray(map.root.children) || !map.root.children.length) throw new Error('bylaw-map.json has no root');
    if (!data || !Array.isArray(data.records)) throw new Error('bylaws.json has no records array');
    root = map.root;
    data.records.forEach(function (r) { if (r && str(r.bylaw_number)) byNumber[str(r.bylaw_number)] = r; });
    index(root, null);
    wire();
    renderOutline();
    render(false);
    var section = $('bylaw-map'); if (section) section.hidden = false;
  }

  // Exposed for the regression test only; the page never reads it.
  global.OO_BYLAW_MAP = { officialHref: officialHref, observerHref: observerHref, path: function () { return path.slice(); } };

  if (typeof global.fetch !== 'function' || typeof global.Promise !== 'function') return;
  function get(url) {
    return global.fetch(url, { cache: 'no-store' }).then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    });
  }
  global.Promise.all([get(MAP_URL), get(DATA_URL)]).then(init).catch(function () {
    var section = $('bylaw-map'); if (section) section.hidden = true;
  });
})(window);
