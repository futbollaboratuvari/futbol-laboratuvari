const { generateMembershipCode } = require("./code-generate");
const { readJsonFile } = require("./github-contents");

const ordersPath = "data/orders.json";

async function readOrdersFile(token) {
  if (!token) {
    return { ok: false, reason: "token-missing", orders: [] };
  }

  try {
    const current = await readJsonFile(token, ordersPath);
    return { ok: true, orders: current.data.orders || [] };
  } catch (error) {
    return { ok: false, reason: "read-failed", orders: [] };
  }
}

async function findOrderByMerchantOid(token, merchantOid) {
  const file = await readOrdersFile(token);
  const order = (file.orders || []).find(item => item && item.merchant_oid === merchantOid) || null;
  const generated = order ? generateMembershipCode(order.plan_id) : null;

  return {
    ok: file.ok,
    reason: file.reason || null,
    found: Boolean(order),
    order,
    generated
  };
}

module.exports = {
  findOrderByMerchantOid
};
