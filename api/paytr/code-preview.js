const { json } = require("../_lib/http");
const { generateMembershipCode } = require("../_lib/code-generate");

function clean(value) {
  return String(value || "").trim().toLowerCase();
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  const planId = clean(req.query && req.query.plan_id ? req.query.plan_id : "gold");
  const generated = generateMembershipCode(planId);

  return json(res, 200, {
    ok: true,
    plan_id: planId,
    codeLabel: generated.codeLabel,
    hashReady: Boolean(generated.codeHash),
    note: "Bu sadece onizleme testidir. Kod aktif edilmez ve merkezi dosyaya yazilmaz."
  });
};
