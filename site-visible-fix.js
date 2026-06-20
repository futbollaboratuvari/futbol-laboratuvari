(() => {
  const id = "site-visible-fix-style";
  const run = () => {
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = `.reveal{opacity:1!important;transform:none!important;visibility:visible!important}.reveal.visible{opacity:1!important;transform:none!important}.hero-media,.dashboard-hero::after,.dashboard-hero::before,.site-header::before,.site-header::after{pointer-events:none!important}.site-header a,.site-header button,.nav-links,.nav-links a{pointer-events:auto!important}main,.section,.hero-content,.platform-summary,.footer{visibility:visible!important}`;
      document.head.appendChild(style);
    }
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
  };

  const loadNavigationFix = () => {
    if (document.getElementById("site-navigation-fix-script")) return;
    if ([...document.querySelectorAll("script[src]")].some((script) => String(script.getAttribute("src") || "").endsWith("site-navigation-fix.js"))) return;
    const script = document.createElement("script");
    script.id = "site-navigation-fix-script";
    script.src = "site-navigation-fix.js";
    script.defer = true;
    document.body.appendChild(script);
  };

  run();
  loadNavigationFix();
  document.addEventListener("DOMContentLoaded", () => {
    run();
    loadNavigationFix();
  });
  window.addEventListener("load", () => {
    run();
    loadNavigationFix();
  });
  setTimeout(run, 500);
  setTimeout(loadNavigationFix, 700);
})();
