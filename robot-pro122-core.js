(() => {
  const SOURCE = "robot_pro122_core";
  const URLS = {
    fixtures: "./data/fixtures.json",
    live: "./data/live-matches.json",
    robot: "./data/robot-analysis.json",
    archive: "./data/robot_match_archive.json"
  };
  const cleanKey = (value) => String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(Number(value) || 0)));
  const todayKey = () => new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
  const readJson = async (url, fallback) => {
    try {
      const res = await fetch(`${url}?ts=${Date.now()}`, { cache: "no-store" });
      return res.ok ? await res.json() : fallback;
    } catch {
      return fallback;
    }
  };
  const title = (m) => String(m.match_name || m.match || `${m.home || m.home_team_name || ""} ${m.away || m.away_team_name || ""}`).replace(/\bVS\b/gi, " ").trim();
  const pairKey = (m) => cleanKey(`${m.home || m.home_team_name || ""} ${m.away || m.away_team_name || ""}`);
  const reversePairKey = (m) => cleanKey(`${m.away || m.away_team_name || ""} ${m.home || m.home_team_name || ""}`);
  const robotMap = (robot) => {
    const map = new Map();
    for (const item of robot?.matches || []) {
      const key = cleanKey(title(item));
      if (key) map.set(key, item);
    }
    return map;
  };
  const findRobot = (match, map) => map.get(pairKey(match)) || map.get(reversePairKey(match)) || null;
  const normalize = (match, robotItem) => {
    const name = title(match);
    const parts = name.split(/\s+-\s+|\s+VS\s+/i);
    const home = match.home || match.home_team_name || match.ev_sahibi || parts[0] || "Ev sahibi";
    const away = match.away || match.away_team_name || match.deplasman || parts[1] || "Deplasman";
    const score = clamp(robotItem?.analysis_score ?? robotItem?.confidence_score ?? match.analysis_score ?? match.confidence ?? 0);
    return {
      date: String(match.date || match.tarih || "").slice(0, 10),
      time: match.time || match.saat || match.start_time || "--:--",
      league: match.league || match.competition_name || match.lig || robotItem?.league || "Lig",
      home,
      away,
      name: `${home} - ${away}`,
      option: robotItem?.recommended_market || robotItem?.market || robotItem?.selection || match.suggested_option || "Veri bekleniyor",
      odd: robotItem?.estimated_odds || robotItem?.odds || match.suggested_odds || "-",
      confidence: score,
      risk: robotItem?.risk_level || match.risk_level || (score >= 70 ? "Düşük" : score >= 55 ? "Orta" : "Yüksek"),
      decision: robotItem?.decision || match.decision || (score >= 65 ? "✅ Eklenir" : score >= 55 ? "⚠️ Temkinli" : "Veri bekliyor"),
      reason: robotItem?.robot_comment || robotItem?.robot_reason || match.robot_reason || "Robot ve PRO 12.2 veri akışı bekleniyor.",
      raw: match,
      robot: robotItem || null
    };
  };
  const lastPro122 = () => {
    try {
      const data = JSON.parse(localStorage.getItem("fl_last_pro122_analysis") || "{}");
      return Array.isArray(data.analyses) ? data.analyses : [];
    } catch {
      return [];
    }
  };
  const load = async () => {
    const [fixtures, live, robot, archive] = await Promise.all([
      readJson(URLS.fixtures, []),
      readJson(URLS.live, { matches: [] }),
      readJson(URLS.robot, { matches: [] }),
      readJson(URLS.archive, { matches: [], team_index: {} })
    ]);
    const today = todayKey();
    const source = Array.isArray(live?.matches) && live.matches.length ? live.matches : (Array.isArray(fixtures) ? fixtures : []);
    const map = robotMap(robot || {});
    const matches = source
      .filter((m) => String(m.date || m.tarih || "").slice(0, 10) === today)
      .map((m) => normalize(m, findRobot(m, map)))
      .sort((a, b) => String(a.time || "99:99").localeCompare(String(b.time || "99:99")));
    return { source: SOURCE, loaded_at: new Date().toISOString(), matches, robot: robot || {}, archive: archive || {}, pro122: lastPro122() };
  };
  const refresh = async () => {
    const state = await load();
    window.FL_ROBOT_PRO122_STATE = state;
    document.documentElement.dataset.robotPro122Core = "active";
    document.dispatchEvent(new CustomEvent("fl:robot-pro122-core", { detail: state }));
    return state;
  };
  window.FL_ROBOT_PRO122_CORE = { refresh, load, source: SOURCE };
  document.addEventListener("DOMContentLoaded", () => setTimeout(refresh, 500), { once: true });
  window.addEventListener("load", () => setTimeout(refresh, 900), { once: true });
  document.addEventListener("click", (event) => {
    if (event.target.closest?.("#premium-analysis-panel [data-pa-analyze]")) setTimeout(refresh, 500);
  });
})();
