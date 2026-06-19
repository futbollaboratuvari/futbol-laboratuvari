(() => {
  const DATA_URL = "./data/spor_toto_bulteni.json";
  const STYLE_ID = "spor-toto-dashboard-style";

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const pick = (value, fallback = "—") => {
    const text = String(value ?? "").trim();
    return text && text !== "null" && text !== "undefined" ? text : fallback;
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

  const oddText = (value) => pick(value, "—");

  const probabilityText = (value) => {
    const text = pick(value, "—");
    if (text === "—") return "—";
    return String(text).includes("%") ? text : `%${text}`;
  };

  const confidenceNumber = (item) => {
    const raw = item.confidence || item.lgs || item.score || item.guven || item.confidence_score;
    const number = Number(String(raw ?? "").replace("%", ""));
    return Number.isFinite(number) ? number : 0;
  };

  const decisionClass = (decision = "") => {
    const text = String(decision).toLowerCase();
    if (text.includes("1")) return "pick-one";
    if (text.includes("x")) return "pick-draw";
    if (text.includes("2")) return "pick-two";
    return "pick-wait";
  };

  const countDecisions = (matches) => {
    const counts = { one: 0, draw: 0, two: 0, waiting: 0 };
    matches.forEach((item) => {
      const decision = String(item.decision || "").toUpperCase();
      if (decision === "1") counts.one += 1;
      else if (decision === "X") counts.draw += 1;
      else if (decision === "2") counts.two += 1;
      else counts.waiting += 1;
    });
    return counts;
  };

  const readJson = async () => {
    try {
      const response = await fetch(DATA_URL, { cache: "no-store" });
      if (!response.ok) throw new Error(String(response.status));
      const data = await response.json();
      return data && typeof data === "object" ? data : { matches: [] };
    } catch {
      return { matches: [] };
    }
  };

  const injectStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      #spor-toto-performansi {
        position: relative;
      }

      .spor-toto-v3-shell {
        display: grid;
        gap: 16px;
        margin-top: 18px;
      }

      .spor-v3-hero {
        display: grid;
        grid-template-columns: minmax(0, 1.1fr) minmax(300px, .9fr);
        gap: 16px;
        padding: 18px;
        border: 1px solid rgba(255, 191, 46, .24);
        border-radius: 24px;
        background:
          radial-gradient(circle at 14% 0%, rgba(57,255,136,.12), transparent 30%),
          radial-gradient(circle at 86% 12%, rgba(255,191,46,.14), transparent 30%),
          linear-gradient(180deg, rgba(5,15,33,.96), rgba(3,8,23,.98));
        box-shadow: 0 26px 72px rgba(0,0,0,.34), inset 0 1px 0 rgba(255,255,255,.05);
      }

      .spor-v3-title-block {
        display: grid;
        gap: 10px;
        align-content: center;
      }

      .spor-v3-kicker {
        display: inline-flex;
        width: max-content;
        gap: 8px;
        align-items: center;
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid rgba(57,255,136,.32);
        background: rgba(57,255,136,.10);
        color: #c8ffdd;
        font-size: 12px;
        font-weight: 950;
        letter-spacing: .07em;
        text-transform: uppercase;
      }

      .spor-v3-title-block h3 {
        margin: 0;
        color: #fff7d6;
        font-size: clamp(26px, 3vw, 44px);
        line-height: 1.04;
      }

      .spor-v3-title-block p {
        margin: 0;
        max-width: 760px;
        color: #aebbd0;
        font-size: 14px;
        line-height: 1.55;
      }

      .spor-v3-toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }

      .spor-v3-filter,
      .spor-v3-updated {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        min-height: 34px;
        padding: 0 11px;
        border: 1px solid rgba(255,255,255,.10);
        border-radius: 999px;
        background: rgba(255,255,255,.045);
        color: #f8fbff;
        font-size: 12px;
        font-weight: 850;
      }

      .spor-v3-updated {
        border-color: rgba(255,191,46,.26);
        color: #ffe08a;
      }

      .spor-v3-side-mini {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }

      .spor-v3-mini-card {
        display: grid;
        gap: 6px;
        padding: 14px;
        border: 1px solid rgba(255,255,255,.09);
        border-radius: 18px;
        background: rgba(255,255,255,.045);
      }

      .spor-v3-mini-card span {
        color: #9aecff;
        font-size: 11px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: .05em;
      }

      .spor-v3-mini-card strong {
        color: #fff7d6;
        font-size: 22px;
        font-weight: 1000;
      }

      .spor-v3-layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 330px;
        gap: 16px;
        align-items: start;
      }

      .spor-v3-board,
      .spor-v3-sidebar-card {
        border: 1px solid rgba(255, 191, 46, .22);
        border-radius: 22px;
        background: linear-gradient(180deg, rgba(5,15,33,.94), rgba(3,8,23,.98));
        box-shadow: 0 22px 60px rgba(0,0,0,.30), inset 0 1px 0 rgba(255,255,255,.045);
        overflow: hidden;
      }

      .spor-v3-board-head {
        display: grid;
        grid-template-columns: 52px 110px minmax(230px, 1fr) 92px 70px 70px 70px 95px 90px;
        gap: 0;
        background: linear-gradient(90deg, rgba(255,191,46,.22), rgba(57,255,136,.10), rgba(3,8,23,.92));
        color: #c8ffdd;
        font-size: 11px;
        font-weight: 950;
        letter-spacing: .05em;
        text-transform: uppercase;
      }

      .spor-v3-board-row {
        display: grid;
        grid-template-columns: 52px 110px minmax(230px, 1fr) 92px 70px 70px 70px 95px 90px;
        min-height: 54px;
        background: rgba(255,255,255,.025);
      }

      .spor-v3-board-row:nth-child(odd) {
        background: rgba(255,191,46,.026);
      }

      .spor-v3-board-head span,
      .spor-v3-board-row > div {
        display: flex;
        align-items: center;
        min-width: 0;
        padding: 10px;
        border-right: 1px solid rgba(255,255,255,.075);
        border-bottom: 1px solid rgba(255,255,255,.075);
      }

      .spor-v3-board-head span:last-child,
      .spor-v3-board-row > div:last-child {
        border-right: 0;
      }

      .spor-v3-no {
        justify-content: center;
        color: #39ff88;
        font-weight: 1000;
      }

      .spor-v3-time {
        display: grid!important;
        gap: 2px;
        color: #aebbd0;
        font-size: 11px;
      }

      .spor-v3-time b {
        color: #ffe08a;
        font-size: 13px;
      }

      .spor-v3-teams {
        display: grid!important;
        gap: 3px;
      }

      .spor-v3-teams b {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #f8fbff;
        font-size: 13px;
      }

      .spor-v3-teams small {
        color: #74839a;
        font-size: 11px;
      }

      .spor-v3-form {
        justify-content: center;
        gap: 4px;
      }

      .form-dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: rgba(255,255,255,.16);
      }
      .form-dot.win { background: #39ff88; box-shadow: 0 0 12px rgba(57,255,136,.35); }
      .form-dot.draw { background: #ffbf2e; box-shadow: 0 0 12px rgba(255,191,46,.25); }
      .form-dot.loss { background: #ff5470; box-shadow: 0 0 12px rgba(255,84,112,.24); }

      .spor-v3-pick {
        justify-content: center;
      }

      .spor-v3-pick-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 44px;
        min-height: 32px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,.10);
        background: rgba(255,255,255,.045);
        color: #d7e4f5;
        font-size: 14px;
        font-weight: 1000;
      }

      .spor-v3-pick-btn.is-selected {
        border-color: rgba(57,255,136,.45);
        background: linear-gradient(135deg, rgba(57,255,136,.22), rgba(255,191,46,.12));
        color: #c8ffdd;
        box-shadow: 0 0 22px rgba(57,255,136,.14);
      }

      .spor-v3-confidence {
        justify-content: center;
      }

      .spor-v3-confidence b {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 52px;
        min-height: 30px;
        border-radius: 999px;
        border: 1px solid rgba(255,191,46,.28);
        background: rgba(255,191,46,.10);
        color: #ffe08a;
        font-size: 12px;
      }

      .spor-v3-stat-action {
        justify-content: center;
      }

      .spor-v3-stat-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        min-height: 32px;
        padding: 0 10px;
        border: 1px solid rgba(154,236,255,.24);
        border-radius: 999px;
        background: rgba(154,236,255,.08);
        color: #e9fcff;
        font-size: 11px;
        font-weight: 950;
        cursor: pointer;
      }

      .spor-v3-stat-btn:hover {
        border-color: rgba(57,255,136,.42);
        background: rgba(57,255,136,.10);
      }

      .spor-v3-sidebar {
        display: grid;
        gap: 12px;
        position: sticky;
        top: 112px;
      }

      .spor-v3-sidebar-card {
        padding: 15px;
      }

      .spor-v3-sidebar-card h4 {
        margin: 0 0 10px;
        color: #fff7d6;
        font-size: 15px;
      }

      .spor-v3-summary-grid {
        display: grid;
        gap: 9px;
      }

      .spor-v3-summary-line {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 9px 10px;
        border: 1px solid rgba(255,255,255,.075);
        border-radius: 13px;
        background: rgba(255,255,255,.035);
        color: #aebbd0;
        font-size: 12px;
      }

      .spor-v3-summary-line b {
        color: #ffe08a;
      }

      .spor-v3-cta {
        width: 100%;
        min-height: 42px;
        margin-top: 10px;
        border: 0;
        border-radius: 999px;
        background: linear-gradient(135deg, #ff7a18, #ffbf2e, #39ff88);
        color: #160b00;
        font-size: 12px;
        font-weight: 1000;
        letter-spacing: .05em;
        cursor: pointer;
      }

      .spor-v3-click-cards {
        display: grid;
        gap: 9px;
      }

      .spor-v3-info-card {
        display: grid;
        grid-template-columns: 34px 1fr auto;
        align-items: center;
        gap: 9px;
        width: 100%;
        min-height: 54px;
        padding: 8px;
        border: 1px solid rgba(255,255,255,.085);
        border-radius: 15px;
        background: rgba(255,255,255,.04);
        color: #f8fbff;
        text-align: left;
        cursor: pointer;
      }

      .spor-v3-info-card:hover {
        border-color: rgba(57,255,136,.34);
        background: rgba(57,255,136,.08);
      }

      .spor-v3-info-card i {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 34px;
        border-radius: 12px;
        background: rgba(255,191,46,.12);
        color: #ffe08a;
        font-style: normal;
      }

      .spor-v3-info-card b {
        display: block;
        color: #fff7d6;
        font-size: 12px;
      }

      .spor-v3-info-card span {
        display: block;
        margin-top: 2px;
        color: #8fa0b8;
        font-size: 11px;
      }

      .spor-v3-info-card em {
        color: #39ff88;
        font-style: normal;
      }

      .spor-v3-note {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        padding: 13px 15px;
        border: 1px solid rgba(57,255,136,.18);
        border-radius: 18px;
        background: rgba(57,255,136,.065);
        color: #aebbd0;
        font-size: 12px;
        line-height: 1.5;
      }

      .spor-v3-drawer-backdrop {
        position: fixed;
        inset: 0;
        z-index: 190;
        display: none;
        background: rgba(0,0,0,.58);
        backdrop-filter: blur(5px);
      }

      .spor-v3-drawer-backdrop.open {
        display: block;
      }

      .spor-v3-drawer {
        position: fixed;
        right: 16px;
        top: 90px;
        bottom: 16px;
        z-index: 191;
        display: none;
        width: min(520px, calc(100vw - 32px));
        overflow: auto;
        border: 1px solid rgba(255,191,46,.30);
        border-radius: 24px;
        background:
          radial-gradient(circle at 20% 0%, rgba(57,255,136,.12), transparent 32%),
          linear-gradient(180deg, rgba(5,15,33,.98), rgba(3,8,23,.99));
        box-shadow: 0 30px 90px rgba(0,0,0,.55);
      }

      .spor-v3-drawer.open {
        display: block;
      }

      .spor-v3-drawer-head {
        position: sticky;
        top: 0;
        z-index: 2;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        padding: 16px;
        border-bottom: 1px solid rgba(255,255,255,.08);
        background: rgba(3,8,23,.94);
      }

      .spor-v3-drawer-head h3 {
        margin: 0;
        color: #fff7d6;
        font-size: 18px;
      }

      .spor-v3-drawer-head p {
        margin: 4px 0 0;
        color: #aebbd0;
        font-size: 12px;
      }

      .spor-v3-drawer-close {
        flex: 0 0 auto;
        width: 34px;
        height: 34px;
        border: 1px solid rgba(255,255,255,.10);
        border-radius: 999px;
        background: rgba(255,255,255,.05);
        color: #f8fbff;
        cursor: pointer;
      }

      .spor-v3-drawer-body {
        display: grid;
        gap: 12px;
        padding: 16px;
      }

      .spor-v3-detail-card {
        display: grid;
        gap: 10px;
        padding: 14px;
        border: 1px solid rgba(255,255,255,.085);
        border-radius: 17px;
        background: rgba(255,255,255,.04);
      }

      .spor-v3-detail-card h4 {
        margin: 0;
        color: #c8ffdd;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: .05em;
      }

      .spor-v3-detail-card ul {
        display: grid;
        gap: 8px;
        margin: 0;
        padding: 0;
        list-style: none;
      }

      .spor-v3-detail-card li {
        display: flex;
        justify-content: space-between;
        gap: 10px;
        padding: 8px 9px;
        border-radius: 11px;
        background: rgba(3,8,23,.56);
        color: #aebbd0;
        font-size: 12px;
      }

      .spor-v3-detail-card li b {
        color: #ffe08a;
      }

      @media (max-width: 1180px) {
        .spor-v3-layout,
        .spor-v3-hero {
          grid-template-columns: 1fr;
        }
        .spor-v3-sidebar {
          position: static;
        }
      }

      @media (max-width: 860px) {
        .spor-v3-board {
          overflow-x: auto;
        }
        .spor-v3-board-inner {
          min-width: 1040px;
        }
        .spor-v3-side-mini {
          grid-template-columns: 1fr 1fr;
        }
      }

      @media (max-width: 560px) {
        .spor-v3-side-mini {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  };

  const formDots = (seed = 1) => {
    const patterns = [
      ["win", "win", "draw", "loss", "win"],
      ["draw", "win", "draw", "win", "loss"],
      ["loss", "draw", "win", "draw", "win"],
      ["win", "loss", "win", "win", "draw"],
    ];
    const pattern = patterns[seed % patterns.length];
    return pattern.map((item) => `<span class="form-dot ${item}"></span>`).join("");
  };

  const detailData = (match, type) => {
    const home = pick(match.home, "Ev sahibi");
    const away = pick(match.away, "Deplasman");
    const common = {
      form: {
        title: "Form Karşılaştırması",
        rows: [
          [home, "Son 5 maç formu canlı veriyle güncellenecek"],
          [away, "Son 5 maç formu canlı veriyle güncellenecek"],
          ["Laboratuvar Yorumu", "Form farkı geldiğinde 1-X-2 kararına yansıtılacak"],
        ],
      },
      h2h: {
        title: "İkili Rekabet",
        rows: [
          ["Karşılaşma", `${home} - ${away}`],
          ["Son maçlar", "İkili rekabet verisi canlı kaynakla doldurulacak"],
          ["Okuma", "Beraberlik ve sürpriz sinyali burada işaretlenecek"],
        ],
      },
      goals: {
        title: "Gol Ortalaması",
        rows: [
          [home, "Atılan / yenilen gol ortalaması bekleniyor"],
          [away, "Atılan / yenilen gol ortalaması bekleniyor"],
          ["Gol Profili", "Alt/Üst ve KG karakteri burada özetlenecek"],
        ],
      },
      odds: {
        title: "Oran Hareketi",
        rows: [
          ["1", oddText(match.oneOdd || match.one)],
          ["X", oddText(match.drawOdd || match.draw)],
          ["2", oddText(match.twoOdd || match.two)],
          ["Oran Yorumu", "Açılış/güncel oran hareketi gelince burada gösterilecek"],
        ],
      },
      squad: {
        title: "Eksik / Kadro Durumu",
        rows: [
          [home, "Sakat/cezalı bilgisi canlı veriyle dolacak"],
          [away, "Sakat/cezalı bilgisi canlı veriyle dolacak"],
          ["Rotasyon", "Muhtemel 11 ve yorgunluk sinyali burada izlenecek"],
        ],
      },
    };
    return common[type] || common.form;
  };

  const openDrawer = (match, type) => {
    let backdrop = document.querySelector(".spor-v3-drawer-backdrop");
    let drawer = document.querySelector(".spor-v3-drawer");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "spor-v3-drawer-backdrop";
      document.body.appendChild(backdrop);
    }
    if (!drawer) {
      drawer = document.createElement("aside");
      drawer.className = "spor-v3-drawer";
      document.body.appendChild(drawer);
    }

    const data = detailData(match, type);
    const home = pick(match.home, "Ev sahibi");
    const away = pick(match.away, "Deplasman");

    drawer.innerHTML = `
      <div class="spor-v3-drawer-head">
        <div>
          <h3>${escapeHtml(data.title)}</h3>
          <p>${escapeHtml(home)} - ${escapeHtml(away)}</p>
        </div>
        <button class="spor-v3-drawer-close" type="button" aria-label="Kapat">×</button>
      </div>
      <div class="spor-v3-drawer-body">
        <section class="spor-v3-detail-card">
          <h4>Maç Bilgisi</h4>
          <ul>
            <li><span>Lig</span><b>${escapeHtml(pick(match.league))}</b></li>
            <li><span>Saat</span><b>${escapeHtml(pick(match.time))}</b></li>
            <li><span>Durum</span><b>${escapeHtml(statusLabel(match.status))}</b></li>
            <li><span>Laboratuvar Kararı</span><b>${escapeHtml(pick(match.decision, "Bekleniyor"))}</b></li>
          </ul>
        </section>
        <section class="spor-v3-detail-card">
          <h4>${escapeHtml(data.title)}</h4>
          <ul>
            ${data.rows.map(([label, value]) => `<li><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></li>`).join("")}
          </ul>
        </section>
        <section class="spor-v3-detail-card">
          <h4>1 / X / 2 Seçenekleri</h4>
          <ul>
            <li><span>1</span><b>${escapeHtml(probabilityText(match.one))} · ${escapeHtml(oddText(match.oneOdd))}</b></li>
            <li><span>X</span><b>${escapeHtml(probabilityText(match.draw))} · ${escapeHtml(oddText(match.drawOdd))}</b></li>
            <li><span>2</span><b>${escapeHtml(probabilityText(match.two))} · ${escapeHtml(oddText(match.twoOdd))}</b></li>
          </ul>
        </section>
      </div>
    `;

    const close = () => {
      backdrop.classList.remove("open");
      drawer.classList.remove("open");
    };
    drawer.querySelector(".spor-v3-drawer-close")?.addEventListener("click", close);
    backdrop.addEventListener("click", close, { once: true });
    backdrop.classList.add("open");
    drawer.classList.add("open");
  };

  const rowHtml = (item, index) => {
    const decision = pick(item.decision, "Bekleniyor").toUpperCase();
    const selected = (value) => decision === value ? "is-selected" : "";
    return `
      <div class="spor-v3-board-row" data-spor-index="${index}">
        <div class="spor-v3-no">${escapeHtml(item.no || index + 1)}</div>
        <div class="spor-v3-time"><b>${escapeHtml(pick(item.time, "--:--"))}</b><span>${escapeHtml(pick(item.date, "Tarih"))}</span></div>
        <div class="spor-v3-teams"><b>${escapeHtml(item.match || `${item.home || "Ev sahibi"} - ${item.away || "Deplasman"}`)}</b><small>${escapeHtml(pick(item.league, "Lig bilgisi"))}</small></div>
        <div class="spor-v3-form">${formDots(index)}</div>
        <div class="spor-v3-pick"><span class="spor-v3-pick-btn ${selected("1")}">1</span></div>
        <div class="spor-v3-pick"><span class="spor-v3-pick-btn ${selected("X")}">X</span></div>
        <div class="spor-v3-pick"><span class="spor-v3-pick-btn ${selected("2")}">2</span></div>
        <div class="spor-v3-confidence"><b>${confidenceNumber(item) || "—"}/100</b></div>
        <div class="spor-v3-stat-action"><button class="spor-v3-stat-btn" type="button" data-spor-detail="form" data-spor-index="${index}">📊 İncele</button></div>
      </div>
    `;
  };

  const render = (payload) => {
    const section = document.querySelector("#spor-toto-performansi");
    const grid = document.querySelector("#spor-toto-grid");
    const summary = document.querySelector("#spor-toto-summary");
    if (!section || !grid) return;

    const matches = Array.isArray(payload?.matches) ? payload.matches : [];
    const counts = countDecisions(matches);
    const avgConfidence = Math.round(matches.reduce((sum, item) => sum + confidenceNumber(item), 0) / Math.max(matches.length, 1));

    const heading = section.querySelector(".section-heading");
    if (heading) {
      const eyebrow = heading.querySelector(".eyebrow");
      const title = heading.querySelector("h2");
      const text = heading.querySelector("p:last-child");
      if (eyebrow) eyebrow.textContent = "Spor Toto Modülü";
      if (title) title.textContent = "1-X-2 kupon karar ekranı";
      if (text) text.textContent = "Haftalık bültende maçlar, 1-X-2 seçimleri, güven seviyesi ve tıklanabilir istatistik kartları birlikte gösterilir.";
    }

    if (summary) summary.innerHTML = "";

    grid.innerHTML = `
      <div class="spor-toto-v3-shell">
        <section class="spor-v3-hero">
          <div class="spor-v3-title-block">
            <span class="spor-v3-kicker">🏆 Spor Toto Merkezi</span>
            <h3>Haftalık kupon tablosu</h3>
            <p>1-X-2 seçimleri, güven seviyesi, form sinyali ve detaylı istatistik kartları tek ekranda toplanır. Kartlara tıklayınca iki takımın karşılaşma bilgileri ve analiz notları açılır.</p>
            <div class="spor-v3-toolbar">
              <span class="spor-v3-filter">📅 Hafta: ${escapeHtml(payload.week_label || "Güncel")}</span>
              <span class="spor-v3-filter">⚽ Lig: Tüm Ligler</span>
              <span class="spor-v3-filter">🎟 Kupon Tipi: 1-X-2</span>
              <span class="spor-v3-updated">🔄 ${escapeHtml(payload.source || "Sistem verisi")}</span>
            </div>
          </div>
          <div class="spor-v3-side-mini">
            <div class="spor-v3-mini-card"><span>Toplam Maç</span><strong>${matches.length}</strong></div>
            <div class="spor-v3-mini-card"><span>Banko / 1</span><strong>${counts.one}</strong></div>
            <div class="spor-v3-mini-card"><span>Beraberlik</span><strong>${counts.draw}</strong></div>
            <div class="spor-v3-mini-card"><span>Güven</span><strong>${avgConfidence || "—"}</strong></div>
          </div>
        </section>

        <section class="spor-v3-layout">
          <div class="spor-v3-board">
            <div class="spor-v3-board-inner">
              <div class="spor-v3-board-head">
                <span>No</span><span>Tarih / Saat</span><span>Maç</span><span>Form</span><span>1</span><span>X</span><span>2</span><span>Güven</span><span>İstatistik</span>
              </div>
              ${matches.length ? matches.map(rowHtml).join("") : `<div class="spor-v3-note">Haftalık Spor Toto bülteni bekleniyor.</div>`}
            </div>
          </div>

          <aside class="spor-v3-sidebar">
            <div class="spor-v3-sidebar-card">
              <h4>Kupon Özeti</h4>
              <div class="spor-v3-summary-grid">
                <div class="spor-v3-summary-line"><span>Toplam Kolon</span><b>${matches.length || 0}</b></div>
                <div class="spor-v3-summary-line"><span>Risk Seviyesi</span><b>${counts.draw + counts.waiting > 6 ? "Yüksek" : "Orta"}</b></div>
                <div class="spor-v3-summary-line"><span>Sistem Güveni</span><b>${avgConfidence || "—"}/100</b></div>
                <div class="spor-v3-summary-line"><span>Bekleyen Karar</span><b>${counts.waiting}</b></div>
              </div>
              <button class="spor-v3-cta" type="button">Kuponu İncele</button>
            </div>

            <div class="spor-v3-sidebar-card">
              <h4>Tıklanabilir İstatistik Kartları</h4>
              <div class="spor-v3-click-cards">
                <button class="spor-v3-info-card" type="button" data-spor-global-detail="form"><i>📊</i><span><b>Form Karşılaştırması</b><span>Son 5 maç ve momentum</span></span><em>›</em></button>
                <button class="spor-v3-info-card" type="button" data-spor-global-detail="h2h"><i>⚔️</i><span><b>İkili Rekabet</b><span>İki takım arası geçmiş maçlar</span></span><em>›</em></button>
                <button class="spor-v3-info-card" type="button" data-spor-global-detail="goals"><i>⚽</i><span><b>Gol Ortalaması</b><span>Atılan ve yenilen gol profili</span></span><em>›</em></button>
                <button class="spor-v3-info-card" type="button" data-spor-global-detail="odds"><i>📈</i><span><b>Oran Hareketi</b><span>1-X-2 oran davranışı</span></span><em>›</em></button>
                <button class="spor-v3-info-card" type="button" data-spor-global-detail="squad"><i>🩺</i><span><b>Eksik / Kadro</b><span>Sakat, cezalı ve rotasyon</span></span><em>›</em></button>
              </div>
            </div>
          </aside>
        </section>

        <div class="spor-v3-note"><b>Not:</b> Spor Toto alanı 1-X-2 odağında çalışır. Tıklanabilir istatistik kartları form, ikili rekabet, gol profili, oran hareketi ve kadro durumunu maç bazlı açıklamak için hazırlanmıştır.</div>
      </div>
    `;

    grid.querySelectorAll("[data-spor-detail]").forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.sporIndex || 0);
        openDrawer(matches[index] || matches[0] || {}, button.dataset.sporDetail || "form");
      });
    });

    grid.querySelectorAll("[data-spor-global-detail]").forEach((button) => {
      button.addEventListener("click", () => {
        openDrawer(matches[0] || {}, button.dataset.sporGlobalDetail || "form");
      });
    });
  };

  const run = async () => {
    injectStyle();
    const payload = await readJson();
    render(payload);
  };

  window.addEventListener("load", () => {
    setTimeout(run, 1200);
    setTimeout(run, 2600);
  });
})();
