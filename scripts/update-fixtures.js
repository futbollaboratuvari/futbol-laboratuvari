const fs = require("fs");
const https = require("https");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const outputDir = path.join(rootDir, "outputs");
const fixturesPath = path.join(dataDir, "fixtures.json");
const rawPoolPath = path.join(dataDir, "ham_mac_havuzu.json");
const historyPath = path.join(dataDir, "tahmin_gecmisi.json");
const mainReportPath = path.join(outputDir, "bugunun_en_guclu_maclari.md");
const sourceReportPath = path.join(outputDir, "mackolik_veri_cekme_raporu.md");
const successReportPath = path.join(outputDir, "basari_yuzdesi_raporu.md");

const ensureDirs = () => {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });
};

const formatTurkeyDate = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const formatTurkeyTime = (date = new Date()) =>
  new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

const addDays = (dateKey, days) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days, 12)).toISOString().slice(0, 10);
};

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

const requestJson = (url, headers = {}) =>
  new Promise((resolve, reject) => {
    const request = https.get(url, { headers }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`Request failed with ${response.statusCode}: ${body}`));
          return;
        }

        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });

    request.on("error", reject);
    request.setTimeout(20000, () => {
      request.destroy(new Error("Request timed out"));
    });
  });

const normalizeFootballData = (payload) =>
  (payload.matches || []).map((match) => {
    const kickoff = new Date(match.utcDate);
    return {
      date: formatTurkeyDate(kickoff),
      time: formatTurkeyTime(kickoff),
      league: match.competition?.name || "Futbol",
      home: match.homeTeam?.name || "Ev sahibi",
      away: match.awayTeam?.name || "Deplasman",
      status: match.status === "FINISHED" ? "finished" : "scheduled",
      source: "football-data.org",
    };
  });

const fetchFixturesFromFootballData = async () => {
  const token = process.env.FOOTBALL_API_KEY;
  if (!token) return null;

  const today = formatTurkeyDate();
  const dateTo = addDays(today, 14);
  const url = `https://api.football-data.org/v4/matches?dateFrom=${today}&dateTo=${dateTo}`;
  const payload = await requestJson(url, { "X-Auth-Token": token });
  return normalizeFootballData(payload);
};

const keepCurrentWindow = (fixtures) => {
  const today = formatTurkeyDate();
  const allowedDates = new Set([today, addDays(today, 1), addDays(today, 2)]);
  return fixtures.filter((fixture) => allowedDates.has(fixture.date));
};

const toRawPool = (fixtures, source) => ({
  generated_at: new Date().toISOString(),
  timezone: "Europe/Istanbul",
  source,
  match_count: fixtures.length,
  matches: fixtures.map((fixture) => ({
    home_team_name: fixture.home,
    away_team_name: fixture.away,
    competition_name: fixture.league,
    date: fixture.date,
    time: fixture.time,
    status: fixture.status,
    source: fixture.source || source,
  })),
});

const toPredictionHistory = () => ({
  generated_at: new Date().toISOString(),
  timezone: "Europe/Istanbul",
  prediction_count: 0,
  predictions: [],
});

const mdTable = (headers, rows) => {
  const header = `| ${headers.join(" | ")} |`;
  const separator = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.map((cell) => String(cell ?? "-").replace(/\|/g, "/")).join(" | ")} |`);
  return [header, separator, ...body].join("\n");
};

const writeReports = (fixtures, source) => {
  const generatedAt = new Date().toISOString();
  const matchRows = fixtures.map((fixture) => [
    `${fixture.home} - ${fixture.away}`,
    fixture.league,
    fixture.time,
    "Veri bekleniyor",
    "-",
    "-",
    fixture.status || "scheduled",
  ]);

  const mainReport = `# Bugünün En Güçlü Maçları\n\n## Aktif Veri\n- ${source}\n- Güncelleme: ${generatedAt}\n\n## Skorlanan Maclar\n${mdTable(["Mac", "Lig", "Saat", "En Guclu Market", "Guc Skoru", "Risk", "Status"], matchRows)}\n\n## Tek Mac Onerileri\n${mdTable(["Mac", "Market", "Oneri Skoru", "Risk"], [])}\n\n## 2'li Kupon Onerileri\n${mdTable(["Maclar", "Marketler", "Kupon Skoru", "Risk"], [])}\n\n## 3'lu Kupon Onerileri\n${mdTable(["Maclar", "Marketler", "Kupon Skoru", "Risk"], [])}\n`;

  const sourceReport = `# Veri Çekme Raporu\n\n- Kaynak: ${source}\n- Güncelleme: ${generatedAt}\n- Maç sayısı: ${fixtures.length}\n- Not: FOOTBALL_API_KEY secret tanımlıysa GitHub Actions canlı bülteni otomatik çeker. Secret yoksa eski veri yayınlanmaz, ekran canlı veri bekler.\n`;

  const successReport = `# Başarı Yüzdesi Raporu\n\n- Güncelleme: ${generatedAt}\n- Sonuçlanan tahmin sayısı: 0\n- Durum: Canlı tahmin geçmişi bekleniyor.\n`;

  fs.writeFileSync(mainReportPath, mainReport, "utf8");
  fs.writeFileSync(sourceReportPath, sourceReport, "utf8");
  fs.writeFileSync(successReportPath, successReport, "utf8");
};

const main = async () => {
  ensureDirs();
  const existingFixtures = readJson(fixturesPath, []);
  const apiFixtures = await fetchFixturesFromFootballData();
  const source = Array.isArray(apiFixtures) ? "GitHub Actions canlı API" : "Canlı veri bekleniyor";
  const fixtures = Array.isArray(apiFixtures) ? apiFixtures : keepCurrentWindow(existingFixtures);

  writeJson(fixturesPath, fixtures);
  writeJson(rawPoolPath, toRawPool(fixtures, source));
  writeJson(historyPath, toPredictionHistory());
  writeReports(fixtures, source);

  console.log(`Futbol Laboratuvarı veri akışı güncellendi. Kaynak: ${source}. Maç: ${fixtures.length}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
