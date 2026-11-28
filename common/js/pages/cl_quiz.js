(()=>{
const $ = id => document.getElementById(id);
let storageUnavailable = false;
let s = { count: 10, difficulty: "1", theme: "light" };
try {
  s = { ...s, ...JSON.parse(readLocal("quizSettings")) };
} catch {}
let quiz = [], idx = 0, score = 0, graded = 0, totalAnswers = 0, answered = false;
const savedLevels = new Map([["하", "1"], ["중", "2"], ["상", "3"]]);
s.difficulty = savedLevels.get(s.difficulty) ?? s.difficulty;
const levelLabel = difficulty => `${difficulty}단계`;
const pool=d=>d==="전체"?QUESTION_BANK:QUESTION_BANK.filter(q=>q.difficulty===d);const shuffle=a=>{a=[...a];for(let i=a.length-1;i;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function save(){writeLocal("quizSettings", JSON.stringify(s))}
function home(){show("home");sync()}
function show(id) {
  document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
  const screen = $(id);
  screen.classList.add("active");
  if (id === "home") window.scrollTo(0, 0);
  else screen.scrollIntoView({ block: "start" });
}
const historyPrefix = "computerQuizHistory:";
const gradeSelectionKey = "computerQuizGrade";
const inSessionHistory = new Map();
let activeGrade;

function readLocal(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    storageUnavailable = true;
    return null;
  }
}

function writeLocal(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    storageUnavailable = true;
  }
}

function gradeHistory(grade) {
  let stored;
  try {
    stored = JSON.parse(readLocal(historyPrefix + grade));
  } catch {
    stored = null;
  }
  return new Set([...(Array.isArray(stored) ? stored : []), ...(inSessionHistory.get(grade) ?? [])]);
}

function recordAttempt(question) {
  const history = gradeHistory(activeGrade);
  if (history.has(question.id)) return;
  history.add(question.id);
  inSessionHistory.set(activeGrade, history);
  writeLocal(historyPrefix + activeGrade, JSON.stringify([...history]));
}

function sync() {
  const grade = $("quizGrade").value;
  const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
  const questions = pool(difficulty);
  const played = grade ? gradeHistory(grade) : new Set();
  const available = questions.filter(question => !played.has(question.id));
  const count = $("countInput");
  count.max = grade ? available.length : questions.length;
  count.disabled = Boolean(grade && !available.length);
  if (!count.disabled && +count.value > count.max) count.value = count.max;
  $("startBtn").disabled = !grade || !available.length;
  $("retry").disabled = !grade || !available.length;
  $("retryNote").textContent = grade && !available.length
    ? "이 학년에서 선택한 난이도의 문제를 모두 풀었어요."
    : "";
  const progress = available.length
    ? `선택한 난이도에서 푼 문제 ${questions.length - available.length}개 · 남은 문제 ${available.length}개`
    : $("retryNote").textContent;
  $("limitNote").textContent = grade
    ? progress + (storageUnavailable ? " 이 브라우저에서 저장이 제한되어 현재 화면에서만 이력이 유지돼요." : "")
    : "학교급과 학년을 선택하면 남은 문제가 표시돼요.";

  const history = [...played].reverse().flatMap(id => {
    const question = QUESTION_BANK.find(entry => entry.id === id);
    if (!question) return [];
    const item = document.createElement("li");
    item.textContent = `${levelLabel(question.difficulty)} · Q.${id} ${question.question}`;
    return [item];
  });
  $("quizHistory").hidden = !grade;
  $("historySummary").textContent = `이 학년의 문항 이력 (${history.length}문제)`;
  if (!history.length) {
    const item = document.createElement("li");
    item.textContent = "아직 푼 문제가 없어요.";
    history.push(item);
  }
  $("historyList").replaceChildren(...history);
  return available;
}

function start() {
  const available = sync();
  const count = Number($("countInput").value);
  if ($("startBtn").disabled) return;
  if (!Number.isInteger(count) || count < 1 || count > available.length) {
    $("countInput").reportValidity();
    return;
  }
  activeGrade = $("quizGrade").value;
  quiz = shuffle(available).slice(0, count);
  idx = 0;
  score = 0;
  graded = 0;
  totalAnswers = quiz.reduce((total, question) => total + (question.matches?.length ?? 1), 0);
  show("quiz");
  render();
}
function renderScore() {
  $("score").textContent = score;
  $("scoreWrong").textContent = graded - score;
  $("scorePercent").textContent = window.eduUI.roundedPercent(score, graded) + "%";
}
function render() {
  const question = quiz[idx];
  answered = false;
  $("progress").textContent = `${idx + 1} / ${quiz.length}`;
  renderScore();
  $("bar").style.width = `${(idx + 1) / quiz.length * 100}%`;
  $("badge").textContent = levelLabel(question.difficulty);
  $("qid").textContent = `Q.${question.id}`;
  $("question").textContent = question.question;
  $("hint").className = "hint hidden";
  $("feedback").className = "feedback hidden";
  $("nextBtn").disabled = true;
  $("nextBtn").textContent = idx === quiz.length - 1 ? "결과 보기 →" : "다음 문제 →";

  const matching = Boolean(question.matches);
  $("matching").hidden = !matching;
  $("options").hidden = matching;
  if (matching) {
    $("options").replaceChildren();
    $("nextBtn").disabled = false;
    renderMatching(question);
    return;
  }

  const choices = shuffle(question.options.map((label, index) => ({ label, index })));
  $("options").replaceChildren(...choices.map(({ label, index }, position) => {
    const button = document.createElement("button");
    button.className = "option";
    button.type = "button";
    button.dataset.choice = index;

    const letter = document.createElement("span");
    letter.className = "option-letter";
    letter.textContent = String.fromCharCode(65 + position);
    button.append(letter);

    const text = document.createElement("span");
    text.textContent = label;
    button.append(text);
    button.onclick = () => answer(index, button);
    return button;
  }));
}
function renderMatching({ matches, atlasColumns = 4, atlasClass }) {
  const words = $("matchWords");
  const pictures = $("matchPictures");
  const lines = $("matchLines");
  lines.replaceChildren();
  $("matchStatus").textContent = "낱말과 그림을 차례로 누르세요. 연결한 낱말이나 그림을 다시 누르면 선이 지워져요.";

  const missed = new Set();
  const connections = new Map();
  let selected;
  const firstPicture = () => pictures.querySelector("button:not([data-connected])");

  function disconnect(entry) {
    const { word, picture, line } = connections.get(entry);
    line.remove();
    for (const button of [word, picture]) {
      delete button.dataset.connected;
      button.setAttribute("aria-pressed", "false");
    }
    connections.delete(entry);
    graded--;
    if (!missed.has(entry)) score--;
    renderScore();
    $("matchStatus").textContent = `‘${entry.word}’ 연결을 지웠어요.`;
  }

  words.replaceChildren(...matches.map((entry, row) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = entry.word;
    button.setAttribute("aria-pressed", "false");
    button.onclick = () => {
      if (connections.has(entry)) {
        disconnect(entry);
        return;
      }
      if (selected?.entry === entry) {
        button.setAttribute("aria-pressed", "false");
        selected = undefined;
        $("matchStatus").textContent = "선택을 취소했어요. 낱말을 다시 골라 주세요.";
        return;
      }
      selected?.button.setAttribute("aria-pressed", "false");
      selected = { entry, row, button };
      button.setAttribute("aria-pressed", "true");
      $("matchStatus").textContent = `‘${entry.word}’에 어울리는 그림을 찾아보세요.`;
      firstPicture()?.focus({ preventScroll: true });
    };
    return button;
  }));

  const shuffled = shuffle(matches);
  if (shuffled.every((entry, row) => entry === matches[row])) shuffled.push(shuffled.shift());
  pictures.replaceChildren(...shuffled.map((entry, row) => {
    const button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-pressed", "false");
    const art = document.createElement("span");
    art.className = "match-art";
    art.setAttribute("aria-hidden", "true");
    art.style.backgroundPosition = `${entry.tile % atlasColumns / (atlasColumns - 1) * 100}% ${Math.floor(entry.tile / atlasColumns) / 3 * 100}%`;
    if (atlasClass) art.classList.add(atlasClass);
    const description = document.createElement("span");
    description.className = "match-description";
    description.textContent = entry.description;
    button.append(art, description);
    button.onclick = () => {
      if (connections.has(entry)) {
        disconnect(entry);
        return;
      }
      if (!selected) {
        $("matchStatus").textContent = "왼쪽 낱말을 먼저 골라 주세요.";
        words.querySelector("button:not([data-connected])")?.focus({ preventScroll: true });
        return;
      }
      recordAttempt(quiz[idx]);
      if (selected.entry !== entry) {
        missed.add(selected.entry);
        $("matchStatus").textContent = "다른 그림을 골라 보세요.";
        return;
      }
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", "0");
      line.setAttribute("y1", (selected.row + 0.5) * 25);
      line.setAttribute("x2", "100");
      line.setAttribute("y2", (row + 0.5) * 25);
      lines.append(line);
      connections.set(entry, { word: selected.button, picture: button, line });
      for (const choice of [selected.button, button]) {
        choice.dataset.connected = "";
        choice.setAttribute("aria-pressed", "true");
      }
      selected = undefined;

      graded++;
      if (!missed.has(entry)) score++;
      renderScore();
      const complete = connections.size === matches.length;
      const progress = complete ? "네 쌍을 모두 이었어요!" : `${connections.size}/${matches.length}쌍 연결.`;
      $("matchStatus").textContent = `${progress} ${entry.word} — ${entry.explanation}`;
      if (complete) $("nextBtn").focus({ preventScroll: true });
      else words.querySelector("button:not([data-connected])")?.focus({ preventScroll: true });
    };
    return button;
  }));
}
function answer(choice, clicked) {
  if (answered) return;
  answered = true;
  graded++;
  const question = quiz[idx];
  recordAttempt(question);
  const correct = choice === question.answer;
  $("options").querySelector(`[data-choice="${question.answer}"]`).classList.add("correct");
  if (correct) score++;
  else clicked.classList.add("wrong");
  $("feedback").textContent = (correct ? "✓ 정답이에요! " : "○ 아쉬워요. ") + question.explanation;
  $("feedback").className = "feedback";
  renderScore();
  $("nextBtn").disabled = false;
}
$("nextBtn").onclick = () => {
  const question = quiz[idx];
  if (!question.matches && !answered) return;
  if (question.matches) {
    graded += question.matches.length - $("matchLines").childElementCount;
    renderScore();
  }
  if (idx < quiz.length - 1) {
    idx++;
    render();
  } else {
    result();
    sync();
  }
};
function result(){let pct=window.eduUI.roundedPercent(score, totalAnswers);$("finalScore").textContent=pct;$("correct").textContent=score;$("total").textContent=totalAnswers;$("percent").textContent=pct+"%";$("resultMsg").textContent=pct===100?"100점! 완벽한 탐험이에요.":pct>=80?"멋진 결과예요! 조금 더 알아보면 더 강해질 수 있어요.":pct>=60?"좋아요! 틀린 문제를 다시 살펴보세요.":"괜찮아요. 다시 도전하며 하나씩 알아가면 됩니다.";show("result")}
$("hintBtn").onclick=()=>{$("hint").textContent="💡 힌트: "+quiz[idx].hint;$("hint").className="hint"};
$("startBtn").onclick=start;$("retry").onclick=start;$("homeBtn").onclick=e=>{e.preventDefault();home()};$("resultHome").onclick=home;document.querySelectorAll('input[name="difficulty"]').forEach(x=>x.onchange=sync);
window.eduGameAdmin.bindGameAdmin(() => {
  $("st").textContent = QUESTION_BANK.length;
  $("se").textContent = pool("1").length;
  $("sm").textContent = pool("2").length;
  $("sh").textContent = pool("3").length;
  $("adminCount").value = s.count;
  $("adminDifficulty").value = s.difficulty;
});
$("saveAdmin").onclick=()=>{let d=$("adminDifficulty").value,n=Math.min(+$("adminCount").value||10,pool(d).length);s={...s,count:Math.max(1,n),difficulty:d};save();document.querySelector(`input[name="difficulty"][value="${d}"]`).checked=true;$("countInput").value=s.count;sync();$("saved").classList.remove("hidden");setTimeout(()=>$("saved").classList.add("hidden"),1500)};
let r=document.querySelector(`input[name="difficulty"][value="${s.difficulty}"]`);if(r)r.checked=true;$("countInput").value=s.count;
$("quizGrade").value = readLocal(gradeSelectionKey) ?? "";
$("quizGrade").onchange = () => {
  writeLocal(gradeSelectionKey, $("quizGrade").value);
  sync();
};
window.addEventListener("storage", event => {
  if (event.key === null || event.key === historyPrefix + $("quizGrade").value) sync();
});
sync();
})()
