const crypto = require("crypto");
const { json, requireEnv } = require("../../_lib/http");
const { selectMany } = require("../../_lib/supabase-rest");

function safeEqual(a, b) {
  const left = Buffer.from(String(a || ""));
  const right = Buffer.from(String(b || ""));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") return json(res, 200, { ok: true });
  if (req.method !== "GET") return json(res, 405, { ok: false, error: "Method Not Allowed" });

  try {
    if (!safeEqual(req.headers["x-admin-payment-secret"], requireEnv("ADMIN_PAYMENT_SECRET"))) {
      return json(res, 401, { ok: false, error: "Yetkisiz işlem." });
    }

    const status = String(req.query?.status || "payment_reported").trim();
    const allowed = new Set(["pending", "payment_reported", "paid", "rejected", "cancelled", "expired"]);
    if (!allowed.has(status)) return json(res, 400, { ok: false, error: "Geçersiz durum filtresi." });

    const orders = await selectMany("bank_transfer_orders", { status }, {
      select: "order_code,email,customer_name,phone,plan_id,plan_name,amount_kurus,status,payment_reference,payment_reported_at,paid_at,created_at",
      order: "created_at.desc",
      limit: 100,
    });

    return json(res, 200, { ok: true, status, orders });
  } catch (error) {
    console.error("bank-transfer admin orders error", error);
    return json(res, 500, { ok: false, error: "Ödeme listesi alınamadı." });
  }
};
