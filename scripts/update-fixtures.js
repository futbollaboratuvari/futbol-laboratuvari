const fs = require("fs");
const https = require("https");
const path = require("path");
const { filterActiveBulletinMatches, countInactiveBulletinMatches } = require("./bulletin-active-filter");

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
const LIVE_WINDOW_MINUTES = 130;

const ensureDirs = () => {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });
};

const turkeyParts = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date).reduce((acc, part) => {
    if (part.type !== "literal") acc[part.type] = part.value;
    return acc;
  }, {});

const formatTurkeyDate = (date = new Date()) => {
  const parts = turkeyParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
};

const turkeyClockMinutes = (date = new Date()) => {
  const parts = turkeyParts(date);
  return Number(parts.hour) * 60 + Number(parts.minute);
};

const formatTurkeyDateDots = (date = new Date()) => {
  const key = formatTurkeyDate(date);
  const [year, month, day] = key.split("-");
  return `${day}.${month}.${year}`;
};

const toIsoDate = (dotDate) => {
  const [day, month, year] = String(dotDate || "").split(".");
  if (!day || !month || !year) return "";
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const addDays = (dateKey, days) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days, 12)).toISOString().slice(0, 10);
};

const readJson = (filePath, fallback) => {
  try {
    const text = fs.readFileSync(filePath, "utf8").trim();
    if (!text) return fallback;
    return JSON.parse(text);
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
  .replace(/\u00a0/g, " ")
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

const normalizeLine = (line) => decodeHtml(line)
  .replace(/\u00a0/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const isLeagueLine = (line) => {
  const text = normalizeLine(line);
  if (!text || text.length < 4) return false;
  if (/^\d{1,2}\.\d{1,2}\.\d{4}/.test(text)) return false;
  if (/^\d{1,2}:\d{2}\b/.test(text)) return false;
  if (/^(Kod|Hepsi|Tarih|Lig|Futbol|Basketbol|Sadece|Maç Sonucu|Çerez|Reklam|İY|MS|X)$/i.test(text)) return false;
  if (/\d+\.\d+/.test(text)) return false;
  if (text.includes(" - ")) return false;
  return /Lig|Kupa|Kupası|Premier|Dünya|Hazırlık|Grup|Division|League|Ligi|Liga|Serie|NPL|Şampiyonluk|Urvalsdeild|Superettan|Virsliga|Erovnuli/i.test(text);
};

const cleanTeam = (value) => String(value || "")
  .replace(/\s+\d{4,5}\b.*$/, "")
  .replace(/\s+\d+[.,]\d+.*$/, "")
  .replace(/\s+/g, " ")
  .trim();

const parseClockMinutes = (time) => {
  const match = String(time || "").trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};

const normalizeNumber = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const parseOdd = (value) => {
  const text = String(value || "").replace(",", ".");
  const number = Number(text);
  if (!Number.isFinite(number)) return null;
  return number;
};

const fixtureKey = (fixture) => [fixture.date, fixture.time, fixture.home, fixture.away]
  .map((value) => String(value || "").trim().toLowerCase())
  .join("|");

const matchExistingFixture = (fixture, existingFixtures) => {
  if (fixture.matchCode) {
    const byCode = existingFixtures.find((item) => item.matchCode && String(item.matchCode) === String(fixture.matchCode));
    if (byCode) return byCode;
  }
  const key = fixtureKey(fixture);
  return existingFixtures.find((item) => fixtureKey(item) === key) || null;
};

const readScoreState = (fixture, fallback = {}) => {
  const homeScore = normalizeNumber(fixture.homeScore ?? fixture.home_score ?? fixture.homeGoals ?? fixture.home_goals ?? fallback.homeScore ?? fallback.home_score ?? fallback.homeGoals ?? fallback.home_goals);
  const awayScore = normalizeNumber(fixture.awayScore ?? fixture.away_score ?? fixture.awayGoals ?? fixture.away_goals ?? fallback.awayScore ?? fallback.away_score ?? fallback.awayGoals ?? fallback.away_goals);
  const minute = normalizeNumber(fixture.minute ?? fixture.elapsed ?? fixture.matchMinute ?? fallback.minute ?? fallback.elapsed ?? fallback.matchMinute);
  const score = String(fixture.score ?? fallback.score ?? "").trim();
  return {
    homeScore,
    awayScore,
    minute,
    score: homeScore !== null && awayScore !== null ? `${homeScore}-${awayScore}` : score,
  };
};

const statusFromTime = (fixture, nowDate = formatTurkeyDate(), nowMinutes = turkeyClockMinutes()) => {
  const start = parseClockMinutes(fixture.time);
  if (!fixture.date || start === null) return { status: fixture.status || "scheduled", minute: null };
  if (fixture.date < nowDate) return { status: "finished", minute: 90 };
  if (fixture.date > nowDate) return { status: "scheduled", minute: null };
  const elapsed = nowMinutes - start;
  if (elapsed < 0) return { status: "scheduled", minute: null };
  if (elapsed <= LIVE_WINDOW_MINUTES) return { status: "live", minute: Math.max(1, Math.min(90, elapsed > 60 ? elapsed - 15 : elapsed)) };
  return { status: "finished", minute: 90 };
};

const enrichLiveState = (fixtures, existingFixtures = []) => {
  const nowDate = formatTurkeyDate();
  const nowMinutes = turkeyClockMinutes();
  return fixtures.map((fixture) => {
    const existing = matchExistingFixture(fixture, existingFixtures) || {};
    const scoreState = readScoreState(fixture, existing);
    const statusState = statusFromTime({ ...fixture, status: fixture.status || existing.status }, nowDate, nowMinutes);
    const explicitStatus = String(fixture.status || existing.status || "").toLowerCase();
    const status = ["live", "finished", "postponed", "cancelled"].includes(explicitStatus)
      ? explicitStatus
      : statusState.status;
    const minute = scoreState.minute !== null ? scoreState.minute : statusState.minute;
    const enriched = {
      ...existing,
      ...fixture,
      status,
      liveStatus: status,
      minute: status === "live" ? minute : status === "finished" ? 90 : null,
      homeScore: scoreState.homeScore,
      awayScore: scoreState.awayScore,
      score: scoreState.score || (scoreState.homeScore !== null && scoreState.awayScore !== null ? `${scoreState.homeScore}-${scoreState.awayScore}` : ""),
      lastLiveUpdate: new Date().toISOString(),
    };
    return Object.fromEntries(Object.entries(enriched).filter(([, value]) => value !== undefined));
  });
};

const addFixture = (fixtures, currentDate, currentLeague, time, home, away, tail = "") => {
  const date = toIsoDate(currentDate);
  const cleanHome = cleanTeam(home);
  const cleanAway = cleanTeam(away);
  if (!date || !time || !cleanHome || !cleanAway || cleanHome.length < 2 || cleanAway.length < 2) return;

  const numbers = String(tail || "").match(/\b\d{4,5}\b|\b\d+[.,]\d+\b/g) || [];
  const matchCode = numbers.find((item) => /^\d{4,5}$/.test(item)) || null;
  const odds = numbers.filter((item) => /^\d+[.,]\d+$/.test(item)).map(parseOdd).filter((item) => item !== null);

  fixtures.push({
    date,
    time,
    league: currentLeague || "Maçkolik İddaa Programı",
    home: cleanHome,
    away: cleanAway,
    matchCode,
    status: "scheduled",
    liveStatus: "scheduled",
    minute: null,
    homeScore: null,
    awayScore: null,
    score: "",
    source: "Maçkolik İddaa Programı",
    oneOdd: odds[0] ?? null,
    drawOdd: odds[1] ?? null,
    twoOdd: odds[2] ?? null,
    under25: odds[3] ?? null,
    over25: odds[4] ?? null,
    cifte1x: odds[5] ?? null,
    cifte12: odds[6] ?? null,
    cifteX2: odds[7] ?? null,
  });
};

const parseMackolikIddaaProgram = (html) => {
  const targetDotDate = formatTurkeyDateDots();
  const fixtures = [];
  let currentLeague = "Maçkolik İddaa Programı";
  let currentDate = null;

  for (const rawLine of htmlToLines(html)) {
    const line = normalizeLine(rawLine);
    if (!line) continue;

    const dateMatch = line.match(/\b(\d{1,2}\.\d{1,2}\.\d{4})\b/);
    if (dateMatch) currentDate = dateMatch[1];

    if (isLeagueLine(line)) {
      currentLeague = line;
      continue;
    }

    if (currentDate !== targetDotDate) continue;

    const singleLineMatch = line.match(/(?:^|\s)(\d{1,2}:\d{2})\s+(.+?)\s+-\s+(.+?)(?=\s+\d{4,5}\b|\s+\d+[.,]\d+\b|\s*$)(.*)$/);
    if (singleLineMatch) {
      addFixture(fixtures, currentDate, currentLeague, singleLineMatch[1], singleLineMatch[2], singleLineMatch[3], singleLineMatch[4]);
      continue;
    }

    const looseMatch = line.match(/(?:^|\s)(\d{1,2}:\d{2}).{0,160}?([A-Za-zÇĞİÖŞÜçğıöşü0-9.'’\- ]{2,60})\s+-\s+([A-Za-zÇĞİÖŞÜçğıöşü0-9.'’\- ]{2,60})(.*)$/);
    if (looseMatch) {
      addFixture(fixtures, currentDate, currentLeague, looseMatch[1], looseMatch[2], looseMatch[3], looseMatch[4]);
    }
  }

  const unique = fixtures.filter((fixture, index, list) =>
    index === list.findIndex((item) => item.date === fixture.date && item.time === fixture.time && item.home === fixture.home && item.away === fixture.away)
  );

  return unique;
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
    liveStatus: fixture.liveStatus || fixture.status,
    minute: fixture.minute,
    homeScore: fixture.homeScore,
    awayScore: fixture.awayScore,
    score: fixture.score,
    source: fixture.source || source,
    match_code: fixture.matchCode || null,
    odds: {
      ms_1: fixture.oneOdd ?? null,
      ms_x: fixture.drawOdd ?? null,
      ms_2: fixture.twoOdd ?? null,
      alt_25: fixture.under25 ?? null,
      ust_25: fixture.over25 ?? null,
      cifte_1x: fixture.cifte1x ?? null,
      cifte_12: fixture.cifte12 ?? null,
      cifte_x2: fixture.cifteX2 ?? null,
    },
  })),
});

const toSporTotoBulletin = (fixtures, source) => {
  const today = formatTurkeyDate();
  const activeFixtures = filterActiveBulletinMatches(fixtures);
  const visibleFixtures = activeFixtures.slice(0, 15);
  return {
    generated_at: new Date().toISOString(),
    timezone: "Europe/Istanbul",
    source,
    week_label: `${today} / ${addDays(today, 6)}`,
    total_source_matches: fixtures.length,
    active_match_count: activeFixtures.length,
    removed_finished_count: countInactiveBulletinMatches(fixtures),
    removed_statuses: ["finished", "cancelled", "postponed"],
    match_count: visibleFixtures.length,
    matches: visibleFixtures.map((fixture, index) => ({
      no: index + 1,
      week: `${today} / ${addDays(today, 6)}`,
      date: fixture.date,
      time: fixture.time,
      league: fixture.league,
      home: fixture.home,
      away: fixture.away,
      match: `${fixture.home} - ${fixture.away}`,
      one: fixture.oneOdd ?? null,
      draw: fixture.drawOdd ?? null,
      two: fixture.twoOdd ?? null,
      oneOdd: fixture.oneOdd ?? null,
      drawOdd: fixture.drawOdd ?? null,
      twoOdd: fixture.twoOdd ?? null,
      decision: "Bekleniyor",
      className: "Haftalık Spor Toto",
      minute: fixture.minute,
      homeScore: fixture.homeScore,
      awayScore: fixture.awayScore,
      score: fixture.score || "-",
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
  const activeFixtures = filterActiveBulletinMatches(fixtures);
  const matchRows = activeFixtures.map((fixture) => [
    `${fixture.home} - ${fixture.away}`,
    fixture.league,
    fixture.time,
    fixture.status === "live" ? `Canlı ${fixture.minute || "-"}'` : "Veri bekleniyor",
    fixture.score || "-",
    fixture.oneOdd || "-",
    fixture.status || "scheduled",
  ]);

  const mainReport = `# Bugünün En Güçlü Maçları\n\n## Aktif Veri\n- ${source}\n- Güncelleme: ${generatedAt}\n- Ham maç sayısı: ${fixtures.length}\n- Aktif bülten maçı: ${activeFixtures.length}\n- Bültenden düşürülen maç: ${countInactiveBulletinMatches(fixtures)}\n\n## Skorlanan Maclar\n${mdTable(["Mac", "Lig", "Saat", "En Guclu Market", "Skor", "Oran", "Status"], matchRows)}\n\n## Tek Mac Onerileri\n${mdTable(["Mac", "Market", "Oneri Skoru", "Risk"], [])}\n\n## 2'li Kupon Onerileri\n${mdTable(["Maclar", "Marketler", "Kupon Skoru", "Risk"], [])}\n\n## 3'lu Kupon Onerileri\n${mdTable(["Maclar", "Marketler", "Kupon Skoru", "Risk"], [])}\n`;

  const sourceReport = `# Maçkolik Veri Çekme Raporu\n\n- Kaynak: ${source}\n- URL: ${MACKOLIK_IDDAA_URL}\n- Güncelleme: ${generatedAt}\n- Maç sayısı: ${fixtures.length}\n- Aktif bülten maçı: ${activeFixtures.length}\n- Bültenden düşürülen maç: ${countInactiveBulletinMatches(fixtures)}\n- Not: Parser güçlendirildi. Tarih başlığı, lig başlığı, maç satırı, maç kodu ve ana oran alanlarını daha esnek okur.\n`;

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

  fixtures = enrichLiveState(fixtures, existingFixtures);

  writeJson(fixturesPath, fixtures);
  writeJson(rawPoolPath, toRawPool(fixtures, source));
  writeJson(historyPath, toPredictionHistory());
  writeJson(sporTotoPath, toSporTotoBulletin(fixtures, source));
  writeReports(fixtures, source);

  const liveCount = fixtures.filter((fixture) => fixture.status === "live").length;
  const finishedCount = fixtures.filter((fixture) => fixture.status === "finished").length;
  const activeBulletinCount = filterActiveBulletinMatches(fixtures).length;
  console.log(`Futbol Laboratuvarı Maçkolik veri akışı güncellendi. Kaynak: ${source}. Maç: ${fixtures.length}. Aktif bülten: ${activeBulletinCount}. Canlı: ${liveCount}. Biten: ${finishedCount}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
