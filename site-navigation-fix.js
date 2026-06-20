(() => {
  const fixLinks = () => {
    document.querySelectorAll('a[href^="./index.html#"], a[href^="index.html#"]').forEach((link) => {
      const href = link.getAttribute("href") || "";
      const hash = href.slice(href.indexOf("#"));
      if (hash) link.setAttribute("href", hash);
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

  const run = () => {
    fixLinks();
    bindMenu();
  };

  run();
  document.addEventListener("DOMContentLoaded", run);
  window.addEventListener("load", run);
  setTimeout(run, 800);
  setTimeout(run, 1800);
})();
