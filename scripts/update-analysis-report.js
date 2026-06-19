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
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

const mdTable = (headers, rows) => {
  const header = `| ${headers.join(" | ")} |`;
  const separator = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.map((cell) => String(cell ?? "-").replace(/\|/g, "/")).join(" | ")} |`);
  return [header, separator, ...body].join("\n");
};

const resultStatus = (items) => {
  if (!items || !items.length) return "takipte";
  if (items.some((item) => item.result === "lost")) return "kaybetti";
  if (items.every((item) => item.result === "won")) return "kazandı";
  return "takipte";
};

const buildActiveItems = (analysis) => {
  const single = analysis.singles.map((row, index) => ({
    id: `single-${index + 1}`,
    type: "Tekli",
    title: row[0],
    market: row[1],
    score: row[2],
    risk: row[3],
    status: "takipte",
    created_at: new Date().toISOString(),
  }));
  const double = analysis.doubles.map((row, index) => ({
    id: `double-${index + 1}`,
    type: "2'li",
    title: row[0],
    market: row[1],
    score: row[2],
    risk: row[3],
    status: "takipte",
    created_at: new Date().toISOString(),
  }));
  const triple = analysis.triples.map((row, index) => ({
    id: `triple-${index + 1}`,
    type: "3'lü",
    title: row[0],
    market: row[1],
    score: row[2],
    risk: row[3],
    status: "takipte",
    created_at: new Date().toISOString(),
  }));
  return [...single, ...double, ...triple];
};

const main = () => {
  fs.mkdirSync(outputDir, { recursive: true });
  const fixtures = readJson(fixturesPath, []);
  const previous = readJson(historyPath, { active_items: [], completed_items: [] });
  const analysis = buildCouponAnalysis(fixtures);
  const generatedAt = new Date().toISOString();
  const source = fixtures[0]?.source || "Maçkolik İddaa Programı";

  const matchRows = analysis.ranked.map((fixture) => [
    fixture.match,
    fixture.league,
    fixture.time,
    fixture.market,
    fixture.confidence,
    fixture.risk,
    fixture.status || "scheduled",
  ]);

  const activeItems = buildActiveItems(analysis);
  const completedItems = Array.isArray(previous.completed_items) ? previous.completed_items : [];

  const mainReport = `# Bugünün En Güçlü Maçları\n\n## Aktif Veri\n- ${source}\n- Güncelleme: ${generatedAt}\n- Not: Otomatik robot ön elemesidir; kesin sonuç garantisi vermez.\n\n## Skorlanan Maclar\n${mdTable(["Mac", "Lig", "Saat", "En Guclu Market", "Guc Skoru", "Risk", "Status"], matchRows)}\n\n## Tek Mac Onerileri\n${mdTable(["Mac", "Market", "Oneri Skoru", "Risk"], analysis.singles)}\n\n## 2'li Kupon Onerileri\n${mdTable(["Maclar", "Marketler", "Kupon Skoru", "Risk"], analysis.doubles)}\n\n## 3'lu Kupon Onerileri\n${mdTable(["Maclar", "Marketler", "Kupon Skoru", "Risk"], analysis.triples)}\n`;

  const scoredRawPool = {
    generated_at: generatedAt,
    timezone: "Europe/Istanbul",
    source,
    match_count: fixtures.length,
    matches: fixtures.map((fixture, index) => {
      const scored = scoreFixture(fixture, index);
      return {
        home_team_name: fixture.home,
        away_team_name: fixture.away,
        competition_name: fixture.league,
        date: fixture.date,
        time: fixture.time,
        status: fixture.status,
        source: fixture.source || source,
        suggested_market: scored.market,
        confidence_score: scored.confidence,
        risk_level: scored.risk,
      };
    }),
  };

  const history = {
    generated_at: generatedAt,
    timezone: "Europe/Istanbul",
    source: "Robot analiz geçmişi",
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
