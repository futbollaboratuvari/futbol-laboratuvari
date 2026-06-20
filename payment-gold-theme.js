(() => {
  const inject = () => {
    if (document.getElementById("payment-gold-theme-style")) return;
    const style = document.createElement("style");
    style.id = "payment-gold-theme-style";
    style.textContent = `
      .membership-shell {
        border-color: rgba(255, 205, 89, .42) !important;
        background:
          radial-gradient(circle at top left, rgba(255, 214, 102, .16), transparent 34%),
          radial-gradient(circle at bottom right, rgba(255, 159, 28, .13), transparent 30%),
          linear-gradient(180deg, rgba(8, 23, 48, .97), rgba(3, 8, 23, .99)) !important;
      }
      .membership-badge,
      .membership-trial-label {
        border-color: rgba(255, 214, 102, .55) !important;
        background: linear-gradient(135deg, rgba(255, 214, 102, .18), rgba(255, 159, 28, .10)) !important;
        color: #ffe8a3 !important;
        box-shadow: 0 0 24px rgba(255, 185, 46, .15) !important;
      }
      .membership-card {
        border-color: rgba(255, 214, 102, .22) !important;
        box-shadow: 0 20px 62px rgba(0,0,0,.34), 0 0 34px rgba(255,185,46,.08) !important;
      }
      .membership-card::after {
        content: "";
        position: absolute;
        inset: -90px auto auto -70px;
        width: 180px;
        height: 180px;
        border-radius: 999px;
        background: radial-gradient(circle, rgba(255, 232, 163, .20), transparent 66%);
        pointer-events: none;
      }
      .membership-card.starter {
        background:
          linear-gradient(145deg, rgba(220, 226, 237, .09), rgba(255, 214, 102, .06)),
          rgba(255,255,255,.035) !important;
      }
      .membership-card.pro {
        border-color: rgba(255, 214, 102, .62) !important;
        background:
          linear-gradient(145deg, rgba(255, 214, 102, .18), rgba(57, 255, 136, .08) 48%, rgba(255,255,255,.04)),
          rgba(255,255,255,.035) !important;
        box-shadow: 0 26px 78px rgba(0,0,0,.42), 0 0 46px rgba(255, 185, 46, .18) !important;
      }
      .membership-card.vip {
        border-color: rgba(255, 232, 163, .78) !important;
        background:
          radial-gradient(circle at 18% 8%, rgba(255, 232, 163, .22), transparent 28%),
          linear-gradient(145deg, rgba(255, 185, 46, .24), rgba(255, 214, 102, .12) 42%, rgba(57,255,136,.06)),
          rgba(255,255,255,.035) !important;
        box-shadow: 0 30px 86px rgba(0,0,0,.46), 0 0 58px rgba(255, 185, 46, .24) !important;
      }
      .membership-card.starter::before,
      .membership-card.pro::before,
      .membership-card.vip::before {
        height: 6px !important;
        background: linear-gradient(90deg, #8b5e12, #ffb92e, #ffe8a3, #ff9f1c) !important;
        box-shadow: 0 0 22px rgba(255, 185, 46, .36) !important;
      }
      .membership-tier {
        border-color: rgba(255, 214, 102, .48) !important;
        background: linear-gradient(135deg, rgba(255, 214, 102, .18), rgba(255, 159, 28, .10)) !important;
        color: #ffe8a3 !important;
      }
      .membership-card h3,
      .membership-price,
      .membership-duration {
        color: #ffe8a3 !important;
        text-shadow: 0 0 18px rgba(255, 185, 46, .22) !important;
      }
      .membership-pay,
      .membership-start,
      .membership-trial {
        background: linear-gradient(135deg, #8b5e12 0%, #ffb92e 32%, #ffe8a3 62%, #ff9f1c 100%) !important;
        color: #1a1003 !important;
        box-shadow: 0 14px 36px rgba(255, 185, 46, .23) !important;
      }
      .membership-pay:hover,
      .membership-start:hover,
      .membership-trial:hover {
        filter: brightness(1.08) saturate(1.08) !important;
        box-shadow: 0 18px 48px rgba(255, 185, 46, .32) !important;
      }
      .membership-output {
        border-color: rgba(255, 214, 102, .34) !important;
        background: linear-gradient(135deg, rgba(255, 214, 102, .10), rgba(57,255,136,.05)) !important;
      }
    `;
    document.head.appendChild(style);
  };

  const loadScriptOnce = (src, id) => {
    if (document.getElementById(id)) return;
    if ([...document.querySelectorAll("script[src]")].some((script) => String(script.getAttribute("src") || "").endsWith(src))) return;
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.defer = true;
    document.body.appendChild(script);
  };

  const loadReadinessPanel = () => loadScriptOnce("paytr-readiness-panel.js", "paytr-readiness-panel-script");
  const loadVisibleFix = () => loadScriptOnce("site-visible-fix.js", "site-visible-fix-script");

  window.addEventListener("load", () => {
    inject();
    loadVisibleFix();
    loadReadinessPanel();
  });
  setTimeout(inject, 800);
  setTimeout(inject, 1800);
  setTimeout(loadVisibleFix, 400);
  setTimeout(loadReadinessPanel, 1200);
})();
