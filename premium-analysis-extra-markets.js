(() => {
  const MARKETS = ["1.5 Ust", "1.5 Alt", "3.5 Alt", "4.5 Ust", "4.5 Alt", "1X", "X2", "12", "Toplam Tek", "Toplam Cift", "0-1 Gol", "2-3 Gol", "4-6 Gol"];

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
  }

  function boot() {
    apply();
    if (window.__extraMarketObserver) return;
    window.__extraMarketObserver = true;
    new MutationObserver(() => setTimeout(apply, 200)).observe(document.body, { childList: true, subtree: true });
  }

  window.addEventListener("load", () => setTimeout(boot, 500));
  document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 500), { once: true });
  document.addEventListener("fl:runtime-ready", () => setTimeout(boot, 500));
})();