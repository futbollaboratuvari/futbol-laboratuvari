const fs = require("fs");
const https = require("https");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const fixturesPath = path.join(dataDir, "fixtures.json");
const rawPoolPath = path.join(dataDir, "ham_mac_havuzu.json");
const MACKOLIK_IDDAA_URL = "https://arsiv.mackolik.com/Iddaa-Programi";
const NIGHT_WINDOW_END_MINUTE = 8 * 60;

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

const addDays = (dateKey, days) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days, 12)).toISOString().slice(0, 10);
};

const dotDate = (dateKey) => {
  const [year, month, day] = dateKey.split("-");
  return `${day}.${month}.${year}`;
};

const toIsoDate = (dot) => {
  const [day, month, year] = String(dot || "").split(".");
  if (!day || !month || !year) return "";
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const parseClockMinutes = (time) => {
  const match = String(time || "").trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};

const readJson = (file, fallback) => {
  try {
    const text = fs.readFileSync(file, "utf8").trim();
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

const requestText = (url) => new Promise((resolve, reject) => {
  const req = https.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 FutbolLaboratuvariBot/1.0",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.8",
    },
  }, (res) => {
    let body = "";
    res.setEncoding("utf8");
    res.on("data", (chunk) => { body += chunk; });
    res.on("end", () => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        reject(new Error(`Request failed with ${res.statusCode}`));
        return;
      }
      resolve(body);
    });
  });
  req.on("error", reject);
  req.setTimeout(30000, () => req.destroy(new Error("Request timed out")));
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

const cleanTeam = (value) => String(value || "")
  .replace(/\s+\d{4,5}\b.*$/, "")
  .replace(/\s+\d+[.,]\d+.*$/, "")
  .replace(/\s+/g, " ")
  .trim();

const parseOdd = (value) => {
  const number = Number(String(value || "").replace(",", "."));
  return Number.isFinite(number) ? number : null;
};

const isLeagueLine = (line) => {
  const text = String(line || "").replace(/\s+/g, " ").trim();
  if (!text || text.length < 4) return false;
  if (/^\d{1,2}\.\d{1,2}\.\d{4}/.test(text)) return false;
  if (/^\d{1,2}:\d{2}\b/.test(text)) return false;
  if (/\d+\.\d+/.test(text)) return false;
  if (text.includes(" - ")) return false;
  return /Lig|Kupa|Kupası|Premier|Dünya|Hazırlık|Grup|Division|League|Ligi|Liga|Serie|NPL|Şampiyonluk|Urvalsdeild|Superettan|Virsliga|Erovnuli/i.test(text);
};

const fixtureKey = (item) => [item.date, item.time, item.home, item.away]
  .map((value) => String(value || "").trim().toLocaleLowerCase("tr-TR"))
  .join("|");

const isNightWindowMatch = (dateKey, time, todayKey, tomorrowKey) => {
  const minute = parseClockMinutes(time);
  if (minute === null || minute >= NIGHT_WINDOW_END_MINUTE) return false;
  return dateKey === todayKey || dateKey === tomorrowKey;
};

const addFixture = (fixtures, currentDate, currentLeague, time, home, away, tail, todayKey, tomorrowKey) => {
  const date = toIsoDate(currentDate);
  if (!isNightWindowMatch(date, time, todayKey, tomorrowKey)) return;

  const cleanHome = cleanTeam(home);
  const cleanAway = cleanTeam(away);
  if (!cleanHome || !cleanAway || cleanHome.length < 2 || cleanAway.length < 2) return;

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
    source: "Maçkolik gece bülteni",
    oneOdd: odds[0] ?? null,
    drawOdd: odds[1] ?? null,
    twoOdd: odds[2] ?? null,
    under25: odds[3] ?? null,
    over25: odds[4] ?? null,
    cifte1x: odds[5] ?? null,
    cifte12: odds[6] ?? null,
    cifteX2: odds[7] ?? null,
    night_window: true,
    actual_day_note: "00:00-07:59 bülten maçı"
  });
};

const parseNightMatches = (html) => {
  const today = formatTurkeyDate();
  const tomorrow = addDays(today, 1);
  const allowedDotDates = new Set([dotDate(today), dotDate(tomorrow)]);
  const fixtures = [];
  let currentLeague = "Maçkolik İddaa Programı";
  let currentDate = null;

  for (const line of htmlToLines(html)) {
    const dateMatch = line.match(/\b(\d{1,2}\.\d{1,2}\.\d{4})\b/);
    if (dateMatch) currentDate = dateMatch[1];
    if (isLeagueLine(line)) {
      currentLeague = line;
      continue;
    }
    if (!currentDate || !allowedDotDates.has(currentDate)) continue;

    const single = line.match(/(?:^|\s)(\d{1,2}:\d{2})\s+(.+?)\s+-\s+(.+?)(?=\s+\d{4,5}\b|\s+\d+[.,]\d+\b|\s*$)(.*)$/);
    if (single) {
      addFixture(fixtures, currentDate, currentLeague, single[1], single[2], single[3], single[4], today, tomorrow);
      continue;
    }
    const loose = line.match(/(?:^|\s)(\d{1,2}:\d{2}).{0,160}?([A-Za-zÇĞİÖŞÜçğıöşü0-9.'’\- ]{2,60})\s+-\s+([A-Za-zÇĞİÖŞÜçğıöşü0-9.'’\- ]{2,60})(.*)$/);
    if (loose) addFixture(fixtures, currentDate, currentLeague, loose[1], loose[2], loose[3], loose[4], today, tomorrow);
  }

  return fixtures.filter((fixture, index, list) => index === list.findIndex((item) => fixtureKey(item) === fixtureKey(fixture)));
};

const mergeFixtures = (existing, additions) => {
  const map = new Map();
  [...existing, ...additions].forEach((item) => {
    const key = fixtureKey(item);
    if (!key.includes("||")) map.set(key, { ...item });
  });
  return [...map.values()].sort((a, b) => `${a.date || ""} ${a.time || ""} ${a.league || ""}`.localeCompare(`${b.date || ""} ${b.time || ""} ${b.league || ""}`, "tr"));
};

const main = async () => {
  const existing = readJson(fixturesPath, []);
  const html = await requestText(MACKOLIK_IDDAA_URL);
  const nightMatches = parseNightMatches(html);
  if (!nightMatches.length) {
    console.log("Gece bülteni: 00:00-07:59 arası ek maç bulunamadı.");
    return;
  }

  const merged = mergeFixtures(Array.isArray(existing) ? existing : [], nightMatches);
  writeJson(fixturesPath, merged);
  const raw = readJson(rawPoolPath, { matches: [] });
  if (Array.isArray(raw.matches)) {
    const rawMatches = mergeFixtures(raw.matches.map((item) => ({
      ...item,
      home: item.home || item.home_team_name,
      away: item.away || item.away_team_name,
      league: item.league || item.competition_name,
      matchCode: item.matchCode || item.match_code,
    })), nightMatches).map((item) => ({
      ...item,
      home_team_name: item.home_team_name || item.home,
      away_team_name: item.away_team_name || item.away,
      competition_name: item.competition_name || item.league,
    }));
    writeJson(rawPoolPath, { ...raw, generated_at: new Date().toISOString(), match_count: rawMatches.length, matches: rawMatches });
  }
  console.log(`Gece bülteni eklendi. Eklenen: ${nightMatches.length}. Toplam: ${merged.length}.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
