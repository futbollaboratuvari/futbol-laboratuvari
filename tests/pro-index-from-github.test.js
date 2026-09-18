"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
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
      analysis_options: [
        { label: "İlk Yarı KG Var", odd: 2.45, model_score: 63, estimated_probability: 46, market_probability: 41, data_completeness: 61, independent_evidence: true },
        { label: "İY KG / 2Y KG Hayır / Evet", odd: 3.60, model_score: 57, estimated_probability: 34, market_probability: 28, data_completeness: 58, independent_evidence: true },
        { label: "2.5 Üst", odd: 1.88, model_score: 68, estimated_probability: 62, market_probability: 56, data_completeness: 70, independent_evidence: true },
      ],
      goal_market_candidates: [
        { market: "6+ Gol", odds: 7.50, model_score: 59, estimated_probability: 17, market_probability: 13, data_completeness: 75, specialist_decision: "keep", specialist_eligible: true },
      ],
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
assert.ok(direct.matches[0].analysis_options.some((option) => option.market === "İlk Yarı KG Var"));
assert.ok(direct.matches[0].analysis_options.some((option) => option.market === "İY KG / 2Y KG Hayır / Evet"));
assert.ok(direct.matches[0].analysis_options.some((option) => option.market === "2.5 Üst"));
assert.ok(direct.matches[0].analysis_options.some((option) => option.market === "6+ Gol"));
assert.match(direct.matches[0].signals.join(" "), /Market uzman kapısı/);
assert.equal(direct.calibration.measured_count, 1);


const siteScript = fs.readFileSync(path.join(__dirname, "..", "script.js"), "utf8");
const navRuntime = fs.readFileSync(path.join(__dirname, "..", "nav-routing.js"), "utf8");
const transparencyRuntime = fs.readFileSync(path.join(__dirname, "..", "analysis-insights-v1.js"), "utf8");
assert.match(
  siteScript,
  /const normalizeMarket = \(item\) => item\.recommended_market \|\| item\.market/,
  "ana sayfa güncel protected PRO recommended_market alanını tanımalı",
);
assert.match(
  siteScript,
  /const normalizeScore = \(item\) => item\.model_score \?\? item\.analysis_score/,
  "ana sayfa güncel protected PRO model_score alanını tanımalı",
);
assert.match(
  siteScript,
  /const analysisDatabaseRow = \(raw\) =>/,
  "Maç Kayıtları görünümü doğrulanmış sonuçlardan ayrı tablo satırı üretmeli",
);
assert.match(
  siteScript,
  /completed\.slice\(0, 30\)\.map\(analysisDatabaseRow\)/,
  "Maç Kayıtları mevcut kompakt results-summary akışını kullanmalı",
);
assert.equal(
  siteScript.includes("./data/tahmin_gecmisi.json"),
  false,
  "Maç Kayıtları boş eski tahmin_gecmisi kaynağına geri bağlanmamalı",
);
assert.match(
  navRuntime,
  /ensureScript\("analysis-insights-v1\.js", "analysis-insights-v1-script"\)/,
  "AI Şeffaflık Merkezi runtime modülü canlı sayfada yüklenmeli",
);
assert.equal(
  fs.existsSync(path.join(__dirname, "..", "analysis-insights-v1.js")),
  true,
  "AI Şeffaflık Merkezi modül dosyası repoda bulunmalı",
);
assert.match(transparencyRuntime, /half_btts_combo/, "Şeffaflık İY\/2Y KG kombinasyon ailesini tanımalı");
assert.match(transparencyRuntime, /first_half_btts/, "Şeffaflık İlk Yarı KG ailesini tanımalı");
assert.match(transparencyRuntime, /second_half_btts/, "Şeffaflık İkinci Yarı KG ailesini tanımalı");
assert.match(transparencyRuntime, /six_plus/, "Şeffaflık 6+ Gol ailesini tanımalı");
assert.match(transparencyRuntime, /over35/, "Şeffaflık 3.5 Üst ailesini tanımalı");
assert.match(transparencyRuntime, /over25/, "Şeffaflık 2.5 Üst ailesini tanımalı");
assert.match(transparencyRuntime, /match_result:\s*2/, "Şeffaflık maç sonucu ailesini 10 kartın tamamına yaymamalı");
assert.match(transparencyRuntime, /analysis_options/, "Şeffaflık tek recommended_market yerine çoklu seçenek projection'ını okumalı");

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
