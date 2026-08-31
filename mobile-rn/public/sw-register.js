// Registers the app's service worker and surfaces a simple "Update
// available" banner the moment a genuinely NEW version takes control of
// this tab -- not on the very first install (clients.claim() fires
// 'controllerchange' then too; hadController below guards against that
// false positive). This file is static and copied verbatim into dist/ by
// Metro's web export (Expo copies a project-root public/ folder as-is);
// it never needs to change per build, unlike sw.js itself.
(function () {
  if (!('serviceWorker' in navigator)) return;

  var hadController = !!navigator.serviceWorker.controller;
  var banner = null;

  function showUpdateBanner() {
    if (banner) return;
    banner = document.createElement('div');
    banner.setAttribute('role', 'status');
    banner.style.cssText =
      'position:fixed;left:12px;right:12px;bottom:16px;z-index:99999;' +
      'background:#0F1E4D;color:#fff;padding:14px 16px;border-radius:16px;' +
      'display:flex;align-items:center;gap:12px;justify-content:space-between;' +
      'font-family:system-ui,-apple-system,BlinkMacSystemFont,sans-serif;font-size:13px;' +
      'box-shadow:0 8px 24px rgba(0,0,0,0.25);max-width:420px;margin:0 auto;';

    var text = document.createElement('span');
    text.textContent = 'Update available — tap to refresh';
    text.style.cssText = 'flex:1;';

    var button = document.createElement('button');
    button.textContent = 'Refresh';
    button.type = 'button';
    button.style.cssText =
      'background:#1E88E5;color:#fff;border:none;border-radius:8px;' +
      'padding:8px 14px;font-weight:700;font-size:12px;cursor:pointer;' +
      'text-transform:uppercase;letter-spacing:0.03em;';
    button.onclick = function () {
      window.location.reload();
    };

    banner.appendChild(text);
    banner.appendChild(button);
    document.body.appendChild(banner);
  }

  navigator.serviceWorker.addEventListener('controllerchange', function () {
    if (hadController) {
      showUpdateBanner();
    }
    hadController = true;
  });

  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').then(function (registration) {
      // Browsers only check for a new sw.js on their own schedule (often
      // just on navigation, throttled to roughly once a day in some
      // cases). Forcing a check whenever the tab regains focus is what
      // actually makes "sees the update within one app open/foreground"
      // true, instead of a user having to close and reopen repeatedly.
      document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'visible') {
          registration.update();
        }
      });
      registration.update();
    }).catch(function () {
      // Service worker registration failing (e.g. unsupported context)
      // should never break the app -- it's a progressive enhancement.
    });
  });
})();
