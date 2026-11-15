# 데이터베이스 및 API 개발명세서

이 명세는 ISO/IEC/IEEE 29148:2018의 요구사항 추적 방식을 참고해 데이터 출처, 저장 규칙, 접근 권한과 확인 기준을 연결합니다. [ISO 요구사항 공학 표준](https://www.iso.org/standard/72089.html)

## 사용 DB와 저장소

| 구성 | 역할 | 확인 기준 |
|---|---|---|
| Supabase PostgreSQL · `public` | 사원·부서, 평가, 공통코드, 관리자 권한과 게시글 | PK·FK·제약조건, 공개 범위와 RLS를 확인합니다. |
| Supabase Auth | 관리자 인증 | 관리자 권한은 `tbl_users`로 확인합니다. |
| 직원별 XML · Supabase Storage | 인사카드와 지침서 본문 | `tbl_emp.profile_file`로 파일을 읽고 비공개 편집본은 `staff-guides`에 저장합니다. |

## 모듈별 테이블과 관계

| 모듈 | 주요 객체 | 저장·조회 계약 |
|---|---|---|
| 인사관리 | `tbl_emp`, `tbl_dept`, `tbl_evalu` | 사원은 부서 코드를 참조하고, 평가는 사원코드를 참조합니다. 프로필과 지침서 본문은 직원별 XML에 둡니다. |
| 게시판 | `tbl_board` 테이블 | 화면은 `tbl_board`를 사용합니다. 게시판 코드는 `tbl_comcode`를 참조합니다. |
| 공통코드·권한 | `tbl_comcode`, `tbl_users` | 부서명과 게시판명을 코드로 조회하고, 관리자 권한은 인증 계정과 대조합니다. |

## ERD 읽는 방법

**전체 모듈 · 포털 통합 ERD**에서 포털 테이블을 함께 봅니다. 관계가 복잡하면 **인사관리**, **게시판**, **공통코드·권한** 중 하나를 선택합니다. 기본 100%에서 최대 200%까지 확대할 수 있으며, 가로·세로로 스크롤할 수 있습니다. 테이블을 선택하면 컬럼, 자료형, PK·FK, 제약조건과 접근 정책을 확인할 수 있습니다.

실선 화살표는 실제 외래 키, 점선은 뷰의 원본 참조를 표시합니다. Supabase 관리 영역까지 보려면 **전체 스키마 · Supabase 관리 포함**을 선택합니다. [테이블·컬럼 상세](08-database-schema.md)는 조회 시점의 명세입니다.

## 공지사항

게시글 기본키는 `tbl_board.board_id`이며, `author_id`는 `tbl_users.user_id`를 참조합니다. 작성 시 인증 계정이 작성자로 지정됩니다. 웹은 게시글 키로 `board_author_names`를 호출해 공개 범위에 해당하는 작성자 표시명만 가져옵니다. `tbl_users.user_id`는 Supabase `auth.users.id`를 참조합니다. 스키마와 ERD는 호환 컬럼 제거 후의 구조를 표시합니다.

[공지사항 JS](../../common/js/pages/mo_notice.js)는 브라우저용 Supabase 클라이언트를 사용합니다. 공개 인터페이스는 `public.tbl_board`입니다. `public.tbl_board`에 컬럼 권한과 RLS가 적용됩니다. 아래 컬럼과 제약은 운영 Supabase의 스키마를 읽기 전용으로 조회해 확인했습니다.

| 필드 | 소스에서 확인되는 계약 |
|---|---|
| `board_id` | `bigint` PK. 목록 정렬·수정·삭제 식별자 |
| `board_type` | `text NOT NULL`, 기본 `notice`, 소문자 시작 및 소문자·숫자·밑줄 검사 |
| `title`, `content` | `text NOT NULL`. 앞뒤 공백 제거 후 제목 1~200자, 본문 1~20,000자 |
| `published` | `boolean NOT NULL`, 기본값 `false` |
| `created_at`, `updated_at` | `timestamptz NOT NULL`, 기본값 `now()`. 생성 시각 정렬과 수정 동시성 검사에 사용 |
| `author_id` | `uuid NOT NULL`, `auth.users(id)` 참조. 기본값 `auth.uid()` |
| `updated_by` | `uuid`, `auth.users(id)` 참조. 사용자 삭제 시 `NULL` |

| 동작 | 브라우저 요청과 결과 |
|---|---|
| 목록 | `board_type = 'notice'`. 일반 화면에서 `published = true`. `created_at`, `id` 내림차순과 20개 단위 `range` |
| 로그인과 관리자 검사 | `signInWithPassword({ email, password })` 후 `getUser()` 및 `tbl_users.user_id` 일치 확인 |
| 작성 | `board_type`, `title`, `content`, `published`를 제출하고 생성된 `id`를 요청 |
| 수정 | `board_type`, `id`, `updated_at`을 조건으로 세 입력 필드를 변경하고 `id` 반환을 요청 |
| 삭제 | 동일한 세 조건으로 삭제하고 `id` 반환을 요청 |

공개 공지는 익명 조회가 가능하도록 작성되어 있으며, 관리자 정책은 로그인 계정의 `public.tbl_users` 등록 여부를 검사합니다. 이 테이블의 `user_id uuid`는 PK이자 `auth.users(id)`의 FK이며 사용자 삭제 시 행이 삭제됩니다. `created_at`은 기본값이 `now()`인 `timestamptz NOT NULL`입니다. 로그인 사용자는 RLS로 자기 등록 행을 조회합니다.

UI는 쓰기 직전에 관리자를 다시 검증하고, 동시 변경으로 응답 행이 없거나 권한이 없으면 목록 갱신을 안내합니다. `board_posts_stamp_update` 트리거가 수정 정보를 기록합니다. 운영 스키마에서 `public.tbl_board`와 관련 정책을 확인했고 이전 `public.announcements` 뷰는 제거된 상태였습니다. [게시판 마이그레이션](../../onuri.framework/db_connect/supabase/migrations/20261109030652_edumaker_board_posts.sql)

## 정적 데이터

- `common/data/data.enc.js`는 `window.__ENC__`에 `v`, `it`, `salt`, `iv`, `ct`를 제공합니다. PBKDF2-SHA-256과 AES-GCM으로 복호화된 `cats` 배열은 포털 메뉴의 입력입니다.
- `common/file/cl.file/`와 `course-descriptions.json`으로 `library-data.js`를 생성합니다. `filename`, `bytes`, URL 인코딩된 `url`로 미리보기·다운로드를 제공합니다.
- `common/file/ne.file/`에서 `newsletter-data.js`를 생성합니다. HTML 본문은 sandbox iframe, Markdown은 로컬 markdown-it, PDF는 문서 뷰어를 사용합니다.
- `node common/scripts/build-coding-manual.mjs`는 `do_docs/docs/`와 GPT 매뉴얼 JSON을 각각 `coding-manual.js`, `gpt-making-manual.js`로 생성합니다. 두 페이지는 정적 스크립트에서 본문을 읽으므로 로컬 파일로 열 수 있습니다.
- 메이커 카드 `vi_vibe/vi_onyou/gallery.json`은 작품 경로·분류·제목을 제공합니다. 가져오기에 실패하면 내장 샘플로 표시합니다.
