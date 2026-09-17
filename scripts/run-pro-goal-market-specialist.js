"use strict";

const { runBridge } = require("./pro-goal-market-bridge");
const { processGoalOutputs } = require("./pro-market-specialist-postprocess");

function main() {
  runBridge();
  const result = processGoalOutputs();
  console.log(`PRO goal specialist: ${result.candidate_count || 0} aday uzman kapısından geçirildi.`);
  return result;
}

if (require.main === module) main();
module.exports = { main };
