"use strict";

const API_ORIGIN = "https://sportsbookv2.iddaa.com";
const FOOTBALL_EVENTS_URL = `${API_ORIGIN}/sportsbook/events?st=1&type=0&version=0&live=true`;
const MARKET_CONFIG_URL = `${API_ORIGIN}/sportsbook/get_market_config`;
const COMPETITIONS_URL = `${API_ORIGIN}/sportsbook/competitions`;
const SOURCE_NAME = "iddaa.com resmi futbol bülteni";
const SOURCE_PAGE = "https://www.iddaa.com/program/futbol";
const MAX_RESPONSE_BYTES = 8 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 8_000;
const SUPPORT_CACHE_MS = 10 * 60 * 1000;

let supportCache = null;

function numberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function fold(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function datePartsInIstanbul(epochSeconds) {
  const date = new Date(Number(epochSeconds) * 1000);
  if (Number.isNaN(date.getTime())) return { date: "", time: "--:--", iso: "" };
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const bag = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const hour = bag.hour === "24" ? "00" : bag.hour;
  return {
    date: `${bag.year}-${bag.month}-${bag.day}`,
    time: `${hour}:${bag.minute}`,
    iso: date.toISOString(),
  };
}

function payloadData(payload) {
  return payload && typeof payload === "object" && payload.data !== undefined ? payload.data : payload;
}

function marketConfigMap(payload) {
  const data = payloadData(payload) || {};
  return data.m && typeof data.m === "object" ? data.m : {};
}

function competitionMap(payload) {
  const data = payloadData(payload);
  const competitions = Array.isArray(data) ? data : Array.isArray(data?.competitions) ? data.competitions : [];
  return new Map(competitions.map((competition) => [String(competition.i), competition]));
}

function replaceMarketPlaceholders(template, specialOddValue) {
  const raw = String(template || "Bahis Pazarı");
  const value = String(specialOddValue ?? "").trim();
  return raw
    .replace(/\{(?:0|1|h)\}/gi, value)
    .replace(/\s+/g, " ")
    .trim();
}

function marketCategory(title) {
  const token = fold(title);
  if (token.includes("korner")) return "Kornerler";
  if (token.includes("kart")) return "Kartlar";
  if (token.includes("alt ust")) return "Alt/Üst";
  if (token.includes("gol") || token.includes("skor")) return "Goller";
  if (token.includes("yari") || token.includes("devre")) return "Devreler";
  if (token.includes("mac sonucu") || token.includes("cifte sans") || token.includes("handikap") || token.includes("kim kazanir")) return "Kim Kazanır";
  return "Diğer";
}

function normalizeMarket(market, configByKey) {
  const config = configByKey[`${market.t}_${market.st}`] || {};
  const title = replaceMarketPlaceholders(config.n || `Pazar ${market.st}`, market.sov);
  const outcomes = (Array.isArray(market.o) ? market.o : [])
    .map((outcome) => ({
      id: String(outcome.no ?? outcome.i ?? ""),
      key: String(outcome.no ?? outcome.i ?? ""),
      outcome_no: outcome.no ?? outcome.i ?? null,
      label: String(outcome.n ?? outcome.name ?? outcome.no ?? "Seçim"),
      odd: numberOrNull(outcome.odd),
      web_odd: numberOrNull(outcome.wodd),
    }))
    .filter((outcome) => outcome.odd !== null);

  return {
    id: String(market.i),
    key: `${market.t}_${market.st}${market.sov !== undefined ? `_${market.sov}` : ""}`,
    title,
    category: marketCategory(title),
    description: String(config.d || ""),
    special_odd_value: market.sov ?? null,
    sort_order: numberOrNull(config.i) ?? numberOrNull(config.p) ?? 9999,
    market_type: market.t,
    market_subtype: market.st,
    outcomes,
  };
}

function setCanonicalOdds(target, market) {
  const title = fold(market.title);
  const special = String(market.special_odd_value ?? "").replace(",", ".");
  const byLabel = new Map(market.outcomes.map((outcome) => [fold(outcome.label), outcome.odd]));
  const assign = (key, label) => {
    const odd = byLabel.get(fold(label));
    if (odd !== null && odd !== undefined) target[key] = odd;
  };
  const assignAny = (key, labels) => {
    for (const label of labels) {
      const odd = byLabel.get(fold(label));
      if (odd !== null && odd !== undefined) {
        target[key] = odd;
        return;
      }
    }
  };

  if (title === "mac sonucu") {
    assign("ms1", "1");
    assign("msx", "0");
    assign("ms2", "2");
  }
  if (title.startsWith("alt ust") && special === "2.5") {
    assign("under25", "Alt");
    assign("over25", "Üst");
  }
  if (title === "karsilikli gol") {
    assign("bttsYes", "Var");
    assign("bttsNo", "Yok");
  }
  if (title === "cifte sans") {
    assign("cifte1x", "1 ve 0");
    assign("cifte12", "1 ve 2");
    assign("cifteX2", "0 ve 2");
  }
  if (title.includes("ilk yari mac sonucu") && !title.includes("skor")) {
    assignAny("htFt11", ["1/1", "1-1"]);
    assignAny("htFt1X", ["1/0", "1/X", "1-0", "1-X"]);
    assignAny("htFt12", ["1/2", "1-2"]);
    assignAny("htFtX1", ["0/1", "X/1", "0-1", "X-1"]);
    assignAny("htFtXX", ["0/0", "X/X", "0-0", "X-X"]);
    assignAny("htFtX2", ["0/2", "X/2", "0-2", "X-2"]);
    assignAny("htFt21", ["2/1", "2-1"]);
    assignAny("htFt2X", ["2/0", "2/X", "2-0", "2-X"]);
    assignAny("htFt22", ["2/2", "2-2"]);
  }
  if (title.includes("karsilikli gol") && (title.includes("ilk yari") || title.includes("1 yari"))) {
    assignAny("firstHalfBttsYes", ["Var", "Evet"]);
    assignAny("firstHalfBttsNo", ["Yok", "Hayır", "Hayir"]);
  }
  if (title.includes("karsilikli gol") && (title.includes("ikinci yari") || title.includes("2 yari"))) {
    assignAny("secondHalfBttsYes", ["Var", "Evet"]);
    assignAny("secondHalfBttsNo", ["Yok", "Hayır", "Hayir"]);
  }
}

function rawMarketBlocks(markets) {
  return markets.map((market) => ({
    id: market.id,
    title: market.title,
    category: market.category,
    special_odd_value: market.special_odd_value,
    markets: market.outcomes.map((outcome) => ({
      key: outcome.key,
      label: outcome.label,
      odd: outcome.odd,
      web_odd: outcome.web_odd,
    })),
  }));
}

function normalizeEvent(event, context = {}, options = {}) {
  if (!event || event.i === undefined || !event.hn || !event.an) return null;
  const configByKey = context.configByKey || marketConfigMap(context.marketConfig);
  const competitions = context.competitions instanceof Map ? context.competitions : competitionMap(context.competitions);
  const scoreByEvent = context.scoreByEvent || {};
  const score = event.sc || scoreByEvent[String(event.i)] || scoreByEvent[event.i] || null;
  const live = Number(event.bp) === 1;
  const start = datePartsInIstanbul(event.d);
  const homeScore = numberOrNull(score?.ht?.r);
  const awayScore = numberOrNull(score?.at?.r);
  const competition = competitions.get(String(event.ci)) || {};
  const liveUpdateMs = Number(score?.t);
  const normalizedMarkets = (Array.isArray(event.m) ? event.m : [])
    .map((market) => normalizeMarket(market, configByKey))
    .filter((market) => market.outcomes.length)
    .sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title, "tr"));
  const availableOdds = {};
  normalizedMarkets.forEach((market) => setCanonicalOdds(availableOdds, market));
  const includeMarkets = options.includeMarkets === true;
  const matchCode = String(event.i);

  return {
    id: matchCode,
    matchCode,
    match_code: matchCode,
    iddaa_event_id: matchCode,
    date: start.date,
    time: start.time,
    start_time_iso: start.iso,
    league: String(competition.n || competition.sn || `Lig ${event.ci ?? ""}`).trim(),
    competition_id: event.ci ?? null,
    home: String(event.hn),
    away: String(event.an),
    status: live ? "live" : "scheduled",
    liveStatus: live ? "live" : "scheduled",
    status_verified: live,
    provider_status_verified: live,
    minute: live ? numberOrNull(score?.min) : null,
    homeScore: homeScore,
    awayScore: awayScore,
    score: homeScore !== null && awayScore !== null ? `${homeScore}-${awayScore}` : "",
    lastLiveUpdate: Number.isFinite(liveUpdateMs) ? new Date(liveUpdateMs).toISOString() : "",
    available_odds: availableOdds,
    odds: availableOdds,
    iddaa_market_count: normalizedMarkets.length,
    market_groups: includeMarkets ? normalizedMarkets : undefined,
    raw_market_blocks: includeMarkets ? rawMarketBlocks(normalizedMarkets) : undefined,
    oddsSource: SOURCE_NAME,
    source: SOURCE_NAME,
    source_url: SOURCE_PAGE,
    raw_market_source_note: "Oranlar resmi iddaa futbol bülteninden, seçilen maça ait etkinlik kimliğiyle alınır.",
  };
}

function normalizeBulletin(eventsPayload, marketConfigPayload, competitionsPayload, options = {}) {
  const data = payloadData(eventsPayload) || {};
  const events = Array.isArray(data.events) ? data.events : [];
  const context = {
    configByKey: marketConfigMap(marketConfigPayload),
    competitions: competitionMap(competitionsPayload),
    scoreByEvent: data.sc || {},
  };
  return events
    .map((event) => normalizeEvent(event, context, { includeMarkets: options.includeMarkets === true }))
    .filter(Boolean);
}

async function requestJson(url, options = {}) {
  if (!String(url).startsWith(`${API_ORIGIN}/sportsbook/`)) throw new Error("iddaa_url_not_allowed");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs || REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "FutbolLaboratuvari/1.0" },
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`iddaa_http_${response.status}`);
    const length = Number(response.headers.get("content-length") || 0);
    if (length > MAX_RESPONSE_BYTES) throw new Error("iddaa_response_too_large");
    const text = await response.text();
    if (Buffer.byteLength(text, "utf8") > MAX_RESPONSE_BYTES) throw new Error("iddaa_response_too_large");
    const payload = JSON.parse(text);
    if (!payload || payload.isSuccess === false) throw new Error("iddaa_invalid_response");
    return payload;
  } finally {
    clearTimeout(timer);
  }
}

async function supportData(force = false) {
  const now = Date.now();
  if (!force && supportCache && now - supportCache.createdAt < SUPPORT_CACHE_MS) return supportCache.value;
  const [marketConfig, competitions] = await Promise.all([
    requestJson(MARKET_CONFIG_URL),
    requestJson(COMPETITIONS_URL),
  ]);
  const value = { marketConfig, competitions };
  supportCache = { createdAt: now, value };
  return value;
}

async function fetchIddaaBulletin(options = {}) {
  const [eventsPayload, support] = await Promise.all([
    requestJson(FOOTBALL_EVENTS_URL, options),
    supportData(Boolean(options.force)),
  ]);
  const matches = normalizeBulletin(eventsPayload, support.marketConfig, support.competitions, {
    includeMarkets: options.includeMarkets === true,
  });
  return {
    generated_at: new Date().toISOString(),
    timezone: "Europe/Istanbul",
    source: SOURCE_NAME,
    source_url: SOURCE_PAGE,
    version: payloadData(eventsPayload)?.version ?? null,
    match_count: matches.length,
    matches,
  };
}

async function fetchIddaaEventDetail(eventId, options = {}) {
  const safeId = String(eventId || "").trim();
  if (!/^\d{1,12}$/.test(safeId)) throw new Error("invalid_event_id");
  const [eventPayload, support] = await Promise.all([
    requestJson(`${API_ORIGIN}/sportsbook/event/${safeId}`, options),
    supportData(Boolean(options.force)),
  ]);
  const event = payloadData(eventPayload);
  const match = normalizeEvent(event, {
    configByKey: marketConfigMap(support.marketConfig),
    competitions: competitionMap(support.competitions),
    scoreByEvent: event?.sc ? { [safeId]: event.sc } : {},
  }, { includeMarkets: true });
  if (!match || match.iddaa_event_id !== safeId) throw new Error("iddaa_event_not_found");
  return {
    generated_at: new Date().toISOString(),
    timezone: "Europe/Istanbul",
    source: SOURCE_NAME,
    source_url: SOURCE_PAGE,
    match,
  };
}

module.exports = {
  API_ORIGIN,
  SOURCE_NAME,
  SOURCE_PAGE,
  competitionMap,
  datePartsInIstanbul,
  fetchIddaaBulletin,
  fetchIddaaEventDetail,
  marketConfigMap,
  normalizeBulletin,
  normalizeEvent,
  normalizeMarket,
  requestJson,
};
