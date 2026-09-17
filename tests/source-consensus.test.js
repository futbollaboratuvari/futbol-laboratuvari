"use strict";

const assert = require("assert");
const { teamConsensus, combineMatchConsensus, buildConsensus } = require("../scripts/source-consensus");

const fresh = new Date().toISOString();

(function strongVerifiedSourcesStayUnpenalized() {
  const result = teamConsensus({
    availability_checked: true,
    lineup_confirmed: true,
    data_status: "api_lineup_verified",
    injured_players: [],
    suspended_players: [],
    doubtful_players: [],
  }, {
    lineup_confirmed: true,
    starting_11: Array.from({ length: 11 }, (_, i) => ({ name: `Player ${i}` })),
  }, { status_generated_at: fresh, lineup_generated_at: fresh });
  assert.ok(result.confidence_score >= 80);
  assert.strictEqual(result.conflict_level, "none");
  assert.strictEqual(result.uncertainty_brake, 0);
})();

(function unavailableStarterCreatesHighConflict() {
  const result = teamConsensus({
    availability_checked: true,
    lineup_confirmed: true,
    injured_players: ["John Doe"],
    suspended_players: [],
    doubtful_players: [],
  }, {
    lineup_confirmed: true,
    starting_11: [{ name: "John Doe" }, ...Array.from({ length: 10 }, (_, i) => ({ name: `P ${i}` }))],
  }, { status_generated_at: fresh, lineup_generated_at: fresh });
  assert.strictEqual(result.conflict_level, "high");
  assert.strictEqual(result.unavailable_starter_count, 1);
  assert.strictEqual(result.uncertainty_brake, -4);
})();

(function publicNewsAgainstCleanStructuredSourceCreatesConflict() {
  const result = teamConsensus({
    availability_checked: true,
    lineup_confirmed: false,
    injured_players: [],
    suspended_players: [],
    doubtful_players: [],
    injury_news_count: 2,
    evidence: [{ title: "injury" }, { title: "injury 2" }],
  }, {
    lineup_confirmed: false,
    starting_11: [],
  }, { status_generated_at: fresh, lineup_generated_at: fresh });
  assert.strictEqual(result.conflict_level, "medium");
  assert.strictEqual(result.uncertainty_brake, -2);
})();

(function missingSourcesCreateUncertaintyBrake() {
  const result = teamConsensus({}, {}, { status_generated_at: null, lineup_generated_at: null });
  assert.ok(result.confidence_score < 40);
  assert.strictEqual(result.quality, "Belirsiz");
  assert.strictEqual(result.uncertainty_brake, -3);
})();

(function matchConsensusUsesWeakestTeam() {
  const home = { confidence_score: 90, conflict_level: "none", uncertainty_brake: 0 };
  const away = { confidence_score: 52, conflict_level: "medium", uncertainty_brake: -2 };
  const result = combineMatchConsensus(home, away);
  assert.strictEqual(result.confidence_score, 52);
  assert.strictEqual(result.conflict_level, "medium");
  assert.strictEqual(result.uncertainty_brake, -2);
  assert.strictEqual(result.uncertain, true);
})();

(function buildsPairedConsensus() {
  const statusDb = {
    generated_at: fresh,
    matches: [{
      match_name: "Alpha VS Beta",
      date: "2026-09-17",
      league: "Test League",
      home_team: "Alpha",
      away_team: "Beta",
      home_status: { availability_checked: true, lineup_confirmed: true, injured_players: [], suspended_players: [], doubtful_players: [] },
      away_status: { availability_checked: true, lineup_confirmed: true, injured_players: [], suspended_players: [], doubtful_players: [] },
    }],
  };
  const lineupDb = {
    generated_at: fresh,
    matches: [{
      date: "2026-09-17",
      home_lineup: { team_name: "Alpha", lineup_confirmed: true, starting_11: Array.from({ length: 11 }, (_, i) => ({ name: `A${i}` })) },
      away_lineup: { team_name: "Beta", lineup_confirmed: true, starting_11: Array.from({ length: 11 }, (_, i) => ({ name: `B${i}` })) },
    }],
  };
  const output = buildConsensus(statusDb, lineupDb);
  assert.strictEqual(output.match_count, 1);
  assert.strictEqual(output.matches[0].conflict_level, "none");
  assert.ok(output.matches[0].confidence_score >= 80);
})();

console.log("source-consensus tests passed");
