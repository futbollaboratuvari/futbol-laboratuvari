const fs = require("fs");
const https = require("https");
const path = require("path");

const outputPath = path.join(__dirname, "..", "data", "fixtures.json");

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

const writeFixtures = (fixtures) => {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(fixtures, null, 2)}\n`, "utf8");
};

const requestJson = (url, headers = {}) =>
  new Promise((resolve, reject) => {
    const request = https.get(url, { headers }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => {
        body += chunk;
      });
      response.on("end", () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`Request failed with ${response.statusCode}: ${body}`));
          return;
        }

        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });

    request.on("error", reject);
    request.setTimeout(20000, () => {
      request.destroy(new Error("Request timed out"));
    });
  });

const normalizeFootballData = (payload) =>
  (payload.matches || []).map((match) => {
    const kickoff = new Date(match.utcDate);
    return {
      date: formatTurkeyDate(kickoff),
      time: formatTurkeyTime(kickoff),
      league: match.competition?.name || "Futbol",
      home: match.homeTeam?.name || "Ev sahibi",
      away: match.awayTeam?.name || "Deplasman",
      status: match.status === "FINISHED" ? "finished" : "scheduled",
    };
  });

const fetchFixturesFromFootballData = async () => {
  const token = process.env.FOOTBALL_API_KEY;
  if (!token) return null;

  const today = formatTurkeyDate();
  const dateTo = addDays(today, 2);
  const url = `https://api.football-data.org/v4/matches?dateFrom=${today}&dateTo=${dateTo}`;
  const payload = await requestJson(url, { "X-Auth-Token": token });
  return normalizeFootballData(payload);
};

const keepThreeDayWindow = (fixtures) => {
  const today = formatTurkeyDate();
  const allowedDates = new Set([today, addDays(today, 1), addDays(today, 2)]);
  return fixtures.filter((fixture) => allowedDates.has(fixture.date));
};

const main = async () => {
  const existingFixtures = readJson(outputPath, []);
  const apiFixtures = await fetchFixturesFromFootballData();

  if (Array.isArray(apiFixtures) && apiFixtures.length > 0) {
    writeFixtures(apiFixtures);
    console.log(`Updated data/fixtures.json with ${apiFixtures.length} API fixtures.`);
    return;
  }

  writeFixtures(keepThreeDayWindow(existingFixtures));
  console.log("No API data configured or returned. Kept existing 3-day fixture window.");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
