/* Bulletin renderer — fills the homepage's running list of notices, alerts
   and events from /bulletin.json. The section stays hidden until at least
   one item renders, so a missing or broken file costs nothing. Same rules as
   front-page.js: DOM built with textContent only, and links limited to the
   site's own paths and the hosts below (official sources, plus the Town's
   Facebook page, Facebook events and The Gleaner).

   Item fields: type (alert | notice | event), date (YYYY-MM-DD: posted date,
   or the day of an event), title_en/fr, text_en/fr, optional link
   {label_en, label_fr, url_en, url_fr}, optional source {label_en, label_fr,
   url}, optional until (YYYY-MM-DD, last day shown).

   What shows: alerts first (they drop off 7 days after their date unless
   `until` says otherwise), then upcoming events, soonest first (an event
   drops off after its day), then notices, newest first. At most MAX items. */
(function () {
  'use strict';

  var MAX = 6;
  var ALERT_DAYS = 7;
  var HOSTS = [
    'www.ormstown.ca', 'ormstown.ca', 'ormstown.alertesmunicipales.com',
    'www.mrchsl.com', 'mrchsl.com', 'www.quebec.ca', 'quebec.ca',
    // Community sources (editor, 2026-11-05): the Town's own Facebook page and
    // Facebook events, and The Gleaner, the Valley's community paper.
    'www.facebook.com', 'facebook.com', 'the-gleaner.com', 'www.the-gleaner.com',
    // Official sources (editor, 2026-11-15): provincial bodies, the courts'
    // and police notices, and Québec's open-data portal.
    'cdn-contenu.quebec.ca', 'www.legisquebec.gouv.qc.ca', 'www.seao.gouv.qc.ca', 'seao.gouv.qc.ca',
    'www.cmq.gouv.qc.ca', 'www.amp.quebec', 'amp.quebec', 'www.cai.gouv.qc.ca', 'www.donneesquebec.ca',
    'www.sq.gouv.qc.ca', 'www.electionsquebec.qc.ca', 'www.santemonteregie.qc.ca'
  ];
  var TYPES = {
    alert:  { en: 'Alert',  fr: 'Alerte' },
    notice: { en: 'Notice', fr: 'Avis' },
    event:  { en: 'Event',  fr: 'Événement' }
  };
  // Whitelisted icons (24x24, stroked), built with createElementNS — never
  // from data. [tag, attrs] pairs.
  var ICONS = {
    alert: [['path', { d: 'M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z' }],
            ['line', { x1: 12, y1: 9, x2: 12, y2: 13 }], ['line', { x1: 12, y1: 17, x2: 12.01, y2: 17 }]],
    notice: [['path', { d: 'M3 10.5v3a1 1 0 0 0 1 1h2.5L12 19V5L6.5 9.5H4a1 1 0 0 0-1 1z' }],
             ['path', { d: 'M15.5 9a4 4 0 0 1 0 6' }], ['path', { d: 'M18.5 6a8 8 0 0 1 0 12' }]],
    event: [['rect', { x: 3, y: 4.5, width: 18, height: 16.5, rx: 2 }],
            ['line', { x1: 3, y1: 9.5, x2: 21, y2: 9.5 }], ['line', { x1: 8, y1: 2.5, x2: 8, y2: 6 }],
            ['line', { x1: 16, y1: 2.5, x2: 16, y2: 6 }]],
    source: [['path', { d: 'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7' }],
             ['path', { d: 'M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7' }]]
  };
  var SVGNS = 'http://www.w3.org/2000/svg';
  var MON_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var MON_FR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

  function isFr() {
    return document.documentElement.classList.contains('lang-fr');
  }

  function el(tag, cls, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (parent) parent.appendChild(e);
    return e;
  }

  function biSpan(parent, en, fr) {
    var a = el('span', null, parent);
    a.setAttribute('data-en', '');
    a.textContent = en == null ? '' : String(en);
    var b = el('span', null, parent);
    b.setAttribute('data-fr', '');
    b.textContent = fr == null || fr === '' ? a.textContent : String(fr);
    return parent;
  }

  function icon(parent, name) {
    var svg = document.createElementNS(SVGNS, 'svg');
    var a = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 2,
      'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true', focusable: 'false' };
    Object.keys(a).forEach(function (k) { svg.setAttribute(k, a[k]); });
    ICONS[name].forEach(function (part) {
      var n = document.createElementNS(SVGNS, part[0]);
      Object.keys(part[1]).forEach(function (k) { n.setAttribute(k, part[1][k]); });
      svg.appendChild(n);
    });
    parent.appendChild(svg);
    return svg;
  }

  function validUrl(u) {
    if (typeof u !== 'string' || /\s/.test(u)) return false;
    if (/^\/(?!\/)/.test(u)) return true;
    var m = /^https:\/\/([^\/?#]+)(?:[\/?#]|$)/.exec(u);
    return !!m && HOSTS.indexOf(m[1].toLowerCase()) !== -1;
  }

  function validDate(d) {
    return typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d);
  }

  function addDays(d, n) {
    var p = d.split('-');
    var t = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + n));
    return t.toISOString().slice(0, 10);
  }

  function today() {
    var t = new Date();
    return t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2) + '-' + ('0' + t.getDate()).slice(-2);
  }

  function lastDay(it) {
    if (validDate(it.until)) return it.until;
    if (it.type === 'event') return it.date;
    if (it.type === 'alert') return addDays(it.date, ALERT_DAYS);
    return null;
  }

  function pick(items) {
    var now = today();
    var ok = items.filter(function (it) {
      if (!it || !TYPES[it.type] || !validDate(it.date)) return false;
      if (typeof it.title_en !== 'string' || !it.title_en) return false;
      var end = lastDay(it);
      return !end || end >= now;
    });
    function of(type) { return ok.filter(function (it) { return it.type === type; }); }
    var newest = function (a, b) { return b.date.localeCompare(a.date); };
    var soonest = function (a, b) { return a.date.localeCompare(b.date); };
    return of('alert').sort(newest)
      .concat(of('event').sort(soonest))
      .concat(of('notice').sort(newest))
      .slice(0, MAX);
  }

  function dateLabel(parent, d) {
    var p = d.split('-');
    var m = +p[1] - 1, day = +p[2];
    biSpan(parent, MON_EN[m] + ' ' + day, day + ' ' + MON_FR[m]);
  }

  function link(parent, cls, en, fr, urlEn, urlFr) {
    var a = el('a', cls, parent);
    var fu = validUrl(urlFr) ? urlFr : urlEn;
    a.setAttribute('data-href-en', urlEn);
    a.setAttribute('data-href-fr', fu);
    a.setAttribute('href', isFr() ? fu : urlEn);
    if (!/^\//.test(urlEn)) a.setAttribute('rel', 'noopener');
    biSpan(a, en, fr);
    return a;
  }

  function tile(parent, it) {
    if (it.type === 'event') {
      var p = it.date.split('-'), m = +p[1] - 1;
      var cal = el('div', 'bulletin-tile bulletin-cal', parent);
      cal.setAttribute('aria-hidden', 'true');
      biSpan(el('span', 'bulletin-cal-mon', cal), MON_EN[m], MON_FR[m].replace('.', ''));
      el('span', 'bulletin-cal-day', cal).textContent = String(+p[2]);
      return;
    }
    icon(el('div', 'bulletin-tile', parent), it.type);
  }

  function row(it) {
    var li = el('li', 'bulletin-item bulletin-' + it.type);
    if (it.type === 'alert' && it.date >= addDays(today(), -2)) li.className += ' bulletin-fresh';
    tile(li, it);
    var body = el('div', 'bulletin-body', li);
    var meta = el('div', 'bulletin-meta', body);
    biSpan(el('span', 'bulletin-type', meta), TYPES[it.type].en, TYPES[it.type].fr);
    dateLabel(el('span', 'bulletin-date', meta), it.date);
    biSpan(el('div', 'bulletin-title', body), it.title_en, it.title_fr);
    if (it.text_en) biSpan(el('p', 'bulletin-text', body), it.text_en, it.text_fr);
    var links = el('div', 'bulletin-links', body);
    var l = it.link;
    if (l && validUrl(l.url_en)) link(links, 'bulletin-link', (l.label_en || 'Read more') + ' →', (l.label_fr || 'Lire la suite') + ' →', l.url_en, l.url_fr);
    var s = it.source;
    if (s && validUrl(s.url)) {
      var src = link(links, 'bulletin-source', s.label_en || 'Source', s.label_fr || 'Source', s.url, s.url);
      src.insertBefore(icon(src, 'source'), src.firstChild);
    }
    if (!links.firstChild) body.removeChild(links);
    return li;
  }

  // Counts by type above the list ("1 Alert · 3 Events · 2 Notices").
  function legend(list, items) {
    var old = document.getElementById('bulletin-legend');
    if (old) old.parentNode.removeChild(old);
    var ul = el('ul', 'bulletin-legend');
    ul.id = 'bulletin-legend';
    ul.setAttribute('aria-label', isFr() ? 'Résumé' : 'Summary');
    ['alert', 'event', 'notice'].forEach(function (t) {
      var n = items.filter(function (it) { return it.type === t; }).length;
      if (!n) return;
      var li = el('li', 'bulletin-chip bulletin-' + t, ul);
      icon(li, t);
      el('b', null, li).textContent = String(n);
      var pl = n > 1;
      biSpan(el('span', null, li), TYPES[t].en + (pl ? 's' : ''), TYPES[t].fr + (pl ? 's' : ''));
    });
    list.parentNode.insertBefore(ul, list);
  }

  function render(data) {
    var section = document.getElementById('bulletin');
    var list = document.getElementById('bulletin-list');
    if (!section || !list || !data || !Array.isArray(data.items)) return;
    var items = pick(data.items);
    if (!items.length) return;
    while (list.firstChild) list.removeChild(list.firstChild);
    items.forEach(function (it) { list.appendChild(row(it)); });
    legend(list, items);
    section.hidden = false;
    // The retired /public-notices/ pages redirect to /#bulletin, which the
    // browser could not scroll to while the section was hidden.
    if (location.hash === '#bulletin') section.scrollIntoView();
  }

  function start() {
    fetch('/bulletin.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(render)
      .catch(function () {});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
