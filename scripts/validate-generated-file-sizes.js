"use strict";

const fs = require("fs");
const path = require("path");
const { compactDetailRawSignals } = require("./compact-detail-raw-signals");

const root = path.join(__dirname, "..");

// detail-raw-signals.json is a diagnostic/index output. Keep the full raw market
// detail in fixtures.json and compact the duplicate index before any git stage/push.
compactDetailRawSignals();
require("./archive-storage").ensureArchiveStorage(path.join(root, "data", "robot_match_archive.json"));

const limits = [
  {
    file: path.join(root, "data", "detail-raw-signals.json"),
    maxBytes: 20 * 1024 * 1024,
    label: "compact raw-signal index"
  },
  {
    file: path.join(root, "data", "robot_match_archive.json"),
    maxBytes: 90 * 1024 * 1024,
    label: "robot match archive"
  }
];

for (const { file, maxBytes, label } of limits) {
  if (!fs.existsSync(file)) continue;
  const size = fs.statSync(file).size;
  if (size > maxBytes) {
    throw new Error(`${path.relative(root, file)} ${size} bayt; ${label} güvenli sınırı ${maxBytes} bayt.`);
  }
  JSON.parse(fs.readFileSync(file, "utf8"));
  console.log(`${path.relative(root, file)} OK: ${size} bytes (limit ${maxBytes})`);
}

