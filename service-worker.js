// Service Worker - Essais DEIE v1.2
const CACHE_VERSION = 'essais-deie-v1.2-20260218-fixed';
const urlsToCache = [
  './',
  './index.html',
  './admin.html',
  './essais.html',
  './tests.html',
  './recap.html',
  './synthese.html',
  './signature-controleur.html',
  './signature-client.html',
  './final.html',
  './about.html',
  './confidentialite.html',
  './style.css',
  './app.js',
  './admin.js',
  './essais.js',
  './tests.js',
  './recap.js',
  './synthese.js',
  './signature-controleur.js',
  './signature-client.js',
  './final.js',
  './autosave.js',
  './profil-technicien.js',
  './ux-mobile.js',
  './progress-indicator.js',
  './dark-mode.js',
  './sharepoint-integration.js',
  './enedis.png',
  './icon-192.png',
  './icon-512.png',
  './jspdf.umd.min.js'
];

// Installation - mise en cache avec gestion d'erreur par fichier
self.addEventListener('install', (event) => {
  console.log('[SW] Installation v1.2');
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => {
      // Mettre en cache chaque fichier individuellement pour éviter l'échec global
      return Promise.allSettled(
        urlsToCache.map(url =>
          cache.add(url).catch(err => {
            console.warn('[SW] Impossible de cacher:', url, err);
          })
        )
      );
    }).then(() => {
      console.log('[SW] Cache installé');
      return self.skipWaiting(); // Prendre effet immédiatement
    })
  );
});

// Activation - supprimer les anciens caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activation v1.2');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_VERSION)
          .map(name => {
            console.log('[SW] Suppression ancien cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim()) // Contrôler toutes les pages immédiatement
  );
});

// Interception des requêtes - Cache First avec Network Fallback
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET et les requêtes externes (SharePoint, etc.)
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  if (!url.origin.includes(self.location.origin.split('//')[1].split('/')[0])) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Mettre à jour le cache en arrière-plan (stale-while-revalidate)
        fetch(event.request).then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_VERSION).then(cache => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        
        return cachedResponse;
      }

      // Pas en cache : aller chercher sur le réseau
      return fetch(event.request).then(networkResponse => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        
        // Mettre en cache pour la prochaine fois
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_VERSION).then(cache => {
          cache.put(event.request, responseToCache);
        });
        
        return networkResponse;
      }).catch(() => {
        // Hors-ligne et pas en cache : retourner la page d'accueil
        return caches.match('./index.html');
      });
    })
  );
});

// Message pour forcer la mise à jour
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
