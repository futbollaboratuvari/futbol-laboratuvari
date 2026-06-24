function getUsageToken() {
  return process.env.USAGE_LOG_TOKEN || process.env.KULLANIM_KAYIT_BELIRTECI || "";
}

function getUsageTokenName() {
  if (process.env.USAGE_LOG_TOKEN) return "USAGE_LOG_TOKEN";
  if (process.env.KULLANIM_KAYIT_BELIRTECI) return "KULLANIM_KAYIT_BELIRTECI";
  return "";
}

module.exports = {
  getUsageToken,
  getUsageTokenName
};
