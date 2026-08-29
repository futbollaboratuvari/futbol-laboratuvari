(() => {
  const version = "20260829-secure-api-v2";
  const resetKey = "fl_membership_full_reset_20260622_v9";

  if (localStorage.getItem(resetKey) !== "1") {
    [
      "fl_premium_beta_access",
      "fl_premium_access_note",
      "fl_premium_access_level",
      "fl_premium_code_entered",
      "fl_selected_membership_plan",
      "fl_premium_count",
      "fl_premium_count_plan",
      "fl_premium_robot_queue",
      "fl_last_premium_robot_analysis"
    ].forEach((key) => localStorage.removeItem(key));
    localStorage.setItem(resetKey, "1");
  }

  document.documentElement.dataset.flCacheVersion = version;

  const hasScript = (src) => [...document.querySelectorAll("script[src]")]
    .some((script) => String(script.getAttribute("src") || "").includes(src));
  const loadScript = (src, id) => {
    if ((id && document.getElementById(id)) || hasScript(src)) return;
    const script = document.createElement("script");
    if (id) script.id = id;
    script.src = `${src}?v=${version}`;
    script.async = false;
    document.body.appendChild(script);
  };

  loadScript("site-bulletin-active-guard.js", "site-bulletin-active-guard-script");
  loadScript("spor-toto-dashboard.js", "spor-toto-dashboard-script");
  loadScript("spor-toto-metric-ui.js", "spor-toto-metric-ui-script");
  loadScript("analysis-insights-v1.js", "analysis-insights-v1-script");
  loadScript("live-power-center-v1.js", "live-power-center-v1-script");

  const loadVisualEnhancements = () => {
    loadScript("fl-pagination-slider.js", "fl-pagination-slider-script");
    loadScript("mobile-hero-panel-fix.js", "mobile-hero-panel-fix-script");
  };

  if ("requestIdleCallback" in window) window.requestIdleCallback(loadVisualEnhancements, { timeout: 3000 });
  else window.setTimeout(loadVisualEnhancements, 1800);
})();
