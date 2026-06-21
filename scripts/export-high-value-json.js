const fs = require("fs");
const path = require("path");
const { buildCouponAnalysis, scoreFixture } = require("./robot-exact-scoring");

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

const cleanKey = (value) => String(value || "-")
  .toLocaleLowerCase("tr-TR")
  .replace(/ı/g, "i")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const loadBandMap = () => {
  const data = readJson(bandSignalsPath, { matches: [] });
  const map = new Map();
  for (const item of data.matches || []) {
    map.set(cleanKey(item.match_name || item.match), item.band_check || { level: "Düşük", notes: [] });
  }
  return map;
};

const bandFor = (item, map) => map.get(cleanKey(item.match_name || item.match)) || { level: "Düşük", notes: ["Bant kontrol verisi yok."] };

const isToday = (fixture, today) => String(fixture.date || fixture.tarih || fixture.utc_date || "").slice(0, 10) === today;

const score_match = (match) => scoreFixture(match);

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
  if (odd >= 2.2 && score >= 65) return "Yüksek Oranlı Kupon";
  if (score >= 65 && (scored.risk === "Düşük" || scored.risk === "Orta")) return "Dengeli Kupon";
  if (score >= 50) return "Sadece izleme";
  return "Oynama";
}

function live_match_output(match) {
  const scored = match?.match ? match : score_match(match);
  const band = scored.band_check || { level: "Düşük", notes: [] };
  return {
    match_name: scored.match,
    league: scored.league || scored.competition_name || "-",
    start_time: scored.time || "-",
    recommended_market: scored.selection || scored.market || "-",
    confidence_score: scored.confidence || "-",
    analysis_score: scored.analysis_score ?? scored.score ?? 0,
    risk_level: scored.risk || "-",
    estimated_odds: scored.odds || "-",
    value_label: scored.value_label || "-",
    band_attention_level: band.level,
    band_attention_notes: band.notes || [],
    robot_comment: generate_robot_explanation(scored),
    include_in_coupon: Boolean(scored.hasOdds && Number(scored.score || 0) >= 65 && band.level !== "Yüksek"),
    suitable_coupon_type: coupon_type_for_match(scored),
    data_gap_risk: scored.data_gap_risk || "-",
    status: scored.status || "scheduled",
    expected_scores: scored.expected_scores || [],
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
    analysis_score: item.analysis_score ?? item.score ?? 0,
    risk_level: item.risk || "-",
    estimated_odds: item.odds || "-",
    value_label: item.value_label || "-",
    band_attention_level: item.band_check?.level || "Düşük",
    robot_reason: generate_robot_explanation(item),
  }));
  const total = legs.reduce((acc, leg) => acc * (parseOdd(leg.estimated_odds) || 1), 1);
  const averageScore = legs.length ? Math.round(legs.reduce((acc, leg) => acc + Number(leg.analysis_score || 0), 0) / legs.length) : 0;
  const risk = !legs.length ? "-" : type === "risk_lab" ? "Yüksek" : type === "high_value" ? "Orta-Yüksek" : "Düşük-Orta";
  return {
    coupon_name: coupon_name(type),
    coupon_type: type,
    selected_matches: legs,
    total_odds: legs.length ? total.toFixed(2) : "-",
    average_confidence_score: legs.length ? `${averageScore}%` : "-",
    risk_level: risk,
    short_description: coupon_description(type, legs),
    robot_reason: legs.length
      ? `${coupon_name(type)}; ${legs.length} maç, toplam oran ${total.toFixed(2)}, ortalama güven ${averageScore}%.`
      : "Bugün için güncel veri henüz oluşmadı.",
    is_available: Boolean(legs.length),
  };
}

function build_daily_coupons(matches) {
  const bandMap = loadBandMap();
  const scored = matches.map(score_match).map((item) => ({ ...item, band_check: bandFor(item, bandMap) }));
  const available = scored.filter((item) => item.hasOdds && Number(item.score || 0) >= 50 && item.band_check?.level !== "Yüksek");
  const balancedPool = available
    .filter((item) => Number(item.score || 0) >= 65 && item.risk !== "Yüksek")
    .sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
  const highValuePool = available
    .filter((item) => parseOdd(item.odds) >= 2.2 && Number(item.score || 0) >= 65)
    .sort((a, b) => (parseOdd(b.odds) || 0) - (parseOdd(a.odds) || 0));
  const riskLabPool = available
    .filter((item) => /İlk Yarı KG|İkinci Yarı KG|3\.5 Üst/.test(String(item.market || item.selection || "")) && Number(item.score || 0) >= 50)
    .sort((a, b) => (parseOdd(b.odds) || 0) - (parseOdd(a.odds) || 0));

  return {
    scored,
    available,
    coupons: {
      laboratory_today: make_coupon("balanced", balancedPool, 3),
      balanced: make_coupon("balanced", balancedPool, 3),
      high_value: make_coupon("high_value", highValuePool.length ? highValuePool : available.filter((item) => Number(item.score || 0) >= 65), 4),
      risk_lab: make_coupon("risk_lab", riskLabPool, 3),
    },
  };
}

function export_json_outputs(couponBundle, matches) {
  const today = todayTR();
  const sourceExists = matches.length > 0;
  const scored = couponBundle.scored || [];
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
    engine: "High Value Coupon Engine",
    scoring_mode: "net_threshold_rules",
    stale_data_policy: "Eski veri gösterme. Bugünün verisi yoksa boş mesaj göster.",
    summary: {
      fixture_count: matches.length,
      scored_match_count: scored.length,
      coupon_candidate_count: couponBundle.available.length,
    },
    matches: scored.map((item) => ({
      ...live_match_output(item),
      metrics: item.analysis_metrics || {},
      signals: item.pro_signals || [],
    })),
  };

  writeJson(liveMatchesPath, liveMatches);
  writeJson(dailyCouponsPath, dailyCoupons);
  writeJson(robotAnalysisPath, robotAnalysis);
  writeJson(path.join(archiveDir, `${today}.json`), { liveMatches, dailyCoupons, robotAnalysis });
  return { liveMatches, dailyCoupons, robotAnalysis };
}

function main() {
  const today = todayTR();
  const fixtures = readJson(fixturesPath, []);
  const matches = fixtures.filter((fixture) => isToday(fixture, today));
  const coupons = build_daily_coupons(matches);
  export_json_outputs(coupons, matches);
  console.log(`High Value JSON çıktı dosyaları üretildi: ${today}`);
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
};