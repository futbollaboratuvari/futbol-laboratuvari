async function appendPendingOrder(order) {
  return {
    saved: false,
    reason: "order-write-not-connected",
    merchantOid: order && order.merchant_oid ? order.merchant_oid : ""
  };
}

module.exports = {
  appendPendingOrder
};
