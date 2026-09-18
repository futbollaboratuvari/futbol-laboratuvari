"use strict";

const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "data", "live-match-analysis.json");

function fail(message) {
  console.error(message);
  process.exit(1);
}

let payload;
try {
  payload = JSON.parse(fs.readFileSync(file, "utf8"));
} catch (error) {
  fail(`live-match-analysis.json okunamadı: ${error.message}`);
}

if (payload?.schema_version !== 1) fail("live analysis schema_version must be 1");
if (payload?.robot_version !== "live-match-analysis-robot-v1") fail("live analysis robot_version mismatch");
if (!Array.isArray(payload?.matches)) fail("live analysis matches must be array");
if (!payload?.summary || Number(payload.summary.live_match_count) !== payload.matches.length) fail("live analysis summary count mismatch");

for (const row of payload.matches) {
  if (!row.fixture_id) fail("live analysis row fixture_id missing");
  if (!["ready", "insufficient_data"].includes(row.status)) fail(`invalid live analysis status: ${row.status}`);
  if (row.status === "ready") {
    if (row.source_verified !== true) fail("ready live analysis must be source verified");
    if (!row.primary_prediction || !row.primary_prediction.label) fail("ready live analysis primary prediction missing");
    if (!Number.isFinite(Number(row.primary_prediction.confidence))) fail("ready live analysis confidence missing");
    if (!row.data_coverage || Number(row.data_coverage.ratio) < 0.4) fail("ready live analysis coverage below gate");
    if (!Array.isArray(row.signals) || !row.signals.length) fail("ready live analysis signals missing");
  } else if (row.primary_prediction?.type !== "wait") {
    fail("insufficient live analysis must fail closed with wait");
  }
}

console.log(`live-match-analysis.json valid: ${payload.matches.length} rows, ready=${payload.summary.ready_count}`);
