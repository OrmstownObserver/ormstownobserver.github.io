/* Bulletin renderer — fills the homepage's running list of notices, alerts
   and events from /bulletin.json. The section stays hidden until at least
   one item renders, so a missing or broken file costs nothing. Same rules as
   front-page.js: DOM built with textContent only, and links limited to the
   site's own paths and the official hosts below.

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
    'www.mrchsl.com', 'mrchsl.com', 'www.quebec.ca', 'quebec.ca'
  ];
  var TYPES = {
    alert:  { en: 'Alert',  fr: 'Alerte' },
    notice: { en: 'Notice', fr: 'Avis' },
    event:  { en: 'Event',  fr: 'Événement' }
  };
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

  function row(it) {
    var li = el('li', 'bulletin-item bulletin-' + it.type);
    var meta = el('div', 'bulletin-meta', li);
    biSpan(el('span', 'bulletin-type', meta), TYPES[it.type].en, TYPES[it.type].fr);
    dateLabel(el('span', 'bulletin-date', meta), it.date);
    var body = el('div', 'bulletin-body', li);
    biSpan(el('div', 'bulletin-title', body), it.title_en, it.title_fr);
    if (it.text_en) biSpan(el('p', 'bulletin-text', body), it.text_en, it.text_fr);
    var links = el('div', 'bulletin-links', body);
    var l = it.link;
    if (l && validUrl(l.url_en)) link(links, 'bulletin-link', (l.label_en || 'Read more') + ' →', (l.label_fr || 'Lire la suite') + ' →', l.url_en, l.url_fr);
    var s = it.source;
    if (s && validUrl(s.url)) link(links, 'bulletin-source', s.label_en || 'Source', s.label_fr || 'Source', s.url, s.url);
    if (!links.firstChild) body.removeChild(links);
    return li;
  }

  function render(data) {
    var section = document.getElementById('bulletin');
    var list = document.getElementById('bulletin-list');
    if (!section || !list || !data || !Array.isArray(data.items)) return;
    var items = pick(data.items);
    if (!items.length) return;
    while (list.firstChild) list.removeChild(list.firstChild);
    items.forEach(function (it) { list.appendChild(row(it)); });
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
