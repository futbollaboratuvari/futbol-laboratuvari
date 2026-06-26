const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const outJson = path.join(root, "data", "robot-pipeline-status.json");
const outMd = path.join(root, "outputs", "robot-pipeline-status.md");

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function readJson(rel, fallback) {
  try { return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8")); } catch { return fallback; }
}

function countRows(value) {
  if (Array.isArray(value)) return value.length;
  if (Array.isArray(value?.matches)) return value.matches.length;
  if (Array.isArray(value?.predictions)) return value.predictions.length;
  return 0;
}

function stage(id, name, ok, detail) {
  return { id, name, ok: Boolean(ok), detail };
}

function runRobotPipelineStatus() {
  const fixtures = readJson("data/fixtures.json", []);
  const robot = readJson("data/robot-analysis.json", { matches: [], summary: {} });
  const memory = readJson("data/learning-memory.json", { predictions: [] });
  const archive = readJson("data/robot_match_archive.json", { matches: [] });
  const finalizer = readJson("data/learning-finalizer-status.json", {});
  const dev = readJson("data/robot-development-report.json", {});
  const memoryRows = countRows(memory);
  const robotRows = countRows(robot);
  const pickRows = Number(robot.summary?.coupon_candidate_count || 0);
  const watchOnly = robotRows > 0 && pickRows === 0;
  const stage3Ready = exists("scripts/robot-learning-memory.js") && (memoryRows > 0 || watchOnly);
  const stage3Text = watchOnly ? "0 hafiza kaydi, izleme" : `${memoryRows} hafiza kaydi`;
  const stages = [
    stage(1, "Bulteni ceker", countRows(fixtures) > 0 && exists("scripts/update-fixtures.js"), `${countRows(fixtures)} mac`),
    stage(2, "Analiz eder", robotRows > 0 && exists("scripts/export-high-value-json.js"), `${robotRows} analiz`),
    stage(3, "Tahmini kaydeder", stage3Ready, stage3Text),
    stage(4, "Mac sonucunu takip eder", exists("scripts/learning-score-linker.js") && exists("scripts/update-match-archive.js"), `${countRows(archive)} arsiv kaydi`),
    stage(5, "Kendi tahminini olcer", exists("scripts/learning-finalizer.js"), `${finalizer.updated || 0} guncelleme`),
    stage(6, "Sonraki tahminde agirlik degistirir", exists("scripts/apply-learning-weights.js") && exists("scripts/robot-development-report.js"), dev.status || "rapor hazir")
  ];
  const report = {
    generated_at: new Date().toISOString(),
    complete_count: stages.filter((s) => s.ok).length,
    total_count: stages.length,
    stages
  };
  const md = [
    "# Robot Hedef Hatti Durumu",
    "",
    `Olusma: ${report.generated_at}`,
    `Durum: ${report.complete_count}/${report.total_count}`,
    "",
    ...stages.map((s) => `- ${s.ok ? "OK" : "BEKLIYOR"} | ${s.id}. ${s.name}: ${s.detail}`),
    ""
  ].join("\n");
  fs.mkdirSync(path.dirname(outJson), { recursive: true });
  fs.mkdirSync(path.dirname(outMd), { recursive: true });
  fs.writeFileSync(outJson, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(outMd, md, "utf8");
  console.log(`Robot pipeline status: ${report.complete_count}/${report.total_count}`);
  return report;
}

if (require.main === module) runRobotPipelineStatus();
module.exports = { runRobotPipelineStatus };
