import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const pagePath = /^[\w-]+(?:\/[\w-]+)*\.html$/;

export async function buildPageRoutes(source = root, output = source) {
  const json = await readFile(path.join(source, 'common/data/page-routes.json'), 'utf8')
    .catch(error => { if (error.code !== 'ENOENT') throw error; });
  if (!json) return;
  const routes = JSON.parse(json);
  const deploy = path.resolve(source) !== path.resolve(output);
  for (const [previous, target] of Object.entries(routes)) {
    if (!pagePath.test(previous) || !pagePath.test(target)) throw Error('Invalid page route: ' + previous);
    if (!deploy || target === 'mng/menu-builder.html') continue;
    const prefix = '../'.repeat(previous.split('/').length - 1);
    const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>페이지 이동</title><script src="${prefix}common/data/site-config.js" defer></script><script src="${prefix}onuri.framework/js/auth.js" data-route-alias="true" defer></script></head><body><p>페이지 주소가 변경되었습니다. <a data-redirect href="${prefix}${target}">새 페이지 열기</a></p></body></html>\n`;
    const file = path.join(output, previous);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, html);
  }
  const data = path.join(output, 'common/data');
  await mkdir(data, { recursive: true });
  await writeFile(path.join(data, 'page-routes.js'),
    '// Generated from page-routes.json.\nwindow.eduPageAliases = Object.freeze(' + JSON.stringify(routes, null, 2) + ');\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildPageRoutes();
}
