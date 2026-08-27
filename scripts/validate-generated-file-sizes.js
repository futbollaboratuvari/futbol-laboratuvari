"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const maxBytes = 95 * 1024 * 1024;
const files = [path.join(root, "data", "robot_match_archive.json")];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  const size = fs.statSync(file).size;
  if (size > maxBytes) {
    throw new Error(`${path.relative(root, file)} ${size} bayt; güvenli GitHub sınırı ${maxBytes} bayt.`);
  }
  JSON.parse(fs.readFileSync(file, "utf8"));
  console.log(`${path.relative(root, file)} OK: ${size} bytes`);
}

