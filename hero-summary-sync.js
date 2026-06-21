(() => {
  const setText = (selector, value) => {
    document.querySelectorAll(selector).forEach((node) => {
      node.textContent = value;
    });
  };

  const clean = (value) => String(value || "").trim();
  const isEmptyNumber = (value) => {
    const text = clean(value).replace("%", "").replace(",", ".");
    return text === "" || text === "0" || text === "0.0" || text === "0.00" || text === "-";
  };

  const numberFromText = (value) => {
    const match = String(value || "").match(/\d+/);
    return match ? match[0] : "";
  };

  const applyFallback = () => {
    const today = document.querySelector("#today-count");
    const avg = document.querySelector("#avg-confidence");
    const top = document.querySelector("#top-market");

    if (today && isEmptyNumber(today.textContent)) today.textContent = "Hazırlanıyor";
    if (avg && isEmptyNumber(avg.textContent)) avg.textContent = "Veri bekleniyor";
    if (top && isEmptyNumber(top.textContent)) top.textContent = "Günün sinyali hazırlanıyor";
  };

  const syncTodayCount = () => {
    const countNode = document.querySelector("[data-daily-widget-count]");
    if (!countNode) return;
    const count = numberFromText(countNode.textContent);
    setText("#today-count", count && count !== "0" ? count : "Hazırlanıyor");
  };

  const syncRobotSummary = () => {
    const avg = clean(document.querySelector("[data-average-confidence]")?.textContent);
    const top = clean(document.querySelector("[data-strongest-signal]")?.textContent);

    setText("#avg-confidence", !isEmptyNumber(avg) ? avg : "Veri bekleniyor");
    setText("#top-market", !isEmptyNumber(top) ? top : "Günün sinyali hazırlanıyor");
  };

  const sync = () => {
    syncTodayCount();
    syncRobotSummary();
    applyFallback();
  };

  const observe = () => {
    const targets = [
      document.querySelector("[data-daily-widget-count]"),
      document.querySelector("[data-average-confidence]"),
      document.querySelector("[data-strongest-signal]")
    ].filter(Boolean);

    if (!targets.length || !window.MutationObserver) return;
    const observer = new MutationObserver(sync);
    targets.forEach((target) => observer.observe(target, { childList: true, characterData: true, subtree: true }));
  };

  sync();
  document.addEventListener("DOMContentLoaded", () => { sync(); observe(); }, { once: true });
  window.addEventListener("load", () => {
    sync();
    observe();
    setTimeout(sync, 250);
    setTimeout(sync, 800);
    setTimeout(sync, 1500);
    setTimeout(sync, 3000);
  }, { once: true });
  document.addEventListener("fl:runtime-ready", () => setTimeout(sync, 100));
})();
