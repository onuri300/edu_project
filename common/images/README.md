# 대표 이미지 관리

이미지는 그룹 폴더 바로 아래에 저장합니다. 같은 이름을 구분할 때는 `portfolio1-work01-cover.jpg`처럼 파일명에 작업 번호와 용도를 넣습니다. 온유 메이커 갤러리는 `vi.image`의 `onyou-3d-`, `onyou-laser-`, `onyou-resin-` 파일을 분류합니다. 사진을 추가한 뒤 `node vi_vibe/vi_onyou/generate-gallery.mjs`로 목록을 갱신합니다.

그룹 전용 이미지는 `common/images/<그룹 코드>.image/`에 저장합니다. 현재 `cl.image`는 수업 자료실, `ga.image`는 Games, `ne.image`는 뉴스레터, `vi.image`는 바이브코딩 이미지입니다. `shared/`에는 여러 그룹과 포털에서 함께 쓰는 이미지를 둡니다. More 매뉴얼은 뉴스레터 대표 이미지를 참조합니다. More 전용 이미지가 생기면 `mo.image/`에 저장합니다.

대표 일러스트는 같은 테마를 사용하는 페이지에서 공용 파일을 참조합니다. 파일을 교체하면 아래 그룹 전체에 반영됩니다. 한 페이지만 바꾸려면 별도 이미지를 추가하고 해당 HTML의 이미지 경로를 수정합니다.

| 공용 이미지 | 사용 화면 |
|---|---|
| `index-hero.png` | 포털 로그인, 리빙랩 자료실, 공지사항, edumaker 연결, 로컬 메뉴 편집기 |
| `onuri-maker-hero.png` | 온유 메이커 포트폴리오 6페이지와 KNU 센터 |
| `computer-quiz-hero.png` | 컴퓨터 퀴즈, 플래시카드, 사다리 게임 |
| `mbti-adult-hero.png` | 성인·어린이 MBTI |
| `ai-newsletter-hero.png` | AI·Making 뉴스레터 |
| `edumaker-idea-card-hero.png` | edumaker 아이디어 카드 |
| `index-banner.png`, `onuri-logo.png` | 포털 홈 배너, 공통 로고 |

대표 일러스트는 가로 3:2를 권장합니다. 화면에 따라 잘리는 영역이 달라 중요한 요소는 가운데에 둡니다. 이미지 형식과 파일 확장자를 일치시키고 작은 화면에서 확인합니다. 뉴스레터의 대표 이미지 경로는 `common/data/newsletter-pages.json`에서 관리합니다.

KNU의 로고와 담당자 안내 캐릭터는 각각 `knu-center-logo.png`, `knu-manager-character.png`입니다. [이미지 생성 기록](../../mo_tools/docs/image-prompts.md)과 [KNU 이미지 안내](../../mo_tools/docs/knu-center.md)도 참고합니다.
