const CACHE_NAME = 'qrypt-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/generator.html',
    '/scanner.html',
    '/help.html',
    '/usage.html',
    '/history.html',
    '/faqs.html',
    '/assets/styles/main.css',
    '/script.js',
    '/assets/QryptLogo.png',
    '/assets/scanner-animation.gif'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});
