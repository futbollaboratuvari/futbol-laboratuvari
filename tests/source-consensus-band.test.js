"use strict";

const assert = require("assert");
const { consensusRisk, mergeSignals, labelFor } = require("../scripts/band-lite");

(function sourceRiskMappingIsConservative() {
  assert.strictEqual(consensusRisk({ conflict_level: "high", confidence_score: 90 }), "Yüksek");
  assert.strictEqual(consensusRisk({ conflict_level: "medium", confidence_score: 80 }), "Orta");
  assert.strictEqual(consensusRisk({ conflict_level: "none", confidence_score: 35 }), "Belirsiz");
  assert.strictEqual(consensusRisk({ conflict_level: "none", confidence_score: 85 }), "");
  assert.strictEqual(consensusRisk(null), "");
})();

(function highConflictRaisesEffectiveSquadRisk() {
  const row = { match_name: "Alpha VS Beta", date: "2026-09-17", odds: 2.1, analysis_score: 78 };
  const key = "2026-09-17|alpha vs beta";
  const merged = mergeSignals(row, {
    status: { [key]: { squad_risk_level: "Düşük", verified_team_count: 2, named_player_count: 0 } },
    lineup: { [key]: { lineup_risk_level: "Düşük" } },
    consensus: { [key]: { confidence_score: 45, conflict_level: "high", uncertainty_brake: -4, robot_note: "conflict" } },
    homeAway: {}, standing: {}, league: {},
  });
  assert.strictEqual(merged.band_extra.squad_risk_level, "Yüksek");
  assert.strictEqual(merged.band_extra.source_conflict_level, "high");
  const label = labelFor(merged, { very_short: 1.4, short: 1.65, long: 3, min_score_very_short: 80, min_score_short: 65 });
  assert.strictEqual(label.level, "Yüksek");
})();

(function missingConsensusDoesNotPretendZeroConfidence() {
  const row = { match_name: "Alpha VS Beta", date: "2026-09-17", odds: 2.1, analysis_score: 78 };
  const key = "2026-09-17|alpha vs beta";
  const merged = mergeSignals(row, {
    status: { [key]: { squad_risk_level: "Düşük", verified_team_count: 2, named_player_count: 0 } },
    lineup: { [key]: { lineup_risk_level: "Düşük" } },
    consensus: {}, homeAway: {}, standing: {}, league: {},
  });
  assert.strictEqual(merged.band_extra.source_confidence_score, null);
  assert.strictEqual(merged.band_extra.squad_risk_level, "Düşük");
})();

console.log("source-consensus-band tests passed");
