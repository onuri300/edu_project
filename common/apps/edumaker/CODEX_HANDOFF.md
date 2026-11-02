# Development handoff

## 기본 표 보기·헤더 정렬 (2026-10-29)

- 보관함 기본 보기 table, 상단은 카테고리/보기 형식 select만 표시. 정렬 기준/순서 select 제거.
- 표의 카테고리·수업일자·주제·작성일시·상태 헤더를 native button으로 정렬. 같은 열 재클릭 시 오름/내림 전환, 방향 화살표/aria-sort/키보드 포커스 제공. 기존 서버 전체 정렬·선택 삭제·펼치기 유지.
- 상태 정렬 SQL은 실제 기록/초안/미작성 순이며 SQLite로 동작 검증. 타입 검사 통과. 신규 DB 마이그레이션 없음.
- 최종 빌드 통과 및 로컬 서버 재실행. 시각적 브라우저 검증은 미실시.

## 보관함 체크 선택·삭제·복구 (2026-10-29)

- 표/블록 보기에 일지별 체크박스 및 불러온 목록 일괄 선택(최대 200개) 추가. 보기 전환 시 선택 공유, 카테고리/정렬/휴지통 전환 시 선택 초기화. 일지 없는 수업은 선택 불가.
- 선택 삭제는 건수 확인 후 `journalDeletedAt`으로 휴지통 이동. `휴지통 보기`에서 선택 복구 가능. 원본 본문·실제 기록·다른 회차·계획안·교안·이미지는 보존. DB 마이그레이션 없음.
- `/api/library/selection`에서 전체 소유권/회차 검증 후 batch 반영. 동시 수정은 이전 payload 비교로 보호하고 충돌 안내. 일반 수업 저장으로 삭제 상태가 다시 살아나지 않도록 서버에서 기존 tombstone 보존. 복구는 해당 엔드포인트로만 처리.
- 실제 로컬 HTTP로 선택 삭제/전체 회차 삭제 시 목록 제외/휴지통/복구/자료 보존/오래된 저장 시 재등장 방지/접근 제한 검증 통과. 테스트 자료만 정리. 삭제 로직 검사 2개 및 타입 검사 통과.
- 최종 빌드 통과 및 로컬 서버 재실행. 시각적 브라우저 검증은 미실시.

## 보관함 보기/카테고리 선택/정렬 (2026-10-29)

- 표/블록 보기 선택, 카테고리 버튼 목록을 일지 수를 포함한 select로 대체. 작성일시·수업일자·주제·카테고리·최근 저장일시 기준 및 오름/내림차순 제공. 두 보기의 펼친 일지 상태 공유. 전체 펼치기/접기, 전체 본문/편집/분류 변경 유지. 보관함 이미지 표시 없음.
- `/api/library?entries=1&category=...&sort=...&order=...&offset=...`는 SQLite json_each로 회차별 전체 정렬 후 50건 페이지 반환. 기존 courses 응답 경로도 호환 유지. 미입력 날짜는 오름/내림 모두 마지막, 동일 값은 수업 ID/회차 번호로 순서 고정.
- 실제 로컬 60개 회차로 페이지 경계까지 전체 날짜 정렬·중복 없음·주제 정렬·다른 정렬 기준·잘못된 기준 차단 검증. 테스트 자료만 정리. 정렬 허용값 단위 검사 및 타입 검사 통과. DB 마이그레이션 없음.
- 최종 빌드 통과 및 로컬 서버 재실행. 시각적 브라우저 검증은 미실시.

## 보관함 참고 이미지 생략 (2026-10-29)

- 보관함에서 카테고리를 선택해도 참고 이미지를 표시/요청하지 않음. 일지 그리드·전체 본문·전체 펼치기/접기 유지. 작성 화면의 참고 이미지 뷰어와 저장 이미지는 그대로 유지.

## 보관함 일지 그리드 (2026-10-29)

- 보관함은 회차별 일지 카드 그리드로 표시(데스크톱 3열/태블릿 2열/모바일 1열). 카테고리·수업일자·주제·작성일시 및 초안/실제 기록 구분. 전체 본문 펼치기/편집/수업 단위 분류 변경 유지. 카테고리 이미지는 접이식.
- `Session.journalCreatedAt`은 서버 최초 일지 저장 시 부여하고 이후 기존 DB 값을 보존. 기존 일지의 최초 시각이 없으면 임의로 생성하지 않고 UI에서 최근 저장일시 기준임을 명시. 시간은 Asia/Seoul 표시. DB 마이그레이션 없음.
- 작성일시 로직 검사 3개 및 타입 검사 통과. 실제 로컬 HTTP로 메타데이터·회차 날짜·전체 본문 조회 및 수정 시 최초 작성일시 보존 검증. 검증용 수업만 정리.
- 최종 빌드 통과 및 로컬 서버 재실행. 시각적 브라우저 검증은 미실시.

## 일지 입력/정리 결과 구분 (2026-10-29)

- 일지 입력 화면의 맨 아래 전체 본문 텍스트박스 제거. 01 직접 입력(실제 진행/평가 등) → `진행 기록으로 상세기록 채우기` → 02 정리된 상세기록 → 저장 흐름으로 통합.
- 입력 문장/줄을 상세 칸에 순서대로 배치하는 결정적 정리이며 AI 요약/추론은 하지 않음. 초과 줄은 마지막 칸에 모아 누락 방지. 직접 수정한 칸은 재정리 시 보존. `journalDetailGenerated`로 출처 배지 표시.
- `journalEditorDirty`와 `rebuildEditedJournals`로 상세 수정/진행 기록 변경 시 저장 본문 재구성. UI 저장과 서버 저장 양쪽에서 적용. 수정하지 않은 기존 수동 본문은 유지. 보관함은 저장된 전체 본문을 그대로 표시.
- 단위 검사 12개/타입 검사 통과. 실제 HTTP로 상세 수정→저장 본문 반영→보관함 전체 조회 및 기존 수동 본문 보존 확인. 검증용 수업만 정리. 신규 DB 마이그레이션/유료 API 호출 없음.
- 최종 빌드 통과 및 로컬 서버 재실행. 이번 변경의 시각적 브라우저 검증은 미실시.

## 참고 이미지 보기/편집 분리 및 왼쪽 뷰어 (2026-10-29)

- 수업 정보와 수업일지 화면을 왼쪽 큰 참고 이미지 뷰어/오른쪽 작성 영역으로 변경. 뷰어는 보기 전용이며 이전/다음 버튼, 좌우 키, 장수 표시 및 크게 보기 링크 제공. 데스크톱에서 왼쪽 sticky, 작은 화면에서는 상하 배치.
- 이미지 파일 선택/교체/삭제는 카테고리 추가·수정 폼 내부에만 표시. 새 카테고리 추가 시 선택 카테고리를 잠시 비우고 이미지 초안을 매번 초기화. 취소하면 이전 카테고리 선택 복구.
- 새 카테고리 폼에서 이미지 두 장을 미리 선택하고 카테고리 저장과 함께 multipart POST. `/api/categories`는 기존 JSON 요청도 유지하며, 검증 후 D1 batch로 카테고리/이미지를 함께 저장해 부분 생성 방지. DB 마이그레이션 없음.
- 실제 HTTP로 카테고리+2장 동시 저장, 다른 카테고리는 빈 이미지로 시작, 기존 이미지 보존, 두 번째 이미지 오류 시 카테고리 미생성 검증 통과. 검증 자료만 정리.
- 기존 이미지 수정/조회 HTTP 회귀 검사 및 단위 검사 10개·타입 검사·최종 빌드 통과. 이번 변경의 시각적 브라우저 검증은 미실시.

## 로컬 로그인 안내 및 저장 복구 (2026-10-29)

- `/api/session` 및 화면 내 `SessionControls` 추가. 같은 탭에서 로컬 로그인 fetch 및 세션 재확인 후 카테고리/AI 설정을 다시 불러옴. 카테고리 편집 상태는 로그인 동작으로 초기화하지 않음.
- 개발 전용 Sites 플러그인의 기존 cross-site 거부가 외부 링크의 로그인 이동까지 차단할 수 있었음. localhost/루프백 검사와 헤더 위조 제거는 유지하며, 명시적인 GET navigate/document 로그인 이동만 예외 허용. 외부 fetch/iframe/로그아웃 및 다른 Origin 헤더는 거부 유지. 운영 로그인 정책은 변경하지 않음.
- 로그인 진입 정책 단위 검사 및 타입 검사/빌드 통과.
- 로컬 HTTP로 명시적인 외부 로그인 이동(302/쿠키) → /api/session 인증 확인 → 카테고리 저장·조회 검증 통과. 숨은 외부 요청/로그아웃 및 미로그인 접근 차단 확인. 검증용 카테고리만 정리.

## 카테고리 참고 이미지 2장 (2026-10-29)

- 0004_category_reference_images 신규 마이그레이션 및 category_images 테이블 추가, 로컬 적용 완료(재적용 금지). 이미지 BLOB은 로컬 D1에 저장되어 Git에 포함되지 않음. 운영 DB/배포 미변경.
- `/api/categories/[id]/images`: 소유자 메타데이터 목록. `/[slot]` GET/PUT/PATCH/DELETE, 슬롯 1·2만 허용. JPG/PNG/WebP 시그니처와 MIME/512KB 한도 확인, 조회 소유권 검증 및 private no-store.
- 카테고리 선택 후 이미지·설명 등록/교체/설명 수정/제거. 브라우저에서 파일을 최대 1600px JPEG로 변환해 저장(입력 최대 15MB). 카테고리 이름/기본값 편집과 이미지 저장은 분리되어 기존 이미지 보존.
- 일지 작성 화면 오른쪽 sticky 참고 이미지, 왼쪽 입력, 크게 보기 링크. 보관함에서 선택한 카테고리 이미지 확인. 이미지 내용 자동 분석/일지 본문 자동 변환은 구현하지 않았으며 사용자 시각 참고용.
- 실제 로컬 HTTP 테스트: 2장 저장·바이트 재조회·설명 변경·개별 삭제·2장 제한·형식/크기 검증·미소유/비로그인 차단 통과. 자신이 만든 임시 UUID 카테고리·이미지만 정리. 단위 검사 9개와 타입 검사 통과.
- 최종 빌드 통과. 실제 브라우저의 파일 선택·리사이즈 및 레이아웃은 자동 검증 미실시이며, 이미지 저장/조회 API는 로컬에서 검증함.

## 카테고리별 누적 일지 관리 (2026-10-29)

- 신규 `journal_categories` 테이블과 0003_journal_categories 마이그레이션 추가. 기존 마이그레이션 불변. 로컬에 0003 적용 완료(재적용 금지). 운영 DB 미변경.
- `/api/categories`: 로그인 사용자별 카테고리 이름·시작/종료일·공통 기준·기본 항목 수 저장. `/api/library`: 사용자별 카테고리 누적 수 및 회차별 일지 목록, 50개 수업씩 페이지 조회.
- `Course.journalContext`에 카테고리 및 구성 스냅샷, `Session.journalEntries`에 개별 목표/꼭지/상세 기록 저장. 학습목표 1~8, 꼭지 1~10, 상세 1~8 설정. 항목 수를 줄여도 데이터는 잘라내지 않음.
- 첫 화면/일지 화면에서 카테고리와 구성을 설정. 보관함에서 미분류/과정 필터, 전체 일지 펼치기, 개별 편집 및 카테고리 이동. 기존 일지 본문은 자동 덮어쓰지 않으며 실제 활동 입력이 없는 기록은 수업 전 초안으로 구분.
- 실제 로컬 HTTP 검증: 카테고리 2개 생성, 일지 2개 누적, 분류 이동 시 본문 보존, 미소유 카테고리 및 비로그인 차단 통과. 검증 데이터만 삭제 후 기존 수업 수 보존 확인. 단위 검사 8개 및 타입 검사 통과. 유료 AI/Canva 호출 없음.
- 최종 빌드 통과 및 로컬 서버 127.0.0.1:5173 재시작 완료. 검증 스크립트 `work/verify-categories.mjs`는 자신이 생성한 UUID 자료만 정리합니다. 이번 변경의 시각적 브라우저 검증은 미실시.
- 재시작 후 첫 요청 지연은 개발 서버 재실행으로 해소. 최종 HTTP 200 및 카테고리 선택/추가·학습목표/꼭지/상세 수 설정 HTML 제공 확인.

## 최신 첫 화면 및 실행 확인 (2026-10-29)

- 첫 화면은 주제·대상 입력 및 수업계획안/교안·뉴스/수업일지 개별 생성 버튼으로 변경. 상세 입력은 접이식 설정, 자동 전체 실행 및 Canva 자동 호출 제거(교안 화면의 수동 연결 유지).
- `Course.prepared`로 자료별 준비 여부를 저장하며, 기존 자료는 호환 처리. 뉴스 옵션만 변경해도 같은 수업 ID 유지. 일지는 명시적인 초안/실제 기록 구분.
- `GET /api/generate?target=...`가 아닌 POST `/api/generate?target=plan|slides`로 요청 범위 분리. 자료별 생성 및 기록 보존 검사 4개, 타입 검사, 최종 빌드 통과.
- 로컬 개발 서버 `http://127.0.0.1:5173/` 실행. 실제 HTTP 200, 주제·대상 및 세 생성 버튼 포함, 기존 전체 준비 버튼 없음 확인. 화면 자동화 검증은 도구 URL 확인 제한으로 미완료. API 유료 생성 재호출은 하지 않았으므로 잔액 상태는 과거 기록과 구분.

## Product contract

Korean instructor-facing web app for onuri. One course input drives a coherent lesson plan,
slide deck, related recent news, and post-class journal across multiple sessions.
Preserve the editorial, practical UI and responsive layout with the user-selected palette.
사용자 최신 요청으로 2026-10-06 `app/editorial.css`의 청록·크림·차콜 중심 편집 디자인을 적용했습니다.
6개 테마의 ID는 유지하고 색상과 표시 이름을 편집 디자인에 맞춰 갱신했습니다.
`components/theme-picker.tsx`의 헤더 메뉴와 `app/globals.css`의 CSS 변수를 사용합니다.
선택은 브라우저 localStorage에 저장하며 기본은 딥 틸 · 사프란입니다. 수업 데이터와 별도로 관리합니다.
수업 정보 입력 그룹, 계획안 섹션 위계, 교안의 관련 기사 목록을 추가했습니다.
모바일 가로 넘침, 키보드 포커스, 시간 합계 오류와 목표 수정→교안 반영을 확인했습니다.
실제 Google 뉴스 요청은 네트워크 허용 로컬 서버에서 성공했습니다. 2026-10-06 브라우저에서 12건과 뉴스 5장 연결을 확인했습니다. 기사 원문 조회·검증과 배포 환경은 미검증입니다.
6개 테마 전환·새로고침 유지, 타입 검사 및 빌드를 확인했습니다.
Prefer content-relevant graphics over decorative people illustrations.

- Direct minutes/session-count input.
- Each session: 2 goals; 3 educational topics with 3 details each.
- Lesson slides vary with content. Append 5 news slides only when input.newsScrap is enabled (default true for old courses). When disabled, no RSS request, news slides or article list.
- News: latest trends, issues, applications; source, publication and retrieval dates, links.
- Teacher notes: background, vocabulary, explanation, classroom connection, discussion questions,
  possible answers and cautions; distinguish sourced facts from interpretation.
- Never fabricate articles, URLs, performed activities or journal outcomes.
- Automatically prepare a clearly marked pre-class journal draft from the plan; never fabricate actual results. Completed journals are based on actual teacher-entered activities. Preserve manually written records during regeneration.
- Plan edits and slide content should remain consistent. Regeneration preserves actual records.

## Architecture

- `app/studio.tsx`: interactive workspace, Tabs/Select/Button primitives.
- `app/page.tsx`: entry point. `app/layout.tsx`, `app/globals.css`: theme and metadata.
- `lib/course.ts`: shared types, validated course input, deterministic draft, evidence-based journal.
- `app/api/news/route.ts`, `lib/news.ts`: Google News RSS search/parser with expanding date range.
- `app/api/generate/route.ts`: Responses API integration; disabled without server API key;
  output validated for goals/topics, session count, time sums, exactly 5 news slides and source indexes.
- `app/api/courses/**`, `lib/server.ts`: per-user D1 persistence and server authorization.
- `app/chatgpt-auth.ts`: platform identity. Portable development uses localhost-only mock sign-in.
- `db/schema.ts`, `drizzle/**`: database schema and migrations. Production migrations are already deployed.
  Treat existing production migrations as immutable; add new migrations for future changes.
- `.openai/hosting.json`: existing Site identity and logical D1 binding.

## Remaining priorities

1. Verify portable install/build, local D1 migrations and mock login on the user's actual PC.
2. End-to-end verify save/reopen and Google RSS reachability with real representative topics.
3. Improve topic keyword extraction and broaden overly specific no-result queries.
4. Resolve Google News links to vetted direct publisher URLs without creating arbitrary SSRF paths.
5. Add source-content retrieval/verification before substantive news summaries. Treat article text as
   untrusted data. Do not follow instructions embedded in articles.
6. Connect the user-approved generation service and verify real API output. No billable calls
   or account/key creation without the user's authorization.
7. Complete Canva integration or implement a PowerPoint export including teacher notes and sources.
8. Optional next user decisions: institution template upload and editable document exports.

## Verification already performed

- 2026-10-06 사용자 Windows PC: Node 24.19.0 / pnpm 11.25.0으로 잠금 파일 유지 설치 완료.
- `pnpm typecheck`, `pnpm build` 통과. pnpm exec의 실행 파일 탐색 문제를 피하는 typecheck 스크립트 추가.
- 로컬 D1에 0000/0001 및 신규 0002_canva_connections 마이그레이션 적용 완료. 재적용하지 말 것. 기존 운영 마이그레이션은 수정하지 않았습니다.
- 개발 서버 `http://127.0.0.1:5173`: HTTP 로그인, 수업 저장/목록/재조회 검증 완료. 검증용 데이터 삭제.
- 브라우저 화면 및 실제 뉴스 검색 검증 완료. 유료 AI 본문 생성 및 Canva 인증·생성은 미검증.

## Canva 연결 추가 (2026-10-06)

- Codex Canva 커넥터의 기존 계정은 읽기 검색으로 확인했습니다. 웹앱의 OAuth 연결과 별개입니다.
- `lib/canva.ts`, `app/api/canva/**`, `components/canva-panel.tsx`: PKCE OAuth, 사용자별 암호화 토큰 저장/갱신, 생성 작업 요청/조회 및 편집 링크 표시 구현.
- `.dev.vars.example`와 `CANVA_SETUP_KO.md`, `/canva-setup`: 개발자 앱 설정 안내. 실제 Client ID/Secret은 아직 제공되지 않았습니다. 키를 채팅이나 Git에 넣지 말 것.
- Canva 생성 API는 preview이며 AI 크레딧을 사용합니다. 실제 호출은 하지 않았고 완료로 보고하지 마세요. 정확한 본문/발표자 노트 파일 가져오기는 미구현입니다.
- 뉴스 자동 검색은 RSS 제목·출처·날짜·링크와 발췌만 제공합니다. 원문 요약이나 사실 검증 완료로 보고하지 마세요.
- 추가 후 `pnpm typecheck`, `pnpm build` 통과. 실제 브라우저에서 기사 12건/뉴스 5장 및 HTML 발췌 정리 확인. 미설정 Canva 연결 요청 400, 미소유 작업 조회 404 확인. 로컬 개발 서버 127.0.0.1:5173 재시작 완료.

- TypeScript noEmit passed.
- Production Worker build passed; private deployment succeeded.
- Logic checks passed for 1/4/10 sessions, exact minute sums, exactly 5 news slides,
  journal rejection without actual activities, populated/empty RSS parsing.
- External Google RSS network probe timed out in the authoring environment.
- Browser QA/WebMCP runtime validation were unavailable. UI, authentication, persistence and
  API integrations still need actual end-to-end verification on the user's PC.

This archive is source-only, not a bundled offline executable and not a full database backup.

## 한 번에 수업 준비 (2026-10-06)

- 수업정보에 목표·결과물·선행 경험·인원·예정일·장소·재료·안전 조건 추가. InputSchema 기본값으로 기존 수업 호환 유지.
- `수업 자료 한 번에 준비`: 뉴스 선택 → 계획/교안 자동 작성 → 일지 초안 → 자동 저장 → 연결된 Canva 생성 및 자동 결과 조회(최대 약 60초). 단계별 상태 및 실패 안내. Canva job/편집 URL은 수업 JSON에 저장. 신규 DB 마이그레이션 없음.
- 사용자가 키 발급 및 `.dev.vars` 저장을 승인했고, OpenAI Platform 보안 도구로 OPENAI_API_KEY 설정 완료. 비밀값을 소스/브라우저/로그에 출력하지 말 것.
- 실제 OpenAI 요청은 HTTP 429, code=credit_balance_exhausted, type=insufficient_quota. 키 설정과 본문 생성 성공을 구분할 것. API 잔액 충전 전 성공 검증 불가. 반복 호출로 해결하지 말 것.
- Canva Client ID/Secret 및 OAuth 승인은 여전히 없음. 자동 생성·편집 링크 실제 성공은 미검증.
- 뉴스 제외 단위 검사 통과, 브라우저에서 RSS 건너뜀·뉴스 0장·일지 초안·자동 저장 확인. 저장 API 재조회로 상세 입력 보존 확인. 사용자 기존 수업은 보존.
- 최종 `pnpm typecheck`, `pnpm build` 통과. 브라우저에서 저장 자료 재열기 및 교안 9장/뉴스 제외/일지 초안 확인, 390px 입력 옵션 가로 넘침 없음. 서버 127.0.0.1:5173 재실행. `outputs/automatic-course-options.png`, `automatic-journal-draft.png`, `automatic-course-mobile.png` 화면 증거(ignored).

## 실제 진행 메모 AI 요약 (2026-10-29)
- `/api/journal-summary`: 실제 활동·진행·특이사항·평가만 근거로 한국어 요약, 카테고리별 목표/꼭지/상세 수 검증. 서버 API 키만 사용, store:false.
- `진행 내용 요약해 상세 일지 생성` 결과는 아래 편집 가능한 상세기록 칸에 반영. 직접 수정한 상세 칸은 재생성 시 보존하며 이전 자동 칸만 갱신. 저장은 기존 상세기록 저장 흐름 사용.
- 기존 단순 문장 분배는 이 버튼에서 더 이상 사용하지 않음. AI 출처 표시는 신규 요약에만 적용.
- 합성 입력 실제 호출 HTTP 429: API 잔액/한도 부족. 생성 성공 미검증이며 충전 전 반복 호출하지 말 것. 실패 시 기존 입력/상세기록 유지.
- `work/test-journal-summary.mjs`: 수동 편집 보존, 자동 칸 갱신, 원본 불변, 항목 수 검증 통과. TypeScript 검사 통과.
- 최종 pnpm build 통과. 외부 AI 성공 및 브라우저 시각 검증은 미완료.

## 보관함 목록 조회 개선 (2026-10-29)
- 카테고리 뒤 계획안/교안/일지 저장 상태 표시(초록/빨강, 접근성 텍스트/툴팁). 준비 여부와 해당 회차 자료 존재를 기준으로 판별하며 완료/검토 상태와 별개.
- 주제·회차 제목 키워드 서버 검색(바인딩 쿼리, 페이지 조회 전 필터), 기본 수업일자 미입력 우선 후 날짜 내림차순. 기존 예정일 대체 표시 유지.
- 작성일자는 서울 시간대 날짜만 한 줄 표시. 과거 작성일 미보유 자료는 최근 저장일자 대체임을 툴팁으로 안내.
- 데이터 크기별 열 너비 및 최대 62vh/680px 결과 스크롤, 고정 표 머리글, 모바일 가로 스크롤. 삭제/복구/펼치기/분류 변경 유지.
- 타입 검사 및 읽기 전용 로컬 API 검증(저장 상태/검색/기본 정렬) 통과. 사용자 데이터 변경 없음.
- 최종 빌드는 시작 단계 지연으로 중단. pnpm dev 재시작 진행. 빌드 완료 또는 화면 시각 검증으로 보고하지 말 것.

## 로컬 개발 연결 오류 수정 (2026-10-29)
- 사용자 보고: unhandled promise rejection / send was called before connect / sendError.
- Vite 8 client의 setupForwardConsoleHandler.sendError가 연결 해제 시 transport.send 거절을 처리하지 않고 unhandledrejection으로 재전송하는 경로 확인.
- vite.config.ts: portable 로컬 server.forwardConsole=false. 브라우저 기본 오류/오버레이와 HMR 유지, managed-linux 설정 변경 없음. node_modules 직접 수정 없음.
- 첫 화면 HTML/entry-browser HTTP 200, 보관함 저장 상태/검색/정렬 API 검증 및 pnpm typecheck/pnpm build 통과. 설정 변경 후 타입 검사도 통과. 서버 자동 재시작 완료.

## Canva 링크 보관함 및 표 폭 조정 (2026-10-29)
- 보관함 카테고리 최대 2줄, 계획안/교안/일지 헤더·신호등 간격 축소. 고정 비율 표와 줄바꿈으로 가로 스크롤 최소 너비 제거.
- 보관함 옆 Canva 링크 탭: 직접 만든 교안/뉴스레터의 타이틀·일자·Canva HTTPS 주소 저장, 날짜 역순 표, 서버 타이틀 검색, 50개 페이지 조회, 체크 선택 삭제(최대 200), 독립 높이 제한/세로 리사이즈.
- `/api/canva-links` 사용자별 소유권 필터, Canva 도메인/날짜 검증, 안전한 바인딩 쿼리. 외부 디자인 생성/업로드 API 호출 없이 사용자가 입력한 링크만 관리.
- `db/schema.ts` 추가 후 drizzle-kit generate로 0005_faithful_mockingbird.sql 및 새 snapshot/journal 생성. 기존 이력 변경 없음. 0005만 로컬 DB에 execute 완료(온라인 변경 없음). 재실행 금지.
- 실제 로컬 API로 저장/검색/날짜 역순/선택 삭제/비로그인/잘못된 주소 차단 검증 통과. UUID 검증 링크 2건만 삭제 정리. pnpm typecheck 통과.
- 최종 pnpm build 통과. 로컬 개발 서버 유지. 브라우저 화면 실측 검증은 수행하지 않았음.

## Canva 링크 카드 보기 (2026-10-29)
- Canva 링크 탭 기본 카드 보기, 보기 형식 셀렉트로 표/카드 전환. 공통 검색·체크 선택·삭제·페이징·높이 제한 유지.
- 카드 상단 Canva view?embed iframe(첫 페이지 기본 진입), 하단 사용자 입력 타이틀·일자·열기 링크. 반응형 3/2/1열, lazy iframe, 직접 Canva 이동 오버레이와 독립 선택 체크박스.
- `lib/canva-embed.ts`: design 링크만 허용, 선택적 공유 토큰 유지, 편집/추적 매개변수 제거, HTTPS Canva 공식 호스트만 허용. 일반 폴더/지원하지 않는 링크는 안내 및 원본 링크 유지.
- Canva 공식 임베드 방식. 개인 디자인은 로그인/열람 권한 및 브라우저 쿠키 조건에 따라 미리보기가 제한될 수 있음. 원본 공유 설정 변경 없음. 실제 사용자 링크별 첫 페이지 렌더링은 미검증, 가짜 표지 생성 없음.
- pnpm typecheck 및 work/test-canva-embed.mjs 주소/토큰/호스트 검증 통과. DB/마이그레이션 변경 없음.

## Canva 교안관리 카테고리 (2026-10-29)
- Canva 링크 입력에 카테고리 선택, 목록에 전체/미분류/카테고리 필터. 카드/표 양쪽에서 기존 링크 분류 변경 가능.
- `교안관리 카테고리 관리` 접기 영역에서 신규 추가/이름 수정/삭제. 기존 수업일지 카테고리와 분리해 관리. 삭제 시 링크는 미분류로 보존(로컬 D1 batch 트랜잭션).
- `/api/canva-link-categories` POST/DELETE, `/api/canva-links` GET 분류/목록 포함 및 PATCH 분류 변경. 모든 쿼리 사용자 소유권 필터, 링크 생성/변경 시 동일 SQL 문장에서 소유 카테고리 존재 확인.
- drizzle-kit generate로 0006_smooth_firestar.sql/snapshot 생성: canva_link_categories 테이블과 canva_links.category_id 기본 빈문자열 추가. 0006만 로컬 execute 완료, 기존 이력/온라인 DB 변경 없음. 재실행 금지.
- pnpm typecheck 통과. work/verify-canva-categories.mjs 실제 로컬 API로 생성/수정/중복 차단/분류 변경/필터/삭제 시 링크 보존/잘못된 분류 차단 통과. 검증용 UUID 자료만 정리 완료.
