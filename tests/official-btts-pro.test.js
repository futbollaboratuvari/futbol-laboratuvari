"use strict";

const assert = require("node:assert/strict");
const { projectOfficialProIndex } = require("../scripts/official-pro-analysis");
const { settle } = require("../scripts/learning-finalizer");

const payload = projectOfficialProIndex({
  generated_at: "2026-08-31T12:00:00.000Z",
  source: "iddaa.com resmi futbol bülteni",
  source_url: "https://www.iddaa.com/program/futbol",
  match_count: 2,
  matches: [
    {
      iddaa_event_id: "9001",
      matchCode: "9001",
      match_code: "9001",
      date: "2026-08-31",
      time: "21:00",
      league: "Test Ligi",
      home: "Ev A",
      away: "Dep A",
      status: "scheduled",
      available_odds: { ms1: 2.1, msx: 3.2, ms2: 3.1, over25: 1.88, under25: 1.82, bttsYes: 1.74, bttsNo: 2.05 },
      odds: { ms1: 2.1, msx: 3.2, ms2: 3.1, over25: 1.88, under25: 1.82, bttsYes: 1.74, bttsNo: 2.05 },
      oddsSource: "iddaa.com resmi futbol bülteni",
    },
    {
      iddaa_event_id: "9002",
      date: "2026-08-31",
      time: "21:15",
      league: "Test Ligi",
      home: "Canlı Ev",
      away: "Canlı Dep",
      status: "live",
      available_odds: { bttsYes: 1.8, bttsNo: 1.9 },
    },
  ],
}, { calibration: { calibration_status: "collecting_probability_history" } }, { today: "2026-08-31" });

assert.equal(payload.official_feed, true);
assert.equal(payload.matches.length, 1, "live events must not enter pre-match PRO analysis");
assert.equal(payload.matches[0].match_code, "9001");
assert.equal(payload.matches[0].btts_analysis.pair_complete, true);
assert.equal(payload.matches[0].btts_analysis.trusted_odds, true);
assert.ok(payload.matches[0].btts_analysis.outcomes.bttsYes.estimated_probability > 0);
assert.ok(payload.matches[0].btts_analysis.outcomes.bttsNo.estimated_probability > 0);
assert.equal(payload.summary.btts_pair_count, 1);
assert.equal(payload.calibration.calibration_status, "collecting_probability_history");
assert.equal(settle("KG Var", "2-1"), "won");
assert.equal(settle("KG Var", "1-0"), "lost");
assert.equal(settle("KG Yok", "1-0"), "won");
assert.equal(settle("KG Yok", "2-1"), "lost");

console.log("official-btts-pro.test.js OK");
