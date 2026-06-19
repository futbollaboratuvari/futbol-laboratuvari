// PayTR ödeme başlatma örnek endpoint taslağı.
// Bu dosya GitHub Pages içinde çalışmaz. Vercel/Netlify/VPS backend tarafına taşınmalıdır.

const crypto = require("crypto");

const plans = {
  starter: { name: "Başlangıç", amountKurus: 14900 },
  pro: { name: "Pro Analiz", amountKurus: 29900 },
  vip: { name: "VIP Kupon", amountKurus: 49900 },
};

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} eksik`);
  return value;
}

function makeOrderId() {
  const stamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `FL-${stamp}-${random}`;
}

function makePaytrToken(payload, merchantSalt, merchantKey) {
  const hashStr = [
    payload.merchant_id,
    payload.user_ip,
    payload.merchant_oid,
    payload.email,
    payload.payment_amount,
    payload.user_basket,
    payload.no_installment,
    payload.max_installment,
    payload.currency,
    payload.test_mode,
  ].join("");

  return crypto
    .createHmac("sha256", merchantKey)
    .update(hashStr + merchantSalt)
    .digest("base64");
}

async function createPaytrToken(payload) {
  const form = new URLSearchParams(payload);
  const response = await fetch("https://www.paytr.com/odeme/api/get-token", {
    method: "POST",
    body: form,
  });
  return response.json();
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end("Method Not Allowed");
  }

  const merchantId = requiredEnv("PAYTR_MERCHANT_ID");
  const merchantKey = requiredEnv("PAYTR_MERCHANT_KEY");
  const merchantSalt = requiredEnv("PAYTR_MERCHANT_SALT");
  const siteBaseUrl = requiredEnv("SITE_BASE_URL");
  const testMode = process.env.PAYTR_TEST_MODE || "1";

  const { plan_id, email, name, phone } = req.body || {};
  const plan = plans[plan_id];

  if (!plan || !email || !name || !phone) {
    res.statusCode = 400;
    return res.json({ ok: false, error: "Eksik veya geçersiz bilgi" });
  }

  const merchantOid = makeOrderId();
  const userBasket = Buffer.from(JSON.stringify([[`Futbol Laboratuvarı ${plan.name}`, (plan.amountKurus / 100).toFixed(2), 1]])).toString("base64");

  const payload = {
    merchant_id: merchantId,
    user_ip: req.headers["x-forwarded-for"]?.split(",")[0] || req.socket?.remoteAddress || "127.0.0.1",
    merchant_oid: merchantOid,
    email,
    payment_amount: String(plan.amountKurus),
    user_basket: userBasket,
    no_installment: "1",
    max_installment: "0",
    currency: "TL",
    test_mode: testMode,
    debug_on: "1",
    timeout_limit: "30",
    lang: "tr",
    user_name: name,
    user_address: "Dijital üyelik hizmeti",
    user_phone: phone,
    merchant_ok_url: `${siteBaseUrl}/?payment=success&order=${merchantOid}`,
    merchant_fail_url: `${siteBaseUrl}/?payment=failed&order=${merchantOid}`,
  };

  payload.paytr_token = makePaytrToken(payload, merchantSalt, merchantKey);

  // TODO: Siparişi veritabanına pending olarak kaydet.
  // await db.orders.create({ merchant_oid: merchantOid, plan_id, email, amount_kurus: plan.amountKurus, status: "pending" });

  const paytrResult = await createPaytrToken(payload);
  if (paytrResult.status !== "success") {
    res.statusCode = 400;
    return res.json({ ok: false, error: paytrResult.reason || "PayTR token alınamadı" });
  }

  return res.json({
    ok: true,
    provider: "paytr",
    order_id: merchantOid,
    iframe_token: paytrResult.token,
    iframe_url: `https://www.paytr.com/odeme/guvenli/${paytrResult.token}`,
  });
};
