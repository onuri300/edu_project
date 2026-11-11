# 메뉴 그룹과 기본 템플릿

## 메뉴 그룹별 역할

| 메뉴 | 폴더 | 들어가는 페이지 | 주로 수정하는 곳 |
|---|---|---|---|
| Vibe Coding | `vi_vibe/` | 오누리메이커랩, 온유 메이커 카드, 경남대 창의공작센터 | 작품·프로필 데이터, 갤러리, 센터 소개와 링크 |
| Games | `ga_games/` | 컴퓨터 퀴즈, IT 플래시카드, 사다리 게임, 성인·어린이 MBTI | 문제 데이터, 게임 설정·진행·결과 화면 |
| Class Resources | `cl_class/` | 리빙랩 교안 자료실, 에듀메이커, 아이디어 카드 | `common/file/cl.file/`의 PDF, 교안 설명, 수업 카드와 연결 주소 |
| More | `mo_tools/` | 공지사항, GPT Making Manual, Coding Manual | 공지 내용은 공지 관리 화면, 매뉴얼은 해당 페이지의 코드·데이터 |
| Newsletters | `ne_news/` | AI 뉴스레터, 메이킹 뉴스레터 | `common/file/ne.file/`의 원본, 채널 정보, 뉴스레터 템플릿 |

루트의 `index.html`은 로그인과 그룹 메뉴, 홈 화면을 담당합니다. `mng/menu-builder.html`은 암호화 메뉴 파일을 만드는 로컬 관리 화면입니다. 저장된 메뉴 주소를 바꿀 때는 `common/data/page-routes.json`에 이전 주소와 새 주소의 대응을 유지합니다.

메뉴 편집기는 같은 폴더의 `builder.css`와 `builder.js`를 읽습니다. 편집기에서 내보낸 `data.enc.js`는 `common/data/`에 저장합니다. 이미지 원본은 `common/images/<그룹 코드>.image/` 바로 아래에 두고, 작품이나 용도를 파일명으로 구분합니다. 다운로드 원본은 `common/file/<그룹 코드>.file/`에서 관리합니다.

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
- `common/data/data.enc.js`는 로컬 메뉴 편집기로 생성합니다. `common/file/backups/`와 `common/file/local-downloads/`는 각각 백업과 로컬 다운로드용 생성 데이터를 보관합니다.
- Supabase 권한과 마이그레이션은 `onuri.framework/db_connect/`에서 관리합니다. 공지 문구는 관리자 화면에서 수정합니다.
- `_site/`, `layout:` 주석 사이의 생성된 HTML, `common/data/coding-manual.js`는 빌드 결과입니다. 원본 템플릿과 문서를 수정하고 다시 생성합니다.
- 기존 주소를 바꿀 때는 대응표와 페이지 링크를 함께 갱신합니다. 파일명만 바꾸면 저장된 메뉴나 기존 북마크가 끊길 수 있습니다.

## 기본 템플릿 유형

| 유형 | 사용하는 곳 | 구성과 수정 위치 |
|---|---|---|
| 포털형 | `index.html` | 로그인, 그룹 메뉴, 홈 카드, 콘텐츠 iframe. 공통 푸터는 `onuri.framework/templates/layout/portal-footer.html`에서 편집 |
| 배너·본문형 | 수업 자료, 게임, 공지·도구, 포트폴리오 일부 | `resource-hero.html`이 전체 너비 소개 영역을 생성. 버튼·목록·게임 화면은 페이지 본문에서 편집 |
| 검색·목록·상세형 | GPT Making Manual, Coding Manual | 검색과 카테고리, 왼쪽 목록, 오른쪽 본문. 두 매뉴얼이 스타일과 화면 동작을 공유하며 데이터는 각각 관리 |
| 뉴스레터형 | `ne_news/ne_ai.html`, `ne_news/ne_making.html` | 채널 배너와 태그, 검색·발행 주기·목록, 리포트 뷰어. `common/templates/newsletter.html`과 채널 데이터에서 생성 |
| 포트폴리오·갤러리형 | `vi_vibe/vi_onuri/`, `vi_vibe/vi_onyou/` | 전용 메뉴와 작품 카드·상세 화면. 오누리메이커랩 메뉴·푸터는 `common/templates/layout/`, 온유 메이커 카드 화면은 전용 스크립트에서 관리 |
| 기관 소개형 | `vi_vibe/vi_knu.html` | 기관 로고와 전용 메뉴, 소개·교육·장비·방문 안내. 페이지 HTML과 전용 CSS에서 편집 |

새 사이트의 기본 화면을 시작할 때는 `onuri.framework/preview.html`에서 헤더, 테마, 배너, 콘텐츠 카드 예시를 확인할 수 있습니다.

문서를 수정한 뒤 `node common/scripts/build-coding-manual.mjs`를 실행하면 Coding Manual 목록과 본문이 갱신됩니다.
