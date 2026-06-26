(() => {
  const WIDGET_ID = "daily-matches-widget";
  const SOURCES = [
    { url: "./data/full-bulletin.json", type: "full-bulletin", label: "Tam iddaa bülteni" },
    { url: "./data/live-matches.json", type: "live-matches", label: "Canlı maç akışı" },
    { url: "./data/fixtures.json", type: "fixtures", label: "Fikstür akışı" }
  ];

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const empty = (value) => {
    const text = String(value ?? "").trim();
    return !text || text === "-" || text === "—" || text.toLowerCase() === "null";
  };

  const read = (match, key) => match?.[key]
    ?? match?.odds?.[key]
    ?? match?.available_odds?.[key]
    ?? match?.oranlar?.[key]
    ?? match?.detay_oranlar?.[key]
    ?? match?.detailOdds?.[key]
    ?? match?.raw_market_guess_odds?.[key];

  const pick = (match, keys) => {
    for (const key of keys) {
      const value = read(match, key);
      if (!empty(value)) return value;
    }
    return "";
  };

  const todayKey = () => new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const addDays = (dateKey, days) => {
    const [year, month, day] = String(dateKey).split("-").map(Number);
    return new Date(Date.UTC(year, month - 1, day + days, 12)).toISOString().slice(0, 10);
  };

  const minuteOf = (time) => {
    const match = String(time || "").trim().match(/^(\d{1,2}):(\d{2})$/);
    return match ? Number(match[1]) * 60 + Number(match[2]) : null;
  };

  const inBulletinWindow = (match) => {
    const today = todayKey();
    const tomorrow = addDays(today, 1);
    const minute = minuteOf(match.time);
    if (match.date === today) return true;
    if (match.date === tomorrow && minute !== null && minute < 8 * 60) return true;
    return false;
  };

  const formatDate = (dateKey) => {
    if (!dateKey || !String(dateKey).includes("-")) return "Bugün";
    const [year, month, day] = String(dateKey).split("-");
    return `${day}.${month}.${year}`;
  };

  const oddText = (value) => empty(value) ? "—" : String(value);
  const compareByDateTime = (a, b) => `${a.date || ""} ${a.time || ""} ${a.league || ""}`.localeCompare(`${b.date || ""} ${b.time || ""} ${b.league || ""}`, "tr");

  const normalize = (item) => {
    const matchText = String(item?.match || item?.match_name || "");
    const split = matchText.split(/\s+-\s+|\s+VS\s+/i);
    return {
      ...item,
      date: String(item?.date || item?.tarih || "").slice(0, 10),
      time: String(item?.time || item?.start_time || item?.saat || "--:--").trim(),
      league: item?.league || item?.competition_name || item?.lig || "Diğer",
      home: item?.home || item?.home_team_name || item?.ev_sahibi || split[0] || "Ev sahibi",
      away: item?.away || item?.away_team_name || item?.deplasman || split[1] || "Deplasman",
      odds: {
        ...(item?.odds || {}),
        ms1: pick(item, ["ms1", "one", "oneOdd", "odd1", "ms_1"]),
        msx: pick(item, ["msx", "draw", "drawOdd", "oddX", "x", "ms_x"]),
        ms2: pick(item, ["ms2", "two", "twoOdd", "odd2", "ms_2"]),
        under25: pick(item, ["under25", "alt25", "under", "alt", "under25_guess", "alt_25"]),
        over25: pick(item, ["over25", "ust25", "over", "ust", "over25_guess", "ust_25"]),
        bttsYes: pick(item, ["bttsYes", "kgVar", "kg_var", "varOdd", "var", "bttsYes_guess"]),
        bttsNo: pick(item, ["bttsNo", "kgYok", "kg_yok", "yokOdd", "yok", "bttsNo_guess"])
      }
    };
  };

  const market = (label, value) => empty(value)
    ? ""
    : `<div class="daily-market-item"><span class="daily-market-name">${esc(label)}</span><b class="daily-market-value">${esc(value)}</b></div>`;

  const section = (title, html, className = "") => String(html || "").trim()
    ? `<section class="daily-extra-category"><div class="daily-extra-subtitle">${esc(title)}</div><div class="daily-extra-grid ${className}">${html}</div></section>`
    : "";

  const mainOdds = (match) => ({
    ms1: pick(match, ["ms1", "one", "oneOdd", "odd1", "ms_1"]),
    msx: pick(match, ["msx", "draw", "drawOdd", "oddX", "x", "ms_x"]),
    ms2: pick(match, ["ms2", "two", "twoOdd", "odd2", "ms_2"]),
    under25: pick(match, ["under25", "alt25", "under", "alt", "under25_guess", "alt_25"]),
    over25: pick(match, ["over25", "ust25", "over", "ust", "over25_guess", "ust_25"]),
    bttsYes: pick(match, ["bttsYes", "kgVar", "kg_var", "varOdd", "var", "bttsYes_guess"]),
    bttsNo: pick(match, ["bttsNo", "kgYok", "kg_yok", "yokOdd", "yok", "bttsNo_guess"]),
  });

  const detailOdds = (match) => {
    const kg = section("KG",
      market("KG Var", pick(match, ["bttsYes", "kgVar", "kg_var", "varOdd", "var", "bttsYes_guess"])) +
      market("KG Yok", pick(match, ["bttsNo", "kgYok", "kg_yok", "yokOdd", "yok", "bttsNo_guess"])) +
      market("1Y Var", pick(match, ["firstHalfBttsYes", "iyKgVar", "iy_kg_var", "firstHalfBttsYes_guess"])) +
      market("2Y Var", pick(match, ["secondHalfBttsYes", "ikinciYariKgVar", "ikinci_yari_kg_var", "secondHalfBttsYes_guess"])),
      "triple"
    );
    const totals = section("Alt / Üst",
      market("2.5 Alt", pick(match, ["under25", "alt25", "under25_guess", "alt_25"])) +
      market("2.5 Üst", pick(match, ["over25", "ust25", "over25_guess", "ust_25"])) +
      market("3.5 Alt", pick(match, ["under35", "alt35", "under35_guess"])) +
      market("3.5 Üst", pick(match, ["over35", "ust35", "over35_guess"])),
      "triple"
    );
    const halfResult = section("Yarı Sonucu",
      market("1Y 1", pick(match, ["firstHalf1", "firstHalfOne", "iy1", "firstHalf1_guess"])) +
      market("1Y X", pick(match, ["firstHalfX", "firstHalfDraw", "iyX", "firstHalfX_guess"])) +
      market("1Y 2", pick(match, ["firstHalf2", "firstHalfTwo", "iy2", "firstHalf2_guess"])),
      "triple"
    );
    const candidates = Array.isArray(match.detail_market_candidates) ? match.detail_market_candidates.slice(0, 14) : [];
    const candidateHtml = candidates.map((item) => market(item.market || "Detay", Object.entries(item.values || {}).filter(([, value]) => !empty(value)).map(([key, value]) => `${key.replace(/_guess$/, "")}: ${value}`).join(" | "))).join("");
    const candidateSection = section("Diğer Detaylar", candidateHtml);
    return kg + totals + halfResult + candidateSection || `<div class="daily-extra-empty">Bu maç için detay oran akışı yok.</div>`;
  };

  const injectStyle = () => {
    if (document.querySelector("#daily-matches-widget-style")) return;
    const style = document.createElement("style");
    style.id = "daily-matches-widget-style";
    style.textContent = `
      .daily-widget-shell{position:relative;z-index:3;margin:22px clamp(18px,6vw,90px) 0;padding:18px;border:1px solid rgba(255,159,28,.3);border-radius:22px;background:linear-gradient(180deg,rgba(8,23,48,.96),rgba(3,8,23,.97));box-shadow:0 24px 70px rgba(0,0,0,.38);box-sizing:border-box}.daily-widget-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:16px}.daily-widget-title{margin:0;color:#ffe08a;font-size:clamp(20px,2.2vw,30px)}.daily-widget-subtitle{margin:6px 0 0;color:#aebbd0;font-size:13px}.daily-widget-count{display:inline-flex;padding:9px 12px;border:1px solid rgba(57,255,136,.34);border-radius:999px;background:rgba(57,255,136,.12);color:#c8ffdd;font-size:13px;font-weight:800}.daily-widget-list{display:grid;gap:14px}.daily-league-block{overflow:hidden;border:1px solid rgba(255,159,28,.22);border-radius:18px;background:rgba(3,8,23,.6)}.daily-league-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;background:linear-gradient(90deg,rgba(255,159,28,.72),rgba(19,120,69,.62),rgba(3,8,23,.72));border-bottom:1px solid rgba(255,159,28,.28)}.daily-league-name{color:#fff7d6;font-size:13px;font-weight:950;letter-spacing:.06em;text-transform:uppercase}.daily-table-scroll{width:100%;overflow-x:auto}.daily-match-table{display:grid;min-width:900px}.daily-match-header,.daily-match-row{display:grid;grid-template-columns:64px minmax(250px,1fr) repeat(7,minmax(52px,64px)) 92px;align-items:stretch}.daily-match-header{background:rgba(20,31,34,.98);color:#ffe08a;font-size:11px;font-weight:950;text-transform:uppercase}.daily-match-header span,.daily-match-row>*{display:flex;align-items:center;min-height:44px;padding:9px 8px;border-right:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.07);box-sizing:border-box}.daily-match-row:nth-child(odd){background:rgba(255,255,255,.03)}.daily-match-row.is-open{background:rgba(255,159,28,.085)!important}.daily-match-time{justify-content:center;color:#39ff88;font-weight:950}.daily-match-teams{display:grid;grid-template-columns:minmax(0,1fr) 20px minmax(0,1fr);gap:7px;color:#f8fbff;font-size:13px;font-weight:850}.daily-match-league{grid-column:1/-1;color:#aebbd0;font-size:10px;font-weight:850;text-transform:uppercase}.daily-team{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.daily-odd{justify-content:center;background:rgba(255,255,255,.055);color:#fff;font-size:12px;font-weight:900}.daily-odd.is-empty{color:#738096;background:rgba(255,255,255,.025)}.daily-detail-button{width:100%;min-height:34px;border:1px solid rgba(255,159,28,.28);border-radius:999px;background:rgba(3,8,23,.74);color:#f8fbff;cursor:pointer}.daily-extra{display:none;grid-column:1/-1;width:100%;box-sizing:border-box;margin:0;padding:12px;border:1px solid rgba(57,255,136,.2);border-radius:0 0 16px 16px;background:linear-gradient(180deg,rgba(5,12,30,.98),rgba(2,7,18,.98));overflow:hidden}.daily-extra.open{display:block}.daily-extra-title{display:block;margin:0 0 10px;color:#ffe08a;font-size:13px;font-weight:950}.daily-extra-category{margin:0 0 10px;border:1px solid rgba(255,224,138,.16);border-radius:14px;background:rgba(255,255,255,.028);overflow:hidden}.daily-extra-subtitle{padding:8px 10px;border-bottom:1px solid rgba(255,224,138,.14);background:rgba(255,224,138,.055);color:#ffe08a;font-size:11px;font-weight:950;text-transform:uppercase}.daily-extra-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding:10px}.daily-extra-grid.triple{grid-template-columns:repeat(3,minmax(0,1fr))}.daily-market-item{min-height:52px;display:flex;flex-direction:column;gap:6px;padding:8px 9px;border:1px solid rgba(255,255,255,.16);border-radius:12px;background:rgba(255,255,255,.045);overflow:hidden}.daily-market-name{color:#8fa0b5;font-size:11px;font-weight:800}.daily-market-value{color:#ffe08a;font-size:15px;font-weight:950;overflow-wrap:anywhere}.daily-extra-empty,.daily-widget-empty{padding:14px;border:1px dashed rgba(255,255,255,.14);border-radius:12px;color:#8fa0b5;font-size:13px;text-align:center}@media(max-width:720px){.daily-widget-shell{margin:16px 12px 0;padding:12px}.daily-match-table{min-width:760px}.daily-extra-grid,.daily-extra-grid.triple{grid-template-columns:repeat(2,minmax(0,1fr))}}
    `;
    document.head.appendChild(style);
  };

  const ensureWidget = () => {
    let widget = document.querySelector(`#${WIDGET_ID}`);
    if (!widget) {
      widget = document.createElement("section");
      widget.id = WIDGET_ID;
      const target = document.querySelector("#yaklasan-maclar") || document.querySelector("main");
      if (target && target.parentNode) target.parentNode.insertBefore(widget, target);
      else document.body.appendChild(widget);
    }
    widget.className = "daily-widget-shell";
    widget.innerHTML = `<div class="daily-widget-head"><div><h2 class="daily-widget-title">Bugünün Maçları</h2><p class="daily-widget-subtitle" data-daily-widget-date>Maç bülteni yükleniyor.</p></div><span class="daily-widget-count" data-daily-widget-count>0 maç</span></div><div class="daily-widget-list" data-daily-widget-list><div class="daily-widget-empty">Maç bülteni hazırlanıyor.</div></div>`;
    return widget;
  };

  const groupByTime = (matches) => {
    const groups = new Map();
    matches.forEach((match) => {
      const key = `${match.date || ""}|${match.time || "--:--"}`;
      if (!groups.has(key)) groups.set(key, { date: match.date || "", time: match.time || "--:--", items: [] });
      groups.get(key).items.push(match);
    });
    return [...groups.values()];
  };

  const renderRow = (match, index) => {
    const odds = mainOdds(match);
    const active = Object.values(odds).filter((value) => !empty(value)).length;
    return `<div class="daily-match-row" data-index="${index}" data-date="${esc(match.date || "")}" data-kickoff="${esc(match.time || "--:--")}" data-home="${esc(match.home || "Ev sahibi")}" data-away="${esc(match.away || "Deplasman")}">
      <div class="daily-match-time">${esc(match.time || "--:--")}</div>
      <div class="daily-match-teams"><small class="daily-match-league">${esc(match.league || "Diğer")}</small><span class="daily-team">${esc(match.home || "Ev sahibi")}</span><span>-</span><span class="daily-team">${esc(match.away || "Deplasman")}</span></div>
      <span class="daily-odd ${empty(odds.ms1) ? "is-empty" : ""}">${esc(oddText(odds.ms1))}</span>
      <span class="daily-odd ${empty(odds.msx) ? "is-empty" : ""}">${esc(oddText(odds.msx))}</span>
      <span class="daily-odd ${empty(odds.ms2) ? "is-empty" : ""}">${esc(oddText(odds.ms2))}</span>
      <span class="daily-odd ${empty(odds.under25) ? "is-empty" : ""}">${esc(oddText(odds.under25))}</span>
      <span class="daily-odd ${empty(odds.over25) ? "is-empty" : ""}">${esc(oddText(odds.over25))}</span>
      <span class="daily-odd ${empty(odds.bttsYes) ? "is-empty" : ""}">${esc(oddText(odds.bttsYes))}</span>
      <span class="daily-odd ${empty(odds.bttsNo) ? "is-empty" : ""}">${esc(oddText(odds.bttsNo))}</span>
      <span><button class="daily-detail-button" type="button" data-detail-index="${index}" aria-expanded="false">${active}/7 Detay</button></span>
    </div>`;
  };

  const renderGroup = (group, allMatches) => `<article class="daily-league-block"><div class="daily-league-head"><span class="daily-league-name">${esc(formatDate(group.date))} ${esc(group.time)} Maçları</span><span>${group.items.length} maç</span></div><div class="daily-table-scroll"><div class="daily-match-table"><div class="daily-match-header"><span>Saat</span><span>Maç</span><span>1</span><span>X</span><span>2</span><span>Alt</span><span>Üst</span><span>Var</span><span>Yok</span><span>Detay</span></div>${group.items.map((match) => renderRow(match, allMatches.indexOf(match))).join("")}</div></div></article>`;

  const render = (matches, sourceLabel) => {
    injectStyle();
    const widget = ensureWidget();
    const list = widget.querySelector("[data-daily-widget-list]");
    const count = widget.querySelector("[data-daily-widget-count]");
    const date = widget.querySelector("[data-daily-widget-date]");
    const bulletinMatches = matches.map(normalize).filter((match) => match.date && match.time && inBulletinWindow(match)).sort(compareByDateTime);
    window.__dailyMatchesData = bulletinMatches;
    if (date) date.textContent = `${formatDate(todayKey())} programı · ${sourceLabel}`;
    if (count) count.textContent = `${bulletinMatches.length} maç`;
    if (!bulletinMatches.length) {
      list.innerHTML = `<div class="daily-widget-empty">Güncel maç bülteni bekleniyor. Eski veri gösterilmiyor.</div>`;
      return;
    }
    list.innerHTML = groupByTime(bulletinMatches).map((group) => renderGroup(group, bulletinMatches)).join("");
  };

  const loadSource = async (source) => {
    const response = await fetch(`${source.url}?ts=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    const matches = Array.isArray(data) ? data : Array.isArray(data?.matches) ? data.matches : [];
    return { matches, label: source.label };
  };

  const load = async () => {
    for (const source of SOURCES) {
      try {
        const data = await loadSource(source);
        const usable = data.matches.map(normalize).filter((match) => match.date && match.time && inBulletinWindow(match));
        if (usable.length) return render(usable, data.label);
      } catch {}
    }
    render([], "Veri bekleniyor");
  };

  const closeAllDetails = () => {
    document.querySelectorAll(".daily-match-row.is-open").forEach((item) => item.classList.remove("is-open"));
    document.querySelectorAll(".daily-detail-button[aria-expanded='true']").forEach((button) => button.setAttribute("aria-expanded", "false"));
    document.querySelectorAll(".daily-extra").forEach((item) => item.remove());
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-detail-index]");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
    const row = button.closest(".daily-match-row");
    const index = Number(button.dataset.detailIndex);
    const match = window.__dailyMatchesData?.[index];
    if (!row || !match) return;
    const wasOpen = row.classList.contains("is-open") && row.nextElementSibling?.classList.contains("daily-extra");
    closeAllDetails();
    if (wasOpen) return;
    row.classList.add("is-open");
    button.setAttribute("aria-expanded", "true");
    const extra = document.createElement("div");
    extra.className = "daily-extra open";
    extra.innerHTML = `<strong class="daily-extra-title">Detaylı Oranlar</strong>${detailOdds(match)}`;
    row.after(extra);
  }, true);

  window.addEventListener("load", () => {
    load();
    setInterval(load, 5 * 60 * 1000);
  });
})();
