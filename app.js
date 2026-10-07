(() => {
  const QUESTIONS = window.BALANCE_QUESTIONS || [];

  const $ = (id) => document.getElementById(id);
  const screens = { start: $("start"), game: $("game"), end: $("end") };
  const btnA = document.querySelector(".choice.a");
  const btnB = document.querySelector(".choice.b");

  let order = [];
  let index = 0;
  let picks = []; // [{ q, pick }]

  function shuffle(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function show(name) {
    for (const [key, el] of Object.entries(screens)) el.hidden = key !== name;
    $("progress").textContent = name === "game" ? `${index + 1} / ${order.length}` : "";
  }

  function start() {
    order = shuffle(QUESTIONS);
    index = 0;
    picks = [];
    renderQuestion();
    show("game");
  }

  function renderQuestion() {
    const q = order[index];
    $("label-a").textContent = q.a;
    $("label-b").textContent = q.b;
    for (const btn of [btnA, btnB]) {
      btn.disabled = false;
      btn.classList.remove("picked");
    }
    $("next-btn").hidden = true;
    $("progress").textContent = `${index + 1} / ${order.length}`;
  }

  function choose(pick) {
    picks.push({ q: order[index], pick });
    btnA.disabled = btnB.disabled = true;
    (pick === "a" ? btnA : btnB).classList.add("picked");

    $("next-btn").textContent = index === order.length - 1 ? "내 선택 보기 →" : "다음 질문 →";
    $("next-btn").hidden = false;
    $("next-btn").focus();
  }

  function renderSummary() {
    const list = $("summary");
    list.replaceChildren(
      ...picks.map(({ q, pick }) => {
        const li = document.createElement("li");
        const chosen = document.createElement("strong");
        chosen.className = pick;
        chosen.textContent = pick === "a" ? q.a : q.b;
        const other = document.createElement("span");
        other.textContent = `vs ${pick === "a" ? q.b : q.a}`;
        li.append(chosen, other);
        return li;
      })
    );
  }

  function next() {
    index += 1;
    if (index < order.length) {
      renderQuestion();
    } else {
      renderSummary();
      show("end");
    }
  }

  btnA.addEventListener("click", () => choose("a"));
  btnB.addEventListener("click", () => choose("b"));
  $("start-btn").addEventListener("click", start);
  $("next-btn").addEventListener("click", next);
  $("restart-btn").addEventListener("click", start);
})();
