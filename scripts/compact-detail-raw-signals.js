"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const file = path.join(root, "data", "detail-raw-signals.json");

function uniqueStrings(values, limit = 64) {
  return Array.from(new Set(values.map((value) => String(value || "").trim()).filter(Boolean))).slice(0, limit);
}

function compactMatch(item) {
  const blocks = Array.isArray(item.raw_market_blocks) ? item.raw_market_blocks : [];
  const candidates = Array.isArray(item.detail_market_candidates) ? item.detail_market_candidates : [];

  return {
    match_name: item.match_name || "-",
    league: item.league || "-",
    date: item.date || "-",
    time: item.time || "-",
    raw_market_guess_odds: item.raw_market_guess_odds || {},
    raw_market_block_count: Number(item.raw_market_block_count || blocks.length || 0),
    raw_market_value_count: Number(item.raw_market_value_count || blocks.reduce((sum, block) => sum + (Array.isArray(block.values) ? block.values.length : 0), 0)),
    market_codes: uniqueStrings(blocks.map((block) => block.market_code)),
    detail_markets: uniqueStrings(candidates.map((candidate) => candidate.market))
  };
}

function compactDetailRawSignals() {
  if (!fs.existsSync(file)) {
    console.log("detail-raw-signals.json yok; kompaktlaştırma atlandı.");
    return { beforeBytes: 0, afterBytes: 0, matchCount: 0 };
  }

  const beforeBytes = fs.statSync(file).size;
  const source = JSON.parse(fs.readFileSync(file, "utf8"));
  const matches = Array.isArray(source.matches) ? source.matches : [];
  const compactMatches = matches.map(compactMatch);

  const compact = {
    schema_version: 2,
    generated_at: source.generated_at || new Date().toISOString(),
    compacted_at: new Date().toISOString(),
    storage_mode: "compact_index",
    full_detail_source: "data/fixtures.json",
    match_count: compactMatches.length,
    matches: compactMatches
  };

  fs.writeFileSync(file, JSON.stringify(compact, null, 2) + "\n", "utf8");
  const afterBytes = fs.statSync(file).size;

  console.log(`detail-raw-signals compacted: ${beforeBytes} -> ${afterBytes} bytes, matches=${compactMatches.length}`);
  return { beforeBytes, afterBytes, matchCount: compactMatches.length };
}

if (require.main === module) compactDetailRawSignals();

module.exports = { compactDetailRawSignals, compactMatch };
