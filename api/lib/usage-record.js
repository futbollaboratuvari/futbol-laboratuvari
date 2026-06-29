function nowTR() {
  return new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
}

function text(value, fallback) {
  const clean = String(value || "").trim();
  return clean || fallback || "";
}

function createUsageRecord(input) {
  return {
    id: String(Date.now()),
    at: nowTR(),
    planCode: text(input.planCode, "unknown"),
    planName: text(input.planName, "Bilinmeyen Paket"),
    remainingAnalysisCount: Number(input.remainingAnalysisCount || 0),
    codeLabel: text(input.codeLabel, ""),
    owner: text(input.owner, "")
  };
}

function helperRoute(req, res) {
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ ok: false, error: "not_found" }));
}

helperRoute.createUsageRecord = createUsageRecord;

module.exports = helperRoute;
