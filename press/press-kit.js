/* ============================================================
   Press kit renderer — fills a press-kit shell from its kit.json.
   ------------------------------------------------------------
   Follows the same discipline as front-page.js and ask.js:
   the DOM is built with document.createElement + textContent,
   NEVER innerHTML, because kit.json is content that may in future
   arrive from Notion. URLs are whitelisted before they are ever
   written to an href or src.

   A shell supplies two things and nothing else:
     <div id="press-kit" data-kit="kit.json" data-lang="en"></div>
   Everything a reader sees comes from kit.json. To publish a new
   press kit you add a folder with a kit.json and two shells — you
   do not touch this file. See /PRESS-KIT.md.

   Bilingual convention matches front-page.json: every human
   string is a pair of sibling keys, `x_en` / `x_fr`. A missing
   _fr falls back to _en rather than rendering an empty node, so a
   half-translated kit degrades to readable instead of blank.
   ============================================================ */
(function () {
  'use strict';

  /* ── Interface strings (chrome only; all content is in kit.json) ── */
  var UI = {
    en: {
      briefing: 'Media briefing',
      published: 'Published', updated: 'Updated', status: 'Status',
      inThisBriefing: 'In this briefing', jumpTo: 'Jump to section',
      print: 'Print / save as PDF', copy: 'Copy link', copied: 'Link copied',
      email: 'Email the Observer', frVersion: 'Version française', enVersion: 'English version',
      glance: 'The story at a glance', numbers: 'Key numbers',
      why: 'Why it matters', people: 'Key people', timeline: 'Timeline',
      findings: 'The findings', questions: 'Questions raised',
      documents: 'Document evidence', responses: "Other parties' position",
      context: 'Legal &amp; procedural context', media: 'Media assets',
      sources: 'Source library', contact: 'Media contact',
      navOverview: 'Overview', navTimeline: 'Timeline', navFindings: 'Findings',
      navQuestions: 'Questions', navDocuments: 'Documents', navResponses: 'Responses',
      navMedia: 'Media', navSources: 'Sources', navContact: 'Contact',
      whyItMatters: 'Why it matters', view: 'View', download: 'Download',
      source: 'Source', primary: 'Primary source', document: 'Document',
      all: 'All', noneInCategory: 'No documents in this category.',
      askedOf: 'Put to', onDate: 'on', asOf: 'As of',
      legendHead: 'How to read the labels on this page',
      sourceRef: 'Source', seeDoc: 'See document',
      paraphrase: 'Paraphrase — not a direct quotation',
      noticeHold: 'Hold for verification', noticeDisclosure: 'Disclosure',
      noticeUpdate: 'Update', noticeCorrection: 'Correction',
      loading: 'Loading the briefing…',
      failed: 'This briefing could not be loaded. Please reload the page, or email',
      st: { confirmed: 'Confirmed', documented: 'Documented', disputed: 'Disputed',
            alleged: 'Alleged', unanswered: 'Unanswered', analysis: 'Analysis' },
      stHelp: { confirmed: 'verified by the Observer against more than one independent source',
                documented: 'stated in a published document linked on this page',
                disputed: 'the parties give different accounts of the same fact',
                alleged: 'asserted by someone, not independently verified',
                unanswered: 'a question the Observer has put and not had answered',
                analysis: "the Observer's own reading, not a finding of fact" },
      cat: { court: 'Court', municipal: 'Municipal', correspondence: 'Correspondence',
             ati: 'Access to information', regulation: 'Regulations', photo: 'Photos',
             video: 'Video', other: 'Other' },
      kind: { photo: 'Photograph', logo: 'Logo', video: 'Video', screenshot: 'Screenshot',
              map: 'Map', headshot: 'Headshot', broll: 'B-roll', graphic: 'Graphic' },
      resp: { received: 'Response received', invited: 'Invited to respond',
              declined: 'Declined to comment', none: 'No response received',
              pleaded: 'Position as pleaded' },
      contactName: 'Contact', contactOrg: 'Organization', contactEmail: 'Email',
      contactPhone: 'Phone', contactWeb: 'Website', contactAvail: 'Interview availability',
      backTo: 'The Ormstown Observer'
    },
    fr: {
      briefing: 'Dossier de presse',
      published: 'Publié', updated: 'Mise à jour', status: 'État',
      inThisBriefing: 'Dans ce dossier', jumpTo: 'Aller à la section',
      print: 'Imprimer / PDF', copy: 'Copier le lien', copied: 'Lien copié',
      email: 'Écrire à l’Observer', frVersion: 'Version française', enVersion: 'English version',
      glance: 'L’essentiel en un coup d’œil', numbers: 'Chiffres clés',
      why: 'Pourquoi c’est important', people: 'Personnes clés', timeline: 'Chronologie',
      findings: 'Les constats', questions: 'Questions soulevées',
      documents: 'Pièces au dossier', responses: 'La position des autres parties',
      context: 'Contexte juridique et procédural', media: 'Matériel média',
      sources: 'Bibliothèque des sources', contact: 'Contact média',
      navOverview: 'Aperçu', navTimeline: 'Chronologie', navFindings: 'Constats',
      navQuestions: 'Questions', navDocuments: 'Documents', navResponses: 'Réponses',
      navMedia: 'Média', navSources: 'Sources', navContact: 'Contact',
      whyItMatters: 'Pourquoi c’est important', view: 'Consulter', download: 'Télécharger',
      source: 'Source', primary: 'Source primaire', document: 'Document',
      all: 'Tout', noneInCategory: 'Aucun document dans cette catégorie.',
      askedOf: 'Adressée à', onDate: 'le', asOf: 'En date du',
      legendHead: 'Comment lire les étiquettes de cette page',
      sourceRef: 'Source', seeDoc: 'Voir le document',
      paraphrase: 'Paraphrase — ce n’est pas une citation directe',
      noticeHold: 'Retenue pour vérification', noticeDisclosure: 'Divulgation',
      noticeUpdate: 'Mise à jour', noticeCorrection: 'Correction',
      loading: 'Chargement du dossier…',
      failed: 'Ce dossier n’a pas pu être chargé. Rechargez la page ou écrivez à',
      st: { confirmed: 'Confirmé', documented: 'Documenté', disputed: 'Contesté',
            alleged: 'Allégué', unanswered: 'Sans réponse', analysis: 'Analyse' },
      stHelp: { confirmed: 'vérifié par l’Observer auprès de plus d’une source indépendante',
                documented: 'énoncé dans un document publié et lié sur cette page',
                disputed: 'les parties donnent des versions différentes du même fait',
                alleged: 'affirmé par quelqu’un, sans vérification indépendante',
                unanswered: 'une question posée par l’Observer restée sans réponse',
                analysis: 'la lecture de l’Observer, et non un constat de fait' },
      cat: { court: 'Tribunaux', municipal: 'Municipal', correspondence: 'Correspondance',
             ati: 'Accès à l’information', regulation: 'Règlements', photo: 'Photos',
             video: 'Vidéo', other: 'Autres' },
      kind: { photo: 'Photographie', logo: 'Logo', video: 'Vidéo', screenshot: 'Capture d’écran',
              map: 'Carte', headshot: 'Portrait', broll: 'Images d’illustration', graphic: 'Graphique' },
      resp: { received: 'Réponse reçue', invited: 'Invitée à répondre',
              declined: 'A refusé de commenter', none: 'Aucune réponse reçue',
              pleaded: 'Position plaidée' },
      contactName: 'Personne-ressource', contactOrg: 'Organisation', contactEmail: 'Courriel',
      contactPhone: 'Téléphone', contactWeb: 'Site web', contactAvail: 'Disponibilité pour entrevue',
      backTo: 'L’Ormstown Observer'
    }
  };

  var CAT_ORDER = ['court', 'municipal', 'correspondence', 'ati', 'regulation', 'photo', 'video', 'other'];
  var ST_ORDER  = ['confirmed', 'documented', 'disputed', 'alleged', 'unanswered', 'analysis'];

  var lang, T, KIT, docsById = {};

  /* ── DOM helpers ───────────────────────────────────────────── */
  function el(tag, cls, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (parent) parent.appendChild(e);
    return e;
  }
  function txt(tag, cls, parent, str) {
    var e = el(tag, cls, parent);
    if (str != null) e.textContent = String(str);
    return e;
  }
  /* Picks the reader's language, falling back to English so a
     half-translated kit degrades to readable, never to blank. */
  function L(obj, base) {
    if (!obj) return '';
    var v = obj[base + '_' + lang];
    if (v == null || v === '') v = obj[base + '_en'];
    if (v == null || v === '') v = obj[base + '_fr'];
    return v == null ? '' : v;
  }
  function has(obj, base) { return L(obj, base) !== ''; }

  /* ── URL whitelisting ──────────────────────────────────────
     Anything that becomes an href or src passes through here.
     Site-relative paths, https, mailto and tel only. */
  function safeUrl(u) {
    if (typeof u !== 'string' || !u) return null;
    if (/^\/[^/\s]/.test(u) || u === '/') return u;
    if (/^https:\/\/[^\s"'<>]+$/i.test(u)) return u;
    if (/^mailto:[^\s"'<>]+$/i.test(u)) return u;
    if (/^tel:[+0-9().\- ]+$/i.test(u)) return u;
    return null;
  }
  /* Images may only come from the site's own asset directories. */
  function safeImg(u) {
    return (typeof u === 'string' && /^\/(images|press|downloads)\/[A-Za-z0-9._\-/]+$/.test(u) && u.indexOf('..') === -1)
      ? u : null;
  }

  /* Language-aware URL pick: a document may live at a different
     address in each language (the Observer's own EN/FR coverage
     does). `x_en` / `x_fr` win over a plain `x`. */
  function pickUrl(obj, base) {
    if (!obj) return null;
    var v = obj[base + '_' + lang];
    if (v == null || v === '') v = obj[base];
    if (v == null || v === '') v = obj[base + '_en'];
    return safeUrl(v);
  }

  /* ── Inline markup ─────────────────────────────────────────
     Editors need emphasis and links inside a paragraph, but
     innerHTML is off-limits. This scans a plain string for
     **bold**, *italic* and [text](url) and builds real nodes. */
  var INLINE_RE = /(\*\*[^*]+\*\*|\*[^*\n]+\*|\[[^\]\n]+\]\([^)\s]+\))/g;
  function inline(parent, str) {
    if (str == null) return parent;
    var s = String(str), last = 0, m;
    INLINE_RE.lastIndex = 0;
    while ((m = INLINE_RE.exec(s)) !== null) {
      if (m.index > last) parent.appendChild(document.createTextNode(s.slice(last, m.index)));
      var tok = m[0], node;
      if (tok.slice(0, 2) === '**') {
        node = document.createElement('strong'); node.textContent = tok.slice(2, -2);
      } else if (tok.charAt(0) === '*') {
        node = document.createElement('em'); node.textContent = tok.slice(1, -1);
      } else {
        var cut = tok.indexOf(']('), label = tok.slice(1, cut), href = safeUrl(tok.slice(cut + 2, -1));
        if (href) {
          node = document.createElement('a');
          node.setAttribute('href', href);
          node.textContent = label;
          if (href.charAt(0) !== '/' && href.slice(0, 7) !== 'mailto:' && href.slice(0, 4) !== 'tel:') {
            node.setAttribute('target', '_blank');
            node.setAttribute('rel', 'noopener');
          }
        } else {
          node = document.createTextNode(label);
        }
      }
      parent.appendChild(node);
      last = m.index + tok.length;
    }
    if (last < s.length) parent.appendChild(document.createTextNode(s.slice(last)));
    return parent;
  }
  /* Accepts a string or an array of strings; emits one <p> each. */
  function paras(parent, value, cls) {
    var arr = Array.isArray(value) ? value : (value ? [value] : []);
    arr.forEach(function (p) { if (p) inline(el('p', cls || null, parent), p); });
    return parent;
  }

  /* ── Status chip ───────────────────────────────────────────── */
  function chip(parent, status) {
    var k = typeof status === 'string' ? status.toLowerCase() : '';
    if (ST_ORDER.indexOf(k) === -1) return null;
    var c = txt('span', 'st st-' + k, parent, T.st[k]);
    c.setAttribute('title', T.st[k] + ' — ' + T.stHelp[k]);
    return c;
  }

  /* ── Dates ─────────────────────────────────────────────────
     A kit may give a prepared label per language; otherwise an
     ISO date is formatted in the reader's locale. */
  function dateLabel(obj, base) {
    var pre = L(obj, base + '_label');
    if (pre) return pre;
    var iso = obj && obj[base];
    if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso || '';
    var d = new Date(iso.slice(0, 10) + 'T12:00:00Z');
    if (isNaN(d.getTime())) return iso;
    try {
      return d.toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA',
        { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
    } catch (e) { return iso; }
  }

  /* ── Section scaffolding ───────────────────────────────────── */
  function section(root, id, title, sub, opts) {
    var s = el('section', 'kit-section', root);
    s.id = id;
    var inner = el('div', 'kit-wrap', s);
    var head = el('div', 'kit-section-head' + ((opts && opts.column) ? ' kit-column' : ''), inner);
    var h = txt('h2', null, head, title);
    h.id = id + '-h';
    s.setAttribute('aria-labelledby', h.id);
    if (sub) paras(head, sub);
    var body = el('div', (opts && opts.column) ? 'kit-column' : null, inner);
    return body;
  }

  /* Small "Source: …" reference that resolves a document id. */
  function sourceRef(parent, ref, label) {
    if (!ref) return null;
    var d = docsById[ref];
    if (d) {
      var href = pickUrl(d, 'view') || pickUrl(d, 'download');
      var name = label || (T.sourceRef + ': ' + L(d, 'name'));
      if (href) {
        var a = txt('a', 'kit-srcref', parent, name);
        a.setAttribute('href', href);
        if (href.charAt(0) !== '/') { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
        return a;
      }
      return txt('span', 'kit-srcref', parent, name);
    }
    var direct = safeUrl(ref);
    if (direct) {
      var b = txt('a', 'kit-srcref', parent, label || T.sourceRef);
      b.setAttribute('href', direct);
      if (direct.charAt(0) !== '/') { b.setAttribute('target', '_blank'); b.setAttribute('rel', 'noopener'); }
      return b;
    }
    return null;
  }

  function icon(parent, path) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    var p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', path);
    svg.appendChild(p);
    parent.appendChild(svg);
    return svg;
  }
  var ICON = {
    print: 'M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z',
    link:  'M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7',
    mail:  'M4 4h16v16H4zM4 6l8 6 8-6',
    eye:   'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    down:  'M12 3v12M7 11l5 5 5-5M4 21h16'
  };

  /* ── HERO ──────────────────────────────────────────────────── */
  function renderHero(root) {
    var s = el('header', 'kit-section kit-hero', root);
    s.id = 'overview';
    var w = el('div', 'kit-wrap', s);

    var kick = el('div', 'kit-hero-kicker', w);
    txt('span', 'kit-flag', kick, L(KIT, 'kicker') || T.briefing);
    if (has(KIT, 'case')) txt('span', 'kit-case', kick, L(KIT, 'case'));

    inline(txt('h1', 'kit-hed', w, ''), L(KIT, 'hed'));
    if (has(KIT, 'deck')) inline(el('p', 'kit-deck', w), L(KIT, 'deck'));

    var dl = el('div', 'kit-dateline', w);
    if (KIT.date_published) {
      var a = el('span', null, dl);
      txt('strong', null, a, T.published + ': ');
      a.appendChild(document.createTextNode(dateLabel(KIT, 'date_published')));
    }
    if (KIT.date_updated) {
      var b = el('span', null, dl);
      txt('strong', null, b, T.updated + ': ');
      b.appendChild(document.createTextNode(dateLabel(KIT, 'date_updated')));
    }
    if (has(KIT, 'standing')) {
      var c = el('span', null, dl);
      txt('strong', null, c, T.status + ': ');
      c.appendChild(document.createTextNode(L(KIT, 'standing')));
    }

    var acts = el('div', 'kit-actions', w);

    var pb = el('button', 'kit-btn kit-btn-primary', acts);
    pb.type = 'button';
    icon(pb, ICON.print);
    txt('span', null, pb, T.print);
    pb.addEventListener('click', function () { window.print(); });

    var cb = el('button', 'kit-btn', acts);
    cb.type = 'button';
    icon(cb, ICON.link);
    var cbLabel = txt('span', null, cb, T.copy);
    cb.addEventListener('click', function () {
      var url = window.location.href.split('#')[0];
      var done = function () {
        cbLabel.textContent = T.copied;
        cb.setAttribute('data-copied', '1');
        setTimeout(function () { cbLabel.textContent = T.copy; cb.removeAttribute('data-copied'); }, 2400);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () {});
      } else {
        try {
          var ta = document.createElement('textarea');
          ta.value = url; ta.setAttribute('readonly', '');
          ta.style.position = 'absolute'; ta.style.left = '-9999px';
          document.body.appendChild(ta); ta.select();
          document.execCommand('copy'); document.body.removeChild(ta); done();
        } catch (e) {}
      }
    });

    var mailTo = safeUrl('mailto:' + ((KIT.contact && KIT.contact.email) || 'ormstownobserver@gmail.com')
      + '?subject=' + encodeURIComponent('[' + T.briefing + '] ' + L(KIT, 'hed')));
    if (mailTo) {
      var mb = el('a', 'kit-btn', acts);
      mb.setAttribute('href', mailTo);
      icon(mb, ICON.mail);
      txt('span', null, mb, T.email);
    }

    var alt = document.querySelector('link[rel="alternate"][hreflang="' + (lang === 'fr' ? 'en' : 'fr') + '"]');
    if (alt && alt.getAttribute('href')) {
      var ab = el('a', 'kit-btn', acts);
      ab.setAttribute('href', alt.getAttribute('href'));
      ab.setAttribute('lang', lang === 'fr' ? 'en' : 'fr');
      txt('span', null, ab, lang === 'fr' ? T.enVersion : T.frVersion);
    }

    var hero = KIT.hero;
    var hsrc = hero && safeImg(hero.src);
    if (hsrc) {
      var fig = el('figure', 'kit-figure', w);
      var img = el('img', null, fig);
      img.setAttribute('src', hsrc);
      img.setAttribute('alt', L(hero, 'alt'));
      img.setAttribute('loading', 'eager');
      if (has(hero, 'caption') || has(hero, 'credit')) {
        var fc = el('figcaption', null, fig);
        if (has(hero, 'caption')) inline(fc, L(hero, 'caption'));
        if (has(hero, 'credit')) {
          fc.appendChild(document.createTextNode(' '));
          txt('span', 'credit', fc, L(hero, 'credit'));
        }
      }
    }
  }

  /* ── NOTICES ───────────────────────────────────────────────
     Standing banners a press kit needs and an article does not: an
     embargo or verification hold, a conflict-of-interest disclosure,
     a correction. Rendered directly under the hero, before anything
     a reporter might otherwise quote. */
  var NOTICE_TONES = { hold: 1, disclosure: 1, update: 1, correction: 1 };
  function renderNotices(root) {
    var n = KIT.notices;
    if (!Array.isArray(n) || !n.length) return false;
    var w = el('div', 'kit-wrap kit-notices', root);
    n.forEach(function (it) {
      var tone = (typeof it.tone === 'string' && NOTICE_TONES[it.tone]) ? it.tone : 'update';
      var box = el('aside', 'kit-notice kit-notice-' + tone, w);
      box.setAttribute('role', tone === 'hold' ? 'alert' : 'note');
      var label = L(it, 'label') ||
        T['notice' + tone.charAt(0).toUpperCase() + tone.slice(1)] || '';
      if (label) txt('div', 'kit-notice-label', box, label);
      if (has(it, 'head')) inline(el('div', 'kit-notice-head', box), L(it, 'head'));
      paras(el('div', 'kit-notice-body', box), L(it, 'body'));
    });
    return true;
  }

  /* ── STORY AT A GLANCE ─────────────────────────────────────── */
  function renderGlance(root) {
    var g = KIT.glance;
    if (!g || !Array.isArray(g.items) || !g.items.length) return false;
    var s = el('section', 'kit-section', root);
    s.id = 'glance';
    var w = el('div', 'kit-wrap', s);
    var panel = el('div', 'kit-glance', w);
    var head = txt('h2', 'kit-glance-head', panel, L(g, 'title') || T.glance);
    head.id = 'glance-h';
    s.setAttribute('aria-labelledby', 'glance-h');
    var ul = el('ul', null, panel);
    g.items.forEach(function (it) {
      var li = el('li', null, ul);
      inline(el('span', null, li), L(it, 'text'));
      chip(li, it.status);
    });
    if (g.legend !== false) renderLegend(w, g.items);
    return true;
  }

  /* Only explains the labels the page actually uses. */
  function renderLegend(parent, items) {
    var used = {};
    (function walk(o) {
      if (!o || typeof o !== 'object') return;
      if (typeof o.status === 'string' && ST_ORDER.indexOf(o.status) !== -1) used[o.status] = 1;
      Object.keys(o).forEach(function (k) { if (o[k] && typeof o[k] === 'object') walk(o[k]); });
    })(KIT);
    void items;
    var keys = ST_ORDER.filter(function (k) { return used[k]; });
    if (keys.length < 2) return;
    var box = el('div', 'kit-legend', parent);
    box.setAttribute('aria-label', T.legendHead);
    keys.forEach(function (k) {
      var row = el('div', 'kit-legend-item', box);
      chip(row, k);
      txt('span', null, row, T.stHelp[k]);
    });
  }

  /* ── KEY NUMBERS ───────────────────────────────────────────── */
  function renderNumbers(root) {
    var n = KIT.numbers;
    if (!Array.isArray(n) || !n.length) return false;
    var body = section(root, 'numbers', L(KIT, 'numbers_title') || T.numbers, L(KIT, 'numbers_sub'));
    var grid = el('div', 'kit-numbers', body);
    n.forEach(function (it) {
      var card = el('div', 'kit-number', grid);
      txt('div', 'n-value', card, L(it, 'value'));
      txt('div', 'n-label', card, L(it, 'label'));
      if (has(it, 'note')) inline(el('div', 'n-note', card), L(it, 'note'));
      if (it.source_ref) sourceRef(el('div', 'n-src', card), it.source_ref);
    });
    return true;
  }

  /* ── WHY IT MATTERS ────────────────────────────────────────── */
  function renderWhy(root) {
    var w = KIT.why;
    if (!w || !L(w, 'body')) return false;
    var body = section(root, 'why', L(w, 'title') || T.whyItMatters, null, { column: true });
    paras(el('div', 'kit-why', body), L(w, 'body'));
    return true;
  }

  /* ── PEOPLE ────────────────────────────────────────────────── */
  function renderPeople(root) {
    var p = KIT.people;
    if (!Array.isArray(p) || !p.length) return false;
    var body = section(root, 'people', L(KIT, 'people_title') || T.people, L(KIT, 'people_sub'));
    var grid = el('div', 'kit-people', body);
    p.forEach(function (person) {
      var card = el('div', 'kit-person', grid);
      txt('div', 'p-name', card, person.name || L(person, 'name'));
      if (has(person, 'role')) inline(el('div', 'p-role', card), L(person, 'role'));
    });
    return true;
  }

  /* ── TIMELINE ──────────────────────────────────────────────── */
  function renderTimeline(root) {
    var t = KIT.timeline;
    if (!Array.isArray(t) || !t.length) return false;
    var body = section(root, 'timeline', L(KIT, 'timeline_title') || T.timeline, L(KIT, 'timeline_sub'));
    var ol = el('ol', 'kit-timeline', body);
    t.forEach(function (ev) {
      var li = el('li', 'kit-tl-item', ol);
      txt('div', 'kit-tl-date', li, dateLabel(ev, 'date'));
      var b = el('div', 'kit-tl-body', li);
      if (has(ev, 'hed')) inline(el('h3', 'kit-tl-hed', b), L(ev, 'hed'));
      if (has(ev, 'summary')) inline(el('p', 'kit-tl-sum', b), L(ev, 'summary'));
      var meta = el('div', 'kit-tl-meta', b);
      chip(meta, ev.status);
      if (ev.doc) sourceRef(meta, ev.doc);
      if (!meta.childNodes.length) b.removeChild(meta);
    });
    return true;
  }

  /* ── NARRATIVE ─────────────────────────────────────────────── */
  function renderNarrative(root) {
    var n = KIT.narrative;
    if (!Array.isArray(n) || !n.length) return false;
    var body = section(root, 'findings', L(KIT, 'narrative_title') || T.findings,
      L(KIT, 'narrative_sub'), { column: true });
    var wrap = el('div', 'kit-narrative', body);
    n.forEach(function (sec) { renderBlock(wrap, sec); });
    return true;
  }

  function renderBlock(parent, b) {
    if (!b || typeof b !== 'object') return;
    switch (b.type) {
      case 'section':
        if (has(b, 'hed')) inline(el('h3', null, parent), L(b, 'hed'));
        (Array.isArray(b.blocks) ? b.blocks : []).forEach(function (c) { renderBlock(parent, c); });
        break;
      case 'p':
        paras(parent, L(b, 'text'), b.lede ? 'lede' : null);
        break;
      case 'list': {
        var ul = el('ul', null, parent);
        (Array.isArray(b.items) ? b.items : []).forEach(function (it) {
          inline(el('li', null, ul), typeof it === 'string' ? it : L(it, 'text'));
        });
        break;
      }
      case 'callout': {
        var co = el('div', 'kit-callout', parent);
        if (has(b, 'head')) txt('div', 'c-head', co, L(b, 'head'));
        paras(co, L(b, 'body'));
        break;
      }
      case 'fact': {
        var f = el('div', 'kit-fact', parent);
        var fh = el('div', 'f-head', f);
        txt('span', null, fh, L(b, 'head'));
        chip(fh, b.status);
        if (b.source_ref) sourceRef(fh, b.source_ref);
        paras(f, L(b, 'body'));
        break;
      }
      case 'quote':
        renderQuote(parent, b);
        break;
      case 'figure': {
        var src = safeImg(b.src);
        if (!src) break;
        var fig = el('figure', 'kit-figure', parent);
        var img = el('img', null, fig);
        img.setAttribute('src', src);
        img.setAttribute('alt', L(b, 'alt'));
        img.setAttribute('loading', 'lazy');
        if (has(b, 'caption') || has(b, 'credit')) {
          var fc = el('figcaption', null, fig);
          if (has(b, 'caption')) inline(fc, L(b, 'caption'));
          if (has(b, 'credit')) { fc.appendChild(document.createTextNode(' ')); txt('span', 'credit', fc, L(b, 'credit')); }
        }
        break;
      }
      case 'sources': {
        var box = el('div', 'kit-callout', parent);
        txt('div', 'c-head', box, L(b, 'head') || T.source);
        var p = el('p', null, box);
        (Array.isArray(b.refs) ? b.refs : []).forEach(function (r, i) {
          if (i) p.appendChild(document.createTextNode(' '));
          sourceRef(p, r);
        });
        break;
      }
      default:
        break;
    }
  }

  /* Paraphrase is structurally distinct from quotation — different
     class, different typography, and an explicit label. A block
     marked `paraphrase: true` never gets quotation marks. */
  function renderQuote(parent, q) {
    var fig = el('figure', 'kit-quote' + (q.paraphrase ? ' is-paraphrase' : ''), parent);
    var bq = el('blockquote', null, fig);
    var p = el('p', null, bq);
    var body = L(q, 'text');
    inline(p, q.paraphrase ? body : '“' + body + '”');
    var citeUrl = pickUrl(q, 'cite');
    if (citeUrl) bq.setAttribute('cite', citeUrl);
    var fc = el('figcaption', null, fig);
    if (q.speaker || has(q, 'speaker')) txt('div', 'q-speaker', fc, q.speaker || L(q, 'speaker'));
    if (has(q, 'role')) inline(el('div', 'q-role', fc), L(q, 'role'));
    var meta = el('div', 'q-meta', fc);
    if (q.date) txt('span', 'kit-srcref', meta, dateLabel(q, 'date'));
    if (q.paraphrase) txt('span', 'st st-analysis', meta, T.paraphrase);
    if (q.source_ref) sourceRef(meta, q.source_ref);
    if (!meta.childNodes.length) fc.removeChild(meta);
  }

  /* ── QUESTIONS RAISED ──────────────────────────────────────── */
  function renderQuestions(root) {
    var q = KIT.questions;
    if (!Array.isArray(q) || !q.length) return false;
    var body = section(root, 'questions', L(KIT, 'questions_title') || T.questions,
      L(KIT, 'questions_sub'), { column: true });
    var ol = el('ol', 'kit-questions', body);
    q.forEach(function (it) {
      var li = el('li', 'kit-question', ol);
      inline(el('p', 'q-text', li), L(it, 'q'));
      if (has(it, 'why')) inline(el('p', 'q-why', li), L(it, 'why'));
      var foot = el('div', 'q-foot', li);
      chip(foot, it.status || 'unanswered');
      if (has(it, 'asked_of')) {
        txt('span', 'kit-srcref', foot, T.askedOf + ': ' + L(it, 'asked_of')
          + (it.asked_on ? ' · ' + dateLabel(it, 'asked_on') : ''));
      }
      if (it.source_ref) sourceRef(foot, it.source_ref);
    });
    return true;
  }

  /* ── DOCUMENT EVIDENCE ─────────────────────────────────────── */
  function renderDocuments(root) {
    var d = (KIT.documents || []).filter(function (x) { return x.featured !== false; });
    if (!d.length) return false;
    var body = section(root, 'documents', L(KIT, 'documents_title') || T.documents,
      L(KIT, 'documents_sub'));
    var grid = el('div', 'kit-docs', body);
    d.forEach(function (doc) { renderDocCard(grid, doc); });
    return true;
  }

  function renderDocCard(parent, doc) {
    var card = el('article', 'kit-doc' + (doc.primary ? ' is-primary' : ''), parent);
    var top = el('div', 'kit-doc-top', card);

    var thumb = el('div', 'kit-doc-thumb', top);
    var tsrc = safeImg(doc.thumb);
    if (tsrc) {
      var img = el('img', null, thumb);
      img.setAttribute('src', tsrc);
      img.setAttribute('alt', '');
      img.setAttribute('loading', 'lazy');
    } else {
      txt('span', 'd-glyph', thumb, (L(doc, 'type') || T.document).slice(0, 3).toUpperCase());
    }

    var meta = el('div', null, top);
    if (doc.primary) txt('span', 'kit-primary-flag', meta, T.primary);
    if (doc.ref) txt('div', 'kit-doc-id', meta, doc.ref);
    inline(el('h3', 'kit-doc-name', meta), L(doc, 'name'));
    var bits = [];
    if (L(doc, 'type')) bits.push(L(doc, 'type'));
    if (doc.date) bits.push(dateLabel(doc, 'date'));
    if (L(doc, 'source')) bits.push(L(doc, 'source'));
    if (doc.pages) bits.push(String(doc.pages));
    if (bits.length) txt('div', 'kit-doc-meta', meta, bits.join(' · '));

    if (has(doc, 'why')) {
      var why = el('div', 'kit-doc-why', card);
      txt('div', 'w-head', why, T.whyItMatters);
      inline(el('div', null, why), L(doc, 'why'));
    }

    var view = pickUrl(doc, 'view'), dl = pickUrl(doc, 'download');
    if (view || dl) {
      var acts = el('div', 'kit-doc-actions', card);
      if (view) {
        var v = el('a', 'kit-btn', acts);
        v.setAttribute('href', view);
        if (view.charAt(0) !== '/') { v.setAttribute('target', '_blank'); v.setAttribute('rel', 'noopener'); }
        icon(v, ICON.eye);
        txt('span', null, v, T.view);
        v.setAttribute('aria-label', T.view + ' — ' + L(doc, 'name'));
      }
      if (dl) {
        var g = el('a', 'kit-btn', acts);
        g.setAttribute('href', dl);
        g.setAttribute('download', '');
        icon(g, ICON.down);
        txt('span', null, g, T.download);
        g.setAttribute('aria-label', T.download + ' — ' + L(doc, 'name'));
      }
      /* Print only: the URL itself, so a paper copy stays verifiable. */
      txt('div', 'kit-doc-actions-print', card, view || dl);
    }
    if (has(doc, 'note')) inline(el('div', 'kit-doc-note', card), L(doc, 'note'));
  }

  /* ── OTHER PARTIES' POSITION ───────────────────────────────── */
  function renderResponses(root) {
    var r = KIT.responses;
    if (!Array.isArray(r) || !r.length) return false;
    var body = section(root, 'responses', L(KIT, 'responses_title') || T.responses,
      L(KIT, 'responses_sub'), { column: true });
    r.forEach(function (it) {
      var box = el('article', 'kit-response', body);
      var head = el('div', 'kit-response-head', box);
      var who = el('div', null, head);
      txt('div', 'r-party', who, L(it, 'party'));
      if (has(it, 'role')) txt('div', 'r-role', who, L(it, 'role'));
      var stKey = it.status && T.resp[it.status] ? it.status : null;
      if (stKey) txt('span', 'st st-resp-' + stKey, head, T.resp[stKey]);
      paras(el('div', 'kit-response-body', box), L(it, 'body'));
      if (it.date || it.source_ref || has(it, 'note')) {
        var foot = el('div', 'kit-response-foot', box);
        if (it.date) txt('span', null, foot, T.asOf + ' ' + dateLabel(it, 'date'));
        if (has(it, 'note')) inline(el('span', null, foot), L(it, 'note'));
        if (it.source_ref) sourceRef(foot, it.source_ref);
      }
    });
    return true;
  }

  /* ── LEGAL / PROCEDURAL CONTEXT ────────────────────────────── */
  function renderContext(root) {
    var c = KIT.context;
    if (!Array.isArray(c) || !c.length) return false;
    var body = section(root, 'context', L(KIT, 'context_title') || T.context, L(KIT, 'context_sub'));
    var grid = el('div', 'kit-explainers', body);
    c.forEach(function (it) {
      var card = el('article', 'kit-explainer', grid);
      if (has(it, 'label')) txt('div', 'x-plain', card, L(it, 'label'));
      inline(el('h3', null, card), L(it, 'title'));
      paras(card, L(it, 'body'));
      if (it.source_ref) sourceRef(card, it.source_ref);
    });
    return true;
  }

  /* ── MEDIA ASSETS ──────────────────────────────────────────── */
  function renderMedia(root) {
    var m = KIT.media;
    if (!Array.isArray(m) || !m.length) return false;
    var body = section(root, 'media', L(KIT, 'media_title') || T.media, L(KIT, 'media_sub'));
    var grid = el('div', 'kit-media', body);
    m.forEach(function (a) {
      var card = el('figure', 'kit-asset', grid);
      var frame = el('div', 'kit-asset-frame', card);
      var src = safeImg(a.preview || a.src);
      if (src) {
        var img = el('img', null, frame);
        img.setAttribute('src', src);
        img.setAttribute('alt', L(a, 'alt') || L(a, 'caption'));
        img.setAttribute('loading', 'lazy');
      } else {
        txt('span', 'a-glyph', frame, T.kind[a.kind] || L(a, 'kind') || '');
      }
      var b = el('figcaption', 'kit-asset-body', card);
      txt('div', 'kit-asset-kind', b, T.kind[a.kind] || L(a, 'kind') || '');
      if (has(a, 'title')) inline(el('div', 'kit-asset-title', b), L(a, 'title'));
      if (has(a, 'caption')) inline(el('div', 'kit-asset-cap', b), L(a, 'caption'));
      if (has(a, 'credit')) txt('div', 'kit-asset-credit', b, L(a, 'credit'));
      var dl = pickUrl(a, 'download') || pickUrl(a, 'src');
      var view = pickUrl(a, 'view');
      if (dl || view) {
        var acts = el('div', 'kit-asset-actions', card);
        if (view) {
          var v = el('a', 'kit-btn', acts);
          v.setAttribute('href', view);
          if (view.charAt(0) !== '/') { v.setAttribute('target', '_blank'); v.setAttribute('rel', 'noopener'); }
          txt('span', null, v, T.view);
          v.setAttribute('aria-label', T.view + ' — ' + (L(a, 'title') || L(a, 'caption')));
        }
        if (dl) {
          var g = el('a', 'kit-btn', acts);
          g.setAttribute('href', dl);
          g.setAttribute('download', '');
          txt('span', null, g, T.download);
          g.setAttribute('aria-label', T.download + ' — ' + (L(a, 'title') || L(a, 'caption')));
        }
      }
    });
    return true;
  }

  /* ── SOURCE LIBRARY ────────────────────────────────────────
     Grouped from the same `documents` array the evidence cards
     use — one list of documents in the content model, two views
     of it on the page. */
  function renderSources(root) {
    var d = KIT.documents;
    if (!Array.isArray(d) || !d.length) return false;
    var body = section(root, 'sources', L(KIT, 'sources_title') || T.sources, L(KIT, 'sources_sub'));

    var groups = {}, order = [];
    d.forEach(function (doc) {
      var k = (typeof doc.category === 'string' && CAT_ORDER.indexOf(doc.category) !== -1) ? doc.category : 'other';
      if (!groups[k]) { groups[k] = []; }
      groups[k].push(doc);
    });
    CAT_ORDER.forEach(function (k) { if (groups[k]) order.push(k); });

    var filters = el('div', 'kit-filters', body);
    filters.setAttribute('role', 'group');
    filters.setAttribute('aria-label', L(KIT, 'sources_title') || T.sources);
    var listWrap = el('div', null, body);
    listWrap.setAttribute('aria-live', 'polite');

    var buttons = [];
    function paint(active) {
      buttons.forEach(function (btn) { btn.setAttribute('aria-pressed', String(btn.dataset.cat === active)); });
      while (listWrap.firstChild) listWrap.removeChild(listWrap.firstChild);
      var shown = order.filter(function (k) { return active === 'all' || k === active; });
      if (!shown.length) { txt('div', 'kit-empty', listWrap, T.noneInCategory); return; }
      shown.forEach(function (k) {
        var grp = el('div', 'kit-sourcegroup', listWrap);
        txt('h3', null, grp, T.cat[k] || k);
        var ul = el('ul', 'kit-sourcelist', grp);
        groups[k].forEach(function (doc) {
          var li = el('li', 'kit-source', ul);
          txt('span', 's-date', li, doc.date ? dateLabel(doc, 'date') : '—');
          var nm = el('span', 's-name', li);
          var href = pickUrl(doc, 'view') || pickUrl(doc, 'download');
          if (href) {
            var a = txt('a', null, nm, L(doc, 'name'));
            a.setAttribute('href', href);
            if (href.charAt(0) !== '/') { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
          } else {
            txt('span', null, nm, L(doc, 'name'));
          }
          var issuer = [L(doc, 'type'), L(doc, 'source')].filter(Boolean).join(' · ');
          if (issuer) txt('span', 's-issuer', nm, issuer);
          var tail = el('span', null, li);
          if (doc.primary) txt('span', 'kit-srcref', tail, T.primary);
          chip(tail, doc.status);
        });
      });
    }

    var cats = ['all'].concat(order);
    cats.forEach(function (k) {
      var btn = el('button', 'kit-filter', filters);
      btn.type = 'button';
      btn.dataset.cat = k;
      txt('span', null, btn, k === 'all' ? T.all : (T.cat[k] || k));
      btn.appendChild(document.createTextNode(' '));
      txt('span', 'f-count', btn, k === 'all' ? d.length : groups[k].length);
      btn.addEventListener('click', function () { paint(k); });
      buttons.push(btn);
    });
    paint('all');
    return true;
  }

  /* ── MEDIA CONTACT ─────────────────────────────────────────── */
  function renderContact(root) {
    var c = KIT.contact;
    if (!c) return false;
    var s = el('section', 'kit-section', root);
    s.id = 'contact';
    var w = el('div', 'kit-wrap', s);
    var box = el('div', 'kit-contact', w);
    var head = txt('h2', 'kit-contact-head', box, L(KIT, 'contact_title') || T.contact);
    head.id = 'contact-h';
    s.setAttribute('aria-labelledby', 'contact-h');
    var grid = el('div', 'kit-contact-grid', box);

    function cell(label, value, href) {
      if (!value) return;
      var cl = el('div', 'kit-contact-cell', grid);
      txt('div', 'c-label', cl, label);
      var v = el('div', 'c-value', cl);
      var safe = href ? safeUrl(href) : null;
      if (safe) {
        var a = txt('a', null, v, value);
        a.setAttribute('href', safe);
        if (safe.slice(0, 6) === 'https:') { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener'); }
      } else {
        v.textContent = value;
      }
    }
    cell(T.contactName, c.name || L(c, 'name'));
    cell(T.contactOrg, L(c, 'org'));
    cell(T.contactEmail, c.email, c.email ? 'mailto:' + c.email : null);
    cell(T.contactPhone, c.phone, c.phone ? 'tel:' + String(c.phone).replace(/[^+0-9]/g, '') : null);
    cell(T.contactWeb, L(c, 'website_label') || L(c, 'website') || c.website, pickUrl(c, 'website'));
    cell(T.contactAvail, L(c, 'availability'));
    if (has(c, 'note')) paras(el('div', 'kit-contact-note', box), L(c, 'note'));

    if (has(KIT, 'terms')) paras(el('div', 'kit-terms kit-column', w), L(KIT, 'terms'));
    return true;
  }

  /* ── SECTION NAV ───────────────────────────────────────────
     Built from the sections that actually rendered, in page
     order, so a short kit gets a short nav. */
  function renderNav(host, items) {
    if (items.length < 3) return;
    var nav = el('nav', 'kit-nav');
    nav.setAttribute('aria-label', T.inThisBriefing);
    var inner = el('div', 'kit-nav-inner', nav);
    txt('span', 'kit-nav-flag', inner, T.inThisBriefing);

    var toggle = el('button', 'kit-nav-toggle', inner);
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    var toggleLabel = txt('span', null, toggle, items[0].label);
    txt('span', 'kit-nav-caret', toggle, '▾');

    var list = el('ul', 'kit-nav-list', inner);
    list.id = 'kit-nav-list';
    toggle.setAttribute('aria-controls', list.id);
    var links = [];
    items.forEach(function (it) {
      var li = el('li', null, list);
      var a = txt('a', null, li, it.label);
      a.setAttribute('href', '#' + it.id);
      a.addEventListener('click', function () { close(); });
      links.push(a);
    });

    function open()  { list.classList.add('is-open');    toggle.setAttribute('aria-expanded', 'true'); }
    function close() { list.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
    toggle.addEventListener('click', function () {
      list.classList.contains('is-open') ? close() : open();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target)) close();
    });

    host.parentNode.insertBefore(nav, host);

    /* Scrollspy — marks the section whose top has most recently
       passed under the nav bar. */
    var targets = items.map(function (it) { return document.getElementById(it.id); });
    var current = -1;
    function spy() {
      var y = window.scrollY + nav.offsetHeight + 24, idx = 0;
      for (var i = 0; i < targets.length; i++) {
        if (targets[i] && targets[i].offsetTop <= y) idx = i;
      }
      if (idx === current) return;
      current = idx;
      links.forEach(function (a, i) {
        if (i === idx) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
      toggleLabel.textContent = items[idx].label;
    }
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () { spy(); ticking = false; });
    }, { passive: true });
    spy();
  }

  /* ── BOOT ──────────────────────────────────────────────────── */
  function fail(host, err) {
    while (host.firstChild) host.removeChild(host.firstChild);
    var box = el('div', 'kit-status', host);
    box.appendChild(document.createTextNode(T.failed + ' '));
    var a = txt('a', null, box, 'ormstownobserver@gmail.com');
    a.setAttribute('href', 'mailto:ormstownobserver@gmail.com');
    box.appendChild(document.createTextNode('.'));
    if (window.console && err) console.error('[press-kit]', err);
  }

  function boot() {
    var host = document.getElementById('press-kit');
    if (!host) return;

    lang = host.getAttribute('data-lang') === 'fr' ? 'fr' : 'en';
    T = UI[lang];
    document.documentElement.setAttribute('lang', lang);
    /* The shared header keys its data-en/data-fr spans off this class. */
    if (lang === 'fr') document.documentElement.classList.add('lang-fr');
    try { localStorage.setItem('observerLang', lang); } catch (e) {}

    txt('div', 'kit-status', host, T.loading);

    var src = host.getAttribute('data-kit') || 'kit.json';
    if (!/^[A-Za-z0-9._\-/]+\.json$/.test(src)) { fail(host, 'bad data-kit'); return; }

    fetch(src, { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) {
        KIT = data || {};
        docsById = {};
        (KIT.documents || []).forEach(function (d) { if (d && d.id) docsById[d.id] = d; });
        render(host);
      })
      .catch(function (e) { fail(host, e); });
  }

  function render(host) {
    while (host.firstChild) host.removeChild(host.firstChild);
    host.className = 'kit-main';

    /* The shared header injects the masthead at body.firstChild, which
       lands ahead of the page's skip link and pushes it ~16 stops down
       the tab order. Restore it to first so it does its job. */
    var skip = document.querySelector('.kit-skip');
    if (skip && document.body.firstChild !== skip) {
      document.body.insertBefore(skip, document.body.firstChild);
    }

    renderHero(host);
    renderNotices(host);

    var nav = [];
    function add(id, label, drew) { if (drew) nav.push({ id: id, label: label }); }

    nav.push({ id: 'overview', label: T.navOverview });
    renderGlance(host);
    renderNumbers(host);
    renderWhy(host);
    renderPeople(host);
    add('timeline',  T.navTimeline,  renderTimeline(host));
    add('findings',  T.navFindings,  renderNarrative(host));
    add('questions', T.navQuestions, renderQuestions(host));
    add('documents', T.navDocuments, renderDocuments(host));
    add('responses', T.navResponses, renderResponses(host));
    renderContext(host);
    add('media',     T.navMedia,     renderMedia(host));
    add('sources',   T.navSources,   renderSources(host));
    add('contact',   T.navContact,   renderContact(host));

    renderNav(host, nav);

    /* Deep link into a section once the DOM exists. */
    if (window.location.hash) {
      var target = document.getElementById(window.location.hash.slice(1));
      if (target) setTimeout(function () { target.scrollIntoView(); }, 0);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
