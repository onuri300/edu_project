
(function(){
  const scale = [
    {v:1, label:"전혀 아니다"},
    {v:2, label:"아니다"},
    {v:3, label:"보통이다"},
    {v:4, label:"그렇다"},
    {v:5, label:"매우 그렇다"}
  ];

  const axisNames = {
    E:"외향 · 에너지의 방향", I:"내향 · 에너지의 방향",
    S:"감각 · 정보 인식", N:"직관 · 정보 인식",
    T:"사고 · 판단 기준", F:"감정 · 판단 기준",
    J:"판단 · 생활 방식", P:"인식 · 생활 방식"
  };

  const questions = [
    {axis:"EI", pole:"E", text:"낯선 사람들과 있어도 비교적 쉽게 대화를 이어간다."},
    {axis:"EI", pole:"E", text:"혼자보다는 여럿이 함께 일할 때 에너지가 난다."},
    {axis:"EI", pole:"E", text:"생각을 말로 표현하면서 정리하는 편이다."},
    {axis:"EI", pole:"I", text:"혼자만의 시간을 가져야 재충전이 된다."},
    {axis:"EI", pole:"I", text:"말하기 전에 충분히 생각을 정리하는 편이다."},
    {axis:"EI", pole:"I", text:"여러 사람과 오래 어울리면 쉽게 지치는 편이다."},

    {axis:"SN", pole:"S", text:"구체적인 사실과 데이터를 근거로 판단하는 편이다."},
    {axis:"SN", pole:"S", text:"검증된 방식이나 매뉴얼을 따를 때 안정감을 느낀다."},
    {axis:"SN", pole:"S", text:"눈앞의 현실적인 문제 해결에 먼저 집중한다."},
    {axis:"SN", pole:"N", text:"숨겨진 의미나 가능성을 상상하는 걸 좋아한다."},
    {axis:"SN", pole:"N", text:"새로운 아이디어나 이론에 흥미를 느낀다."},
    {axis:"SN", pole:"N", text:"익숙한 방식보다 새로운 방법을 시도해보고 싶다."},

    {axis:"TF", pole:"T", text:"결정을 내릴 때 감정보다 논리를 우선한다."},
    {axis:"TF", pole:"T", text:"문제의 원인과 해결책을 객관적으로 분석하는 편이다."},
    {axis:"TF", pole:"T", text:"옳고 그름을 명확히 가리는 것이 중요하다."},
    {axis:"TF", pole:"F", text:"결정을 내릴 때 주변 사람들의 감정을 먼저 고려한다."},
    {axis:"TF", pole:"F", text:"논쟁에서 이기는 것보다 관계의 조화가 더 중요하다."},
    {axis:"TF", pole:"F", text:"다른 사람의 감정에 쉽게 공감하는 편이다."},

    {axis:"JP", pole:"J", text:"미리 계획을 세우고 그대로 실행할 때 마음이 편하다."},
    {axis:"JP", pole:"J", text:"마감 기한보다 여유 있게 일을 끝내는 편이다."},
    {axis:"JP", pole:"J", text:"정리되고 예측 가능한 환경을 선호한다."},
    {axis:"JP", pole:"P", text:"상황에 따라 계획을 유연하게 바꾸는 편이다."},
    {axis:"JP", pole:"P", text:"마감이 가까워질수록 오히려 집중력이 높아진다."},
    {axis:"JP", pole:"P", text:"정해진 틀보다 자유로운 방식이 더 편하다."}
  ];

  const results = {
    ISTJ:{emoji:"🗂️", name:"현실주의자", color:"var(--accent-indigo)",
      strengths:["책임감이 강하고 한번 한 약속은 반드시 지켜요","체계적으로 일을 처리해 주변에 신뢰를 줘요","위기 상황에서도 침착함을 유지해요","세부사항을 꼼꼼하게 챙기는 힘이 있어요"],
      encourage:"당신의 성실함은 주변 사람들에게 가장 든든한 버팀목이 되어줍니다. 꾸준함이야말로 흔치 않은 최고의 재능이라는 걸 잊지 마세요."},
    ISFJ:{emoji:"🌿", name:"수호자", color:"var(--accent-teal)",
      strengths:["곁에 있는 사람을 세심하게 챙기는 배려심이 깊어요","맡은 일은 끝까지 책임지고 완수해요","안정적이고 신뢰할 수 있는 관계를 만들어요","실질적인 도움을 주는 데 능숙해요"],
      encourage:"당신의 따뜻한 배려는 눈에 띄지 않아도 누군가의 하루를 지탱해주고 있어요. 그 마음만큼 스스로도 잘 챙기시길 바라요."},
    INFJ:{emoji:"🌌", name:"옹호자", color:"var(--accent-plum)",
      strengths:["통찰력이 뛰어나 사람과 상황의 본질을 잘 파악해요","깊은 공감 능력으로 신뢰받는 조언자가 돼요","확고한 가치관으로 쉽게 흔들리지 않아요","장기적인 비전을 그리는 데 강해요"],
      encourage:"당신의 깊은 통찰은 흔치 않은 귀한 재능입니다. 그 시선으로 세상에 좋은 영향을 계속 전해주세요."},
    INTJ:{emoji:"♟️", name:"전략가", color:"var(--accent-indigo)",
      strengths:["큰 그림을 그리고 전략적으로 계획을 세워요","독립적으로 문제를 해결하는 능력이 탁월해요","비효율을 발견하고 개선하는 데 뛰어나요","높은 기준으로 스스로를 꾸준히 성장시켜요"],
      encourage:"당신의 전략적 사고는 어떤 목표든 현실로 만들어낼 힘이 있습니다. 자신의 비전을 믿고 나아가세요."},
    ISTP:{emoji:"🔧", name:"장인", color:"var(--accent-amber)",
      strengths:["문제 상황에서 침착하게 실질적인 해법을 찾아요","직접 부딪히며 빠르게 배우는 힘이 있어요","위기에서도 흔들리지 않는 순발력이 있어요","군더더기 없이 효율적으로 일을 해내요"],
      encourage:"당신의 실전 감각은 예측 불가능한 상황에서 특히 빛을 발합니다. 그 침착함이 큰 자산이에요."},
    ISFP:{emoji:"🎨", name:"모험가", color:"var(--accent-coral)",
      strengths:["섬세한 감성으로 아름다움을 알아봐요","자신만의 가치관대로 진솔하게 살아가요","다른 사람을 있는 그대로 존중해요","조용하지만 꾸준한 실행력이 있어요"],
      encourage:"당신의 진정성은 억지로 꾸미지 않아도 사람들의 마음을 움직입니다. 그 모습 그대로 충분해요."},
    INFP:{emoji:"🦋", name:"중재자", color:"var(--accent-plum)",
      strengths:["깊은 공감으로 사람의 마음을 잘 이해해요","신념을 향한 내면의 열정이 커요","창의적인 시각으로 세상을 바라봐요","진정성 있는 관계를 소중히 여겨요"],
      encourage:"당신의 따뜻한 이상은 세상을 조금씩 더 나은 곳으로 바꾸고 있어요. 그 마음을 잃지 마세요."},
    INTP:{emoji:"🧩", name:"논리술사", color:"var(--accent-teal)",
      strengths:["복잡한 문제를 논리적으로 파고드는 힘이 있어요","독창적인 아이디어를 잘 떠올려요","지적 호기심으로 끊임없이 배워요","상황을 객관적으로 분석하는 데 능숙해요"],
      encourage:"당신의 깊이 있는 사고는 남들이 보지 못하는 답을 찾아냅니다. 그 호기심을 계속 따라가세요."},
    ESTP:{emoji:"🎯", name:"사업가", color:"var(--accent-coral)",
      strengths:["순발력 있게 상황에 대응해요","현실적인 감각으로 기회를 빠르게 포착해요","사람들과 스스럼없이 어울리는 친화력이 있어요","행동으로 결과를 만들어내는 실행력이 있어요"],
      encourage:"당신의 과감한 실행력은 기회를 현실로 바꾸는 힘이 됩니다. 그 에너지로 계속 도전하세요."},
    ESFP:{emoji:"🎪", name:"연예인", color:"var(--accent-amber)",
      strengths:["분위기를 밝게 만드는 긍정 에너지가 있어요","사람들과 쉽게 친해지는 사교성이 뛰어나요","현재를 즐기며 유연하게 대처해요","다른 사람을 즐겁게 하는 데 능숙해요"],
      encourage:"당신의 밝은 에너지는 주변 사람들에게 큰 활력을 줍니다. 그 매력을 마음껏 펼치세요."},
    ENFP:{emoji:"🌈", name:"활동가", color:"var(--accent-coral)",
      strengths:["열정적으로 새로운 가능성을 탐색해요","사람들에게 영감을 주는 친화력이 있어요","창의적인 아이디어가 끊임없이 샘솟아요","공감 능력으로 깊은 유대를 만들어요"],
      encourage:"당신의 열정은 주변 사람들까지 움직이게 만드는 힘이 있어요. 그 반짝임을 계속 지켜가세요."},
    ENTP:{emoji:"💡", name:"변론가", color:"var(--accent-indigo)",
      strengths:["재치 있는 논리로 새로운 관점을 제시해요","변화와 도전을 두려워하지 않아요","다양한 아이디어를 빠르게 연결해요","토론에서 강한 설득력을 보여요"],
      encourage:"당신의 기발한 발상은 고정관념을 깨는 힘이 있습니다. 그 도전정신으로 계속 나아가세요."},
    ESTJ:{emoji:"📋", name:"경영자", color:"var(--accent-indigo)",
      strengths:["체계적으로 조직을 이끄는 리더십이 있어요","목표를 명확히 세우고 추진력 있게 실행해요","책임감이 강해 주변의 신뢰를 얻어요","효율적인 의사결정을 내리는 힘이 있어요"],
      encourage:"당신의 추진력은 팀을 목표까지 이끄는 든든한 원동력입니다. 그 리더십을 자신 있게 발휘하세요."},
    ESFJ:{emoji:"🤝", name:"집정관", color:"var(--accent-teal)",
      strengths:["사람들을 세심하게 챙기고 조율하는 능력이 있어요","협력과 조화를 이끌어내는 데 탁월해요","책임감 있게 맡은 역할을 완수해요","따뜻한 배려로 신뢰를 쌓아가요"],
      encourage:"당신의 세심한 배려는 공동체를 하나로 이어주는 소중한 힘입니다. 그 따뜻함을 계속 나눠주세요."},
    ENFJ:{emoji:"🎭", name:"선도자", color:"var(--accent-plum)",
      strengths:["사람들의 잠재력을 알아보고 이끌어내요","공감 능력과 카리스마를 함께 지녔어요","팀을 하나로 모으는 구심점이 돼요","진심 어린 조언으로 신뢰를 얻어요"],
      encourage:"당신은 주변 사람들이 최고의 모습을 발휘하도록 이끄는 힘을 가졌습니다. 그 영향력을 자랑스러워하세요."},
    ENTJ:{emoji:"👑", name:"통솔자", color:"var(--accent-amber)",
      strengths:["명확한 비전으로 목표를 설정하고 이끌어요","효율적인 전략으로 결과를 만들어내요","강한 추진력으로 어려움을 돌파해요","자신감 있게 결정을 내리는 힘이 있어요"],
      encourage:"당신의 리더십은 큰 목표를 현실로 만드는 강력한 엔진입니다. 그 자신감으로 계속 나아가세요."}
  };

  let current = 0;
  const answers = new Array(questions.length).fill(null);

  const startSection = document.getElementById('start');
  const quizSection = document.getElementById('quiz');
  const resultSection = document.getElementById('result');
  const progressWrap = document.getElementById('progressWrap');
  const progressFill = document.getElementById('progressFill');
  const progressLabel = document.getElementById('progressLabel');
  const axisTag = document.getElementById('axisTag');
  const qNumber = document.getElementById('qNumber');
  const qText = document.getElementById('qText');
  const likertEl = document.getElementById('likert');
  const backBtn = document.getElementById('backBtn');

  function showSection(section){
    [startSection, quizSection, resultSection].forEach(s => s.classList.remove('active'));
    section.classList.add('active');
  }

  function startQuiz(){
    current = 0;
    answers.fill(null);
    progressWrap.classList.add('active');
    renderQuestion();
    showSection(quizSection);
  }
  document.getElementById('startBtn').addEventListener('click', startQuiz);
  document.getElementById('retryBtn').addEventListener('click', startQuiz);

  backBtn.addEventListener('click', () => {
    if (current > 0){ current -= 1; renderQuestion(); }
  });

  function renderQuestion(){
    const q = questions[current];
    axisTag.textContent = axisNames[q.pole];
    qNumber.textContent = '문항 ' + (current + 1) + ' / ' + questions.length;
    qText.textContent = q.text;
    likertEl.innerHTML = '';

    scale.forEach(s => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const selected = answers[current] === s.v;
      btn.innerHTML = '<span>' + s.label + '</span><span class="dot" style="' + (selected ? 'background:var(--accent-indigo);' : '') + '"></span>';
      btn.addEventListener('click', () => selectAnswer(s.v));
      likertEl.appendChild(btn);
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

  function computeAxis(poleA, poleB){
    let sumA = 0, sumB = 0;
    questions.forEach((q, i) => {
      const v = answers[i] || 3;
      if (q.pole === poleA) sumA += v;
      if (q.pole === poleB) sumB += v;
    });
    const total = sumA + sumB;
    const pctA = total > 0 ? Math.round((sumA / total) * 100) : 50;
    const pctB = 100 - pctA;
    return { pctA, pctB, letter: pctA >= pctB ? poleA : poleB };
  }

  function showResult(){
    const ei = computeAxis('E','I');
    const sn = computeAxis('S','N');
    const tf = computeAxis('T','F');
    const jp = computeAxis('J','P');

    const code = ei.letter + sn.letter + tf.letter + jp.letter;
    const r = results[code];

    document.getElementById('resultCode').textContent = code;
    document.getElementById('mascotName').textContent = r.name;

    const badge = document.getElementById('mascotBadge');
    badge.textContent = r.emoji;
    badge.style.background = r.color + '22';

    const axisData = [
      {a:'E',b:'I', res:ei}, {a:'S',b:'N', res:sn}, {a:'T',b:'F', res:tf}, {a:'J',b:'P', res:jp}
    ];
    const graphEl = document.getElementById('axisGraph');
    graphEl.innerHTML = '';
    axisData.forEach(d => {
      const row = document.createElement('div');
      row.className = 'axis-row';
      row.innerHTML =
        '<div class="axis-labels"><span><strong>' + d.a + '</strong> ' + d.res.pctA + '%</span>' +
        '<span>' + d.res.pctB + '% <strong>' + d.b + '</strong></span></div>' +
        '<div class="axis-bar"><div class="seg-a" style="flex-basis:' + d.res.pctA + '%"></div>' +
        '<div class="seg-b" style="flex-basis:' + d.res.pctB + '%"></div></div>';
      graphEl.appendChild(row);
    });

    const strengthsEl = document.getElementById('strengths');
    strengthsEl.innerHTML = '';
    r.strengths.forEach(s => {
      const li = document.createElement('li');
      li.textContent = s;
      strengthsEl.appendChild(li);
    });

    document.getElementById('encourage').textContent = r.encourage;

    progressWrap.classList.remove('active');
    showSection(resultSection);
    window.scrollTo({top:0, behavior:'smooth'});
  }
})();
