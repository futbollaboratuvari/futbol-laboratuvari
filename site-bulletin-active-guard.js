(() => {
  const INACTIVE_STATUSES = new Set(["finished", "cancelled", "postponed"]);
  const TARGET_FILES = ["spor_toto_bulteni.json", "two-day-bulletin.json"];

  const normalizeStatus = (match = {}) =>
    String(match.status || match.liveStatus || "scheduled").trim().toLowerCase();

  const isActiveMatch = (match = {}) => !INACTIVE_STATUSES.has(normalizeStatus(match));

  const shouldFilter = (input) => {
    const url = typeof input === "string" ? input : String(input?.url || "");
    return TARGET_FILES.some((file) => url.includes(file));
  };

  const originalFetch = window.fetch?.bind(window);
  if (!originalFetch || window.__flBulletinActiveGuard) return;
  window.__flBulletinActiveGuard = true;

  window.fetch = async (input, init) => {
    const response = await originalFetch(input, init);
    if (!shouldFilter(input)) return response;

    try {
      const payload = await response.clone().json();
      if (!payload || !Array.isArray(payload.matches)) return response;
      const totalSourceMatches = Number(payload.total_source_matches ?? payload.matches.length);
      const activeMatches = payload.matches.filter(isActiveMatch);
      const filteredPayload = {
        ...payload,
        total_source_matches: totalSourceMatches,
        active_match_count: activeMatches.length,
        removed_finished_count: Math.max(0, totalSourceMatches - activeMatches.length),
        removed_statuses: ["finished", "cancelled", "postponed"],
        match_count: activeMatches.length,
        total_matches: payload.total_matches !== undefined ? activeMatches.length : payload.total_matches,
        matches: activeMatches,
      };
      return new Response(`${JSON.stringify(filteredPayload, null, 2)}\n`, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch {
      return response;
    }
  };
})();
