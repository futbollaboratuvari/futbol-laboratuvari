(() => {
  const URLS = {
    live: "./data/canli-veri.json",
    analysis: "./data/analiz_sonuclari.json",
    coupons: "./data/daily-coupons.json"
  };
  const clean = (value) => String(value || "").trim();
  const clamp = (value) => Math.max(0, Math.min(100, Math.round(Number(String(value || "0").replace("%", "")) || 0)));
  const todayKey = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const readJson = async (url, fallback) => {
    try {
      const res = await fetch(`${url}?ts=${Date.now()}`, { cache: "no-store" });
      return res.ok ? await res.json() : fallback;
    } catch { return fallback; }
  };
  const splitMatch = (name) => {
    const text = clean(name);
    const parts = text.split(/\s+-\s+|\s+vs\s+/i);
    return { home: clean(parts[0]) || "Ev sahibi", away: clean(parts[1]) || "Deplasman" };
  };
  const liveRows = (payload) => Array.isArray(payload) ? payload : (Array.isArray(payload?.matches) ? payload.matches : []);
  const extraRows = (analysis, coupons) => {
    const items = [
      ...(Array.isArray(analysis?.active_items) ? analysis.active_items : []),
      ...(Array.isArray(analysis?.predictions) ? analysis.predictions : [])
    ];
    Object.values(coupons?.coupons || {}).forEach((coupon) => {
      if (Array.isArray(coupon?.selected_matches)) items.push(...coupon.selected_matches);
    });
    return items;
  };
  const key = (row) => clean(row.match || row.match_name || `${row.home_team || row.home || ""} - ${row.away_team || row.away || ""}`).toLocaleLowerCase("tr-TR");
  const normalize = (row, map) => {
    const name = clean(row.match || row.match_name || `${row.home_team || row.home || ""} - ${row.away_team || row.away || ""}`);
    const teams = splitMatch(name);
    const helper = map.get(key(row)) || {};
    const score = clamp(helper.analysis_score || helper.confidence_score || helper.score || row.confidence || row.score);
    return {
      date: clean(row.date || row.match_date).slice(0, 10),
      time: clean(row.time || row.start_time || row.saat) || "--:--",
      league: clean(row.league || row.competition_name) || "Lig",
      home: clean(row.home || row.home_team || row.home_team_name) || teams.home,
      away: clean(row.away || row.away_team || row.away_team_name) || teams.away,
      name: name || `${teams.home} - ${teams.away}`,
      option: clean(helper.recommended_market || helper.market || helper.selection || helper.option || row.market || row.selection || row.option) || "Veri bekleniyor",
      odd: clean(helper.estimated_odds || helper.odds || row.odds) || "-",
      confidence: score,
      risk: clean(helper.risk_level || helper.risk || row.risk) || (score >= 70 ? "Düşük" : score >= 55 ? "Orta" : "Yüksek"),
      decision: clean(helper.decision || row.decision) || (score >= 65 ? "✅ Eklenir" : score >= 55 ? "⚠️ Temkinli" : "Veri bekliyor"),
      reason: clean(helper.robot_comment || helper.robot_reason || helper.commentary || row.commentary) || "PC robotu ve eski canlı veri kaynağı üzerinden aktarıldı.",
      raw: row,
      robot: helper
    };
  };
  const applyLegacy = async (state) => {
    if (!state || state.legacy_link_applied || (Array.isArray(state.matches) && state.matches.length)) return null;
    const [live, analysis, coupons] = await Promise.all([
      readJson(URLS.live, []),
      readJson(URLS.analysis, { active_items: [] }),
      readJson(URLS.coupons, { coupons: {} })
    ]);
    const helperMap = new Map(extraRows(analysis, coupons).map((row) => [key(row), row]));
    const today = todayKey();
    const matches = liveRows(live)
      .filter((row) => clean(row.date || row.match_date).slice(0, 10) === today)
      .map((row) => normalize(row, helperMap));
    if (!matches.length) return null;
    return { ...state, matches, legacy_link_applied: true, legacy_source: "canli-veri + analiz_sonuclari + daily-coupons" };
  };
  document.addEventListener("fl:robot-pro122-core", async (event) => {
    const next = await applyLegacy(event.detail || {});
    if (!next) return;
    window.FL_ROBOT_PRO122_STATE = next;
    document.dispatchEvent(new CustomEvent("fl:robot-pro122-core", { detail: next }));
  });
})();
