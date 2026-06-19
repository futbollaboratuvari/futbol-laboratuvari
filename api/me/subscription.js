const { json } = require("../_lib/http");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    return json(res, 405, { ok: false, error: "Method Not Allowed" });
  }

  // Üretim ortamında burada kullanıcı oturumu/JWT kontrol edilecek.
  // DB'den aktif üyelik aranacak.
  return json(res, 200, {
    ok: true,
    active: false,
    plan_id: null,
    expires_at: null,
    message: "Üyelik kontrol backend bağlantısı için hazır. DB bağlanınca gerçek durum dönecek.",
  });
};
