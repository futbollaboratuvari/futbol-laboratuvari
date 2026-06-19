(() => {
  const DATA_URL = "./data/fixtures.json";
  const WIDGET_ID = "daily-matches-widget";

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const todayKey = () =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

  const formatDate = (dateKey) => {
    if (!dateKey || !dateKey.includes("-")) return "Bugün";
    const [year, month, day] = dateKey.split("-");
    return `${day}.${month}.${year}`;
  };

  const statusLabel = (status) => {
    const labels = {
      scheduled: "Oynanacak",
      live: "Canlı",
      finished: "Tamamlandı",
      postponed: "Ertelendi",
      cancelled: "İptal",
    };
    return labels[status] || "Oynanacak";
  };

  const injectStyle = () => {
    if (document.querySelector("#daily-matches-widget-style")) return;
    const style = document.createElement("style");
    style.id = "daily-matches-widget-style";
    style.textContent = `
      .daily-widget-shell {
        position: relative;
        z-index: 3;
        margin: 22px clamp(18px, 6vw, 90px) 0;
        padding: 18px;
        border: 1px solid rgba(216, 178, 87, 0.22);
        border-radius: 22px;
        background:
          linear-gradient(135deg, rgba(57, 255, 136, 0.08), transparent 36%),
          linear-gradient(180deg, rgba(8, 23, 48, 0.95), rgba(3, 8, 23, 0.96));
        box-shadow: 0 24px 70px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.05);
      }
      .daily-widget-head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 14px;
      }
      .daily-widget-title {
        margin: 0;
        color: #f7df9a;
        font-size: clamp(20px, 2.2vw, 28px);
        line-height: 1.1;
      }
      .daily-widget-subtitle {
        margin: 6px 0 0;
        color: #aebbd0;
        font-size: 13px;
      }
      .daily-widget-count {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 9px 12px;
        border: 1px solid rgba(57, 255, 136, 0.3);
        border-radius: 999px;
        background: rgba(57, 255, 136, 0.1);
        color: #c8ffdd;
        font-size: 13px;
        font-weight: 800;
        white-space: nowrap;
      }
      .daily-widget-list {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
      }
      .daily-widget-card {
        display: grid;
        gap: 10px;
        padding: 14px;
        border: 1px solid rgba(216, 178, 87, 0.16);
        border-radius: 16px;
        background: rgba(3, 8, 23, 0.58);
      }
      .daily-widget-time {
        color: #39ff88;
        font-size: 24px;
        font-weight: 900;
        line-height: 1;
      }
      .daily-widget-league {
        color: #f7df9a;
        font-size: 11px;
        font-weight: 850;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .daily-widget-teams {
        display: grid;
        gap: 5px;
        color: #f8fbff;
        font-size: 14px;
        font-weight: 800;
      }
      .daily-widget-status {
        width: max-content;
        max-width: 100%;
        padding: 6px 9px;
        border-radius: 999px;
        background: rgba(216, 178, 87, 0.14);
        color: #f7df9a;
        font-size: 11px;
        font-weight: 800;
      }
      .daily-widget-empty {
        padding: 18px;
        border: 1px solid rgba(216, 178, 87, 0.16);
        border-radius: 16px;
        background: rgba(3, 8, 23, 0.58);
        color: #aebbd0;
      }
      @media (max-width: 980px) {
        .daily-widget-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 640px) {
        .daily-widget-shell { margin: 16px 14px 0; padding: 14px; }
        .daily-widget-head { align-items: flex-start; flex-direction: column; }
        .daily-widget-list { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  };

  const ensureWidget = () => {
    let widget = document.querySelector(`#${WIDGET_ID}`);
    if (widget) return widget;

    widget = document.createElement("section");
    widget.id = WIDGET_ID;
    widget.className = "daily-widget-shell";
    widget.setAttribute("aria-label", "Günlük maç listesi");
    widget.innerHTML = `
      <div class="daily-widget-head">
        <div>
          <h2 class="daily-widget-title">Günlük Maç Listesi</h2>
          <p class="daily-widget-subtitle" data-daily-widget-date>Bugünün maçları yükleniyor.</p>
        </div>
        <span class="daily-widget-count" data-daily-widget-count>0 maç</span>
      </div>
      <div class="daily-widget-list" data-daily-widget-list>
        <div class="daily-widget-empty">Günlük maç listesi hazırlanıyor.</div>
      </div>
    `;

    const target = document.querySelector("#yaklasan-maclar") || document.querySelector("main");
    if (target && target.parentNode) {
      target.parentNode.insertBefore(widget, target);
    } else {
      document.body.appendChild(widget);
    }
    return widget;
  };

  const render = (matches) => {
    const widget = ensureWidget();
    const list = widget.querySelector("[data-daily-widget-list]");
    const count = widget.querySelector("[data-daily-widget-count]");
    const date = widget.querySelector("[data-daily-widget-date]");
    const today = todayKey();
    const todaysMatches = matches
      .filter((match) => match.date === today)
      .sort((a, b) => String(a.time || "99:99").localeCompare(String(b.time || "99:99")))
      .slice(0, 12);

    if (date) date.textContent = `${formatDate(today)} programı`;
    if (count) count.textContent = `${todaysMatches.length} maç`;

    if (!todaysMatches.length) {
      list.innerHTML = `<div class="daily-widget-empty">Günlük maç listesi hazırlanıyor.</div>`;
      return;
    }

    list.innerHTML = todaysMatches.map((match) => `
      <article class="daily-widget-card">
        <div class="daily-widget-time">${escapeHtml(match.time || "--:--")}</div>
        <div class="daily-widget-league">${escapeHtml(match.league || "Lig bilgisi")}</div>
        <div class="daily-widget-teams">
          <span>${escapeHtml(match.home || "Ev sahibi")}</span>
          <span>${escapeHtml(match.away || "Deplasman")}</span>
        </div>
        <span class="daily-widget-status">${escapeHtml(statusLabel(match.status))}</span>
      </article>
    `).join("");
  };

  const load = async () => {
    injectStyle();
    ensureWidget();
    try {
      const response = await fetch(DATA_URL, { cache: "no-store" });
      if (!response.ok) throw new Error(String(response.status));
      const data = await response.json();
      render(Array.isArray(data) ? data : []);
    } catch (error) {
      render([]);
    }
  };

  window.addEventListener("load", () => {
    load();
    setInterval(load, 5 * 60 * 1000);
  });
})();
