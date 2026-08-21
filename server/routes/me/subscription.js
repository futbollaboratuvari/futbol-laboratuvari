const { json } = require("../_lib/http");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  // Üretim ortamında burada kullanıcı oturumu/JWT kontrol edilecek.
  // DB'den aktif üyelik aranacak.
  // Deneme süresi bittiyse active=false ve payment_required=true dönecek.
  return json(res, 200, {
    ok: true,
    active: false,
    access_mode: null,
    plan_id: null,
    status: "none",
    started_at: null,
    expires_at: null,
    days_left: 0,
    uses_left: 0,
    daily_uses_left: 0,
    payment_required: false,
    payment_required_after_trial: true,
    message: "Üyelik kontrol backend bağlantısı için hazır. DB bağlanınca gerçek süre ve hak durumu dönecek.",
  });
};
