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
    note: "Result sync bootstrap. Score linker and finalizer are attached."
  };
  console.log(`Learning result sync: ${status.memory_items}/${status.archive_items}`);
  try {
    const { runLearningScoreLinker } = require("./learning-score-linker");
    const linker = runLearningScoreLinker();
    status.score_checked = linker.checked || 0;
    status.score_linked = linker.linked || 0;
  } catch (error) {
    status.linker_error = error.message;
    console.warn(`Learning score linker skipped: ${error.message}`);
  }
  try {
    const { runLearningFinalizer } = require("./learning-finalizer");
    const finalizer = runLearningFinalizer();
    status.finalizer_checked = finalizer.checked || 0;
    status.finalized = finalizer.updated || 0;
    status.pending_after = finalizer.pending_after || 0;
    status.updated = status.finalized;
  } catch (error) {
    status.finalizer_error = error.message;
    console.warn(`Learning finalizer skipped: ${error.message}`);
  }
  status.note = status.updated
    ? "Final scores were linked and predictions were measured."
    : "No new verified final score was linked in this run.";
  writeJson(statusPath, status);
  return status;
}

if (require.main === module) runLearningResultSync();

module.exports = { runLearningResultSync };
