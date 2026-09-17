"use strict";

const assert = require("node:assert/strict");
const {
  buildProIndexFromPayload,
  readRemoteProIndex,
  resetRemoteProIndexCache,
} = require("../server-lib/pro-index-from-github");

const robot = {
  generated_at: "2026-09-17T20:30:00.000Z",
  date: "2026-09-17",
  engine: "Futbol Laboratuvarı PRO 14",
  model_version: "pro14-test",
  matches: [
    {
      date: "2026-09-18",
      start_time: "20:00",
      league: "Test Ligi",
      home: "Ev Takımı",
      away: "Deplasman Takımı",
      recommended_market: "3.5 Üst",
      model_score: 71,
      estimated_probability: 58,
      market_probability: 44,
      edge_percent: 14,
      data_completeness: 72,
      independent_evidence: true,
      risk_level: "Orta",
      squad_risk_level: "Düşük",
      lineup_risk_level: "Orta",
      estimated_odds: 2.18,
      pro_signals: ["Market uzman kapısı doğrulandı"],
      team_intelligence: {
        squad_risk_level: "Düşük",
        lineup_risk_level: "Orta",
        matchup_analysis: {
          version: "matchup-intelligence-v1",
          data_quality: "Orta",
          coverage_score: 70,
          lineup_confirmed_both: true,
          availability_checked_both: true,
          context_edge: 1,
          context_edge_side: "home",
          position_comparison: [],
          signals: ["Mevki eşleşmesi kontrol edildi"],
        },
      },
    },
  ],
};

const history = {
  completed_items: [
    { market: "3.5 Üst", status: "won", estimated_probability: 58 },
  ],
  performance: {},
};

const direct = buildProIndexFromPayload(robot, history);
assert.equal(direct.source, "github-main robot-analysis protected runtime projection");
assert.equal(direct.generated_at, robot.generated_at);
assert.equal(direct.summary.match_count, 1);
assert.equal(direct.summary.pro_ready_count, 1);
assert.equal(direct.summary.matchup_verified_count, 1);
assert.equal(direct.matches[0].recommended_market, "3.5 Üst");
assert.equal(direct.matches[0].model_score, 71);
assert.match(direct.matches[0].signals.join(" "), /Market uzman kapısı/);
assert.equal(direct.calibration.measured_count, 1);

function fakeResponse(payload, status = 200) {
  const text = JSON.stringify(payload);
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (name) => name.toLowerCase() === "content-length" ? String(Buffer.byteLength(text)) : null },
    text: async () => text,
  };
}

(async () => {
  resetRemoteProIndexCache();
  const calls = [];
  const fetchImpl = async (url) => {
    calls.push(url);
    if (url === "robot://current") return fakeResponse(robot);
    if (url === "history://current") return fakeResponse(history);
    return fakeResponse({}, 404);
  };

  const options = {
    robotUrl: "robot://current",
    historyUrl: "history://current",
    fetchImpl,
    now: () => 1000,
    cacheTtlMs: 60000,
  };
  const first = await readRemoteProIndex(options);
  const second = await readRemoteProIndex(options);
  assert.equal(first.generated_at, robot.generated_at);
  assert.equal(second.generated_at, robot.generated_at);
  assert.equal(calls.length, 2, "warm cache robot/history kaynaklarını yeniden indirmemeli");

  resetRemoteProIndexCache();
  const noHistory = await readRemoteProIndex({
    ...options,
    fetchImpl: async (url) => url === "robot://current" ? fakeResponse(robot) : fakeResponse({}, 503),
  });
  assert.equal(noHistory.summary.match_count, 1, "kalibrasyon kaynağı geçici hatada olsa da güncel PRO maçları çalışmalı");
  assert.equal(noHistory.calibration.measured_count, 0);

  process.stdout.write("pro-index-from-github.test.js OK\n");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
