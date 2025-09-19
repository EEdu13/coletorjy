const CACHE_NAME = 'sobrevivencia-v2';
const urlsToCache = [
    '/',
    '/coletor.html',
    '/manifest.json'
];

// Instalar Service Worker
self.addEventListener('install', event => {
    // Força a ativação imediata do novo Service Worker
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Cache aberto');
                return cache.addAll(urlsToCache);
            })
    );
});

// Interceptar requests
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Retorna o cache se encontrado
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});

// Atualizar Service Worker
self.addEventListener('activate', event => {
    // Assume controle de todas as abas imediatamente
    event.waitUntil(clients.claim());
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deletando cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});