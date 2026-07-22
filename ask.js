/* OrmstownGPT — chat client for /en/ask/ and /fr/posez-une-question/.
   Two assistants (legal / council) selected by a tab; each POST carries an
   `assistant` field. Same discipline as front-page.js: everything from the
   network (answers, citation titles, source lists) renders with textContent
   only — never innerHTML — and citation links are whitelisted to the official
   town site (ormstown.ca) or relative paths. Any failure leaves the static
   page content usable. */
(function () {
  'use strict';

  var ENDPOINT = 'https://seneca.strai.ca/webhook/observer-ask';
  var SOURCES_URL = '/ogpt-sources.json';
  var LANG = document.documentElement.getAttribute('lang') === 'fr' ? 'fr' : 'en';
  var MAX_HISTORY = 8; /* 4 exchanges per assistant */
  var TIMEOUT_MS = 45000;

  var STRINGS = {
    en: {
      bot: 'OrmstownGPT',
      you: 'You',
      thinking: 'Consulting the documents…',
      network: 'The assistant could not be reached. Check your connection and try again, or browse the bylaws index below.',
      upstream: 'The document assistant is temporarily unavailable. Please try again in a few minutes.',
      bad: 'Please check your question — it must be between 3 and 600 characters.',
      limited: "The Observer's reading room is at capacity for today — please come back tomorrow.",
      switched: { legal: 'Now answering as the Legal & Regulations assistant.', council: 'Now answering as the Council & Community assistant.' },
      docCount: function (n) { return n + ' official documents indexed.'; }
    },
    fr: {
      bot: 'OrmstownGPT',
      you: 'Vous',
      thinking: 'Consultation des documents…',
      network: "Impossible de joindre l'assistant. Vérifiez votre connexion et réessayez, ou consultez l'index des règlements ci-dessous.",
      upstream: "L'assistant documentaire est temporairement indisponible. Veuillez réessayer dans quelques minutes.",
      bad: 'Veuillez vérifier votre question — elle doit contenir entre 3 et 600 caractères.',
      limited: "La salle de lecture de l'Observer est au maximum pour aujourd'hui — revenez demain.",
      switched: { legal: 'Réponses fournies par l’assistant Règlements & taxes.', council: 'Réponses fournies par l’assistant Conseil & communauté.' },
      docCount: function (n) { return n + ' documents officiels indexés.'; }
    }
  }[LANG];

  var ASSISTANTS = ['legal', 'council'];
  var assistant = 'legal';
  var histories = { legal: [], council: [] };
  var lastAnnounced = null;
  var busy = false;

  function el(tag, cls, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (parent) parent.appendChild(e);
    return e;
  }

  function validCiteUrl(u) {
    if (typeof u !== 'string') return false;
    if (/^https:\/\/(www\.)?ormstown\.ca\//.test(u)) return true;
    return /^\/[^\s]*$/.test(u) && u.indexOf('//') !== 0;
  }

  /* Plain text from the model → paragraphs; "- " lines → list items. */
  function renderAnswer(container, text) {
    String(text).split(/\n{2,}/).forEach(function (block) {
      var lines = block.split('\n').filter(function (l) { return l.trim() !== ''; });
      if (!lines.length) return;
      var listItems = [], plain = [];
      lines.forEach(function (line) {
        if (/^\s*-\s+/.test(line)) listItems.push(line.replace(/^\s*-\s+/, ''));
        else plain.push(line);
      });
      if (plain.length) el('p', null, container).textContent = plain.join(' ');
      if (listItems.length) {
        var ul = el('ul', null, container);
        listItems.forEach(function (li) { el('li', null, ul).textContent = li; });
      }
    });
  }

  function addMessage(role, text, citations, isError) {
    var thread = document.getElementById('ask-thread');
    if (!thread) return null;
    var msg = el('div', 'msg ' + (role === 'user' ? 'msg-user' : 'msg-bot') + (isError ? ' msg-error' : ''), thread);
    el('div', 'msg-who', msg).textContent = role === 'user' ? STRINGS.you : STRINGS.bot;
    renderAnswer(el('div', 'msg-text', msg), text);
    if (citations && citations.length) {
      var wrap = el('div', 'msg-cites', msg);
      citations.forEach(function (c) {
        if (!c || typeof c.title !== 'string' || !c.title) return;
        var node;
        if (validCiteUrl(c.url)) {
          node = el('a', 'cite-chip', wrap);
          node.setAttribute('href', c.url);
          node.setAttribute('target', '_blank');
          node.setAttribute('rel', 'noopener');
        } else {
          node = el('span', 'cite-chip', wrap);
        }
        node.textContent = '\u{1F4C4} ' + c.title;
      });
    }
    msg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    return msg;
  }

  function announceSwitch() {
    if (lastAnnounced === assistant) return;
    lastAnnounced = assistant;
    var thread = document.getElementById('ask-thread');
    if (!thread) return;
    var note = el('div', 'msg-switch', thread);
    note.textContent = STRINGS.switched[assistant];
  }

  function setBusy(b) {
    busy = b;
    var input = document.getElementById('ask-q');
    var btn = document.getElementById('ask-send');
    var status = document.getElementById('ask-status');
    if (input) input.disabled = b;
    if (btn) btn.disabled = b;
    if (status) status.textContent = b ? STRINGS.thinking : '';
  }

  function ask(question) {
    if (busy) return;
    question = String(question || '').trim();
    if (question.length < 3 || question.length > 600) {
      addMessage('bot', STRINGS.bad, null, true);
      return;
    }
    announceSwitch();
    var current = assistant;
    var prior = histories[current].slice(-MAX_HISTORY);
    addMessage('user', question);
    setBusy(true);

    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS) : null;

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question, lang: LANG, assistant: current, history: prior }),
      signal: ctrl ? ctrl.signal : undefined
    })
      .then(function (r) {
        return r.json()
          .then(function (data) { return { status: r.status, data: data }; })
          .catch(function () { return { status: r.status, data: null }; });
      })
      .then(function (res) {
        var data = res.data || {};
        var serverMsg = LANG === 'fr' ? data.message_fr : data.message_en;
        if (res.status === 200 && typeof data.answer === 'string' && data.answer) {
          var cites = Array.isArray(data.citations) ? data.citations : [];
          addMessage('bot', data.answer, cites);
          histories[current].push({ role: 'user', text: question });
          histories[current].push({ role: 'model', text: data.answer.slice(0, 1200) });
          if (histories[current].length > MAX_HISTORY) histories[current] = histories[current].slice(-MAX_HISTORY);
        } else if (res.status === 429) {
          addMessage('bot', serverMsg || STRINGS.limited, null, true);
        } else if (res.status === 400) {
          addMessage('bot', serverMsg || STRINGS.bad, null, true);
        } else {
          addMessage('bot', serverMsg || STRINGS.upstream, null, true);
        }
      })
      .catch(function () { addMessage('bot', STRINGS.network, null, true); })
      .then(function () {
        if (timer) clearTimeout(timer);
        setBusy(false);
        var input = document.getElementById('ask-q');
        if (input) input.focus();
      });
  }

  function setAssistant(next) {
    if (ASSISTANTS.indexOf(next) < 0 || next === assistant) return;
    assistant = next;
    var panel = document.getElementById('ask-panel');
    if (panel) panel.setAttribute('data-assistant', next);
    document.querySelectorAll('.ask-tab').forEach(function (t) {
      var on = t.getAttribute('data-assistant') === next;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    document.querySelectorAll('#ask-sources-list [data-assistant]').forEach(function (g) {
      g.style.display = g.getAttribute('data-assistant') === next ? '' : 'none';
    });
  }

  function wireForm() {
    var form = document.getElementById('ask-form');
    var input = document.getElementById('ask-q');
    document.querySelectorAll('.ask-tab').forEach(function (t) {
      t.addEventListener('click', function () { setAssistant(t.getAttribute('data-assistant')); if (input) input.focus(); });
    });
    if (!form || !input) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = input.value;
      input.value = '';
      ask(q);
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        form.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    });
    document.querySelectorAll('.starter-chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var a = btn.getAttribute('data-assistant');
        if (a) setAssistant(a);
        var q = btn.getAttribute('data-q') || btn.textContent;
        input.value = '';
        ask(q);
      });
    });
  }

  /* Upgrade the static source list from /ogpt-sources.json (version 2).
     On any failure the static fallback stays untouched. */
  function loadSources() {
    var target = document.getElementById('ask-sources-list');
    if (!target) return;
    fetch(SOURCES_URL)
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (data) {
        if (!data || data.version !== 2 || !data.assistants) return;
        var frag = document.createDocumentFragment();
        ASSISTANTS.forEach(function (key) {
          var a = data.assistants[key];
          if (!a || !Array.isArray(a.categories)) return;
          var group = el('div', null, frag);
          group.setAttribute('data-assistant', key);
          if (key !== assistant) group.style.display = 'none';
          var h = el('div', 'src-group-head', group);
          h.textContent = (LANG === 'fr' ? a.name_fr : a.name_en) || key;
          a.categories.forEach(function (cat) {
            if (!cat || typeof cat.type !== 'string' || !Array.isArray(cat.documents) || !cat.documents.length) return;
            var det = document.createElement('details');
            det.className = 'src-cat';
            el('summary', null, det).textContent = cat.type + ' (' + cat.documents.length + ')';
            var ul = el('ul', 'src-list', det);
            cat.documents.forEach(function (d) {
              if (!d || typeof d.title !== 'string' || !d.title) return;
              var li = el('li', null, ul);
              var label = d.title + (d.year ? ' (' + d.year + ')' : '');
              if (validCiteUrl(d.url)) {
                var link = el('a', null, li);
                link.setAttribute('href', d.url);
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener');
                link.textContent = label;
              } else {
                li.textContent = label;
              }
            });
            group.appendChild(det);
          });
        });
        if (!frag.childNodes.length) return;
        while (target.firstChild) target.removeChild(target.firstChild);
        target.appendChild(frag);
        var count = document.getElementById('ask-doc-count');
        if (count && typeof data.document_count === 'number') count.textContent = STRINGS.docCount(data.document_count);
      })
      .catch(function () { /* keep static fallback */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { wireForm(); loadSources(); });
  } else {
    wireForm();
    loadSources();
  }
})();
