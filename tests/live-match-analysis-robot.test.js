"use strict";

const assert = require("node:assert/strict");
const {
  VERSION,
  analyzeMatch,
  buildPayload,
} = require("../scripts/live-match-analysis-robot");

const NOW = Date.parse("2026-09-18T19:15:00.000Z");

function liveMatch(overrides = {}) {
  const snap = {
    minute: 62,
    recorded_at: "2026-09-18T19:11:00.000Z",
    observed: true,
    interpolated: false,
    score: { home: 1, away: 0 },
    team_power: { home: 68, away: 32 },
    goal_power: { home: 72, away: 28 },
    momentum: { home: 64, away: 21 },
    data_coverage: {
      ratio: 0.75,
      label: "high",
      common_metric_count: 6,
      expected_goals_observed: { home: true, away: true },
    },
    stats: {
      home: {
        shots_on_goal: 6,
        total_shots: 13,
        corners: 7,
        expected_goals: 1.7,
      },
      away: {
        shots_on_goal: 2,
        total_shots: 6,
        corners: 2,
        expected_goals: 0.55,
      },
    },
  };
  return {
    fixture_id: "live-1",
    status: "live",
    source_verified: true,
    home: "Alpha",
    away: "Beta",
    league: "Test Ligi",
    snapshots: [
      {
        ...snap,
        minute: 55,
        recorded_at: "2026-09-18T19:04:00.000Z",
        score: { home: 0, away: 0 },
        team_power: { home: 60, away: 40 },
        goal_power: { home: 58, away: 25 },
        momentum: { home: 42, away: 20 },
      },
      snap,
    ],
    current: snap,
    ...overrides,
  };
}

const strong = analyzeMatch(liveMatch(), NOW);
assert.equal(strong.robot_version, VERSION);
assert.equal(strong.status, "ready");
assert.equal(strong.result_lean.code, "1", "Ev sahibi güçlü canlı sinyallerde maç yönü 1 olmalı");
assert.equal(strong.next_goal_lean.code, "HOME", "Ev sahibi canlı baskıda sonraki gol eğilimi ev olmalı");
assert.equal(strong.goal_pressure.level, "high", "Yüksek Goal Power yüksek gol baskısı üretmeli");
assert.notEqual(strong.primary_prediction.type, "wait");
assert.ok(Number(strong.primary_prediction.confidence) >= 50);
assert.ok(strong.signals.length >= 3);

const unverified = analyzeMatch(liveMatch({ source_verified: false }), NOW);
assert.equal(unverified.status, "insufficient_data");
assert.equal(unverified.reason, "source_not_verified");
assert.equal(unverified.primary_prediction.type, "wait");

const staleMatch = liveMatch();
staleMatch.current = {
  ...staleMatch.current,
  recorded_at: "2026-09-18T18:20:00.000Z",
};
const stale = analyzeMatch(staleMatch, NOW);
assert.equal(stale.status, "insufficient_data");
assert.equal(stale.reason, "snapshot_stale");

const interpolatedMatch = liveMatch();
interpolatedMatch.current = { ...interpolatedMatch.current, interpolated: true };
const interpolated = analyzeMatch(interpolatedMatch, NOW);
assert.equal(interpolated.status, "insufficient_data");
assert.equal(interpolated.reason, "snapshot_not_observed");

const weakCoverage = liveMatch();
weakCoverage.current = {
  ...weakCoverage.current,
  data_coverage: { ...weakCoverage.current.data_coverage, ratio: 0.25, common_metric_count: 2 },
};
const weak = analyzeMatch(weakCoverage, NOW);
assert.equal(weak.status, "insufficient_data");
assert.equal(weak.reason, "coverage_too_low");

const payload = buildPayload({
  generated_at: "2026-09-18T19:11:00.000Z",
  source_verified: true,
  matches: [liveMatch(), liveMatch({ fixture_id: "bad-2", source_verified: false })],
}, new Date(NOW));
assert.equal(payload.robot_version, VERSION);
assert.equal(payload.summary.live_match_count, 2);
assert.equal(payload.summary.ready_count, 1);
assert.equal(payload.summary.waiting_count, 1);
assert.equal(payload.matches.length, 2);

console.log("live-match-analysis-robot.test.js: OK");
