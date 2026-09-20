const fs = require("fs");
const https = require("https");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const outputPath = path.join(dataDir, "nesine-match-detail-source.json");
const cachePath = path.join(dataDir, "nesine-match-detail-cache.json");
const healthPath = path.join(dataDir, "match-detail-source-health.json");
const TIMEZONE = "Europe/Istanbul";
const ORIGIN = "https://istatistik.nesine.com";
const CACHE_TTL_MS = 4 * 60 * 60 * 1000;
const RETRY_TTL_MS = 30 * 60 * 1000;
const ADAPTER_VERSION = "v4-payload-diagnostic";
const MAX_RESPONSE_BYTES = 3 * 1024 * 1024;
const MAX_REQUESTS = Math.max(8, Number(process.env.NESINE_STATS_REQUEST_LIMIT || 72));
const MAX_MATCHES = Math.max(8, Number(process.env.NESINE_STATS_MATCH_LIMIT || 36));

const ROUTES = {
  summary: "ozet",
  standings: "puan-tablosu",
  h2h: "rekabet-gecmisi",
  recent: "son-maclari",
  squads: "kadrolar",
  discipline: "korner-ve-kart",
  referee: "hakem-bilgileri",
};

const readJson = (filePath, fallback) => {
  try {
    const value = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return value ?? fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (filePath, value) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
};

const text = (value) => String(value ?? "").trim();
const clean = (value) => text(value)
  .toLocaleLowerCase("tr-TR")
  .replace(/ı/g, "i")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/\b(fc|fk|sk|spor kulubu|club|cf|sc)\b/g, " ")
  .replace(/[^a-z0-9]+/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const tokens = (value) => new Set(clean(value).split(" ").filter((item) => item.length > 1));
const similarity = (leftValue, rightValue) => {
  const left = clean(leftValue);
  const right = clean(rightValue);
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) return 0.9;
  const a = tokens(left);
  const b = tokens(right);
  const common = [...a].filter((item) => b.has(item)).length;
  return common / (new Set([...a, ...b]).size || 1);
};

const decodeEntities = (value) => String(value || "")
  .replace(/&nbsp;|&#160;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, "<")
  .replace(/&gt;/gi, ">")
  .replace(/&#(d+);/g, (_, code) => String.fromCharCode(Number(code)))
  .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));

const stripTags = (value) => decodeEntities(String(value || "")
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
  .replace(/<img[^>]*alt=["']?([^"'>]*)["']?[^>]*>/gi, " $1 ")
  .replace(/<[^>]+>/g, " "))
  .replace(/\s+/g, " ")
  .trim();

const htmlToLines = (html) => decodeEntities(String(html || "")
  .replace(/<script[\s\S]*?<\/script>/gi, " ")
  .replace(/<style[\s\S]*?<\/style>/gi, " ")
  .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
  .replace(/<img[^>]*alt=["']?([^"'>]*)["']?[^>]*>/gi, "\n$1\n")
  .replace(/<\/(?:p|div|section|article|li|tr|td|th|h[1-6]|br)>/gi, "\n")
  .replace(/<br\s*\/?>/gi, "\n")
  .replace(/<[^>]+>/g, " "))
  .split(/\r?\n/)
  .map((line) => line.replace(/\s+/g, " ").trim())
  .filter(Boolean);

const tableRows = (html) => [...String(html || "").matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)]
  .map((match) => [...match[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)]
    .map((cell) => stripTags(cell[1]))
    .filter((cell) => cell !== ""))
  .filter((cells) => cells.length >= 2);

const dateIso = (value) => {
  const source = text(value);
  let match = source.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (match) return [match[1], match[2].padStart(2, "0"), match[3].padStart(2, "0")].join("-");
  match = source.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  return match ? [match[3], match[2].padStart(2, "0"), match[1].padStart(2, "0")].join("-") : "";
};

const numberOrNull = (value) => {
  const source = text(value).replace(",", ".");
  if (!/^-?\d+(?:\.\d+)?$/.test(source)) return null;
  const number = Number(source);
  return Number.isFinite(number) ? number : null;
};

const matchIdentity = (row) => ({
  date: text(row?.date || row?.tarih || row?.start_date).slice(0, 10),
  time: text(row?.time || row?.saat || row?.start_time).slice(0, 5),
  home: text(row?.home || row?.home_team_name || row?.ev_sahibi),
  away: text(row?.away || row?.away_team_name || row?.deplasman),
  league: text(row?.league || row?.competition_name || row?.lig),
});

const candidateStatsId = (row) => {
  const explicit = [
    row?.nesine_stats_id,
    row?.nesine_event_id,
    row?.iddaa_event_id,
    row?.official_event_id,
  ].map((value) => text(value)).find((value) => /^\d{6,12}$/.test(value));
  return explicit || "";
};

const identitySimilarity = (teamName, candidate) => {
  const team = clean(teamName);
  const line = clean(candidate);
  if (!team || !line) return 0;
  if (team === line || (team.length >= 5 && line.includes(team))) return 1;
  const ignored = new Set(["takim", "team", "futbol", "football"]);
  const teamTokens = [...tokens(team)].filter((token) => !ignored.has(token));
  const lineTokens = tokens(line);
  if (!teamTokens.length) return 0;
  const common = teamTokens.filter((token) => lineTokens.has(token)).length;
  if (teamTokens.length === 1) return common === 1 && teamTokens[0].length >= 4 ? 1 : 0;
  return common / teamTokens.length;
};

const diagnosticSnapshot = (html) => {
  const source = String(html || "");
  const title = (source.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").replace(/\s+/g, " ").trim();
  const meta = [...source.matchAll(/<meta\b[^>]*(?:name|property)=["']([^"']+)["'][^>]*content=["']([^"']*)["'][^>]*>/gi)]
    .slice(0, 16)
    .map((m) => [m[1], m[2]]);
  const scripts = [...source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .slice(0, 20)
    .map((m) => {
      const src = m[1].match(/src=["']([^"']+)["']/i)?.[1] || "";
      const body = String(m[2] || "").replace(/\s+/g, " ").trim().slice(0, 1200);
      return { src, body };
    })
    .filter((item) => item.src || item.body);
  const visible = htmlToLines(source).slice(0, 40);
  return { title, meta, scripts, visible };
};

const pageContainsMatch = (html, match) => {
  const page = clean(stripTags(html));
  if (!page) return false;
  const home = clean(match.home);
  const away = clean(match.away);
  if (home.length >= 4 && away.length >= 4 && page.includes(home) && page.includes(away)) return true;
  const lines = htmlToLines(html);
  const homeScore = Math.max(...lines.map((line) => identitySimilarity(match.home, line)), 0);
  const awayScore = Math.max(...lines.map((line) => identitySimilarity(match.away, line)), 0);
  return homeScore >= 0.75 && awayScore >= 0.75;
};

const headingAliases = {
  standings: ["puan durumu", "takim siralamasi"],
  h2h: ["aralarindaki son karsilasmalar", "rekabet gecmisi"],
  recent: ["son 6 mac formu", "son maclar", "fikstur sonuclar"],
  squads: ["sakat cezali listesi", "kadro istatistikleri", "kadrolar"],
  discipline: ["korner kart", "korner kart istatistikleri", "kart korner"],
  referee: ["hakem bilgileri", "hakem"],
};

const allHeadingTokens = Object.values(headingAliases).flat().map(clean);

const sectionExcerpt = (lines, key, limit = 44) => {
  const aliases = (headingAliases[key] || []).map(clean);
  const start = lines.findIndex((line) => aliases.some((alias) => clean(line).includes(alias)));
  if (start < 0) return "";
  const out = [];
  for (let index = start; index < lines.length && out.length < limit; index += 1) {
    const line = lines[index];
    if (index > start + 1 && allHeadingTokens.some((heading) => heading && clean(line).includes(heading) && !aliases.some((alias) => clean(line).includes(alias)))) break;
    out.push(line);
  }
  return out.join(" · ").slice(0, 4200);
};

const hasUsefulExcerpt = (value) => {
  const normalized = clean(value);
  return Boolean(normalized)
    && !/^((puan durumu|son maclar|hakem|kadrolar|korner kart) )?data bulunamadi$/.test(normalized)
    && !normalized.includes("bu mac icin hakem bilgisi henuz saglanmamistir");
};

const standingForTeam = (rows, teamName, sourceUrl) => {
  let best = null;
  for (const cells of rows) {
    const scores = cells.map((cell) => similarity(teamName, cell));
    const teamIndex = scores.reduce((bestIndex, score, index) => score > scores[bestIndex] ? index : bestIndex, 0);
    if (scores[teamIndex] < 0.72) continue;
    const after = cells.slice(teamIndex + 1);
    const numbers = after.map(numberOrNull).filter((value) => value !== null);
    if (numbers.length < 8) continue;
    const beforeRank = cells.slice(0, teamIndex).map(numberOrNull).find((value) => value !== null);
    const form = after.find((cell) => /^(?:[GMBWDL]\s*){2,}$/i.test(cell.replace(/\s+/g, ""))) || "";
    const candidate = {
      team_name: teamName,
      rank: beforeRank ?? null,
      played: numbers[0],
      wins: numbers[1],
      draws: numbers[2],
      losses: numbers[3],
      goals_for: numbers[4],
      goals_against: numbers[5],
      goal_difference: numbers[6],
      points: numbers[7],
      recent_form: form ? form.replace(/\s+/g, "").split("") : [],
      source_note: sourceUrl,
    };
    const quality = Number(candidate.played > 0) + Number(candidate.rank !== null) + numbers.length / 20;
    if (!best || quality > best.quality) best = { quality, candidate };
  }
  return best?.candidate || null;
};

const h2hRows = (rows, match, sourceUrl, limit = 8) => {
  const found = [];
  for (const cells of rows) {
    const homeIndex = cells.findIndex((cell) => similarity(match.home, cell) >= 0.72);
    const awayIndex = cells.findIndex((cell) => similarity(match.away, cell) >= 0.72);
    if (homeIndex < 0 || awayIndex < 0) continue;
    const date = cells.map(dateIso).find(Boolean) || "";
    const score = cells.map((cell) => text(cell).match(/^(\d+)\s*[-:]\s*(\d+)$/)).find(Boolean);
    if (!date || !score || (match.date && date >= match.date)) continue;
    found.push({
      date,
      home: homeIndex < awayIndex ? match.home : match.away,
      away: homeIndex < awayIndex ? match.away : match.home,
      score: score[1] + "-" + score[2],
      source: sourceUrl,
    });
  }
  return [...new Map(found.map((row) => [row.date + "|" + row.home + "|" + row.away + "|" + row.score, row])).values()]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
};

const routeUrl = (id, route) => ORIGIN + "/" + id + "/" + route;
const canonicalUrl = (id) => ORIGIN + "/p1/" + id;
const primaryUrls = (id) => [routeUrl(id, ROUTES.summary), canonicalUrl(id)];

const requestText = (url, redirects = 3) => new Promise((resolve, reject) => {
  const request = https.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; FutbolLaboratuvariStats/2.0; +https://futbollaboratuuvari.org)",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "tr-TR,tr;q=0.9,en;q=0.6",
      "Cache-Control": "no-cache",
    },
    timeout: 25000,
  }, (response) => {
    if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location && redirects > 0) {
      response.resume();
      const next = new URL(response.headers.location, url).toString();
      requestText(next, redirects - 1).then(resolve, reject);
      return;
    }
    if (response.statusCode < 200 || response.statusCode >= 300) {
      response.resume();
      reject(new Error("HTTP " + response.statusCode));
      return;
    }
    let body = "";
    let bytes = 0;
    response.setEncoding("utf8");
    response.on("data", (chunk) => {
      bytes += Buffer.byteLength(chunk);
      if (bytes > MAX_RESPONSE_BYTES) {
        request.destroy(new Error("response_too_large"));
        return;
      }
      body += chunk;
    });
    response.on("end", () => resolve(body));
  });
  request.on("timeout", () => request.destroy(new Error("timeout")));
  request.on("error", reject);
});

const ageMs = (value) => {
  const parsed = Date.parse(text(value));
  return Number.isFinite(parsed) ? Date.now() - parsed : Infinity;
};

const parseSource = (html, match, id, routePages = {}) => {
  const sourceUrl = routeUrl(id, ROUTES.summary);
  const lines = htmlToLines(html);
  const rows = tableRows(html);
  const getExcerpt = (key) => {
    const direct = routePages[key] ? htmlToLines(routePages[key]).join(" · ").slice(0, 4200) : "";
    return hasUsefulExcerpt(direct) ? direct : sectionExcerpt(lines, key);
  };
  const homeStanding = standingForTeam(rows, match.home, sourceUrl);
  const awayStanding = standingForTeam(rows, match.away, sourceUrl);
  const headToHead = h2hRows(rows, match, sourceUrl);
  const summaryExcerpt = lines.slice(0, 54).join(" · ").slice(0, 4200);
  const standingsExcerpt = getExcerpt("standings");
  const h2hExcerpt = getExcerpt("h2h");
  const recentExcerpt = getExcerpt("recent");
  const squadsExcerpt = getExcerpt("squads");
  const disciplineExcerpt = getExcerpt("discipline");
  const refereeExcerpt = getExcerpt("referee");
  return {
    id: id,
    iddaa_event_id: id,
    date: match.date,
    time: match.time,
    league: match.league,
    home: match.home,
    away: match.away,
    source: "Nesine İstatistik",
    source_url: sourceUrl,
    verified_identity: true,
    summary: { excerpt: summaryExcerpt },
    standings: {
      structured_available: Boolean(homeStanding || awayStanding),
      home: homeStanding,
      away: awayStanding,
      excerpt: standingsExcerpt,
    },
    head_to_head: {
      structured_available: headToHead.length > 0,
      matches: headToHead,
      excerpt: h2hExcerpt,
    },
    recent_matches: {
      structured_available: false,
      home: [],
      away: [],
      excerpt: recentExcerpt,
    },
    squads: {
      structured_available: false,
      excerpt: squadsExcerpt,
    },
    corners_cards: {
      structured_available: false,
      excerpt: disciplineExcerpt,
    },
    referee: {
      structured_available: false,
      details: null,
      excerpt: refereeExcerpt,
    },
    fetched_at: new Date().toISOString(),
    provenance: {
      policy: "official_event_id_plus_home_away_identity_validation",
      sources: [sourceUrl],
    },
  };
};

const listMatches = (root) => [
  ...(Array.isArray(root?.matches) ? root.matches : []),
  ...(Array.isArray(root?.scheduled_matches) ? root.scheduled_matches : []),
  ...(Array.isArray(root?.live_matches) ? root.live_matches : []),
  ...(Array.isArray(root?.finished_matches) ? root.finished_matches : []),
];

const matchKey = (row) => {
  const match = matchIdentity(row);
  return [match.date, clean(match.home), clean(match.away)].join("|");
};

const uniqueCurrentMatches = (full) => {
  const map = new Map();
  for (const row of listMatches(full)) {
    const match = matchIdentity(row);
    if (!match.date || !match.home || !match.away) continue;
    const id = candidateStatsId(row);
    map.set(matchKey(row), { ...match, id, source_row: row });
  }
  return [...map.values()].sort((a, b) => (a.date + " " + a.time).localeCompare(b.date + " " + b.time));
};

const mergeRoutePage = async (entry, key, id, match, budget) => {
  if (budget.remaining <= 0) return;
  const url = routeUrl(id, ROUTES[key]);
  budget.remaining -= 1;
  budget.used += 1;
  try {
    const html = await requestText(url);
    if (pageContainsMatch(html, match) || htmlToLines(html).length > 8) entry.route_pages[key] = html;
  } catch (error) {
    entry.route_errors[key] = error.message;
  }
};

async function run() {
  const full = readJson(path.join(dataDir, "full-bulletin.json"), null);
  if (!full) throw new Error("data/full-bulletin.json bulunamadi; Nesine detay kaynagi calistirilmadi.");
  const cache = readJson(cachePath, { schema_version: 1, entries: {} });
  cache.entries ||= {};
  const matches = uniqueCurrentMatches(full);
  const candidates = matches.filter((match) => match.id).slice(0, MAX_MATCHES);
  const budget = { used: 0, remaining: MAX_REQUESTS };
  const errors = [];
  let identityMismatchCount = 0;

  for (const match of candidates) {
    const id = match.id;
    const cached = cache.entries[id] || {};
    if (cached.data && cached.adapter_version === ADAPTER_VERSION && ageMs(cached.fetched_at) < CACHE_TTL_MS) continue;
    if (!cached.data && cached.adapter_version === ADAPTER_VERSION && ageMs(cached.attempted_at) < RETRY_TTL_MS) continue;
    if (budget.remaining <= 0) break;

    const entry = { ...cached, adapter_version: ADAPTER_VERSION, attempted_at: new Date().toISOString(), route_pages: {}, route_errors: {} };
    try {
      let html = "";
      let verifiedUrl = "";
      const primaryErrors = [];
      for (const url of primaryUrls(id)) {
        if (budget.remaining <= 0) break;
        budget.remaining -= 1;
        budget.used += 1;
        try {
          const candidateHtml = await requestText(url);
          if (pageContainsMatch(candidateHtml, match)) {
            html = candidateHtml;
            verifiedUrl = url;
            break;
          }
          primaryErrors.push(url + ": identity_mismatch");
          if (!entry.diagnostic && Object.keys(cache.entries).filter((key) => cache.entries[key]?.adapter_version === ADAPTER_VERSION && cache.entries[key]?.diagnostic).length < 3) {
            entry.diagnostic = { url, snapshot: diagnosticSnapshot(candidateHtml) };
          }
        } catch (error) {
          primaryErrors.push(url + ": " + error.message);
        }
      }
      if (!html) {
        identityMismatchCount += 1;
        entry.status = "identity_mismatch";
        entry.error = primaryErrors.join(" | ") || "Nesine sayfasindaki takimlar bulten maciyla dogrulanamadi.";
        cache.entries[id] = entry;
        continue;
      }
      entry.verified_url = verifiedUrl;

      const baseLines = htmlToLines(html);
      const dedicatedRoutes = new Set(["squads", "discipline", "referee"]);
      const missing = Object.keys(ROUTES).filter((key) => {
        if (key === "summary") return false;
        if (dedicatedRoutes.has(key)) return true;
        const excerpt = sectionExcerpt(baseLines, key);
        return !hasUsefulExcerpt(excerpt);
      });
      for (const key of missing) {
        if (budget.remaining <= 0) break;
        await mergeRoutePage(entry, key, id, match, budget);
      }

      entry.data = parseSource(html, match, id, entry.route_pages);
      entry.fetched_at = entry.data.fetched_at;
      entry.status = "ok";
      delete entry.error;
    } catch (error) {
      entry.status = cached.data ? "stale" : "source_error";
      entry.error = error.message;
      errors.push(id + ": " + error.message);
    }
    delete entry.route_pages;
    cache.entries[id] = entry;
  }

  cache.updated_at = new Date().toISOString();
  for (const [id, entry] of Object.entries(cache.entries)) {
    if (ageMs(entry.fetched_at || entry.attempted_at) > 14 * 24 * 60 * 60 * 1000) delete cache.entries[id];
  }

  const currentKeys = new Set(matches.map((match) => [match.date, clean(match.home), clean(match.away)].join("|")));
  const rows = Object.values(cache.entries)
    .map((entry) => entry.data)
    .filter((row) => row && row.verified_identity && currentKeys.has(matchKey(row)));

  const coverage = {
    current_match_count: matches.length,
    official_id_match_count: matches.filter((match) => match.id).length,
    fetched_match_count: rows.length,
    standings_structured_count: rows.filter((row) => row.standings?.structured_available).length,
    standings_excerpt_count: rows.filter((row) => hasUsefulExcerpt(row.standings?.excerpt)).length,
    h2h_structured_count: rows.filter((row) => row.head_to_head?.structured_available).length,
    h2h_excerpt_count: rows.filter((row) => hasUsefulExcerpt(row.head_to_head?.excerpt)).length,
    recent_excerpt_count: rows.filter((row) => hasUsefulExcerpt(row.recent_matches?.excerpt)).length,
    squads_excerpt_count: rows.filter((row) => hasUsefulExcerpt(row.squads?.excerpt)).length,
    discipline_excerpt_count: rows.filter((row) => hasUsefulExcerpt(row.corners_cards?.excerpt)).length,
    referee_excerpt_count: rows.filter((row) => hasUsefulExcerpt(row.referee?.excerpt)).length,
  };

  const output = {
    schema_version: 2,
    generated_at: new Date().toISOString(),
    timezone: TIMEZONE,
    source: "Nesine İstatistik",
    source_policy: "Only explicit official event ids are fetched. Home and away identity must match before data is accepted. Missing sections remain unavailable.",
    request_count: budget.used,
    match_count: rows.length,
    coverage,
    errors: errors.slice(0, 20),
    matches: rows,
  };

  const health = {
    generated_at: output.generated_at,
    status: rows.length ? (errors.length ? "partial" : "ok") : (matches.some((match) => match.id) ? "source_waiting" : "missing_official_ids"),
    request_count: budget.used,
    identity_mismatch_count: identityMismatchCount,
    errors: errors.slice(0, 20),
    coverage,
  };

  writeJson(cachePath, cache);
  writeJson(outputPath, output);
  writeJson(healthPath, health);
  console.log("Nesine match detail source: " + rows.length + "/" + matches.length + " matches, requests=" + budget.used + ", official_ids=" + coverage.official_id_match_count + ".");
  return output;
}

if (require.main === module) run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

module.exports = {
  ADAPTER_VERSION,
  candidateStatsId,
  clean,
  hasUsefulExcerpt,
  h2hRows,
  htmlToLines,
  pageContainsMatch,
  parseSource,
  primaryUrls,
  sectionExcerpt,
  similarity,
  standingForTeam,
  tableRows,
  run,
};
