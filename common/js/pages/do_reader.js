(() => {
  for (const reader of document.querySelectorAll('.document-reader')) {
    const sidebarToggle = reader.querySelector('[data-document-sidebar-toggle]');
    const tree = reader.querySelector('[data-document-tree]');

    sidebarToggle.addEventListener('click', () => {
      const open = !reader.classList.toggle('list-collapsed');
      sidebarToggle.textContent = open ? '‹' : '›';
      sidebarToggle.setAttribute('aria-expanded', String(open));
      sidebarToggle.setAttribute('aria-label', open ? '목록 접기' : '목록 펼치기');
    });

    const toolbar = document.createElement('div');
    toolbar.className = 'staff-list-toolbar';
    const count = reader.querySelector('#manual-status, #report-count, [data-tree-count]');
    if (count) toolbar.append(count);
    const actions = document.createElement('div');
    actions.className = 'staff-list-actions';
    actions.setAttribute('role', 'group');
    actions.setAttribute('aria-label', '목록 전체 제어');
    for (const { open, symbol, label } of [
      { open: true, symbol: '+', label: '전체 펼치기' },
      { open: false, symbol: '−', label: '전체 접기' },
    ]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = symbol;
      button.setAttribute('aria-label', label);
      button.setAttribute('aria-controls', tree.id);
      button.title = label;
      button.addEventListener('click', () => {
        for (const branch of tree.querySelectorAll('.document-tree-branch')) branch.open = open;
      });
      actions.append(button);
    }
    toolbar.append(actions);
    tree.before(toolbar);
  }
})();
