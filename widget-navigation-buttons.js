(() => {
  const STYLE_ID = "fl-widget-navigation-buttons-style";
  const BLOCK_CLASS = "fl-widget-nav-buttons";

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const injectStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .${BLOCK_CLASS}{display:flex;flex-wrap:wrap;gap:10px;margin:14px 0 4px;align-items:center}
      .${BLOCK_CLASS} a{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:9px 13px;border-radius:999px;border:1px solid rgba(57,255,136,.32);background:rgba(57,255,136,.10);color:#f8fbff;text-decoration:none;font-size:12px;font-weight:950;letter-spacing:.02em;box-shadow:0 10px 24px rgba(0,0,0,.22)}
      .${BLOCK_CLASS} a:hover{border-color:rgba(255,224,138,.55);background:rgba(255,159,28,.16);color:#ffe08a}
      @media(max-width:620px){.${BLOCK_CLASS}{display:grid;grid-template-columns:1fr}.${BLOCK_CLASS} a{width:100%}}
    `;
    document.head.appendChild(style);
  };

  const buttonHtml = (buttons) => `
    <div class="${BLOCK_CLASS}" aria-label="Hızlı geçiş butonları">
      ${buttons.map((button) => `<a href="${esc(button.href)}">${esc(button.label)}</a>`).join("")}
    </div>
  `;

  const addAfter = (target, id, buttons) => {
    if (!target || document.getElementById(id)) return;
    target.insertAdjacentHTML("afterend", buttonHtml(buttons).replace(`class="${BLOCK_CLASS}"`, `id="${id}" class="${BLOCK_CLASS}"`));
  };

  const addInside = (target, id, buttons) => {
    if (!target || document.getElementById(id)) return;
    target.insertAdjacentHTML("beforeend", buttonHtml(buttons).replace(`class="${BLOCK_CLASS}"`, `id="${id}" class="${BLOCK_CLASS}"`));
  };

  const run = () => {
    injectStyle();
    addInside(document.querySelector(".platform-summary"), "fl-hero-widget-buttons", [
      { href: "#robot-analizleri", label: "Kupon Merkezine Git" },
      { href: "#son-analizler", label: "Maç Yorumlarına Git" },
      { href: "#premium-analysis-panel", label: "Özel Analize Git" }
    ]);
    addAfter(document.querySelector("#daily-matches-widget"), "fl-daily-widget-buttons", [
      { href: "#son-analizler", label: "Maç Yorumlarını Aç" },
      { href: "#robot-analizleri", label: "Kupon Merkezini Aç" },
      { href: "#premium-analysis-panel", label: "Özel Analiz Paneli" }
    ]);
    addAfter(document.querySelector(".robot-live-status"), "fl-kupon-widget-buttons", [
      { href: "#son-analizler", label: "Maç Yorumları" },
      { href: "#guclu-tahmin", label: "Günün Seçimi" },
      { href: "#premium-analysis-panel", label: "Özel Analiz" }
    ]);
  };

  document.addEventListener("DOMContentLoaded", run, { once: true });
  window.addEventListener("load", () => {
    run();
    setTimeout(run, 500);
    setTimeout(run, 1500);
  }, { once: true });
})();
