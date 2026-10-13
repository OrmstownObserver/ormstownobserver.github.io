/* ============================================================
   Ormstown Observer — bylaw register renderer (EN + FR hubs)
   ------------------------------------------------------------
   Renders /dist/bylaws.json into the hub pages at
   /en/bylaws-regulations/ and /fr/bylaws-regulations/.

   DATA CONTRACT — the snapshot is a JSON object with a `records`
   array (scripts/export-bylaws.py writes exactly this). Every
   field except bylaw_number is optional, and a missing value is
   SHOWN as missing ("Not recorded"), never guessed:
     bylaw_number, title_en, title_fr, status, category, topics[],
     adopted_date, in_force_date, amended_date   (YYYY-MM-DD or YYYY)
     enforced_by, fines, official_url,
     key_facts_en[], key_facts_fr[], summary_en, summary_fr,
     next_step, next_step_date, amends[], amended_by[],
     explainer: { en, fr }   (same-site paths only)
   The v1 snapshot published 2026-10-08 has no in-force dates,
   summaries, French facts or history; the page degrades to
   labelled gaps rather than borrowing the adoption date.

   URL (shareable result sets; typing replaces, clicks push):
     q=        free text
     status=   current (default) | draft | repealed | unverified | all
     topic=    build|animals|fire|roads|business|water|noise|land|fees|council
     category= category slug (see CATEGORIES)
     #r-<slug> one bylaw card; widens the status filter so it shows

   SAFETY — textContent only, no innerHTML anywhere. Official links
   must be https on an allowlisted host; Observer links must be
   same-site /en/ or /fr/ paths. Anything else is not linked.

   The static cards in each page are the no-JS / failed-load
   fallback. On success this script replaces them.
   ============================================================ */
(function (global) {
  'use strict';

  var DATA_URL = '/dist/bylaws.json';
  var doc = global.document;
  var lang = /\/fr\//.test(global.location.pathname) ? 'fr' : 'en';
  var other = lang === 'fr' ? 'en' : 'fr';

  /* ---------- interface strings ---------- */
  var UI = {
    en: {
      searchPh: 'e.g. 131-2026, fence, hens, burning permit',
      clear: 'Clear search',
      statusGroup: 'Legal status',
      sCurrent: 'Current law', sDraft: 'Drafts', sRepealed: 'Repealed', sUnverified: 'Status not verified', sAll: 'All',
      catAll: 'All categories',
      topicAll: 'Any situation',
      reset: 'Reset filters',
      count: function (n, total) { return n === total ? (n + (n === 1 ? ' bylaw' : ' bylaws')) : (n + ' of ' + total + ' bylaws'); },
      scopeIn: function (bits) { return bits.length ? ' · ' + bits.join(' · ') : ''; },
      searchBit: function (q) { return 'matching “' + q + '”'; },
      noResults: 'No bylaw matches these filters.',
      widen: function (n) { return 'Show ' + n + ' match' + (n === 1 ? '' : 'es') + ' in every status'; },
      adopted: 'Adopted', inForce: 'In force', amended: 'Last amended',
      notRecorded: 'Not recorded', noneRecorded: 'None recorded', notAdopted: 'Not adopted', notInForce: 'Not in force',
      keyRules: 'Key rules',
      factsOtherLang: 'Key rules are available in French only for now.',
      summaryOtherLang: 'Summary available in French only for now.',
      enforcedBy: 'Enforced by', fines: 'Fines', topics: 'Topics', category: 'Category',
      amends: 'Amends or replaces', amendedBy: 'Amended or replaced by',
      nextStep: 'Next step', nextStepDate: 'expected',
      official: 'Official document', officialMissing: 'No official link recorded yet',
      officialUnverified: 'Official link withheld: not on a recognized municipal host',
      explainer: 'Read the Observer explainer', coverage: 'Observer coverage',
      newTab: '(opens in a new tab)',
      draftsTitle: 'Being decided now',
      draftsSub: 'Draft bylaws council has tabled but not adopted. Steps are listed only where the register records them.',
      seeCard: 'See the card',
      registerAll: 'All bylaws', registerCurrent: 'Bylaws in force',
      registerDraft: 'Draft bylaws', registerRepealed: 'Repealed bylaws (history)', registerUnverified: 'Bylaws whose status is not verified',
      repealedNote: 'Repealed bylaws are kept for history. They are not current law.',
      dataNote: function (n, date) { return 'Register snapshot of ' + n + ' bylaws, generated ' + date + ' from the Observer’s bylaw registry.'; },
      gapsNote: '“Not recorded” means the register has no verified value yet. It does not mean the information does not exist.',
      loadFailed: 'The full register could not be loaded. Showing the Observer’s explainers only.',
      langTag: '(in English)', langTagOther: '(in French)'
    },
    fr: {
      searchPh: 'ex. 131-2026, chiens, eau potable, incendie',
      clear: 'Effacer la recherche',
      statusGroup: 'Statut juridique',
      sCurrent: 'En vigueur', sDraft: 'Projets', sRepealed: 'Abrogés', sUnverified: 'Statut à vérifier', sAll: 'Tous',
      catAll: 'Toutes les catégories',
      topicAll: 'Toute situation',
      reset: 'Réinitialiser les filtres',
      count: function (n, total) { return n === total ? (n + (n === 1 ? ' règlement' : ' règlements')) : (n + (n > 1 ? ' règlements' : ' règlement') + ' sur ' + total); },
      scopeIn: function (bits) { return bits.length ? ' · ' + bits.join(' · ') : ''; },
      searchBit: function (q) { return 'contenant « ' + q + ' »'; },
      noResults: 'Aucun règlement ne correspond à ces filtres.',
      widen: function (n) { return 'Afficher ' + n + ' résultat' + (n === 1 ? '' : 's') + ' tous statuts confondus'; },
      adopted: 'Adopté', inForce: 'En vigueur', amended: 'Dernière modification',
      notRecorded: 'Non consigné', noneRecorded: 'Aucune consignée', notAdopted: 'Non adopté', notInForce: 'Pas en vigueur',
      keyRules: 'L’essentiel',
      factsOtherLang: 'Les faits clés ne sont pas encore traduits; ils sont présentés en anglais.',
      summaryOtherLang: 'Résumé pas encore traduit; il est présenté en anglais.',
      enforcedBy: 'Appliqué par', fines: 'Amendes', topics: 'Sujets', category: 'Catégorie',
      amends: 'Modifie ou remplace', amendedBy: 'Modifié ou remplacé par',
      nextStep: 'Prochaine étape', nextStepDate: 'prévue',
      official: 'Document officiel', officialMissing: 'Aucun lien officiel consigné pour l’instant',
      officialUnverified: 'Lien officiel retenu : hôte municipal non reconnu',
      explainer: 'Lire l’explicateur de l’Observer', coverage: 'Couverture de l’Observer',
      newTab: '(s’ouvre dans un nouvel onglet)',
      draftsTitle: 'En cours d’adoption',
      draftsSub: 'Projets de règlement déposés au conseil mais pas encore adoptés. Les étapes ne sont indiquées que si le registre les consigne.',
      seeCard: 'Voir la fiche',
      registerAll: 'Tous les règlements', registerCurrent: 'Règlements en vigueur',
      registerDraft: 'Projets de règlement', registerRepealed: 'Règlements abrogés (historique)', registerUnverified: 'Règlements dont le statut reste à vérifier',
      repealedNote: 'Les règlements abrogés restent visibles pour l’historique. Ils ne sont plus en vigueur.',
      dataNote: function (n, date) { return 'Instantané du registre : ' + n + ' règlements, produit le ' + date + ' à partir du registre des règlements de l’Observer.'; },
      gapsNote: '« Non consigné » signifie que le registre n’a pas encore de valeur vérifiée. Cela ne veut pas dire que l’information n’existe pas.',
      loadFailed: 'Le registre complet n’a pas pu être chargé. Seuls les explicateurs de l’Observer sont affichés.',
      langTag: '(en anglais)', langTagOther: '(en français)'
    }
  }[lang];

  /* ---------- vocabularies (data values are English; labels per page) ---------- */
  var STATUS = {
    'In force': { group: 'current', cls: 'st-in', en: 'In force', fr: 'En vigueur' },
    'Amended':  { group: 'current', cls: 'st-am', en: 'In force, amended', fr: 'En vigueur, modifié' },
    'Draft':    { group: 'draft',   cls: 'st-draft', en: 'Draft', fr: 'Projet' },
    'Repealed': { group: 'repealed', cls: 'st-rep', en: 'Repealed', fr: 'Abrogé' }
  };
  var UNVERIFIED = { group: 'unverified', cls: 'st-unk', en: 'Status not verified', fr: 'Statut à vérifier' };
  var GROUPS = ['current', 'draft', 'repealed', 'unverified', 'all'];

  var CATEGORIES = [
    ['Zoning & Land Use', 'zoning', 'Zonage et aménagement'],
    ['Construction & Permits', 'construction', 'Construction et permis'],
    ['Environment', 'environment', 'Environnement'],
    ['Nuisances & Noise', 'nuisances', 'Nuisances et bruit'],
    ['Fire Safety', 'fire-safety', 'Sécurité incendie'],
    ['Infrastructure', 'infrastructure', 'Infrastructures'],
    ['Finance & Taxation', 'finance', 'Finances et taxation'],
    ['Council Procedure', 'council', 'Fonctionnement du conseil'],
    ['Other', 'other', 'Autre']
  ];
  var CAT_BY_NAME = {}, CAT_BY_SLUG = {};
  CATEGORIES.forEach(function (c) { CAT_BY_NAME[c[0]] = c; CAT_BY_SLUG[c[1]] = c; });

  // key, data value, "I want to…" label EN, FR, short tag EN, FR
  var TOPICS = [
    ['build', 'Build & renovate', 'Build or renovate', 'Construire ou rénover', 'Build & renovate', 'Construction et rénovation'],
    ['animals', 'Animals', 'Keep animals', 'Garder des animaux', 'Animals', 'Animaux'],
    ['fire', 'Burning & fire', 'Burn or light a fire', 'Brûler ou faire un feu', 'Burning & fire', 'Brûlage et incendie'],
    ['roads', 'Parking & roads', 'Park or drive', 'Stationner ou circuler', 'Parking & roads', 'Stationnement et routes'],
    ['business', 'Run a business', 'Run a business', 'Exploiter une entreprise', 'Business', 'Entreprises'],
    ['water', 'Water', 'Use water', 'Utiliser l’eau', 'Water', 'Eau'],
    ['noise', 'Noise & nuisances', 'Deal with noise or a nuisance', 'Régler un bruit ou une nuisance', 'Noise & nuisances', 'Bruit et nuisances'],
    ['land', 'Trees & land', 'Cut trees or divide land', 'Couper des arbres ou lotir', 'Trees & land', 'Arbres et terrains'],
    ['fees', 'Fees & taxes', 'Know what it costs', 'Connaître les coûts', 'Fees & taxes', 'Tarifs et taxes'],
    ['council', 'Council & ethics', 'Follow council', 'Suivre le conseil', 'Council & ethics', 'Conseil et éthique']
  ];
  var TOPIC_BY_KEY = {}, TOPIC_BY_NAME = {};
  TOPICS.forEach(function (t) { TOPIC_BY_KEY[t[0]] = t; TOPIC_BY_NAME[t[1]] = t; });

  var ENFORCED_FR = { 'Municipality': 'Municipalité', 'MRC': 'MRC', 'Sûreté du Québec': 'Sûreté du Québec', 'Fire service': 'Service de sécurité incendie' };

  // Official documents may only be linked on these hosts (https only).
  var OFFICIAL_HOSTS = { 'www.ormstown.ca': 1, 'ormstown.ca': 1, 'drive.google.com': 1, 'docs.google.com': 1, 'www.mrchsl.com': 1, 'mrchsl.com': 1 };

  /* ---------- small helpers ---------- */
  function $(id) { return doc.getElementById(id); }
  function el(tag, cls, text) {
    var n = doc.createElement(tag);
    if (cls) n.setAttribute('class', cls);
    if (text != null) n.textContent = String(text);
    return n;
  }
  function add(parent, child) { parent.appendChild(child); return child; }
  function clear(n) { n.textContent = ''; }
  function str(v) { return v == null ? '' : String(v).trim(); }
  function list(v) {
    if (Array.isArray(v)) return v.map(str).filter(Boolean);
    if (typeof v === 'string' && v.trim()) return v.split(/\n+/).map(str).filter(Boolean);
    return [];
  }
  function fold(s) {
    s = str(s).toLowerCase();
    return s.normalize ? s.normalize('NFD').replace(/[̀-ͯ]/g, '') : s;
  }

  function statusOf(r) { return STATUS[str(r.status)] || UNVERIFIED; }
  function statusLabel(r) {
    var s = STATUS[str(r.status)];
    return s ? s[lang] : UNVERIFIED[lang];
  }

  function catName(name) { var c = CAT_BY_NAME[name]; return c ? (lang === 'fr' ? c[2] : c[0]) : name; }
  function topicTag(name) { var t = TOPIC_BY_NAME[name]; return t ? (lang === 'fr' ? t[5] : t[4]) : name; }
  function enforcedName(v) { return lang === 'fr' ? (ENFORCED_FR[v] || v) : v; }

  var MONTHS = {
    en: ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.'],
    fr: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juill.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
  };
  // Formats YYYY-MM-DD or a year-only YYYY. Anything else is not a date we
  // can vouch for and comes back null, so the caller shows "Not recorded".
  function fmtDate(v) {
    v = str(v);
    var m = /^(\d{4})(?:-(\d{2})-(\d{2}))?/.exec(v);
    if (!m) return null;
    if (!m[2]) return m[1];
    var mo = Number(m[2]) - 1, d = Number(m[3]);
    if (mo < 0 || mo > 11 || d < 1 || d > 31) return null;
    return lang === 'fr'
      ? (d === 1 ? '1er' : String(d)) + ' ' + MONTHS.fr[mo] + ' ' + m[1]
      : MONTHS.en[mo] + ' ' + d + ', ' + m[1];
  }

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

  // "Règlement 131-2026" -> "131-2026"; anything not a plain Règlement keeps
  // its prefix so ids never collide. Stable: links to #r-<slug> may be shared.
  function slugFor(num) {
    var s = fold(num).replace(/^reglement\s+/, '');
    return s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'bylaw';
  }
  // Sort key: newest year first, then bylaw number, natural order.
  function sortKey(num) {
    var m = /(\d+(?:\.\d+)*)-(\d{4})/.exec(str(num));
    if (!m) return [0, [], fold(num)];
    return [Number(m[2]), m[1].split('.').map(Number), fold(num)];
  }
  function compareRecords(a, b) {
    var ka = a._sort, kb = b._sort;
    if (ka[0] !== kb[0]) return kb[0] - ka[0];
    for (var i = 0; i < Math.max(ka[1].length, kb[1].length); i++) {
      var x = ka[1][i] == null ? -1 : ka[1][i], y = kb[1][i] == null ? -1 : kb[1][i];
      if (x !== y) return x - y;
    }
    return ka[2] < kb[2] ? -1 : ka[2] > kb[2] ? 1 : 0;
  }

  /* ---------- normalise one record (never invents a value) ---------- */
  function prepare(raw, seen) {
    var r = {
      number: str(raw.bylaw_number),
      title_en: str(raw.title_en), title_fr: str(raw.title_fr),
      status: str(raw.status),
      category: str(raw.category),
      topics: list(raw.topics),
      adopted: str(raw.adopted_date), inForce: str(raw.in_force_date), amended: str(raw.amended_date),
      enforced: str(raw.enforced_by), fines: str(raw.fines),
      official: str(raw.official_url),
      facts_en: list(raw.key_facts_en), facts_fr: list(raw.key_facts_fr),
      summary_en: str(raw.summary_en), summary_fr: str(raw.summary_fr),
      nextStep: str(raw.next_step), nextStepDate: str(raw.next_step_date),
      amends: list(raw.amends), amendedBy: list(raw.amended_by),
      explainer: raw.explainer && typeof raw.explainer === 'object' ? str(raw.explainer[lang]) : ''
    };
    var slug = slugFor(r.number), base = slug, i = 2;
    while (seen[slug]) slug = base + '-' + (i++);
    seen[slug] = 1;
    r.slug = slug;
    r._sort = sortKey(r.number);
    r.group = statusOf(r).group;
    var catRow = CAT_BY_NAME[r.category];
    r.catSlug = catRow ? catRow[1] : (r.category ? 'other' : '');
    r.topicKeys = r.topics.map(function (t) { return TOPIC_BY_NAME[t] ? TOPIC_BY_NAME[t][0] : null; }).filter(Boolean);
    var catEntry = CAT_BY_NAME[r.category];
    r._text = fold([
      r.number, r.number.replace(/[^\d.\-]/g, ' '), r.title_en, r.title_fr, r.status, statusLabel(r),
      r.category, catEntry ? catEntry[2] : '',
      r.topics.join(' '), r.topicKeys.map(function (k) { return TOPIC_BY_KEY[k].slice(2).join(' '); }).join(' '),
      r.enforced, ENFORCED_FR[r.enforced] || '', r.fines,
      r.facts_en.join(' '), r.facts_fr.join(' '), r.summary_en, r.summary_fr
    ].join(' '));
    return r;
  }

  /* ---------- state + URL ---------- */
  var records = [], byNumber = {}, meta = {};
  var state = { q: '', status: 'current', topic: '', category: '' };

  function readURL() {
    var p = new URLSearchParams(global.location.search || '');
    state.q = str(p.get('q')).slice(0, 120);
    var st = p.get('status');
    state.status = GROUPS.indexOf(st) >= 0 ? st : 'current';
    var tp = p.get('topic');
    state.topic = TOPIC_BY_KEY[tp] ? tp : '';
    var cat = p.get('category');
    state.category = CAT_BY_SLUG[cat] ? cat : '';
    // A deep link to one card must resolve even when its status is filtered out.
    var target = targetSlug();
    if (target) {
      var r = records.filter(function (x) { return x.slug === target; })[0];
      if (r && !matches(r, state)) { state = { q: '', status: 'all', topic: '', category: '' }; }
    }
  }
  function targetSlug() {
    var h = str(global.location.hash);
    return /^#r-[a-z0-9\-]+$/.test(h) ? h.slice(3) : '';
  }
  function query() {
    var p = new URLSearchParams();
    if (state.q) p.set('q', state.q);
    if (state.status !== 'current') p.set('status', state.status);
    if (state.topic) p.set('topic', state.topic);
    if (state.category) p.set('category', state.category);
    var s = p.toString();
    return s ? '?' + s : '';
  }
  function writeURL(push) {
    if (!global.history || !global.history.replaceState) return;
    var url = global.location.pathname + query();
    try { global.history[push ? 'pushState' : 'replaceState'](null, '', url); } catch (e) {}
  }
  function isDefault() { return !state.q && state.status === 'current' && !state.topic && !state.category; }
  function set(patch, push) {
    Object.keys(patch).forEach(function (k) { state[k] = patch[k]; });
    writeURL(push !== false);
    render();
  }

  /* ---------- filtering ---------- */
  function tokens(q) { return fold(q).split(/[\s,;]+/).filter(Boolean); }
  function matches(r, s, skip) {
    skip = skip || {};
    if (!skip.status && s.status !== 'all' && r.group !== s.status) return false;
    if (!skip.topic && s.topic && r.topicKeys.indexOf(s.topic) < 0) return false;
    if (!skip.category && s.category && r.catSlug !== s.category) return false;
    if (!skip.q && s.q) {
      var t = tokens(s.q);
      for (var i = 0; i < t.length; i++) if (r._text.indexOf(t[i]) < 0) return false;
    }
    return true;
  }
  function filtered(s, skip) { return records.filter(function (r) { return matches(r, s, skip); }); }

  /* ---------- rendering: controls ---------- */
  function renderStatus() {
    var box = $('status-filter'); if (!box) return;
    clear(box);
    var pool = filtered(state, { status: true });
    var counts = { current: 0, draft: 0, repealed: 0, unverified: 0, all: pool.length };
    pool.forEach(function (r) { counts[r.group]++; });
    var anyUnverified = records.some(function (r) { return r.group === 'unverified'; });
    [['current', UI.sCurrent], ['draft', UI.sDraft], ['repealed', UI.sRepealed], ['unverified', UI.sUnverified], ['all', UI.sAll]]
      .forEach(function (g) {
        if (g[0] === 'unverified' && !anyUnverified) return;
        var b = add(box, el('button', 'seg-btn seg-' + g[0]));
        b.setAttribute('type', 'button');
        b.setAttribute('data-k', 'status-' + g[0]);
        b.setAttribute('aria-pressed', String(state.status === g[0]));
        add(b, el('span', null, g[1]));
        add(b, el('span', 'ct', String(counts[g[0]])));
        b.addEventListener('click', function () { set({ status: g[0] }); });
      });
  }

  function renderTopics() {
    var box = $('topics'); if (!box) return;
    clear(box);
    var pool = filtered(state, { topic: true });
    TOPICS.forEach(function (t) {
      var n = pool.filter(function (r) { return r.topicKeys.indexOf(t[0]) >= 0; }).length;
      var b = add(box, el('button', 'topic'));
      b.setAttribute('type', 'button');
      b.setAttribute('data-k', 'topic-' + t[0]);
      b.setAttribute('aria-pressed', String(state.topic === t[0]));
      add(b, el('span', 'q', lang === 'fr' ? t[3] : t[2]));
      add(b, el('span', 'n', String(n)));
      b.addEventListener('click', function () { set({ topic: state.topic === t[0] ? '' : t[0] }); });
    });
  }

  function renderCategory() {
    var sel = $('category'); if (!sel) return;
    clear(sel);
    var pool = filtered(state, { category: true });
    var o = add(sel, el('option', null, UI.catAll + ' (' + pool.length + ')'));
    o.setAttribute('value', '');
    CATEGORIES.forEach(function (c) {
      var n = pool.filter(function (r) { return r.catSlug === c[1]; }).length;
      if (!n && state.category !== c[1]) return;
      var opt = add(sel, el('option', null, (lang === 'fr' ? c[2] : c[0]) + ' (' + n + ')'));
      opt.setAttribute('value', c[1]);
      if (state.category === c[1]) opt.setAttribute('selected', '');
    });
    sel.value = state.category;
  }

  function scopeBits() {
    var bits = [];
    if (state.topic) bits.push(lang === 'fr' ? TOPIC_BY_KEY[state.topic][3] : TOPIC_BY_KEY[state.topic][2]);
    if (state.category) bits.push(lang === 'fr' ? CAT_BY_SLUG[state.category][2] : CAT_BY_SLUG[state.category][0]);
    if (state.q) bits.push(UI.searchBit(state.q));
    return bits;
  }

  function registerHeading() {
    return {
      current: UI.registerCurrent, draft: UI.registerDraft, repealed: UI.registerRepealed,
      unverified: UI.registerUnverified, all: UI.registerAll
    }[state.status];
  }

  /* ---------- rendering: one card ---------- */
  function dateRow(dl, label, value, missing) {
    var d = add(dl, el('div', 'bd'));
    add(d, el('dt', null, label));
    var shown = fmtDate(value);
    add(d, el('dd', shown ? null : 'missing', shown || missing));
  }

  function textBlock(parent, items, otherItems, cls, headText, otherNote) {
    // Prefer this page's language; fall back to the other one, labelled and
    // tagged with its real language so a screen reader pronounces it right.
    var use = items.length ? items : otherItems;
    if (!use.length) return;
    var wrap = add(parent, el('div', cls));
    if (headText) add(wrap, el('h4', 'bh', headText));
    if (!items.length) {
      add(wrap, el('p', 'otherlang', otherNote));
    }
    var ul = add(wrap, el('ul'));
    if (!items.length) ul.setAttribute('lang', other);
    use.forEach(function (f) { add(ul, el('li', null, f)); });
  }

  function historyLine(parent, label, nums) {
    if (!nums.length) return;
    var p = add(parent, el('p', 'bhist'));
    add(p, el('span', 'bl', label + ' '));
    nums.forEach(function (n, i) {
      if (i) p.appendChild(doc.createTextNode(', '));
      var target = byNumber[n];
      if (target) {
        var a = add(p, el('a', null, n));
        a.setAttribute('href', '#r-' + target.slug);
      } else {
        add(p, el('span', null, n));
      }
    });
  }

  function card(r) {
    var st = statusOf(r);
    var art = el('article', 'bylaw ' + st.cls);
    art.setAttribute('id', 'r-' + r.slug);
    art.setAttribute('aria-labelledby', 'h-' + r.slug);

    // Two columns on a desktop: the side carries number, status and dates so
    // the register scans down one edge; the main column carries the words.
    // On a phone both become display:contents and the CSS reorders them.
    var side = add(art, el('div', 'bylaw-side'));
    var main = add(art, el('div', 'bylaw-main'));
    var head = add(side, el('div', 'bylaw-head'));
    add(head, el('p', 'bylaw-num', r.number));
    add(head, el('span', 'status ' + st.cls, statusLabel(r)));

    var title = lang === 'fr' ? (r.title_fr || r.title_en || r.number) : (r.title_en || r.title_fr || r.number);
    var h = add(main, el('h3', 'bylaw-title', title));
    h.setAttribute('id', 'h-' + r.slug);
    // A title borrowed from the other language is marked as such.
    if (!(lang === 'fr' ? r.title_fr : r.title_en) && (lang === 'fr' ? r.title_en : r.title_fr)) h.setAttribute('lang', other);
    var alt = lang === 'fr' ? r.title_en : r.title_fr;
    if (alt && alt !== title) {
      var ap = add(main, el('p', 'bylaw-alt', alt));
      ap.setAttribute('lang', other);
    }

    var sum = lang === 'fr' ? r.summary_fr : r.summary_en;
    var sumOther = lang === 'fr' ? r.summary_en : r.summary_fr;
    if (sum) add(main, el('p', 'bylaw-summary', sum));
    else if (sumOther) {
      var sp = add(main, el('p', 'bylaw-summary'));
      sp.setAttribute('lang', other);
      sp.textContent = sumOther;
      add(main, el('p', 'otherlang', UI.summaryOtherLang));
    }

    var dl = add(side, el('dl', 'bylaw-dates'));
    var draft = st.group === 'draft';
    dateRow(dl, UI.adopted, r.adopted, draft ? UI.notAdopted : UI.notRecorded);
    dateRow(dl, UI.inForce, r.inForce, draft ? UI.notInForce : UI.notRecorded);
    // "None recorded" only when nothing in the register says it was amended.
    dateRow(dl, UI.amended, r.amended, r.amendedBy.length ? UI.notRecorded : UI.noneRecorded);

    textBlock(main, lang === 'fr' ? r.facts_fr : r.facts_en, lang === 'fr' ? r.facts_en : r.facts_fr,
      'bylaw-facts', UI.keyRules, UI.factsOtherLang);

    if (draft && r.nextStep) {
      var ns = add(main, el('p', 'bylaw-next'));
      add(ns, el('span', 'bl', UI.nextStep + ' '));
      var nsText = add(ns, el('span', null, r.nextStep));
      if (lang === 'fr') { nsText.setAttribute('lang', 'en'); ns.appendChild(doc.createTextNode(' ' + UI.langTag)); }
      var nd = fmtDate(r.nextStepDate);
      if (nd) ns.appendChild(doc.createTextNode(' · ' + UI.nextStepDate + ' ' + nd));
    }

    historyLine(main, UI.amends, r.amends);
    historyLine(main, UI.amendedBy, r.amendedBy);

    var metaBits = add(main, el('dl', 'bylaw-meta'));
    function metaRow(label, value, valueLang) {
      if (!value) return;
      var d = add(metaBits, el('div'));
      add(d, el('dt', null, label + (lang === 'fr' ? '\u00a0:' : ':')));
      var dd = add(d, el('dd', null, value));
      if (valueLang) dd.setAttribute('lang', valueLang);
    }
    metaRow(UI.category, r.category ? catName(r.category) : '');
    metaRow(UI.topics, r.topics.map(topicTag).join(', '));
    metaRow(UI.enforcedBy, r.enforced ? enforcedName(r.enforced) : '');
    // Fine ranges are curated in English only; tag them so the FR page is honest.
    metaRow(UI.fines, r.fines ? r.fines + (lang === 'fr' ? ' ' + UI.langTag : '') : '', lang === 'fr' ? 'en' : null);

    var links = add(main, el('p', 'bylaw-links'));
    var off = officialHref(r.official);
    if (off) {
      var a = add(links, el('a', 'lk-official', UI.official));
      a.setAttribute('href', off);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener');
      add(a, el('span', 'visually-hidden', ' ' + UI.newTab));
    } else {
      add(links, el('span', 'lk-missing', r.official ? UI.officialUnverified : UI.officialMissing));
    }
    var ex = observerHref(r.explainer);
    if (ex) {
      var e = add(links, el('a', 'lk-explainer', isCoverage(ex) ? UI.coverage : UI.explainer));
      e.setAttribute('href', ex);
    }
    return art;
  }

  /* ---------- rendering: drafts tracker ---------- */
  function renderDrafts() {
    var box = $('drafts'), body = $('drafts-list');
    if (!box || !body) return;
    clear(body);
    var drafts = records.filter(function (r) { return r.group === 'draft'; });
    box.hidden = !drafts.length;
    drafts.forEach(function (r) {
      var item = add(body, el('div', 'draft'));
      var top = add(item, el('div', 'bylaw-head'));
      add(top, el('p', 'bylaw-num', r.number));
      add(top, el('span', 'status st-draft', statusLabel(r)));
      var dt = add(item, el('p', 'draft-title', lang === 'fr' ? (r.title_fr || r.title_en) : (r.title_en || r.title_fr)));
      if (!(lang === 'fr' ? r.title_fr : r.title_en)) dt.setAttribute('lang', other);
      if (r.nextStep) {
        var ns = add(item, el('p', 'bylaw-next'));
        add(ns, el('span', 'bl', UI.nextStep + ' '));
        var t = add(ns, el('span', null, r.nextStep));
        if (lang === 'fr') { t.setAttribute('lang', 'en'); ns.appendChild(doc.createTextNode(' ' + UI.langTag)); }
        var nd = fmtDate(r.nextStepDate);
        if (nd) ns.appendChild(doc.createTextNode(' · ' + UI.nextStepDate + ' ' + nd));
      }
      var btn = add(item, el('a', 'draft-open', UI.seeCard));
      btn.setAttribute('href', '#r-' + r.slug);
      btn.addEventListener('click', function (ev) {
        if (ev && ev.preventDefault) ev.preventDefault();
        if (!matches(r, state)) set({ q: '', status: 'draft', topic: '', category: '' });
        focusCard(r.slug, true);
      });
    });
  }

  /* ---------- rendering: list + status line ---------- */
  function renderList() {
    var listBox = $('bylaw-list'), none = $('no-results'), countBox = $('result-count'), resetBtn = $('reset');
    var heading = $('register-h'), repealedNote = $('repealed-note');
    if (!listBox) return;
    var rows = filtered(state);
    clear(listBox);
    rows.forEach(function (r) { listBox.appendChild(card(r)); });

    if (heading) heading.textContent = registerHeading();
    if (repealedNote) repealedNote.hidden = !(state.status === 'repealed' || state.status === 'all');
    if (countBox) countBox.textContent = UI.count(rows.length, records.length) + UI.scopeIn(scopeBits());
    if (resetBtn) resetBtn.hidden = isDefault();

    if (none) {
      clear(none);
      none.hidden = rows.length > 0;
      if (!rows.length) {
        add(none, el('p', null, UI.noResults));
        var acts = add(none, el('p', 'acts'));
        var widened = filtered({ q: state.q, status: 'all', topic: state.topic, category: state.category });
        if (state.status !== 'all' && widened.length) {
          var w = add(acts, el('button', 'btn ghost', UI.widen(widened.length)));
          w.setAttribute('type', 'button');
          w.addEventListener('click', function () { set({ status: 'all' }); });
        }
        var rs = add(acts, el('button', 'btn ghost', UI.reset));
        rs.setAttribute('type', 'button');
        rs.addEventListener('click', resetAll);
      }
    }
  }

  function renderDataNote() {
    var box = $('data-note'); if (!box) return;
    clear(box);
    var when = fmtDate(str(meta.generated_at).slice(0, 10)) || UI.notRecorded;
    add(box, el('span', null, UI.dataNote(records.length, when) + ' '));
    add(box, el('span', null, UI.gapsNote));
  }

  // The topic and status buttons are rebuilt on every render; without this a
  // keyboard user who pressed Enter on one was dropped back to <body>.
  function focusedKey() {
    var a = doc.activeElement;
    return a && a.getAttribute ? a.getAttribute('data-k') : null;
  }
  function refocus(key) {
    if (!key) return;
    var box = $(key.indexOf('topic-') === 0 ? 'topics' : 'status-filter');
    if (!box || !box.children) return;
    for (var i = 0; i < box.children.length; i++) {
      if (box.children[i].getAttribute('data-k') === key) { box.children[i].focus(); return; }
    }
  }

  function render() {
    var keep = focusedKey();
    var search = $('search');
    if (search && search.value !== state.q) search.value = state.q;
    var qc = $('search-clear'); if (qc) qc.hidden = !state.q;
    renderStatus();
    renderTopics();
    renderCategory();
    renderList();
    refocus(keep);
  }

  function resetAll() {
    set({ q: '', status: 'current', topic: '', category: '' });
    var s = $('search'); if (s && s.focus) s.focus();
  }

  function focusCard(slug, push) {
    var n = $('r-' + slug);
    if (!n) return;
    if (push && global.history && global.history.replaceState) {
      try { global.history.replaceState(null, '', global.location.pathname + query() + '#r-' + slug); } catch (e) {}
    }
    n.setAttribute('tabindex', '-1');
    if (n.scrollIntoView) { try { n.scrollIntoView({ block: 'start' }); } catch (e) { n.scrollIntoView(); } }
    if (n.focus) { try { n.focus({ preventScroll: true }); } catch (e) { n.focus(); } }
  }

  /* ---------- wiring ---------- */
  var wired = false;
  function wire() {
    if (wired) return; wired = true;
    var search = $('search'), timer = null;
    if (search) {
      search.setAttribute('placeholder', UI.searchPh);
      search.addEventListener('input', function () {
        var v = str(search.value).slice(0, 120);
        clearTimeout(timer);
        timer = setTimeout(function () { if (v !== state.q) set({ q: v }, false); }, 120);
      });
      search.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && e.preventDefault) e.preventDefault();
        if (e.key === 'Escape' && state.q) { set({ q: '' }, false); }
      });
    }
    var qc = $('search-clear');
    if (qc) {
      qc.setAttribute('aria-label', UI.clear);
      qc.addEventListener('click', function () { set({ q: '' }); if (search && search.focus) search.focus(); });
    }
    var sel = $('category');
    if (sel) sel.addEventListener('change', function () { set({ category: CAT_BY_SLUG[sel.value] ? sel.value : '' }); });
    var rb = $('reset');
    if (rb) { rb.textContent = UI.reset; rb.addEventListener('click', resetAll); }
    var sg = $('status-filter'); if (sg) sg.setAttribute('aria-label', UI.statusGroup);
    global.addEventListener('popstate', function () { readURL(); render(); });
  }

  function init(data) {
    var raw = data && Array.isArray(data.records) ? data.records : null;
    if (!raw) throw new Error('bylaws.json has no records array');
    meta = data;
    var seen = {};
    records = raw.filter(function (r) { return r && str(r.bylaw_number); })
      .map(function (r) { return prepare(r, seen); })
      .sort(compareRecords);
    byNumber = {};
    records.forEach(function (r) { byNumber[r.number] = r; });
    if (!records.length) throw new Error('bylaws.json is empty');

    var shell = $('register-shell'); if (shell) shell.setAttribute('data-state', 'live');
    var fb = $('fallback-note'); if (fb) fb.hidden = true;
    readURL();
    wire();
    renderDrafts();
    renderDataNote();
    render();
    var t = targetSlug(); if (t) focusCard(t, false);
  }

  function fail() {
    var shell = $('register-shell'); if (shell) shell.setAttribute('data-state', 'fallback');
    var fb = $('fallback-note'); if (fb) { fb.hidden = false; fb.textContent = UI.loadFailed; }
    var countBox = $('result-count'); if (countBox) countBox.textContent = '';
  }

  // Exposed for the regression test only; the page never reads it.
  global.OO_BYLAWS = { fmtDate: fmtDate, officialHref: officialHref, observerHref: observerHref, slugFor: slugFor, state: state };

  if (typeof global.fetch !== 'function') { fail(); return; }
  global.fetch(DATA_URL, { cache: 'no-store' })
    .then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(init)
    .catch(fail);
})(window);
