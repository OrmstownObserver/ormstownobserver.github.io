
/* observer-header.js — edit this file to update the masthead & nav on every page */
(function(){
  // ── CSS ──
  var css = `
    :root {
      --ink:#1a1a1a; --ink-light:#444; --accent:#b5161b; --accent-light:#f5e8e8;
      --paper:#faf8f4; --paper-dark:#f0ece4; --rule:#c8b97a; --border:#d4c9b8; --muted:#555;
    }
    *{box-sizing:border-box;}
    html,body{margin:0;padding:0;}
    body{background:var(--paper);color:var(--ink);font-family:'Source Serif 4',Georgia,serif;line-height:1.6;-webkit-font-smoothing:antialiased;}
    a{color:inherit;text-decoration:none;}
    h1,h2,h3{font-family:'Playfair Display',Georgia,serif;margin:0;}
    p{margin:0;}
    a:focus-visible,button:focus-visible{outline:2px solid var(--accent);outline-offset:3px;}
    @media(prefers-reduced-motion:reduce){*{transition:none!important;}}
    [data-fr]{display:none;}
    html.lang-fr [data-en]{display:none;}
    html.lang-fr [data-fr]{display:inline;}

    /* ── MASTHEAD ── */
    .obs-masthead{
      border-top:5px solid var(--ink);
      padding:28px 24px 22px;
      text-align:center;
      background:var(--paper);
      position:relative;
    }
    .obs-masthead-inner{
      max-width:1100px; margin:0 auto; position:relative;
    }
    .obs-rule-double{
      width:100%; max-width:640px; height:3px;
      border-top:1px solid var(--ink); border-bottom:1px solid var(--ink);
      margin:0 auto 20px;
    }
    .obs-flag{
      font-family:'Playfair Display',serif; font-size:11.5px; letter-spacing:.26em;
      text-transform:uppercase; color:var(--muted); margin-bottom:8px;
    }
    .obs-name{
      font-family:'Playfair Display',serif; font-weight:900;
      font-size:clamp(32px,6vw,60px); letter-spacing:.03em; line-height:1.05;
      color:var(--ink); display:inline-block; text-decoration:none;
      transition:color .15s;
    }
    .obs-name:hover{color:var(--accent);}
    .obs-tagline{
      font-size:11.5px; letter-spacing:.18em; text-transform:uppercase;
      color:var(--muted); margin-top:8px; font-style:italic;
    }
    .obs-rule-bottom{
      width:100%; max-width:640px; height:1px;
      background:var(--ink); margin:18px auto 0;
    }

    /* ── HAMBURGER ── */
    .obs-hamburger{
      position:absolute; right:0; top:50%; transform:translateY(-50%);
      background:none; border:none; cursor:pointer; padding:8px;
      display:flex; flex-direction:column; gap:5px; z-index:200;
    }
    .obs-hamburger span{
      display:block; width:24px; height:2px; background:var(--ink);
      transition:transform .2s, opacity .2s;
    }
    .obs-hamburger[aria-expanded=true] span:nth-child(1){transform:translateY(7px) rotate(45deg);}
    .obs-hamburger[aria-expanded=true] span:nth-child(2){opacity:0;}
    .obs-hamburger[aria-expanded=true] span:nth-child(3){transform:translateY(-7px) rotate(-45deg);}

    /* ── LANG TOGGLE (compact, in masthead) ── */
    .obs-lang{
      position:absolute; left:0; top:50%; transform:translateY(-50%);
      display:inline-flex; border:1.5px solid var(--ink); overflow:hidden;
    }
    .obs-lang button{
      font-family:'Playfair Display',serif; font-weight:700; font-size:11px;
      letter-spacing:.06em; text-transform:uppercase;
      color:var(--ink); background:var(--paper); border:none;
      border-right:1px solid var(--ink); padding:6px 12px; cursor:pointer;
      transition:background .15s,color .15s;
    }
    .obs-lang button:last-child{border-right:none;}
    .obs-lang button.is-active{background:var(--accent);color:#fff;}
    .obs-lang button:not(.is-active):hover{background:var(--paper-dark);}

    /* ── DRAWER NAV ── */
    .obs-drawer{
      position:fixed; top:0; right:0; bottom:0; width:min(300px,85vw);
      background:var(--paper); border-left:1px solid var(--border);
      box-shadow:-4px 0 24px rgba(0,0,0,.15);
      z-index:500; transform:translateX(100%);
      transition:transform .25s cubic-bezier(.4,0,.2,1);
      padding:60px 32px 40px; display:flex; flex-direction:column; gap:0;
      overflow-y:auto;
    }
    .obs-drawer.is-open{transform:translateX(0);}
    .obs-drawer-close{
      position:absolute; top:16px; right:16px;
      background:none; border:none; cursor:pointer; font-size:20px; color:var(--ink);
      padding:8px; line-height:1;
    }
    .obs-drawer-title{
      font-family:'Playfair Display',serif; font-size:11px; letter-spacing:.22em;
      text-transform:uppercase; color:var(--muted); margin-bottom:24px;
    }
    .obs-drawer nav a{
      display:block; font-family:'Playfair Display',serif; font-weight:700;
      font-size:18px; color:var(--ink); padding:14px 0;
      border-bottom:1px solid var(--border); letter-spacing:.02em;
      transition:color .12s;
    }
    .obs-drawer nav a:hover{color:var(--accent);}
    .obs-drawer nav a.is-active{color:var(--accent);}
    .obs-drawer-contact{
      margin-top:32px; font-size:12.5px; color:var(--muted); line-height:2;
    }
    .obs-drawer-contact a{color:var(--accent);}

    /* ── SCRIM ── */
    .obs-scrim{
      position:fixed; inset:0; background:rgba(0,0,0,.35);
      z-index:400; opacity:0; pointer-events:none;
      transition:opacity .25s;
    }
    .obs-scrim.is-open{opacity:1;pointer-events:auto;}

    /* ── FOOTER ── */
    .obs-footer{
      border-top:3px double var(--ink); text-align:center;
      padding:30px 24px; font-size:12.5px; letter-spacing:.04em;
      color:var(--ink-light); line-height:2; margin-top:10px;
      font-family:'Source Serif 4',Georgia,serif;
    }
    .obs-footer a{color:var(--accent);}
    .obs-footer-name{
      font-family:'Playfair Display',serif; font-weight:700;
      font-size:17px; color:var(--ink); margin-bottom:4px;
    }
  `;

  // ── HTML ──
  var path = window.location.pathname;
  function isActive(href){ return path.indexOf(href) === 0 && href !== '/'; }
  var rootHref = '/';

  var header = `
  <div class="obs-masthead">
    <div class="obs-masthead-inner">
      <button class="obs-lang" id="obs-lang-group" role="group" aria-label="Language / Langue">
        <button type="button" id="obs-btn-en" onclick="obsSetLang('en')">EN</button>
        <button type="button" id="obs-btn-fr" onclick="obsSetLang('fr')">FR</button>
      </button>
      <div class="obs-rule-double"></div>
      <div class="obs-flag">Ormstown &amp; Haut-Saint-Laurent · Québec</div>
      <a class="obs-name" href="${rootHref}">
        <span data-en>The Ormstown Observer</span><span data-fr>L'Ormstown Observer</span>
      </a>
      <div class="obs-tagline">
        <span data-en>Civic Accountability · Independent Journalism</span>
        <span data-fr>Responsabilité civique · Journalisme indépendant</span>
      </div>
      <div class="obs-rule-bottom"></div>
      <button class="obs-hamburger" id="obs-hamburger" aria-label="Menu" aria-expanded="false" aria-controls="obs-drawer">
        <span></span><span></span><span></span>
      </button>
    </div>
  </div>

  <div class="obs-scrim" id="obs-scrim"></div>
  <div class="obs-drawer" id="obs-drawer" role="dialog" aria-label="Navigation">
    <button class="obs-drawer-close" id="obs-drawer-close" aria-label="Close menu">✕</button>
    <div class="obs-drawer-title"><span data-en>Navigate</span><span data-fr>Navigation</span></div>
    <nav>
      <a href="/en/bell-tower/" data-href-en="/en/bell-tower/" data-href-fr="/fr/bell-tower/"
        class="${isActive('/en/bell-tower') || isActive('/fr/bell-tower') ? 'is-active' : ''}">
        <span data-en>Investigations</span><span data-fr>Enquêtes</span>
      </a>
      <a href="/en/bylaws-regulations/" data-href-en="/en/bylaws-regulations/" data-href-fr="/fr/bylaws-regulations/"
        class="${isActive('/en/bylaws') || isActive('/fr/bylaws') ? 'is-active' : ''}">
        <span data-en>Bylaws &amp; Regulations</span><span data-fr>Règlements</span>
      </a>
      <a href="/en/public-notices/" data-href-en="/en/public-notices/" data-href-fr="/fr/public-notices/"
        class="${isActive('/en/public-notices') || isActive('/fr/public-notices') ? 'is-active' : ''}">
        <span data-en>Public Notices</span><span data-fr>Avis publics</span>
      </a>
      <a href="/en/council-watch/" data-href-en="/en/council-watch/" data-href-fr="/fr/conseil-municipal/"
        class="${isActive('/en/council') || isActive('/fr/conseil') ? 'is-active' : ''}">
        <span data-en>Council Watch</span><span data-fr>Conseil municipal</span>
      </a>
      <a href="/en/editorials/" data-href-en="/en/editorials/" data-href-fr="/fr/editoriaux/"
        class="${isActive('/en/editorials') || isActive('/fr/editoriaux') ? 'is-active' : ''}">
        <span data-en>Editorials</span><span data-fr>Éditoriaux</span>
      </a>
      <a href="/en/events/" data-href-en="/en/events/" data-href-fr="/fr/events/"
        class="${isActive('/en/events') || isActive('/fr/events') ? 'is-active' : ''}">
        <span data-en>Events</span><span data-fr>Événements</span>
      </a>
      <a href="mailto:ormstownobserver@gmail.com">
        <span data-en>Contact</span><span data-fr>Contact</span>
      </a>
    </nav>
    <div class="obs-drawer-contact">
      <div style="font-family:'Playfair Display',serif;font-weight:700;font-size:15px;color:var(--ink);margin-bottom:4px;">
        <span data-en>The Ormstown Observer</span><span data-fr>L'Ormstown Observer</span>
      </div>
      <a href="mailto:ormstownobserver@gmail.com">ormstownobserver@gmail.com</a><br>
      <span data-en>Independent civic journalism</span><span data-fr>Journalisme civique indépendant</span>
    </div>
  </div>`;

  var footer = `
  <footer class="obs-footer">
    <div class="obs-footer-name">
      <span data-en>The Ormstown Observer</span><span data-fr>L'Ormstown Observer</span>
    </div>
    <span data-en>The Ormstown Observer is a bilingual civic watchdog covering the decisions, bylaws, and debates that shape Ormstown and the Haut-Saint-Laurent. A bilingual publication for a bilingual community. We accept no advertising.</span>
    <span data-fr>L'Ormstown Observer est une vigie civique bilingue qui couvre les décisions, règlements et débats qui façonnent Ormstown et le Haut-Saint-Laurent. Une publication bilingue pour une communauté bilingue. Nous n'acceptons aucune publicité.</span><br>
    <a href="mailto:ormstownobserver@gmail.com">ormstownobserver@gmail.com</a>
  </footer>`;

  // ── INJECT ──
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  if(!document.querySelector('link[href*="Playfair+Display"]')){
    var fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,600;1,8..60,300;1,8..60,400&display=swap';
    document.head.appendChild(fontLink);
  }

  var headerDiv = document.createElement('div');
  headerDiv.innerHTML = header;
  document.body.insertBefore(headerDiv, document.body.firstChild);

  document.querySelectorAll('.topbar, .masthead, .site-header-old').forEach(function(el){ el.remove(); });

  var existingFooter = document.querySelector('.site-footer, footer.obs-footer-old');
  if(existingFooter) existingFooter.remove();
  var footerDiv = document.createElement('div');
  footerDiv.innerHTML = footer;
  document.body.appendChild(footerDiv);

  // ── HAMBURGER LOGIC ──
  var burger  = document.getElementById('obs-hamburger');
  var drawer  = document.getElementById('obs-drawer');
  var scrim   = document.getElementById('obs-scrim');
  var closeBtn= document.getElementById('obs-drawer-close');

  function openDrawer(){
    drawer.classList.add('is-open');
    scrim.classList.add('is-open');
    burger.setAttribute('aria-expanded','true');
    document.body.style.overflow='hidden';
  }
  function closeDrawer(){
    drawer.classList.remove('is-open');
    scrim.classList.remove('is-open');
    burger.setAttribute('aria-expanded','false');
    document.body.style.overflow='';
  }
  burger.addEventListener('click', function(){
    drawer.classList.contains('is-open') ? closeDrawer() : openDrawer();
  });
  closeBtn.addEventListener('click', closeDrawer);
  scrim.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeDrawer(); });

  // ── LANG LOGIC ──
  window.obsSetLang = function(lang){
    // Check for a page-level alternate URL first (hreflang redirect)
    var alternate = document.querySelector('link[rel="alternate"][hreflang="' + lang + '"]');
    if(alternate && alternate.href && alternate.href !== window.location.href){
      // Save preference before navigating
      try{ localStorage.setItem('observerLang', lang); } catch(e){}
      window.location.href = alternate.href;
      return;
    }

    // No alternate — just toggle classes (homepage or pages without alternates)
    var html = document.documentElement;
    if(lang==='fr'){ html.classList.add('lang-fr'); } else { html.classList.remove('lang-fr'); }
    html.setAttribute('lang', lang);
    try{ localStorage.setItem('observerLang', lang); } catch(e){}
    var btnEn = document.getElementById('obs-btn-en');
    var btnFr = document.getElementById('obs-btn-fr');
    if(btnEn) btnEn.classList.toggle('is-active', lang==='en');
    if(btnFr) btnFr.classList.toggle('is-active', lang==='fr');
    // Update lang-aware hrefs in drawer
    document.querySelectorAll('[data-href-en]').forEach(function(el){
      el.setAttribute('href', lang==='fr' ? el.getAttribute('data-href-fr') : el.getAttribute('data-href-en'));
    });
  };

  // Init lang — on page load, don't redirect; just set visual state
  (function(){
    try{
      var saved = localStorage.getItem('observerLang');
      var lang = saved || (navigator.language && navigator.language.toLowerCase().indexOf('fr')===0 ? 'fr' : 'en');
      // Apply visual state without triggering redirect on init
      var html = document.documentElement;
      if(lang==='fr'){ html.classList.add('lang-fr'); } else { html.classList.remove('lang-fr'); }
      html.setAttribute('lang', lang);
      var btnEn = document.getElementById('obs-btn-en');
      var btnFr = document.getElementById('obs-btn-fr');
      if(btnEn) btnEn.classList.toggle('is-active', lang==='en');
      if(btnFr) btnFr.classList.toggle('is-active', lang==='fr');
      document.querySelectorAll('[data-href-en]').forEach(function(el){
        el.setAttribute('href', lang==='fr' ? el.getAttribute('data-href-fr') : el.getAttribute('data-href-en'));
      });
    } catch(e){}
  })();

})();
