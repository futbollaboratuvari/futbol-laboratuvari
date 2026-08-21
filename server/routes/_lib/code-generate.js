const crypto = require("crypto");

function randomPart(size) {
  return crypto.randomBytes(size).toString("hex").toUpperCase();
}

function normalizePlanCode(planCode) {
  return String(planCode || "gold").trim().toLowerCase();
}

function planPrefix(planCode) {
  const code = normalizePlanCode(planCode);
  if (code === "diamond") return "DIA";
  if (code === "premium") return "PRE";
  if (code === "gift") return "GIFT";
  if (code === "founder") return "KURUCU";
  return "GOLD";
}

function hashCode(code) {
  return crypto.createHash("sha256").update(String(code || "").trim()).digest("hex");
}

function maskCode(code) {
  const parts = String(code || "").split("-");
  if (parts.length >= 3) {
    return `${parts[0]}-${parts[1]}-****-${parts[parts.length - 1]}`;
  }
  return "AUTO-****";
}

function generateMembershipCode(planCode) {
  const prefix = planPrefix(planCode);
  const code = `${prefix}-${randomPart(2)}-${randomPart(2)}-${randomPart(2)}`;

  return {
    code,
    codeHash: hashCode(code),
    codeLabel: maskCode(code)
  };
}

function helperRoute(req, res) {
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ ok: false, error: "not_found" }));
}

helperRoute.generateMembershipCode = generateMembershipCode;
helperRoute.hashCode = hashCode;
helperRoute.maskCode = maskCode;

module.exports = helperRoute;
