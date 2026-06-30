const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const fullPath = path.join(dataDir, "full-bulletin.json");
const sourcePaths = [
  path.join(dataDir, "two-day-bulletin.json"),
  path.join(dataDir, "fixtures.json"),
  path.join(dataDir, "spor_toto_bulteni.json"),
  path.join(dataDir, "live-matches.json")
];

const DETAIL_FIELDS = [
  "analysis_score", "confidence", "risk_level", "decision", "suggested_option", "suggested_odds",
  "recommended_market", "best_market", "en_guclu_market", "prediction", "tahmin",
  "robot_reason", "robot_comment", "include_in_coupon", "coupon_reason",
  "home_form_profile", "away_form_profile", "league_goal_profile", "team_profiles",
  "homeScoredLast10", "awayScoredLast10", "homeConcededLast10", "awayConcededLast10",
  "bttsPercent", "over25Percent", "over35Percent", "firstHalfGoalTrend", "secondHalfGoalTrend",
  "leagueGoalAverage", "goal_expectation", "gol_beklentisi", "raw_market_source",
  "raw_market_source_note", "oddsSource", "lastLiveUpdate", "last_update", "market_odds_inventory",
  "wide_market_odds_count", "liveOdds", "canli_oranlar"
];

const MARKET_LABELS = {
  ms1: "MS 1", msx: "MS X", ms2: "MS 2", under25: "2.5 Alt", over25: "2.5 Ust",
  bttsYes: "KG Var", bttsNo: "KG Yok", firstHalfBttsYes: "Ilk yari KG Var",
  firstHalfBttsNo: "Ilk yari KG Yok", secondHalfBttsYes: "Ikinci yari KG Var",
  secondHalfBttsNo: "Ikinci yari KG Yok", firstHalfKgVar: "Ilk yari KG Var",
  firstHalfKgYok: "Ilk yari KG Yok", secondHalfKgVar: "Ikinci yari KG Var",
  secondHalfKgYok: "Ikinci yari KG Yok", iyKgVar: "Ilk yari KG Var", iyKgYok: "Ilk yari KG Yok",
  iy2KgVar: "Ikinci yari KG Var", iy2KgYok: "Ikinci yari KG Yok", over35: "3.5 Ust", under35: "3.5 Alt"
};

const readJson = (filePath, fallback) => {
  try {
    const text = fs.readFileSync(filePath, "utf8").trim();
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (filePath, value) => fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
const text = (value) => String(value ?? "").trim();
const team = (match, side) => text(match?.[side] || match?.[`${side}_team_name`] || (side === "home" ? match?.ev_sahibi : match?.deplasman));
const dateOf = (match) => text(match?.date || match?.tarih || match?.start_date || match?.utc_date).slice(0, 10);
const timeOf = (match) => text(match?.time || match?.saat || match?.start_time);
const cleanKey = (value) => text(value).toLocaleLowerCase("tr-TR").replace(/ı/g, "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const matchKey = (match) => cleanKey(`${match?.matchCode || match?.match_code || match?.mac_kodu || ""} ${dateOf(match)} ${timeOf(match)} ${team(match, "home")} ${team(match, "away")}`);
const parseOdd = (value) => {
  if (value === null || value === undefined || value === "" || value === "-") return null;
  const number = Number(String(value).replace(",", "."));
  return Number.isFinite(number) && number > 1 ? Number(number.toFixed(2)) : null;
};

const sourceItems = (root) => {
  if (Array.isArray(root)) return root;
  return [
    ...(Array.isArray(root?.matches) ? root.matches : []),
    ...(Array.isArray(root?.scheduled_matches) ? root.scheduled_matches : []),
    ...(Array.isArray(root?.live_matches) ? root.live_matches : []),
    ...(Array.isArray(root?.active_items) ? root.active_items : []),
    ...(Array.isArray(root?.finished_matches) ? root.finished_matches : []),
    ...(Array.isArray(root?.completed_items) ? root.completed_items : []),
    ...(Array.isArray(root?.results) ? root.results : [])
  ];
};

const addMarket = (rows, seen, key, label, value, source) => {
  const odd = parseOdd(value);
  if (!odd) return;
  const safeKey = text(key || label || "market").replace(/\s+/g, "_");
  const id = cleanKey(`${safeKey} ${label} ${odd}`);
  if (seen.has(id)) return;
  seen.add(id);
  rows.push({ key: safeKey, label: label || MARKET_LABELS[safeKey] || safeKey, odd, source: source || "Mackolik" });
};

const collectMarkets = (match) => {
  const rows = [];
  const seen = new Set();
  const odds = { ...(match?.raw_market_guess_odds || {}), ...(match?.odds || {}), ...(match?.available_odds || {}) };
  Object.entries(odds).forEach(([key, value]) => addMarket(rows, seen, key, MARKET_LABELS[key] || key, value, match?.oddsSource || match?.source));

  (Array.isArray(match?.detail_market_candidates) ? match.detail_market_candidates : []).forEach((item, index) => {
    addMarket(rows, seen, item?.key || item?.market_key || `detail_${index}`, item?.label || item?.title || item?.market || item?.guess || `Detay ${index + 1}`, item?.odd ?? item?.odds ?? item?.value ?? item?.price, item?.source || match?.source);
  });

  (Array.isArray(match?.raw_market_blocks) ? match.raw_market_blocks : []).forEach((block, blockIndex) => {
    const values = Array.isArray(block?.items) ? block.items : Array.isArray(block?.outcomes) ? block.outcomes : Array.isArray(block?.options) ? block.options : [];
    if (!values.length) {
      addMarket(rows, seen, block?.key || `block_${blockIndex}`, block?.title || block?.market || block?.guess || `Detay ${blockIndex + 1}`, block?.odd ?? block?.value, block?.source || match?.source);
      return;
    }
    values.forEach((item, index) => addMarket(rows, seen, item?.key || `${block?.key || "block"}_${index}`, item?.label || item?.title || item?.name || `${block?.title || block?.market || "Detay"} ${index + 1}`, item?.odd ?? item?.odds ?? item?.value ?? item?.price, item?.source || block?.source || match?.source));
  });
  return rows;
};

const richness = (match) => DETAIL_FIELDS.reduce((sum, key) => sum + (match?.[key] !== undefined ? 1 : 0), 0)
  + (Array.isArray(match?.raw_market_blocks) ? match.raw_market_blocks.length : 0)
  + (Array.isArray(match?.detail_market_candidates) ? match.detail_market_candidates.length : 0)
  + Object.keys(match?.available_odds || match?.odds || {}).length;

const full = readJson(fullPath, null);
if (!full) {
  throw new Error("data/full-bulletin.json bulunamadi");
}

const richByKey = new Map();
sourcePaths.flatMap((filePath) => sourceItems(readJson(filePath, []))).forEach((match) => {
  const key = matchKey(match);
  if (!key) return;
  const old = richByKey.get(key);
  if (!old || richness(match) > richness(old)) richByKey.set(key, match);
});

const mergeMatch = (match) => {
  const rich = richByKey.get(matchKey(match)) || {};
  const out = { ...rich, ...match };
  DETAIL_FIELDS.forEach((key) => {
    if ((out[key] === undefined || out[key] === "") && rich[key] !== undefined) out[key] = rich[key];
  });
  out.available_odds = Object.fromEntries(Object.entries({ ...(rich.raw_market_guess_odds || {}), ...(rich.odds || {}), ...(rich.available_odds || {}), ...(match.odds || {}), ...(match.available_odds || {}) })
    .map(([key, value]) => [key, parseOdd(value)])
    .filter(([, value]) => value !== null));
  out.odds = { ...out.available_odds };
  out.raw_market_guess_odds = { ...(rich.raw_market_guess_odds || {}), ...(match.raw_market_guess_odds || {}) };
  out.raw_market_blocks = Array.isArray(match.raw_market_blocks) && match.raw_market_blocks.length ? match.raw_market_blocks : (Array.isArray(rich.raw_market_blocks) ? rich.raw_market_blocks : []);
  out.detail_market_candidates = Array.isArray(match.detail_market_candidates) && match.detail_market_candidates.length ? match.detail_market_candidates : (Array.isArray(rich.detail_market_candidates) ? rich.detail_market_candidates : []);
  out.detail_markets = collectMarkets(out);
  out.raw_market_source = out.raw_market_source || out.raw_market_source_note || out.source || "Mackolik veri akisi";
  out.oddsSource = out.oddsSource || out.source || "Mackolik veri akisi";
  out.wide_market_odds_count = out.detail_markets.length || Object.keys(out.available_odds).length;
  out.detail = {
    analysis: out.robot_reason || out.robot_comment || out.analysis || "Detay analizi icin robot verisi bekleniyor.",
    prediction: out.decision || out.suggested_option || out.recommended_market || out.prediction || out.tahmin || "Tahmin verisi bekleniyor",
    confidence: out.analysis_score ?? out.confidence ?? null,
    risk: out.risk_level || "",
    team_info: out.team_profiles || { home: out.home_form_profile || null, away: out.away_form_profile || null },
    league_info: out.league_goal_profile || out.league_info || null,
    goal_expectation: out.goal_expectation || out.gol_beklentisi || out.leagueGoalAverage || null,
    markets: out.detail_markets
  };
  return out;
};

["matches", "live_matches", "finished_matches"].forEach((key) => {
  if (Array.isArray(full[key])) full[key] = full[key].map(mergeMatch);
});
full.wide_market_odds_count = ["matches", "live_matches", "finished_matches"].reduce((sum, key) => sum + (Array.isArray(full[key]) ? full[key].reduce((inner, match) => inner + Object.keys(match.available_odds || {}).length, 0) : 0), 0);
full.detail_enriched_at = new Date().toISOString();
full.detail_source_files = sourcePaths.map((filePath) => path.relative(rootDir, filePath));

writeJson(fullPath, full);
console.log(`Bulten detaylari birlestirildi. Mac: ${(full.matches || []).length}, canli: ${(full.live_matches || []).length}, biten: ${(full.finished_matches || []).length}, oran: ${full.wide_market_odds_count}.`);
