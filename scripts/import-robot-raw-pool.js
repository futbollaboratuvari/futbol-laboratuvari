const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const siteDataDir = path.join(rootDir, "data");
const siteFixturesPath = path.join(siteDataDir, "fixtures.json");
const siteRawPoolPath = path.join(siteDataDir, "ham_mac_havuzu.json");
const robotRawPoolPath = path.join(rootDir, "bu-klas-r-i-in-basit", "data", "ham_mac_havuzu.json");
const LIVE_WINDOW_MINUTES = 130;

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

const formatTurkeyTime = (date = new Date()) =>
  new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

const turkeyMinutes = () => {
  const [hour, minute] = formatTurkeyTime().split(":").map(Number);
  return hour * 60 + minute;
};

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

const teamKeyOf = (item) => [
  normalizeName(item.league || item.competition_name || item.lig),
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
  set(["cifte_1x", "cifte1x", "doubleChance1X", "dc_1x"], ["cifte1x", "doubleChance1X", "dc_1x"]);
  set(["cifte_12", "cifte12", "doubleChance12", "dc_12"], ["cifte12", "doubleChance12", "dc_12"]);
  set(["cifte_x2", "cifteX2", "doubleChanceX2", "dc_x2"], ["cifteX2", "doubleChanceX2", "dc_x2"]);
  set(["hnd_1", "hnd1", "handicapOne", "handicap_1"], ["hnd1", "handicapOne", "handicap_1"]);
  set(["hnd_x", "hndX", "hndDraw", "handicapDraw", "handicap_x"], ["hndX", "hndDraw", "handicapDraw", "handicap_x"]);
  set(["hnd_2", "hnd2", "handicapTwo", "handicap_2"], ["hnd2", "handicapTwo", "handicap_2"]);
  set(["alt_25", "under25", "alt25", "under", "alt"], ["under25", "alt25", "under", "alt"]);
  set(["ust_25", "over25", "ust25", "over", "ust"], ["over25", "ust25", "over", "ust"]);
  set(["alt_35", "under35", "alt35", "under3_5"], ["under35", "alt35", "under3_5"]);
  set(["ust_35", "over35", "ust35", "over3_5"], ["over35", "ust35", "over3_5"]);
  set(["iy_alt_15", "iyAlt15", "firstHalfUnder15", "first_half_under_15"], ["iyAlt15", "firstHalfUnder15", "first_half_under_15"]);
  set(["iy_ust_15", "iyUst15", "firstHalfOver15", "first_half_over_15"], ["iyUst15", "firstHalfOver15", "first_half_over_15"]);
  set(["ev_alt_25", "evAlt25", "homeUnder25", "home_team_under_25"], ["evAlt25", "homeUnder25", "home_team_under_25"]);
  set(["ev_ust_25", "evUst25", "homeOver25", "home_team_over_25"], ["evUst25", "homeOver25", "home_team_over_25"]);
  set(["dep_alt_15", "depAlt15", "awayUnder15", "away_team_under_15"], ["depAlt15", "awayUnder15", "away_team_under_15"]);
  set(["dep_ust_15", "depUst15", "awayOver15", "away_team_over_15"], ["depUst15", "awayOver15", "away_team_over_15"]);
  set(["ev_iy_alt_05", "evIyAlt05", "homeFirstHalfUnder05", "home_first_half_under_05"], ["evIyAlt05", "homeFirstHalfUnder05", "home_first_half_under_05"]);
  set(["ev_iy_ust_05", "evIyUst05", "homeFirstHalfOver05", "home_first_half_over_05"], ["evIyUst05", "homeFirstHalfOver05", "home_first_half_over_05"]);
  set(["dep_iy_alt_05", "depIyAlt05", "awayFirstHalfUnder05", "away_first_half_under_05"], ["depIyAlt05", "awayFirstHalfUnder05", "away_first_half_under_05"]);
  set(["dep_iy_ust_05", "depIyUst05", "awayFirstHalfOver05", "away_first_half_over_05"], ["depIyUst05", "awayFirstHalfOver05", "away_first_half_over_05"]);
  set(["kg_var", "bttsYes", "kgVar", "varOdd", "var"], ["bttsYes", "kgVar", "varOdd", "var"]);
  set(["kg_yok", "bttsNo", "kgYok", "yokOdd", "yok"], ["bttsNo", "kgYok", "yokOdd", "yok"]);
  set(["iy_kg_var", "iyKgVar", "firstHalfBttsYes", "first_half_btts_yes"], ["iyKgVar", "firstHalfBttsYes", "first_half_btts_yes"]);
  set(["iy_kg_yok", "iyKgYok", "firstHalfBttsNo", "first_half_btts_no"], ["iyKgYok", "firstHalfBttsNo", "first_half_btts_no"]);
  set(["ikinci_yari_kg_var", "ikinciYariKgVar", "secondHalfBttsYes", "second_half_btts_yes"], ["ikinciYariKgVar", "secondHalfBttsYes", "second_half_btts_yes"]);
  set(["ikinci_yari_kg_yok", "ikinciYariKgYok", "secondHalfBttsNo", "second_half_btts_no"], ["ikinciYariKgYok", "secondHalfBttsNo", "second_half_btts_no"]);
  set(["iy_1", "iy1", "firstHalfOne", "first_half_1", "firstHalf1"], ["iy1", "firstHalfOne", "first_half_1"]);
  set(["iy_x", "iyX", "firstHalfDraw", "first_half_x", "firstHalfX"], ["iyX", "firstHalfDraw", "first_half_x"]);
  set(["iy_2", "iy2", "firstHalfTwo", "first_half_2", "firstHalf2"], ["iy2", "firstHalfTwo", "first_half_2"]);
  set(["ikinci_yari_1", "ikinciYari1", "secondHalfOne", "second_half_1", "secondHalf1"], ["ikinciYari1", "secondHalfOne", "second_half_1"]);
  set(["ikinci_yari_x", "ikinciYariX", "secondHalfDraw", "second_half_x", "secondHalfX"], ["ikinciYariX", "secondHalfDraw", "second_half_x"]);
  set(["ikinci_yari_2", "ikinciYari2", "secondHalfTwo", "second_half_2", "secondHalf2"], ["ikinciYari2", "secondHalfTwo", "second_half_2"]);
  set(["iy_cifte_1x", "iyCifte1x", "firstHalfDoubleChance1X", "first_half_dc_1x"], ["iyCifte1x", "firstHalfDoubleChance1X", "first_half_dc_1x"]);
  set(["iy_cifte_12", "iyCifte12", "firstHalfDoubleChance12", "first_half_dc_12"], ["iyCifte12", "firstHalfDoubleChance12", "first_half_dc_12"]);
  set(["iy_cifte_x2", "iyCifteX2", "firstHalfDoubleChanceX2", "first_half_dc_x2"], ["iyCifteX2", "firstHalfDoubleChanceX2", "first_half_dc_x2"]);
  set(["iy2y_kg_evet_evet", "iy2yKgYesYes", "firstSecondBttsYesYes", "ht2hBttsYesYes"], ["iy2yKgYesYes", "firstSecondBttsYesYes", "ht2hBttsYesYes"]);
  set(["iy2y_kg_evet_hayir", "iy2y_kg_evet_hayır", "iy2yKgYesNo", "firstSecondBttsYesNo", "ht2hBttsYesNo"], ["iy2yKgYesNo", "firstSecondBttsYesNo", "ht2hBttsYesNo"]);
  set(["iy2y_kg_hayir_evet", "iy2y_kg_hayır_evet", "iy2yKgNoYes", "firstSecondBttsNoYes", "ht2hBttsNoYes"], ["iy2yKgNoYes", "firstSecondBttsNoYes", "ht2hBttsNoYes"]);
  set(["iy2y_kg_hayir_hayir", "iy2y_kg_hayır_hayır", "iy2yKgNoNo", "firstSecondBttsNoNo", "ht2hBttsNoNo"], ["iy2yKgNoNo", "firstSecondBttsNoNo", "ht2hBttsNoNo"]);

  return result;
};

const hasOdds = (item) => {
  const odds = pickOdds(item);
  return Boolean(
    odds.oneOdd || odds.drawOdd || odds.twoOdd || odds.cifte1x || odds.cifte12 || odds.cifteX2 || odds.hnd1 || odds.hndX || odds.hnd2 ||
    odds.under25 || odds.over25 || odds.under35 || odds.over35 || odds.iyAlt15 || odds.iyUst15 ||
    odds.evAlt25 || odds.evUst25 || odds.depAlt15 || odds.depUst15 || odds.evIyAlt05 || odds.evIyUst05 || odds.depIyAlt05 || odds.depIyUst05 ||
    odds.kgVar || odds.kgYok || odds.iyKgVar || odds.iyKgYok || odds.ikinciYariKgVar || odds.ikinciYariKgYok ||
    odds.iy1 || odds.iyX || odds.iy2 || odds.ikinciYari1 || odds.ikinciYariX || odds.ikinciYari2 ||
    odds.iyCifte1x || odds.iyCifte12 || odds.iyCifteX2 ||
    odds.iy2yKgYesYes || odds.iy2yKgYesNo || odds.iy2yKgNoYes || odds.iy2yKgNoNo
  );
};

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

const pickFirst = (...values) => values.find((value) => value !== undefined && value !== null && value !== "");

const pickLiveFields = (item = {}, fallback = {}) => {
  const homeScore = normalizeNumber(pickFirst(item.homeScore, item.home_score, item.homeGoals, item.home_goals, item.ev_sahibi_skor, fallback.homeScore, fallback.home_score, fallback.homeGoals, fallback.home_goals));
  const awayScore = normalizeNumber(pickFirst(item.awayScore, item.away_score, item.awayGoals, item.away_goals, item.deplasman_skor, fallback.awayScore, fallback.away_score, fallback.awayGoals, fallback.away_goals));
  const minute = normalizeNumber(pickFirst(item.minute, item.elapsed, item.matchMinute, item.dakika, fallback.minute, fallback.elapsed, fallback.matchMinute, fallback.dakika));
  const score = String(pickFirst(item.score, item.skor, item.result_score, item.result, fallback.score, fallback.skor, fallback.result_score, fallback.result, "") || "").trim();
  return {
    minute,
    homeScore,
    awayScore,
    score: homeScore !== null && awayScore !== null ? `${homeScore}-${awayScore}` : score,
  };
};

const statusFromClock = (date, time) => {
  const dateKey = dotToIso(date) || date;
  const start = parseClockMinutes(time);
  if (!dateKey || start === null) return { status: "scheduled", minute: null };
  const today = formatTurkeyDate();
  if (dateKey < today) return { status: "finished", minute: 90 };
  if (dateKey > today) return { status: "scheduled", minute: null };
  const elapsed = turkeyMinutes() - start;
  if (elapsed < 0) return { status: "scheduled", minute: null };
  if (elapsed <= LIVE_WINDOW_MINUTES) return { status: "live", minute: Math.max(1, Math.min(90, elapsed > 60 ? elapsed - 15 : elapsed)) };
  return { status: "finished", minute: 90 };
};

const normalizeStatus = (item, fallback = {}) => {
  const status = String(pickFirst(item.status, item.durum, item.liveStatus, fallback.status, fallback.durum, fallback.liveStatus, "") || "").toLocaleLowerCase("tr-TR").trim();
  if (["live", "canlı", "canli", "1h", "2h", "ht", "devre arası"].includes(status)) return "live";
  if (["finished", "tamamlandı", "tamamlandi", "bitti", "ms", "fulltime"].includes(status)) return "finished";
  if (["postponed", "ertelendi"].includes(status)) return "postponed";
  if (["cancelled", "canceled", "iptal"].includes(status)) return "cancelled";
  return statusFromClock(item.date || item.tarih || item.utc_date, item.time || item.saat).status;
};

const rawToFixture = (item, existing = {}) => {
  const date = dotToIso(item.tarih || item.utc_date || item.date);
  const time = item.saat || item.time || "";
  const home = item.ev_sahibi || item.home_team_name || item.home || "";
  const away = item.deplasman || item.away_team_name || item.away || "";
  if (!date || !time || !home || !away) return null;

  const live = pickLiveFields(item, existing);
  const clock = statusFromClock(date, time);
  const status = normalizeStatus({ ...item, date, time }, existing);
  const minute = live.minute !== null ? live.minute : status === "live" ? clock.minute : status === "finished" ? 90 : null;

  return {
    date,
    time,
    league: item.lig || item.competition_name || item.league || existing.league || "Diğer Maçlar",
    home,
    away,
    status,
    liveStatus: status,
    minute,
    homeScore: live.homeScore,
    awayScore: live.awayScore,
    score: live.score,
    lastLiveUpdate: new Date().toISOString(),
    source: item.source === "mackolik" || item.kaynak === "mackolik" ? "Maçkolik canlı robot" : (item.source || item.kaynak || existing.source || "Robot ham veri havuzu"),
    matchCode: item.mac_kodu || item.match_code || existing.matchCode || null,
    oddsSource: "Robot ham veri havuzu",
    ...pickOdds(item),
  };
};

const mergeLiveFields = (base, incoming) => {
  const live = pickLiveFields(incoming, base);
  const status = normalizeStatus(incoming, base);
  const clock = statusFromClock(incoming.date || base.date, incoming.time || base.time);
  return {
    ...base,
    ...pickOdds(incoming),
    status,
    liveStatus: status,
    minute: live.minute !== null ? live.minute : status === "live" ? clock.minute : status === "finished" ? 90 : base.minute ?? null,
    homeScore: live.homeScore,
    awayScore: live.awayScore,
    score: live.score || base.score || "",
    lastLiveUpdate: new Date().toISOString(),
    matchCode: incoming.matchCode || base.matchCode || null,
    oddsSource: incoming.oddsSource || base.oddsSource || "Robot ham veri havuzu",
  };
};

const main = () => {
  const siteFixtures = readJson(siteFixturesPath, []);
  const robotPool = readJson(robotRawPoolPath, { matches: [] });
  const today = formatTurkeyDate();
  const existingByKey = new Map(siteFixtures.map((item) => [keyOf(item), item]));
  const robotMatches = Array.isArray(robotPool.matches)
    ? robotPool.matches.map((item) => rawToFixture(item, existingByKey.get(keyOf(item)) || {})).filter(Boolean)
    : [];
  const currentRobotMatches = robotMatches.filter((item) => item.date >= today || hasOdds(item) || item.status === "live");

  const byExactKey = new Map(siteFixtures.map((item) => [keyOf(item), item]));
  const oddsByTeamKey = new Map();

  for (const robotMatch of currentRobotMatches) {
    if (hasOdds(robotMatch)) oddsByTeamKey.set(teamKeyOf(robotMatch), robotMatch);
  }

  for (const robotMatch of currentRobotMatches) {
    const key = keyOf(robotMatch);
    const existing = byExactKey.get(key);
    if (existing) {
      byExactKey.set(key, mergeLiveFields(existing, robotMatch));
    } else if (robotMatch.date >= today || hasOdds(robotMatch) || robotMatch.status === "live") {
      byExactKey.set(key, robotMatch);
    }
  }

  const mergedFixtures = [...byExactKey.values()].map((fixture) => {
    const fixtureWithStatus = mergeLiveFields(fixture, fixture);
    if (hasOdds(fixtureWithStatus)) return fixtureWithStatus;
    const teamMatch = oddsByTeamKey.get(teamKeyOf(fixtureWithStatus));
    if (!teamMatch) return fixtureWithStatus;
    return {
      ...mergeLiveFields(fixtureWithStatus, teamMatch),
      matchCode: teamMatch.matchCode || fixtureWithStatus.matchCode || null,
      oddsSource: "Robot ham veri havuzu takım eşleşmesi",
    };
  }).sort((a, b) => String(a.date || "").localeCompare(String(b.date || "")) || String(a.time || "99:99").localeCompare(String(b.time || "99:99")));

  const oddsCount = mergedFixtures.filter(hasOdds).length;
  const liveCount = mergedFixtures.filter((fixture) => fixture.status === "live").length;

  writeJson(siteFixturesPath, mergedFixtures);
  writeJson(siteRawPoolPath, {
    generated_at: new Date().toISOString(),
    timezone: "Europe/Istanbul",
    source: "Robot ham veri havuzu siteye aktarıldı",
    match_count: mergedFixtures.length,
    odds_match_count: oddsCount,
    live_match_count: liveCount,
    matches: mergedFixtures.map((fixture) => ({
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
      source: fixture.source,
      match_code: fixture.matchCode || null,
      odds: {
        ms_1: fixture.oneOdd ?? null,
        ms_x: fixture.drawOdd ?? null,
        ms_2: fixture.twoOdd ?? null,
        cifte_1x: fixture.cifte1x ?? null,
        cifte_12: fixture.cifte12 ?? null,
        cifte_x2: fixture.cifteX2 ?? null,
        hnd_1: fixture.hnd1 ?? null,
        hnd_x: fixture.hndX ?? null,
        hnd_2: fixture.hnd2 ?? null,
        alt_25: fixture.under25 ?? null,
        ust_25: fixture.over25 ?? null,
        alt_35: fixture.under35 ?? null,
        ust_35: fixture.over35 ?? null,
        iy_alt_15: fixture.iyAlt15 ?? null,
        iy_ust_15: fixture.iyUst15 ?? null,
        ev_alt_25: fixture.evAlt25 ?? null,
        ev_ust_25: fixture.evUst25 ?? null,
        dep_alt_15: fixture.depAlt15 ?? null,
        dep_ust_15: fixture.depUst15 ?? null,
        ev_iy_alt_05: fixture.evIyAlt05 ?? null,
        ev_iy_ust_05: fixture.evIyUst05 ?? null,
        dep_iy_alt_05: fixture.depIyAlt05 ?? null,
        dep_iy_ust_05: fixture.depIyUst05 ?? null,
        kg_var: fixture.kgVar ?? null,
        kg_yok: fixture.kgYok ?? null,
        iy_kg_var: fixture.iyKgVar ?? null,
        iy_kg_yok: fixture.iyKgYok ?? null,
        ikinci_yari_kg_var: fixture.ikinciYariKgVar ?? null,
        ikinci_yari_kg_yok: fixture.ikinciYariKgYok ?? null,
        iy_1: fixture.iy1 ?? null,
        iy_x: fixture.iyX ?? null,
        iy_2: fixture.iy2 ?? null,
        ikinci_yari_1: fixture.ikinciYari1 ?? null,
        ikinci_yari_x: fixture.ikinciYariX ?? null,
        ikinci_yari_2: fixture.ikinciYari2 ?? null,
        iy_cifte_1x: fixture.iyCifte1x ?? null,
        iy_cifte_12: fixture.iyCifte12 ?? null,
        iy_cifte_x2: fixture.iyCifteX2 ?? null,
        iy2y_kg_evet_evet: fixture.iy2yKgYesYes ?? null,
        iy2y_kg_evet_hayir: fixture.iy2yKgYesNo ?? null,
        iy2y_kg_hayir_evet: fixture.iy2yKgNoYes ?? null,
        iy2y_kg_hayir_hayir: fixture.iy2yKgNoNo ?? null,
      },
    })),
  });

  console.log(`Robot ham havuzu site verisine aktarıldı. Maç: ${mergedFixtures.length}. Oranlı maç: ${oddsCount}. Canlı maç: ${liveCount}.`);
};

main();
