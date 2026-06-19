const { readBody, text } = require("../_lib/http");
const { verifyCallbackHash } = require("../_lib/paytr");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return text(res, 405, "Method Not Allowed");
  }

  try {
    const post = await readBody(req);
    const merchantKey = process.env.PAYTR_MERCHANT_KEY;
    const merchantSalt = process.env.PAYTR_MERCHANT_SALT;

    if (!merchantKey || !merchantSalt) {
      return text(res, 500, "PAYTR env missing");
    }

    if (!verifyCallbackHash(post, merchantKey, merchantSalt)) {
      return text(res, 400, "PAYTR notification failed: bad hash");
    }

    const merchantOid = post.merchant_oid;
    const status = post.status;
    const totalAmount = post.total_amount;

    // Üretim ortamında burada DB kontrolü yapılacak:
    // 1. merchantOid ile pending sipariş bulunur.
    // 2. Daha önce paid/failed ise tekrar işlenmez.
    // 3. status success ise sipariş paid yapılır ve üyelik aktif edilir.
    // 4. Başarısız ise sipariş failed yapılır.
    console.log("PayTR callback verified", { merchantOid, status, totalAmount });

    return text(res, 200, "OK");
  } catch (error) {
    console.error("PayTR callback error", error);
    return text(res, 500, "Callback error");
  }
};
