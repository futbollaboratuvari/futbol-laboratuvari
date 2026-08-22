const { readJsonFile, writeJsonFile } = require("../_lib/github-contents");
const { getUsageToken } = require("./usage-token");

const path = "data/membership-codes.json";

async function decreaseMembershipCount(codeHash) {
  const token = getUsageToken();
  if (!token) return { changed: false, reason: "token-missing" };

  try {
    const current = await readJsonFile(token, path);
    const codes = current.data.codes || [];
    const index = codes.findIndex(item => String(item.codeHash || "").toLowerCase() === String(codeHash || "").toLowerCase());

    if (index < 0) return { changed: false, reason: "code-not-found" };

    const item = codes[index];
    if (item.planCode === "founder") {
      return { changed: false, reason: "founder-fixed", remainingAnalysisCount: item.remainingAnalysisCount };
    }

    const currentCount = Number(item.remainingAnalysisCount || 0);
    if (currentCount <= 0) {
      item.active = false;
      return { changed: false, reason: "limit-finished", remainingAnalysisCount: 0 };
    }

    item.remainingAnalysisCount = currentCount - 1;
    if (item.remainingAnalysisCount <= 0) item.active = false;
    current.data.updatedAt = new Date().toISOString();

    await writeJsonFile(token, path, current.sha, current.data, "Uyelik kullanim hakki dusuruldu");

    return { changed: true, remainingAnalysisCount: item.remainingAnalysisCount };
  } catch (error) {
    return { changed: false, reason: "decrement-failed" };
  }
}

async function stageCodeRecord(record) {
  return {
    ready: false,
    reason: "stage-only",
    codeLabel: record && record.codeLabel ? record.codeLabel : ""
  };
}

function helperRoute(req, res) {
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ ok: false, error: "not_found" }));
}

helperRoute.decreaseMembershipCount = decreaseMembershipCount;
helperRoute.stageCodeRecord = stageCodeRecord;

module.exports = helperRoute;
