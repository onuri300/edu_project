# Onuri Framework

`preview.html`을 열면 공통 헤더, 테마 전환, 전체 너비 배너, 콘텐츠 카드의 기본 구성을 볼 수 있습니다. 새 사이트의 루트에 `onuri.framework` 폴더를 복사한 뒤 `preview.html`을 새 사이트의 `index.html`로 복사하세요. 복사한 페이지의 `css/`, `js/`, `images/` 참조 앞에 `onuri.framework/`를 붙이고 헤더 링크를 `index.html`로 바꾸면 됩니다.

- `css/common.css`는 색상·테마·헤더·배너·공통 레이아웃을 제공합니다.
- `js/common.js`는 테마, 모바일 메뉴, 탭, 인쇄, 복사 UI를 제공합니다.
- `js/auth.js`와 `js/menu-crypto.js`는 기존 포털 방식의 세션과 암호화 메뉴를 사용하는 사이트에서 선택적으로 불러옵니다. 공개·로그인 복귀 경로는 사이트별 `window.eduSiteConfig`를 `auth.js`보다 먼저 로드해 설정합니다.
- `templates/layout`은 빌드에서 사용하는 배너와 포털 푸터 조각입니다. `scripts/version-assets.mjs`는 정적 배포에서 CSS·JS 주소에 콘텐츠 버전을 붙입니다.

프레임워크 폴더를 통째로 복사하면 [Supabase 연결 코드와 마이그레이션](db_connect/README.md)도 함께 복사됩니다. 새 사이트에서 별도 데이터베이스를 쓰려면 프로젝트 URL과 공개 키를 새 설정으로 바꾸세요.

이 프로젝트의 페이지별 CSS·JS와 사이트 설정은 루트의 `common`에, 자료 파일은 루트의 `file`에 있습니다.
