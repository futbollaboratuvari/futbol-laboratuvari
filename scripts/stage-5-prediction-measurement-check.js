const { runLearningFinalizer } = require("./learning-finalizer");
const { runPredictionMeasurementHealthCheck } = require("./prediction-measurement-health-check");

function runStage5PredictionMeasurementCheck() {
  const finalizer = runLearningFinalizer();
  const health = runPredictionMeasurementHealthCheck();
  return { finalizer, health };
}

if (require.main === module) runStage5PredictionMeasurementCheck();
module.exports = { runStage5PredictionMeasurementCheck };
