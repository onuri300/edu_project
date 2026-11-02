(() => {
  const scriptSource = document.currentScript?.src;
  async function localPdf(url, filename) {
    if (!scriptSource) throw new Error('Download script location unavailable');
    const payloadUrl = new URL(`../data/local-downloads/${encodeURIComponent(filename)}.js`, scriptSource).href;
    const base64 = await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = payloadUrl;
      script.onload = () => {
        const bytes = window.__ONURI_LOCAL_PDFS?.[filename];
        if (window.__ONURI_LOCAL_PDFS) delete window.__ONURI_LOCAL_PDFS[filename];
        script.remove();
        if (typeof bytes === 'string') resolve(bytes);
        else reject(new Error('Local PDF payload unavailable'));
      };
      script.onerror = () => { script.remove(); reject(new Error('Local PDF payload could not load')); };
      document.head.append(script);
    });
    return new Blob([Uint8Array.from(atob(base64), character => character.charCodeAt(0))], { type: 'application/octet-stream' });
  }
  window.eduDownloads = Object.freeze({
    async save(url, filename) {
      let blob;
      if (url.startsWith('file:')) {
        blob = await localPdf(url, filename);
      } else {
        const response = await fetch(url, { credentials: 'same-origin' });
        if (!response.ok) throw new Error(`PDF download failed: ${response.status}`);
        // Use a binary attachment MIME instead of one handled by the PDF viewer.
        blob = new Blob([await response.blob()], { type: 'application/octet-stream' });
      }
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl; link.download = filename;
      link.hidden = true;
      document.body.append(link);
      link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
    },
  });
})();
