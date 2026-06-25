const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const memoryFile = path.join(root, "data", "learning-memory.json");
const archiveFile = path.join(root, "data", "robot_match_archive.json");
const liveFile = path.join(root, "data", "live-matches.json");
const statusFile = path.join(root, "data", "learning-score-linker-status.json");

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function key(value) {
  return String(value || "").toLowerCase().replace(/ı/g, "i").replace(/[^a-z0-9]+/g, " ").trim();
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

function buildScoreMap() {
  const archive = readJson(archiveFile, { matches: [] });
  const live = readJson(liveFile, { matches: [] });
  const rows = [...(archive.matches || []), ...(live.matches || [])];
  const map = new Map();
  rows.forEach((row) => {
    const score = scoreOf(row);
    if (!score) return;
    [nameOf(row), `${row.home || ""} ${row.away || ""}`, `${row.away || ""} ${row.home || ""}`]
      .map(key).filter(Boolean).forEach((k) => map.set(k, score));
  });
  return map;
}

function findScore(item, map) {
  const k = key(item.match_name || item.match || "");
  if (map.has(k)) return map.get(k);
  for (const [candidate, score] of map.entries()) {
    if (k && (candidate.includes(k) || k.includes(candidate))) return score;
  }
  return "";
}

function runLearningScoreLinker() {
  const memory = readJson(memoryFile, { predictions: [] });
  const map = buildScoreMap();
  let checked = 0, linked = 0;
  memory.predictions = (memory.predictions || []).map((item) => {
    if (item.result_score) return item;
    checked += 1;
    const score = findScore(item, map);
    if (!score) return item;
    linked += 1;
    return { ...item, result_score: score, score_linked_at: new Date().toISOString() };
  });
  memory.updated_at = new Date().toISOString();
  memory.summary = { ...(memory.summary || {}), last_score_link_checked: checked, last_score_linked: linked };
  const status = { generated_at: new Date().toISOString(), checked, linked, score_keys: map.size };
  writeJson(memoryFile, memory);
  writeJson(statusFile, status);
  console.log(`Learning score linker complete. Checked: ${checked}, Linked: ${linked}`);
  return status;
}

if (require.main === module) runLearningScoreLinker();
module.exports = { runLearningScoreLinker };