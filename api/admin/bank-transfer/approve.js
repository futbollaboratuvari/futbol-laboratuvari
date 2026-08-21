const crypto = require("crypto");
const { json, readBody, requireEnv } = require("../../_lib/http");
const { getPlan } = require("../../_lib/plans");
const { selectOne, updateMany } = require("../../_lib/supabase-rest");
const { generateMembershipCode, hashCode } = require("../../_lib/code-generate");
const { publishMembershipCode } = require("../../_lib/publish-membership-code");
const {
  clean,
  membershipPlanCode,
  encryptMembershipCode,
  decryptMembershipCode,
} = require("../../_lib/bank-transfer");

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function expiresAt(days, from = new Date()) {
  const date = new Date(from);
  date.setUTCDate(date.getUTCDate() + Number(days || 0));
  return date.toISOString();
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "Method Not Allowed" });

  try {
    const expectedSecret = requireEnv("ADMIN_PAYMENT_SECRET");
    const suppliedSecret = req.headers["x-admin-payment-secret"];
    if (!safeEqual(suppliedSecret, expectedSecret)) {
      return json(res, 401, { ok: false, error: "Yetkisiz işlem." });
    }

    const body = await readBody(req);
    const orderCode = clean(body.order_code, 80).toUpperCase();
    const approvedBy = clean(body.approved_by || "admin", 80);
    if (!orderCode) return json(res, 400, { ok: false, error: "Sipariş kodu zorunludur." });

    let order = await selectOne("bank_transfer_orders", { order_code: orderCode });
    if (!order) return json(res, 404, { ok: false, error: "Sipariş bulunamadı." });

    if (order.status === "paid") {
      const existingCode = order.membership_code_cipher ? decryptMembershipCode(order.membership_code_cipher) : null;
      return json(res, 200, {
        ok: true,
        already_paid: true,
        order_code: order.order_code,
        membership_code: existingCode,
        membership_code_label: order.membership_code_label,
      });
    }

    if (!["pending", "payment_reported"].includes(order.status)) {
      return json(res, 409, { ok: false, error: `Bu sipariş onaylanamaz: ${order.status}` });
    }

    const plan = getPlan(order.plan_id);
    if (!plan || Number(order.amount_kurus) !== Number(plan.amountKurus)) {
      return json(res, 409, { ok: false, error: "Sipariş paket/tutar doğrulaması başarısız." });
    }

    let membershipCode = null;
    let membershipLabel = order.membership_code_label || null;

    if (order.membership_code_cipher) {
      membershipCode = decryptMembershipCode(order.membership_code_cipher);
    } else {
      const generated = generateMembershipCode(membershipPlanCode(plan.id));
      membershipCode = generated.code;
      membershipLabel = generated.codeLabel;
      const staged = await updateMany("bank_transfer_orders", { order_code: order.order_code }, {
        membership_code_cipher: encryptMembershipCode(membershipCode),
        membership_code_label: membershipLabel,
      });
      if (!staged.length) throw new Error("Membership code stage failed");
      order = staged[0];
    }

    const paidAt = new Date();
    const published = await publishMembershipCode({
      codeHash: hashCode(membershipCode),
      codeLabel: membershipLabel,
      planCode: membershipPlanCode(plan.id),
      planName: plan.name,
      remainingAnalysisCount: plan.paidUses,
      orderCode: order.order_code,
      createdAt: paidAt.toISOString(),
      expiresAt: expiresAt(plan.durationDays, paidAt),
    });

    const rows = await updateMany("bank_transfer_orders", { order_code: order.order_code }, {
      status: "paid",
      paid_at: paidAt.toISOString(),
      approved_by: approvedBy,
    });
    if (!rows.length) throw new Error("Order approval update failed");

    return json(res, 200, {
      ok: true,
      order_code: order.order_code,
      status: "paid",
      plan_id: plan.id,
      plan_name: plan.name,
      amount_kurus: plan.amountKurus,
      membership_code: membershipCode,
      membership_code_label: membershipLabel,
      membership_expires_at: expiresAt(plan.durationDays, paidAt),
      publish: published,
    });
  } catch (error) {
    console.error("bank-transfer approve error", error);
    return json(res, 500, { ok: false, error: "Ödeme onaylanamadı." });
  }
};
