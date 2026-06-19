const fs = require("fs");
const https = require("https");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const outputDir = path.join(rootDir, "outputs");
const fixturesPath = path.join(dataDir, "fixtures.json");
const rawPoolPath = path.join(dataDir, "ham_mac_havuzu.json");
const historyPath = path.join(dataDir, "tahmin_gecmisi.json");
const sporTotoPath = path.join(dataDir, "spor_toto_bulteni.json");
const mainReportPath = path.join(outputDir, "bugunun_en_guclu_maclari.md");
const sourceReportPath = path.join(outputDir, "mackolik_veri_cekme_raporu.md");
const successReportPath = path.join(outputDir, "basari_yuzdesi_raporu.md");

const MACKOLIK_IDDAA_URL = "https://arsiv.mackolik.com/Iddaa-Programi";

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

const formatTurkeyDateDots = (date = new Date()) => {
  const key = formatTurkeyDate(date);
  const [year, month, day] = key.split("-");
  return `${day}.${month}.${year}`;
};

const toIsoDate = (dotDate) => {
  const [day, month, year] = dotDate.split(".");
  return `${year}-${month}-${day}`;
};

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

const requestText = (url) =>
  new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 FutbolLaboratuvariBot/1.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
      },
    }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`Request failed with ${response.statusCode}: ${body.slice(0, 200)}`));
          return;
        }
        resolve(body);
      });
    });

    request.on("error", reject);
    request.setTimeout(30000, () => {
      request.destroy(new Error("Request timed out"));
    });
  });

const decodeHtml = (value) => String(value || "")
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, "<")
  .replace(/&gt;/gi, ">")
  .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));

const htmlToLines = (html) => decodeHtml(html)
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<br\s*\/?\s*>/gi, "\n")
  .replace(/<\/(tr|li|div|p|h1|h2|h3|h4|h5|h6|table|tbody|thead|section)>/gi, "\n")
  .replace(/<[^>]+>/g, " ")
  .split(/\r?\n/)
  .map((line) => line.replace(/\s+/g, " ").trim())
  .filter(Boolean);

const isLeagueLine = (line) => {
  if (!line || line.length < 4) return false;
  if (/^\d{2}\.\d{2}\.\d{4}/.test(line)) return false;
  if (/^\d{2}:\d{2}\b/.test(line)) return false;
  if (/^(Kod|Hepsi|Tarih|Lig|Futbol|Basketbol|Sadece|Maç Sonucu|Çerez|Reklam|İY|MS|X)$/i.test(line)) return false;
  if (/\d+\.\d+/.test(line)) return false;
  if (line.includes(" - ")) return false;
  return /Lig|Kupa|Kupası|Premier|Dünya|Hazırlık|Grup|Division|League|Ligi|Liga|Serie|NPL|Şampiyonluk/i.test(line);
};

const cleanTeam = (value) => String(value || "")
  .replace(/\s+\d{4,5}\b.*$/, "")
  .replace(/\s+\d+[.,]\d+.*$/, "")
  .replace(/\s+/g, " ")
  .trim();

const parseMackolikIddaaProgram = (html) => {
  const targetDotDate = formatTurkeyDateDots();
  const fixtures = [];
  let currentLeague = "Maçkolik İddaa Programı";
  let currentDate = null;

  for (const line of htmlToLines(html)) {
    if (isLeagueLine(line)) {
      currentLeague = line;
      continue;
    }

    const dateMatch = line.match(/^(\d{2}\.\d{2}\.\d{4})\b/);
    if (dateMatch) {
      currentDate = dateMatch[1];
    }

    if (currentDate !== targetDotDate) continue;

    const match = line.match(/(?:^|\s)(\d{2}:\d{2})\s+(.+?)\s+-\s+(.+?)(?=\s+\d{4,5}\b|\s+\d+[.,]\d+\b|\s*$)/);
    if (!match) continue;

    const home = cleanTeam(match[2]);
    const away = cleanTeam(match[3]);
    if (!home || !away || home.length < 2 || away.length < 2) continue;

    fixtures.push({
      date: toIsoDate(currentDate),
      time: match[1],
      league: currentLeague,
      home,
      away,
      status: "scheduled",
      source: "Maçkolik İddaa Programı",
    });
  }

  return fixtures.filter((fixture, index, list) =>
    index === list.findIndex((item) => item.date === fixture.date && item.time === fixture.time && item.home === fixture.home && item.away === fixture.away)
  );
};

const fetchFixturesFromMackolik = async () => {
  const html = await requestText(MACKOLIK_IDDAA_URL);
  return parseMackolikIddaaProgram(html);
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

const toSporTotoBulletin = (fixtures, source) => {
  const today = formatTurkeyDate();
  return {
    generated_at: new Date().toISOString(),
    timezone: "Europe/Istanbul",
    source,
    week_label: `${today} / ${addDays(today, 6)}`,
    match_count: Math.min(fixtures.length, 15),
    matches: fixtures.slice(0, 15).map((fixture, index) => ({
      no: index + 1,
      week: `${today} / ${addDays(today, 6)}`,
      date: fixture.date,
      time: fixture.time,
      league: fixture.league,
      home: fixture.home,
      away: fixture.away,
      match: `${fixture.home} - ${fixture.away}`,
      one: null,
      draw: null,
      two: null,
      oneOdd: null,
      drawOdd: null,
      twoOdd: null,
      decision: "Bekleniyor",
      className: "Haftalık Spor Toto",
      score: "-",
      status: fixture.status || "scheduled",
      source: fixture.source || source,
    })),
  };
};

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

  const sourceReport = `# Maçkolik Veri Çekme Raporu\n\n- Kaynak: ${source}\n- URL: ${MACKOLIK_IDDAA_URL}\n- Güncelleme: ${generatedAt}\n- Maç sayısı: ${fixtures.length}\n- Not: Robot API anahtarı kullanmadan Maçkolik eski site İddaa Programı sayfasındaki bugünün maçlarını okur. Haftalık Spor Toto bülteni aynı maç havuzundan otomatik yenilenir.\n`;

  const successReport = `# Başarı Yüzdesi Raporu\n\n- Güncelleme: ${generatedAt}\n- Sonuçlanan tahmin sayısı: 0\n- Durum: Canlı tahmin geçmişi bekleniyor.\n`;

  fs.writeFileSync(mainReportPath, mainReport, "utf8");
  fs.writeFileSync(sourceReportPath, sourceReport, "utf8");
  fs.writeFileSync(successReportPath, successReport, "utf8");
};

const main = async () => {
  ensureDirs();
  const existingFixtures = readJson(fixturesPath, []);
  let fixtures = [];
  let source = "Maçkolik İddaa Programı";

  try {
    fixtures = await fetchFixturesFromMackolik();
  } catch (error) {
    source = `Maçkolik okunamadı: ${error.message}`;
    fixtures = keepCurrentWindow(existingFixtures);
  }

  if (!fixtures.length) {
    source = "Maçkolik canlı veri bekleniyor";
    fixtures = keepCurrentWindow(existingFixtures);
  }

  writeJson(fixturesPath, fixtures);
  writeJson(rawPoolPath, toRawPool(fixtures, source));
  writeJson(historyPath, toPredictionHistory());
  writeJson(sporTotoPath, toSporTotoBulletin(fixtures, source));
  writeReports(fixtures, source);

  console.log(`Futbol Laboratuvarı Maçkolik veri akışı güncellendi. Kaynak: ${source}. Maç: ${fixtures.length}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
