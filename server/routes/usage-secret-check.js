module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");

  const ready = Boolean(
    process.env.KULLANIM_KAYIT_BELIRTECI || process.env.USAGE_LOG_TOKEN
  );

  return res.status(200).json({
    ok: true,
    ready,
    acceptedNames: ["KULLANIM_KAYIT_BELIRTECI", "USAGE_LOG_TOKEN"]
  });
};
