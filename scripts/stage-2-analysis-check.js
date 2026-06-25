const { runAnalysisHealthCheck } = require("./analysis-health-check");
const { runAnalysisRequiredFieldsCheck } = require("./analysis-required-fields-check");

function runStage2AnalysisCheck() {
  const health = runAnalysisHealthCheck();
  const required = runAnalysisRequiredFieldsCheck();
  return { health, required };
}

if (require.main === module) runStage2AnalysisCheck();
module.exports = { runStage2AnalysisCheck };
