const { json, readBody, requireEnv } = require("../_lib/http");
const { getPlan } = require("../_lib/plans");
const { paytrToken, orderId, getIframeToken } = require("../_lib/paytr");

function clean(value) {
  return String(value || "").trim();
}

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return String(forwarded).split(",")[0].trim();
  return req.socket?.remoteAddress || "127.0.0.1";
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  try {
    const body = await readBody(req);
    const planId = clean(body.plan_id);
    const email = clean(body.email).toLowerCase();
    const name = clean(body.name);
    const phone = clean(body.phone);
    const plan = getPlan(planId);

    if (!plan || !email || !name || !phone) {
      return json(res, 400, { ok: false, error: "Paket, ad soyad, e-posta ve telefon zorunludur." });
    }

    const merchantId = requireEnv("PAYTR_MERCHANT_ID");
    const merchantKey = requireEnv("PAYTR_MERCHANT_KEY");
    const merchantSalt = requireEnv("PAYTR_MERCHANT_SALT");
    const siteBaseUrl = process.env.SITE_BASE_URL || "https://futbollaboratuvari.github.io/futbol-laboratuvari";
    const testMode = process.env.PAYTR_TEST_MODE || "1";
    const merchantOid = orderId();

    const userBasket = Buffer.from(JSON.stringify([
      [`Futbol Laboratuvarı ${plan.name}`, (plan.amountKurus / 100).toFixed(2), 1],
    ])).toString("base64");

    const payload = {
      merchant_id: merchantId,
      user_ip: clientIp(req),
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
      merchant_ok_url: `${siteBaseUrl}/?payment=success&order=${encodeURIComponent(merchantOid)}`,
      merchant_fail_url: `${siteBaseUrl}/?payment=failed&order=${encodeURIComponent(merchantOid)}`,
    };

    payload.paytr_token = paytrToken(payload, merchantSalt, merchantKey);

    // Üretim ortamında burada sipariş DB'ye pending olarak kaydedilecek.
    // Zorunlu alanlar: merchant_oid, email, name, phone, plan_id, amount_kurus, status=pending.

    const paytrResult = await getIframeToken(payload);
    if (paytrResult.status !== "success") {
      return json(res, 400, {
        ok: false,
        error: paytrResult.reason || "PayTR ödeme token alınamadı.",
      });
    }

    return json(res, 200, {
      ok: true,
      provider: "paytr",
      order_id: merchantOid,
      plan_id: plan.id,
      amount_kurus: plan.amountKurus,
      iframe_token: paytrResult.token,
      iframe_url: `https://www.paytr.com/odeme/guvenli/${paytrResult.token}`,
      test_mode: testMode === "1",
    });
  } catch (error) {
    return json(res, 500, {
      ok: false,
      error: error.message || "Ödeme başlatılamadı.",
    });
  }
};
