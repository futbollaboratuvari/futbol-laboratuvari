const INACTIVE_BULLETIN_STATUSES = new Set(["finished", "cancelled", "postponed"]);

const normalizeBulletinStatus = (match = {}) =>
  String(match.status || match.liveStatus || "scheduled").trim().toLowerCase();

const isActiveBulletinMatch = (match = {}) =>
  !INACTIVE_BULLETIN_STATUSES.has(normalizeBulletinStatus(match));

const filterActiveBulletinMatches = (matches) =>
  (Array.isArray(matches) ? matches : []).filter(isActiveBulletinMatch);

const countInactiveBulletinMatches = (matches) =>
  (Array.isArray(matches) ? matches : []).reduce((count, match) =>
    count + (isActiveBulletinMatch(match) ? 0 : 1), 0);

module.exports = {
  INACTIVE_BULLETIN_STATUSES,
  normalizeBulletinStatus,
  isActiveBulletinMatch,
  filterActiveBulletinMatches,
  countInactiveBulletinMatches,
};
