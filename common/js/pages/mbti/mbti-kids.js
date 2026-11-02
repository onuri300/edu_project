
(function(){
  const questions = [
    { axis:"EI", text:"학교 쉬는 시간, 나는?",
      a:{label:"친구들이랑 신나게 놀아요", emoji:"🏃", value:"E"},
      b:{label:"혼자 조용히 책을 읽어요", emoji:"📖", value:"I"} },
    { axis:"EI", text:"새 학기에 새로운 반이 되면 나는?",
      a:{label:"먼저 다가가서 인사해요", emoji:"👋", value:"E"},
      b:{label:"친구가 먼저 말 걸어주면 좋아요", emoji:"🙂", value:"I"} },
    { axis:"SN", text:"이야기를 들을 때 나는?",
      a:{label:"실제로 있었던 일이 더 재밌어요", emoji:"📰", value:"S"},
      b:{label:"상상 속 이야기가 더 재밌어요", emoji:"🪄", value:"N"} },
    { axis:"SN", text:"그림을 그릴 때 나는?",
      a:{label:"눈에 보이는 그대로 그려요", emoji:"🖼️", value:"S"},
      b:{label:"머릿속 상상을 그려요", emoji:"🌌", value:"N"} },
    { axis:"TF", text:"친구가 속상해할 때 나는?",
      a:{label:"왜 그런지 이유를 물어봐요", emoji:"🤔", value:"T"},
      b:{label:"먼저 꼭 안아주고 위로해요", emoji:"🤗", value:"F"} },
    { axis:"TF", text:"게임에서 규칙을 정할 때 나는?",
      a:{label:"공평한 규칙이 제일 중요해요", emoji:"⚖️", value:"T"},
      b:{label:"다같이 즐거운 게 제일 중요해요", emoji:"🎉", value:"F"} },
    { axis:"JP", text:"숙제가 있을 때 나는?",
      a:{label:"미리미리 계획해서 해요", emoji:"📅", value:"J"},
      b:{label:"하고 싶을 때 갑자기 해요", emoji:"⚡", value:"P"} },
    { axis:"JP", text:"여행을 갈 때 나는?",
      a:{label:"미리 짜놓은 계획대로 다녀요", emoji:"🗺️", value:"J"},
      b:{label:"그때그때 하고 싶은 걸 해요", emoji:"🎈", value:"P"} }
  ];

  const results = {
    ISTJ:{emoji:"🐜", name:"부지런한 개미", tag:"성실하고 믿음직한 친구", color:"#FF6F59",
      traits:["차분해요","약속을 잘 지켜요","꼼꼼해요"],
      desc:"할 일을 미루지 않고 차근차근 해내는 개미 친구예요. 약속과 규칙을 잘 지켜서 친구들이 믿고 의지해요."},
    ISFJ:{emoji:"🐰", name:"다정한 토끼", tag:"따뜻하게 챙겨주는 친구", color:"#FF7FB2",
      traits:["따뜻해요","배려심이 많아요","친절해요"],
      desc:"친구가 힘들어 보이면 먼저 다가가 챙겨주는 토끼 친구예요. 조용하지만 마음은 누구보다 따뜻해요."},
    INFJ:{emoji:"🦉", name:"지혜로운 부엉이", tag:"깊이 생각하는 몽상가", color:"#9B6BFF",
      traits:["생각이 깊어요","상상력이 풍부해요","다정해요"],
      desc:"조용히 앉아서도 여러 생각을 하는 부엉이 친구예요. 친구의 마음을 잘 이해하고 좋은 이야기를 해줘요."},
    INTJ:{emoji:"🦊", name:"똑똑한 여우", tag:"계획을 잘 세우는 전략가", color:"#2FBFE0",
      traits:["똑똑해요","계획적이에요","목표가 뚜렷해요"],
      desc:"하고 싶은 일이 생기면 차근차근 계획을 세우는 여우 친구예요. 혼자서도 척척 문제를 해결해요."},
    ISTP:{emoji:"🐿️", name:"손재주꾼 다람쥐", tag:"뭐든 뚝딱 만드는 재주꾼", color:"#FFC93C",
      traits:["손재주가 좋아요","침착해요","호기심이 많아요"],
      desc:"장난감이 고장 나면 스스로 고쳐보는 다람쥐 친구예요. 몸으로 직접 해보면서 배우는 걸 좋아해요."},
    ISFP:{emoji:"🐱", name:"자유로운 고양이", tag:"예술적 감성이 가득한 친구", color:"#FF8FC7",
      traits:["감성적이에요","자유로워요","편안해요"],
      desc:"그림 그리기, 만들기처럼 예쁜 걸 만드는 걸 좋아하는 고양이 친구예요. 자기만의 속도로 지내는 걸 좋아해요."},
    INFP:{emoji:"🦄", name:"몽상가 유니콘", tag:"상상력이 반짝이는 친구", color:"#A66CFF",
      traits:["상상력이 풍부해요","다정해요","순수해요"],
      desc:"머릿속에 멋진 이야기가 가득한 유니콘 친구예요. 친구의 마음을 잘 공감해주는 따뜻한 마음을 가졌어요."},
    INTP:{emoji:"🐙", name:"호기심쟁이 문어", tag:"궁금한 게 너무 많은 친구", color:"#2BC48A",
      traits:["궁금증이 많아요","논리적이에요","창의적이에요"],
      desc:"'왜 그럴까?'를 늘 궁금해하는 문어 친구예요. 새로운 걸 알아내면 신이 나서 더 파고들어요."},
    ESTP:{emoji:"🐆", name:"모험왕 치타", tag:"행동이 제일 빠른 친구", color:"#FF6F59",
      traits:["활동적이에요","용감해요","순발력이 좋아요"],
      desc:"생각하기보다 일단 몸으로 부딪혀보는 치타 친구예요. 새로운 놀이와 모험을 제일 좋아해요."},
    ESFP:{emoji:"🦜", name:"흥부자 앵무새", tag:"어디서든 분위기 메이커", color:"#FFC93C",
      traits:["명랑해요","사교적이에요","웃음이 많아요"],
      desc:"어디서든 웃음소리가 끊이지 않게 만드는 앵무새 친구예요. 친구들과 함께 있을 때 제일 신나요."},
    ENFP:{emoji:"🐬", name:"신나는 돌고래", tag:"에너지 넘치는 인기쟁이", color:"#2FBFE0",
      traits:["활발해요","다정해요","아이디어가 많아요"],
      desc:"새로운 친구를 만나는 걸 좋아하고 늘 신나는 돌고래 친구예요. 주변 사람들을 즐겁게 만들어줘요."},
    ENTP:{emoji:"🐵", name:"아이디어 뭉치 원숭이", tag:"새로운 생각이 샘솟는 친구", color:"#9B6BFF",
      traits:["재치있어요","도전을 즐겨요","말솜씨가 좋아요"],
      desc:"기발한 아이디어가 계속 떠오르는 원숭이 친구예요. 새로운 도전과 토론을 즐거워해요."},
    ESTJ:{emoji:"🐘", name:"든든한 코끼리", tag:"리더십 있는 정리왕", color:"#2FBFE0",
      traits:["책임감이 강해요","리더십이 있어요","정리를 잘해요"],
      desc:"모둠 활동에서 앞장서서 이끄는 코끼리 친구예요. 계획을 세우고 척척 진행하는 걸 잘해요."},
    ESFJ:{emoji:"🐝", name:"부지런한 꿀벌", tag:"모두를 챙기는 친절대장", color:"#FFC93C",
      traits:["친절해요","협동을 잘해요","부지런해요"],
      desc:"친구들이 잘 지내는지 늘 살피는 꿀벌 친구예요. 함께 어울려서 무언가 하는 걸 좋아해요."},
    ENFJ:{emoji:"🦁", name:"따뜻한 사자", tag:"친구들을 이끄는 다정한 리더", color:"#FF6F59",
      traits:["다정해요","리더십이 있어요","공감을 잘해요"],
      desc:"친구들의 마음을 잘 헤아리면서도 씩씩하게 이끄는 사자 친구예요. 모두가 함께 웃길 바라요."},
    ENTJ:{emoji:"🐺", name:"카리스마 늑대", tag:"목표를 향해 달려가는 친구", color:"#2B2140",
      traits:["자신감이 넘쳐요","목표가 뚜렷해요","리더십이 있어요"],
      desc:"하고 싶은 목표가 생기면 힘차게 달려가는 늑대 친구예요. 친구들을 이끄는 걸 두려워하지 않아요."}
  };

  let current = 0;
  const answers = new Array(questions.length).fill(null);

  const startSection = document.getElementById('start');
  const quizSection = document.getElementById('quiz');
  const resultSection = document.getElementById('result');
  const progressWrap = document.getElementById('progressWrap');
  const progressFill = document.getElementById('progressFill');
  const progressLabel = document.getElementById('progressLabel');
  const qNumber = document.getElementById('qNumber');
  const qText = document.getElementById('qText');
  const optionsEl = document.getElementById('options');
  const backBtn = document.getElementById('backBtn');

  function showSection(section){
    [startSection, quizSection, resultSection].forEach(s => s.classList.remove('active'));
    section.classList.add('active');
  }

  document.getElementById('startBtn').addEventListener('click', () => {
    current = 0;
    answers.fill(null);
    progressWrap.classList.add('active');
    renderQuestion();
    showSection(quizSection);
  });

  document.getElementById('retryBtn').addEventListener('click', () => {
    current = 0;
    answers.fill(null);
    progressWrap.classList.add('active');
    renderQuestion();
    showSection(quizSection);
  });

  backBtn.addEventListener('click', () => {
    if (current > 0){
      current -= 1;
      renderQuestion();
    }
  });

  function renderQuestion(){
    const q = questions[current];
    qNumber.textContent = '질문 ' + (current + 1);
    qText.textContent = q.text;
    optionsEl.innerHTML = '';

    [q.a, q.b].forEach(opt => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'option-btn';
      btn.innerHTML = '<span class="opt-emoji">' + opt.emoji + '</span>' + opt.label;
      btn.addEventListener('click', () => selectAnswer(opt.value));
      optionsEl.appendChild(btn);
    });

    backBtn.style.visibility = current === 0 ? 'hidden' : 'visible';

    const pct = Math.round((current / questions.length) * 100);
    progressFill.style.width = pct + '%';
    progressLabel.textContent = (current + 1) + ' / ' + questions.length;
  }

  function selectAnswer(value){
    answers[current] = value;
    if (current < questions.length - 1){
      current += 1;
      renderQuestion();
    } else {
      progressFill.style.width = '100%';
      showResult();
    }
  }

  function showResult(){
    const tally = {E:0,I:0,S:0,N:0,T:0,F:0,J:0,P:0};
    answers.forEach(v => { if (v) tally[v] += 1; });

    const code =
      (tally.E >= tally.I ? 'E' : 'I') +
      (tally.S >= tally.N ? 'S' : 'N') +
      (tally.T >= tally.F ? 'T' : 'F') +
      (tally.J >= tally.P ? 'J' : 'P');

    const r = results[code];

    document.getElementById('resultCode').textContent = code;
    document.getElementById('mascotName').textContent = r.name;
    document.getElementById('mascotTag').textContent = r.tag;
    document.getElementById('resultDesc').textContent = r.desc;

    const badge = document.getElementById('mascotBadge');
    badge.textContent = r.emoji;
    badge.style.background = r.color + '22';

    const traitsEl = document.getElementById('traits');
    traitsEl.innerHTML = '';
    r.traits.forEach(t => {
      const chip = document.createElement('span');
      chip.className = 'trait-chip';
      chip.textContent = t;
      traitsEl.appendChild(chip);
    });

    progressWrap.classList.remove('active');
    showSection(resultSection);
  }
})();
