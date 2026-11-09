# Onuri 교육자료 포털

수업 교안, 공지, 교육 게임, 뉴스레터, 메이커 작품을 제공하는 정적 웹사이트입니다.

## 시작하기

GitHub Actions와 같은 Node.js 22를 사용합니다. 포털 자체는 npm 설치가 필요 없습니다.

~~~powershell
node common/scripts/build-library.mjs
$tests = @(Get-ChildItem common/scripts -Filter '*.test.mjs' | ForEach-Object FullName)
node --test $tests
node common/scripts/build-library.mjs --deploy
~~~

첫 명령은 교안·뉴스레터·레이아웃을 갱신합니다. `index.html`을 직접 열어 포털과 로컬 메뉴 편집을 확인할 수 있습니다. 브라우저의 `fetch`가 필요한 공지, 뉴스레터, 갤러리 데이터는 HTTPS 또는 로컬 HTTP에서 검증합니다. Python이 설치되어 있다면 배포 결과는 `python -m http.server 8000 --bind 127.0.0.1 --directory _site`로 확인합니다.

## 개발 문서

1. [시스템 개발명세서](docs/01-system-specification.md)
2. [공통 프레임워크 사용 매뉴얼](docs/02-framework-manual.md)
3. [CSS 클래스 레퍼런스](docs/03-css-reference.md)
4. [JavaScript 공통 함수 레퍼런스](docs/04-javascript-reference.md)
5. [데이터베이스·API 개발명세서](docs/05-data-api-specification.md)
6. [개발 규칙·신규 페이지 가이드](docs/06-development-guide.md)

[교안 파일 규칙](books/README.md), [대표 이미지 관리](images/README.md), [뉴스레터 입력 규칙](reports/README.md), [edumaker 운영 연동](docs/edumaker-integration.md)은 해당 운영 문서를 참고합니다.
