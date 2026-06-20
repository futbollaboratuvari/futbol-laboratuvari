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
        .hero-media{background:radial-gradient(circle at 18% 12%,rgba(57,255,136,.18),transparent 28%),radial-gradient(circle at 84% 18%,rgba(216,178,87,.18),transparent 32%),linear-gradient(110deg,rgba(2,6,17,.98),rgba(7,21,46,.94) 54%,rgba(3,8,23,.98))!important}
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

  const replaceVisibleText = () => {
    const replacements = new Map([
      ["Önerilen market", "Öne çıkan seçim"],
      ["önerilen market", "öne çıkan seçim"],
      ["Market", "Seçenek"],
      ["market", "seçenek"],
    ]);
    const skipTags = new Set(["SCRIPT", "STYLE", "TEXTAREA", "INPUT", "SELECT", "OPTION", "CODE", "PRE"]);
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || skipTags.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      let value = node.nodeValue;
      replacements.forEach((to, from) => {
        value = value.split(from).join(to);
      });
      if (value !== node.nodeValue) node.nodeValue = value;
    });
  };

  const updatePastMatchStatus = () => {
    const now = new Date();
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);
    const currentTime = new Intl.DateTimeFormat("tr-TR", {
      timeZone: "Europe/Istanbul",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(now);
    const [currentHour, currentMinute] = currentTime.split(":").map(Number);
    const currentTotal = currentHour * 60 + currentMinute;

    document.querySelectorAll(".daily-match-row").forEach((row) => {
      const timeText = row.querySelector(".daily-match-time")?.textContent?.trim() || "";
      const match = timeText.match(/^(\d{1,2}):(\d{2})$/);
      if (!match) return;
      const matchTotal = Number(match[1]) * 60 + Number(match[2]);
      if (matchTotal >= currentTotal) return;
      const statusButton = row.querySelector(".daily-detail-button");
      const statusIcon = row.querySelector(".daily-status-icon");
      if (!statusButton || !statusIcon) return;
      const label = statusButton.getAttribute("title") || statusButton.getAttribute("aria-label") || "";
      if (!label.includes("Oynanacak")) return;
      statusIcon.textContent = "⏳";
      statusIcon.setAttribute("title", "Sonuç bekleniyor");
      statusButton.setAttribute("title", "Sonuç bekleniyor · Detaylı Oranlar");
      statusButton.setAttribute("aria-label", `${today} tarihli maç için sonuç bekleniyor. Detaylı oranları aç.`);
    });
  };

  const cleanup = () => {
    replaceVisibleText();
    updatePastMatchStatus();
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
  cleanup();
  loadNavigationFix();
  document.addEventListener("DOMContentLoaded", () => {
    run();
    cleanup();
    loadNavigationFix();
  });
  window.addEventListener("load", () => {
    run();
    cleanup();
    loadNavigationFix();
  });
  setTimeout(run, 500);
  setTimeout(run, 1400);
  setTimeout(cleanup, 800);
  setTimeout(cleanup, 1800);
  setTimeout(cleanup, 3500);
  setTimeout(loadNavigationFix, 700);
  setInterval(cleanup, 5000);
})();
