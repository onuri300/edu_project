(() => {
  const baseSandbox = 'allow-scripts allow-same-origin allow-forms allow-popups allow-downloads';
  window.eduResourcePolicy = Object.freeze({
    sandboxFor(url, baseURI) {
      const target = new URL(url, baseURI);
      const library = new URL('vi_vibe/vi_library.html', baseURI);
      const boardPaths = ['bd_board/bd_notice.html', 'bd_board/bd_library.html', 'mn_manage/mn_notice.html', 'mn_manage/mn_library.html'].map(path => new URL(path, baseURI).pathname);
      const isLibrary = target.origin === library.origin && [library.pathname, ...boardPaths].includes(target.pathname);
      return baseSandbox + (isLibrary ? ' allow-popups-to-escape-sandbox' : '');
    },
  });
})();
