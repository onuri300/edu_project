# 로컬 소스 구조와 파일 규칙

이 문서는 화면을 추가하거나 옮길 때 수정할 원본과 생성 파일을 찾는 기준입니다. 먼저 메뉴와 HTML 경로를 찾고, 해당 화면이 읽는 공통 자산과 페이지 전용 파일을 확인하세요.

## 1. 메뉴별 페이지 위치

| 소스 경로 | 들어 있는 내용 | 적용 규칙 |
|---|---|---|
| `index.html` | 사이트 로그인, 상단 메뉴, 홈, 상세 페이지를 여는 프레임 | 메뉴 동작은 `common/js/pages/index.js`, 전용 스타일은 `common/css/pages/index.css`에서 관리합니다. |
| `vi_vibe/` | Living Lab Library, 메이커 활동과 포트폴리오 | 이 그룹에 추가하는 페이지와 하위 그룹은 `vi_` 접두어를 사용합니다. |
| `ga_games/` | 사다리, MBTI, Edumaker Idea Card | `ga_` 접두어를 사용합니다. |
| `do_docs/` | GPT Manual, Dev Manual, Making Newsletter, AI Newsletter | 페이지는 `do_` 접두어를 사용합니다. 매뉴얼 원본은 `do_docs/docs/`에서 관리합니다. |
| `mn_manage/` | 공지사항·자료실·스태프 관리 | `mn_` 접두어를 사용합니다. 수업 활동은 `cl_class/`에 둡니다. |

화면을 이동하면 메뉴와 빌드의 파일 경로를 함께 수정하세요. 공개 여부와 로그인 후 복귀는 `common/data/site-config.js`에 설정합니다. 암호화 메뉴는 메뉴 편집기에서 현재 파일 경로로 갱신하세요. 하위 폴더의 HTML에서는 루트까지 깊이에 맞춰 CSS, JS, 이미지 상대 경로를 계산합니다.

## 2. 공통 파일과 페이지 전용 파일

| 파일 또는 폴더 | 들어 있는 내용 | 수정 기준 |
|---|---|---|
| `onuri.framework/css/common.css` | 색상·너비 토큰, 공통 헤더·배너·푸터·버튼 | 여러 페이지가 공유하는 규칙을 여기에서 관리합니다. |
| `onuri.framework/css/reader.css` | 검색과 목록, 접기 버튼, 오른쪽 상세 영역 | 매뉴얼·뉴스레터·인사관리처럼 목록에서 상세를 여는 화면에 적용합니다. |
| `onuri.framework/js/auth.js` · `menu-crypto.js` | 포털 세션·경로·새 탭 처리와 기존 메뉴 암호화 | 인증이나 경로 정책을 바꿀 때만 해당 원본을 수정합니다. |
| `onuri.framework/js/common.js` | 공통 헤더 로고, 테마, 프레임 높이 연동 | 공통 초기화와 화면별 동작을 확인합니다. |
| `onuri.framework/images/onuri-logo.png` | 공통 로고와 브라우저 탭 파비콘 | HTML 깊이에 맞는 상대 경로로 연결합니다. |
| `onuri.framework/templates/layout/` | 공통 배너·포털 푸터 원본 | 원본을 수정한 뒤 `build-layout-pages.mjs`로 페이지를 갱신합니다. |
| `common/templates/` | 뉴스레터 HTML과 포트폴리오·리빙랩 레이아웃 조각 | 생성된 뉴스레터를 수정할 때는 템플릿과 채널 설정부터 확인합니다. |
| `common/css/pages/` · `common/js/pages/` | 개별 화면 스타일과 동작 | 기존에 공유하는 자산을 재사용하세요. 예를 들어 `on_people.html`은 `on_people.css`와 `mn_staff.js`를 읽습니다. |
| `common/data/` · `common/file/` · `common/images/` | 사이트 설정과 원본·생성 데이터, 교안·뉴스레터·다운로드 자료, 이미지 | 새 파일을 추가하기 전에 기존 폴더와 참조 경로를 확인합니다. |
| `onuri.framework/db_connect/browser/` · `supabase/migrations/` | 브라우저 DB 클라이언트와 DB 변경 이력 | 브라우저에는 공개 연결 설정만 두고, 스키마 변경은 새 마이그레이션으로 기록합니다. |

## 3. 인사카드 XML 경로와 이름 규칙

`mn_manage/mn_staff.html`은 `on_people.js`를 통해 `tbl_emp.profile_file`에 등록된 파일을 읽습니다. **직원별 XML 하나에 인사카드 내용과 지침서를 함께 둡니다.** 예를 들어 전체 총괄 오누리의 사원코드는 `HQ_001`이며 초기 파일은 `mn_manage/mn_guides/HQ_001.profile.xml`입니다.

| 항목 | 규칙 |
|---|---|
| 초기 XML | `mn_manage/mn_guides/<사원코드>.profile.xml`로 저장하고 `tbl_emp.profile_file`에는 파일명만 등록합니다. |
| 화면에서 저장한 XML | 비공개 Supabase Storage의 `staff-guides` 버킷에 `<사원코드>/<UUID>.xml`로 저장합니다. DB 파일명은 이 경로로 갱신합니다. |
| XML 기본 구조 | UTF-8, 루트는 `<employee>`입니다. 이름, 직급 순위, 역할, 소개, 이미지 파일은 `<name>`, `<rank>`, `<role>`, `<identity>`, `<image>`를 사용합니다. |
| 화면 상세 바인딩 | 핵심 미션은 `<mission>`, 담당 업무는 `<duties><duty>…</duty></duties>`, 책임 산출물은 `<deliverable>`을 사용합니다. 핵심 성향·장점·보완점은 각각 `<personality>`, `<strengths>`, `<review>`입니다. |
| 지침서 | `<prompt>`에 저장합니다. 화면에서 지침서를 삭제할 때는 이 태그를 제거하고 인사카드의 나머지 내용을 유지합니다. |
| DB에 남기는 정보 | 사원 식별·소속과 파일 연결을 관리합니다. 업무평가는 `tbl_evalu`에서 사원코드로 조회합니다. |
| 로컬 직접 열기 | `common/js/pages/on_xml.js`는 브라우저가 `file://`에서 XML 요청을 제한할 때 사용하는 생성 데이터입니다. 초기 XML을 수정한 뒤 이 파일도 원본에 맞춰 갱신합니다. |

공개 배포에 들어가는 초기 XML에는 공개 가능한 콘텐츠만 두세요. 편집본이 등록된 직원은 DB의 Storage 경로를 우선 읽으므로, 로컬 초기 파일을 편집해도 이미 저장한 편집본에는 자동 반영되지 않습니다.

## 4. 생성과 검수

- 메뉴 경로와 레이아웃을 바꾸면 암호화 메뉴와 레이아웃 원본을 갱신한 뒤 `build-layout-pages.mjs`를 실행하세요.
- Dev Manual 문서를 바꾸면 `node common/scripts/build-coding-manual.mjs`로 `common/data/coding-manual.js`를 다시 생성하세요.
- 새 경로의 로컬 CSS·JS·이미지와 XML 태그를 확인하고 `node --test common/scripts/*.test.mjs`를 실행하세요.
- `_site/`는 로컬 배포 빌드 결과입니다. 실제 배포는 최종 관리자 지시에 따릅니다.
