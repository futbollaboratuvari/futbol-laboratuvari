(() => {
  const INSTANCE_KEY = "__flDailyMatchesWidgetSingleton";
  const previous = window[INSTANCE_KEY];
  if (previous && typeof previous.cleanup === "function") previous.cleanup();

  const runtime = { timer: null, clickHandler: null, inputHandler: null, changeHandler: null };
  window[INSTANCE_KEY] = runtime;

  const WIDGET_ID = "daily-matches-widget";
  const SOURCES = [
    { url: "./data/full-bulletin.json", label: "Tam iddaa bülteni" },
    { url: "./data/live-matches.json", label: "Canlı maç akışı" },
    { url: "./data/fixtures.json", label: "Fikstür akışı" }
  ];

  const state = {
    allMatches: [],
    sourceLabel: "Veri bekleniyor",
    query: "",
    league: "all",
    selected: new Map(),
    lastRenderedCount: 0
  };

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const empty = (value) => {
    const text = String(value ?? "").trim();
    return !text || text === "-" || text === "—" || text.toLowerCase() === "null" || text.toLowerCase() === "undefined";
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
    day: "2-digit"
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
  const compareByDateTime = (a, b) => `${a.date || ""} ${a.time || ""} ${a.league || ""} ${a.home || ""}`.localeCompare(`${b.date || ""} ${b.time || ""} ${b.league || ""} ${b.home || ""}`, "tr");

  const normalize = (item, index = 0) => {
    const matchText = String(item?.match || item?.match_name || "");
    const split = matchText.split(/\s+-\s+|\s+VS\s+/i);
    const normalized = {
      ...item,
      _uid: String(item?._uid || item?.id || item?.matchCode || `${item?.date || ""}-${item?.time || ""}-${item?.home || item?.home_team_name || split[0] || "home"}-${item?.away || item?.away_team_name || split[1] || "away"}-${index}`),
      date: String(item?.date || item?.tarih || "").slice(0, 10),
      time: String(item?.time || item?.start_time || item?.saat || "--:--").trim(),
      league: item?.league || item?.competition_name || item?.lig || "Diğer",
      home: item?.home || item?.home_team_name || item?.ev_sahibi || split[0] || "Ev sahibi",
      away: item?.away || item?.away_team_name || item?.deplasman || split[1] || "Deplasman"
    };
    normalized.odds = {
      ...(item?.odds || {}),
      ms1: pick(normalized, ["ms1", "one", "oneOdd", "odd1", "ms_1"]),
      msx: pick(normalized, ["msx", "draw", "drawOdd", "oddX", "x", "ms_x"]),
      ms2: pick(normalized, ["ms2", "two", "twoOdd", "odd2", "ms_2"]),
      under25: pick(normalized, ["under25", "alt25", "under", "alt", "under25_guess", "alt_25"]),
      over25: pick(normalized, ["over25", "ust25", "over", "ust", "over25_guess", "ust_25"]),
      bttsYes: pick(normalized, ["bttsYes", "kgVar", "kg_var", "varOdd", "var", "bttsYes_guess"]),
      bttsNo: pick(normalized, ["bttsNo", "kgYok", "kg_yok", "yokOdd", "yok", "bttsNo_guess"])
    };
    return normalized;
  };

  const mainOdds = (match) => ({
    ms1: pick(match, ["ms1", "one", "oneOdd", "odd1", "ms_1"]),
    msx: pick(match, ["msx", "draw", "drawOdd", "oddX", "x", "ms_x"]),
    ms2: pick(match, ["ms2", "two", "twoOdd", "odd2", "ms_2"]),
    under25: pick(match, ["under25", "alt25", "under", "alt", "under25_guess", "alt_25"]),
    over25: pick(match, ["over25", "ust25", "over", "ust", "over25_guess", "ust_25"]),
    bttsYes: pick(match, ["bttsYes", "kgVar", "kg_var", "varOdd", "var", "bttsYes_guess"]),
    bttsNo: pick(match, ["bttsNo", "kgYok", "kg_yok", "yokOdd", "yok", "bttsNo_guess"])
  });

  const marketMap = (match) => {
    const odds = mainOdds(match);
    return {
      ms1: { short: "1", label: "Maç Sonucu 1", value: odds.ms1 },
      msx: { short: "X", label: "Maç Sonucu X", value: odds.msx },
      ms2: { short: "2", label: "Maç Sonucu 2", value: odds.ms2 },
      under25: { short: "Alt", label: "2.5 Alt", value: odds.under25 },
      over25: { short: "Üst", label: "2.5 Üst", value: odds.over25 },
      bttsYes: { short: "Var", label: "KG Var", value: odds.bttsYes },
      bttsNo: { short: "Yok", label: "KG Yok", value: odds.bttsNo }
    };
  };

  const market = (label, value) => empty(value)
    ? ""
    : `<div class="fl-extra-market"><span>${esc(label)}</span><b>${esc(value)}</b></div>`;

  const section = (title, html) => String(html || "").trim()
    ? `<section class="fl-extra-section"><div class="fl-extra-title">${esc(title)}</div><div class="fl-extra-grid">${html}</div></section>`
    : "";

  const detailOdds = (match) => {
    const kg = section("KG / Yarı KG",
      market("KG Var", pick(match, ["bttsYes", "kgVar", "kg_var", "varOdd", "var", "bttsYes_guess"])) +
      market("KG Yok", pick(match, ["bttsNo", "kgYok", "kg_yok", "yokOdd", "yok", "bttsNo_guess"])) +
      market("1Y KG Var", pick(match, ["firstHalfBttsYes", "iyKgVar", "iy_kg_var", "firstHalfBttsYes_guess"])) +
      market("2Y KG Var", pick(match, ["secondHalfBttsYes", "ikinciYariKgVar", "ikinci_yari_kg_var", "secondHalfBttsYes_guess"]))
    );
    const totals = section("Alt / Üst",
      market("2.5 Alt", pick(match, ["under25", "alt25", "under25_guess", "alt_25"])) +
      market("2.5 Üst", pick(match, ["over25", "ust25", "over25_guess", "ust_25"])) +
      market("3.5 Alt", pick(match, ["under35", "alt35", "under35_guess"])) +
      market("3.5 Üst", pick(match, ["over35", "ust35", "over35_guess"]))
    );
    const halfResult = section("İlk Yarı Sonucu",
      market("İY 1", pick(match, ["firstHalf1", "firstHalfOne", "iy1", "firstHalf1_guess"])) +
      market("İY X", pick(match, ["firstHalfX", "firstHalfDraw", "iyX", "firstHalfX_guess"])) +
      market("İY 2", pick(match, ["firstHalf2", "firstHalfTwo", "iy2", "firstHalf2_guess"]))
    );
    const candidates = Array.isArray(match.detail_market_candidates) ? match.detail_market_candidates.slice(0, 12) : [];
    const candidateHtml = candidates.map((item) => market(item.market || "Detay", Object.entries(item.values || {}).filter(([, value]) => !empty(value)).map(([key, value]) => `${key.replace(/_guess$/, "")}: ${value}`).join(" | "))).join("");
    const candidateSection = section("Diğer Marketler", candidateHtml);
    return kg + totals + halfResult + candidateSection || `<div class="fl-extra-empty">Bu maç için ek market verisi yok.</div>`;
  };

  const injectStyle = () => {
    if (document.querySelector("#daily-matches-widget-style")) return;
    const style = document.createElement("style");
    style.id = "daily-matches-widget-style";
    style.textContent = `
      .daily-widget-shell{position:relative;z-index:3;margin:22px clamp(12px,4vw,70px) 0;padding:0;border:1px solid rgba(255,221,0,.35);border-radius:18px;background:#073d3b;box-shadow:0 22px 70px rgba(0,0,0,.34);box-sizing:border-box;overflow:hidden;color:#f6fff8}.fl-bulletin-top{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:12px 14px;background:#ffd400;color:#083b38}.fl-bulletin-brand{display:flex;align-items:center;gap:10px;min-width:0}.fl-bulletin-logo{display:inline-flex;align-items:center;justify-content:center;width:42px;height:28px;border-radius:8px;background:#073d3b;color:#ffd400;font-size:13px;font-weight:1000}.fl-bulletin-title{margin:0;font-size:18px;font-weight:1000;letter-spacing:.02em}.fl-bulletin-subtitle{margin:2px 0 0;font-size:12px;font-weight:800;color:#31504f}.fl-bulletin-meta{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px}.fl-chip{display:inline-flex;align-items:center;gap:5px;padding:7px 10px;border-radius:999px;background:rgba(7,61,59,.12);color:#073d3b;font-size:12px;font-weight:950}.fl-bulletin-tabs{display:flex;gap:8px;padding:10px 14px;background:#0f5955;border-bottom:1px solid rgba(255,255,255,.12);overflow-x:auto}.fl-tab{flex:0 0 auto;padding:8px 12px;border:1px solid rgba(255,212,0,.35);border-radius:999px;background:rgba(255,255,255,.06);color:#eafff4;font-size:12px;font-weight:950}.fl-tab.active{background:#ffd400;color:#073d3b}.fl-bulletin-controls{display:grid;grid-template-columns:minmax(180px,1fr) minmax(160px,260px) auto;gap:10px;padding:12px 14px;background:#062d2c;border-bottom:1px solid rgba(255,255,255,.12)}.fl-bulletin-controls input,.fl-bulletin-controls select{width:100%;min-height:38px;border:1px solid rgba(255,255,255,.16);border-radius:10px;background:#f4fff8;color:#0a3634;padding:0 11px;font-weight:850;box-sizing:border-box}.fl-bulletin-refresh{border:1px solid rgba(255,212,0,.4);border-radius:10px;background:#ffd400;color:#073d3b;font-weight:1000;padding:0 14px;cursor:pointer}.fl-bulletin-layout{display:grid;grid-template-columns:minmax(0,1fr) 318px;align-items:start;gap:0;background:#083734}.fl-bulletin-main{min-width:0;padding:12px}.fl-table-scroll{width:100%;overflow-x:auto;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:#edf8f0}.fl-bulletin-table{min-width:980px;color:#062d2c}.fl-league-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:9px 11px;background:#d9efe3;border-top:1px solid #b5d5c7;border-bottom:1px solid #b5d5c7;color:#073d3b;font-size:12px;font-weight:1000;text-transform:uppercase}.fl-league-row:first-child{border-top:0}.fl-table-head,.fl-match-row{display:grid;grid-template-columns:58px 128px minmax(240px,1fr) repeat(7,64px) 82px;align-items:stretch}.fl-table-head{position:sticky;top:0;z-index:2;background:#0a4744;color:#fff7c2;font-size:11px;font-weight:1000;text-transform:uppercase}.fl-table-head span,.fl-match-row>*{display:flex;align-items:center;min-height:42px;padding:8px 7px;border-right:1px solid rgba(7,61,59,.13);border-bottom:1px solid rgba(7,61,59,.13);box-sizing:border-box}.fl-match-row{background:#f7fff9;font-size:12px}.fl-match-row:nth-child(even){background:#ebf8ef}.fl-match-row.is-open{background:#fff8d7}.fl-time{justify-content:center;font-weight:1000;color:#006447}.fl-league-cell{color:#2d5c57;font-size:11px;font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fl-teams{display:grid;gap:3px;min-width:0}.fl-teamline{display:flex;align-items:center;gap:8px;min-width:0;color:#092f2d;font-weight:950}.fl-team-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fl-code{font-size:10px;color:#65827c;font-weight:850}.fl-odd-button{width:100%;min-height:30px;border:1px solid rgba(0,100,71,.2);border-radius:7px;background:#fff;color:#083b38;font-size:12px;font-weight:1000;cursor:pointer}.fl-odd-button:hover,.fl-odd-button.selected{background:#ffd400;border-color:#d7a800;color:#073d3b}.fl-odd-empty{justify-content:center;color:#9aada6;background:rgba(255,255,255,.45);font-weight:900}.fl-detail-button{width:100%;min-height:30px;border:1px solid rgba(7,61,59,.3);border-radius:999px;background:#0f5955;color:#fff;font-size:11px;font-weight:950;cursor:pointer}.fl-extra{display:block;grid-column:1/-1;margin:0;padding:10px 11px;background:#062d2c;border-bottom:1px solid rgba(255,255,255,.12)}.fl-extra-inner{display:grid;gap:10px}.fl-extra-section{border:1px solid rgba(255,212,0,.24);border-radius:12px;overflow:hidden;background:rgba(255,255,255,.04)}.fl-extra-title{padding:8px 10px;background:rgba(255,212,0,.12);color:#ffe875;font-size:11px;font-weight:1000;text-transform:uppercase}.fl-extra-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding:9px}.fl-extra-market{display:grid;gap:4px;padding:8px;border:1px solid rgba(255,255,255,.12);border-radius:9px;background:rgba(255,255,255,.06)}.fl-extra-market span{font-size:11px;color:#b8d2ca;font-weight:850}.fl-extra-market b{font-size:14px;color:#ffd400}.fl-extra-empty,.fl-empty{padding:16px;border:1px dashed rgba(255,255,255,.2);border-radius:12px;text-align:center;color:#b8d2ca;font-size:13px}.fl-slip{position:sticky;top:12px;min-height:360px;padding:12px;border-left:1px solid rgba(255,255,255,.12);background:#092c2b}.fl-slip-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}.fl-slip-title{font-size:16px;font-weight:1000;color:#ffd400}.fl-slip-count{padding:6px 9px;border-radius:999px;background:rgba(255,212,0,.14);color:#ffe875;font-size:12px;font-weight:950}.fl-slip-empty{padding:18px 12px;border:1px dashed rgba(255,255,255,.18);border-radius:12px;color:#afc8c0;text-align:center;font-size:13px}.fl-slip-list{display:grid;gap:9px}.fl-slip-item{display:grid;gap:7px;padding:10px;border:1px solid rgba(255,255,255,.14);border-radius:12px;background:rgba(255,255,255,.05)}.fl-slip-match{color:#f6fff8;font-size:12px;font-weight:950}.fl-slip-market{display:flex;align-items:center;justify-content:space-between;gap:10px;color:#ffd400;font-size:13px;font-weight:1000}.fl-slip-remove{border:0;background:transparent;color:#ffb7a8;cursor:pointer;font-weight:1000}.fl-slip-footer{margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.12);color:#b8d2ca;font-size:12px}.fl-widget-empty{padding:22px;margin:0;border-radius:14px;background:#062d2c;color:#b8d2ca;text-align:center}@media(max-width:980px){.fl-bulletin-layout{grid-template-columns:1fr}.fl-slip{position:relative;top:auto;border-left:0;border-top:1px solid rgba(255,255,255,.12)}.fl-bulletin-controls{grid-template-columns:1fr}.fl-bulletin-top{grid-template-columns:1fr}.fl-bulletin-meta{justify-content:flex-start}.daily-widget-shell{margin:16px 10px 0}.fl-extra-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.fl-bulletin-title{font-size:16px}.fl-table-head,.fl-match-row{grid-template-columns:54px 112px minmax(210px,1fr) repeat(7,60px) 76px}.fl-bulletin-table{min-width:900px}}
    `;
    document.head.appendChild(style);
  };

  const ensureWidget = () => {
    const duplicates = [...document.querySelectorAll(`#${WIDGET_ID}`)];
    duplicates.slice(1).forEach((item) => item.remove());
    let widget = duplicates[0];
    if (!widget) {
      widget = document.createElement("section");
      widget.id = WIDGET_ID;
      const target = document.querySelector("#yaklasan-maclar") || document.querySelector("main");
      if (target && target.parentNode) target.parentNode.insertBefore(widget, target);
      else document.body.appendChild(widget);
    }
    widget.className = "daily-widget-shell";
    if (widget.dataset.ready !== "nesine-v1") {
      widget.dataset.ready = "nesine-v1";
      widget.innerHTML = `
        <div class="fl-bulletin-top">
          <div class="fl-bulletin-brand"><span class="fl-bulletin-logo">FL</span><div><h2 class="fl-bulletin-title">Futbol Laboratuvarı Bülten</h2><p class="fl-bulletin-subtitle" data-bulletin-date>Bugünün maçları hazırlanıyor.</p></div></div>
          <div class="fl-bulletin-meta"><span class="fl-chip" data-bulletin-source>Veri bekleniyor</span><span class="fl-chip" data-bulletin-count>0 maç</span></div>
        </div>
        <div class="fl-bulletin-tabs" aria-label="Spor bülteni sekmeleri"><span class="fl-tab active">Futbol</span><span class="fl-tab">Canlı Veri</span><span class="fl-tab">Kupon</span><span class="fl-tab">Detaylı Oran</span></div>
        <div class="fl-bulletin-controls"><input class="fl-bulletin-search" type="search" placeholder="Maç veya takım ara" autocomplete="off" /><select class="fl-bulletin-league" aria-label="Lig filtresi"><option value="all">Tüm Ligler</option></select><button class="fl-bulletin-refresh" type="button" data-bulletin-refresh>Yenile</button></div>
        <div class="fl-bulletin-layout"><div class="fl-bulletin-main" data-bulletin-list><div class="fl-widget-empty">Bülten yükleniyor.</div></div><aside class="fl-slip" data-slip-panel></aside></div>
      `;
    }
    return widget;
  };

  const renderLeagueOptions = () => {
    const widget = ensureWidget();
    const select = widget.querySelector(".fl-bulletin-league");
    if (!select) return;
    const leagues = [...new Set(state.allMatches.map((match) => match.league).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b), "tr"));
    const current = state.league;
    select.innerHTML = `<option value="all">Tüm Ligler</option>${leagues.map((league) => `<option value="${esc(league)}">${esc(league)}</option>`).join("")}`;
    select.value = leagues.includes(current) ? current : "all";
    state.league = select.value;
  };

  const filteredMatches = () => {
    const query = state.query.trim().toLocaleLowerCase("tr");
    return state.allMatches.filter((match) => {
      const leagueOk = state.league === "all" || match.league === state.league;
      const haystack = `${match.home} ${match.away} ${match.league} ${match.matchCode || ""}`.toLocaleLowerCase("tr");
      const queryOk = !query || haystack.includes(query);
      return leagueOk && queryOk;
    });
  };

  const groupMatches = (matches) => {
    const groups = new Map();
    matches.forEach((match) => {
      const key = `${match.date}|${match.league}`;
      if (!groups.has(key)) groups.set(key, { date: match.date, league: match.league, items: [] });
      groups.get(key).items.push(match);
    });
    return [...groups.values()];
  };

  const selectedKey = (uid, marketKey) => `${uid}__${marketKey}`;

  const renderOddButton = (match, marketKey, option) => {
    if (!option || empty(option.value)) return `<span class="fl-odd-empty">—</span>`;
    const key = selectedKey(match._uid, marketKey);
    const isSelected = state.selected.has(key);
    return `<button class="fl-odd-button ${isSelected ? "selected" : ""}" type="button" data-select-market="${marketKey}" data-select-uid="${esc(match._uid)}" aria-pressed="${isSelected ? "true" : "false"}">${esc(oddText(option.value))}</button>`;
  };

  const renderRow = (match) => {
    const markets = marketMap(match);
    const active = Object.values(markets).filter((option) => !empty(option.value)).length;
    return `<div class="fl-match-row" data-uid="${esc(match._uid)}" data-date="${esc(match.date)}" data-kickoff="${esc(match.time)}">
      <div class="fl-time">${esc(match.time || "--:--")}</div>
      <div class="fl-league-cell" title="${esc(match.league || "Diğer")}">${esc(match.league || "Diğer")}</div>
      <div class="fl-teams"><div class="fl-teamline"><span class="fl-team-name">${esc(match.home || "Ev sahibi")}</span><span>-</span><span class="fl-team-name">${esc(match.away || "Deplasman")}</span></div><div class="fl-code">${esc(match.matchCode ? `Kod: ${match.matchCode}` : `${formatDate(match.date)} · ${match.status || "scheduled"}`)}</div></div>
      <div>${renderOddButton(match, "ms1", markets.ms1)}</div>
      <div>${renderOddButton(match, "msx", markets.msx)}</div>
      <div>${renderOddButton(match, "ms2", markets.ms2)}</div>
      <div>${renderOddButton(match, "under25", markets.under25)}</div>
      <div>${renderOddButton(match, "over25", markets.over25)}</div>
      <div>${renderOddButton(match, "bttsYes", markets.bttsYes)}</div>
      <div>${renderOddButton(match, "bttsNo", markets.bttsNo)}</div>
      <div><button class="fl-detail-button" type="button" data-detail-uid="${esc(match._uid)}" aria-expanded="false">${active}/7 Detay</button></div>
    </div>`;
  };

  const renderGroup = (group) => `<div class="fl-league-row"><span>${esc(formatDate(group.date))} · ${esc(group.league || "Diğer")}</span><span>${group.items.length} maç</span></div>${group.items.map(renderRow).join("")}`;

  const renderSlip = () => {
    const widget = ensureWidget();
    const panel = widget.querySelector("[data-slip-panel]");
    if (!panel) return;
    const picks = [...state.selected.values()];
    panel.innerHTML = `<div class="fl-slip-head"><div class="fl-slip-title">Kuponum</div><span class="fl-slip-count">${picks.length} seçim</span></div>` +
      (picks.length
        ? `<div class="fl-slip-list">${picks.map((pick) => `<div class="fl-slip-item"><div class="fl-slip-match">${esc(pick.home)} - ${esc(pick.away)}</div><div class="fl-slip-market"><span>${esc(pick.label)}</span><b>${esc(pick.value)}</b><button class="fl-slip-remove" type="button" data-remove-pick="${esc(pick.key)}">Sil</button></div></div>`).join("")}</div><div class="fl-slip-footer">Bu alan seçim takibi içindir; eski/fake kupon verisi üretilmez.</div>`
        : `<div class="fl-slip-empty">Orana tıklayınca seçim burada listelenir.</div><div class="fl-slip-footer">Nesine benzeri sağ kupon alanı sadeleştirildi.</div>`);
  };

  const renderView = () => {
    injectStyle();
    const widget = ensureWidget();
    const list = widget.querySelector("[data-bulletin-list]");
    const count = widget.querySelector("[data-bulletin-count]");
    const source = widget.querySelector("[data-bulletin-source]");
    const date = widget.querySelector("[data-bulletin-date]");
    const matches = filteredMatches();
    state.lastRenderedCount = matches.length;
    widget.dataset.bulletinSource = state.sourceLabel;
    widget.dataset.bulletinCount = String(matches.length);
    if (source) source.textContent = state.sourceLabel;
    if (count) count.textContent = `${matches.length} maç`;
    if (date) date.textContent = `${formatDate(todayKey())} programı · bugün ve yarın 08:00 öncesi`;
    if (!list) return;
    if (!matches.length) {
      list.innerHTML = `<div class="fl-widget-empty">Güncel maç bülteni bekleniyor. Eski veri gösterilmiyor.</div>`;
      renderSlip();
      return;
    }
    list.innerHTML = `<div class="fl-table-scroll"><div class="fl-bulletin-table"><div class="fl-table-head"><span>Saat</span><span>Lig</span><span>Maç</span><span>1</span><span>X</span><span>2</span><span>Alt</span><span>Üst</span><span>Var</span><span>Yok</span><span>Detay</span></div>${groupMatches(matches).map(renderGroup).join("")}</div></div>`;
    renderSlip();
  };

  const setMatches = (matches, sourceLabel) => {
    state.sourceLabel = sourceLabel;
    state.allMatches = matches.map(normalize).filter((match) => match.date && match.time && inBulletinWindow(match)).sort(compareByDateTime);
    window.__dailyMatchesData = state.allMatches;
    renderLeagueOptions();
    renderView();
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
        if (usable.length) return setMatches(data.matches, data.label);
      } catch {}
    }
    setMatches([], "Veri bekleniyor");
  };

  const closeAllDetails = () => {
    document.querySelectorAll(".fl-match-row.is-open").forEach((item) => item.classList.remove("is-open"));
    document.querySelectorAll(".fl-detail-button[aria-expanded='true']").forEach((button) => button.setAttribute("aria-expanded", "false"));
    document.querySelectorAll(".fl-extra").forEach((item) => item.remove());
  };

  const handleClick = (event) => {
    const refresh = event.target.closest?.("[data-bulletin-refresh]");
    if (refresh) {
      event.preventDefault();
      load();
      return;
    }
    const remove = event.target.closest?.("[data-remove-pick]");
    if (remove) {
      event.preventDefault();
      state.selected.delete(remove.dataset.removePick);
      renderView();
      return;
    }
    const odd = event.target.closest?.("[data-select-market]");
    if (odd) {
      event.preventDefault();
      const match = state.allMatches.find((item) => item._uid === odd.dataset.selectUid);
      if (!match) return;
      const option = marketMap(match)[odd.dataset.selectMarket];
      if (!option || empty(option.value)) return;
      const key = selectedKey(match._uid, odd.dataset.selectMarket);
      if (state.selected.has(key)) state.selected.delete(key);
      else state.selected.set(key, { key, uid: match._uid, home: match.home, away: match.away, label: option.label, value: option.value });
      renderView();
      return;
    }
    const button = event.target.closest?.("[data-detail-uid]");
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
    const row = button.closest(".fl-match-row");
    const match = state.allMatches.find((item) => item._uid === button.dataset.detailUid);
    if (!row || !match) return;
    const wasOpen = row.classList.contains("is-open") && row.nextElementSibling?.classList.contains("fl-extra");
    closeAllDetails();
    if (wasOpen) return;
    row.classList.add("is-open");
    button.setAttribute("aria-expanded", "true");
    const extra = document.createElement("div");
    extra.className = "fl-extra";
    extra.innerHTML = `<div class="fl-extra-inner">${detailOdds(match)}</div>`;
    row.after(extra);
  };

  const handleInput = (event) => {
    if (!event.target.matches?.(".fl-bulletin-search")) return;
    state.query = event.target.value || "";
    renderView();
  };

  const handleChange = (event) => {
    if (!event.target.matches?.(".fl-bulletin-league")) return;
    state.league = event.target.value || "all";
    renderView();
  };

  const start = () => {
    ensureWidget();
    load();
    if (runtime.timer) clearInterval(runtime.timer);
    runtime.timer = setInterval(load, 5 * 60 * 1000);
  };

  runtime.clickHandler = handleClick;
  runtime.inputHandler = handleInput;
  runtime.changeHandler = handleChange;
  runtime.cleanup = () => {
    if (runtime.timer) clearInterval(runtime.timer);
    if (runtime.clickHandler) document.removeEventListener("click", runtime.clickHandler, true);
    if (runtime.inputHandler) document.removeEventListener("input", runtime.inputHandler, true);
    if (runtime.changeHandler) document.removeEventListener("change", runtime.changeHandler, true);
  };

  document.addEventListener("click", handleClick, true);
  document.addEventListener("input", handleInput, true);
  document.addEventListener("change", handleChange, true);
  if (document.readyState === "complete" || document.readyState === "interactive") start();
  else window.addEventListener("load", start, { once: true });
})();
