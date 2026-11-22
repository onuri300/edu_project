# 메뉴 그룹과 기본 템플릿

## 메뉴 그룹별 역할

| 메뉴 | 폴더 | 들어가는 페이지 | 주로 수정하는 곳 |
|---|---|---|---|
| Vibe Coding | `vi_vibe/` | 오누리메이커랩, 온유 메이커 카드, 경남대 창의공작센터, Living Lab Library | 작품·프로필 데이터, 갤러리, 센터 소개와 링크 |
| Class Activities | `cl_class/` | 아이디어 카드, IT 플래시카드, 컴퓨터 퀴즈, 사다리 타기, 성인·어린이 MBTI | 문제 데이터와 활동 화면 |
| Manual | `mn_manual/` | 장비, 프로그램, AI, 개발 명세 | 매뉴얼의 화면과 데이터 |
| Document | `do_docs/` | AI 뉴스레터, 메이킹 뉴스레터 | `common/file/ne.file/`의 원본, 채널 정보, 뉴스레터 템플릿 |
| Mng. 관리 | `mn_manage/` | 게시판(공지사항·자료실), 스태프 관리 | 게시글, 수업 자료, 스태프 정보 |

루트의 `index.html`은 로그인과 그룹 메뉴, 홈 화면을 담당합니다. 메뉴를 이동할 때는 `tbl_menu.page_path`를 갱신합니다.

이미지 원본은 `common/images/<그룹 코드>.image/` 바로 아래에 두고, 작품이나 용도를 파일명으로 구분합니다. 다운로드 원본은 `common/file/<그룹 코드>.file/`에서 관리합니다.

## 수정 범위

| 적용 범위 | 수정 위치 | 확인할 페이지 |
|---|---|---|
| 사이트 공통 | `onuri.framework/css/common.css`, `onuri.framework/js/common.js` | 헤더, 테마, 전체 너비 배너, 반응형 레이아웃을 사용하는 전체 페이지 |
| 공통 배너의 제목과 이미지 | `common/scripts/build-layout-pages.mjs`의 페이지별 설정과 `onuri.framework/templates/layout/resource-hero.html` | 설정을 바꾸면 해당 배너, 템플릿을 바꾸면 배너를 쓰는 모든 페이지 |
| 사이트 메뉴와 공개 경로 | `common/js/pages/index.js`, `common/data/site-config.js` | 메뉴 순서, iframe 탐색, 직접 접속과 로그인 후 복귀 |
| 페이지 전용 | 각 그룹의 HTML과 `common/css/pages/`, `common/js/pages/` | 해당 페이지와 그 파일을 공유하는 페이지 |
| 자료와 데이터 | `common/file/cl.file/`, `common/file/ne.file/`, `common/data/`의 페이지별 원본 | 자료 목록, 미리보기, 다운로드, 검색 |

한 페이지의 문구나 버튼을 바꿀 때는 그 페이지의 HTML과 전용 파일부터 확인합니다. 성인·어린이 MBTI, 두 뉴스레터, GPT·Coding Manual처럼 전용 CSS나 JS를 공유하는 화면은 파일을 수정하면 함께 바뀝니다.

## 일반 콘텐츠 수정에서 보호할 부분

- `onuri.framework/js/auth.js`, `menu-crypto.js`, `common/data/site-config.js`는 인증·공개 정책 변경 시에만 수정합니다. 일반 문구 편집은 해당 페이지나 데이터에서 처리합니다.
- `common/data/data.enc.js`는 일반 로그인에 사용합니다. `common/file/backups/`와 `common/file/local-downloads/`는 각각 백업과 로컬 다운로드용 생성 데이터를 보관합니다.
- Supabase 권한과 마이그레이션은 `onuri.framework/db_connect/`에서 관리합니다. 공지 문구는 관리자 화면에서 수정합니다.
- `_site/`, `layout:` 주석 사이의 생성된 HTML, `common/data/coding-manual.js`는 빌드 결과입니다. 원본 템플릿과 문서를 수정하고 다시 생성합니다.
- 기존 주소를 바꿀 때는 대응표와 페이지 링크를 함께 갱신합니다. 파일명만 바꾸면 저장된 메뉴나 기존 북마크가 끊길 수 있습니다.

## 기본 템플릿 유형

| 유형 | 사용하는 곳 | 구성과 수정 위치 |
|---|---|---|
| 포털형 | `index.html` | 로그인, 그룹 메뉴, 홈 카드, 콘텐츠 iframe. 공통 푸터는 `onuri.framework/templates/layout/portal-footer.html`에서 편집 |
| 배너·본문형 | 수업 자료, 게임, 공지·도구, 포트폴리오 일부 | `resource-hero.html`이 전체 너비 소개 영역을 생성. 버튼·목록·게임 화면은 페이지 본문에서 편집 |
| 검색·목록·상세형 | GPT Making Manual, Coding Manual | 검색과 카테고리, 왼쪽 목록, 오른쪽 본문. 두 매뉴얼이 스타일과 화면 동작을 공유하며 데이터는 각각 관리 |
| 뉴스레터형 | `do_docs/do_ai.html`, `do_docs/do_making.html` | 채널 배너와 태그, 검색·발행 주기·목록, 리포트 뷰어. `common/templates/newsletter.html`과 채널 데이터에서 생성 |
| 포트폴리오·갤러리형 | `vi_vibe/vi_onuri/`, `vi_vibe/vi_onyou/` | 전용 메뉴와 작품 카드·상세 화면. 오누리메이커랩 메뉴·푸터는 `common/templates/layout/`, 온유 메이커 카드 화면은 전용 스크립트에서 관리 |
| 기관 소개형 | `vi_vibe/vi_knu.html` | 기관 로고와 전용 메뉴, 소개·교육·장비·방문 안내. 페이지 HTML과 전용 CSS에서 편집 |

새 사이트의 기본 화면을 시작할 때는 `onuri.framework/preview.html`에서 헤더, 테마, 배너, 콘텐츠 카드 예시를 확인할 수 있습니다.

문서를 수정한 뒤 `node common/scripts/build-coding-manual.mjs`를 실행하면 Coding Manual 목록과 본문이 갱신됩니다.

## Document 공통 템플릿

새 Document 페이지에도 공통 배너 다음에 리더를 배치합니다. 바깥에는 `reading-page`, 안에는 `reading-layout document-reader`를 지정합니다. 안쪽에는 `reading-sidebar`(검색·목록), `reading-divider`(목록 +/− 버튼), `reading-content`(본문)를 이 순서로 둡니다.

- 공통 스타일은 `onuri.framework/css/reader.css`, 동작은 `common/js/pages/do_reader.js`를 연결합니다.
- 목록 컨테이너에 `data-document-tree`, 목록 버튼에 `class="document-sidebar-toggle"`, `data-document-sidebar-toggle`와 목록 ID를 가리키는 `aria-controls`를 둡니다. 왼쪽 목록은 처음부터 보이므로 버튼은 `−`, `aria-expanded="true"`입니다. 스크립트는 목록에 전체 펼치기 +와 전체 접기 −를 추가합니다.
- 분류 행은 `<details class="document-tree-branch"><summary>분류 이름</summary>…</details>`를 사용합니다. 왼쪽 목록은 그대로 표시하고 분류 행과 하위 항목만 처음에 접습니다. 검색이나 분류 선택 시 필요한 항목을 펼칩니다.
- 뉴스레터 페이지는 `common/templates/newsletter.html`에서도 같은 구조를 사용합니다. Document 전용 로고는 `common/images/do.image/`에 둡니다.
- 매뉴얼의 화면 캡처·예시 이미지에 해당하는 클릭 순서와 상세 설명은 같은 줄에 배치합니다. `document-media-pair` 안에 테두리가 있는 `document-media-frame`을 왼쪽에, 설명을 오른쪽에 둡니다. 좁은 화면에서는 이미지 위, 설명 아래 순서로 쌓으며 원본 비율과 본문 너비를 지킵니다. 원본을 읽어야 하는 화면 캡처에는 확대 링크를 제공합니다.
- 목록과 본문은 가용 폭에 대한 비율로 배치합니다. 좁은 화면에서는 목록 아래에 본문을 표시합니다. 이미지, 표, 도식과 긴 코드는 본문 범위에서 줄이거나 줄을 바꿔 가로 스크롤이 생기지 않게 합니다.
- 왼쪽 트리의 분류 표시와 전체 펼치기·접기 줄은 인사카드와 같은 reader.css 스타일을 사용합니다. 목록 개수는 왼쪽, +/− 버튼은 오른쪽에 둡니다.
- Document 리더와 인사카드의 기본 열 너비는 가용 폭 기준 2:8입니다. 모바일에서는 위아래로 배치합니다. 왼쪽 목록 자체는 ‹/›로, 목록 안의 전체 펼치기·접기는 +/−로 조작합니다. 조직도 버튼은 조회 조건 아래, 목록 개수와 +/− 위에 둡니다.
- 모든 Document 매뉴얼과 뉴스레터의 왼쪽 사이드바 맨 위 첫 조회 조건에는 **키워드 검색**을 표시합니다. 카테고리·프로그램 선택과 조직도 버튼은 검색 아래에 놓습니다.
