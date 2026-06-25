const fs = require("fs");
const path = require("path");

function todayTR() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function readJson(file, fallback) {
  try {
    const text = fs.readFileSync(file, "utf8").trim();
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

function runStep(name, fn) {
  try {
    fn();
    console.log(`${name}: ok`);
  } catch (error) {
    console.warn(`${name}: skipped (${error.message})`);
  }
}

runStep("export-high-value-json", () => {
  const { build_daily_coupons, export_json_outputs } = require("./export-high-value-json");
  const fixtures = readJson(path.join(__dirname, "..", "data", "fixtures.json"), []);
  const today = todayTR();
  const matches = fixtures.filter((fixture) => String(fixture.date || fixture.tarih || fixture.utc_date || "").slice(0, 10) === today);
  const coupons = build_daily_coupons(matches);
  export_json_outputs(coupons, matches);
});

runStep("ensure-live-json", () => {
  require("./ensure-live-json");
});

runStep("learning-output-check", () => {
  const { runLearningOutputCheck } = require("./learning-output-check");
  runLearningOutputCheck();
});

console.log("Vercel learning prep finished.");
