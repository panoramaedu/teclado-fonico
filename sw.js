/* Service Worker — Teclado Fônico
   Cacheia o "app shell" (HTML/CSS/JS) e todos os áudios de fonemas
   para o app funcionar 100% offline depois da primeira visita. */

const CACHE_NAME = 'teclado-fonico-v1';
const ASSETS = [
  "./",
  "index.html",
  "style.css",
  "script.js",
  "manifest.json",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-192-maskable.png",
  "icons/icon-512-maskable.png",
  "audio/fonema/R.mp3",
  "audio/fonema/a.mp3",
  "audio/fonema/b.mp3",
  "audio/fonema/c.mp3",
  "audio/fonema/d.mp3",
  "audio/fonema/e.mp3",
  "audio/fonema/f.mp3",
  "audio/fonema/g.mp3",
  "audio/fonema/i.mp3",
  "audio/fonema/j.mp3",
  "audio/fonema/k.mp3",
  "audio/fonema/l.mp3",
  "audio/fonema/m.mp3",
  "audio/fonema/n.mp3",
  "audio/fonema/o.mp3",
  "audio/fonema/p.mp3",
  "audio/fonema/q.mp3",
  "audio/fonema/r.mp3",
  "audio/fonema/s.mp3",
  "audio/fonema/t.mp3",
  "audio/fonema/u.mp3",
  "audio/fonema/v.mp3",
  "audio/fonema/w.mp3",
  "audio/fonema/x.mp3",
  "audio/fonema/y.mp3",
  "audio/fonema/z.mp3",
  "audio/fonema/ã.mp3",
  "audio/fonema/õ.mp3",
  "audio/fonema/ĩ.mp3",
  "audio/fonema/ũ.mp3",
  "audio/fonema/ɔ.mp3",
  "audio/fonema/ɛ.mp3",
  "audio/fonema/ɲ.mp3",
  "audio/fonema/ʃ.mp3",
  "audio/fonema/ʎ.mp3",
  "audio/fonema/ʒ.mp3",
  "audio/fonema/ẽ.mp3"
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

// Estratégia: cache-first para tudo (app pequeno e majoritariamente estático),
// com atualização em segundo plano (stale-while-revalidate) para HTML/CSS/JS.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // não intercepta fontes externas (Google Fonts etc.)

  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached); // offline: usa o que tiver em cache

      return cached || network;
    })
  );
});
