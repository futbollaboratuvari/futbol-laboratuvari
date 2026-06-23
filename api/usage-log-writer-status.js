module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");

  const secretName = process.env.KULLANIM_KAYIT_BELIRTECI
    ? "KULLANIM_KAYIT_BELIRTECI"
    : (process.env.USAGE_LOG_TOKEN ? "USAGE_LOG_TOKEN" : "");

  return res.status(200).json({
    ok: true,
    writeSecretReady: Boolean(secretName),
    secretName,
    nextStep: "verify-code yazma baglantisi"
  });
};
