(() => {
  const MARKETS = [
    "1.5 Ust", "1.5 Alt", "3.5 Alt", "4.5 Ust", "4.5 Alt", "5.5 Ust", "5.5 Alt",
    "1X", "X2", "12", "Ev Sahibi Gol Atar", "Deplasman Gol Atar",
    "Ev Sahibi Gol Yemez", "Deplasman Gol Yemez", "Ev Sahibi 1.5 Ust", "Deplasman 1.5 Ust",
    "Toplam Tek", "Toplam Cift", "0-1 Gol", "2-3 Gol", "4-6 Gol", "7+ Gol",
    "KG Var + 2.5 Ust", "KG Var + 3.5 Ust", "KG Yok + 2.5 Alt",
    "MS 1 + KG Var", "MS 2 + KG Var", "MS 1 + 2.5 Ust", "MS 2 + 2.5 Ust"
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
    script.src = `${src}?v=20260626-pro122`;
    script.async = false;
    document.body.appendChild(script);
  }

  function loadUsability() {
    loadScriptOnce("premium-analysis-usability-script", "premium-analysis-usability.js");
  }

  function loadPro122() {
    loadScriptOnce("pro122-decision-engine-script", "pro12-2-decision-engine.js");
  }

  function apply() {
    const grid = document.querySelector("#premium-analysis-panel .pa-market-grid");
    if (!grid || grid.dataset.extraMarketAdded === "1") return;
    grid.dataset.extraMarketAdded = "1";
    MARKETS.forEach((name) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "pa-market";
      button.textContent = name;
      button.addEventListener("click", () => choose(grid, name, button));
      grid.appendChild(button);
    });
    loadUsability();
    loadPro122();
  }

  function boot() {
    apply();
    loadUsability();
    loadPro122();
    if (window.__extraMarketObserver) return;
    window.__extraMarketObserver = true;
    new MutationObserver(() => setTimeout(apply, 200)).observe(document.body, { childList: true, subtree: true });
  }

  window.addEventListener("load", () => setTimeout(boot, 500));
  document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 500), { once: true });
  document.addEventListener("fl:runtime-ready", () => setTimeout(boot, 500));
})();
