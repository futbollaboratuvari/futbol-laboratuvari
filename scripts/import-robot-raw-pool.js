const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const siteDataDir = path.join(rootDir, "data");
const siteFixturesPath = path.join(siteDataDir, "fixtures.json");
const siteRawPoolPath = path.join(siteDataDir, "ham_mac_havuzu.json");
const robotRawPoolPath = path.join(rootDir, "bu-klas-r-i-in-basit", "data", "ham_mac_havuzu.json");

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

const formatTurkeyDate = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const dotToIso = (value) => {
  const text = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const match = text.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return "";
  return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
};

const normalizeName = (value) => String(value || "")
  .toLocaleLowerCase("tr-TR")
  .replace(/ı/g, "i")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const keyOf = (item) => [
  item.date || dotToIso(item.tarih || item.utc_date),
  item.time || item.saat || "",
  normalizeName(item.home || item.home_team_name || item.ev_sahibi),
  normalizeName(item.away || item.away_team_name || item.deplasman),
].join("|");

const pickOdds = (item) => {
  const odds = item.oranlar || item.odds || {};
  const result = {};
  const set = (keys, names) => {
    const value = keys.map((key) => odds[key] ?? item[key]).find((candidate) => candidate !== undefined && candidate !== null && candidate !== "");
    if (value === undefined || value === null || value === "") return;
    names.forEach((name) => {
      result[name] = value;
    });
  };

  set(["ms_1", "one", "oneOdd", "ms1", "odd1"], ["one", "oneOdd", "ms1", "odd1"]);
  set(["ms_x", "draw", "drawOdd", "msx", "oddX"], ["draw", "drawOdd", "msx", "oddX"]);
  set(["ms_2", "two", "twoOdd", "ms2", "odd2"], ["two", "twoOdd", "ms2", "odd2"]);
  set(["alt_25", "under25", "alt25", "under", "alt"], ["under25", "alt25", "under", "alt"]);
  set(["ust_25", "over25", "ust25", "over", "ust"], ["over25", "ust25", "over", "ust"]);
  set(["kg_var", "bttsYes", "kgVar", "varOdd", "var"], ["bttsYes", "kgVar", "varOdd", "var"]);
  set(["kg_yok", "bttsNo", "kgYok", "yokOdd", "yok"], ["bttsNo", "kgYok", "yokOdd", "yok"]);

  return result;
};

const rawToFixture = (item) => {
  const date = dotToIso(item.tarih || item.utc_date || item.date);
  const time = item.saat || item.time || "";
  const home = item.ev_sahibi || item.home_team_name || item.home || "";
  const away = item.deplasman || item.away_team_name || item.away || "";
  if (!date || !time || !home || !away) return null;

  return {
    date,
    time,
    league: item.lig || item.competition_name || item.league || "Diğer Maçlar",
    home,
    away,
    status: String(item.status || "scheduled").toLowerCase() === "finished" ? "finished" : "scheduled",
    source: item.source === "mackolik" ? "Maçkolik canlı robot" : (item.source || "Robot ham veri havuzu"),
    matchCode: item.mac_kodu || item.match_code || null,
    oddsSource: "Robot ham veri havuzu",
    ...pickOdds(item),
  };
};

const main = () => {
  const siteFixtures = readJson(siteFixturesPath, []);
  const robotPool = readJson(robotRawPoolPath, { matches: [] });
  const today = formatTurkeyDate();
  const robotMatches = Array.isArray(robotPool.matches) ? robotPool.matches.map(rawToFixture).filter(Boolean) : [];
  const currentRobotMatches = robotMatches.filter((item) => item.date >= today);
  const byKey = new Map(siteFixtures.map((item) => [keyOf(item), item]));

  for (const robotMatch of currentRobotMatches) {
    const key = keyOf(robotMatch);
    const existing = byKey.get(key);
    if (existing) {
      byKey.set(key, { ...existing, ...pickOdds(robotMatch), matchCode: robotMatch.matchCode || existing.matchCode || null, oddsSource: robotMatch.oddsSource });
    } else {
      byKey.set(key, robotMatch);
    }
  }

  const mergedFixtures = [...byKey.values()].sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")) || String(a.time || "99:99").localeCompare(String(b.time || "99:99")));
  const oddsCount = mergedFixtures.filter((item) => item.oneOdd || item.drawOdd || item.twoOdd || item.under25 || item.over25 || item.kgVar || item.kgYok).length;

  writeJson(siteFixturesPath, mergedFixtures);
  writeJson(siteRawPoolPath, {
    generated_at: new Date().toISOString(),
    timezone: "Europe/Istanbul",
    source: "Robot ham veri havuzu siteye aktarıldı",
    match_count: mergedFixtures.length,
    odds_match_count: oddsCount,
    matches: mergedFixtures.map((fixture) => ({
      home_team_name: fixture.home,
      away_team_name: fixture.away,
      competition_name: fixture.league,
      date: fixture.date,
      time: fixture.time,
      status: fixture.status,
      source: fixture.source,
      match_code: fixture.matchCode || null,
      odds: {
        ms_1: fixture.oneOdd ?? null,
        ms_x: fixture.drawOdd ?? null,
        ms_2: fixture.twoOdd ?? null,
        alt_25: fixture.under25 ?? null,
        ust_25: fixture.over25 ?? null,
        kg_var: fixture.kgVar ?? null,
        kg_yok: fixture.kgYok ?? null,
      },
    })),
  });

  console.log(`Robot ham havuzu site verisine aktarıldı. Maç: ${mergedFixtures.length}. Oranlı maç: ${oddsCount}.`);
};

main();
