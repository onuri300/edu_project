// Books(읽을거리): 오누리 ERP 북코너에서 모든 단계가 승인(완료)된 글만 싣는다.
// 새 글 추가: 블로그 HTML 을 common/file/do.file/books/<id>.html 로 복사하고 아래 배열 맨 위에 한 줄을 넣는다.
//   id       파일 이름(영문 소문자·숫자·하이픈)   date   완료(발행)일 YYYY-MM-DD
//   category 목록 분류(그림책·동화 / 에세이 …)   tags   검색어로도 쓰인다
window.ONURI_BOOKS = [
  {
    id: 'good-or-bad',
    title: '좋은지 나쁜지 누가 아는가',
    author: '류시화',
    publisher: '더숲',
    year: '2019',
    category: '에세이',
    date: '2026-11-22',
    summary: '지금 겪는 일이 좋은지 나쁜지는 아직 모른다. 판단을 늦추는 만큼 삶은 넓어진다.',
    tags: ['판단을 늦추기', '불완전한 나', '매장이 아니라 파종', '성인 독서모임'],
    file: 'common/file/do.file/books/good-or-bad.html',
  },
  {
    id: 'lost-soul',
    title: '잃어버린 영혼',
    author: '올가 토카르추크 글 · 요안나 콘세이요 그림',
    publisher: '사계절',
    year: '2017',
    category: '그림책·동화',
    date: '2026-11-22',
    summary: '너무 빨리 달리느라 영혼을 두고 온 남자가, 한자리에 머물러 기다리는 법을 배우며 자기 자신을 되찾는 이야기.',
    tags: ['기다림', '속도와 상실', '나다움', '성인 독서모임'],
    file: 'common/file/do.file/books/lost-soul.html',
  },
];
