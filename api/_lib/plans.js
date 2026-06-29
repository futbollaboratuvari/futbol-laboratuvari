const PLANS = {
  starter: {
    id: "starter",
    name: "Gold Paket",
    amountKurus: 14900,
    durationDays: 3,
    trialDays: 1,
    paidUses: 10,
    trialUses: 2,
    dailyUses: 3,
    renewalType: "manual_purchase_required",
  },
  pro: {
    id: "pro",
    name: "Diamond Paket",
    amountKurus: 29900,
    durationDays: 14,
    trialDays: 1,
    paidUses: 40,
    trialUses: 3,
    dailyUses: 10,
    renewalType: "manual_purchase_required",
  },
  vip: {
    id: "vip",
    name: "Premium Paket",
    amountKurus: 49900,
    durationDays: 28,
    trialDays: 1,
    paidUses: 120,
    trialUses: 5,
    dailyUses: 30,
    renewalType: "manual_purchase_required",
  },
};

function getPlan(planId) {
  return PLANS[planId] || null;
}

function helperRoute(req, res) {
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ ok: false, error: "not_found" }));
}

helperRoute.PLANS = PLANS;
helperRoute.getPlan = getPlan;

module.exports = helperRoute;
