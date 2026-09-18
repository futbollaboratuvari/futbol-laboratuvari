"use strict";

const assert = require("assert");
const {
  current,
  indexMatches,
  findMatch,
  mergeOfficial,
  safeOptions,
} = require("../scripts/enrich-robot-official-markets");

const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date());

const official = {
  date: today,
  home: "Alpha",
  away: "Beta",
  match_code: "12345",
  iddaa_event_id: "12345",
  available_odds: { over35: 2.2, firstHalfBttsYes: 2.6 },
  iddaa_market_count: 12,
};

const map = indexMatches([official]);
assert.strictEqual(findMatch({ date: today, home: "Alpha", away: "Beta", match_code: "12345" }, map), official);
assert.strictEqual(current({ date: today, status: "scheduled" }), true);

const merged = mergeOfficial({ date: today, home: "Alpha", away: "Beta", available_odds: { over25: 1.7 } }, official, true);
assert.strictEqual(merged.available_odds.over25, 1.7);
assert.strictEqual(merged.available_odds.over35, 2.2);
assert.strictEqual(merged.official_market_detail, true);

const options = safeOptions({
  analysis_options: [
    { label: "İlk Yarı KG Var", odd: 2.6, estimated_probability: 56, model_score: 67, independent_evidence: true, odd_source_type: "standard" },
    { label: "3.5 Üst", odd: 1.30, estimated_probability: 64, model_score: 73, independent_evidence: true, odd_source_type: "standard" },
    { label: "2.5 Üst", odd: 1.75, estimated_probability: 61, model_score: 70, independent_evidence: true, odd_source_type: "raw_market_guess_odds" },
    { label: "MS 1", odd: 1.82, estimated_probability: 58, model_score: 68, independent_evidence: true, odd_source_type: "standard" },
  ],
});
assert.deepStrictEqual(options.map((x) => x.label), ["İlk Yarı KG Var", "MS 1"]);

console.log("official market enrichment tests passed");
