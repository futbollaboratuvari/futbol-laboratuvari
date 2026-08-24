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
    if (value === undefined || value === null || value === "" || value === "-") return null;
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
    const pro = match?.proAnalysis || match?.pro_analysis || match?.pro || {};
    const rawTitle = first(match?.match_name, match?.match, match?.title, "") ?? "";
    const titleParts = String(rawTitle || "").split(/\s+(?:vs\.?|v|-)\s+/i);
    const home = String(first(match?.home, match?.home_team_name, match?.ev_sahibi, titleParts[0], "Ev sahibi")).trim();
    const away = String(first(match?.away, match?.away_team_name, match?.deplasman, titleParts[1], "Deplasman")).trim();
    const date = String(first(match?.date, match?.tarih, "") ?? "").slice(0, 10);
    const time = String(first(match?.time, match?.saat, match?.start_time, "--:--")).slice(0, 5);
    const status = String(first(match?.status, match?.liveStatus, match?.state, "scheduled"));
    const matchCode = String(first(match?.matchCode, match?.match_code, match?.mac_kodu, "") ?? "");
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
      decision: String(first(match?.decision, "") ?? ""),
      recommendedMarket: String(first(pro?.recommended_market, match?.recommended_market, match?.suggested_option, match?.prediction, "") ?? ""),
      recommendedOdd: odd(first(pro?.recommended_odd, match?.estimated_odds, match?.suggested_odds)),
      analysisScore: percent(first(pro?.model_score, match?.model_score, match?.analysis_score, match?.confidence_score, match?.confidence)),
      riskLevel: String(first(pro?.risk_level, match?.risk_level, "") ?? ""),
      reason: String(first(pro?.signals?.[0], match?.robot_reason, match?.robot_comment, match?.commentary, "") ?? ""),
      metricQuality: String(first(pro?.data_quality, match?.metric_quality, "unknown")),
      pro: {
        available: Boolean(pro?.available ?? pro?.recommended_market),
        fresh: pro?.fresh !== false,
        generatedAt: String(first(pro?.generated_at, "") ?? ""),
        modelVersion: String(first(pro?.model_version, match?.model_version, "") ?? ""),
        modelScore: percent(first(pro?.model_score, match?.model_score, match?.analysis_score)),
        estimatedProbability: percent(first(pro?.estimated_probability, match?.estimated_probability)),
        marketProbability: percent(first(pro?.market_probability, match?.market_probability)),
        edgePercent: finite(first(pro?.edge_percent, match?.edge_percent)),
        dataCompleteness: percent(first(pro?.data_completeness, match?.data_completeness)),
        dataQuality: String(first(pro?.data_quality, "Sınırlı")),
        evidenceMode: String(first(pro?.evidence_mode, "market_baseline")),
        independentEvidence: Boolean(pro?.independent_evidence),
        probabilitySource: Array.isArray(pro?.probability_source) ? pro.probability_source.map(String).slice(0, 4) : [],
        dataGapRisk: String(first(pro?.data_gap_risk, match?.data_gap_risk, "Yüksek")),
        riskLevel: String(first(pro?.risk_level, match?.risk_level, "Yüksek")),
        recommendedMarket: String(first(pro?.recommended_market, match?.recommended_market, "") ?? ""),
        recommendedOdd: odd(first(pro?.recommended_odd, match?.estimated_odds)),
        includeInCoupon: Boolean(pro?.include_in_coupon),
        valueLabel: String(first(pro?.value_label, "") ?? ""),
        signals: Array.isArray(pro?.signals) ? pro.signals.map(String).filter(Boolean).slice(0, 7) : [],
        calibration: pro?.calibration && typeof pro.calibration === "object" ? pro.calibration : null,
      },
      metrics: {
        homeScored: finite(first(pro?.metrics?.homeScoredLast10, match?.homeScoredLast10, match?.metrics?.homeScoredLast10)),
        awayScored: finite(first(pro?.metrics?.awayScoredLast10, match?.awayScoredLast10, match?.metrics?.awayScoredLast10)),
        homeConceded: finite(first(pro?.metrics?.homeConcededLast10, match?.homeConcededLast10, match?.metrics?.homeConcededLast10)),
        awayConceded: finite(first(pro?.metrics?.awayConcededLast10, match?.awayConcededLast10, match?.metrics?.awayConcededLast10)),
        btts: percent(first(pro?.metrics?.bttsPercent, match?.bttsPercent, match?.metrics?.bttsPercent)),
        over25: percent(first(pro?.metrics?.over25Percent, match?.over25Percent, match?.metrics?.over25Percent)),
        over35: percent(first(pro?.metrics?.over35Percent, match?.over35Percent, match?.metrics?.over35Percent)),
        firstHalfGoal: percent(first(pro?.metrics?.firstHalfGoalTrend, match?.firstHalfGoalTrend, match?.metrics?.firstHalfGoalTrend)),
        secondHalfGoal: percent(first(pro?.metrics?.secondHalfGoalTrend, match?.secondHalfGoalTrend, match?.metrics?.secondHalfGoalTrend)),
        leagueGoalAverage: finite(first(pro?.metrics?.leagueGoalAverage, match?.leagueGoalAverage, match?.metrics?.leagueGoalAverage)),
        poissonHome: finite(first(pro?.metrics?.poisson?.homeLambda, pro?.metrics?.poisson?.home_lambda, pro?.metrics?.poisson_home)),
        poissonAway: finite(first(pro?.metrics?.poisson?.awayLambda, pro?.metrics?.poisson?.away_lambda, pro?.metrics?.poisson_away)),
      },
      odds: availableOdds,
      source: match,
    };
  };

  const normalizeMatches = (matches) => (Array.isArray(matches) ? matches : []).map(normalizeMatch);
  const isNormalizedMatch = (match) => Object.prototype.hasOwnProperty.call(match || {}, "timestamp")
    && Boolean(match?.odds && match?.metrics && match?.pro);

  const joinKeysFor = (match) => {
    const normalized = isNormalizedMatch(match) ? match : normalizeMatch(match);
    const teams = `${normalizeText(normalized.home)}|${normalizeText(normalized.away)}`;
    return [
      normalized.matchCode ? `code:${normalized.matchCode}` : "",
      `full:${normalized.date}|${normalized.time}|${teams}`,
      `date:${normalized.date}|${teams}`,
    ].filter(Boolean);
  };

  const mergeProAnalysis = (matches, payload, now = new Date()) => {
    const rows = Array.isArray(payload) ? payload : Array.isArray(payload?.matches) ? payload.matches : [];
    if (!Array.isArray(matches) || !rows.length) return Array.isArray(matches) ? matches.slice() : [];
    const generatedAt = String(payload?.generated_at || "");
    const generatedTime = Date.parse(generatedAt);
    const age = Number.isFinite(generatedTime) ? now.getTime() - generatedTime : Number.POSITIVE_INFINITY;
    const fresh = age >= -(15 * 60 * 1000) && age <= (6 * 60 * 60 * 1000);
    const lookup = new Map();
    rows.forEach((row) => joinKeysFor(row).forEach((key) => {
      if (!lookup.has(key)) lookup.set(key, row);
    }));
    return matches.map((match) => {
      const row = joinKeysFor(match).map((key) => lookup.get(key)).find(Boolean);
      if (!row) return match;
      return {
        ...match,
        proAnalysis: {
          ...row,
          available: true,
          fresh,
          generated_at: generatedAt,
          calibration: payload?.calibration || null,
          model_version: row.model_version || payload?.model_version || "",
        },
      };
    });
  };

  const isUpcoming = (match, now = new Date()) => {
    const normalized = isNormalizedMatch(match) ? match : normalizeMatch(match);
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

  const detailRows = (match, probabilities) => {
    const rows = [
      { label: "Lig gol ortalaması", value: match.metrics.leagueGoalAverage === null ? "Veri yok" : match.metrics.leagueGoalAverage.toFixed(2) },
      { label: "2.5 üst eğilimi", value: match.metrics.over25 === null ? "Veri yok" : `%${Math.round(match.metrics.over25)}` },
      { label: "Karşılıklı gol eğilimi", value: match.metrics.btts === null ? "Veri yok" : `%${Math.round(match.metrics.btts)}` },
      { label: "İkinci yarı gol eğilimi", value: match.metrics.secondHalfGoal === null ? "Veri yok" : `%${Math.round(match.metrics.secondHalfGoal)}` },
      { label: "Piyasa dengesi", value: probabilities ? `%${Math.round(probabilities.home)} / %${Math.round(probabilities.draw)} / %${Math.round(probabilities.away)}` : "Oran verisi eksik" },
    ];
    if (match.pro.available) {
      rows.push(
        { label: "PRO model gücü", value: match.pro.modelScore === null ? "Ölçülmedi" : `${Math.round(match.pro.modelScore)}/100` },
        { label: "Tahmini olasılık", value: match.pro.estimatedProbability === null ? "Biriktiriliyor" : `%${Math.round(match.pro.estimatedProbability)}` },
        { label: "Veri kapsama", value: match.pro.dataCompleteness === null ? "Bilinmiyor" : `%${Math.round(match.pro.dataCompleteness)} · ${match.pro.dataQuality}` },
        { label: "Kanıt modu", value: match.pro.independentEvidence ? "Piyasa + bağımsız form/gol verisi" : "Piyasa tabanı · bağımsız örnek sınırlı" },
      );
    } else {
      rows.push({ label: "Veri niteliği", value: normalizeText(match.metricQuality).includes("proxy") ? "Oran destekli sınırlı veri" : "Piyasa verisi" });
    }
    return rows;
  };

  const noPickResult = (match, type, reasons) => {
    const measuredModelScore = match.pro.modelScore ?? match.analysisScore;
    return {
      match,
      type,
      market: "Seçim yok",
      odd: null,
      confidence: measuredModelScore === null ? null : clamp(Math.round(measuredModelScore), 42, 58),
      modelScore: measuredModelScore,
      estimatedProbability: match.pro.estimatedProbability,
      marketProbability: match.pro.marketProbability,
      edgePercent: match.pro.edgePercent,
      dataCompleteness: match.pro.dataCompleteness ?? 0,
      dataQuality: match.pro.dataQuality || "Sınırlı",
      modelVersion: match.pro.modelVersion || "",
      sourceMode: match.pro.available ? "pro" : "market",
      calibration: match.pro.calibration,
      risk: "Yüksek",
      noPick: true,
      headline: "Bu maçta güçlü seçim oluşmadı",
      reasons: (reasons || [
        "Mevcut göstergeler tek bir seçeneği yeterince ayırmıyor.",
        "Oran ve eğilim dengesi güven eşiğinin altında kalıyor.",
        "Maçı izleme listesinde tutmak daha kontrollü bir yaklaşım.",
      ]).slice(0, 3),
      details: detailRows(match, impliedProbabilities(match)),
    };
  };

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
      modelScore: confidence,
      estimatedProbability: Number.isFinite(lead) ? Number(lead.toFixed(1)) : null,
      marketProbability: Number.isFinite(lead) ? Number(lead.toFixed(1)) : null,
      edgePercent: 0,
      dataCompleteness: probabilities ? 45 : 20,
      dataQuality: probabilities ? "Orta" : "Sınırlı",
      modelVersion: "market-baseline-v1",
      sourceMode: "market",
      calibration: null,
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

  const binaryMarketProbability = (selectedOdd, oppositeOdd) => {
    if (!selectedOdd || !oppositeOdd) return null;
    const selected = 1 / selectedOdd;
    const opposite = 1 / oppositeOdd;
    return (selected / (selected + opposite)) * 100;
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
    const oppositeKey = ({ over25: "under25", under25: "over25", bttsYes: "bttsNo", bttsNo: "bttsYes" })[key];
    const marketProbability = oppositeKey ? binaryMarketProbability(selectedOdd, match.odds[oppositeKey]) : null;
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
      modelScore: confidence,
      estimatedProbability: Number(strength.toFixed(1)),
      marketProbability: marketProbability === null ? null : Number(marketProbability.toFixed(1)),
      edgePercent: marketProbability === null ? null : Number((strength - marketProbability).toFixed(1)),
      dataCompleteness: [mainMetric, match.metrics.leagueGoalAverage, match.metrics.secondHalfGoal].filter((value) => value !== null).length * 22,
      dataQuality: mainMetric !== null && match.metrics.leagueGoalAverage !== null ? "Orta" : "Sınırlı",
      modelVersion: "goal-trend-v1",
      sourceMode: "trend",
      calibration: null,
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
    const pro = match.pro;
    if (!pro.available) {
      return noPickResult(match, "robot", [
        "Bu karşılaşma için güncel PRO veri kaydı henüz eşleşmedi.",
        "Yalnız oran verisine bakarak robot seçimi üretilmedi.",
        "PRO veri akışı yenilendiğinde analiz otomatik olarak kullanılabilir olacak.",
      ]);
    }
    if (!pro.fresh) {
      return noPickResult(match, "robot", [
        "PRO veri kaydı güncellik süresini aştı.",
        "Eski model çıktısı yeni tahmin gibi gösterilmedi.",
        "Bir sonraki veri yenilemesinden sonra tekrar analiz edebilirsin.",
      ]);
    }

    const blocked = BLOCKED_DECISIONS.test(`${match.decision} ${pro.recommendedMarket}`);
    const modelScore = pro.modelScore ?? 0;
    const dataCompleteness = pro.dataCompleteness ?? 0;
    if (blocked || modelScore < 60 || dataCompleteness < 35) {
      return noPickResult(match, "robot", [
        modelScore < 60 ? `PRO model gücü ${Math.round(modelScore)}/100 ile seçim eşiğinin altında.` : "Güncel PRO kararı bu maçı oynama eşiğinin dışında tutuyor.",
        dataCompleteness < 35 ? `Veri kapsama %${Math.round(dataCompleteness)}; güvenilir seçim için yetersiz.` : "Sinyaller tek bir markette yeterince birleşmiyor.",
        "Sistem zorunlu tahmin yerine açık bir seçim yok kararı veriyor.",
      ]);
    }

    const explicitKey = marketKey(pro.recommendedMarket);
    if (!explicitKey) return noPickResult(match, "robot", [
      "PRO çıktısındaki market güvenli biçimde eşleştirilemedi.",
      "Bilinmeyen market için tahmin uydurulmadı.",
      "Market eşlemesi güncellendiğinde analiz yeniden kullanılabilir olacak.",
    ]);

    const reasons = pro.signals
      .filter((value) => !/^(market:|oran:|veri tipi:|değer etiketi:)/i.test(String(value).trim()))
      .slice(0, 3);
    const fallbackReasons = [
      "PRO model ve piyasa dengesi birlikte kontrol edildi.",
      `Veri kapsama puanı ${Math.round(dataCompleteness)}/100 olarak ölçüldü.`,
      pro.edgePercent === null ? "Market farkı ölçülemedi; risk seviyesi buna göre sınırlandı." : `Model-piyasa farkı ${pro.edgePercent >= 0 ? "+" : ""}${pro.edgePercent.toFixed(1)} puan.`,
    ];
    while (reasons.length < 3) reasons.push(fallbackReasons[reasons.length] || fallbackReasons[0]);
    return {
      match,
      type: "robot",
      market: marketLabel(explicitKey),
      odd: pro.recommendedOdd ?? oddsForMarket(match, pro.recommendedMarket),
      confidence: Math.round(modelScore),
      modelScore: Math.round(modelScore),
      estimatedProbability: pro.estimatedProbability,
      marketProbability: pro.marketProbability,
      edgePercent: pro.edgePercent,
      dataCompleteness: Math.round(dataCompleteness),
      dataQuality: pro.dataQuality,
      modelVersion: pro.modelVersion,
      sourceMode: "pro",
      calibration: pro.calibration,
      risk: pro.riskLevel || riskFor(modelScore, pro.recommendedOdd, match.riskLevel),
      noPick: false,
      headline: `${marketLabel(explicitKey)} PRO ortak sinyallerinde öne çıkıyor`,
      reasons,
      details: detailRows(match, impliedProbabilities(match)),
    };
  };

  const analyze = (input, type = "robot", advancedMarket = "") => {
    const match = isNormalizedMatch(input) ? input : normalizeMatch(input);
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
    const measuredModelScores = legs
      .map((leg) => finite(leg.modelScore))
      .filter((value) => value !== null);
    const averageModelScore = measuredModelScores.length
      ? Math.round(measuredModelScores.reduce((sum, value) => sum + value, 0) / measuredModelScores.length)
      : null;
    const probabilityLegs = picked
      .map((leg) => finite(leg.estimatedProbability))
      .filter((value) => value !== null && value >= 0 && value <= 100);
    const combinedProbability = picked.length
      && picked.length === legs.length
      && probabilityLegs.length === picked.length
      ? Number((probabilityLegs.reduce((total, value) => total * (value / 100), 1) * 100).toFixed(2))
      : null;
    const qualityLegs = picked
      .map((leg) => finite(leg.dataCompleteness))
      .filter((value) => value !== null);
    const averageDataCompleteness = qualityLegs.length
      ? Math.round(qualityLegs.reduce((sum, value) => sum + value, 0) / qualityLegs.length)
      : 0;
    const validOdds = legs.map((leg) => leg.odd).filter((value) => value && value > 1);
    const totalOdd = legs.length && validOdds.length === legs.length
      ? Number(validOdds.reduce((total, value) => total * value, 1).toFixed(2))
      : null;
    const noPickCount = legs.length - picked.length;
    const risk = !picked.length || noPickCount > 0 || averageConfidence < 57
      || (combinedProbability !== null && combinedProbability < 12) || legs.length >= 7
      ? "Yüksek"
      : averageConfidence >= 70 && averageDataCompleteness >= 60
        && combinedProbability !== null && combinedProbability >= 25 && legs.length <= 3 ? "Düşük" : "Orta";
    return {
      legs,
      pickedCount: picked.length,
      noPickCount,
      averageConfidence,
      averageModelScore,
      averageDataCompleteness,
      combinedProbability,
      totalOdd,
      risk,
    };
  };

  return {
    analyze,
    analyzeCoupon,
    filterMatches,
    filterUpcoming,
    isUpcoming,
    marketKey,
    marketLabel,
    mergeProAnalysis,
    normalizeMatch,
    normalizeMatches,
    normalizeText,
    oddsForMarket,
  };
});
