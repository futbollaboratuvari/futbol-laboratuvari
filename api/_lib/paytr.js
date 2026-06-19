const crypto = require("crypto");

function paytrToken(payload, merchantSalt, merchantKey) {
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

function verifyCallbackHash(post, merchantKey, merchantSalt) {
  const hashStr = `${post.merchant_oid}${merchantSalt}${post.status}${post.total_amount}`;
  const expected = crypto.createHmac("sha256", merchantKey).update(hashStr).digest("base64");
  return expected === post.hash;
}

function orderId() {
  const stamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
  const random = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `FL-${stamp}-${random}`;
}

async function getIframeToken(payload) {
  const form = new URLSearchParams(payload);
  const response = await fetch("https://www.paytr.com/odeme/api/get-token", {
    method: "POST",
    body: form,
  });
  return response.json();
}

module.exports = { paytrToken, verifyCallbackHash, orderId, getIframeToken };
