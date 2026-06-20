(() => {
  const ORDER = [
    "platform",
    "daily-matches-widget",
    "robot-analizleri",
    "membership-payment-panel",
    "premium-analysis-panel",
    "sonuc-arsivi",
    "basari-takip",
    "kurucu",
    "medya-galerisi",
    "guclu-tahmin",
    "son-analizler",
    "spor-toto-performansi",
    "analiz-veritabani",
    "yorum-kosesi",
    "analiz-modulleri",
  ];

  const STYLE_ID = "section-order-style";
  let reorderTimer = null;
  let isReordering = false;

  const injectStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #daily-matches-widget,
      #robot-analizleri,
      #membership-payment-panel,
      #premium-analysis-panel,
      #sonuc-arsivi,
      #basari-takip,
      #kurucu,
      #medya-galerisi,
      #guclu-tahmin,
      #son-analizler,
      #spor-toto-performansi,
      #analiz-veritabani,
      #yorum-kosesi,
      #analiz-modulleri {
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
    if (isReordering) return;
    isReordering = true;
    injectStyle();
    const main = document.querySelector("main");
    if (!main) {
      isReordering = false;
      return;
    }

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

    isReordering = false;
  };

  const scheduleReorder = () => {
    clearTimeout(reorderTimer);
    reorderTimer = setTimeout(reorder, 80);
  };

  const observePage = () => {
    if (document.body?.dataset.flOrderObserver === "1") return;
    if (!document.body) return;
    document.body.dataset.flOrderObserver = "1";
    const observer = new MutationObserver((mutations) => {
      if (isReordering) return;
      const hasRelevantNode = mutations.some((mutation) =>
        [...mutation.addedNodes].some((node) => {
          if (!(node instanceof Element)) return false;
          return ORDER.some((id) => node.id === id || Boolean(node.querySelector?.(`#${id}`)));
        })
      );
      if (hasRelevantNode) scheduleReorder();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  };

  const boot = () => {
    reorder();
    observePage();
  };

  boot();
  document.addEventListener("DOMContentLoaded", boot);
  document.addEventListener("fl:runtime-ready", boot);
  window.addEventListener("load", () => {
    setTimeout(boot, 200);
    setTimeout(boot, 700);
    setTimeout(boot, 1600);
    setTimeout(boot, 3200);
  });
  setTimeout(boot, 400);
  setTimeout(boot, 1400);
  setTimeout(boot, 3200);
  setInterval(reorder, 5000);
})();
