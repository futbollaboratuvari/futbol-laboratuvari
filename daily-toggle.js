(() => {
  const DATA_URL = "./data/fixtures.json";
  let fixtures = [];
  let loadStarted = false;

  const empty = (value) => {
    const text = String(value ?? "").trim();
    return !text || text === "-" || text === "—" || text.toLowerCase() === "null";
  };

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const norm = (value) => String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  const parseDate = (value) => {
    const text = String(value || "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
    const match = text.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    return match ? `${match[3]}-${match[2]}-${match[1]}` : "";
  };

  const addStyle = () => {
    if (document.getElementById("daily-toggle-style")) return;
    const style = document.createElement("style");
    style.id = "daily-toggle-style";
    style.textContent = `
      .daily-extra{display:none;grid-column:1/-1;width:100%;max-width:100%;box-sizing:border-box;margin:0;padding:12px;border:1px solid rgba(57,255,136,.2);border-radius:0 0 16px 16px;background:linear-gradient(180deg,rgba(5,12,30,.98),rgba(2,7,18,.98));box-shadow:inset 0 1px 0 rgba(255,255,255,.04);overflow:hidden}
      .daily-extra.open{display:block}.daily-extra-title{display:block;margin:0 0 10px;color:#ffe08a;font-size:13px;font-weight:950;line-height:1.25;letter-spacing:.02em;overflow-wrap:anywhere}
      .daily-extra-category{margin:0 0 10px;border:1px solid rgba(255,224,138,.16);border-radius:14px;background:rgba(255,255,255,.028);overflow:hidden}.daily-extra-category:last-child{margin-bottom:0}
      .daily-extra-subtitle{display:flex;align-items:center;min-height:32px;margin:0;padding:8px 10px;border-bottom:1px solid rgba(255,224,138,.14);background:rgba(255,224,138,.055);color:#ffe08a;font-size:11px;font-weight:950;letter-spacing:.04em;line-height:1.2;text-transform:uppercase}
      .daily-extra-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;width:100%;max-width:100%;box-sizing:border-box;padding:10px}.daily-extra-grid.triple{grid-template-columns:repeat(3,minmax(0,1fr))}
      .daily-market-item{min-width:0;min-height:58px;display:flex;flex-direction:column;align-items:stretch;justify-content:space-between;gap:7px;padding:9px 10px;border:1px solid rgba(255,255,255,.16);border-radius:12px;background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.035));color:#d7e4f5;box-shadow:inset 0 1px 0 rgba(255,255,255,.045);box-sizing:border-box;overflow:hidden;transition:border-color .18s ease,background .18s ease,transform .18s ease}
      .daily-market-item:hover{border-color:rgba(255,224,138,.42);background:linear-gradient(180deg,rgba(255,224,138,.11),rgba(255,255,255,.04));transform:translateY(-1px)}
      .daily-market-name{display:block;color:#8fa0b5;font-size:11px;font-weight:800;line-height:1.15;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.daily-market-value{display:block;color:#ffe08a;font-size:16px;font-weight:950;line-height:1.1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .daily-extra-empty{margin:0;padding:10px 12px;border:1px dashed rgba(255,255,255,.14);border-radius:12px;color:#8fa0b5;font-size:12px;line-height:1.25;background:rgba(255,255,255,.025);text-align:center}
      @media(max-width:900px){.daily-extra-grid,.daily-extra-grid.triple{grid-template-columns:repeat(3,minmax(0,1fr))}}
      @media(max-width:720px){.daily-extra{margin-top:-4px;border-radius:12px;padding:8px}.daily-extra-title{margin-bottom:8px}.daily-extra-category{margin-bottom:8px}.daily-extra-grid,.daily-extra-grid.triple{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;padding:8px}.daily-market-item{min-height:54px;padding:8px}.daily-market-name,.daily-market-value{white-space:normal;overflow-wrap:anywhere}.daily-market-value{font-size:15px}}
      @media(max-width:380px){.daily-extra-grid,.daily-extra-grid.triple{grid-template-columns:1fr}.daily-market-item{min-height:48px}}
    `;
    document.head.appendChild(style);
  };

  const loadFixtures = async () => {
    if (loadStarted) return;
    loadStarted = true;
    try {
      const response = await fetch(DATA_URL, { cache: "no-store" });
      const data = await response.json();
      fixtures = Array.isArray(data) ? data : [];
    } catch {
      fixtures = [];
    }
  };

  const read = (match, key) => match?.[key] ?? match?.odds?.[key] ?? match?.oranlar?.[key] ?? match?.detay_oranlar?.[key] ?? match?.detailOdds?.[key];
  const pick = (match, keys) => {
    for (const key of keys) {
      const value = read(match, key);
      if (!empty(value)) return value;
    }
    return "";
  };

  const market = (label, value) => empty(value) ? "" : `<div class="daily-market-item"><span class="daily-market-name">${esc(label)}</span><b class="daily-market-value">${esc(value)}</b></div>`;
  const section = (title, cards, className = "") => {
    const html = String(cards || "").trim();
    return html ? `<section class="daily-extra-category"><div class="daily-extra-subtitle">${esc(title)}</div><div class="daily-extra-grid ${className}">${html}</div></section>` : "";
  };

  const fixtureKey = (item) => [parseDate(item.date || item.tarih || item.utc_date), String(item.time || item.saat || "").trim(), norm(item.home || item.home_team_name || item.ev_sahibi), norm(item.away || item.away_team_name || item.deplasman)].join("|");
  const fixtureTeamKey = (item) => [norm(item.home || item.home_team_name || item.ev_sahibi), norm(item.away || item.away_team_name || item.deplasman)].join("|");
  const rowKey = (row) => {
    const timeCell = row.querySelector(".daily-match-time");
    const date = parseDate(row.querySelector(".daily-match-date")?.textContent);
    const time = row.dataset.kickoff || timeCell?.dataset.originalTime || String(timeCell?.textContent || "").match(/\d{1,2}:\d{2}/)?.[0] || "";
    return [date, String(time).trim(), norm(row.dataset.home), norm(row.dataset.away)].join("|");
  };
  const rowTeamKey = (row) => [norm(row.dataset.home), norm(row.dataset.away)].join("|");
  const findFixture = (row) => fixtures.find((item) => fixtureKey(item) === rowKey(row)) || fixtures.find((item) => fixtureTeamKey(item) === rowTeamKey(row)) || null;

  const mainOdds = (f) => section("Ana Oranlar",
    market("MS 1", pick(f, ["oneOdd", "one", "ms1", "odd1", "ms_1"])) +
    market("MS X", pick(f, ["drawOdd", "draw", "msx", "oddX", "ms_x"])) +
    market("MS 2", pick(f, ["twoOdd", "two", "ms2", "odd2", "ms_2"])) +
    market("2.5 Alt", pick(f, ["under25", "alt25", "under", "alt", "alt_25"])) +
    market("2.5 Üst", pick(f, ["over25", "ust25", "over", "ust", "ust_25"])) +
    market("KG Var", pick(f, ["bttsYes", "kgVar", "varOdd", "var", "kg_var"])) +
    market("KG Yok", pick(f, ["bttsNo", "kgYok", "yokOdd", "yok", "kg_yok"]))
  );

  const halfResult = (f) => section("Yarı Sonucu",
    market("1. Yarı 1", pick(f, ["firstHalfOne", "iy1", "iy_1", "first_half_1"])) +
    market("1. Yarı X", pick(f, ["firstHalfDraw", "iyX", "iy_x", "first_half_x"])) +
    market("1. Yarı 2", pick(f, ["firstHalfTwo", "iy2", "iy_2", "first_half_2"])) +
    market("2. Yarı 1", pick(f, ["secondHalfOne", "ikinciYari1", "ikinci_yari_1", "second_half_1"])) +
    market("2. Yarı X", pick(f, ["secondHalfDraw", "ikinciYariX", "ikinci_yari_x", "second_half_x"])) +
    market("2. Yarı 2", pick(f, ["secondHalfTwo", "ikinciYari2", "ikinci_yari_2", "second_half_2"])), "triple"
  );

  const halfFull = (f) => section("İlk Yarı / Maç Sonucu",
    market("1Y 1 - MS 1", pick(f, ["htFt11", "iyMs11", "iy_ms_11", "iy_ms_1_1", "half_time_full_time_11"])) +
    market("1Y 1 - MS X", pick(f, ["htFt1X", "iyMs1x", "iy_ms_1x", "iy_ms_1_x", "half_time_full_time_1x"])) +
    market("1Y 1 - MS 2", pick(f, ["htFt12", "iyMs12", "iy_ms_12", "iy_ms_1_2", "half_time_full_time_12"])) +
    market("1Y X - MS 1", pick(f, ["htFtX1", "iyMsX1", "iy_ms_x1", "iy_ms_x_1", "half_time_full_time_x1"])) +
    market("1Y X - MS X", pick(f, ["htFtXX", "iyMsXx", "iy_ms_xx", "iy_ms_x_x", "half_time_full_time_xx"])) +
    market("1Y X - MS 2", pick(f, ["htFtX2", "iyMsX2", "iy_ms_x2", "iy_ms_x_2", "half_time_full_time_x2"])) +
    market("1Y 2 - MS 1", pick(f, ["htFt21", "iyMs21", "iy_ms_21", "iy_ms_2_1", "half_time_full_time_21"])) +
    market("1Y 2 - MS X", pick(f, ["htFt2X", "iyMs2x", "iy_ms_2x", "iy_ms_2_x", "half_time_full_time_2x"])) +
    market("1Y 2 - MS 2", pick(f, ["htFt22", "iyMs22", "iy_ms_22", "iy_ms_2_2", "half_time_full_time_22"])), "triple"
  );

  const handicap = (f) => section("Handikaplı Maç Sonucu",
    market("HMS 1", pick(f, ["handicapOne", "hndOne", "hnd_1", "handicap_1"])) +
    market("HMS X", pick(f, ["handicapDraw", "hndDraw", "hnd_x", "handicap_x"])) +
    market("HMS 2", pick(f, ["handicapTwo", "hndTwo", "hnd_2", "handicap_2"])), "triple"
  );

  const overUnder = (f) => section("Alt / Üst",
    market("3.5 Alt", pick(f, ["under35", "alt35", "alt_35", "under3_5"])) +
    market("3.5 Üst", pick(f, ["over35", "ust35", "ust_35", "over3_5"])) +
    market("1Y 1.5 Alt", pick(f, ["firstHalfUnder15", "iyAlt15", "iy_alt_15", "first_half_under_15"])) +
    market("1Y 1.5 Üst", pick(f, ["firstHalfOver15", "iyUst15", "iy_ust_15", "first_half_over_15"]))
  );

  const goalRange = (f) => section("Toplam Gol Aralığı",
    market("0-1 Gol", pick(f, ["totalGoals01", "goalRange01", "golAraligi01", "gol_araligi_01", "toplam_gol_01"])) +
    market("2-3 Gol", pick(f, ["totalGoals23", "goalRange23", "golAraligi23", "gol_araligi_23", "toplam_gol_23"])) +
    market("4-5 Gol", pick(f, ["totalGoals45", "goalRange45", "golAraligi45", "gol_araligi_45", "toplam_gol_45"])) +
    market("6+ Gol", pick(f, ["totalGoals6Plus", "goalRange6Plus", "golAraligi6Plus", "gol_araligi_6_plus", "toplam_gol_6_plus"]))
  );

  const teamGoals = (f) => section("Taraf Alt / Üst",
    market("Ev Sahibi 2.5 Alt", pick(f, ["homeUnder25", "evAlt25", "ev_alt_25", "home_team_under_25"])) +
    market("Ev Sahibi 2.5 Üst", pick(f, ["homeOver25", "evUst25", "ev_ust_25", "home_team_over_25"])) +
    market("Deplasman 1.5 Alt", pick(f, ["awayUnder15", "depAlt15", "dep_alt_15", "away_team_under_15"])) +
    market("Deplasman 1.5 Üst", pick(f, ["awayOver15", "depUst15", "dep_ust_15", "away_team_over_15"])) +
    market("Ev Sahibi 1Y 0.5 Alt", pick(f, ["homeFirstHalfUnder05", "evIyAlt05", "ev_iy_alt_05", "home_first_half_under_05"])) +
    market("Ev Sahibi 1Y 0.5 Üst", pick(f, ["homeFirstHalfOver05", "evIyUst05", "ev_iy_ust_05", "home_first_half_over_05"])) +
    market("Deplasman 1Y 0.5 Alt", pick(f, ["awayFirstHalfUnder05", "depIyAlt05", "dep_iy_alt_05", "away_first_half_under_05"])) +
    market("Deplasman 1Y 0.5 Üst", pick(f, ["awayFirstHalfOver05", "depIyUst05", "dep_iy_ust_05", "away_first_half_over_05"]))
  );

  const halfBtts = (f) => section("Yarı KG",
    market("1Y KG Var", pick(f, ["firstHalfBttsYes", "iyKgVar", "iy_kg_var", "first_half_btts_yes"])) +
    market("1Y KG Yok", pick(f, ["firstHalfBttsNo", "iyKgYok", "iy_kg_yok", "first_half_btts_no"])) +
    market("2Y KG Var", pick(f, ["secondHalfBttsYes", "ikinciYariKgVar", "ikinci_yari_kg_var", "second_half_btts_yes"])) +
    market("2Y KG Yok", pick(f, ["secondHalfBttsNo", "ikinciYariKgYok", "ikinci_yari_kg_yok", "second_half_btts_no"]))
  );

  const splitHalfBtts = (f) => section("1. Yarı / 2. Yarı KG",
    market("Evet/Evet", pick(f, ["iy2yKgYesYes", "firstSecondBttsYesYes", "ht2hBttsYesYes", "iy2y_kg_evet_evet"])) +
    market("Evet/Hayır", pick(f, ["iy2yKgYesNo", "firstSecondBttsYesNo", "ht2hBttsYesNo", "iy2y_kg_evet_hayir", "iy2y_kg_evet_hayır"])) +
    market("Hayır/Evet", pick(f, ["iy2yKgNoYes", "firstSecondBttsNoYes", "ht2hBttsNoYes", "iy2y_kg_hayir_evet", "iy2y_kg_hayır_evet"])) +
    market("Hayır/Hayır", pick(f, ["iy2yKgNoNo", "firstSecondBttsNoNo", "ht2hBttsNoNo", "iy2y_kg_hayir_hayir", "iy2y_kg_hayır_hayır"]))
  );

  const extraHtml = (row) => {
    const fixture = findFixture(row);
    const sections = [mainOdds(fixture), halfResult(fixture), halfFull(fixture), handicap(fixture), overUnder(fixture), goalRange(fixture), teamGoals(fixture), halfBtts(fixture), splitHalfBtts(fixture)].filter(Boolean).join("");
    return `<strong class="daily-extra-title">Detaylı Oranlar</strong>${sections || `<div class="daily-extra-empty">Bu bölüm için veri yok</div>`}`;
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
