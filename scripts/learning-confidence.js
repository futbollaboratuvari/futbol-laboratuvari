"use strict";

const POLICIES = Object.freeze({
  market: Object.freeze({ min_settled: 30, prior_strength: 30, min_distinct_dates: 7, early_penalty_samples: 80, early_penalty_dates: 3, max_weight_shift: 0.06, max_point_shift: 2 }),
  league: Object.freeze({ min_settled: 24, prior_strength: 36, min_distinct_dates: 10, early_penalty_samples: 60, early_penalty_dates: 5, max_weight_shift: 0.04, max_point_shift: 1 }),
  league_market: Object.freeze({ min_settled: 30, prior_strength: 48, min_distinct_dates: 14, early_penalty_samples: 60, early_penalty_dates: 7, max_weight_shift: 0.04, max_point_shift: 1 }),
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function policyFor(scope) {
  return POLICIES[scope] || POLICIES.market;
}

function finiteOdd(value) {
  const number = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(number) && number > 1 ? number : null;
}

function hydrateLearningProfitability(memory) {
  if (!memory || !Array.isArray(memory.predictions)) return memory;
  const maps = {
    market: new Map(),
    league: new Map(),
    league_market: new Map(),
  };
  const append = (map, key, prediction, odd) => {
    const row = map.get(key) || { profit_sample_count: 0, odds_sum: 0, profit_sum: 0, profit_square_sum: 0, dates: new Set() };
    const profit = prediction.status === "won" ? odd - 1 : -1;
    row.profit_sample_count += 1;
    row.odds_sum += odd;
    row.profit_sum += profit;
    row.profit_square_sum += profit ** 2;
    if (prediction.date) row.dates.add(String(prediction.date).slice(0, 10));
    map.set(key, row);
  };

  memory.predictions.forEach((prediction) => {
    if (!["won", "lost"].includes(prediction?.status)) return;
    const odd = finiteOdd(prediction.odds);
    if (!odd) return;
    const market = String(prediction.market || "Belirsiz");
    const league = String(prediction.league || "-");
    append(maps.market, market, prediction, odd);
    append(maps.league, league, prediction, odd);
    append(maps.league_market, `${league} :: ${market}`, prediction, odd);
  });

  const apply = (buckets, stats) => {
    Object.entries(buckets || {}).forEach(([key, bucket]) => {
      const row = stats.get(key) || { profit_sample_count: 0, odds_sum: 0, profit_sum: 0, profit_square_sum: 0, dates: new Set() };
      Object.assign(bucket, {
        profit_sample_count: row.profit_sample_count,
        odds_sum: Number(row.odds_sum.toFixed(4)),
        profit_sum: Number(row.profit_sum.toFixed(4)),
        profit_square_sum: Number(row.profit_square_sum.toFixed(4)),
        distinct_date_count: row.dates.size,
        average_odds: row.profit_sample_count ? Number((row.odds_sum / row.profit_sample_count).toFixed(3)) : null,
        flat_roi: row.profit_sample_count ? Number((row.profit_sum / row.profit_sample_count).toFixed(3)) : null,
      });
    });
  };
  apply(memory.market_memory, maps.market);
  apply(memory.league_memory, maps.league);
  apply(memory.league_market_memory, maps.league_market);
  return memory;
}

function wilsonInterval(won, settled, z = 1.645) {
  if (!settled) return { low: 0, high: 1 };
  const rate = won / settled;
  const zSquared = z ** 2;
  const denominator = 1 + (zSquared / settled);
  const center = (rate + (zSquared / (2 * settled))) / denominator;
  const margin = (z * Math.sqrt(((rate * (1 - rate)) + (zSquared / (4 * settled))) / settled)) / denominator;
  return {
    low: clamp(center - margin, 0, 1),
    high: clamp(center + margin, 0, 1),
  };
}

function evaluateLearningBucket(bucket, scope = "market") {
  const policy = policyFor(scope);
  const won = Math.max(0, Number(bucket?.won || 0));
  const lost = Math.max(0, Number(bucket?.lost || 0));
  const settled = won + lost;
  const profitSampleCount = Math.max(0, Number(bucket?.profit_sample_count || 0));
  const profitSum = Number(bucket?.profit_sum || 0);
  const profitSquareSum = Number(bucket?.profit_square_sum || 0);
  const distinctDateCount = Math.max(0, Number(bucket?.distinct_date_count || 0));
  const successRate = settled ? won / settled : null;
  const adjustedRate = (won + (policy.prior_strength * 0.5)) / (settled + policy.prior_strength);
  const interval = wilsonInterval(won, settled);
  const flatRoi = profitSampleCount ? profitSum / profitSampleCount : null;
  const profitVariance = profitSampleCount > 1
    ? Math.max(0, (profitSquareSum - (profitSampleCount * (flatRoi ** 2))) / (profitSampleCount - 1))
    : null;
  const profitStandardError = profitVariance === null ? null : Math.sqrt(profitVariance / profitSampleCount);
  const roiLow = flatRoi === null || profitStandardError === null ? null : flatRoi - (1.645 * profitStandardError);
  const roiHigh = flatRoi === null || profitStandardError === null ? null : flatRoi + (1.645 * profitStandardError);
  const adjustedRoi = profitSampleCount ? profitSum / (profitSampleCount + policy.prior_strength) : null;
  const sampleReady = profitSampleCount >= policy.min_settled;
  const temporalReady = distinctDateCount >= policy.min_distinct_dates;
  const earlyPenaltyReady = profitSampleCount >= policy.early_penalty_samples
    && distinctDateCount >= policy.early_penalty_dates;
  let state = "neutral";

  // Hit rate alone is not a betting objective: a 50% result can still lose at
  // short odds. Promotions also need temporal diversity. A severe, repeated
  // loss can trigger an earlier downside-only brake without promoting a market.
  if (sampleReady && temporalReady && roiLow > 0.02 && adjustedRoi > 0.03) state = "boost";
  else if (sampleReady && temporalReady && roiHigh < -0.02 && adjustedRoi < -0.03) state = "penalty";
  else if (earlyPenaltyReady && roiHigh < -0.08 && adjustedRoi < -0.10) state = "penalty";

  const direction = state === "boost" ? 1 : state === "penalty" ? -1 : 0;
  const weightShift = direction
    ? Math.min(policy.max_weight_shift, Math.abs(adjustedRoi) * 0.5)
    : 0;
  const pointShift = direction
    ? Math.min(policy.max_point_shift, Math.max(1, Math.round(Math.abs(adjustedRoi) * 15)))
    : 0;

  return {
    scope,
    settled,
    success_rate: successRate === null ? null : Number(successRate.toFixed(3)),
    adjusted_success_rate: Number(adjustedRate.toFixed(3)),
    confidence_low: Number(interval.low.toFixed(3)),
    confidence_high: Number(interval.high.toFixed(3)),
    evaluation_basis: "flat_roi",
    profit_sample_count: profitSampleCount,
    distinct_date_count: distinctDateCount,
    flat_roi: flatRoi === null ? null : Number(flatRoi.toFixed(3)),
    adjusted_roi: adjustedRoi === null ? null : Number(adjustedRoi.toFixed(3)),
    roi_confidence_low: roiLow === null ? null : Number(roiLow.toFixed(3)),
    roi_confidence_high: roiHigh === null ? null : Number(roiHigh.toFixed(3)),
    policy_min_settled: policy.min_settled,
    policy_min_distinct_dates: policy.min_distinct_dates,
    sample_ready: sampleReady,
    temporal_ready: temporalReady,
    learning_active: direction !== 0,
    learning_state: state,
    weight: Number((1 + (direction * weightShift)).toFixed(3)),
    confidence_adjustment: direction * pointShift,
  };
}

function boundedLearningScore(baseScore, weight = 1, delta = 0, independentEvidence = false) {
  const base = clamp(Math.round(Number(baseScore) || 0), 0, 100);
  const raw = clamp(Math.round((base * Number(weight || 1)) + Number(delta || 0)), 0, 100);
  const maxShift = independentEvidence ? 6 : 3;
  return {
    score: clamp(raw, base - maxShift, base + maxShift),
    raw_score: raw,
    max_score_shift: maxShift,
  };
}

module.exports = {
  POLICIES,
  boundedLearningScore,
  evaluateLearningBucket,
  hydrateLearningProfitability,
  policyFor,
  wilsonInterval,
};
