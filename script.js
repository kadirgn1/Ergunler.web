(() => {
  'use strict';

  const scripts = ['ui.js', 'news.js', 'machine.js', 'main.js'];

  const currentScript =
    document.currentScript ||
    Array.from(document.scripts).find((s) => (s.src || '').includes('script.js'));

  let basePath = '';

  try {
    if (currentScript && currentScript.src) {
      const url = new URL(currentScript.src, window.location.href);
      basePath = url.href.substring(0, url.href.lastIndexOf('/') + 1);
    }
  } catch {
    basePath = '';
  }

  const loadScript = (src) =>
    new Promise((resolve, reject) => {
      const fullSrc = `${basePath}${src}`;

      const existing = Array.from(document.scripts).find((script) => {
        try {
          return new URL(script.src, window.location.href).href === fullSrc;
        } catch {
          return false;
        }
      });

      if (existing) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = fullSrc;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`${fullSrc} yüklenemedi.`));
      document.head.appendChild(script);
    });

  scripts
    .reduce((promise, src) => promise.then(() => loadScript(src)), Promise.resolve())
    .catch((error) => {
      console.error('JS modülleri yüklenemedi:', error);
    });
})();