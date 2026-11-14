import { versionAssets } from '../../onuri.framework/scripts/version-assets.mjs';
import { buildReports } from './build-reports.mjs';
import { buildLayoutPages } from './build-layout-pages.mjs';
import { buildPageRoutes } from './build-page-routes.mjs';
import { buildCodingManual } from './build-coding-manual.mjs';
import { readdir, readFile, mkdir, copyFile, writeFile, stat, rm, cp } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
async function readOptionalJson(file, fallback) {
  try { return JSON.parse(await readFile(file, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return fallback; throw error; }
}
async function copyOptional(source, output, relative, destination = relative) {
  try {
    await mkdir(path.dirname(path.join(output, destination)), { recursive: true });
    await cp(path.join(source, relative), path.join(output, destination), {
      recursive: true,
      filter: file => {
        const name = path.basename(file);
        const relative = path.relative(source, file);
        return !['README.md', 'node_modules', '.git', '사용매뉴얼_로그인정보.md'].includes(name)
          && !/^\.(?:env|dev\.vars)(?:\.|$)/.test(name)
          && relative !== path.join('do_docs', 'docs')
          && relative !== path.join('vi_vibe', 'vi_onyou', 'generate-gallery.mjs')
          && relative !== path.join('common', 'images', 'vi.image', 'knu-여기에_사진을_넣으세요.txt');
      },
    });
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
}
export async function buildLibrary(source = root, output = path.join(root, '_site'), { dataOnly = false } = {}) {
  if (!dataOnly && path.resolve(output) === path.join(root, '_site')) await rm(output, { recursive: true, force: true });
  const books = path.join(source, 'common/file/cl.file');
  const entries = await readdir(books, { withFileTypes: true }).catch(error => {
    if (error.code === 'ENOENT') return [];
    throw error;
  });
  const descriptions = await readOptionalJson(path.join(source, 'common/data/course-descriptions.json'), {});
  // file:// cannot fetch PDFs. Small on-demand JS envelopes let local previews save Blob attachments too.
  const localDownloads = path.join(source, 'common/file/local-downloads');
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
      bytes: (await stat(file)).size, url: `common/file/cl.file/${encodeURIComponent(entry.name)}`,
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
  await buildLayoutPages(source);
  if ((await readdir(path.join(source, 'do_docs')).catch(error => {
    if (error.code === 'ENOENT') return [];
    throw error;
  })).includes('do_dev.html')) await buildCodingManual(source);
  if (dataOnly) {
    await buildPageRoutes(source);
    console.log(`[자료실] ${items.length}개 교안 목록 갱신 완료 (배포 폴더 생성 안 함)`);
    return items;
  }
  await mkdir(path.join(output, 'common/data'), { recursive: true });
  await mkdir(path.join(output, 'common/file/cl.file'), { recursive: true });
  await mkdir(path.join(output, 'books'), { recursive: true });
  for (const name of await readdir(source)) {
    if (name.endsWith('.html') && name !== 'menu-builder.html') await copyFile(path.join(source, name), path.join(output, name));
  }
  for (const folder of ['vi_vibe', 'ga_games', 'do_docs', 'on_class']) await copyOptional(source, output, folder);
  for (const relative of ['common/css', 'common/js']) {
    await cp(path.join(source, relative), path.join(output, relative), {
      recursive: true,
    });
  }
  for (const relative of ['onuri.framework/css', 'onuri.framework/js', 'onuri.framework/images',
    'onuri.framework/db_connect/browser', 'common/file/browser', 'common/file/vi.file', 'common/data/site-config.js']) {
    await copyOptional(source, output, relative);
  }
  await copyOptional(source, output, 'common/file/vi.file', 'vi_vibe/vi_onyou/downloads');
  for (const relative of ['common/images', 'common/data/computer-quiz', 'common/data/gpt-making-manual.json', 'common/data/data.enc.js', 'common/data/library-data.js', 'CNAME', '.nojekyll', '404.html', 'favicon.ico', 'robots.txt']) await copyOptional(source, output, relative);
  await buildPageRoutes(source, output);
  await copyOptional(source, output, 'common/data/coding-manual.js');
  await copyOptional(source, output, 'common/data/gpt-making-manual.js');
  for (const item of items) {
    for (const folder of ['common/file/cl.file', 'books']) {
      await copyFile(path.join(books, item.filename), path.join(output, folder, item.filename));
    }
  }
  await writeFile(path.join(output, 'common/data/library-data.json'), JSON.stringify(items, null, 2) + '\n');
  await versionAssets(output);
  console.log(`[자료실] ${items.length}개 교안 생성 완료 (작업 폴더·배포 폴더 동시 반영)`);
  return items;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildLibrary(root, path.join(root, '_site'), { dataOnly: !process.argv.includes('--deploy') });
}
