# 메이킹 수업 스튜디오 — PC에서 이어서 개발하기

이 압축 파일은 배포한 첫 버전의 전체 소스입니다. 프로그램 소스, UI 구성요소,
설정 파일, 패키지 잠금 파일, 데이터베이스 스키마와 마이그레이션을 포함합니다.
설치된 node_modules, 빌드 산출물, 실제 저장 데이터, 로그인 쿠키와 비밀키는 제외했습니다.

## Codex에서 열기

1. ZIP을 풀어 `making-class-studio` 폴더를 PC에 저장합니다.
2. PC의 Codex에서 해당 폴더를 작업 프로젝트로 선택합니다.
3. `CODEX_HANDOFF.md`와 이 문서를 먼저 읽고 개발을 이어가도록 요청합니다.
4. 압축 파일에는 Git 이력이 없습니다. 필요하면 이 폴더에서 새 Git 저장소를 초기화합니다.

Codex에 다음처럼 요청하세요.

> START_HERE_KO.md, CODEX_HANDOFF.md, AGENTS.md를 읽어줘.
> 현재 기능을 유지하며 내 PC에서 의존성을 설치하고 로컬 실행을 확인해줘.
> 로컬 데이터베이스 마이그레이션과 개발용 로그인부터 확인하고,
> 실제 뉴스 검색, 자동 교안 생성, PPT 내보내기와 Canva 연결을 순서대로 완성해줘.
> 미연결 기능이나 검색 결과를 실제 완료처럼 표시하지 말아줘.

## 실행 환경

- Node.js 22.13 이상 (지원되는 LTS 버전)
- 프로젝트 package.json에 기록된 pnpm 버전 사용
- React 19 / Vinext / Vite / Cloudflare Workers / D1 SQLite
- 소스 설치와 실행은 Windows, macOS 등의 환경에 맞춰 Codex가 확인해야 합니다.
  PC별 실행은 이 압축을 만든 환경에서 검증하지 않았습니다.

설치와 빌드 (프로젝트 폴더의 터미널):

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
```

Corepack이 없거나 활성화가 실패하면 package.json의 packageManager 버전에 맞는
pnpm을 설치하도록 Codex에 요청하세요. Linux 전용 `install:ci` 대신 위 설치 명령을 사용합니다.

## 로컬 데이터베이스

2026-10-06 현재 PC(Windows)에서 의존성 설치, 타입 검사, 빌드, 로컬 DB 초기화,
개발용 로그인과 수업 저장·목록·다시 불러오기를 확인했습니다. 검증용 수업은 삭제했습니다.
이 PC에서는 초기 마이그레이션을 다시 적용하지 않고 `pnpm dev`로 실행하세요.
확인한 주소는 `http://127.0.0.1:5173`이며, 서버를 다시 시작할 때 터미널의 주소를 확인합니다.
실제 Google 뉴스 검색은 2026-10-06 로컬 브라우저에서 확인했습니다. AI 본문 생성과 Canva 계정 승인은 아직 미검증입니다.

처음 실행할 때만 아래 마이그레이션을 순서대로 적용합니다. 먼저 `pnpm build`가 성공해야 합니다.
이 명령은 로컬 DB만 만들며 온라인 서비스의 실제 데이터를 가져오지 않습니다.

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_certain_gamma_corps.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_sharp_cerebro.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0002_canva_connections.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0003_journal_categories.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0004_category_reference_images.sql
pnpm dev
```

이미 적용한 마이그레이션은 반복 실행하지 마세요. 개발 서버의 실제 주소는 터미널 출력을 확인합니다.
기본 포트는 5173입니다. 로컬 개발에서만 아래 경로로 개발용 로그인 세션을 시작할 수 있습니다.

```text
http://localhost:5173/signin-with-chatgpt?return_to=/
```

이 개발용 로그인은 localhost 전용입니다. 실제 서비스 로그인이나 선생님의 계정 데이터가 아닙니다.
배포된 웹앱과 PC에서 실행하는 웹앱의 저장 데이터는 자동으로 동기화되지 않습니다.

## 현재 기능

- 보관함 표/블록에서 체크 선택·불러온 일지 일괄 선택(최대 200개)·선택 삭제. 삭제 확인 후 휴지통으로 이동하며 휴지통에서 복구 가능. 같은 수업의 다른 회차·계획안·교안 및 카테고리 이미지는 유지

- 보관함 기본 표 보기 및 표/블록 전환, 카테고리 셀렉트 선택. 표의 카테고리·수업일자·주제·작성일시·상태 헤더 클릭으로 정렬하고 재클릭해 오름/내림 전환. 선택 카테고리 전체 일지 기준 정렬 후 페이지별 추가 조회

- 보관함은 회차별 일지 그리드 카드로 카테고리·수업일자·주제·작성일시 표시. 카드를 펼쳐 전체 일지 확인 및 편집. 최초 작성 시각이 없는 기존 자료는 최근 저장일시 기준임을 표시

- 일지 화면은 ‘직접 입력’과 ‘정리된 상세기록’으로 분리. 진행 기록을 입력한 뒤 ‘진행 기록으로 상세기록 채우기’로 칸에 배치하고 검토·수정 후 ‘상세기록 저장’. 입력 화면에는 별도의 전체 일지 텍스트박스를 표시하지 않으며 보관함에서 저장된 전체 본문 확인

- 카테고리 추가·수정 폼에서 참고 이미지 2장과 설명 등록·교체·삭제. 새 카테고리는 빈 이미지 선택에서 시작하며 카테고리와 함께 저장. 수업 상세·일지 작성 시 왼쪽 큰 보기 영역에서 화살표/좌우 키로 확인하며 오른쪽에서 작성. JPG·PNG·WebP 입력(최대 15MB), 크기 조정 후 장당 512KB 이하로 저장

- 과정·기수 카테고리(이름·기간·공통 작성 기준) 및 카테고리별 기본 일지 형식 저장
- 일지 학습목표 1~8개, 교육내용 1~10꼭지, 꼭지별 상세 1~8개 설정
- 보관함 카테고리 필터·누적 일지 수·전체 펼치기·분류 이동·이전 자료 더 보기. 기존 카테고리 없는 자료는 미분류에서 확인
- 카테고리 기본값을 바꿔도 저장된 일지 본문은 보존. 기존 일지에 적용하려면 일지 화면에서 구성을 적용하고 다시 정리한 뒤 저장

- 수업 주제·대상·시간·회차·도구와 목표·결과물·수준·인원·일정·장소·재료·안전 조건 입력
- 한 번 실행으로 뉴스 선택·계획안/교안 작성·수업일지 초안·자동 저장·연결된 Canva 생성/편집 링크 확인
- 구조 기반 수업계획안 및 가변 장수 교안 초안 구성
- 각 회차의 목표 2개, 교육내용 3꼭지 × 세부 3개
- 회차별 계획안 편집 시 연결된 교안의 목표·교육내용 반영
- Google 뉴스 RSS 검색: 최근 30일 → 부족하면 90일 → 180일, 핵심 키워드 검색 확대 및 중복 제거
- 뉴스 스크랩 체크 시 교안 마지막 뉴스 5장, 기사 제목·출처·게시일·검색일·뉴스 이동 링크. 해제하면 뉴스 검색과 슬라이드 제외
- 발표자 노트 편집
- 수업 전 일지 초안 자동 준비. 실제 완료 기록 작성은 실제 활동 입력 필수
- 로그인 사용자별 저장·불러오기, 텍스트 자료 및 Canva 제작 요청문 다운로드

## 아직 완료되지 않은 연결

- OpenAI 자동 본문 생성: 서버 키 설정 완료. 실제 요청은 API 잔액 소진으로 실패했습니다. API 결제 잔액을 추가해야 성공 검증할 수 있습니다. 실패 시 준비된 구조 기반 초안을 유지합니다.
- Google 뉴스: 로컬에서 실제 검색과 교안의 뉴스 5장 연결을 확인했습니다. 네트워크 제한이 있는 실행 환경에서는 실패 안내가 표시됩니다. 배포 환경은 미검증입니다.
- 기사 링크는 Google 뉴스 경유 링크입니다. 매체의 직접 원문 URL 추출은 아직 구현하지 않았습니다.
- 뉴스 내용은 검색 결과 메타데이터·발췌 기반입니다. 기사 원문을 읽고 검증하는 기능은 미구현입니다.
- Canva: 계정 연결·토큰 암호화 저장·디자인 생성 요청·결과 조회 코드를 추가했습니다. 개발자 앱 인증 정보가 없어 실제 승인과 생성은 미검증입니다. [Canva 설정 안내](CANVA_SETUP_KO.md)를 참고하세요.
- PPT/PDF/DOCX 내보내기와 기관 양식 업로드는 아직 구현되지 않았습니다.

자동 생성용 변수 이름은 `.env.example`, 로컬 Worker용은 `.dev.vars.example`에 있습니다.
실제 키는 소스나 브라우저에 넣지 말고 로컬의 무시되는 설정 파일 또는 배포 비밀값으로 관리합니다.
API 사용 비용은 별도이며, 키 등록과 유료 호출은 선생님의 선택에 따라 진행합니다.

## 기존 온라인 서비스

https://making-class-studio.spry-mochi-7529.chatgpt.site

`.openai/hosting.json`에는 기존 서비스의 식별자가 있습니다. 이것은 API 키가 아닙니다.
이 소스를 열었다는 것만으로 기존 서비스 배포 권한이나 데이터 접근 권한이 생기지는 않습니다.
다른 환경에 배포하려면 인증, D1 저장 공간, 비밀값과 배포 설정을 별도로 구성해야 합니다.
