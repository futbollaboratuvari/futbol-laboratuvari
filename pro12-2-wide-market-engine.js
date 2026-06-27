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
    ["HND 1", ["hnd1", "handicap1", "handicapMs1"], "hnd", -7],
    ["HND X", ["hndX", "handicapX", "handicapMsX"], "hnd", -9],
    ["HND 2", ["hnd2", "handicap2", "handicapMs2"], "hnd", -7],
    ["HND 0-1", ["hnd01", "handicap0_1"], "hnd", -7],
    ["HND 1-0", ["hnd10", "handicap1_0"], "hnd", -7],
    ["HND 2-0", ["hnd20", "handicap2_0"], "hnd", -11],
    ["HND 0-2", ["hnd02", "handicap0_2"], "hnd", -11],
    ["0.5 Ust", ["over05", "ust05", "over0_5"], "goal", 3],
    ["0.5 Alt", ["under05", "alt05", "under0_5"], "goal", -20],
    ["1.5 Ust", ["over15", "ust15", "over1_5"], "goal", 6],
    ["1.5 Alt", ["under15", "alt15", "under1_5"], "goal", -10],
    ["3.5 Ust", ["over35", "ust35", "over3_5"], "goal", -8],
    ["3.5 Alt", ["under35", "alt35", "under3_5"], "goal", 3],
    ["4.5 Ust", ["over45", "ust45", "over4_5"], "goal", -18],
    ["4.5 Alt", ["under45", "alt45", "under4_5"], "goal", 8],
    ["IY/MS 1/1", ["htFt11", "iyMs11", "halfFull11"], "combo", -4],
    ["IY/MS 1/X", ["htFt1X", "iyMs1X", "halfFull1X"], "combo", -10],
    ["IY/MS 1/2", ["htFt12", "iyMs12", "halfFull12"], "combo", -18],
    ["IY/MS X/1", ["htFtX1", "iyMsX1", "halfFullX1"], "combo", -2],
    ["IY/MS X/X", ["htFtXX", "iyMsXX", "halfFullXX"], "combo", -6],
    ["IY/MS X/2", ["htFtX2", "iyMsX2", "halfFullX2"], "combo", -2],
    ["IY/MS 2/1", ["htFt21", "iyMs21", "halfFull21"], "combo", -18],
    ["IY/MS 2/X", ["htFt2X", "iyMs2X", "halfFull2X"], "combo", -10],
    ["IY/MS 2/2", ["htFt22", "iyMs22", "halfFull22"], "combo", -4],
    ["MS 1 + 1.5 Alt", ["ms1Under15", "homeWinUnder15"], "home", -6],
    ["MS X + 1.5 Alt", ["msxUnder15", "drawUnder15"], "combo", 0],
    ["MS 2 + 1.5 Alt", ["ms2Under15", "awayWinUnder15"], "away", -6],
    ["MS 1 + 1.5 Ust", ["ms1Over15", "homeWinOver15"], "home", 2],
    ["MS X + 1.5 Ust", ["msxOver15", "drawOver15"], "combo", -5],
    ["MS 2 + 1.5 Ust", ["ms2Over15", "awayWinOver15"], "away", 2],
    ["MS 1 + 2.5 Alt", ["homeWinUnder25", "ms1Under25"], "home", -2],
    ["MS X + 2.5 Alt", ["drawUnder25", "msxUnder25"], "combo", 2],
    ["MS 2 + 2.5 Alt", ["awayWinUnder25", "ms2Under25"], "away", -2],
    ["MS 1 + 2.5 Ust", ["homeWinOver25", "ms1Over25"], "home", 3],
    ["MS X + 2.5 Ust", ["drawOver25", "msxOver25"], "combo", -8],
    ["MS 2 + 2.5 Ust", ["awayWinOver25", "ms2Over25"], "away", 3],
    ["MS 1 + 3.5 Alt", ["ms1Under35", "homeWinUnder35"], "home", 1],
    ["MS X + 3.5 Alt", ["msxUnder35", "drawUnder35"], "combo", 1],
    ["MS 2 + 3.5 Alt", ["ms2Under35", "awayWinUnder35"], "away", 1],
    ["MS 1 + 3.5 Ust", ["ms1Over35", "homeWinOver35"], "home", -5],
    ["MS X + 3.5 Ust", ["msxOver35", "drawOver35"], "combo", -14],
    ["MS 2 + 3.5 Ust", ["ms2Over35", "awayWinOver35"], "away", -5],
    ["MS 1 + 4.5 Alt", ["ms1Under45", "homeWinUnder45"], "home", 2],
    ["MS X + 4.5 Alt", ["msxUnder45", "drawUnder45"], "combo", 1],
    ["MS 2 + 4.5 Alt", ["ms2Under45", "awayWinUnder45"], "away", 2],
    ["MS 1 + 4.5 Ust", ["ms1Over45", "homeWinOver45"], "home", -13],
    ["MS X + 4.5 Ust", ["msxOver45", "drawOver45"], "combo", -20],
    ["MS 2 + 4.5 Ust", ["ms2Over45", "awayWinOver45"], "away", -13],
    ["MS 1 + KG Var", ["homeWinBtts", "ms1KgVar"], "home", 3],
    ["MS X + KG Var", ["drawBtts", "msxKgVar"], "combo", -2],
    ["MS 2 + KG Var", ["awayWinBtts", "ms2KgVar"], "away", 3],
    ["MS 1 + KG Yok", ["homeWinBttsNo", "ms1KgYok"], "home", -1],
    ["MS X + KG Yok", ["drawBttsNo", "msxKgYok"], "combo", -10],
    ["MS 2 + KG Yok", ["awayWinBttsNo", "ms2KgYok"], "away", -1],
    ["0-1 Gol", ["goals01", "goalRange01"], "goal", -12],
    ["2-3 Gol", ["goals23", "goalRange23"], "goal", 7],
    ["4-5 Gol", ["goals45", "goalRange45", "goals46", "goalRange46"], "goal", -8],
    ["6+ Gol", ["goals6plus", "goalRange6plus", "goals7plus"], "goal", -24],
    ["Ilk Yari / Mac Skoru", ["halfTimeFullScore", "iyMacSkoru"], "score", -15],
    ["1. Yari Skoru", ["firstHalfScore", "iySkoru"], "score", -14],
    ["Dogru Skor 1-0", ["correctScore10", "score10"], "score", -16],
    ["Dogru Skor 2-0", ["correctScore20", "score20"], "score", -18],
    ["Dogru Skor 2-1", ["correctScore21", "score21"], "score", -18],
    ["Dogru Skor 0-0", ["correctScore00", "score00"], "score", -18],
    ["Dogru Skor 1-1", ["correctScore11", "score11"], "score", -13],
    ["Dogru Skor 2-2", ["correctScore22", "score22"], "score", -20],
    ["Dogru Skor 0-1", ["correctScore01", "score01"], "score", -16],
    ["Dogru Skor 0-2", ["correctScore02", "score02"], "score", -18],
    ["Dogru Skor 1-2", ["correctScore12", "score12"], "score", -18],
    ["Dogru Skor Diger", ["correctScoreOther", "scoreOther"], "score", -22],
    ["1Y/2Y KG Evet/Evet", ["firstSecondBttsYesYes", "firstSecondBttsYesYes_guess"], "half", -3],
    ["1Y/2Y KG Evet/Hayir", ["firstSecondBttsYesNo", "firstSecondBttsYesNo_guess"], "half", -7],
    ["1Y/2Y KG Hayir/Evet", ["firstSecondBttsNoYes", "firstSecondBttsNoYes_guess"], "half", -4],
    ["1Y/2Y KG Hayir/Hayir", ["firstSecondBttsNoNo", "firstSecondBttsNoNo_guess"], "half", -7],
    ["En Cok Gol 1. Yari", ["mostGoalsFirstHalf", "firstHalfMostGoals"], "half", -2],
    ["En Cok Gol 2. Yari", ["mostGoalsSecondHalf", "secondHalfMostGoals"], "half", 3],
    ["En Cok Gol Esit", ["mostGoalsEqual", "equalHalfGoals"], "half", -10],
    ["Toplam Tek", ["totalOdd", "tek"], "goal", 0],
    ["Toplam Cift", ["totalEven", "cift"], "goal", 0],
    ["Korner 8.5 Ust", ["cornerOver85", "cornersOver85"], "corner", -2],
    ["Korner 9.5 Ust", ["cornerOver95", "cornersOver95"], "corner", -4],
    ["Kart 3.5 Ust", ["cardOver35", "cardsOver35"], "card", -4],
    ["Kart 4.5 Ust", ["cardOver45", "cardsOver45"], "card", -6],
    ["Takim Sut Ev 10+", ["homeShots10", "homeTeamShots10"], "shot", -4],
    ["Takim Sut Dep 10+", ["awayShots10", "awayTeamShots10"], "shot", -4],
    ["Toplam Sut 21+", ["totalShots21", "shots21Plus"], "shot", -3],
    ["Toplam Sut 25+", ["totalShots25", "shots25Plus"], "shot", -8]
  ];
  const base = (a, t) => t === "goal" ? Math.max(a.kg?.percent || 0, a.over25?.percent || 0, 45) : t === "home" ? (a.ms?.label === "1" ? a.ms.percent : 42) : t === "away" ? (a.ms?.label === "2" ? a.ms.percent : 42) : t === "corner" ? Math.max(a.pressure?.corner || a.corner_score || 47, 43) : t === "card" ? Math.max(a.cardRisk?.percent || a.card_score || 45, 40) : t === "shot" ? Math.max(a.shotPressure?.percent || a.shot_score || 48, 42) : t === "half" ? Math.max(a.firstHalf?.percent || a.secondHalf?.percent || 46, 42) : t === "score" ? Math.max(a.ms?.percent || 0, a.kg?.percent || 0, 42) : t === "hnd" ? Math.max(a.ms?.percent || 0, 43) : Math.max(a.ms?.percent || 0, a.kg?.percent || 0, 44);
  const scoreOne = (a, def) => {
    const odd = pick(a.match?.raw, a.match?.robot, def[1]);
    const b = Number(base(a, def[2])) + Number(def[3] || 0);
    const s = nOdd(odd) ? b + ((b - imp(odd)) * 0.38) : b - 8;
    return { label: def[0], odd, score: pct(s), risk: pct(s) >= 72 ? "Orta" : pct(s) >= 58 ? "Orta-Yuksek" : "Yuksek", group: def[2] };
  };
  const enrich = (a) => {
    const wideMarkets = defs.map((item) => scoreOne(a, item)).sort((x, y) => y.score - x.score);
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
      localStorage.setItem("fl_last_pro122_analysis", JSON.stringify({ ...data, source: SOURCE, analyses: items, market_education: "full_video_markets_v3" }));
      draw(items);
    } catch {}
  };
  window.__flPro122WideMarketDefs = defs;
  document.addEventListener("click", (event) => { if (event.target.closest?.("#premium-analysis-panel [data-pa-analyze]")) setTimeout(run, 900); });
  window.addEventListener("load", () => setTimeout(run, 1600), { once: true });
})();