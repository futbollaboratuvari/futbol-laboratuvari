"use strict";

const assert = require("node:assert/strict");
const { parseBlocks, candidatesForBlock } = require("../scripts/raw-block-lite");
const { sanitizeFixture, sanitizeRawBlock } = require("../scripts/market-provenance-guard");
const { scoreFixture } = require("../scripts/robot-exact-scoring");

function test(name, fn) {
  try {
    fn();
    process.stdout.write(`✓ ${name}\n`);
  } catch (error) {
    process.stderr.write(`✗ ${name}\n`);
    throw error;
  }
}

test("iki oranlı etiketsiz blok KG/alt-üst diye tahmin edilmez", () => {
  const blocks = parseBlocks(["03067", "1.63", "1.93"]);
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].guess, "Belirsiz market");
  assert.equal(blocks[0].market_identity_verified, false);
  assert.deepEqual(blocks[0].named_values, {});
  assert.deepEqual(blocks[0].detail_market_candidates, []);
  assert.deepEqual(candidatesForBlock([1.63, 1.93]), []);
});

test("üç oranlı etiketsiz blok MS/ilk yarı/handikap diye tahmin edilmez", () => {
  const blocks = parseBlocks(["02946", "1.52", "3.40", "5.10"]);
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0].guess, "Belirsiz market");
  assert.deepEqual(blocks[0].named_values, {});
  assert.deepEqual(blocks[0].detail_market_candidates, []);
});

test("guard eski yanlış market tahminlerini temizler ama doğrulanmış oranları korur", () => {
  const input = {
    date: "2099-01-01",
    home: "A",
    away: "B",
    odds: { bttsYes: 1.81, bttsNo: 2.02, ms1: 1.72 },
    raw_market_guess_odds: { bttsYes_guess: 1.63, over25_guess: 1.63 },
    detail_market_candidates: [
      { market: "KG Var / Yok", values: { bttsYes_guess: 1.63, bttsNo_guess: 1.93 } },
      { market: "2.5 Alt / Üst", values: { under25_guess: 1.63, over25_guess: 1.93 } },
    ],
    raw_market_blocks: [{
      market_code: "03067",
      values: [1.63, 1.93],
      guess: "KG Var / Yok",
      named_values: { bttsYes_guess: 1.63, bttsNo_guess: 1.93 },
      detail_market_candidates: [{ market: "KG Var / Yok", values: {} }],
    }],
  };

  const output = sanitizeFixture(input);
  assert.deepEqual(output.raw_market_guess_odds, {});
  assert.deepEqual(output.detail_market_candidates, []);
  assert.equal(output.raw_market_blocks[0].guess, "Belirsiz market");
  assert.equal(output.raw_market_blocks[0].market_identity_verified, false);
  assert.deepEqual(output.raw_market_blocks[0].named_values, {});
  assert.deepEqual(output.odds, input.odds);
  assert.equal(output.market_provenance.raw_guesses_blocked, true);
  assert.equal(output.market_provenance.stale_guess_fields_removed, 2);
  assert.equal(output.market_provenance.stale_candidates_removed, 2);
});

test("ham tahmin dışında oran yoksa PRO scorer seçim üretemez", () => {
  const unsafe = {
    date: "2099-01-01",
    home: "Guess Home",
    away: "Guess Away",
    raw_market_guess_odds: {
      bttsYes_guess: 1.80,
      bttsNo_guess: 1.95,
      over25_guess: 1.82,
      under25_guess: 1.90,
    },
    detail_market_candidates: [{ market: "KG Var / Yok", values: { bttsYes_guess: 1.8 } }],
    raw_market_blocks: [{ market_code: "03067", values: [1.8, 1.95] }],
  };
  const safe = sanitizeFixture(unsafe);
  const scored = scoreFixture(safe);
  assert.equal(scored.hasOdds, false);
  assert.equal(scored.status, "filtered_no_value_market");
});

test("ham blok sanitizer kod ve değerleri teşhis için korur", () => {
  const block = sanitizeRawBlock({ market_code: "12345", values: [1.5, 2.4], guess: "2.5 Alt / Üst" });
  assert.equal(block.market_code, "12345");
  assert.deepEqual(block.values, [1.5, 2.4]);
  assert.equal(block.guess, "Belirsiz market");
  assert.equal(block.market_identity_source, "unlabeled_raw_block");
});

process.stdout.write("market-provenance.test.js OK\n");
