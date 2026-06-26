const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const fullBulletinPath = path.join(dataDir, "full-bulletin.json");
const liveMatchesPath = path.join(dataDir, "live-matches.json");
const outputPath = path.join(dataDir, "live-now.json");
const LIVE_WINDOW_MINUTES = 130;
const UPCOMING_WINDOW_MINUTES = 90;

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

const readJson = (filePath, fallback) => {
  try {
    const text = fs.readFileSync(filePath, "utf8").trim();
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (filePath, value) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

const parseClockMinutes = (time) => {
  const match = String(time || "").trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};

const pickOdd = (match, key) => match?.odds?.[key] ?? match?.available_odds?.[key] ?? match?.raw_market_guess_odds?.[key] ?? null;

const normalize = (item, source) => {
  const matchText = String(item?.match || item?.match_name || "");
  const split = matchText.split(/\s+-\s+|\s+VS\s+/i);
  const date = String(item?.date || item?.tarih || "").slice(0, 10);
  const time = String(item?.time || item?.start_time || item?.saat || "").trim();
  const home = item?.home || item?.home_team_name || split[0] || "";
  const away = item?.away || item?.away_team_name || split[1] || "";
  if (!date || !time || !home || !away) return null;
  return {
    date,
    time,
    league: item?.league || item?.competition_name || item?.lig || "Diger",
    home,
    away,
    match: `${home} - ${away}`,
    matchCode: item?.matchCode || item?.match_code || null,
    status: item?.status || item?.liveStatus || "scheduled",
    liveStatus: item?.liveStatus || item?.status || "scheduled",
    minute: item?.minute ?? null,
    score: item?.score || "",
    source: item?.source || source,
    odds: {
      ms1: item?.odds?.ms1 ?? item?.oneOdd ?? pickOdd(item, "ms1"),
      msx: item?.odds?.msx ?? item?.drawOdd ?? pickOdd(item, "msx"),
      ms2: item?.odds?.ms2 ?? item?.twoOdd ?? pickOdd(item, "ms2"),
      under25: item?.odds?.under25 ?? pickOdd(item, "under25"),
      over25: item?.odds?.over25 ?? pickOdd(item, "over25"),
      bttsYes: item?.odds?.bttsYes ?? pickOdd(item, "bttsYes"),
      bttsNo: item?.odds?.bttsNo ?? pickOdd(item, "bttsNo"),
    },
  };
};

const liveState = (match) => {
  const explicit = String(match.status || match.liveStatus || "").toLowerCase();
  const today = todayTR();
  const start = parseClockMinutes(match.time);
  if (["finished", "cancelled", "postponed"].includes(explicit)) return { status: explicit, minute: match.minute ?? null, distance: null };
  if (explicit === "live") return { status: "live", minute: Number(match.minute) || null, distance: 0 };
  if (match.date !== today || start === null) return { status: "scheduled", minute: null, distance: null };
  const diff = nowMinutesTR() - start;
  if (diff >= 0 && diff <= LIVE_WINDOW_MINUTES) {
    const minute = Math.max(1, Math.min(90, diff > 60 ? diff - 15 : diff));
    return { status: "live", minute, distance: diff };
  }
  if (diff < 0 && Math.abs(diff) <= UPCOMING_WINDOW_MINUTES) return { status: "upcoming", minute: null, distance: diff };
  if (diff > LIVE_WINDOW_MINUTES) return { status: "finished", minute: 90, distance: diff };
  return { status: "scheduled", minute: null, distance: diff };
};

const keyFor = (match) => [match.date, match.time, match.home, match.away]
  .map((value) => String(value || "").trim().toLocaleLowerCase("tr-TR"))
  .join("|");

const collectSources = () => {
  const fullBulletin = readJson(fullBulletinPath, { matches: [] });
  const liveMatches = readJson(liveMatchesPath, { matches: [] });
  const items = [
    ...(Array.isArray(fullBulletin.matches) ? fullBulletin.matches.map((item) => normalize(item, "full-bulletin.json")) : []),
    ...(Array.isArray(liveMatches.matches) ? liveMatches.matches.map((item) => normalize(item, "live-matches.json")) : []),
  ].filter(Boolean);
  const map = new Map();
  for (const item of items) map.set(keyFor(item), item);
  return [...map.values()].sort((a, b) => `${a.date} ${a.time} ${a.league}`.localeCompare(`${b.date} ${b.time} ${b.league}`, "tr"));
};

const main = () => {
  const allMatches = collectSources();
  const enriched = allMatches.map((match) => {
    const state = liveState(match);
    return {
      ...match,
      status: state.status === "upcoming" ? "scheduled" : state.status,
      liveStatus: state.status,
      minute: state.minute,
      last_update: new Date().toISOString(),
    };
  });
  const live = enriched.filter((match) => match.liveStatus === "live");
  const upcoming = enriched.filter((match) => match.liveStatus === "upcoming").slice(0, 10);
  const output = {
    generated_at: new Date().toISOString(),
    timezone: "Europe/Istanbul",
    source: allMatches.length ? "full-bulletin + live-matches" : "Canli veri bekleniyor",
    status: live.length ? "active" : "waiting",
    message: live.length ? "Baslayan karsilasmalar listelendi." : "Su anda baslayan karsilasma bulunamadi veya kaynak henuz guncellenmedi.",
    live_count: live.length,
    upcoming_count: upcoming.length,
    matches: live,
    upcoming_matches: upcoming,
  };
  writeJson(outputPath, output);
  console.log(`Canli bolum guncellendi. Canli: ${live.length}. Yaklasan: ${upcoming.length}.`);
};

main();
