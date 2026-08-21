const { json, readBody } = require("../_lib/http");
const { selectOne, updateMany } = require("../_lib/supabase-rest");
const { clean, normalizeEmail } = require("../_lib/bank-transfer");

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

    if (order.status === "paid") {
      return json(res, 200, { ok: true, status: "paid", message: "Ödeme zaten onaylanmış." });
    }
    if (["rejected", "cancelled", "expired"].includes(order.status)) {
      return json(res, 409, { ok: false, error: `Sipariş durumu: ${order.status}` });
    }
    if (order.status === "payment_reported") {
      return json(res, 200, { ok: true, status: "payment_reported", message: "Ödeme bildiriminiz kontrol bekliyor." });
    }

    const rows = await updateMany("bank_transfer_orders", { order_code: orderCode, status: "pending" }, {
      status: "payment_reported",
      payment_reported_at: new Date().toISOString(),
    });

    if (!rows.length) return json(res, 409, { ok: false, error: "Sipariş durumu değişti. Tekrar kontrol edin." });
    return json(res, 200, {
      ok: true,
      status: "payment_reported",
      message: "Ödeme bildiriminiz alındı. Banka hesabı kontrol edildikten sonra üyeliğiniz açılacak.",
    });
  } catch (error) {
    console.error("bank-transfer report-payment error", error);
    return json(res, 500, { ok: false, error: "Ödeme bildirimi alınamadı." });
  }
};
