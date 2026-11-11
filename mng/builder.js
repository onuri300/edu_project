(() => {
  "use strict";
  const $ = s => document.querySelector(s);
  const ITER = 250000;
  const b64e = b => btoa(String.fromCharCode(...new Uint8Array(b)));
  const { decodeBase64, deriveKey } = window.eduMenuCrypto;

  /* ---------- 편집 UI ---------- */
  const cats = $("#cats");

  function itemRow(name = "", url = "") {
    const d = document.createElement("div");
    d.className = "item";
    const n = document.createElement("input"); n.type = "text"; n.placeholder = "메뉴 이름"; n.value = name; n.dataset.f = "name";
    const u = document.createElement("input"); u.type = "text"; u.placeholder = "https://"; u.value = window.eduAuth.canonicalMenuUrl(url); u.dataset.f = "url"; u.spellcheck = false;
    const x = document.createElement("button"); x.className = "x"; x.type = "button"; x.textContent = "×"; x.title = "삭제";
    x.onclick = () => d.remove();
    d.append(n, u, x);
    return d;
  }

  function catBlock(name = "", items = []) {
    const c = document.createElement("div");
    c.className = "cat";

    const head = document.createElement("div");
    head.className = "cat-head";
    const box = document.createElement("div");
    const lab = document.createElement("label"); lab.textContent = "분류 이름";
    const inp = document.createElement("input"); inp.type = "text"; inp.value = name; inp.dataset.f = "catname";
    box.append(lab, inp);
    const del = document.createElement("button"); del.className = "x"; del.type = "button"; del.textContent = "×"; del.title = "분류 삭제";
    del.onclick = () => c.remove();
    head.append(box, del);

    const list = document.createElement("div");
    list.className = "items";
    (items.length ? items : [{}]).forEach(it => list.append(itemRow(it.name || "", it.url || "")));

    const add = document.createElement("button");
    add.className = "add"; add.type = "button"; add.textContent = "+ 메뉴 추가";
    add.onclick = () => list.append(itemRow());

    c.append(head, list, add);
    return c;
  }

  function seed() {
    cats.textContent = "";
    const defaults = [
      { name: "바이브코딩", items: [
        { name: "온유 메이커", url: "./vi_vibe/vi_onuri/vi_onuri.html" },
        { name: "경남대학교 메이커스페이스", url: "./vi_vibe/vi_knu.html" },
      ] },
      { name: "게임", items: [
        { name: "사다리 게임", url: "./ga_games/ga_ladder.html" },
        { name: "컴퓨터 플래시카드", url: "./ga_games/ga_cards.html" },
        { name: "컴퓨터 탐험 퀴즈", url: "./ga_games/ga_quiz.html" },
        { name: "성인 MBTI 테스트", url: "./ga_games/ga_mbti-a.html" },
        { name: "어린이 MBTI 테스트", url: "./ga_games/ga_mbti-k.html" },
      ] },
      { name: "수업 자료실", items: [
        { name: "리빙랩 수업 자료실", url: "./cl_class/cl_library.html" },
        { name: "edumaker", url: "./cl_class/cl_edumkr.html" },
      ] },
      { name: "기타", items: [
        { name: "Announcements", url: "./mo_tools/mo_notice.html" },
        { name: "GPT Making Manual", url: "./mo_tools/mo_manual.html" },
        { name: "Coding Manual", url: "./mo_tools/mo_coding.html" },
      ] },
    ];
    defaults.forEach(cat => cats.append(catBlock(cat.name, cat.items)));
  }
  seed();
  $("#addCat").onclick = () => cats.append(catBlock("새 분류", [{}]));

  function collect() {
    const out = [];
    cats.querySelectorAll(".cat").forEach(c => {
      const name = c.querySelector('[data-f="catname"]').value.trim();
      const items = [];
      c.querySelectorAll(".item").forEach(r => {
        const n = r.querySelector('[data-f="name"]').value.trim();
        let u = window.eduAuth.canonicalMenuUrl(r.querySelector('[data-f="url"]').value.trim());
        if (!n && !u) return;
        if (u && !/^(https?:|\/|\.)/i.test(u)) u = "https://" + u;
        items.push({ name: n || "이름 없음", url: u });
      });
      if (name || items.length) out.push({ name: name || "이름 없는 분류", items });
    });
    return out;
  }

  function fill(data) {
    $("#title").value = data.title || "";
    $("#subtitle").value = data.subtitle || "";
    cats.textContent = "";
    (data.cats || []).forEach(c => cats.append(catBlock(c.name, c.items)));
  }

  /* ---------- 생성 ---------- */
  const out = $("#out");
  const say = (t, cls) => { out.textContent = t; out.className = "out " + (cls || ""); };

  $("#make").onclick = async () => {
    const id = $("#id").value.trim(), pw = $("#pw").value, pw2 = $("#pw2").value;
    if (!id) return say("아이디를 입력하세요.", "bad");
    if (pw.length < 4) return say("비밀번호를 4자 이상 입력하세요.", "bad");
    if (pw !== pw2) return say("두 비밀번호가 서로 다릅니다.", "bad");
    const list = collect();
    if (!list.length) return say("메뉴를 하나 이상 추가하세요.", "bad");

    const btn = $("#make"); btn.disabled = true; say("암호화하는 중…");
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const key = await deriveKey(id, pw, salt, ITER, ["encrypt"]);
      const plain = new TextEncoder().encode(JSON.stringify({
        title: $("#title").value.trim() || "자료실",
        subtitle: $("#subtitle").value.trim(),
        cats: list
      }));
      const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain);
      const payload = { v: 1, it: ITER, salt: b64e(salt), iv: b64e(iv), ct: b64e(ct) };
      const js = "window.__ENC__=" + JSON.stringify(payload) + ";\n";

      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([js], { type: "text/javascript" }));
      a.download = "data.enc.js";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      say("data.enc.js 를 내려받았습니다. 프로젝트 루트의 common/data 폴더의 기존 파일을 교체하세요.", "ok");
    } catch (e) {
      say("암호화에 실패했습니다: " + e.message, "bad");
    } finally { btn.disabled = false; }
  };

  /* ---------- 불러오기 ---------- */
  $("#loadBtn").onclick = () => $("#file").click();
  $("#file").onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    const id = $("#id").value.trim(), pw = $("#pw").value;
    if (!id || !pw) return say("먼저 기존 아이디와 비밀번호를 입력한 뒤 불러오세요.", "bad");
    try {
      const txt = await f.text();
      const m = txt.match(/window\.__ENC__\s*=\s*(\{[\s\S]*\})\s*;?/);
      if (!m) throw new Error("형식을 알 수 없는 파일입니다");
      const p = JSON.parse(m[1]);
      const key = await deriveKey(id, pw, decodeBase64(p.salt), p.it);
      const buf = await crypto.subtle.decrypt({ name: "AES-GCM", iv: decodeBase64(p.iv) }, key, decodeBase64(p.ct));
      fill(JSON.parse(new TextDecoder().decode(buf)));
      $("#pw2").value = pw;
      say("불러왔습니다. 수정한 뒤 다시 내려받으세요.", "ok");
    } catch (err) {
      say("불러오지 못했습니다. 아이디·비밀번호가 기존 파일과 같은지 확인하세요.", "bad");
    } finally { e.target.value = ""; }
  };
})();
