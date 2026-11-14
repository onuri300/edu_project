# JavaScript 공통 함수 레퍼런스

| 위치와 함수 | 입력 및 결과 | 사용 위치와 오류 처리 |
|---|---|---|
| `onuri.framework/js/auth.js`의 `eduAuth.getSession()` | 유효한 세션 객체 또는 `null` | 포털과 보호된 HTML. 만료·저장소 오류를 확인 |
| `eduAuth.setSession(menu)`, `clearSession()` | `{cats: [...]}`로 8시간 세션 생성 및 반환, 삭제는 반환값 없음 | 포털 로그인·로그아웃 |
| `eduAuth.allowNavigation(url)` | 동일 사이트 HTML로 단기 이동 허용 여부 `boolean` | 공통 로고와 내부 링크 |
| `eduAuth.openPage(url)` | 공개·외부·보호 URL을 새 탭에서 여는 흐름을 시작하고 `boolean` 반환 | 포털 선택 자료. 보호 링크는 세션과 팝업 창 필요 |
| `onuri.framework/js/menu-crypto.js`의 `eduMenuCrypto.decodeBase64(value)` | Base64에서 `Uint8Array` 반환 | 포털·편집기. 잘못된 입력은 `atob` 예외 |
| `eduMenuCrypto.deriveKey(id, password, salt, iterations, usages)` | Web Crypto의 AES-GCM `CryptoKey`를 반환하는 Promise. 기본 용도는 `['decrypt']` | 포털 및 편집기. 브라우저 암호화 API·입력 오류는 호출부에서 처리 |
| `onuri.framework/js/common.js`의 `eduUI.bindMobileMenu(options)` | `button`, `menu`, `breakpoint`와 선택 `closeButton`·`overlay`. 반환값 없음 | KNU는 800px, 포트폴리오는 768px. 닫기·링크·Escape·크기 변경 연동 |
| `eduUI.escapeHtml(value)` | 문자열을 HTML 텍스트·인용된 속성에 삽입 가능한 형태로 변환. 빈 값은 빈 문자열 | 메이커 카드·플래시카드 |
| `common/file/browser/cl_pdf.js`의 `eduDownloads.save(url, filename)` | PDF를 파일명으로 저장하는 `Promise<void>` | 리빙랩. HTTP 오류나 로컬 데이터 부재는 reject |
| `common/js/pages/resource-policy.js`의 `eduResourcePolicy.sandboxFor(url, baseURI)` | iframe `sandbox` 속성 문자열 | 포털. 리빙랩 PDF 팝업만 제한 범위를 조정 |
| `common/js/pages/ne_md.js`의 `onuriMarkdown.render(text)`, `safe(url)` | Markdown의 `{html, toc}` 및 링크 허용 여부 | 뉴스레터. raw HTML과 자동 이미지 요청을 차단 |

`common.js`는 자동 실행합니다. 초기 테마, `DOMContentLoaded`에서 헤더·이미지·테마 버튼 연결, 시스템 테마 및 브라우저 저장소 이벤트를 처리합니다. 내부 함수 `apply(theme)`는 `data-theme`와 버튼의 `aria-pressed`를 맞춥니다.

~~~js
window.eduUI.bindMobileMenu({
  button: document.querySelector('.nav-toggle'),
  menu: document.querySelector('.center-links'),
  breakpoint: 800,
});
~~~

빌드 API는 `buildLayoutPages(source, { check })`, `buildLibrary(source, output, { dataOnly })`, `buildReports(source, output)`, `versionAssets(output)`입니다. 파일 접근·설정 오류는 Promise를 거부합니다. `--check`는 공통 조각과 HTML이 다르면 실패합니다. `versionAssets`는 배포 HTML에 참조된 CSS·JS에 콘텐츠 해시를 붙입니다.
