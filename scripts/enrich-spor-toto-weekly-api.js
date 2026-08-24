const fs = require("fs");
const https = require("https");
const path = require("path");

const root = path.join(__dirname, "..");
const programPath = path.join(root, "data", "spor_toto_weekly_program.json");
const cachePath = path.join(root, "data", "spor_toto_weekly_market.json");
const API_HOST = "v3.football.api-sports.io";
const MIN_BOOKMAKERS = 2;
const PREDICTION_TTL_MS = 20 * 60 * 60 * 1000;

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
const clean = (value) => String(value || "")
  .toLocaleLowerCase("tr-TR")
  .replace(/ı/g, "i")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/\b(a s|as|fk|fc|sk|spor kulubu|sportif faaliyetler|corendon|tumosan|arca|rams)\b/g, " ")
  .replace(/[^a-z0-9]+/g, " ")
  .replace(/\s+/g, " ")
  .trim();
const alias = (value) => clean(value)
  .replace(/paris saint germain|paris st germain|psg/g, "paris sg")
  .replace(/istanbul basaksehir/g, "basaksehir")
  .replace(/hamburger sv/g, "hamburg")
  .replace(/newcastle utd/g, "newcastle united")
  .replace(/atletico madrid/g, "a madrid")
  .replace(/konyaspor/g, "konya")
  .replace(/caykur rizespor/g, "rize")
  .replace(/alanyaspor/g, "alanya");
const tokens = (value) => new Set(alias(value).split(" ").filter((item) => item.length > 1));
const similarity = (a, b) => {
  const aa = alias(a); const bb = alias(b);
  if (!aa || !bb) return 0;
  if (aa === bb) return 1;
  if (aa.includes(bb) || bb.includes(aa)) return 0.9;
  const A = tokens(aa); const B = tokens(bb);
  const intersection = [...A].filter((item) => B.has(item)).length;
  return intersection / (new Set([...A, ...B]).size || 1);
};
const rowKey = (row) => `${String(row.date || "").slice(0, 10)}|${alias(row.home)}|${alias(row.away)}`;
const parsePercent = (value) => {
  const number = Number(String(value ?? "").replace("%", "").replace(",", "."));
  return Number.isFinite(number) ? number : null;
};
const parseOdd = (value) => {
  const number = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(number) && number > 1.01 && number < 100 ? Number(number.toFixed(3)) : null;
};
const normalizeProbabilities = (values) => {
  const nums = [Number(values?.["1"]), Number(values?.X), Number(values?.["2"])];
  if (nums.some((value) => !Number.isFinite(value) || value < 0)) return null;
  const total = nums.reduce((a, b) => a + b, 0);
  if (!total) return null;
  const output = { "1": Number(((nums[0] / total) * 100).toFixed(1)), X: Number(((nums[1] / total) * 100).toFixed(1)), "2": Number(((nums[2] / total) * 100).toFixed(1)) };
  output["1"] = Number((output["1"] + Number((100 - output["1"] - output.X - output["2"]).toFixed(1))).toFixed(1));
  return output;
};
const median = (numbers) => {
  const rows = numbers.filter(Number.isFinite).sort((a, b) => a - b);
  if (!rows.length) return null;
  const middle = Math.floor(rows.length / 2);
  return rows.length % 2 ? rows[middle] : Number(((rows[middle - 1] + rows[middle]) / 2).toFixed(3));
};

function apiRequest(endpoint, params, key) {
  const query = new URLSearchParams(Object.entries(params || {}).filter(([, value]) => value !== undefined && value !== null)).toString();
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: API_HOST,
      path: `${endpoint}${query ? `?${query}` : ""}`,
      method: "GET",
      headers: { "x-apisports-key": key, Accept: "application/json", "User-Agent": "FutbolLaboratuvari-SporToto/1.0" },
      timeout: 30000,
    }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => { body += chunk; });
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) return reject(new Error(`API-Football HTTP ${res.statusCode}`));
        try {
          const parsed = JSON.parse(body);
          const errors = parsed?.errors;
          const hasErrors = Array.isArray(errors) ? errors.length > 0 : errors && typeof errors === "object" ? Object.keys(errors).length > 0 : false;
          if (hasErrors) return reject(new Error(`API-Football error: ${JSON.stringify(errors)}`));
          resolve(parsed);
        } catch (error) {
          reject(new Error(`API-Football JSON error: ${error.message}`));
        }
      });
    });
    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("API-Football timeout")));
    req.end();
  });
}

const apiKeys = () => [...new Set([process.env.API_FOOTBALL_KEY, process.env.API_FOOTBALL_KEY2].map((value) => String(value || "").trim()).filter(Boolean))];
async function request(endpoint, params) {
  const keys = apiKeys();
  if (!keys.length) throw new Error("API_FOOTBALL_KEY/API_FOOTBALL_KEY2 yok");
  let lastError = null;
  for (const key of keys) {
    try { return await apiRequest(endpoint, params, key); }
    catch (error) { lastError = error; }
  }
  throw lastError || new Error("API-Football request failed");
}

function findApiFixture(programMatch, fixtures) {
  let best = null;
  for (const item of fixtures) {
    const home = item?.teams?.home?.name || "";
    const away = item?.teams?.away?.name || "";
    const date = String(item?.fixture?.date || "").slice(0, 10);
    const homeScore = similarity(programMatch.home, home);
    const awayScore = similarity(programMatch.away, away);
    if (homeScore < 0.5 || awayScore < 0.5) continue;
    const score = homeScore + awayScore + (date === programMatch.date ? 0.45 : 0);
    if (!best || score > best.score) best = { item, score };
  }
  return best && best.score >= 1.55 ? best.item : null;
}

function optionFromLabel(label, home, away) {
  const value = clean(label);
  if (["home", "1", "local", "domicile"].includes(value) || similarity(value, home) >= 0.85) return "1";
  if (["draw", "x", "empate", "nul", "pareggio"].includes(value)) return "X";
  if (["away", "2", "visitor", "deplasman"].includes(value) || similarity(value, away) >= 0.85) return "2";
  return null;
}

function extractMarket(payload, home, away) {
  const snapshots = [];
  for (const block of Array.isArray(payload?.response) ? payload.response : []) {
    for (const bookmaker of Array.isArray(block?.bookmakers) ? block.bookmakers : []) {
      const candidateBets = (bookmaker.bets || []).filter((bet) => /match winner|winner|1x2|1 x 2/i.test(String(bet.name || "")));
      for (const bet of candidateBets) {
        const options = {};
        for (const value of bet.values || []) {
          const option = optionFromLabel(value.value, home, away);
          const odd = parseOdd(value.odd);
          if (option && odd) options[option] = odd;
        }
        if (["1", "X", "2"].every((option) => options[option])) {
          snapshots.push({ bookmaker_id: bookmaker.id ?? null, bookmaker: bookmaker.name || `bookmaker-${bookmaker.id}`, odds: options, update: block.update || null });
          break;
        }
      }
    }
  }
  const unique = [...new Map(snapshots.map((row) => [String(row.bookmaker_id ?? row.bookmaker), row])).values()];
  if (!unique.length) return { source_count: 0, odds: null, bookmakers: [], snapshots: [] };
  const odds = { "1": median(unique.map((row) => row.odds["1"])), X: median(unique.map((row) => row.odds.X)), "2": median(unique.map((row) => row.odds["2"])) };
  return { source_count: unique.length, odds, bookmakers: unique.map((row) => row.bookmaker).slice(0, 20), snapshots: unique.slice(0, 20) };
}

function parseH2H(prediction) {
  return (Array.isArray(prediction?.h2h) ? prediction.h2h : []).slice(-5).map((row) => ({
    date: String(row?.fixture?.date || "").slice(0, 10),
    home: row?.teams?.home?.name || "",
    away: row?.teams?.away?.name || "",
    score: Number.isFinite(Number(row?.goals?.home)) && Number.isFinite(Number(row?.goals?.away)) ? `${row.goals.home}-${row.goals.away}` : "-",
  })).filter((row) => row.home && row.away);
}

function parsePrediction(payload) {
  const row = Array.isArray(payload?.response) ? payload.response[0] : null;
  if (!row) return null;
  const percent = row?.predictions?.percent || {};
  const probabilities = normalizeProbabilities({ "1": parsePercent(percent.home), X: parsePercent(percent.draw), "2": parsePercent(percent.away) });
  if (!probabilities) return null;
  return {
    probabilities,
    winner: row?.predictions?.winner?.name || null,
    winner_comment: row?.predictions?.winner?.comment || null,
    advice: row?.predictions?.advice || null,
    under_over: row?.predictions?.under_over || null,
    comparison: row?.comparison || null,
    h2h: parseH2H(row),
  };
}

async function run() {
  const program = readJson(programPath, null);
  if (!program || !Array.isArray(program.matches) || program.matches.length !== 15) throw new Error("Spor Toto haftalık 15 programı yok");
  const previous = readJson(cachePath, { matches: [] });
  if (!apiKeys().length) {
    console.log("Spor Toto API enrichment skipped: API key yok; son sağlam market cache korunuyor.");
    return previous;
  }

  const previousMap = new Map((previous.matches || []).map((row) => [rowKey(row), row]));
  const programKey = `${program.season || ""}|${program.week || ""}|${program.program_start || ""}|${program.program_end || ""}`;
  const canReuseFixtureIds = previous.program_key === programKey && program.matches.every((match) => previousMap.get(rowKey(match))?.fixture_id);
  let apiFixtures = [];
  if (!canReuseFixtureIds) {
    for (const date of [...new Set(program.matches.map((match) => match.date))]) {
      try {
        const response = await request("/fixtures", { date, timezone: "Europe/Istanbul" });
        apiFixtures.push(...(Array.isArray(response?.response) ? response.response : []));
      } catch (error) {
        console.warn(`Spor Toto fixture discovery ${date} failed: ${error.message}`);
      }
    }
  }

  const now = Date.now();
  const matches = [];
  for (const match of program.matches) {
    const key = rowKey(match);
    const old = previousMap.get(key) || {};
    const fixture = canReuseFixtureIds ? null : findApiFixture(match, apiFixtures);
    const fixtureId = old.fixture_id || fixture?.fixture?.id || null;
    const homeTeamId = old.home_team_id || fixture?.teams?.home?.id || null;
    const awayTeamId = old.away_team_id || fixture?.teams?.away?.id || null;
    const league = fixture?.league?.name || old.league || match.league || "Spor Toto";
    let market = old.market || null;
    let marketFetchedAt = old.market_fetched_at || null;
    let prediction = old.prediction || null;
    let predictionFetchedAt = old.prediction_fetched_at || null;

    if (fixtureId) {
      try {
        const oddsPayload = await request("/odds", { fixture: fixtureId, page: 1 });
        const extracted = extractMarket(oddsPayload, match.home, match.away);
        if (extracted.source_count > 0 && extracted.odds) {
          market = extracted;
          marketFetchedAt = new Date().toISOString();
        }
      } catch (error) {
        console.warn(`Spor Toto odds ${match.no} failed: ${error.message}`);
      }

      const predictionAge = predictionFetchedAt ? now - Date.parse(predictionFetchedAt) : Infinity;
      if (!prediction || !Number.isFinite(predictionAge) || predictionAge >= PREDICTION_TTL_MS) {
        try {
          const predictionPayload = await request("/predictions", { fixture: fixtureId });
          const parsed = parsePrediction(predictionPayload);
          if (parsed) {
            prediction = parsed;
            predictionFetchedAt = new Date().toISOString();
          }
        } catch (error) {
          console.warn(`Spor Toto prediction ${match.no} skipped: ${error.message}`);
        }
      }
    }

    matches.push({
      no: match.no,
      date: match.date,
      time: match.time,
      league,
      home: match.home,
      away: match.away,
      fixture_id: fixtureId,
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      market,
      market_fetched_at: marketFetchedAt,
      market_verified: Boolean(market?.odds && Number(market?.source_count || 0) >= MIN_BOOKMAKERS),
      prediction,
      prediction_fetched_at: predictionFetchedAt,
    });
  }

  const output = {
    generated_at: new Date().toISOString(),
    timezone: "Europe/Istanbul",
    program_key: programKey,
    week_label: program.week_label,
    source: "API-Football/API-Sports çoklu bookmaker 1-X-2 medyanı + istatistik tahmini",
    minimum_bookmaker_sources: MIN_BOOKMAKERS,
    fixture_match_count: matches.filter((row) => row.fixture_id).length,
    verified_market_count: matches.filter((row) => row.market_verified).length,
    prediction_count: matches.filter((row) => row.prediction?.probabilities).length,
    matches,
  };
  writeJson(cachePath, output);
  console.log(`Spor Toto API enrichment: fixtures=${output.fixture_match_count}/15, verifiedMarket=${output.verified_market_count}/15, predictions=${output.prediction_count}/15.`);
  return output;
}

if (require.main === module) run().catch((error) => { console.error(error); process.exitCode = 1; });
module.exports = { run, extractMarket, parsePrediction, findApiFixture, similarity, normalizeProbabilities };
