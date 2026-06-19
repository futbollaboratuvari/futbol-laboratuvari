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
        grid-column: 3 !important;
        grid-row: 1 / span 2 !important;
        justify-self: end !important;
        align-self: center !important;
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        width: auto;
        min-width: max-content;
        margin-left: 0 !important;
        padding: 6px;
        border: 1px solid rgba(255, 214, 102, .24);
        border-radius: 999px;
        background: rgba(3, 8, 23, .72);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.06), 0 12px 28px rgba(0,0,0,.20);
      }

      .fl-access-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-height: 34px;
        padding: 7px 13px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,.12);
        background: rgba(255,255,255,.045);
        color: #f8fbff;
        font-family: "DejaVu Sans Condensed", Inter, system-ui, sans-serif;
        font-size: 11px;
        font-weight: 950;
        letter-spacing: .055em;
        text-transform: uppercase;
        cursor: pointer;
        white-space: nowrap;
        transition: transform .18s ease, background .18s ease, border-color .18s ease, box-shadow .18s ease;
      }

      .fl-access-button:hover {
        transform: translateY(-1px);
        border-color: rgba(255, 214, 102, .36);
        background: rgba(255, 214, 102, .09);
      }

      .fl-access-button.trial {
        border-color: rgba(255, 185, 46, .66);
        background: linear-gradient(135deg, #ff7a18, #ffb92e, #ffe8a3);
        color: #170b00;
        box-shadow: 0 0 24px rgba(255, 185, 46, .20);
      }

      .fl-access-button.login {
        border-color: rgba(154,236,255,.32);
        background: rgba(154,236,255,.07);
        color: #e9fcff;
      }

      .fl-access-flow-note {
        position: fixed;
        right: 18px;
        top: 100px;
        z-index: 120;
        display: none;
        width: min(360px, calc(100vw - 32px));
        padding: 14px;
        border: 1px solid rgba(255,214,102,.34);
        border-radius: 18px;
        background: rgba(3,8,23,.96);
        color: #d7e4f5;
        box-shadow: 0 24px 70px rgba(0,0,0,.44);
      }

      .fl-access-flow-note.open { display: grid; gap: 9px; }
      .fl-access-flow-note strong { color: #ffe8a3; }
      .fl-access-flow-note span { color: #aebbd0; font-size: 13px; line-height: 1.55; }
      .fl-access-flow-note button { justify-self: end; border: 0; border-radius: 999px; padding: 8px 12px; background: linear-gradient(135deg,#ffb92e,#39ff88); color: #07110c; font-weight: 950; cursor: pointer; }

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

      @media (max-width: 1480px) {
        .fl-access-actions {
          grid-column: 3 !important;
          grid-row: 1 / span 2 !important;
          width: auto;
          min-width: max-content;
          justify-self: end !important;
          padding: 5px;
        }
        .fl-access-button {
          min-height: 32px;
          padding: 6px 10px;
          font-size: 10px;
        }
      }

      @media (max-width: 1180px) {
        .fl-access-actions {
          grid-column: 1 / -1 !important;
          grid-row: auto !important;
          justify-self: end !important;
        }
      }

      @media (max-width: 860px) {
        .fl-access-actions {
          display: none !important;
        }
        .fl-access-flow-note { top: 86px; right: 12px; }
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

  const ensureNote = () => {
    let note = document.querySelector(".fl-access-flow-note");
    if (note) return note;
    note = document.createElement("aside");
    note.className = "fl-access-flow-note";
    note.innerHTML = `
      <strong>Hızlı üyelik akışı</strong>
      <span>Siteyi gezebilirsin. 1 gün ücretsiz deneme, paket satın alma ve özel analiz için üyelik bilgileri gerekir.</span>
      <button type="button" data-access-close>Tamam</button>
    `;
    note.querySelector("[data-access-close]").addEventListener("click", () => note.classList.remove("open"));
    document.body.appendChild(note);
    return note;
  };

  const goToMembership = () => {
    const target = document.getElementById("membership-payment-panel") || document.querySelector("#robot-analizleri");
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const ensureActions = () => {
    const header = document.querySelector(".site-header");
    if (!header || header.querySelector(".fl-access-actions")) return;

    const actions = document.createElement("div");
    actions.className = "fl-access-actions";
    actions.innerHTML = `
      <button class="fl-access-button login" type="button">👤 Giriş Yap</button>
      <button class="fl-access-button trial" type="button">🎁 1 Gün Dene</button>
    `;

    actions.querySelector(".login").addEventListener("click", () => {
      ensureNote().classList.add("open");
      goToMembership();
    });
    actions.querySelector(".trial").addEventListener("click", () => {
      ensureNote().classList.add("open");
      goToMembership();
    });

    header.appendChild(actions);
  };

  const run = () => {
    injectStyle();
    addIcons();
    ensureActions();
  };

  window.addEventListener("load", run);
  setTimeout(run, 600);
  setTimeout(run, 1600);
})();
