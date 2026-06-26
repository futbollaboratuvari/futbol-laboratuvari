(() => {
  const version = "20260627-single-bulletin-v1";
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
    if (id && document.getElementById(id)) return;
    if (hasScript(src)) return;
    const script = document.createElement("script");
    if (id) script.id = id;
    script.src = `${src}?v=${version}`;
    script.async = false;
    document.body.appendChild(script);
  };

  loadScript("site-bulletin-active-guard.js", "site-bulletin-active-guard-script");
  loadScript("learning-visibility.js", "learning-visibility-script");
  loadScript("learning-output-visibility.js", "learning-output-visibility-script");
  loadScript("premium-analysis-extra-markets.js", "premium-analysis-extra-markets-script");
  loadScript("pro12-2-wide-market-engine.js", "pro122-wide-market-engine-script");
  loadScript("fl-pagination-slider.js", "fl-pagination-slider-script");
  loadScript("mobile-hero-panel-fix.js", "mobile-hero-panel-fix-script");
  loadScript("kupon-center-fallback.js", "kupon-center-fallback-script");
  loadScript("widget-navigation-buttons.js", "widget-navigation-buttons-script");
})();
