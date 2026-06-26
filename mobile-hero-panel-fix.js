(() => {
  const SOURCE = "mobile_hero_panel_fix";
  const inject = () => {
    if (document.getElementById("mobile-hero-panel-fix-style")) return;
    const style = document.createElement("style");
    style.id = "mobile-hero-panel-fix-style";
    style.textContent = `
      @media (max-width: 760px) {
        html,
        body {
          width: 100% !important;
          max-width: 100% !important;
          overflow-x: hidden !important;
        }

        .dashboard-hero {
          display: block !important;
          min-height: auto !important;
          height: auto !important;
          padding: 96px 18px 30px !important;
          overflow: hidden !important;
          isolation: isolate !important;
        }

        .dashboard-hero .hero-media,
        .dashboard-hero::before,
        .dashboard-hero::after {
          pointer-events: none !important;
        }

        .dashboard-hero .hero-content {
          position: relative !important;
          inset: auto !important;
          transform: none !important;
          z-index: 2 !important;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 14px !important;
          margin: 0 !important;
          padding: 0 !important;
        }

        .dashboard-hero .hero-brand-lockup {
          width: fit-content !important;
          max-width: 100% !important;
          margin: 0 0 6px !important;
        }

        .dashboard-hero .eyebrow {
          display: inline-flex !important;
          width: fit-content !important;
          max-width: 100% !important;
          margin: 0 0 2px !important;
          padding: 8px 14px !important;
          border-radius: 999px !important;
          white-space: normal !important;
        }

        .dashboard-hero h1 {
          font-size: clamp(34px, 10vw, 46px) !important;
          line-height: .96 !important;
          letter-spacing: -1.3px !important;
          max-width: 100% !important;
          margin: 0 !important;
          word-break: normal !important;
        }

        .dashboard-hero .hero-content > p:not(.eyebrow) {
          font-size: 16px !important;
          line-height: 1.55 !important;
          max-width: 100% !important;
          margin: 0 !important;
        }

        .dashboard-hero .platform-summary {
          position: relative !important;
          inset: auto !important;
          transform: none !important;
          z-index: 3 !important;
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: 12px !important;
          margin: 18px 0 0 !important;
          padding: 0 !important;
        }

        .dashboard-hero .platform-summary > div {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          margin: 0 !important;
          padding: 22px 20px !important;
          box-sizing: border-box !important;
          position: relative !important;
          transform: none !important;
        }

        .dashboard-hero .platform-summary strong,
        .dashboard-hero .platform-summary small,
        .dashboard-hero .platform-summary span {
          overflow-wrap: anywhere !important;
        }

        .dashboard-hero .hero-proof {
          position: relative !important;
          z-index: 2 !important;
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 8px !important;
          width: 100% !important;
          max-width: 100% !important;
          margin: 4px 0 0 !important;
        }

        .dashboard-hero .hero-proof span {
          min-width: 0 !important;
          text-align: center !important;
          padding: 10px 8px !important;
          font-size: 12px !important;
        }

        .dashboard-hero .fl-hero-credibility {
          position: relative !important;
          z-index: 2 !important;
          width: 100% !important;
          max-width: 100% !important;
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: 10px !important;
          margin: 4px 0 0 !important;
        }

        .dashboard-hero .fl-hero-credibility span {
          width: 100% !important;
          max-width: 100% !important;
          min-width: 0 !important;
          box-sizing: border-box !important;
          display: flex !important;
          gap: 10px !important;
          align-items: flex-start !important;
          padding: 14px 16px !important;
          line-height: 1.4 !important;
        }

        .dashboard-hero .fl-hero-credibility strong {
          flex: 0 0 auto !important;
        }

        .dashboard-hero .hero-actions {
          position: relative !important;
          inset: auto !important;
          transform: none !important;
          z-index: 4 !important;
          display: grid !important;
          grid-template-columns: 1fr !important;
          width: 100% !important;
          max-width: 100% !important;
          gap: 12px !important;
          margin: 16px 0 0 !important;
          padding: 16px !important;
          border-radius: 22px !important;
          box-sizing: border-box !important;
          background: rgba(2, 11, 23, .84) !important;
          border: 1px solid rgba(255,255,255,.12) !important;
          backdrop-filter: blur(12px) !important;
        }

        .dashboard-hero .hero-button {
          width: 100% !important;
          max-width: 100% !important;
          min-height: 54px !important;
          margin: 0 !important;
          box-sizing: border-box !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          text-align: center !important;
          white-space: normal !important;
        }

        .top-robot-hub,
        #daily-matches-widget,
        .section {
          position: relative !important;
          z-index: 1 !important;
        }
      }
    `;
    document.head.appendChild(style);
    document.documentElement.dataset.mobileHeroPanelFix = "active";
  };

  document.addEventListener("DOMContentLoaded", inject, { once: true });
  window.addEventListener("load", inject, { once: true });
  inject();
  window.MOBILE_HERO_PANEL_FIX = { source: SOURCE, apply: inject };
})();
