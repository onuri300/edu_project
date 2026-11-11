# 개발 규칙 및 신규 페이지 개발 가이드

1. `cl_class`, `ga_games`, `ne_news`, `mo_tools`, `vi_vibe` 중 콘텐츠 성격에 맞는 HTML을 둡니다. 기존 메뉴 주소는 `common/data/page-routes.json`으로 호환합니다.
2. 헤더·테마는 공통 초기화로 연결합니다. 헤더나 푸터를 여러 페이지에서 반복하게 되면 `common/templates/layout/`의 조각과 레이아웃 빌더를 사용합니다.
3. CSS는 공통 디자인 토큰과 이미 있는 클래스부터 사용합니다. 페이지 고유 규칙은 `common/css/pages/`에 배치합니다. HTML 클래스와 JS 선택자를 함께 확인합니다.
4. 페이지 동작은 `common/js/pages/`에 둡니다. 상태와 이벤트를 파일 범위로 제한하고 공유 함수는 관련 공통 모듈을 사용합니다.
5. 메뉴에 공개할 페이지는 로컬 `mng/menu-builder.html`에서 추가하고 기존과 같은 형식으로 암호화한 `common/data/data.enc.js`를 갱신합니다. `mo_tools/` HTML의 공개 정책을 고려해 위치를 결정합니다.

## 신규 공개 안내 페이지 예제

`mo_tools/mo_guide.html`을 만든다고 가정합니다. `common/css/pages/mo_guide.css`와 `common/js/pages/mo_guide.js`도 함께 추가합니다.

~~~html
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>워크숍 안내</title>
  <link rel="stylesheet" href="../common/css/pages/mo_guide.css">
  <link rel="stylesheet" href="../onuri.framework/css/common.css">
  <script src="../common/data/site-config.js"></script>
  <script src="../onuri.framework/js/auth.js"></script>
  <script src="../onuri.framework/js/common.js"></script>
  <script src="../common/js/pages/mo_guide.js" defer></script>
</head>
<body data-site-family="portal">
  <main class="game-shell">
    <header class="resource-hero">
      <div class="resource-hero-copy"><h1>워크숍 안내</h1><p>수업 자료를 확인하세요.</p></div>
      <img class="page-art resource-hero-image" data-page-image src="../common/images/shared/index-hero.png"
        alt="" width="1536" height="1024" decoding="async">
    </header>
    <button id="workshop-details" type="button" aria-expanded="false"
      aria-controls="workshop-info">자세히 보기</button>
    <p id="workshop-info" class="workshop-info" hidden>준비물은 수업 안내에서 확인하세요.</p>
  </main>
</body>
</html>
~~~

~~~css
.workshop-info {
  color: var(--ink-soft);
  max-width: 55ch;
}
~~~

~~~js
(() => {
  const button = document.querySelector('#workshop-details');
  const info = document.querySelector('#workshop-info');
  button.addEventListener('click', () => {
    info.hidden = !info.hidden;
    button.setAttribute('aria-expanded', String(!info.hidden));
  });
})();
~~~

`site-structure.test.mjs`의 페이지 수는 새 파일 수에 맞춰 조정합니다. 별도 앱이나 PDF를 동적으로 추가하는 경우에는 실제 런타임 참조와 배포 경로도 확인합니다. 공지 API를 사용할 때는 기존 관리자 검증과 RLS를 함께 적용합니다. 테스트 계정으로 익명·로그인·관리자 역할을 각각 확인하고, 오류 UI에는 작업을 다시 시도할 수 있는 정보를 표시합니다.

검증 명령은 [루트 README](../../README.md)를 참고합니다. `main` 푸시 후 GitHub Actions가 `_site`를 배포하며, `workflow_dispatch`로도 시작할 수 있습니다. 하위 경로에서 상대 링크를 검증하고, 공통 템플릿 변경 후에는 생성된 HTML을 함께 제출합니다. 문제가 생기면 브라우저 네트워크에서 최초 실패 리소스, 콘솔 오류, 인증·테마 속성 순으로 확인합니다.
