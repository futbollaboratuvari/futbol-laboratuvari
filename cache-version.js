(() => {
  const version = "20260621-premium-kg-percent-v2";
  document.documentElement.dataset.flCacheVersion = version;

  const scripts = [
    "membership-form-hint.js",
    "daily-matches-widget.js",
    "premium-analysis-panel.js",
    "robot-dashboard.js"
  ];

  scripts.forEach((name) => {
    const alreadyLoaded = Array.from(document.scripts).some((script) =>
      String(script.src || "").includes(name) && String(script.src || "").includes(version)
    );
    if (alreadyLoaded) return;
    const script = document.createElement("script");
    script.src = `${name}?v=${version}`;
    script.defer = true;
    document.body.appendChild(script);
  });
})();
