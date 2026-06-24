const crypto = require("crypto");
const { appendUsageRecord } = require("./lib/usage-write");
const { decreaseMembershipCount } = require("./lib/membership-decrement");

const CODE_DATABASE = {
  "d0e366399638702f7f4fd5cae64e544617bc4ec948a277a34c2a9d7cb855d290": {
    planCode: "founder",
    planName: "Kurucu Üye",
    remainingAnalysisCount: 9999,
    codeLabel: "KURUCU-U1NZ-****-KZ9L",
    owner: "Cem / Kurucu"
  }
};

const USAGE_LOG_KEY = "__FL_USAGE_LOG__";
const MAX_USAGE_LOG = 200;

globalThis[USAGE_LOG_KEY] = globalThis[USAGE_LOG_KEY] || [];

function normalizeCode(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .toLocaleUpperCase("tr-TR");
}

function sha256(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function nowTR() {
  return new Date().toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
}

function readEnvCodes() {
  const envHashes = String(process.env.MEMBERSHIP_CODE_HASHES || "")
    .split(/[\n,;]+/)
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  const envPlainCodes = String(process.env.MEMBERSHIP_CODES || "")
    .split(/[\n,;]+/)
    .map(normalizeCode)
    .filter(Boolean)
    .map(sha256);

  const extra = {};

  for (const hash of [...envHashes, ...envPlainCodes]) {
    extra[hash] = {
      planCode: "premium",
      planName: "Premium Paket",
      remainingAnalysisCount: 100,
      codeLabel: "ENV-****",
      owner: ""
    };
  }

  return extra;
}

async function readManagedCodes() {
  const url = `https://raw.githubusercontent.com/futbollaboratuvari/futbol-laboratuvari/main/data/membership-codes.json?ts=${Date.now()}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return {};

  const data = await response.json();
  const map = {};

  for (const item of data.codes || []) {
    if (!item.codeHash) continue;
    map[String(item.codeHash).toLowerCase()] = {
      planCode: item.planCode,
      planName: item.planName,
      remainingAnalysisCount: Number(item.remainingAnalysisCount || 0),
      active: item.active !== false,
      codeLabel: item.codeLabel || "",
      owner: item.owner || ""
    };
  }

  return map;
}

async function readPermanentUsageLog() {
  const url = `https://raw.githubusercontent.com/futbollaboratuvari/futbol-laboratuvari/main/data/usage-log.json?ts=${Date.now()}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return [];
  const data = await response.json();
  return data.records || [];
}

function recordUsage(codeHash, codeInfo) {
  const record = {
    id: `${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
    at: nowTR(),
    planCode: codeInfo.planCode,
    planName: codeInfo.planName,
    remainingAnalysisCount: codeInfo.remainingAnalysisCount,
    codeLabel: codeInfo.codeLabel || `${codeHash.slice(0, 10)}...`,
    owner: codeInfo.owner || "",
    codeHashShort: `${codeHash.slice(0, 12)}...`
  };

  globalThis[USAGE_LOG_KEY].unshift(record);
  globalThis[USAGE_LOG_KEY] = globalThis[USAGE_LOG_KEY].slice(0, MAX_USAGE_LOG);
  return record;
}

async function getUsageLog() {
  const permanent = await readPermanentUsageLog();
  if (permanent.length) return permanent.slice(0, MAX_USAGE_LOG);
  return globalThis[USAGE_LOG_KEY].slice(0, MAX_USAGE_LOG);
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      storage: "permanent-file-read",
      message: "Kullanim gecmisi kalici dosyadan okunur. Hak dusurme modulu baglandi.",
      records: await getUsageLog()
    });
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

    const codeHash = sha256(code);
    const managedCodes = await readManagedCodes();
    const managedCode = managedCodes[codeHash];

    if (managedCode && !managedCode.active) {
      return res.status(401).json({ ok: false, message: "Kod pasif durumda." });
    }

    const codeInfo = managedCode || CODE_DATABASE[codeHash] || readEnvCodes()[codeHash];

    if (!codeInfo) {
      return res.status(401).json({ ok: false, message: "Kod hatalı veya aktif değil." });
    }

    if (codeInfo.planCode !== "founder" && Number(codeInfo.remainingAnalysisCount || 0) <= 0) {
      return res.status(403).json({ ok: false, message: "Kullanım hakkı bitti." });
    }

    const usageRecord = recordUsage(codeHash, codeInfo);
    const saveResult = await appendUsageRecord(usageRecord);
    const decrementResult = await decreaseMembershipCount(codeHash);
    const nextRemaining = decrementResult.changed ? decrementResult.remainingAnalysisCount : codeInfo.remainingAnalysisCount;

    return res.status(200).json({
      ok: true,
      message: `${codeInfo.planName} kabul edildi. Üyelik aktif.`,
      membership: {
        planCode: codeInfo.planCode,
        planName: codeInfo.planName,
        remainingAnalysisCount: nextRemaining
      },
      usageRecordId: usageRecord.id,
      saveResult,
      decrementResult
    });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Backend kod kontrolünde hata oluştu." });
  }
};
