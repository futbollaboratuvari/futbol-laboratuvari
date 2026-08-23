(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.FLPremiumAnalysisCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const BLOCKED_STATUSES = /live|finished|ended|cancel|postpon|suspend|abandon|ertelen|iptal|bitti|canli|canlı/i;
  const BLOCKED_DECISIONS = /oynama|değerli market yok|degerli market yok|seçim yok|secim yok|pas geç|pas gec/i;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const finite = (value) => {
    const parsed = Number(String(value ?? "").replace(",", ".").replace(/[^0-9.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  };
  const percent = (value) => {
    const parsed = finite(value);
    return parsed === null ? null : clamp(parsed, 0, 100);
  };
  const odd = (value) => {
    const parsed = finite(value);
    return parsed !== null && parsed > 1 ? parsed : null;
  };
  const first = (...values) => values.find((value) => value !== undefined && value !== null && value !== "" && value !== "-");

  const normalizeText = (value) => String(value ?? "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  const dateTimeValue = (date, time) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ""))) return null;
    const cleanTime = /^\d{1,2}:\d{2}$/.test(String(time || "")) ? String(time) : "23:59";
    const value = Date.parse(`${date}T${cleanTime.padStart(5, "0")}:00+03:00`);
    return Number.isFinite(value) ? value : null;
  };

  const readOdd = (match, keys) => {
    const sources = [match, match?.available_odds, match?.odds, match?.oranlar, match?.raw_market_guess_odds];
    for (const source of sources) {
      for (const key of keys) {
        const value = odd(source?.[key]);
        if (value !== null) return value;
      }
    }
    return null;
  };

  const normalizeMatch = (match, index = 0) => {
    const rawTitle = first(match?.match_name, match?.match, match?.title, "");
    const titleParts = String(rawTitle || "").split(/\s+(?:vs\.?|v|-)\s+/i);
    const home = String(first(match?.home, match?.home_team_name, match?.ev_sahibi, titleParts[0], "Ev sahibi")).trim();
    const away = String(first(match?.away, match?.away_team_name, match?.deplasman, titleParts[1], "Deplasman")).trim();
    const date = String(first(match?.date, match?.tarih, "")).slice(0, 10);
    const time = String(first(match?.time, match?.saat, match?.start_time, "--:--")).slice(0, 5);
    const status = String(first(match?.status, match?.liveStatus, match?.state, "scheduled"));
    const matchCode = String(first(match?.matchCode, match?.match_code, match?.mac_kodu, ""));
    const identity = matchCode || `${date}-${time}-${normalizeText(home)}-${normalizeText(away)}-${index}`;
    const availableOdds = {
      ms1: readOdd(match, ["ms1", "one", "oneOdd", "odd1"]),
      msx: readOdd(match, ["msx", "draw", "drawOdd", "oddX"]),
      ms2: readOdd(match, ["ms2", "two", "twoOdd", "odd2"]),
      over25: readOdd(match, ["over25", "ust25", "over", "ust"]),
      under25: readOdd(match, ["under25", "alt25", "under", "alt"]),
      bttsYes: readOdd(match, ["bttsYes", "bttsYes_guess", "kgVar", "kg_var", "varOdd"]),
      bttsNo: readOdd(match, ["bttsNo", "bttsNo_guess", "kgYok", "kg_yok", "yokOdd"]),
      firstHalfBttsYes: readOdd(match, ["firstHalfBttsYes", "firstHalfBttsYes_guess", "iyKgVar", "iy_kg_var"]),
      secondHalfBttsYes: readOdd(match, ["secondHalfBttsYes", "secondHalfBttsYes_guess", "ikinciYariKgVar", "ikinci_yari_kg_var"]),
      firstHalfHome: readOdd(match, ["firstHalf1", "firstHalf1_guess", "iy1"]),
      firstHalfDraw: readOdd(match, ["firstHalfX", "firstHalfX_guess", "iyx"]),
      firstHalfAway: readOdd(match, ["firstHalf2", "firstHalf2_guess", "iy2"]),
    };

    return {
      id: identity,
      date,
      time,
      timestamp: dateTimeValue(date, time),
      league: String(first(match?.league, match?.competition_name, match?.lig, "Lig")),
      home,
      away,
      status,
      matchCode,
      decision: String(first(match?.decision, "")),
      recommendedMarket: String(first(match?.recommended_market, match?.suggested_option, match?.prediction, "")),
      recommendedOdd: odd(first(match?.estimated_odds, match?.suggested_odds)),
      analysisScore: percent(first(match?.analysis_score, match?.confidence_score, match?.confidence)),
      riskLevel: String(first(match?.risk_level, "")),
      reason: String(first(match?.robot_reason, match?.robot_comment, match?.commentary, "")),
      metricQuality: String(first(match?.metric_quality, "unknown")),
      metrics: {
        homeScored: finite(first(match?.homeScoredLast10, match?.metrics?.homeScoredLast10)),
        awayScored: finite(first(match?.awayScoredLast10, match?.metrics?.awayScoredLast10)),
        homeConceded: finite(first(match?.homeConcededLast10, match?.metrics?.homeConcededLast10)),
        awayConceded: finite(first(match?.awayConcededLast10, match?.metrics?.awayConcededLast10)),
        btts: percent(first(match?.bttsPercent, match?.metrics?.bttsPercent)),
        over25: percent(first(match?.over25Percent, match?.metrics?.over25Percent)),
        over35: percent(first(match?.over35Percent, match?.metrics?.over35Percent)),
        firstHalfGoal: percent(first(match?.firstHalfGoalTrend, match?.metrics?.firstHalfGoalTrend)),
        secondHalfGoal: percent(first(match?.secondHalfGoalTrend, match?.metrics?.secondHalfGoalTrend)),
        leagueGoalAverage: finite(first(match?.leagueGoalAverage, match?.metrics?.leagueGoalAverage)),
      },
      odds: availableOdds,
      source: match,
    };
  };

  const normalizeMatches = (matches) => (Array.isArray(matches) ? matches : []).map(normalizeMatch);

  const isUpcoming = (match, now = new Date()) => {
    const normalized = Object.prototype.hasOwnProperty.call(match || {}, "timestamp") && match?.odds
      ? match
      : normalizeMatch(match);
    if (BLOCKED_STATUSES.test(normalized.status)) return false;
    if (normalized.timestamp === null) return normalized.status.toLocaleLowerCase("tr-TR") === "scheduled";
    return normalized.timestamp >= now.getTime() - (5 * 60 * 1000);
  };

  const filterUpcoming = (matches, now = new Date()) => normalizeMatches(matches)
    .filter((match) => isUpcoming(match, now))
    .sort((a, b) => (a.timestamp ?? Number.MAX_SAFE_INTEGER) - (b.timestamp ?? Number.MAX_SAFE_INTEGER));

  const filterMatches = (matches, options = {}) => {
    const query = normalizeText(options.query || "");
    const date = String(options.date || "");
    return (Array.isArray(matches) ? matches : []).filter((match) => {
      if (date && match.date !== date) return false;
      if (!query) return true;
      return normalizeText(`${match.league} ${match.home} ${match.away} ${match.matchCode}`).includes(query);
    });
  };

  const impliedProbabilities = (match) => {
    const values = [match.odds.ms1, match.odds.msx, match.odds.ms2];
    if (!values.every((value) => value && value > 1)) return null;
    const inverses = values.map((value) => 1 / value);
    const total = inverses.reduce((sum, value) => sum + value, 0);
    return {
      home: (inverses[0] / total) * 100,
      draw: (inverses[1] / total) * 100,
      away: (inverses[2] / total) * 100,
    };
  };

  const riskFor = (confidence, selectedOdd, forcedRisk = "") => {
    const stated = normalizeText(forcedRisk);
    if (stated.includes("yuksek")) return "Yüksek";
    if (stated.includes("dusuk")) return "Düşük";
    if (confidence >= 70 && (!selectedOdd || selectedOdd <= 2.2)) return "Düşük";
    if (confidence < 57 || (selectedOdd && selectedOdd >= 3)) return "Yüksek";
    return "Orta";
  };

  const marketKey = (market) => {
    const text = normalizeText(market);
    if (/iy ms 1 1|ilk yari mac sonucu 1 1/.test(text)) return "htft11";
    if (/iy ms x 1|ilk yari mac sonucu x 1/.test(text)) return "htftx1";
    if (/iy ms 2 2|ilk yari mac sonucu 2 2/.test(text)) return "htft22";
    if (/1y kg|ilk yari kg/.test(text)) return "firstHalfBttsYes";
    if (/2y kg|ikinci yari kg/.test(text)) return "secondHalfBttsYes";
    if (/kg var|karsilikli gol var/.test(text)) return "bttsYes";
    if (/kg yok|karsilikli gol yok/.test(text)) return "bttsNo";
    if (/3 5.*ust/.test(text)) return "over35";
    if (/2 5.*ust/.test(text)) return "over25";
    if (/2 5.*alt/.test(text)) return "under25";
    if (/ms 1|mac sonucu 1|ev sahibi/.test(text)) return "ms1";
    if (/ms x|mac sonucu x|beraberlik/.test(text)) return "msx";
    if (/ms 2|mac sonucu 2|deplasman/.test(text)) return "ms2";
    return "";
  };

  const marketLabel = (key) => ({
    ms1: "MS 1",
    msx: "MS X",
    ms2: "MS 2",
    over25: "2.5 Üst",
    under25: "2.5 Alt",
    over35: "3.5 Üst",
    bttsYes: "KG Var",
    bttsNo: "KG Yok",
    firstHalfBttsYes: "1Y KG Var",
    secondHalfBttsYes: "2Y KG Var",
    htft11: "İY/MS 1/1",
    htftx1: "İY/MS X/1",
    htft22: "İY/MS 2/2",
  }[key] || key || "Seçim yok");

  const oddsForMarket = (match, market) => {
    const key = marketKey(market);
    if (key === "htft11" || key === "htftx1" || key === "htft22" || key === "over35") return null;
    return match.odds[key] ?? null;
  };

  const detailRows = (match, probabilities) => [
    { label: "Lig gol ortalaması", value: match.metrics.leagueGoalAverage === null ? "Veri yok" : match.metrics.leagueGoalAverage.toFixed(2) },
    { label: "2.5 üst eğilimi", value: match.metrics.over25 === null ? "Veri yok" : `%${Math.round(match.metrics.over25)}` },
    { label: "Karşılıklı gol eğilimi", value: match.metrics.btts === null ? "Veri yok" : `%${Math.round(match.metrics.btts)}` },
    { label: "İkinci yarı gol eğilimi", value: match.metrics.secondHalfGoal === null ? "Veri yok" : `%${Math.round(match.metrics.secondHalfGoal)}` },
    { label: "Piyasa dengesi", value: probabilities ? `%${Math.round(probabilities.home)} / %${Math.round(probabilities.draw)} / %${Math.round(probabilities.away)}` : "Oran verisi eksik" },
    { label: "Veri niteliği", value: normalizeText(match.metricQuality).includes("proxy") ? "Model destekli" : "Güncel kayıt" },
  ];

  const noPickResult = (match, type, reasons) => ({
    match,
    type,
    market: "Seçim yok",
    odd: null,
    confidence: clamp(Math.round(match.analysisScore || 50), 42, 58),
    risk: "Yüksek",
    noPick: true,
    headline: "Bu maçta güçlü seçim oluşmadı",
    reasons: (reasons || [
      "Mevcut göstergeler tek bir seçeneği yeterince ayırmıyor.",
      "Oran ve eğilim dengesi güven eşiğinin altında kalıyor.",
      "Maçı izleme listesinde tutmak daha kontrollü bir yaklaşım.",
    ]).slice(0, 3),
    details: detailRows(match, impliedProbabilities(match)),
  });

  const analyzeMatchResult = (match, forcedKey = "") => {
    const probabilities = impliedProbabilities(match);
    const labels = { ms1: "home", msx: "draw", ms2: "away" };
    let key = forcedKey && labels[forcedKey] ? forcedKey : "";
    if (!key && probabilities) {
      key = Object.entries(labels).sort((a, b) => probabilities[b[1]] - probabilities[a[1]])[0][0];
    }
    if (!key) {
      const available = ["ms1", "msx", "ms2"].filter((item) => match.odds[item]);
      key = available.sort((a, b) => match.odds[a] - match.odds[b])[0] || "";
    }
    if (!key) return noPickResult(match, "match", [
      "Maç sonucu için üçlü oran dengesi tamamlanmamış.",
      "Taraf üstünlüğünü doğrulayacak yeterli veri bulunmuyor.",
      "Eksik veriyle zorunlu seçim üretilmedi.",
    ]);

    const ordered = probabilities
      ? Object.values(probabilities).sort((a, b) => b - a)
      : [50, 35, 15];
    const lead = probabilities ? probabilities[labels[key]] : (100 / match.odds[key]);
    const margin = Math.max(0, ordered[0] - ordered[1]);
    const confidence = clamp(Math.round(49 + (lead - 33) * 0.7 + margin * 0.25), 50, 82);
    const selectedOdd = match.odds[key];
    const side = key === "ms1" ? match.home : key === "ms2" ? match.away : "Beraberlik";
    const reasons = [
      probabilities
        ? `${side} seçeneği üçlü oran dengesinde %${Math.round(lead)} ile öne çıkıyor.`
        : `${side} seçeneği mevcut fiyatlamada öne çıkıyor.`,
      margin >= 12
        ? `En yakın alternatife göre ${Math.round(margin)} puanlık belirgin ayrışma var.`
        : "Alternatif sonuçlar birbirine yakın; güven seviyesi kontrollü tutuldu.",
      selectedOdd
        ? `${selectedOdd.toFixed(2)} oranı risk hesabına birlikte dahil edildi.`
        : "Oran eksik olduğu için fiyat avantajı değerlendirmeye alınamadı.",
    ];
    return {
      match,
      type: "match",
      market: marketLabel(key),
      odd: selectedOdd,
      confidence,
      risk: riskFor(confidence, selectedOdd, match.riskLevel),
      noPick: false,
      headline: `${marketLabel(key)} öne çıkıyor`,
      reasons,
      details: detailRows(match, probabilities),
    };
  };

  const goalStrengths = (match) => {
    const leagueSignal = match.metrics.leagueGoalAverage === null
      ? null
      : clamp(50 + (match.metrics.leagueGoalAverage - 2.5) * 22, 25, 78);
    const overSignal = match.metrics.over25 ?? leagueSignal ?? 50;
    const bttsSignal = match.metrics.btts ?? 50;
    const lateSignal = match.metrics.secondHalfGoal ?? 50;
    const over = clamp((overSignal * 0.62) + (leagueSignal ?? overSignal) * 0.23 + (lateSignal * 0.15), 0, 100);
    return {
      over25: over,
      under25: 100 - over,
      bttsYes: bttsSignal,
      bttsNo: 100 - bttsSignal,
      firstHalfBttsYes: match.metrics.firstHalfGoal ?? 45,
      secondHalfBttsYes: match.metrics.secondHalfGoal ?? 50,
    };
  };

  const analyzeGoals = (match, forcedKey = "") => {
    const strengths = goalStrengths(match);
    const allowed = Object.keys(strengths);
    const primary = ["over25", "under25", "bttsYes", "bttsNo"];
    const key = forcedKey && allowed.includes(forcedKey)
      ? forcedKey
      : primary.sort((a, b) => strengths[b] - strengths[a])[0];
    const strength = strengths[key];
    if (!key || strength < 54) return noPickResult(match, "goals", [
      "Gol göstergeleri aynı yönde yeterince güçlü birleşmiyor.",
      "Üst, alt ve karşılıklı gol seçenekleri arasında net ayrışma yok.",
      "Güven eşiği aşılmadığı için seçim zorlanmadı.",
    ]);

    const confidence = clamp(Math.round(52 + (strength - 50) * 0.85), 54, 81);
    const selectedOdd = match.odds[key] ?? null;
    const isBtts = key === "bttsYes" || key === "bttsNo";
    const mainMetric = isBtts ? match.metrics.btts : match.metrics.over25;
    const reasons = [
      mainMetric === null
        ? "Gol profili lig ortalaması ve mevcut oran dengesiyle modellendi."
        : `${isBtts ? "Karşılıklı gol" : "2.5 gol"} eğilimi %${Math.round(mainMetric)} seviyesinde.`,
      match.metrics.leagueGoalAverage === null
        ? "Lig gol ortalaması eksik; güven seviyesi sınırlı tutuldu."
        : `Ligin maç başı gol ortalaması ${match.metrics.leagueGoalAverage.toFixed(2)}.`,
      match.metrics.secondHalfGoal === null
        ? "Devre eğilimi bulunmadığı için ek senaryo kurulmadı."
        : `İkinci yarı gol eğilimi %${Math.round(match.metrics.secondHalfGoal)} ile senaryoyu destekliyor.`,
    ];
    return {
      match,
      type: "goals",
      market: marketLabel(key),
      odd: selectedOdd,
      confidence,
      risk: riskFor(confidence, selectedOdd, match.riskLevel),
      noPick: false,
      headline: `${marketLabel(key)} gol senaryosunda öne çıkıyor`,
      reasons,
      details: detailRows(match, impliedProbabilities(match)),
    };
  };

  const analyzeAdvanced = (match, market) => {
    const key = marketKey(market);
    if (["ms1", "msx", "ms2"].includes(key)) return analyzeMatchResult(match, key);
    if (["over25", "under25", "bttsYes", "bttsNo", "firstHalfBttsYes", "secondHalfBttsYes"].includes(key)) {
      return analyzeGoals(match, key);
    }
    if (["htft11", "htftx1", "htft22"].includes(key)) {
      const result = analyzeMatchResult(match, key === "htft22" ? "ms2" : "ms1");
      if (result.noPick) return result;
      const confidence = clamp(result.confidence - 10, 45, 70);
      return {
        ...result,
        type: "advanced",
        market: marketLabel(key),
        odd: null,
        confidence,
        risk: "Yüksek",
        headline: `${marketLabel(key)} senaryosu incelendi`,
        reasons: [
          `${result.market} taraf eğilimi, devre/maç senaryosunun ana dayanağı.`,
          "Devre sonucu oranı bulunmadığı için fiyat avantajı hesaplanmadı.",
          "Birleşik market yapısı nedeniyle risk seviyesi yüksek tutuldu.",
        ],
      };
    }
    return noPickResult(match, "advanced", [
      "Seçilen gelişmiş market için yeterli veri eşleşmesi yok.",
      "Oran ve eğilim doğrulaması tamamlanamadı.",
      "Eksik veride yapay seçim üretilmedi.",
    ]);
  };

  const analyzeRobot = (match) => {
    const blocked = BLOCKED_DECISIONS.test(`${match.decision} ${match.recommendedMarket}`);
    if (blocked && (match.analysisScore === null || match.analysisScore < 60)) {
      return noPickResult(match, "robot", [
        "Güncel değerlendirme bu maç için oynama eşiğini aşmıyor.",
        "Sinyaller arasında yeterli ortak yön bulunmuyor.",
        "Sistem, zorunlu tahmin yerine izleme kararı veriyor.",
      ]);
    }

    const explicitKey = marketKey(match.recommendedMarket);
    let result;
    if (["ms1", "msx", "ms2"].includes(explicitKey)) result = analyzeMatchResult(match, explicitKey);
    else if (explicitKey) result = analyzeAdvanced(match, match.recommendedMarket);
    else {
      const matchResult = analyzeMatchResult(match);
      const goalResult = analyzeGoals(match);
      const candidates = [matchResult, goalResult].filter((item) => !item.noPick);
      result = candidates.sort((a, b) => b.confidence - a.confidence)[0] || noPickResult(match, "robot");
    }

    if (match.analysisScore !== null && match.analysisScore >= 35 && !result.noPick) {
      result.confidence = clamp(Math.round((result.confidence * 0.65) + (match.analysisScore * 0.35)), 48, 84);
      result.risk = riskFor(result.confidence, result.odd, match.riskLevel);
    }
    if (match.reason && !result.noPick) result.reasons[0] = match.reason;
    return { ...result, type: "robot" };
  };

  const analyze = (input, type = "robot", advancedMarket = "") => {
    const match = input?.source ? input : normalizeMatch(input);
    if (type === "match") return analyzeMatchResult(match);
    if (type === "goals") return analyzeGoals(match);
    if (type === "advanced") return analyzeAdvanced(match, advancedMarket);
    return analyzeRobot(match);
  };

  const analyzeCoupon = (matches, type = "robot", advancedMarket = "") => {
    const legs = (Array.isArray(matches) ? matches : []).map((match) => analyze(match, type, advancedMarket));
    const picked = legs.filter((leg) => !leg.noPick);
    const averageConfidence = picked.length
      ? Math.round(picked.reduce((sum, leg) => sum + leg.confidence, 0) / picked.length)
      : 0;
    const validOdds = legs.map((leg) => leg.odd).filter((value) => value && value > 1);
    const totalOdd = legs.length && validOdds.length === legs.length
      ? Number(validOdds.reduce((total, value) => total * value, 1).toFixed(2))
      : null;
    const risk = !picked.length || averageConfidence < 57 || legs.length >= 7
      ? "Yüksek"
      : averageConfidence >= 70 && legs.length <= 3 ? "Düşük" : "Orta";
    return { legs, pickedCount: picked.length, averageConfidence, totalOdd, risk };
  };

  return {
    analyze,
    analyzeCoupon,
    filterMatches,
    filterUpcoming,
    isUpcoming,
    marketKey,
    marketLabel,
    normalizeMatch,
    normalizeMatches,
    normalizeText,
    oddsForMarket,
  };
});
