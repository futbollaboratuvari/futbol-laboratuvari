const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const memoryFile = path.join(root, "data", "learning-memory.json");
const archiveFile = path.join(root, "data", "robot_match_archive.json");
const liveFile = path.join(root, "data", "live-matches.json");
const statusFile = path.join(root, "data", "learning-score-linker-status.json");
const { findResultForMatch, normalizeTeam } = require("./update-final-scores");

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function key(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function nameOf(item) {
  return String(item.match_name || item.match || `${item.home || ""} ${item.away || ""}`).replace(/\bVS\b/gi, " ").trim();
}

function scoreOf(item) {
  const direct = String(item.score || item.result || item.result_score || item.final_score || "");
  const m = direct.match(/(\d+)\D+(\d+)/);
  if (m) return `${Number(m[1])}-${Number(m[2])}`;
  const h = item.homeScore ?? item.home_score ?? item.homeGoals ?? item.home_goals;
  const a = item.awayScore ?? item.away_score ?? item.awayGoals ?? item.away_goals;
  if (h !== undefined && a !== undefined && h !== "" && a !== "") return `${Number(h)}-${Number(a)}`;
  return "";
}

function dateOf(item) {
  return String(item.date || item.tarih || item.utc_date || "").slice(0, 10);
}

function teamsOf(item) {
  const parts = String(item.match_name || item.match || "").split(/\s+-\s+|\s+vs\.?\s+/i);
  return {
    home: item.home || item.home_team_name || parts[0] || "",
    away: item.away || item.away_team_name || parts.slice(1).join(" - ") || "",
  };
}

function exactPairKey(item) {
  const teams = teamsOf(item);
  return [dateOf(item), normalizeTeam(teams.home), normalizeTeam(teams.away)].join("|");
}

function buildScoreIndexFromRows(rows) {
  const exact = new Map();
  const byDate = new Map();
  const byUndatedName = new Map();
  let scoreCount = 0;
  rows.forEach((row) => {
    const score = scoreOf(row);
    if (!score) return;
    scoreCount += 1;
    const teams = teamsOf(row);
    const result = { ...row, ...teams, date: dateOf(row), score };
    const pairKey = exactPairKey(result);
    if (result.date && normalizeTeam(teams.home) && normalizeTeam(teams.away)) exact.set(pairKey, score);
    if (result.date) {
      const dateRows = byDate.get(result.date) || [];
      dateRows.push(result);
      byDate.set(result.date, dateRows);
    }
    const undatedKey = key(nameOf(result));
    if (undatedKey) {
      if (!byUndatedName.has(undatedKey)) byUndatedName.set(undatedKey, score);
      else if (byUndatedName.get(undatedKey) !== score) byUndatedName.set(undatedKey, null);
    }
  });
  return { exact, byDate, byUndatedName, scoreCount };
}

function buildScoreMap() {
  const archive = readJson(archiveFile, { matches: [] });
  const live = readJson(liveFile, { matches: [] });
  return buildScoreIndexFromRows([...(archive.matches || []), ...(live.matches || [])]);
}

function findScore(item, index) {
  const exact = index.exact.get(exactPairKey(item));
  if (exact) return exact;
  const date = dateOf(item);
  if (date) {
    const match = findResultForMatch(item, index.byDate.get(date) || []);
    return match?.result?.score || "";
  }
  return index.byUndatedName.get(key(nameOf(item))) || "";
}

function runLearningScoreLinker() {
  const memory = readJson(memoryFile, { predictions: [] });
  const index = buildScoreMap();
  let checked = 0, linked = 0;
  memory.predictions = (memory.predictions || []).map((item) => {
    if (item.result_score) return item;
    checked += 1;
    const score = findScore(item, index);
    if (!score) return item;
    linked += 1;
    return { ...item, result_score: score, score_linked_at: new Date().toISOString() };
  });
  memory.updated_at = new Date().toISOString();
  memory.summary = { ...(memory.summary || {}), last_score_link_checked: checked, last_score_linked: linked };
  const status = { generated_at: new Date().toISOString(), checked, linked, score_keys: index.scoreCount };
  writeJson(memoryFile, memory);
  writeJson(statusFile, status);
  console.log(`Learning score linker complete. Checked: ${checked}, Linked: ${linked}`);
  return status;
}

if (require.main === module) runLearningScoreLinker();
module.exports = { buildScoreIndexFromRows, findScore, runLearningScoreLinker, scoreOf };
