const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const file = path.join(root, "data", "learning-memory.json");
const statusFile = path.join(root, "data", "learning-finalizer-status.json");

function readJson(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, "utf8")); } catch { return fallback; }
}

function writeJson(p, value) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function parse(score) {
  const m = String(score || "").match(/(\d+)\D+(\d+)/);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

function settle(market, score) {
  const s = parse(score);
  if (!s) return "pending";
  const h = s[0], a = s[1], total = h + a, both = h > 0 && a > 0;
  if (market === "KG Var") return both ? "won" : "lost";
  if (market === "KG Yok") return !both ? "won" : "lost";
  if (market === "1.5 Üst") return total > 1 ? "won" : "lost";
  if (market === "1.5 Alt") return total < 2 ? "won" : "lost";
  if (market === "2.5 Üst") return total > 2 ? "won" : "lost";
  if (market === "2.5 Alt") return total < 3 ? "won" : "lost";
  if (market === "3.5 Üst") return total > 3 ? "won" : "lost";
  if (market === "3.5 Alt") return total < 4 ? "won" : "lost";
  if (market === "4.5 Üst") return total > 4 ? "won" : "lost";
  if (market === "4.5 Alt") return total < 5 ? "won" : "lost";
  if (market === "5.5 Üst") return total > 5 ? "won" : "lost";
  if (market === "5.5 Alt") return total < 6 ? "won" : "lost";
  if (market === "MS 1") return h > a ? "won" : "lost";
  if (market === "MS X") return h === a ? "won" : "lost";
  if (market === "MS 2") return a > h ? "won" : "lost";
  if (market === "ÇŞ 1X") return h >= a ? "won" : "lost";
  if (market === "ÇŞ X2") return a >= h ? "won" : "lost";
  if (market === "ÇŞ 12") return h !== a ? "won" : "lost";
  if (market === "Ev Sahibi Gol Atar") return h > 0 ? "won" : "lost";
  if (market === "Deplasman Gol Atar") return a > 0 ? "won" : "lost";
  if (market === "Ev Sahibi Gol Yemez") return a === 0 ? "won" : "lost";
  if (market === "Deplasman Gol Yemez") return h === 0 ? "won" : "lost";
  if (market === "Ev Sahibi 1.5 Üst") return h > 1 ? "won" : "lost";
  if (market === "Deplasman 1.5 Üst") return a > 1 ? "won" : "lost";
  if (market === "Toplam Tek") return total % 2 === 1 ? "won" : "lost";
  if (market === "Toplam Çift") return total % 2 === 0 ? "won" : "lost";
  if (market === "0-1 Gol") return total <= 1 ? "won" : "lost";
  if (market === "2-3 Gol") return total >= 2 && total <= 3 ? "won" : "lost";
  if (market === "4-6 Gol") return total >= 4 && total <= 6 ? "won" : "lost";
  if (market === "7+ Gol") return total >= 7 ? "won" : "lost";
  if (market === "KG Var + 2.5 Üst") return both && total > 2 ? "won" : "lost";
  if (market === "KG Var + 3.5 Üst") return both && total > 3 ? "won" : "lost";
  if (market === "KG Yok + 2.5 Alt") return !both && total < 3 ? "won" : "lost";
  if (market === "MS 1 + KG Var") return h > a && both ? "won" : "lost";
  if (market === "MS 2 + KG Var") return a > h && both ? "won" : "lost";
  if (market === "MS 1 + 2.5 Üst") return h > a && total > 2 ? "won" : "lost";
  if (market === "MS 2 + 2.5 Üst") return a > h && total > 2 ? "won" : "lost";
  return "pending";
}

function runLearningFinalizer() {
  const memory = readJson(file, { predictions: [] });
  let checked = 0, updated = 0;
  const predictions = (memory.predictions || []).map((item) => {
    if (item.status !== "pending" || !item.result_score) return item;
    checked += 1;
    const next = settle(item.market, item.result_score);
    if (next === "pending") return item;
    updated += 1;
    return { ...item, status: next, finalized_at: new Date().toISOString() };
  });
  memory.predictions = predictions;
  memory.updated_at = new Date().toISOString();
  memory.summary = {
    ...(memory.summary || {}),
    total_predictions: predictions.length,
    pending_predictions: predictions.filter((x) => x.status === "pending").length,
    won_predictions: predictions.filter((x) => x.status === "won").length,
    lost_predictions: predictions.filter((x) => x.status === "lost").length,
    last_finalizer_checked: checked,
    last_finalizer_updated: updated
  };
  const status = { generated_at: new Date().toISOString(), checked, updated, pending_after: memory.summary.pending_predictions };
  writeJson(file, memory);
  writeJson(statusFile, status);
  console.log(`Learning finalizer complete. Checked: ${checked}, Updated: ${updated}`);
  return status;
}

if (require.main === module) runLearningFinalizer();
module.exports = { runLearningFinalizer, settle };