const PLANS = {
  starter: {
    id: "starter",
    name: "Başlangıç",
    amountKurus: 14900,
    durationDays: 30,
  },
  pro: {
    id: "pro",
    name: "Pro Analiz",
    amountKurus: 29900,
    durationDays: 30,
  },
  vip: {
    id: "vip",
    name: "VIP Kupon",
    amountKurus: 49900,
    durationDays: 30,
  },
};

function getPlan(planId) {
  return PLANS[planId] || null;
}

module.exports = { PLANS, getPlan };
