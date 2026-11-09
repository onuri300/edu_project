(() => {
  'use strict';

  function decodeBase64(value) {
    return Uint8Array.from(atob(value), character => character.charCodeAt(0));
  }

  async function deriveKey(id, password, salt, iterations, usages = ['decrypt']) {
    const material = new TextEncoder().encode(id.trim().toLowerCase() + '\u241F' + password);
    const base = await crypto.subtle.importKey('raw', material, 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, usages
    );
  }

  window.eduMenuCrypto = Object.freeze({ decodeBase64, deriveKey });
})();
