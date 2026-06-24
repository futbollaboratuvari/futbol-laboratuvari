const { getUsageToken } = require("./usage-token");

const owner = "futbollaboratuvari";
const repo = "futbol-laboratuvari";
const path = "data/membership-codes.json";

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
  const response = await octokit.repos.getContent({ owner, repo, path, ref: "main" });
  const file = response.data;
  return {
    sha: file.sha,
    data: JSON.parse(decodeContent(file.content))
  };
}

async function decreaseMembershipCount(codeHash) {
  const token = getUsageToken();
  if (!token) return { changed: false, reason: "token-missing" };

  try {
    const Octokit = await loadOctokit();
    const octokit = new Octokit({ auth: token });
    const current = await getCurrentFile(octokit);
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

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      branch: "main",
      message: "Uyelik kullanim hakki dusuruldu",
      content: encodeContent(JSON.stringify(current.data, null, 2) + "\n"),
      sha: current.sha
    });

    return { changed: true, remainingAnalysisCount: item.remainingAnalysisCount };
  } catch (error) {
    return { changed: false, reason: "decrement-failed" };
  }
}

module.exports = {
  decreaseMembershipCount
};
