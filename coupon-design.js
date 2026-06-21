(() => {
  const replacements = new Map([
    ["Premium Kupon Merkezi", "Bugünün Laboratuvar Kuponları"],
    ["Günün kuponları ve öne çıkan tahminler", "Robotun ürettiği dengeli, yüksek oranlı ve riskli laboratuvar kuponları JSON verisiyle listelenir."],
    ["Tekli Kuponlar", "Bugünün Laboratuvar Kuponu / Dengeli Kupon"],
    ["2'li Kuponlar", "Yüksek Oranlı Kupon"],
    ["3'lü Kuponlar", "Riskli Laboratuvar Kuponu"],
    ["Tekli kuponlar hazırlanıyor.", "Bugünün laboratuvar kuponu hazırlanıyor."],
    ["2'li kuponlar hazırlanıyor.", "Yüksek oranlı kupon hazırlanıyor."],
    ["3'lü kuponlar hazırlanıyor.", "Riskli laboratuvar kuponu hazırlanıyor."]
  ]);

  const cleanHeaderAccess = () => {
    const header = document.querySelector(".site-header");
    if (!header) return;
    header.querySelectorAll(".fl-access-actions, .fl-access-flow-note, .fl-access-button").forEach((node) => {
      const wrapper = node.closest(".fl-access-actions") || node;
      wrapper.remove();
    });
    header.querySelectorAll("button, a, div, span").forEach((node) => {
      const text = String(node.textContent || "").toLocaleLowerCase("tr-TR");
      if (text.includes("giriş yap") || text.includes("1 gün dene") || text.includes("1 gün ücretsiz dene")) {
        const wrapper = node.closest(".fl-access-actions") || node;
        wrapper.remove();
      }
    });
  };

  const cleanLegacyCouponText = () => {
    const root = document.getElementById("robot-analizleri") || document.body;
    root.querySelectorAll("h2, h3, p, span, div").forEach((node) => {
      const original = String(node.textContent || "").trim();
      if (!original) return;
      if (replacements.has(original)) node.textContent = replacements.get(original);
    });
  };

  const injectLegacyHide = () => {
    if (document.getElementById("legacy-coupon-cleanup-style")) return;
    const style = document.createElement("style");
    style.id = "legacy-coupon-cleanup-style";
    style.textContent = `
      .site-header .fl-access-actions,
      .site-header .fl-access-flow-note,
      .site-header .fl-access-button {
        display: none !important;
        visibility: hidden !important;
        opacity: 0 !important;
        pointer-events: none !important;
        width: 0 !important;
        height: 0 !important;
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(style);
  };

  const run = () => {
    injectLegacyHide();
    cleanHeaderAccess();
    cleanLegacyCouponText();
  };

  run();
  document.addEventListener("DOMContentLoaded", run);
  window.addEventListener("load", run);
  setTimeout(run, 100);
  setTimeout(run, 500);
  setTimeout(run, 1500);
  setInterval(run, 1000);
})();
