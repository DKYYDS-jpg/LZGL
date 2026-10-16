/* ============================================================
 * Service Worker —— 古蔺数字展厅离线缓存（PWA）
 * 策略：HTML 网络优先（拿不到再用缓存），静态资源缓存优先
 * 更新方式：修改下方 CACHE_VERSION 即可让旧缓存整体失效
 * ============================================================ */
const CACHE_VERSION = 'gulin-v1';

/* 核心资源：安装时预缓存（HTML 走网络优先，这里仅作离线兜底） */
const PRECACHE = [
  '/',
  '/css/style.css',
  '/js/script.js',
  '/js/detail.js',
  '/js/exhibit.js',
  '/js/vendor/qrcode.js',
  '/audio/bgm.mp3',
  '/images/favicon-32.png',
  '/images/icon-192.png',
  '/manifest.json'
];

/* 安装：预缓存核心资源 */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION)
      .then((c) => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

/* 激活：清理旧版本缓存 */
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* 拦截请求 */
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  /* 只处理本站资源；CDN（npmmirror 等）与评论接口不拦截 */
  if (url.origin !== self.location.origin) return;

  /* HTML：网络优先，失败回退缓存（保证内容新鲜、离线可看） */
  if (req.mode === 'navigate' || req.destination === 'document') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('/')))
    );
    return;
  }

  /* 静态资源（css/js/图片/模型/音频）：缓存优先，未命中则联网并写入缓存 */
  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
