(() => {
  const empty = (value) => {
    const text = String(value ?? "").trim();
    return !text || text === "-" || text === "—";
  };

  const showValue = (value) => empty(value) ? "Veri yok" : value;

  function addStyle() {
    if (document.getElementById("daily-toggle-style")) return;
    const s = document.createElement("style");
    s.id = "daily-toggle-style";
    s.textContent = `
      .daily-extra {
        display: none;
        grid-column: 1 / -1;
        padding: 14px;
        background:
          radial-gradient(circle at 14% 0%, rgba(57,255,136,.10), transparent 28%),
          linear-gradient(180deg, rgba(3,8,23,.90), rgba(3,8,23,.98));
        border-bottom: 1px solid rgba(255,255,255,.08);
        border-left: 1px solid rgba(57,255,136,.18);
        border-right: 1px solid rgba(57,255,136,.18);
      }
      .daily-extra.open { display:block; }
      .daily-extra-head {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        margin-bottom:12px;
      }
      .daily-extra-title {
        display:grid;
        gap:2px;
      }
      .daily-extra-title strong {
        color:#ffe08a;
        font-size:14px;
        font-weight:950;
        letter-spacing:.04em;
        text-transform:uppercase;
      }
      .daily-extra-title small {
        color:#aebbd0;
        font-size:12px;
      }
      .daily-data-badge {
        display:inline-flex;
        align-items:center;
        justify-content:center;
        padding:7px 10px;
        border-radius:999px;
        border:1px solid rgba(255,159,28,.28);
        background:rgba(255,159,28,.10);
        color:#ffe08a;
        font-size:11px;
        font-weight:900;
        white-space:nowrap;
      }
      .daily-extra-grid {
        display:grid;
        grid-template-columns:repeat(4,minmax(0,1fr));
        gap:10px;
      }
      .daily-market-group {
        display:grid;
        gap:8px;
        padding:11px;
        border:1px solid rgba(255,159,28,.18);
        border-radius:16px;
        background:rgba(255,255,255,.045);
        box-shadow:inset 0 1px 0 rgba(255,255,255,.04);
      }
      .daily-market-group h4 {
        margin:0;
        color:#c8ffdd;
        font-size:12px;
        font-weight:950;
        letter-spacing:.05em;
        text-transform:uppercase;
      }
      .daily-market-item {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        min-height:34px;
        padding:7px 9px;
        border:1px solid rgba(255,255,255,.075);
        border-radius:12px;
        background:rgba(3,8,23,.58);
        color:#f8fbff;
        font-size:12px;
      }
      .daily-market-item b { color:#ffe08a; font-weight:950; white-space:nowrap; }
      .daily-market-item.is-empty { color:#738096; background:rgba(255,255,255,.025); }
      .daily-market-item.is-empty b { color:#8793a8; }
      .daily-match-row { cursor:default; }
      .daily-match-row.is-open { background:rgba(255,159,28,.08)!important; }
      @media(max-width:960px){.daily-extra-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:720px){.daily-extra-head{align-items:flex-start;flex-direction:column}.daily-extra-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(s);
  }

  function cell(row, i) {
    return row.children[i] ? row.children[i].textContent.trim() : "—";
  }

  function market(label, value) {
    return `<div class="daily-market-item ${empty(value) ? "is-empty" : ""}"><span>${label}</span><b>${showValue(value)}</b></div>`;
  }

  function countValues(values) {
    const total = values.length;
    const active = values.filter((value) => !empty(value)).length;
    const label = active >= 6 ? "Tam Veri" : active >= 3 ? "Kısmi Veri" : "Oran Bekleniyor";
    return { active, total, label };
  }

  function makeExtra(row) {
    if (row.nextElementSibling && row.nextElementSibling.classList.contains("daily-extra")) return row.nextElementSibling;

    const home = row.dataset.home || "Ev sahibi";
    const away = row.dataset.away || "Deplasman";
    const ms1 = cell(row, 2);
    const msx = cell(row, 3);
    const ms2 = cell(row, 4);
    const alt = cell(row, 5);
    const ust = cell(row, 6);
    const kgVar = cell(row, 7);
    const kgYok = cell(row, 8);
    const quality = countValues([ms1, msx, ms2, alt, ust, kgVar, kgYok]);

    const extra = document.createElement("div");
    extra.className = "daily-extra";
    extra.innerHTML = `
      <div class="daily-extra-head">
        <div class="daily-extra-title">
          <strong>Detaylı Oranlar</strong>
          <small>${home} - ${away}</small>
        </div>
        <span class="daily-data-badge">${quality.label} · ${quality.active}/${quality.total} oran mevcut</span>
      </div>
      <div class="daily-extra-grid">
        <section class="daily-market-group">
          <h4>Maç Sonucu</h4>
          ${market("MS 1", ms1)}
          ${market("MS X", msx)}
          ${market("MS 2", ms2)}
        </section>
        <section class="daily-market-group">
          <h4>Alt / Üst</h4>
          ${market("2.5 Alt", alt)}
          ${market("2.5 Üst", ust)}
        </section>
        <section class="daily-market-group">
          <h4>Karşılıklı Gol</h4>
          ${market("KG Var", kgVar)}
          ${market("KG Yok", kgYok)}
        </section>
        <section class="daily-market-group">
          <h4>Ek Oranlar</h4>
          ${market("Çifte Şans 1X", "")}
          ${market("Çifte Şans X2", "")}
          ${market("İlk Yarı", "")}
        </section>
      </div>
    `;
    row.after(extra);
    return extra;
  }

  function closeOtherRows(currentRow) {
    document.querySelectorAll(".daily-match-row.is-open").forEach((row) => {
      if (row === currentRow) return;
      row.classList.remove("is-open");
      const button = row.querySelector("[data-daily-detail-toggle]");
      if (button) button.setAttribute("aria-expanded", "false");
      if (row.nextElementSibling && row.nextElementSibling.classList.contains("daily-extra")) {
        row.nextElementSibling.classList.remove("open");
      }
    });
  }

  function init() {
    addStyle();
    document.querySelectorAll("[data-daily-detail-toggle]").forEach((button) => {
      if (button.dataset.ready) return;
      button.dataset.ready = "1";
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const row = button.closest(".daily-match-row");
        if (!row) return;
        const extra = makeExtra(row);
        const willOpen = !extra.classList.contains("open");
        closeOtherRows(row);
        extra.classList.toggle("open", willOpen);
        row.classList.toggle("is-open", willOpen);
        button.setAttribute("aria-expanded", String(willOpen));
      });
    });
  }

  window.addEventListener("load", () => {
    init();
    setTimeout(init, 1000);
    setTimeout(init, 2500);
    setInterval(init, 5000);
  });
})();
