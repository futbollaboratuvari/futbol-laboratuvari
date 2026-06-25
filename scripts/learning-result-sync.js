const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const memoryPath = path.join(root, "data", "learning-memory.json");
const archivePath = path.join(root, "data", "robot_match_archive.json");
const statusPath = path.join(root, "data", "learning-result-sync-status.json");

function readJson(file, fallback) {
  try {
    const text = fs.readFileSync(file, "utf8").trim();
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function runLearningResultSync() {
  const memory = readJson(memoryPath, { predictions: [] });
  const archive = readJson(archivePath, { matches: [] });
  const status = {
    generated_at: new Date().toISOString(),
    memory_items: Array.isArray(memory.predictions) ? memory.predictions.length : 0,
    archive_items: Array.isArray(archive.matches) ? archive.matches.length : 0,
    updated: 0,
    note: "Result sync bootstrap. Next step will attach scores to pending memory items."
  };
  writeJson(statusPath, status);
  console.log(`Learning result sync bootstrap: ${status.memory_items}/${status.archive_items}`);
  return status;
}

if (require.main === module) runLearningResultSync();

module.exports = { runLearningResultSync };
