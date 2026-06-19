(() => {
  const DATA_URL = "./data/fixtures.json";
  const STYLE_ID = "fixtures-summary-panel-style";

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const getTurkeyDateKey = () =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

  const hasOdd = (value) => {
    const text = String(value ?? "").trim();
    return Boolean(text && text !== "-" && text !== "—");
  };

  const oddsCount = (match) => [
    match.one,
    match.oneOdd,
    match.ms1,
    match.odd1,
    match.draw,
    match.drawOdd,
    match.x,
    match.msx,
    match.oddX,
    match.two,
    match.twoOdd,
    match.ms2,
    match.odd2,
    match.under25,
    match.alt25,
    match.under,
    match.alt,
    match.over25,
    match.ust25,
    match.over,
    match.ust,
    match.bttsYes,
    match.kgVar,
    match.varOdd,
    match.var,
    match.bttsNo,
    match.kgYok,
    match.yokOdd,
    match.yok,
  ].filter(hasOdd).length;

  const statusText = (status) => {
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
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #yaklasan-maclar .fixtures-panel {
        display: grid;
        gap: 14px;
      }

      #fixtures-list.fixtures-summary-mode {
        display: grid;
        grid-template-columns: minmax(0, 1.3fr) minmax(280px, .7fr);
        gap: 16px;
      }

      .fixtures-summary-card,
      .fixtures-guide-card {
        border: 1px solid rgba(255, 191, 46, .24);
        border-radius: 20px;
        background:
          radial-gradient(circle at 12% 0%, rgba(57,255,136,.10), transparent 30%),
          linear-gradient(180deg, rgba(5,15,33,.92), rgba(3,8,23,.98));
        box-shadow: 0 20px 56px rgba(0,0,0,.30), inset 0 1px 0 rgba(255,255,255,.045);
        padding: 16px;
      }

      .fixtures-summary-card {
        display: grid;
        gap: 14px;
      }

      .fixtures-summary-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 14px;
      }

      .fixtures-summary-top h3 {
        margin: 0;
        color: #fff7d6;
        font-size: clamp(20px, 2vw, 28px);
        line-height: 1.12;
      }

      .fixtures-summary-top p {
        margin: 6px 0 0;
        color: #aebbd0;
        font-size: 13px;
        line-height: 1.5;
      }

      .fixtures-summary-badge {
        flex: 0 0 auto;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 11px;
        border: 1px solid rgba(57,255,136,.32);
        border-radius: 999px;
        background: rgba(57,255,136,.10);
        color: #c8ffdd;
        font-size: 12px;
        font-weight: 950;
        white-space: nowrap;
      }

      .fixtures-summary-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
      }

      .fixtures-summary-metric {
        display: grid;
        gap: 5px;
        min-height: 78px;
        padding: 12px;
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 16px;
        background: rgba(255,255,255,.04);
      }

      .fixtures-summary-metric span {
        color: #9aecff;
        font-size: 11px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: .05em;
      }

      .fixtures-summary-metric strong {
        color: #f8fbff;
        font-size: 20px;
        font-weight: 1000;
      }

      .fixtures-summary-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .fixtures-summary-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        min-height: 40px;
        padding: 0 14px;
        border-radius: 999px;
        border: 1px solid rgba(255, 191, 46, .36);
        background: linear-gradient(135deg, rgba(255,191,46,.18), rgba(57,255,136,.10));
        color: #fff7d6;
        font-size: 12px;
        font-weight: 950;
        letter-spacing: .04em;
        cursor: pointer;
      }

      .fixtures-summary-button.primary {
        border-color: rgba(57,255,136,.44);
        color: #c8ffdd;
      }

      .fixtures-guide-card {
        display: grid;
        gap: 10px;
        align-content: start;
      }

      .fixtures-guide-card h3 {
        margin: 0;
        color: #ffe08a;
        font-size: 16px;
      }

      .fixtures-guide-card p {
        margin: 0;
        color: #aebbd0;
        font-size: 13px;
        line-height: 1.5;
      }

      .fixtures-guide-list {
        display: grid;
        gap: 8px;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .fixtures-guide-list li {
        display: flex;
        gap: 8px;
        align-items: flex-start;
        color: #d7e4f5;
        font-size: 12px;
      }

      @media (max-width: 960px) {
        #fixtures-list.fixtures-summary-mode {
          grid-template-columns: 1fr;
        }
        .fixtures-summary-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }

      @media (max-width: 560px) {
        .fixtures-summary-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  };

  const loadJson = async () => {
    try {
      const response = await fetch(DATA_URL, { cache: "no-store" });
      if (!response.ok) throw new Error(String(response.status));
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  };

  const summarize = (matches) => {
    const today = getTurkeyDateKey();
    const todays = matches.filter((match) => match.date === today);
    const scheduled = todays.filter((match) => !["finished", "cancelled", "postponed"].includes(String(match.status || "scheduled"))).length;
    const live = todays.filter((match) => String(match.status || "").toLowerCase() === "live").length;
    const finished = todays.filter((match) => String(match.status || "").toLowerCase() === "finished").length;
    const withOdds = todays.filter((match) => oddsCount(match) > 0).length;
    const first = [...todays].sort((a, b) => String(a.time || "99:99").localeCompare(String(b.time || "99:99")))[0];
    return {
      today,
      total: todays.length,
      scheduled,
      live,
      finished,
      withOdds,
      firstTime: first?.time || "--:--",
      firstMatch: first ? `${first.home || "Ev sahibi"} - ${first.away || "Deplasman"}` : "Maç bekleniyor",
      status: todays.length ? "Sistem verisi" : "Veri bekleniyor",
    };
  };

  const render = (summary) => {
    const section = document.querySelector("#yaklasan-maclar");
    const list = document.querySelector("#fixtures-list");
    if (!section || !list) return;

    const heading = section.querySelector(".section-heading");
    if (heading) {
      const eyebrow = heading.querySelector(".eyebrow");
      const title = heading.querySelector("h2");
      const paragraph = heading.querySelector("p:last-child");
      if (eyebrow) eyebrow.textContent = "Bugünün Maç Bülteni";
      if (title) title.textContent = "Maç bülteni özeti";
      if (paragraph) paragraph.textContent = "Asıl maç listesi, oran tablosu ve detaylı oranlar aşağıdaki Günlük Maç Bülteni alanında gösterilir.";
    }

    const statusBoxes = section.querySelector(".robot-live-status");
    if (statusBoxes) {
      const boxes = statusBoxes.querySelectorAll("strong");
      if (boxes[0]) boxes[0].textContent = String(summary.total);
      if (boxes[1]) boxes[1].textContent = summary.withOdds ? `${summary.withOdds} maçta oran` : "Oran bekleniyor";
      if (boxes[2]) boxes[2].textContent = summary.firstTime;
      if (boxes[3]) boxes[3].textContent = summary.status;
      const labels = statusBoxes.querySelectorAll("span");
      if (labels[1]) labels[1].firstChild.textContent = "Oran Durumu: ";
      if (labels[2]) labels[2].firstChild.textContent = "İlk Maç: ";
    }

    list.classList.add("fixtures-summary-mode");
    list.innerHTML = `
      <article class="fixtures-summary-card">
        <div class="fixtures-summary-top">
          <div>
            <h3>Bugünün maç akışı hazır</h3>
            <p>Bu alan artık tekrar maç kartları göstermez. Maçların tam listesi, ana oranlar ve detaylı oran açılımı Günlük Maç Bülteni tablosunda tutulur.</p>
          </div>
          <span class="fixtures-summary-badge">⚽ ${escapeHtml(summary.total)} maç</span>
        </div>
        <div class="fixtures-summary-grid">
          <div class="fixtures-summary-metric"><span>Bugün</span><strong>${escapeHtml(summary.total)}</strong></div>
          <div class="fixtures-summary-metric"><span>Oynanacak</span><strong>${escapeHtml(summary.scheduled)}</strong></div>
          <div class="fixtures-summary-metric"><span>Oranlı Maç</span><strong>${escapeHtml(summary.withOdds)}</strong></div>
          <div class="fixtures-summary-metric"><span>İlk Maç</span><strong>${escapeHtml(summary.firstTime)}</strong></div>
        </div>
        <div class="fixtures-summary-actions">
          <button class="fixtures-summary-button primary" type="button" data-go-daily-bulletin>📊 Maç Bültenine Git</button>
          <button class="fixtures-summary-button" type="button" data-go-coupons>🎟 Kupon Merkezine Git</button>
        </div>
      </article>
      <aside class="fixtures-guide-card">
        <h3>Bu bölümün görevi değişti</h3>
        <p>Tekrar eden basit maç kartları kaldırıldı. Karışıklık olmaması için maç listesi tek merkezde gösteriliyor.</p>
        <ul class="fixtures-guide-list">
          <li><span>✓</span><span>Günlük Maç Bülteni: tam maç listesi ve oran tablosu</span></li>
          <li><span>✓</span><span>Detay sütunu: ikonlu açılır oran paneli</span></li>
          <li><span>✓</span><span>Kupon Merkezi: analiz ve kupon üretimi</span></li>
        </ul>
      </aside>
    `;

    list.querySelector("[data-go-daily-bulletin]")?.addEventListener("click", () => {
      const target = document.querySelector("#daily-matches-widget") || document.querySelector("#yaklasan-maclar");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    list.querySelector("[data-go-coupons]")?.addEventListener("click", () => {
      document.querySelector("#robot-analizleri")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const run = async () => {
    injectStyle();
    const matches = await loadJson();
    render(summarize(matches));
  };

  window.addEventListener("load", () => {
    setTimeout(run, 900);
    setTimeout(run, 2200);
  });
})();
