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

  const pickOdd = (match, keys) => {
    for (const key of keys) {
      const value = match[key];
      if (value !== undefined && value !== null && value !== "") return value;
    }
    return "-";
  };

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

  const groupByLeague = (matches) => {
    const groups = new Map();
    matches.forEach((match) => {
      const league = match.league || "Diğer Maçlar";
      if (!groups.has(league)) groups.set(league, []);
      groups.get(league).push(match);
    });
    return [...groups.entries()].map(([league, items]) => ({
      league,
      items: items.sort((a, b) => String(a.time || "99:99").localeCompare(String(b.time || "99:99"))),
    }));
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
        margin-bottom: 16px;
      }
      .daily-widget-title {
        margin: 0;
        color: #f7df9a;
        font-size: clamp(20px, 2.2vw, 30px);
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
      .daily-widget-list { display: grid; gap: 14px; }
      .daily-league-block {
        overflow: hidden;
        border: 1px solid rgba(216, 178, 87, 0.18);
        border-radius: 18px;
        background: rgba(3, 8, 23, 0.58);
      }
      .daily-league-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 14px;
        background: linear-gradient(90deg, rgba(216, 178, 87, 0.18), rgba(57, 255, 136, 0.08), rgba(3, 8, 23, 0.2));
        border-bottom: 1px solid rgba(216, 178, 87, 0.16);
      }
      .daily-league-name {
        color: #f7df9a;
        font-size: 13px;
        font-weight: 900;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .daily-league-count {
        color: #c8ffdd;
        font-size: 12px;
        font-weight: 800;
        white-space: nowrap;
      }
      .daily-match-table { display: grid; min-width: 980px; }
      .daily-match-row,
      .daily-match-header {
        display: grid;
        grid-template-columns: 70px minmax(220px, 1fr) repeat(7, 58px) 96px;
        gap: 8px;
        align-items: center;
        padding: 10px 14px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      }
      .daily-table-scroll { overflow-x: auto; }
      .daily-match-header {
        background: rgba(3, 8, 23, 0.72);
        color: #f7df9a;
        font-size: 11px;
        font-weight: 900;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
      .daily-match-row:last-child { border-bottom: 0; }
      .daily-match-time {
        color: #39ff88;
        font-size: 17px;
        font-weight: 950;
      }
      .daily-match-teams {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
        color: #f8fbff;
        font-size: 14px;
        font-weight: 850;
      }
      .daily-match-teams span {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .daily-match-vs {
        flex: 0 0 auto;
        color: #aebbd0;
        font-size: 12px;
        font-weight: 800;
      }
      .daily-odd {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 30px;
        padding: 6px 7px;
        border: 1px solid rgba(216, 178, 87, 0.18);
        border-radius: 10px;
        background: rgba(255, 255, 255, 0.045);
        color: #f8fbff;
        font-size: 12px;
        font-weight: 850;
      }
      .daily-widget-status {
        justify-self: end;
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
      @media (max-width: 720px) {
        .daily-widget-shell { margin: 16px 14px 0; padding: 14px; }
        .daily-widget-head { align-items: flex-start; flex-direction: column; }
        .daily-match-table { min-width: 900px; }
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
    widget.setAttribute("aria-label", "Günlük maç bülteni");
    widget.innerHTML = `
      <div class="daily-widget-head">
        <div>
          <h2 class="daily-widget-title">Günlük Maç Bülteni</h2>
          <p class="daily-widget-subtitle" data-daily-widget-date>Bugünün maçları yükleniyor.</p>
        </div>
        <span class="daily-widget-count" data-daily-widget-count>0 maç</span>
      </div>
      <div class="daily-widget-list" data-daily-widget-list>
        <div class="daily-widget-empty">Günlük maç bülteni hazırlanıyor.</div>
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

  const renderLeague = ({ league, items }) => `
    <article class="daily-league-block">
      <div class="daily-league-head">
        <span class="daily-league-name">${escapeHtml(league)}</span>
        <span class="daily-league-count">${items.length} maç</span>
      </div>
      <div class="daily-table-scroll">
        <div class="daily-match-table">
          <div class="daily-match-header">
            <span>Saat</span><span>Maç</span><span>1</span><span>X</span><span>2</span><span>Alt</span><span>Üst</span><span>Var</span><span>Yok</span><span>Durum</span>
          </div>
          ${items.map((match) => `
            <div class="daily-match-row">
              <div class="daily-match-time">${escapeHtml(match.time || "--:--")}</div>
              <div class="daily-match-teams">
                <span>${escapeHtml(match.home || "Ev sahibi")}</span>
                <b class="daily-match-vs">-</b>
                <span>${escapeHtml(match.away || "Deplasman")}</span>
              </div>
              <span class="daily-odd">${escapeHtml(pickOdd(match, ["one", "oneOdd", "ms1", "odd1"]))}</span>
              <span class="daily-odd">${escapeHtml(pickOdd(match, ["draw", "drawOdd", "x", "msx", "oddX"]))}</span>
              <span class="daily-odd">${escapeHtml(pickOdd(match, ["two", "twoOdd", "ms2", "odd2"]))}</span>
              <span class="daily-odd">${escapeHtml(pickOdd(match, ["under25", "alt25", "under", "alt"]))}</span>
              <span class="daily-odd">${escapeHtml(pickOdd(match, ["over25", "ust25", "over", "ust"]))}</span>
              <span class="daily-odd">${escapeHtml(pickOdd(match, ["bttsYes", "kgVar", "varOdd", "var"]))}</span>
              <span class="daily-odd">${escapeHtml(pickOdd(match, ["bttsNo", "kgYok", "yokOdd", "yok"]))}</span>
              <span class="daily-widget-status">${escapeHtml(statusLabel(match.status))}</span>
            </div>
          `).join("")}
        </div>
      </div>
    </article>
  `;

  const render = (matches) => {
    const widget = ensureWidget();
    const list = widget.querySelector("[data-daily-widget-list]");
    const count = widget.querySelector("[data-daily-widget-count]");
    const date = widget.querySelector("[data-daily-widget-date]");
    const today = todayKey();
    const todaysMatches = matches
      .filter((match) => match.date === today)
      .sort((a, b) => {
        const leagueCompare = String(a.league || "").localeCompare(String(b.league || ""), "tr");
        if (leagueCompare !== 0) return leagueCompare;
        return String(a.time || "99:99").localeCompare(String(b.time || "99:99"));
      });

    if (date) date.textContent = `${formatDate(today)} programı`;
    if (count) count.textContent = `${todaysMatches.length} maç`;

    if (!todaysMatches.length) {
      list.innerHTML = `<div class="daily-widget-empty">Günlük maç bülteni hazırlanıyor.</div>`;
      return;
    }

    list.innerHTML = groupByLeague(todaysMatches).map(renderLeague).join("");
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
