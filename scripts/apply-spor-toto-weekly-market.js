const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const bulletinPath = path.join(root, "data", "spor_toto_bulteni.json");
const marketPath = path.join(root, "data", "spor_toto_weekly_market.json");
const OPTIONS = ["1", "X", "2"];

const readJson = (file, fallback) => {
  try {
    const text = fs.readFileSync(file, "utf8").trim();
    return text ? JSON.parse(text) : fallback;
  } catch { return fallback; }
};
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};
const clean = (value) => String(value || "").toLocaleLowerCase("tr-TR").replace(/ı/g, "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
const keyOf = (row) => `${String(row.date || "").slice(0, 10)}|${clean(row.home)}|${clean(row.away)}`;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const normalize = (values) => {
  const nums = OPTIONS.map((option) => Math.max(0, Number(values?.[option]) || 0));
  const total = nums.reduce((a, b) => a + b, 0);
  if (!total) return null;
  const out = {};
  OPTIONS.forEach((option, index) => { out[option] = Number(((nums[index] / total) * 100).toFixed(1)); });
  out["1"] = Number((out["1"] + Number((100 - out["1"] - out.X - out["2"]).toFixed(1))).toFixed(1));
  return out;
};
const marketProbabilities = (odds) => odds ? normalize({ "1": 1 / Number(odds["1"]), X: 1 / Number(odds.X), "2": 1 / Number(odds["2"]) }) : null;
const blend = (market, prediction) => {
  if (!market) return null;
  if (!prediction) return market;
  return normalize(Object.fromEntries(OPTIONS.map((option) => [option, market[option] * 0.68 + prediction[option] * 0.32])));
};
const ranked = (probabilities) => [...OPTIONS].sort((a, b) => Number(probabilities?.[b] || 0) - Number(probabilities?.[a] || 0));

function applyOne(match, marketRow) {
  if (!marketRow?.market_verified || Number(marketRow?.market?.source_count || 0) < 2 || !marketRow?.market?.odds) return match;
  const odds = marketRow.market.odds;
  if (!OPTIONS.every((option) => Number.isFinite(Number(odds[option])) && Number(odds[option]) > 1.01)) return match;
  const marketP = marketProbabilities(odds);
  const externalP = marketRow?.prediction?.probabilities ? normalize(marketRow.prediction.probabilities) : null;
  const probabilities = blend(marketP, externalP);
  if (!probabilities) return match;
  const order = ranked(probabilities);
  const top = order[0]; const second = order[1];
  const topP = Number(probabilities[top]); const secondP = Number(probabilities[second]);
  const gap = Number((topP - secondP).toFixed(1));
  const sources = Number(marketRow.market.source_count || 0);
  const h2h = Array.isArray(marketRow?.prediction?.h2h) ? marketRow.prediction.h2h : [];
  const hasPrediction = Boolean(externalP);
  const dataCompleteness = Math.round(clamp(48 + Math.min(8, sources) * 3 + (hasPrediction ? 15 : 0) + (h2h.length ? 8 : 0), 50, 95));
  const confidence = Math.round(clamp(47 + Math.min(8, sources) * 1.5 + Math.min(24, gap) * 0.65 + (hasPrediction ? 5 : 0) + (h2h.length ? 3 : 0), 50, 84));
  let classification = "Kontrollü Tek";
  if (topP < 45 || gap < 8) classification = "Çifte Şans Adayı";
  else if (topP >= 59 && gap >= 16 && confidence >= 68 && h2h.length) classification = "Banko Adayı";
  else if (!h2h.length) classification = "Piyasa Bazlı Tek";
  const risk = h2h.length && confidence >= 74 && gap >= 17 ? "Düşük" : topP < 45 || gap < 8 || !h2h.length ? "Yüksek" : "Orta";
  const bookmakerNames = Array.isArray(marketRow.market.bookmakers) ? marketRow.market.bookmakers : [];
  const basis = hasPrediction ? "multi_bookmaker_market_plus_api_prediction" : "multi_bookmaker_market";
  const reasons = [
    `Çoklu bookmaker doğrulaması: ${sources} kaynak; medyan 1-X-2 oranı ${Number(odds["1"]).toFixed(2)} / ${Number(odds.X).toFixed(2)} / ${Number(odds["2"]).toFixed(2)}.`,
    hasPrediction
      ? `Bağımsız API-Football istatistik tahmini de modele %32 ağırlıkla katıldı: 1 %${externalP["1"].toFixed(1)}, X %${externalP.X.toFixed(1)}, 2 %${externalP["2"].toFixed(1)}.`
      : "İstatistik tahmini bu maç için mevcut değil; model doğrulanmış çoklu piyasa tabanında tutuldu.",
    h2h.length ? `Doğrulanmış son H2H örnek sayısı: ${h2h.length}.` : "Doğrulanmış H2H örneği bu veri turunda alınamadı.",
  ];
  return {
    ...match,
    league: marketRow.league || match.league,
    source: "API-Football/API-Sports doğrulanmış çoklu bookmaker marketi",
    matchCode: marketRow.fixture_id || match.matchCode || null,
    one: Number(odds["1"]), draw: Number(odds.X), two: Number(odds["2"]),
    oneOdd: Number(odds["1"]), drawOdd: Number(odds.X), twoOdd: Number(odds["2"]),
    probabilities,
    market_probabilities: marketP,
    probability_basis: basis,
    analysis_ready: true,
    decision: top,
    selected_options: [top],
    selection: top,
    coupon_role: classification,
    classification,
    confidence,
    confidence_score: confidence,
    risk,
    risk_level: risk,
    data_completeness: dataCompleteness,
    probability_gap: gap,
    column_multiplier: 1,
    independent_evidence: h2h.length > 0,
    evidence_mode: h2h.length ? "verified_market_plus_external_history" : "verified_multi_bookmaker_market",
    market_validation: {
      verified: true,
      source_count: sources,
      bookmaker_names: bookmakerNames,
      fetched_at: marketRow.market_fetched_at || null,
      aggregation: "median",
    },
    external_prediction: hasPrediction ? {
      provider: "API-Football/API-Sports",
      probabilities: externalP,
      fetched_at: marketRow.prediction_fetched_at || null,
      advice: marketRow.prediction.advice || null,
      winner: marketRow.prediction.winner || null,
      under_over: marketRow.prediction.under_over || null,
    } : null,
    reasons,
    h2h,
    squad: match.squad || { available: false, home: [], away: [], note: "Doğrulanmış eksik/kadro verisi bulunmuyor." },
  };
}

function run() {
  const bulletin = readJson(bulletinPath, null);
  const market = readJson(marketPath, null);
  if (!bulletin || !Array.isArray(bulletin.matches) || bulletin.matches.length !== 15) throw new Error("Spor Toto bülteni yok veya 15 maç değil");
  if (!market || !Array.isArray(market.matches)) {
    console.log("Spor Toto weekly market cache yok; mevcut bülten korunuyor.");
    return bulletin;
  }
  const marketMap = new Map(market.matches.map((row) => [keyOf(row), row]));
  const matches = bulletin.matches.map((match) => applyOne(match, marketMap.get(keyOf(match))));
  const ready = matches.filter((match) => match.analysis_ready).length;
  const output = {
    ...bulletin,
    generated_at: new Date().toISOString(),
    market_enrichment: {
      source: market.source,
      cache_generated_at: market.generated_at || null,
      fixture_match_count: Number(market.fixture_match_count || 0),
      verified_market_count: Number(market.verified_market_count || 0),
      prediction_count: Number(market.prediction_count || 0),
      applied_ready_count: ready,
    },
    analysis_ready_count: ready,
    analysis_waiting_count: 15 - ready,
    matches,
  };
  writeJson(bulletinPath, output);
  console.log(`Spor Toto weekly market applied. ready=${ready}/15, waiting=${15 - ready}.`);
  return output;
}

if (require.main === module) run();
module.exports = { run, applyOne, marketProbabilities, blend };
