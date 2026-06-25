const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const outputsDir = path.join(rootDir, "outputs");
const memoryPath = path.join(dataDir, "learning-memory.json");
const robotAnalysisPath = path.join(dataDir, "robot-analysis.json");
const liveMatchesPath = path.join(dataDir, "live-matches.json");
const reportPath = path.join(outputsDir, "learning-memory-report.md");

const MAX_PREDICTIONS = 1500;

function readJson(filePath, fallback) {
  try {
    const text = fs.readFileSync(filePath, "utf8").trim();
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function writeText(filePath, text) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, text, "utf8");
}

function todayTR() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
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
  if (/degerli market yok|degerli secenek yok|oynama/.test(key)) return "Değerli Seçenek Yok";
  return text || "Belirsiz";
}

function matchName(item) {
  return String(item.match_name || item.match || `${item.home || ""} - ${item.away || ""}`).replace(/\s+VS\s+/i, " - ").trim();
}

function predictionId(item, date) {
  const league = clean(item.league || item.competition_name || "lig");
  const match = clean(matchName(item));
  const market = clean(canonicalMarket(item.recommended_market || item.market || item.selection));
  const time = clean(item.start_time || item.time || "");
  return [date, league, match, market, time].filter(Boolean).join("|");
}

function parseScore(score) {
  const match = String(score || "").match(/(\d+)\s*[-:]\s*(\d+)/);
  if (!match) return null;
  return { home: Number(match[1]), away: Number(match[2]) };
}

function isFinished(item) {
  const status = clean(item.status || item.liveStatus || item.result_status);
  return ["finished", "bitti", "tamamlandi", "ft", "full time", "ms"].includes(status);
}

function evaluateMarket(market, score) {
  const parsed = parseScore(score);
  if (!parsed) return "pending";
  const total = parsed.home + parsed.away;
  const bothScored = parsed.home > 0 && parsed.away > 0;
  if (market === "KG Var") return bothScored ? "won" : "lost";
  if (market === "KG Yok") return !bothScored ? "won" : "lost";
  if (market === "2.5 Üst") return total > 2.5 ? "won" : "lost";
  if (market === "2.5 Alt") return total < 2.5 ? "won" : "lost";
  if (market === "3.5 Üst") return total > 3.5 ? "won" : "lost";
  if (market === "MS 1") return parsed.home > parsed.away ? "won" : "lost";
  if (market === "MS X") return parsed.home === parsed.away ? "won" : "lost";
  if (market === "MS 2") return parsed.away > parsed.home ? "won" : "lost";
  return "pending";
}

function buildPrediction(item, date, liveMap) {
  const id = predictionId(item, date);
  const market = canonicalMarket(item.recommended_market || item.market || item.selection);
  const live = liveMap.get(clean(matchName(item))) || null;
  const score = live?.score || item.score || "";
  const result = isFinished(live || item) ? evaluateMarket(market, score) : "pending";
  return {
    id,
    date,
    created_at: new Date().toISOString(),
    match_name: matchName(item),
    league: item.league || item.competition_name || "-",
    start_time: item.start_time || item.time || "-",
    market,
    odds: item.estimated_odds || item.odds || "-",
    confidence_score: item.confidence_score || item.confidence || "-",
    analysis_score: Number(item.analysis_score ?? item.score ?? 0),
    risk_level: item.risk_level || item.risk || "-",
    status: result,
    result_score: score || "",
    source: item.odds_source || item.source || "robot-analysis",
    learning_note: result === "pending" ? "Sonuç bekleniyor." : "Sonuç işlendi."
  };
}

function makeBucket() {
  return {
    total: 0,
    pending: 0,
    won: 0,
    lost: 0,
    void: 0,
    success_rate: null,
    weight: 1,
    confidence_adjustment: 0
  };
}

function addToBucket(bucket, status) {
  bucket.total += 1;
  if (status === "won") bucket.won += 1;
  else if (status === "lost") bucket.lost += 1;
  else if (status === "void") bucket.void += 1;
  else bucket.pending += 1;
}

function finalizeBucket(bucket) {
  const settled = bucket.won + bucket.lost;
  bucket.success_rate = settled ? Number((bucket.won / settled).toFixed(3)) : null;
  if (settled < 5 || bucket.success_rate === null) {
    bucket.weight = 1;
    bucket.confidence_adjustment = 0;
    return bucket;
  }
  if (bucket.success_rate >= 0.62) {
    bucket.weight = 1.12;
    bucket.confidence_adjustment = 4;
  } else if (bucket.success_rate >= 0.55) {
    bucket.weight = 1.06;
    bucket.confidence_adjustment = 2;
  } else if (bucket.success_rate <= 0.42) {
    bucket.weight = 0.88;
    bucket.confidence_adjustment = -5;
  } else if (bucket.success_rate <= 0.48) {
    bucket.weight = 0.94;
    bucket.confidence_adjustment = -2;
  } else {
    bucket.weight = 1;
    bucket.confidence_adjustment = 0;
  }
  return bucket;
}

function buildMemory(predictions) {
  const marketMemory = {};
  const leagueMemory = {};
  const leagueMarketMemory = {};

  for (const prediction of predictions) {
    const market = prediction.market || "Belirsiz";
    const league = prediction.league || "-";
    const leagueMarket = `${league} :: ${market}`;
    marketMemory[market] = marketMemory[market] || makeBucket();
    leagueMemory[league] = leagueMemory[league] || makeBucket();
    leagueMarketMemory[leagueMarket] = leagueMarketMemory[leagueMarket] || makeBucket();
    addToBucket(marketMemory[market], prediction.status);
    addToBucket(leagueMemory[league], prediction.status);
    addToBucket(leagueMarketMemory[leagueMarket], prediction.status);
  }

  Object.values(marketMemory).forEach(finalizeBucket);
  Object.values(leagueMemory).forEach(finalizeBucket);
  Object.values(leagueMarketMemory).forEach(finalizeBucket);

  return { marketMemory, leagueMemory, leagueMarketMemory };
}

function makeReport(memory) {
  const lines = [];
  lines.push("# Robot Öğrenme Hafızası Raporu");
  lines.push("");
  lines.push(`Oluşturma: ${new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}`);
  lines.push("");
  lines.push("## Özet");
  lines.push("");
  lines.push(`- Toplam tahmin: ${memory.summary.total_predictions}`);
  lines.push(`- Bekleyen tahmin: ${memory.summary.pending_predictions}`);
  lines.push(`- Kazanan tahmin: ${memory.summary.won_predictions}`);
  lines.push(`- Kaybeden tahmin: ${memory.summary.lost_predictions}`);
  lines.push(`- Lig sayısı: ${memory.summary.league_count}`);
  lines.push(`- Seçenek sayısı: ${memory.summary.market_count}`);
  lines.push("");
  lines.push("## Öğrenme Mantığı");
  lines.push("");
  lines.push("- Robot tahminleri maç, lig, seçenek, oran, güven ve risk bilgisiyle kaydedilir.");
  lines.push("- Maç sonucu geldiğinde uygun seçeneklerde kazandı/kaybetti değerlendirmesi yapılır.");
  lines.push("- Lig ve seçenek başarı oranları oluşunca ağırlık ve güven ayarı hesaplanır.");
  lines.push("- 5 sonuçtan az veri varsa ağırlık nötr kalır; robot acele öğrenmez.");
  lines.push("");
  lines.push("## En Güçlü Seçenek Hafızası");
  lines.push("");
  const markets = Object.entries(memory.market_memory || {})
    .sort((a, b) => Number(b[1].success_rate || 0) - Number(a[1].success_rate || 0))
    .slice(0, 12);
  if (!markets.length) lines.push("- Henüz seçenek hafızası oluşmadı.");
  for (const [market, stat] of markets) {
    lines.push(`- ${market}: toplam ${stat.total}, bekleyen ${stat.pending}, başarı ${stat.success_rate === null ? "bekleniyor" : `%${Math.round(stat.success_rate * 100)}`}, ağırlık ${stat.weight}`);
  }
  lines.push("");
  lines.push("## Son Tahmin Kayıtları");
  lines.push("");
  for (const item of memory.predictions.slice(0, 15)) {
    lines.push(`- ${item.date} | ${item.league} | ${item.match_name} | ${item.market} | ${item.status} | ${item.analysis_score}/100`);
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function runLearningMemory() {
  const today = todayTR();
  const previous = readJson(memoryPath, {
    schema_version: "learning_memory_v1",
    created_at: new Date().toISOString(),
    predictions: []
  });
  const robotAnalysis = readJson(robotAnalysisPath, { matches: [] });
  const liveMatches = readJson(liveMatchesPath, { matches: [] });
  const liveMap = new Map((liveMatches.matches || []).map((item) => [clean(matchName(item)), item]));
  const existing = new Map((previous.predictions || []).map((item) => [item.id, item]));
  let added = 0;
  let updated = 0;

  for (const item of robotAnalysis.matches || []) {
    const market = canonicalMarket(item.recommended_market || item.market || item.selection);
    if (!market || market === "Değerli Seçenek Yok" || market === "Belirsiz") continue;
    const prediction = buildPrediction(item, robotAnalysis.date || today, liveMap);
    const old = existing.get(prediction.id);
    if (!old) {
      existing.set(prediction.id, prediction);
      added += 1;
    } else {
      const merged = {
        ...old,
        ...prediction,
        created_at: old.created_at || prediction.created_at,
        updated_at: new Date().toISOString()
      };
      if (old.status !== merged.status || old.result_score !== merged.result_score || old.analysis_score !== merged.analysis_score) updated += 1;
      existing.set(prediction.id, merged);
    }
  }

  const predictions = Array.from(existing.values())
    .sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")))
    .slice(0, MAX_PREDICTIONS);
  const { marketMemory, leagueMemory, leagueMarketMemory } = buildMemory(predictions);
  const summary = {
    total_predictions: predictions.length,
    pending_predictions: predictions.filter((item) => item.status === "pending").length,
    won_predictions: predictions.filter((item) => item.status === "won").length,
    lost_predictions: predictions.filter((item) => item.status === "lost").length,
    void_predictions: predictions.filter((item) => item.status === "void").length,
    league_count: Object.keys(leagueMemory).length,
    market_count: Object.keys(marketMemory).length,
    added_predictions: added,
    updated_predictions: updated
  };

  const memory = {
    schema_version: "learning_memory_v1",
    created_at: previous.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: "active",
    description: "Robotun tahminlerini, sonuçlarını ve lig/market performansını takip etmek için öğrenme hafızası.",
    summary,
    market_memory: marketMemory,
    league_memory: leagueMemory,
    league_market_memory: leagueMarketMemory,
    predictions
  };

  writeJson(memoryPath, memory);
  writeText(reportPath, makeReport(memory));
  console.log(`Robot learning memory updated. Added: ${added}, Updated: ${updated}, Total: ${predictions.length}`);
  return memory;
}

if (require.main === module) runLearningMemory();

module.exports = {
  runLearningMemory,
  evaluateMarket,
  canonicalMarket,
  buildMemory
};
