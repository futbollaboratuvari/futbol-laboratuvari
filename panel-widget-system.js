(() => {
  const STYLE_ID = "panel-widget-system-style";
  const TAGGED = "data-fl-panel-widget";

  const panels = [
    { selector: "#platform", type: "brand", label: "Futbol Laboratuvarı", icon: "👑" },
    { selector: "#robot-analizleri", type: "diamond", label: "Kupon Merkezi", icon: "💎" },
    { selector: "#daily-matches-widget", type: "sport", label: "Canlı Maç Bülteni", icon: "⚽" },
    { selector: "#yaklasan-maclar", type: "sport", label: "Bugünün Maçları", icon: "⚽" },
    { selector: "#membership-payment-panel", type: "gold", label: "Üyelik Paketleri", icon: "🏆" },
    { selector: "#premium-analysis-panel", type: "premium", label: "Özel Analiz Paneli", icon: "👑" },
    { selector: "#guclu-tahmin", type: "diamond", label: "Günün Seçimi", icon: "💎" },
    { selector: "#son-analizler", type: "diamond", label: "Maç Yorumları", icon: "💎" },
    { selector: "#analiz-veritabani", type: "diamond", label: "Maç Kayıtları", icon: "💎" },
    { selector: "#sonuc-arsivi", type: "sport", label: "Sonuçlar", icon: "🏁" },
    { selector: "#basari-takip", type: "diamond", label: "Performans", icon: "📊" },
    { selector: "#spor-toto-performansi", type: "sport", label: "Spor Toto", icon: "1X2" },
    { selector: "#analiz-modulleri", type: "brand", label: "Değerlendirme Başlıkları", icon: "🧠" },
    { selector: "#kurucu", type: "brand", label: "Hakkımızda", icon: "FL" },
    { selector: "#medya-galerisi", type: "brand", label: "Görsel Arşiv", icon: "🖼️" },
  ];

  const injectStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .fl-panel-widget {
        position: relative !important;
      }

      .fl-panel-widget:not(.dashboard-hero):not(.membership-shell):not(.premium-analysis-shell):not(.daily-widget-shell) {
        border-radius: 28px !important;
      }

      .fl-widget-tag {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        width: max-content;
        max-width: 100%;
        margin: 0 0 10px;
        padding: 8px 12px;
        border-radius: 999px;
        font-family: "DejaVu Sans Condensed", system-ui, sans-serif;
        font-size: 12px;
        font-weight: 950;
        letter-spacing: .07em;
        text-transform: uppercase;
        border: 1px solid rgba(255,255,255,.16);
        background: rgba(255,255,255,.06);
        box-shadow: 0 12px 28px rgba(0,0,0,.20), inset 0 1px 0 rgba(255,255,255,.08);
      }

      .fl-widget-brand .fl-widget-tag { color: #ffe8a3; border-color: rgba(255,232,163,.42); background: rgba(255,185,46,.10); }
      .fl-widget-gold .fl-widget-tag { color: #ffe8a3; border-color: rgba(255,185,46,.58); background: rgba(255,185,46,.14); }
      .fl-widget-sport .fl-widget-tag { color: #c8ffdd; border-color: rgba(57,255,136,.46); background: rgba(57,255,136,.12); }
      .fl-widget-diamond .fl-widget-tag { color: #e9fcff; border-color: rgba(154,236,255,.46); background: rgba(154,236,255,.11); }
      .fl-widget-premium .fl-widget-tag { color: #ffe8a3; border-color: rgba(255,232,163,.62); background: rgba(255,185,46,.13); }

      .fl-widget-brand .section-heading,
      .fl-widget-diamond .section-heading,
      .fl-widget-sport .section-heading,
      .fl-widget-premium .section-heading {
        position: relative;
        overflow: hidden;
        padding: 18px;
        border-radius: 22px;
        border: 1px solid rgba(255,255,255,.08);
        background:
          linear-gradient(135deg, rgba(255,255,255,.045), transparent 36%),
          rgba(3,8,23,.38);
      }

      .fl-widget-brand .section-heading { border-color: rgba(255,232,163,.20); }
      .fl-widget-diamond .section-heading { border-color: rgba(154,236,255,.20); }
      .fl-widget-sport .section-heading { border-color: rgba(57,255,136,.20); }
      .fl-widget-premium .section-heading { border-color: rgba(255,185,46,.24); }

      .fl-widget-brand .eyebrow,
      .fl-widget-premium .eyebrow { color: #ffe8a3 !important; }
      .fl-widget-gold .eyebrow { color: #ffb92e !important; }
      .fl-widget-sport .eyebrow { color: #39ff88 !important; }
      .fl-widget-diamond .eyebrow { color: #9aecff !important; }

      .fl-widget-sport .fixtures-panel,
      .fl-widget-sport .daily-widget-shell,
      .fl-widget-sport .results-panel,
      .fl-widget-sport .table-wrap {
        border-color: rgba(57,255,136,.25) !important;
        box-shadow: 0 24px 70px rgba(0,0,0,.36), 0 0 36px rgba(57,255,136,.08) !important;
      }

      .fl-widget-diamond .robot-live-status,
      .fl-widget-diamond .robot-coupon-columns > div,
      .fl-widget-diamond .strongest-card,
      .fl-widget-diamond .analysis-list,
      .fl-widget-diamond .table-wrap,
      .fl-widget-diamond .success-grid,
      .fl-widget-diamond .spor-summary,
      .fl-widget-diamond .spor-grid {
        border-color: rgba(154,236,255,.22) !important;
        background:
          linear-gradient(135deg, rgba(154,236,255,.08), transparent 38%),
          rgba(3,8,23,.52) !important;
        box-shadow: 0 20px 58px rgba(0,0,0,.30), 0 0 30px rgba(154,236,255,.06) !important;
      }

      .fl-widget-gold.membership-shell,
      .fl-widget-gold .membership-card,
      .fl-widget-gold .membership-output {
        border-color: rgba(255,185,46,.34) !important;
      }

      .fl-widget-premium.premium-analysis-shell,
      .fl-widget-premium .premium-card,
      .fl-widget-premium .premium-output,
      .fl-widget-premium .premium-result {
        border-color: rgba(255,232,163,.28) !important;
        box-shadow: 0 24px 72px rgba(0,0,0,.36), 0 0 34px rgba(255,185,46,.08) !important;
      }

      .robot-live-status,
      .hero-proof,
      .pro-market-strip,
      .premium-market-grid,
      .coupon-metrics,
      .opinion-metrics {
        gap: 10px !important;
      }

      .robot-live-status span,
      .hero-proof span,
      .pro-market-card,
      .opinion-metrics span,
      .module-card,
      .media-card,
      .premium-market,
      .coupon-metric,
      .daily-odd,
      .daily-status-pill,
      .results-card {
        border-radius: 16px !important;
        transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease, color .18s ease !important;
      }

      .robot-live-status span:hover,
      .hero-proof span:hover,
      .pro-market-card:hover,
      .opinion-metrics span:hover,
      .module-card:hover,
      .media-card:hover,
      .premium-market:hover,
      .coupon-metric:hover,
      .daily-odd:hover,
      .results-card:hover {
        transform: translateY(-2px);
      }

      .fl-widget-sport .daily-match-header,
      .fl-widget-sport .results-head {
        background: linear-gradient(90deg, rgba(57,255,136,.20), rgba(255,185,46,.12), rgba(3,8,23,.96)) !important;
        color: #c8ffdd !important;
      }

      .fl-widget-diamond .coupon-badge,
      .fl-widget-diamond .robot-live-status strong,
      .fl-widget-diamond .coupon-choice strong,
      .fl-widget-diamond .coupon-metric strong {
        color: #e9fcff !important;
        text-shadow: 0 0 18px rgba(154,236,255,.24) !important;
      }

      .fl-widget-sport table th,
      .fl-widget-sport table td,
      .fl-widget-diamond table th,
      .fl-widget-diamond table td {
        border-color: rgba(154,236,255,.12) !important;
      }

      .fl-widget-sport table th { color: #39ff88 !important; }
      .fl-widget-diamond table th { color: #9aecff !important; }

      .fl-widget-brand .module-card span,
      .fl-widget-brand .media-card span,
      .fl-widget-brand .founder-title,
      .fl-widget-brand .founder-motto {
        color: #ffe8a3 !important;
      }

      .fl-widget-empty-ready,
      .coupon-empty,
      .daily-widget-empty,
      .results-empty,
      .robot-live-card:only-child {
        border-radius: 18px !important;
        border: 1px dashed rgba(154,236,255,.22) !important;
        background:
          linear-gradient(135deg, rgba(154,236,255,.06), transparent 38%),
          rgba(3,8,23,.54) !important;
        color: #aebbd0 !important;
      }

      .fl-panel-widget[data-fl-panel-type="gold"] .fl-widget-empty-ready,
      .fl-panel-widget[data-fl-panel-type="premium"] .fl-widget-empty-ready {
        border-color: rgba(255,185,46,.26) !important;
      }

      @media (max-width: 720px) {
        .fl-widget-tag {
          font-size: 11px;
          padding: 7px 10px;
        }
        .fl-widget-brand .section-heading,
        .fl-widget-diamond .section-heading,
        .fl-widget-sport .section-heading,
        .fl-widget-premium .section-heading {
          padding: 14px;
        }
      }
    `;
    document.head.appendChild(style);
  };

  const addTag = (panel, config) => {
    if (!panel || panel.querySelector(":scope > .fl-widget-tag")) return;
    const tag = document.createElement("span");
    tag.className = "fl-widget-tag";
    tag.textContent = `${config.icon} ${config.label}`;

    if (panel.classList.contains("membership-shell") || panel.classList.contains("premium-analysis-shell") || panel.classList.contains("daily-widget-shell")) {
      panel.prepend(tag);
      return;
    }

    const heading = panel.querySelector(":scope > .section-heading") || panel.querySelector(":scope > .hero-content") || panel.firstElementChild;
    if (heading) heading.prepend(tag);
    else panel.prepend(tag);
  };

  const classifyPanels = () => {
    panels.forEach((config) => {
      document.querySelectorAll(config.selector).forEach((panel) => {
        panel.classList.add("fl-panel-widget", `fl-widget-${config.type}`);
        panel.setAttribute("data-fl-panel-type", config.type);
        panel.setAttribute(TAGGED, config.label);
        addTag(panel, config);
      });
    });

    document.querySelectorAll(".coupon-empty,.daily-widget-empty,.results-empty,.robot-live-card").forEach((item) => {
      item.classList.add("fl-widget-empty-ready");
    });
  };

  const run = () => {
    injectStyle();
    classifyPanels();
  };

  window.addEventListener("load", run);
  setTimeout(run, 500);
  setTimeout(run, 1400);
  setTimeout(run, 2600);
  setInterval(classifyPanels, 6000);
})();
