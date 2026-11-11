# OnuriMakerLab — AI 디지털 메이킹 강사 포트폴리오

3D 프린터 · 레이저 커터 · 생성형 AI를 함께 다루는 AI 디지털 메이킹 강사를 위한
개인 포트폴리오 웹사이트입니다. 바닐라 HTML / CSS / JavaScript로만 만들어졌고,
빌드 과정 없이 `index.html`을 브라우저로 열면 바로 실행됩니다.

## 페이지 구성

| 페이지 | 파일 | 역할 |
|---|---|---|
| Home | `index.html` | Hero, 최근 작업 3개, 카테고리 바로가기 |
| Works | `works.html` | 캐릭터 / 굿즈 / 디지털 문구 갤러리 (필터·검색·정렬·페이징) |
| 작업 상세 | `work-detail.html` | 데이터 기반 공용 템플릿 — 모든 작업이 이 파일 하나를 공유 |
| About | `about.html` | 강사 프로필, 다루는 작업, 사용 도구, **이력(경력) 타임라인** |
| Process | `process.html` | 공통 제작 프로세스 (Idea → Design → Fabrication → Finishing) |
| Contact | `contact.html` | 연락 폼 + 채널 링크 |

모든 페이지는 동일한 헤더(로고 · 메뉴 · 다크모드 토글 · 모바일 메뉴 버튼)와
푸터 구조를 공유합니다.

## 폴더 구조

```
edu_project/
├─ vi_vibe/vi_onuri/  vi_onuri.html, vi_works.html 등 HTML 6개
├─ common/css/pages/
│  └─ onuri-maker.css              전체 디자인 (색상 · 타이포 · 레이아웃 · 반응형 전부 이 파일)
├─ common/js/pages/
│  ├─ onuri-works-data.js           ★ 작업(캐릭터/굿즈/디지털문구) 데이터 + 이미지 경로
│  ├─ onuri-about-data.js         ★ 강사 프로필 + 이력(경력) 데이터
│  ├─ onuri-works.js                갤러리 필터 · 검색 · 정렬 · 반응형 페이징(스와이프)
│  ├─ onuri-work-detail.js                  작업 상세 페이지 렌더링
│  └─ onuri-works-overlays.js                 캐릭터 소개와 이미지 확대 팝업
└─ common/images/vi.image/
   ├─ portfolio1-profile-portrait.jpg
   ├─ portfolio1-work01-cover.jpg
   └─ portfolio1-work01-thumb.jpg
```

작품 번호와 이미지 역할을 파일명에 표시합니다. 작품 카드와 상세 이미지 경로는 공통 작품 데이터에서 관리합니다.

## 데이터 구조 (핵심)

### `common/js/pages/vi_items.js`
`WORKS` 배열 하나가 Works 갤러리 카드와 작업 상세 페이지(시놉시스/캐릭터/장면/
제작 과정/Before-After/관련 작업)를 전부 렌더링합니다. 새 작업을 추가하는 방법:
1. `common/images/vi.image/`에 `portfolio1-work10-cover.jpg`와 `portfolio1-work10-thumb.jpg`를 넣는다.
2. `WORKS` 배열에 객체를 하나 추가한다 (간단한 작업은 `work07`처럼 복사해서 시작).
3. 상세 구성이 필요 없는 필드는 `[]` 또는 `null`로 두면 해당 섹션이 자동으로 숨겨집니다.

### `common/js/pages/vi_profile.js`
`PROFILE` 객체(이름 · 역할 · 소개 · 다루는 작업 · 사용 도구)와 `CAREER` 배열
(이력/경력 타임라인)을 이 파일에서 관리합니다. **경력을 추가·수정하려면
`CAREER` 배열에 `{ period, role, org, desc }` 형태로 항목을 추가하면
About 페이지에 자동으로 반영됩니다.**

## 구현된 기능

- **반응형 작업 갤러리** — PC에서는 3열 × 2행(한 페이지 6개), 모바일(~768px 이하)에서는
  2열 × 2행(한 페이지 4개)으로 자동 전환되며, 필터링된 작업이 한 페이지 분량을
  넘으면 페이징이 활성화됩니다. 터치 기기는 좌우 스와이프로, PC는 화살표
  버튼/점 인디케이터로 페이지를 넘깁니다. 화면 폭이 모바일↔PC 기준을 넘나들면
  페이지 구성도 자동으로 다시 계산됩니다.
- 카테고리 필터(캐릭터/굿즈/디지털 문구) + **키워드 검색** + 최신순/이름순 정렬
- 갤러리 카드 hover 애니메이션, 이미지 클릭 시 라이트박스로 확대
- 작업 상세 페이지: 소개, 캐릭터(있는 경우 movie-credit 스타일 캐스트 + 클릭 시
  성격/특징/설명 팝업), 주요 장면 슬라이더, 제작 과정 타임라인, Before/After
  비교, 관련 작업
- **About 페이지 이력(경력) 섹션** — `onuri-about-data.js`의 `CAREER` 배열만
  수정하면 되는 타임라인 형태
- 화이트/블랙(라이트·다크) 테마 전환, 맨 위로 가기, 스크롤 리빌, 부드러운 스크롤
- **모바일 메뉴** — 삼선 버튼을 누르면 전체 화면 오버레이 메뉴가 뜹니다.
  드로어(부분 슬라이드) 방식 대신 전체 화면 오버레이로 만들어서, 높이 계산이나
  겹침 때문에 하단 메뉴가 눌리지 않는 문제 없이 항상 안정적으로 동작합니다.
  닫기(✕) 버튼, Esc 키, 메뉴 항목 클릭으로 닫히고 배경 스크롤은 잠깁니다.
- Desktop(1200px~) / Tablet(~992px) / Mobile(~768px, ~576px) 반응형 레이아웃,
  viewport meta 포함, 폰트는 rem/clamp 기반으로 화면 크기에 맞게 조정

## 사용자가 직접 교체해야 하는 부분

1. **포트폴리오 이미지** — `common/images/vi.image/portfolio1-*` 파일은 자동 생성된 자리표시 이미지입니다.
   같은 파일명으로 교체하거나 `onuri-works-data.js` / `onuri-about-data.js`의 경로를
   새 파일명에 맞게 수정하세요.
2. **`common/js/pages/vi_items.js`의 모든 텍스트** — 제목, 소개, 태그 등은 예시입니다.
3. **`common/js/pages/vi_profile.js`** — 이름, 소개 문구, 이력(경력) 내용을 실제 정보로
   채워주세요. `CAREER` 배열의 `period`(예: "20XX – 20XX")를 실제 재직 기간으로
   바꾸면 됩니다.
4. **`contact.html`** — 이메일 주소와 SNS 링크(`href="#"`)를 실제 링크로 바꾸고,
   폼 제출은 현재 프론트엔드 데모용이라 Formspree, EmailJS 등 폼 전송 서비스나
   자체 백엔드를 연결해야 실제로 동작합니다.
5. **브랜드명 "OnuriMakerLab"** — 각 HTML의 `.brand` 부분과 `<title>`을 함께 수정하세요.

## 실행 방법

- `index.html`을 더블클릭해서 열어도 대부분 동작합니다.
- 다만 향후 `fetch` 기반 기능을 추가할 경우를 대비해, VS Code의 Live Server
  확장이나 `python3 -m http.server` 실행 후 `http://localhost:8000` 접속을
  권장합니다.


## 공통 자산 통합 (2026-11-01)

이 폴더의 HTML 주소는 유지하고 CSS와 기능 JS는 프로젝트 common/css/pages와 common/js/pages 바로 아래에 배치했습니다.
모든 페이지가 onuri.framework/css/common.css와 onuri.framework/js/common.js를 사용합니다. 이전 css/, js/ 경로 안내 대신 현재 HTML의 공통 상대 경로를 기준으로 관리하세요.
