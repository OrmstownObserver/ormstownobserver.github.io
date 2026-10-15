/* sw.js — offline support for the installed Observer app.

   News must never go stale behind a cache, so pages, JSON data and the site's
   own scripts and styles are NETWORK-FIRST: the cache is only a fallback when
   the reader is offline. Images and Google Fonts are stale-while-revalidate
   (shown from cache, refreshed in the background), because photos are
   re-exported under the same filename.

   Bump VERSION to drop every cached file on the next visit. */
var VERSION = 'obs-2026-10-14';
var CORE = VERSION + '-core';
var RUNTIME = VERSION + '-runtime';
var OFFLINE_URL = '/offline.html';

var PRECACHE = [
  '/',
  OFFLINE_URL,
  '/observer.css',
  '/observer-header.js',
  '/manifest.webmanifest',
  '/app/icon-192.png'
];

// Cached pages and assets are capped so a long-installed app cannot grow
// without bound.
var MAX_RUNTIME_ENTRIES = 120;

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CORE).then(function(cache){ return cache.addAll(PRECACHE); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){
        return k.indexOf(VERSION) !== 0;
      }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

function trim(cacheName){
  return caches.open(cacheName).then(function(cache){
    return cache.keys().then(function(keys){
      if(keys.length <= MAX_RUNTIME_ENTRIES) return;
      return Promise.all(keys.slice(0, keys.length - MAX_RUNTIME_ENTRIES)
        .map(function(k){ return cache.delete(k); }));
    });
  });
}

function networkFirst(request, fallbackUrl){
  return fetch(request).then(function(response){
    if(response && response.ok && response.type === 'basic'){
      var copy = response.clone();
      caches.open(RUNTIME).then(function(cache){
        cache.put(request, copy).then(function(){ trim(RUNTIME); });
      });
    }
    return response;
  }).catch(function(){
    return caches.match(request, {ignoreSearch: request.mode === 'navigate'})
      .then(function(hit){
        if(hit) return hit;
        if(fallbackUrl) return caches.match(fallbackUrl);
        return Response.error();
      });
  });
}

function staleWhileRevalidate(request){
  return caches.open(RUNTIME).then(function(cache){
    return cache.match(request).then(function(hit){
      var refresh = fetch(request).then(function(response){
        if(response && (response.ok || response.type === 'opaque')){
          cache.put(request, response.clone()).then(function(){ trim(RUNTIME); });
        }
        return response;
      }).catch(function(){ return hit; });
      return hit || refresh;
    });
  });
}

self.addEventListener('fetch', function(event){
  var req = event.request;
  if(req.method !== 'GET') return;

  var url = new URL(req.url);

  // Google Fonts (stylesheet + font files).
  if(url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com'){
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  // Everything else off-site (the Ask webhook, ormstown.ca PDFs, the Wayback
  // Machine) goes straight to the network, untouched.
  if(url.origin !== self.location.origin) return;

  if(req.mode === 'navigate'){
    event.respondWith(networkFirst(req, OFFLINE_URL));
    return;
  }

  if(req.destination === 'image'){
    event.respondWith(staleWhileRevalidate(req));
    return;
  }

  event.respondWith(networkFirst(req));
});
