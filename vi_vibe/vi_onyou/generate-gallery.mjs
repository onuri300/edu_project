import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const base = fileURLToPath(new URL('.', import.meta.url));
const imageRoot = path.resolve(base, '../../common/images/vi.image');
const files = await fs.readdir(imageRoot, { withFileTypes: true });
const gallery = [];
for (const file of files.sort((a, b) => a.name.localeCompare(b.name, 'ko', { numeric: true }))) {
  const match = /^onyou-(3d|laser|resin)-(.+)\.(jpe?g|png|webp)$/i.exec(file.name);
  if (!file.isFile() || !match) continue;
  const [, category, name] = match;
  gallery.push({
    path: path.relative(base, path.join(imageRoot, file.name)).split(path.sep).join('/'),
    category: category.toLowerCase(),
    title: name.replace(/^\d+[_ -]*/, '').replace(/[_-]/g, ' '),
  });
}
await fs.writeFile(path.join(base, 'gallery.json'), JSON.stringify(gallery, null, 2) + '\n');
console.log('갤러리 ' + gallery.length + '개 생성');
