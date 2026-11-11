import { renderResourceHero } from '../../onuri.framework/scripts/render-banner.mjs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
export const pageFolders = ['.', 'mng', 'cl_class', 'mo_tools',
  'ga_games', 'ne_news', 'vi_vibe', 'vi_vibe/vi_onuri', 'vi_vibe/vi_onyou'];
const region = /<!-- layout:([a-z-]+) -->\r?\n[\s\S]*?\r?\n<!-- \/layout:\1 -->/g;
const resourceBanners = {
  'mo_coding.html': {
    eyebrow: 'ONURI / DEVELOPER GUIDE',
    title: 'Coding Manual',
    description: '프로젝트 구조, 공통 프레임워크, API와 페이지 개발 규칙을 확인하세요.',
    image: 'common/images/ne.image/ai-newsletter-hero.png',
  },
  'cl_library.html': {
    title: 'Living Lab Library',
    description: '수업에 필요한 교안을 미리 보고 내려받을 수 있는 리빙랩 자료실입니다.',
    image: 'common/images/shared/index-hero.png', width: 1536, height: 1024,
  },
  'cl_edumkr.html': {
    title: 'edumaker',
    description: '수업 계획, 교안, 관련 뉴스와 수업 일지를 한곳에서 관리하는 메이킹 수업 스튜디오입니다.',
    image: 'common/images/shared/index-hero.png', width: 1536, height: 1024,
  },
  'cl_idea.html': {
    title: 'edumaker idea card',
    description: '세 가지 주제의 제작 사례 15개에서 아이디어를 골라 우리 팀의 프로젝트를 시작해 보세요.',
    image: 'common/images/cl.image/edumaker-idea-card-hero.png', width: 600, height: 360,
  },
  'ga_quiz.html': {
    eyebrow: 'ONURI / PLAY TOGETHER',
    title: '컴퓨터 탐험 퀴즈',
    description: 'AI, 개인정보 보호, 코딩, 3D 프린팅까지 100문제로 디지털 세상을 탐험해 보세요.',
    image: 'common/images/ga.image/computer-quiz-hero.png',
  },
  'ga_cards.html': {
    eyebrow: 'ONURI / PLAY TOGETHER',
    title: 'IT 플래시카드',
    description: '설명을 읽고 키워드를 떠올려 보세요. 카드를 클릭하면 키워드가 나타납니다.',
    image: 'common/images/ga.image/computer-quiz-hero.png',
  },
  'ga_ladder.html': {
    eyebrow: 'ONURI / PLAY TOGETHER',
    title: '사다리 게임',
    description: '이름과 결과를 입력하고, 각자 어떤 결과에 도착하는지 확인하세요.',
    image: 'common/images/ga.image/computer-quiz-hero.png',
  },
  'mo_notice.html': {
    eyebrow: 'ONURI / NEWS & UPDATES',
    title: 'Announcements',
    description: '새로운 소식과 수업 운영 안내를 확인하세요.',
    image: 'common/images/shared/index-hero.png',
  },
  'mo_manual.html': {
    eyebrow: 'ONURI / PROMPT LIBRARY',
    title: 'GPT Making Manual',
    description: '출력 형식, 이미지 가공, 교안 제작, 실무에 쓸 프롬프트를 찾아보세요.',
    image: 'common/images/ne.image/ai-newsletter-hero.png',
  },
  'ga_mbti-a.html': {
    eyebrow: 'ONURI / PLAY TOGETHER',
    title: '나의 진짜 성격 찾기',
    description: '24개 문항으로 알아보는 심층 성격 유형 진단',
    image: 'common/images/ga.image/mbti-adult-hero.png',
  },
  'ga_mbti-k.html': {
    eyebrow: 'ONURI / PLAY TOGETHER',
    title: '나의 성격 탐험대 🚀',
    description: '질문 8개로 알아보는 나만의 동물 캐릭터!',
    image: 'common/images/ga.image/mbti-adult-hero.png',
  },
  'vi_works.html': {
    title: 'Works',
    description: '완성작과 진행형 작업을 함께 모은 전시 공간입니다. 카테고리, 검색, 정렬로 원하는 작품을 찾아보세요.',
  },
  'vi_about.html': {
    title: 'About',
    description: '만드는 방법을 가르치고, 직접 만들기도 하는 AI 디지털 메이킹 강사입니다.',
  },
  'vi_process.html': {
    title: 'Process',
    description: '작업 종류(캐릭터 / 굿즈 / 디지털 문구)마다 조금씩 다르지만, 대부분 다음 네 단계를 거쳐 완성합니다. 각 작업의 상세 페이지에서 실제 제작 이미지를 함께 볼 수 있습니다.',
  },
  'vi_contact.html': {
    title: 'Contact',
    description: '협업, 커미션, 또는 그냥 인사도 좋습니다. 아래 방법으로 연락해 주세요.',
  },
};
const portfolioLinks = {
  home: ['vi_onuri.html', 'Home'],
  works: ['vi_works.html', 'Works'],
  about: ['vi_about.html', 'About'],
  process: ['vi_process.html', 'Process'],
  contact: ['vi_contact.html', 'Contact'],
};

function portfolioFragment(fragment, file) {
  const brand = file === 'vi_onuri.html' ? 'Onuri<span>MakerLab</span>' : 'make<span>lab</span>';
  const navigation = Object.entries(portfolioLinks).map(([page, [href, label]]) =>
    `      <a href="${href}" data-page="${page}">${label}</a>`).join('\n');
  const footerPages = file === 'vi_contact.html' ? ['home', 'works']
    : ['vi_works.html', 'vi_detail.html'].includes(file) ? ['contact', 'home'] : ['contact', 'works'];
  const footerLinks = footerPages.map(page => {
    const [href, label] = portfolioLinks[page];
    return `      <a href="${href}">${label}</a>`;
  }).join('\n');
  return fragment.replace('{{brand}}', brand).replaceAll('{{navigation}}', navigation)
    .replace('{{footerLinks}}', footerLinks);
}

export async function buildLayoutPages(source = root, { check = false } = {}) {
  const fragments = new Map();
  let newsletterPages;
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
          const templates = ['portal-footer', 'resource-hero'].includes(key)
            ? 'onuri.framework/templates/layout' : 'common/templates/layout';
          const fragment = await readFile(path.join(source, templates, key + '.html'), 'utf8');
          fragments.set(key, fragment.trimEnd().replace(/\r\n/g, '\n'));
        }
        let fragment = fragments.get(key);
        if (key.startsWith('portfolio-')) fragment = portfolioFragment(fragment, name);
        if (key === 'resource-hero') {
          let banner = resourceBanners[folder + '/' + name] ?? resourceBanners[name];
          if (folder === 'ne_news') {
            newsletterPages ??= JSON.parse(await readFile(path.join(source, 'common/data/newsletter-pages.json'), 'utf8'));
            banner = newsletterPages.find(page => 'ne_' + page.channel + '.html' === name);
          }
          if (folder === 'vi_vibe/vi_onuri') {
            banner = {
              ...banner,
              eyebrow: 'ONURI MAKER LAB',
              image: 'common/images/vi.image/onuri-maker-hero.png',
              variant: 'portfolio-hero',
            };
          }
          fragment = renderResourceHero(fragment, banner, '../'.repeat(folder.split('/').length));
        }
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
