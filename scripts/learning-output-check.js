const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");
const outputsDir = path.join(root, "outputs");
const robotPath = path.join(dataDir, "robot-analysis.json");
const memoryPath = path.join(dataDir, "learning-memory.json");
const livePath = path.join(dataDir, "live-matches.json");
const statusPath = path.join(dataDir, "learning-output-status.json");
const reportPath = path.join(outputsDir, "learning-output-check.md");

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

function writeText(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text, "utf8");
}

function hasLearningAdjustment(robot) {
  return (robot.matches || []).some((item) => item && Object.prototype.hasOwnProperty.call(item, "learning_adjustment"));
}

function statusLevel(checks) {
  if (!checks.robot_exists || !checks.memory_exists || !checks.live_exists) return "warning";
  if (!checks.learning_fields_ready) return "waiting";
  return "ready";
}

function makeReport(status) {
  const lines = [];
  lines.push("# Learning Output Check");
  lines.push("");
  lines.push(`Generated: ${status.generated_at}`);
  lines.push(`Status: ${status.status}`);
  lines.push("");
  lines.push("## Checks");
  lines.push("");
  for (const [key, value] of Object.entries(status.checks)) {
    lines.push(`- ${key}: ${value}`);
  }
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Robot engine: ${status.robot.engine}`);
  lines.push(`- Scoring mode: ${status.robot.scoring_mode}`);
  lines.push(`- Robot matches: ${status.robot.match_count}`);
  lines.push(`- Learning adjusted count: ${status.robot.learning_adjusted_count}`);
  lines.push(`- Memory predictions: ${status.memory.total_predictions}`);
  lines.push(`- Pending predictions: ${status.memory.pending_predictions}`);
  lines.push("");
  lines.push(status.note);
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function runLearningOutputCheck() {
  const robot = readJson(robotPath, null);
  const memory = readJson(memoryPath, null);
  const live = readJson(livePath, null);
  const checks = {
    robot_exists: Boolean(robot),
    memory_exists: Boolean(memory),
    live_exists: Boolean(live),
    learning_engine_name: Boolean(String(robot?.engine || "").includes("Learning")),
    learning_mode_name: Boolean(String(robot?.scoring_mode || "").includes("learning")),
    learning_fields_ready: hasLearningAdjustment(robot || { matches: [] }),
    memory_has_predictions: Number(memory?.summary?.total_predictions || 0) > 0
  };
  const level = statusLevel(checks);
  const status = {
    generated_at: new Date().toISOString(),
    status: level,
    checks,
    robot: {
      engine: robot?.engine || "-",
      scoring_mode: robot?.scoring_mode || "-",
      match_count: Array.isArray(robot?.matches) ? robot.matches.length : 0,
      learning_adjusted_count: robot?.summary?.learning_adjusted_count ?? 0
    },
    memory: {
      total_predictions: memory?.summary?.total_predictions ?? 0,
      pending_predictions: memory?.summary?.pending_predictions ?? 0,
      won_predictions: memory?.summary?.won_predictions ?? 0,
      lost_predictions: memory?.summary?.lost_predictions ?? 0
    },
    live: {
      match_count: Array.isArray(live?.matches) ? live.matches.length : 0,
      status: live?.status || "-"
    },
    note: level === "ready"
      ? "Learning output fields are present. The site can display learning notes."
      : "Learning output is not fully ready yet. The next export run should regenerate robot-analysis.json with learning fields."
  };

  writeJson(statusPath, status);
  writeText(reportPath, makeReport(status));
  console.log(`Learning output check: ${status.status}`);
  return status;
}

if (require.main === module) runLearningOutputCheck();

module.exports = { runLearningOutputCheck };
