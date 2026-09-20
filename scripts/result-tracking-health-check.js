const fs = require("fs");
const path = require("path");
const { stalePendingStats } = require("./learning-health-utils");

const root = path.join(__dirname, "..");
const archiveFile = path.join(root, "data", "robot_match_archive.json");
const memoryFile = path.join(root, "data", "learning-memory.json");
const fixturesFile = path.join(root, "data", "fixtures.json");
const scoreStatusFile = path.join(root, "data", "learning-score-linker-status.json");
const outJson = path.join(root, "data", "result-tracking-health-status.json");
const outMd = path.join(root, "outputs", "result-tracking-health-report.md");

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}

function write(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value, "utf8");
}

function score(value) {
  return /\d+\D+\d+/.test(String(value || ""));
}

function runResultTrackingHealthCheck() {
  const archive = require("./archive-storage").readArchive(archiveFile, { matches: [] });
  const memory = readJson(memoryFile, { predictions: [] });
  const fixtures = readJson(fixturesFile, []);
  const linker = readJson(scoreStatusFile, {});
  const archived = Array.isArray(archive.matches) ? archive.matches : [];
  const activeFixtures = Array.isArray(fixtures) ? fixtures : [];
  const predictions = Array.isArray(memory.predictions) ? memory.predictions : [];
  const finished = archived.filter((m) => String(m.status || "").toLowerCase() === "finished").length;
  const archivedWithScore = archived.filter((m) => score(m.score || m.result_score)).length;
  const pending = predictions.filter((p) => p.status === "pending").length;
  const stalePending = stalePendingStats(predictions);
  const linked = predictions.filter((p) => score(p.result_score)).length;
  const hasTrackingInput = activeFixtures.length > 0 || archived.length > 0;
  const status = stalePending.stale_count > 0
    ? "warning"
    : linked > 0 || archivedWithScore > 0
      ? "ok"
      : hasTrackingInput
        ? "izleme"
        : "empty";
  const report = {
    generated_at: new Date().toISOString(),
    status,
    active_fixture_count: activeFixtures.length,
    archived_match_count: archived.length,
    finished_match_count: finished,
    archived_score_count: archivedWithScore,
    prediction_count: predictions.length,
    pending_prediction_count: pending,
    stale_pending_prediction_count: stalePending.stale_count,
    stale_pending_oldest_date: stalePending.oldest_date,
    stale_pending_newest_date: stalePending.newest_stale_date,
    stale_pending_by_date: stalePending.by_date,
    stale_pending_top_markets: stalePending.top_markets,
    stale_pending_examples: stalePending.examples,
    linked_prediction_score_count: linked,
    last_link_checked: linker.checked || 0,
    last_linked: linker.linked || 0,
    next_action: status === "warning"
      ? "Eski pending tahminler dogrudan final-skor koprusu ve finalizer ile eritilmeli."
      : status === "ok"
        ? "Tahmin olcum asamasina gecilebilir."
        : status === "izleme"
          ? "Sonuc bekleniyor. Izleme devam."
          : "Sonuc kaynagi ve skor eslestirme takip edilmeli."
  };
  const md = [
    "# Sonuc Takip Saglik Kontrolu",
    "",
    `Durum: ${report.status}`,
    `Aktif bulten maci: ${report.active_fixture_count}`,
    `Arsiv maci: ${report.archived_match_count}`,
    `Biten mac: ${report.finished_match_count}`,
    `Skorlu arsiv maci: ${report.archived_score_count}`,
    `Tahmin sayisi: ${report.prediction_count}`,
    `Bekleyen tahmin: ${report.pending_prediction_count}`,
    `Eski pending tahmin: ${report.stale_pending_prediction_count}`,
    `En eski pending tarihi: ${report.stale_pending_oldest_date || "-"}`,
    `Skor baglanan tahmin: ${report.linked_prediction_score_count}`,
    `Son kontrol: ${report.last_link_checked}`,
    `Son baglanan: ${report.last_linked}`,
    "",
    `Sonraki aksiyon: ${report.next_action}`,
    ""
  ].join("\n");
  write(outJson, `${JSON.stringify(report, null, 2)}\n`);
  write(outMd, md);
  console.log(`Result tracking health: ${report.status}. Active: ${activeFixtures.length}, Archived: ${archived.length}, Linked: ${linked}`);
  return report;
}

if (require.main === module) runResultTrackingHealthCheck();
module.exports = { runResultTrackingHealthCheck };

