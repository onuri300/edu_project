# 2026-11-02 리포트 패키지 적용

원본: D:/download/EDU_PROJECT_Reports_2026-11-02/edu_report_package

## 반영 자료
- AI / 일일: daily-2026-11-02-youtube-ai-special
- 메이킹 / 주간: weekly-2026-11-02-ai-making
- 원본 Markdown은 front matter와 본문을 포함하여 그대로 복사. 출처와 확인 한계 보존.
- 목록 JSON은 중복 관리하지 않고 원본 Markdown에서 기존 Node 배포 빌드로 생성.
- 재가져오기 결과: 0개 추가, 2개 갱신. 기존 ID의 파일 위치·다른 자료 보존.

## 변경 파일
- common/file/ne.file/ai/daily/, common/file/ne.file/making/weekly/: 편집·다운로드 원본.
- common/file/scripts/import-reports.mjs: ID 병합.
- common/scripts/build-reports.mjs: 메타데이터 검증·목록 생성.
- common/js/pages/ne_md.js 및 vendor/markdown-it*: 안전한 Markdown 렌더러.
- ne_news/ne_making.html, ne_ai.html 및 common/js/pages/ne_reader.js, common/css/pages/ne_reader.css: 필터·검색·전문·목차·출처·다운로드·모바일.
- onuri.framework/js/auth.js, index.js: 기존 인증 유지, 직접 상세 주소는 로그인 후 해당 리포트 복귀.

## 검증
- Node 테스트 28개 통과: ID 병합/재실행, 자료 보존, 렌더링 보안, 기존 로그인/다운로드/구조 검사 포함.
- 기존 배포 빌드 성공: 뉴스레터 2편과 기존 PDF 1개. 검증 출력은 .work/report-build/에 보관하여 루트에 _site를 만들지 않음.
- 실제 Edge / 저장소 하위 경로에서 직접 상세 로그인 복귀, 새 탭·새로고침, 일일/주간 필터, 태그 검색, 목차·표·외부 링크, 없는 ID 안내 확인.
- Markdown HTTP 응답 및 다운로드 파일 바이트를 원본과 비교.
- 390px 모바일: 문서 너비 390px, 표만 별도 가로 스크롤.
- 실행 로그·화면은 .work/report-qa/에 보관. 실제 외부 사이트 내용의 재검증이나 외부 자료 복제는 진행하지 않음.
- 온라인 배포는 실행하지 않음. 기존 GitHub Pages 워크플로는 유지.
