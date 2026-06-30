(() => {
  const ms = ["1", "X", "2"];
  const lines = ["1.5", "2.5", "3.5", "4.5"];
  const hnd = ["HND 1", "HND X", "HND 2", "HND 0-1", "HND 1-0", "HND 2-0", "HND 0-2"];
  const htft = ["1/1", "1/X", "1/2", "X/1", "X/X", "X/2", "2/1", "2/X", "2/2"].map((x) => `IY/MS ${x}`);
  const msGoal = lines.flatMap((line) => ms.flatMap((r) => [`MS ${r} + ${line} Alt`, `MS ${r} + ${line} Ust`]));
  const msKg = ms.flatMap((r) => [`MS ${r} + KG Var`, `MS ${r} + KG Yok`]);
  const scores = ["1-0", "2-0", "2-1", "0-0", "1-1", "2-2", "0-1", "0-2", "1-2", "Diger"].map((x) => `Dogru Skor ${x}`);
  const MARKETS = [
    ...hnd,
    ...htft,
    ...msGoal,
    ...msKg,
    "0.5 Ust", "0.5 Alt", "1.5 Ust", "1.5 Alt", "3.5 Ust", "3.5 Alt", "4.5 Ust", "4.5 Alt",
    "0-1 Gol", "2-3 Gol", "4-5 Gol", "6+ Gol",
    "Ilk Yari / Mac Skoru", "1. Yari Skoru", ...scores,
    "1Y/2Y KG Evet/Evet", "1Y/2Y KG Evet/Hayir", "1Y/2Y KG Hayir/Evet", "1Y/2Y KG Hayir/Hayir",
    "En Cok Gol 1. Yari", "En Cok Gol 2. Yari", "En Cok Gol Esit",
    "Toplam Tek", "Toplam Cift",
    "Korner 8.5 Ust", "Korner 9.5 Ust", "Korner Handikap 1", "Korner Handikap 2",
    "Kart 3.5 Ust", "Kart 4.5 Ust", "1. Yari Kart 1.5 Ust",
    "Takim Sut Ev 10+", "Takim Sut Dep 10+", "Toplam Sut 21+", "Toplam Sut 25+"
  ];

  function choose(grid, value, extra) {
    const base = grid.querySelector("[data-pa-market]");
    if (!base) return;
    const oldValue = base.dataset.paMarket || base.textContent;
    const oldText = base.textContent;
    base.dataset.paMarket = value;
    base.textContent = value;
    base.click();
    base.dataset.paMarket = oldValue;
    base.textContent = oldText;
    grid.querySelectorAll(".pa-market").forEach((x) => x.classList.remove("active"));
    extra.classList.add("active");
  }

  function loadScriptOnce(id, src) {
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.src = `${src}?v=20260630-bulletin-detail-bridge-v1`;
    script.async = false;
    document.body.appendChild(script);
  }

  function loadUsability() {
    loadScriptOnce("premium-analysis-usability-script", "premium-analysis-usability.js");
  }

  function loadPro122() {
    loadScriptOnce("pro122-decision-engine-script", "pro12-2-decision-engine.js");
  }

  function loadRobotPro122Bridge() {
    loadScriptOnce("robot-pro122-core-script", "robot-pro122-core.js");
    loadScriptOnce("robot-pro122-legacy-link-script", "robot-pro122-legacy-link.js");
    loadScriptOnce("robot-pro122-fields-mini-script", "robot-pro122-fields-mini.js");
    loadScriptOnce("bulletin-detail-analysis-bridge-script", "bulletin-detail-analysis-bridge.js");
  }

  function apply() {
    const grid = document.querySelector("#premium-analysis-panel .pa-market-grid");
    if (!grid || grid.dataset.extraMarketAdded === "1") return;
    grid.dataset.extraMarketAdded = "1";
    MARKETS.forEach((name) => {
      const exists = Array.from(grid.querySelectorAll("button")).some((button) => button.textContent.trim() === name);
      if (exists) return;
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pa-market";
      button.textContent = name;
      button.addEventListener("click", () => choose(grid, name, button));
      grid.appendChild(button);
    });
    loadUsability();
    loadPro122();
    loadRobotPro122Bridge();
  }

  function boot() {
    apply();
    loadUsability();
    loadPro122();
    loadRobotPro122Bridge();
    if (window.__extraMarketObserver) return;
    window.__extraMarketObserver = true;
    new MutationObserver(() => setTimeout(apply, 200)).observe(document.body, { childList: true, subtree: true });
  }

  window.addEventListener("load", () => setTimeout(boot, 500));
  document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 500), { once: true });
  document.addEventListener("fl:runtime-ready", () => setTimeout(boot, 500));
})();