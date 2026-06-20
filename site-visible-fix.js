(() => {
  const id = "site-visible-fix-style";
  const run = () => {
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = `
        .reveal{opacity:1!important;transform:none!important;visibility:visible!important}
        .reveal.visible{opacity:1!important;transform:none!important}
        .hero-media,.dashboard-hero::after,.dashboard-hero::before,.site-header::before,.site-header::after{pointer-events:none!important}
        .site-header a,.site-header button,.nav-links,.nav-links a,button,a{pointer-events:auto!important}
        main,.section,.hero-content,.platform-summary,.footer{visibility:visible!important}
        #daily-matches-widget.daily-widget-shell{max-height:calc(100vh - 155px);overflow:auto;scrollbar-width:thin;margin-bottom:22px!important}
        #daily-matches-widget .daily-widget-head{position:sticky;top:0;z-index:5;background:linear-gradient(180deg,rgba(8,23,48,.98),rgba(8,23,48,.92));padding-bottom:10px}
        #daily-matches-widget .daily-league-block:last-child{margin-bottom:10px}
        #robot-analizleri.top-robot-hub{min-height:auto!important;padding-bottom:34px!important}
        #robot-analizleri .premium-coupon-center{align-items:start!important}
        #robot-analizleri .premium-coupon-center>div{max-height:calc(100vh - 170px);overflow:auto;scrollbar-width:thin}
        #robot-analizleri .robot-stack{align-content:start!important}
        #robot-analizleri .robot-live-card{min-height:auto!important}
        #yaklasan-maclar,#robot-analizleri,#guclu-tahmin,#son-analizler,#membership-payment-panel,#premium-analysis-panel,#spor-toto-performansi,#sonuc-arsivi,#basari-takip,#kurucu{scroll-margin-top:150px!important}
      `;
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
  setTimeout(run, 1400);
  setTimeout(loadNavigationFix, 700);
})();
