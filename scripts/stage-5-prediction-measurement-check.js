const { runLearningFinalizer } = require("./learning-finalizer");
const { runLossPatternMemory } = require("./loss-pattern-memory");
const { runPredictionMeasurementHealthCheck } = require("./prediction-measurement-health-check");
const { main: syncAnalysisResults } = require("./sync-analysis-results");

function runStage5PredictionMeasurementCheck() {
  const finalizer = runLearningFinalizer();
  const lossPatterns = runLossPatternMemory();
  const health = runPredictionMeasurementHealthCheck();
  syncAnalysisResults();
  return { finalizer, lossPatterns, health };
}

if (require.main === module) runStage5PredictionMeasurementCheck();
module.exports = { runStage5PredictionMeasurementCheck };
