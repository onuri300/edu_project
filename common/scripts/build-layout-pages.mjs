import { renderResourceHero } from '../../onuri.framework/scripts/render-banner.mjs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
export const pageFolders = ['.', 'mng', 'do_docs',
  'ga_games', 'cl_class', 'mn_manual', 'mn_manage', 'vi_vibe', 'vi_vibe/vi_onuri', 'vi_vibe/vi_onyou'];
const region = /<!-- layout:([a-z-]+) -->\r?\n[\s\S]*?\r?\n<!-- \/layout:\1 -->/g;
const resourceBanners = {
  'mn_equip.html': {
    variant: 'resource-hero-compact',
    title: "Equipment · 장비",
    description: '오누리 작업실의 용도별 장비와 사양를 확인하세요.',
    image: 'common/images/ne.image/ai-newsletter-hero.png',
  },
  'mn_program.html': {
    variant: 'resource-hero-compact',
    title: "Programs · 프로그램",
    description: '오누리 작업실의 제작·AI·개발 및 배포 프로그램을 확인하세요.',
    image: 'common/images/ne.image/ai-newsletter-hero.png',
  },
  'mn_staff.html': {
    variant: 'resource-hero-compact',
    eyebrow: 'ONURI / MANAGEMENT',
    title: '스태프 관리',
    description: '오누리 프로젝트 에이전트의 역할과 담당 업무를 확인하세요.',
    image: 'common/images/shared/index-hero.png',
  },
  'mn_dev.html': {
    variant: 'resource-hero-compact',
    eyebrow: 'ONURI / DEVELOPER GUIDE',
    title: "Dev · 개발 명세",
    description: '프로젝트 구조, 공통 프레임워크, API와 페이지 개발 규칙을 확인하세요.',
    image: 'common/images/ne.image/ai-newsletter-hero.png',
  },
  'vi_library.html': {
    variant: 'resource-hero-compact',
    title: 'Living Lab Library',
    description: '수업에 필요한 교안을 미리 보고 내려받을 수 있는 리빙랩 자료실입니다.',
    image: 'common/images/shared/index-hero.png', width: 1536, height: 1024,
  },
  'cl_idea.html': {
    variant: 'resource-hero-compact',
    title: "Edumaker Idea Card",
    description: '세 가지 주제의 제작 사례 15개에서 아이디어를 골라 우리 팀의 프로젝트를 시작해 보세요.',
    image: 'common/images/cl.image/edumaker-idea-card-hero.png', width: 600, height: 360,
  },
  'cl_quiz.html': {
    variant: 'resource-hero-compact',
    eyebrow: 'ONURI / PLAY TOGETHER',
    title: "Computer Quiz",
    description: 'AI, 개인정보 보호, 코딩, 3D 프린팅까지 100문제로 디지털 세상을 탐험해 보세요.',
    image: 'common/images/ga.image/computer-quiz-hero.png',
  },
  'cl_cards.html': {
    variant: 'resource-hero-compact',
    eyebrow: 'ONURI / PLAY TOGETHER',
    title: "IT Flashcards",
    description: '설명을 읽고 키워드를 떠올려 보세요. 카드를 클릭하면 키워드가 나타납니다.',
    image: 'common/images/ga.image/computer-quiz-hero.png',
  },
  'cl_ladder.html': {
    eyebrow: 'ONURI / PLAY TOGETHER',
    title: "Ladder Game",
    description: '이름과 결과를 입력하고, 각자 어떤 결과에 도착하는지 확인하세요.',
    image: 'common/images/ga.image/computer-quiz-hero.png',
  },
  'on_notice.html': {
    variant: 'resource-hero-compact',
    eyebrow: 'ONURI / NEWS & UPDATES',
    title: 'Notice',
    description: '새로운 소식과 수업 운영 안내를 확인하세요.',
    image: 'common/images/shared/index-hero.png',
  },
  'mn_ai.html': {
    variant: 'resource-hero-compact',
    eyebrow: 'ONURI / PROMPT LIBRARY',
    title: "AI · 인공지능",
    description: 'ChatGPT, Claude, Gemini, NotebookLM의 활용법과 프롬프트를 확인하세요.',
    image: 'common/images/ne.image/ai-newsletter-hero.png',
  },
  'cl_mbti-a.html': {
    eyebrow: 'ONURI / PLAY TOGETHER',
    title: "Adult MBTI Test",
    description: '24개 문항으로 알아보는 심층 성격 유형 진단',
    image: 'common/images/ga.image/mbti-adult-hero.png',
  },
  'cl_mbti-k.html': {
    eyebrow: 'ONURI / PLAY TOGETHER',
    title: "Kids’ MBTI Test",
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
          if (folder === 'do_docs' && ['do_ai.html', 'do_making.html'].includes(name)) {
            newsletterPages ??= JSON.parse(await readFile(path.join(source, 'common/data/newsletter-pages.json'), 'utf8'));
            banner = newsletterPages.find(page => 'do_' + page.channel + '.html' === name);
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

