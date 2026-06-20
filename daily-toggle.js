(() => {
  const empty = (value) => {
    const text = String(value || "").trim();
    return !text || text === "-" || text === "—";
  };

  const addStyle = () => {
    if (document.getElementById("daily-toggle-style")) return;
    const style = document.createElement("style");
    style.id = "daily-toggle-style";
    style.textContent = ".daily-extra{display:none;grid-column:1/-1;padding:14px;border:1px solid rgba(57,255,136,.18);background:rgba(3,8,23,.96)}.daily-extra.open{display:block}.daily-extra-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.daily-market-item{display:flex;justify-content:space-between;gap:10px;padding:8px 10px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(255,255,255,.04);color:#d7e4f5}.daily-market-item b{color:#ffe08a}.daily-market-item.is-empty{opacity:.65}@media(max-width:720px){.daily-extra-grid{grid-template-columns:1fr}}";
    document.head.appendChild(style);
  };

  const cell = (row, index) => row.children[index]?.textContent?.trim() || "—";
  const item = (label, value) => `<div class="daily-market-item ${empty(value) ? "is-empty" : ""}"><span>${label}</span><b>${empty(value) ? "Veri yok" : value}</b></div>`;

  const makeExtra = (row) => {
    if (row.nextElementSibling?.classList.contains("daily-extra")) return row.nextElementSibling;
    const home = row.dataset.home || "Ev sahibi";
    const away = row.dataset.away || "Deplasman";
    const extra = document.createElement("div");
    extra.className = "daily-extra";
    extra.innerHTML = `<strong style="display:block;color:#ffe08a;margin-bottom:10px">Detaylı Oranlar · ${home} - ${away}</strong><div class="daily-extra-grid">${item("MS 1", cell(row, 2))}${item("MS X", cell(row, 3))}${item("MS 2", cell(row, 4))}${item("2.5 Alt", cell(row, 5))}${item("2.5 Üst", cell(row, 6))}${item("KG Var", cell(row, 7))}${item("KG Yok", cell(row, 8))}</div>`;
    row.after(extra);
    return extra;
  };

  const closeOthers = (current) => {
    document.querySelectorAll(".daily-match-row.is-open").forEach((row) => {
      if (row === current) return;
      row.classList.remove("is-open");
      row.querySelector("[data-daily-detail-toggle]")?.setAttribute("aria-expanded", "false");
      row.nextElementSibling?.classList.contains("daily-extra") && row.nextElementSibling.classList.remove("open");
    });
  };

  const boot = () => {
    addStyle();
    if (document.documentElement.dataset.dailyToggleReady === "1") return;
    document.documentElement.dataset.dailyToggleReady = "1";
    document.addEventListener("click", (event) => {
      const button = event.target.closest?.("[data-daily-detail-toggle]");
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      const row = button.closest(".daily-match-row");
      if (!row) return;
      const extra = makeExtra(row);
      const open = !extra.classList.contains("open");
      closeOthers(row);
      row.classList.toggle("is-open", open);
      extra.classList.toggle("open", open);
      button.setAttribute("aria-expanded", String(open));
    }, true);
  };

  boot();
  document.addEventListener("DOMContentLoaded", boot, { once: true });
  window.addEventListener("load", boot, { once: true });
  document.addEventListener("fl:runtime-ready", boot);
})();
