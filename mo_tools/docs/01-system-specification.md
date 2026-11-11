# 시스템 개발명세서

Onuri는 교안과 제작 사례를 교육 포털에 모으고, 일부 기능을 독립 주소에서도 제공합니다. 정적 HTML·CSS·JavaScript와 Node.js 빌드 스크립트로 구성됩니다. GitHub Pages는 `_site`의 정적 파일을 제공하며, 공지사항은 브라우저에서 Supabase로 요청합니다.

| 경로 | 역할 |
|---|---|
| `index.html` | 로그인, 홈, 메뉴, 자료 iframe |
| `cl_class/` | 리빙랩 공개 교안, edumaker 연결, 아이디어 카드 |
| `ga_games/` | 컴퓨터 퀴즈, 플래시카드, 사다리 게임, 성인·어린이 MBTI |
| `mo_tools/` | 공지사항, GPT 만들기 매뉴얼, Coding Manual |
| `mo_tools/docs/` | 개발명세, 프레임워크 매뉴얼, 레퍼런스 원본 |
| `ne_news/` | AI·Making 뉴스레터 목록과 본문 |
| `vi_vibe/vi_onuri/` | 포트폴리오 홈·소개·작품·상세·과정·연락 |
| `vi_vibe/vi_onyou/` | 메이커 카드 기본·카테고리·모바일 화면, 사용 안내와 다운로드 |
| `mng/menu-builder.html`, `mng/builder.css`, `mng/builder.js` | 로컬 메뉴 편집기와 전용 스타일·동작 |
| `onuri.framework/` | 공통 CSS·JS, 배너·푸터 템플릿, 미리보기 |
| `common/css/`, `common/js/` | 페이지별 스타일과 브라우저 동작 |
| `common/templates/`, `common/scripts/` | 레이아웃 및 뉴스레터 원본, 생성·빌드·검증 |
| `common/data/` | 암호화 메뉴, 설정, 빌드에서 생성한 목록 |
| `common/file/<메뉴 그룹 코드>.file/` | `cl.file` 리빙랩 교안, `ne.file` 뉴스레터 원본, `vi.file` 메이커 카드 자료 |
| `common/images/<그룹 코드>.image/`, `common/images/shared/` | 메뉴 그룹 전용 이미지와 공용 대표 이미지 |
| `onuri.framework/db_connect/supabase/migrations/` | 정적 공지 게시판의 데이터베이스 변경 이력 |
| `common/apps/edumaker/` | 별도 서버 앱의 소스와 저장소 문서 |
| `mo_tools/mo_manual.html` | GPT 메이킹 매뉴얼 공개 페이지 |
| `.github/workflows/pages.yml` | Node.js 22 테스트, 빌드, GitHub Pages 배포 |

브라우저는 `auth.js`로 현재 페이지의 세션·공개 여부를 결정하고 `common.js`로 공통 헤더와 테마를 초기화합니다. 헤더와 테마 전환의 가시성은 포털, 독립 페이지, iframe에 따라 다릅니다. 포털 푸터와 리빙랩·포트폴리오의 헤더·푸터는 정적 레이아웃 조각으로 생성됩니다. 뉴스레터 두 페이지는 전용 템플릿과 채널 데이터로 생성됩니다.

포털 세션은 복호화된 메뉴를 최대 8시간 유지하고 내부 탐색과 새 탭을 승인합니다. 리빙랩 및 `mo_tools/`의 HTML은 공개 경로입니다. 클라이언트 세션은 화면 전환을 제어하며 GitHub Pages의 원본 파일 접근 자체를 제한할 수 없습니다. 공지 관리자 권한과 공개 여부는 Supabase 권한과 RLS가 집행합니다.

교안 빌드는 번호가 붙은 PDF를 확인하고 브라우저용 목록을 생성합니다. 로컬 파일 모드용 다운로드 데이터는 Git과 배포에서 제외됩니다. 뉴스레터 빌드는 `common/file/ne.file/`를 읽어 목록 데이터를 만들고, 작품 갤러리는 별도의 매니페스트를 읽습니다. 기존 주소는 `page-routes.json`에서 이동 페이지로 변환됩니다. 자세한 데이터 계약은 [데이터베이스·API 명세](05-data-api-specification.md)를 참고합니다.

GitHub Pages 워크플로는 테스트 후 `node common/scripts/build-library.mjs --deploy`로 `_site`를 만듭니다. 배포에는 `onuri.framework/css`, `js`, `images`, `db_connect/browser`의 실행 자산이 포함됩니다. `mng`, 개발 문서 원본, DB 마이그레이션, 로컬 백업과 다운로드 데이터는 배포 대상에서 제외합니다. 코딩 매뉴얼은 생성된 문서 데이터를 읽습니다.
