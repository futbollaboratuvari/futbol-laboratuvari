function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + Number(days || 0));
  return next;
}

function nowIso() {
  return new Date().toISOString();
}

function createMembershipFromPlan(plan, orderId, paidAt = new Date()) {
  const startedAt = new Date(paidAt);
  const expiresAt = addDays(startedAt, plan.durationDays);
  return {
    plan_id: plan.id,
    plan_name: plan.name,
    status: "active",
    started_at: startedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    duration_days: plan.durationDays,
    monthly_uses_total: plan.monthlyUses,
    monthly_uses_left: plan.monthlyUses,
    daily_uses_limit: plan.dailyUses,
    daily_uses_left: plan.dailyUses,
    last_order_id: orderId,
  };
}

function daysLeft(expiresAt, from = new Date()) {
  const diff = new Date(expiresAt).getTime() - new Date(from).getTime();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function isActiveMembership(membership, from = new Date()) {
  if (!membership || membership.status !== "active") return false;
  return new Date(membership.expires_at).getTime() > new Date(from).getTime();
}

module.exports = {
  addDays,
  nowIso,
  createMembershipFromPlan,
  daysLeft,
  isActiveMembership,
};
