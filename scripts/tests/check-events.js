#!/usr/bin/env node
/* Checks events.json against the rules in events.js and
   docs/events-calendar.md. Run after any edit:

     node scripts/tests/check-events.js

   Fails (exit 1) on: bad JSON, a missing or duplicate id, a bad date, an end
   before the start, an unknown town or kind, a missing EN or FR title/text,
   a missing source or source label, a source URL whose host is not in
   events.js HOSTS. Warns (no failure) on past events still in the file,
   events more than a year out, and text that looks like it lost its FR. */
'use strict';
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');

const js = fs.readFileSync(path.join(ROOT, 'events.js'), 'utf8');
function grab(name, open, close) {
  const i = js.indexOf('var ' + name + ' = ' + open);
  if (i < 0) throw new Error('events.js: ' + name + ' not found');
  const start = js.indexOf(open, i);
  let depth = 0;
  for (let j = start; j < js.length; j++) {
    if (js[j] === open) depth++;
    else if (js[j] === close && --depth === 0) {
      // eslint-disable-next-line no-new-func
      return Function('return ' + js.slice(start, j + 1))();
    }
  }
  throw new Error('events.js: unterminated ' + name);
}
const HOSTS = grab('HOSTS', '[', ']');
const TOWNS = grab('TOWNS', '{', '}');
const KINDS = grab('KINDS', '{', '}');

let data;
try {
  data = JSON.parse(fs.readFileSync(path.join(ROOT, 'events.json'), 'utf8'));
} catch (e) {
  console.error('FAIL events.json is not valid JSON: ' + e.message);
  process.exit(1);
}

const errors = [];
const warnings = [];
const isDate = (d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(Date.parse(d));
const str = (s) => typeof s === 'string' && s.trim() !== '';
const today = new Date().toISOString().slice(0, 10);
const yearOut = new Date(Date.now() + 366 * 864e5).toISOString().slice(0, 10);

if (!isDate(data.updated)) errors.push('top-level "updated" must be YYYY-MM-DD');
if (!Array.isArray(data.events)) {
  errors.push('top-level "events" must be an array');
  data.events = [];
}

const ids = new Set();
data.events.forEach((ev, n) => {
  const at = (ev && ev.id ? ev.id : '#' + n) + ': ';
  if (!ev || typeof ev !== 'object') { errors.push('#' + n + ': not an object'); return; }
  if (!str(ev.id) || !/^[a-z0-9-]+$/.test(ev.id)) errors.push(at + 'id must be a lowercase slug');
  else if (ids.has(ev.id)) errors.push(at + 'duplicate id');
  ids.add(ev.id);
  if (!isDate(ev.date)) errors.push(at + 'bad date');
  if (ev.end != null && (!isDate(ev.end) || ev.end < ev.date)) errors.push(at + 'bad end (must be YYYY-MM-DD, not before date)');
  if (!TOWNS[ev.town]) errors.push(at + 'unknown town "' + ev.town + '" (MRC du Haut-Saint-Laurent only: ' + Object.keys(TOWNS).join(', ') + ')');
  if (!KINDS[ev.kind]) errors.push(at + 'unknown kind "' + ev.kind + '"');
  ['title', 'text'].forEach((f) => {
    if (!str(ev[f + '_en'])) errors.push(at + f + '_en missing');
    if (!str(ev[f + '_fr'])) errors.push(at + f + '_fr missing');
  });
  if ((ev.times_en == null) !== (ev.times_fr == null)) errors.push(at + 'times_en and times_fr must both be set or both absent');
  if (ev.place != null && !str(ev.place)) errors.push(at + 'place must be a non-empty string');
  if (!isDate(ev.added)) errors.push(at + 'added must be YYYY-MM-DD');
  const s = ev.source;
  if (!s || !str(s.label_en) || !str(s.label_fr)) errors.push(at + 'source needs label_en and label_fr');
  else if (s.url == null) {
    // Flyer photographed by the Observer: no link, but a date it was seen,
    // and labels that say it is a flyer.
    if (!isDate(s.seen)) errors.push(at + 'source without url needs seen (YYYY-MM-DD): only flyers may have no link');
    if (!/flyer|poster/i.test(s.label_en) || !/affiche|dépliant/i.test(s.label_fr)) errors.push(at + 'source without url must be labelled as a flyer (EN "flyer", FR "affiche")');
  } else {
    const m = /^https:\/\/([^\/?#]+)(?:[\/?#]|$)/.exec(s.url);
    if (!m || !HOSTS.includes(m[1].toLowerCase())) errors.push(at + 'source host not in events.js HOSTS: ' + s.url);
  }
  const known = new Set(['id', 'date', 'end', 'town', 'kind', 'title_en', 'title_fr', 'times_en', 'times_fr',
    'place', 'place_fr', 'text_en', 'text_fr', 'source', 'added']);
  Object.keys(ev).forEach((k) => { if (!known.has(k)) errors.push(at + 'unknown field "' + k + '"'); });

  if (isDate(ev.date) && (ev.end || ev.date) < today) warnings.push(at + 'is over (' + (ev.end || ev.date) + '); remove it on the next sweep');
  if (isDate(ev.date) && ev.date > yearOut) warnings.push(at + 'is more than a year away; check the year');
  if (str(ev.text_en) && ev.text_en === ev.text_fr) warnings.push(at + 'text_fr is identical to text_en');
});

warnings.forEach((w) => console.log('warn ' + w));
if (errors.length) {
  errors.forEach((e) => console.error('FAIL ' + e));
  process.exit(1);
}
const upcoming = data.events.filter((e) => (e.end || e.date) >= today);
const towns = new Set(upcoming.map((e) => e.town));
console.log('ok events.json: ' + data.events.length + ' events (' + upcoming.length + ' upcoming, ' +
  towns.size + ' of ' + Object.keys(TOWNS).length + ' towns), updated ' + data.updated);
