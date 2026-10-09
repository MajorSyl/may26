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

const DESCRIPTION =
  'Rotary Club of Freetown-Sunset, Sierra Leone (Rotary District 9101): professionals united in service, creating lasting impact through clean water, health, education and community projects.';

const metaTags = `
    <meta name="description" content="${DESCRIPTION}" />
    <meta name="theme-color" content="#17458F" />
    <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/jakarta-var.woff2" as="font" type="font/woff2" crossorigin />
    <style id="rcfs-type">
      @font-face { font-family: 'Inter'; src: url('/fonts/inter-var.woff2') format('woff2'); font-weight: 100 900; font-style: normal; font-display: swap; }
      @font-face { font-family: 'Plus Jakarta Sans'; src: url('/fonts/jakarta-var.woff2') format('woff2'); font-weight: 200 800; font-style: normal; font-display: swap; }
      html, body, #root, #root * { font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif !important; }
      #root .font-display, #root .font-display * { font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif !important; letter-spacing: -0.015em; }
      body { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
      #root .rcfs-line { display: block; }
      @media (prefers-reduced-motion: no-preference) {
        @keyframes rcfs-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
        @keyframes rcfs-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes rcfs-slide { from { opacity: 0; transform: translateX(-40px); } to { opacity: 1; transform: none; } }
        #root .rcfs-rise { animation: rcfs-rise 600ms cubic-bezier(.2,.7,.2,1) both; }
        #root .rcfs-welcome { animation: rcfs-rise 600ms cubic-bezier(.2,.7,.2,1) 100ms both; }
        #root .rcfs-title { animation: rcfs-rise 700ms cubic-bezier(.2,.7,.2,1) 250ms both; }
        #root .rcfs-rule-l { transform-origin: right center; animation: rcfs-grow 600ms cubic-bezier(.2,.7,.2,1) 800ms both; }
        #root .rcfs-rule-r { transform-origin: left center; animation: rcfs-grow 600ms cubic-bezier(.2,.7,.2,1) 800ms both; }
        #root .rcfs-theme { animation: rcfs-slide 800ms cubic-bezier(.2,.7,.2,1) 900ms both; }
        #root .rcfs-ctas { animation: rcfs-rise 600ms cubic-bezier(.2,.7,.2,1) 1300ms both; }
      }
    </style>
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="Rotary Club of Freetown-Sunset" />
    <meta property="og:title" content="Rotary Club of Freetown-Sunset · Create Lasting Impact" />
    <meta property="og:description" content="${DESCRIPTION}" />
    <meta property="og:url" content="https://www.rcfsunset.org" />
    <meta property="og:image" content="https://www.rcfsunset.org/og-image.jpg" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Rotary Club of Freetown-Sunset members and community at the Kerefay Loko MCHP community well handover" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Rotary Club of Freetown-Sunset · Create Lasting Impact" />
    <meta name="twitter:description" content="${DESCRIPTION}" />
    <meta name="twitter:image" content="https://www.rcfsunset.org/og-image.jpg" />
  </head>`;

if (!fs.existsSync(distIndexPath)) {
  console.error('inject-web-meta: dist/index.html not found -- run `expo export --platform web` first.');
  process.exit(1);
}

let html = fs.readFileSync(distIndexPath, 'utf8');

if (html.includes('og:site_name')) {
  console.log('inject-web-meta: tags already present, skipping.');
} else {
  html = html.replace(/<title>[^<]*<\/title>/, '<title>Rotary Club of Freetown-Sunset</title>');
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
