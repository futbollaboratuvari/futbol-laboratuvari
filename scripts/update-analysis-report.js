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

const itemFromRecommendation = (row, type, index) => ({
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
  confidence: row.confidence || "-",
  confidence_score: row.confidence || "-",
  score: row.confidence || row.score || "-",
  risk: row.risk || "Orta",
  risk_level: row.risk || "Orta",
  status: "takipte",
  pro_signals: Array.isArray(row.signals) && row.signals.length ? row.signals : ["Oran verisi okundu", "Robot ön elemesi tamamlandı"],
  commentary: "Maç programı ve oran verisi üzerinden otomatik ön analiz üretildi. Kesin sonuç garantisi vermez.",
  source: "robot_analysis_report",
  created_at: new Date().toISOString(),
});

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
  const source = fixtures[0]?.source || "Maçkolik İddaa Programı";
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
    fixture.status || "scheduled",
  ]);

  const mainReport = `# Bugünün En Güçlü Maçları\n\n## Aktif Veri\n- ${source}\n- Güncelleme: ${generatedAt}\n- Not: Otomatik robot ön elemesidir; kesin sonuç garantisi vermez.\n\n## Skorlanan Maclar\n${mdTable(["Mac", "Lig", "Saat", "Seçenek", "Oran", "Güven", "Risk", "Status"], matchRows)}\n\n## Tek Mac Onerileri\n${mdTable(["Mac", "Market", "Oran", "Oneri Skoru", "Risk"], analysis.singles.map((row) => [row.match, row.market, row.odds, row.confidence, row.risk]))}\n\n## 2'li Kupon Onerileri\n${mdTable(["Maclar", "Marketler", "Oranlar", "Kupon Skoru", "Risk"], analysis.doubles.map((row) => [row.match, row.market, row.odds, row.confidence, row.risk]))}\n\n## 3'lu Kupon Onerileri\n${mdTable(["Maclar", "Marketler", "Oranlar", "Kupon Skoru", "Risk"], analysis.triples.map((row) => [row.match, row.market, row.odds, row.confidence, row.risk]))}\n`;

  const scoredRawPool = {
    generated_at: generatedAt,
    timezone: "Europe/Istanbul",
    source,
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
          ms_1: fixture.oneOdd ?? fixture.one ?? fixture.ms1 ?? null,
          ms_x: fixture.drawOdd ?? fixture.draw ?? fixture.msx ?? null,
          ms_2: fixture.twoOdd ?? fixture.two ?? fixture.ms2 ?? null,
          alt_25: fixture.under25 ?? fixture.alt25 ?? fixture.under ?? null,
          ust_25: fixture.over25 ?? fixture.ust25 ?? fixture.over ?? null,
          kg_var: fixture.bttsYes ?? fixture.kgVar ?? null,
          kg_yok: fixture.bttsNo ?? fixture.kgYok ?? null,
        },
        suggested_option: scored.selection,
        suggested_market: scored.market,
        suggested_odds: scored.odds,
        confidence_score: scored.confidence,
        risk_level: scored.risk,
        signals: scored.pro_signals,
      };
    }),
  };

  const history = {
    generated_at: generatedAt,
    timezone: "Europe/Istanbul",
    source: activeItems.length ? "Robot analiz geçmişi" : "Oranlı analiz bekleniyor",
    active_items: activeItems,
    completed_items: completedItems,
  };

  fs.writeFileSync(mainReportPath, mainReport, "utf8");
  fs.writeFileSync(sourceReportPath, `# Maçkolik Veri Çekme Raporu\n\n- Kaynak: ${source}\n- Güncelleme: ${generatedAt}\n- Maç sayısı: ${fixtures.length}\n- Aktif analiz sayısı: ${activeItems.length}\n- Sonuçlanan analiz sayısı: ${completedItems.length}\n`, "utf8");
  fs.writeFileSync(successReportPath, `# Başarı Yüzdesi Raporu\n\n- Güncelleme: ${generatedAt}\n- Sonuçlanan analiz sayısı: ${completedItems.length}\n- Durum: Sonuç verisi geldiğinde kazandı/kaybetti ayrımı otomatik gösterilecek.\n`, "utf8");
  writeJson(rawPoolPath, scoredRawPool);
  writeJson(historyPath, history);

  console.log(`Robot analiz raporu üretildi. Aktif: ${activeItems.length}. Tamamlanan: ${completedItems.length}.`);
};

main();
