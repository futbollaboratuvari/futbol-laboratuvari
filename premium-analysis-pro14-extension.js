(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root?.FLPremiumAnalysisCore) api.install(root.FLPremiumAnalysisCore, root);
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const VERSION = "pro14-market-expansion-v1";
  const EXTRA_OPTIONS = [
    "1.5 Üst",
    "3.5 Üst",
    "Ev Sahibi Gol Atar",
    "Deplasman Gol Atar",
    "İY/MS 1/1",
    "İY/MS 1/X",
    "İY/MS 1/2",
    "İY/MS X/1",
    "İY/MS X/X",
    "İY/MS X/2",
    "İY/MS 2/1",
    "İY/MS 2/X",
    "İY/MS 2/2",
  ];

  const HTFT = Object.freeze({
    htft11: { label: "İY/MS 1/1", half: "home", full: "home", aliases: ["htft11", "iyms11", "iy_ms_11", "firstHalfFullTime11", "first_half_full_time_11"] },
    htft1x: { label: "İY/MS 1/X", half: "home", full: "draw", aliases: ["htft1x", "iyms1x", "iy_ms_1x", "firstHalfFullTime1X", "first_half_full_time_1x"] },
    htft12: { label: "İY/MS 1/2", half: "home", full: "away", aliases: ["htft12", "iyms12", "iy_ms_12", "firstHalfFullTime12", "first_half_full_time_12"] },
    htftx1: { label: "İY/MS X/1", half: "draw", full: "home", aliases: ["htftx1", "iymsx1", "iy_ms_x1", "firstHalfFullTimeX1", "first_half_full_time_x1"] },
    htftxx: { label: "İY/MS X/X", half: "draw", full: "draw", aliases: ["htftxx", "iymsxx", "iy_ms_xx", "firstHalfFullTimeXX", "first_half_full_time_xx"] },
    htftx2: { label: "İY/MS X/2", half: "draw", full: "away", aliases: ["htftx2", "iymsx2", "iy_ms_x2", "firstHalfFullTimeX2", "first_half_full_time_x2"] },
    htft21: { label: "İY/MS 2/1", half: "away", full: "home", aliases: ["htft21", "iyms21", "iy_ms_21", "firstHalfFullTime21", "first_half_full_time_21"] },
    htft2x: { label: "İY/MS 2/X", half: "away", full: "draw", aliases: ["htft2x", "iyms2x", "iy_ms_2x", "firstHalfFullTime2X", "first_half_full_time_2x"] },
    htft22: { label: "İY/MS 2/2", half: "away", full: "away", aliases: ["htft22", "iyms22", "iy_ms_22", "firstHalfFullTime22", "first_half_full_time_22"] },
  });

  const SIMPLE = Object.freeze({
    over15: { label: "1.5 Üst", aliases: ["over15", "ust15", "over1_5", "ust_15", "over15_guess"], opposite: ["under15", "alt15", "under1_5", "alt_15", "under15_guess"], threshold: 68 },
    over35: { label: "3.5 Üst", aliases: ["over35", "ust35", "over3_5", "ust_35", "over35_guess"], opposite: ["under35", "alt35", "under3_5", "alt_35", "under35_guess"], threshold: 48 },
    homeGoal: { label: "Ev Sahibi Gol Atar", aliases: ["homeGoalYes", "homeScores", "home_to_score", "evGolAtar", "ev_sahibi_gol_atar", "homeGoalYes_guess"], opposite: ["homeGoalNo", "homeDoesNotScore", "evGolAtmaz", "ev_sahibi_gol_atmaz"], threshold: 65 },
    awayGoal: { label: "Deplasman Gol Atar", aliases: ["awayGoalYes", "awayScores", "away_to_score", "depGolAtar", "deplasman_gol_atar", "awayGoalYes_guess"], opposite: ["awayGoalNo", "awayDoesNotScore", "depGolAtmaz", "deplasman_gol_atmaz"], threshold: 65 },
  });

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const finite = (value) => {
    if (value === undefined || value === null || value === "" || value === "-") return null;
    const parsed = Number(String(value).replace(",", ".").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  };
  const odd = (value) => {
    const parsed = finite(value);
    return parsed !== null && parsed > 1 ? parsed : null;
  };
  const round1 = (value) => Number(Number(value).toFixed(1));
  const normalizeText = (value) => String(value ?? "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  const sourcesFor = (match) => {
    const raw = match?.source && typeof match.source === "object" ? match.source : match;
    return [
      match,
      match?.odds,
      raw,
      raw?.available_odds,
      raw?.odds,
      raw?.oranlar,
      raw?.detay_oranlar,
      raw?.detailOdds,
      raw?.raw_market_guess_odds,
      raw?.analysis,
      raw?.stats,
    ].filter(Boolean);
  };

  const readOdd = (match, aliases) => {
    for (const source of sourcesFor(match)) {
      for (const key of aliases) {
        const value = odd(source?.[key]);
        if (value !== null) return value;
      }
    }
    return null;
  };

  const canonicalMarket = (value) => {
    const text = normalizeText(value);
    const htftPatterns = [
      ["htft11", /(?:iy ms|ilk yari mac sonucu|ht ft) 1 1/],
      ["htft1x", /(?:iy ms|ilk yari mac sonucu|ht ft) 1 x/],
      ["htft12", /(?:iy ms|ilk yari mac sonucu|ht ft) 1 2/],
      ["htftx1", /(?:iy ms|ilk yari mac sonucu|ht ft) x 1/],
      ["htftxx", /(?:iy ms|ilk yari mac sonucu|ht ft) x x/],
      ["htftx2", /(?:iy ms|ilk yari mac sonucu|ht ft) x 2/],
      ["htft21", /(?:iy ms|ilk yari mac sonucu|ht ft) 2 1/],
      ["htft2x", /(?:iy ms|ilk yari mac sonucu|ht ft) 2 x/],
      ["htft22", /(?:iy ms|ilk yari mac sonucu|ht ft) 2 2/],
    ];
    for (const [key, pattern] of htftPatterns) if (pattern.test(text)) return key;
    if (/1 5.*ust|over 1 5|over15/.test(text)) return "over15";
    if (/3 5.*ust|over 3 5|over35/.test(text)) return "over35";
    if (/ev sahibi gol atar|home.*goal|home.*score/.test(text)) return "homeGoal";
    if (/deplasman gol atar|away.*goal|away.*score/.test(text)) return "awayGoal";
    return "";
  };

  const fairThreeWay = (home, draw, away) => {
    if (![home, draw, away].every((value) => odd(value))) return null;
    const inv = [1 / home, 1 / draw, 1 / away];
    const total = inv.reduce((sum, value) => sum + value, 0);
    if (!total) return null;
    return {
      home: (inv[0] / total) * 100,
      draw: (inv[1] / total) * 100,
      away: (inv[2] / total) * 100,
    };
  };

  const fairBinary = (selected, opposite) => {
    if (!odd(selected) || !odd(opposite)) return null;
    const a = 1 / selected;
    const b = 1 / opposite;
    return (a / (a + b)) * 100;
  };

  const halfOdds = (match) => ({
    home: odd(match?.odds?.firstHalfHome) ?? readOdd(match, ["firstHalf1", "firstHalf1_guess", "iy1", "iy_1"]),
    draw: odd(match?.odds?.firstHalfDraw) ?? readOdd(match, ["firstHalfX", "firstHalfX_guess", "iyx", "iy_x"]),
    away: odd(match?.odds?.firstHalfAway) ?? readOdd(match, ["firstHalf2", "firstHalf2_guess", "iy2", "iy_2"]),
  });

  const fullOdds = (match) => ({
    home: odd(match?.odds?.ms1) ?? readOdd(match, ["ms1", "one", "oneOdd", "odd1"]),
    draw: odd(match?.odds?.msx) ?? readOdd(match, ["msx", "draw", "drawOdd", "oddX"]),
    away: odd(match?.odds?.ms2) ?? readOdd(match, ["ms2", "two", "twoOdd", "odd2"]),
  });

  const allHtftOdds = (match) => Object.fromEntries(Object.entries(HTFT).map(([key, def]) => [key, readOdd(match, def.aliases)]));

  const fairNineWay = (rows, selectedKey) => {
    const entries = Object.entries(rows);
    if (entries.length !== 9 || entries.some(([, value]) => !odd(value))) return null;
    const total = entries.reduce((sum, [, value]) => sum + (1 / value), 0);
    const selected = rows[selectedKey];
    return selected && total ? ((1 / selected) / total) * 100 : null;
  };

  const poissonExpanded = (match) => {
    const homeLambda = finite(match?.metrics?.poissonHome);
    const awayLambda = finite(match?.metrics?.poissonAway);
    if (homeLambda === null || awayLambda === null || homeLambda < 0 || awayLambda < 0) return null;
    const total = homeLambda + awayLambda;
    const p0 = Math.exp(-total);
    const p1 = p0 * total;
    const p2 = p1 * total / 2;
    const p3 = p2 * total / 3;
    return {
      over15: clamp((1 - p0 - p1) * 100, 0, 100),
      over35: clamp((1 - p0 - p1 - p2 - p3) * 100, 0, 100),
      homeGoal: clamp((1 - Math.exp(-homeLambda)) * 100, 0, 100),
      awayGoal: clamp((1 - Math.exp(-awayLambda)) * 100, 0, 100),
      homeLambda,
      awayLambda,
    };
  };

  const detailBase = (match) => [
    { label: "PRO14 genişletme", value: VERSION },
    { label: "Kadro riski", value: String(match?.pro?.squadRiskLevel || "Belirsiz") },
    { label: "İlk 11 riski", value: String(match?.pro?.lineupRiskLevel || "Belirsiz") },
  ];

  const analyzeHtft = (match, key) => {
    const def = HTFT[key];
    if (!def) return null;
    const half = fairThreeWay(...Object.values(halfOdds(match)));
    const full = fairThreeWay(...Object.values(fullOdds(match)));
    const directRows = allHtftOdds(match);
    const selectedOdd = directRows[key] || null;
    const directProbability = fairNineWay(directRows, key);
    const halfProbability = half?.[def.half] ?? null;
    const fullProbability = full?.[def.full] ?? null;
    const marginalJoint = halfProbability !== null && fullProbability !== null
      ? (halfProbability * fullProbability) / 100
      : null;
    const neutralPrior = 100 / 9;
    const estimatedProbability = marginalJoint === null
      ? null
      : round1((marginalJoint * 0.75) + (neutralPrior * 0.25));
    const completeHalf = Boolean(half);
    const completeFull = Boolean(full);
    const completeNine = Object.values(directRows).every((value) => odd(value));
    const dataCompleteness = Math.min(100,
      (completeHalf ? 25 : 0)
      + (completeFull ? 25 : 0)
      + (selectedOdd ? 20 : 0)
      + (completeNine ? 30 : 0));
    const baseSignal = Math.min(halfProbability ?? 0, fullProbability ?? 0);
    const modelScore = estimatedProbability === null
      ? null
      : Math.min(64, Math.round(clamp(38 + ((baseSignal - 20) * 0.35) + (dataCompleteness * 0.12), 38, 64)));
    const edgePercent = directProbability !== null && estimatedProbability !== null
      ? round1(estimatedProbability - directProbability)
      : null;
    const supported = Boolean(selectedOdd && completeNine && estimatedProbability !== null && estimatedProbability >= 8 && dataCompleteness >= 90);
    const reasons = [
      estimatedProbability === null
        ? "İlk yarı ve maç sonucu üçlü oran setleri birlikte tamamlanmadı."
        : `İlk yarı %${Math.round(halfProbability)} ve maç sonu %${Math.round(fullProbability)} marjsız piyasa payı, küçültülmüş senaryo tabanında %${estimatedProbability} üretti.`,
      selectedOdd
        ? `Doğrudan ${def.label} oranı ${selectedOdd.toFixed(2)}${completeNine && directProbability !== null ? `; dokuzlu market marjı temizlenince piyasa payı %${round1(directProbability)}` : "; dokuzlu market tam olmadığı için adil piyasa payı hesaplanmadı"}.`
        : `Doğrudan ${def.label} oranı bulunmadığı için fiyat uydurulmadı.`,
      "İY/MS ortak olasılığı kalibre edilmiş bağımsız maç modeli değildir; bu nedenle risk yüksek tutulur ve otomatik kupona alınmaz.",
    ];
    return {
      match,
      type: "advanced",
      market: def.label,
      odd: selectedOdd,
      confidence: modelScore,
      modelScore,
      estimatedProbability,
      marketProbability: directProbability === null ? null : round1(directProbability),
      edgePercent,
      dataCompleteness,
      dataQuality: completeNine ? "Orta" : "Sınırlı",
      modelVersion: VERSION,
      sourceMode: completeNine ? "htft-full-market-baseline" : "htft-marginal-baseline",
      calibration: null,
      risk: "Yüksek",
      noPick: !supported,
      hasOpinion: estimatedProbability !== null,
      couponEligible: false,
      recommendationStatus: supported ? "analysis" : estimatedProbability !== null ? "watch" : "unavailable",
      headline: supported ? `${def.label} gelişmiş market görüşü oluştu` : `${def.label} kontrollü senaryo analizi`,
      reasons,
      details: [
        ...detailBase(match),
        { label: "İlk yarı marjsız dağılım", value: half ? `%${Math.round(half.home)} / %${Math.round(half.draw)} / %${Math.round(half.away)}` : "Eksik" },
        { label: "Maç sonucu marjsız dağılım", value: full ? `%${Math.round(full.home)} / %${Math.round(full.draw)} / %${Math.round(full.away)}` : "Eksik" },
        { label: "İY/MS doğrudan market", value: completeNine ? "9/9 oran tamam" : `${Object.values(directRows).filter((value) => odd(value)).length}/9 oran` },
        { label: "Otomatik kupon", value: "Kapalı · markete özel bağımsız kalibrasyon gerekli" },
      ],
    };
  };

  const analyzeSimple = (match, key) => {
    const def = SIMPLE[key];
    if (!def) return null;
    const poisson = poissonExpanded(match);
    let probability = poisson?.[key] ?? null;
    if (key === "over35" && finite(match?.metrics?.over35) !== null) {
      const directMetric = clamp(finite(match.metrics.over35), 0, 100);
      probability = poisson ? ((directMetric * 0.55) + (poisson.over35 * 0.45)) : directMetric;
    }
    if (probability === null) return {
      match,
      type: "advanced",
      market: def.label,
      odd: readOdd(match, def.aliases),
      confidence: null,
      modelScore: null,
      estimatedProbability: null,
      marketProbability: null,
      edgePercent: null,
      dataCompleteness: 0,
      dataQuality: "Sınırlı",
      modelVersion: VERSION,
      sourceMode: "insufficient",
      calibration: null,
      risk: "Yüksek",
      noPick: true,
      hasOpinion: false,
      couponEligible: false,
      recommendationStatus: "unavailable",
      headline: `${def.label} için veri yetersiz`,
      reasons: [
        "Markete özel Poisson veya doğrulanmış eğilim verisi bulunamadı.",
        "Eksik veriyle tahmini olasılık üretilmedi.",
        "Doğrudan oran mevcut olsa bile tek başına robot görüşü sayılmadı.",
      ],
      details: detailBase(match),
    };

    probability = round1(clamp(probability, 0, 100));
    const selectedOdd = readOdd(match, def.aliases);
    const oppositeOdd = readOdd(match, def.opposite);
    const marketProbabilityRaw = fairBinary(selectedOdd, oppositeOdd);
    const marketProbability = marketProbabilityRaw === null ? null : round1(marketProbabilityRaw);
    const independent = Boolean(match?.pro?.independentEvidence && poisson);
    const dataCompleteness = Math.min(100,
      (poisson ? 45 : 0)
      + (selectedOdd ? 10 : 0)
      + (marketProbability !== null ? 30 : 0)
      + (independent ? 15 : 0));
    const rawScore = Math.round(45 + ((probability - def.threshold) * 0.5) + (dataCompleteness * 0.15));
    const modelScore = clamp(independent ? rawScore : Math.min(rawScore, 64), 40, 82);
    const edgePercent = marketProbability === null ? null : round1(probability - marketProbability);
    const supported = Boolean(selectedOdd && probability >= def.threshold && dataCompleteness >= 55);
    const risk = !independent || dataCompleteness < 60 || (selectedOdd && selectedOdd >= 3)
      ? "Yüksek"
      : modelScore >= 72 && probability >= 65 && selectedOdd <= 2.1 ? "Düşük" : "Orta";
    const reasons = [
      poisson
        ? `Poisson beklentisi ${poisson.homeLambda.toFixed(2)}-${poisson.awayLambda.toFixed(2)}; ${def.label} olasılığı %${probability}.`
        : `${def.label} eğilimi %${probability} seviyesinde.`,
      marketProbability === null
        ? "Karşı market oranı eksik; bahis marjı temizlenmiş piyasa karşılığı hesaplanmadı."
        : `Marjı temizlenmiş piyasa karşılığı %${marketProbability}${edgePercent === null ? "" : `; model farkı ${edgePercent >= 0 ? "+" : ""}${edgePercent} puan`}.`,
      independent
        ? "PRO bağımsız takım/gol kanıtı bu genişletilmiş market hesabına eşlik ediyor."
        : "Bağımsız kanıt sınırlı; model gücü 64/100 üstüne çıkamaz ve risk yüksek tutulur.",
    ];
    return {
      match,
      type: "advanced",
      market: def.label,
      odd: selectedOdd,
      confidence: modelScore,
      modelScore,
      estimatedProbability: probability,
      marketProbability,
      edgePercent,
      dataCompleteness,
      dataQuality: independent ? "Orta" : "Sınırlı",
      modelVersion: VERSION,
      sourceMode: independent ? "poisson-plus-pro" : "poisson-baseline",
      calibration: match?.pro?.calibration || null,
      risk,
      noPick: !supported,
      hasOpinion: true,
      couponEligible: false,
      recommendationStatus: supported ? "analysis" : "watch",
      headline: supported ? `${def.label} genişletilmiş analizde öne çıkıyor` : `${def.label} izleme görüşü`,
      reasons,
      details: [
        ...detailBase(match),
        { label: "Poisson ev/deplasman", value: poisson ? `${poisson.homeLambda.toFixed(2)} / ${poisson.awayLambda.toFixed(2)}` : "Yok" },
        { label: "Doğrudan oran", value: selectedOdd ? selectedOdd.toFixed(2) : "Yok" },
        { label: "Karşı market", value: oppositeOdd ? oppositeOdd.toFixed(2) : "Yok" },
        { label: "Otomatik kupon", value: "Kapalı · mevcut PRO kupon güvenlik eşiği korunuyor" },
      ],
    };
  };

  const summarizeExpandedCoupon = (legs) => {
    const safeLegs = legs.map((leg) => leg?.couponEligible === true && !leg?.noPick
      ? leg
      : { ...leg, noPick: true, recommendationStatus: leg?.hasOpinion ? "watch" : "unavailable" });
    const opinionCount = safeLegs.filter((leg) => leg?.hasOpinion).length;
    const watchCount = safeLegs.filter((leg) => leg?.recommendationStatus === "watch").length;
    const unavailableCount = safeLegs.length - opinionCount;
    const modelScores = safeLegs.map((leg) => finite(leg?.modelScore)).filter((value) => value !== null);
    return {
      legs: safeLegs,
      pickedCount: 0,
      opinionCount,
      watchCount,
      unavailableCount,
      averageConfidence: 0,
      averageModelScore: modelScores.length ? Math.round(modelScores.reduce((sum, value) => sum + value, 0) / modelScores.length) : null,
      combinedProbability: null,
      averageDataCompleteness: 0,
      totalOdd: null,
      noPickCount: safeLegs.length,
      risk: "Yüksek",
    };
  };

  const addOptions = (root) => {
    const documentRef = root?.document;
    if (!documentRef) return false;
    const select = documentRef.querySelector("#premium-analysis-panel [data-pa3-advanced-market]");
    if (!select) return false;
    const existing = new Set([...select.options].map((option) => String(option.textContent || option.value).trim()));
    EXTRA_OPTIONS.forEach((label) => {
      if (existing.has(label)) return;
      const option = documentRef.createElement("option");
      option.textContent = label;
      option.value = label;
      select.appendChild(option);
      existing.add(label);
    });
    const details = select.closest("details");
    if (details && !details.querySelector("[data-pro14-market-note]")) {
      const note = documentRef.createElement("p");
      note.dataset.pro14MarketNote = "1";
      note.textContent = "PRO14: İY/MS 1/2 ve 2/1 dahil tam senaryo seti; fiyat veya veri eksikse seçim zorlanmaz.";
      details.appendChild(note);
    }
    const panel = documentRef.querySelector("#premium-analysis-panel");
    if (panel) panel.dataset.pro14MarketExpansion = "active";
    return true;
  };

  const install = (core, root = typeof globalThis !== "undefined" ? globalThis : null) => {
    if (!core || typeof core.analyze !== "function" || typeof core.analyzeCoupon !== "function") return false;
    if (core.__pro14MarketExpansionInstalled) {
      addOptions(root);
      return true;
    }
    const originalAnalyze = core.analyze.bind(core);
    const originalAnalyzeCoupon = core.analyzeCoupon.bind(core);

    const analyze = (input, type = "robot", advancedMarket = "") => {
      if (type !== "advanced") return originalAnalyze(input, type, advancedMarket);
      const key = canonicalMarket(advancedMarket);
      if (!key) return originalAnalyze(input, type, advancedMarket);
      const match = typeof core.normalizeMatch === "function" && !input?.timestamp
        ? core.normalizeMatch(input)
        : input;
      if (HTFT[key]) return analyzeHtft(match, key);
      if (SIMPLE[key]) return analyzeSimple(match, key);
      return originalAnalyze(input, type, advancedMarket);
    };

    const analyzeCoupon = (matches, type = "robot", advancedMarket = "") => {
      if (type !== "advanced" || !canonicalMarket(advancedMarket)) {
        return originalAnalyzeCoupon(matches, type, advancedMarket);
      }
      const legs = (Array.isArray(matches) ? matches : []).map((match) => analyze(match, type, advancedMarket));
      return summarizeExpandedCoupon(legs);
    };

    core.analyze = analyze;
    core.analyzeCoupon = analyzeCoupon;
    Object.defineProperty(core, "__pro14MarketExpansionInstalled", { value: true, configurable: false, enumerable: false });
    core.pro14MarketExpansionVersion = VERSION;
    addOptions(root);
    if (root?.document?.readyState === "loading") {
      root.document.addEventListener("DOMContentLoaded", () => addOptions(root), { once: true });
    }
    return true;
  };

  return Object.freeze({
    VERSION,
    EXTRA_OPTIONS,
    HTFT,
    SIMPLE,
    canonicalMarket,
    analyzeHtft,
    analyzeSimple,
    poissonExpanded,
    summarizeExpandedCoupon,
    addOptions,
    install,
  });
});
