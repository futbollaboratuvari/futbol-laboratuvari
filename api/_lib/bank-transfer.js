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
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Istanbul",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const map = Object.fromEntries(parts.map(part => [part.type, part.value]));
  const date = `${map.year}${map.month}${map.day}`;
  return `FL-${date}-${randomToken(3)}`;
}

function normalizeIban(value) {
  return String(value || "").replace(/\s+/g, "").toUpperCase();
}

function validIban(value) {
  const iban = normalizeIban(value);
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(iban)) return false;
  if (iban.startsWith("TR") && iban.length !== 26) return false;
  if (iban.length < 15 || iban.length > 34) return false;

  const rearranged = `${iban.slice(4)}${iban.slice(0, 4)}`;
  let remainder = 0;
  for (const char of rearranged) {
    const numeric = /[0-9]/.test(char) ? char : String(char.charCodeAt(0) - 55);
    for (const digit of numeric) {
      remainder = (remainder * 10 + Number(digit)) % 97;
    }
  }
  return remainder === 1;
}

function publicBankDetails() {
  const iban = normalizeIban(requireEnv("BANK_IBAN"));
  if (!validIban(iban)) throw new Error("BANK_IBAN geçersiz");
  return {
    bank_name: clean(process.env.BANK_NAME || "", 120),
    account_holder: requireEnv("BANK_ACCOUNT_HOLDER"),
    iban,
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
  const normalized = normalizeIban(iban);
  if (normalized.length < 10) return normalized;
  return `${normalized.slice(0, 6)}••••••••••••${normalized.slice(-6)}`;
}

module.exports = {
  clean,
  normalizeEmail,
  validEmail,
  orderCode,
  normalizeIban,
  validIban,
  publicBankDetails,
  membershipPlanCode,
  encryptMembershipCode,
  decryptMembershipCode,
  maskIban,
};
