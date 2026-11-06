/**
 * works-data.js
 * ------------------------------------------------------------------
 * 이 파일 하나만 수정하면 갤러리 전체와 상세 페이지 내용이 바뀝니다.
 * 이미지 경로를 HTML/JS 곳곳에 직접 적지 않고, 모두 이 데이터 구조를
 * 통해서만 참조하도록 설계했습니다. (폴더 구조는 README.md 참고)
 *
 * 새 작품을 추가하려면:
 *  1. ../../common/images/portfolio1/works/work0N/ 폴더를 만들고 이미지를 넣는다.
 *  2. 아래 WORKS 배열에 객체를 하나 추가한다 (work07처럼 간단한 항목을
 *     복사해서 시작하면 편하다).
 *  3. 그 외 파일은 전혀 건드릴 필요가 없다.
 * ------------------------------------------------------------------
 */

const WORKS = [
  {
    id: "work01",
    title: "모루 (Moru)",
    category: "character",
    categoryLabel: "캐릭터",
    genre: "AI 생성 기반 마스코트 캐릭터",
    year: 2026,
    tagline: "생성형 AI로 디자인하고 다듬은 수업용 마스코트 캐릭터.",
    tags: ["캐릭터", "생성형AI", "마스코트"],
    cover: "../../common/images/portfolio1/works/work01/cover.jpg",
    thumb: "../../common/images/portfolio1/works/work01/thumb.jpg",
    synopsis:
      "생성형 AI 이미지 도구로 초안을 여러 번 뽑아보며 형태를 좁혀가고, 최종 라인은 " +
      "직접 벡터로 다시 그려 완성한 마스코트 캐릭터. 수업 자료, 굿즈, 디지털 문구류에 " +
      "공통으로 쓰이는 대표 캐릭터입니다.",
    characters: [
      {
        name: "모루", role: "메인 마스코트",
        personality: "호기심 많고 손재주가 좋다.",
        traits: "머리 위 안테나가 만든 것에 따라 색이 바뀐다",
        description: "매 수업마다 다른 도구(3D 프린터, 레이저커터, AI)를 들고 등장하는 설정의 마스코트.",
        image: "../../common/images/portfolio1/works/work01/thumb.jpg"
      }
    ],
    worldview: "",
    scenes: [],
    process: [
      { stage: "Idea", image: "../../common/images/portfolio1/works/work01/cover.jpg", note: "생성형 AI로 다양한 시안을 빠르게 탐색." },
      { stage: "Sketch", image: "../../common/images/portfolio1/works/work01/cover.jpg", note: "마음에 드는 시안을 골라 러프 라인으로 정리." },
      { stage: "Design", image: "../../common/images/portfolio1/works/work01/cover.jpg", note: "벡터 프로그램으로 라인과 컬러를 다시 정돈." },
      { stage: "Final", image: "../../common/images/portfolio1/works/work01/cover.jpg", note: "인쇄·출력에 맞춰 파일을 최종 정리." }
    ],
    beforeAfter: null,
    programs: ["Midjourney", "Illustrator", "Procreate"],
    intent: "AI로 빠르게 탐색하고, 사람의 손으로 다듬는 협업형 캐릭터 제작 과정을 보여주고 싶었다.",
    artistNote: "학생들이 가장 좋아한 건 결과물보다 오히려 AI 시안이 계속 바뀌는 과정이었다.",
    related: ["work02", "work04"]
  },

  {
    id: "work02",
    title: "동글이",
    category: "character",
    categoryLabel: "캐릭터",
    genre: "3D 프린팅 피규어 캐릭터",
    year: 2025,
    tagline: "3D 모델링 수업 예제로 만든 둥근 형태의 캐릭터.",
    tags: ["캐릭터", "3D프린팅", "모델링"],
    cover: "../../common/images/portfolio1/works/work02/cover.jpg",
    thumb: "../../common/images/portfolio1/works/work02/thumb.jpg",
    synopsis: "초급 3D 모델링 수업에서 학생들이 단계별로 따라 만들 수 있도록 설계한 예제용 캐릭터. 출력 난이도를 고려해 단순한 형태로 디자인했다.",
    characters: [],
    worldview: "",
    scenes: [],
    process: [],
    beforeAfter: null,
    programs: ["Tinkercad", "Fusion 360"],
    intent: "처음 3D 모델링을 접하는 학생도 완주할 수 있는 난이도의 캐릭터를 만들고 싶었다.",
    artistNote: "출력 실패율을 낮추기 위해 서포트 없는 형태로 여러 번 다시 설계했다.",
    related: ["work01", "work06"]
  },

  {
    id: "work03",
    title: "레이저비",
    category: "character",
    categoryLabel: "캐릭터",
    genre: "레이저 커팅 아크릴 캐릭터",
    year: 2025,
    tagline: "레이저 커팅 수업용으로 디자인한 아크릴 스탠드 캐릭터.",
    tags: ["캐릭터", "레이저커팅", "아크릴"],
    cover: "../../common/images/portfolio1/works/work03/cover.jpg",
    thumb: "../../common/images/portfolio1/works/work03/thumb.jpg",
    synopsis: "벡터 드로잉부터 레이저 커팅 세팅까지 한 번에 배울 수 있도록 설계한 캐릭터 스탠드 예제.",
    characters: [],
    worldview: "",
    scenes: [],
    process: [],
    beforeAfter: null,
    programs: ["Illustrator", "LightBurn"],
    intent: "벡터 파일이 실제 재료로 잘려 나오는 과정을 학생들이 직접 체감하게 하고 싶었다.",
    artistNote: "아크릴 두께에 따라 선 두께를 조절하는 법을 이 작업으로 정리하게 됐다.",
    related: ["work01", "work05"]
  },

  {
    id: "work04",
    title: "모루 굿즈 세트",
    category: "goods",
    categoryLabel: "굿즈",
    genre: "스티커 · 키링 · 뱃지",
    year: 2026,
    tagline: "모루 캐릭터로 제작한 첫 번째 굿즈 컬렉션.",
    tags: ["굿즈", "스티커", "키링"],
    cover: "../../common/images/portfolio1/works/work04/cover.jpg",
    thumb: "../../common/images/portfolio1/works/work04/thumb.jpg",
    synopsis: "마스코트 '모루'를 활용해 만든 스티커, 아크릴 키링, 배지 세트. 수업 결과물 전시와 학생 배포용으로 제작했다.",
    characters: [],
    worldview: "",
    scenes: [],
    process: [],
    beforeAfter: null,
    programs: ["Illustrator", "Photoshop"],
    intent: "화면 속 캐릭터가 손에 쥘 수 있는 물건이 되는 과정을 보여주고 싶었다.",
    artistNote: "인쇄소마다 색이 조금씩 달라져서 색 보정 노트를 따로 만들어 두었다.",
    related: ["work01", "work05"]
  },

  {
    id: "work05",
    title: "아크릴 스탠드 컬렉션",
    category: "goods",
    categoryLabel: "굿즈",
    genre: "레이저 커팅 굿즈",
    year: 2025,
    tagline: "레이저 커팅으로 제작한 캐릭터 아크릴 스탠드 모음.",
    tags: ["굿즈", "레이저커팅", "아크릴스탠드"],
    cover: "../../common/images/portfolio1/works/work05/cover.jpg",
    thumb: "../../common/images/portfolio1/works/work05/thumb.jpg",
    synopsis: "레이저비를 비롯한 캐릭터들을 아크릴 스탠드 형태로 제작한 굿즈 라인업.",
    characters: [],
    worldview: "",
    scenes: [],
    process: [],
    beforeAfter: null,
    programs: ["Illustrator", "LightBurn"],
    intent: "수업에서 다룬 재단 기법을 실제 판매 가능한 완성도로 끌어올리고 싶었다.",
    artistNote: "받침대 각도를 여러 번 조정해서야 안정적으로 세워졌다.",
    related: ["work03", "work04"]
  },

  {
    id: "work06",
    title: "3D 프린팅 피규어 굿즈",
    category: "goods",
    categoryLabel: "굿즈",
    genre: "3D 프린팅 굿즈",
    year: 2024,
    tagline: "동글이 캐릭터를 소형 피규어로 출력한 굿즈 시리즈.",
    tags: ["굿즈", "3D프린팅", "피규어"],
    cover: "../../common/images/portfolio1/works/work06/cover.jpg",
    thumb: "../../common/images/portfolio1/works/work06/thumb.jpg",
    synopsis: "3D 프린팅 수업 결과물을 다듬어 채색까지 마친 소형 피규어 굿즈 시리즈.",
    characters: [],
    worldview: "",
    scenes: [],
    process: [],
    beforeAfter: null,
    programs: ["Fusion 360", "Cura"],
    intent: "출력물이 후가공을 거쳐 완성품이 되는 과정을 기록하고 싶었다.",
    artistNote: "서포트 자국을 다듬는 사포질 단계가 생각보다 오래 걸렸다.",
    related: ["work02", "work05"]
  },

  {
    id: "work07",
    title: "디지털 다이어리 스티커 세트",
    category: "stationery",
    categoryLabel: "디지털 문구",
    genre: "디지털 스티커",
    year: 2026,
    tagline: "굿노트·노타빌리티에서 바로 쓸 수 있는 디지털 스티커 세트.",
    tags: ["디지털문구", "스티커", "다이어리"],
    cover: "../../common/images/portfolio1/works/work07/cover.jpg",
    thumb: "../../common/images/portfolio1/works/work07/thumb.jpg",
    synopsis: "모루 캐릭터와 수업 도구 아이콘을 모티프로 만든 디지털 다이어리 스티커 세트.",
    characters: [],
    worldview: "",
    scenes: [],
    process: [],
    beforeAfter: null,
    programs: ["Procreate", "Photoshop"],
    intent: "실물 문구를 사는 감각을 디지털 위에서도 느낄 수 있게 하고 싶었다.",
    artistNote: "투명 배경 PNG로 내보내는 규격을 통일하는 데 시간이 꽤 걸렸다.",
    related: ["work08", "work09"]
  },

  {
    id: "work08",
    title: "위클리 플래너 템플릿",
    category: "stationery",
    categoryLabel: "디지털 문구",
    genre: "디지털 플래너",
    year: 2025,
    tagline: "수업 일정 관리용으로 만든 위클리 플래너 템플릿.",
    tags: ["디지털문구", "플래너", "템플릿"],
    cover: "../../common/images/portfolio1/works/work08/cover.jpg",
    thumb: "../../common/images/portfolio1/works/work08/thumb.jpg",
    synopsis: "여러 반의 수업 일정을 한눈에 정리하기 위해 만든 위클리 플래너 템플릿. 이후 일반 배포용으로도 다듬었다.",
    characters: [],
    worldview: "",
    scenes: [],
    process: [],
    beforeAfter: null,
    programs: ["Procreate", "Illustrator"],
    intent: "직접 쓰면서 부족했던 부분을 계속 고쳐나간 실사용 기반 디자인이다.",
    artistNote: "칸 간격을 손글씨 크기에 맞춰 세 번 다시 잡았다.",
    related: ["work07", "work09"]
  },

  {
    id: "work09",
    title: "AI 일러스트 디지털 메모지",
    category: "stationery",
    categoryLabel: "디지털 문구",
    genre: "디지털 메모지",
    year: 2025,
    tagline: "생성형 AI 일러스트를 활용한 디지털 메모지 세트.",
    tags: ["디지털문구", "메모지", "생성형AI"],
    cover: "../../common/images/portfolio1/works/work09/cover.jpg",
    thumb: "../../common/images/portfolio1/works/work09/thumb.jpg",
    synopsis: "생성형 AI로 만든 계절 일러스트를 배경으로 활용한 디지털 메모지 세트.",
    characters: [],
    worldview: "",
    scenes: [],
    process: [],
    beforeAfter: null,
    programs: ["Midjourney", "Photoshop"],
    intent: "AI 이미지를 그대로 쓰지 않고 사용성을 고려해 다시 편집하는 과정을 보여주고 싶었다.",
    artistNote: "글씨가 잘 보이도록 배경 채도를 낮추는 작업이 핵심이었다.",
    related: ["work07", "work08"]
  }
];

// 카테고리 필터 UI에 쓰이는 목록 (표시 순서 그대로 사용)
const CATEGORIES = [
  { key: "all", label: "전체" },
  { key: "character", label: "캐릭터" },
  { key: "goods", label: "굿즈" },
  { key: "stationery", label: "디지털 문구" }
];

function getWorkById(id) {
  return WORKS.find((w) => w.id === id) || null;
}
