(() => {
  const fallbackTargets = {
    "#daily-matches-widget": "#yaklasan-maclar",
    "#membership-payment-panel": "#robot-analizleri",
    "#premium-analysis-panel": "#robot-analizleri",
  };

  const fixLinks = () => {
    document.querySelectorAll('a[href^="./index.html#"], a[href^="index.html#"]').forEach((link) => {
      const href = link.getAttribute("href") || "";
      const index = href.indexOf("#");
      if (index >= 0) link.setAttribute("href", href.slice(index));
    });

    document.querySelectorAll('a[href="#daily-matches-widget"]').forEach((link) => {
      if (!document.querySelector("#daily-matches-widget")) link.setAttribute("href", "#yaklasan-maclar");
    });
  };

  const bindMenu = () => {
    const nav = document.querySelector(".nav-links");
    const button = document.querySelector(".menu-toggle");
    if (!nav || !button || button.dataset.safeMenuReady === "1") return;
    button.dataset.safeMenuReady = "1";
    button.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", String(open));
    });
  };

  const targetFor = (hash) => {
    if (document.querySelector(hash)) return hash;
    const fallback = fallbackTargets[hash];
    if (fallback && document.querySelector(fallback)) return fallback;
    return "";
  };

  const scrollToHash = (hash) => {
    const safeHash = targetFor(hash);
    if (!safeHash) return false;
    const target = document.querySelector(safeHash);
    if (!target) return false;
    const header = document.querySelector(".site-header");
    const offset = (header?.offsetHeight || 120) + 20;
    const top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
    window.scrollTo({ top, behavior: "smooth" });
    history.replaceState(null, "", safeHash);
    document.querySelector(".nav-links")?.classList.remove("open");
    document.querySelector(".menu-toggle")?.setAttribute("aria-expanded", "false");
    return true;
  };

  const bindClicks = () => {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      if (link.dataset.safeScrollReady === "1") return;
      link.dataset.safeScrollReady = "1";
      link.addEventListener("click", (event) => {
        const hash = link.getAttribute("href");
        if (!hash || hash === "#") return;
        if (scrollToHash(hash)) event.preventDefault();
      });
    });
  };

  const run = () => {
    fixLinks();
    bindMenu();
    bindClicks();
  };

  run();
  document.addEventListener("DOMContentLoaded", run);
  window.addEventListener("load", run);
  setTimeout(run, 800);
  setTimeout(run, 1800);
  setInterval(run, 3000);
})();
