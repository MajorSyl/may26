// Expo's Metro web bundler (no Expo Router in this project) doesn't
// support a customizable HTML template the way the old webpack bundler
// or Expo Router's app/+html.tsx do -- it always emits its own minimal
// <head> with just a <title> (from app.json's expo.name) and no
// description/Open Graph/Twitter tags at all. This script runs after
// `expo export --platform web` and injects those tags into the built
// dist/index.html directly. It also generates the app's service worker
// (see generateServiceWorker below) and wires up its registration script,
// which is what actually gets deployed browsers off a stale bundle.
const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');
const distIndexPath = path.join(distDir, 'index.html');

// Every deploy must produce a byte-different sw.js, or browsers have
// nothing to detect as "changed" and silently keep running the old
// worker. VERCEL_GIT_COMMIT_SHA is set automatically by Vercel's build
// environment for every deploy; Date.now() covers local/manual exports
// where that isn't set.
function generateServiceWorker() {
  const buildId = process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now());
  const swSource = `// Auto-generated on every build -- do not edit by hand (see scripts/inject-web-meta.js).
const BUILD_ID = ${JSON.stringify(buildId)};
const SHELL_CACHE = 'rcfs-shell-' + BUILD_ID;
const ASSET_CACHE = 'rcfs-assets-' + BUILD_ID;

self.addEventListener('install', () => {
  // Take over immediately -- don't leave an old worker in control while
  // this one sits in "waiting", which is what would otherwise require
  // every open tab to be closed before an update actually applies.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

function isHashedAsset(url) {
  return url.pathname.startsWith('/_expo/static/');
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isHashedAsset(url)) {
    // Filenames are content-hashed, so a cache hit is always correct --
    // serve it instantly, but still refresh the cache in the background
    // (stale-while-revalidate) so nothing can go stale even in theory.
    event.respondWith(
      (async () => {
        const cache = await caches.open(ASSET_CACHE);
        const cached = await cache.match(request);
        const networkPromise = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || networkPromise;
      })()
    );
    return;
  }

  // App shell (HTML navigation, and anything else not content-hashed):
  // always try the network first so a new deploy is visible immediately;
  // only fall back to the cache when actually offline.
  event.respondWith(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      try {
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      } catch {
        const cached = await cache.match(request);
        return cached || cache.match('/index.html');
      }
    })()
  );
});
`;
  fs.writeFileSync(path.join(distDir, 'sw.js'), swSource);
  console.log(`inject-web-meta: generated dist/sw.js (BUILD_ID ${buildId})`);
}

const metaTags = `
    <meta name="description" content="RCFS -- the official app for the Rotary Club of Freetown Sunset, Sierra Leone (Rotary District 9101)." />
    <meta name="theme-color" content="#0F1E4D" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="RCFS" />
    <meta property="og:title" content="RCFS" />
    <meta property="og:description" content="RCFS -- the official app for the Rotary Club of Freetown Sunset, Sierra Leone (Rotary District 9101)." />
    <meta property="og:url" content="https://www.rcfsunset.org" />
    <meta property="og:image" content="https://www.rcfsunset.org/favicon.ico" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="RCFS" />
    <meta name="twitter:description" content="RCFS -- the official app for the Rotary Club of Freetown Sunset, Sierra Leone (Rotary District 9101)." />
  </head>`;

if (!fs.existsSync(distIndexPath)) {
  console.error('inject-web-meta: dist/index.html not found -- run `expo export --platform web` first.');
  process.exit(1);
}

let html = fs.readFileSync(distIndexPath, 'utf8');

if (html.includes('og:site_name')) {
  console.log('inject-web-meta: tags already present, skipping.');
} else {
  html = html.replace('</head>', metaTags);
  fs.writeFileSync(distIndexPath, html);
  console.log('inject-web-meta: injected description/Open Graph/Twitter tags into dist/index.html');
}

generateServiceWorker();

// sw-register.js itself is a static file (see public/sw-register.js,
// copied verbatim into dist/ by the Metro web export) -- only the <script>
// tag pointing at it needs injecting here.
html = fs.readFileSync(distIndexPath, 'utf8');
if (!html.includes('sw-register.js')) {
  html = html.replace('</body>', '  <script src="/sw-register.js" defer></script>\n</body>');
  fs.writeFileSync(distIndexPath, html);
  console.log('inject-web-meta: injected service worker registration script into dist/index.html');
}
