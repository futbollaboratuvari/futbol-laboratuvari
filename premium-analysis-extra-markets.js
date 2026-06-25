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

  function loadUsability() {
    if (document.getElementById("premium-analysis-usability-script")) return;
    const script = document.createElement("script");
    script.id = "premium-analysis-usability-script";
    script.src = `premium-analysis-usability.js?v=${Date.now()}`;
    script.async = false;
    document.body.appendChild(script);
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
  }

  function boot() {
    apply();
    loadUsability();
    if (window.__extraMarketObserver) return;
    window.__extraMarketObserver = true;
    new MutationObserver(() => setTimeout(apply, 200)).observe(document.body, { childList: true, subtree: true });
  }

  window.addEventListener("load", () => setTimeout(boot, 500));
  document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 500), { once: true });
  document.addEventListener("fl:runtime-ready", () => setTimeout(boot, 500));
})();