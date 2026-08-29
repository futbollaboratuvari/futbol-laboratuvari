const fs = require("fs");
const path = require("path");
const couponRules = require("../pro-coupon-eligibility");
const { buildProAnalysisIndex } = require("./build-pro-analysis-index");

const root = path.join(__dirname, "..");
const proFile = path.join(root, "data", "pro-analysis-index.json");
const outFile = path.join(root, "data", "daily-coupons.json");

const read = (file, fallback) => {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
};

const number = (value) => {
  if (value === undefined || value === null || value === "" || value === "-") return null;
  const parsed = Number(String(value).replace("%", "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};

const riskLabel = (type) => type === "high_value" ? "Orta-Yüksek" : type === "risk_lab" ? "Yüksek" : "Düşük-Orta";
const couponName = (type) => type === "high_value" ? "Yüksek Oranlı Kupon" : type === "risk_lab" ? "Riskli Laboratuvar Kuponu" : "Dengeli Kupon";

function leg(item, index) {
  return {
    no: index + 1,
    id: item.id || item.match_code || "",
    match_name: `${item.home || "Ev sahibi"} VS ${item.away || "Deplasman"}`,
    league: item.league || "-",
    start_time: item.time || "-",
    recommended_market: item.recommended_market || "-",
    estimated_odds: number(item.recommended_odd)?.toFixed(2) || "-",
    model_score: number(item.model_score),
    analysis_score: number(item.model_score),
    estimated_probability: number(item.estimated_probability),
    market_probability: number(item.market_probability),
    edge_percent: number(item.edge_percent),
    data_completeness: number(item.data_completeness),
    independent_evidence: Boolean(item.independent_evidence),
    include_in_coupon: Boolean(item.include_in_coupon),
    risk_level: item.risk_level || "-",
    data_gap_risk: item.data_gap_risk || "-",
    squad_risk_level: item.squad_risk_level || "-",
    lineup_risk_level: item.lineup_risk_level || "-",
    value_label: item.value_label || "-",
    robot_reason: (Array.isArray(item.signals) ? item.signals : []).slice(0, 3).join(" | ") || "Doğrulanmış PRO uygunluk kuralları uygulandı.",
  };
}

function unavailable(type) {
  return {
    coupon_name: couponName(type),
    coupon_type: type,
    selected_matches: [],
    total_odds: "-",
    average_confidence_score: "-",
    combined_estimated_probability: null,
    risk_level: "-",
    short_description: "Doğrulanmış kupon adayı yok. Uygunluk eşikleri sağlanmadan kupon yayımlanmaz.",
    robot_reason: "Bağımsız kanıt, model gücü, veri kapsamı, olasılık ve risk kuralları birlikte sağlanmadı.",
    is_available: false,
  };
}

function makeCoupon(type, items, size) {
  const selected = items.slice(0, size);
  if (selected.length < 2) return unavailable(type);
  const legs = selected.map(leg);
  const odds = legs.map((item) => number(item.estimated_odds));
  if (odds.some((odd) => odd === null || odd <= 1)) return unavailable(type);
  const totalOdds = odds.reduce((total, odd) => total * odd, 1);
  const modelScores = legs.map((item) => number(item.model_score)).filter((value) => value !== null);
  const probabilities = legs.map((item) => number(item.estimated_probability));
  return {
    coupon_name: couponName(type),
    coupon_type: type,
    selected_matches: legs,
    total_odds: totalOdds.toFixed(2),
    average_confidence_score: modelScores.length ? `${Math.round(modelScores.reduce((a, b) => a + b, 0) / modelScores.length)}%` : "-",
    combined_estimated_probability: probabilities.every((value) => value !== null)
      ? Number((probabilities.reduce((total, value) => total * (value / 100), 1) * 100).toFixed(1))
      : null,
    risk_level: riskLabel(type),
    short_description: "Yalnız doğrulanmış PRO kupon adaylarından oluşturuldu.",
    robot_reason: `${legs.length} seçim aynı merkezi kupon uygunluk kuralını geçti.`,
    is_available: true,
  };
}

function main() {
  const pro = buildProAnalysisIndex() || read(proFile, { matches: [], summary: {} });
  const rows = (Array.isArray(pro.matches) ? pro.matches : [])
    .filter((item) => couponRules.isCouponEligible(item))
    .sort((a, b) => couponRules.rank(b) - couponRules.rank(a));
  const balanced = rows.filter((item) => (number(item.recommended_odd) || 0) <= 2.2);
  const highValue = rows.filter((item) => (number(item.recommended_odd) || 0) >= 1.8)
    .sort((a, b) => (number(b.edge_percent) || 0) - (number(a.edge_percent) || 0));
  const riskLab = rows.filter((item) => /ilk yarı|ikinci yarı|3[,.]5/i.test(String(item.recommended_market || "")))
    .sort((a, b) => (number(b.recommended_odd) || 0) - (number(a.recommended_odd) || 0));

  const data = {
    generated_at: new Date().toISOString(),
    date: pro.date || "",
    source: "PRO merkezi kupon uygunluk motoru",
    message: rows.length ? `${rows.length} doğrulanmış kupon adayı bulundu.` : "Doğrulanmış kupon adayı yok; kupon yayımlanmadı.",
    candidate_count: rows.length,
    eligibility_policy: "include_in_coupon + independent_evidence + model>=65 + completeness>=45 + probability>=42 + acceptable_risk",
    coupons: {
      balanced: makeCoupon("balanced", balanced, 3),
      high_value: makeCoupon("high_value", highValue, 4),
      risk_lab: makeCoupon("risk_lab", riskLab, 3),
    },
  };
  fs.writeFileSync(outFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`coupon cards synced: eligible=${rows.length}, balanced=${data.coupons.balanced.selected_matches.length}`);
}

if (require.main === module) main();
module.exports = { main, makeCoupon };
