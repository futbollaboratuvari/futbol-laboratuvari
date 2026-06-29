function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + Number(days || 0));
  return next;
}

function nowIso() {
  return new Date().toISOString();
}

function baseMembership(plan, orderId, startedAt, expiresAt, mode) {
  const isTrial = mode === "trial";
  return {
    plan_id: plan.id,
    plan_name: plan.name,
    status: isTrial ? "trial_active" : "active",
    access_mode: mode,
    started_at: startedAt.toISOString(),
    expires_at: expiresAt.toISOString(),
    duration_days: isTrial ? plan.trialDays : plan.durationDays,
    uses_total: isTrial ? plan.trialUses : plan.paidUses,
    uses_left: isTrial ? plan.trialUses : plan.paidUses,
    daily_uses_limit: plan.dailyUses,
    daily_uses_left: plan.dailyUses,
    payment_required_after_trial: isTrial,
    auto_renew: false,
    last_order_id: orderId || null,
  };
}

function createPaidMembershipFromPlan(plan, orderId, paidAt = new Date()) {
  const startedAt = new Date(paidAt);
  const expiresAt = addDays(startedAt, plan.durationDays);
  return baseMembership(plan, orderId, startedAt, expiresAt, "paid");
}

function createTrialMembershipFromPlan(plan, startedAtValue = new Date()) {
  const startedAt = new Date(startedAtValue);
  const expiresAt = addDays(startedAt, plan.trialDays);
  return baseMembership(plan, null, startedAt, expiresAt, "trial");
}

function createMembershipFromPlan(plan, orderId, paidAt = new Date()) {
  return createPaidMembershipFromPlan(plan, orderId, paidAt);
}

function daysLeft(expiresAt, from = new Date()) {
  const diff = new Date(expiresAt).getTime() - new Date(from).getTime();
  return Math.max(0, Math.ceil(diff / 86400000));
}

function isActiveMembership(membership, from = new Date()) {
  if (!membership) return false;
  const status = membership.status === "active" || membership.status === "trial_active";
  return status && new Date(membership.expires_at).getTime() > new Date(from).getTime();
}

function membershipStatus(membership, from = new Date()) {
  if (!membership) return "none";
  if (!isActiveMembership(membership, from)) {
    return membership.access_mode === "trial" ? "trial_expired_payment_required" : "expired";
  }
  return membership.status;
}

function helperRoute(req, res) {
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ ok: false, error: "not_found" }));
}

helperRoute.addDays = addDays;
helperRoute.nowIso = nowIso;
helperRoute.createMembershipFromPlan = createMembershipFromPlan;
helperRoute.createPaidMembershipFromPlan = createPaidMembershipFromPlan;
helperRoute.createTrialMembershipFromPlan = createTrialMembershipFromPlan;
helperRoute.daysLeft = daysLeft;
helperRoute.isActiveMembership = isActiveMembership;
helperRoute.membershipStatus = membershipStatus;

module.exports = helperRoute;
