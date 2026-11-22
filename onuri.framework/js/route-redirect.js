(() => {
  const link = document.querySelector('[data-route-alias]');
  if (!link) return;
  const target = new URL(link.href);
  target.search = location.search;
  target.hash = location.hash;
  location.replace(target);
})();
