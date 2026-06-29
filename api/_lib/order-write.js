const { getUsageToken } = require("../lib/usage-token");
const { readJsonFile, writeJsonFile } = require("./github-contents");

const ordersPath = "data/orders.json";
const MAX_ORDERS = 500;

async function appendPendingOrder(order) {
  const merchantOid = order && order.merchant_oid ? order.merchant_oid : "";
  const token = getUsageToken();

  if (!merchantOid) {
    return { saved: false, reason: "merchant-oid-missing", merchantOid };
  }

  if (!token) {
    return { saved: false, reason: "token-missing", merchantOid };
  }

  try {
    const current = await readJsonFile(token, ordersPath);
    const oldOrders = current.data.orders || [];

    if (oldOrders.some(item => item && item.merchant_oid === merchantOid)) {
      return { saved: true, reason: "already-exists", merchantOid };
    }

    const nextData = {
      version: 1,
      updatedAt: new Date().toISOString(),
      status: "active",
      note: current.data.note || "PayTR siparis kayit dosyasi",
      orders: [order, ...oldOrders].slice(0, MAX_ORDERS)
    };

    await writeJsonFile(token, ordersPath, current.sha, nextData, "PayTR pending siparis kaydi eklendi");

    return { saved: true, merchantOid };
  } catch (error) {
    return { saved: false, reason: "write-failed", merchantOid };
  }
}

module.exports = {
  appendPendingOrder
};
