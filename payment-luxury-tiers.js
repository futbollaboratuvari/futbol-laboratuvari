(() => {
  const tierConfig = {
    starter: {
      text: "🏆 Gold",
      summary: "Kısa süreli giriş ve temel erişim için parlak gold paket.",
    },
    pro: {
      text: "💎 Diamond",
      summary: "Daha güçlü analiz hakları ve elmas seviye görünüm.",
    },
    vip: {
      text: "👑 Premium",
      summary: "En güçlü erişim, öncelik ve lüks premium seviye.",
    },
  };

  const injectStyle = () => {
    if (document.getElementById("payment-luxury-tiers-style")) return;
    const style = document.createElement("style");
    style.id = "payment-luxury-tiers-style";
    style.textContent = `
      .membership-card.starter {
        border-color: rgba(255, 188, 45, .66) !important;
        background:
          radial-gradient(circle at 18% 8%, rgba(255, 232, 163, .24), transparent 28%),
          linear-gradient(145deg, rgba(255, 188, 45, .22), rgba(255, 214, 102, .10), rgba(255,255,255,.04)) !important;
        box-shadow: 0 24px 70px rgba(0,0,0,.38), 0 0 44px rgba(255, 188, 45, .20) !important;
      }
      .membership-card.pro {
        border-color: rgba(160, 240, 255, .78) !important;
        background:
          radial-gradient(circle at 18% 8%, rgba(205, 249, 255, .30), transparent 30%),
          linear-gradient(145deg, rgba(140, 236, 255, .20), rgba(255,255,255,.08), rgba(57,255,136,.06)) !important;
        box-shadow: 0 28px 82px rgba(0,0,0,.42), 0 0 52px rgba(140, 236, 255, .22) !important;
      }
      .membership-card.vip {
        border-color: rgba(255, 232, 163, .82) !important;
        background:
          radial-gradient(circle at 15% 5%, rgba(255, 232, 163, .26), transparent 30%),
          radial-gradient(circle at 82% 18%, rgba(255, 188, 45, .18), transparent 28%),
          linear-gradient(145deg, rgba(10, 10, 18, .96), rgba(255, 188, 45, .20), rgba(3,8,23,.98)) !important;
        box-shadow: 0 32px 92px rgba(0,0,0,.52), 0 0 66px rgba(255, 188, 45, .28) !important;
      }
      .membership-card.starter::before {
        background: linear-gradient(90deg, #8b5e12, #ffb92e, #ffe8a3, #ffb92e) !important;
        box-shadow: 0 0 24px rgba(255, 188, 45, .45) !important;
      }
      .membership-card.pro::before {
        background: linear-gradient(90deg, #6ee7ff, #f8fbff, #9aecff, #ffe8a3) !important;
        box-shadow: 0 0 28px rgba(140, 236, 255, .48) !important;
      }
      .membership-card.vip::before {
        background: linear-gradient(90deg, #1a1003, #ffb92e, #ffe8a3, #ff9f1c, #1a1003) !important;
        box-shadow: 0 0 32px rgba(255, 188, 45, .55) !important;
      }
      .membership-card.pro .membership-tier {
        color: #e9fcff !important;
        border-color: rgba(160, 240, 255, .55) !important;
        background: rgba(160, 240, 255, .14) !important;
      }
      .membership-card.vip .membership-tier {
        color: #ffe8a3 !important;
        border-color: rgba(255, 232, 163, .62) !important;
        background: rgba(255, 188, 45, .16) !important;
      }
      .membership-card .membership-trial-label {
        position: relative !important;
        width: 100% !important;
        justify-content: center !important;
        min-height: 42px !important;
        padding: 10px 12px !important;
        border-radius: 14px !important;
        border: 1px solid rgba(255, 232, 163, .82) !important;
        background: linear-gradient(135deg, #ff3d00 0%, #ffb92e 38%, #ffe8a3 70%, #39ff88 100%) !important;
        color: #170b00 !important;
        font-size: 13px !important;
        font-weight: 1000 !important;
        letter-spacing: .06em !important;
        text-transform: uppercase !important;
        box-shadow: 0 14px 34px rgba(255, 185, 46, .28), 0 0 24px rgba(255, 232, 163, .25) !important;
        animation: flTrialPulse 1.8s ease-in-out infinite !important;
      }
      .membership-card .membership-trial-label::before {
        content: "🎁";
        margin-right: 7px;
      }
      .membership-card .membership-trial-label::after {
        content: "HEMEN DENE";
        position: absolute;
        top: -12px;
        right: 10px;
        padding: 4px 8px;
        border-radius: 999px;
        background: #ff2d55;
        color: #fff;
        font-size: 9px;
        font-weight: 1000;
        letter-spacing: .08em;
        box-shadow: 0 8px 20px rgba(255, 45, 85, .30);
      }
      .membership-card.pro h3,
      .membership-card.pro .membership-price,
      .membership-card.pro .membership-duration {
        color: #e9fcff !important;
        text-shadow: 0 0 20px rgba(140, 236, 255, .32) !important;
      }
      .membership-card.vip h3,
      .membership-card.vip .membership-price,
      .membership-card.vip .membership-duration {
        color: #ffe8a3 !important;
        text-shadow: 0 0 24px rgba(255, 188, 45, .34) !important;
      }
      .membership-card.pro .membership-pay {
        background: linear-gradient(135deg, #6ee7ff, #f8fbff, #9aecff) !important;
        color: #02111a !important;
      }
      .membership-card.vip .membership-pay {
        background: linear-gradient(135deg, #1a1003, #ffb92e, #ffe8a3, #ff9f1c) !important;
        color: #140d02 !important;
      }
      .membership-trial {
        min-height: 52px !important;
        border: 1px solid rgba(255, 232, 163, .72) !important;
        background: linear-gradient(135deg, #ff3d00, #ffb92e, #ffe8a3) !important;
        color: #170b00 !important;
        box-shadow: 0 14px 34px rgba(255, 185, 46, .28) !important;
        animation: flTrialPulse 1.8s ease-in-out infinite !important;
      }
      .membership-trial::before {
        content: "🎁 ";
      }
      @keyframes flTrialPulse {
        0%, 100% { transform: scale(1); filter: brightness(1); }
        50% { transform: scale(1.018); filter: brightness(1.13); }
      }
      @media (max-width: 560px) {
        .membership-card .membership-trial-label {
          font-size: 12px !important;
          min-height: 40px !important;
        }
        .membership-card .membership-trial-label::after {
          right: 8px;
          top: -10px;
        }
      }
    `;
    document.head.appendChild(style);
  };

  const relabelCards = () => {
    document.querySelectorAll(".membership-card").forEach((card) => {
      const planButton = card.querySelector("[data-plan]");
      const planId = planButton?.dataset?.plan;
      const config = tierConfig[planId];
      if (!config) return;
      const tier = card.querySelector(".membership-tier");
      const summary = card.querySelector(".membership-card-summary");
      const trial = card.querySelector(".membership-trial-label");
      if (tier) tier.textContent = config.text;
      if (summary) summary.textContent = config.summary;
      if (trial) trial.textContent = "1 GÜN ÜCRETSİZ DENEME";
    });
  };

  const run = () => {
    injectStyle();
    relabelCards();
  };

  window.addEventListener("load", run);
  setTimeout(run, 500);
  setTimeout(run, 1200);
  setTimeout(run, 2200);
})();
