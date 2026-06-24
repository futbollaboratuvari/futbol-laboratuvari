module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({
      ok: true,
      status: "add-code-api-ready",
      message: "Kod ekleme API test modu calisiyor. Kalici yazma sonraki adimda baglanacak."
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, message: "Sadece GET veya POST kabul edilir." });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});

  return res.status(200).json({
    ok: true,
    status: "post-test-ok",
    message: "Kod ekleme POST testi basarili.",
    received: {
      hasCode: Boolean(body.code),
      planCode: body.planCode || "gold",
      owner: body.owner || ""
    }
  });
};
