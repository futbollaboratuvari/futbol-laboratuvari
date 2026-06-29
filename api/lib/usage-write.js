const { readJsonFile, writeJsonFile } = require("../_lib/github-contents");
const { getUsageToken } = require("./usage-token");

const path = "data/usage-log.json";
const MAX_RECORDS = 200;

async function appendUsageRecord(record) {
  const recordId = record && record.id ? record.id : "";
  const token = getUsageToken();

  if (!token) {
    return { saved: false, reason: "token-missing", recordId };
  }

  try {
    const current = await readJsonFile(token, path);

    const nextData = {
      version: 1,
      updatedAt: new Date().toISOString(),
      records: [record, ...(current.data.records || [])].slice(0, MAX_RECORDS)
    };

    await writeJsonFile(token, path, current.sha, nextData, "Kullanim gecmisi kaydi eklendi");

    return { saved: true, recordId };
  } catch (error) {
    return { saved: false, reason: "write-failed", recordId };
  }
}

function helperRoute(req, res) {
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ ok: false, error: "not_found" }));
}

helperRoute.appendUsageRecord = appendUsageRecord;

module.exports = helperRoute;
