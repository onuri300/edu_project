import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { templateSamples } from './coding-template-samples.mjs';
import { buildDatabaseManual } from './build-database-manual.mjs';

const documents = [
  ['structure', '구조와 프레임워크', '01-system-specification.md', '폴더 구조, 빌드, 배포'],
  ['structure', '구조와 프레임워크', '02-framework-manual.md', '공통 프레임워크, 템플릿'],
  ['reference', '코드 레퍼런스', '03-css-reference.md', 'CSS, 레이아웃, 테마'],
  ['reference', '코드 레퍼런스', '04-javascript-reference.md', 'JavaScript, 인증, 메뉴'],
  ['reference', '코드 레퍼런스', '05-data-api-specification.md', '데이터베이스, API, Supabase'],
  ['reference', '코드 레퍼런스', '08-database-schema.md', '전체 스키마, 테이블, 컬럼, 외래 키, 인덱스, RLS'],
  ['development', '페이지 개발', '06-development-guide.md', '신규 페이지, 파일명, 검증'],
  ['development', '페이지 개발', '07-menu-layout-guide.md', '메뉴 그룹, 수정 금지, 공통 적용, 페이지 전용, 템플릿 유형'],
];

export async function buildCodingManual(source) {
  const gptManual = JSON.parse(await readFile(path.join(source, 'common/data/gpt-making-manual.json'), 'utf8'));
  await writeFile(path.join(source, 'common/data/gpt-making-manual.js'),
    'window.ONURI_GPT_MANUAL = ' + JSON.stringify(gptManual) + ';\n');
  const database = await buildDatabaseManual(source);
  const entries = await Promise.all(documents.map(async ([category, label, file, keyword]) => {
    const markdown = await readFile(path.join(source, 'do_docs', 'docs', file), 'utf8');
    const title = /^# (.+)\r?$/m.exec(markdown)?.[1].trim();
    if (!title) throw Error('문서 제목 누락: ' + file);
    return {
      category, file, keyword, title, prompt: markdown,
      ...(file === '05-data-api-specification.md' ? { database } : {}),
      ...(file === '08-database-schema.md' ? { parent: '05-data-api-specification.md' } : {}),
    };
  }));
  for (const sample of templateSamples) {
    entries.push({
      ...sample,
      category: 'development',
      parent: '07-menu-layout-guide.md',
      keyword: '기본 템플릿 샘플',
      prompt: sample.areas.map(([, label, , description]) => label + '\n' + description).join('\n\n'),
    });
  }
  const data = { categories: [...new Map(documents.map(([id, name]) => [id, name]))].map(([id, name]) => ({ id, name })), entries };
  await writeFile(path.join(source, 'common/data/coding-manual.js'),
    'window.ONURI_CODING_MANUAL = ' + JSON.stringify(data) + ';\n');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildCodingManual(fileURLToPath(new URL('../../', import.meta.url)));
}
