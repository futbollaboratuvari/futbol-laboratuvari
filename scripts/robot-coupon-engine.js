const parseOdd = (value) => {
  if (value === undefined || value === null || value === "" || value === "-") return null;
  const number = Number(String(value).replace(",", "."));
  return Number.isFinite(number) && number > 1 ? number : null;
};

const formatOdd = (value) => {
  const odd = parseOdd(value);
  return odd ? odd.toFixed(2) : "-";
};

const formatPercent = (value) => `${Math.round(value)}%`;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const formatTurkeyDate = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const readField = (fixture, key) => fixture?.[key]
  ?? fixture?.odds?.[key]
  ?? fixture?.oranlar?.[key]
  ?? fixture?.detay_oranlar?.[key]
  ?? fixture?.analysis?.[key]
  ?? fixture?.stats?.[key];

const readNumber = (fixture, keys) => {
  for (const key of keys) {
    const raw = readField(fixture, key);
    if (raw === undefined || raw === null || raw === "" || raw === "-") continue;
    const number = Number(String(raw).replace("%", "").replace(",", "."));
    if (Number.isFinite(number)) return number;
  }
  return null;
};

const readPercent = (fixture, keys) => {
  const number = readNumber(fixture, keys);
  if (number === null) return null;
  if (number <= 1) return clamp(number * 100, 0, 100);
  return clamp(number, 0, 100);
};

const oddValue = (fixture, keys) => {
  for (const key of keys) {
    const value = parseOdd(readField(fixture, key));
    if (value) return value;
  }
  return null;
};

const impliedProbability = (odd) => {
  const parsed = parseOdd(odd);
  if (!parsed) return 0;
  return Math.min(92, Math.max(5, (1 / parsed) * 100));
};

const safeTeam = (value, fallback) => String(value || fallback).trim();

const getTeams = (fixture) => ({
  home: safeTeam(fixture.home || fixture.home_team_name || fixture.ev_sahibi, "Ev sahibi"),
  away: safeTeam(fixture.away || fixture.away_team_name || fixture.deplasman, "Deplasman"),
});

const isCurrentFixture = (fixture) => {
  const date = String(fixture.date || fixture.tarih || fixture.utc_date || "").slice(0, 10);
  if (!date) return false;
  return date >= formatTurkeyDate();
};

const leagueSignal = (league = "") => {
  const text = String(league).toLowerCase();
  let goalBias = 0;
  let riskBias = 0;

  if (/irlanda|norveç|norvec|isveç|isvec|finlandiya|izlanda|danimarka|hazırlık|hazirlik|kupa|npl|u19|u20|u21|rezerv|youth/i.test(text)) {
    goalBias += 8;
    riskBias += 5;
  }

  if (/premier|championship|super|süper|1\.lig|grup|dünya|dunya/i.test(text)) {
    goalBias += 3;
  }

  if (/alt lig|ikinci|amatör|amator/i.test(text)) {
    riskBias += 6;
  }

  return { goalBias, riskBias };
};

const marketRules = {
  ms1: {
    label: "MS 1",
    keys: ["ms1", "homeWin", "home_win", "macSonucu1", "ms_1"],
    minOdd: 1.25,
    maxOdd: 6.50,
    boost: 8,
    riskAdd: 5,
    scores: ["1-0", "2-0", "2-1"],
    signals: ["MS 1 secenegi kontrol edildi"],
  },
  msx: {
    label: "MS X",
    keys: ["msx", "draw", "beraberlik", "macSonucuX", "ms_x"],
    minOdd: 2.20,
    maxOdd: 5.80,
    boost: 10,
    riskAdd: 9,
    scores: ["0-0", "1-1", "2-2"],
    signals: ["MS X secenegi kontrol edildi"],
  },
  ms2: {
    label: "MS 2",
    keys: ["ms2", "awayWin", "away_win", "macSonucu2", "ms_2"],
    minOdd: 1.25,
    maxOdd: 7.50,
    boost: 9,
    riskAdd: 7,
    scores: ["0-1", "0-2", "1-2"],
    signals: ["MS 2 secenegi kontrol edildi"],
  },

  firstHalfBttsYes: {
    label: "İlk Yarı KG Var",
    keys: ["firstHalfBttsYes", "iyKgVar", "iy_kg_var", "first_half_btts_yes"],
    minOdd: 1.85,
    maxOdd: 5.50,
    boost: 15,
    riskAdd: 10,
    scores: ["1-1", "2-1"],
    signals: ["İlk yarı gol değişimi marketi", "Yüksek oran bölgesi kontrol edildi"],
  },
  secondHalfBttsYes: {
    label: "İkinci Yarı KG Var",
    keys: ["secondHalfBttsYes", "ikinciYariKgVar", "ikinci_yari_kg_var", "second_half_btts_yes"],
    minOdd: 1.75,
    maxOdd: 5.25,
    boost: 16,
    riskAdd: 8,
    scores: ["2-1", "2-2"],
    signals: ["İkinci yarı tempo marketi", "Maç sonu gol ihtimali kontrol edildi"],
  },
  kgVar: {
    label: "KG Var",
    keys: ["bttsYes", "kgVar", "varOdd", "var", "kg_var"],
    minOdd: 1.60,
    maxOdd: 3.80,
    boost: 14,
    riskAdd: 4,
    scores: ["1-1", "2-1", "2-2"],
    signals: ["İki takım gol ihtimali marketi", "Düşük oran filtresinden geçti"],
  },
  kgYok: {
    label: "KG Yok",
    keys: ["bttsNo", "kgYok", "yokOdd", "yok", "kg_yok"],
    minOdd: 1.40,
    maxOdd: 4.50,
    boost: 11,
    riskAdd: 5,
    scores: ["1-0", "0-1", "2-0"],
    signals: ["KG Yok seçeneği kontrol edildi"],
  },
  over15: {
    label: "1.5 Üst",
    keys: ["over15", "ust15", "over1_5", "ust_15"],
    minOdd: 1.20,
    maxOdd: 2.80,
    boost: 8,
    riskAdd: 2,
    scores: ["1-1", "2-0", "2-1"],
    signals: ["1.5 Üst düşük risk gol seçeneği kontrol edildi"],
  },
  homeGoal: {
    label: "Ev Sahibi Gol Atar",
    keys: ["homeGoalYes", "homeScores", "home_to_score", "evGolAtar", "ev_sahibi_gol_atar"],
    minOdd: 1.20,
    maxOdd: 3.80,
    boost: 8,
    riskAdd: 3,
    scores: ["1-0", "1-1", "2-1"],
    signals: ["Ev sahibi gol bulur seçeneği kontrol edildi"],
  },
  awayGoal: {
    label: "Deplasman Gol Atar",
    keys: ["awayGoalYes", "awayScores", "away_to_score", "depGolAtar", "deplasman_gol_atar"],
    minOdd: 1.20,
    maxOdd: 3.80,
    boost: 9,
    riskAdd: 4,
    scores: ["0-1", "1-1", "1-2"],
    signals: ["Deplasman gol bulur seçeneği kontrol edildi"],
  },
  over25: {
    label: "2.5 Üst",
    keys: ["over25", "ust25", "over", "ust", "ust_25"],
    minOdd: 1.58,
    maxOdd: 3.20,
    boost: 13,
    riskAdd: 3,
    scores: ["2-1", "3-1", "2-2"],
    signals: ["Ana gol üst marketi", "Değer oran filtresinden geçti"],
  },
  over35: {
    label: "3.5 Üst",
    keys: ["over35", "ust35", "over3_5", "ust_35"],
    minOdd: 1.90,
    maxOdd: 5.80,
    boost: 14,
    riskAdd: 12,
    scores: ["3-1", "2-2", "3-2"],
    signals: ["Yüksek gol üst marketi", "Yüksek oran / yüksek risk dengesi kontrol edildi"],
  },
};

const percentPoints = (percent, maxPoints) => {
  if (percent === null) return { points: 0, missing: true };
  if (percent >= 80) return { points: maxPoints, missing: false };
  if (percent >= 70) return { points: maxPoints * 0.85, missing: false };
  if (percent >= 60) return { points: maxPoints * 0.65, missing: false };
  if (percent >= 50) return { points: maxPoints * 0.45, missing: false };
  return { points: maxPoints * 0.2, missing: false };
};

const averageKnown = (values) => {
  const known = values.filter((value) => value !== null && Number.isFinite(value));
  if (!known.length) return null;
  return known.reduce((sum, value) => sum + value, 0) / known.length;
};

const analysisClassFor = (score) => {
  if (score >= 80) return "Ana kupon adayı";
  if (score >= 65) return "Orta risk kupon adayı";
  if (score >= 40) return "Sadece izleme";
  return "Oynama";
};

const dataGapLabel = (missingCount) => {
  if (missingCount >= 9) return "Yüksek";
  if (missingCount >= 5) return "Orta";
  return "Düşük";
};

const formScore = (fixture) => {
  const home = readPercent(fixture, ["homeFormPercent", "home_form_percent", "ev_form_yuzde", "home_form"]);
  const away = readPercent(fixture, ["awayFormPercent", "away_form_percent", "dep_form_yuzde", "away_form"]);
  const avg = averageKnown([home, away]);
  if (avg === null) return { points: 0, missing: true, home, away };
  return { points: clamp(avg / 10, 0, 10), missing: false, home, away };
};

const valueScore = (candidate) => {
  if (!candidate) return { points: 0, missing: true };
  const odd = candidate.odd;
  const rule = marketRules[candidate.key];
  const mid = (rule.minOdd + rule.maxOdd) / 2;
  if (odd < rule.minOdd || odd > rule.maxOdd) return { points: 0, missing: false };
  const premium = odd <= mid ? 10 + ((odd - rule.minOdd) / Math.max(0.01, mid - rule.minOdd)) * 6 : 16 - ((odd - mid) / Math.max(0.01, rule.maxOdd - mid)) * 3;
  return { points: clamp(premium, 6, 20), missing: false };
};

const buildMatchAnalysis = (fixture, candidate = null) => {
  const metrics = {
    homeScoredLast10: readPercent(fixture, ["homeScoredLast10Percent", "home_scored_last10_pct", "ev_son10_gol_attı", "ev_son10_gol_atti", "home_last10_scored_pct"]),
    awayScoredLast10: readPercent(fixture, ["awayScoredLast10Percent", "away_scored_last10_pct", "dep_son10_gol_attı", "dep_son10_gol_atti", "away_last10_scored_pct"]),
    homeConcededLast10: readPercent(fixture, ["homeConcededLast10Percent", "home_conceded_last10_pct", "ev_son10_gol_yedi", "home_last10_conceded_pct"]),
    awayConcededLast10: readPercent(fixture, ["awayConcededLast10Percent", "away_conceded_last10_pct", "dep_son10_gol_yedi", "away_last10_conceded_pct"]),
    bttsPercent: readPercent(fixture, ["bttsPercent", "kg_var_yuzdesi", "kgVarPercent", "btts_pct"]),
    over25Percent: readPercent(fixture, ["over25Percent", "ust25_yuzdesi", "over_25_pct", "ust_25_yuzdesi"]),
    over35Percent: readPercent(fixture, ["over35Percent", "ust35_yuzdesi", "over_35_pct", "ust_35_yuzdesi"]),
    firstHalfGoalTrend: readPercent(fixture, ["firstHalfGoalTrend", "ilk_yari_gol_egilimi", "iy_gol_egilimi", "first_half_goal_pct"]),
    secondHalfGoalTrend: readPercent(fixture, ["secondHalfGoalTrend", "ikinci_yari_gol_egilimi", "second_half_goal_pct"]),
    leagueGoalAverage: readNumber(fixture, ["leagueGoalAverage", "lig_gol_ortalamasi", "league_goal_avg", "lig_gol_avg"]),
  };

  const inputs = [
    [metrics.homeScoredLast10, 5],
    [metrics.awayScoredLast10, 5],
    [metrics.homeConcededLast10, 5],
    [metrics.awayConcededLast10, 5],
    [metrics.bttsPercent, 9],
    [metrics.over25Percent, 9],
    [metrics.over35Percent, 7],
    [metrics.firstHalfGoalTrend, 7],
    [metrics.secondHalfGoalTrend, 7],
  ];

  let score = 0;
  let missingCount = 0;
  const signals = [];

  inputs.forEach(([percent, max]) => {
    const result = percentPoints(percent, max);
    score += result.points;
    if (result.missing) missingCount += 1;
  });

  if (metrics.leagueGoalAverage === null) {
    missingCount += 1;
  } else if (metrics.leagueGoalAverage >= 3.2) {
    score += 8;
    signals.push("Lig gol ortalaması yüksek");
  } else if (metrics.leagueGoalAverage >= 2.7) {
    score += 6;
    signals.push("Lig gol ortalaması pozitif");
  } else if (metrics.leagueGoalAverage >= 2.3) {
    score += 3;
  }

  const form = formScore(fixture);
  score += form.points;
  if (form.missing) missingCount += 1;

  const value = valueScore(candidate);
  score += value.points;
  if (value.missing) missingCount += 1;

  const marketFallback = candidate ? Math.min(18, Math.max(6, candidate.confidence / 5)) : 0;
  score += marketFallback;

  const dataCompleteness = Math.max(0, 10 - missingCount);
  score += dataCompleteness;

  const league = leagueSignal(fixture.league || fixture.competition_name || "");
  score += Math.min(6, league.goalBias / 2);
  score -= Math.min(12, missingCount * 1.5);
  score = Math.round(clamp(score, 0, 100));

  const dataRisk = dataGapLabel(missingCount);
  const className = analysisClassFor(score);

  if (metrics.bttsPercent !== null) signals.push(`KG Var yüzdesi: ${formatPercent(metrics.bttsPercent)}`);
  if (metrics.over25Percent !== null) signals.push(`2.5 Üst yüzdesi: ${formatPercent(metrics.over25Percent)}`);
  if (metrics.over35Percent !== null) signals.push(`3.5 Üst yüzdesi: ${formatPercent(metrics.over35Percent)}`);
  if (metrics.firstHalfGoalTrend !== null) signals.push(`İlk yarı gol eğilimi: ${formatPercent(metrics.firstHalfGoalTrend)}`);
  if (metrics.secondHalfGoalTrend !== null) signals.push(`İkinci yarı gol eğilimi: ${formatPercent(metrics.secondHalfGoalTrend)}`);
  signals.push(`Veri eksikliği riski: ${dataRisk}`);
  signals.push(`100 puan analiz sınıfı: ${className}`);

  return {
    analysis_score: score,
    analysis_class: className,
    data_gap_risk: dataRisk,
    data_missing_count: missingCount,
    metrics,
    signals,
  };
};

const riskFromScore = (score, odd, riskAdd, riskBias, dataGapRisk = "Düşük") => {
  const dataAdd = dataGapRisk === "Yüksek" ? 14 : dataGapRisk === "Orta" ? 7 : 0;
  const riskNumber = Math.max(0, Math.round((100 - score) + riskAdd + riskBias + (odd >= 3.5 ? 8 : 0) + dataAdd));
  if (riskNumber >= 56) return { risk: "Yüksek", riskNumber };
  if (riskNumber >= 38) return { risk: "Orta", riskNumber };
  return { risk: "Düşük", riskNumber };
};

const makeCandidate = (fixture, key, rule) => {
  const odd = oddValue(fixture, rule.keys);
  if (!odd) return null;
  if (odd < rule.minOdd || odd > rule.maxOdd) return null;

  const league = leagueSignal(fixture.league || fixture.competition_name || "");
  const implied = impliedProbability(odd);
  const valuePremium = Math.min(18, Math.max(0, (odd - rule.minOdd) * 7));
  let score = implied + rule.boost + league.goalBias + valuePremium;

  if (key === "over35" && league.goalBias < 4) score -= 4;
  if (key === "firstHalfBttsYes" && odd < 2.00) score -= 3;
  if (key === "secondHalfBttsYes" && odd < 1.90) score -= 2;

  score = Math.max(42, Math.min(88, Math.round(score)));
  if (score < 40) return null;

  const matchAnalysis = buildMatchAnalysis(fixture, { key, odd, confidence: score });
  const finalScore = Math.round((score * 0.4) + (matchAnalysis.analysis_score * 0.6));
  if (finalScore < 40) return null;

  const risk = riskFromScore(finalScore, odd, rule.riskAdd, league.riskBias, matchAnalysis.data_gap_risk);
  const signals = [
    `Market: ${rule.label}`,
    `Oran: ${formatOdd(odd)}`,
    `Piyasa olasılığı: ${formatPercent(implied)}`,
    `Değer skoru: ${finalScore}/100`,
    `Analiz sınıfı: ${matchAnalysis.analysis_class}`,
    ...rule.signals,
    ...matchAnalysis.signals,
  ];

  if (league.goalBias > 0) signals.push("Lig gol eğilimi pozitif sinyal verdi");

  return {
    key,
    label: rule.label,
    odd,
    confidence: finalScore,
    risk: risk.risk,
    riskNumber: risk.riskNumber,
    expected_scores: rule.scores,
    analysis: matchAnalysis,
    signals,
  };
};

const getCandidates = (fixture) => Object.entries(marketRules)
  .map(([key, rule]) => makeCandidate(fixture, key, rule))
  .filter(Boolean)
  .sort((a, b) => b.confidence - a.confidence || a.riskNumber - b.riskNumber || b.odd - a.odd);

const tagFor = (score) => analysisClassFor(score);

const expectedScoresFor = (selection, fallback = []) => {
  if (Array.isArray(fallback) && fallback.length) return fallback;
  const text = String(selection || "").toLowerCase();
  if (text.includes("ilk yarı") || text.includes("kg var")) return ["1-1", "2-1"];
  if (text.includes("3.5")) return ["3-1", "2-2"];
  if (text.includes("2.5")) return ["2-1", "3-1"];
  return ["2-1", "2-2"];
};

const emptyScoredFixture = (fixture, reason, status, signals) => {
  const { home, away } = getTeams(fixture);
  const analysis = buildMatchAnalysis(fixture, null);
  return {
    ...fixture,
    home,
    away,
    match: `${home} VS ${away}`,
    market: reason,
    selection: reason,
    odds: "-",
    confidence: `${analysis.analysis_score}%`,
    lab_probability: `${analysis.analysis_score}%`,
    trust_score: `${analysis.analysis_score}/100`,
    tag: analysis.analysis_class,
    expected_scores: [],
    score: analysis.analysis_score,
    risk: analysis.analysis_score < 50 ? "Yüksek" : "Orta",
    status,
    hasOdds: false,
    analysis_score: analysis.analysis_score,
    analysis_class: analysis.analysis_class,
    data_gap_risk: analysis.data_gap_risk,
    analysis_metrics: analysis.metrics,
    pro_signals: [...signals, ...analysis.signals],
  };
};

const scoreFixture = (fixture, index = 0) => {
  if (!isCurrentFixture(fixture)) {
    return emptyScoredFixture(fixture, "Güncel maç değil", "filtered_old_fixture", ["Eski tarihli maç elendi"]);
  }

  const candidates = getCandidates(fixture);
  const best = candidates[0];

  if (!best) {
    return emptyScoredFixture(fixture, "Değerli market yok", "filtered_no_value_market", ["Düşük oran veya eksik veri nedeniyle elendi", "Çifte şans kullanılmadı"]);
  }

  const { home, away } = getTeams(fixture);
  const rankBoost = Math.max(0, 2 - (index % 3));
  const score = Math.min(100, best.confidence + rankBoost);
  const analysisClass = analysisClassFor(score);

  return {
    ...fixture,
    home,
    away,
    match: `${home} VS ${away}`,
    market: best.label,
    selection: best.label,
    odds: formatOdd(best.odd),
    confidence: formatPercent(score),
    lab_probability: formatPercent(score),
    trust_score: `${score}/100`,
    tag: analysisClass,
    expected_scores: expectedScoresFor(best.label, best.expected_scores),
    score,
    risk: best.risk,
    status: fixture.status || "scheduled",
    hasOdds: true,
    analysis_score: score,
    analysis_class: analysisClass,
    data_gap_risk: best.analysis.data_gap_risk,
    analysis_metrics: best.analysis.metrics,
    pro_signals: best.signals,
  };
};

const legFromItem = (item, number = 1) => ({
  number,
  home: item.home,
  away: item.away,
  match: item.match,
  date: item.date || "",
  time: item.time || "",
  league: item.league || item.competition_name || "",
  selection: item.selection || item.market,
  option: item.selection || item.market,
  odds: item.odds,
  lab_probability: item.lab_probability || item.confidence,
  confidence: item.confidence,
  trust_score: item.trust_score,
  risk: item.risk,
  tag: item.tag,
  analysis_score: item.analysis_score,
  analysis_class: item.analysis_class,
  data_gap_risk: item.data_gap_risk,
  expected_scores: item.expected_scores || [],
  signals: item.pro_signals || [],
});

const combinedOdds = (items) => {
  const product = items.reduce((acc, item) => {
    const odd = parseOdd(item.odds);
    return odd ? acc * odd : acc;
  }, 1);
  return product > 1 ? product.toFixed(2) : "-";
};

const combinedSignals = (items, limit = 6) => items.flatMap((item) => item.pro_signals || []).slice(0, limit);

const buildCouponAnalysis = (fixtures = []) => {
  const scored = fixtures.map(scoreFixture);
  const ranked = scored
    .filter((item) => item.hasOdds && item.score >= 65)
    .sort((a, b) => b.score - a.score || parseOdd(b.odds) - parseOdd(a.odds))
    .slice(0, 14);

  const singles = ranked.slice(0, 6).map((item) => ({
    match: item.match,
    market: item.market,
    odds: item.odds,
    confidence: item.confidence,
    score: item.score,
    risk: item.risk,
    tag: item.tag,
    analysis_score: item.analysis_score,
    analysis_class: item.analysis_class,
    data_gap_risk: item.data_gap_risk,
    expected_scores: item.expected_scores,
    signals: item.pro_signals,
    legs: [legFromItem(item, 1)],
  }));

  const doubles = [];
  const triples = [];
  const mediumPlus = ranked.filter((item) => parseOdd(item.odds) >= 1.60);

  for (let index = 0; index + 1 < mediumPlus.length && doubles.length < 3; index += 2) {
    const pair = [mediumPlus[index], mediumPlus[index + 1]];
    const avg = Math.round(pair.reduce((sum, item) => sum + item.score, 0) / pair.length);
    const totalOdd = parseOdd(combinedOdds(pair));
    if (!totalOdd || totalOdd < 2.40) continue;
    doubles.push({
      match: pair.map((item) => item.match).join(" + "),
      market: pair.map((item) => item.market).join(" + "),
      odds: totalOdd.toFixed(2),
      confidence: `${avg}%`,
      score: avg,
      risk: pair.some((item) => item.risk === "Yüksek") ? "Yüksek" : "Orta",
      tag: analysisClassFor(avg),
      analysis_score: avg,
      analysis_class: analysisClassFor(avg),
      data_gap_risk: pair.some((item) => item.data_gap_risk === "Yüksek") ? "Yüksek" : pair.some((item) => item.data_gap_risk === "Orta") ? "Orta" : "Düşük",
      expected_scores: pair.flatMap((item) => item.expected_scores || []).slice(0, 4),
      signals: combinedSignals(pair, 5),
      legs: pair.map((item, legIndex) => legFromItem(item, legIndex + 1)),
    });
  }

  for (let index = 0; index + 2 < mediumPlus.length && triples.length < 2; index += 3) {
    const trio = [mediumPlus[index], mediumPlus[index + 1], mediumPlus[index + 2]];
    const avg = Math.round(trio.reduce((sum, item) => sum + item.score, 0) / trio.length);
    const totalOdd = parseOdd(combinedOdds(trio));
    if (!totalOdd || totalOdd < 3.20) continue;
    triples.push({
      match: trio.map((item) => item.match).join(" + "),
      market: trio.map((item) => item.market).join(" + "),
      odds: totalOdd.toFixed(2),
      confidence: `${avg}%`,
      score: avg,
      risk: "Yüksek",
      tag: analysisClassFor(avg),
      analysis_score: avg,
      analysis_class: analysisClassFor(avg),
      data_gap_risk: trio.some((item) => item.data_gap_risk === "Yüksek") ? "Yüksek" : trio.some((item) => item.data_gap_risk === "Orta") ? "Orta" : "Düşük",
      expected_scores: trio.flatMap((item) => item.expected_scores || []).slice(0, 6),
      signals: combinedSignals(trio, 6),
      legs: trio.map((item, legIndex) => legFromItem(item, legIndex + 1)),
    });
  }

  return { scored, ranked, singles, doubles, triples };
};

module.exports = { scoreFixture, buildCouponAnalysis, buildMatchAnalysis };




