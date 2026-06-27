const fs = require("fs");
const https = require("https");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const outputPath = path.join(dataDir, "full-bulletin.json");
const fixturesPath = path.join(dataDir, "fixtures.json");
const liveMatchesPath = path.join(dataDir, "live-matches.json");
const sporTotoPath = path.join(dataDir, "spor_toto_bulteni.json");
const twoDayPath = path.join(dataDir, "two-day-bulletin.json");
const MACKOLIK_IDDAA_URL = "https://arsiv.mackolik.com/Iddaa-Programi";
const NEXT_DAY_EARLY_END_MINUTES = 8 * 60;
const LIVE_WINDOW_MINUTES = 130;
const EXTRA_MARKET_KEYS = [
  "hnd1", "hndX", "hnd2", "hnd01", "hnd10", "hnd20", "hnd02",
  "under05", "over05", "under15", "over15", "under35", "over35", "under45", "over45",
  "htFt11", "htFt1X", "htFt12", "htFtX1", "htFtXX", "htFtX2", "htFt21", "htFt2X", "htFt22",
  "ms1Under15", "msxUnder15", "ms2Under15", "ms1Over15", "msxOver15", "ms2Over15",
  "ms1Under25", "msxUnder25", "ms2Under25", "ms1Over25", "msxOver25", "ms2Over25",
  "ms1Under35", "msxUnder35", "ms2Under35", "ms1Over35", "msxOver35", "ms2Over35",
  "ms1Under45", "msxUnder45", "ms2Under45", "ms1Over45", "msxOver45", "ms2Over45",
  "ms1KgVar", "msxKgVar", "ms2KgVar", "ms1KgYok", "msxKgYok", "ms2KgYok",
  "goals01", "goals23", "goals45", "goals6plus",
  "halfTimeFullScore", "firstHalfScore", "correctScore10", "correctScore20", "correctScore21", "correctScore00", "correctScore11", "correctScore22", "correctScore01", "correctScore02", "correctScore12", "correctScoreOther",
  "firstSecondBttsYesYes", "firstSecondBttsYesNo", "firstSecondBttsNoYes", "firstSecondBttsNoNo",
  "mostGoalsFirstHalf", "mostGoalsSecondHalf", "mostGoalsEqual", "totalOdd", "totalEven",
  "cornerOver85", "cornerOver95", "cardOver35", "cardOver45", "homeShots10", "awayShots10", "totalShots21", "totalShots25"
];

const ensureDir = () => fs.mkdirSync(dataDir, { recursive: true });

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

const todayTR = () => {
  const parts = turkeyParts();
  return `${parts.year}-${parts.month}-${parts.day}`;
};

const nowMinutesTR = () => {
  const parts = turkeyParts();
  return Number(parts.hour) * 60 + Number(parts.minute);
};

const addDays = (dateKey, days) => {
  const [year, month, day] = String(dateKey).split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days, 12)).toISOString().slice(0, 10);
};

const dotDate = (dateKey) => {
  const [year, month, day] = String(dateKey).split("-");
  return `${day}.${month}.${year}`;
};

const toIsoDate = (value) => {
  const text = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const dot = text.match(/\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/);
  if (dot) return `${dot[3]}-${dot[2].padStart(2, "0")}-${dot[1].padStart(2, "0")}`;
  return "";
};

const parseClockMinutes = (time) => {
  const match = String(time || "").trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};

const readJson = (filePath, fallback) => {
  try {
    const text = fs.readFileSync(filePath, "utf8").trim();
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (filePath, value) => {
  ensureDir();
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
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

const cleanLeague = (value) => String(value || "Diger").replace(/\s+/g, " ").trim();

const parseOdd = (value) => {
  if (value === null || value === undefined || value === "" || value === "-") return null;
  const number = Number(String(value).replace(",", "."));
  return Number.isFinite(number) && number > 1 ? Number(number.toFixed(2)) : null;
};

const pick = (item, keys) => {
  for (const key of keys) {
    const value = item?.[key]
      ?? item?.odds?.[key]
      ?? item?.oranlar?.[key]
      ?? item?.available_odds?.[key]
      ?? item?.raw_market_guess_odds?.[key];
    const odd = parseOdd(value);
    if (odd) return odd;
  }
  return null;
};

const collectExtraOdds = (item) => Object.fromEntries(EXTRA_MARKET_KEYS
  .map((key) => [key, pick(item, [key, `${key}_guess`])])
  .filter(([, value]) => value !== null));

const isLeagueLine = (line) => {
  const text = String(line || "").replace(/\s+/g, " ").trim();
  if (!text || text.length < 4) return false;
  if (/^\d{1,2}\.\d{1,2}\.\d{4}/.test(text)) return false;
  if (/^\d{1,2}:\d{2}\b/.test(text)) return false;
  if (/\d+[.,]\d+/.test(text)) return false;
  if (text.includes(" - ")) return false;
  return /Lig|Kupa|Kupasi|Kupası|Premier|Dunya|Dünya|Hazirlik|Hazırlık|Grup|Division|League|Ligi|Liga|Serie|NPL|Sampiyonluk|Şampiyonluk|Urvalsdeild|Superettan|Virsliga|Erovnuli/i.test(text);
};

const baseWindow = () => {
  const mainDay = todayTR();
  return { mainDay, nextDay: addDays(mainDay, 1) };
};

const inBulletinWindow = (date, time, window) => {
  const minute = parseClockMinutes(time);
  if (!date || minute === null) return false;
  if (date === window.mainDay) return true;
  if (date === window.nextDay && minute < NEXT_DAY_EARLY_END_MINUTES) return true;
  return false;
};

const fixtureKey = (item) => [item.date, item.time, item.league, item.home, item.away]
  .map((value) => String(value || "").trim().toLocaleLowerCase("tr-TR"))
  .join("|");

const statusFromTime = (date, time, explicitStatus) => {
  const status = String(explicitStatus || "").toLowerCase();
  if (["live", "finished", "cancelled", "postponed"].includes(status)) return status;
  const today = todayTR();
  const minute = parseClockMinutes(time);
  if (!date || minute === null) return "scheduled";
  if (date < today) return "finished";
  if (date > today) return "scheduled";
  const elapsed = nowMinutesTR() - minute;
  if (elapsed < 0) return "scheduled";
  if (elapsed <= LIVE_WINDOW_MINUTES) return "live";
  return "finished";
};

const minuteFromStatus = (date, time, explicitMinute, status) => {
  const number = Number(explicitMinute);
  if (Number.isFinite(number) && number > 0) return Math.min(120, Math.round(number));
  if (status !== "live" || date !== todayTR()) return null;
  const start = parseClockMinutes(time);
  if (start === null) return null;
  const elapsed = nowMinutesTR() - start;
  if (elapsed <= 0) return null;
  return Math.max(1, Math.min(90, elapsed > 60 ? elapsed - 15 : elapsed));
};

const normalizeFixture = (item, sourceName = "Yerel veri") => {
  const matchName = item?.match || item?.match_name || "";
  const split = String(matchName).split(/\s+-\s+|\s+VS\s+/i);
  const date = toIsoDate(item?.date || item?.tarih || item?.start_date || item?.utc_date);
  const time = String(item?.time || item?.saat || item?.start_time || "").trim();
  const home = cleanTeam(item?.home || item?.home_team_name || item?.ev_sahibi || split[0]);
  const away = cleanTeam(item?.away || item?.away_team_name || item?.deplasman || split[1]);
  if (!date || !time || !home || !away) return null;
  const status = statusFromTime(date, time, item?.status || item?.liveStatus);
  const minute = minuteFromStatus(date, time, item?.minute || item?.elapsed || item?.matchMinute, status);
  const extraOdds = collectExtraOdds(item);
  const odds = {
    ...extraOdds,
    ms1: pick(item, ["ms1", "one", "oneOdd", "odd1", "ms_1"]),
    msx: pick(item, ["msx", "draw", "drawOdd", "oddX", "ms_x"]),
    ms2: pick(item, ["ms2", "two", "twoOdd", "odd2", "ms_2"]),
    under25: pick(item, ["under25", "alt25", "under", "alt", "alt_25"]),
    over25: pick(item, ["over25", "ust25", "over", "ust", "ust_25"]),
    bttsYes: pick(item, ["bttsYes", "kgVar", "kg_var", "varOdd", "var"]),
    bttsNo: pick(item, ["bttsNo", "kgYok", "kg_yok", "yokOdd", "yok"]),
  };
  const cleanOdds = Object.fromEntries(Object.entries(odds).filter(([, value]) => value !== null));
  return {
    date,
    time,
    league: cleanLeague(item?.league || item?.competition_name || item?.lig || "Diger"),
    home,
    away,
    matchCode: item?.matchCode || item?.match_code || item?.code || null,
    status,
    liveStatus: status,
    minute,
    score: item?.score || "",
    source: item?.source || sourceName,
    odds: cleanOdds,
    available_odds: cleanOdds,
    raw_market_guess_odds: item?.raw_market_guess_odds || extraOdds,
    raw_odds_sequence: item?.raw_odds_sequence || [],
    raw_market_value_count: item?.raw_market_value_count || Object.keys(cleanOdds).length,
  };
};

const mapExtraFromOdds = (odds, startIndex = 8) => Object.fromEntries(EXTRA_MARKET_KEYS
  .map((key, index) => [key, odds[startIndex + index] ?? null])
  .filter(([, value]) => value !== null));

const parseMackolikHtml = (html) => {
  const window = baseWindow();
  const allowedDates = new Set([dotDate(window.mainDay), dotDate(window.nextDay)]);
  const fixtures = [];
  let currentDate = null;
  let currentLeague = "Mackolik Iddaa Programi";

  for (const line of htmlToLines(html)) {
    const dateMatch = line.match(/\b(\d{1,2}\.\d{1,2}\.\d{4})\b/);
    if (dateMatch) currentDate = dateMatch[1];
    if (isLeagueLine(line)) {
      currentLeague = line;
      continue;
    }
    if (!currentDate || !allowedDates.has(currentDate)) continue;

    const row = line.match(/(?:^|\s)(\d{1,2}:\d{2})\s+(.+?)\s+-\s+(.+?)(?=\s+\d{4,5}\b|\s+\d+[.,]\d+\b|\s*$)(.*)$/)
      || line.match(/(?:^|\s)(\d{1,2}:\d{2}).{0,160}?([A-Za-zÇĞİÖŞÜçğıöşü0-9.'’\- ]{2,60})\s+-\s+([A-Za-zÇĞİÖŞÜçğıöşü0-9.'’\- ]{2,60})(.*)$/);
    if (!row) continue;

    const date = toIsoDate(currentDate);
    const time = row[1];
    if (!inBulletinWindow(date, time, window)) continue;
    const numbers = String(row[4] || "").match(/\b\d{4,5}\b|\b\d+[.,]\d+\b/g) || [];
    const matchCode = numbers.find((item) => /^\d{4,5}$/.test(item)) || null;
    const odds = numbers.filter((item) => /^\d+[.,]\d+$/.test(item)).map(parseOdd).filter(Boolean);
    fixtures.push(normalizeFixture({
      date,
      time,
      league: currentLeague,
      home: row[2],
      away: row[3],
      matchCode,
      oneOdd: odds[0] ?? null,
      drawOdd: odds[1] ?? null,
      twoOdd: odds[2] ?? null,
      under25: odds[3] ?? null,
      over25: odds[4] ?? null,
      raw_market_guess_odds: mapExtraFromOdds(odds),
      raw_odds_sequence: odds,
      raw_market_value_count: odds.length,
      source: "Mackolik Iddaa Programi",
    }, "Mackolik Iddaa Programi"));
  }

  return fixtures.filter(Boolean);
};

const localSources = () => {
  const fixtures = readJson(fixturesPath, []);
  const live = readJson(liveMatchesPath, { matches: [] });
  const sporToto = readJson(sporTotoPath, { matches: [] });
  const twoDay = readJson(twoDayPath, { matches: [] });
  return [
    ...(Array.isArray(fixtures) ? fixtures.map((item) => ({ ...item, source: item.source || "fixtures.json" })) : []),
    ...(Array.isArray(live.matches) ? live.matches.map((item) => ({ ...item, source: item.source || "live-matches.json" })) : []),
    ...(Array.isArray(sporToto.matches) ? sporToto.matches.map((item) => ({ ...item, source: item.source || "spor_toto_bulteni.json" })) : []),
    ...(Array.isArray(twoDay.matches) ? twoDay.matches.map((item) => ({ ...item, source: item.source || "two-day-bulletin.json" })) : []),
  ].map((item) => normalizeFixture(item, item.source || "Yerel veri")).filter(Boolean);
};

const uniqueAndSort = (matches) => {
  const window = baseWindow();
  const map = new Map();
  for (const match of matches) {
    if (!inBulletinWindow(match.date, match.time, window)) continue;
    map.set(fixtureKey(match), match);
  }
  return [...map.values()].sort((a, b) => `${a.date} ${a.time} ${a.league} ${a.home}`.localeCompare(`${b.date} ${b.time} ${b.league} ${b.home}`, "tr"));
};

const buildBulletin = async () => {
  let external = [];
  let source = "Yerel veri kaynaklari";
  try {
    const html = await requestText(MACKOLIK_IDDAA_URL);
    external = parseMackolikHtml(html);
    if (external.length) source = "Mackolik Iddaa Programi";
  } catch (error) {
    source = `Mackolik okunamadi: ${error.message}`;
  }

  const local = localSources();
  const allMatches = uniqueAndSort([...local, ...external]);
  const liveMatches = allMatches.filter((item) => item.status === "live" || item.liveStatus === "live");
  const finishedMatches = allMatches.filter((item) => item.status === "finished");
  const matches = allMatches.filter((item) => item.status === "scheduled");
  const mainDay = todayTR();
  const nextDay = addDays(mainDay, 1);
  return {
    generated_at: new Date().toISOString(),
    timezone: "Europe/Istanbul",
    source: allMatches.length ? source : "Tam bulten verisi bekleniyor",
    status: allMatches.length ? "active" : "waiting",
    message: allMatches.length ? "" : "Tam iddaa bulteni icin guncel mac verisi henuz olusmadi.",
    date_window: {
      main_day: mainDay,
      includes_next_day_until: `${nextDay} 08:00`,
    },
    match_count: matches.length,
    live_count: liveMatches.length,
    scheduled_count: matches.length,
    finished_count: finishedMatches.length,
    wide_market_odds_count: matches.reduce((sum, item) => sum + Object.keys(item.available_odds || {}).length, 0),
    matches,
    live_matches: liveMatches,
  };
};

const main = async () => {
  ensureDir();
  const bulletin = await buildBulletin();
  writeJson(outputPath, bulletin);
  console.log(`Tam bulten olusturuldu. Bulten: ${bulletin.match_count}. Canli ayrilan: ${bulletin.live_count}. Genis oran: ${bulletin.wide_market_odds_count}.`);
};

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { buildBulletin, parseMackolikHtml, normalizeFixture, inBulletinWindow };
