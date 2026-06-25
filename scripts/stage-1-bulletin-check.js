const { runBulletinHealthCheck } = require("./bulletin-health-check");

function runStage1BulletinCheck() {
  return runBulletinHealthCheck();
}

if (require.main === module) runStage1BulletinCheck();
module.exports = { runStage1BulletinCheck };
