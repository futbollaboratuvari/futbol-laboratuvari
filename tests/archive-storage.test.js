"use strict";
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { readArchive, writeArchive, ensureArchiveStorage, SHARD_BYTES } = require("../scripts/archive-storage");
const { writeJson } = require("../scripts/json-file-policy");
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "archive-storage-"));
const file = path.join(dir, "robot_match_archive.json");
try {
  const source = { generated_at: "2026-09-13", matches: Array.from({ length: 37 }, (_, id) => ({
    id, home: "İstanbul", away: "Test", score: "2-1", raw_market_blocks: [{ odd: 2.15 }],
    match_memory: { snapshots: [{ minute: 90, stats: { shots: null } }] }, raw: "ş".repeat(120)
  })), team_index: { İstanbul: { finished: 37 } }, coupon_learning_events: [{ picks: [1] }] };
  fs.writeFileSync(file, JSON.stringify(source));
  assert.deepEqual(readArchive(file), source);
  const result = writeArchive(file, source, 2000);
  assert(result.shardCount > 1);
  assert(result.largestShard <= 2000);
  assert.deepEqual(readArchive(file), source);
  const manifest = JSON.parse(fs.readFileSync(file));
  const shard = path.join(dir, manifest.match_shards[0].file);
  const saved = fs.readFileSync(shard);
  fs.unlinkSync(shard);
  assert.throws(() => readArchive(file), /ENOENT/);
  fs.writeFileSync(shard, "[]");
  assert.throws(() => readArchive(file), /count mismatch/);
  fs.writeFileSync(shard, saved);
  source.matches[0].score = "3-1";
  writeJson(file, source);
  assert.deepEqual(readArchive(file), source);
  assert.equal(fs.readdirSync(path.join(dir, "robot_match_archive_parts")).length, 1);
  ensureArchiveStorage(file);
  assert.deepEqual(readArchive(file), source);
  const previous = fs.readFileSync(file, "utf8");
  assert.throws(() => writeArchive(file, source, 10), /Single archive match/);
  assert.equal(fs.readFileSync(file, "utf8"), previous);
  assert.throws(() => writeArchive(file, manifest), /complete robot archive/);
  // Reproduce the production failure: a valid archive exceeding the 90 MiB gate.
  const large = { matches: Array.from({ length: 1100 }, (_, id) => ({ id, raw: "x".repeat(90000) })), team_index: {} };
  assert(Buffer.byteLength(JSON.stringify(large)) > 90 * 1024 * 1024);
  writeJson(file, large);
  const loaded = readArchive(file);
  assert.deepEqual(loaded, large);
  assert(fs.statSync(file).size < 90 * 1024 * 1024);
  for (const name of fs.readdirSync(path.join(dir, "robot_match_archive_parts"))) {
    assert(fs.statSync(path.join(dir, "robot_match_archive_parts", name)).size <= SHARD_BYTES);
  }
  writeJson(file, { matches: [], team_index: {} });
  assert.deepEqual(readArchive(file), { matches: [], team_index: {} });
  assert.equal(fs.readdirSync(path.join(dir, "robot_match_archive_parts")).length, 0);
  console.log("archive-storage: lossless migration, updates, missing/corrupt parts, 99 MB archive and empty archive PASS");
} finally { fs.rmSync(dir, { recursive: true, force: true }); }
