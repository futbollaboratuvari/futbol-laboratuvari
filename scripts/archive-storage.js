"use strict";

const fs = require("fs");
const path = require("path");
const { createHash } = require("node:crypto");
const SHARD_BYTES = 8 * 1024 * 1024;
const MANIFEST_BYTES = 90 * 1024 * 1024;
const STORAGE_VERSION = "match-shards-v1";

function readArchive(file, fallback = { matches: [], team_index: {} }) {
  if (!fs.existsSync(file)) return fallback;
  const archive = JSON.parse(fs.readFileSync(file, "utf8"));
  if (!archive.archive_storage) return archive;
  if (archive.archive_storage !== STORAGE_VERSION || !Array.isArray(archive.match_shards)) {
    throw new Error("Unsupported robot archive storage");
  }
  const matches = [];
  for (const shard of archive.match_shards) {
    if (!/^robot_match_archive_parts\/part-\d{5}-[a-f0-9]{64}\.json$/.test(shard.file)) throw new Error("Invalid archive shard path");
    const rows = JSON.parse(fs.readFileSync(path.join(path.dirname(file), shard.file), "utf8"));
    if (!Array.isArray(rows) || rows.length !== shard.count) throw new Error(`Archive shard count mismatch: ${shard.file}`);
    for (const row of rows) matches.push(row);
  }
  if (matches.length !== archive.archived_match_count) throw new Error("Archive total count mismatch");
  const { archive_storage, match_shards, archived_match_count, ...metadata } = archive;
  return { ...metadata, matches };
}

function writeArchive(file, archive, maxBytes = SHARD_BYTES) {
  if (!Array.isArray(archive.matches) || archive.archive_storage) throw new Error("Expected complete robot archive before writing");
  const chunks = [];
  let rows = [], bytes = 3;
  for (const match of archive.matches) {
    const text = JSON.stringify(match);
    const size = Buffer.byteLength(text);
    if (size + 3 > maxBytes) throw new Error("Single archive match exceeds shard size limit");
    if (rows.length && bytes + size + 1 > maxBytes) {
      chunks.push(`[${rows.join(",")}]\n`);
      rows = []; bytes = 3;
    }
    bytes += size + (rows.length ? 1 : 0);
    rows.push(text);
  }
  if (rows.length) chunks.push(`[${rows.join(",")}]\n`);
  const { matches, ...metadata } = archive;
  const descriptors = chunks.map((text, index) => ({
    file: `robot_match_archive_parts/part-${String(index).padStart(5, "0")}-${createHash("sha256").update(text).digest("hex")}.json`,
    count: JSON.parse(text).length
  }));
  const manifest = JSON.stringify({ ...metadata, matches: [], archive_storage: STORAGE_VERSION,
    archived_match_count: matches.length, match_shards: descriptors }) + "\n";
  if (Buffer.byteLength(manifest) > MANIFEST_BYTES) throw new Error("Robot archive metadata exceeds size limit");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const dir = path.join(path.dirname(file), "robot_match_archive_parts");
  fs.mkdirSync(dir, { recursive: true });
  chunks.forEach((text, index) => {
    const target = path.join(path.dirname(file), descriptors[index].file);
    fs.writeFileSync(`${target}.tmp`, text, "utf8");
    fs.renameSync(`${target}.tmp`, target);
  });
  fs.writeFileSync(`${file}.tmp`, manifest, "utf8");
  fs.renameSync(`${file}.tmp`, file);
  // Workflows stage the whole data directory in one commit, including removals.
  const retained = new Set(descriptors.map(item => path.basename(item.file)));
  for (const name of fs.readdirSync(dir)) {
    if (/^part-\d{5}-[a-f0-9]{64}\.json$/.test(name) && !retained.has(name)) fs.unlinkSync(path.join(dir, name));
  }
  return { matchCount: matches.length, shardCount: chunks.length, largestShard: Math.max(0, ...chunks.map(text => Buffer.byteLength(text))) };
}

function ensureArchiveStorage(file) {
  if (!fs.existsSync(file)) return;
  const before = fs.statSync(file).size;
  const archive = readArchive(file);
  const result = writeArchive(file, archive);
  const restored = readArchive(file);
  if (JSON.stringify(restored) !== JSON.stringify(archive)) {
    // Property order can differ; compare the data, not its serialization order.
    require("node:assert/strict").deepEqual(restored, archive);
  }
  console.log(`Robot archive verified: ${result.matchCount} matches, ${result.shardCount} shards, largest=${result.largestShard} bytes, manifest ${before} -> ${fs.statSync(file).size} bytes`);
}

module.exports = { readArchive, writeArchive, ensureArchiveStorage, SHARD_BYTES };
