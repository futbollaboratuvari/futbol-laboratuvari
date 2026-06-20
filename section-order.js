(() => {
  const ORDER = [
    "platform",
    "daily-matches-widget",
    "robot-analizleri",
    "guclu-tahmin",
    "son-analizler",
    "spor-toto-performansi",
    "sonuc-arsivi",
    "basari-takip",
    "analiz-veritabani",
    "membership-payment-panel",
    "premium-analysis-panel",
    "kurucu",
    "medya-galerisi",
  ];

  const STYLE_ID = "section-order-style";
  let reorderTimer = null;

  const injectStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #daily-matches-widget,
      #robot-analizleri,
      #guclu-tahmin,
      #son-analizler,
      #spor-toto-performansi,
      #sonuc-arsivi,
      #basari-takip,
      #analiz-veritabani,
      #membership-payment-panel,
      #premium-analysis-panel,
      #kurucu,
      #medya-galerisi {
        scroll-margin-top: 130px;
      }

      #yaklasan-maclar.daily-matches-anchor,
      #live-control-center {
        display: none !important;
        height: 0 !important;
        overflow: hidden !important;
      }

      #kurucu .founder-card,
      #medya-galerisi .media-grid {
        position: relative;
      }

      #kurucu::before,
      #medya-galerisi::before {
        content: "";
        display: block;
        height: 1px;
        margin: 0 auto 8px;
        width: min(820px, 70%);
        background: linear-gradient(90deg, transparent, rgba(255,191,46,.42), transparent);
        opacity: .75;
      }
    `;
    document.head.appendChild(style);
  };

  const findSection = (id) => document.getElementById(id);

  const reorder = () => {
    injectStyle();
    const main = document.querySelector("main");
    if (!main) return;

    ORDER
      .map(findSection)
      .filter(Boolean)
      .forEach((section) => {
        if (section.parentElement !== main) {
          main.appendChild(section);
          return;
        }
        main.appendChild(section);
      });
  };

  const scheduleReorder = () => {
    clearTimeout(reorderTimer);
    reorderTimer = setTimeout(reorder, 80);
  };

  const observeMain = () => {
    const main = document.querySelector("main");
    if (!main || main.dataset.flOrderObserver === "1") return;
    main.dataset.flOrderObserver = "1";
    const observer = new MutationObserver(scheduleReorder);
    observer.observe(main, { childList: true, subtree: false });
  };

  const boot = () => {
    reorder();
    observeMain();
  };

  boot();
  document.addEventListener("DOMContentLoaded", boot);
  document.addEventListener("fl:runtime-ready", boot);
  window.addEventListener("load", () => {
    setTimeout(boot, 250);
    setTimeout(boot, 900);
    setTimeout(boot, 1800);
  });
  setTimeout(boot, 400);
  setTimeout(boot, 1400);
  setTimeout(boot, 3200);
})();
