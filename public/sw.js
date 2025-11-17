// Service Worker Básico (Cache-First para estáticos)

const CACHE_NAME = 'trackmontt-cache-v1';
// Lista de archivos base de la app (el "shell")
const urlsToCache = [
  '/',
  '/login',
  '/driver',
  // '/globals.css', // Revisa si tienes otros CSS globales
  '/manifest.json'
];

// 1. Evento Install: Guardar los archivos base en el caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache abierto:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Evento Fetch: Interceptar peticiones
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Si la respuesta está en el caché, la retornamos
        if (response) {
          return response;
        }
        
        // Si no, vamos a la red a buscarla
        return fetch(event.request);
      }
    )
  );
});