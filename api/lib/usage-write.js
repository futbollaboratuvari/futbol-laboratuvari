const { getUsageToken } = require("./usage-token");

const owner = "futbollaboratuvari";
const repo = "futbol-laboratuvari";
const path = "data/usage-log.json";
const MAX_RECORDS = 200;

function decodeContent(value) {
  return Buffer.from(String(value || ""), "base64").toString("utf8");
}

function encodeContent(value) {
  return Buffer.from(value, "utf8").toString("base64");
}

async function loadOctokit() {
  const mod = await import("@octokit/rest");
  return mod.Octokit;
}

async function getCurrentFile(octokit) {
  const response = await octokit.repos.getContent({
    owner,
    repo,
    path,
    ref: "main"
  });

  const file = response.data;
  return {
    sha: file.sha,
    data: JSON.parse(decodeContent(file.content))
  };
}

async function appendUsageRecord(record) {
  const recordId = record && record.id ? record.id : "";
  const token = getUsageToken();

  if (!token) {
    return { saved: false, reason: "token-missing", recordId };
  }

  try {
    const Octokit = await loadOctokit();
    const octokit = new Octokit({ auth: token });
    const current = await getCurrentFile(octokit);

    const nextData = {
      version: 1,
      updatedAt: new Date().toISOString(),
      records: [record, ...(current.data.records || [])].slice(0, MAX_RECORDS)
    };

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      branch: "main",
      message: "Kullanim gecmisi kaydi eklendi",
      content: encodeContent(JSON.stringify(nextData, null, 2) + "\n"),
      sha: current.sha
    });

    return { saved: true, recordId };
  } catch (error) {
    return { saved: false, reason: "write-failed", recordId };
  }
}

module.exports = {
  appendUsageRecord
};
