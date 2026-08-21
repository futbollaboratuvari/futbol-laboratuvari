const { json, readBody } = require("../_lib/http");
const { getPlan } = require("../_lib/plans");
const { insertOne } = require("../_lib/supabase-rest");
const {
  clean,
  normalizeEmail,
  validEmail,
  orderCode,
  publicBankDetails,
} = require("../_lib/bank-transfer");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });
  if (req.method !== "POST") return json(res, 405, { ok: false, error: "Method Not Allowed" });

  try {
    const body = await readBody(req);
    const planId = clean(body.plan_id, 40);
    const email = normalizeEmail(body.email);
    const customerName = clean(body.name, 120);
    const phone = clean(body.phone, 40);
    const plan = getPlan(planId);

    if (!plan) return json(res, 400, { ok: false, error: "Geçersiz paket." });
    if (!customerName || !phone || !validEmail(email)) {
      return json(res, 400, { ok: false, error: "Ad soyad, geçerli e-posta ve telefon zorunludur." });
    }

    let order = null;
    let lastError = null;
    for (let attempt = 0; attempt < 3 && !order; attempt += 1) {
      const code = orderCode();
      try {
        order = await insertOne("bank_transfer_orders", {
          order_code: code,
          email,
          customer_name: customerName,
          phone,
          plan_id: plan.id,
          plan_name: plan.name,
          amount_kurus: plan.amountKurus,
          currency: "TRY",
          status: "pending",
          payment_reference: code,
        });
      } catch (error) {
        lastError = error;
        if (error.status !== 409) throw error;
      }
    }

    if (!order) throw lastError || new Error("Sipariş oluşturulamadı.");

    const bank = publicBankDetails();
    return json(res, 200, {
      ok: true,
      order: {
        order_code: order.order_code,
        plan_id: order.plan_id,
        plan_name: order.plan_name,
        amount_kurus: order.amount_kurus,
        amount_try: (order.amount_kurus / 100).toFixed(2),
        currency: order.currency,
        status: order.status,
        payment_reference: order.payment_reference,
        created_at: order.created_at,
      },
      bank,
      instruction: `Havale / EFT / FAST açıklamasına yalnız ${order.payment_reference} yazın.`,
    });
  } catch (error) {
    console.error("bank-transfer create-order error", error);
    return json(res, 500, { ok: false, error: "Sipariş oluşturulamadı." });
  }
};
