"use strict";

const assert = require("node:assert/strict");
const {
  apiFootballResults,
  applyResults,
  datesToCheck,
  espnResults,
  findResultForMatch,
  sportsDbResults,
  teamSimilarity,
} = require("../scripts/update-final-scores");
const { buildScoreIndexFromRows, findScore } = require("../scripts/learning-score-linker");
const { settle } = require("../scripts/learning-finalizer");
const { mergePrediction } = require("../scripts/robot-learning-memory");
const { buildCompletedItems, buildPerformance } = require("../scripts/sync-analysis-results");

const test = (name, fn) => {
  try {
    fn();
    process.stdout.write(`✓ ${name}\n`);
  } catch (error) {
    process.stderr.write(`✗ ${name}\n`);
    throw error;
  }
};

test("API-Football biten maç yanıtı final skor kaydına dönüşür", () => {
  const results = apiFootballResults({
    response: [{
      fixture: { id: 77, date: "2026-08-22T18:00:00+03:00", status: { short: "FT" } },
      teams: { home: { name: "Deportivo Madryn" }, away: { name: "Atletico Mitre" } },
      goals: { home: 2, away: 1 },
      score: { fulltime: { home: 2, away: 1 } },
    }],
  });
  assert.equal(results.length, 1);
  assert.equal(results[0].date, "2026-08-22");
  assert.equal(results[0].score, "2-1");
});

test("anahtarsız ESPN ve TheSportsDB yanıtları ortak skor şemasına dönüşür", () => {
  const espn = espnResults({ events: [{
    id: "espn-1",
    date: "2026-08-23T17:00:00Z",
    status: { type: { name: "STATUS_FULL_TIME", completed: true } },
    competitions: [{ competitors: [
      { homeAway: "home", score: "3", team: { displayName: "Al Ahly" } },
      { homeAway: "away", score: "2", team: { displayName: "ENPPI" } },
    ] }],
  }] });
  const sportsDb = sportsDbResults({ events: [{
    idEvent: "sportsdb-1",
    dateEvent: "2026-08-23",
    strStatus: "FT",
    strHomeTeam: "Al Ahly",
    strAwayTeam: "ENPPI",
    intHomeScore: "3",
    intAwayScore: "2",
  }] });
  assert.equal(espn[0].score, "3-2");
  assert.equal(espn[0].source, "ESPN Scoreboard");
  assert.equal(sportsDb[0].score, "3-2");
});

test("kısaltılmış takım adları aynı tarihte güvenli biçimde eşleşir", () => {
  assert.ok(teamSimilarity("Deportivo Madr", "Deportivo Madryn") > 0.9);
  const result = {
    date: "2026-08-22",
    home: "Deportivo Madryn",
    away: "Club Atletico Mitre",
    homeScore: 2,
    awayScore: 1,
    score: "2-1",
    source: "API-Football",
  };
  const archiveRow = { date: "2026-08-22", home: "Deportivo Madr", away: "Ca Mitre", score: "" };
  assert.equal(findResultForMatch(archiveRow, [result]).result.score, "2-1");
  const updated = applyResults([archiveRow], [result], "2026-08-24T10:00:00.000Z");
  assert.equal(updated.updated, 1);
  assert.equal(updated.matches[0].score, "2-1");
  assert.equal(updated.matches[0].inferred_finished, false);
});

test("kısmi kaynak hatası olan tarih bekleme süresine takılmadan yeniden denenir", () => {
  const now = new Date("2026-08-24T09:00:00Z");
  const memory = { predictions: [{ date: "2026-08-23", start_time: "20:00", status: "pending", result_score: "" }] };
  const status = { date_checks: { "2026-08-23": { last_success_at: now.toISOString(), error_count: 1 } } };
  assert.deepEqual(datesToCheck(memory, status, now), ["2026-08-23"]);
});

test("skor bağlayıcı aynı takımların farklı tarihlerini karıştırmaz", () => {
  const index = buildScoreIndexFromRows([
    { date: "2026-08-22", home: "Alpha FC", away: "Beta FC", score: "1-0" },
    { date: "2026-08-23", home: "Alpha FC", away: "Beta FC", score: "0-2" },
  ]);
  assert.equal(findScore({ date: "2026-08-22", match_name: "Alpha - Beta" }, index), "1-0");
  assert.equal(findScore({ date: "2026-08-23", match_name: "Alpha - Beta" }, index), "0-2");
  assert.equal(findScore({ date: "2026-08-24", match_name: "Alpha - Beta" }, index), "");
});

test("final skor tahmini doğru ve yanlış olarak sonuçlandırır", () => {
  assert.equal(settle("MS 1", "2-1"), "won");
  assert.equal(settle("MS X", "2-1"), "lost");
  assert.equal(settle("2.5 Üst", "2-1"), "won");
});

test("sonuçlanan tahmin yeni analiz turunda tekrar pending olmaz", () => {
  const merged = mergePrediction(
    { id: "x", status: "won", result_score: "2-1", finalized_at: "2026-08-22T20:00:00Z" },
    { id: "x", status: "pending", result_score: "", analysis_score: 66 },
    "2026-08-24T10:00:00Z",
  );
  assert.equal(merged.status, "won");
  assert.equal(merged.result_score, "2-1");
});

test("sonuç arşivi ve performans yalnızca doğrulanmış kayıtlardan üretilir", () => {
  const memory = {
    predictions: [
      { id: "a", date: "2026-08-22", match_name: "A - B", market: "MS 1", odds: "1.80", confidence_score: "70%", status: "won", result_score: "2-0" },
      { id: "b", date: "2026-08-22", match_name: "C - D", market: "MS X", odds: "3.10", confidence_score: "62%", status: "lost", result_score: "1-0" },
      { id: "c", date: "2026-08-24", match_name: "E - F", market: "MS 2", status: "pending", result_score: "" },
    ],
  };
  const completed = buildCompletedItems(memory, []);
  const performance = buildPerformance(memory);
  assert.equal(completed.length, 2);
  assert.equal(performance.measured_count, 2);
  assert.equal(performance.pending_count, 1);
  assert.equal(performance.success_rate, 50);
  assert.equal(performance.groups[0].label, "Maç Sonucu");
});

process.stdout.write("Sonuç ve performans zinciri testleri tamamlandı.\n");
