const crypto = require("crypto");
const { requireEnv } = require("./http");

function clean(value, max = 180) {
  return String(value || "").trim().slice(0, max);
}

function normalizeEmail(value) {
  return clean(value, 180).toLowerCase();
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

function randomToken(bytes = 3) {
  return crypto.randomBytes(bytes).toString("hex").toUpperCase();
}

function orderCode(now = new Date()) {
  const date = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).format(now).replaceAll("-", "");
  return `FL-${date}-${randomToken(3)}`;
}

function publicBankDetails() {
  return {
    bank_name: clean(process.env.BANK_NAME || "", 120),
    account_holder: requireEnv("BANK_ACCOUNT_HOLDER"),
    iban: requireEnv("BANK_IBAN").replace(/\s+/g, "").toUpperCase(),
  };
}

function membershipPlanCode(planId) {
  if (planId === "pro") return "diamond";
  if (planId === "vip") return "premium";
  return "gold";
}

function encryptionKey() {
  const secret = requireEnv("BANK_TRANSFER_CODE_SECRET");
  return crypto.createHash("sha256").update(secret).digest();
}

function encryptMembershipCode(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map(part => part.toString("base64url")).join(".");
}

function decryptMembershipCode(payload) {
  const [ivRaw, tagRaw, encryptedRaw] = String(payload || "").split(".");
  if (!ivRaw || !tagRaw || !encryptedRaw) return null;
  const decipher = crypto.createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivRaw, "base64url"));
  decipher.setAuthTag(Buffer.from(tagRaw, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(encryptedRaw, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

function maskIban(iban) {
  const normalized = String(iban || "").replace(/\s+/g, "");
  if (normalized.length < 10) return normalized;
  return `${normalized.slice(0, 6)}••••••••••••${normalized.slice(-6)}`;
}

module.exports = {
  clean,
  normalizeEmail,
  validEmail,
  orderCode,
  publicBankDetails,
  membershipPlanCode,
  encryptMembershipCode,
  decryptMembershipCode,
  maskIban,
};
