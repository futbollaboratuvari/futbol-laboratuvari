(() => {
  const removeHeaderTrialAccess = () => {
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

  const injectHardHide = () => {
    if (document.getElementById("fl-remove-header-access-style")) return;
    const style = document.createElement("style");
    style.id = "fl-remove-header-access-style";
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
    injectHardHide();
    removeHeaderTrialAccess();
  };

  run();
  document.addEventListener("DOMContentLoaded", run);
  window.addEventListener("load", run);
  setTimeout(run, 100);
  setTimeout(run, 500);
  setTimeout(run, 1500);
  setInterval(run, 1000);
})();
