export const templateSamples = [
  {
    id: 'portal',
    title: '포털형 샘플',
    description: '로그인 후 홈과 메뉴를 보여 주고, 선택한 페이지를 같은 창 안에 엽니다.',
    areas: [
      ['header', '공통 헤더', ['Onuri.', 'Vibe Coding', 'Games', 'More', '테마'], '로고·상단 메뉴·테마를 배치합니다. 메뉴 구성은 common/js/pages/index.js에서 관리합니다.'],
      ['hero', '홈 배너', ['함께 배우고 직접 만들어요', '자료실과 뉴스레터를 둘러보세요.'], '로그인 직후 표시되는 소개 영역입니다. index.html의 홈 배너에서 편집합니다.', 'common/images/shared/index-banner.png'],
      ['cards', '그룹과 콘텐츠', ['수업 자료', '학습 게임', '뉴스레터'], '홈 카드에서 메뉴를 선택하면 본문이 iframe으로 전환됩니다. 카드와 화면 전환은 포털 코드가 담당합니다.'],
      ['footer', '공통 푸터', ['Onuri.', 'Site Map', 'Back to Top'], '사이트 안내와 맨 위 이동을 배치합니다. portal-footer.html에서 편집합니다.'],
    ],
  },
  {
    id: 'banner',
    title: '배너·본문형 샘플',
    description: '전체 너비 배너로 주제를 소개하고 바로 아래에 해당 페이지의 작업 화면을 둡니다.',
    areas: [
      ['hero', '공통 소개 배너', ['컴퓨터 탐험 퀴즈', 'AI와 코딩 기초를 문제로 익혀요.'], '제목·설명·이미지는 build-layout-pages.mjs의 해당 페이지 설정에서 바꿉니다.', 'common/images/ga.image/computer-quiz-hero.png'],
      ['sidebar', '입력과 설정', ['난이도 선택', '출제 문제 수', '퀴즈 시작'], '페이지 고유 입력과 실행 버튼입니다. 게임의 경우 on_class/on_quiz/on_quiz.html에서 편집합니다.'],
      ['body', '작업 및 결과', ['컴퓨터 기초', '디지털 안전', 'AI와 메이킹'], '선택한 기능의 본문이나 결과가 표시됩니다. 개별 게임과 도구의 스크립트가 담당합니다.'],
    ],
  },
  {
    id: 'manual',
    title: '검색·목록·상세형 샘플',
    description: '자료가 많고 사용자가 검색해서 한 건씩 읽는 화면에 사용합니다.',
    areas: [
      ['hero', '매뉴얼 소개', ['Coding Manual', '구조와 개발 규칙을 찾아보세요.'], '매뉴얼의 범위를 짧게 안내합니다. 공통 배너 설정에서 편집합니다.', 'common/images/ne.image/ai-newsletter-hero.png'],
      ['controls', '검색과 분류', ['키워드 검색', '카테고리 ▾'], '검색어와 카테고리를 함께 적용합니다. GPT·Coding Manual은 mo_manual.js의 검색 동작을 공유합니다.'],
      ['sidebar', '문서 목록', ['시스템 개발명세서', '공통 프레임워크', '메뉴와 템플릿'], '검색 결과가 나타나는 곳입니다. 선택하면 오른쪽 문서가 바뀝니다.'],
      ['body', '상세 본문', ['메뉴와 템플릿', '공통과 페이지 전용의 범위를 확인합니다.', '본문 복사'], 'Coding Manual은 docs 원본에서 본문을 생성합니다. 설명을 고칠 때는 원본 Markdown을 편집합니다.'],
    ],
  },
  {
    id: 'newsletter',
    title: '뉴스레터형 샘플',
    description: '발행일과 주기에 따라 여러 호를 탐색하고 본문을 읽는 화면입니다.',
    areas: [
      ['hero', '채널 배너와 태그', ['AI Newsletter', 'AI 트렌드 · 교육과 활용 · 새로운 관점'], '채널별 제목·설명·태그는 common/data/newsletter-pages.json에 있습니다.', 'common/images/ne.image/ai-newsletter-hero.png'],
      ['sidebar', '검색과 발행 목록', ['검색어 입력', '발행 주기 ▾', '최근 발행호'], '검색과 발행 주기 필터 아래에 뉴스레터를 날짜별로 표시합니다. 두 채널이 화면과 동작을 공유합니다.'],
      ['body', '리포트 뷰어', ['이번 호 AI 리포트', '요약 · 목차 · 본문', '원본 다운로드'], '선택한 호의 본문과 출처를 표시합니다. 기사는 common/file/ne.file/의 원본에서 가져옵니다.'],
    ],
  },
  {
    id: 'portfolio',
    title: '포트폴리오·갤러리형 샘플',
    description: '작품을 카드로 비교하고 각 작품의 상세 화면으로 이동하는 구성입니다.',
    areas: [
      ['header', '포트폴리오 메뉴', ['OnuriMakerLab', 'Works', 'About', 'Process', 'Contact'], '사이트 안의 페이지를 연결합니다. 오누리메이커랩은 portfolio-header.html에서 메뉴 구조를 공유합니다.'],
      ['hero', '작품 소개', ['Works', '캐릭터와 굿즈, 디지털 문구를 둘러보세요.'], '갤러리의 성격을 설명합니다. 목록 화면에서는 공통 배너를 사용합니다.', 'common/images/vi.image/onuri-maker-hero.png'],
      ['controls', '필터와 정렬', ['카테고리 선택', '작품 검색', '최신순 ▾'], '작품 수가 많을 때 목록을 좁힙니다. 오누리메이커랩의 목록 동작은 vi_works.js에서 관리합니다.'],
      ['cards', '작품 카드', ['캐릭터', '굿즈', '디지털 문구'], '각 카드는 작품 상세로 이어집니다. 오누리메이커랩 작품 데이터는 vi_items.js에서 편집합니다.'],
    ],
  },
  {
    id: 'institution',
    title: '기관 소개형 샘플',
    description: '기관의 역할과 교육·장비·방문 정보를 한 페이지에서 안내합니다.',
    areas: [
      ['header', '기관 로고와 메뉴', ['3D창의공작센터', '소개', '교육', '장비', '방문'], '메뉴는 같은 페이지의 각 본문 영역으로 이동합니다. vi_vibe/vi_knu.html에서 수정합니다.'],
      ['hero', '기관 소개', ['아이디어에서 제작까지', '교육과 제작을 지원합니다.'], '기관의 역할과 대표 이미지를 나란히 표시합니다. 센터 페이지의 전용 소개 영역입니다.', 'common/images/vi.image/onuri-maker-hero.png'],
      ['cards', '교육·제작 안내', ['메이커 교육', '디지털 제작', '장비 지원'], '프로그램과 보유 장비를 주제별로 나눕니다. 각 영역의 본문과 링크를 HTML에서 편집합니다.'],
      ['footer', '방문 및 문의', ['이용 시간', '방문 안내', '문의처'], '이용 방법과 연락처를 배치합니다. 실제 운영 정보가 바뀌면 이 영역을 수정합니다.'],
    ],
  },
];
