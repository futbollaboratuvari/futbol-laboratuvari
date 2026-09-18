"use strict";

const assert = require("node:assert/strict");
const {
  findOfficialMatch,
  mergeOfficialMarkets,
  syncOfficialIddaaMarkets,
} = require("../scripts/sync-iddaa-markets");

const fixtures = [
  { date: "2026-09-18", time: "20:00", home: "Alpha FC", away: "Beta", available_odds: { ms1: 2.1 } },
  { date: "2026-09-18", time: "21:00", home: "Gamma", away: "Delta", available_odds: {} },
];

const official = {
  id: "1234567",
  iddaa_event_id: "1234567",
  date: "2026-09-18",
  time: "20:00",
  home: "Alpha",
  away: "Beta",
  iddaa_market_count: 20,
  available_odds: {
    bttsYes: 1.82,
    bttsNo: 1.91,
    firstHalfBttsYes: 2.45,
    firstHalfBttsNo: 1.42,
    over35: 2.35,
    under35: 1.52,
  },
};

assert.equal(findOfficialMatch(fixtures[0], [official])?.iddaa_event_id, "1234567");
assert.equal(findOfficialMatch(fixtures[1], [official]), null);

const merged = mergeOfficialMarkets(fixtures[0], official, "bulletin");
assert.equal(merged.available_odds.bttsYes, 1.82);
assert.equal(merged.available_odds.firstHalfBttsYes, 2.45);
assert.equal(merged.available_odds.over35, 2.35);
assert.equal(merged.verified_market_sources.over35, "iddaa.com resmi futbol bülteni");

(async () => {
  const result = await syncOfficialIddaaMarkets({
    fixtures,
    detailLimit: 1,
    detailConcurrency: 1,
    fetchBulletin: async () => ({ matches: [official] }),
    fetchDetail: async () => ({
      match: {
        ...official,
        available_odds: {
          ...official.available_odds,
          secondHalfBttsYes: 2.05,
          secondHalfBttsNo: 1.55,
          halfBttsYesYes: 9.65,
          halfBttsYesNo: 4.97,
          halfBttsNoYes: 3.37,
          halfBttsNoNo: 1.77,
          goals6plus: 7.72,
        },
      },
    }),
  });

  const row = result.fixtures[0];
  assert.equal(result.status.matched_count, 1);
  assert.equal(result.status.detail_succeeded, 1);
  assert.equal(row.available_odds.secondHalfBttsYes, 2.05);
  assert.equal(row.available_odds.halfBttsYesYes, 9.65);
  assert.equal(row.available_odds.goals6plus, 7.72);
  assert.equal(result.fixtures[1].iddaa_event_id, undefined);
  console.log("iddaa-market-sync.test.js: OK");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
