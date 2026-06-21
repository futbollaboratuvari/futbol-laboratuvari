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

const isToday = (fixture, today) => String(fixture.date || fixture.tarih || fixture.utc_date || "").slice(0, 10) === today;

const legReason = (item) => {
  const signals = Array.isArray(item.pro_signals) ? item.pro_signals : [];
  return signals.slice(0, 4).join(" | ") || "Robot bu maçı veri, oran değeri ve risk dengesine göre değerlendirdi.";
};

const liveMatchFromScore = (item) => ({
  match_name: item.match,
  league: item.league || item.competition_name || "-",
  start_time: item.time || "-",
  recommended_market: item.selection || item.market || "-",
  confidence_score: item.confidence || "-",
  analysis_score: item.analysis_score ?? item.score ?? 0,
  risk_level: item.risk || "-",
  estimated_odds: item.odds || "-",
  value_label: item.value_label || "-",
  robot_comment: legReason(item),
  include_in_coupon: Boolean(item.hasOdds && Number(item.score || 0) >= 65),
  suitable_coupon_type: couponTypeForMatch(item),
  data_gap_risk: item.data_gap_risk || "-",
  status: item.status || "scheduled",
  expected_scores: item.expected_scores || [],
});

const couponTypeForMatch = (item) => {
  const score = Number(item.analysis_score ?? item.score ?? 0);
  const odd = parseOdd(item.odds) || 0;
  const market = String(item.market || item.selection || "").toLocaleLowerCase("tr-TR");
  if (/ilk yarı kg|ikinci yarı kg|3\.5/.test(market) && score >= 50) return "Riskli Laboratuvar Kuponu";
  if (odd >= 2.2 && score >= 65) return "Yüksek Oranlı Kupon";
  if (score >= 65 && (item.risk === "Düşük" || item.risk === "Orta")) return "Dengeli Kupon";
  if (score >= 50) return "Sadece izleme";
  return "Oynama";
};

const couponName = (type) => {
  if (type === "balanced") return "Dengeli Kupon";
  if (type === "high_value") return "Yüksek Oranlı Kupon";
  return "Riskli Laboratuvar Kuponu";
};

const couponDescription = (type, legs) => {
  if (!legs.length) return "Bugün için güncel veri henüz oluşmadı.";
  if (type === "balanced") return "Daha güvenli maçlardan oluşan düşük-orta riskli laboratuvar kuponu.";
  if (type === "high_value") return "Oran değeri yüksek, veri desteği olan orta-yüksek riskli kupon.";
  return "İlk Yarı KG, İkinci Yarı KG ve 3.5 Üst gibi yüksek oranlı marketlerden oluşan riskli laboratuvar kuponu.";
};

const buildCoupon = (type, items, size) => {
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
    robot_reason: legReason(item),
  }));
  const total = legs.reduce((acc, leg) => acc * (parseOdd(leg.estimated_odds) || 1), 1);
  const averageScore = legs.length ? Math.round(legs.reduce((acc, leg) => acc + Number(leg.analysis_score || 0), 0) / legs.length) : 0;
  const risk = !legs.length ? "-" : type === "risk_lab" ? "Yüksek" : type === "high_value" ? "Orta-Yüksek" : "Düşük-Orta";
  return {
    coupon_name: couponName(type),
    coupon_type: type,
    selected_matches: legs,
    total_odds: legs.length ? total.toFixed(2) : "-",
    average_confidence_score: legs.length ? `${averageScore}%` : "-",
    risk_level: risk,
    short_description: couponDescription(type, legs),
    robot_reason: legs.length
      ? `${couponName(type)}; ${legs.length} maç, toplam oran ${total.toFixed(2)}, ortalama güven ${averageScore}%.`
      : "Bugün için güncel veri henüz oluşmadı.",
    is_available: Boolean(legs.length),
  };
};

const main = () => {
  const today = todayTR();
  const fixtures = readJson(fixturesPath, []);
  const todaysFixtures = fixtures.filter((fixture) => isToday(fixture, today));
  const sourceFixtures = todaysFixtures.length ? todaysFixtures : [];
  const analysis = buildCouponAnalysis(sourceFixtures);
  const scored = analysis.scored.map((fixture) => scoreFixture(fixture));
  const available = scored.filter((item) => item.hasOdds && Number(item.score || 0) >= 50);

  const balancedPool = available
    .filter((item) => Number(item.score || 0) >= 65 && item.risk !== "Yüksek")
    .sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
  const highValuePool = available
    .filter((item) => parseOdd(item.odds) >= 2.2 && Number(item.score || 0) >= 65)
    .sort((a, b) => (parseOdd(b.odds) || 0) - (parseOdd(a.odds) || 0));
  const riskLabPool = available
    .filter((item) => /İlk Yarı KG|İkinci Yarı KG|3\.5 Üst/.test(String(item.market || item.selection || "")) && Number(item.score || 0) >= 50)
    .sort((a, b) => (parseOdd(b.odds) || 0) - (parseOdd(a.odds) || 0));

  const dailyCoupons = {
    generated_at: new Date().toISOString(),
    date: today,
    source: sourceFixtures.length ? "High Value Coupon Engine" : "Güncel veri bekleniyor",
    message: sourceFixtures.length ? "" : "Bugün için güncel veri henüz oluşmadı.",
    coupons: {
      laboratory_today: buildCoupon("balanced", balancedPool, 3),
      balanced: buildCoupon("balanced", balancedPool, 3),
      high_value: buildCoupon("high_value", highValuePool.length ? highValuePool : available.filter((item) => Number(item.score || 0) >= 65), 4),
      risk_lab: buildCoupon("risk_lab", riskLabPool, 3),
    },
  };

  const liveMatches = {
    generated_at: new Date().toISOString(),
    date: today,
    source: dailyCoupons.source,
    message: sourceFixtures.length ? "" : "Bugün için güncel veri henüz oluşmadı.",
    matches: scored.map(liveMatchFromScore),
  };

  const robotAnalysis = {
    generated_at: new Date().toISOString(),
    date: today,
    engine: "High Value Coupon Engine",
    scoring_mode: "net_threshold_rules",
    stale_data_policy: "Eski veri gösterme. Bugünün verisi yoksa boş mesaj göster.",
    summary: {
      fixture_count: sourceFixtures.length,
      scored_match_count: scored.length,
      coupon_candidate_count: available.length,
    },
    matches: scored.map((item) => ({
      match_name: item.match,
      league: item.league || item.competition_name || "-",
      start_time: item.time || "-",
      recommended_market: item.selection || item.market || "-",
      confidence_score: item.confidence || "-",
      analysis_score: item.analysis_score ?? item.score ?? 0,
      risk_level: item.risk || "-",
      estimated_odds: item.odds || "-",
      value_label: item.value_label || "-",
      robot_comment: legReason(item),
      include_in_coupon: Boolean(item.hasOdds && Number(item.score || 0) >= 65),
      suitable_coupon_type: couponTypeForMatch(item),
      data_gap_risk: item.data_gap_risk || "-",
      metrics: item.analysis_metrics || {},
      signals: item.pro_signals || [],
    })),
  };

  writeJson(liveMatchesPath, liveMatches);
  writeJson(dailyCouponsPath, dailyCoupons);
  writeJson(robotAnalysisPath, robotAnalysis);
  writeJson(path.join(archiveDir, `${today}.json`), { liveMatches, dailyCoupons, robotAnalysis });

  console.log(`High Value JSON çıktı dosyaları üretildi: ${today}`);
};

main();
