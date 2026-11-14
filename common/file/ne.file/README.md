# 뉴스레터 관리

메인 메뉴 순서: 바이브코딩 → 게임 → 수업 자료실 → 기타 → **뉴스레터**.
뉴스레터 하위 메뉴는 **메이킹**, **AI** 두 개입니다.

## 리포트 등록
- 메이킹: `common/file/ne.file/making/YYYY-MM-DD_제목.md`
- AI: `common/file/ne.file/ai/YYYY-MM-DD_제목.md`
- 에이전트에 “최종 리포트를 D:\project\edu_project\file\reports\making\2026-11-02_제목.md 에 저장해줘”처럼 요청합니다.
- 지원: `.md`, `.txt`, `.html`, `.pdf`. 날짜는 파일명 앞 YYYY-MM-DD에서 추출합니다.
- 각 페이지 왼쪽에 날짜별 목록이 최신순으로 나오며, 선택하면 오른쪽에 전문을 표시합니다. 첫 리포트는 자동 선택됩니다.
- Markdown/텍스트는 원문 전체, HTML은 격리된 화면, PDF는 브라우저 뷰어(미지원 시 다운로드)로 표시합니다.
- 로컬 목록 갱신: `node common/scripts/build-reports.mjs`.
- GitHub 업로드 시 기존 Pages 배포에서 자동 갱신합니다.
- 페이지에서 직접 가져온 파일은 선택한 채널의 브라우저 저장소에 보관됩니다. 같은 채널·파일명은 교체합니다. 브라우저 데이터 삭제 시 사라지므로 원본을 보관하세요.
- 기존에 채널 구분 없이 가져온 파일은 원본을 해당 페이지에서 다시 가져와 주세요.
- 포털 전체 왼쪽 메뉴는 경계의 화살표로 접고 펼칩니다. 데스크톱 선택은 저장됩니다. 뉴스레터 날짜 목록도 별도 화살표로 접습니다.
- 에이전트 대화에서 자동 수집하지는 않습니다. 파일 저장을 요청해야 합니다.
- GitHub Pages 파일 자체는 공개되므로 개인정보·기밀을 배포하지 마세요.

## 파일 역할
- `do_docs/do_making.html`, `do_docs/do_ai.html`: 채널별 날짜 목록·전문 화면.
- `common/css/pages/ne_reader.css`, `common/js/pages/ne_reader.js`: 두 페이지의 공통 레이아웃·목록·본문·보관 기능.
- `common/scripts/build-reports.mjs`: reports 스캔·목록 생성.
- `common/data/newsletter-data.js`: 자동 생성 목록.
- `common/scripts/build-library.mjs`: 기존 배포 흐름에서 리포트 빌드도 호출.
- `index.html`, `common/css/pages/index.css`, `common/js/pages/index.js`: 포털 공통 왼쪽 메뉴와 접기·펼치기.

## 일일·주간 패키지 가져오기

패키지 원본 Markdown(front matter 포함)을 기준으로 가져옵니다. JSON 목록을 따로 관리하지 않습니다.

```powershell
node common/file/scripts/import-reports.mjs "D:/download/EDU_PROJECT_Reports_2026-11-02/edu_report_package"
```

- 고유 `id`가 같으면 기존 파일 위치에서 갱신합니다. 새 ID는 추가합니다. 다른 기존 자료는 보존합니다.
- 신규 일일 자료는 `common/file/ne.file/ai/daily/`, 주간 자료는 `common/file/ne.file/making/weekly/`에 들어갑니다. 필요하면 기존 ID를 유지하면서 두 채널 사이에서 파일을 옮길 수 있습니다.
- 다음 리포트는 해당 폴더에 front matter가 있는 Markdown을 추가하면 됩니다. 필수 필드: `id`, `title`, `type`(daily/weekly), `published_at`, `period_start`, `period_end`, `summary`. 값은 JSON 문자열/배열 형식입니다. `tags`, `canva_url`도 지원합니다.
- 동일 ID의 원본 파일을 여러 개 두면 빌드가 중복 ID를 안내하고 중단됩니다. 갱신은 기존 파일을 수정하거나 importer로 진행하세요.
- `node common/scripts/build-reports.mjs`로 로컬 목록 갱신. 기존 GitHub Pages 빌드에서도 자동 실행됩니다. Python은 필요하지 않습니다.
- 검색은 제목·요약·태그·본문을 포함합니다. 일일/주간 필터와 날짜 목록은 함께 적용됩니다.
- Markdown은 공통 로컬 markdown-it 렌더러로 표시합니다. HTML 실행과 외부 이미지 자동 요청은 비활성화합니다. 출처·영상·Canva는 원문 링크로 연결하며 원문을 복제하지 않습니다.
- 본문 목차·가로 스크롤 표·조사 기간·예상 읽기 시간·원본 Markdown 다운로드를 지원합니다.
- 상세 주소 예: `do_docs/do_making.html#report=weekly-2026-11-02-ai-making`. 기존 로그인 정책에 따라 직접 접속하면 먼저 로그인하고 해당 리포트로 돌아갑니다. 새 탭의 상세 새로고침도 유지됩니다.
- 자료 없음·없는 ID·목록/렌더러 로드 오류는 화면에 안내합니다.

### 추가 파일 역할
- `common/file/scripts/import-reports.mjs`: 패키지의 원본 Markdown을 ID 기준 병합.
- `common/js/pages/ne_md.js`: 공통 Markdown 렌더링, 목차, 안전한 링크·이미지 정책.
- `common/js/vendor/markdown-it.min.js`, `markdown-it.LICENSE`: 로컬 고정 버전 14.1.0과 MIT 라이선스. 실행 중 CDN 의존 없음.

## AI 뉴스레터 화면 운영
AI 페이지는 리포트 가져오기·브라우저 보관 기능 없이 소스로 등록한 리포트만 표시합니다. `common/file/ne.file/ai/`에 원본을 저장하고 빌드·업로드하세요. 메이킹 페이지의 기존 가져오기 기능은 유지합니다.
대표 이미지: `common/images/ne.image/ai-newsletter-hero.png`. 같은 파일명으로 이미지를 교체하면 반영됩니다. 이미지 설정·생성 프롬프트는 `do_docs/docs/ai-newsletter-image.md`를 참고하세요.

## 두 뉴스레터 공통 UI 관리
AI·메이킹 모두 가져오기/브라우저 보관 기능 없이 소스로 등록한 리포트만 표시합니다.
- 공통 화면: `common/templates/newsletter.html`
- 채널별 제목·소개·주제·이미지: `common/data/newsletter-pages.json`
- 공통 스타일·동작: `common/css/pages/ne_reader.css`, `common/js/pages/ne_reader.js`
- 생성: `node common/scripts/build-newsletter-pages.mjs`. 기존 리포트/배포 빌드에서도 자동 호출됩니다.
- `do_docs/do_ai.html`, `do_docs/do_making.html`은 생성된 페이지입니다. UI 수정은 템플릿에서 하세요. 페이지 주소는 유지됩니다.
- 두 페이지는 기존 파스텔 일러스트를 공유합니다. 채널별 이미지를 따로 쓰려면 설정 파일의 image와 imageAlt를 수정하세요.
- 기존 Markdown 자료·ID·검색·필터·목차·다운로드는 유지됩니다. 과거 브라우저에 가져온 자료는 삭제하지 않으며 화면에서는 사용하지 않습니다.
