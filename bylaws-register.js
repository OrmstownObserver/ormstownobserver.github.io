/* Bilingual bylaw register renderer.
   The static table in each page remains as a fallback if this JSON load fails. */
(function () {
  'use strict';

  var DATA_URL = '/dist/bylaws.json';
  var lang = /\/fr\//.test(location.pathname) ? 'fr' : 'en';
  var labels = {
    en: {
      all: 'All',
      search: 'Search bylaws...',
      count: function (n) { return n + ' bylaw' + (n === 1 ? '' : 's'); },
      noResults: 'No bylaws match your search. Try different terms or clear the filter.',
      bylaw: 'Bylaw #',
      title: 'Title & Summary',
      category: 'Category',
      status: 'Status',
      date: 'In Force',
      official: 'Official document',
      explainer: 'Observer explainer',
      amended: 'Last amended',
      enforced: 'Enforced by',
      fines: 'Fines',
      note: 'Unofficial public-interest index. French official documents published by the municipality remain the authoritative source.'
    },
    fr: {
      all: 'Tous',
      search: 'Rechercher des règlements...',
      count: function (n) { return n + ' règlement' + (n === 1 ? '' : 's'); },
      noResults: 'Aucun règlement ne correspond à votre recherche. Essayez d’autres termes ou effacez le filtre.',
      bylaw: 'Règlement',
      title: 'Titre et résumé',
      category: 'Catégorie',
      status: 'Statut',
      date: 'En vigueur',
      official: 'Document officiel',
      explainer: 'Explicateur Observer',
      amended: 'Modifié',
      enforced: 'Application',
      fines: 'Amendes',
      note: 'Index non officiel d’intérêt public. Les documents officiels français publiés par la municipalité demeurent la source faisant autorité.'
    }
  }[lang];

  var statusClass = {
    'In force': 'status-active',
    'Amended': 'status-amended',
    'Repealed': 'status-repealed',
    'Draft': 'status-proposed'
  };

  function text(value) {
    return value == null ? '' : String(value);
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function append(tag, className, parent, value) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (value != null) node.textContent = value;
    if (parent) parent.appendChild(node);
    return node;
  }

  function formatDate(value) {
    return value || '';
  }

  function titleFor(row) {
    return lang === 'fr'
      ? (row.title_fr || row.title_en || row.bylaw_number)
      : (row.title_en || row.title_fr || row.bylaw_number);
  }

  function secondaryTitleFor(row) {
    return lang === 'fr' ? row.title_en : row.title_fr;
  }

  function searchable(row) {
    return [
      row.bylaw_number, row.title_en, row.title_fr, row.status, row.category,
      row.enforced_by, row.fines, (row.topics || []).join(' '), (row.key_facts_en || []).join(' ')
    ].join(' ').toLowerCase();
  }

  function buildHeader(table) {
    var thead = table.querySelector('thead');
    if (!thead) return;
    clear(thead);
    var tr = append('tr', null, thead);
    [labels.bylaw, labels.title, labels.category, labels.status, labels.date].forEach(function (label) {
      append('th', null, tr, label);
    });
  }

  function renderRows(rows, tbody) {
    clear(tbody);
    rows.forEach(function (row) {
      var tr = append('tr', 'bylaw-row', tbody);
      tr.setAttribute('data-cat', row.category || '');
      tr.setAttribute('data-keywords', searchable(row));

      append('td', 'td-num', tr, row.bylaw_number || '');

      var titleTd = append('td', 'td-title', tr);
      var title = titleFor(row);
      var link = row.explainer && row.explainer[lang] ? row.explainer[lang] : row.official_url;
      if (link) {
        var a = append('a', null, titleTd, title);
        a.href = link;
        if (/^https?:\/\//.test(link)) {
          a.target = '_blank';
          a.rel = 'noopener';
        }
      } else {
        append('strong', null, titleTd, title);
      }
      var secondary = secondaryTitleFor(row);
      if (secondary && secondary !== title) append('div', 'td-desc', titleTd, secondary);

      if (row.key_facts_en && row.key_facts_en.length) {
        var ul = append('ul', 'td-facts', titleTd);
        row.key_facts_en.forEach(function (fact) { append('li', null, ul, fact); });
      }

      var links = append('div', 'td-links', titleTd);
      if (row.explainer && row.explainer[lang]) {
        var explainer = append('a', null, links, labels.explainer);
        explainer.href = row.explainer[lang];
      }
      if (row.official_url) {
        var official = append('a', null, links, labels.official);
        official.href = row.official_url;
        official.target = '_blank';
        official.rel = 'noopener';
      }

      if (row.enforced_by || row.fines) {
        var meta = append('div', 'td-desc', titleTd);
        var parts = [];
        if (row.enforced_by) parts.push(labels.enforced + ': ' + row.enforced_by);
        if (row.fines) parts.push(labels.fines + ': ' + row.fines);
        meta.textContent = parts.join(' · ');
      }

      var catTd = append('td', 'td-cat', tr);
      append('span', 'cat-badge', catTd, row.category || '');
      if (row.topics && row.topics.length) append('div', 'topic-list', catTd, row.topics.join(', '));

      var statusTd = append('td', 'td-status', tr);
      append('span', 'status ' + (statusClass[row.status] || 'status-amended'), statusTd, row.status || '');

      var dateTd = append('td', 'td-date', tr, formatDate(row.adopted_date));
      if (row.amended_date) append('div', 'topic-list', dateTd, labels.amended + ': ' + row.amended_date);
    });
  }

  function renderChips(rows, chipsEl, onChange) {
    clear(chipsEl);
    var active = 'all';
    var cats = Array.from(new Set(rows.map(function (row) { return row.category; }).filter(Boolean))).sort();
    function make(label, value) {
      var chip = append('button', 'chip' + (value === active ? ' active' : ''), chipsEl, label);
      chip.type = 'button';
      chip.setAttribute('data-cat', value);
      chip.addEventListener('click', function () {
        active = value;
        Array.from(chipsEl.querySelectorAll('.chip')).forEach(function (node) {
          node.classList.toggle('active', node.getAttribute('data-cat') === active);
        });
        onChange(active);
      });
    }
    make(labels.all, 'all');
    cats.forEach(function (cat) { make(cat, cat); });
  }

  function init(data) {
    var table = document.getElementById('bylaw-table');
    var tbody = document.getElementById('bylaw-body');
    var search = document.getElementById('search');
    var chips = document.getElementById('chips');
    var noResults = document.getElementById('no-results');
    var count = document.getElementById('result-count');
    var note = document.getElementById('bylaw-source-note');
    if (!table || !tbody || !search || !chips || !noResults || !count) return;

    var rows = Array.isArray(data.records) ? data.records : [];
    var activeCat = 'all';
    search.placeholder = labels.search;
    noResults.textContent = labels.noResults;
    if (note) note.textContent = labels.note;
    buildHeader(table);

    function filter() {
      var q = search.value.toLowerCase().trim();
      var filtered = rows.filter(function (row) {
        var catMatch = activeCat === 'all' || row.category === activeCat;
        var qMatch = !q || searchable(row).indexOf(q) !== -1;
        return catMatch && qMatch;
      });
      renderRows(filtered, tbody);
      noResults.style.display = filtered.length ? 'none' : 'block';
      count.textContent = labels.count(filtered.length);
    }

    renderChips(rows, chips, function (cat) { activeCat = cat; filter(); });
    search.addEventListener('input', filter);
    filter();
  }

  fetch(DATA_URL, { cache: 'no-store' })
    .then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(init)
    .catch(function () {
      var count = document.getElementById('result-count');
      if (count) count.textContent = '';
    });
})();
