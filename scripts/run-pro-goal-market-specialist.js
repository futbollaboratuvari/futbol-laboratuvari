"use strict";

const fs = require("fs");
const path = require("path");
const { runBridge } = require("./pro-goal-market-bridge");
const { processGoalOutputs } = require("./pro-market-specialist-postprocess");

const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function todayTR() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function syncArchive() {
  const archiveFile = path.join(dataDir, "archive", `${todayTR()}.json`);
  const archive = readJson(archiveFile, null);
  if (!archive || typeof archive !== "object") return false;
  archive.robotAnalysis = readJson(path.join(dataDir, "robot-analysis.json"), archive.robotAnalysis || {});
  archive.liveMatches = readJson(path.join(dataDir, "live-matches.json"), archive.liveMatches || {});
  archive.dailyCoupons = readJson(path.join(dataDir, "daily-coupons.json"), archive.dailyCoupons || {});
  writeJson(archiveFile, archive);
  return true;
}

function main() {
  runBridge();
  const result = processGoalOutputs();
  const archiveSynced = syncArchive();
  console.log(`PRO goal specialist: ${result.candidate_count || 0} aday uzman kapısından geçirildi; arşiv senkronu=${archiveSynced}.`);
  return { ...result, archive_synced: archiveSynced };
}

if (require.main === module) main();
module.exports = { main, syncArchive };
