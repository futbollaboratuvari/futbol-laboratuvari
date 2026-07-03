const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");
const outDir = path.join(root, "outputs");
const fullPath = path.join(dataDir, "full-bulletin.json");
const cachePath = path.join(dataDir, "full-bulletin-cache.json");
const healthPath = path.join(dataDir, "full-bulletin-health.json");
const reportPath = path.join(outDir, "full_bulletin_test_report.md");
const LIVE_WINDOW = 130;

function readJson(file, fallback) {
  try {
    const text = fs.readFileSync(file, "utf8").trim();
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function writeText(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text, "utf8");
}

function trParts() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date()).reduce((acc, part) => {
    if (part.type !== "literal") acc[part.type] = part.value;
    return acc;
  }, {});
}

function todayTR() {
  const p = trParts();
  return `${p.year}-${p.month}-${p.day}`;
}

function nowMin() {
  const p = trParts();
  const hour = Number(p.hour === "24" ? "0" : p.hour || 0);
  return hour * 60 + Number(p.minute || 0);
}

function addDays(dateKey, days) {
  const [y, m, d] = String(dateKey).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + days, 12)).toISOString().slice(0, 10);
}

function clockMin(time) {
  const m = String(time || "").match(/^(\d{1,2}):(\d{2})$/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
}

function statusOf(match) {
  const date = String(match.date || "").slice(0, 10);
  const start = clockMin(match.time);
  const today = todayTR();
  if (!date || start === null) return String(match.status || "scheduled").toLowerCase();
  if (date < today) return "finished";
  if (date > today) return "scheduled";
  const elapsed = nowMin() - start;
  if (elapsed < 0) return "scheduled";
  if (elapsed <= LIVE_WINDOW) return "live";
  return "finished";
}

function minuteOf(match, status) {
  const n = Number(match.minute || match.elapsed || match.matchMinute);
  if (Number.isFinite(n) && n > 0) return Math.min(120, Math.round(n));
  if (status !== "live") return null;
  const start = clockMin(match.time);
  if (start === null) return null;
  const elapsed = nowMin() - start;
  return Math.max(1, Math.min(90, elapsed > 60 ? elapsed - 15 : elapsed));
}

function inWindow(match) {
  const today = todayTR();
  const tomorrow = addDays(today, 1);
  const date = String(match.date || "").slice(0, 10);
  const minute = clockMin(match.time);
  if (!date || minute === null) return false;
  return date === today || date === tomorrow;
}

function oddsCount(match) {
  return Object.values(match.available_odds || match.odds || {}).filter((v) => v !== null && v !== undefined && v !== "" && v !== "-").length;
}

function normalize(source, sourceName) {
  const raw = [
    ...(Array.isArray(source?.matches) ? source.matches : []),
    ...(Array.isArray(source?.live_matches) ? source.live_matches : []),
  ].filter(inWindow).map((match) => {
    const status = statusOf(match);
    return { ...match, status, liveStatus: status, minute: minuteOf(match, status) };
  });
  const scheduled = raw.filter((m) => m.status === "scheduled");
  const live = raw.filter((m) => m.status === "live");
  const finished = raw.filter((m) => m.status === "finished");
  const today = todayTR();
  const tomorrow = addDays(today, 1);
  return {
    ...(source || {}),
    generated_at: new Date().toISOString(),
    timezone: "Europe/Istanbul",
    source: sourceName || source?.source || "Futbol Laboratuvari bulten akisi",
    status: scheduled.length || live.length ? "active" : "waiting",
    message: scheduled.length || live.length ? "" : "Guncel mac verisi henuz olusmadi.",
    date_window: { main_day: today, includes_next_day_until: `${tomorrow} 23:59` },
    match_count: scheduled.length,
    live_count: live.length,
    scheduled_count: scheduled.length,
    finished_count: finished.length,
    wide_market_odds_count: scheduled.reduce((sum, item) => sum + oddsCount(item), 0),
    matches: scheduled,
    live_matches: live,
  };
}

const current = normalize(readJson(fullPath, null), null);
const cached = normalize(readJson(cachePath, null), "Son saglam futbol bulteni yedegi");
const useCache = !current.matches.length && !current.live_matches.length && (cached.matches.length || cached.live_matches.length);
const bulletin = useCache ? { ...cached, repair_note: "Ana bulten bos geldigi icin cache yedeginden geri beslendi." } : current;

if (bulletin.matches.length || bulletin.live_matches.length || useCache) writeJson(fullPath, bulletin);

const health = {
  generated_at: new Date().toISOString(),
  status: bulletin.matches.length || bulletin.live_matches.length ? "pass" : "waiting",
  source_status: bulletin.status || "missing",
  full_bulletin_exists: true,
  restored_from_cache: useCache,
  match_count: bulletin.matches.length,
  live_match_count: bulletin.live_matches.length,
  finished_count: bulletin.finished_count || 0,
  first_match: bulletin.live_matches[0] || bulletin.matches[0] || null,
  date_window: bulletin.date_window || null,
  notes: bulletin.matches.length || bulletin.live_matches.length
    ? ["Bulten veri akisi aktif.", "Biten maclar ana bultenden cikarildi.", "Baslayan maclar live_matches alanina ayrildi.", "Bugun ve yarin tam gun bulten penceresi korunuyor."]
    : ["Bulten verisi uretilemedi."],
};
writeJson(healthPath, health);

const firstRows = [...(bulletin.live_matches || []), ...(bulletin.matches || [])].slice(0, 10);
writeText(reportPath, [
  "# Full Bulletin Test Report",
  "",
  `- Status: ${health.status}`,
  `- Restored from cache: ${health.restored_from_cache}`,
  `- Scheduled match count: ${health.match_count}`,
  `- Live match count: ${health.live_match_count}`,
  `- Finished removed count: ${health.finished_count}`,
  `- Date window: ${bulletin.date_window?.main_day || "-"} / ${bulletin.date_window?.includes_next_day_until || "-"}`,
  "",
  ...firstRows.map((m) => `- ${m.date} ${m.time} | ${m.home} - ${m.away} | ${m.status}`),
  "",
].join("\n"));

console.log(`Full bulletin final check: ${health.status}. Scheduled: ${health.match_count}. Live: ${health.live_match_count}. Cache: ${health.restored_from_cache}. Window: ${bulletin.date_window?.includes_next_day_until || "-"}.`);
