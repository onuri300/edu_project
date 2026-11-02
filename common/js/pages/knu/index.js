(() => {
  const button = document.querySelector('.nav-toggle');
  const links = document.querySelector('.center-links');
  if (!button || !links) return;
  function close() { links.classList.remove('is-open'); button.setAttribute('aria-expanded', 'false'); }
  button.addEventListener('click', () => {
    const open = links.classList.toggle('is-open');
    button.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 800) close(); });
})();
