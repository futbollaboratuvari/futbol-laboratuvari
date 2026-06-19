(() => {
  const FIXTURES_URL = "./data/fixtures.json";
  const ANALYSIS_URL = "./data/analiz_sonuclari.json";
  const STYLE_ID = "live-control-center-style";
  const PANEL_ID = "live-control-center";

  const todayKey = () => new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const readJson = async (url, fallback) => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      return res.ok ? await res.json() : fallback;
    } catch {
      return fallback;
    }
  };

  const injectStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .live-control-center {
        position: relative;
        z-index: 3;
        margin: 24px clamp(18px, 6vw, 90px) 0;
        padding: 16px;
        border: 1px solid rgba(154, 236, 255, .24);
        border-radius: 24px;
        background:
          radial-gradient(circle at 14% 0%, rgba(154,236,255,.13), transparent 34%),
          linear-gradient(180deg, rgba(8,23,48,.94), rgba(3,8,23,.97));
        box-shadow: 0 24px 70px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.05);
      }
      .live-control-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 14px;
      }
      .live-control-kicker {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 7px 10px;
        border: 1px solid rgba(57,255,136,.34);
        border-radius: 999px;
        background: rgba(57,255,136,.10);
        color: #c8ffdd;
        font-size: 11px;
        font-weight: 950;
        letter-spacing: .08em;
        text-transform: uppercase;
      }
      .live-control-title {
        margin: 8px 0 0;
        color: #e9fcff;
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(21px, 2.4vw, 31px);
        line-height: 1.1;
        text-shadow: 0 0 22px rgba(154,236,255,.18);
      }
      .live-control-note {
        margin: 7px 0 0;
        color: #aebbd0;
        font-size: 13px;
        line-height: 1.55;
      }
      .live-control-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
      }
      .live-control-card {
        display: grid;
        gap: 8px;
        min-height: 126px;
        padding: 14px;
        border: 1px solid rgba(255,255,255,.09);
        border-radius: 18px;
        background: rgba(255,255,255,.04);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.045);
      }
      .live-control-card strong {
        color: #f8fbff;
        font-size: 22px;
        font-weight: 950;
      }
      .live-control-card span {
        color: #aebbd0;
        font-size: 12px;
        line-height: 1.45;
      }
      .live-control-card b {
        display: inline-flex;
        width: max-content;
        padding: 5px 8px;
        border-radius: 999px;
        font-size: 10px;
        letter-spacing: .07em;
        text-transform: uppercase;
      }
      .live-ok { border-color: rgba(57,255,136,.24); }
      .live-ok b { color: #c8ffdd; background: rgba(57,255,136,.12); }
      .live-wait { border-color: rgba(255,185,46,.26); }
      .live-wait b { color: #ffe8a3; background: rgba(255,185,46,.13); }
      .live-info { border-color: rgba(154,236,255,.24); }
      .live-info b { color: #e9fcff; background: rgba(154,236,255,.12); }
      @media (max-width: 980px) { .live-control-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
      @media (max-width: 560px) { .live-control-center { margin: 18px 14px 0; padding: 14px; } .live-control-grid { grid-template-columns: 1fr; } .live-control-head { flex-direction: column; } }
    `;
    document.head.appendChild(style);
  };

  const ensurePanel = () => {
    let panel = document.getElementById(PANEL_ID);
    if (panel) return panel;
    panel = document.createElement("section");
    panel.id = PANEL_ID;
    panel.className = "live-control-center";
    panel.setAttribute("aria-label", "Canlı kontrol merkezi");
    const target = document.getElementById("platform") || document.querySelector("main");
    if (target && target.parentNode) target.parentNode.insertBefore(panel, target.nextSibling);
    else document.body.appendChild(panel);
    return panel;
  };

  const render = async () => {
    injectStyle();
    const panel = ensurePanel();
    const [fixtures, analysis] = await Promise.all([
      readJson(FIXTURES_URL, []),
      readJson(ANALYSIS_URL, {}),
    ]);

    const today = todayKey();
    const todaysMatches = Array.isArray(fixtures) ? fixtures.filter((item) => item.date === today) : [];
    const totalMatches = Array.isArray(fixtures) ? fixtures.length : 0;
    const active = Array.isArray(analysis.active_items) ? analysis.active_items.length : 0;
    const completed = Array.isArray(analysis.completed_items) ? analysis.completed_items.length : 0;
    const hasAnalysis = active + completed > 0;

    panel.innerHTML = `
      <div class="live-control-head">
        <div>
          <span class="live-control-kicker">📡 Canlı Kontrol Merkezi</span>
          <h2 class="live-control-title">Site akışı ve analiz durumu</h2>
          <p class="live-control-note">Maç listesi, analiz akışı, üyelik ve ödeme hazırlığı tek bakışta kontrol edilir.</p>
        </div>
      </div>
      <div class="live-control-grid">
        <article class="live-control-card ${todaysMatches.length ? "live-ok" : "live-wait"}">
          <b>${todaysMatches.length ? "Aktif" : "Bekliyor"}</b>
          <strong>${todaysMatches.length}</strong>
          <span>Bugünün maç listesi</span>
        </article>
        <article class="live-control-card ${totalMatches ? "live-ok" : "live-wait"}">
          <b>${totalMatches ? "Veri var" : "Hazırlanıyor"}</b>
          <strong>${totalMatches}</strong>
          <span>Toplam maç kaydı</span>
        </article>
        <article class="live-control-card ${hasAnalysis ? "live-ok" : "live-wait"}">
          <b>${hasAnalysis ? "Aktif" : "Hazırlanıyor"}</b>
          <strong>${active + completed}</strong>
          <span>Yayınlanabilir analiz / kupon</span>
        </article>
        <article class="live-control-card live-info">
          <b>Hazır</b>
          <strong>1 Gün</strong>
          <span>Ücretsiz deneme ve üyelik akışı</span>
        </article>
      </div>
    `;
  };

  window.addEventListener("load", () => {
    render();
    setInterval(render, 5 * 60 * 1000);
  });
})();
