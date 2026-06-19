(() => {
  const ORDER = [
    "platform",
    "daily-matches-widget",
    "yaklasan-maclar",
    "robot-analizleri",
    "guclu-tahmin",
    "son-analizler",
    "membership-payment-panel",
    "premium-analysis-panel",
    "spor-toto-performansi",
    "sonuc-arsivi",
    "basari-takip",
    "analiz-veritabani",
    "yorum-kosesi",
    "analiz-modulleri",
    "kurucu",
    "medya-galerisi",
  ];

  const STYLE_ID = "section-order-style";

  const injectStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #kurucu,
      #medya-galerisi {
        scroll-margin-top: 130px;
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

  window.addEventListener("load", () => {
    setTimeout(reorder, 400);
    setTimeout(reorder, 1400);
    setTimeout(reorder, 3200);
  });
})();
