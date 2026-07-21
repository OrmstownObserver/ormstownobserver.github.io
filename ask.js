/* Ask the Observer — chat client for /en/ask/ and /fr/posez-une-question/.
   Same discipline as front-page.js: everything that comes back from the
   network (LLM answers, citation titles, source lists) is rendered with
   textContent only — never innerHTML — and citation/source links are
   whitelisted. Any failure leaves the static page content usable. */
(function () {
  'use strict';

  var ENDPOINT = 'https://seneca.strai.ca/webhook/observer-ask';
  var SOURCES_URL = '/ask-sources.json';
  var LANG = document.documentElement.getAttribute('lang') === 'fr' ? 'fr' : 'en';
  var MAX_HISTORY = 8; /* 4 exchanges, matches the webhook contract */
  var TIMEOUT_MS = 45000;

  var STRINGS = {
    en: {
      you: 'You',
      observer: 'The Observer',
      thinking: 'Consulting the documents…',
      network: 'The assistant could not be reached. Check your connection and try again, or browse the bylaws index below.',
      upstream: 'The document assistant is temporarily unavailable. Please try again in a few minutes.',
      bad: 'Please check your question — it must be between 3 and 600 characters.',
      limited: "The Observer's reading room is at capacity for today — please come back tomorrow.",
      docCount: function (n) { return n + ' documents currently indexed.'; }
    },
    fr: {
      you: 'Vous',
      observer: "L'Observer",
      thinking: 'Consultation des documents…',
      network: "Impossible de joindre l'assistant. Vérifiez votre connexion et réessayez, ou consultez l'index des règlements ci-dessous.",
      upstream: "L'assistant documentaire est temporairement indisponible. Veuillez réessayer dans quelques minutes.",
      bad: 'Veuillez vérifier votre question — elle doit contenir entre 3 et 600 caractères.',
      limited: "La salle de lecture de l'Observer est au maximum pour aujourd'hui — revenez demain.",
      docCount: function (n) { return n + ' documents actuellement indexés.'; }
    }
  }[LANG];

  var history = [];
  var busy = false;

  function el(tag, cls, parent) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (parent) parent.appendChild(e);
    return e;
  }

  function validCiteUrl(u) {
    if (typeof u !== 'string') return false;
    if (/^https:\/\/(drive|docs)\.google\.com\//.test(u)) return true;
    if (/^https:\/\/(www\.)?ormstown\.ca\//.test(u)) return true;
    return /^\/[^\s]*$/.test(u) && u.indexOf('//') !== 0;
  }

  /* Renders plain text from the model: blank-line-separated blocks become
     paragraphs; consecutive lines starting with "- " become a list.
     Nothing else is interpreted. */
  function renderAnswer(container, text) {
    var blocks = String(text).split(/\n{2,}/);
    blocks.forEach(function (block) {
      var lines = block.split('\n').filter(function (l) { return l.trim() !== ''; });
      if (!lines.length) return;
      var listItems = [];
      var plain = [];
      lines.forEach(function (line) {
        if (/^\s*-\s+/.test(line)) listItems.push(line.replace(/^\s*-\s+/, ''));
        else plain.push(line);
      });
      if (plain.length) {
        var p = el('p', null, container);
        p.textContent = plain.join(' ');
      }
      if (listItems.length) {
        var ul = el('ul', null, container);
        listItems.forEach(function (li) {
          el('li', null, ul).textContent = li;
        });
      }
    });
  }

  function addMessage(role, text, citations, isError) {
    var thread = document.getElementById('ask-thread');
    if (!thread) return null;
    var msg = el('div', 'msg ' + (role === 'user' ? 'msg-user' : 'msg-bot') + (isError ? ' msg-error' : ''), thread);
    el('div', 'msg-who', msg).textContent = role === 'user' ? STRINGS.you : STRINGS.observer;
    var body = el('div', 'msg-text', msg);
    renderAnswer(body, text);
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
    var prior = history.slice(-MAX_HISTORY);
    addMessage('user', question);
    setBusy(true);

    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS) : null;

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question, lang: LANG, history: prior }),
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
          history.push({ role: 'user', text: question });
          history.push({ role: 'model', text: data.answer.slice(0, 1200) });
          if (history.length > MAX_HISTORY) history = history.slice(-MAX_HISTORY);
        } else if (res.status === 429) {
          addMessage('bot', serverMsg || STRINGS.limited, null, true);
        } else if (res.status === 400) {
          addMessage('bot', serverMsg || STRINGS.bad, null, true);
        } else {
          addMessage('bot', serverMsg || STRINGS.upstream, null, true);
        }
      })
      .catch(function () {
        addMessage('bot', STRINGS.network, null, true);
      })
      .then(function () {
        if (timer) clearTimeout(timer);
        setBusy(false);
        var input = document.getElementById('ask-q');
        if (input) input.focus();
      });
  }

  function wireForm() {
    var form = document.getElementById('ask-form');
    var input = document.getElementById('ask-q');
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
        var q = btn.getAttribute('data-q') || btn.textContent;
        input.value = '';
        ask(q);
      });
    });
  }

  /* Optional upgrade of the static source list from /ask-sources.json.
     On any failure the static fallback stays untouched. */
  function loadSources() {
    var target = document.getElementById('ask-sources-list');
    if (!target) return;
    fetch(SOURCES_URL)
      .then(function (r) {
        if (!r.ok) throw new Error('http ' + r.status);
        return r.json();
      })
      .then(function (data) {
        if (!data || data.version !== 1 || !Array.isArray(data.categories) || !data.categories.length) return;
        var frag = document.createDocumentFragment();
        data.categories.forEach(function (cat) {
          if (!cat || typeof cat.name !== 'string' || !Array.isArray(cat.documents)) return;
          var det = document.createElement('details');
          det.className = 'src-cat';
          var sum = el('summary', null, det);
          sum.textContent = cat.name + ' (' + cat.documents.length + ')';
          var ul = el('ul', 'src-list', det);
          cat.documents.forEach(function (d) {
            if (!d || typeof d.title !== 'string' || !d.title) return;
            var li = el('li', null, ul);
            var label = d.title + (d.year ? ' (' + d.year + ')' : '');
            if (validCiteUrl(d.url)) {
              var a = el('a', null, li);
              a.setAttribute('href', d.url);
              a.setAttribute('target', '_blank');
              a.setAttribute('rel', 'noopener');
              a.textContent = label;
            } else {
              li.textContent = label;
            }
          });
          frag.appendChild(det);
        });
        if (!frag.childNodes.length) return;
        while (target.firstChild) target.removeChild(target.firstChild);
        target.appendChild(frag);
        var count = document.getElementById('ask-doc-count');
        if (count && typeof data.document_count === 'number') {
          count.textContent = STRINGS.docCount(data.document_count);
        }
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
