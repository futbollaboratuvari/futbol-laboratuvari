const crypto = require("crypto");
const { getUsageToken } = require("./usage-token");

const owner = "futbollaboratuvari";
const repo = "futbol-laboratuvari";
const path = "data/membership-codes.json";

const planDefaults = {
  gold: { name: "Gold Paket", limit: 25 },
  diamond: { name: "Diamond Paket", limit: 50 },
  premium: { name: "Premium Paket", limit: 100 },
  gift: { name: "Hediyelik Kod", limit: 10 }
};

function normalizeCode(value) {
  return String(value || "").trim().replace(/\s+/g, "").toLocaleUpperCase("tr-TR");
}

function makeHash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function maskCode(value) {
  const code = normalizeCode(value);
  const parts = code.split("-");
  if (parts.length >= 4) return `${parts[0]}-${parts[1]}-****-${parts[3]}`;
  return `${code.slice(0, 8)}****`;
}

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
  return {
    sha: response.data.sha,
    data: JSON.parse(decodeContent(response.data.content))
  };
}

async function addMembershipCode(payload) {
  const token = getUsageToken();
  if (!token) return { added: false, reason: "token-missing" };

  const rawCode = normalizeCode(payload && payload.code);
  const planCode = String((payload && payload.planCode) || "gold").toLowerCase();
  const plan = planDefaults[planCode];

  if (!rawCode) return { added: false, reason: "code-empty" };
  if (!plan) return { added: false, reason: "plan-invalid" };

  try {
    const codeHash = makeHash(rawCode);
    const Octokit = await loadOctokit();
    const octokit = new Octokit({ auth: token });
    const current = await getCurrentFile(octokit);
    const codes = current.data.codes || [];

    if (codes.some(item => String(item.codeHash || "").toLowerCase() === codeHash)) {
      return { added: false, reason: "code-exists" };
    }

    const item = {
      codeHash,
      codeLabel: maskCode(rawCode),
      planCode,
      planName: plan.name,
      remainingAnalysisCount: plan.limit,
      active: true,
      owner: String((payload && payload.owner) || "").trim(),
      note: String((payload && payload.note) || "").trim(),
      createdAt: new Date().toISOString().slice(0, 10)
    };

    current.data.codes = [...codes, item];
    current.data.updatedAt = new Date().toISOString();

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      branch: "main",
      message: "Yeni uyelik kodu eklendi",
      content: encodeContent(JSON.stringify(current.data, null, 2) + "\n"),
      sha: current.sha
    });

    return { added: true, item };
  } catch (error) {
    return { added: false, reason: "write-failed" };
  }
}

module.exports = {
  addMembershipCode
};
