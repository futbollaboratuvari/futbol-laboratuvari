const PLANS = {
  starter: {
    id: "starter",
    name: "Başlangıç",
    amountKurus: 14900,
    durationDays: 30,
    monthlyUses: 10,
    dailyUses: 3,
    renewalType: "monthly",
  },
  pro: {
    id: "pro",
    name: "Pro Analiz",
    amountKurus: 29900,
    durationDays: 30,
    monthlyUses: 40,
    dailyUses: 10,
    renewalType: "monthly",
  },
  vip: {
    id: "vip",
    name: "VIP Kupon",
    amountKurus: 49900,
    durationDays: 30,
    monthlyUses: 120,
    dailyUses: 30,
    renewalType: "monthly",
  },
};

function getPlan(planId) {
  return PLANS[planId] || null;
}

module.exports = { PLANS, getPlan };
