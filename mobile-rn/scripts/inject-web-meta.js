// Expo's Metro web bundler (no Expo Router in this project) doesn't
// support a customizable HTML template the way the old webpack bundler
// or Expo Router's app/+html.tsx do -- it always emits its own minimal
// <head> with just a <title> (from app.json's expo.name) and no
// description/Open Graph/Twitter tags at all. This script runs after
// `expo export --platform web` and injects those tags into the built
// dist/index.html directly.
const fs = require('fs');
const path = require('path');

const distIndexPath = path.join(__dirname, '..', 'dist', 'index.html');

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
