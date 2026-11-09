(() => {
  'use strict';
  const tablist = document.querySelector('.idea-tabs');
  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
  const ids = tabs.map(tab => tab.id.replace('idea-tab-', ''));
  function select(index, focus = false, updateUrl = false) {
    tabs.forEach((tab, position) => {
      const active = position === index;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      panels[position].hidden = !active;
    });
    if (focus) tabs[index].focus();
    if (updateUrl) {
      const nextHash = '#' + ids[index];
      if (location.hash !== nextHash) history.replaceState(null, '', nextHash);
    }
  }
  tabs.forEach((tab, index) => {
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    panels[index].tabIndex = 0;
    tab.addEventListener('click', () => select(index, false, true));
    tab.addEventListener('keydown', event => {
      const moves = {
        ArrowLeft: (index + tabs.length - 1) % tabs.length,
        ArrowRight: (index + 1) % tabs.length,
        Home: 0,
        End: tabs.length - 1
      };
      if (!Object.hasOwn(moves, event.key)) return;
      event.preventDefault();
      select(moves[event.key], true, true);
    });
  });
  const selectHash = () => select(Math.max(0, ids.indexOf(location.hash.slice(1))));
  selectHash();
  tablist.hidden = false;
  window.addEventListener('hashchange', selectHash);
  const printButton = document.querySelector('[data-idea-print]');
  if (window.self === window.top) {
    printButton.hidden = false;
    printButton.addEventListener('click', () => {
      document.documentElement.dataset.ideaPrinting = 'true';
      window.print();
    });
    window.addEventListener('afterprint', () => delete document.documentElement.dataset.ideaPrinting);
  }
})();
