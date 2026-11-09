# 공통 CSS 클래스 레퍼런스

공통 파일은 `common/css/common.css`입니다. 페이지 고유 선택자는 관련 CSS 파일이 담당합니다. 아래 표는 공통 레이아웃과 여러 페이지가 공유하는 컴포넌트의 계약입니다.

| 클래스 또는 속성 | 정의와 적용 위치 | 주요 스타일·상태 |
|---|---|---|
| `.onuri-header`, `.onuri-home`, `.onuri-brand-text` | `common.css` / 공통 `header`·로고 링크·브랜드 텍스트 | 고정 상단, 가운데 콘텐츠 폭, 독립 페이지·iframe에서 숨김 |
| `.theme-switch`, `[data-set-theme]` | `common.css` / 공통 버튼 그룹과 두 `button` | 밝음·어두움 전환, `aria-pressed`로 선택 표시 |
| `.page-art`, `.page-art-banner`, `.generated-hero-art` | `common.css` / 이미지, `figure`, 이미지 컨테이너 | 비율·모서리·크롭, `[hidden]`은 로딩 실패 이미지 숨김 |
| `.onuri-footer`, `.footer-main`, `.footer-identity`, `.footer-message`, `.footer-actions`, `.footer-bottom` | `common.css` / 포털 `footer`와 내부 슬롯 | 홈과 맨 위로 이동, 좁은 화면에서 간격·그리드 변경 |
| `.game-shell`, `.game-hero`, `.game-hero-kicker` | `common.css` / 게임·공지의 콘텐츠와 소개 | 공용 가로 폭, 소개 이미지 열이 작은 화면에서 접힘 |
| `.game-toolbar`, `.game-study-layout`, `.game-score-panel` | `common.css` / 퀴즈·플래시카드 | 도구 모음, 문제와 점수 그리드, 모바일 단일 열 |
| `.mbti-study-layout`, `.mbti-result-layout`, `.mbti-progress` | `common.css` / 성인·어린이 MBTI | 카드 열 폭 및 진행 영역, 결과 레이아웃 |
| `.library-header`, `.header-inner`, `.library-footer` | `common/css/library.css` / 리빙랩의 `header`·`footer` | 앵커 메뉴, 내부 폭, 화면 크기별 배치 |
| `.button-primary`, `.button-text`, `.course-actions` | `common/css/library.css` 및 `common.css` / 리빙랩 링크·다운로드 버튼 | 주요·보조 액션, 과정별 액션 그룹 |
| `.site-header`, `.desktop-nav`, `.mobile-menu`, `.site-footer` | `common/css/pages/portfolio1/style.css` / 포트폴리오 6페이지 | 데스크톱·모바일 탐색, `.is-open`, `aria-current` |
| `.reveal`, `.back-to-top` | `common/css/pages/portfolio1/style.css` / 포트폴리오 콘텐츠와 버튼 | `.is-visible`에서 표시, 모션 환경 고려 |
| `.report-sidebar`, `.report-reader`, `.reader-markdown` | `common/css/newsletter.css` / 뉴스레터 2페이지 | 목록·본문 구획, Markdown 표와 목차 |

폼 컨트롤 기본 색과 포커스는 `common.css`의 `input`, `select`, `textarea`와 `:focus-visible` 규칙을 따릅니다. 카드와 표의 레이아웃은 목적별로 관리합니다. 예를 들어 포트폴리오 작품 카드와 MBTI 결과 카드는 서로 다른 화면 구조이며 뉴스레터 표는 `.report-table-scroll` 래퍼를 사용합니다.

~~~html
<figure class="page-art-banner">
  <img class="page-art" data-page-image src="../images/index-hero.png"
    alt="" width="1536" height="1024" decoding="async">
</figure>
~~~

`html[data-theme="dark"]`에서 토큰을 바꾸고 `data-embedded`와 `data-standalone`은 공통 UI의 가시성을 정합니다. 선택자는 페이지 가짓수에 따라 필요한 범위로 제한합니다.
