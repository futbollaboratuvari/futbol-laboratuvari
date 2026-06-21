(() => {
  const version = "20260621-premium-panel-v4";
  const ownerCode = "CEM-ANALIZ-2026";
  document.documentElement.dataset.flCacheVersion = version;

  const scripts = [
    "membership-form-hint.js",
    "daily-matches-widget.js",
    "premium-analysis-panel.js",
    "premium-panel-fix.js",
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

  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-premium-unlock]");
    if (!button) return;
    const input = document.querySelector("[data-premium-code]");
    const code = String(input?.value || "").trim().toUpperCase();
    if (code !== ownerCode) return;
    localStorage.setItem("fl_premium_beta_access", "1");
    window.location.hash = "#premium-analysis-panel";
    window.location.reload();
  }, true);
})();
