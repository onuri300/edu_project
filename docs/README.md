# 교육자료 사이트 운영 매뉴얼

## 현재 구조

index.html은 루트에 유지하고 나머지 HTML은 카테고리별 page_* 폴더에서 관리합니다. 비밀번호 입력 시작 페이지는 index.html이며 나머지 페이지는 주제별 이름을 사용합니다.

| HTML | 용도 |
|---|---|
| index.html | 로그인형 교육자료 포털 |
| livinglab-page_classroom/page_classroom/livinglab-library.html | 독립형 리빙랩 수업 자료실 |
| menu-page_admin/page_admin/menu-builder.html | 관리자용 메뉴·계정 편집기, 공개 배포 제외 |
| page_game/computer-quiz.html | 컴퓨터 탐험 퀴즈 |
| page_game/computer-flashcards.html | 컴퓨터 플래시카드 퀴즈 |
| page_game/ladder-game.html | 사다리 게임 |
| page_etc/knu-makerspace.html | 경남대학교 메이커스페이스 |
| page_etc/mbti-adult.html | 성인 MBTI 테스트 |
| page_etc/mbti-kids.html | 어린이 MBTI 테스트 |
| page_vibecoding/onuri-maker.html | 온유 메이커 포트폴리오 메인 |
| page_vibecoding/onuri-about.html | 온유 메이커 소개 |
| page_vibecoding/onuri-works.html | 작업 목록 |
| page_vibecoding/onuri-work-detail.html | 작업 상세, id 쿼리 사용 |
| page_vibecoding/onuri-process.html | 작업 과정 |
| page_vibecoding/onuri-contact.html | 연락 안내 |

```text
프로젝트 루트/
  주제별 HTML 15개
  사용매뉴얼_로그인정보.md
  common/
    css/common.css           공통 색상·글꼴·테마·기본 스타일
    css/index.css            교육자료 포털 전용 스타일
    css/library.css          독립형 리빙랩 페이지 전용 스타일
    css/builder.css          관리자 편집기 전용 스타일
    css/pages/               게임·퀴즈·MBTI·포트폴리오 등의 추가 스타일
    js/common.js             공통 해·달 버튼, 테마 저장·동기화
    js/index.js              포털 로그인·메뉴·iframe 기능
    js/library.js            과목 소개·교안 카드 표시
    js/builder.js            관리자 메뉴 편집·암호화
    js/auth.js               이전 주소와 새 주소의 접근 규칙 적용
    js/pages/                페이지별 기능
    images/                  사이트별 이미지
    data/data.enc.js         암호화된 포털 메뉴
    data/backups/            이전 메뉴 데이터 백업
    data/computer-quiz/      컴퓨터 퀴즈 문제 데이터
    data/course-descriptions.json  교사가 작성하는 과목별 소개
    data/library-data.js     books에서 자동 생성된 교안 목록
    data/page-routes.json    이전 주소와 새 HTML 이름의 대응표
    scripts/                 빌드·검증·보조 스크립트
  books/                     실제 PDF 교안
  docs/                      상세 안내와 이전 사이트 가이드
  .github/workflows/pages.yml
  _site/                     자동 생성 배포 결과, Git 제외
```

기존 페이지 전용 폴더는 이미지·데이터·문서를 공통 폴더로 옮긴 뒤 제거했습니다.
빈 임시 폴더와 생성된 Python 캐시는 제거했고 실제 자산·기존 데이터 백업은 보존했습니다.

## 공통 스타일과 스크립트

모든 원본 HTML이 common/css/common.css와 common/js/common.js를 불러옵니다.
색상·기본 글꼴·테마는 공통 파일에서 변경하고 추가 레이아웃·기능만 별도 파일로 작성합니다.
해 버튼은 밝은 테마, 달 버튼은 어두운 테마입니다. 처음에는 기기 설정을 따르고 직접 선택한 뒤에는 브라우저에 저장합니다.
같은 사이트의 페이지·탭·iframe에서 선택을 공유하며 iframe 내부에는 중복 테마 버튼을 숨깁니다.
외부 서비스 iframe의 디자인은 해당 서비스가 관리합니다.

## 리빙랩 수업 자료실 구성

livinglab-page_classroom/page_classroom/livinglab-library.html은 다른 포털과의 관계를 알 필요 없이 이용할 수 있는 독립 페이지입니다.
자료실 소개, 수업 전·중·후의 활용 목적, 과목 소개와 교안 목록, 미리보기·다운로드 안내, 마무리 영역으로 구성됩니다.
상단 메뉴는 이 페이지 안의 소개·과목·이용 안내로만 이동합니다.

각 과목에는 번호·과목명·소개·파일 크기·PDF 미리보기·다운로드가 표시됩니다.
참여 대상·수업 시간·학습 내용은 작성한 값이 있을 때 추가로 표시합니다.
내용을 임의로 추정하지 않으며 소개가 비어 있으면 준비 중 안내와 PDF 확인 안내가 표시됩니다.

## PDF 교안 관리와 로딩 문제 해결

1. books에 `001_레진아트.pdf`처럼 **세 자리 번호_과목명.pdf** 형식으로 넣습니다.
2. 첫 밑줄 앞 숫자로 정렬하고 이후 확장자 전까지의 전체 문자열을 과목명으로 표시합니다.
3. 공백·추가 밑줄·한글은 그대로 사용할 수 있습니다. 확장자는 소문자 .pdf를 사용합니다.
4. GitHub main에 업로드하면 Actions가 목록을 생성해 배포합니다. 파일 추가·교체·삭제·이름 변경 모두 반영됩니다.
5. 로컬에서 파일을 바꾼 경우 프로젝트 루트에서 아래 명령을 실행합니다.

```sh
node common/scripts/build-library.mjs
```

이전에는 목록이 _site에만 생성되어 작업 폴더의 페이지가 JSON을 찾지 못했습니다.
현재는 common/data/library-data.js를 작업 폴더와 배포 결과에 동시에 생성하고 HTML에서 직접 불러옵니다.
빌드 후 livinglab-page_classroom/page_classroom/livinglab-library.html을 더블클릭해도 목록을 확인할 수 있으며 fetch의 로컬 파일 제한을 피합니다.
단, HTML만으로 폴더를 자동 탐색할 수는 없으므로 로컬 PDF 변경 후에는 빌드 명령이 필요합니다. GitHub에서는 Actions가 자동 실행합니다.
현재 실제 파일 `001_레진아트.pdf`가 목록에 반영되어 있습니다.
파일명 규칙에 맞지 않거나 PDF 헤더가 없는 파일은 제외되고 빌드 로그에 이유가 표시됩니다.

## 과목별 소개 작성

common/data/course-descriptions.json에서 **PDF 원래 파일명**을 키로 사용합니다.
다음은 입력 형식 안내입니다. 실제 내용은 PDF와 수업 운영 정보를 확인하고 작성하세요.

```json
{
  "001_레진아트.pdf": {
    "intro": "확인한 과목 소개를 입력합니다.",
    "audience": "실제 참여 대상을 입력합니다.",
    "duration": "실제 수업 시간을 입력합니다.",
    "outcomes": ["확인한 학습 내용", "확인한 활동 내용"]
  }
}
```

모르는 값은 빈 문자열 또는 빈 배열로 둡니다. 소개는 교안 목록과 별도로 관리하며 새 PDF에 소개가 없어도 카드와 링크는 자동 생성됩니다.
PDF 이름을 바꾸면 소개 데이터의 키도 같은 이름으로 바꿉니다. 소개 수정 후에는 빌드하거나 GitHub에 업로드합니다.
JSON에는 주석을 넣지 말고 큰따옴표·쉼표 형식을 지켜 주세요.

## 로그인형 포털과 메뉴 변경

index.html에서 발급받은 계정으로 로그인합니다.
수업 자료실 대메뉴의 첫 항목은 리빙랩 수업 자료실이며 livinglab-page_classroom/page_classroom/livinglab-library.html을 엽니다.
기존 메뉴의 내부 페이지 주소는 새 파일명으로 수정되어 있습니다.

1. 관리자 PC에서 menu-page_admin/page_admin/menu-builder.html을 엽니다. common 폴더도 함께 있어야 합니다.
2. 기존 계정으로 common/data/data.enc.js를 불러옵니다.
3. 메뉴·주소·계정을 수정하고 data.enc.js를 다운로드합니다.
4. common/data/data.enc.js를 새 파일로 교체합니다. 루트에 넣지 않습니다.
5. 빌드 또는 GitHub 업로드로 반영합니다. 계정 변경 시 루트 로그인 정보 요약도 갱신합니다.

로그인한 이용자는 브라우저 도구로 링크를 볼 수 있습니다. 원본 서비스의 접근 제한이 필요한 경우 해당 서비스에도 권한을 설정하세요.

## 검증과 배포

Node.js 22 이상에서 실행합니다.

```sh
node --test common/scripts/*.test.mjs
node common/scripts/build-library.mjs
```

배포용 --deploy 빌드는 _site를 비운 뒤 다시 만들므로 삭제한 PDF와 이전 자산이 남지 않습니다.
공개 HTML·공개 CSS/JS·이미지·퀴즈 데이터·교안을 배포하고 관리자 편집기·관리자 CSS/JS·백업·문서·스크립트는 제외합니다.
루트 index.html은 비밀번호 입력 시작 페이지이며 배포 결과에도 그대로 복사합니다.
기존 루트와 이전 하위 HTML 주소는 새 페이지로 이동하며 쿼리와 해시를 보존합니다. 관리자 편집기의 이전 주소는 공개하지 않습니다.
기존 CNAME·도메인·Pages 설정을 유지하면 기존 주소·QR 목적지도 유지할 수 있습니다.
공개 자료실의 새 주소는 **기존 사이트 기본 경로 + livinglab-page_classroom/page_classroom/livinglab-library.html**입니다.

최초 적용 전 기존 배포 워크플로 확인·통합과 Settings → Pages → Source의 GitHub Actions 설정이 필요합니다.
원격 커밋·푸시·배포 및 실제 브라우저 화면 검증은 아직 완료하지 않았습니다.

## 문제 해결

| 증상 | 확인 |
|---|---|
| 방금 넣은 PDF가 로컬 목록에 없음 | build-library.mjs 실행 후 페이지를 다시 엽니다. |
| GitHub PDF 변경이 반영되지 않음 | main 업로드와 Actions 성공 여부, 빌드 제외 로그를 확인합니다. |
| 소개가 준비 중으로 표시됨 | course-descriptions.json의 파일명 키와 intro를 확인한 뒤 빌드합니다. |
| HTML만 옮겼더니 디자인·기능이 사라짐 | common과 books도 동일한 상대 경로에 배포해야 합니다. |
| 예전 페이지 주소가 열리지 않음 | 원본 파일만 수동 업로드하지 말고 _site 배포 결과를 사용합니다. |
| PDF 미리보기 대신 저장됨 | 브라우저 PDF 설정에 따라 발생할 수 있습니다. |



## 메뉴·PDF 미리보기·대표 이미지 업데이트

왼쪽 분류: 바이브코딩 → 게임 → 수업 자료실 → 기타.
바이브코딩의 온유 메이커는 프로젝트에 포함된 page_vibecoding/onuri-maker.html과 관련 소개·작업·과정·연락 페이지에 연결됩니다.
기존 페이지 소스와 자산을 재사용했으며 빈 MENU 자리표시자는 제거했습니다.
리빙랩 자료실에서 클릭한 PDF 새 탭이 iframe sandbox를 상속하지 않도록 해당 로컬 자료실에만 팝업 예외를 적용했습니다.
다른 메뉴의 외부 페이지에는 기본 sandbox를 유지합니다. Chrome 확장 프로그램 자체의 차단 여부는 별도 브라우저 검증이 필요합니다.
대표 이미지는 루트 images 폴더의 테마별 공용 파일을 참조합니다. 예를 들어 포털 로그인과 리빙랩은 index-hero.png를 공유합니다.
파일명과 실제 PNG 형식을 유지해 교체하면 같은 테마의 화면에 반영됩니다. 전체 파일명 표는 [이미지 관리 안내](../images/README.md)를 확인하세요.
공통 추가 스타일은 common/css/common.css, PDF 팝업 정책은 common/js/resource-policy.js가 담당합니다.


## Onuri 헤더·로그인·폴더 정리

공통 헤더에 첨부 로고(images/onuri-logo.png)와 Onuri.를 표시합니다. 클릭하면 로그인 후 시작하기 화면으로 돌아갑니다.
index.html은 비밀번호 입력 시작 페이지로 루트에 유지합니다. 바이브코딩은 page_vibecoding, 게임은 page_game, 수업 자료실은 page_classroom, 기타는 page_etc에 있습니다.
관리자 편집기는 page_admin/menu-builder.html이며 공개 배포에서 제외합니다. 메뉴의 내부 링크도 새 경로로 수정했습니다.
로그인하지 않고 내부 HTML 주소를 직접 열면 index.html로 이동합니다. 기존 이전 주소도 배포 시 이동 페이지를 거쳐 같은 규칙을 적용합니다.
로그인 상태와 복호화된 메뉴는 탭의 sessionStorage에 최대 8시간 보관하며 비밀번호는 저장하지 않습니다. 로그아웃하면 해당 탭의 상태를 지웁니다.
저장소 접근이 제한된 로컬 파일 iframe은 부모 포털과 메시지로 로그인 상태를 확인합니다.
이 기능은 정적 사이트의 화면 접근 제어입니다. GitHub Pages는 HTML·PDF 원본에 서버 인증을 적용하지 않으므로 비공개 파일 보호가 필요하면 인증 서버 또는 접근 제어가 있는 저장소가 필요합니다.


경남대학교 센터 페이지의 공식 자료 근거와 이미지 관리: [knu-center.md](knu-center.md)


## 새 탭·주소 변경·로컬 폴더 규칙

포털의 새 탭에서 열기는 일회용 탭 승인으로 해당 페이지에 로그인 상태를 전달합니다. 비밀번호를 다시 입력하지 않고 선택한 페이지가 열립니다.
승인을 받은 뒤 주소창에서 다른 내부 HTML 경로를 직접 입력하면 승인이 없어 index.html?login=required로 돌아가 계정을 다시 입력해야 합니다.
정상적인 내부 링크 클릭과 같은 페이지 새로고침은 허용합니다. 해시(페이지 안 위치) 변경은 재로그인을 요구하지 않습니다.
이 규칙은 정적 HTML의 화면 이동 제어이며 브라우저 보안 기능이나 서버 인증을 대체하지 않습니다.
로컬 _site는 삭제했습니다. 평소에는 index.html과 page_* 폴더의 원본만 사용하세요.
PDF 목록 갱신: node common/scripts/build-library.mjs (목록만 갱신, _site 생성 안 함).
배포 산출물 생성: node common/scripts/build-library.mjs --deploy (자동 배포 CI에서만 필요).
GitHub Actions는 --deploy로 _site를 만들고 배포합니다. GitHub에 _site를 업로드할 필요는 없습니다.


## 리빙랩 공개 교안 예외 및 카드 배치

리빙랩 수업 자료실은 전체 공개이며 로그인 없이 주소를 직접 열고 PDF를 내려받을 수 있습니다.
이전의 전체 내부 페이지 로그인 규칙에서 page_classroom/livinglab-library.html과 이전 자료실 주소는 예외입니다.
나머지 보호 페이지의 로그인·새 탭·주소 변경 규칙은 유지합니다.
로그인 화면에도 공개 자료실 바로가기를 제공하며 자료실의 로그인 관련 문구는 제거했습니다.
HTTP에서는 PDF를 Blob으로 받아 원래 파일명으로 저장하고, 로컬 file://에서도 자동 생성된 다운로드 데이터로 파일 저장을 실행합니다.
과목 목록은 데스크톱 4열이며 7개 등록 시 첫 줄 4개·둘째 줄 3개로 배치됩니다. 태블릿은 2열, 휴대폰은 1열입니다.
경남대 센터 소개의 대표 이미지·안내 카드·캡션은 겹치지 않는 별도 행으로 표시합니다.


## 공통 새 탭 버튼

index.html을 제외한 모든 페이지 오른쪽 아래에 새 탭에서 열기 버튼을 표시합니다. iframe 안에서도 표시하며 현재 페이지의 경로·쿼리·해시를 그대로 브라우저 새 탭으로 엽니다.
로그인 페이지는 기존 일회용 탭 승인으로 열고, 리빙랩 공개 자료실은 로그인 없이 엽니다. 주소 직접 변경 시 보호 페이지의 재로그인 규칙도 유지합니다.
index.html의 기존 선택 자료용 새 탭 버튼은 선택한 페이지를 여는 용도로 유지합니다.


## PDF 다운로드 버튼 수정

미리보기는 PDF를 새 탭에서 열고, 다운로드는 링크 이동이 없는 전용 버튼으로 파일 저장을 실행합니다.
HTTP와 로컬 file:// 모두 application/octet-stream Blob에 원래 PDF 파일명을 지정해 저장합니다.
로컬 파일 읽기 제한을 피하기 위한 데이터는 common/data/local-downloads에 자동 생성하며 Git·배포 대상에서는 제외합니다.
books 변경 후 node common/scripts/build-library.mjs 실행 시 목록과 로컬 다운로드 데이터가 함께 갱신됩니다.


수업 자료실에 edumaker 메뉴를 추가했습니다. 소스 사본은 common/apps/edumaker이며 별도 운영 앱을 새 탭으로 연결합니다. 상세 내용: [edumaker 연결 안내](edumaker-integration.md)
