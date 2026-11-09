(() => {
  'use strict';

  function bindMobileMenu({ button, menu, closeButton, breakpoint, overlay = false }) {
    if (!button || !menu) return;
    function setOpen(open) {
      menu.classList.toggle('is-open', open);
      button.setAttribute('aria-expanded', String(open));
      if (overlay) {
        if (open) menu.removeAttribute('aria-hidden');
        else menu.setAttribute('aria-hidden', 'true');
        document.documentElement.classList.toggle('no-scroll', open);
      }
    }
    const close = () => setOpen(false);
    button.addEventListener('click', () => setOpen(overlay || !menu.classList.contains('is-open')));
    closeButton?.addEventListener('click', close);
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) close();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > breakpoint) close();
    });
  }

  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => entities[character]);
  }

  window.eduUI = Object.freeze({ bindMobileMenu, escapeHtml });
})();
