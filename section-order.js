(() => {
  const STYLE_ID = "section-order-style";
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
      #analiz-modulleri { scroll-margin-top: 130px; }

      #yaklasan-maclar.daily-matches-anchor,
      #live-control-center { display: none !important; height: 0 !important; overflow: hidden !important; }
    `;
    document.head.appendChild(style);
  };

  injectStyle();
  document.addEventListener("DOMContentLoaded", injectStyle);
  window.addEventListener("load", injectStyle);
})();
