(() => {
  function adultContent() {
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
    return { questions, results, scale, axisNames };
  }

  function kidsContent() {
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
    return { questions, results };
  }

  function renderGraph(axes) {
    const graph = document.getElementById('axisGraph');
    graph.replaceChildren();
    for (const { a, b, pctA } of axes) {
      const row = document.createElement('div');
      row.className = 'axis-row';
      const labels = document.createElement('div');
      labels.className = 'axis-labels';
      const bar = document.createElement('div');
      bar.className = 'axis-bar';
      bar.setAttribute('aria-hidden', 'true');
      for (const [index, [letter, pct]] of [[a, pctA], [b, 100 - pctA]].entries()) {
        const label = document.createElement('span');
        label.textContent = letter + ' ' + pct + '%';
        labels.append(label);
        const segment = document.createElement('div');
        segment.className = index === 0 ? 'seg-a' : 'seg-b';
        segment.style.flexBasis = pct + '%';
        bar.append(segment);
      }
      row.append(labels, bar);
      graph.append(row);
    }
  }

  const kids = document.body.dataset.mbti === 'kids';
  const { questions, results, scale, axisNames } = kids ? kidsContent() : adultContent();
  const axes = [['E', 'I'], ['S', 'N'], ['T', 'F'], ['J', 'P']];
  const byId = id => document.getElementById(id);
  const screens = ['start', 'quiz', 'result'].map(byId);
  const progress = byId('progressWrap');
  const progressFill = byId('progressFill');
  const back = byId('backBtn');
  const options = byId(kids ? 'options' : 'likert');
  const answers = new Array(questions.length).fill(null);
  let current = 0;

  function showScreen(id) {
    for (const screen of screens) screen.classList.toggle('active', screen.id === id);
    progress.classList.toggle('active', id === 'quiz');
    byId(id).scrollIntoView({ block: 'start' });
  }

  function start() {
    answers.fill(null);
    current = 0;
    renderQuestion();
    showScreen('quiz');
  }

  function renderQuestion() {
    const question = questions[current];
    byId('qNumber').textContent = kids ? '질문 ' + (current + 1) : '문항 ' + (current + 1) + ' / ' + questions.length;
    byId('qText').textContent = question.text;
    if (!kids) byId('axisTag').textContent = axisNames[question.pole];
    options.replaceChildren();
    for (const option of kids ? [question.a, question.b] : scale) {
      const button = document.createElement('button');
      button.type = 'button';
      if (kids) {
        button.className = 'option-btn';
        const emoji = document.createElement('span');
        emoji.className = 'opt-emoji';
        emoji.textContent = option.emoji;
        button.append(emoji, option.label);
      } else {
        const label = document.createElement('span');
        label.textContent = option.label;
        const dot = document.createElement('span');
        dot.className = 'dot';
        if (answers[current] === option.v) dot.style.background = 'var(--accent-indigo)';
        button.append(label, dot);
      }
      button.addEventListener('click', () => {
        answers[current] = kids ? option.value : option.v;
        if (current === questions.length - 1) showResult();
        else {
          current += 1;
          renderQuestion();
        }
      });
      options.append(button);
    }
    back.style.visibility = current === 0 ? 'hidden' : 'visible';
    const answered = answers.filter(answer => answer !== null).length;
    byId('remainingQuestions').textContent = '남은 문항 ' + (questions.length - answered) + '개';
    progressFill.style.width = window.eduUI.roundedPercent(answered, questions.length) + '%';
    byId('progressLabel').textContent = (current + 1) + ' / ' + questions.length;
  }

  function showResult() {
    const tally = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    questions.forEach((question, index) => {
      const answer = answers[index];
      if (kids) tally[answer] += 1;
      else tally[question.pole] += answer;
    });

    const graph = axes.map(([a, b]) => {
      const total = tally[a] + tally[b];
      return { a, b, pctA: window.eduUI.roundedPercent(tally[a], total, 50) };
    });
    // Adult results use rounded percentages to choose a letter, as in the original quiz.
    const code = graph.map(({ a, b, pctA }) => (kids ? tally[a] >= tally[b] : pctA >= 50) ? a : b).join('');
    const result = results[code];
    byId('resultCode').textContent = code;
    byId('mascotName').textContent = result.name;
    const badge = byId('mascotBadge');
    badge.textContent = result.emoji;
    badge.style.background = result.color + '22';
    renderGraph(graph);

    const strengths = byId(kids ? 'traits' : 'strengths');
    strengths.replaceChildren();
    for (const text of kids ? result.traits : result.strengths) {
      const item = document.createElement(kids ? 'span' : 'li');
      if (kids) item.className = 'trait-chip';
      item.textContent = text;
      strengths.append(item);
    }
    if (kids) {
      byId('mascotTag').textContent = result.tag;
      byId('resultDesc').textContent = result.desc;
    } else {
      byId('encourage').textContent = result.encourage;
    }
    progressFill.style.width = '100%';
    showScreen('result');
  }

  byId('startBtn').addEventListener('click', start);
  byId('retryBtn').addEventListener('click', start);
  back.addEventListener('click', () => {
    if (current === 0) return;
    current -= 1;
    renderQuestion();
  });
})();
