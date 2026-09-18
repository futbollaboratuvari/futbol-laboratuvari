"use strict";

const fs = require("node:fs");
const path = require("node:path");
const {
  SOURCE_NAME,
  fetchIddaaBulletin,
  fetchIddaaEventDetail,
} = require("./iddaa-data-source");

const root = path.join(__dirname, "..");
const fixturesPath = path.join(root, "data", "fixtures.json");
const statusPath = path.join(root, "data", "iddaa-market-sync-status.json");

const DETAIL_LIMIT = Math.max(0, Math.min(60, Number(process.env.IDDAA_DETAIL_LIMIT || 24)));
const DETAIL_CONCURRENCY = Math.max(1, Math.min(8, Number(process.env.IDDAA_DETAIL_CONCURRENCY || 4)));
const DETAIL_TIMEOUT_MS = Math.max(3000, Math.min(15000, Number(process.env.IDDAA_DETAIL_TIMEOUT_MS || 7000)));

const VERIFIED_KEYS = Object.freeze([
  "ms1", "msx", "ms2",
  "under25", "over25",
  "under35", "over35",
  "bttsYes", "bttsNo",
  "firstHalfBttsYes", "firstHalfBttsNo",
  "secondHalfBttsYes", "secondHalfBttsNo",
  "halfBttsYesYes", "halfBttsYesNo", "halfBttsNoYes", "halfBttsNoNo",
  "goals6plus",
]);

const DETAIL_PRIORITY_KEYS = Object.freeze([
  "secondHalfBttsYes", "secondHalfBttsNo",
  "halfBttsYesYes", "halfBttsYesNo", "halfBttsNoYes", "halfBttsNoNo",
  "goals6plus",
]);

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
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
};

const fold = (value) => String(value || "")
  .toLocaleLowerCase("tr-TR")
  .replace(/ı/g, "i")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/\([^)]*\)/g, " ")
  .replace(/[^a-z0-9]+/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const STOP_TOKENS = new Set(["fc", "cf", "sc", "ac", "fk", "sk", "club", "kulubu", "spor", "futbol"]);

function teamTokens(value) {
  return fold(value).split(" ").filter((token) => token && !STOP_TOKENS.has(token));
}

function teamSimilarity(a, b) {
  const left = fold(a);
  const right = fold(b);
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (Math.min(left.length, right.length) >= 5 && (left.includes(right) || right.includes(left))) return 0.94;
  const aTokens = teamTokens(a);
  const bTokens = teamTokens(b);
  if (!aTokens.length || !bTokens.length) return 0;
  const aSet = new Set(aTokens);
  const bSet = new Set(bTokens);
  let intersection = 0;
  aSet.forEach((token) => { if (bSet.has(token)) intersection += 1; });
  const union = new Set([...aSet, ...bSet]).size || 1;
  const jaccard = intersection / union;
  const containment = intersection / Math.max(1, Math.min(aSet.size, bSet.size));
  return Math.max(jaccard, containment * 0.92);
}

function timeMinutes(value) {
  const match = String(value || "").match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return (Number(match[1]) * 60) + Number(match[2]);
}

function timeDistance(a, b) {
  const left = timeMinutes(a);
  const right = timeMinutes(b);
  return left === null || right === null ? 9999 : Math.abs(left - right);
}

function exactKey(item) {
  return [
    String(item?.date || "").slice(0, 10),
    fold(item?.home || item?.home_team_name),
    fold(item?.away || item?.away_team_name),
  ].join("|");
}

function candidateScore(fixture, official) {
  const dateA = String(fixture?.date || "").slice(0, 10);
  const dateB = String(official?.date || "").slice(0, 10);
  if (!dateA || dateA !== dateB) return null;
  const timeGap = timeDistance(fixture?.time, official?.time);
  if (timeGap > 10) return null;
  const homeScore = teamSimilarity(fixture?.home || fixture?.home_team_name, official?.home);
  const awayScore = teamSimilarity(fixture?.away || fixture?.away_team_name, official?.away);
  if (homeScore < 0.78 || awayScore < 0.78) return null;
  return {
    score: (homeScore + awayScore) / 2 - (timeGap * 0.003),
    homeScore,
    awayScore,
    timeGap,
  };
}

function findOfficialMatch(fixture, officialMatches, exactMap = null) {
  const index = exactMap || new Map(officialMatches.map((item) => [exactKey(item), item]));
  const exact = index.get(exactKey(fixture));
  if (exact) return exact;

  const candidates = officialMatches
    .map((official) => ({ official, quality: candidateScore(fixture, official) }))
    .filter((row) => row.quality)
    .sort((a, b) => b.quality.score - a.quality.score);

  if (!candidates.length || candidates[0].quality.score < 0.86) return null;
  if (candidates[1] && candidates[0].quality.score - candidates[1].quality.score < 0.08) return null;
  return candidates[0].official;
}

function verifiedOdds(value) {
  const result = {};
  const odds = value?.available_odds || value?.odds || {};
  VERIFIED_KEYS.forEach((key) => {
    const number = Number(odds[key]);
    if (Number.isFinite(number) && number > 1 && number < 1000) result[key] = Number(number.toFixed(2));
  });
  return result;
}

function mergeOfficialMarkets(fixture, official, stage = "bulletin") {
  const odds = verifiedOdds(official);
  if (!Object.keys(odds).length) return { ...fixture };
  const currentAvailable = fixture?.available_odds && typeof fixture.available_odds === "object" ? fixture.available_odds : {};
  const currentOdds = fixture?.odds && typeof fixture.odds === "object" ? fixture.odds : {};
  const sourceMap = fixture?.verified_market_sources && typeof fixture.verified_market_sources === "object"
    ? { ...fixture.verified_market_sources } : {};
  Object.keys(odds).forEach((key) => { sourceMap[key] = SOURCE_NAME; });
  return {
    ...fixture,
    ...odds,
    available_odds: { ...currentAvailable, ...odds },
    odds: { ...currentOdds, ...odds },
    iddaa_event_id: String(official?.iddaa_event_id || official?.id || fixture?.iddaa_event_id || ""),
    iddaa_market_count: Number(official?.iddaa_market_count || fixture?.iddaa_market_count || 0),
    iddaa_verified_at: new Date().toISOString(),
    iddaa_verified_stage: stage,
    oddsSource: SOURCE_NAME,
    odds_source: SOURCE_NAME,
    verified_market_sources: sourceMap,
    iddaa_verified_market_keys: [...new Set([...(fixture?.iddaa_verified_market_keys || []), ...Object.keys(odds)])].sort(),
  };
}

function marketCounts(fixtures) {
  const counts = Object.fromEntries(VERIFIED_KEYS.map((key) => [key, 0]));
  for (const fixture of fixtures) {
    const odds = fixture?.available_odds || {};
    const sources = fixture?.verified_market_sources || {};
    VERIFIED_KEYS.forEach((key) => {
      const value = Number(odds[key] ?? fixture?.[key]);
      if (sources[key] === SOURCE_NAME && Number.isFinite(value) && value > 1) counts[key] += 1;
    });
  }
  return counts;
}

function needsDetail(fixture) {
  const sources = fixture?.verified_market_sources || {};
  return DETAIL_PRIORITY_KEYS.some((key) => sources[key] !== SOURCE_NAME);
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      try {
        results[index] = await worker(items[index], index);
      } catch (error) {
        results[index] = { ok: false, error: String(error?.message || error) };
      }
    }
  });
  await Promise.all(runners);
  return results;
}

async function syncOfficialIddaaMarkets(options = {}) {
  const fixtures = Array.isArray(options.fixtures) ? options.fixtures : readJson(fixturesPath, []);
  const fetchBulletin = options.fetchBulletin || fetchIddaaBulletin;
  const fetchDetail = options.fetchDetail || fetchIddaaEventDetail;
  const detailLimit = options.detailLimit ?? DETAIL_LIMIT;
  const detailConcurrency = options.detailConcurrency ?? DETAIL_CONCURRENCY;

  const status = {
    ok: false,
    generated_at: new Date().toISOString(),
    source: SOURCE_NAME,
    fixture_count: fixtures.length,
    bulletin_match_count: 0,
    matched_count: 0,
    summary_enriched_count: 0,
    detail_requested: 0,
    detail_succeeded: 0,
    detail_failed: 0,
    detail_limit: detailLimit,
    verified_market_counts: {},
    error: null,
  };

  let bulletin;
  try {
    bulletin = await fetchBulletin({ includeMarkets: false, timeoutMs: DETAIL_TIMEOUT_MS });
  } catch (error) {
    status.error = String(error?.message || error);
    if (!options.fixtures) writeJson(statusPath, status);
    return { fixtures, status };
  }

  const officialMatches = Array.isArray(bulletin?.matches) ? bulletin.matches : [];
  status.bulletin_match_count = officialMatches.length;
  const exactMap = new Map(officialMatches.map((item) => [exactKey(item), item]));
  const matchedByIndex = new Map();
  let nextFixtures = fixtures.map((fixture, index) => {
    const official = findOfficialMatch(fixture, officialMatches, exactMap);
    if (!official) return fixture;
    matchedByIndex.set(index, official);
    status.matched_count += 1;
    const merged = mergeOfficialMarkets(fixture, official, "bulletin");
    if (Object.keys(verifiedOdds(official)).length) status.summary_enriched_count += 1;
    return merged;
  });

  const detailTargets = [...matchedByIndex.entries()]
    .map(([index, official]) => ({ index, official, fixture: nextFixtures[index] }))
    .filter((row) => needsDetail(row.fixture) && String(row.official?.iddaa_event_id || row.official?.id || "").match(/^\d{1,12}$/))
    .sort((a, b) => String(a.fixture?.date || "").localeCompare(String(b.fixture?.date || ""))
      || String(a.fixture?.time || "").localeCompare(String(b.fixture?.time || "")))
    .slice(0, Math.max(0, detailLimit));

  status.detail_requested = detailTargets.length;
  const detailResults = await mapLimit(detailTargets, detailConcurrency, async (target) => {
    const id = String(target.official.iddaa_event_id || target.official.id);
    const payload = await fetchDetail(id, { timeoutMs: DETAIL_TIMEOUT_MS });
    return { ok: true, target, match: payload?.match || null };
  });

  for (const result of detailResults) {
    if (!result?.ok || !result.match) {
      status.detail_failed += 1;
      continue;
    }
    status.detail_succeeded += 1;
    const index = result.target.index;
    nextFixtures[index] = mergeOfficialMarkets(nextFixtures[index], result.match, "event_detail");
  }

  status.ok = true;
  status.verified_market_counts = marketCounts(nextFixtures);
  if (!options.fixtures) {
    writeJson(fixturesPath, nextFixtures);
    writeJson(statusPath, status);
  }
  return { fixtures: nextFixtures, status };
}

async function main() {
  const result = await syncOfficialIddaaMarkets();
  if (!result.status.ok) {
    console.warn("Resmi Iddaa market senkronu atlandi:", result.status.error || "bilinmeyen hata");
    return;
  }
  const c = result.status.verified_market_counts || {};
  console.log(
    "Resmi Iddaa market senkronu tamamlandi.",
    "Eslesen:", result.status.matched_count,
    "Detay:", result.status.detail_succeeded + "/" + result.status.detail_requested,
    "KG:", c.bttsYes || 0,
    "IY KG:", c.firstHalfBttsYes || 0,
    "2Y KG:", c.secondHalfBttsYes || 0,
    "3.5 Ust:", c.over35 || 0,
    "6+:", c.goals6plus || 0,
  );
}

if (require.main === module) {
  main().catch((error) => {
    console.warn("Resmi Iddaa market senkronu beklenmeyen hata:", error?.message || error);
  });
}

module.exports = {
  DETAIL_PRIORITY_KEYS,
  VERIFIED_KEYS,
  candidateScore,
  exactKey,
  findOfficialMatch,
  marketCounts,
  mergeOfficialMarkets,
  syncOfficialIddaaMarkets,
  teamSimilarity,
};
