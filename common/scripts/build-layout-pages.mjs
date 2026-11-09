import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
export const pageFolders = ['.', 'page_admin', 'page_classroom', 'page_etc', 'page_etc/gpt-making-manual',
  'page_game', 'page_newsletter', 'page_vibecoding', 'page_vibecoding/onuriMakerLab', 'page_vibecoding/onyou-maker-card/dist',
  'page_vibecoding/onyou-maker-card/dist/category', 'page_vibecoding/onyou-maker-card/dist/mobile',
  'page_vibecoding/onyou-maker-card/dist/guide'];
const region = /<!-- layout:([a-z-]+) -->\r?\n[\s\S]*?\r?\n<!-- \/layout:\1 -->/g;
const portfolioLinks = {
  home: ['onuri-maker.html', 'Home'],
  works: ['onuri-works.html', 'Works'],
  about: ['onuri-about.html', 'About'],
  process: ['onuri-process.html', 'Process'],
  contact: ['onuri-contact.html', 'Contact'],
};

function portfolioFragment(fragment, file) {
  const brand = file === 'onuri-maker.html' ? 'Onuri<span>MakerLab</span>' : 'make<span>lab</span>';
  const navigation = Object.entries(portfolioLinks).map(([page, [href, label]]) =>
    `      <a href="${href}" data-page="${page}">${label}</a>`).join('\n');
  const footerPages = file === 'onuri-contact.html' ? ['home', 'works']
    : ['onuri-works.html', 'onuri-work-detail.html'].includes(file) ? ['contact', 'home'] : ['contact', 'works'];
  const footerLinks = footerPages.map(page => {
    const [href, label] = portfolioLinks[page];
    return `      <a href="${href}">${label}</a>`;
  }).join('\n');
  return fragment.replace('{{brand}}', brand).replaceAll('{{navigation}}', navigation)
    .replace('{{footerLinks}}', footerLinks);
}

export async function buildLayoutPages(source = root, { check = false } = {}) {
  const fragments = new Map();
  for (const folder of pageFolders) {
    const dir = path.join(source, folder);
    const files = await readdir(dir).catch(error => {
      if (error.code === 'ENOENT') return [];
      throw error;
    });
    for (const name of files.filter(file => file.endsWith('.html'))) {
      const file = path.join(dir, name);
      const html = await readFile(file, 'utf8');
      const newline = html.includes('\r\n') ? '\r\n' : '\n';
      let rendered = html;
      for (const [markup, key] of html.matchAll(region)) {
        if (!fragments.has(key)) {
          const fragment = await readFile(path.join(source, 'common/templates/layout', key + '.html'), 'utf8');
          fragments.set(key, fragment.trimEnd().replace(/\r\n/g, '\n'));
        }
        const fragment = key.startsWith('portfolio-')
          ? portfolioFragment(fragments.get(key), name) : fragments.get(key);
        rendered = rendered.replace(markup, () => [
          '<!-- layout:' + key + ' -->', fragment.replaceAll('\n', newline),
          '<!-- /layout:' + key + ' -->',
        ].join(newline));
      }
      if (html === rendered) continue;
      if (check) throw Error(path.relative(source, file) + '의 공통 템플릿을 다시 생성하세요.');
      await writeFile(file, rendered);
    }
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildLayoutPages(root, { check: process.argv.includes('--check') });
}
