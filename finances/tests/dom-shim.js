// A minimal DOM + browser shim, for tests only.
//
// It exists because the ledger workspace has no build step and no test
// runner, and installing jsdom for a static site is not worth it. This is
// just enough of the platform for finances/v2/*.js to boot, render every
// view, and be asserted against in Node. It is NOT a general DOM: it
// implements the handful of APIs the workspace actually uses, and it will
// throw or no-op on anything else - which is the point, since it also
// proves the workspace stays inside that small API surface.
'use strict';
const fs = require('fs');

const VOID = new Set(['br', 'input', 'img', 'link', 'meta', 'hr']);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttr = (s) => esc(s).replace(/"/g, '&quot;');

class ClassList {
  constructor(node) { this.node = node; }
  get _set() { return new Set(String(this.node.attrs.class || '').split(/\s+/).filter(Boolean)); }
  _write(s) { this.node.attrs.class = [...s].join(' '); }
  add(c) { const s = this._set; s.add(c); this._write(s); }
  remove(c) { const s = this._set; s.delete(c); this._write(s); }
  contains(c) { return this._set.has(c); }
  toggle(c, on) { const s = this._set; if (on === undefined ? s.has(c) : !on) s.delete(c); else s.add(c); this._write(s); }
}

class Node {
  constructor(tag) {
    this.tagName = (tag || '').toUpperCase();
    this.nodeName = this.tagName;
    this.children = [];
    this.attrs = {};
    this.listeners = {};
    this.parentNode = null;
    this._text = null;          // set only on text nodes
    this.value = '';
    this.classList = new ClassList(this);
  }
  appendChild(n) {
    if (n && n.isFragment) { n.children.slice().forEach((c) => this.appendChild(c)); return n; }
    if (n.parentNode) n.parentNode.removeChild(n);
    n.parentNode = this; this.children.push(n); return n;
  }
  removeChild(n) { const i = this.children.indexOf(n); if (i >= 0) this.children.splice(i, 1); n.parentNode = null; return n; }
  remove() { if (this.parentNode) this.parentNode.removeChild(this); }
  replaceChildren(...k) { this.children = []; k.forEach((c) => this.appendChild(c)); }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attrs, k) ? this.attrs[k] : null; }
  removeAttribute(k) { delete this.attrs[k]; }
  hasAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attrs, k); }
  addEventListener(t, fn) { (this.listeners[t] = this.listeners[t] || []).push(fn); }
  removeEventListener(t, fn) { const a = this.listeners[t] || []; const i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); }
  dispatch(t, ev) { (this.listeners[t] || []).slice().forEach((fn) => fn(ev || { preventDefault() {}, key: '' })); }
  click() { this.dispatch('click'); }
  focus() { document.activeElement = this; }
  getContext() { return { createPattern: () => 'pattern', canvas: this }; }
  get hidden() { return this.hasAttribute('hidden'); }
  set hidden(v) { if (v) this.setAttribute('hidden', ''); else this.removeAttribute('hidden'); }
  get style() {
    const self = this;
    return new Proxy({}, {
      get: (_, p) => (p === 'overflow' ? self._overflow || '' : ''),
      set: (_, p, v) => { if (p === 'overflow') self._overflow = v; return true; }
    });
  }
  get textContent() {
    if (this._text !== null) return this._text;
    return this.children.map((c) => c.textContent).join('');
  }
  set textContent(v) {
    if (this._text !== null) { this._text = String(v); return; }
    this.children = [];
    if (v !== '') this.appendChild(document.createTextNode(v));
  }
  get outerHTML() {
    if (this._text !== null) return esc(this._text);
    const t = this.tagName.toLowerCase();
    const a = Object.keys(this.attrs).map((k) => ` ${k}="${escAttr(this.attrs[k])}"`).join('');
    if (VOID.has(t)) return `<${t}${a}>`;
    return `<${t}${a}>${this.innerHTML}</${t}>`;
  }
  get innerHTML() { return this.children.map((c) => c.outerHTML).join(''); }
  // Depth-first walk, used by the tiny selector engine and by tests.
  walk(fn) { fn(this); this.children.forEach((c) => c.walk(fn)); }
  find(pred) { const out = []; this.walk((n) => { if (pred(n)) out.push(n); }); return out; }
  querySelectorAll(sel) { return this.find(matcher(sel)); }
  getElementsByTagName(t) { const T = t.toUpperCase(); return this.find((n) => n.tagName === T); }
  getElementsByClassName(c) { return this.find((n) => n.classList && n.classList.contains(c)); }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
}

// Supports exactly what the workspace uses: `tag[attr="v"][attr2]` / `[attr]`.
function matcher(sel) {
  const m = /^([a-zA-Z]*)((?:\[[^\]]+\])*)$/.exec(String(sel).trim());
  if (!m) throw new Error('dom-shim: unsupported selector ' + sel);
  const tag = m[1].toUpperCase();
  const conds = [...m[2].matchAll(/\[([^\]=]+)(?:="([^"]*)")?\]/g)].map((c) => [c[1], c[2]]);
  return (n) => {
    if (n._text !== null) return false;
    if (tag && n.tagName !== tag) return false;
    return conds.every(([k, v]) => (v === undefined ? n.hasAttribute(k) : n.getAttribute(k) === v));
  };
}

class Fragment extends Node {
  constructor() { super('#fragment'); this.isFragment = true; }
}

const document = {
  activeElement: null,
  readyState: 'complete',
  createElement(t) { return new Node(t); },
  createTextNode(v) { const n = new Node('#text'); n._text = String(v); return n; },
  createDocumentFragment() { return new Fragment(); },
  addEventListener() {},
  _byId: Object.create(null),
  getElementById(id) { return document._byId[id] || null; },
  getElementsByClassName(c) { return document.body.find((n) => n.classList && n.classList.contains(c)); },
  querySelectorAll(s) { return document.root.querySelectorAll(s); },
  querySelector(s) { return document.root.querySelector(s); }
};

// Build a stub tree from the real index.html: one element per id="…", plus
// the <link rel=alternate> tags and the .lw-skip anchors, so getElementById
// and the alternates sync exercise the same ids the page actually ships.
function mountFromHTML(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  document.root = new Node('html');
  document.head = new Node('head');
  document.body = new Node('body');
  document.documentElement = document.root;
  document.root.appendChild(document.head);
  document.root.appendChild(document.body);
  document._byId = Object.create(null);

  // Copy the element's REAL attributes, not just its id - role="tab",
  // aria-live and aria-selected are declared in the markup and the tests
  // must see the same ones a browser would.
  for (const m of html.matchAll(/<(\w+)((?:\s+[\w:-]+(?:="[^"]*")?)*)\s*\/?>/g)) {
    if (!/\bid="/.test(m[2])) continue;
    const n = new Node(m[1]);
    for (const a of m[2].matchAll(/([\w:-]+)(?:="([^"]*)")?/g)) {
      if (a[1]) n.setAttribute(a[1], a[2] === undefined ? '' : a[2]);
    }
    document._byId[n.getAttribute('id')] = n;
    document.body.appendChild(n);
  }
  for (const m of html.matchAll(/<link rel="alternate" hreflang="(\w+)" href="([^"]+)"/g)) {
    const n = new Node('link');
    n.setAttribute('rel', 'alternate'); n.setAttribute('hreflang', m[1]); n.setAttribute('href', m[2]);
    document.head.appendChild(n);
  }
  for (const m of html.matchAll(/<a class="lw-skip"((?:\s+[\w:-]+="[^"]*")*)\s*>/g)) {
    const n = new Node('a');
    n.setAttribute('class', 'lw-skip');
    for (const a of m[1].matchAll(/([\w:-]+)="([^"]*)"/g)) n.setAttribute(a[1], a[2]);
    document.body.appendChild(n);
  }
  return document;
}

module.exports = { Node, document, mountFromHTML, matcher, esc };
