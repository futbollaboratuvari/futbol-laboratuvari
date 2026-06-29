function getUsageToken() {
  return process.env.USAGE_LOG_TOKEN || process.env.KULLANIM_KAYIT_BELIRTECI || "";
}

function getUsageTokenName() {
  if (process.env.USAGE_LOG_TOKEN) return "USAGE_LOG_TOKEN";
  if (process.env.KULLANIM_KAYIT_BELIRTECI) return "KULLANIM_KAYIT_BELIRTECI";
  return "";
}

function helperRoute(req, res) {
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ ok: false, error: "not_found" }));
}

helperRoute.getUsageToken = getUsageToken;
helperRoute.getUsageTokenName = getUsageTokenName;

module.exports = helperRoute;
