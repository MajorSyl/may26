// Fails CI if vercel.json's security headers regress. Run: node .github/scripts/check-security-headers.mjs
import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'));
const all = config.headers.find((h) => h.source === '/(.*)');
const headers = Object.fromEntries((all?.headers || []).map((h) => [h.key.toLowerCase(), h.value]));
const csp = headers['content-security-policy'] || '';
const directive = (name) => (csp.split(';').map((d) => d.trim()).find((d) => d.startsWith(name + ' ')) || '').slice(name.length + 1);

const checks = [
  ['HSTS with preload', /max-age=\d{8,}.*preload/.test(headers['strict-transport-security'] || '')],
  ['X-Content-Type-Options nosniff', headers['x-content-type-options'] === 'nosniff'],
  ['X-Frame-Options set', !!headers['x-frame-options']],
  ['Referrer-Policy set', !!headers['referrer-policy']],
  ['Permissions-Policy set', !!headers['permissions-policy']],
  ['CSP present', !!csp],
  ["script-src has no 'unsafe-inline' / 'unsafe-eval' / wildcard", !!directive('script-src') && !/unsafe-inline|unsafe-eval|\*|https:(\s|$)/.test(directive('script-src'))],
  ["object-src 'none'", directive('object-src') === "'none'"],
  ["frame-ancestors restricted", /^'self'|^'none'/.test(directive('frame-ancestors'))],
  ['connect-src is an explicit list (no bare https:)', !!directive('connect-src') && !/(^|\s)https:(\s|$)|\*/.test(directive('connect-src'))],
  ['frame-src is an explicit list (no bare https:)', !!directive('frame-src') && !/(^|\s)https:(\s|$)|\*/.test(directive('frame-src'))],
  ["base-uri 'self'", directive('base-uri') === "'self'"]
];

let failed = 0;
for (const [name, ok] of checks) {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
  if (!ok) failed++;
}
if (failed) {
  console.error(`\n${failed} security header check(s) failed.`);
  process.exit(1);
}
console.log('\nAll security header checks passed.');
