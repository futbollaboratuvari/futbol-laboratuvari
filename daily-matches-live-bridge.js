(() => {
  const LIVE_URL = "./data/live-matches.json";
  const FIXTURES_URL = "./data/fixtures.json";
  const WIDGET_ID = "daily-matches-widget";
  const STYLE_ID = "daily-matches-live-bridge-style";

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const readJson = async (url, fallback) => {
    try {
      const response = await fetch(`${url}?ts=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error(response.statusText);
      return await response.json();
    } catch {
      return fallback;
    }
  };

  const pick = (item, keys) => {
    for (const key of keys) {
      const value = item?.[key]
        ?? item?.available_odds?.[key]
        ?? item?.odds?.[key]
        ?? item?.oranlar?.[key]
        ?? item?.raw_market_guess_odds?.[key];
      if (value !== undefined && value !== null && value !== "" && value !== "-") return value;
    }
    return "";
  };

  const odd = (value) => value === undefined || value === null || value === "" || value === "-" ? "—" : value;
  const formatDate = (date) => {
    if (!date || !String(date).includes("-")) return "Program";
    const [year, month, day] = String(date).slice(0, 10).split("-");
    return `${day}.${month}.${year}`;
  };

  const injectStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #${WIDGET_ID}.daily-widget-shell{position:relative;z-index:3;margin:22px clamp(18px,6vw,90px) 0;padding:18px;border:1px solid rgba(255,159,28,.3);border-radius:22px;background:linear-gradient(180deg,rgba(8,23,48,.96),rgba(3,8,23,.97));box-shadow:0 24px 70px rgba(0,0,0,.38);box-sizing:border-box}
      .daily-live-source-note{margin:8px 0 0;color:#aebbd0;font-size:12px;line-height:1.45}
      .daily-live-bridge-list{display:grid;gap:14px}.daily-live-bridge-date{overflow:hidden;border:1px solid rgba(255,159,28,.22);border-radius:18px;background:rgba(3,8,23,.6)}.daily-live-date-head{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:12px 14px;background:linear-gradient(90deg,rgba(255,159,28,.72),rgba(19,120,69,.62),rgba(3,8,23,.72));color:#fff7d6;font-size:13px;font-weight:950;text-transform:uppercase}.daily-live-scroll{overflow-x:auto}.daily-live-table{display:grid;min-width:900px}.daily-live-head,.daily-live-row{display:grid;grid-template-columns:68px minmax(320px,1fr) repeat(7,minmax(54px,64px));align-items:stretch}.daily-live-head{background:rgba(20,31,34,.98);color:#ffe08a;font-size:11px;font-weight:950;text-transform:uppercase}.daily-live-head span,.daily-live-row>*{display:flex;align-items:center;min-height:44px;padding:9px 8px;border-right:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.07);box-sizing:border-box}.daily-live-row:nth-child(odd){background:rgba(255,255,255,.03)}.daily-live-time{justify-content:center;color:#39ff88;font-weight:950}.daily-live-match{display:grid;gap:3px}.daily-live-league{color:#8fa0b5;font-size:10px;font-weight:850;text-transform:uppercase}.daily-live-teams{color:#f8fbff;font-size:13px;font-weight:900;white-space:normal;line-height:1.25}.daily-live-odd{justify-content:center;background:rgba(255,255,255,.055);color:#fff;font-size:12px;font-weight:900}.daily-live-odd.is-empty{color:#738096;background:rgba(255,255,255,.025)}
      @media(max-width:720px){#${WIDGET_ID}.daily-widget-shell{margin:16px 12px 0;padding:12px}.daily-live-table{min-width:760px}.daily-live-head,.daily-live-row{grid-template-columns:62px minmax(260px,1fr) repeat(7,minmax(50px,60px))}}
    `;
    document.head.appendChild(style);
  };

  const ensureWidget = () => {
    let widget = document.getElementById(WIDGET_ID);
    if (!widget) {
      widget = document.createElement("section");
      widget.id = WIDGET_ID;
      const target = document.getElementById("yaklasan-maclar") || document.querySelector("main");
      if (target?.parentNode) target.parentNode.insertBefore(widget, target.nextSibling);
      else document.body.appendChild(widget);
    }
    widget.className = "daily-widget-shell";
    return widget;
  };

  const normalize = (item) => ({
    date: String(item.date || item.tarih || "").slice(0, 10),
    time: item.time || item.saat || item.start_time || "--:--",
    league: item.league || item.competition_name || item.lig || "Diğer",
    home: item.home || item.home_team_name || item.ev_sahibi || item.match_name?.split(/\s+VS\s+|\s+-\s+/i)?.[0] || "Ev sahibi",
    away: item.away || item.away_team_name || item.deplasman || item.match_name?.split(/\s+VS\s+|\s+-\s+/i)?.[1] || "Deplasman",
    ms1: pick(item, ["ms1", "oneOdd", "one", "odd1"]),
    msx: pick(item, ["msx", "drawOdd", "draw", "oddX"]),
    ms2: pick(item, ["ms2", "twoOdd", "two", "odd2"]),
    under25: pick(item, ["under25", "alt25", "under", "alt", "under25_guess"]),
    over25: pick(item, ["over25", "ust25", "over", "ust", "over25_guess"]),
    bttsYes: pick(item, ["bttsYes", "kgVar", "kg_var", "varOdd", "var", "bttsYes_guess"]),
    bttsNo: pick(item, ["bttsNo", "kgYok", "kg_yok", "yokOdd", "yok", "bttsNo_guess"])
  });

  const sourceData = async () => {
    const fixtures = await readJson(FIXTURES_URL, []);
    if (Array.isArray(fixtures) && fixtures.length) {
      return { matches: fixtures.map(normalize), source: "Fikstür akışı", generatedAt: "", sourceType: "fixtures" };
    }

    const live = await readJson(LIVE_URL, { matches: [], source: "", generated_at: "" });
    const liveMatches = Array.isArray(live.matches) ? live.matches : [];
    return {
      matches: liveMatches.map(normalize),
      source: live.source || "Canlı maç akışı",
      generatedAt: live.generated_at || "",
      sourceType: "live-matches"
    };
  };

  const groupByDate = (matches) => {
    const groups = new Map();
    matches.forEach((match) => {
      const key = match.date || "program";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(match);
    });
    return [...groups.entries()].map(([date, items]) => ({ date, items: items.sort((a, b) => `${a.time} ${a.league} ${a.home}`.localeCompare(`${b.time} ${b.league} ${b.home}`, "tr")) }));
  };

  const row = (match) => `
    <div class="daily-live-row">
      <span class="daily-live-time">${esc(match.time)}</span>
      <span class="daily-live-match"><small class="daily-live-league">${esc(match.league)}</small><strong class="daily-live-teams">${esc(match.home)} - ${esc(match.away)}</strong></span>
      <span class="daily-live-odd ${odd(match.ms1) === "—" ? "is-empty" : ""}">${esc(odd(match.ms1))}</span>
      <span class="daily-live-odd ${odd(match.msx) === "—" ? "is-empty" : ""}">${esc(odd(match.msx))}</span>
      <span class="daily-live-odd ${odd(match.ms2) === "—" ? "is-empty" : ""}">${esc(odd(match.ms2))}</span>
      <span class="daily-live-odd ${odd(match.under25) === "—" ? "is-empty" : ""}">${esc(odd(match.under25))}</span>
      <span class="daily-live-odd ${odd(match.over25) === "—" ? "is-empty" : ""}">${esc(odd(match.over25))}</span>
      <span class="daily-live-odd ${odd(match.bttsYes) === "—" ? "is-empty" : ""}">${esc(odd(match.bttsYes))}</span>
      <span class="daily-live-odd ${odd(match.bttsNo) === "—" ? "is-empty" : ""}">${esc(odd(match.bttsNo))}</span>
    </div>
  `;

  const render = async () => {
    injectStyle();
    const widget = ensureWidget();
    const data = await sourceData();
    const matches = data.matches.filter((match) => match.date || match.time || match.home || match.away);
    window.__dailyMatchesData = matches;

    if (!matches.length) {
      widget.innerHTML = `<div class="daily-widget-head"><div><h2 class="daily-widget-title">Bugünün Maçları</h2><p class="daily-widget-subtitle">Canlı maç bülteni hazırlanıyor.</p></div><span class="daily-widget-count">0 maç</span></div><div class="daily-widget-empty">Maç listesi bekleniyor.</div>`;
      return;
    }

    const groups = groupByDate(matches);
    widget.innerHTML = `
      <div class="daily-widget-head">
        <div>
          <h2 class="daily-widget-title">Bugünün Maç Bülteni</h2>
          <p class="daily-widget-subtitle">Güncel bülten: ${esc(data.source)} · ${esc(data.sourceType)}</p>
          <p class="daily-live-source-note">${data.generatedAt ? `Son güncelleme: ${esc(data.generatedAt)}` : "Maç akış dosyası okunuyor."}</p>
        </div>
        <span class="daily-widget-count">${matches.length} maç</span>
      </div>
      <div class="daily-live-bridge-list">
        ${groups.map((group) => `
          <article class="daily-live-bridge-date">
            <div class="daily-live-date-head"><span>${esc(formatDate(group.date))} programı</span><span>${group.items.length} maç</span></div>
            <div class="daily-live-scroll"><div class="daily-live-table">
              <div class="daily-live-head"><span>Saat</span><span>Maç</span><span>1</span><span>X</span><span>2</span><span>Alt</span><span>Üst</span><span>Var</span><span>Yok</span></div>
              ${group.items.map(row).join("")}
            </div></div>
          </article>
        `).join("")}
      </div>
    `;
  };

  document.addEventListener("DOMContentLoaded", () => setTimeout(render, 700), { once: true });
  window.addEventListener("load", () => {
    setTimeout(render, 900);
    setTimeout(render, 2200);
    setInterval(render, 5 * 60 * 1000);
  }, { once: true });
})();
