const { readJsonFile, writeJsonFile } = require("../_lib/github-contents");
const { getUsageToken } = require("./usage-token");

const path = "data/usage-log.json";
const MAX_RECORDS = 200;

function dataBranch() {
  return String(
    process.env.USAGE_LOG_BRANCH ||
    process.env.MEMBERSHIP_VERIFY_BRANCH ||
    process.env.MEMBERSHIP_PUBLISH_BRANCH ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    "main"
  ).trim() || "main";
}

async function appendUsageRecord(record) {
  const recordId = record && record.id ? record.id : "";
  const token = getUsageToken();
  const branch = dataBranch();

  if (!token) {
    return { saved: false, reason: "token-missing", recordId, branch };
  }

  try {
    const current = await readJsonFile(token, path, branch);

    const nextData = {
      version: 1,
      updatedAt: new Date().toISOString(),
      records: [record, ...(current.data.records || [])].slice(0, MAX_RECORDS)
    };

    await writeJsonFile(token, path, current.sha, nextData, "Kullanim gecmisi kaydi eklendi", branch);

    return { saved: true, recordId, branch };
  } catch (error) {
    return { saved: false, reason: "write-failed", recordId, branch };
  }
}

function helperRoute(req, res) {
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ ok: false, error: "not_found" }));
}

helperRoute.appendUsageRecord = appendUsageRecord;
helperRoute.dataBranch = dataBranch;

module.exports = helperRoute;
