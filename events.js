/* Valley events calendar — renders /events.json on /en/events/ and
   /fr/evenements/. Same discipline as bulletin.js and front-page.js: the
   DOM is built with textContent only, and links are limited to the site's
   own paths and the hosts below.

   Rules for events.json (docs/events-calendar.md has the full version):
   - Every event comes from a source someone at the Observer has read, linked
     as `source` with a label that says what it is and its date.
   - Only towns in the MRC du Haut-Saint-Laurent (TOWNS below).
   - State only what the source says; say what isn't known yet.

   Event fields: id (slug, unique; also the #anchor), date (YYYY-MM-DD, first
   day), optional end (YYYY-MM-DD, last day), town (a TOWNS key), kind (a
   KINDS key), title_en/fr, optional times_en/fr, optional place (venue and
   address; place_fr if it differs), text_en/fr, source {label_en, label_fr,
   url}, added (YYYY-MM-DD). A printed flyer the Observer photographed has no
   url: source {label_en, label_fr, seen: YYYY-MM-DD}, e.g. "Event flyer
   (photographed Nov. 19)"; the photo is kept in Notion, not on the site.

   Display: upcoming only (an event drops off after its last day), grouped
   by day; a multi-day event that has started shows under today. Filters for
   town and kind live in the URL (?town=huntingdon&kind=market) so a filtered
   view can be shared, and each event has its own link (#id). */
(function () {
  'use strict';

  var HOSTS = [
    'www.ormstown.ca', 'ormstown.ca',
    'www.mrchsl.com', 'mrchsl.com',
    'www.facebook.com', 'facebook.com', 'fb.me',
    'the-gleaner.com', 'www.the-gleaner.com',
    'www.quebec.ca', 'quebec.ca',
    // Other municipalities' and organizers' own sites. Add a host only once
    // an event's source on it has been read (and give the date added).
    'cssvt.gouv.qc.ca', 'www.cssvt.gouv.qc.ca',   // school service centre, 2026-11-19
    'www.marchefermierhuntingdon.ca', 'marchefermierhuntingdon.ca'
  ];

  var TOWNS = {
    'dundee':               'Dundee',
    'elgin':                'Elgin',
    'franklin':             'Franklin',
    'godmanchester':        'Godmanchester',
    'havelock':             'Havelock',
    'hinchinbrooke':        'Hinchinbrooke',
    'howick':               'Howick',
    'huntingdon':           'Huntingdon',
    'ormstown':             'Ormstown',
    'saint-anicet':         'Saint-Anicet',
    'saint-chrysostome':    'Saint-Chrysostome',
    'sainte-barbe':         'Sainte-Barbe',
    'tres-saint-sacrement': 'Très-Saint-Sacrement'
  };

  var KINDS = {
    market:    { en: 'Markets & craft fairs', fr: 'Marchés et salons d’artisans' },
    holiday:   { en: 'Holiday celebrations',  fr: 'Fêtes' },
    culture:   { en: 'Shows & talks',         fr: 'Spectacles et conférences' },
    community: { en: 'Community & benefits',  fr: 'Communauté et levées de fonds' },
    sport:     { en: 'Sports & outdoors',     fr: 'Sports et plein air' },
    civic:     { en: 'Public meetings',       fr: 'Rencontres publiques' }
  };

  var T = {
    en: {
      allTowns: 'All of the Valley', allKinds: 'Everything',
      town: 'Town', kind: 'What',
      today: 'Today', tomorrow: 'Tomorrow',
      until: 'until', source: 'Source', share: 'Share', copied: 'Link copied',
      none: 'Nothing listed for this choice yet.',
      noneAll: 'No upcoming events are listed yet.',
      error: 'The calendar could not be loaded. Please try again later.',
      count: function (n) { return n === 1 ? '1 event' : n + ' events'; },
      updated: 'Updated'
    },
    fr: {
      allTowns: 'Toute la vallée', allKinds: 'Tout',
      town: 'Municipalité', kind: 'Quoi',
      today: 'Aujourd’hui', tomorrow: 'Demain',
      until: 'jusqu’au', source: 'Source', share: 'Partager', copied: 'Lien copié',
      none: 'Rien d’inscrit pour ce choix pour l’instant.',
      noneAll: 'Aucun événement à venir pour l’instant.',
      error: 'Le calendrier n’a pas pu être chargé. Réessayez plus tard.',
      count: function (n) { return n <= 1 ? n + ' événement' : n + ' événements'; },
      updated: 'Mis à jour le'
    }
  };

  var DAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var DAY_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  var MON_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var MON_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  var root = document.getElementById('events-app');
  if (!root) return;
  // The page's language comes from its URL: observer-header.js rewrites
  // <html lang> to the reader's saved preference, which can differ.
  var LANG = /^\/fr\//.test(location.pathname) ? 'fr' : 'en';
  var L = T[LANG];

  function el(tag, cls, parent, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = String(text);
    if (parent) parent.appendChild(e);
    return e;
  }
  function pickLang(o, base) {
    var v = o[base + '_' + LANG];
    if (typeof v === 'string' && v) return v;
    v = o[base + '_en'];
    return typeof v === 'string' ? v : '';
  }
  function validDate(d) { return typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d); }
  function validUrl(u) {
    if (typeof u !== 'string' || /\s/.test(u)) return false;
    if (/^\/(?!\/)/.test(u)) return true;
    var m = /^https:\/\/([^\/?#]+)(?:[\/?#]|$)/.exec(u);
    return !!m && HOSTS.indexOf(m[1].toLowerCase()) !== -1;
  }
  function parts(d) { var p = d.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
  function iso(t) { return t.toISOString().slice(0, 10); }
  function today() {
    var t = new Date();
    return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2);
  }
  function addDays(d, n) { var t = parts(d); t.setUTCDate(t.getUTCDate() + n); return iso(t); }
  function shortDate(d) {
    var t = parts(d);
    return LANG === 'fr' ? t.getUTCDate() + ' ' + MON_FR[t.getUTCMonth()]
                         : MON_EN[t.getUTCMonth()].slice(0, 3) + '. ' + t.getUTCDate();
  }
  function dayHeading(d, now) {
    if (d === now) return L.today;
    if (d === addDays(now, 1)) return L.tomorrow;
    var t = parts(d), wd = t.getUTCDay(), m = t.getUTCMonth(), day = t.getUTCDate();
    if (LANG === 'fr') {
      var s = DAY_FR[wd] + ' ' + (day === 1 ? '1er' : day) + ' ' + MON_FR[m];
      return s.charAt(0).toUpperCase() + s.slice(1);
    }
    return DAY_EN[wd] + ', ' + MON_EN[m] + ' ' + day;
  }

  function clean(ev) {
    if (!ev || typeof ev.id !== 'string' || !/^[a-z0-9-]+$/.test(ev.id)) return null;
    if (!validDate(ev.date) || !TOWNS[ev.town] || !KINDS[ev.kind]) return null;
    if (ev.end != null && (!validDate(ev.end) || ev.end < ev.date)) return null;
    if (typeof ev.title_en !== 'string' || !ev.title_en) return null;
    return ev;
  }

  // ---- URL state -------------------------------------------------------
  function readState() {
    var q = new URLSearchParams(location.search);
    var town = q.get('town'), kind = q.get('kind');
    return { town: TOWNS[town] ? town : '', kind: KINDS[kind] ? kind : '' };
  }
  function writeState(s) {
    var q = new URLSearchParams(location.search);
    if (s.town) q.set('town', s.town); else q.delete('town');
    if (s.kind) q.set('kind', s.kind); else q.delete('kind');
    var qs = q.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
  }

  // ---- Rendering -------------------------------------------------------
  var state = readState();
  var events = [];
  var listEl, countEl, townSel, kindBox;

  function buildControls() {
    var bar = el('div', 'ev-controls', root);

    var tw = el('label', 'ev-town', bar);
    el('span', 'ev-label', tw, L.town);
    townSel = el('select', null, tw);
    var o = el('option', null, townSel, L.allTowns); o.value = '';
    Object.keys(TOWNS).forEach(function (k) {
      var opt = el('option', null, townSel, TOWNS[k]); opt.value = k;
    });
    townSel.value = state.town;
    townSel.addEventListener('change', function () { state.town = townSel.value; writeState(state); render(); });

    var kw = el('div', 'ev-kinds', bar);
    kw.setAttribute('role', 'group');
    kw.setAttribute('aria-label', L.kind);
    kindBox = kw;
    function chip(key, label) {
      var b = el('button', 'ev-chip', kw, label);
      b.type = 'button';
      b.setAttribute('data-kind', key);
      b.setAttribute('aria-pressed', String(state.kind === key));
      b.addEventListener('click', function () {
        state.kind = state.kind === key ? '' : key;
        writeState(state); render();
      });
    }
    chip('', L.allKinds);
    Object.keys(KINDS).forEach(function (k) { chip(k, KINDS[k][LANG]); });

    countEl = el('p', 'ev-count', root);
    countEl.setAttribute('aria-live', 'polite');
    listEl = el('div', 'ev-list', root);
  }

  function share(ev, btn) {
    var url = location.origin + location.pathname + '#' + ev.id;
    var title = pickLang(ev, 'title');
    if (navigator.share) {
      navigator.share({ title: title, url: url }).catch(function () {});
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () {
        btn.textContent = L.copied;
        setTimeout(function () { btn.textContent = L.share; }, 2000);
      }).catch(function () { location.hash = ev.id; });
    } else {
      location.hash = ev.id;
    }
  }

  function card(ev, parent) {
    var art = el('article', 'ev-card', parent);
    art.id = ev.id;
    var top = el('div', 'ev-top', art);
    el('span', 'ev-kind ev-kind-' + ev.kind, top, KINDS[ev.kind][LANG]);
    el('span', 'ev-place-town', top, TOWNS[ev.town]);

    el('h3', 'ev-title', art, pickLang(ev, 'title'));

    var meta = [];
    if (ev.end && ev.end !== ev.date) meta.push(shortDate(ev.date) + ' – ' + shortDate(ev.end));
    var times = pickLang(ev, 'times');
    if (times) meta.push(times);
    var place = LANG === 'fr' && ev.place_fr ? ev.place_fr : ev.place;
    if (typeof place === 'string' && place) meta.push(place);
    if (meta.length) el('p', 'ev-meta', art, meta.join(' · '));

    var text = pickLang(ev, 'text');
    if (text) el('p', 'ev-text', art, text);

    var foot = el('div', 'ev-foot', art);
    var src = ev.source;
    var sep = LANG === 'fr' ? ' : ' : ': ';
    if (src && validUrl(src.url)) {
      var a = el('a', 'ev-source', foot, L.source + sep + (pickLang(src, 'label') || src.url));
      a.href = src.url;
      a.rel = 'noopener';
    } else if (src && !src.url && validDate(src.seen) && pickLang(src, 'label')) {
      // A printed flyer the Observer photographed: no link, label only.
      el('span', 'ev-source ev-source-flyer', foot, L.source + sep + pickLang(src, 'label'));
    }
    var b = el('button', 'ev-share', foot, L.share);
    b.type = 'button';
    b.addEventListener('click', function () { share(ev, b); });
    return art;
  }

  function render() {
    if (townSel) townSel.value = state.town;
    if (kindBox) {
      Array.prototype.forEach.call(kindBox.querySelectorAll('.ev-chip'), function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-kind') === state.kind));
      });
    }
    while (listEl.firstChild) listEl.removeChild(listEl.firstChild);
    var now = today();
    var shown = events.filter(function (ev) {
      return (!state.town || ev.town === state.town) && (!state.kind || ev.kind === state.kind);
    });
    countEl.textContent = L.count(shown.length);
    if (!shown.length) {
      el('p', 'ev-empty', listEl, events.length ? L.none : L.noneAll);
      return;
    }
    var groups = {}, order = [];
    shown.forEach(function (ev) {
      var key = ev.date < now ? now : ev.date;
      if (!groups[key]) { groups[key] = []; order.push(key); }
      groups[key].push(ev);
    });
    order.sort();
    order.forEach(function (key) {
      var sec = el('section', 'ev-day', listEl);
      el('h2', 'ev-day-h', sec, dayHeading(key, now));
      groups[key].forEach(function (ev) { card(ev, sec); });
    });
    focusHash();
  }

  function focusHash() {
    var id = decodeURIComponent((location.hash || '').slice(1));
    if (!id || !/^[a-z0-9-]+$/.test(id)) return;
    var target = document.getElementById(id);
    if (!target || !target.classList.contains('ev-card')) {
      // The linked event may be hidden by a filter: clear the filters once.
      if ((state.town || state.kind) && events.some(function (e) { return e.id === id; })) {
        state = { town: '', kind: '' }; writeState(state); render();
      }
      return;
    }
    Array.prototype.forEach.call(document.querySelectorAll('.ev-card.is-target'), function (n) { n.classList.remove('is-target'); });
    target.classList.add('is-target');
    target.scrollIntoView({ block: 'start' });
  }
  window.addEventListener('hashchange', focusHash);

  fetch('/events.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (data) {
      var now = today();
      var list = (data && Array.isArray(data.events)) ? data.events : [];
      var seen = {};
      events = list.map(clean).filter(function (ev) {
        if (!ev || seen[ev.id]) return false;
        seen[ev.id] = true;
        return (ev.end || ev.date) >= now;
      }).sort(function (a, b) {
        var ka = a.date < now ? now : a.date, kb = b.date < now ? now : b.date;
        return ka.localeCompare(kb) || a.title_en.localeCompare(b.title_en);
      });
      var fb = document.getElementById('events-fallback');
      if (fb) fb.hidden = true;
      buildControls();
      render();
      if (data && validDate(data.updated)) {
        var u = document.getElementById('events-updated');
        var up = parts(data.updated);
        if (u) u.textContent = LANG === 'fr'
          ? L.updated + ' ' + up.getUTCDate() + ' ' + MON_FR[up.getUTCMonth()] + ' ' + up.getUTCFullYear()
          : L.updated + ' ' + shortDate(data.updated) + ', ' + up.getUTCFullYear();
      }
    })
    .catch(function () {
      var fb = document.getElementById('events-fallback');
      if (fb) fb.textContent = L.error;
    });
})();
