// Service Worker con estrategia inteligente
// - Network-First para páginas HTML (siempre obtiene la última versión)
// - Cache-First para assets estáticos (JS, CSS, imágenes)

const CACHE_NAME = 'trackmontt-cache-v5'; // ⬆️ Incrementado - Fix React version mismatch from SW cache
const STATIC_ASSETS = [
  '/manifest.json'
];

// 1. Evento Install: Pre-cachear assets críticos
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cache opened:', CACHE_NAME);
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()) // Activar inmediatamente
  );
});

// 2. Evento Activate: Limpiar cachés antiguos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Tomar control inmediato
  );
});

// 3. Evento Fetch: Estrategia inteligente
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo interceptar peticiones del mismo origen
  if (url.origin !== location.origin) {
    return;
  }

  // ⚠️ No interceptar /api/logout (causa error 405)
  if (url.pathname === '/api/logout') {
    return;
  }

  event.respondWith(
    (async () => {
      // ESTRATEGIA Network-First para páginas HTML Y APIs
      const isHtml = request.headers.get('accept')?.includes('text/html');
      const isApi = url.pathname.startsWith('/api/');

      if (isHtml || isApi) {
        try {
          console.log('[SW] Network-First for:', url.pathname);
          const networkResponse = await fetch(request);

          // Guardar en caché para offline (solo HTML, no APIs)
          if (isHtml) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
          }

          return networkResponse;
        } catch (error) {
          // Si falla la red, intentar caché (solo para HTML)
          if (isHtml) {
            console.log('[SW] Network failed, trying cache for:', url.pathname);
            const cachedResponse = await caches.match(request);
            if (cachedResponse) {
              return cachedResponse;
            }
          }
          // Si es API o no hay caché HTML, mostrar error
          return new Response(
            JSON.stringify({ error: 'Offline - No connection available' }),
            {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'application/json' }
            }
          );
        }
      }

      // ESTRATEGIA Cache-First para assets estáticos
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        console.log('[SW] Cache hit for:', url.pathname);
        return cachedResponse;
      }

      // Si no está en caché, ir a la red y guardar
      try {
        const networkResponse = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, networkResponse.clone());
        return networkResponse;
      } catch (error) {
        console.error('[SW] Fetch failed for:', url.pathname, error);
        throw error;
      }
    })()
  );
});