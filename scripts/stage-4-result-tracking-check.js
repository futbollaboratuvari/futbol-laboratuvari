const { spawnSync } = require("child_process");
const path = require("path");
const { runLearningScoreLinker } = require("./learning-score-linker");
const { runResultTrackingHealthCheck } = require("./result-tracking-health-check");

const root = path.join(__dirname, "..");

function runNode(script) {
  const result = spawnSync(process.execPath, [path.join(root, script)], { cwd: root, stdio: "inherit" });
  if (result.status !== 0) throw new Error(`${script} failed`);
}

function runStage4ResultTrackingCheck() {
  runNode("scripts/update-match-archive.js");
  const linker = runLearningScoreLinker();
  const health = runResultTrackingHealthCheck();
  return { linker, health };
}

if (require.main === module) {
  try { runStage4ResultTrackingCheck(); }
  catch (error) { console.error(error.message); process.exit(1); }
}

module.exports = { runStage4ResultTrackingCheck };
