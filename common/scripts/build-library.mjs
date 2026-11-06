import { versionAssets } from './version-assets.mjs';
import { buildReports } from './build-reports.mjs';
import { readdir, readFile, mkdir, copyFile, writeFile, stat, rm, cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
async function readOptionalJson(file, fallback) {
  try { return JSON.parse(await readFile(file, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return fallback; throw error; }
}
async function copyOptional(source, output, relative) {
  try {
    await mkdir(path.dirname(path.join(output, relative)), { recursive: true });
    await cp(path.join(source, relative), path.join(output, relative), {
      recursive: true,
      filter: file => !['menu-builder-hero.png', 'README.md', 'node_modules', '.git', '사용매뉴얼_로그인정보.md'].includes(path.basename(file))
        && path.relative(source, file) !== path.join('page_etc', 'gpt-making-manual'),
    });
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
export async function buildLibrary(source = root, output = path.join(root, '_site'), { dataOnly = false } = {}) {
  if (!dataOnly && path.resolve(output) === path.join(root, '_site')) await rm(output, { recursive: true, force: true });
  const books = path.join(source, 'books');
  const entries = await readdir(books, { withFileTypes: true }).catch(error => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  const descriptions = await readOptionalJson(path.join(source, 'common/data/course-descriptions.json'), {});
  // file:// cannot fetch PDFs. Small on-demand JS envelopes let local previews save Blob attachments too.
  const localDownloads = path.join(source, 'common/data/local-downloads');
  await mkdir(localDownloads, { recursive: true });
  const items = [];
  for (const entry of entries) {
    if (entry.name === 'README.md' || entry.name === '.gitkeep') continue;
    const match = /^(\d{3})_(.+)\.pdf$/u.exec(entry.name);
    if (!entry.isFile() || !match || !match[2].trim()) {
      console.warn(`[자료실 제외] ${JSON.stringify(entry.name)}: 파일명은 세 자리 번호_과목명.pdf 형식이어야 합니다.`);
      continue;
    }
    const file = path.join(books, entry.name);
    const contents = await readFile(file);
    if (!contents.subarray(0, 1024).includes(Buffer.from('%PDF-'))) {
      console.warn(`[자료실 제외] ${JSON.stringify(entry.name)}: PDF 헤더가 없습니다.`);
      continue;
    }
    await writeFile(path.join(localDownloads, entry.name + '.js'),
      `window.__ONURI_LOCAL_PDFS = window.__ONURI_LOCAL_PDFS || {};\nwindow.__ONURI_LOCAL_PDFS[${JSON.stringify(entry.name)}] = ${JSON.stringify(contents.toString('base64'))};\n`);
    const details = descriptions[entry.name] || {};
    const text = key => typeof details[key] === 'string' ? details[key] : '';
    items.push({ number: match[1], title: match[2], filename: entry.name,
      bytes: (await stat(file)).size, url: `books/${encodeURIComponent(entry.name)}`,
      intro: text('intro'), audience: text('audience'), duration: text('duration'),
      outcomes: Array.isArray(details.outcomes) ? details.outcomes.filter(value => typeof value === 'string' && value.trim()) : [] });
  }
  items.sort((a, b) => Number(a.number) - Number(b.number) || a.filename.localeCompare(b.filename, 'ko'));
  const payloadNames = new Set(items.map(item => item.filename + '.js'));
  for (const name of await readdir(localDownloads)) {
    if (/^\d{3}_.+\.pdf\.js$/.test(name) && !payloadNames.has(name)) await rm(path.join(localDownloads, name));
  }
  await mkdir(path.join(source, 'common/data'), { recursive: true });
  const generated = `// Generated from books. Run node common/scripts/build-library.mjs after PDF changes.\nwindow.LIVING_LAB_BOOKS = ${JSON.stringify(items, null, 2)};\n`;
  // Source preview and deployed site use the exact same data, including file:// previews.
  await writeFile(path.join(source, 'common/data/library-data.js'), generated);
  if (!dataOnly) await mkdir(path.join(output, "common/data"), { recursive: true });
  await buildReports(source, dataOnly ? undefined : output);
  if (dataOnly) {
    console.log(`[자료실] ${items.length}개 교안 목록 갱신 완료 (배포 폴더 생성 안 함)`);
    return items;
  }
  await mkdir(path.join(output, 'common/data'), { recursive: true });
  await mkdir(path.join(output, 'books'), { recursive: true });
  for (const name of await readdir(source)) {
    if (name.endsWith('.html') && name !== 'menu-builder.html') await copyFile(path.join(source, name), path.join(output, name));
  }
  for (const folder of ['page_vibecoding', 'page_game', 'page_classroom', 'page_etc', 'page_newsletter']) await copyOptional(source, output, folder);
  await copyOptional(source, output, 'page_etc/gpt-making-manual/index.html');
  for (const relative of ['common/css', 'common/js']) {
    await cp(path.join(source, relative), path.join(output, relative), {
      recursive: true, filter: file => path.basename(file) !== 'builder.css' && path.basename(file) !== 'builder.js',
    });
  }
  for (const relative of ['images', 'common/images', 'common/data/computer-quiz', 'common/data/gpt-making-manual.json', 'common/data/data.enc.js', 'common/data/library-data.js', 'CNAME', '.nojekyll', '404.html', 'favicon.ico', 'robots.txt']) await copyOptional(source, output, relative);
  const routes = await readOptionalJson(path.join(source, 'common/data/page-routes.json'), {});
  for (const [oldPage, target] of Object.entries(routes)) {
    if (target === 'page_admin/menu-builder.html') continue;
    const prefix = '../'.repeat(oldPage.split('/').length - 1);
    const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>페이지 이동</title><link rel="stylesheet" href="${prefix}common/css/common.css"><script src="${prefix}common/js/auth.js"></script><script src="${prefix}common/js/common.js"></script><script src="${prefix}common/js/redirect.js" defer></script></head><body data-site-family="portal"><p>페이지 주소가 변경되었습니다. <a data-redirect href="${prefix}${target}">새 페이지 열기</a></p></body></html>`;
    await mkdir(path.dirname(path.join(output, oldPage)), { recursive: true });
    await writeFile(path.join(output, oldPage), html);
  }
  for (const item of items) await copyFile(path.join(books, item.filename), path.join(output, 'books', item.filename));
  await writeFile(path.join(output, 'common/data/library-data.json'), JSON.stringify(items, null, 2) + '\n');
  await versionAssets(output);
  console.log(`[자료실] ${items.length}개 교안 생성 완료 (작업 폴더·배포 폴더 동시 반영)`);
  return items;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildLibrary(root, path.join(root, '_site'), { dataOnly: !process.argv.includes('--deploy') });
}
