(() => {
  const version = "20260622-pages-v4";
  document.documentElement.dataset.flCacheVersion = version;

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
