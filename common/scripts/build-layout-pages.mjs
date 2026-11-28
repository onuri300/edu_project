import { renderResourceHero } from '../../onuri.framework/scripts/render-banner.mjs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
export const pageFolders = ['.', 'mng', 'do_docs',
  'ga_games', 'cl_class', 'mn_manual', 'mn_manage', 'vi_vibe', 'vi_vibe/vi_onuri', 'vi_vibe/vi_onyou'];
const region = /<!-- layout:([a-z-]+) -->\r?\n[\s\S]*?\r?\n<!-- \/layout:\1 -->/g;
const resourceBanners = {
  'index.html': {
    eyebrow: 'ONURI / LEARN & MAKE',
    title: '오누리 학습 포털',
    description: '수업 자료부터 새로운 기술 이야기까지, 배움과 만들기를 이어가는 공간입니다.',
    image: 'common/images/shared/index-banner.png', width: 2172, height: 398,
  },
  'mn_equip.html': {
    variant: 'resource-hero-compact',
    title: '장비',
    description: '오누리 작업실의 용도별 장비와 사양을 확인하세요.',
    image: 'common/images/ne.image/ai-newsletter-hero.png',
  },
  'mn_program.html': {
    variant: 'resource-hero-compact',
    title: '프로그램',
    description: '오누리 작업실의 제작·AI·개발 및 배포 프로그램을 확인하세요.',
    image: 'common/images/ne.image/ai-newsletter-hero.png',
  },
  'mn_staff.html': {
    variant: 'resource-hero-compact',
    eyebrow: 'ONURI / MANAGEMENT',
    title: '에이전트 관리',
    description: '오누리 프로젝트 에이전트의 역할과 담당 업무를 확인하세요.',
    image: 'common/images/shared/index-hero.png',
  },
  'mn_dev.html': {
    variant: 'resource-hero-compact',
    eyebrow: 'ONURI / DEVELOPER GUIDE',
    title: '개발 명세',
    description: '프로젝트 구조, 공통 프레임워크, API와 페이지 개발 규칙을 확인하세요.',
    image: 'common/images/ne.image/ai-newsletter-hero.png',
  },
  'vi_library.html': {
    variant: 'resource-hero-compact',
    title: '리빙랩 자료실',
    description: '수업에 필요한 교안을 미리 보고 내려받을 수 있는 리빙랩 자료실입니다.',
    image: 'common/images/shared/index-hero.png', width: 1536, height: 1024,
  },
  'cl_idea.html': {
    variant: 'resource-hero-compact',
    title: '메이킹 아이디어 카드',
    description: '세 가지 주제의 제작 사례 15개에서 아이디어를 골라 우리 팀의 프로젝트를 시작해 보세요.',
    image: 'common/images/cl.image/edumaker-idea-card-hero.png', width: 600, height: 360,
  },
  'cl_quiz.html': {
    variant: 'resource-hero-compact',
    eyebrow: 'ONURI / PLAY TOGETHER',
    title: '컴퓨터 퀴즈',
    description: '컴퓨터 그림 짝짓기부터 AI, 개인정보 보호, 코딩, 3D 프린팅까지 즐겨 보세요.',
    image: 'common/images/ga.image/computer-quiz-hero.png',
  },
  'cl_cards.html': {
    variant: 'resource-hero-compact',
    eyebrow: 'ONURI / PLAY TOGETHER',
    title: 'IT 암기 카드',
    description: '설명을 읽고 키워드를 떠올려 보세요. 카드를 클릭하면 키워드가 나타납니다.',
    image: 'common/images/ga.image/computer-quiz-hero.png',
  },
  'cl_ladder.html': {
    eyebrow: 'ONURI / PLAY TOGETHER',
    title: '사다리 타기',
    description: '이름과 결과를 입력하고, 각자 어떤 결과에 도착하는지 확인하세요.',
    image: 'common/images/ga.image/computer-quiz-hero.png',
  },
  'mn_notice.html': {
    eyebrow: 'ONURI / NEWS & UPDATES',
    title: '공지사항',
    description: '새로운 소식과 수업 운영 안내를 확인하세요.',
    image: 'common/images/shared/index-hero.png',
  },
  'mn_library.html': {
    eyebrow: 'ONURI / RESOURCE LIBRARY',
    title: '자료실',
    description: '수업 교안, 활동지, 실습 파일을 찾아 내려받으세요.',
    image: 'common/images/shared/index-hero.png',
  },
  'cl_proc.html': {
    eyebrow: 'ONURI / PLAY TOGETHER',
    title: '절차적 사고',
    description: '무엇을 먼저 하고, 그다음엔 무엇을 할까요? 그림 카드로 일상생활의 순서를 맞춰 보세요.',
    image: ['brushing-2.jpg', 'pizza-3.jpg', 'ramen-3.jpg'].map(file => 'common/images/ga.image/sequence/' + file),
    width: 619, height: 619,
  },
  'do_books.html': {
    variant: 'resource-hero-compact',
    eyebrow: 'ONURI / BOOKS',
    title: '읽을거리',
    description: '북코너에서 완성한 책 이야기를 그림과 함께 동화책처럼 읽고, 수업과 독서모임에 가져가세요.',
    image: 'common/images/do.image/books-hero.png', width: 1200, height: 720,
    imageAlt: '창가 의자에 앉아 계절이 바뀌는 것을 바라보는 사람을 그린 수채 느낌의 창작 그림',
    topics: ['그림책·동화', '에세이', '함께 나눌 질문'],
  },
  'mn_ai.html': {
    variant: 'resource-hero-compact',
    eyebrow: 'ONURI / PROMPT LIBRARY',
    title: '인공지능',
    description: 'ChatGPT, Claude, Gemini, NotebookLM의 활용법과 프롬프트를 확인하세요.',
    image: 'common/images/ne.image/ai-newsletter-hero.png',
  },
  'cl_mbti-a.html': {
    eyebrow: 'ONURI / PLAY TOGETHER',
    title: '성인 MBTI',
    description: '24개 문항으로 알아보는 심층 성격 유형 진단',
    image: 'common/images/ga.image/mbti-adult-hero.png',
  },
  'cl_mbti-k.html': {
    eyebrow: 'ONURI / PLAY TOGETHER',
    title: '어린이 MBTI',
    description: '질문 8개로 알아보는 나만의 동물 캐릭터!',
    image: 'common/images/ga.image/mbti-adult-hero.png',
  },
  'vi_works.html': {
    title: '작품 전시',
    description: '완성작과 진행형 작업을 함께 모은 전시 공간입니다. 카테고리, 검색, 정렬로 원하는 작품을 찾아보세요.',
  },
  'vi_about.html': {
    title: '강사 소개',
    description: '만드는 방법을 가르치고, 직접 만들기도 하는 AI 디지털 메이킹 강사입니다.',
  },
  'vi_process.html': {
    title: '제작 과정',
    description: '캐릭터, 굿즈, 디지털 문구가 완성되기까지의 네 단계를 살펴보세요.',
  },
  'vi_contact.html': {
    title: '연락하기',
    description: '협업, 커미션, 또는 그냥 인사도 좋습니다. 아래 방법으로 연락해 주세요.',
  },
  'vi_onuri.html': {
    title: '오누리 메이커랩',
    description: '3D 프린팅·레이저 가공·생성형 AI를 수업과 작업으로 풀어냅니다.',
  },
  'vi_knu.html': {
    eyebrow: 'KYUNGNAM UNIVERSITY / MAKERSPACE',
    title: '경남대학교 3D창의공작센터',
    description: '3D 제작 교육과 디지털 장비를 활용해 아이디어를 직접 만들어 보세요.',
    image: 'common/images/vi.image/onuri-maker-hero.png',
  },
  'vi_onyou.html': {
    eyebrow: 'ONYOU / MAKER CARD',
    title: '온유 메이커 카드',
    description: '작업과 작품을 소개하는 디지털 명함 샘플을 살펴보세요.',
    image: 'common/images/vi.image/onyou-hero.webp',
  },
  'vi_show.html': {
    eyebrow: 'ONYOU / SHOWROOM',
    title: '굿즈 쇼룸',
    description: '일상에 작은 쓰임을 더하는 온유 메이커의 굿즈를 만나보세요.',
    image: 'common/images/vi.image/onyou-hero.webp',
  },
  'vi_log.html': {
    eyebrow: 'ONYOU / MAKING JOURNAL',
    title: '메이킹 기록장',
    description: '작은 아이디어가 손에 잡히는 물건이 되기까지의 과정을 살펴보세요.',
    image: 'common/images/vi.image/onyou-hero.webp',
  },
  'vi_guide.html': {
    eyebrow: 'ONYOU / PHOTO GUIDE',
    title: '사진 관리 안내',
    description: '디지털 명함 샘플에 쓸 사진을 준비하고 갤러리를 업데이트하세요.',
    image: 'common/images/vi.image/onyou-hero.webp',
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
            };
          }
          fragment = renderResourceHero(fragment, banner, folder === '.' ? '' : '../'.repeat(folder.split('/').length));
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

