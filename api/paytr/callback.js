const { readBody, text } = require("../_lib/http");
const { verifyCallbackHash } = require("../_lib/paytr");
const { findOrderByMerchantOid } = require("../_lib/order-read");
const { getUsageToken } = require("../lib/usage-token");
const { stageCodeRecord } = require("../lib/membership-decrement");

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
    const token = getUsageToken();
    const orderLookup = await findOrderByMerchantOid(token, merchantOid);
    const stageResult = orderLookup.generated ? await stageCodeRecord(orderLookup.generated) : null;

    console.log("PayTR callback verified", {
      merchantOid,
      status,
      totalAmount,
      orderFound: orderLookup.found,
      orderReadOk: orderLookup.ok,
      generatedReady: Boolean(orderLookup.generated),
      stageReady: stageResult ? stageResult.ready : false,
      stageReason: stageResult ? stageResult.reason : "no-generated-record"
    });

    return text(res, 200, "OK");
  } catch (error) {
    console.error("PayTR callback error", error);
    return text(res, 500, "Callback error");
  }
};
