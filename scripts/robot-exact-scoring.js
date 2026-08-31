const fs = require("fs");
const path = require("path");

const archivePath = process.env.ROBOT_ARCHIVE_PATH
  ? path.resolve(process.env.ROBOT_ARCHIVE_PATH)
  : path.join(__dirname, "..", "data", "robot_match_archive.json");
const MODEL_VERSION = "pro13-btts-conditioned-v2";
let memoryCache = null;
let teamIndexCache = null;
let archiveLookupCache = null;
const teamProfileCache = new Map();
const leagueProfileCache = new Map();

const parseOdd = (value) => {
  if (value === undefined || value === null || value === "" || value === "-") return null;
  const number = Number(String(value).replace(",", "."));
  return Number.isFinite(number) && number > 1 ? number : null;
};

const formatOdd = (value) => {
  const odd = parseOdd(value);
  return odd ? odd.toFixed(2) : "-";
};

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const pct = (value) => `${Math.round(value)}%`;

const trDate = () => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Istanbul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());

const get = (fixture, key) => fixture?.[key]
  ?? fixture?.odds?.[key]
  ?? fixture?.oranlar?.[key]
  ?? fixture?.detay_oranlar?.[key]
  ?? fixture?.raw_market_guess_odds?.[key]
  ?? fixture?.analysis?.[key]
  ?? fixture?.stats?.[key];

const readNumber = (fixture, keys) => {
  for (const key of keys) {
    const raw = get(fixture, key);
    if (raw === undefined || raw === null || raw === "" || raw === "-") continue;
    const number = Number(String(raw).replace("%", "").replace(",", "."));
    if (Number.isFinite(number)) return number;
  }
  return null;
};

const readText = (fixture, keys) => {
  for (const key of keys) {
    const raw = get(fixture, key);
    if (raw !== undefined && raw !== null && raw !== "") return String(raw);
  }
  return "";
};

const toCount = (value) => {
  if (value === null) return null;
  return value <= 10 ? value : Math.round((value / 100) * 10);
};

const toPercent = (value) => {
  if (value === null) return null;
  return value <= 10 ? clamp((value / 10) * 100) : clamp(value);
};

const readPercent = (fixture, keys) => toPercent(readNumber(fixture, keys));

const trendHigh = (fixture, keys) => {
  const text = readText(fixture, keys).toLocaleLowerCase("tr-TR");
  if (/(yüksek|yuksek|high|pozitif|evet|var)/i.test(text)) return true;
  const value = readPercent(fixture, keys);
  return value !== null && value >= 65;
};

const flag = (fixture, keys) => {
  const text = readText(fixture, keys).toLocaleLowerCase("tr-TR");
  return /(true|1|evet|var|yüksek|yuksek|kritik|derbi|belirsiz|kapalı|kapali)/i.test(text);
};

const teams = (fixture) => ({
  home: String(fixture.home || fixture.home_team_name || fixture.ev_sahibi || "Ev sahibi").trim(),
  away: String(fixture.away || fixture.away_team_name || fixture.deplasman || "Deplasman").trim(),
});

const isCurrent = (fixture) => {
  const date = String(fixture.date || fixture.tarih || fixture.utc_date || "").slice(0, 10);
  return Boolean(date) && date >= trDate();
};

const classFor = (score) => {
  if (score >= 80) return "Ana kupon adayı";
  if (score >= 65) return "Orta risk kupon adayı";
  if (score >= 40) return "Sadece izleme";
  return "Oynama";
};

const gapRisk = (missing) => {
  if (missing >= 8) return "Yüksek";
  if (missing >= 4) return "Orta";
  return "Düşük";
};

const cleanKey = (value) => String(value || "")
  .toLocaleLowerCase("tr-TR")
  .replace(/ı/g, "i")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const readJson = (filePath, fallback) => {
  try {
    const text = fs.readFileSync(filePath, "utf8").trim();
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
};

const loadMemory = () => {
  if (memoryCache) return memoryCache;
  memoryCache = readJson(archivePath, { matches: [], team_index: {} });
  if (!Array.isArray(memoryCache.matches)) memoryCache.matches = [];
  if (!memoryCache.team_index || typeof memoryCache.team_index !== "object") memoryCache.team_index = {};
  return memoryCache;
};

const parseScore = (match) => {
  const homeScore = Number(match?.homeScore ?? match?.home_score ?? match?.homeGoals ?? match?.home_goals);
  const awayScore = Number(match?.awayScore ?? match?.away_score ?? match?.awayGoals ?? match?.away_goals);
  if (Number.isFinite(homeScore) && Number.isFinite(awayScore)) return { home: homeScore, away: awayScore };
  const raw = match.score || match.result || match.result_score || "";
  const found = String(raw).match(/(\d+)\D+(\d+)/);
  if (!found) return null;
  return { home: Number(found[1]), away: Number(found[2]) };
};

const indexedTeam = (teamName) => {
  if (!teamIndexCache) {
    teamIndexCache = new Map();
    Object.values(loadMemory().team_index || {}).forEach((item) => {
      const key = cleanKey(item?.team);
      if (key) teamIndexCache.set(key, item);
    });
  }
  return teamIndexCache.get(cleanKey(teamName)) || null;
};

const archiveLookups = () => {
  if (archiveLookupCache) return archiveLookupCache;
  const teamsByKey = new Map();
  const leaguesByKey = new Map();
  const append = (map, key, match) => {
    if (!key) return;
    const rows = map.get(key) || [];
    rows.push(match);
    map.set(key, rows);
  };
  loadMemory().matches.forEach((match) => {
    const homeKey = cleanKey(match.home || match.home_team_name);
    const awayKey = cleanKey(match.away || match.away_team_name);
    append(teamsByKey, homeKey, match);
    if (awayKey !== homeKey) append(teamsByKey, awayKey, match);
    append(leaguesByKey, cleanKey(match.league || match.competition_name), match);
  });
  archiveLookupCache = { teamsByKey, leaguesByKey };
  return archiveLookupCache;
};

const teamRecentMatches = (teamName) => {
  const key = cleanKey(teamName);
  if (!key) return [];
  return (archiveLookups().teamsByKey.get(key) || []).slice(-10);
};

const teamProfile = (teamName) => {
  const key = cleanKey(teamName);
  if (teamProfileCache.has(key)) return teamProfileCache.get(key);
  const indexed = indexedTeam(teamName);
  const indexedRows = Array.isArray(indexed?.recent) ? indexed.recent.slice(-10) : [];
  const rows = indexedRows.length ? indexedRows : teamRecentMatches(teamName);
  let count = 0;
  let scored = 0;
  let conceded = 0;
  let btts = 0;
  let over25 = 0;
  let over35 = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;
  let wins = 0;
  let draws = 0;
  let losses = 0;

  rows.forEach((match) => {
    const score = parseScore(match);
    const indexedResult = String(match?.result || "").toUpperCase();
    if (!score && !/[WDL]/.test(indexedResult)) return;
    const isIndexedRow = indexedRows.length > 0;
    const isHome = cleanKey(match.home || match.home_team_name) === key;
    const gf = score ? (isIndexedRow || isHome ? score.home : score.away) : null;
    const ga = score ? (isIndexedRow || isHome ? score.away : score.home) : null;
    count += 1;
    if (gf !== null && ga !== null) {
      goalsFor += gf;
      goalsAgainst += ga;
      if (gf > 0) scored += 1;
      if (ga > 0) conceded += 1;
      if (gf > 0 && ga > 0) btts += 1;
      if (gf + ga >= 3) over25 += 1;
      if (gf + ga >= 4) over35 += 1;
      if (gf > ga) wins += 1;
      else if (gf === ga) draws += 1;
      else losses += 1;
    } else if (indexedResult === "W") wins += 1;
    else if (indexedResult === "D") draws += 1;
    else if (indexedResult === "L") losses += 1;
  });

  if (!count && Number(indexed?.finished) > 0) {
    count = Number(indexed.finished);
    wins = Number(indexed.wins || 0);
    draws = Number(indexed.draws || 0);
    losses = Number(indexed.losses || 0);
    goalsFor = Number(indexed.goals_for || 0);
    goalsAgainst = Number(indexed.goals_against || 0);
  }

  const profile = {
    count,
    scored,
    conceded,
    bttsRate: count ? Math.round((btts / count) * 100) : 0,
    over25Rate: count ? Math.round((over25 / count) * 100) : 0,
    over35Rate: count ? Math.round((over35 / count) * 100) : 0,
    goalsForAvg: count ? Number((goalsFor / count).toFixed(2)) : 0,
    goalsAgainstAvg: count ? Number((goalsAgainst / count).toFixed(2)) : 0,
    wins,
    draws,
    losses,
    winRate: count ? Math.round((wins / count) * 100) : 0,
    drawRate: count ? Math.round((draws / count) * 100) : 0,
    lossRate: count ? Math.round((losses / count) * 100) : 0,
    pointsPerGame: count ? Number((((wins * 3) + draws) / count).toFixed(2)) : 0,
  };
  teamProfileCache.set(key, profile);
  return profile;
};

const leagueProfile = (fixture) => {
  const league = cleanKey(fixture.league || fixture.competition_name);
  if (leagueProfileCache.has(league)) return leagueProfileCache.get(league);
  const rows = league ? (archiveLookups().leaguesByKey.get(league) || []).slice(-30) : [];
  let count = 0;
  let totalGoals = 0;
  let btts = 0;
  let over25 = 0;

  rows.forEach((match) => {
    const score = parseScore(match);
    if (!score) return;
    count += 1;
    totalGoals += score.home + score.away;
    if (score.home > 0 && score.away > 0) btts += 1;
    if (score.home + score.away >= 3) over25 += 1;
  });

  const profile = {
    count,
    goalAverage: count ? Number((totalGoals / count).toFixed(2)) : 0,
    bttsRate: count ? Math.round((btts / count) * 100) : 0,
    over25Rate: count ? Math.round((over25 / count) * 100) : 0,
  };
  leagueProfileCache.set(league, profile);
  return profile;
};

const memoryFor = (fixture, candidate = null) => {
  const t = teams(fixture);
  const home = teamProfile(t.home);
  const away = teamProfile(t.away);
  const league = leagueProfile(fixture);
  const totalMatches = home.count + away.count + league.count;
  let delta = 0;
  const signals = [];
  const key = candidate?.key || "";
  const isBtts = ["kgVar", "kgYok", "firstHalfBttsYes", "firstHalfBttsNo", "secondHalfBttsYes", "secondHalfBttsNo"].includes(key);
  const isGoals = ["over15", "over25", "under25", "over35", "homeGoal", "awayGoal"].includes(key);
  const isMatchResult = ["ms1", "msx", "ms2"].includes(key);

  if (home.count >= 3 && away.count >= 3) {
    const avgBtts = Math.round((home.bttsRate + away.bttsRate) / 2);
    const avgOver25 = Math.round((home.over25Rate + away.over25Rate) / 2);
    const avgOver35 = Math.round((home.over35Rate + away.over35Rate) / 2);

    if (["kgVar", "firstHalfBttsYes", "secondHalfBttsYes"].includes(key) && avgBtts >= 60) {
      delta += 8;
      signals.push(`Hafıza: KG Var eğilimi yüksek (%${avgBtts}): +8`);
    }
    if (["kgYok", "firstHalfBttsNo", "secondHalfBttsNo"].includes(key) && avgBtts <= 40) {
      delta += 8;
      signals.push(`Hafıza: KG Yok eğilimi destekli (%${100 - avgBtts}): +8`);
    }
    if (key === "over25" && avgOver25 >= 55) {
      delta += 8;
      signals.push(`Hafıza: 2.5 Üst eğilimi yüksek (%${avgOver25}): +8`);
    }
    if (key === "under25" && avgOver25 <= 45) {
      delta += 8;
      signals.push(`Hafıza: 2.5 Alt eğilimi destekli (%${100 - avgOver25}): +8`);
    }
    if (key === "over35" && avgOver35 >= 40) {
      delta += 6;
      signals.push(`Hafıza: 3.5 Üst eğilimi destekli (%${avgOver35}): +6`);
    }
    if (key === "homeGoal" && home.scored >= Math.ceil(home.count * 0.6) && away.conceded >= Math.ceil(away.count * 0.5)) {
      delta += 6;
      signals.push("Hafıza: ev golü takım profilleriyle destekleniyor: +6");
    }
    if (key === "awayGoal" && away.scored >= Math.ceil(away.count * 0.6) && home.conceded >= Math.ceil(home.count * 0.5)) {
      delta += 6;
      signals.push("Hafıza: deplasman golü takım profilleriyle destekleniyor: +6");
    }
    if (isMatchResult) {
      const formEdge = home.pointsPerGame - away.pointsPerGame;
      if (key === "ms1" && formEdge >= 0.55) { delta += 7; signals.push(`Hafıza: ev sahibi form puanında önde (${home.pointsPerGame}-${away.pointsPerGame}): +7`); }
      if (key === "ms2" && formEdge <= -0.55) { delta += 7; signals.push(`Hafıza: deplasman form puanında önde (${away.pointsPerGame}-${home.pointsPerGame}): +7`); }
      if (key === "msx" && Math.abs(formEdge) <= 0.25 && home.drawRate >= 25 && away.drawRate >= 25) {
        delta += 6;
        signals.push("Hafıza: dengeli form ve beraberlik oranları MS X'i destekliyor: +6");
      }
    }
  }

  if (league.count >= 8) {
    if (isGoals && key !== "under25" && league.goalAverage >= 2.7) { delta += 5; signals.push(`Hafıza: lig gol ortalaması ${league.goalAverage}: +5`); }
    if (key === "under25" && league.goalAverage > 0 && league.goalAverage <= 2.35) { delta += 5; signals.push(`Hafıza: düşük lig gol ortalaması ${league.goalAverage}: +5`); }
    if (league.bttsRate >= 60 && ["kgVar", "firstHalfBttsYes", "secondHalfBttsYes"].includes(key)) { delta += 4; signals.push(`Hafıza: lig KG Var oranı %${league.bttsRate}: +4`); }
    if (league.bttsRate <= 40 && ["kgYok", "firstHalfBttsNo", "secondHalfBttsNo"].includes(key)) { delta += 4; signals.push(`Hafıza: lig KG Yok oranı %${100 - league.bttsRate}: +4`); }
  }

  if ((isBtts || isGoals || isMatchResult) && home.count + away.count < 6) signals.push("Hafıza: takım sonuç örneği henüz sınırlı");

  return {
    scoreDelta: Math.max(-8, Math.min(12, delta)),
    totalMatches,
    home,
    away,
    league,
    signals,
  };
};

const riskyContext = (fixture) => {
  const t = teams(fixture);
  const text = `${fixture.league || fixture.competition_name || ""} ${t.home} ${t.away} ${readText(fixture, ["matchImportance", "mac_onemi", "risk_note", "belirsizlik_notu"])}`.toLocaleLowerCase("tr-TR");
  return /derbi|kritik|belirsiz|final|yarı final|yari final|playoff|play-off|küme|kume/.test(text)
    || flag(fixture, ["isCritical", "criticalMatch", "isDerby", "derby", "uncertainMatch", "veryUncertain", "mac_kritik", "mac_belirsiz"]);
};

const closedDefense = (fixture) => flag(fixture, [
  "closedDefense", "kapaliSavunma", "kapalı_savunma", "homeClosedDefense", "awayClosedDefense", "defensiveStyle", "savunma_oyunu"
]);

const marketRules = {
  ms1: { label: "MS 1", keys: ["ms1", "homeWin", "home_win", "macSonucu1", "ms_1"], minOdd: 1.25, maxOdd: 6.50, scores: ["1-0", "2-0", "2-1"] },
  msx: { label: "MS X", keys: ["msx", "draw", "beraberlik", "macSonucuX", "ms_x"], minOdd: 2.20, maxOdd: 5.80, scores: ["0-0", "1-1", "2-2"] },
  ms2: { label: "MS 2", keys: ["ms2", "awayWin", "away_win", "macSonucu2", "ms_2"], minOdd: 1.25, maxOdd: 7.50, scores: ["0-1", "0-2", "1-2"] },

  firstHalfBttsYes: { label: "İlk Yarı KG Var", keys: ["firstHalfBttsYes", "iyKgVar", "iy_kg_var", "first_half_btts_yes", "firstHalfBttsYes_guess"], minOdd: 1.85, maxOdd: 5.50, scores: ["1-1", "2-1"] },
  firstHalfBttsNo: { label: "İlk Yarı KG Yok", keys: ["firstHalfBttsNo", "iyKgYok", "iy_kg_yok", "first_half_btts_no", "firstHalfBttsNo_guess"], minOdd: 1.35, maxOdd: 4.50, scores: ["0-0", "1-0"] },
  secondHalfBttsYes: { label: "İkinci Yarı KG Var", keys: ["secondHalfBttsYes", "ikinciYariKgVar", "ikinci_yari_kg_var", "second_half_btts_yes", "secondHalfBttsYes_guess"], minOdd: 1.75, maxOdd: 5.25, scores: ["2-1", "2-2"] },
  secondHalfBttsNo: { label: "İkinci Yarı KG Yok", keys: ["secondHalfBttsNo", "ikinciYariKgYok", "ikinci_yari_kg_yok", "second_half_btts_no", "secondHalfBttsNo_guess"], minOdd: 1.35, maxOdd: 4.50, scores: ["1-0", "0-1"] },
  kgVar: { label: "KG Var", keys: ["bttsYes", "kgVar", "varOdd", "var", "kg_var", "bttsYes_guess"], minOdd: 1.60, maxOdd: 3.80, scores: ["1-1", "2-1", "2-2"] },
  kgYok: { label: "KG Yok", keys: ["bttsNo", "kgYok", "yokOdd", "yok", "kg_yok", "bttsNo_guess"], minOdd: 1.45, maxOdd: 4.20, scores: ["1-0", "0-1", "2-0"] },
  over15: { label: "1.5 Üst", keys: ["over15", "ust15", "over1_5", "ust_15", "over15_guess"], minOdd: 1.20, maxOdd: 2.80, scores: ["1-1", "2-0", "2-1"] },
  homeGoal: { label: "Ev Sahibi Gol Atar", keys: ["homeGoalYes", "homeScores", "home_to_score", "evGolAtar", "ev_sahibi_gol_atar", "homeGoalYes_guess"], minOdd: 1.20, maxOdd: 3.80, scores: ["1-0", "1-1", "2-1"] },
  awayGoal: { label: "Deplasman Gol Atar", keys: ["awayGoalYes", "awayScores", "away_to_score", "depGolAtar", "deplasman_gol_atar", "awayGoalYes_guess"], minOdd: 1.20, maxOdd: 3.80, scores: ["0-1", "1-1", "1-2"] },
  over25: { label: "2.5 Üst", keys: ["over25", "ust25", "over", "ust", "ust_25", "over25_guess"], minOdd: 1.58, maxOdd: 3.20, scores: ["2-1", "3-1", "2-2"] },
  under25: { label: "2.5 Alt", keys: ["under25", "alt25", "under", "alt", "alt_25", "under25_guess"], minOdd: 1.35, maxOdd: 3.20, scores: ["0-0", "1-0", "1-1"] },
  over35: { label: "3.5 Üst", keys: ["over35", "ust35", "over3_5", "ust_35", "over35_guess"], minOdd: 1.90, maxOdd: 5.80, scores: ["3-1", "2-2", "3-2"] },
};

const oddEntryFor = (fixture, keys) => {
  const sources = [
    { value: fixture, source: "standard" },
    { value: fixture?.available_odds, source: "standard" },
    { value: fixture?.odds, source: "standard" },
    { value: fixture?.oranlar, source: "standard" },
    { value: fixture?.detay_oranlar, source: "detail" },
    { value: fixture?.raw_market_guess_odds, source: "raw_market_guess_odds" },
    { value: fixture?.analysis, source: "analysis" },
    { value: fixture?.stats, source: "stats" },
  ];
  for (const row of sources) {
    for (const key of keys) {
      const odd = parseOdd(row.value?.[key]);
      if (odd) return { odd, source: row.source, key };
    }
  }
  return null;
};

const oddFor = (fixture, keys) => oddEntryFor(fixture, keys)?.odd || null;

const meanKnown = (values) => {
  const known = values.filter((value) => Number.isFinite(value));
  return known.length ? known.reduce((sum, value) => sum + value, 0) / known.length : null;
};

const normalizeProbabilitySet = (entries, target) => {
  if (!entries.length || entries.some((entry) => !entry?.odd)) return null;
  const total = entries.reduce((sum, entry) => sum + (1 / entry.odd), 0);
  const selected = entries.find((entry) => entry.key === target);
  if (!selected || !total) return null;
  return {
    probability: (1 / selected.odd / total) * 100,
    complete: true,
    source: entries.some((entry) => entry.source === "raw_market_guess_odds") ? "raw_market_guess_odds" : "standard",
  };
};

const fairProbabilityFor = (fixture, key, selectedEntry) => {
  if (["ms1", "msx", "ms2"].includes(key)) {
    return normalizeProbabilitySet(["ms1", "msx", "ms2"].map((item) => ({
      key: item,
      ...oddEntryFor(fixture, marketRules[item].keys),
    })), key);
  }

  const pairMap = {
    over25: ["under25", marketRules.under25.keys],
    under25: ["over25", marketRules.over25.keys],
    kgVar: ["kgYok", marketRules.kgYok.keys],
    kgYok: ["kgVar", marketRules.kgVar.keys],
    firstHalfBttsYes: ["firstHalfBttsNo", marketRules.firstHalfBttsNo.keys],
    firstHalfBttsNo: ["firstHalfBttsYes", marketRules.firstHalfBttsYes.keys],
    secondHalfBttsYes: ["secondHalfBttsNo", marketRules.secondHalfBttsNo.keys],
    secondHalfBttsNo: ["secondHalfBttsYes", marketRules.secondHalfBttsYes.keys],
    over15: ["under15", ["under15", "alt15", "under1_5", "alt_15", "under15_guess"]],
    over35: ["under35", ["under35", "alt35", "under3_5", "alt_35", "under35_guess"]],
  };
  const pair = pairMap[key];
  if (pair) {
    const paired = oddEntryFor(fixture, pair[1]);
    // oddEntryFor also returns the physical source key (for example bttsYes).
    // Keep the model market key (kgVar/kgYok) authoritative here; otherwise the
    // spread overwrites it and an existing opposite odd is treated as missing.
    const normalized = normalizeProbabilitySet([
      { ...selectedEntry, key },
      { ...paired, key: pair[0] },
    ], key);
    if (normalized) return normalized;
  }

  if (!selectedEntry?.odd) return null;
  return {
    probability: clamp((1 / selectedEntry.odd) * 100, 5, 95),
    complete: false,
    source: selectedEntry.source || "single_odd",
  };
};

const poissonMass = (lambda, goals) => {
  let factorial = 1;
  for (let index = 2; index <= goals; index += 1) factorial *= index;
  return (Math.exp(-lambda) * (lambda ** goals)) / factorial;
};

const poissonProbabilities = (fixture, memory, metrics) => {
  const { home, away } = memory;
  if (home.count < 3 || away.count < 3) return null;
  const leagueAverage = memory.league.goalAverage > 0
    ? memory.league.goalAverage
    : metrics.leagueGoalAverage > 0 ? metrics.leagueGoalAverage : 2.6;
  const baseline = clamp(leagueAverage / 2, 0.8, 1.8);
  const shrink = (value, count) => baseline + ((value - baseline) * (count / (count + 5)));
  const homeAttack = shrink(home.goalsForAvg, home.count);
  const homeDefence = shrink(home.goalsAgainstAvg, home.count);
  const awayAttack = shrink(away.goalsForAvg, away.count);
  const awayDefence = shrink(away.goalsAgainstAvg, away.count);
  const homeLambda = clamp(((homeAttack + awayDefence) / 2) * 1.08, 0.2, 3.6);
  const awayLambda = clamp(((awayAttack + homeDefence) / 2) * 0.92, 0.2, 3.6);
  const result = { ms1: 0, msx: 0, ms2: 0, over15: 0, over25: 0, under25: 0, over35: 0, kgVar: 0, kgYok: 0, homeGoal: 0, awayGoal: 0 };
  let mass = 0;
  for (let homeGoals = 0; homeGoals <= 8; homeGoals += 1) {
    for (let awayGoals = 0; awayGoals <= 8; awayGoals += 1) {
      const probability = poissonMass(homeLambda, homeGoals) * poissonMass(awayLambda, awayGoals);
      mass += probability;
      if (homeGoals > awayGoals) result.ms1 += probability;
      else if (homeGoals === awayGoals) result.msx += probability;
      else result.ms2 += probability;
      const total = homeGoals + awayGoals;
      if (total >= 2) result.over15 += probability;
      if (total >= 3) result.over25 += probability;
      else result.under25 += probability;
      if (total >= 4) result.over35 += probability;
      if (homeGoals > 0 && awayGoals > 0) result.kgVar += probability;
      else result.kgYok += probability;
      if (homeGoals > 0) result.homeGoal += probability;
      if (awayGoals > 0) result.awayGoal += probability;
    }
  }
  if (!mass) return null;
  Object.keys(result).forEach((key) => { result[key] = (result[key] / mass) * 100; });
  return {
    probabilities: result,
    homeLambda: Number(homeLambda.toFixed(2)),
    awayLambda: Number(awayLambda.toFixed(2)),
    samples: home.count + away.count,
    reliability: clamp((home.count + away.count) / 16, 0.25, 1),
  };
};

const metricReliability = (fixture) => {
  const quality = cleanKey(fixture?.metric_quality || fixture?.metric_source || "");
  if (/proxy|odds|tahmin|inferred/.test(quality)) return 0;
  if (/archive|verified|real|form|history|gercek|doğrulan|dogrulan/.test(quality)) return 1;
  return 0.45;
};

const formProbabilities = (memory) => {
  const { home, away } = memory;
  if (home.count + away.count < 6) return null;
  const values = {
    ms1: ((home.winRate + away.lossRate) / 2) + 4,
    msx: (home.drawRate + away.drawRate) / 2,
    ms2: Math.max(1, ((away.winRate + home.lossRate) / 2) - 1),
  };
  const total = values.ms1 + values.msx + values.ms2;
  if (!total) return null;
  Object.keys(values).forEach((key) => { values[key] = (values[key] / total) * 100; });
  return { values, reliability: clamp((home.count + away.count) / 16, 0.25, 1) };
};

const independentProbabilityFor = (fixture, key, metrics, memory) => {
  const poisson = poissonProbabilities(fixture, memory, metrics);
  const form = formProbabilities(memory);
  const values = [];
  const add = (value, weight, source) => {
    if (Number.isFinite(value) && weight > 0) values.push({ value: clamp(value, 1, 99), weight, source });
  };
  const directWeight = metricReliability(fixture);
  const teamReliability = clamp((memory.home.count + memory.away.count) / 16, 0, 1);

  if (["ms1", "msx", "ms2"].includes(key)) {
    add(form?.values?.[key], form?.reliability || 0, "takım formu");
    add(poisson?.probabilities?.[key], poisson ? poisson.reliability * 0.75 : 0, "Poisson gol modeli");
  } else if (["over15", "over25", "under25", "over35", "kgVar", "kgYok", "homeGoal", "awayGoal"].includes(key)) {
    add(poisson?.probabilities?.[key], poisson?.reliability || 0, "Poisson gol modeli");
    if (key === "over25") add(metrics.over25Percent, directWeight, "2.5 üst metriği");
    if (key === "under25") add(Number.isFinite(metrics.over25Percent) ? 100 - metrics.over25Percent : null, directWeight, "2.5 alt metriği");
    if (key === "over35") add(metrics.over35Percent, directWeight, "3.5 üst metriği");
    if (key === "kgVar") add(metrics.bttsPercent, directWeight, "KG metriği");
    if (key === "kgYok") add(Number.isFinite(metrics.bttsPercent) ? 100 - metrics.bttsPercent : null, directWeight, "KG yok metriği");
    if (key === "homeGoal") add(meanKnown([toPercent(metrics.homeScoredLast10), toPercent(metrics.awayConcededLast10)]), directWeight, "ev gol profili");
    if (key === "awayGoal") add(meanKnown([toPercent(metrics.awayScoredLast10), toPercent(metrics.homeConcededLast10)]), directWeight, "deplasman gol profili");
    const over25Memory = meanKnown(memory.home.count && memory.away.count ? [memory.home.over25Rate, memory.away.over25Rate] : []);
    const bttsMemory = meanKnown(memory.home.count && memory.away.count ? [memory.home.bttsRate, memory.away.bttsRate] : []);
    const homeAwayRate = key === "over25" ? over25Memory
      : key === "under25" ? (over25Memory === null ? null : 100 - over25Memory)
        : key === "over35" ? meanKnown(memory.home.count && memory.away.count ? [memory.home.over35Rate, memory.away.over35Rate] : [])
          : key === "kgVar" ? bttsMemory
            : key === "kgYok" ? (bttsMemory === null ? null : 100 - bttsMemory) : null;
    add(homeAwayRate, teamReliability, "sonuç hafızası");
  } else if (["firstHalfBttsYes", "firstHalfBttsNo"].includes(key)) {
    const value = metrics.firstHalfGoalTrend;
    add(key.endsWith("Yes") ? value : Number.isFinite(value) ? 100 - value : null, directWeight * 0.35, "ilk yarı eğilimi");
  } else if (["secondHalfBttsYes", "secondHalfBttsNo"].includes(key)) {
    const value = metrics.secondHalfGoalTrend;
    add(key.endsWith("Yes") ? value : Number.isFinite(value) ? 100 - value : null, directWeight * 0.35, "ikinci yarı eğilimi");
  }

  const totalWeight = values.reduce((sum, item) => sum + item.weight, 0);
  if (!totalWeight) return { probability: null, reliability: 0, sources: [], poisson };
  return {
    probability: values.reduce((sum, item) => sum + (item.value * item.weight), 0) / totalWeight,
    reliability: clamp(totalWeight / 2.2, 0.1, 1),
    sources: values.map((item) => item.source),
    poisson,
  };
};

const modelPriorFor = (key) => {
  const row = loadMemory().model_weights?.markets?.[key];
  if (!row || !Number.isFinite(Number(row.samples))) return null;
  return {
    samples: Number(row.samples),
    hitRate: Number(row.hit_rate),
    weight: clamp(Number(row.weight || 0), -8, 8),
  };
};

const dataGapForQuality = (quality) => quality < 35 ? "Yüksek" : quality < 60 ? "Orta" : "Düşük";

const riskForAnalysis = (score, probability, odd, quality, forcedHigh) => {
  if (forcedHigh || quality < 35 || probability < 40 || odd >= 3.25) return "Yüksek";
  if (score >= 75 && probability >= 58 && quality >= 65 && odd <= 2.15) return "Düşük";
  return "Orta";
};

const metricsFor = (fixture) => ({
  homeScoredLast10: readNumber(fixture, ["homeScoredLast10", "homeScoredLast10Percent", "home_scored_last10", "home_scored_last10_pct", "ev_son10_gol_atti", "ev_son10_gol_attı"]),
  awayScoredLast10: readNumber(fixture, ["awayScoredLast10", "awayScoredLast10Percent", "away_scored_last10", "away_scored_last10_pct", "dep_son10_gol_atti", "dep_son10_gol_attı"]),
  homeConcededLast10: readNumber(fixture, ["homeConcededLast10", "homeConcededLast10Percent", "home_conceded_last10", "home_conceded_last10_pct", "ev_son10_gol_yedi"]),
  awayConcededLast10: readNumber(fixture, ["awayConcededLast10", "awayConcededLast10Percent", "away_conceded_last10", "away_conceded_last10_pct", "dep_son10_gol_yedi"]),
  bttsPercent: readPercent(fixture, ["bttsPercent", "kg_var_yuzdesi", "kgVarPercent", "btts_pct"]),
  over25Percent: readPercent(fixture, ["over25Percent", "ust25_yuzdesi", "over_25_pct", "ust_25_yuzdesi"]),
  over35Percent: readPercent(fixture, ["over35Percent", "ust35_yuzdesi", "over_35_pct", "ust_35_yuzdesi"]),
  firstHalfGoalTrend: readPercent(fixture, ["firstHalfGoalTrend", "ilk_yari_gol_egilimi", "iy_gol_egilimi", "first_half_goal_pct"]),
  secondHalfGoalTrend: readPercent(fixture, ["secondHalfGoalTrend", "ikinci_yari_gol_egilimi", "second_half_goal_pct"]),
  leagueGoalAverage: readNumber(fixture, ["leagueGoalAverage", "lig_gol_ortalamasi", "league_goal_avg", "lig_gol_avg"]),
});

const buildMatchAnalysis = (fixture, candidate = null) => {
  const m = metricsFor(fixture);
  const memory = memoryFor(fixture, candidate);
  if (!candidate) {
    return {
      analysis_score: 0,
      analysis_class: "Oynama",
      value_label: "Değerli market yok",
      data_gap_risk: "Yüksek",
      data_missing_count: Object.values(m).filter((value) => value === null).length,
      data_completeness: 0,
      estimated_probability: null,
      market_probability: null,
      edge_percent: null,
      model_version: MODEL_VERSION,
      score_type: "signal_strength",
      metrics: { ...m, memory },
      signals: ["Markete özel olasılık ve veri doğrulaması oluşmadı."],
    };
  }

  const fair = fairProbabilityFor(fixture, candidate.key, candidate.entry);
  const independent = independentProbabilityFor(fixture, candidate.key, m, memory);
  const prior = modelPriorFor(candidate.key);
  const fairProbability = fair?.probability ?? null;
  const independentProbability = independent.probability;
  const blendWeight = independentProbability === null ? 0 : clamp(0.15 + (independent.reliability * 0.3), 0.15, 0.45);
  const estimatedProbability = fairProbability !== null && independentProbability !== null
    ? (fairProbability * (1 - blendWeight)) + (independentProbability * blendWeight)
    : independentProbability ?? fairProbability;
  const agreement = fairProbability !== null && independentProbability !== null
    ? clamp(100 - Math.abs(fairProbability - independentProbability), 0, 100)
    : estimatedProbability !== null ? 55 : 0;
  const oddsQuality = fair?.complete ? (fair.source === "standard" ? 35 : 18) : fairProbability !== null ? 8 : 0;
  const historyQuality = clamp((memory.home.count + memory.away.count) * 1.5, 0, 20);
  const independentQuality = independentProbability === null ? 0 : independent.reliability * 30;
  const priorQuality = prior?.samples >= 50 ? 5 : prior ? 3 : 0;
  const dataCompleteness = Math.round(clamp(oddsQuality + historyQuality + independentQuality + priorQuality, 0, 100));
  const hasIndependentEvidence = independentProbability !== null && independent.sources.length > 0;
  const edge = fairProbability !== null && estimatedProbability !== null ? estimatedProbability - fairProbability : null;
  let score = estimatedProbability === null ? 0
    : 32 + (Math.max(0, estimatedProbability - 35) * 0.5) + (dataCompleteness * 0.25) + (agreement * 0.12) + (Math.max(0, edge || 0) * 0.45);
  score += memory.scoreDelta * 0.45;
  if (prior) score += prior.weight * 0.5;
  const signals = [];
  if (fairProbability !== null) signals.push(`Marjı temizlenmiş piyasa olasılığı %${Math.round(fairProbability)}.`);
  if (independentProbability !== null) signals.push(`Bağımsız ${independent.sources.join(" + ")} tahmini %${Math.round(independentProbability)}.`);
  if (estimatedProbability !== null) signals.push(`Birleşik tahmini olasılık %${Math.round(estimatedProbability)}.`);
  if (edge !== null) signals.push(`Model-piyasa farkı ${edge >= 0 ? "+" : ""}${edge.toFixed(1)} puan.`);
  if (independent.poisson) signals.push(`Poisson gol beklentisi ${independent.poisson.homeLambda}-${independent.poisson.awayLambda}.`);
  signals.push(...memory.signals.slice(0, 2));
  if (prior?.samples) signals.push(`Geçmiş market örneği ${prior.samples}; ham isabet %${Math.round(prior.hitRate * 100)}.`);
  if (candidate.entry.source === "raw_market_guess_odds") {
    score -= 6;
    signals.push("Market oranı ham tahmin bloğundan geldi; güven sınırlandı.");
  }
  if (!fair?.complete) {
    score -= 5;
    signals.push("Karşı market oranı eksik; marj kontrolü tamamlanamadı.");
  }
  if (!hasIndependentEvidence) {
    score = Math.min(score, 64);
    signals.push("Bağımsız form/gol örneği yok; çıktı piyasa tabanı olarak sınırlandı.");
  }
  if (riskyContext(fixture)) { score -= 8; signals.push("Kritik/derbi/belirsiz maç nedeniyle model puanı düşürüldü."); }
  if (closedDefense(fixture) && ["over15", "over25", "over35", "kgVar"].includes(candidate.key)) {
    score -= 6;
    signals.push("Kapalı savunma sinyali gol marketi puanını düşürdü.");
  }
  score = Math.round(clamp(score, 0, 92));
  const valueLabel = hasIndependentEvidence && edge !== null && edge >= 7 && dataCompleteness >= 60 && estimatedProbability >= 45
    ? "Yüksek Değer"
    : hasIndependentEvidence && edge !== null && edge >= 3 && dataCompleteness >= 45 ? "Değerli" : "Piyasa ile Uyumlu";
  const klass = classFor(score);
  const dataRisk = hasIndependentEvidence ? dataGapForQuality(dataCompleteness) : "Yüksek";
  signals.push(`Veri kapsama puanı ${dataCompleteness}/100 (${dataRisk} eksik veri riski).`);
  signals.push(`Model gücü ${score}/100: ${klass}.`);

  return {
    analysis_score: score,
    analysis_class: klass,
    value_label: valueLabel,
    data_gap_risk: dataRisk,
    data_missing_count: Object.values(m).filter((value) => value === null).length,
    data_completeness: dataCompleteness,
    estimated_probability: estimatedProbability === null ? null : Number(estimatedProbability.toFixed(1)),
    market_probability: fairProbability === null ? null : Number(fairProbability.toFixed(1)),
    independent_probability: independentProbability === null ? null : Number(independentProbability.toFixed(1)),
    edge_percent: edge === null ? null : Number(edge.toFixed(1)),
    probability_source: independent.sources,
    evidence_mode: hasIndependentEvidence ? "market_plus_independent" : "market_baseline",
    independent_evidence: hasIndependentEvidence,
    model_version: MODEL_VERSION,
    score_type: "signal_strength",
    metrics: {
      ...m,
      memory,
      poisson: independent.poisson,
      homeScoredLast10Count: toCount(m.homeScoredLast10),
      awayScoredLast10Count: toCount(m.awayScoredLast10),
      homeConcededLast10Count: toCount(m.homeConcededLast10),
      awayConcededLast10Count: toCount(m.awayConcededLast10),
    },
    signals,
  };
};

const analysisMarketKey = (key) => ({
  kgVar: "bttsYes",
  kgYok: "bttsNo",
}[key] || key);

const analyzeMarket = (fixture, key) => {
  const rule = marketRules[key];
  if (!rule) return null;
  const entry = oddEntryFor(fixture, rule.keys);
  if (!entry?.odd) return null;
  const analysis = buildMatchAnalysis(fixture, { key, odd: entry.odd, entry });
  return {
    key: analysisMarketKey(key),
    model_key: key,
    label: rule.label,
    odd: entry.odd,
    odd_source_type: entry.source,
    model_score: analysis.analysis_score,
    analysis_class: analysis.analysis_class,
    estimated_probability: analysis.estimated_probability,
    market_probability: analysis.market_probability,
    independent_probability: analysis.independent_probability,
    edge_percent: analysis.edge_percent,
    data_completeness: analysis.data_completeness,
    data_gap_risk: analysis.data_gap_risk,
    independent_evidence: analysis.independent_evidence,
    evidence_mode: analysis.evidence_mode,
    probability_source: analysis.probability_source,
    risk: riskForAnalysis(
      analysis.analysis_score,
      analysis.estimated_probability,
      entry.odd,
      analysis.data_completeness,
      analysis.data_gap_risk === "Yüksek" || !analysis.independent_evidence,
    ),
    expected_scores: rule.scores,
    signals: analysis.signals,
    analysis,
  };
};

const compactMarketAnalysis = (item) => item ? ({
  key: item.key,
  label: item.label,
  odd: Number(item.odd.toFixed(2)),
  model_score: item.model_score,
  estimated_probability: item.estimated_probability,
  market_probability: item.market_probability,
  independent_probability: item.independent_probability,
  edge_percent: item.edge_percent,
  data_completeness: item.data_completeness,
  data_gap_risk: item.data_gap_risk,
  independent_evidence: item.independent_evidence,
  evidence_mode: item.evidence_mode,
  probability_source: item.probability_source,
  risk_level: item.risk,
  odd_source_type: item.odd_source_type,
  expected_scores: item.expected_scores,
  signals: item.signals.slice(0, 7),
}) : null;

const buildBttsAnalysis = (fixture) => {
  const yes = analyzeMarket(fixture, "kgVar");
  const no = analyzeMarket(fixture, "kgYok");
  const available = [yes, no].filter(Boolean);
  const pairComplete = Boolean(yes && no);
  const officialPair = pairComplete && available.every((item) => item.odd_source_type !== "raw_market_guess_odds");
  const ranked = available.slice().sort((a, b) =>
    Number(b.estimated_probability || 0) - Number(a.estimated_probability || 0)
      || b.model_score - a.model_score);
  const strongest = ranked[0] || null;
  const recommendation = officialPair
    && Number(strongest?.estimated_probability || 0) >= 54
    && Number(strongest?.data_completeness || 0) >= 35
    ? strongest : null;

  return {
    available: available.length > 0,
    pair_complete: pairComplete,
    trusted_odds: officialPair,
    market_group: "btts",
    market_group_label: "Karşılıklı Gol",
    recommended_key: recommendation?.key || "",
    recommended_market: recommendation?.label || "Görüş oluşmadı",
    recommendation_status: recommendation
      ? (recommendation.independent_evidence ? "model_analysis" : "market_baseline")
      : "insufficient_data",
    model_version: MODEL_VERSION,
    outcomes: {
      bttsYes: compactMarketAnalysis(yes),
      bttsNo: compactMarketAnalysis(no),
    },
  };
};

const candidateFor = (fixture, key, rule) => {
  const evaluated = analyzeMarket(fixture, key);
  if (!evaluated || evaluated.odd < rule.minOdd || evaluated.odd > rule.maxOdd) return null;
  const entry = { odd: evaluated.odd, source: evaluated.odd_source_type };
  const analysis = evaluated.analysis;
  const probabilityFloor = key === "msx" ? 27 : ["ms1", "ms2"].includes(key) ? 34 : 42;
  if (analysis.analysis_score < 42 || Number(analysis.estimated_probability || 0) < probabilityFloor) return null;
  if (entry.source === "raw_market_guess_odds" && analysis.data_completeness < 45) return null;
  return {
    key,
    label: rule.label,
    odd: entry.odd,
    confidence: analysis.analysis_score,
    estimated_probability: analysis.estimated_probability,
    market_probability: analysis.market_probability,
    edge_percent: analysis.edge_percent,
    data_completeness: analysis.data_completeness,
    model_version: MODEL_VERSION,
    risk: riskForAnalysis(analysis.analysis_score, analysis.estimated_probability, entry.odd, analysis.data_completeness, analysis.data_gap_risk === "Yüksek" || !analysis.independent_evidence),
    expected_scores: rule.scores,
    analysis,
    value_label: analysis.value_label,
    odd_source_type: entry.source,
    signals: [`Market: ${rule.label}`, `Oran: ${formatOdd(entry.odd)}`, `Veri tipi: ${entry.source}`, `Değer etiketi: ${analysis.value_label}`, ...analysis.signals],
  };
};

const candidatesFor = (fixture) => Object.entries(marketRules)
  .map(([key, rule]) => candidateFor(fixture, key, rule))
  .filter(Boolean)
  .sort((a, b) => b.confidence - a.confidence
    || b.data_completeness - a.data_completeness
    || b.estimated_probability - a.estimated_probability
    || a.odd - b.odd);

const emptyScore = (fixture, reason, status, extraSignals) => {
  const t = teams(fixture);
  const analysis = buildMatchAnalysis(fixture, null);
  return { ...fixture, home: t.home, away: t.away, match: `${t.home} VS ${t.away}`, market: reason, selection: reason, odds: "-", confidence: pct(analysis.analysis_score), lab_probability: "-", trust_score: `${analysis.analysis_score}/100`, tag: analysis.analysis_class, value_label: analysis.value_label, expected_scores: [], score: analysis.analysis_score, model_score: analysis.analysis_score, risk: "Yüksek", status, hasOdds: false, analysis_score: analysis.analysis_score, analysis_class: analysis.analysis_class, data_gap_risk: analysis.data_gap_risk, data_completeness: analysis.data_completeness, estimated_probability: null, market_probability: null, edge_percent: null, model_version: MODEL_VERSION, score_type: "signal_strength", analysis_metrics: analysis.metrics, pro_signals: [...extraSignals, ...analysis.signals] };
};

const scoreFixture = (fixture) => {
  if (!isCurrent(fixture)) return emptyScore(fixture, "Güncel maç değil", "filtered_old_fixture", ["Eski tarihli maç elendi"]);
  const best = candidatesFor(fixture)[0];
  if (!best) return emptyScore(fixture, "Değerli market yok", "filtered_no_value_market", ["Düşük oran veya eksik veri nedeniyle elendi", "Çifte şans kullanılmadı"]);
  const t = teams(fixture);
  const score = best.confidence;
  return { ...fixture, home: t.home, away: t.away, match: `${t.home} VS ${t.away}`, market: best.label, selection: best.label, odds: formatOdd(best.odd), confidence: pct(score), lab_probability: best.estimated_probability === null ? "-" : pct(best.estimated_probability), trust_score: `${score}/100`, tag: best.analysis.analysis_class, value_label: best.value_label, expected_scores: best.expected_scores, score, model_score: score, risk: best.risk, status: fixture.status || "scheduled", hasOdds: true, analysis_score: score, analysis_class: best.analysis.analysis_class, data_gap_risk: best.analysis.data_gap_risk, data_completeness: best.data_completeness, estimated_probability: best.estimated_probability, market_probability: best.market_probability, edge_percent: best.edge_percent, model_version: MODEL_VERSION, score_type: "signal_strength", probability_source: best.analysis.probability_source, evidence_mode: best.analysis.evidence_mode, independent_evidence: best.analysis.independent_evidence, analysis_metrics: best.analysis.metrics, odd_source_type: best.odd_source_type, pro_signals: best.signals };
};

const legFromItem = (item, number) => ({ number, home: item.home, away: item.away, match: item.match, date: item.date || "", time: item.time || "", league: item.league || item.competition_name || "", selection: item.selection || item.market, option: item.selection || item.market, odds: item.odds, lab_probability: item.lab_probability || "-", confidence: item.confidence, trust_score: item.trust_score, risk: item.risk, tag: item.tag, value_label: item.value_label, analysis_score: item.analysis_score, analysis_class: item.analysis_class, data_gap_risk: item.data_gap_risk, data_completeness: item.data_completeness, estimated_probability: item.estimated_probability, market_probability: item.market_probability, edge_percent: item.edge_percent, model_version: item.model_version || MODEL_VERSION, expected_scores: item.expected_scores || [], signals: item.pro_signals || [] });
const combinedOdds = (items) => items.reduce((acc, item) => acc * (parseOdd(item.odds) || 1), 1).toFixed(2);
const dataGapFor = (items) => items.some((item) => item.data_gap_risk === "Yüksek") ? "Yüksek" : items.some((item) => item.data_gap_risk === "Orta") ? "Orta" : "Düşük";
const valueFor = (items) => items.some((item) => item.value_label === "Yüksek Değer") ? "Yüksek Değer" : "Normal Değer";

const buildCouponAnalysis = (fixtures = []) => {
  const scored = fixtures.map(scoreFixture);
  const ranked = scored.filter((item) => item.hasOdds && item.score >= 65).sort((a, b) => b.score - a.score || (parseOdd(b.odds) || 0) - (parseOdd(a.odds) || 0)).slice(0, 14);
  const singles = ranked.slice(0, 6).map((item) => ({ match: item.match, market: item.market, odds: item.odds, confidence: item.confidence, score: item.score, risk: item.risk, tag: item.tag, value_label: item.value_label, analysis_score: item.analysis_score, analysis_class: item.analysis_class, data_gap_risk: item.data_gap_risk, data_completeness: item.data_completeness, estimated_probability: item.estimated_probability, market_probability: item.market_probability, edge_percent: item.edge_percent, model_version: item.model_version || MODEL_VERSION, expected_scores: item.expected_scores, signals: item.pro_signals, legs: [legFromItem(item, 1)] }));
  const doubles = [];
  const triples = [];
  const pool = ranked.filter((item) => parseOdd(item.odds) >= 1.60);

  for (let i = 0; i + 1 < pool.length && doubles.length < 3; i += 2) {
    const pair = [pool[i], pool[i + 1]];
    const score = Math.round(pair.reduce((sum, item) => sum + item.score, 0) / 2);
    const odd = parseOdd(combinedOdds(pair));
    if (!odd || odd < 2.40) continue;
    const combinedProbability = pair.every((item) => Number.isFinite(item.estimated_probability))
      ? Number((pair.reduce((total, item) => total * (item.estimated_probability / 100), 1) * 100).toFixed(1)) : null;
    doubles.push({ match: pair.map((item) => item.match).join(" + "), market: pair.map((item) => item.market).join(" + "), odds: odd.toFixed(2), confidence: pct(score), score, risk: pair.some((item) => item.risk === "Yüksek") ? "Yüksek" : "Orta", tag: classFor(score), value_label: valueFor(pair), analysis_score: score, analysis_class: classFor(score), data_gap_risk: dataGapFor(pair), data_completeness: Math.round(pair.reduce((sum, item) => sum + Number(item.data_completeness || 0), 0) / pair.length), estimated_probability: combinedProbability, model_version: MODEL_VERSION, expected_scores: pair.flatMap((item) => item.expected_scores || []).slice(0, 4), signals: pair.flatMap((item) => item.pro_signals || []).slice(0, 5), legs: pair.map((item, index) => legFromItem(item, index + 1)) });
  }

  for (let i = 0; i + 2 < pool.length && triples.length < 2; i += 3) {
    const trio = [pool[i], pool[i + 1], pool[i + 2]];
    const score = Math.round(trio.reduce((sum, item) => sum + item.score, 0) / 3);
    const odd = parseOdd(combinedOdds(trio));
    if (!odd || odd < 3.20) continue;
    const combinedProbability = trio.every((item) => Number.isFinite(item.estimated_probability))
      ? Number((trio.reduce((total, item) => total * (item.estimated_probability / 100), 1) * 100).toFixed(1)) : null;
    triples.push({ match: trio.map((item) => item.match).join(" + "), market: trio.map((item) => item.market).join(" + "), odds: odd.toFixed(2), confidence: pct(score), score, risk: "Yüksek", tag: classFor(score), value_label: valueFor(trio), analysis_score: score, analysis_class: classFor(score), data_gap_risk: dataGapFor(trio), data_completeness: Math.round(trio.reduce((sum, item) => sum + Number(item.data_completeness || 0), 0) / trio.length), estimated_probability: combinedProbability, model_version: MODEL_VERSION, expected_scores: trio.flatMap((item) => item.expected_scores || []).slice(0, 6), signals: trio.flatMap((item) => item.pro_signals || []).slice(0, 6), legs: trio.map((item, index) => legFromItem(item, index + 1)) });
  }

  return { scored, ranked, singles, doubles, triples };
};

module.exports = {
  MODEL_VERSION,
  analyzeMarket,
  buildBttsAnalysis,
  scoreFixture,
  buildCouponAnalysis,
  buildMatchAnalysis,
  memoryFor,
  _internals: {
    candidateFor,
    candidatesFor,
    fairProbabilityFor,
    independentProbabilityFor,
    poissonProbabilities,
  },
};
