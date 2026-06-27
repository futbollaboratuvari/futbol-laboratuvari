(() => {
  const MARKETS = [
    "1.5 Ust", "1.5 Alt", "3.5 Ust", "3.5 Alt", "4.5 Ust", "4.5 Alt",
    "IY/MS 1/1", "IY/MS X/1", "IY/MS 2/2", "IY/MS X/X",
    "MS 1 + 2.5 Ust", "MS X + 2.5 Ust", "MS 2 + 2.5 Ust",
    "MS 1 + 2.5 Alt", "MS X + 2.5 Alt", "MS 2 + 2.5 Alt",
    "MS 1 + KG Var", "MS X + KG Var", "MS 2 + KG Var",
    "MS 1 + KG Yok", "MS X + KG Yok", "MS 2 + KG Yok",
    "0-1 Gol", "2-3 Gol", "4-5 Gol", "6+ Gol",
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
    script.src = `${src}?v=20260627-wide-market-v2`;
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