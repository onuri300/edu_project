# 공통 CSS 클래스 레퍼런스

공통 파일은 `onuri.framework/css/common.css`입니다. 페이지 고유 선택자는 관련 CSS 파일이 담당합니다. 아래 표는 공통 레이아웃과 여러 페이지가 공유하는 컴포넌트의 계약입니다.

헤더·배너 텍스트·본문은 경남대 메이커센터와 같은 `--content-frame`(최대 1440px)과 `--content-gutter`(기본 32px, 화면이 좁을 때 20px/14px)를 사용합니다. 배너 배경과 이미지는 전체 폭을 유지합니다. 새 페이지의 본문은 `.content-frame` 또는 `.resource-content`를 사용하고, 페이지별 CSS에서는 좌우 폭과 여백을 다시 지정하지 않습니다.

| 클래스 또는 속성 | 정의와 적용 위치 | 주요 스타일·상태 |
|---|---|---|
| `.onuri-header`, `.onuri-home`, `.onuri-brand-text` | `common.css` / 공통 `header`·로고 링크·브랜드 텍스트 | 고정 상단, 가운데 콘텐츠 폭, 독립 페이지·iframe에서 숨김 |
| `.theme-switch`, `[data-set-theme]` | `common.css` / 공통 버튼 그룹과 두 `button` | 밝음·어두움 전환, `aria-pressed`로 선택 표시 |
| `.page-art`, `.page-art-banner`, `.generated-hero-art` | `common.css` / 이미지, `figure`, 이미지 컨테이너 | 비율·모서리·크롭, `[hidden]`은 로딩 실패 이미지 숨김 |
| `.onuri-footer`, `.footer-main`, `.footer-identity`, `.footer-message`, `.footer-actions`, `.footer-bottom` | `common.css` / 포털 `footer`와 내부 슬롯 | 홈과 맨 위로 이동, 좁은 화면에서 간격·그리드 변경 |
| `.resource-hero`, `.resource-hero-copy`, `.resource-hero-image` | `common.css` / 페이지 공통 배너 | 화면 전체 너비, 작은 화면에서는 소개와 이미지가 세로 배치 |
| `.game-toolbar`, `.game-study-layout`, `.game-score-panel` | `common.css` / 퀴즈·플래시카드 | 도구 모음, 문제와 점수 그리드, 모바일 단일 열 |
| `.mbti-study-layout`, `.mbti-result-layout`, `.mbti-progress` | `common.css` / 성인·어린이 MBTI | 카드 열 폭 및 진행 영역, 결과 레이아웃 |
| `.library-header`, `.header-inner`, `.library-footer` | `common/css/pages/cl_library.css` / 리빙랩의 `header`·`footer` | 앵커 메뉴, 내부 폭, 화면 크기별 배치 |
| `.button-primary`, `.button-text`, `.course-actions` | `common/css/pages/cl_library.css` 및 `common.css` / 리빙랩 링크·다운로드 버튼 | 주요·보조 액션, 과정별 액션 그룹 |
| `.site-header`, `.desktop-nav`, `.mobile-menu`, `.site-footer` | `common/css/pages/vi_onuri.css` / 포트폴리오 6페이지 | 데스크톱·모바일 탐색, `.is-open`, `aria-current` |
| `.reveal`, `.back-to-top` | `common/css/pages/vi_onuri.css` / 포트폴리오 콘텐츠와 버튼 | `.is-visible`에서 표시, 모션 환경 고려 |
| `.reading-layout`, `.reading-sidebar`, `.reading-divider`, `.reading-content` | `onuri.framework/css/reader.css` / 두 매뉴얼과 두 뉴스레터 | 왼쪽 검색·목록, 접기 버튼, 제목·부제목·본문 글꼴과 가로 구분선 |
| `.reader-markdown`, `.reader-toc`, `.reader-tags` | `common/css/pages/ne_reader.css` / 뉴스레터 2페이지 | Markdown 표, 목차와 태그 |
| `.idea-cases`, `.idea-case` | `common/css/pages/cl_idea.css` / 창원로컬·에듀메이커·라이프 | 960px 이상에서 3열, 좁은 화면에서 1열. 설명은 이미지 아래에 표시 |

폼 컨트롤 기본 색과 포커스는 `common.css`의 `input`, `select`, `textarea`와 `:focus-visible` 규칙을 따릅니다. 카드와 표의 레이아웃은 목적별로 관리합니다. 예를 들어 포트폴리오 작품 카드와 MBTI 결과 카드는 서로 다른 화면 구조이며 뉴스레터 표는 `.report-table-scroll` 래퍼를 사용합니다.

~~~html
<figure class="page-art-banner">
  <img class="page-art" data-page-image src="../common/images/shared/index-hero.png"
    alt="" width="1536" height="1024" decoding="async">
</figure>
~~~

`html[data-theme="dark"]`에서 토큰을 바꾸고 `data-embedded`와 `data-standalone`은 공통 UI의 가시성을 정합니다. 선택자는 페이지 가짓수에 따라 필요한 범위로 제한합니다.
