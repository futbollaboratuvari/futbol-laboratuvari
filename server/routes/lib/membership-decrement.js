const { readJsonFile, writeJsonFile } = require("../_lib/github-contents");
const { getUsageToken } = require("./usage-token");

const path = "data/membership-codes.json";

function dataBranch() {
  return String(
    process.env.MEMBERSHIP_VERIFY_BRANCH ||
    process.env.MEMBERSHIP_PUBLISH_BRANCH ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    "main"
  ).trim() || "main";
}

async function decreaseMembershipCount(codeHash) {
  const token = getUsageToken();
  const branch = dataBranch();
  if (!token) return { changed: false, reason: "token-missing", branch };

  try {
    const current = await readJsonFile(token, path, branch);
    const codes = current.data.codes || [];
    const index = codes.findIndex(item => String(item.codeHash || "").toLowerCase() === String(codeHash || "").toLowerCase());

    if (index < 0) return { changed: false, reason: "code-not-found", branch };

    const item = codes[index];
    if (item.planCode === "founder") {
      return { changed: false, reason: "founder-fixed", remainingAnalysisCount: item.remainingAnalysisCount, branch };
    }

    const currentCount = Number(item.remainingAnalysisCount || 0);
    if (currentCount <= 0) {
      item.active = false;
      return { changed: false, reason: "limit-finished", remainingAnalysisCount: 0, branch };
    }

    item.remainingAnalysisCount = currentCount - 1;
    if (item.remainingAnalysisCount <= 0) item.active = false;
    current.data.updatedAt = new Date().toISOString();

    await writeJsonFile(token, path, current.sha, current.data, "Uyelik kullanim hakki dusuruldu", branch);

    return { changed: true, remainingAnalysisCount: item.remainingAnalysisCount, branch };
  } catch (error) {
    return { changed: false, reason: "decrement-failed", branch };
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
helperRoute.dataBranch = dataBranch;

module.exports = helperRoute;
