(() => {
  const version = "20260622-pages-v4";
  document.documentElement.dataset.flCacheVersion = version;

  if (!document.getElementById("founder-access-style")) {
    const style = document.createElement("style");
    style.id = "founder-access-style";
    style.textContent = `
      #premium-analysis-panel .premium-lock{cursor:pointer!important;pointer-events:auto!important;user-select:none!important}
      #premium-analysis-panel .premium-gate{display:grid!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;position:relative!important;z-index:30!important}
      #premium-analysis-panel [data-premium-code]{display:block!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;user-select:text!important;min-height:44px!important;background:rgba(2,9,24,.96)!important;color:#f8fbff!important;border:1px solid rgba(255,224,138,.45)!important;position:relative!important;z-index:31!important}
      #premium-analysis-panel [data-premium-unlock]{display:inline-flex!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;cursor:pointer!important;position:relative!important;z-index:31!important}
    `;
    document.head.appendChild(style);
  }

  const scripts = [
    "site-visible-fix.js",
    "daily-matches-widget.js",
    "premium-analysis-panel.js",
    "premium-panel-fix.js",
    "premium-robot-engine.js",
    "premium-state-panel.js",
    "robot-dashboard.js",
    "membership-form-hint.js",
    "hero-vitrin.js",
    "site-human-language.js",
    "nav-routing.js"
  ];

  scripts.forEach((name) => {
    const current = Array.from(document.scripts).some((script) =>
      String(script.src || "").includes(name) && String(script.src || "").includes(version)
    );
    if (current) return;
    const script = document.createElement("script");
    script.src = `${name}?v=${version}`;
    script.defer = true;
    document.body.appendChild(script);
  });
})();
