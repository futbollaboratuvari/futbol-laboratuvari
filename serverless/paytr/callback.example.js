// PayTR ödeme sonucu callback örnek endpoint taslağı.
// Bu dosya GitHub Pages içinde çalışmaz. Vercel/Netlify/VPS backend tarafına taşınmalıdır.

const crypto = require("crypto");

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} eksik`);
  return value;
}

function verifyPaytrHash(post, merchantKey, merchantSalt) {
  const hashStr = `${post.merchant_oid}${merchantSalt}${post.status}${post.total_amount}`;
  const expected = crypto.createHmac("sha256", merchantKey).update(hashStr).digest("base64");
  return expected === post.hash;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.end("Method Not Allowed");
  }

  const merchantKey = requiredEnv("PAYTR_MERCHANT_KEY");
  const merchantSalt = requiredEnv("PAYTR_MERCHANT_SALT");
  const post = req.body || {};

  if (!verifyPaytrHash(post, merchantKey, merchantSalt)) {
    res.statusCode = 400;
    return res.end("PAYTR notification failed: bad hash");
  }

  const merchantOid = post.merchant_oid;

  // TODO: merchantOid ile siparişi veritabanında bul.
  // const order = await db.orders.findByMerchantOid(merchantOid);

  // TODO: Sipariş daha önce paid/failed ise tekrar işlem yapma, yalnızca OK dön.
  // if (["paid", "failed"].includes(order.status)) return res.end("OK");

  if (post.status === "success") {
    // TODO: Siparişi paid yap.
    // TODO: Kullanıcı üyeliğini aktif et.
    // TODO: membership_expires_at alanını pakete göre hesapla.
  } else {
    // TODO: Siparişi failed yap.
    // TODO: failed_reason_code ve failed_reason_msg değerlerini logla.
  }

  return res.end("OK");
};
