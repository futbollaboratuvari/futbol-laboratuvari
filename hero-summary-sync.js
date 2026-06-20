(() => {
  const numberFromText = (value) => {
    const match = String(value || "").match(/\d+/);
    return match ? match[0] : "0";
  };

  const setText = (selector, value) => {
    document.querySelectorAll(selector).forEach((node) => {
      node.textContent = value;
    });
  };

  const syncTodayCount = () => {
    const countNode = document.querySelector("[data-daily-widget-count]");
    if (!countNode) return;
    setText("#today-count", numberFromText(countNode.textContent));
  };

  const syncRobotSummary = () => {
    const avg = document.querySelector("[data-average-confidence]")?.textContent?.trim();
    const top = document.querySelector("[data-strongest-signal]")?.textContent?.trim();
    if (avg) setText("#avg-confidence", avg);
    if (top) setText("#top-market", top);
  };

  const sync = () => {
    syncTodayCount();
    syncRobotSummary();
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
    setTimeout(sync, 500);
    setTimeout(sync, 1500);
    setTimeout(sync, 3000);
  }, { once: true });
  document.addEventListener("fl:runtime-ready", () => setTimeout(sync, 100));
})();
