"use strict";

const assert = require("node:assert/strict");
const {
  applyMatchupContext,
  buildMatchupAnalysis,
  marketDirection,
  zoneForPosition,
} = require("../scripts/matchup-intelligence");

function starters(prefix, ratings = {}) {
  const positions = ["G", "D", "D", "D", "D", "M", "M", "M", "F", "F", "F"];
  return positions.map((position, index) => ({
    name: `${prefix} ${index + 1}`,
    position,
    rating: ratings[position] || (position === "G" ? 72 : position === "D" ? 70 : position === "M" ? 74 : 76),
  }));
}

assert.equal(zoneForPosition("GK"), "goalkeeper");
assert.equal(zoneForPosition("CB"), "defense");
assert.equal(zoneForPosition("CM"), "midfield");
assert.equal(zoneForPosition("ST"), "attack");
assert.equal(zoneForPosition("?"), "unknown");
assert.equal(marketDirection("MS 1"), "home");
assert.equal(marketDirection("KG Var"), "btts_yes");
assert.equal(marketDirection("3.5 Üst"), "over");

const homeRecord = {
  formation: "4-3-3",
  lineup_confirmed: true,
  availability_checked: true,
  starting_11: starters("Home", { G: 74, D: 75, M: 80, F: 81 }),
  unavailable: [],
};
const awayRecord = {
  formation: "4-2-3-1",
  lineup_confirmed: true,
  availability_checked: true,
  starting_11: starters("Away", { G: 73, D: 70, M: 71, F: 74 }),
  unavailable: [
    { name: "Away Mid Missing", position: "M", impact_score: 8, impact_level: "Yüksek" },
    { name: "Away CB Missing", position: "D", impact_score: 7.5, impact_level: "Yüksek" },
  ],
};
const homeSummary = {
  team_name: "Home FC",
  formation: "4-3-3",
  lineup_confirmed: true,
  availability_checked: true,
  unavailable_players: [],
};
const awaySummary = {
  team_name: "Away FC",
  formation: "4-2-3-1",
  lineup_confirmed: true,
  availability_checked: true,
  unavailable_players: awayRecord.unavailable,
};

const analysis = buildMatchupAnalysis(homeSummary, awaySummary, homeRecord, awayRecord);
assert.equal(analysis.coverage_score, 100);
assert.equal(analysis.lineup_confirmed_both, true);
assert.equal(analysis.availability_checked_both, true);
assert.equal(analysis.away.zones.midfield.high_impact_missing, 1);
assert.equal(analysis.away.zones.defense.high_impact_missing, 1);
assert.equal(analysis.position_comparison.find((row) => row.zone === "midfield").edge, "home");
assert.ok(analysis.context_edge > 4);
assert.ok(analysis.signals.some((signal) => signal.includes("yüksek etkili eksik")));

const scored = applyMatchupContext({
  market: "MS 1",
  model_score: 70,
  analysis_score: 70,
  score: 70,
  estimated_probability: 58.2,
  pro_signals: [],
}, analysis);
assert.equal(scored.model_score, 71, "doğrulayan kadro eşleşmesi yalnız küçük artı puan vermeli");
assert.equal(scored.estimated_probability, 58.2, "kadro katmanı kalibre olasılığı doğrudan değiştirmemeli");
assert.equal(scored.team_intelligence.matchup_adjustment.delta, 1);

const contradicted = applyMatchupContext({
  market: "MS 2",
  model_score: 70,
  analysis_score: 70,
  score: 70,
  estimated_probability: 47.1,
}, analysis);
assert.equal(contradicted.model_score, 66, "çelişen kadro eşleşmesi güven puanını daha güçlü düşürmeli");
assert.equal(contradicted.estimated_probability, 47.1);

const noData = applyMatchupContext({ market: "KG Var", model_score: 63, analysis_score: 63, score: 63 }, null);
assert.equal(noData.model_score, 63, "veri yoksa mevcut robot davranışı değişmemeli");

console.log("matchup-intelligence.test.js OK");
