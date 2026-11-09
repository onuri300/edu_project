# 공통 프레임워크 사용 매뉴얼

## 페이지 초기화

루트의 [실행 안내](../README.md)에 따라 Node.js 22로 데이터와 레이아웃을 갱신합니다. 한 단계 아래인 `page_etc/`의 페이지는 다음처럼 공통 자산을 불러옵니다. 페이지가 더 깊으면 루트까지의 상대 경로를 조정합니다. 고유 CSS의 로드 순서는 가장 가까운 기존 페이지를 따릅니다.

~~~html
<link rel="stylesheet" href="../common/css/common.css">
<script src="../common/js/auth.js"></script>
<script src="../common/js/common.js"></script>
~~~

`auth.js`와 `common.js`는 최초 렌더링 전에 인증 상태와 테마를 설정합니다. 페이지 전용 스크립트는 DOM 뒤에 두거나 `defer`를 사용합니다. 공통 헤더 `.onuri-header`는 `common.js`가 생성합니다. 포털의 `.onuri-footer`, 리빙랩의 `.library-footer`, 포트폴리오의 `.site-footer`는 각각 콘텐츠와 링크가 다른 레이아웃입니다.

## 헤더·본문·푸터

포털 푸터와 리빙랩·포트폴리오의 레이아웃 조각을 `common/templates/layout/`에서 관리합니다. 본문과 페이지 고유 메뉴·스크립트는 각 HTML에서 편집합니다.

~~~html
<!-- layout:library-footer -->
<footer class="library-footer"><strong>리빙랩 수업 자료실</strong><p>함께 배우고 직접 만드는 시간을 위한 교안 공간.</p><a href="#home">맨 위로 ↑</a></footer>
<!-- /layout:library-footer -->
~~~

레이아웃 파일을 편집한 뒤 아래 명령으로 HTML을 다시 생성합니다. 브라우저는 파일에 렌더링된 HTML을 그대로 읽습니다.

~~~powershell
node common/scripts/build-layout-pages.mjs
node common/scripts/build-layout-pages.mjs --check
~~~

## 스타일과 동작

색상은 `--paper`, `--card`, `--ink`, `--ink-soft`, `--line`, `--accent`를 사용합니다. 리빙랩은 `.button-primary`, 게임과 공지는 `.game-hero`, 게임은 `.game-toolbar`와 `.game-study-layout`을 사용합니다. 카드·표·폼은 [클래스 레퍼런스](03-css-reference.md)에서 적용 가능한 구조를 확인합니다. 페이지 고유 규칙은 해당 CSS에 두고 공용 스타일을 수정하면 좁은 화면과 밝고 어두운 테마를 함께 비교합니다.

브라우저 공통 모듈은 `file://` 지원을 위해 클래식 스크립트를 사용합니다. 모바일 메뉴와 기본 UI는 `common.js`에서 초기화합니다. Node 빌드는 `.mjs`의 `import`와 `export`를 사용합니다. 이벤트는 초기화 시 한 번 연결하고, 비동기 요청은 실패 상태를 사용자에게 표시합니다. 세션·다운로드·모바일 메뉴의 호출 계약은 [공통 함수 레퍼런스](04-javascript-reference.md)를 참고합니다.
