(() => {
  const { SUPABASE_URL, SUPABASE_KEY } = window.BALANCE_CONFIG || {};
  const QUESTIONS = window.BALANCE_QUESTIONS || [];
  const ONLINE = Boolean(SUPABASE_URL && SUPABASE_KEY);
  const API = ONLINE ? SUPABASE_URL.replace(/\/+$/, "") + "/rest/v1" : "";

  const $ = (id) => document.getElementById(id);
  const screens = { start: $("start"), game: $("game"), end: $("end") };
  const btnA = document.querySelector(".choice.a");
  const btnB = document.querySelector(".choice.b");

  // ---- 브라우저 저장소 (막혀 있어도 게임은 동작하도록 try/catch) ----
  const store = {
    get(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
    },
  };
  // 이미 투표한 질문: { [questionId]: "a" | "b" } — 같은 사람이 같은 질문에 여러 번 투표하지 않게
  const myPicks = store.get("balance.myPicks", {});

  // ---- 집계 API ----
  async function supabase(path, options = {}) {
    const res = await fetch(API + path, {
      ...options,
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json", ...options.headers },
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    return res.json();
  }

  async function castVote(qid, pick) {
    if (!ONLINE) {
      const demo = store.get("balance.demoCounts", {});
      const c = demo[qid] || { a: 0, b: 0 };
      c[pick] += 1;
      demo[qid] = c;
      store.set("balance.demoCounts", demo);
      return c;
    }
    const rows = await supabase("/rpc/cast_vote", {
      method: "POST",
      body: JSON.stringify({ qid, pick }),
    });
    const row = rows[0] || { out_a: 0, out_b: 0 };
    return { a: Number(row.out_a), b: Number(row.out_b) };
  }

  async function getCounts(qid) {
    if (!ONLINE) {
      return store.get("balance.demoCounts", {})[qid] || { a: 0, b: 0 };
    }
    const rows = await supabase(`/balance_votes?question_id=eq.${qid}&select=a_count,b_count`);
    const row = rows[0] || { a_count: 0, b_count: 0 };
    return { a: Number(row.a_count), b: Number(row.b_count) };
  }

  // ---- 게임 진행 ----
  let order = [];
  let index = 0;
  let majorityCount = 0; // 다수파를 고른 횟수

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
    majorityCount = 0;
    renderQuestion();
    show("game");
  }

  function resetChoice(btn) {
    btn.disabled = false;
    btn.classList.remove("picked");
    btn.querySelector(".bar").style.width = "0";
    btn.querySelector(".result").textContent = "";
  }

  function renderQuestion() {
    const q = order[index];
    $("label-a").textContent = q.a;
    $("label-b").textContent = q.b;
    resetChoice(btnA);
    resetChoice(btnB);
    $("status").textContent = "";
    $("next-btn").hidden = true;
    $("progress").textContent = `${index + 1} / ${order.length}`;
  }

  function showResult(pick, counts) {
    const total = counts.a + counts.b;
    const pctA = total ? Math.round((counts.a / total) * 100) : 0;
    const pctB = total ? 100 - pctA : 0;

    btnA.querySelector(".bar").style.width = pctA + "%";
    btnB.querySelector(".bar").style.width = pctB + "%";
    $("result-a").textContent = `${pctA}% · ${counts.a.toLocaleString()}명`;
    $("result-b").textContent = `${pctB}% · ${counts.b.toLocaleString()}명`;
    (pick === "a" ? btnA : btnB).classList.add("picked");

    const mine = pick === "a" ? pctA : pctB;
    if (mine > 50) majorityCount += 1;
    $("status").textContent =
      mine > 50 ? `${mine}%와 같은 선택! 다수파예요.`
      : mine < 50 ? `${mine}%만 고른 선택. 소수파예요!`
      : "정확히 반반이에요.";

    $("next-btn").textContent = index === order.length - 1 ? "결과 보기 →" : "다음 질문 →";
    $("next-btn").hidden = false;
    $("next-btn").focus();
  }

  async function choose(pick) {
    const q = order[index];
    btnA.disabled = btnB.disabled = true;
    $("status").textContent = "집계 중…";

    try {
      const already = myPicks[q.id];
      let counts;
      if (already) {
        // 예전에 투표한 질문이면 다시 올리지 않고, 그때 고른 쪽으로 결과만 보여줌
        counts = await getCounts(q.id);
        pick = already;
      } else {
        counts = await castVote(q.id, pick);
        myPicks[q.id] = pick;
        store.set("balance.myPicks", myPicks);
      }
      showResult(pick, counts);
      if (already) $("status").textContent += " (예전에 고른 답이에요)";
    } catch (err) {
      console.error(err);
      btnA.disabled = btnB.disabled = false;
      $("status").textContent = "집계 서버에 연결하지 못했어요. 잠시 후 다시 눌러주세요.";
    }
  }

  function next() {
    index += 1;
    if (index < order.length) {
      renderQuestion();
    } else {
      $("summary").textContent =
        `${order.length}개 질문 중 ${majorityCount}개에서 다수파를 골랐어요.`;
      show("end");
    }
  }

  btnA.addEventListener("click", () => choose("a"));
  btnB.addEventListener("click", () => choose("b"));
  $("start-btn").addEventListener("click", start);
  $("next-btn").addEventListener("click", next);
  $("restart-btn").addEventListener("click", start);

  if (!ONLINE) {
    $("mode-note").textContent =
      "데모 모드: config.js에 Supabase 정보를 넣기 전까지는 이 브라우저 안에서만 집계돼요.";
  }
})();
