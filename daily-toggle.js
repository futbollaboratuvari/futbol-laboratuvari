(() => {
  const DATA_URL = "./data/fixtures.json";
  let fixtureCache = [];
  let fixtureLoadStarted = false;

  const empty = (value) => {
    const text = String(value || "").trim();
    return !text || text === "-" || text === "—";
  };

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const normalize = (value) => String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  const parseDate = (text) => {
    const value = String(text || "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    return match ? `${match[3]}-${match[2]}-${match[1]}` : "";
  };

  const addStyle = () => {
    if (document.getElementById("daily-toggle-style")) return;
    const style = document.createElement("style");
    style.id = "daily-toggle-style";
    style.textContent = `
      .daily-extra{display:none;grid-column:1/-1;width:100%;max-width:100%;box-sizing:border-box;margin:0;padding:14px;border:1px solid rgba(57,255,136,.18);border-radius:0 0 16px 16px;background:rgba(3,8,23,.96);overflow:hidden}
      .daily-extra.open{display:block}
      .daily-extra-title{display:block;max-width:100%;margin:0 0 10px;color:#ffe08a;line-height:1.35;overflow-wrap:anywhere}
      .daily-extra-subtitle{margin:0 0 8px;color:#c8ffdd;font-size:12px;font-weight:950;letter-spacing:.04em;text-transform:uppercase}
      .daily-extra-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;width:100%;max-width:100%;box-sizing:border-box}
      .daily-market-item{min-width:0;display:flex;justify-content:space-between;gap:10px;padding:8px 10px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(255,255,255,.04);color:#d7e4f5;box-sizing:border-box;overflow:hidden}
      .daily-market-item span,.daily-market-item b{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .daily-market-item b{color:#ffe08a}.daily-market-item.is-empty{opacity:.65}
      @media(max-width:720px){.daily-extra{margin-top:-4px;border-radius:14px;padding:12px}.daily-extra-grid{grid-template-columns:1fr}.daily-market-item span,.daily-market-item b{white-space:normal}}
    `;
    document.head.appendChild(style);
  };

  const loadFixtures = async () => {
    if (fixtureLoadStarted) return;
    fixtureLoadStarted = true;
    try {
      const response = await fetch(DATA_URL, { cache: "no-store" });
      const data = await response.json();
      fixtureCache = Array.isArray(data) ? data : [];
    } catch {
      fixtureCache = [];
    }
  };

  const item = (label, value) => `<div class="daily-market-item ${empty(value) ? "is-empty" : ""}"><span>${escapeHtml(label)}</span><b>${empty(value) ? "Veri yok" : escapeHtml(value)}</b></div>`;

  const fixtureKey = (item) => [
    parseDate(item.date || item.tarih || item.utc_date),
    String(item.time || item.saat || "").trim(),
    normalize(item.home || item.home_team_name || item.ev_sahibi),
    normalize(item.away || item.away_team_name || item.deplasman),
  ].join("|");

  const rowKey = (row) => {
    const timeCell = row.querySelector(".daily-match-time");
    const date = parseDate(row.querySelector(".daily-match-date")?.textContent);
    const time = row.dataset.kickoff || timeCell?.dataset.originalTime || String(timeCell?.textContent || "").match(/\d{1,2}:\d{2}/)?.[0] || "";
    return [date, String(time).trim(), normalize(row.dataset.home), normalize(row.dataset.away)].join("|");
  };

  const pick = (match, keys) => {
    for (const key of keys) {
      const value = match?.[key] ?? match?.odds?.[key];
      if (value !== undefined && value !== null && value !== "") return value;
    }
    return "";
  };

  const findFixture = (row) => {
    const key = rowKey(row);
    return fixtureCache.find((fixture) => fixtureKey(fixture) === key) || null;
  };

  const firstSecondBttsHtml = (row) => {
    const fixture = findFixture(row);
    const yesYes = pick(fixture, ["iy2yKgYesYes", "firstSecondBttsYesYes", "ht2hBttsYesYes", "iy2y_kg_evet_evet"]);
    const yesNo = pick(fixture, ["iy2yKgYesNo", "firstSecondBttsYesNo", "ht2hBttsYesNo", "iy2y_kg_evet_hayir", "iy2y_kg_evet_hayır"]);
    const noYes = pick(fixture, ["iy2yKgNoYes", "firstSecondBttsNoYes", "ht2hBttsNoYes", "iy2y_kg_hayir_evet", "iy2y_kg_hayır_evet"]);
    const noNo = pick(fixture, ["iy2yKgNoNo", "firstSecondBttsNoNo", "ht2hBttsNoNo", "iy2y_kg_hayir_hayir", "iy2y_kg_hayır_hayır"]);
    return `<div class="daily-extra-subtitle">1. Yarı / 2. Yarı KG</div><div class="daily-extra-grid">${item("Evet/Evet", yesYes)}${item("Evet/Hayır", yesNo)}${item("Hayır/Evet", noYes)}${item("Hayır/Hayır", noNo)}</div>`;
  };

  const extraHtml = (row) => `<strong class="daily-extra-title">Detaylı Oranlar</strong>${firstSecondBttsHtml(row)}`;

  const makeExtra = (row) => {
    if (row.nextElementSibling?.classList.contains("daily-extra")) return row.nextElementSibling;
    const extra = document.createElement("div");
    extra.className = "daily-extra";
    extra.innerHTML = extraHtml(row);
    row.after(extra);
    return extra;
  };

  const refreshExtra = (row) => {
    const extra = row.nextElementSibling;
    if (!extra?.classList.contains("daily-extra")) return;
    extra.innerHTML = extraHtml(row);
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
    loadFixtures();
    if (document.documentElement.dataset.dailyToggleReady === "1") return;
    document.documentElement.dataset.dailyToggleReady = "1";
    document.addEventListener("click", async (event) => {
      const button = event.target.closest?.("[data-daily-detail-toggle]");
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      await loadFixtures();
      const row = button.closest(".daily-match-row");
      if (!row) return;
      const extra = makeExtra(row);
      refreshExtra(row);
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
