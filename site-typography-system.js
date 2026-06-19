(() => {
  const STYLE_ID = "site-typography-system-style";

  const injectStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      :root {
        --fl-gold: #ffb92e;
        --fl-gold-soft: #ffe8a3;
        --fl-neon: #39ff88;
        --fl-diamond: #9aecff;
        --fl-ice: #e9fcff;
        --fl-dark: #050914;
      }

      body {
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
      }

      .dashboard-hero h1,
      .hero h1,
      .founder-copy h2,
      .section-heading h2,
      .premium-title,
      .membership-title,
      .daily-widget-title,
      .opinion-panel h2,
      main h1,
      main h2 {
        font-family: Georgia, "Times New Roman", serif !important;
        letter-spacing: .015em !important;
        color: var(--fl-gold-soft) !important;
        text-shadow: 0 0 22px rgba(255, 185, 46, .24), 0 2px 0 rgba(0, 0, 0, .40) !important;
      }

      .dashboard-hero h1,
      .hero h1,
      main h1 {
        font-weight: 900 !important;
        line-height: 1.04 !important;
      }

      .dashboard-hero p,
      .hero p,
      .section-heading p,
      .premium-subtitle,
      .membership-subtitle,
      .daily-widget-subtitle,
      .premium-note,
      .coupon-note {
        font-family: "DejaVu Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif !important;
        color: #c9d6e8 !important;
        line-height: 1.62 !important;
      }

      .membership-card h3,
      .membership-price,
      .membership-duration,
      .membership-tier,
      .membership-trial-label,
      .membership-pay,
      .membership-start,
      .membership-trial {
        font-family: "DejaVu Sans Condensed", system-ui, sans-serif !important;
        letter-spacing: .045em !important;
      }

      .membership-card h3,
      .membership-price {
        text-transform: uppercase !important;
      }

      .daily-team-name,
      .daily-match-time,
      .daily-league-name,
      .results-match span,
      .results-score,
      .premium-select,
      .premium-row strong,
      .premium-factor,
      [data-premium-match] option {
        font-family: "DejaVu Sans Mono", "Consolas", monospace !important;
      }

      .daily-team-name,
      .results-match span,
      .premium-row strong {
        color: #f8fbff !important;
        font-weight: 950 !important;
        letter-spacing: .025em !important;
        text-shadow: 0 0 14px rgba(57, 255, 136, .18) !important;
      }

      .daily-match-time,
      .results-score {
        color: var(--fl-neon) !important;
        text-shadow: 0 0 18px rgba(57, 255, 136, .38) !important;
        letter-spacing: .04em !important;
      }

      .daily-league-name {
        color: var(--fl-gold-soft) !important;
        text-shadow: 0 0 16px rgba(255, 185, 46, .25) !important;
      }

      .daily-odd,
      .coupon-metric,
      .premium-row,
      .premium-card,
      .results-card,
      .daily-widget-count,
      .daily-status-pill {
        border-color: rgba(154, 236, 255, .18) !important;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.045) !important;
      }

      .coupon-choice strong,
      .coupon-metric strong,
      .premium-status-ok,
      .premium-market.active,
      .daily-odd:hover {
        color: var(--fl-ice) !important;
        text-shadow: 0 0 18px rgba(154, 236, 255, .30) !important;
      }

      .coupon-choice span,
      .coupon-metric span,
      .premium-label,
      .results-league,
      .daily-match-header,
      .premium-small {
        font-family: "DejaVu Sans Condensed", system-ui, sans-serif !important;
        letter-spacing: .075em !important;
      }

      .coupon-card h4 {
        font-family: "DejaVu Sans Mono", "Consolas", monospace !important;
        color: #f8fbff !important;
        text-shadow: 0 0 14px rgba(57, 255, 136, .16) !important;
      }

      .coupon-badge,
      .premium-lock,
      .daily-widget-count {
        font-family: "DejaVu Sans Condensed", system-ui, sans-serif !important;
        letter-spacing: .06em !important;
      }

      .daily-match-row:hover .daily-team-name,
      .results-card:hover .results-match span {
        color: var(--fl-neon) !important;
        text-shadow: 0 0 20px rgba(57, 255, 136, .38) !important;
      }

      .premium-market,
      .premium-action,
      .coupon-choice strong {
        font-family: "DejaVu Sans Condensed", system-ui, sans-serif !important;
        font-weight: 950 !important;
      }

      @media (max-width: 720px) {
        .daily-team-name,
        .results-match span,
        .premium-row strong {
          letter-spacing: .01em !important;
        }
      }
    `;
    document.head.appendChild(style);
  };

  const markTeamText = () => {
    document.querySelectorAll(".results-match span").forEach((item) => {
      item.setAttribute("data-fl-typography", "neon-sport");
    });
    document.querySelectorAll(".daily-team-name").forEach((item) => {
      item.setAttribute("data-fl-typography", "neon-sport");
    });
  };

  const run = () => {
    injectStyle();
    markTeamText();
  };

  window.addEventListener("load", run);
  setTimeout(run, 500);
  setTimeout(run, 1400);
  setInterval(markTeamText, 5000);
})();
