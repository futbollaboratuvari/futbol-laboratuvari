const fs = require("fs");
const path = require("path");

const memoryPath = path.join(__dirname, "..", "data", "learning-memory.json");

let cache = null;

function readJson(filePath, fallback) {
  try {
    const text = fs.readFileSync(filePath, "utf8").trim();
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
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

function canonicalMarket(value) {
  const text = String(value || "").trim();
  const key = clean(text);
  if (/ilk yari kg|1y kg|first half btts/.test(key)) return "İlk Yarı KG Var";
  if (/ikinci yari kg|2y kg|second half btts/.test(key)) return "İkinci Yarı KG Var";
  if (/kg var|btts yes/.test(key)) return "KG Var";
  if (/kg yok|btts no/.test(key)) return "KG Yok";
  if (/2 5.*ust|over 25|over 2 5/.test(key)) return "2.5 Üst";
  if (/2 5.*alt|under 25|under 2 5/.test(key)) return "2.5 Alt";
  if (/3 5.*ust|over 35|over 3 5/.test(key)) return "3.5 Üst";
  if (/ms 1|mac sonucu 1/.test(key)) return "MS 1";
  if (/ms x|mac sonucu x/.test(key)) return "MS X";
  if (/ms 2|mac sonucu 2/.test(key)) return "MS 2";
  if (/iy ms|ht ft/.test(key)) return "İY/MS";
  return text || "Belirsiz";
}

function loadLearningMemory() {
  if (cache) return cache;
  cache = readJson(memoryPath, {
    status: "missing",
    market_memory: {},
    league_memory: {},
    league_market_memory: {}
  });
  return cache;
}

function bucketIsReady(bucket) {
  if (!bucket) return false;
  const settled = Number(bucket.won || 0) + Number(bucket.lost || 0);
  return settled >= 5 && Number.isFinite(Number(bucket.success_rate));
}

function classFor(score) {
  if (score >= 80) return "Ana kupon adayı";
  if (score >= 65) return "Orta risk kupon adayı";
  if (score >= 50) return "Sadece izleme";
  return "Oynama";
}

function riskFor(score, oldRisk) {
  if (score >= 75) return "Düşük";
  if (score >= 60) return "Orta";
  if (score >= 50) return oldRisk || "Yüksek";
  return "Yüksek";
}

function adjustmentFor(scoredItem) {
  const memory = loadLearningMemory();
  const market = canonicalMarket(scoredItem.selection || scoredItem.market);
  const league = scoredItem.league || scoredItem.competition_name || "-";
  const marketBucket = memory.market_memory?.[market];
  const leagueBucket = memory.league_memory?.[league];
  const leagueMarketBucket = memory.league_market_memory?.[`${league} :: ${market}`];
  const parts = [];
  let delta = 0;
  let weight = 1;

  if (bucketIsReady(marketBucket)) {
    const d = Number(marketBucket.confidence_adjustment || 0);
    delta += d;
    weight *= Number(marketBucket.weight || 1);
    parts.push(`Öğrenme: ${market} başarı hafızası %${Math.round(Number(marketBucket.success_rate) * 100)} (${d >= 0 ? "+" : ""}${d})`);
  }

  if (bucketIsReady(leagueBucket)) {
    const d = Math.round(Number(leagueBucket.confidence_adjustment || 0) / 2);
    delta += d;
    weight *= Math.sqrt(Number(leagueBucket.weight || 1));
    parts.push(`Öğrenme: ${league} lig hafızası %${Math.round(Number(leagueBucket.success_rate) * 100)} (${d >= 0 ? "+" : ""}${d})`);
  }

  if (bucketIsReady(leagueMarketBucket)) {
    const d = Number(leagueMarketBucket.confidence_adjustment || 0);
    delta += d;
    weight *= Number(leagueMarketBucket.weight || 1);
    parts.push(`Öğrenme: lig+seçenek hafızası %${Math.round(Number(leagueMarketBucket.success_rate) * 100)} (${d >= 0 ? "+" : ""}${d})`);
  }

  delta = Math.max(-8, Math.min(8, Math.round(delta)));
  weight = Number(weight.toFixed(3));
  return {
    market,
    league,
    delta,
    weight,
    applied: parts.length > 0,
    notes: parts.length ? parts : ["Öğrenme: yeterli geçmiş sonuç oluşmadığı için ağırlık nötr."],
    market_bucket: marketBucket || null,
    league_bucket: leagueBucket || null,
    league_market_bucket: leagueMarketBucket || null
  };
}

function applyLearningWeightsToScoredItem(scoredItem) {
  if (!scoredItem || !scoredItem.hasOdds) return scoredItem;
  const baseScore = Number(scoredItem.analysis_score ?? scoredItem.score ?? 0);
  if (!Number.isFinite(baseScore)) return scoredItem;

  const adjustment = adjustmentFor(scoredItem);
  if (!adjustment.applied) {
    return {
      ...scoredItem,
      learning_adjustment: adjustment,
      pro_signals: [...(scoredItem.pro_signals || []), ...adjustment.notes]
    };
  }

  const weightedScore = Math.round(clamp((baseScore * adjustment.weight) + adjustment.delta));
  const analysisClass = classFor(weightedScore);
  const risk = riskFor(weightedScore, scoredItem.risk);
  const signals = [
    ...(scoredItem.pro_signals || []),
    ...adjustment.notes,
    `Öğrenme etkisi: ${baseScore}/100 → ${weightedScore}/100`
  ];

  return {
    ...scoredItem,
    score: weightedScore,
    analysis_score: weightedScore,
    confidence: `${weightedScore}%`,
    lab_probability: `${weightedScore}%`,
    trust_score: `${weightedScore}/100`,
    tag: analysisClass,
    analysis_class: analysisClass,
    risk,
    learning_adjustment: adjustment,
    analysis_metrics: {
      ...(scoredItem.analysis_metrics || {}),
      learning_adjustment: adjustment
    },
    pro_signals: signals
  };
}

module.exports = {
  applyLearningWeightsToScoredItem,
  loadLearningMemory,
  adjustmentFor,
  canonicalMarket
};
