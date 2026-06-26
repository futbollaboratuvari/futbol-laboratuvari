(() => {
  const SOURCE = "pro12_2_wide_market_engine";
  const esc = (v) => String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const nOdd = (v) => { const n = Number(String(v ?? "").replace(",", ".")); return Number.isFinite(n) && n > 1 ? n : 0; };
  const fmt = (v) => nOdd(v) ? nOdd(v).toFixed(2).replace(".", ",") : "-";
  const pct = (v) => Math.max(1, Math.min(99, Math.round(Number(v) || 0)));
  const imp = (v) => nOdd(v) ? 100 / nOdd(v) : 0;
  const pick = (a, b, keys) => {
    for (const k of keys) {
      const v = a?.[k] ?? a?.available_odds?.[k] ?? a?.odds?.[k] ?? a?.oranlar?.[k] ?? a?.raw_market_guess_odds?.[k] ?? b?.[k] ?? b?.available_odds?.[k] ?? b?.odds?.[k] ?? b?.raw_market_guess_odds?.[k];
      if (v !== undefined && v !== null && String(v).trim() && String(v).trim() !== "-") return v;
    }
    return "";
  };
  const defs = [
    ["1.5 Ust", ["over15", "ust15", "over1_5"], "goal", 6],
    ["1.5 Alt", ["under15", "alt15", "under1_5"], "goal", -10],
    ["3.5 Ust", ["over35", "ust35", "over3_5"], "goal", -8],
    ["3.5 Alt", ["under35", "alt35", "under3_5"], "goal", 3],
    ["4.5 Ust", ["over45", "ust45", "over4_5"], "goal", -18],
    ["4.5 Alt", ["under45", "alt45", "under4_5"], "goal", 8],
    ["5.5 Ust", ["over55", "ust55", "over5_5"], "goal", -26],
    ["5.5 Alt", ["under55", "alt55", "under5_5"], "goal", 10],
    ["1X", ["doubleChance1X", "dc1x", "1x"], "safe", 5],
    ["X2", ["doubleChanceX2", "dcx2", "x2"], "safe", 5],
    ["12", ["doubleChance12", "dc12"], "safe", 2],
    ["Ev Sahibi Gol Atar", ["homeScores", "home_goal"], "home", 4],
    ["Deplasman Gol Atar", ["awayScores", "away_goal"], "away", 4],
    ["Ev Sahibi Gol Yemez", ["homeCleanSheet"], "home", -2],
    ["Deplasman Gol Yemez", ["awayCleanSheet"], "away", -2],
    ["Ev Sahibi 1.5 Ust", ["homeOver15", "homeTeamOver15"], "home", 1],
    ["Deplasman 1.5 Ust", ["awayOver15", "awayTeamOver15"], "away", 1],
    ["Toplam Tek", ["totalOdd", "tek"], "goal", 0],
    ["Toplam Cift", ["totalEven", "cift"], "goal", 0],
    ["0-1 Gol", ["goals01", "goalRange01"], "goal", -12],
    ["2-3 Gol", ["goals23", "goalRange23"], "goal", 7],
    ["4-6 Gol", ["goals46", "goalRange46"], "goal", -8],
    ["7+ Gol", ["goals7plus", "goalRange7plus"], "goal", -28],
    ["KG Var + 2.5 Ust", ["bttsOver25", "kgVarOver25"], "goal", 8],
    ["KG Var + 3.5 Ust", ["bttsOver35", "kgVarOver35"], "goal", 0],
    ["KG Yok + 2.5 Alt", ["bttsNoUnder25", "kgYokUnder25"], "goal", 3],
    ["MS 1 + KG Var", ["homeWinBtts", "ms1KgVar"], "home", 3],
    ["MS 2 + KG Var", ["awayWinBtts", "ms2KgVar"], "away", 3],
    ["MS 1 + 2.5 Ust", ["homeWinOver25", "ms1Over25"], "home", 3],
    ["MS 2 + 2.5 Ust", ["awayWinOver25", "ms2Over25"], "away", 3]
  ];
  const base = (a, t) => t === "goal" ? Math.max(a.kg?.percent || 0, a.over25?.percent || 0, 45) : t === "home" ? (a.ms?.label === "1" ? a.ms.percent : 42) : t === "away" ? (a.ms?.label === "2" ? a.ms.percent : 42) : Math.max(a.ms?.percent || 0, 52);
  const scoreOne = (a, d) => {
    const odd = pick(a.match?.raw, a.match?.robot, d[1]);
    const b = Number(base(a, d[2])) + Number(d[3] || 0);
    const s = nOdd(odd) ? b + ((b - imp(odd)) * 0.38) : b - 8;
    return { label: d[0], odd, score: pct(s), risk: pct(s) >= 72 ? "Orta" : pct(s) >= 58 ? "Orta-Yuksek" : "Yuksek" };
  };
  const enrich = (a) => {
    const wideMarkets = defs.map((d) => scoreOne(a, d)).sort((x, y) => y.score - x.score);
    return { ...a, wideMarkets, extraBestMarket: wideMarkets[0], wide_source: SOURCE };
  };
  const draw = (items) => {
    const box = document.querySelector(".pro122-box");
    if (!box || !items.length) return;
    let area = box.querySelector("[data-pro122-wide-markets]");
    if (!area) { area = document.createElement("div"); area.dataset.pro122WideMarkets = "1"; box.appendChild(area); }
    const rows = items.map((a, i) => `<tr><td>${i + 1}. ${esc(a.match?.home)} - ${esc(a.match?.away)}</td><td><b>${esc(a.extraBestMarket?.label)}</b></td><td>${fmt(a.extraBestMarket?.odd)}</td><td><strong>%${a.extraBestMarket?.score}</strong></td><td>${esc(a.extraBestMarket?.risk)}</td><td>${esc((a.wideMarkets || []).slice(1,4).map((m) => `${m.label} %${m.score}`).join(" | "))}</td></tr>`).join("");
    area.innerHTML = `<h4>Genis Market Skorlayici</h4><div class="pro122-table-wrap"><table class="pro122-table"><thead><tr><th>Mac</th><th>Ekstra En Guclu Secenek</th><th>Oran</th><th>Skor</th><th>Risk</th><th>Alternatifler</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  };
  const run = () => {
    try {
      const data = JSON.parse(localStorage.getItem("fl_last_pro122_analysis") || "{}");
      const items = Array.isArray(data.analyses) ? data.analyses.map(enrich) : [];
      if (!items.length) return;
      localStorage.setItem("fl_last_pro122_analysis", JSON.stringify({ ...data, source: SOURCE, analyses: items }));
      draw(items);
    } catch {}
  };
  document.addEventListener("click", (event) => { if (event.target.closest?.("#premium-analysis-panel [data-pa-analyze]")) setTimeout(run, 900); });
  window.addEventListener("load", () => setTimeout(run, 1600), { once: true });
})();
