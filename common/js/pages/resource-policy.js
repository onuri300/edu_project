(() => {
  const baseSandbox = 'allow-scripts allow-same-origin allow-forms allow-popups allow-downloads';
  window.eduResourcePolicy = Object.freeze({
    sandboxFor(url, baseURI) {
      const target = new URL(url, baseURI);
      const library = new URL('vi_vibe/vi_library.html', baseURI);
      const isLibrary = target.origin === library.origin && target.pathname === library.pathname;
      return baseSandbox + (isLibrary ? ' allow-popups-to-escape-sandbox' : '');
    },
  });
})();
