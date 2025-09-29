const CACHE_NAME = 'sobrevivencia-v3';
const urlsToCache = [
    '/coletor.html',
    '/manifest.json',
    '/icon-192.svg',
    '/icon-512.svg'
];

let cacheInitialized = false;

// Instalar Service Worker
self.addEventListener('install', event => {
    console.log('SW: Instalando versão', CACHE_NAME);
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('SW: Cache inicializado');
                cacheInitialized = true;
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('SW: Erro ao criar cache:', err);
            })
    );
});

// Interceptar requests APENAS quando necessário
self.addEventListener('fetch', event => {
    const url = event.request.url;
    
    // IGNORAR completamente estas URLs para evitar loops
    if (url.includes('api/health') || 
        url.includes('api/upload') || 
        url.includes('blob.core.windows.net') ||
        url.includes('chrome-extension') ||
        event.request.method !== 'GET') {
        return; // Deixa o browser lidar normalmente
    }
    
    // Apenas cachear recursos estáticos essenciais
    if (url.includes('coletor.html') || 
        url.includes('manifest.json') || 
        url.includes('.svg')) {
        event.respondWith(
            caches.match(event.request)
                .then(response => response || fetch(event.request))
                .catch(() => fetch(event.request))
        );
    }
});

// Ativar Service Worker (SEM forçar controle imediato)
self.addEventListener('activate', event => {
    console.log('SW: Ativando versão', CACHE_NAME);
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('SW: Removendo cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});