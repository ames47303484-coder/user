// اسم ذاكرة التخزين المؤقت
const CACHE_NAME = 'edu-platform-v2';

// الملفات التي يجب تحميلها وتخزينها ليعمل التطبيق
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// 1. حدث التثبيت (Install)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// 2. حدث التفعيل (Activate) - لمسح الكاش القديم إن وُجد
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 3. حدث جلب البيانات (Fetch) - جلب الملفات من الكاش إذا انقطع الإنترنت
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // إرجاع الملف من الكاش، أو طلبه من الإنترنت
                return response || fetch(event.request);
            })
    );
});
