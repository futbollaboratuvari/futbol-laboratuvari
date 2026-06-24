const crypto = require("crypto");
const { getUsageToken } = require("./lib/usage-token");

const repoOwner = "futbollaboratuvari";
const repoName = "futbol-laboratuvari";
const filePath = "data/membership-codes.json";
const adminHash = "d0e366399638702f7f4fd5cae64e544617bc4ec948a277a34c2a9d7cb855d290";

const planDefaults = {
  gold: { name: "Gold Paket", limit: 25 },
  diamond: { name: "Diamond Paket", limit: 50 },
  premium: { name: "Premium Paket", limit: 100 },
  gift: { name: "Hediyelik Kod", limit: 10 }
};

function normalize(value) {
  return String(value || "").trim().replace(/\s+/g, "").toLocaleUpperCase("tr-TR");
}

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function maskCode(code) {
  const parts = String(code || "").split("-");
  if (parts.length >= 4) return `${parts[0]}-${parts[1]}-****-${parts[3]}`;
  return `${String(code || "").slice(0, 8)}****`;
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
  const response = await octokit.repos.getContent({
    owner: repoOwner,
    repo: repoName,
    path: filePath,
    ref: "main"
  });
  return {
    sha: response.data.sha,
    data: JSON.parse(decodeContent(response.data.content))
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, message: "Sadece POST kabul edilir." });

  try {
    const token = getUsageToken();
    if (!token) return res.status(500).json({ ok: false, message: "Yazma anahtari eksik." });

    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const adminCode = normalize(body.adminCode);
    if (hash(adminCode) !== adminHash) return res.status(401).json({ ok: false, message: "Admin kodu hatali." });

    const rawCode = normalize(body.code);
    const planCode = String(body.planCode || "gold").toLowerCase();
    const plan = planDefaults[planCode];
    if (!rawCode) return res.status(400).json({ ok: false, message: "Yeni kod bos olamaz." });
    if (!plan) return res.status(400).json({ ok: false, message: "Paket tipi hatali." });

    const codeHash = hash(rawCode);
    const Octokit = await loadOctokit();
    const octokit = new Octokit({ auth: token });
    const current = await getCurrentFile(octokit);
    const codes = current.data.codes || [];

    if (codes.some(item => String(item.codeHash || "").toLowerCase() === codeHash)) {
      return res.status(409).json({ ok: false, message: "Bu kod zaten var." });
    }

    const newItem = {
      codeHash,
      codeLabel: maskCode(rawCode),
      planCode,
      planName: plan.name,
      remainingAnalysisCount: plan.limit,
      active: true,
      owner: String(body.owner || "").trim(),
      note: String(body.note || "").trim(),
      createdAt: new Date().toISOString().slice(0, 10)
    };

    current.data.codes = [...codes, newItem];
    current.data.updatedAt = new Date().toISOString();

    await octokit.repos.createOrUpdateFileContents({
      owner: repoOwner,
      repo: repoName,
      path: filePath,
      branch: "main",
      message: "Yeni uyelik kodu eklendi",
      content: encodeContent(JSON.stringify(current.data, null, 2) + "\n"),
      sha: current.sha
    });

    return res.status(200).json({ ok: true, message: "Kod kalici olarak eklendi.", item: newItem });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Kod ekleme hatasi." });
  }
};
