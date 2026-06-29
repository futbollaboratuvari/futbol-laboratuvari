const LIVE_WINDOW_MINUTES = 130;

const normalizeStatusToken = (value) => String(value || "")
  .trim()
  .toLocaleLowerCase("tr-TR")
  .replace(/ı/g, "i")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");

const SCHEDULED_STATUSES = new Set(["", "ns", "not_started", "scheduled", "fixture", "tbd", "time_to_be_defined", "bekliyor", "programda"]);
const LIVE_STATUSES = new Set(["live", "canli", "inplay", "in_play", "1h", "first_half", "ht", "half_time", "2h", "second_half", "et", "extra_time", "bt", "break", "int", "interrupted", "susp", "suspended", "paused"]);
const FINISHED_STATUSES = new Set(["ft", "aet", "pen", "finished", "ended", "complete", "completed", "fulltime", "full_time", "match_finished", "ms", "bitti", "sonuclandi", "tamamlandi"]);
const POSTPONED_STATUSES = new Set(["pst", "postponed", "ertelendi"]);
const CANCELLED_STATUSES = new Set(["canc", "cancelled", "canceled", "iptal"]);

const INACTIVE_BULLETIN_STATUSES = new Set([
  ...LIVE_STATUSES,
  ...FINISHED_STATUSES,
  ...POSTPONED_STATUSES,
  ...CANCELLED_STATUSES,
]);

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

const turkeyNow = () => {
  const parts = turkeyParts();
  const hour = Number(parts.hour === "24" ? "0" : parts.hour || 0);
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minute: hour * 60 + Number(parts.minute || 0),
  };
};

const toIsoDate = (value) => {
  const text = String(value || "").trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
  const dot = text.match(/\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/);
  return dot ? `${dot[3]}-${dot[2].padStart(2, "0")}-${dot[1].padStart(2, "0")}` : "";
};

const clockMinutes = (time) => {
  const match = String(time || "").trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};

const normalizeBulletinStatus = (match = {}) =>
  normalizeStatusToken(match.status || match.liveStatus || match.result_status || match.fixture_status || "scheduled");

const classifyBulletinMatch = (match = {}, now = turkeyNow()) => {
  const status = normalizeBulletinStatus(match);
  if (CANCELLED_STATUSES.has(status)) return "cancelled";
  if (POSTPONED_STATUSES.has(status)) return "postponed";
  if (FINISHED_STATUSES.has(status)) return "finished";
  if (LIVE_STATUSES.has(status)) return "live";

  const date = toIsoDate(match.date || match.tarih || match.start_date || match.utc_date);
  const minute = clockMinutes(match.time || match.saat || match.start_time);
  if (!date || minute === null) return SCHEDULED_STATUSES.has(status) ? "scheduled" : "finished";
  if (date < now.date) return "finished";
  if (date > now.date) return "scheduled";

  const elapsed = now.minute - minute;
  if (elapsed < 0) return "scheduled";
  if (elapsed <= LIVE_WINDOW_MINUTES) return "live";
  return "finished";
};

const isActiveBulletinMatch = (match = {}) =>
  classifyBulletinMatch(match) === "scheduled";

const filterActiveBulletinMatches = (matches) =>
  (Array.isArray(matches) ? matches : []).filter(isActiveBulletinMatch);

const countInactiveBulletinMatches = (matches) =>
  (Array.isArray(matches) ? matches : []).reduce((count, match) =>
    count + (isActiveBulletinMatch(match) ? 0 : 1), 0);

module.exports = {
  LIVE_WINDOW_MINUTES,
  INACTIVE_BULLETIN_STATUSES,
  normalizeBulletinStatus,
  classifyBulletinMatch,
  isActiveBulletinMatch,
  filterActiveBulletinMatches,
  countInactiveBulletinMatches,
};
