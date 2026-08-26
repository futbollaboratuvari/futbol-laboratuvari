const fs = require("fs");
const path = require("path");
const { MODEL_VERSION, scoreFixture } = require("./robot-exact-scoring");
const { applyLearningWeightsToScoredItem } = require("./apply-learning-weights");
const { buildProAnalysisIndex } = require("./build-pro-analysis-index");

const rootDir = path.join(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const archiveDir = path.join(dataDir, "archive");
const fixturesPath = path.join(dataDir, "fixtures.json");
const liveMatchesPath = path.join(dataDir, "live-matches.json");
const dailyCouponsPath = path.join(dataDir, "daily-coupons.json");
const robotAnalysisPath = path.join(dataDir, "robot-analysis.json");
const bandSignalsPath = path.join(dataDir, "band-signals.json");

const todayTR = () => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Istanbul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

const readJson = (filePath, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
};

const writeJson = (filePath, data) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
};

const parseOdd = (value) => {
  const number = Number(String(value || "").replace(",", "."));
  return Number.isFinite(number) && number > 1 ? number : null;
};

const numberOrNull = (value) => {
  if (value === undefined || value === null || value === "" || value === "-") return null;
  const number = Number(String(value).replace("%", "").replace(",", "."));
  return Number.isFinite(number) ? number : null;
};

const pickOdd = (row, keys) => {
  for (const key of keys) {
    const value = row?.[key] ?? row?.odds?.[key] ?? row?.oranlar?.[key] ?? row?.detay_oranlar?.[key] ?? row?.raw_market_guess_odds?.[key];
    const odd = parseOdd(value);
    if (odd) return odd.toFixed(2);
  }
  return "-";
};

const oddsSnapshot = (row) => ({
  ms1: pickOdd(row, ["ms1", "one", "oneOdd", "odd1", "homeWin", "home_win"]),
  msx: pickOdd(row, ["msx", "draw", "drawOdd", "oddX", "x", "draw_odd"]),
  ms2: pickOdd(row, ["ms2", "two", "twoOdd", "odd2", "awayWin", "away_win"]),
  over25: pickOdd(row, ["over25", "ust25", "over", "ust", "ust_25", "over25_guess"]),
  under25: pickOdd(row, ["under25", "alt25", "under", "alt", "alt_25", "under25_guess"]),
  over35: pickOdd(row, ["over35", "ust35", "over3_5", "ust_35", "over35_guess"]),
  under35: pickOdd(row, ["under35", "alt35", "under3_5", "alt_35", "under35_guess"]),
  bttsYes: pickOdd(row, ["bttsYes", "kgVar", "kg_var", "varOdd", "var", "bttsYes_guess"]),
  bttsNo: pickOdd(row, ["bttsNo", "kgYok", "kg_yok", "yokOdd", "yok", "bttsNo_guess"]),
  firstHalfBttsYes: pickOdd(row, ["firstHalfBttsYes", "iyKgVar", "iy_kg_var", "first_half_btts_yes", "firstHalfBttsYes_guess"]),
  firstHalfBttsNo: pickOdd(row, ["firstHalfBttsNo", "iyKgYok", "iy_kg_yok", "first_half_btts_no", "firstHalfBttsNo_guess"]),
  secondHalfBttsYes: pickOdd(row, ["secondHalfBttsYes", "ikinciYariKgVar", "ikinci_yari_kg_var", "second_half_btts_yes", "secondHalfBttsYes_guess"]),
  secondHalfBttsNo: pickOdd(row, ["secondHalfBttsNo", "ikinciYariKgYok", "ikinci_yari_kg_yok", "second_half_btts_no", "secondHalfBttsNo_guess"]),
});

const cleanKey = (value) => String(value || "-")
  .toLocaleLowerCase("tr-TR")
  .replace(/ı/g, "i")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const DEFAULT_BAND_RECORD = {
  band_check: { level: "Orta", notes: ["Kadro istihbaratı eşleşmedi; düşük risk varsayılmadı."] },
  extra_used: {
    squad_risk_level: "Belirsiz",
    lineup_risk_level: "Belirsiz",
    squad_verified_team_count: 0,
    named_player_count: 0,
    team_status: null,
    lineup: null,
  },
};

const bandKey = (item) => {
  const date = String(item.date || item.tarih || item.utc_date || "").slice(0, 10);
  const name = cleanKey(item.match_name || item.match || `${item.home || ""} VS ${item.away || ""}`);
  return date ? `${date}|${name}` : name;
};

const loadBandMap = () => {
  const data = readJson(bandSignalsPath, { matches: [] });
  const map = new Map();
  for (const item of data.matches || []) {
    map.set(bandKey(item), item);
  }
  return map;
};

const bandRecordFor = (item, map) => map.get(bandKey(item))
  || map.get(cleanKey(item.match_name || item.match || `${item.home || ""} VS ${item.away || ""}`))
  || DEFAULT_BAND_RECORD;

const riskRank = (value) => {
  const text = cleanKey(value);
  if (text.includes("yuksek")) return 3;
  if (text.includes("orta") || text.includes("belirsiz") || text.includes("veri yok")) return 2;
  if (text.includes("dusuk")) return 1;
  return 0;
};

const worstRisk = (...values) => {
  const rank = Math.max(...values.map(riskRank), 0);
  return rank >= 3 ? "Yüksek" : rank >= 2 ? "Orta" : rank === 1 ? "Düşük" : "Yüksek";
};

function applyTeamIntelligence(item, bandRecord = DEFAULT_BAND_RECORD) {
  const extra = bandRecord?.extra_used || DEFAULT_BAND_RECORD.extra_used;
  const squadRisk = String(extra.squad_risk_level || "Belirsiz");
  const lineupRisk = String(extra.lineup_risk_level || "Belirsiz");
  const verifiedTeams = Number(extra.squad_verified_team_count || 0);
  const combined = worstRisk(squadRisk, lineupRisk);
  const unknown = /belirsiz|veri yok/i.test(`${squadRisk} ${lineupRisk}`) || verifiedTeams < 2;
  const penalty = combined === "Yüksek" ? 12 : unknown ? 4 : combined === "Orta" ? 6 : 0;
  const originalScore = Number(item.model_score ?? item.analysis_score ?? item.score ?? 0);
  const adjustedScore = Math.max(0, Math.round(originalScore - penalty));
  const originalCompleteness = Number(item.data_completeness || 0);
  const adjustedCompleteness = unknown ? Math.max(0, originalCompleteness - 5) : originalCompleteness;
  const note = combined === "Yüksek"
    ? `Kadro/ilk 11 riski yüksek; model gücü ${penalty} puan düşürüldü ve kupon kapatıldı.`
    : unknown
      ? `İki takım için kadro doğrulaması tamamlanmadı; model gücü ${penalty} puan ihtiyat payıyla düşürüldü.`
      : combined === "Orta" ? `Kadro/ilk 11 riski orta; model gücü ${penalty} puan düşürüldü.` : "Kadro akışı iki takım için doğrulandı.";
  const signals = [note, ...(Array.isArray(item.pro_signals) ? item.pro_signals : [])];
  return {
    ...item,
    score: adjustedScore,
    model_score: adjustedScore,
    analysis_score: adjustedScore,
    confidence: `${adjustedScore}%`,
    trust_score: `${adjustedScore}/100`,
    data_completeness: adjustedCompleteness,
    data_gap_risk: unknown ? worstRisk(item.data_gap_risk, "Orta") : item.data_gap_risk,
    risk: worstRisk(item.risk, combined),
    squad_risk_level: squadRisk,
    lineup_risk_level: lineupRisk,
    team_status_verified_count: verifiedTeams,
    named_player_count: Number(extra.named_player_count || 0),
    team_intelligence: {
      ...extra,
      adjustment: { original_model_score: originalScore, penalty, adjusted_model_score: adjustedScore, reason: note },
    },
    band_check: bandRecord?.band_check || DEFAULT_BAND_RECORD.band_check,
    pro_signals: signals,
  };
}

const fixtureDate = (fixture) => String(fixture.date || fixture.tarih || fixture.utc_date || "").slice(0, 10);

const isToday = (fixture, today) => fixtureDate(fixture) === today;

// The fixture feed already defines the current bulletin window (today + upcoming
// matches). Daily cards must stay limited to today, while PRO analysis must cover
// every current/future fixture that the Special Analysis UI can display.
const selectDailyMatches = (fixtures, today) => (Array.isArray(fixtures) ? fixtures : [])
  .filter((fixture) => isToday(fixture, today));

const selectAnalysisMatches = (fixtures, today) => (Array.isArray(fixtures) ? fixtures : [])
  .filter((fixture) => {
    const date = fixtureDate(fixture);
    return Boolean(date) && date >= today;
  });

const score_match = (match) => applyLearningWeightsToScoredItem(scoreFixture(match));

function calculate_match_score(match) {
  return score_match(match).analysis_score || 0;
}

function detect_best_market(match) {
  const scored = score_match(match);
  return {
    market: scored.selection || scored.market || "-",
    odds: scored.odds || "-",
    expected_scores: scored.expected_scores || [],
  };
}

function calculate_value_rating(match) {
  const scored = score_match(match);
  return scored.value_label || "-";
}

function determine_risk_level(match) {
  const scored = score_match(match);
  return scored.risk || "-";
}

function generate_robot_explanation(match) {
  const scored = match?.match ? match : score_match(match);
  const signals = Array.isArray(scored.pro_signals) ? scored.pro_signals : [];
  if (signals.length) return signals.slice(0, 4).join(" | ");
  return "Bu maçta robot; gol üretimi, gol yeme eğilimi, lig gol ortalaması, oran değeri ve veri eksikliği riskini birlikte değerlendirdi.";
}

function coupon_type_for_match(match) {
  const scored = match?.match ? match : score_match(match);
  const score = Number(scored.analysis_score ?? scored.score ?? 0);
  const odd = parseOdd(scored.odds) || 0;
  const market = String(scored.market || scored.selection || "").toLocaleLowerCase("tr-TR");
  if (scored.band_check?.level === "Yüksek") return "Sadece izleme";
  if (/ilk yarı kg|ikinci yarı kg|3\.5/.test(market) && score >= 50) return "Riskli Laboratuvar Kuponu";
  if (scored.value_label === "Yüksek Değer" && odd >= 2.2 && score >= 65) return "Yüksek Oranlı Kupon";
  if (score >= 65 && (scored.risk === "Düşük" || scored.risk === "Orta")) return "Dengeli Kupon";
  if (score >= 50) return "Sadece izleme";
  return "Oynama";
}

function live_match_output(match) {
  const scored = match?.match ? match : score_match(match);
  const band = scored.band_check || { level: "Düşük", notes: [] };
  const availableOdds = oddsSnapshot(scored);
  return {
    match_name: scored.match,
    home: scored.home || scored.home_team_name || "",
    away: scored.away || scored.away_team_name || "",
    date: scored.date || scored.tarih || "",
    match_code: scored.matchCode || scored.match_code || "",
    league: scored.league || scored.competition_name || "-",
    start_time: scored.time || "-",
    recommended_market: scored.selection || scored.market || "-",
    confidence_score: scored.confidence || "-",
    model_score: Number(scored.model_score ?? scored.analysis_score ?? scored.score ?? 0),
    analysis_score: scored.analysis_score ?? scored.score ?? 0,
    score_type: scored.score_type || "signal_strength",
    estimated_probability: numberOrNull(scored.estimated_probability),
    market_probability: numberOrNull(scored.market_probability),
    edge_percent: numberOrNull(scored.edge_percent),
    data_completeness: numberOrNull(scored.data_completeness) || 0,
    evidence_mode: scored.evidence_mode || "market_baseline",
    independent_evidence: Boolean(scored.independent_evidence),
    probability_source: Array.isArray(scored.probability_source) ? scored.probability_source : [],
    model_version: scored.model_version || MODEL_VERSION,
    risk_level: scored.risk || "-",
    estimated_odds: scored.odds || "-",
    available_odds: availableOdds,
    raw_market_guess_odds: scored.raw_market_guess_odds || {},
    detail_market_candidates: scored.detail_market_candidates || [],
    raw_market_blocks: scored.raw_market_blocks || [],
    odds_source: scored.oddsSource || scored.odds_source || scored.source || scored.raw_market_source || "-",
    value_label: scored.value_label || "-",
    band_attention_level: band.level,
    band_attention_notes: band.notes || [],
    squad_risk_level: scored.squad_risk_level || scored.team_intelligence?.squad_risk_level || "Belirsiz",
    lineup_risk_level: scored.lineup_risk_level || scored.team_intelligence?.lineup_risk_level || "Belirsiz",
    team_status_verified_count: Number(scored.team_status_verified_count || 0),
    named_player_count: Number(scored.named_player_count || 0),
    team_intelligence: scored.team_intelligence || null,
    robot_comment: generate_robot_explanation(scored),
    include_in_coupon: Boolean(scored.hasOdds
      && Number(scored.score || 0) >= 65
      && Number(scored.data_completeness || 0) >= 45
      && Number(scored.estimated_probability || 0) >= 42
      && band.level !== "Yüksek"),
    suitable_coupon_type: coupon_type_for_match(scored),
    data_gap_risk: scored.data_gap_risk || "-",
    status: scored.status || "scheduled",
    expected_scores: scored.expected_scores || [],
    learning_adjustment: scored.learning_adjustment || null,
  };
}

const coupon_name = (type) => {
  if (type === "balanced") return "Dengeli Kupon";
  if (type === "high_value") return "Yüksek Oranlı Kupon";
  return "Riskli Laboratuvar Kuponu";
};

const coupon_description = (type, legs) => {
  if (!legs.length) return "Bugün için güncel veri henüz oluşmadı.";
  if (type === "balanced") return "Daha güvenli maçlardan oluşan düşük-orta riskli laboratuvar kuponu.";
  if (type === "high_value") return "Oran değeri yüksek, veri desteği olan orta-yüksek riskli kupon.";
  return "İlk Yarı KG, İkinci Yarı KG ve 3.5 Üst gibi yüksek oranlı marketlerden oluşan riskli laboratuvar kuponu.";
};

function make_coupon(type, items, size) {
  const legs = items.slice(0, size).map((item, index) => ({
    no: index + 1,
    match_name: item.match,
    league: item.league || item.competition_name || "-",
    start_time: item.time || "-",
    recommended_market: item.selection || item.market || "-",
    confidence_score: item.confidence || "-",
    model_score: Number(item.model_score ?? item.analysis_score ?? item.score ?? 0),
    analysis_score: item.analysis_score ?? item.score ?? 0,
    estimated_probability: numberOrNull(item.estimated_probability),
    market_probability: numberOrNull(item.market_probability),
    edge_percent: numberOrNull(item.edge_percent),
    data_completeness: numberOrNull(item.data_completeness) || 0,
    model_version: item.model_version || MODEL_VERSION,
    risk_level: item.risk || "-",
    estimated_odds: item.odds || "-",
    available_odds: oddsSnapshot(item),
    raw_market_guess_odds: item.raw_market_guess_odds || {},
    detail_market_candidates: item.detail_market_candidates || [],
    odds_source: item.oddsSource || item.odds_source || item.source || item.raw_market_source || "-",
    value_label: item.value_label || "-",
    band_attention_level: item.band_check?.level || "Düşük",
    squad_risk_level: item.squad_risk_level || "Belirsiz",
    lineup_risk_level: item.lineup_risk_level || "Belirsiz",
    named_player_count: Number(item.named_player_count || 0),
    robot_reason: generate_robot_explanation(item),
    learning_adjustment: item.learning_adjustment || null,
  }));
  const total = legs.reduce((acc, leg) => acc * (parseOdd(leg.estimated_odds) || 1), 1);
  const averageScore = legs.length ? Math.round(legs.reduce((acc, leg) => acc + Number(leg.analysis_score || 0), 0) / legs.length) : 0;
  const combinedProbability = legs.length && legs.every((leg) => Number.isFinite(leg.estimated_probability))
    ? Number((legs.reduce((acc, leg) => acc * (leg.estimated_probability / 100), 1) * 100).toFixed(1))
    : null;
  const risk = !legs.length ? "-" : type === "risk_lab" ? "Yüksek" : type === "high_value" ? "Orta-Yüksek" : "Düşük-Orta";
  return {
    coupon_name: coupon_name(type),
    coupon_type: type,
    selected_matches: legs,
    total_odds: legs.length ? total.toFixed(2) : "-",
    average_confidence_score: legs.length ? `${averageScore}%` : "-",
    combined_estimated_probability: combinedProbability,
    risk_level: risk,
    short_description: coupon_description(type, legs),
    robot_reason: legs.length
      ? `${coupon_name(type)}; ${legs.length} maç, toplam oran ${total.toFixed(2)}, ortalama model gücü ${averageScore}/100.`
      : "Bugün için güncel veri henüz oluşmadı.",
    is_available: Boolean(legs.length),
  };
}

function build_daily_coupons(matches) {
  const bandMap = loadBandMap();
  const scored = matches.map(score_match).map((item) => applyTeamIntelligence(item, bandRecordFor(item, bandMap)));
  const available = scored.filter((item) => item.hasOdds && Number(item.score || 0) >= 65 && item.band_check?.level !== "Yüksek");
  const watchlist = scored.filter((item) => item.hasOdds && Number(item.score || 0) >= 40 && Number(item.score || 0) < 65 && item.band_check?.level !== "Yüksek");
  const balancedPool = available
    .filter((item) => Number(item.score || 0) >= 65 && item.risk !== "Yüksek")
    .sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
  const highValuePool = available
    .filter((item) => item.value_label === "Yüksek Değer" && parseOdd(item.odds) >= 2.2 && Number(item.score || 0) >= 65)
    .sort((a, b) => Number(b.edge_percent || 0) - Number(a.edge_percent || 0));
  const riskLabPool = available
    .filter((item) => /İlk Yarı KG|İkinci Yarı KG|3\.5 Üst/.test(String(item.market || item.selection || "")) && Number(item.score || 0) >= 50)
    .sort((a, b) => (parseOdd(b.odds) || 0) - (parseOdd(a.odds) || 0));

  return {
    scored,
    watchlist,
    available,
    coupons: {
      laboratory_today: make_coupon("balanced", balancedPool, 3),
      balanced: make_coupon("balanced", balancedPool, 3),
      high_value: make_coupon("high_value", highValuePool, 4),
      risk_lab: make_coupon("risk_lab", riskLabPool, 3),
    },
  };
}

function export_json_outputs(couponBundle, matches, analysisBundle = couponBundle, analysisMatches = matches) {
  const today = todayTR();
  const sourceExists = matches.length > 0;
  const scored = couponBundle.scored || [];
  const analysisScored = analysisBundle.scored || [];
  const dailyCoupons = {
    generated_at: new Date().toISOString(),
    date: today,
    source: sourceExists ? "High Value Coupon Engine" : "Güncel veri bekleniyor",
    message: sourceExists ? "" : "Bugün için güncel veri henüz oluşmadı.",
    coupons: couponBundle.coupons,
  };
  const liveMatches = {
    generated_at: new Date().toISOString(),
    date: today,
    source: dailyCoupons.source,
    message: sourceExists ? "" : "Bugün için güncel veri henüz oluşmadı.",
    matches: scored.map(live_match_output),
  };
  const robotAnalysis = {
    generated_at: new Date().toISOString(),
    date: today,
    engine: "Futbol Laboratuvarı PRO 13",
    model_version: MODEL_VERSION,
    scoring_mode: "market_conditioned_probability_ensemble_with_learning_memory",
    stale_data_policy: "Eski veri gösterme. Güncel bülten penceresindeki bugün ve yaklaşan maçları analiz et.",
    summary: {
      fixture_count: analysisMatches.length,
      scored_match_count: analysisScored.length,
      coupon_candidate_count: analysisBundle.available.length,
      watch_candidate_count: (analysisBundle.watchlist || []).length,
      learning_adjusted_count: analysisScored.filter((item) => item.learning_adjustment?.applied).length,
      squad_adjusted_count: analysisScored.filter((item) => Number(item.team_intelligence?.adjustment?.penalty || 0) > 0).length,
      named_player_match_count: analysisScored.filter((item) => Number(item.named_player_count || 0) > 0).length,
    },
    watchlist: (analysisBundle.watchlist || []).map((item) => live_match_output(item)),
    matches: analysisScored.map((item) => ({
      ...live_match_output(item),
      metrics: item.analysis_metrics || {},
      signals: item.pro_signals || [],
      learning_adjustment: item.learning_adjustment || null,
    })),
  };

  writeJson(liveMatchesPath, liveMatches);
  writeJson(dailyCouponsPath, dailyCoupons);
  writeJson(robotAnalysisPath, robotAnalysis);
  writeJson(path.join(archiveDir, `${today}.json`), { liveMatches, dailyCoupons, robotAnalysis });
  buildProAnalysisIndex();
  return { liveMatches, dailyCoupons, robotAnalysis };
}

function main() {
  const today = todayTR();
  const fixtures = readJson(fixturesPath, []);
  const dailyMatches = selectDailyMatches(fixtures, today);
  const analysisMatches = selectAnalysisMatches(fixtures, today);
  const dailyCoupons = build_daily_coupons(dailyMatches);
  const analysisBundle = build_daily_coupons(analysisMatches);
  export_json_outputs(dailyCoupons, dailyMatches, analysisBundle, analysisMatches);
  console.log(`High Value JSON çıktı dosyaları üretildi: ${today}. Günlük: ${dailyMatches.length}. PRO pencere: ${analysisMatches.length}.`);
}

if (require.main === module) main();

module.exports = {
  calculate_match_score,
  detect_best_market,
  calculate_value_rating,
  determine_risk_level,
  build_daily_coupons,
  generate_robot_explanation,
  export_json_outputs,
  applyTeamIntelligence,
  bandRecordFor,
  selectAnalysisMatches,
  selectDailyMatches,
};
