export const LIVE_LEARNING_VERSION = "live-learning-memory-v1";

export const LIVE_LEARNING_POLICIES = Object.freeze({
  match_direction: Object.freeze({
    base_threshold: 18,
    min_settled: 40,
    min_distinct_matches: 20,
    min_distinct_dates: 7,
    boost_wilson_low: 0.60,
    boost_success_rate: 0.62,
    brake_wilson_high: 0.48,
    brake_success_rate: 0.45,
    brake_min_settled: 80,
    boost_threshold_delta: -1,
    brake_threshold_delta: 2,
  }),
  next_goal: Object.freeze({
    base_threshold: 14,
    min_settled: 40,
    min_distinct_matches: 20,
    min_distinct_dates: 7,
    boost_wilson_low: 0.60,
    boost_success_rate: 0.62,
    brake_wilson_high: 0.48,
    brake_success_rate: 0.45,
    brake_min_settled: 80,
    boost_threshold_delta: -1,
    brake_threshold_delta: 2,
  }),
});

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function policyFor(predictionType) {
  return LIVE_LEARNING_POLICIES[predictionType] || null;
}

export function wilsonInterval(won, settled, z = 1.645) {
  const n = Math.max(0, Number(settled || 0));
  const w = Math.max(0, Number(won || 0));
  if (!n) return { low: 0, high: 1 };
  const rate = w / n;
  const z2 = z ** 2;
  const denominator = 1 + z2 / n;
  const center = (rate + z2 / (2 * n)) / denominator;
  const margin = (z * Math.sqrt(((rate * (1 - rate)) + z2 / (4 * n)) / n)) / denominator;
  return {
    low: clamp(center - margin, 0, 1),
    high: clamp(center + margin, 0, 1),
  };
}

export function evaluateLiveLearningProfile(input = {}) {
  const predictionType = String(input.prediction_type || "");
  const policy = policyFor(predictionType);
  if (!policy) {
    return {
      prediction_type: predictionType,
      learning_state: "unsupported",
      threshold_adjustment: 0,
      learning_active: false,
    };
  }

  const won = Math.max(0, Number(input.won_count || 0));
  const lost = Math.max(0, Number(input.lost_count || 0));
  const settled = Math.max(0, Number(input.settled_count ?? won + lost));
  const distinctMatches = Math.max(0, Number(input.distinct_match_count || 0));
  const distinctDates = Math.max(0, Number(input.distinct_date_count || 0));
  const successRate = settled ? won / settled : null;
  const interval = wilsonInterval(won, settled);
  const sampleReady = settled >= policy.min_settled
    && distinctMatches >= policy.min_distinct_matches
    && distinctDates >= policy.min_distinct_dates;

  let state = "collecting";
  let thresholdAdjustment = 0;
  if (sampleReady) {
    if (interval.low >= policy.boost_wilson_low && successRate >= policy.boost_success_rate) {
      state = "boost";
      thresholdAdjustment = policy.boost_threshold_delta;
    } else if (
      interval.high <= policy.brake_wilson_high
      || (settled >= policy.brake_min_settled && successRate < policy.brake_success_rate)
    ) {
      state = "brake";
      thresholdAdjustment = policy.brake_threshold_delta;
    } else {
      state = "neutral";
    }
  }

  return {
    prediction_type: predictionType,
    settled_count: settled,
    won_count: won,
    lost_count: lost,
    distinct_match_count: distinctMatches,
    distinct_date_count: distinctDates,
    success_rate: successRate === null ? null : Number(successRate.toFixed(4)),
    wilson_low: Number(interval.low.toFixed(4)),
    wilson_high: Number(interval.high.toFixed(4)),
    sample_ready: sampleReady,
    learning_state: state,
    threshold_adjustment: thresholdAdjustment,
    learning_active: state === "boost" || state === "brake",
  };
}

export function effectiveThreshold(predictionType, profile = null) {
  const policy = policyFor(predictionType);
  if (!policy) return null;
  const requested = Number(profile?.threshold_adjustment || 0);
  const bounded = clamp(Number.isFinite(requested) ? Math.round(requested) : 0, -2, 4);
  return policy.base_threshold + bounded;
}

export function minuteBucket(minute, bucketSize = 5) {
  const value = Math.max(0, Math.floor(Number(minute) || 0));
  const size = Math.max(1, Math.floor(Number(bucketSize) || 5));
  return Math.floor(value / size) * size;
}

export function observationKey(fixtureId, predictionType, minute) {
  const fixture = String(fixtureId || "").trim();
  const type = String(predictionType || "").trim();
  if (!fixture || !type) return "";
  return [fixture, type, minuteBucket(minute)].join(":");
}

function scoreNumber(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function scoreDeltaOutcome(previousScore, currentScore) {
  const ph = scoreNumber(previousScore?.home);
  const pa = scoreNumber(previousScore?.away);
  const ch = scoreNumber(currentScore?.home);
  const ca = scoreNumber(currentScore?.away);
  if ([ph, pa, ch, ca].some((value) => value === null)) return null;

  const homeDelta = ch - ph;
  const awayDelta = ca - pa;
  if (homeDelta < 0 || awayDelta < 0) return { resolution: "AMBIGUOUS", home_delta: homeDelta, away_delta: awayDelta };
  if (homeDelta === 0 && awayDelta === 0) return null;
  if (homeDelta > 0 && awayDelta === 0) return { resolution: "HOME", home_delta: homeDelta, away_delta: 0 };
  if (awayDelta > 0 && homeDelta === 0) return { resolution: "AWAY", home_delta: 0, away_delta: awayDelta };
  return { resolution: "AMBIGUOUS", home_delta: homeDelta, away_delta: awayDelta };
}

export function finalDirection(score) {
  const home = scoreNumber(score?.home);
  const away = scoreNumber(score?.away);
  if (home === null || away === null) return null;
  if (home > away) return "1";
  if (away > home) return "2";
  return "X";
}

function observationBase(match, snap, analysis, recordedAt) {
  return {
    fixture_id: String(match?.fixture_id || ""),
    match_date: String(match?.date || "").slice(0, 10) || null,
    league: String(match?.league || ""),
    home: String(match?.home || ""),
    away: String(match?.away || ""),
    observed_at: recordedAt,
    observed_minute: Math.max(0, Math.floor(Number(snap?.minute) || 0)),
    minute_bucket: minuteBucket(snap?.minute),
    score_home: Number(snap?.score?.home) || 0,
    score_away: Number(snap?.score?.away) || 0,
    evidence_score: Number(analysis?.evidence_score) || 0,
    diagnostics: analysis?.diagnostics || {},
    status: "pending",
    model_version: String(match?.collector_version || match?.robot_version || ""),
    learning_version: LIVE_LEARNING_VERSION,
  };
}

export function buildObservationRows(match, snap, analysis, recordedAt) {
  if (!match?.fixture_id || analysis?.status !== "ready") return [];
  const base = observationBase(match, snap, analysis, recordedAt);
  const rows = [];

  if (analysis?.result_lean?.code) {
    rows.push({
      ...base,
      observation_key: observationKey(match.fixture_id, "match_direction", snap?.minute),
      prediction_type: "match_direction",
      predicted_code: String(analysis.result_lean.code),
      signal_strength: Number(analysis.result_lean.strength) || 0,
    });
  }

  if (analysis?.next_goal_lean?.code) {
    rows.push({
      ...base,
      observation_key: observationKey(match.fixture_id, "next_goal", snap?.minute),
      prediction_type: "next_goal",
      predicted_code: String(analysis.next_goal_lean.code),
      signal_strength: Number(analysis.next_goal_lean.strength) || 0,
    });
  }

  return rows.filter((row) => row.observation_key);
}

export function profileSummary(profile, predictionType) {
  const threshold = effectiveThreshold(predictionType, profile);
  return {
    version: LIVE_LEARNING_VERSION,
    prediction_type: predictionType,
    learning_state: String(profile?.learning_state || "collecting"),
    settled_count: Number(profile?.settled_count || 0),
    success_rate: profile?.success_rate === null || profile?.success_rate === undefined
      ? null
      : Number(profile.success_rate),
    threshold_adjustment: Number(profile?.threshold_adjustment || 0),
    effective_threshold: threshold,
    applied: Boolean(profile && Number(profile.threshold_adjustment || 0) !== 0),
  };
}
