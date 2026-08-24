const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");
const robotFile = path.join(dataDir, "robot-analysis.json");
const historyFile = path.join(dataDir, "analiz_sonuclari.json");
const outputFile = path.join(dataDir, "pro-analysis-index.json");
const FALLBACK_MODEL_VERSION = "pro13-market-conditioned-v1";

function readJson(file, fallback) {
  try {
    const text = fs.readFileSync(file, "utf8").trim();
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function finite(value) {
  if (value === undefined || value === null || value === "" || value === "-") return null;
  const number = Number(String(value).replace("%", "").replace(",", "."));
  return Number.isFinite(number) ? number : null;
}

function clean(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function teamsOf(item) {
  if (item.home && item.away) return { home: String(item.home).trim(), away: String(item.away).trim() };
  const parts = String(item.match_name || item.match || "").split(/\s+(?:vs\.?|v|-)\s+/i);
  return {
    home: String(parts[0] || "Ev sahibi").trim(),
    away: String(parts[1] || "Deplasman").trim(),
  };
}

function matchId(item, date) {
  const teams = teamsOf(item);
  const code = String(item.match_code || item.matchCode || "").trim();
  return code || [date, item.start_time || item.time, clean(teams.home), clean(teams.away)].filter(Boolean).join("-");
}

function marketGroup(value) {
  const market = clean(value);
  if (/^ms |mac sonucu/.test(market)) return "match_result";
  if (/kg |btts|karsilikli gol/.test(market)) return "btts";
  if (/ust|alt|gol/.test(market)) return "goals";
  return "other";
}

function statusOf(item) {
  const value = clean(item.status || item.result);
  if (["won", "kazandi", "dogru"].includes(value)) return "won";
  if (["lost", "kaybetti", "yanlis"].includes(value)) return "lost";
  return "pending";
}

function buildCalibration(history) {
  const completed = Array.isArray(history.completed_items) ? history.completed_items : [];
  const settled = completed.filter((item) => ["won", "lost"].includes(statusOf(item)));
  const groups = new Map();
  const probabilityRows = [];

  settled.forEach((item) => {
    const key = item.market_group || marketGroup(item.market || item.prediction);
    const row = groups.get(key) || { key, measured: 0, won: 0, lost: 0, success_rate: null };
    row.measured += 1;
    if (statusOf(item) === "won") row.won += 1;
    else row.lost += 1;
    row.success_rate = Math.round((row.won / row.measured) * 100);
    groups.set(key, row);

    const probability = finite(item.estimated_probability);
    if (probability !== null && probability >= 0 && probability <= 100) {
      probabilityRows.push({ probability: probability / 100, outcome: statusOf(item) === "won" ? 1 : 0 });
    }
  });

  const brier = probabilityRows.length
    ? probabilityRows.reduce((sum, item) => sum + ((item.probability - item.outcome) ** 2), 0) / probabilityRows.length
    : null;
  const performance = history.performance || {};
  return {
    measured_count: Number(performance.measured_count ?? settled.length),
    won_count: Number(performance.won_count ?? settled.filter((item) => statusOf(item) === "won").length),
    lost_count: Number(performance.lost_count ?? settled.filter((item) => statusOf(item) === "lost").length),
    success_rate: finite(performance.success_rate),
    groups: [...groups.values()].sort((a, b) => b.measured - a.measured),
    probability_sample_count: probabilityRows.length,
    brier_score: brier === null ? null : Number(brier.toFixed(4)),
    calibration_status: probabilityRows.length >= 30 ? "measured" : "collecting_probability_history",
    note: probabilityRows.length >= 30
      ? "Tahmini olasılıklar tamamlanan sonuçlarla Brier skoru üzerinden ölçülüyor."
      : "Eski model puanları olasılık değildi; PRO 13 olasılık geçmişi biriktikçe kalibrasyon ölçümü açılacak.",
  };
}

function compactMetrics(item) {
  const metrics = item.metrics || item.analysis_metrics || {};
  const memory = metrics.memory || {};
  const poisson = metrics.poisson || item.poisson || {};
  const fields = [
    "homeScoredLast10", "awayScoredLast10", "homeConcededLast10", "awayConcededLast10",
    "bttsPercent", "over25Percent", "over35Percent", "firstHalfGoalTrend",
    "secondHalfGoalTrend", "leagueGoalAverage", "metric_quality",
  ];
  const compact = {};
  fields.forEach((key) => {
    const value = metrics[key];
    if (value !== undefined && value !== null && value !== "") compact[key] = value;
  });
  const memorySamples = finite(metrics.memory_samples ?? memory.samples);
  if (memorySamples !== null) compact.memory_samples = memorySamples;
  const homeLambda = finite(poisson.homeLambda ?? poisson.home_lambda);
  const awayLambda = finite(poisson.awayLambda ?? poisson.away_lambda);
  const samples = finite(poisson.samples);
  if (homeLambda !== null || awayLambda !== null) {
    compact.poisson = { home_lambda: homeLambda, away_lambda: awayLambda, samples };
  }
  return compact;
}

function couponEligibility(item, modelScore, dataCompleteness, market) {
  const estimatedProbability = finite(item.estimated_probability);
  return Boolean(item.include_in_coupon)
    && Boolean(item.independent_evidence)
    && modelScore >= 65
    && dataCompleteness >= 45
    && Number(estimatedProbability || 0) >= 42
    && !/degerli market yok|oynama|secim yok|pas gec/.test(clean(market))
    && !clean(item.risk_level || item.risk).includes("yuksek");
}

function compactMatch(item, parent) {
  const teams = teamsOf(item);
  const date = String(item.date || parent.date || "").slice(0, 10);
  const modelScore = finite(item.model_score ?? item.analysis_score ?? item.confidence_score) || 0;
  const dataCompleteness = finite(item.data_completeness) || 0;
  const market = String(item.recommended_market || item.market || "Değerli market yok");
  const includeInCoupon = couponEligibility(item, modelScore, dataCompleteness, market);
  const signals = (Array.isArray(item.signals) && item.signals.length ? item.signals
    : Array.isArray(item.pro_signals) && item.pro_signals.length ? item.pro_signals
      : item.robot_comment ? [item.robot_comment] : [])
    .map((value) => String(value).trim())
    .filter(Boolean)
    .slice(0, 7);
  return {
    id: matchId(item, date),
    date,
    time: String(item.start_time || item.time || "").slice(0, 5),
    league: String(item.league || item.competition_name || "Lig"),
    home: teams.home,
    away: teams.away,
    match_code: String(item.match_code || item.matchCode || ""),
    status: String(item.status || "scheduled"),
    recommended_market: market,
    model_score: modelScore,
    score_type: item.score_type || "signal_strength",
    estimated_probability: finite(item.estimated_probability),
    market_probability: finite(item.market_probability),
    edge_percent: finite(item.edge_percent),
    data_completeness: dataCompleteness,
    data_quality: !item.independent_evidence ? "Sınırlı" : dataCompleteness >= 70 ? "Yüksek" : dataCompleteness >= 45 ? "Orta" : "Sınırlı",
    evidence_mode: String(item.evidence_mode || "market_baseline"),
    independent_evidence: Boolean(item.independent_evidence),
    probability_source: Array.isArray(item.probability_source) ? item.probability_source.slice(0, 4) : [],
    data_gap_risk: String(item.data_gap_risk || "Yüksek"),
    risk_level: String(item.risk_level || item.risk || "Yüksek"),
    recommended_odd: finite(item.estimated_odds || item.odds),
    include_in_coupon: includeInCoupon,
    value_label: String(item.value_label || "Piyasa ile Uyumlu"),
    expected_scores: Array.isArray(item.expected_scores) ? item.expected_scores.slice(0, 3) : [],
    metrics: compactMetrics(item),
    signals,
    model_version: item.model_version || parent.model_version || FALLBACK_MODEL_VERSION,
    source: String(item.odds_source || item.source || parent.engine || "PRO analiz akışı"),
  };
}

function buildProAnalysisIndex() {
  if (!fs.existsSync(robotFile)) {
    const existing = readJson(outputFile, null);
    if (existing && Array.isArray(existing.matches)) return existing;
  }
  const robot = readJson(robotFile, { matches: [], summary: {} });
  const history = readJson(historyFile, { completed_items: [], performance: {} });
  const matches = (Array.isArray(robot.matches) ? robot.matches : []).map((item) => compactMatch(item, robot));
  const ready = matches.filter((item) => item.model_score >= 60
    && item.data_completeness >= 35
    && !/değerli market yok|degerli market yok|oynama/i.test(item.recommended_market));
  const payload = {
    schema_version: 1,
    generated_at: robot.generated_at || new Date().toISOString(),
    date: robot.date || "",
    timezone: "Europe/Istanbul",
    engine: robot.engine || "Futbol Laboratuvarı PRO 13",
    model_version: robot.model_version || FALLBACK_MODEL_VERSION,
    score_semantics: "model_score is signal strength from 0 to 100; it is not an outcome probability",
    source: "robot-analysis.json compact verified projection",
    summary: {
      match_count: matches.length,
      pro_ready_count: ready.length,
      coupon_candidate_count: matches.filter((item) => item.include_in_coupon).length,
      average_data_completeness: matches.length
        ? Math.round(matches.reduce((sum, item) => sum + item.data_completeness, 0) / matches.length) : 0,
    },
    calibration: buildCalibration(history),
    matches,
  };
  writeJson(outputFile, payload);
  return payload;
}

function main() {
  const payload = buildProAnalysisIndex();
  console.log(`PRO analiz indeksi üretildi. Maç: ${payload.summary.match_count}. Hazır: ${payload.summary.pro_ready_count}.`);
}

if (require.main === module) main();

module.exports = { buildCalibration, buildProAnalysisIndex, compactMatch, compactMetrics, couponEligibility, main, matchId, teamsOf };
