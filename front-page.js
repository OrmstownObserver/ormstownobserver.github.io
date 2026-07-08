/* Front-page renderer — fills the homepage story slots from /front-page.json,
   which is generated from the Notion Articles database (Front Page Slot field).
   The static markup in index.html is the permanent fallback: any fetch/parse
   error leaves the page untouched. Builds DOM via textContent only — never
   innerHTML — because the JSON text originates from a CMS. */
(function () {
  'use strict';

  var SVG_NS = 'http://www.w3.org/2000/svg';

  /* Icon shapes are whitelisted here and keyed by the JSON `icon` field;
     the JSON can never inject markup. Same 24x24 stroke style as the
     hand-authored rail icons. */
  var ICONS = {
    investigation: [
      ['circle', { cx: '10.5', cy: '10.5', r: '6.5' }],
      ['line', { x1: '15.5', y1: '15.5', x2: '21', y2: '21' }]
    ],
    council: [
      ['rect', { x: '3', y: '10', width: '18', height: '11', rx: '1' }],
      ['polyline', { points: '3 10 12 3 21 10' }],
      ['line', { x1: '9', y1: '21', x2: '9', y2: '14' }],
      ['line', { x1: '15', y1: '21', x2: '15', y2: '14' }]
    ],
    bylaws: [
      ['path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }],
      ['polyline', { points: '14 2 14 8 20 8' }],
      ['line', { x1: '8', y1: '13', x2: '16', y2: '13' }],
      ['line', { x1: '8', y1: '17', x2: '12', y2: '17' }]
    ],
    editorial: [
      ['path', { d: 'M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z' }]
    ],
    notice: [
      ['path', { d: 'M3 11l18-5v12L3 14v-3z' }],
      ['path', { d: 'M11.6 16.8a3 3 0 1 1-5.8-1.6' }]
    ]
  };
  ICONS['default'] = ICONS.bylaws;

  var EMOJI = {
    investigation: '🔍',
    council: '🏛',
    bylaws: '📋',
    editorial: '✍️',
    notice: '📢'
  };

  function isFr() {
    return document.documentElement.classList.contains('lang-fr');
  }

  function el(tag, cls, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (parent) parent.appendChild(e);
    return e;
  }

  /* Appends the standard <span data-en>/<span data-fr> pair; the existing
     language CSS shows/hides them. Missing FR falls back to EN. */
  function biSpan(parent, en, fr) {
    var a = document.createElement('span');
    a.setAttribute('data-en', '');
    a.textContent = en == null ? '' : String(en);
    var b = document.createElement('span');
    b.setAttribute('data-fr', '');
    b.textContent = fr == null || fr === '' ? (en == null ? '' : String(en)) : String(fr);
    parent.appendChild(a);
    parent.appendChild(b);
    return parent;
  }

  function validPath(p) {
    return typeof p === 'string' && /^\/[^\s]*$/.test(p) && p.indexOf('//') !== 0;
  }

  function validImg(img) {
    return img && typeof img.src === 'string' && /^\/images\/[A-Za-z0-9._-]+$/.test(img.src);
  }

  function imgPos(img) {
    var p = img && img.position;
    return typeof p === 'string' && /^[a-z0-9% .-]+$/i.test(p) ? p : 'center';
  }

  function validStory(s) {
    return s && typeof s.hed_en === 'string' && s.hed_en && validPath(s.path_en);
  }

  function setHrefs(a, s) {
    var en = s.path_en;
    var fr = validPath(s.path_fr) ? s.path_fr : en;
    a.setAttribute('data-href-en', en);
    a.setAttribute('data-href-fr', fr);
    a.setAttribute('href', isFr() ? fr : en);
  }

  /* aria-labels can't use the data-en/data-fr CSS trick, so both values are
     stashed as attributes and re-synced whenever the language toggles. */
  function setAria(node, en, fr) {
    if (!en && !fr) return;
    node.setAttribute('data-aria-en', en || fr);
    node.setAttribute('data-aria-fr', fr || en);
    node.setAttribute('aria-label', isFr() ? (fr || en) : (en || fr));
  }

  function syncAria() {
    var fr = isFr();
    document.querySelectorAll('[data-aria-en]').forEach(function (n) {
      var v = fr ? n.getAttribute('data-aria-fr') : n.getAttribute('data-aria-en');
      if (v) n.setAttribute('aria-label', v);
    });
  }

  function svgIcon(key) {
    var spec = ICONS[key] || ICONS['default'];
    var svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    spec.forEach(function (part) {
      var n = document.createElementNS(SVG_NS, part[0]);
      var attrs = part[1];
      for (var k in attrs) {
        if (Object.prototype.hasOwnProperty.call(attrs, k)) n.setAttribute(k, attrs[k]);
      }
      svg.appendChild(n);
    });
    return svg;
  }

  function labelWithEmoji(s, lang) {
    var label = lang === 'fr' ? (s.label_fr || s.label_en || '') : (s.label_en || '');
    var emoji = EMOJI[s.icon];
    return emoji ? emoji + ' ' + label : label;
  }

  function joinParts(a, b) {
    return [a, b].filter(Boolean).join(' · ');
  }

  function clearChildren(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function applyBackground(node, img) {
    node.style.backgroundImage = 'url("' + img.src + '")';
    node.style.backgroundPosition = imgPos(img);
    node.style.backgroundSize = 'cover';
    node.style.backgroundRepeat = 'no-repeat';
  }

  function renderHero(s) {
    if (!validStory(s) || !validImg(s.image)) return;
    var a = document.querySelector('a.hero-main');
    var content = a && a.querySelector('.hero-content');
    if (!content) return;

    setHrefs(a, s);
    applyBackground(a, s.image);
    setAria(a, s.cta_en || s.hed_en, s.cta_fr || s.hed_fr);

    var frag = document.createDocumentFragment();
    var eyebrow = el('div', 'hero-eyebrow');
    biSpan(eyebrow, joinParts(labelWithEmoji(s, 'en'), s.meta_en), joinParts(labelWithEmoji(s, 'fr'), s.meta_fr));
    frag.appendChild(eyebrow);
    var h1 = el('h1', 'hero-headline');
    biSpan(h1, s.hed_en, s.hed_fr);
    frag.appendChild(h1);
    if (s.deck_en) {
      var deck = el('p', 'hero-deck');
      biSpan(deck, s.deck_en, s.deck_fr);
      frag.appendChild(deck);
    }
    var cta = el('span', 'hero-cta');
    biSpan(cta, s.cta_en || 'Read more →', s.cta_fr || 'Lire la suite →');
    frag.appendChild(cta);

    var gradient = a.querySelector('.hero-gradient');
    clearChildren(content);
    content.appendChild(frag);
    if (gradient && gradient.parentNode !== a) a.insertBefore(gradient, content);
  }

  function renderRail(list) {
    if (!Array.isArray(list) || !list.length) return;
    var rail = document.querySelector('.hero-rail');
    if (!rail) return;
    var items = [];
    list.slice(0, 3).forEach(function (s) {
      if (!validStory(s)) return;
      var a = el('a', 'rail-item');
      setHrefs(a, s);
      var icon = el('div', 'rail-icon', a);
      icon.setAttribute('aria-hidden', 'true');
      icon.appendChild(svgIcon(s.icon));
      var body = el('div', 'rail-body', a);
      biSpan(el('div', 'rail-label', body), s.label_en, s.label_fr);
      biSpan(el('div', 'rail-hed', body), s.hed_en, s.hed_fr);
      biSpan(el('div', 'rail-date', body), s.meta_en, s.meta_fr);
      items.push(a);
    });
    if (!items.length) return;
    clearChildren(rail);
    items.forEach(function (a) { rail.appendChild(a); });
  }

  function renderCards(list) {
    if (!Array.isArray(list) || !list.length) return;
    var wrap = document.querySelector('.latest-stories');
    if (!wrap) return;
    var items = [];
    list.slice(0, 3).forEach(function (s) {
      if (!validStory(s) || !validImg(s.image)) return;
      var a = el('a', 'story-card');
      setHrefs(a, s);
      var thumb = el('div', 'story-thumb', a);
      thumb.setAttribute('role', 'img');
      applyBackground(thumb, s.image);
      setAria(thumb, s.image.alt_en, s.image.alt_fr);
      var body = el('div', 'story-body', a);
      biSpan(el('div', 'story-label', body), labelWithEmoji(s, 'en'), labelWithEmoji(s, 'fr'));
      biSpan(el('div', 'story-hed', body), s.hed_en, s.hed_fr);
      biSpan(el('div', 'story-date', body), s.meta_en, s.meta_fr);
      biSpan(el('span', 'story-cta', body), s.cta_en || 'Read more →', s.cta_fr || 'Lire la suite →');
      items.push(a);
    });
    if (!items.length) return;
    clearChildren(wrap);
    items.forEach(function (a) { wrap.appendChild(a); });
  }

  function renderLatest(list) {
    if (!Array.isArray(list) || !list.length) return;
    var col = document.querySelector('.latest-col');
    if (!col) return;
    var items = [];
    list.slice(0, 12).forEach(function (s) {
      if (!validStory(s)) return;
      var a = el('a', 'lat-item');
      setHrefs(a, s);
      biSpan(el('span', 'lat-cat', a), s.label_en, s.label_fr);
      biSpan(el('span', 'lat-hed', a), s.hed_en, s.hed_fr);
      items.push(a);
    });
    if (!items.length) return;
    /* Remove only the static list items; #pn-teaser (public-notices feed)
       and the column head stay untouched. */
    col.querySelectorAll('a.lat-item').forEach(function (n) {
      if (!n.closest('#pn-teaser')) n.parentNode.removeChild(n);
    });
    items.forEach(function (a) { col.appendChild(a); });
  }

  function wrapLangToggles() {
    ['obsSetLang', 'setObserverLang'].forEach(function (name) {
      var original = window[name];
      if (typeof original === 'function' && !original._fpWrapped) {
        var wrapped = function (lang) {
          original(lang);
          try { syncAria(); } catch (e) {}
        };
        wrapped._fpWrapped = true;
        window[name] = wrapped;
      }
    });
  }

  fetch('/front-page.json')
    .then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.json();
    })
    .then(function (data) {
      if (!data || data.version !== 1) return;
      try { renderHero(data.hero); } catch (e) {}
      try { renderRail(data.rail); } catch (e) {}
      try { renderCards(data.cards); } catch (e) {}
      try { renderLatest(data.latest); } catch (e) {}
      try { syncAria(); } catch (e) {}
      try { wrapLangToggles(); } catch (e) {}
    })
    .catch(function () { /* keep static fallback */ });
})();
