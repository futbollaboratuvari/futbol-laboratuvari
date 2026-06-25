const { runAnalysisHealthCheck } = require("./analysis-health-check");

function runStage2AnalysisCheck() {
  return runAnalysisHealthCheck();
}

if (require.main === module) runStage2AnalysisCheck();
module.exports = { runStage2AnalysisCheck };
