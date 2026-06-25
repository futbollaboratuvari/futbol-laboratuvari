const { runLearningWeightsHealthCheck } = require("./learning-weights-health-check");
const { runRobotDevelopmentReport } = require("./robot-development-report");

function runStage6LearningWeightsCheck() {
  const weights = runLearningWeightsHealthCheck();
  let development = null;
  try {
    development = runRobotDevelopmentReport();
  } catch (error) {
    development = { status: "report_error", message: error.message };
  }
  return { weights, development };
}

if (require.main === module) runStage6LearningWeightsCheck();
module.exports = { runStage6LearningWeightsCheck };
