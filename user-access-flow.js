(() => {
  const STYLE_ID = "user-access-flow-style";

  const icons = [
    { selector: 'a[href*="#platform"]', icon: "🏠" },
    { selector: 'a[href*="#yaklasan-maclar"]', icon: "⚽" },
    { selector: 'a[href*="#robot-analizleri"]', icon: "🎫" },
    { selector: 'a[href*="#membership-payment-panel"]', icon: "🏆" },
    { selector: 'a[href*="#premium-analysis-panel"]', icon: "🎯" },
    { selector: 'a[href*="#sonuc-arsivi"]', icon: "🏁" },
    { selector: 'a[href*="#basari-takip"]', icon: "📊" },
    { selector: 'a[href*="#kurucu"]', icon: "FL" },
    { selector: 'a[href*="admin.html"]', icon: "⚙️" },
  ];

  const injectStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .site-header::after {
        content: none !important;
        display: none !important;
      }

      .fl-access-actions {
        display: none !important;
      }

      .fl-access-flow-note {
        display: none !important;
      }

      .nav-link-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 16px;
        height: 16px;
        margin-right: 5px;
        border-radius: 999px;
        color: #ffe8a3;
        font-size: 11px;
        line-height: 1;
        text-shadow: 0 0 10px rgba(255,185,46,.22);
      }
    `;
    document.head.appendChild(style);
  };

  const addIcons = () => {
    icons.forEach(({ selector, icon }) => {
      document.querySelectorAll(selector).forEach((link) => {
        if (link.querySelector(".nav-link-icon")) return;
        const span = document.createElement("span");
        span.className = "nav-link-icon";
        span.textContent = icon;
        link.prepend(span);
      });
    });
  };

  const removeAccessActions = () => {
    document.querySelectorAll(".fl-access-actions, .fl-access-flow-note").forEach((element) => element.remove());
  };

  const run = () => {
    injectStyle();
    addIcons();
    removeAccessActions();
  };

  window.addEventListener("load", run);
  setTimeout(run, 600);
  setTimeout(run, 1600);
})();
