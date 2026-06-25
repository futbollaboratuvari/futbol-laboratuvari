const { runLearningMemory } = require("./robot-learning-memory");
const { runPredictionMemoryHealthCheck } = require("./prediction-memory-health-check");

function runStage3PredictionRecordCheck() {
  const memory = runLearningMemory();
  const health = runPredictionMemoryHealthCheck();
  return { memory, health };
}

if (require.main === module) runStage3PredictionRecordCheck();
module.exports = { runStage3PredictionRecordCheck };
