const fs = require("fs");
const path = require("path");
const { buildCouponAnalysis, scoreFixture } = require("./robot-coupon-engine");

const rootDir = path.join(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const outputDir = path.join(rootDir, "outputs");
const fixturesPath = path.join(dataDir, "fixtures.json");
const rawPoolPath = path.join(dataDir, "ham_mac_havuzu.json");
const historyPath = path.join(dataDir, "analiz_sonuclari.json");
const mainReportPath = path.join(outputDir, "bugunun_en_guclu_maclari.md");
const sourceReportPath = path.join(outputDir, "mackolik_veri_cekme_raporu.md");
const successReportPath = path.join(outputDir, "basari_yuzdesi_raporu.md");

const readJson = (filePath, fallback) => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    return fallback;
  }
};

const writeJson = (filePath, value) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

const mdTable = (headers, rows) => {
  const header = `| ${headers.join(" | ")} |`;
  const separator = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.map((cell) => String(cell ?? "-").replace(/\|/g, "/")).join(" | ")} |`);
  return [header, separator, ...body].join("\n");
};

const normalizeLeg = (leg, index) => ({
  number: leg.number || index + 1,
  home: leg.home || "Ev sahibi",
  away: leg.away || "Deplasman",
  match: leg.match || `${leg.home || "Ev sahibi"} VS ${leg.away || "Deplasman"}`,
  date: leg.date || "",
  time: leg.time || "",
  league: leg.league || "",
  selection: leg.selection || leg.option || "-",
  option: leg.option || leg.selection || "-",
  odds: leg.odds || "-",
  lab_probability: leg.lab_probability || leg.confidence || "-",
  confidence: leg.confidence || leg.lab_probability || "-",
  trust_score: leg.trust_score || "-",
  risk: leg.risk || "Orta",
  tag: leg.tag || "Değerli",
  expected_scores: Array.isArray(leg.expected_scores) ? leg.expected_scores : [],
  signals: Array.isArray(leg.signals) ? leg.signals : [],
});

const itemFromRecommendation = (row, type, index) => {
  const legs = Array.isArray(row.legs) && row.legs.length ? row.legs.map(normalizeLeg) : [normalizeLeg({
    match: row.match,
    selection: row.market,
    option: row.market,
    odds: row.odds,
    lab_probability: row.confidence,
    confidence: row.confidence,
    trust_score: row.score ? `${Math.round(Number(row.score) || 0)}/100` : row.confidence,
    risk: row.risk,
    tag: row.tag,
    expected_scores: row.expected_scores,
    signals: row.signals,
  }, 0)];

  return {
    id: `${type}-${index + 1}`,
    type,
    title: row.match,
    match: row.match,
    fixture: row.match,
    selection: row.market,
    option: row.market,
    market: row.market,
    prediction: row.market,
    decision: row.market,
    odds: row.odds || "-",
    total_odds: row.odds || "-",
    confidence: row.confidence || "-",
    confidence_score: row.confidence || "-",
    score: row.confidence || row.score || "-",
    risk: row.risk || "Orta",
    risk_level: row.risk || "Orta",
    tag: row.tag || "Değerli",
    expected_scores: Array.isArray(row.expected_scores) ? row.expected_scores : [],
    legs,
    status: "takipte",
    pro_signals: Array.isArray(row.signals) && row.signals.length ? row.signals : ["High Value Coupon Engine", "Robot ön elemesi tamamlandı"],
    commentary: "High Value Coupon Engine; düşük oranlı ve değersiz marketleri eleyerek veri destekli kupon adayı üretir. Kesin sonuç garantisi vermez.",
    source: "high_value_coupon_engine",
    created_at: new Date().toISOString(),
  };
};

const buildActiveItems = (analysis) => [
  ...analysis.singles.map((row, index) => itemFromRecommendation(row, "Tekli", index)),
  ...analysis.doubles.map((row, index) => itemFromRecommendation(row, "2'li", index)),
  ...analysis.triples.map((row, index) => itemFromRecommendation(row, "3'lü", index)),
];

const main = () => {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(dataDir, { recursive: true });

  const fixtures = readJson(fixturesPath, []);
  const previous = readJson(historyPath, { active_items: [], completed_items: [] });
  const analysis = buildCouponAnalysis(fixtures);
  const generatedAt = new Date().toISOString();
  const source = fixtures[0]?.source || "Güncel veri bekleniyor";
  const activeItems = buildActiveItems(analysis);
  const completedItems = Array.isArray(previous.completed_items) ? previous.completed_items : [];

  const matchRows = analysis.scored.map((fixture) => [
    fixture.match,
    fixture.league || fixture.competition_name || "-",
    fixture.time || "-",
    fixture.market,
    fixture.odds || "-",
    fixture.confidence,
    fixture.risk,
    fixture.tag || "-",
    fixture.status || "scheduled",
  ]);

  const mainReport = `# Bugünün En Güçlü Maçları\n\n## Aktif Veri\n- Kaynak: ${source}\n- Motor: High Value Coupon Engine\n- Güncelleme: ${generatedAt}\n- Not: Çifte şans kullanılmaz. Düşük oranlı ve değersiz marketler elenir. Güncel veri yoksa eski veri gösterilmez.\n- Odak marketler: İlk Yarı KG Var, İkinci Yarı KG Var, KG Var, 2.5 Üst, 3.5 Üst.\n\n## Skorlanan Maclar\n${mdTable(["Mac", "Lig", "Saat", "Seçenek", "Oran", "Güven", "Risk", "Etiket", "Status"], matchRows)}\n\n## Tek Mac Onerileri\n${mdTable(["Mac", "Seçenek", "Oran", "Oneri Skoru", "Risk"], analysis.singles.map((row) => [row.match, row.market, row.odds, row.confidence, row.risk]))}\n\n## 2'li Kupon Onerileri\n${mdTable(["Maclar", "Seçenekler", "Oran", "Kupon Skoru", "Risk"], analysis.doubles.map((row) => [row.match, row.market, row.odds, row.confidence, row.risk]))}\n\n## 3'lu Kupon Onerileri\n${mdTable(["Maclar", "Seçenekler", "Oran", "Kupon Skoru", "Risk"], analysis.triples.map((row) => [row.match, row.market, row.odds, row.confidence, row.risk]))}\n`;

  const scoredRawPool = {
    generated_at: generatedAt,
    timezone: "Europe/Istanbul",
    source,
    engine: "High Value Coupon Engine",
    engine_rules: {
      banned_markets: ["Çifte Şans"],
      focused_markets: ["İlk Yarı KG Var", "İkinci Yarı KG Var", "KG Var", "2.5 Üst", "3.5 Üst"],
      stale_data_policy: "Güncel maç değilse analiz dışı bırakılır.",
    },
    match_count: fixtures.length,
    analysis_count: activeItems.length,
    matches: analysis.scored.map((fixture, index) => {
      const scored = scoreFixture(fixture, index);
      return {
        home_team_name: fixture.home || fixture.home_team_name,
        away_team_name: fixture.away || fixture.away_team_name,
        competition_name: fixture.league || fixture.competition_name,
        date: fixture.date,
        time: fixture.time,
        status: fixture.status,
        source: fixture.source || source,
        odds: {
          iy_kg_var: fixture.iyKgVar ?? fixture.firstHalfBttsYes ?? null,
          ikinci_yari_kg_var: fixture.ikinciYariKgVar ?? fixture.secondHalfBttsYes ?? null,
          kg_var: fixture.bttsYes ?? fixture.kgVar ?? null,
          ust_25: fixture.over25 ?? fixture.ust25 ?? fixture.over ?? null,
          ust_35: fixture.over35 ?? fixture.ust35 ?? fixture.over3_5 ?? null,
        },
        suggested_option: scored.selection,
        suggested_odds: scored.odds,
        confidence_score: scored.confidence,
        trust_score: scored.trust_score,
        risk_level: scored.risk,
        tag: scored.tag,
        expected_scores: scored.expected_scores,
        signals: scored.pro_signals,
      };
    }),
  };

  const history = {
    generated_at: generatedAt,
    timezone: "Europe/Istanbul",
    source: activeItems.length ? "High Value Coupon Engine" : "Oranlı analiz bekleniyor",
    active_items: activeItems,
    completed_items: completedItems,
  };

  fs.writeFileSync(mainReportPath, mainReport, "utf8");
  fs.writeFileSync(sourceReportPath, `# Maçkolik Veri Çekme Raporu\n\n- Kaynak: ${source}\n- Motor: High Value Coupon Engine\n- Güncelleme: ${generatedAt}\n- Maç sayısı: ${fixtures.length}\n- Aktif analiz sayısı: ${activeItems.length}\n- Filtre: Çifte şans yok, eski sabit veri yok, düşük oranlı marketler elendi.\n`, "utf8");
  fs.writeFileSync(successReportPath, `# Başarı Yüzdesi Raporu\n\n- Güncelleme: ${generatedAt}\n- Sonuçlanan analiz sayısı: ${completedItems.length}\n- Durum: Sonuç verisi geldiğinde kazandı/kaybetti ayrımı otomatik gösterilecek.\n`, "utf8");
  writeJson(rawPoolPath, scoredRawPool);
  writeJson(historyPath, history);

  console.log(`High Value Coupon Engine raporu üretildi. Aktif: ${activeItems.length}. Tamamlanan: ${completedItems.length}.`);
};

main();
