"use strict";

const fs = require("fs");
const path = require("path");

const COMPACT_FILES = new Set(["robot_match_archive.json"]);

function serializeJson(file, value) {
  const space = COMPACT_FILES.has(path.basename(file)) ? 0 : 2;
  return `${JSON.stringify(value, null, space)}\n`;
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, serializeJson(file, value), "utf8");
}

module.exports = { COMPACT_FILES, serializeJson, writeJson };

