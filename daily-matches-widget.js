(() => {
  const INSTANCE_KEY = "__flDailyMatchesWidgetSingleton";
  const previous = window[INSTANCE_KEY];
  if (previous && typeof previous.cleanup === "function") previous.cleanup();

  const runtime = { timer: null, clickHandler: null, inputHandler: null };
  window[INSTANCE_KEY] = runtime;

  const WIDGET_ID = "daily-matches-widget";
  const SOURCES = [
    { url: "./data/full-bulletin.json", label: "Tam bülten" },
    { url: "./data/live-matches.json", label: "Canlı veri" },
    { url: "./data/fixtures.json", label: "Fikstür" }
  ];

  const state = { matches: [], source: "Veri bekleniyor", mode: "all", query: "", league: "all", selected: new Map(), analysis: null };

  const esc = (v) => String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const empty = (v) => { const t = String(v ?? "").trim(); return !t || t === "-" || t === "—" || t.toLowerCase() === "null" || t.toLowerCase() === "undefined"; };
  const read = (m, k) => m?.[k] ?? m?.available_odds?.[k] ?? m?.raw_market_guess_odds?.[k] ?? m?.odds?.[k] ?? m?.oranlar?.[k] ?? m?.detay_oranlar?.[k] ?? m?.detailOdds?.[k];
  const pick = (m, keys) => { for (const k of keys) { const v = read(m, k); if (!empty(v)) return v; } return ""; };
  const oddNum = (v) => { const f = String(v ?? "").replace(",", ".").match(/\d+(?:\.\d+)?/); const n = f ? Number(f[0]) : NaN; return Number.isFinite(n) && n > 0 ? n : null; };
  const oddText = (v) => { const n = oddNum(v); return n ? n.toFixed(2) : "—"; };
  const pct = (v) => Math.max(1, Math.min(99, Math.round(Number(v) || 0)));

  const defs = [];
  const add = (key, label, keys, group) => defs.push({ key, label, keys, group });

  add("ms1", "Maç Sonucu 1", ["ms1", "one", "oneOdd", "odd1", "ms_1"], "Ana Marketler");
  add("msx", "Maç Sonucu X", ["msx", "draw", "drawOdd", "oddX", "x", "ms_x"], "Ana Marketler");
  add("ms2", "Maç Sonucu 2", ["ms2", "two", "twoOdd", "odd2", "ms_2"], "Ana Marketler");
  add("under25", "2.5 Alt", ["under25", "alt25", "under", "alt", "under25_guess", "alt_25"], "Ana Marketler");
  add("over25", "2.5 Üst", ["over25", "ust25", "over", "ust", "over25_guess", "ust_25"], "Ana Marketler");
  add("bttsYes", "KG Var", ["bttsYes", "kgVar", "kg_var", "varOdd", "var", "bttsYes_guess"], "Ana Marketler");
  add("bttsNo", "KG Yok", ["bttsNo", "kgYok", "kg_yok", "yokOdd", "yok", "bttsNo_guess"], "Ana Marketler");

  [["hnd1", "HND 1"], ["hndX", "HND X"], ["hnd2", "HND 2"], ["hnd01", "HND 0:1"], ["hnd10", "HND 1:0"], ["hnd20", "HND 2:0"], ["hnd02", "HND 0:2"]].forEach(([k, l]) => add(k, l, [k, `${k}_guess`, k.replace("hnd", "handicap")], "Handikaplı Maç Sonucu"));
  ["0.5", "1.5", "3.5", "4.5"].forEach((line) => { const k = line.replace(".", ""); add(`under${k}`, `${line} Alt`, [`under${k}`, `alt${k}`, `under${line[0]}_5`, `alt_${k}`], "Alt / Üst"); add(`over${k}`, `${line} Üst`, [`over${k}`, `ust${k}`, `over${line[0]}_5`, `ust_${k}`], "Alt / Üst"); });
  ["1/1", "1/X", "1/2", "X/1", "X/X", "X/2", "2/1", "2/X", "2/2"].forEach((v) => add(`htFt${v.replace("/", "")}`, `İY/MS ${v}`, [`htFt${v.replace("/", "")}`, `iyMs${v.replace("/", "")}`, `halfFull${v.replace("/", "")}`], "İlk Yarı / Maç Sonucu"));
  ["1.5", "2.5", "3.5", "4.5"].forEach((line) => ["1", "X", "2"].forEach((r) => { const k = line.replace(".", ""); const ms = `ms${r.toLowerCase()}`; const p = r === "1" ? "homeWin" : r === "2" ? "awayWin" : "draw"; add(`${ms}Under${k}`, `MS ${r} + ${line} Alt`, [`${ms}Under${k}`, `${p}Under${k}`], "MS + Alt/Üst"); add(`${ms}Over${k}`, `MS ${r} + ${line} Üst`, [`${ms}Over${k}`, `${p}Over${k}`], "MS + Alt/Üst"); }));
  ["1", "X", "2"].forEach((r) => { const ms = `ms${r.toLowerCase()}`; const p = r === "1" ? "homeWin" : r === "2" ? "awayWin" : "draw"; add(`${ms}KgVar`, `MS ${r} + KG Var`, [`${ms}KgVar`, `${p}Btts`], "MS + KG"); add(`${ms}KgYok`, `MS ${r} + KG Yok`, [`${ms}KgYok`, `${p}BttsNo`], "MS + KG"); });
  [["goals01", "0-1 Gol"], ["goals23", "2-3 Gol"], ["goals45", "4-5 Gol"], ["goals6plus", "6+ Gol"]].forEach(([k, l]) => add(k, l, [k, `${k}_guess`, k.replace("goals", "goalRange")], "Toplam Gol Aralığı"));
  add("halfTimeFullScore", "İlk Yarı / Maç Skoru", ["halfTimeFullScore", "iyMacSkoru"], "Skor Marketleri");
  add("firstHalfScore", "1. Yarı Skoru", ["firstHalfScore", "iySkoru"], "Skor Marketleri");
  ["1-0", "2-0", "2-1", "0-0", "1-1", "2-2", "0-1", "0-2", "1-2", "Diğer"].forEach((s) => { const k = s.replace("-", "").replace("Diğer", "Other"); add(`correctScore${k}`, `Doğru Skor ${s}`, [`correctScore${k}`, `score${k}`], "Skor Marketleri"); });
  [["YesYes", "Evet/Evet"], ["YesNo", "Evet/Hayır"], ["NoYes", "Hayır/Evet"], ["NoNo", "Hayır/Hayır"]].forEach(([k, l]) => add(`firstSecondBtts${k}`, `1Y/2Y KG ${l}`, [`firstSecondBtts${k}`, `firstSecondBtts${k}_guess`], "1. Yarı / 2. Yarı KG"));
  [["firstHalfBttsYes", "1Y KG Var"], ["firstHalfBttsNo", "1Y KG Yok"], ["secondHalfBttsYes", "2Y KG Var"], ["secondHalfBttsNo", "2Y KG Yok"], ["mostGoalsFirstHalf", "En Çok Gol 1. Yarı"], ["mostGoalsSecondHalf", "En Çok Gol 2. Yarı"], ["mostGoalsEqual", "En Çok Gol Eşit"], ["totalOdd", "Tek"], ["totalEven", "Çift"], ["cornerOver85", "Korner 8.5 Üst"], ["cornerOver95", "Korner 9.5 Üst"], ["cardOver35", "Kart 3.5 Üst"], ["cardOver45", "Kart 4.5 Üst"], ["homeShots10", "Takım Şut Ev 10+"], ["awayShots10", "Takım Şut Dep 10+"], ["totalShots21", "Toplam Şut 21+"], ["totalShots25", "Toplam Şut 25+"]].forEach(([k, l]) => add(k, l, [k, `${k}_guess`], l.includes("Korner") ? "Korner" : l.includes("Kart") ? "Kart" : l.includes("Şut") ? "Takım Şut" : "Ek Marketler"));

  const byKey = new Map(defs.map((d) => [d.key, d]));
  const market = (m, key) => { const d = byKey.get(key); return d ? { key, label: d.label, group: d.group, value: pick(m, d.keys) } : null; };
  const mainKeys = ["ms1", "msx", "ms2", "under25", "over25", "bttsYes", "bttsNo"];

  const todayKey = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const minuteOf = (time) => { const f = String(time || "").match(/^(\d{1,2}):(\d{2})$/); return f ? Number(f[1]) * 60 + Number(f[2]) : null; };
  const statusText = (m) => String(m.status || m.liveStatus || "scheduled").toLowerCase();
  const scoreText = (m) => !empty(m.score) ? String(m.score) : (!empty(m.homeScore) || !empty(m.awayScore) ? `${m.homeScore ?? 0}-${m.awayScore ?? 0}` : "");
  const isLive = (m) => /live|canlı|canli|inplay|1h|2h|ht/.test(statusText(m)) || (!empty(m.minute) && statusText(m) !== "finished");
  const normalize = (x, i) => { const text = String(x?.match || x?.match_name || ""); const s = text.split(/\s+-\s+|\s+VS\s+/i); const m = { ...x, date: String(x?.date || x?.tarih || "").slice(0, 10), time: String(x?.time || x?.start_time || x?.saat || "--:--"), league: x?.league || x?.competition_name || x?.lig || "Diğer", home: x?.home || x?.home_team_name || x?.ev_sahibi || s[0] || "Ev sahibi", away: x?.away || x?.away_team_name || x?.deplasman || s[1] || "Deplasman" }; m._uid = String(x?._uid || x?.id || x?.match_id || x?.fixture_id || x?.matchCode || `${m.date}-${m.time}-${m.home}-${m.away}-${i}`); return m; };

  const style = () => {
    if (document.getElementById("daily-matches-widget-style")) return;
    const el = document.createElement("style");
    el.id = "daily-matches-widget-style";
    el.textContent = `.daily-widget-shell{margin:22px clamp(12px,4vw,70px);border:1px solid rgba(255,221,0,.35);border-radius:18px;background:#073d3b;color:#f6fff8;overflow:hidden}.fl-top{display:flex;justify-content:space-between;gap:10px;padding:12px 14px;background:#ffd400;color:#083b38}.fl-top h2{margin:0;font-size:18px}.fl-chip{padding:6px 9px;border-radius:999px;background:rgba(7,61,59,.12);font-size:12px;font-weight:900}.fl-controls,.fl-tabs{display:flex;gap:8px;padding:10px 14px;background:#0f5955}.fl-controls input,.fl-controls select{min-height:36px;border-radius:10px;border:0;padding:0 10px;font-weight:800}.fl-tab,.fl-refresh,.fl-slip-analyze,.fl-slip-clear{border:1px solid rgba(255,212,0,.45);border-radius:999px;background:rgba(255,255,255,.06);color:#fff;font-weight:900;padding:8px 12px;cursor:pointer}.fl-tab.active,.fl-refresh,.fl-slip-analyze{background:#ffd400;color:#073d3b}.fl-layout{display:grid;grid-template-columns:minmax(0,1fr) 310px}.fl-main{padding:12px;overflow:auto}.fl-table{min-width:980px;background:#edf8f0;color:#062d2c;border-radius:14px;overflow:hidden}.fl-head,.fl-row{display:grid;grid-template-columns:70px 125px minmax(230px,1fr) repeat(7,64px) 82px}.fl-head{background:#0a4744;color:#fff7c2;font-size:11px;font-weight:1000}.fl-head span,.fl-row>*{padding:8px;border-right:1px solid rgba(7,61,59,.13);border-bottom:1px solid rgba(7,61,59,.13);display:flex;align-items:center}.fl-league{padding:8px 10px;background:#d9efe3;font-weight:1000;color:#073d3b}.fl-row{background:#f7fff9;font-size:12px}.fl-row:nth-child(even){background:#ebf8ef}.fl-teams{display:grid;gap:3px;font-weight:950}.fl-code{font-size:10px;color:#65827c}.fl-odd,.fl-detail{width:100%;min-height:30px;border-radius:7px;border:1px solid rgba(0,100,71,.2);background:#fff;color:#083b38;font-weight:1000;cursor:pointer}.fl-odd.selected,.fl-odd:hover{background:#ffd400}.fl-empty{justify-content:center;color:#9aada6;font-weight:900}.fl-detail{background:#0f5955;color:#fff;border-radius:999px}.fl-status{flex-direction:column;justify-content:center}.fl-live{background:#e0002a;color:#fff;border-radius:999px;font-size:9px;padding:2px 6px}.fl-extra{grid-column:1/-1;background:#062d2c;color:#fff;padding:10px;border-bottom:1px solid rgba(255,255,255,.14)}.fl-extra-title{color:#ffd400;font-size:13px;font-weight:1000;margin:0 0 8px}.fl-extra-group{margin-bottom:12px}.fl-extra-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.fl-market{display:grid;gap:4px;border:1px solid rgba(255,255,255,.13);border-radius:9px;background:rgba(255,255,255,.06);padding:8px;text-align:left;color:#fff}.fl-market.has{cursor:pointer}.fl-market.has:hover{border-color:#ffd400;background:rgba(255,212,0,.14)}.fl-market.none{opacity:.42}.fl-market span{color:#b8d2ca;font-size:11px}.fl-market b{color:#ffd400;font-size:14px}.fl-slip{padding:12px;background:#092c2b;border-left:1px solid rgba(255,255,255,.12)}.fl-slip-title{color:#ffd400;font-size:16px;font-weight:1000}.fl-slip-item,.fl-analysis{margin-top:8px;padding:9px;border:1px solid rgba(255,255,255,.14);border-radius:10px;background:rgba(255,255,255,.05)}.fl-slip-market{display:flex;justify-content:space-between;gap:8px;color:#ffd400;font-weight:1000}.fl-remove{background:transparent;border:0;color:#ffb7a8;font-weight:1000;cursor:pointer}.fl-summary{display:grid;gap:8px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.14)}.fl-row2{display:flex;justify-content:space-between;color:#b8d2ca}.fl-row2 b{color:#ffd400}.fl-emptybox{padding:14px;border:1px dashed rgba(255,255,255,.22);border-radius:10px;text-align:center;color:#b8d2ca}@media(max-width:980px){.fl-layout{grid-template-columns:1fr}.fl-slip{border-left:0;border-top:1px solid rgba(255,255,255,.12)}.fl-extra-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.fl-extra-grid{grid-template-columns:1fr}}`;
    document.head.appendChild(el);
  };

  const ensure = () => {
    let root = document.getElementById(WIDGET_ID);
    if (!root) { root = document.createElement("section"); root.id = WIDGET_ID; (document.querySelector("main") || document.body).prepend(root); }
    root.className = "daily-widget-shell";
    root.innerHTML = `<div class="fl-top"><div><h2>Futbol Bülteni</h2><div data-sub>Detay marketleri açılıyor.</div></div><div><span class="fl-chip" data-source>Veri</span> <span class="fl-chip" data-count>0 maç</span></div></div><div class="fl-tabs"><button class="fl-tab active" data-mode="all">Tüm Bülten</button><button class="fl-tab" data-mode="live">Canlı</button></div><div class="fl-controls"><input data-search placeholder="Maç / lig ara"><select data-league><option value="all">Tüm Ligler</option></select><button class="fl-refresh" data-refresh>Yenile</button></div><div class="fl-layout"><main class="fl-main" data-main></main><aside class="fl-slip" data-slip></aside></div>`;
    return root;
  };

  const load = async () => {
    for (const src of SOURCES) {
      try {
        const res = await fetch(`${src.url}?v=${Date.now()}`, { cache: "no-store" });
        if (!res.ok) continue;
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.matches || data.fixtures || data.items || []);
        if (Array.isArray(list) && list.length) {
          state.matches = list.map(normalize);
          state.source = src.label;
          render();
          return;
        }
      } catch {}
    }
    state.matches = [];
    render();
  };

  const visible = () => state.matches.filter((m) => {
    if (state.mode === "live" && !isLive(m)) return false;
    if (state.league !== "all" && m.league !== state.league) return false;
    const q = state.query.trim().toLowerCase();
    return !q || `${m.home} ${m.away} ${m.league}`.toLowerCase().includes(q);
  });

  const renderOdd = (m, key) => {
    const opt = market(m, key);
    if (!opt || empty(opt.value)) return `<span class="fl-empty">-</span>`;
    const id = `${m._uid}|${key}`;
    const selected = state.selected.get(m._uid)?.key === key ? " selected" : "";
    return `<button class="fl-odd${selected}" data-select="1" data-uid="${esc(m._uid)}" data-key="${esc(key)}">${esc(opt.value)}</button>`;
  };

  const detailHtml = (m) => {
    const groups = new Map();
    defs.forEach((d) => { if (!groups.has(d.group)) groups.set(d.group, []); groups.get(d.group).push(d); });
    return `<div class="fl-extra"><div class="fl-extra-title">Detaylı Oranlar</div>${[...groups.entries()].map(([group, list]) => `<div class="fl-extra-group"><div class="fl-extra-title">${esc(group)}</div><div class="fl-extra-grid">${list.map((d) => { const v = pick(m, d.keys); const has = !empty(v); return `<button class="fl-market ${has ? "has" : "none"}" ${has ? `data-select="1" data-uid="${esc(m._uid)}" data-key="${esc(d.key)}"` : "disabled"}><span>${esc(d.label)}</span><b>${has ? esc(v) : "Veri yok"}</b></button>`; }).join("")}</div></div>`).join("")}</div>`;
  };

  const renderMain = () => {
    const rows = visible();
    const main = document.querySelector("[data-main]");
    const leagues = [...new Set(state.matches.map((m) => m.league).filter(Boolean))].sort((a, b) => a.localeCompare(b, "tr"));
    const select = document.querySelector("[data-league]");
    select.innerHTML = `<option value="all">Tüm Ligler</option>${leagues.map((l) => `<option value="${esc(l)}" ${state.league === l ? "selected" : ""}>${esc(l)}</option>`).join("")}`;
    document.querySelector("[data-source]").textContent = state.source;
    document.querySelector("[data-count]").textContent = `${rows.length} maç`;
    if (!rows.length) { main.innerHTML = `<div class="fl-emptybox">Gösterilecek maç yok.</div>`; return; }
    let html = `<div class="fl-table"><div class="fl-head"><span>Saat</span><span>Lig</span><span>Maç</span><span>1</span><span>X</span><span>2</span><span>Alt</span><span>Üst</span><span>Var</span><span>Yok</span><span>Detay</span></div>`;
    let last = "";
    rows.forEach((m) => {
      if (m.league !== last) { last = m.league; html += `<div class="fl-league">${esc(last)}</div>`; }
      html += `<div class="fl-row"><div class="fl-status">${isLive(m) ? `<span class="fl-live">CANLI</span><b>${esc(m.minute || "")}'</b><small>${esc(scoreText(m))}</small>` : `<b>${esc(m.time)}</b>`}</div><div>${esc(m.league)}</div><div class="fl-teams"><span>${esc(m.home)}</span><span>${esc(m.away)}</span><span class="fl-code">${esc(m.date)} · ${esc(m.status || "scheduled")}</span></div>${mainKeys.map((k) => `<div>${renderOdd(m, k)}</div>`).join("")}<div><button class="fl-detail" data-detail="${esc(m._uid)}">Detay</button></div></div>`;
      if (m._open) html += detailHtml(m);
    });
    main.innerHTML = html + `</div>`;
  };

  const renderSlip = () => {
    const slip = document.querySelector("[data-slip]");
    const picks = [...state.selected.values()];
    const odds = picks.map((p) => oddNum(p.value)).filter(Boolean);
    const total = odds.length === picks.length && odds.length ? odds.reduce((a, b) => a * b, 1) : null;
    slip.innerHTML = `<div class="fl-slip-title">Kuponum</div>` + (picks.length ? `${picks.map((p) => `<div class="fl-slip-item"><div>${esc(p.home)} - ${esc(p.away)}</div><div class="fl-slip-market"><span>${esc(p.label)}</span><b>${esc(p.value)}</b><button class="fl-remove" data-remove="${esc(p.uid)}">Sil</button></div></div>`).join("")}<div class="fl-summary"><div class="fl-row2"><span>Toplam Oran</span><b>${esc(formatOdd(total))}</b></div><button class="fl-slip-analyze" data-analyze>Analiz Et</button><button class="fl-slip-clear" data-clear>Temizle</button></div>${state.analysis || ""}` : `<div class="fl-emptybox">Market seçince burada görünecek.</div>`);
  };

  const selectMarket = (uid, key) => {
    const m = state.matches.find((x) => x._uid === uid);
    const opt = market(m, key);
    if (!m || !opt || empty(opt.value)) return;
    const old = state.selected.get(uid);
    if (old?.key === key) state.selected.delete(uid);
    else state.selected.set(uid, { uid, key, label: opt.label, value: opt.value, home: m.home, away: m.away, group: opt.group });
    state.analysis = null;
    renderMain();
    renderSlip();
  };

  const analyze = () => {
    const picks = [...state.selected.values()];
    if (!picks.length) return;
    const scores = picks.map((p) => { const o = oddNum(p.value); const base = o ? 100 / o : 45; const risk = /Skor|Handikap|İlk Yarı|Korner|Kart|Şut/.test(p.group) ? -8 : 4; return pct(base + risk); });
    const avg = pct(scores.reduce((a, b) => a + b, 0) / scores.length);
    state.analysis = `<div class="fl-analysis"><strong>Robot Analizi</strong><div class="fl-row2"><span>Ortalama Skor</span><b>%${avg}</b></div><p>Seçilen detay marketleri Pro 12.2 mantığıyla okundu.</p>${picks.map((p, i) => `<div>${esc(p.label)} · ${esc(p.value)} · %${scores[i]}</div>`).join("")}</div>`;
    renderSlip();
  };

  const render = () => { ensure(); style(); renderMain(); renderSlip(); };

  runtime.clickHandler = (e) => {
    const detail = e.target.closest("[data-detail]");
    if (detail) { const m = state.matches.find((x) => x._uid === detail.dataset.detail); if (m) m._open = !m._open; renderMain(); return; }
    const sel = e.target.closest("[data-select]");
    if (sel) { selectMarket(sel.dataset.uid, sel.dataset.key); return; }
    const rem = e.target.closest("[data-remove]");
    if (rem) { state.selected.delete(rem.dataset.remove); renderMain(); renderSlip(); return; }
    if (e.target.closest("[data-clear]")) { state.selected.clear(); state.analysis = null; renderMain(); renderSlip(); return; }
    if (e.target.closest("[data-analyze]")) { analyze(); return; }
    const mode = e.target.closest("[data-mode]");
    if (mode) { state.mode = mode.dataset.mode; document.querySelectorAll("[data-mode]").forEach((b) => b.classList.toggle("active", b === mode)); renderMain(); return; }
    if (e.target.closest("[data-refresh]")) load();
  };
  runtime.inputHandler = (e) => { if (e.target.matches("[data-search]")) { state.query = e.target.value; renderMain(); } if (e.target.matches("[data-league]")) { state.league = e.target.value; renderMain(); } };
  runtime.cleanup = () => { document.removeEventListener("click", runtime.clickHandler); document.removeEventListener("input", runtime.inputHandler); document.removeEventListener("change", runtime.inputHandler); if (runtime.timer) clearInterval(runtime.timer); };

  document.addEventListener("click", runtime.clickHandler);
  document.addEventListener("input", runtime.inputHandler);
  document.addEventListener("change", runtime.inputHandler);
  render();
  load();
  runtime.timer = setInterval(load, 300000);
})();