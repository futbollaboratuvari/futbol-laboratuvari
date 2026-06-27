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
    ["IY/MS 1/1", ["htFt11", "iyMs11", "halfFull11"], "combo", -4],
    ["IY/MS X/1", ["htFtX1", "iyMsX1", "halfFullX1"], "combo", -2],
    ["IY/MS 2/2", ["htFt22", "iyMs22", "halfFull22"], "combo", -4],
    ["IY/MS X/X", ["htFtXX", "iyMsXX", "halfFullXX"], "combo", -6],
    ["MS 1 + 2.5 Ust", ["homeWinOver25", "ms1Over25"], "home", 3],
    ["MS X + 2.5 Ust", ["drawOver25", "msxOver25"], "combo", -8],
    ["MS 2 + 2.5 Ust", ["awayWinOver25", "ms2Over25"], "away", 3],
    ["MS 1 + 2.5 Alt", ["homeWinUnder25", "ms1Under25"], "home", -2],
    ["MS X + 2.5 Alt", ["drawUnder25", "msxUnder25"], "combo", 2],
    ["MS 2 + 2.5 Alt", ["awayWinUnder25", "ms2Under25"], "away", -2],
    ["MS 1 + KG Var", ["homeWinBtts", "ms1KgVar"], "home", 3],
    ["MS X + KG Var", ["drawBtts", "msxKgVar"], "combo", -2],
    ["MS 2 + KG Var", ["awayWinBtts", "ms2KgVar"], "away", 3],
    ["MS 1 + KG Yok", ["homeWinBttsNo", "ms1KgYok"], "home", -1],
    ["MS X + KG Yok", ["drawBttsNo", "msxKgYok"], "combo", -10],
    ["MS 2 + KG Yok", ["awayWinBttsNo", "ms2KgYok"], "away", -1],
    ["0-1 Gol", ["goals01", "goalRange01"], "goal", -12],
    ["2-3 Gol", ["goals23", "goalRange23"], "goal", 7],
    ["4-5 Gol", ["goals45", "goalRange45", "goals46", "goalRange46"], "goal", -8],
    ["6+ Gol", ["goals6plus", "goalRange6plus", "goals7plus", "goalRange7plus"], "goal", -24],
    ["En Cok Gol 1. Yari", ["mostGoalsFirstHalf", "firstHalfMostGoals"], "half", -2],
    ["En Cok Gol 2. Yari", ["mostGoalsSecondHalf", "secondHalfMostGoals"], "half", 3],
    ["En Cok Gol Esit", ["mostGoalsEqual", "equalHalfGoals"], "half", -10],
    ["Toplam Tek", ["totalOdd", "tek"], "goal", 0],
    ["Toplam Cift", ["totalEven", "cift"], "goal", 0],
    ["Korner 8.5 Ust", ["cornerOver85", "cornersOver85"], "corner", -2],
    ["Korner 9.5 Ust", ["cornerOver95", "cornersOver95"], "corner", -4],
    ["Korner Handikap 1", ["cornerHandicap1", "cornerHnd1"], "corner", -6],
    ["Korner Handikap 2", ["cornerHandicap2", "cornerHnd2"], "corner", -6],
    ["Kart 3.5 Ust", ["cardOver35", "cardsOver35"], "card", -4],
    ["Kart 4.5 Ust", ["cardOver45", "cardsOver45"], "card", -6],
    ["1. Yari Kart 1.5 Ust", ["firstHalfCardOver15", "iyCardOver15"], "card", -4],
    ["Takim Sut Ev 10+", ["homeShots10", "homeTeamShots10"], "shot", -4],
    ["Takim Sut Dep 10+", ["awayShots10", "awayTeamShots10"], "shot", -4],
    ["Toplam Sut 21+", ["totalShots21", "shots21Plus"], "shot", -3],
    ["Toplam Sut 25+", ["totalShots25", "shots25Plus"], "shot", -8]
  ];
  const base = (a, t) => t === "goal" ? Math.max(a.kg?.percent || 0, a.over25?.percent || 0, 45) : t === "home" ? (a.ms?.label === "1" ? a.ms.percent : 42) : t === "away" ? (a.ms?.label === "2" ? a.ms.percent : 42) : t === "corner" ? Math.max(a.pressure?.corner || a.corner_score || 47, 43) : t === "card" ? Math.max(a.cardRisk?.percent || a.card_score || 45, 40) : t === "shot" ? Math.max(a.shotPressure?.percent || a.shot_score || 48, 42) : t === "half" ? Math.max(a.firstHalf?.percent || a.secondHalf?.percent || 46, 42) : Math.max(a.ms?.percent || 0, a.kg?.percent || 0, 44);
  const scoreOne = (a, d) => {
    const odd = pick(a.match?.raw, a.match?.robot, d[1]);
    const b = Number(base(a, d[2])) + Number(d[3] || 0);
    const s = nOdd(odd) ? b + ((b - imp(odd)) * 0.38) : b - 8;
    return { label: d[0], odd, score: pct(s), risk: pct(s) >= 72 ? "Orta" : pct(s) >= 58 ? "Orta-Yuksek" : "Yuksek", group: d[2] };
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
    const rows = items.map((a, i) => `<tr><td>${i + 1}. ${esc(a.match?.home)} - ${esc(a.match?.away)}</td><td><b>${esc(a.extraBestMarket?.label)}</b></td><td>${fmt(a.extraBestMarket?.odd)}</td><td><strong>%${a.extraBestMarket?.score}</strong></td><td>${esc(a.extraBestMarket?.risk)}</td><td>${esc((a.wideMarkets || []).slice(1,6).map((m) => `${m.label} %${m.score}`).join(" | "))}</td></tr>`).join("");
    area.innerHTML = `<h4>Genis Market Skorlayici</h4><div class="pro122-table-wrap"><table class="pro122-table"><thead><tr><th>Mac</th><th>Ekstra En Guclu Secenek</th><th>Oran</th><th>Skor</th><th>Risk</th><th>Alternatifler</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  };
  const run = () => {
    try {
      const data = JSON.parse(localStorage.getItem("fl_last_pro122_analysis") || "{}");
      const items = Array.isArray(data.analyses) ? data.analyses.map(enrich) : [];
      if (!items.length) return;
      localStorage.setItem("fl_last_pro122_analysis", JSON.stringify({ ...data, source: SOURCE, analyses: items, market_education: "wide_markets_v2" }));
      draw(items);
    } catch {}
  };
  window.__flPro122WideMarketDefs = defs;
  document.addEventListener("click", (event) => { if (event.target.closest?.("#premium-analysis-panel [data-pa-analyze]")) setTimeout(run, 900); });
  window.addEventListener("load", () => setTimeout(run, 1600), { once: true });
})();