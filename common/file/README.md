# 저장·다운로드 파일

원본 자료는 `common/file/<메뉴 그룹 코드>.file/`에 저장합니다.

- `cl.file/`에 리빙랩 교안 PDF를 `세 자리 번호_과목명.pdf` 형식으로 넣습니다.
- `ne.file/`에 뉴스레터 원본을 넣습니다. 패키지 가져오기는 `node common/file/scripts/import-reports.mjs <패키지 경로>`를 사용합니다.
- `vi.file/`에는 메이커 카드 다운로드 자료를 둡니다.
- `browser/`는 교안 다운로드 처리, `scripts/`는 뉴스레터 파일 가져오기를 담당합니다.
- `local-downloads/`는 로컬 파일 미리보기용 교안 데이터입니다. `backups/`는 메뉴 백업 보관 위치입니다. 두 폴더는 정적 사이트에 포함되지 않습니다.

자료를 변경한 뒤 프로젝트 루트에서 `node common/scripts/build-library.mjs`를 실행하면 목록과 로컬 다운로드 데이터가 갱신됩니다.
