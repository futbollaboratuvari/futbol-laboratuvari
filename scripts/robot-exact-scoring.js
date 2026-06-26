const fs = require("fs");
const path = require("path");

const archivePath = path.join(__dirname, "..", "data", "robot_match_archive.json");
let memoryCache = null;

const parseOdd = (value) => {
  if (value === undefined || value === null || value === "" || value === "-") return null;
  const number = Number(String(value).replace(",", "."));
  return Number.isFinite(number) && number > 1 ? number : null;
};

const formatOdd = (value) => {
  const odd = parseOdd(value);
  return odd ? odd.toFixed(2) : "-";
};

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const pct = (value) => `${Math.round(value)}%`;

const trDate = () => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Istanbul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

const get = (fixture, key) => fixture?.[key]
  ?? fixture?.odds?.[key]
  ?? fixture?.oranlar?.[key]
  ?? fixture?.detay_oranlar?.[key]
  ?? fixture?.raw_market_guess_odds?.[key]
  ?? fixture?.analysis?.[key]
  ?? fixture?.stats?.[key];

const readNumber = (fixture, keys) => {
  for (const key of keys) {
    const raw = get(fixture, key);
    if (raw === undefined || raw === null || raw === "" || raw === "-") continue;
    const number = Number(String(raw).replace("%", "").replace(",", "."));
    if (Number.isFinite(number)) return number;
  }
  return null;
};

const readText = (fixture, keys) => {
  for (const key of keys) {
    const raw = get(fixture, key);
    if (raw !== undefined && raw !== null && raw !== "") return String(raw);
  }
  return "";
};

const toCount = (value) => {
  if (value === null) return null;
  return value <= 10 ? value : Math.round((value / 100) * 10);
};

const toPercent = (value) => {
  if (value === null) return null;
  return value <= 10 ? clamp((value / 10) * 100) : clamp(value);
};

const readPercent = (fixture, keys) => toPercent(readNumber(fixture, keys));

const trendHigh = (fixture, keys) => {
  const text = readText(fixture, keys).toLocaleLowerCase("tr-TR");
  if (/(yüksek|yuksek|high|pozitif|evet|var)/i.test(text)) return true;
  const value = readPercent(fixture, keys);
  return value !== null && value >= 65;
};

const flag = (fixture, keys) => {
  const text = readText(fixture, keys).toLocaleLowerCase("tr-TR");
  return /(true|1|evet|var|yüksek|yuksek|kritik|derbi|belirsiz|kapalı|kapali)/i.test(text);
};

const teams = (fixture) => ({
  home: String(fixture.home || fixture.home_team_name || fixture.ev_sahibi || "Ev sahibi").trim(),
  away: String(fixture.away || fixture.away_team_name || fixture.deplasman || "Deplasman").trim(),
});

const isCurrent = (fixture) => {
  const date = String(fixture.date || fixture.tarih || fixture.utc_date || "").slice(0, 10);
  return Boolean(date) && date >= trDate();
};

const classFor = (score) => {
  if (score >= 80) return "Ana kupon adayı";
  if (score >= 65) return "Orta risk kupon adayı";
  if (score >= 40) return "Sadece izleme";
  return "Oynama";
};

const gapRisk = (missing) => {
  if (missing >= 8) return "Yüksek";
  if (missing >= 4) return "Orta";
  return "Düşük";
};

const cleanKey = (value) => String(value || "")
  .toLocaleLowerCase("tr-TR")
  .replace(/ı/g, "i")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const readJson = (filePath, fallback) => {
  try {
    const text = fs.readFileSync(filePath, "utf8").trim();
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
};

const loadMemory = () => {
  if (memoryCache) return memoryCache;
  memoryCache = readJson(archivePath, { matches: [], team_index: {} });
  if (!Array.isArray(memoryCache.matches)) memoryCache.matches = [];
  return memoryCache;
};

const parseScore = (match) => {
  const raw = match.score || match.result || match.result_score || "";
  const found = String(raw).match(/(\d+)\D+(\d+)/);
  if (!found) return null;
  return { home: Number(found[1]), away: Number(found[2]) };
};

const teamRecentMatches = (teamName) => {
  const key = cleanKey(teamName);
  if (!key) return [];
  return loadMemory().matches
    .filter((match) => cleanKey(match.home || match.home_team_name) === key || cleanKey(match.away || match.away_team_name) === key)
    .slice(-10);
};

const teamProfile = (teamName) => {
  const key = cleanKey(teamName);
  const rows = teamRecentMatches(teamName);
  let count = 0;
  let scored = 0;
  let conceded = 0;
  let btts = 0;
  let over25 = 0;
  let over35 = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  rows.forEach((match) => {
    const score = parseScore(match);
    if (!score) return;
    const isHome = cleanKey(match.home || match.home_team_name) === key;
    const gf = isHome ? score.home : score.away;
    const ga = isHome ? score.away : score.home;
    count += 1;
    goalsFor += gf;
    goalsAgainst += ga;
    if (gf > 0) scored += 1;
    if (ga > 0) conceded += 1;
    if (gf > 0 && ga > 0) btts += 1;
    if (gf + ga >= 3) over25 += 1;
    if (gf + ga >= 4) over35 += 1;
  });

  return {
    count,
    scored,
    conceded,
    bttsRate: count ? Math.round((btts / count) * 100) : 0,
    over25Rate: count ? Math.round((over25 / count) * 100) : 0,
    over35Rate: count ? Math.round((over35 / count) * 100) : 0,
    goalsForAvg: count ? Number((goalsFor / count).toFixed(2)) : 0,
    goalsAgainstAvg: count ? Number((goalsAgainst / count).toFixed(2)) : 0,
  };
};

const leagueProfile = (fixture) => {
  const league = cleanKey(fixture.league || fixture.competition_name);
  const rows = loadMemory().matches.filter((match) => league && cleanKey(match.league || match.competition_name) === league).slice(-30);
  let count = 0;
  let totalGoals = 0;
  let btts = 0;
  let over25 = 0;

  rows.forEach((match) => {
    const score = parseScore(match);
    if (!score) return;
    count += 1;
    totalGoals += score.home + score.away;
    if (score.home > 0 && score.away > 0) btts += 1;
    if (score.home + score.away >= 3) over25 += 1;
  });

  return {
    count,
    goalAverage: count ? Number((totalGoals / count).toFixed(2)) : 0,
    bttsRate: count ? Math.round((btts / count) * 100) : 0,
    over25Rate: count ? Math.round((over25 / count) * 100) : 0,
  };
};

const memoryFor = (fixture, candidate = null) => {
  const t = teams(fixture);
  const home = teamProfile(t.home);
  const away = teamProfile(t.away);
  const league = leagueProfile(fixture);
  const totalMatches = home.count + away.count + league.count;
  let delta = 0;
  const signals = [];

  if (home.count >= 3 && away.count >= 3) {
    if (home.scored >= 5 && away.scored >= 5) { delta += 7; signals.push("Hafıza: iki takım son arşiv maçlarında gol buluyor: +7"); }
    if (home.conceded >= 5 && away.conceded >= 5) { delta += 7; signals.push("Hafıza: iki takım son arşiv maçlarında gol yiyor: +7"); }
    const avgBtts = Math.round((home.bttsRate + away.bttsRate) / 2);
    const avgOver25 = Math.round((home.over25Rate + away.over25Rate) / 2);
    const avgOver35 = Math.round((home.over35Rate + away.over35Rate) / 2);

    if (["kgVar", "firstHalfBttsYes", "secondHalfBttsYes"].includes(candidate?.key) && avgBtts >= 60) {
      delta += 8;
      signals.push(`Hafıza: KG Var eğilimi yüksek (%${avgBtts}): +8`);
    }
    if (candidate?.key === "over25" && avgOver25 >= 55) {
      delta += 8;
      signals.push(`Hafıza: 2.5 Üst eğilimi yüksek (%${avgOver25}): +8`);
    }
    if (candidate?.key === "over35" && avgOver35 >= 40) {
      delta += 6;
      signals.push(`Hafıza: 3.5 Üst eğilimi destekli (%${avgOver35}): +6`);
    }
  }

  if (league.count >= 8) {
    if (league.goalAverage >= 2.7) { delta += 5; signals.push(`Hafıza: lig gol ortalaması ${league.goalAverage}: +5`); }
    if (league.bttsRate >= 60 && ["kgVar", "firstHalfBttsYes", "secondHalfBttsYes"].includes(candidate?.key)) { delta += 4; signals.push(`Hafıza: lig KG Var oranı %${league.bttsRate}: +4`); }
  }

  if (totalMatches < 6) signals.push("Hafıza: arşiv verisi henüz sınırlı");

  return {
    scoreDelta: Math.max(-10, Math.min(22, delta)),
    totalMatches,
    home,
    away,
    league,
    signals,
  };
};

const riskyContext = (fixture) => {
  const t = teams(fixture);
  const text = `${fixture.league || fixture.competition_name || ""} ${t.home} ${t.away} ${readText(fixture, ["matchImportance", "mac_onemi", "risk_note", "belirsizlik_notu"])}`.toLocaleLowerCase("tr-TR");
  return /derbi|kritik|belirsiz|final|yarı final|yari final|playoff|play-off|küme|kume/.test(text)
    || flag(fixture, ["isCritical", "criticalMatch", "isDerby", "derby", "uncertainMatch", "veryUncertain", "mac_kritik", "mac_belirsiz"]);
};

const closedDefense = (fixture) => flag(fixture, [
  "closedDefense", "kapaliSavunma", "kapalı_savunma", "homeClosedDefense", "awayClosedDefense", "defensiveStyle", "savunma_oyunu"
]);

const marketRules = {
  firstHalfBttsYes: { label: "İlk Yarı KG Var", keys: ["firstHalfBttsYes", "iyKgVar", "iy_kg_var", "first_half_btts_yes", "firstHalfBttsYes_guess"], minOdd: 1.85, maxOdd: 5.50, scores: ["1-1", "2-1"] },
  firstHalfBttsNo: { label: "İlk Yarı KG Yok", keys: ["firstHalfBttsNo", "iyKgYok", "iy_kg_yok", "first_half_btts_no", "firstHalfBttsNo_guess"], minOdd: 1.35, maxOdd: 4.50, scores: ["0-0", "1-0"] },
  secondHalfBttsYes: { label: "İkinci Yarı KG Var", keys: ["secondHalfBttsYes", "ikinciYariKgVar", "ikinci_yari_kg_var", "second_half_btts_yes", "secondHalfBttsYes_guess"], minOdd: 1.75, maxOdd: 5.25, scores: ["2-1", "2-2"] },
  secondHalfBttsNo: { label: "İkinci Yarı KG Yok", keys: ["secondHalfBttsNo", "ikinciYariKgYok", "ikinci_yari_kg_yok", "second_half_btts_no", "secondHalfBttsNo_guess"], minOdd: 1.35, maxOdd: 4.50, scores: ["1-0", "0-1"] },
  kgVar: { label: "KG Var", keys: ["bttsYes", "kgVar", "varOdd", "var", "kg_var", "bttsYes_guess"], minOdd: 1.60, maxOdd: 3.80, scores: ["1-1", "2-1", "2-2"] },
  kgYok: { label: "KG Yok", keys: ["bttsNo", "kgYok", "yokOdd", "yok", "kg_yok", "bttsNo_guess"], minOdd: 1.45, maxOdd: 4.20, scores: ["1-0", "0-1", "2-0"] },
  over15: { label: "1.5 Üst", keys: ["over15", "ust15", "over1_5", "ust_15", "over15_guess"], minOdd: 1.20, maxOdd: 2.80, scores: ["1-1", "2-0", "2-1"] },
  homeGoal: { label: "Ev Sahibi Gol Atar", keys: ["homeGoalYes", "homeScores", "home_to_score", "evGolAtar", "ev_sahibi_gol_atar", "homeGoalYes_guess"], minOdd: 1.20, maxOdd: 3.80, scores: ["1-0", "1-1", "2-1"] },
  awayGoal: { label: "Deplasman Gol Atar", keys: ["awayGoalYes", "awayScores", "away_to_score", "depGolAtar", "deplasman_gol_atar", "awayGoalYes_guess"], minOdd: 1.20, maxOdd: 3.80, scores: ["0-1", "1-1", "1-2"] },
  over25: { label: "2.5 Üst", keys: ["over25", "ust25", "over", "ust", "ust_25", "over25_guess"], minOdd: 1.58, maxOdd: 3.20, scores: ["2-1", "3-1", "2-2"] },
  over35: { label: "3.5 Üst", keys: ["over35", "ust35", "over3_5", "ust_35", "over35_guess"], minOdd: 1.90, maxOdd: 5.80, scores: ["3-1", "2-2", "3-2"] },
};

const oddFor = (fixture, keys) => {
  for (const key of keys) {
    const odd = parseOdd(get(fixture, key));
    if (odd) return odd;
  }
  return null;
};

const metricsFor = (fixture) => ({
  homeScoredLast10: readNumber(fixture, ["homeScoredLast10", "homeScoredLast10Percent", "home_scored_last10", "home_scored_last10_pct", "ev_son10_gol_atti", "ev_son10_gol_attı"]),
  awayScoredLast10: readNumber(fixture, ["awayScoredLast10", "awayScoredLast10Percent", "away_scored_last10", "away_scored_last10_pct", "dep_son10_gol_atti", "dep_son10_gol_attı"]),
  homeConcededLast10: readNumber(fixture, ["homeConcededLast10", "homeConcededLast10Percent", "home_conceded_last10", "home_conceded_last10_pct", "ev_son10_gol_yedi"]),
  awayConcededLast10: readNumber(fixture, ["awayConcededLast10", "awayConcededLast10Percent", "away_conceded_last10", "away_conceded_last10_pct", "dep_son10_gol_yedi"]),
  bttsPercent: readPercent(fixture, ["bttsPercent", "kg_var_yuzdesi", "kgVarPercent", "btts_pct"]),
  over25Percent: readPercent(fixture, ["over25Percent", "ust25_yuzdesi", "over_25_pct", "ust_25_yuzdesi"]),
  over35Percent: readPercent(fixture, ["over35Percent", "ust35_yuzdesi", "over_35_pct", "ust_35_yuzdesi"]),
  firstHalfGoalTrend: readPercent(fixture, ["firstHalfGoalTrend", "ilk_yari_gol_egilimi", "iy_gol_egilimi", "first_half_goal_pct"]),
  secondHalfGoalTrend: readPercent(fixture, ["secondHalfGoalTrend", "ikinci_yari_gol_egilimi", "second_half_goal_pct"]),
  leagueGoalAverage: readNumber(fixture, ["leagueGoalAverage", "lig_gol_ortalamasi", "league_goal_avg", "lig_gol_avg"]),
});

const buildMatchAnalysis = (fixture, candidate = null) => {
  const m = metricsFor(fixture);
  const memory = memoryFor(fixture, candidate);
  let score = 0;
  let missing = 0;
  const signals = [];
  const valueLabel = candidate?.odd > 2.20 ? "Yüksek Değer" : "Normal Değer";

  Object.values(m).forEach((value) => { if (value === null) missing += 1; });

  if (toCount(m.homeScoredLast10) >= 4 && toCount(m.awayScoredLast10) >= 4) { score += 15; signals.push("İki takım son 10 maçta en az 4 gol attı: +15"); }
  if (toCount(m.homeConcededLast10) >= 4 && toCount(m.awayConcededLast10) >= 4) { score += 15; signals.push("İki takım son 10 maçta en az 4 gol yedi: +15"); }
  if (m.bttsPercent !== null && m.bttsPercent > 65) { score += 15; signals.push("KG Var yüzdesi %65 üzeri: +15"); }
  if (m.over25Percent !== null && m.over25Percent > 60) { score += 10; signals.push("2.5 Üst yüzdesi %60 üzeri: +10"); }
  if (m.over35Percent !== null && m.over35Percent > 45) { score += 10; signals.push("3.5 Üst yüzdesi %45 üzeri: +10"); }
  if (m.leagueGoalAverage !== null && m.leagueGoalAverage > 2.70) { score += 10; signals.push("Lig gol ortalaması 2.70 üzeri: +10"); }
  if (trendHigh(fixture, ["firstHalfGoalTrend", "ilk_yari_gol_egilimi", "iy_gol_egilimi", "first_half_goal_pct"])) { score += 10; signals.push("İlk yarı gol eğilimi yüksek: +10"); }
  if (trendHigh(fixture, ["secondHalfGoalTrend", "ikinci_yari_gol_egilimi", "second_half_goal_pct"])) { score += 10; signals.push("İkinci yarı gol eğilimi yüksek: +10"); }
  if (candidate?.odd > 1.70) { score += 10; signals.push("Oran 1.70 üzeri: +10"); }
  if (candidate?.odd > 2.20) signals.push("Oran 2.20 üzeri: Yüksek Değer etiketi");
  if (candidate?.oddSource === "raw_market_guess_odds") signals.push("Ham detay blok tahmini kullanıldı");
  if (memory.scoreDelta) { score += memory.scoreDelta; signals.push(...memory.signals, `Hafıza toplam etkisi: +${memory.scoreDelta}`); }
  else signals.push(...memory.signals);
  if (missing > 0 && memory.totalMatches >= 10) { score += 5; signals.push("Arşiv hafızası veri eksikliğini kısmen dengeledi: +5"); }
  if (riskyContext(fixture)) { score -= 10; signals.push("Kritik/derbi/belirsiz maç: -10"); }
  if (closedDefense(fixture)) { score -= 10; signals.push("Kapalı savunma riski: -10"); }
  if (missing > 0) { score -= 15; signals.push("Veri eksikliği var: -15"); }

  score = Math.round(clamp(score));
  const klass = classFor(score);
  const dataRisk = gapRisk(missing);
  signals.push(`Veri eksikliği riski: ${dataRisk}`);
  signals.push(`100 puan analiz sınıfı: ${klass}`);

  return {
    analysis_score: score,
    analysis_class: klass,
    value_label: valueLabel,
    data_gap_risk: dataRisk,
    data_missing_count: missing,
    metrics: {
      ...m,
      memory,
      homeScoredLast10Count: toCount(m.homeScoredLast10),
      awayScoredLast10Count: toCount(m.awayScoredLast10),
      homeConcededLast10Count: toCount(m.homeConcededLast10),
      awayConcededLast10Count: toCount(m.awayConcededLast10),
    },
    signals,
  };
};

const candidateFor = (fixture, key, rule) => {
  const odd = oddFor(fixture, rule.keys);
  if (!odd || odd < rule.minOdd || odd > rule.maxOdd) return null;
  const oddSource = rule.keys.some((item) => String(item).includes("_guess")) && fixture?.raw_market_guess_odds ? "raw_market_guess_odds" : "standard";
  const analysis = buildMatchAnalysis(fixture, { key, odd, oddSource });
  if (analysis.analysis_score < 40) return null;
  return { key, label: rule.label, odd, confidence: analysis.analysis_score, risk: analysis.analysis_score >= 75 ? "Düşük" : analysis.analysis_score >= 60 ? "Orta" : "Yüksek", expected_scores: rule.scores, analysis, value_label: analysis.value_label, odd_source_type: oddSource, signals: [`Market: ${rule.label}`, `Oran: ${formatOdd(odd)}`, `Veri tipi: ${oddSource}`, `Değer etiketi: ${analysis.value_label}`, ...analysis.signals] };
};

const candidatesFor = (fixture) => Object.entries(marketRules)
  .map(([key, rule]) => candidateFor(fixture, key, rule))
  .filter(Boolean)
  .sort((a, b) => b.confidence - a.confidence || b.odd - a.odd);

const emptyScore = (fixture, reason, status, extraSignals) => {
  const t = teams(fixture);
  const analysis = buildMatchAnalysis(fixture, null);
  return { ...fixture, home: t.home, away: t.away, match: `${t.home} VS ${t.away}`, market: reason, selection: reason, odds: "-", confidence: pct(analysis.analysis_score), lab_probability: pct(analysis.analysis_score), trust_score: `${analysis.analysis_score}/100`, tag: analysis.analysis_class, value_label: analysis.value_label, expected_scores: [], score: analysis.analysis_score, risk: analysis.analysis_score < 50 ? "Yüksek" : "Orta", status, hasOdds: false, analysis_score: analysis.analysis_score, analysis_class: analysis.analysis_class, data_gap_risk: analysis.data_gap_risk, analysis_metrics: analysis.metrics, pro_signals: [...extraSignals, ...analysis.signals] };
};

const scoreFixture = (fixture) => {
  if (!isCurrent(fixture)) return emptyScore(fixture, "Güncel maç değil", "filtered_old_fixture", ["Eski tarihli maç elendi"]);
  const best = candidatesFor(fixture)[0];
  if (!best) return emptyScore(fixture, "Değerli market yok", "filtered_no_value_market", ["Düşük oran veya eksik veri nedeniyle elendi", "Çifte şans kullanılmadı"]);
  const t = teams(fixture);
  const score = best.confidence;
  return { ...fixture, home: t.home, away: t.away, match: `${t.home} VS ${t.away}`, market: best.label, selection: best.label, odds: formatOdd(best.odd), confidence: pct(score), lab_probability: pct(score), trust_score: `${score}/100`, tag: best.analysis.analysis_class, value_label: best.value_label, expected_scores: best.expected_scores, score, risk: best.risk, status: fixture.status || "scheduled", hasOdds: true, analysis_score: score, analysis_class: best.analysis.analysis_class, data_gap_risk: best.analysis.data_gap_risk, analysis_metrics: best.analysis.metrics, odd_source_type: best.odd_source_type, pro_signals: best.signals };
};

const legFromItem = (item, number) => ({ number, home: item.home, away: item.away, match: item.match, date: item.date || "", time: item.time || "", league: item.league || item.competition_name || "", selection: item.selection || item.market, option: item.selection || item.market, odds: item.odds, lab_probability: item.lab_probability || item.confidence, confidence: item.confidence, trust_score: item.trust_score, risk: item.risk, tag: item.tag, value_label: item.value_label, analysis_score: item.analysis_score, analysis_class: item.analysis_class, data_gap_risk: item.data_gap_risk, expected_scores: item.expected_scores || [], signals: item.pro_signals || [] });
const combinedOdds = (items) => items.reduce((acc, item) => acc * (parseOdd(item.odds) || 1), 1).toFixed(2);
const dataGapFor = (items) => items.some((item) => item.data_gap_risk === "Yüksek") ? "Yüksek" : items.some((item) => item.data_gap_risk === "Orta") ? "Orta" : "Düşük";
const valueFor = (items) => items.some((item) => item.value_label === "Yüksek Değer") ? "Yüksek Değer" : "Normal Değer";

const buildCouponAnalysis = (fixtures = []) => {
  const scored = fixtures.map(scoreFixture);
  const ranked = scored.filter((item) => item.hasOdds && item.score >= 65).sort((a, b) => b.score - a.score || (parseOdd(b.odds) || 0) - (parseOdd(a.odds) || 0)).slice(0, 14);
  const singles = ranked.slice(0, 6).map((item) => ({ match: item.match, market: item.market, odds: item.odds, confidence: item.confidence, score: item.score, risk: item.risk, tag: item.tag, value_label: item.value_label, analysis_score: item.analysis_score, analysis_class: item.analysis_class, data_gap_risk: item.data_gap_risk, expected_scores: item.expected_scores, signals: item.pro_signals, legs: [legFromItem(item, 1)] }));
  const doubles = [];
  const triples = [];
  const pool = ranked.filter((item) => parseOdd(item.odds) >= 1.60);

  for (let i = 0; i + 1 < pool.length && doubles.length < 3; i += 2) {
    const pair = [pool[i], pool[i + 1]];
    const score = Math.round(pair.reduce((sum, item) => sum + item.score, 0) / 2);
    const odd = parseOdd(combinedOdds(pair));
    if (!odd || odd < 2.40) continue;
    doubles.push({ match: pair.map((item) => item.match).join(" + "), market: pair.map((item) => item.market).join(" + "), odds: odd.toFixed(2), confidence: pct(score), score, risk: pair.some((item) => item.risk === "Yüksek") ? "Yüksek" : "Orta", tag: classFor(score), value_label: valueFor(pair), analysis_score: score, analysis_class: classFor(score), data_gap_risk: dataGapFor(pair), expected_scores: pair.flatMap((item) => item.expected_scores || []).slice(0, 4), signals: pair.flatMap((item) => item.pro_signals || []).slice(0, 5), legs: pair.map((item, index) => legFromItem(item, index + 1)) });
  }

  for (let i = 0; i + 2 < pool.length && triples.length < 2; i += 3) {
    const trio = [pool[i], pool[i + 1], pool[i + 2]];
    const score = Math.round(trio.reduce((sum, item) => sum + item.score, 0) / 3);
    const odd = parseOdd(combinedOdds(trio));
    if (!odd || odd < 3.20) continue;
    triples.push({ match: trio.map((item) => item.match).join(" + "), market: trio.map((item) => item.market).join(" + "), odds: odd.toFixed(2), confidence: pct(score), score, risk: "Yüksek", tag: classFor(score), value_label: valueFor(trio), analysis_score: score, analysis_class: classFor(score), data_gap_risk: dataGapFor(trio), expected_scores: trio.flatMap((item) => item.expected_scores || []).slice(0, 6), signals: trio.flatMap((item) => item.pro_signals || []).slice(0, 6), legs: trio.map((item, index) => legFromItem(item, index + 1)) });
  }

  return { scored, ranked, singles, doubles, triples };
};

module.exports = { scoreFixture, buildCouponAnalysis, buildMatchAnalysis, memoryFor };



