(() => {
  // This password gates the classroom UI locally.
  const password = '1234';

  function bindGameAdmin(onUnlock) {
    const dialog = document.getElementById('modal');
    const login = document.getElementById('login');
    const panel = document.getElementById('panel');
    const input = document.getElementById('password');
    const error = document.getElementById('error');

    function lock() {
      login.hidden = false;
      panel.hidden = true;
      input.value = '';
      error.hidden = true;
    }

    document.getElementById('adminBtn').addEventListener('click', () => {
      lock();
      dialog.showModal();
      input.focus();
    });
    document.getElementById('close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', lock);
    dialog.querySelector('[data-admin-lock]').addEventListener('click', () => {
      lock();
      input.focus();
    });
    input.addEventListener('input', () => { error.hidden = true; });
    login.addEventListener('submit', event => {
      event.preventDefault();
      if (input.value !== password) {
        error.hidden = false;
        input.focus();
        return;
      }
      input.value = '';
      login.hidden = true;
      panel.hidden = false;
      onUnlock();
      panel.querySelector('input, button, select')?.focus();
    });
  }

  window.eduGameAdmin = Object.freeze({ bindGameAdmin });
})();
