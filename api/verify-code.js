const crypto = require("crypto");

const DEFAULT_TEST_HASHES = [
  // KURUCU-TEST-2026
  "340e3aa6b3669a195f3691ae3c605fcf2c21e96b759e7e93fa31133eea828bdf"
];

function normalizeCode(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .toLocaleUpperCase("tr-TR");
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function readHashList() {
  const envHashes = String(process.env.MEMBERSHIP_CODE_HASHES || "")
    .split(/[\n,;]+/)
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  const envPlainCodes = String(process.env.MEMBERSHIP_CODES || "")
    .split(/[\n,;]+/)
    .map(normalizeCode)
    .filter(Boolean)
    .map(sha256);

  return new Set([...DEFAULT_TEST_HASHES, ...envHashes, ...envPlainCodes]);
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Sadece POST isteği kabul edilir." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const code = normalizeCode(body.code);

    if (!code) {
      return res.status(400).json({ ok: false, message: "Kod boş olamaz." });
    }

    const allowedHashes = readHashList();
    const codeHash = sha256(code);

    if (!allowedHashes.has(codeHash)) {
      return res.status(401).json({ ok: false, message: "Kod hatalı veya aktif değil." });
    }

    return res.status(200).json({
      ok: true,
      message: "Kod kabul edildi. Premium üyelik aktif.",
      membership: {
        planCode: "premium",
        planName: "Premium Üye",
        remainingAnalysisCount: 20
      }
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Backend kod kontrolünde hata oluştu." });
  }
};
