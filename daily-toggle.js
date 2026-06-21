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
      .daily-extra{display:none;grid-column:1/-1;width:100%;max-width:100%;box-sizing:border-box;margin:0;padding:12px;border:1px solid rgba(57,255,136,.2);border-radius:0 0 16px 16px;background:linear-gradient(180deg,rgba(5,12,30,.98),rgba(2,7,18,.98));box-shadow:inset 0 1px 0 rgba(255,255,255,.04);overflow:hidden}
      .daily-extra.open{display:block}
      .daily-extra-title{display:block;max-width:100%;margin:0 0 10px;color:#ffe08a;font-size:13px;font-weight:950;line-height:1.25;letter-spacing:.02em;overflow-wrap:anywhere}
      .daily-extra-category{margin:0 0 10px;border:1px solid rgba(255,224,138,.16);border-radius:14px;background:rgba(255,255,255,.028);overflow:hidden}
      .daily-extra-subtitle{display:flex;align-items:center;min-height:32px;margin:0;padding:8px 10px;border-bottom:1px solid rgba(255,224,138,.14);background:rgba(255,224,138,.055);color:#ffe08a;font-size:11px;font-weight:950;letter-spacing:.04em;line-height:1.2;text-transform:uppercase}
      .daily-extra-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;width:100%;max-width:100%;box-sizing:border-box;padding:10px}
      .daily-extra-grid.triple{grid-template-columns:repeat(3,minmax(0,1fr))}
      .daily-market-item{min-width:0;min-height:58px;display:flex;flex-direction:column;align-items:stretch;justify-content:space-between;gap:7px;padding:9px 10px;border:1px solid rgba(255,255,255,.16);border-radius:12px;background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.035));color:#d7e4f5;box-shadow:inset 0 1px 0 rgba(255,255,255,.045);box-sizing:border-box;overflow:hidden}
      .daily-market-name{display:block;min-width:0;color:#8fa0b5;font-size:11px;font-weight:800;line-height:1.15;letter-spacing:.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .daily-market-value{display:block;min-width:0;color:#ffe08a;font-size:16px;font-weight:950;line-height:1.1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .daily-extra-empty{margin:10px;padding:10px 12px;border:1px dashed rgba(255,255,255,.14);border-radius:12px;color:#8fa0b5;font-size:12px;line-height:1.25;background:rgba(255,255,255,.025);text-align:center}
      @media(max-width:900px){.daily-extra-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.daily-extra-grid.triple{grid-template-columns:repeat(3,minmax(0,1fr))}}
      @media(max-width:720px){.daily-extra{margin-top:-4px;border-radius:12px;padding:8px}.daily-extra-title{margin-bottom:8px}.daily-extra-category{margin-bottom:8px;border-radius:12px}.daily-extra-subtitle{min-height:30px;padding:7px 9px}.daily-extra-grid,.daily-extra-grid.triple{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;padding:8px}.daily-market-item{min-height:54px;padding:8px}.daily-market-name,.daily-market-value{white-space:normal;overflow-wrap:anywhere}.daily-market-value{font-size:15px}}
      @media(max-width:380px){.daily-extra-grid,.daily-extra-grid.triple{grid-template-columns:1fr}.daily-market-item{min-height:48px}}
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

  const item = (label, value) => {
    if (empty(value)) return "";
    return `<div class="daily-market-item"><span class="daily-market-name">${escapeHtml(label)}</span><b class="daily-market-value">${escapeHtml(value)}</b></div>`;
  };
  const category = (title, html, extraClass = "") => {
    const content = String(html || "").trim();
    const body = content
      ? `<div class="daily-extra-grid ${extraClass}">${content}</div>`
      : `<div class="daily-extra-empty">Bu bölüm için veri yok</div>`;
    return `<section class="daily-extra-category"><div class="daily-extra-subtitle">${escapeHtml(title)}</div>${body}</section>`;
  };

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

  const halfResultHtml = (fixture) => category("Yarı Sonucu",
    item("1. Yarı 1", pick(fixture, ["firstHalfOne", "iy1", "iy_1", "first_half_1"])) +
    item("1. Yarı X", pick(fixture, ["firstHalfDraw", "iyX", "iy_x", "first_half_x"])) +
    item("1. Yarı 2", pick(fixture, ["firstHalfTwo", "iy2", "iy_2", "first_half_2"])) +
    item("2. Yarı 1", pick(fixture, ["secondHalfOne", "ikinciYari1", "ikinci_yari_1", "second_half_1"])) +
    item("2. Yarı X", pick(fixture, ["secondHalfDraw", "ikinciYariX", "ikinci_yari_x", "second_half_x"])) +
    item("2. Yarı 2", pick(fixture, ["secondHalfTwo", "ikinciYari2", "ikinci_yari_2", "second_half_2"])),
    "triple"
  );

  const halfTimeFullTimeHtml = (fixture) => category("İlk Yarı / Maç Sonucu",
    item("1/1", pick(fixture, ["htFt11", "iyMs11", "iy_ms_11", "iy_ms_1_1", "half_time_full_time_11"])) +
    item("1/X", pick(fixture, ["htFt1X", "iyMs1x", "iy_ms_1x", "iy_ms_1_x", "half_time_full_time_1x"])) +
    item("1/2", pick(fixture, ["htFt12", "iyMs12", "iy_ms_12", "iy_ms_1_2", "half_time_full_time_12"])) +
    item("X/1", pick(fixture, ["htFtX1", "iyMsX1", "iy_ms_x1", "iy_ms_x_1", "half_time_full_time_x1"])) +
    item("X/X", pick(fixture, ["htFtXX", "iyMsXx", "iy_ms_xx", "iy_ms_x_x", "half_time_full_time_xx"])) +
    item("X/2", pick(fixture, ["htFtX2", "iyMsX2", "iy_ms_x2", "iy_ms_x_2", "half_time_full_time_x2"])) +
    item("2/1", pick(fixture, ["htFt21", "iyMs21", "iy_ms_21", "iy_ms_2_1", "half_time_full_time_21"])) +
    item("2/X", pick(fixture, ["htFt2X", "iyMs2x", "iy_ms_2x", "iy_ms_2_x", "half_time_full_time_2x"])) +
    item("2/2", pick(fixture, ["htFt22", "iyMs22", "iy_ms_22", "iy_ms_2_2", "half_time_full_time_22"])),
    "triple"
  );

  const handicapHtml = (fixture) => category("Handikaplı Maç Sonucu",
    item("HND 1", pick(fixture, ["handicapOne", "hndOne", "hnd_1", "handicap_1"])) +
    item("HND X", pick(fixture, ["handicapDraw", "hndDraw", "hnd_x", "handicap_x"])) +
    item("HND 2", pick(fixture, ["handicapTwo", "hndTwo", "hnd_2", "handicap_2"])),
    "triple"
  );

  const matchDoubleChanceHtml = (fixture) => category("Maç Sonu Çifte Şans",
    item("1-X", pick(fixture, ["doubleChance1X", "cifte1x", "cifte_1x", "dc_1x"])) +
    item("1-2", pick(fixture, ["doubleChance12", "cifte12", "cifte_12", "dc_12"])) +
    item("X-2", pick(fixture, ["doubleChanceX2", "cifteX2", "cifte_x2", "dc_x2"])),
    "triple"
  );

  const halfDoubleChanceHtml = (fixture) => category("1. Yarı Çifte Şans",
    item("1Y 1-X", pick(fixture, ["firstHalfDoubleChance1X", "iyCifte1x", "iy_cifte_1x", "first_half_dc_1x"])) +
    item("1Y 1-2", pick(fixture, ["firstHalfDoubleChance12", "iyCifte12", "iy_cifte_12", "first_half_dc_12"])) +
    item("1Y X-2", pick(fixture, ["firstHalfDoubleChanceX2", "iyCifteX2", "iy_cifte_x2", "first_half_dc_x2"])),
    "triple"
  );

  const overUnderHtml = (fixture) => category("Alt / Üst",
    item("3.5 Alt", pick(fixture, ["under35", "alt35", "alt_35", "under3_5"])) +
    item("3.5 Üst", pick(fixture, ["over35", "ust35", "ust_35", "over3_5"])) +
    item("1Y 1.5 Alt", pick(fixture, ["firstHalfUnder15", "iyAlt15", "iy_alt_15", "first_half_under_15"])) +
    item("1Y 1.5 Üst", pick(fixture, ["firstHalfOver15", "iyUst15", "iy_ust_15", "first_half_over_15"]))
  );

  const goalRangeHtml = (fixture) => category("Toplam Gol Aralığı",
    item("0-1 Gol", pick(fixture, ["totalGoals01", "goalRange01", "golAraligi01", "gol_araligi_01", "toplam_gol_01"])) +
    item("2-3 Gol", pick(fixture, ["totalGoals23", "goalRange23", "golAraligi23", "gol_araligi_23", "toplam_gol_23"])) +
    item("4-5 Gol", pick(fixture, ["totalGoals45", "goalRange45", "golAraligi45", "gol_araligi_45", "toplam_gol_45"])) +
    item("6+ Gol", pick(fixture, ["totalGoals6Plus", "goalRange6Plus", "golAraligi6Plus", "gol_araligi_6_plus", "toplam_gol_6_plus"]))
  );

  const teamOverUnderHtml = (fixture) => category("Taraf Alt / Üst",
    item("Ev Sahibi 2.5 Alt", pick(fixture, ["homeUnder25", "evAlt25", "ev_alt_25", "home_team_under_25"])) +
    item("Ev Sahibi 2.5 Üst", pick(fixture, ["homeOver25", "evUst25", "ev_ust_25", "home_team_over_25"])) +
    item("Deplasman 1.5 Alt", pick(fixture, ["awayUnder15", "depAlt15", "dep_alt_15", "away_team_under_15"])) +
    item("Deplasman 1.5 Üst", pick(fixture, ["awayOver15", "depUst15", "dep_ust_15", "away_team_over_15"])) +
    item("Ev Sahibi 1Y 0.5 Alt", pick(fixture, ["homeFirstHalfUnder05", "evIyAlt05", "ev_iy_alt_05", "home_first_half_under_05"])) +
    item("Ev Sahibi 1Y 0.5 Üst", pick(fixture, ["homeFirstHalfOver05", "evIyUst05", "ev_iy_ust_05", "home_first_half_over_05"])) +
    item("Deplasman 1Y 0.5 Alt", pick(fixture, ["awayFirstHalfUnder05", "depIyAlt05", "dep_iy_alt_05", "away_first_half_under_05"])) +
    item("Deplasman 1Y 0.5 Üst", pick(fixture, ["awayFirstHalfOver05", "depIyUst05", "dep_iy_ust_05", "away_first_half_over_05"]))
  );

  const halfBttsHtml = (fixture) => category("Yarı KG",
    item("1Y KG Var", pick(fixture, ["firstHalfBttsYes", "iyKgVar", "iy_kg_var", "first_half_btts_yes"])) +
    item("1Y KG Yok", pick(fixture, ["firstHalfBttsNo", "iyKgYok", "iy_kg_yok", "first_half_btts_no"])) +
    item("2Y KG Var", pick(fixture, ["secondHalfBttsYes", "ikinciYariKgVar", "ikinci_yari_kg_var", "second_half_btts_yes"])) +
    item("2Y KG Yok", pick(fixture, ["secondHalfBttsNo", "ikinciYariKgYok", "ikinci_yari_kg_yok", "second_half_btts_no"]))
  );

  const firstSecondBttsHtml = (fixture) => category("1. Yarı / 2. Yarı KG",
    item("Evet/Evet", pick(fixture, ["iy2yKgYesYes", "firstSecondBttsYesYes", "ht2hBttsYesYes", "iy2y_kg_evet_evet"])) +
    item("Evet/Hayır", pick(fixture, ["iy2yKgYesNo", "firstSecondBttsYesNo", "ht2hBttsYesNo", "iy2y_kg_evet_hayir", "iy2y_kg_evet_hayır"])) +
    item("Hayır/Evet", pick(fixture, ["iy2yKgNoYes", "firstSecondBttsNoYes", "ht2hBttsNoYes", "iy2y_kg_hayir_evet", "iy2y_kg_hayır_evet"])) +
    item("Hayır/Hayır", pick(fixture, ["iy2yKgNoNo", "firstSecondBttsNoNo", "ht2hBttsNoNo", "iy2y_kg_hayir_hayir", "iy2y_kg_hayır_hayır"]))
  );

  const extraHtml = (row) => {
    const fixture = findFixture(row);
    return `<strong class="daily-extra-title">Detaylı Oranlar</strong>${halfResultHtml(fixture)}${halfTimeFullTimeHtml(fixture)}${handicapHtml(fixture)}${matchDoubleChanceHtml(fixture)}${halfDoubleChanceHtml(fixture)}${overUnderHtml(fixture)}${goalRangeHtml(fixture)}${teamOverUnderHtml(fixture)}${halfBttsHtml(fixture)}${firstSecondBttsHtml(fixture)}`;
  };

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
