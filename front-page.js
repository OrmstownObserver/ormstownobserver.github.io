/* Front-page renderer — fills the homepage story slots from /front-page.json,
   which is generated from the Notion Articles database (Front Page Slot field).
   The static markup in index.html is the permanent fallback: any fetch/parse
   error leaves the page untouched. Builds DOM via textContent only — never
   innerHTML — because the JSON text originates from a CMS. */
(function () {
  'use strict';


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

  /* One row of the Latest list. Numbered files lead with "Part n"; everything
     else keeps the section label it always had. */
  function latItem(s, showPart) {
    var a = el('a', 'lat-item');
    setHrefs(a, s);
    if (showPart && s.part != null) {
      biSpan(el('span', 'lat-part', a), 'Part ' + s.part, 'Partie ' + s.part);
    } else {
      biSpan(el('span', 'lat-cat', a), s.label_en, s.label_fr);
    }
    biSpan(el('span', 'lat-hed', a), s.hed_en, s.hed_fr);
    return a;
  }

  /* Grouped-by-file rendering (front-page.json v2). Falls back to the flat list
     when the feed predates grouping, so the renderer and the builder can ship
     independently without ever leaving a blank column. */
  function buildGroups(groups) {
    var out = [];
    groups.forEach(function (g) {
      if (!g || !Array.isArray(g.items) || !g.items.length) return;
      var wrap = el('div', 'lat-group');
      var showPart = g.items.every(function (i) { return i.part != null; });
      if (g.file) {
        var head = el('div', 'lat-group-head', wrap);
        biSpan(el('span', 'lat-file', head), g.file, g.file_fr || g.file);
        if (g.status_en) {
          var open = g.status_en === 'Open';
          var st = el('span', 'lat-status' + (open ? ' is-open' : ''), head);
          var n = g.total || g.items.length;
          biSpan(st,
            g.status_en + ' · ' + n + (n === 1 ? ' part' : ' parts'),
            (g.status_fr || g.status_en) + ' · ' + n + (n === 1 ? ' partie' : ' parties'));
          /* Progress ticks only where the count means something — a finished
             file. An open file has no known total to measure against. */
          if (showPart && !open && n > 1) {
            var prog = el('span', 'lat-prog', head);
            prog.setAttribute('aria-hidden', 'true');
            for (var i = 0; i < n; i++) el('i', 'on', prog);
          }
        }
      }
      g.items.forEach(function (s) {
        if (!validStory(s)) return;
        wrap.appendChild(latItem(s, showPart));
      });
      if (wrap.querySelector('a.lat-item')) out.push(wrap);
    });
    return out;
  }

  function renderLatest(list, groups) {
    var col = document.querySelector('.latest-col');
    if (!col) return;
    var nodes = [];
    if (Array.isArray(groups) && groups.length) {
      nodes = buildGroups(groups);
    } else if (Array.isArray(list) && list.length) {
      list.slice(0, 12).forEach(function (s) {
        if (!validStory(s)) return;
        nodes.push(latItem(s, false));
      });
    }
    if (!nodes.length) return;
    /* Remove only the static list items and any previous groups; #pn-teaser
       (public-notices feed) and the column head stay untouched. */
    col.querySelectorAll('a.lat-item').forEach(function (n) {
      if (!n.closest('#pn-teaser')) n.parentNode.removeChild(n);
    });
    col.querySelectorAll('.lat-group').forEach(function (n) { n.parentNode.removeChild(n); });
    nodes.forEach(function (n) { col.appendChild(n); });
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
      /* Accept any v1+ feed. This used to be a hard `!== 1`, so bumping the
         builder to v2 for grouped Latest silently bailed out of the whole
         render and left every zone showing static fallback markup. The
         renderer is defensive per-zone anyway (each render is try/caught and
         validates its own fields), so a version floor is the right check. */
      if (!data || typeof data.version !== 'number' || data.version < 1) return;
      try { renderHero(data.hero); } catch (e) {}
      try { renderCards(data.cards); } catch (e) {}
      try { renderLatest(data.latest, data.latest_groups); } catch (e) {}
      try { syncAria(); } catch (e) {}
      try { wrapLangToggles(); } catch (e) {}
    })
    .catch(function () { /* keep static fallback */ });
})();
