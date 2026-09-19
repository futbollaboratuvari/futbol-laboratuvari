"use strict";

const fs = require("fs");
const path = require("path");

const MAX_ROBOT_BYTES = 32 * 1024 * 1024;
const robotPath = path.join(__dirname, "..", "data", "robot-analysis.json");

function validate(file = robotPath, maxBytes = MAX_ROBOT_BYTES) {
  const bytes = fs.statSync(file).size;
  const mib = bytes / (1024 * 1024);
  console.log(`PRO source size: ${bytes} bytes (${mib.toFixed(2)} MiB), limit ${(maxBytes / (1024 * 1024)).toFixed(0)} MiB.`);
  if (bytes > maxBytes) {
    throw new Error(`robot-analysis.json exceeds Supabase source limit: ${bytes} > ${maxBytes}`);
  }
  return bytes;
}

if (require.main === module) validate();

module.exports = { MAX_ROBOT_BYTES, validate };
