# 데이터베이스 및 API 개발명세서

## 공지사항

[공지사항 JS](../common/js/pages/announcements.js)는 브라우저용 Supabase 클라이언트를 사용합니다. 공개 인터페이스는 `public.board_posts`입니다. `security_invoker` 뷰를 거쳐 `edumaker.board_posts`의 테이블 권한과 RLS가 적용됩니다. 아래 컬럼과 제약은 운영 Supabase의 스키마를 읽기 전용으로 조회해 확인했습니다.

| 필드 | 소스에서 확인되는 계약 |
|---|---|
| `id` | `bigint` PK. 목록 정렬·수정·삭제 식별자 |
| `board_type` | `text NOT NULL`, 기본 `notice`, 소문자 시작 및 소문자·숫자·밑줄 검사 |
| `title`, `content` | `text NOT NULL`. 앞뒤 공백 제거 후 제목 1~200자, 본문 1~20,000자 |
| `published` | `boolean NOT NULL`, 기본값 `false` |
| `created_at`, `updated_at` | `timestamptz NOT NULL`, 기본값 `now()`. 생성 시각 정렬과 수정 동시성 검사에 사용 |
| `author_id` | `uuid NOT NULL`, `auth.users(id)` 참조. 기본값 `auth.uid()` |
| `updated_by` | `uuid`, `auth.users(id)` 참조. 사용자 삭제 시 `NULL` |

| 동작 | 브라우저 요청과 결과 |
|---|---|
| 목록 | `board_type = 'notice'`. 일반 화면에서 `published = true`. `created_at`, `id` 내림차순과 20개 단위 `range` |
| 로그인과 관리자 검사 | `signInWithPassword({ email, password })` 후 `getUser()` 및 `admin_users.user_id` 일치 확인 |
| 작성 | `board_type`, `title`, `content`, `published`를 제출하고 생성된 `id`를 요청 |
| 수정 | `board_type`, `id`, `updated_at`을 조건으로 세 입력 필드를 변경하고 `id` 반환을 요청 |
| 삭제 | 동일한 세 조건으로 삭제하고 `id` 반환을 요청 |

공개 공지는 익명 조회가 가능하도록 작성되어 있으며, 관리자 정책은 로그인 계정의 `public.admin_users` 등록 여부를 검사합니다. 이 테이블의 `user_id uuid`는 PK이자 `auth.users(id)`의 FK이며 사용자 삭제 시 행이 삭제됩니다. `created_at`은 기본값이 `now()`인 `timestamptz NOT NULL`입니다. 로그인 사용자는 RLS로 자기 등록 행을 조회합니다.

UI는 쓰기 직전에 관리자를 다시 검증하고, 동시 변경으로 응답 행이 없거나 권한이 없으면 목록 갱신을 안내합니다. `board_posts_stamp_update` 트리거가 수정 정보를 기록합니다. 운영 스키마에서 `public.board_posts`와 관련 정책을 확인했고 이전 `public.announcements` 뷰는 제거된 상태였습니다. [게시판 마이그레이션](../supabase/migrations/20261109030652_edumaker_board_posts.sql)

## 정적 데이터

- `common/data/data.enc.js`는 `window.__ENC__`에 `v`, `it`, `salt`, `iv`, `ct`를 제공합니다. PBKDF2-SHA-256과 AES-GCM으로 복호화된 `cats` 배열은 포털 메뉴의 입력입니다.
- `books/`와 `course-descriptions.json`으로 `library-data.js`를 생성합니다. `filename`, `bytes`, URL 인코딩된 `url`로 미리보기·다운로드를 제공합니다.
- `reports/`에서 `newsletter-data.js`를 생성합니다. HTML 본문은 sandbox iframe, Markdown은 로컬 markdown-it, PDF는 문서 뷰어를 사용합니다.
- 메이커 카드 `dist/gallery.json`은 작품 경로·분류·제목을 제공합니다. 가져오기에 실패하면 내장 샘플로 표시합니다.

edumaker는 별도로 운영되는 앱입니다. 이 포털은 서비스 링크를 제공하며, 앱의 강좌·차시·일지·슬라이드·Canva 데이터는 운영 앱에서 관리합니다. [edumaker 연결 안내](edumaker-integration.md)
