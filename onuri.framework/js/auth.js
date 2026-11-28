(() => {
  'use strict';
  const root = new URL('../../', document.currentScript.src);
  const entry = new URL('index.html', root);
  const key = 'onuri-session-v1', grantKey = 'onuri-navigation-v1', pageKey = 'onuri-current-page-v1';
  const lifetime = 8 * 60 * 60 * 1000;
  const tabs = new Map();
  let memory = null;
  const read = name => { try { return sessionStorage.getItem(name); } catch { return null; } };
  const write = (name, value) => { try { sessionStorage.setItem(name, value); } catch {} };
  const remove = name => { try { sessionStorage.removeItem(name); } catch {} };
  const pageId = url => { const u = new URL(url, root); return u.pathname + u.search; };
  const config = window.eduSiteConfig || {};
  const resolvePaths = paths => (paths || []).map(path => new URL(path, root).pathname);
  const publicPaths = new Set(resolvePaths(config.publicPaths));
  const publicFolders = resolvePaths(config.publicFolders);
  function isPublicPage(url) {
    const target = new URL(url, root);
    return target.origin === root.origin && target.protocol === root.protocol &&
      (publicPaths.has(target.pathname) || (target.pathname.endsWith('.html') && publicFolders.some(folder => target.pathname.startsWith(folder))));
  }
  const current = pageId(location.href);
  function valid(session) {
    return session && Number.isFinite(session.expiresAt) && session.expiresAt > Date.now()
      && session.menu && Array.isArray(session.menu.cats)
      && (!window.__ENC__ || session.menuSignature === window.__ENC__.ct);
  }
  function getSession() {
    if (valid(memory)) return memory;
    try { const stored = JSON.parse(read(key)); if (valid(stored)) return (memory = stored); } catch {}
    return null;
  }
  function setSession(menu, expiresAt = Date.now() + lifetime) {
    memory = { expiresAt, menu, menuSignature: window.__ENC__?.ct };
    write(key, JSON.stringify(memory));
    write(pageKey, current);
    return memory;
  }
  function clearSession() { memory = null; [key, grantKey, pageKey].forEach(remove); }
  function localPage(url) {
    const target = new URL(url, root);
    return target.origin === root.origin && target.protocol === root.protocol
      && target.pathname.startsWith(root.pathname) && target.pathname.endsWith('.html');
  }
  function allowNavigation(url) {
    if (!getSession() || !localPage(url)) return false;
    write(grantKey, JSON.stringify({ page: pageId(url), expiresAt: Date.now() + 10000 }));
    return true;
  }
  function openPage(url) {
    if (isPublicPage(url)) { window.open(url, '_blank', 'noopener,noreferrer'); return true; }
    if (!getSession()) return false;
    if (!localPage(url)) { window.open(url, '_blank', 'noopener,noreferrer'); return true; }
    const target = new URL(url, root).href;
    const tab = window.open('about:blank', '_blank');
    if (!tab) return false;
    tabs.set(tab, { page: pageId(target), expiresAt: Date.now() + 15000 });
    tab.location.replace(target);
    return true;
  }
  window.eduAuth = Object.freeze({ root: root.href, entry: entry.href, getSession, setSession, clearSession, allowNavigation, openPage });
  window.addEventListener('message', event => {
    if (event.data?.type !== 'onuri:tab-request') return;
    const permit = tabs.get(event.source);
    if (!permit || permit.expiresAt < Date.now() || permit.page !== event.data.page) return;
    tabs.delete(event.source); // A manually edited path cannot reuse the original new-tab request.
    const session = getSession();
    if (session) event.source.postMessage({ type: 'onuri:session-response', nonce: event.data.nonce, session }, '*');
  });
  // Only actual internal link activation grants the next HTML navigation.
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (!link || event.defaultPrevented || !event.isTrusted || !localPage(link.href) || isPublicPage(link.href) || pageId(link.href) === current) return;
    if (link.target === '_blank' || event.ctrlKey || event.metaKey || event.shiftKey) {
      event.preventDefault(); openPage(link.href);
    } else allowNavigation(link.href);
  });
  const localPageAllowed = location.protocol === 'file:' && resolvePaths(config.localPaths).includes(location.pathname);
  const adminFolders = resolvePaths(config.adminFolders);
  const adminLogin = config.adminLoginPath ? new URL(config.adminLoginPath, root) : null;
  if (!localPageAllowed && adminLogin && location.pathname !== adminLogin.pathname && location.pathname.endsWith('.html')
    && adminFolders.some(folder => location.pathname.startsWith(folder))) {
    document.documentElement.dataset.auth = 'pending';
    document.addEventListener('DOMContentLoaded', async () => {
      try {
        const dbScript = file => new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = new URL('onuri.framework/db_connect/browser/' + file, root).href;
          script.onload = resolve;
          script.onerror = reject;
          document.head.append(script);
        });
        if (!window.eduDbAdmin) {
          if (!window.supabase) await dbScript('supabase-2.119.0.js');
          await dbScript('notice-client.js');
        }
        await window.eduDbAdmin();
        document.documentElement.dataset.auth = 'ready';
      } catch {
        location.replace(adminLogin.href);
      }
    }, { once: true });
    return;
  }
  if (localPageAllowed || isPublicPage(location.href)) { document.documentElement.dataset.auth = 'public'; return; }
  let grant = null;
  try { grant = JSON.parse(read(grantKey)); } catch {}
  remove(grantKey);
  const granted = grant?.page === current && grant.expiresAt > Date.now();
  const reloaded = window.performance?.getEntriesByType('navigation')[0]?.type === 'reload' && read(pageKey) === current;
  const isEntry = location.pathname === entry.pathname || location.pathname === root.pathname;
  if (isEntry) {
    if (new URL(location.href).searchParams.get('login') === 'required' || (read(pageKey) && read(pageKey) !== current && !granted)) clearSession();
    return;
  }
  document.documentElement.dataset.auth = 'pending';
  function allow(session) {
    memory = session;
    write(key, JSON.stringify(session));
    if (window.self === window.top) write(pageKey, current);
    document.documentElement.dataset.auth = 'ready';
  }
  function reject() {
    clearSession();
    const resumable = resolvePaths(config.resumablePaths).includes(location.pathname)
      || resolvePaths(config.resumableFolders).some(folder => location.pathname.startsWith(folder));
    const destination = location.href;
    location.replace(entry.href + '?login=required' + (resumable ? '&return=' + encodeURIComponent(destination) : ''));
  }
  const session = getSession();
  if (window.self === window.top && session && (granted || reloaded)) { allow(session); return; }
  if (window.self !== window.top && session) { allow(session); return; }
  const sponsor = window.self !== window.top ? window.parent : window.opener;
  if (!sponsor) { reject(); return; }
  const nonce = `${Date.now()}-${Math.random()}`;
  const timer = setTimeout(reject, 1500);
  function receive(event) {
    if (event.source !== sponsor || event.data?.type !== 'onuri:session-response' || event.data.nonce !== nonce || !valid(event.data.session)) return;
    clearTimeout(timer); window.removeEventListener('message', receive);
    allow(event.data.session);
    if (window.self === window.top) { try { window.opener = null; } catch {} }
  }
  window.addEventListener('message', receive);
  sponsor.postMessage({ type: window.self !== window.top ? 'onuri:session-request' : 'onuri:tab-request', page: current, nonce }, '*');
})();
