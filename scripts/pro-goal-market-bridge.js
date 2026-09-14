"use strict";

const fs = require("node:fs");
const path = require("node:path");
const couponRules = require("../pro-coupon-eligibility");

const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");
const robotFile = path.join(dataDir, "robot-analysis.json");
const liveFile = path.join(dataDir, "live-matches.json");
const couponFile = path.join(dataDir, "daily-coupons.json");
const archiveDir = path.join(dataDir, "archive");
const BRIDGE_VERSION = "pro-goal-market-bridge-v1";

const ALIASES = Object.freeze({
  over35: ["over35", "ust35", "over3_5", "ust_35", "over35_guess", "over3.5", "3.5ust"],
  under35: ["under35", "alt35", "under3_5", "alt_35", "under35_guess", "under3.5", "3.5alt"],
  goals6plus: ["goals6plus", "goalRange6plus", "goals7plus", "sixPlus", "over55", "ust55", "over5_5", "ust_55", "6plus"],
  goals01: ["goals01", "goalRange01", "goals0to1", "goals0_1", "gol01"],
  goals23: ["goals23", "goalRange23", "goals2to3", "goals2_3", "gol23"],
  goals45: ["goals45", "goalRange45", "goals4to5", "goals4_5", "gol45"],
});

const LABEL_PATTERNS = Object.freeze({
  over35: /(?:3[,.]?5\s*(?:ust|üst)|over\s*3[,.]?5)/i,
  under35: /(?:3[,.]?5\s*(?:alt)|under\s*3[,.]?5)/i,
  goals6plus: /(?:6\s*\+\s*gol|6\s*(?:ve|veya)\s*(?:ustu|üstü|daha fazla)|6\s*plus|over\s*5[,.]?5)/i,
  goals01: /(?:0\s*[-–]\s*1\s*gol|0\s*(?:ile|to)\s*1\s*gol)/i,
  goals23: /(?:2\s*[-–]\s*3\s*gol|2\s*(?:ile|to)\s*3\s*gol)/i,
  goals45: /(?:4\s*[-–]\s*5\s*gol|4\s*(?:ile|to)\s*5\s*gol)/i,
});

function readJson(file, fallback) {
  try {
    const text = fs.readFileSync(file, "utf8").trim();
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function finite(value) {
  if (value === undefined || value === null || value === "" || value === "-") return null;
  const number = Number(String(value).replace("%", "").replace(",", ".").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(number) ? number : null;
}

function odd(value) {
  const number = finite(value);
  return number !== null && number > 1 && number < 1000 ? number : null;
}

function clean(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function compact(value) {
  return clean(value).replace(/\s+/g, "");
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function round1(value) {
  return Number(Number(value).toFixed(1));
}

function todayTR() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function matchName(item) {
  return String(item?.match_name || item?.match || `${item?.home || ""} VS ${item?.away || ""}`).trim();
}

function matchIdentity(item) {
  const code = String(item?.match_code || item?.matchCode || item?.id || "").trim();
  if (code) return `code:${code}`;
  const date = String(item?.date || item?.tarih || "").slice(0, 10);
  const home = clean(item?.home || item?.home_team_name || String(matchName(item)).split(/\s+vs\s+/i)[0]);
  const away = clean(item?.away || item?.away_team_name || String(matchName(item)).split(/\s+vs\s+/i)[1]);
  return `teams:${date}|${home}|${away}`;
}

function objectSources(item) {
  return [
    item,
    item?.available_odds,
    item?.odds,
    item?.oranlar,
    item?.detay_oranlar,
    item?.raw_market_guess_odds,
    item?.detail_market_candidates,
    item?.raw_market_blocks,
    item?.metrics,
    item?.analysis_metrics,
  ].filter(Boolean);
}

function findDirectKeyOdd(value, aliasSet, depth = 0, seen = new Set()) {
  if (!value || typeof value !== "object" || depth > 7 || seen.has(value)) return null;
  seen.add(value);
  if (Array.isArray(value)) {
    for (const row of value) {
      const found = findDirectKeyOdd(row, aliasSet, depth + 1, seen);
      if (found !== null) return found;
    }
    return null;
  }
  for (const [key, raw] of Object.entries(value)) {
    if (aliasSet.has(compact(key))) {
      const parsed = odd(raw);
      if (parsed !== null) return parsed;
      if (raw && typeof raw === "object") {
        for (const candidateKey of ["odd", "odds", "oran", "price", "value"]) {
          const nested = odd(raw[candidateKey]);
          if (nested !== null) return nested;
        }
      }
    }
  }
  for (const raw of Object.values(value)) {
    const found = findDirectKeyOdd(raw, aliasSet, depth + 1, seen);
    if (found !== null) return found;
  }
  return null;
}

function findLabelOdd(value, pattern, depth = 0, seen = new Set()) {
  if (!value || typeof value !== "object" || depth > 7 || seen.has(value)) return null;
  seen.add(value);
  if (Array.isArray(value)) {
    for (const row of value) {
      const found = findLabelOdd(row, pattern, depth + 1, seen);
      if (found !== null) return found;
    }
    return null;
  }
  const label = [value.market, value.market_name, value.label, value.name, value.title, value.option, value.selection, value.key]
    .filter(Boolean).join(" ");
  if (label && pattern.test(label)) {
    for (const key of ["odd", "odds", "oran", "price", "rate", "value"]) {
      const parsed = odd(value[key]);
      if (parsed !== null) return parsed;
    }
  }
  for (const raw of Object.values(value)) {
    const found = findLabelOdd(raw, pattern, depth + 1, seen);
    if (found !== null) return found;
  }
  return null;
}

function findMarketOdd(items, key) {
  const aliasSet = new Set((ALIASES[key] || []).map(compact));
  for (const item of items.filter(Boolean)) {
    for (const source of objectSources(item)) {
      const direct = findDirectKeyOdd(source, aliasSet);
      if (direct !== null) return direct;
    }
  }
  const pattern = LABEL_PATTERNS[key];
  if (!pattern) return null;
  for (const item of items.filter(Boolean)) {
    for (const source of objectSources(item)) {
      const labeled = findLabelOdd(source, pattern);
      if (labeled !== null) return labeled;
    }
  }
  return null;
}

function poissonFrom(items) {
  for (const item of items.filter(Boolean)) {
    const metrics = item.metrics || item.analysis_metrics || {};
    const candidates = [metrics.poisson, item.poisson, metrics, item];
    for (const source of candidates) {
      const home = finite(source?.homeLambda ?? source?.home_lambda ?? source?.poissonHome ?? source?.poisson_home);
      const away = finite(source?.awayLambda ?? source?.away_lambda ?? source?.poissonAway ?? source?.poisson_away);
      if (home !== null && away !== null && home >= 0 && away >= 0) {
        return { homeLambda: home, awayLambda: away, totalLambda: home + away, source: "Poisson" };
      }
    }

    const memory = metrics.memory || {};
    const home = memory.home || {};
    const away = memory.away || {};
    const homeCount = finite(home.count) || 0;
    const awayCount = finite(away.count) || 0;
    if (homeCount >= 3 && awayCount >= 3) {
      const leagueAverage = finite(memory?.league?.goalAverage) || finite(metrics.leagueGoalAverage) || 2.6;
      const baseline = clamp(leagueAverage / 2, 0.8, 1.8);
      const shrink = (raw, count) => baseline + (((finite(raw) || baseline) - baseline) * (count / (count + 5)));
      const homeAttack = shrink(home.goalsForAvg, homeCount);
      const homeDefence = shrink(home.goalsAgainstAvg, homeCount);
      const awayAttack = shrink(away.goalsForAvg, awayCount);
      const awayDefence = shrink(away.goalsAgainstAvg, awayCount);
      const homeLambda = clamp(((homeAttack + awayDefence) / 2) * 1.08, 0.2, 3.8);
      const awayLambda = clamp(((awayAttack + homeDefence) / 2) * 0.92, 0.2, 3.8);
      return { homeLambda, awayLambda, totalLambda: homeLambda + awayLambda, source: "Takım hafızası Poisson" };
    }
  }
  return null;
}

function poissonAtLeast(lambda, goals) {
  if (!Number.isFinite(lambda) || lambda < 0) return null;
  let sum = 0;
  let term = Math.exp(-lambda);
  sum += term;
  for (let k = 1; k < goals; k += 1) {
    term *= lambda / k;
    sum += term;
  }
  return clamp((1 - sum) * 100, 0, 100);
}

function normalizedProbability(selectedOdd, otherOdds) {
  const all = [selectedOdd, ...otherOdds].map(odd);
  if (all.some((value) => value === null)) return null;
  const total = all.reduce((sum, value) => sum + (1 / value), 0);
  return total ? ((1 / selectedOdd) / total) * 100 : null;
}

function over35Metric(items) {
  for (const item of items.filter(Boolean)) {
    const metrics = item.metrics || item.analysis_metrics || {};
    const value = finite(metrics.over35Percent ?? item.over35Percent ?? item.ust35_yuzdesi);
    if (value !== null) return value <= 1 ? value * 100 : clamp(value);
  }
  return null;
}

function averageWeighted(rows) {
  const usable = rows.filter((row) => Number.isFinite(row?.value) && Number.isFinite(row?.weight) && row.weight > 0);
  const weight = usable.reduce((sum, row) => sum + row.weight, 0);
  return weight ? usable.reduce((sum, row) => sum + (row.value * row.weight), 0) / weight : null;
}

function dataRisk(completeness) {
  if (completeness >= 65) return "Düşük";
  if (completeness >= 45) return "Orta";
  return "Yüksek";
}

function baseLeg(item, market, selectedOdd, probability, marketProbability, edge, completeness, modelScore, signals) {
  const squadRisk = item?.squad_risk_level || item?.team_intelligence?.squad_risk_level || "Belirsiz";
  const lineupRisk = item?.lineup_risk_level || item?.team_intelligence?.lineup_risk_level || "Belirsiz";
  const candidate = {
    no: 0,
    id: item?.id || item?.match_code || item?.matchCode || matchIdentity(item),
    match_name: matchName(item),
    home: item?.home || item?.home_team_name || "",
    away: item?.away || item?.away_team_name || "",
    date: item?.date || item?.tarih || "",
    league: item?.league || item?.competition_name || "",
    start_time: item?.start_time || item?.time || "",
    recommended_market: market,
    market,
    selection: market,
    estimated_odds: selectedOdd.toFixed(2),
    odds: selectedOdd.toFixed(2),
    model_score: modelScore,
    analysis_score: modelScore,
    confidence_score: `${modelScore}%`,
    estimated_probability: round1(probability),
    market_probability: marketProbability === null ? null : round1(marketProbability),
    edge_percent: edge === null ? null : round1(edge),
    data_completeness: completeness,
    independent_evidence: true,
    risk_level: dataRisk(completeness),
    data_gap_risk: dataRisk(completeness),
    squad_risk_level: squadRisk,
    lineup_risk_level: lineupRisk,
    value_label: edge !== null && edge >= 7 ? "Yüksek Değer" : edge !== null && edge >= 3 ? "Değerli" : "Piyasa ile Uyumlu",
    model_version: BRIDGE_VERSION,
    evidence_mode: "direct_price_plus_independent_goal_model",
    probability_source: ["doğrudan oran", "bağımsız gol modeli"],
    goal_market_bridge: true,
    signals,
  };
  candidate.robot_reason = signals.slice(0, 4).join(" | ");
  candidate.include_in_coupon = couponRules.meetsCouponCriteria(candidate);
  if (!candidate.include_in_coupon && candidate.risk_level === "Düşük") candidate.risk_level = "Orta";
  return candidate;
}

function analyzeOver35(items) {
  const selectedOdd = findMarketOdd(items, "over35");
  if (selectedOdd === null) return null;
  const underOdd = findMarketOdd(items, "under35");
  const poisson = poissonFrom(items);
  const poissonProbability = poisson ? poissonAtLeast(poisson.totalLambda, 4) : null;
  const metricProbability = over35Metric(items);
  const independent = averageWeighted([
    { value: poissonProbability, weight: poissonProbability === null ? 0 : 0.65 },
    { value: metricProbability, weight: metricProbability === null ? 0 : 0.35 },
  ]);
  if (independent === null) return null;
  const fair = underOdd === null ? (100 / selectedOdd) : normalizedProbability(selectedOdd, [underOdd]);
  const estimated = fair === null ? independent : (independent * 0.72) + (fair * 0.28);
  const edge = fair === null ? null : independent - fair;
  const completeness = Math.round(clamp(
    20 + (poisson ? 38 : 0) + (metricProbability !== null ? 17 : 0) + (underOdd ? 25 : 8),
    0, 100,
  ));
  const score = Math.round(clamp(
    43 + (Math.max(0, estimated - 34) * 0.42) + (completeness * 0.2) + (Math.max(0, edge || 0) * 0.35),
    0, 92,
  ));
  const primary = items.find(Boolean) || {};
  return baseLeg(primary, "3.5 Üst", selectedOdd, estimated, fair, edge, completeness, score, [
    `3.5 Üst doğrudan oranı ${selectedOdd.toFixed(2)}.`,
    poisson ? `${poisson.source} toplam gol beklentisi ${poisson.totalLambda.toFixed(2)}; 4+ gol olasılığı %${round1(poissonProbability)}.` : "Poisson verisi yok.",
    metricProbability !== null ? `Doğrulanmış 3.5 Üst eğilimi %${round1(metricProbability)}.` : "Ek 3.5 Üst metriği yok.",
    fair !== null ? `Piyasa karşılığı %${round1(fair)}; bağımsız model farkı ${edge >= 0 ? "+" : ""}${round1(edge)} puan.` : "Piyasa karşılığı hesaplanamadı.",
  ]);
}

function analyzeSixPlus(items) {
  const selectedOdd = findMarketOdd(items, "goals6plus");
  if (selectedOdd === null) return null;
  const poisson = poissonFrom(items);
  if (!poisson) return null;
  const independent = poissonAtLeast(poisson.totalLambda, 6);
  if (independent === null) return null;
  const rangeOdds = ["goals01", "goals23", "goals45"].map((key) => findMarketOdd(items, key));
  const completeRange = rangeOdds.every((value) => value !== null);
  const marketProbability = completeRange
    ? normalizedProbability(selectedOdd, rangeOdds)
    : clamp(100 / selectedOdd, 1, 99);
  const estimated = (independent * 0.78) + (marketProbability * 0.22);
  const edge = independent - marketProbability;
  const completeness = Math.round(clamp(20 + 45 + (completeRange ? 30 : 10), 0, 100));
  const score = Math.round(clamp(
    47 + (Math.max(0, estimated - 12) * 0.5) + (completeness * 0.2) + (Math.max(0, edge) * 0.45),
    0, 92,
  ));
  const primary = items.find(Boolean) || {};
  return baseLeg(primary, "6+ Gol", selectedOdd, estimated, marketProbability, edge, completeness, score, [
    `6+ Gol doğrudan oranı ${selectedOdd.toFixed(2)}.`,
    `${poisson.source} toplam gol beklentisi ${poisson.totalLambda.toFixed(2)}; 6+ gol olasılığı %${round1(independent)}.`,
    completeRange ? `Gol aralığı marketi tam; marjı temizlenmiş 6+ payı %${round1(marketProbability)}.` : "Gol aralığı marketinin tamamı yok; fiyat kontrolü tek oran üzerinden ihtiyatlı yapıldı.",
    `Model-piyasa farkı ${edge >= 0 ? "+" : ""}${round1(edge)} puan.`,
  ]);
}

function bestGoalCandidates(items) {
  return [analyzeOver35(items), analyzeSixPlus(items)]
    .filter(Boolean)
    .sort((a, b) => Number(b.include_in_coupon) - Number(a.include_in_coupon)
      || b.model_score - a.model_score
      || (b.edge_percent || -99) - (a.edge_percent || -99));
}

function liveRows(payload) {
  return [
    ...(Array.isArray(payload?.matches) ? payload.matches : []),
    ...(Array.isArray(payload?.scheduled_matches) ? payload.scheduled_matches : []),
    ...(Array.isArray(payload?.active_items) ? payload.active_items : []),
  ];
}

function sourceMap(payload) {
  const map = new Map();
  for (const row of liveRows(payload)) map.set(matchIdentity(row), row);
  return map;
}

function compactCandidate(candidate) {
  if (!candidate) return null;
  return {
    market: candidate.recommended_market,
    odds: candidate.estimated_odds,
    model_score: candidate.model_score,
    estimated_probability: candidate.estimated_probability,
    market_probability: candidate.market_probability,
    edge_percent: candidate.edge_percent,
    data_completeness: candidate.data_completeness,
    include_in_coupon: candidate.include_in_coupon,
    risk_level: candidate.risk_level,
    value_label: candidate.value_label,
    model_version: candidate.model_version,
    robot_reason: candidate.robot_reason,
  };
}

function promoteRobotMatch(match, sources, candidates) {
  const best = candidates[0] || null;
  const next = {
    ...match,
    goal_market_bridge_version: BRIDGE_VERSION,
    goal_market_candidates: candidates.map(compactCandidate),
    goal_market_pick: compactCandidate(best),
    available_odds: { ...(match.available_odds || {}) },
  };
  const over35 = findMarketOdd(sources, "over35");
  const goals6plus = findMarketOdd(sources, "goals6plus");
  if (over35 !== null) next.available_odds.over35 = over35;
  if (goals6plus !== null) next.available_odds.goals6plus = goals6plus;

  const currentScore = finite(match.model_score ?? match.analysis_score ?? match.confidence_score) || 0;
  const shouldPromote = best?.include_in_coupon === true
    && (match.include_in_coupon !== true || best.model_score >= currentScore + 2);
  if (!shouldPromote) return next;

  return {
    ...next,
    recommended_market: best.recommended_market,
    market: best.recommended_market,
    selection: best.recommended_market,
    estimated_odds: best.estimated_odds,
    odds: best.estimated_odds,
    model_score: best.model_score,
    analysis_score: best.analysis_score,
    confidence_score: `${best.model_score}%`,
    estimated_probability: best.estimated_probability,
    market_probability: best.market_probability,
    edge_percent: best.edge_percent,
    data_completeness: best.data_completeness,
    independent_evidence: true,
    evidence_mode: best.evidence_mode,
    probability_source: best.probability_source,
    include_in_coupon: true,
    risk_level: best.risk_level,
    data_gap_risk: best.data_gap_risk,
    value_label: best.value_label,
    model_version: best.model_version,
    robot_comment: best.robot_reason,
    signals: [...(Array.isArray(match.signals) ? match.signals : []), ...best.signals].slice(0, 10),
  };
}

function enrichLiveRow(row, candidateMap) {
  const entry = candidateMap.get(matchIdentity(row));
  if (!entry) return row;
  const best = entry.candidates[0] || null;
  const available = { ...(row.available_odds || {}) };
  const over35 = findMarketOdd(entry.sources, "over35");
  const goals6plus = findMarketOdd(entry.sources, "goals6plus");
  if (over35 !== null) available.over35 = over35;
  if (goals6plus !== null) available.goals6plus = goals6plus;
  return {
    ...row,
    available_odds: available,
    odds: { ...(row.odds || {}), ...(over35 !== null ? { over35 } : {}), ...(goals6plus !== null ? { goals6plus } : {}) },
    market_odds_inventory: [...new Set([...(row.market_odds_inventory || []), ...(over35 !== null ? ["over35"] : []), ...(goals6plus !== null ? ["goals6plus"] : [])])],
    goal_market_bridge_version: BRIDGE_VERSION,
    goal_market_candidates: entry.candidates.map(compactCandidate),
    goal_market_pick: compactCandidate(best),
  };
}

function productOdds(legs) {
  const product = legs.reduce((value, leg) => value * (odd(leg.estimated_odds) || 1), 1);
  return product > 1 ? product.toFixed(2) : "-";
}

function combinedProbability(legs) {
  if (!legs.length) return null;
  const result = legs.reduce((value, leg) => value * ((finite(leg.estimated_probability) || 0) / 100), 1) * 100;
  return round1(result);
}

function couponFromLegs(previous, legs) {
  const selected = legs.map((leg, index) => ({ ...leg, no: index + 1 }));
  if (!selected.length) {
    return {
      ...(previous || {}),
      coupon_name: previous?.coupon_name || "Riskli Laboratuvar Kuponu",
      coupon_type: previous?.coupon_type || "risk_lab",
      selected_matches: [],
      total_odds: "-",
      average_confidence_score: "-",
      combined_estimated_probability: null,
      risk_level: "-",
      short_description: "Doğrulanmış yüksek gol seçeneği yok.",
      robot_reason: "3.5 Üst / 6+ Gol için doğrudan oran ve bağımsız model eşikleri sağlanmadı.",
      is_available: false,
    };
  }
  const average = Math.round(selected.reduce((sum, leg) => sum + Number(leg.model_score || 0), 0) / selected.length);
  return {
    ...(previous || {}),
    coupon_name: "Riskli Laboratuvar Kuponu",
    coupon_type: "risk_lab",
    selected_matches: selected,
    total_odds: productOdds(selected),
    average_confidence_score: `${average}%`,
    combined_estimated_probability: combinedProbability(selected),
    risk_level: selected.some((leg) => /6\+ Gol/i.test(leg.recommended_market)) ? "Orta-Yüksek" : "Orta",
    short_description: "3.5 Üst ve 6+ Gol dahil, yalnız doğrulanmış PRO yüksek gol adayları.",
    robot_reason: `${selected.length} yüksek gol seçeneği doğrudan oran + bağımsız model filtresini geçti.`,
    is_available: true,
  };
}

function sanitizeCoupon(coupon) {
  if (!coupon || typeof coupon !== "object") return coupon;
  const rows = (Array.isArray(coupon.selected_matches) ? coupon.selected_matches : [])
    .filter((leg) => couponRules.isCouponEligible(leg));
  if (rows.length === (coupon.selected_matches || []).length) return coupon;
  if (!rows.length) {
    return {
      ...coupon,
      selected_matches: [],
      total_odds: "-",
      average_confidence_score: "-",
      combined_estimated_probability: null,
      risk_level: "-",
      is_available: false,
      short_description: `Merkezi minimum oran filtresi (${couponRules.MIN_COUPON_ODD.toFixed(2)}) sonrası uygun seçim kalmadı.`,
      robot_reason: "Düşük oranlı seçimler kupondan çıkarıldı.",
    };
  }
  const average = Math.round(rows.reduce((sum, leg) => sum + Number(leg.model_score || leg.analysis_score || 0), 0) / rows.length);
  return {
    ...coupon,
    selected_matches: rows.map((leg, index) => ({ ...leg, no: index + 1 })),
    total_odds: productOdds(rows),
    average_confidence_score: `${average}%`,
    combined_estimated_probability: combinedProbability(rows),
    is_available: true,
    robot_reason: `${rows.length} seçim merkezi minimum oran ve PRO uygunluk filtresini geçti.`,
  };
}

function mergeRiskLab(existing, candidates) {
  const existingLegs = (Array.isArray(existing?.selected_matches) ? existing.selected_matches : [])
    .filter((leg) => couponRules.isCouponEligible(leg));
  const pool = [...existingLegs, ...candidates.filter((candidate) => candidate.include_in_coupon)];
  const seen = new Set();
  const unique = pool.filter((leg) => {
    const key = `${clean(leg.match_name)}|${clean(leg.recommended_market)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const ranked = unique
    .sort((a, b) => {
      const bonusA = /6\+ Gol/i.test(a.recommended_market) ? 3 : 0;
      const bonusB = /6\+ Gol/i.test(b.recommended_market) ? 3 : 0;
      return (Number(b.model_score || 0) + bonusB) - (Number(a.model_score || 0) + bonusA)
        || Number(b.edge_percent || -99) - Number(a.edge_percent || -99);
    })
    .slice(0, 3);
  return couponFromLegs(existing, ranked);
}

function runBridge() {
  const robot = readJson(robotFile, { matches: [], summary: {} });
  const live = readJson(liveFile, { matches: [], scheduled_matches: [] });
  const daily = readJson(couponFile, { coupons: {} });
  const liveMap = sourceMap(live);
  const candidateMap = new Map();
  const allEligibleGoalCandidates = [];

  const robotMatches = Array.isArray(robot.matches) ? robot.matches : [];
  const updatedMatches = robotMatches.map((match) => {
    const liveMatch = liveMap.get(matchIdentity(match));
    const sources = [match, liveMatch].filter(Boolean);
    const candidates = bestGoalCandidates(sources);
    candidateMap.set(matchIdentity(match), { sources, candidates });
    allEligibleGoalCandidates.push(...candidates.filter((candidate) => candidate.include_in_coupon));
    return promoteRobotMatch(match, sources, candidates);
  });

  robot.matches = updatedMatches;
  robot.goal_market_bridge = {
    version: BRIDGE_VERSION,
    over35_candidate_count: updatedMatches.filter((row) => (row.goal_market_candidates || []).some((candidate) => candidate.market === "3.5 Üst")).length,
    six_plus_candidate_count: updatedMatches.filter((row) => (row.goal_market_candidates || []).some((candidate) => candidate.market === "6+ Gol")).length,
    coupon_eligible_count: allEligibleGoalCandidates.length,
    minimum_coupon_odd: couponRules.MIN_COUPON_ODD,
  };
  robot.summary = {
    ...(robot.summary || {}),
    goal_market_candidate_count: allEligibleGoalCandidates.length,
  };

  for (const key of ["matches", "scheduled_matches", "active_items"]) {
    if (Array.isArray(live[key])) live[key] = live[key].map((row) => enrichLiveRow(row, candidateMap));
  }
  live.goal_market_bridge = robot.goal_market_bridge;
  if (Array.isArray(live.focused_markets)) {
    live.focused_markets = [...new Set([...live.focused_markets, "3.5 Üst", "6+ Gol"])];
    if (live.counts && typeof live.counts === "object") live.counts.focused_markets = live.focused_markets.length;
  }

  const coupons = daily.coupons && typeof daily.coupons === "object" ? daily.coupons : {};
  const sanitized = {};
  for (const [key, coupon] of Object.entries(coupons)) sanitized[key] = sanitizeCoupon(coupon);
  sanitized.risk_lab = mergeRiskLab(sanitized.risk_lab || coupons.risk_lab, allEligibleGoalCandidates);
  daily.coupons = sanitized;
  daily.source = `${daily.source || "PRO"} + ${BRIDGE_VERSION}`;
  daily.minimum_coupon_odd = couponRules.MIN_COUPON_ODD;
  daily.goal_market_bridge = robot.goal_market_bridge;
  daily.candidate_count = Object.values(sanitized).reduce((sum, coupon) => sum + (Array.isArray(coupon?.selected_matches) ? coupon.selected_matches.length : 0), 0);
  daily.message = allEligibleGoalCandidates.length
    ? `${allEligibleGoalCandidates.length} doğrulanmış 3.5 Üst / 6+ Gol adayı yüksek gol filtresinden geçti.`
    : "3.5 Üst / 6+ Gol tarandı; eşikleri geçen yeni yüksek gol adayı oluşmadı.";

  writeJson(robotFile, robot);
  writeJson(liveFile, live);
  writeJson(couponFile, daily);

  const archiveFile = path.join(archiveDir, `${todayTR()}.json`);
  const archive = readJson(archiveFile, null);
  if (archive && typeof archive === "object") {
    archive.robotAnalysis = robot;
    archive.liveMatches = live;
    archive.dailyCoupons = daily;
    writeJson(archiveFile, archive);
  }

  return {
    bridge_version: BRIDGE_VERSION,
    robot_match_count: updatedMatches.length,
    eligible_goal_candidate_count: allEligibleGoalCandidates.length,
    six_plus_count: allEligibleGoalCandidates.filter((candidate) => candidate.recommended_market === "6+ Gol").length,
    over35_count: allEligibleGoalCandidates.filter((candidate) => candidate.recommended_market === "3.5 Üst").length,
    minimum_coupon_odd: couponRules.MIN_COUPON_ODD,
  };
}

if (require.main === module) {
  const result = runBridge();
  console.log(`PRO goal market bridge tamamlandı: ${JSON.stringify(result)}`);
}

module.exports = {
  ALIASES,
  BRIDGE_VERSION,
  analyzeOver35,
  analyzeSixPlus,
  bestGoalCandidates,
  findMarketOdd,
  matchIdentity,
  poissonAtLeast,
  runBridge,
  sanitizeCoupon,
};
