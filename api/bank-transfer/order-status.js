const { json, readBody } = require("../_lib/http");
const { selectOne } = require("../_lib/supabase-rest");
const { clean, normalizeEmail, decryptMembershipCode } = require("../_lib/bank-transfer");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "Method Not Allowed" });

  try {
    const body = await readBody(req);
    const orderCode = clean(body.order_code, 80).toUpperCase();
    const email = normalizeEmail(body.email);
    if (!orderCode || !email) return json(res, 400, { ok: false, error: "Sipariş kodu ve e-posta zorunludur." });

    const order = await selectOne("bank_transfer_orders", { order_code: orderCode });
    if (!order || normalizeEmail(order.email) !== email) {
      return json(res, 404, { ok: false, error: "Sipariş bulunamadı." });
    }

    let membershipCode = null;
    if (order.status === "paid" && order.membership_code_cipher) {
      try { membershipCode = decryptMembershipCode(order.membership_code_cipher); } catch { membershipCode = null; }
    }

    return json(res, 200, {
      ok: true,
      order: {
        order_code: order.order_code,
        plan_id: order.plan_id,
        plan_name: order.plan_name,
        amount_kurus: order.amount_kurus,
        amount_try: (order.amount_kurus / 100).toFixed(2),
        status: order.status,
        payment_reference: order.payment_reference,
        created_at: order.created_at,
        payment_reported_at: order.payment_reported_at,
        paid_at: order.paid_at,
      },
      membership: order.status === "paid" ? {
        active: true,
        code: membershipCode,
        code_label: order.membership_code_label,
      } : { active: false },
    });
  } catch (error) {
    console.error("bank-transfer order-status error", error);
    return json(res, 500, { ok: false, error: "Sipariş durumu alınamadı." });
  }
};
