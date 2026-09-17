"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const fixturesPath = path.join(root, "data", "fixtures.json");

function readJson(filePath, fallback) {
  try {
    const text = fs.readFileSync(filePath, "utf8").trim();
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  fs.renameSync(tmp, filePath);
}

function sanitizeRawBlock(block = {}) {
  const values = Array.isArray(block.values) ? block.values.slice() : [];
  return {
    market_code: block.market_code ?? null,
    values,
    guess: "Belirsiz market",
    named_values: {},
    detail_market_candidates: [],
    market_identity_verified: false,
    market_identity_source: "unlabeled_raw_block",
  };
}

function sanitizeFixture(fixture = {}) {
  const blocks = Array.isArray(fixture.raw_market_blocks)
    ? fixture.raw_market_blocks.map(sanitizeRawBlock)
    : [];
  const staleGuessCount = Object.keys(fixture.raw_market_guess_odds || {}).length;
  const staleCandidateCount = Array.isArray(fixture.detail_market_candidates)
    ? fixture.detail_market_candidates.length
    : 0;

  return {
    ...fixture,
    raw_market_blocks: blocks,
    raw_market_guess_odds: {},
    detail_market_candidates: [],
    raw_market_identity_status: blocks.length ? "unverified" : "none",
    market_provenance: {
      version: "market-provenance-v1",
      policy: "verified_market_identity_only",
      raw_guesses_blocked: true,
      unverified_raw_blocks: blocks.length,
      stale_guess_fields_removed: staleGuessCount,
      stale_candidates_removed: staleCandidateCount,
    },
  };
}

function sanitizeFixturesPayload(payload) {
  if (Array.isArray(payload)) return payload.map(sanitizeFixture);
  if (payload && Array.isArray(payload.matches)) {
    return { ...payload, matches: payload.matches.map(sanitizeFixture) };
  }
  return payload;
}

function applyMarketProvenanceGuard(filePath = fixturesPath) {
  const payload = readJson(filePath, []);
  const sanitized = sanitizeFixturesPayload(payload);
  writeJson(filePath, sanitized);

  const rows = Array.isArray(sanitized) ? sanitized : (sanitized?.matches || []);
  const blocked = rows.reduce((sum, row) => (
    sum + Number(row?.market_provenance?.stale_guess_fields_removed || 0)
      + Number(row?.market_provenance?.stale_candidates_removed || 0)
  ), 0);
  const unverifiedBlocks = rows.reduce((sum, row) => (
    sum + Number(row?.market_provenance?.unverified_raw_blocks || 0)
  ), 0);

  console.log(`Market provenance guard applied: fixtures=${rows.length}, removed=${blocked}, unverified_blocks=${unverifiedBlocks}`);
  return sanitized;
}

if (require.main === module) applyMarketProvenanceGuard();

module.exports = {
  applyMarketProvenanceGuard,
  sanitizeFixture,
  sanitizeFixturesPayload,
  sanitizeRawBlock,
};
