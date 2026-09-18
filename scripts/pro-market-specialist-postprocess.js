"use strict";

const fs = require("fs");
const path = require("path");
const couponRules = require("../pro-coupon-eligibility");
const { findMarketOdd } = require("./pro-goal-market-bridge");
const { VERSION, applyGoalMarketGate, htftAdjustment } = require("./market-specialist-gates");

const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");
const robotPath = path.join(dataDir, "robot-analysis.json");
const livePath = path.join(dataDir, "live-matches.json");
const couponPath = path.join(dataDir, "daily-coupons.json");
const htftPath = path.join(dataDir, "high-odds-htft.json");

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function finite(value) {
  if (value === undefined || value === null || value === "" || value === "-") return null;
  const number = Number(String(value).replace("%", "").replace(",", "."));
  return Number.isFinite(number) ? number : null;
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

function matchName(item) {
  return String(item?.match_name || item?.match || `${item?.home || ""} VS ${item?.away || ""}`).trim();
}

function keyFor(item) {
  return `${String(item?.date || "").slice(0, 10)}|${clean(matchName(item))}`;
}

function poissonTotal(item) {
  const poisson = item?.analysis_metrics?.poisson || item?.metrics?.poisson || item?.poisson || {};
  const direct = finite(poisson.totalLambda ?? poisson.total_lambda);
  if (direct !== null) return direct;
  const home = finite(poisson.homeLambda ?? poisson.home_lambda);
  const away = finite(poisson.awayLambda ?? poisson.away_lambda);
  return home !== null && away !== null ? home + away : null;
}

function averageMemoryOver35(item) {
  const direct = finite(item?.metrics?.over35Percent ?? item?.analysis_metrics?.over35Percent ?? item?.over35Percent);
  if (direct !== null) return direct <= 1 ? direct * 100 : direct;
  const memory = item?.analysis_metrics?.memory || item?.metrics?.memory || {};
  const home = memory.home || {};
  const away = memory.away || {};
  const homeCount = finite(home.count) || 0;
  const awayCount = finite(away.count) || 0;
  const homeRate = finite(home.over35Rate);
  const awayRate = finite(away.over35Rate);
  if (homeCount < 3 || awayCount < 3 || homeRate === null || awayRate === null) return null;
  return (homeRate + awayRate) / 2;
}

function specialistContext(item) {
  const pre = item?.pre_match_final_check || item?.team_intelligence?.pre_match_final_check || {};
  const consensus = item?.source_consensus
    || item?.team_intelligence?.source_consensus
    || item?.team_intelligence?.consensus
    || {};
  return {
    preMatchDecision: pre.effective_decision || pre.decision || "keep",
    sourceConflict: consensus.conflict_level || item?.source_conflict_level || "unknown",
    lineupRisk: item?.lineup_risk_level || item?.team_intelligence?.lineup_risk_level || "Belirsiz",
    squadRisk: item?.squad_risk_level || item?.team_intelligence?.squad_risk_level || "Belirsiz",
  };
}

function impliedOdd(value) {
  const odd = finite(value);
  return odd && odd > 1 ? 1 / odd : null;
}

function pairShare(yesOdd, noOdd) {
  const yes = impliedOdd(yesOdd);
  const no = impliedOdd(noOdd);
  if (!yes || !no) return null;
  return yes / (yes + no);
}

function goalConsensus(item) {
  const odds = item?.available_odds || item?.odds || {};
  const overShare = pairShare(odds.over25, odds.under25);
  const bttsShare = pairShare(odds.bttsYes, odds.bttsNo);
  const values = [];
  if (overShare !== null) values.push({ value: overShare, weight: 0.65 });
  if (bttsShare !== null) values.push({ value: bttsShare, weight: 0.35 });
  if (!values.length) return null;
  const total = values.reduce((sum, row) => sum + row.weight, 0);
  return values.reduce((sum, row) => sum + row.value * row.weight, 0) / total;
}

function goalContext(item, candidate) {
  const rangeOdds = ["goals01", "goals23", "goals45"].map((name) => findMarketOdd([item], name));
  return {
    market: candidate?.market || candidate?.recommended_market,
    totalLambda: poissonTotal(item),
    over35Rate: averageMemoryOver35(item),
    dataCompleteness: finite(candidate?.data_completeness),
    completeRange: rangeOdds.every((value) => value !== null),
    goalConsensus: goalConsensus(item),
    ...specialistContext(item),
  };
}

function specializeCompactGoalCandidate(candidate, item) {
  if (!candidate) return null;
  const normalized = {
    ...candidate,
    recommended_market: candidate.recommended_market || candidate.market,
    market: candidate.market || candidate.recommended_market,
    estimated_odds: candidate.estimated_odds || candidate.odds,
    odds: candidate.odds || candidate.estimated_odds,
    analysis_score: finite(candidate.analysis_score ?? candidate.model_score),
    independent_evidence: candidate.independent_evidence !== false,
    data_gap_risk: candidate.data_gap_risk || candidate.risk_level || "Orta",
    squad_risk_level: candidate.squad_risk_level || item?.squad_risk_level || item?.team_intelligence?.squad_risk_level || "Belirsiz",
    lineup_risk_level: candidate.lineup_risk_level || item?.lineup_risk_level || item?.team_intelligence?.lineup_risk_level || "Belirsiz",
    signals: Array.isArray(candidate.signals) ? candidate.signals : [],
  };
  const adjusted = applyGoalMarketGate(normalized, goalContext(item, normalized));
  adjusted.include_in_coupon = Boolean(candidate.include_in_coupon)
    && adjusted.specialist_eligible !== false
    && couponRules.meetsCouponCriteria(adjusted);
  if (adjusted.specialist_decision === "block") adjusted.risk_level = "Yüksek";
  else if (!adjusted.include_in_coupon && adjusted.risk_level === "Düşük") adjusted.risk_level = "Orta";
  return adjusted;
}

function compactGoal(candidate) {
  if (!candidate) return null;
  return {
    market: candidate.recommended_market || candidate.market,
    odds: candidate.estimated_odds || candidate.odds,
    model_score: candidate.model_score,
    estimated_probability: candidate.estimated_probability,
    market_probability: candidate.market_probability,
    edge_percent: candidate.edge_percent,
    data_completeness: candidate.data_completeness,
    include_in_coupon: Boolean(candidate.include_in_coupon),
    risk_level: candidate.risk_level,
    value_label: candidate.value_label,
    model_version: candidate.model_version,
    robot_reason: candidate.robot_reason,
    market_specialist: candidate.market_specialist || null,
    specialist_decision: candidate.specialist_decision || candidate.market_specialist?.decision || "keep",
    specialist_eligible: candidate.specialist_eligible !== false,
    specialist_quality_score: candidate.specialist_quality_score ?? candidate.market_specialist?.quality_score ?? null,
  };
}

function specializeGoalRow(row) {
  if (!row || !Array.isArray(row.goal_market_candidates)) return row;
  const specialized = row.goal_market_candidates
    .map((candidate) => specializeCompactGoalCandidate(candidate, row))
    .filter(Boolean)
    .sort((a, b) => Number(b.include_in_coupon) - Number(a.include_in_coupon)
      || Number(b.model_score || 0) - Number(a.model_score || 0));
  const best = specialized[0] || null;
  const output = {
    ...row,
    goal_market_candidates: specialized.map(compactGoal),
    goal_market_pick: compactGoal(best),
  };

  const currentMarket = clean(row.recommended_market || row.market || row.selection);
  const currentIsGoal = /3 5 ust|6 gol/.test(currentMarket);
  if (currentIsGoal && best) {
    output.model_score = best.model_score;
    output.analysis_score = best.analysis_score;
    output.confidence_score = `${best.model_score}%`;
    output.market_specialist = best.market_specialist;
    output.include_in_coupon = Boolean(best.include_in_coupon);
    output.robot_comment = best.robot_reason || output.robot_comment;
  }
  return output;
}

function recalcCoupon(coupon) {
  const rows = Array.isArray(coupon?.selected_matches) ? coupon.selected_matches : [];
  const selected = rows.filter((leg) => leg.include_in_coupon !== false && couponRules.meetsCouponCriteria(leg));
  if (!selected.length) {
    return {
      ...coupon,
      selected_matches: [],
      total_odds: "-",
      average_confidence_score: "-",
      combined_estimated_probability: null,
      is_available: false,
      robot_reason: "Market uzman kapısı sonrası uygun seçim kalmadı.",
    };
  }
  const totalOdds = selected.reduce((product, leg) => product * (finite(leg.estimated_odds ?? leg.odds) || 1), 1);
  const average = Math.round(selected.reduce((sum, leg) => sum + Number(leg.model_score || leg.analysis_score || 0), 0) / selected.length);
  const allProbabilities = selected.every((leg) => finite(leg.estimated_probability) !== null);
  const combinedProbability = allProbabilities
    ? Number((selected.reduce((product, leg) => product * (finite(leg.estimated_probability) / 100), 1) * 100).toFixed(1))
    : null;
  return {
    ...coupon,
    selected_matches: selected.map((leg, index) => ({ ...leg, no: index + 1 })),
    total_odds: totalOdds > 1 ? totalOdds.toFixed(2) : "-",
    average_confidence_score: `${average}%`,
    combined_estimated_probability: combinedProbability,
    is_available: true,
  };
}

function processGoalOutputs() {
  const robot = readJson(robotPath, null);
  if (!robot || !Array.isArray(robot.matches)) return { updated: false, candidate_count: 0 };
  const originalMap = new Map(robot.matches.map((row) => [keyFor(row), row]));
  robot.matches = robot.matches.map(specializeGoalRow);
  const candidateMap = new Map();
  for (const row of robot.matches) {
    for (const candidate of row.goal_market_candidates || []) {
      candidateMap.set(`${keyFor(row)}|${clean(candidate.market)}`, { candidate, row });
    }
  }
  robot.market_specialist = {
    ...(robot.market_specialist || {}),
    version: VERSION,
    goal_candidates_checked: candidateMap.size,
  };
  writeJson(robotPath, robot);

  const live = readJson(livePath, null);
  if (live) {
    for (const listName of ["matches", "scheduled_matches", "active_items"]) {
      if (!Array.isArray(live[listName])) continue;
      live[listName] = live[listName].map((row) => {
        const source = originalMap.get(keyFor(row));
        if (!source) return row;
        const specializedSource = robot.matches.find((match) => keyFor(match) === keyFor(row));
        if (!specializedSource) return row;
        return {
          ...row,
          goal_market_candidates: specializedSource.goal_market_candidates,
          goal_market_pick: specializedSource.goal_market_pick,
          market_specialist: specializedSource.market_specialist || row.market_specialist,
          include_in_coupon: clean(row.recommended_market || row.market) === clean(specializedSource.recommended_market || specializedSource.market)
            ? specializedSource.include_in_coupon : row.include_in_coupon,
        };
      });
    }
    live.market_specialist = robot.market_specialist;
    writeJson(livePath, live);
  }

  const daily = readJson(couponPath, null);
  if (daily?.coupons && typeof daily.coupons === "object") {
    for (const [couponKey, coupon] of Object.entries(daily.coupons)) {
      const rows = Array.isArray(coupon?.selected_matches) ? coupon.selected_matches : [];
      const updatedRows = rows.map((leg) => {
        const market = clean(leg.recommended_market || leg.market || leg.selection);
        if (!/3 5 ust|6 gol/.test(market)) return leg;
        const entry = candidateMap.get(`${keyFor(leg)}|${market}`);
        if (!entry) return leg;
        return {
          ...leg,
          ...entry.candidate,
          recommended_market: entry.candidate.market,
          market: entry.candidate.market,
          selection: entry.candidate.market,
          estimated_odds: entry.candidate.odds,
          odds: entry.candidate.odds,
          independent_evidence: true,
        };
      });
      daily.coupons[couponKey] = recalcCoupon({ ...coupon, selected_matches: updatedRows });
    }
    daily.market_specialist = robot.market_specialist;
    writeJson(couponPath, daily);
  }

  return { updated: true, candidate_count: candidateMap.size };
}

function implied(odds) {
  const value = finite(odds);
  return value && value > 1 ? 1 / value : null;
}

function htftOpenness(item) {
  const odds = item?.available_odds || item?.odds || {};
  const over = implied(odds.over25);
  const under = implied(odds.under25);
  let overShare = 0.5;
  if (over && under) overShare = over / (over + under);
  const yes = implied(odds.bttsYes);
  const no = implied(odds.bttsNo);
  let bttsShare = 0.5;
  if (yes && no) bttsShare = yes / (yes + no);
  return clamp01((overShare * 0.65) + (bttsShare * 0.35));
}

function clamp01(value) {
  return Math.max(0.25, Math.min(0.78, value));
}

function specializeHtftPick(pick, raw = {}) {
  const context = specialistContext(raw);
  const adjustment = htftAdjustment({
    market: pick.market,
    firstHalfSource: pick.first_half_signal_source,
    firstHalfVerified: pick.first_half_signal_verified === true,
    openness: finite(pick.openness_score) ?? htftOpenness(raw),
    dataCompleteness: pick.data_completeness,
    scenarioProbability: pick.scenario_probability,
    bookmakerOdds: pick.bookmaker_odds,
    firstHalfDirectionProbability: pick.first_half_direction_probability,
    fullTimeDirectionProbability: pick.full_time_direction_probability,
    identityScore: pick.identity_match_score,
    identitySource: pick.identity_match_source,
    oddsVerified: pick.odds_verified === true,
    ...context,
  });
  const originalScore = finite(pick.model_confidence) || 0;
  const adjustedScore = Math.max(0, Math.round(originalScore + adjustment.delta));
  return {
    ...pick,
    model_confidence: adjustedScore,
    specialist_decision: adjustment.decision,
    specialist_eligible: adjustment.eligible,
    specialist_quality_score: adjustment.quality_score,
    risk_level: adjustment.decision === "block" ? "Yüksek" : pick.risk_level,
    market_specialist: {
      ...adjustment,
      original_model_score: originalScore,
      adjusted_model_score: adjustedScore,
    },
    reason: adjustment.applied
      ? `${pick.reason} Market uzman kararı (${adjustment.decision}): ${adjustment.reasons.join(" ")}`
      : pick.reason,
  };
}

function selectHtftPicks(pool, rawMap = new Map(), limit = 3) {
  const evaluated = (Array.isArray(pool) ? pool : []).map((pick) => {
    const raw = rawMap.get(keyFor(pick)) || {};
    return specializeHtftPick(pick, raw);
  });
  const rejected = evaluated.filter((pick) => pick.specialist_eligible === false);
  const ranked = evaluated
    .filter((pick) => pick.specialist_eligible !== false)
    .sort((a, b) => Number(b.model_confidence || 0) - Number(a.model_confidence || 0)
      || Number(b.specialist_quality_score || 0) - Number(a.specialist_quality_score || 0)
      || Number(b.scenario_probability || 0) - Number(a.scenario_probability || 0));
  const selected = [];
  const used = new Set();
  for (const pick of ranked) {
    const identity = keyFor(pick);
    if (used.has(identity)) continue;
    used.add(identity);
    selected.push(pick);
    if (selected.length >= limit) break;
  }
  return { evaluated, rejected, selected };
}

function processHtftOutput() {
  const output = readJson(htftPath, null);
  if (!output || !Array.isArray(output.picks)) return { updated: false, pick_count: 0 };
  const robot = readJson(robotPath, { matches: [] });
  const rawMap = new Map((robot.matches || []).map((row) => [keyFor(row), row]));
  const pool = Array.isArray(output.specialist_candidate_pool)
    ? output.specialist_candidate_pool
    : output.picks;
  const { evaluated, rejected, selected } = selectHtftPicks(pool, rawMap, 3);
  output.rejected_picks = rejected.map((pick) => ({
    match_name: pick.match_name,
    market: pick.market,
    bookmaker_odds: pick.bookmaker_odds,
    specialist_decision: pick.specialist_decision,
    specialist_quality_score: pick.specialist_quality_score,
    reason: pick.reason,
  }));
  output.picks = selected;
  delete output.specialist_candidate_pool;
  output.market_specialist = {
    version: VERSION,
    htft_picks_checked: evaluated.length,
    htft_picks_rejected: rejected.length,
    htft_picks_eligible: evaluated.length - rejected.length,
    selection_policy: "Tüm doğrulanmış adaylar uzman v3 kapısından geçer; sonra en iyi 3 benzersiz maç seçilir.",
    probability_policy: "Senaryo olasılığı değiştirilmez; uzman v3 yalnız doğrulanmış sinyallerle keep/downgrade/block kararı verir.",
  };
  output.selected_count = output.picks.length;
  if (output.picks.length >= 2) {
    output.status = "ready";
    output.message = "Uzman V3 kalite kapısından geçen en güçlü 1/2 ve 2/1 adayları resmî İddaa oranlarıyla seçildi.";
  } else if (evaluated.length >= 2) {
    output.status = "insufficient_specialist_quality";
    output.message = "Resmî yüksek oranlı İY/MS adayları bulundu ancak uzman V2 kalite kapısından yeterli seçim geçmedi.";
  }
  writeJson(htftPath, output);
  return { updated: true, pick_count: output.picks.length, checked_count: evaluated.length, rejected_count: rejected.length };
}

function main() {
  const mode = process.argv[2] || "all";
  const result = {};
  if (mode === "all" || mode === "goal") result.goal = processGoalOutputs();
  if (mode === "all" || mode === "htft") result.htft = processHtftOutput();
  console.log(JSON.stringify(result));
  return result;
}

if (require.main === module) main();
module.exports = {
  goalContext,
  htftOpenness,
  specialistContext,
  processGoalOutputs,
  processHtftOutput,
  selectHtftPicks,
  specializeHtftPick,
  specializeCompactGoalCandidate,
  specializeGoalRow,
};
