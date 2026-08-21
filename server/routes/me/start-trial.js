const { json, readBody } = require("../_lib/http");
const { getPlan } = require("../_lib/plans");
const { createTrialMembershipFromPlan } = require("../_lib/membership");

function clean(value) {
  return String(value || "").trim();
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  try {
    const body = await readBody(req);
    const planId = clean(body.plan_id);
    const email = clean(body.email).toLowerCase();
    const name = clean(body.name);
    const phone = clean(body.phone);
    const plan = getPlan(planId);

    if (!plan || !email || !name || !phone) {
      return json(res, 400, { ok: false, error: "Paket, ad soyad, e-posta ve telefon zorunludur." });
    }

    // Üretim ortamında burada DB kontrolü yapılacak:
    // 1. Bu e-posta/telefon daha önce deneme kullandı mı?
    // 2. Kullandıysa tekrar deneme açılmayacak.
    // 3. Kullanmadıysa trial membership kaydedilecek.
    const membership = createTrialMembershipFromPlan(plan);

    return json(res, 200, {
      ok: true,
      trial_started: true,
      payment_required_after_trial: true,
      user: { email, name, phone },
      membership,
    });
  } catch (error) {
    return json(res, 500, {
      ok: false,
      error: error.message || "Deneme üyeliği başlatılamadı.",
    });
  }
};
