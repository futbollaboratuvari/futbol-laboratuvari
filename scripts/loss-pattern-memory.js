"use strict";

const fs = require("fs");
const path = require("path");
const { canonicalMarket } = require("./robot-learning-memory");

const root = path.join(__dirname, "..");
const learningMemoryPath = path.join(root, "data", "learning-memory.json");
const lossMemoryPath = path.join(root, "data", "loss-pattern-memory.json");
const reportPath = path.join(root, "outputs", "loss-pattern-memory-report.md");

const MIN_SETTLED = 10;
const MIN_FACTOR_LOSSES = 4;
const MIN_FACTOR_DATES = 3;
const MIN_FACTOR_SHARE = 0.45;
const MAX_BRAKE = 3;

let cache = null;

function readJson(filePath, fallback) {
  try {
    const text = fs.readFileSync(filePath, "utf8").trim();
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function writeText(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value, "utf8");
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

function numberOrNull(value) {
  if (value === undefined || value === null || value === "" || value === "-") return null;
  const number = Number(String(value).replace("%", "").replace(",", "."));
  return Number.isFinite(number) ? number : null;
}

function parseScore(value) {
  const match = String(value || "").match(/(\d+)\s*[-:]\s*(\d+)/);
  if (!match) return null;
  return { home: Number(match[1]), away: Number(match[2]) };
}

function outcomeMissType(prediction) {
  const market = canonicalMarket(prediction?.market);
  const score = parseScore(prediction?.result_score);
  if (!score) return "result_detail_missing";
  const total = score.home + score.away;
  const bothScored = score.home > 0 && score.away > 0;

  if (/Üst$/.test(market)) return "goal_shortfall";
  if (/Alt$/.test(market)) return "goal_overrun";
  if (market === "KG Var") return bothScored ? "other_market_miss" : "btts_failed";
  if (market === "KG Yok") return bothScored ? "btts_occurred" : "other_market_miss";
  if (market === "MS 1") {
    if (score.home === score.away) return "home_pick_drew";
    return "home_pick_lost";
  }
  if (market === "MS 2") {
    if (score.home === score.away) return "away_pick_drew";
    return "away_pick_lost";
  }
  if (market === "MS X") return score.home > score.away ? "draw_pick_home_win" : "draw_pick_away_win";
  if (/KG Var/.test(market) && !bothScored) return "btts_failed";
  if (/KG Yok/.test(market) && bothScored) return "btts_occurred";
  if (/2\.5 Üst/.test(market) && total <= 2) return "goal_shortfall";
  if (/3\.5 Üst/.test(market) && total <= 3) return "goal_shortfall";
  return "other_market_miss";
}

function contextFactors(prediction) {
  const factors = [];
  const completeness = numberOrNull(prediction?.data_completeness);
  const edge = numberOrNull(prediction?.edge_percent);
  const modelScore = numberOrNull(prediction?.model_score ?? prediction?.analysis_score);
  const risk = clean(prediction?.risk_level);

  if (completeness !== null && completeness < 55) factors.push("low_data_selection");
  if (edge !== null && edge <= 0) factors.push("nonpositive_edge_selection");
  if (modelScore !== null && modelScore >= 75) factors.push("high_confidence_miss");
  if (risk.includes("yuksek")) factors.push("high_risk_selection");
  return factors;
}

function emptyFactor() {
  return { loss_count: 0, distinct_dates: 0, share_of_losses: 0, active: false, _dates: new Set() };
}

function emptyProfile() {
  return {
    settled: 0,
    won: 0,
    lost: 0,
    loss_rate: null,
    distinct_loss_dates: 0,
    miss_types: {},
    factors: {},
    dominant_miss_type: null,
    active_factor_count: 0,
    _loss_dates: new Set(),
  };
}

function finalizeProfile(profile) {
  profile.loss_rate = profile.settled ? Number((profile.lost / profile.settled).toFixed(3)) : null;
  profile.distinct_loss_dates = profile._loss_dates.size;
  delete profile._loss_dates;

  const lossCount = Math.max(1, profile.lost);
  for (const factor of Object.values(profile.factors)) {
    factor.distinct_dates = factor._dates.size;
    factor.share_of_losses = Number((factor.loss_count / lossCount).toFixed(3));
    factor.active = profile.settled >= MIN_SETTLED
      && factor.loss_count >= MIN_FACTOR_LOSSES
      && factor.distinct_dates >= MIN_FACTOR_DATES
      && factor.share_of_losses >= MIN_FACTOR_SHARE;
    delete factor._dates;
  }

  profile.active_factor_count = Object.values(profile.factors).filter((item) => item.active).length;
  profile.dominant_miss_type = Object.entries(profile.miss_types)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  return profile;
}

function buildLossPatternMemory(predictions = []) {
  const marketProfiles = {};
  const settled = predictions.filter((item) => ["won", "lost"].includes(item?.status));

  for (const prediction of settled) {
    const market = canonicalMarket(prediction.market);
    if (!market || market === "Belirsiz") continue;
    const profile = marketProfiles[market] || (marketProfiles[market] = emptyProfile());
    profile.settled += 1;

    if (prediction.status === "won") {
      profile.won += 1;
      continue;
    }

    profile.lost += 1;
    const date = String(prediction.date || prediction.finalized_at || "").slice(0, 10);
    if (date) profile._loss_dates.add(date);

    const missType = outcomeMissType(prediction);
    profile.miss_types[missType] = (profile.miss_types[missType] || 0) + 1;

    for (const factorName of contextFactors(prediction)) {
      const factor = profile.factors[factorName] || (profile.factors[factorName] = emptyFactor());
      factor.loss_count += 1;
      if (date) factor._dates.add(date);
    }
  }

  Object.values(marketProfiles).forEach(finalizeProfile);
  const allLosses = Object.values(marketProfiles).reduce((sum, profile) => sum + profile.lost, 0);
  const activeMarkets = Object.values(marketProfiles).filter((profile) => profile.active_factor_count > 0).length;

  return {
    schema_version: "loss_pattern_memory_v1",
    generated_at: new Date().toISOString(),
    status: "active",
    policy: {
      purpose: "Tekrarlayan gözlenebilir hata bağlamlarını saptayıp gelecekte aynı bağlamda yalnız negatif fren uygulamak.",
      no_causality_claim: true,
      min_settled: MIN_SETTLED,
      min_factor_losses: MIN_FACTOR_LOSSES,
      min_factor_dates: MIN_FACTOR_DATES,
      min_factor_share: MIN_FACTOR_SHARE,
      max_brake_points: MAX_BRAKE,
    },
    summary: {
      settled_predictions: settled.length,
      lost_predictions: allLosses,
      market_count: Object.keys(marketProfiles).length,
      active_market_count: activeMarkets,
    },
    market_profiles: marketProfiles,
  };
}

function currentContextFactors(item) {
  return contextFactors({
    data_completeness: item?.data_completeness,
    edge_percent: item?.edge_percent,
    model_score: item?.model_score ?? item?.analysis_score ?? item?.score,
    risk_level: item?.risk_level ?? item?.risk,
  });
}

function loadLossPatternMemory() {
  if (cache) return cache;
  cache = readJson(lossMemoryPath, { status: "missing", market_profiles: {} });
  return cache;
}

function resetLossPatternCache() {
  cache = null;
}

function lossPatternAdjustmentFor(item, memory = loadLossPatternMemory()) {
  const market = canonicalMarket(item?.selection || item?.market || item?.recommended_market);
  const profile = memory?.market_profiles?.[market];
  if (!profile) {
    return { market, delta: 0, applied: false, matched_factors: [], notes: ["Hata hafızası: bu market için yeterli geçmiş örnek yok."] };
  }

  const currentFactors = currentContextFactors(item);
  const matched = currentFactors
    .filter((name) => profile.factors?.[name]?.active)
    .map((name) => ({ name, ...profile.factors[name] }));

  if (!matched.length) {
    return { market, delta: 0, applied: false, matched_factors: [], notes: ["Hata hafızası: tekrar eden aktif hata bağlamı bu seçimde yok."] };
  }

  const penalty = Math.min(MAX_BRAKE, matched.length);
  const names = matched.map((item) => item.name).join(", ");
  return {
    market,
    delta: -penalty,
    applied: true,
    matched_factors: matched,
    notes: [`Hata hafızası freni: ${names}. Model gücü -${penalty} puan.`],
  };
}

function makeReport(memory) {
  const lines = [
    "# PRO Robot Hata Öğrenme Raporu",
    "",
    `Oluşturma: ${new Date(memory.generated_at).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}`,
    "",
    `- Sonuçlanmış tahmin: ${memory.summary.settled_predictions}`,
    `- Kaybeden tahmin: ${memory.summary.lost_predictions}`,
    `- İzlenen market: ${memory.summary.market_count}`,
    `- Aktif fren profili olan market: ${memory.summary.active_market_count}`,
    "",
    "## Market Profilleri",
    "",
  ];

  for (const [market, profile] of Object.entries(memory.market_profiles || {})) {
    const active = Object.entries(profile.factors || {}).filter(([, stat]) => stat.active).map(([name]) => name);
    lines.push(`- ${market}: ${profile.settled} sonuç, ${profile.lost} kayıp, kayıp oranı ${profile.loss_rate === null ? "-" : `%${Math.round(profile.loss_rate * 100)}`}, baskın kaçış ${profile.dominant_miss_type || "-"}, aktif faktör ${active.length ? active.join(", ") : "yok"}`);
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function runLossPatternMemory() {
  const learning = readJson(learningMemoryPath, { predictions: [] });
  const memory = buildLossPatternMemory(learning.predictions || []);
  writeJson(lossMemoryPath, memory);
  writeText(reportPath, makeReport(memory));
  cache = memory;
  console.log(`Loss pattern memory updated. Settled: ${memory.summary.settled_predictions}, active markets: ${memory.summary.active_market_count}`);
  return memory;
}

if (require.main === module) runLossPatternMemory();

module.exports = {
  buildLossPatternMemory,
  contextFactors,
  currentContextFactors,
  loadLossPatternMemory,
  lossPatternAdjustmentFor,
  outcomeMissType,
  resetLossPatternCache,
  runLossPatternMemory,
};
