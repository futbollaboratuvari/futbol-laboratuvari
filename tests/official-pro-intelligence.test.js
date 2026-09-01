"use strict";

const assert = require("node:assert/strict");
const {
  buildOfficialProIndex,
  projectOfficialProIndex,
  resetOfficialProCache,
} = require("../scripts/official-pro-analysis");

const now = new Date("2026-09-01T12:00:00.000Z");
const stored = {
  generated_at: "2026-09-01T10:00:00.000Z",
  calibration: { calibration_status: "measured", probability_sample_count: 405 },
  matches: [{
    date: "2026-09-01",
    time: "21:00",
    home: "Birleşik Ev",
    away: "Birleşik Dep",
    match_code: "9901",
    squad_risk_level: "Yüksek",
    lineup_risk_level: "Orta",
    team_status_verified_count: 2,
    named_player_count: 1,
    metrics: { bttsPercent: 70, over25Percent: 66, metric_quality: "verified" },
    team_intelligence: {
      squad_risk_level: "Yüksek",
      lineup_risk_level: "Orta",
      verified_team_count: 2,
      named_player_count: 1,
      home_status: {
        data_status: "verified_structured_data",
        availability_checked: true,
        suspended_players: ["Önemli Oyuncu"],
        verified_source_count: 1,
      },
      away_status: {
        data_status: "verified_structured_data",
        availability_checked: true,
        verified_source_count: 1,
      },
    },
  }],
};

const bulletin = {
  generated_at: "2026-09-01T11:59:00.000Z",
  source: "iddaa.com resmi futbol bülteni",
  matches: [{
    iddaa_event_id: "9901",
    match_code: "9901",
    date: "2026-09-01",
    time: "21:00",
    league: "Test Ligi",
    home: "Birleşik Ev",
    away: "Birleşik Dep",
    status: "scheduled",
    available_odds: {
      ms1: 2.1, msx: 3.25, ms2: 3.15,
      over25: 1.88, under25: 1.82,
      bttsYes: 1.82, bttsNo: 1.96,
    },
  }],
};

const payload = projectOfficialProIndex(bulletin, stored, { today: "2026-09-01", now });
const row = payload.matches[0];

assert.equal(payload.stored_evidence_status, "fresh");
assert.equal(payload.schema_version, 3);
assert.equal(row.match_code, "9901");
assert.equal(row.team_status_verified_count, 2);
assert.equal(row.named_player_count, 1);
assert.equal(row.team_intelligence.home_status.suspended_players[0], "Önemli Oyuncu");
assert.equal(row.metrics.metric_quality, "verified");
assert.equal(row.btts_analysis.outcomes.bttsYes.odd, 1.82, "fresh official odds must win over stored evidence");
assert.equal(row.btts_analysis.team_risk_adjusted, true);
assert.equal(row.btts_analysis.outcomes.bttsYes.risk_level, "Yüksek");
assert.equal(row.include_in_coupon, false, "high squad risk must close automatic coupon eligibility");
assert.equal(payload.summary.team_intelligence_match_count, 1);
assert.equal(payload.summary.verified_squad_match_count, 1);
assert.equal(payload.summary.named_player_match_count, 1);

const stalePayload = projectOfficialProIndex(bulletin, {
  ...stored,
  generated_at: "2026-08-29T10:00:00.000Z",
}, { today: "2026-09-01", now });
assert.equal(stalePayload.stored_evidence_status, "stale");
assert.equal(stalePayload.matches[0].named_player_count, 0, "stale squad evidence must not be merged");

(async () => {
  resetOfficialProCache();
  await assert.rejects(
    buildOfficialProIndex(stored, {
      force: true,
      fetchBulletin: async () => ({ generated_at: now.toISOString(), matches: [] }),
    }),
    (error) => error?.code === "official_bulletin_empty",
  );
  console.log("official-pro-intelligence.test.js OK");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
