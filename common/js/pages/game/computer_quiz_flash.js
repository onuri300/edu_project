
(function(){
  const DEFAULT_CARDS = [
    { q: "API", a: "서로 다른 프로그램이나 시스템이 데이터를 주고받기 위해 정해놓은 규칙과 방법. '음식점 메뉴판'처럼 무엇을 요청할 수 있는지 알려준다.", cat: "개발 기초" },
    { q: "클라우드 컴퓨팅", a: "내 컴퓨터가 아닌 인터넷상의 서버에 데이터를 저장하고 프로그램을 실행하는 방식. 예: AWS, Google Cloud, Azure.", cat: "인프라" },
    { q: "깃(Git)", a: "코드의 변경 이력을 기록하고 여러 사람이 협업할 수 있게 해주는 버전 관리 시스템.", cat: "개발 도구" },
    { q: "UX/UI", a: "UI는 사용자가 보고 조작하는 화면(버튼, 레이아웃), UX는 그것을 사용하며 느끼는 전체적인 경험을 의미한다.", cat: "디자인" },
    { q: "오픈소스", a: "소스 코드가 공개되어 누구나 보고, 수정하고, 재배포할 수 있는 소프트웨어.", cat: "개발 기초" },
    { q: "머신러닝", a: "컴퓨터가 명시적으로 프로그래밍되지 않아도 데이터를 통해 스스로 규칙을 학습하는 인공지능의 한 분야.", cat: "AI" },
    { q: "SaaS", a: "Software as a Service. 소프트웨어를 설치하지 않고 인터넷을 통해 구독해서 사용하는 서비스 방식. 예: 구글 워크스페이스, 노션.", cat: "인프라" },
    { q: "반응형 웹", a: "PC, 태블릿, 모바일 등 화면 크기에 따라 레이아웃이 자동으로 조정되는 웹 디자인 방식.", cat: "웹 개발" },
    { q: "알고리즘", a: "어떤 문제를 해결하기 위한 절차나 방법을 순서대로 나열한 것. 요리 레시피와 비슷한 개념.", cat: "개발 기초" },
    { q: "프롬프트 엔지니어링", a: "AI 모델(챗봇 등)로부터 원하는 결과를 얻기 위해 질문이나 지시문을 효과적으로 설계하는 기술.", cat: "AI" }
  ];

  const STORAGE_KEY = "flashcards_data_v1";
  let cards = [];
  let order = [];
  let idx = 0;
  let flipped = false;
  let scores = {}; // id -> 'correct' | 'wrong'

  function loadCards() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch(e) {}
    return DEFAULT_CARDS.map((c, i) => ({ ...c, id: "c" + i }));
  }

  function saveCards() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }

  cards = loadCards().map((c, i) => c.id ? c : { ...c, id: "c" + i });
  saveCards();

  function getCategories() {
    const set = new Set(cards.map(c => c.cat || "기타"));
    return ["전체", ...Array.from(set)];
  }

  function buildOrder() {
    order = cards.map(card => card.id);
    idx = 0;
  }

  function currentCard() {
    const id = order[idx];
    return cards.find(c => c.id === id);
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 1600);
  }

  // ---- 렌더링 ----
  function renderCard() {
    const endArea = document.getElementById('endArea');
    const cardArea = document.getElementById('cardArea');
    if (order.length === 0) {
      cardArea.style.display = 'none';
      endArea.style.display = 'block';
      document.getElementById('endScore').textContent = "0 / 0";
      document.querySelector('.end-screen h2').textContent = "카드가 없어요";
      document.querySelector('.end-screen p').textContent = "관리자 모드에서 카드를 추가해보세요";
      return;
    }
    if (idx >= order.length) {
      cardArea.style.display = 'none';
      endArea.style.display = 'block';
      document.querySelector('.end-screen h2').textContent = "🎉 학습 완료!";
      document.querySelector('.end-screen p').textContent = "모든 카드를 다 풀었어요";
      const c = countScores();
      document.getElementById('endScore').textContent = c.correct + " / " + (c.correct + c.wrong);
      return;
    }
    cardArea.style.display = 'block';
    endArea.style.display = 'none';

    const card = currentCard();
    document.getElementById('questionText').textContent = card.a;
    document.getElementById('answerText').textContent = card.q;

    const fc = document.getElementById('flashcard');
    fc.classList.toggle('flipped', flipped);

    document.getElementById('progressText').textContent = (idx + 1) + " / " + order.length;
    document.getElementById('progressFill').style.width = (((idx + 1) / order.length) * 100) + "%";

    document.getElementById('btnPrev').disabled = idx === 0;

    const state = scores[card.id];
    document.getElementById('btnCorrect').classList.toggle('active', state === 'correct');
    document.getElementById('btnWrong').classList.toggle('active', state === 'wrong');
  }

  function countScores() {
    let correct = 0, wrong = 0;
    order.forEach(id => {
      if (scores[id] === 'correct') correct++;
      else if (scores[id] === 'wrong') wrong++;
    });
    return { correct, wrong };
  }

  function renderScore() {
    const { correct, wrong } = countScores();
    document.getElementById('scoreCorrect').textContent = correct;
    document.getElementById('scoreWrong').textContent = wrong;
    const total = correct + wrong;
    document.getElementById('scorePercent').textContent = total ? Math.round((correct / total) * 100) + "%" : "0%";
  }

  function renderAll() {
    renderCard();
    renderScore();
  }

  // ---- 이벤트: 학습 화면 ----
  document.getElementById('flashcard').addEventListener('click', () => {
    flipped = !flipped;
    renderCard();
  });

  document.getElementById('btnNext').addEventListener('click', () => {
    if (idx < order.length) idx++;
    flipped = false;
    renderCard();
  });

  document.getElementById('btnPrev').addEventListener('click', () => {
    if (idx > 0) idx--;
    flipped = false;
    renderCard();
  });

  document.getElementById('btnCorrect').addEventListener('click', () => {
    const card = currentCard();
    if (!card) return;
    scores[card.id] = 'correct';
    renderCard();
    renderScore();
  });

  document.getElementById('btnWrong').addEventListener('click', () => {
    const card = currentCard();
    if (!card) return;
    scores[card.id] = 'wrong';
    renderCard();
    renderScore();
  });

  document.getElementById('btnRestart').addEventListener('click', () => {
    scores = {};
    buildOrder();
    flipped = false;
    renderAll();
  });

  window.eduGameAdmin.bind(renderAdmin);
  document.getElementById('homeBtn').addEventListener('click', event => {
    event.preventDefault();
    window.scrollTo(0, 0);
  });

  // ---- 관리자 모드 ----
  function renderAdmin() {
    document.getElementById('cardCount').textContent = cards.length;
    const listArea = document.getElementById('cardListArea');
    listArea.innerHTML = "";
    cards.forEach(c => {
      const row = document.createElement('div');
      row.className = 'card-row';
      row.innerHTML = `
        <div class="info">
          <div class="q">${escapeHtml(c.q)}</div>
          <div class="meta">${escapeHtml(c.cat || '기타')}</div>
        </div>
      `;
      const delBtn = document.createElement('button');
      delBtn.className = 'del-btn';
      delBtn.textContent = '삭제';
      delBtn.addEventListener('click', () => {
        cards = cards.filter(x => x.id !== c.id);
        saveCards();
        buildOrder();
        renderAll();
        renderAdmin();
        showToast("카드를 삭제했어요");
      });
      row.appendChild(delBtn);
      listArea.appendChild(row);
    });

    const catList = document.getElementById('catList');
    catList.innerHTML = "";
    getCategories().filter(c => c !== "전체").forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      catList.appendChild(opt);
    });
  }

  const { escapeHtml } = window.eduUI;

  document.getElementById('btnAddCard').addEventListener('click', () => {
    const q = document.getElementById('inpQuestion').value.trim();
    const a = document.getElementById('inpAnswer').value.trim();
    const cat = document.getElementById('inpCategory').value.trim() || "기타";
    const errEl = document.getElementById('formError');

    if (!q || !a) {
      errEl.textContent = "문제와 정답을 모두 입력해주세요";
      errEl.style.display = 'block';
      return;
    }
    errEl.style.display = 'none';

    const newCard = { id: 'c' + Date.now(), q, a, cat };
    cards.push(newCard);
    saveCards();

    document.getElementById('inpQuestion').value = "";
    document.getElementById('inpAnswer').value = "";
    document.getElementById('inpCategory').value = "";

    buildOrder();
    renderAll();
    renderAdmin();
    showToast("카드를 추가했어요");
  });

  document.getElementById('btnExport').addEventListener('click', () => {
    const json = JSON.stringify(cards, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(json).then(() => showToast("JSON이 클립보드에 복사됐어요"))
        .catch(() => showToast("복사에 실패했어요"));
    } else {
      showToast("이 브라우저는 복사를 지원하지 않아요");
    }
  });

  document.getElementById('btnResetAll').addEventListener('click', () => {
    if (!confirm("모든 카드를 기본 데이터로 초기화할까요? 추가한 내용은 사라져요.")) return;
    cards = DEFAULT_CARDS.map((c, i) => ({ ...c, id: "c" + i }));
    saveCards();
    scores = {};
    buildOrder();
    renderAll();
    renderAdmin();
    showToast("기본 데이터로 초기화했어요");
  });

  // ---- 초기화 ----
  buildOrder();
  renderAll();
})();
