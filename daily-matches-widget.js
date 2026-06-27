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
    byUid: new Map(),
    sourceLabel: "Veri bekleniyor",
    mode: "all",
    query: "",
    league: "all",
    selected: new Map(),
    stake: "",
    couponCreated: false
  };

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const isEmpty = (value) => {
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
      if (!isEmpty(value)) return value;
    }
    return "";
  };

  const parseOdd = (value) => {
    const text = String(value ?? "").replace(",", ".").match(/\d+(?:\.\d+)?/);
    const number = text ? Number(text[0]) : NaN;
    return Number.isFinite(number) && number > 0 ? number : null;
  };

  const money = (value) => Number.isFinite(value) ? `${value.toFixed(2)} ₺` : "—";
  const oddFormat = (value) => Number.isFinite(value) ? value.toFixed(2) : "—";

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
    return match.date === today || (match.date === tomorrow && minute !== null && minute < 8 * 60);
  };

  const formatDate = (dateKey) => {
    if (!dateKey || !String(dateKey).includes("-")) return "Bugün";
    const [year, month, day] = String(dateKey).split("-");
    return `${day}.${month}.${year}`;
  };

  const scoreText = (match) => {
    if (!isEmpty(match.score)) return String(match.score);
    const home = match.home_score ?? match.score_home ?? match.goals_home ?? match.homeGoals;
    const away = match.away_score ?? match.score_away ?? match.goals_away ?? match.awayGoals;
    if (!isEmpty(home) || !isEmpty(away)) return `${home ?? 0}-${away ?? 0}`;
    return "";
  };

  const liveMinute = (match) => {
    const raw = match.minute ?? match.matchMinute ?? match.elapsed ?? match.live_minute ?? match.liveMinute;
    const text = String(raw ?? "").replace(/[^0-9+]/g, "");
    return text ? `${text}'` : "";
  };

  const isLiveMatch = (match) => {
    const status = String(match.status || match.status_short || match.match_status || "").trim().toLowerCase();
    const liveWords = ["live", "in_play", "inplay", "playing", "1h", "2h", "ht", "first_half", "second_half", "devam", "canlı", "basladi", "başladı"];
    if (liveWords.some((word) => status.includes(word))) return true;
    if (!isEmpty(liveMinute(match))) return true;
    if (!isEmpty(scoreText(match)) && !["scheduled", "not_started", "ns", "fixture"].some((word) => status.includes(word))) return true;
    return false;
  };

  const statusCell = (match) => {
    if (!isLiveMatch(match)) return `<span class="fl-time-scheduled">${esc(match.time || "--:--")}</span>`;
    return `<span class="fl-live-badge">CANLI</span><strong class="fl-live-minute">${esc(liveMinute(match) || "LIVE")}</strong><small class="fl-live-score">${esc(scoreText(match) || "0-0")}</small>`;
  };

  const normalize = (item, index = 0) => {
    const matchText = String(item?.match || item?.match_name || "");
    const split = matchText.split(/\s+-\s+|\s+VS\s+/i);
    const normalized = {
      ...item,
      date: String(item?.date || item?.tarih || "").slice(0, 10),
      time: String(item?.time || item?.start_time || item?.saat || "--:--").trim(),
      league: item?.league || item?.competition_name || item?.lig || "Diğer",
      home: item?.home || item?.home_team_name || item?.ev_sahibi || split[0] || "Ev sahibi",
      away: item?.away || item?.away_team_name || item?.deplasman || split[1] || "Deplasman"
    };
    normalized._uid = String(item?._uid || item?.id || item?.match_id || item?.fixture_id || item?.matchCode || `${normalized.date}-${normalized.time}-${normalized.home}-${normalized.away}-${index}`);
    return normalized;
  };

  const marketMap = (match) => ({
    ms1: { short: "1", label: "Maç Sonucu 1", value: pick(match, ["ms1", "one", "oneOdd", "odd1", "ms_1"]) },
    msx: { short: "X", label: "Maç Sonucu X", value: pick(match, ["msx", "draw", "drawOdd", "oddX", "x", "ms_x"]) },
    ms2: { short: "2", label: "Maç Sonucu 2", value: pick(match, ["ms2", "two", "twoOdd", "odd2", "ms_2"]) },
    under25: { short: "Alt", label: "2.5 Alt", value: pick(match, ["under25", "alt25", "under", "alt", "under25_guess", "alt_25"]) },
    over25: { short: "Üst", label: "2.5 Üst", value: pick(match, ["over25", "ust25", "over", "ust", "over25_guess", "ust_25"]) },
    bttsYes: { short: "Var", label: "KG Var", value: pick(match, ["bttsYes", "kgVar", "kg_var", "varOdd", "var", "bttsYes_guess"]) },
    bttsNo: { short: "Yok", label: "KG Yok", value: pick(match, ["bttsNo", "kgYok", "kg_yok", "yokOdd", "yok", "bttsNo_guess"]) }
  });

  const market = (label, value) => isEmpty(value) ? "" : `<div class="fl-extra-market"><span>${esc(label)}</span><b>${esc(value)}</b></div>`;
  const section = (title, html) => String(html || "").trim() ? `<section class="fl-extra-section"><div class="fl-extra-title">${esc(title)}</div><div class="fl-extra-grid">${html}</div></section>` : "";
  const detailOdds = (match) => section("KG / Yarı KG", market("KG Var", pick(match, ["bttsYes", "kgVar", "kg_var", "varOdd", "var", "bttsYes_guess"])) + market("KG Yok", pick(match, ["bttsNo", "kgYok", "kg_yok", "yokOdd", "yok", "bttsNo_guess"])) + market("1Y KG Var", pick(match, ["firstHalfBttsYes", "iyKgVar", "iy_kg_var", "firstHalfBttsYes_guess"])) + market("2Y KG Var", pick(match, ["secondHalfBttsYes", "ikinciYariKgVar", "ikinci_yari_kg_var", "secondHalfBttsYes_guess"]))) + section("Alt / Üst", market("2.5 Alt", pick(match, ["under25", "alt25", "under25_guess", "alt_25"])) + market("2.5 Üst", pick(match, ["over25", "ust25", "over25_guess", "ust_25"])) + market("3.5 Alt", pick(match, ["under35", "alt35", "under35_guess"])) + market("3.5 Üst", pick(match, ["over35", "ust35", "over35_guess"]))) || `<div class="fl-extra-empty">Bu maç için ek market verisi yok.</div>`;

  const injectStyle = () => {
    if (document.querySelector("#daily-matches-widget-style")) return;
    const style = document.createElement("style");
    style.id = "daily-matches-widget-style";
    style.textContent = `
      .daily-widget-shell{position:relative;z-index:3;margin:22px clamp(12px,4vw,70px) 0;border:1px solid rgba(255,221,0,.35);border-radius:18px;background:#073d3b;box-shadow:0 22px 70px rgba(0,0,0,.34);overflow:hidden;color:#f6fff8}.fl-bulletin-top{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:12px 14px;background:#ffd400;color:#083b38}.fl-bulletin-title{margin:0;font-size:18px;font-weight:1000}.fl-bulletin-subtitle{margin:2px 0 0;font-size:12px;font-weight:800;color:#31504f}.fl-bulletin-meta{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px}.fl-chip{display:inline-flex;padding:7px 10px;border-radius:999px;background:rgba(7,61,59,.12);color:#073d3b;font-size:12px;font-weight:950}.fl-bulletin-tabs{display:flex;gap:8px;padding:10px 14px;background:#0f5955;border-bottom:1px solid rgba(255,255,255,.12);overflow-x:auto}.fl-tab{padding:8px 12px;border:1px solid rgba(255,212,0,.35);border-radius:999px;background:rgba(255,255,255,.06);color:#eafff4;font-size:12px;font-weight:950;cursor:pointer}.fl-tab.active{background:#ffd400;color:#073d3b}.fl-bulletin-controls{display:grid;grid-template-columns:minmax(180px,1fr) minmax(160px,260px) auto;gap:10px;padding:12px 14px;background:#062d2c;border-bottom:1px solid rgba(255,255,255,.12)}.fl-bulletin-controls input,.fl-bulletin-controls select,.fl-slip-stake{width:100%;min-height:38px;border:1px solid rgba(255,255,255,.16);border-radius:10px;background:#f4fff8;color:#0a3634;padding:0 11px;font-weight:850;box-sizing:border-box}.fl-bulletin-refresh,.fl-slip-create,.fl-slip-clear{border:1px solid rgba(255,212,0,.4);border-radius:10px;background:#ffd400;color:#073d3b;font-weight:1000;padding:0 14px;min-height:38px;cursor:pointer}.fl-slip-clear{background:rgba(255,255,255,.08);color:#ffe875}.fl-slip-create:disabled{opacity:.45;cursor:not-allowed}.fl-bulletin-layout{display:grid;grid-template-columns:minmax(0,1fr) 318px;background:#083734}.fl-bulletin-main{min-width:0;padding:12px}.fl-table-scroll{width:100%;overflow-x:auto;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:#edf8f0}.fl-bulletin-table{min-width:980px;color:#062d2c}.fl-league-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:9px 11px;background:#d9efe3;border-top:1px solid #b5d5c7;border-bottom:1px solid #b5d5c7;color:#073d3b;font-size:12px;font-weight:1000;text-transform:uppercase}.fl-table-head,.fl-match-row{display:grid;grid-template-columns:70px 128px minmax(240px,1fr) repeat(7,64px) 82px;align-items:stretch}.fl-table-head{position:sticky;top:0;z-index:2;background:#0a4744;color:#fff7c2;font-size:11px;font-weight:1000;text-transform:uppercase}.fl-table-head span,.fl-match-row>*{display:flex;align-items:center;min-height:42px;padding:8px 7px;border-right:1px solid rgba(7,61,59,.13);border-bottom:1px solid rgba(7,61,59,.13);box-sizing:border-box}.fl-match-row{background:#f7fff9;font-size:12px}.fl-match-row:nth-child(even){background:#ebf8ef}.fl-match-row.is-live{background:#fffbea}.fl-match-row.is-open{background:#fff8d7}.fl-status-cell{justify-content:center;flex-direction:column;gap:2px}.fl-time-scheduled{font-weight:1000;color:#006447}.fl-live-badge{display:inline-flex;padding:2px 6px;border-radius:999px;background:#e0002a;color:#fff;font-size:9px;font-weight:1000}.fl-live-minute{font-size:12px;color:#e0002a}.fl-live-score{font-size:11px;color:#062d2c;font-weight:1000}.fl-league-cell{color:#2d5c57;font-size:11px;font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fl-teams{display:grid;gap:3px;min-width:0}.fl-teamline{display:flex;align-items:center;gap:8px;min-width:0;color:#092f2d;font-weight:950}.fl-team-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.fl-code{font-size:10px;color:#65827c;font-weight:850}.fl-odd-button{width:100%;min-height:30px;border:1px solid rgba(0,100,71,.2);border-radius:7px;background:#fff;color:#083b38;font-size:12px;font-weight:1000;cursor:pointer}.fl-odd-button:hover,.fl-odd-button.selected{background:#ffd400;border-color:#d7a800;color:#073d3b}.fl-odd-empty{justify-content:center;color:#9aada6;background:rgba(255,255,255,.45);font-weight:900}.fl-detail-button{width:100%;min-height:30px;border:1px solid rgba(7,61,59,.3);border-radius:999px;background:#0f5955;color:#fff;font-size:11px;font-weight:950;cursor:pointer}.fl-extra{display:block;grid-column:1/-1;margin:0;padding:10px 11px;background:#062d2c;border-bottom:1px solid rgba(255,255,255,.12)}.fl-extra-section{border:1px solid rgba(255,212,0,.24);border-radius:12px;overflow:hidden;background:rgba(255,255,255,.04);margin-bottom:10px}.fl-extra-title{padding:8px 10px;background:rgba(255,212,0,.12);color:#ffe875;font-size:11px;font-weight:1000}.fl-extra-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding:9px}.fl-extra-market{display:grid;gap:4px;padding:8px;border:1px solid rgba(255,255,255,.12);border-radius:9px;background:rgba(255,255,255,.06)}.fl-extra-market span{font-size:11px;color:#b8d2ca}.fl-extra-market b{font-size:14px;color:#ffd400}.fl-widget-empty,.fl-extra-empty{padding:16px;border:1px dashed rgba(255,255,255,.2);border-radius:12px;text-align:center;color:#b8d2ca;font-size:13px}.fl-slip{position:sticky;top:12px;min-height:360px;padding:12px;border-left:1px solid rgba(255,255,255,.12);background:#092c2b}.fl-slip-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px}.fl-slip-title{font-size:16px;font-weight:1000;color:#ffd400}.fl-slip-count{padding:6px 9px;border-radius:999px;background:rgba(255,212,0,.14);color:#ffe875;font-size:12px;font-weight:950}.fl-slip-empty{padding:18px 12px;border:1px dashed rgba(255,255,255,.18);border-radius:12px;color:#afc8c0;text-align:center;font-size:13px}.fl-slip-list{display:grid;gap:9px}.fl-slip-item{display:grid;gap:7px;padding:10px;border:1px solid rgba(255,255,255,.14);border-radius:12px;background:rgba(255,255,255,.05)}.fl-slip-match{color:#f6fff8;font-size:12px;font-weight:950}.fl-slip-market{display:flex;align-items:center;justify-content:space-between;gap:10px;color:#ffd400;font-size:13px;font-weight:1000}.fl-slip-remove{border:0;background:transparent;color:#ffb7a8;cursor:pointer;font-weight:1000}.fl-slip-summary{display:grid;gap:9px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.12)}.fl-slip-row{display:flex;justify-content:space-between;gap:10px;color:#b8d2ca;font-size:12px}.fl-slip-row b{color:#ffd400}.fl-slip-actions{display:grid;grid-template-columns:1fr 88px;gap:8px}.fl-slip-ok{padding:9px 10px;border-radius:10px;background:rgba(0,210,120,.16);color:#9dffd0;font-size:12px;font-weight:950;text-align:center}.fl-slip-footer{margin-top:10px;color:#b8d2ca;font-size:12px}@media(max-width:980px){.fl-bulletin-layout{grid-template-columns:1fr}.fl-slip{position:relative;top:auto;border-left:0;border-top:1px solid rgba(255,255,255,.12)}.fl-bulletin-controls{grid-template-columns:1fr}.fl-bulletin-top{grid-template-columns:1fr}.fl-bulletin-meta{justify-content:flex-start}.daily-widget-shell{margin:16px 10px 0}.fl-extra-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){.fl-bulletin-title{font-size:16px}.fl-table-head,.fl-match-row{grid-template-columns:66px 112px minmax(210px,1fr) repeat(7,60px) 76px}.fl-bulletin-table{min-width:930px}}
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
    if (widget.dataset.ready !== "coupon-build-v1") {
      widget.dataset.ready = "coupon-build-v1";
      widget.innerHTML = `<div class="fl-bulletin-top"><div><h2 class="fl-bulletin-title">Futbol Laboratuvarı Bülten</h2><p class="fl-bulletin-subtitle" data-bulletin-date>Bugünün maçları hazırlanıyor.</p></div><div class="fl-bulletin-meta"><span class="fl-chip" data-bulletin-source>Veri bekleniyor</span><span class="fl-chip" data-bulletin-count>0 maç</span><span class="fl-chip" data-live-count>0 canlı</span></div></div><div class="fl-bulletin-tabs" aria-label="Bülten görünümü"><button class="fl-tab active" type="button" data-bulletin-mode="all">Tüm Bülten</button><button class="fl-tab" type="button" data-bulletin-mode="live">Canlı</button><span class="fl-tab">Kupon</span><span class="fl-tab">Detaylı Oran</span></div><div class="fl-bulletin-controls"><input class="fl-bulletin-search" type="search" placeholder="Maç veya takım ara" autocomplete="off" /><select class="fl-bulletin-league" aria-label="Lig filtresi"><option value="all">Tüm Ligler</option></select><button class="fl-bulletin-refresh" type="button" data-bulletin-refresh>Yenile</button></div><div class="fl-bulletin-layout"><div class="fl-bulletin-main" data-bulletin-list><div class="fl-widget-empty">Bülten yükleniyor.</div></div><aside class="fl-slip" data-slip-panel></aside></div>`;
    }
    return widget;
  };

  const updateTabs = () => {
    const widget = ensureWidget();
    widget.querySelectorAll("[data-bulletin-mode]").forEach((button) => {
      const active = button.dataset.bulletinMode === state.mode;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
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

  const visibleMatches = () => {
    const query = state.query.trim().toLocaleLowerCase("tr");
    return state.allMatches.filter((match) => {
      if (state.mode === "live" && !isLiveMatch(match)) return false;
      if (state.league !== "all" && match.league !== state.league) return false;
      const haystack = `${match.home} ${match.away} ${match.league} ${match.matchCode || ""}`.toLocaleLowerCase("tr");
      return !query || haystack.includes(query);
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

  const getPick = (uid) => state.selected.get(String(uid));

  const renderOddButton = (match, marketKey, option) => {
    if (!option || isEmpty(option.value)) return `<span class="fl-odd-empty">—</span>`;
    const pick = getPick(match._uid);
    const selected = pick?.marketKey === marketKey;
    return `<button class="fl-odd-button ${selected ? "selected" : ""}" type="button" data-select-uid="${esc(match._uid)}" data-select-index="${match._index}" data-select-market="${marketKey}" data-select-label="${esc(option.label)}" data-select-value="${esc(option.value)}" aria-pressed="${selected ? "true" : "false"}">${esc(option.value)}</button>`;
  };

  const renderRow = (match) => {
    const markets = marketMap(match);
    const active = Object.values(markets).filter((option) => !isEmpty(option.value)).length;
    return `<div class="fl-match-row ${isLiveMatch(match) ? "is-live" : ""}" data-uid="${esc(match._uid)}" data-index="${match._index}"><div class="fl-status-cell">${statusCell(match)}</div><div class="fl-league-cell" title="${esc(match.league)}">${esc(match.league)}</div><div class="fl-teams"><div class="fl-teamline"><span class="fl-team-name">${esc(match.home)}</span><span>-</span><span class="fl-team-name">${esc(match.away)}</span></div><div class="fl-code">${esc(match.matchCode ? `Kod: ${match.matchCode}` : `${formatDate(match.date)} · ${match.status || "scheduled"}`)}</div></div><div>${renderOddButton(match, "ms1", markets.ms1)}</div><div>${renderOddButton(match, "msx", markets.msx)}</div><div>${renderOddButton(match, "ms2", markets.ms2)}</div><div>${renderOddButton(match, "under25", markets.under25)}</div><div>${renderOddButton(match, "over25", markets.over25)}</div><div>${renderOddButton(match, "bttsYes", markets.bttsYes)}</div><div>${renderOddButton(match, "bttsNo", markets.bttsNo)}</div><div><button class="fl-detail-button" type="button" data-detail-uid="${esc(match._uid)}" aria-expanded="false">${active}/7 Detay</button></div></div>`;
  };

  const renderGroup = (group) => `<div class="fl-league-row"><span>${esc(formatDate(group.date))} · ${esc(group.league)}</span><span>${group.items.length} maç</span></div>${group.items.map(renderRow).join("")}`;

  const slipTotals = () => {
    const picks = [...state.selected.values()];
    const odds = picks.map((pick) => parseOdd(pick.value)).filter(Boolean);
    const totalOdd = odds.length === picks.length && odds.length ? odds.reduce((total, odd) => total * odd, 1) : null;
    const stake = Number(String(state.stake || "").replace(",", "."));
    const validStake = Number.isFinite(stake) && stake > 0 ? stake : null;
    return { picks, totalOdd, stake: validStake, possible: totalOdd && validStake ? totalOdd * validStake : null };
  };

  const renderSlip = () => {
    const widget = ensureWidget();
    const panel = widget.querySelector("[data-slip-panel]");
    if (!panel) return;
    const { picks, totalOdd, stake, possible } = slipTotals();
    panel.innerHTML = `<div class="fl-slip-head"><div class="fl-slip-title">Kuponum</div><span class="fl-slip-count">${picks.length} seçim</span></div>` + (picks.length ? `<div class="fl-slip-list">${picks.map((pick) => `<div class="fl-slip-item" data-slip-uid="${esc(pick.uid)}"><div class="fl-slip-match">${esc(pick.home)} - ${esc(pick.away)}</div><div class="fl-slip-market"><span>${esc(pick.label)}</span><b>${esc(pick.value)}</b><button class="fl-slip-remove" type="button" data-remove-pick="${esc(pick.uid)}">Sil</button></div></div>`).join("")}</div><div class="fl-slip-summary"><div class="fl-slip-row"><span>Toplam Oran</span><b>${esc(oddFormat(totalOdd))}</b></div><label class="fl-slip-row"><span>Kupon Tutarı</span></label><input class="fl-slip-stake" type="number" min="1" step="1" inputmode="decimal" placeholder="Tutar gir" value="${esc(state.stake)}" /><div class="fl-slip-row"><span>Olası Kazanç</span><b>${esc(money(possible))}</b></div><div class="fl-slip-actions"><button class="fl-slip-create" type="button" data-create-coupon ${picks.length ? "" : "disabled"}>Kuponu Oluştur</button><button class="fl-slip-clear" type="button" data-clear-slip>Temizle</button></div>${state.couponCreated ? `<div class="fl-slip-ok">Kupon oluşturuldu. ${picks.length} maç hazır.</div>` : ""}</div><div class="fl-slip-footer">Bu sistem kuponu ekranda oluşturur; gerçek bahis gönderimi yapmaz.</div>` : `<div class="fl-slip-empty">Orana tıklayınca maç burada kupon olarak oluşur.</div><div class="fl-slip-footer">Nesine benzeri kupon alanı seçim, toplam oran ve tutar hesabı yapar.</div>`);
  };

  const renderView = () => {
    injectStyle();
    const widget = ensureWidget();
    updateTabs();
    const list = widget.querySelector("[data-bulletin-list]");
    const count = widget.querySelector("[data-bulletin-count]");
    const source = widget.querySelector("[data-bulletin-source]");
    const liveCount = widget.querySelector("[data-live-count]");
    const date = widget.querySelector("[data-bulletin-date]");
    const matches = visibleMatches();
    const liveTotal = state.allMatches.filter(isLiveMatch).length;
    widget.dataset.bulletinSource = state.sourceLabel;
    widget.dataset.bulletinMode = state.mode;
    widget.dataset.bulletinCount = String(matches.length);
    if (source) source.textContent = state.sourceLabel;
    if (count) count.textContent = `${matches.length} maç`;
    if (liveCount) liveCount.textContent = `${liveTotal} canlı`;
    if (date) date.textContent = state.mode === "live" ? "Başlayan canlı maçlar" : `${formatDate(todayKey())} programı · bugün ve yarın 08:00 öncesi`;
    if (!list) return;
    if (!matches.length) {
      list.innerHTML = `<div class="fl-widget-empty">${state.mode === "live" ? "Şu anda başlayan canlı maç görünmüyor." : "Güncel maç bülteni bekleniyor. Eski veri gösterilmiyor."}</div>`;
      renderSlip();
      return;
    }
    list.innerHTML = `<div class="fl-table-scroll"><div class="fl-bulletin-table"><div class="fl-table-head"><span>Saat/Canlı</span><span>Lig</span><span>Maç</span><span>1</span><span>X</span><span>2</span><span>Alt</span><span>Üst</span><span>Var</span><span>Yok</span><span>Detay</span></div>${groupMatches(matches).map(renderGroup).join("")}</div></div>`;
    renderSlip();
  };

  const setMatches = (matches, sourceLabel) => {
    state.sourceLabel = sourceLabel;
    state.allMatches = matches.map(normalize).filter((match) => match.date && match.time && inBulletinWindow(match)).sort((a, b) => `${a.date} ${a.time} ${a.league} ${a.home}`.localeCompare(`${b.date} ${b.time} ${b.league} ${b.home}`, "tr")).map((match, index) => ({ ...match, _index: index }));
    state.byUid = new Map(state.allMatches.map((match) => [String(match._uid), match]));
    state.selected.forEach((pick, uid) => { if (!state.byUid.has(uid)) state.selected.delete(uid); });
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

  const findMatchFromButton = (button) => {
    const uid = String(button.dataset.selectUid || button.dataset.detailUid || "");
    if (uid && state.byUid.has(uid)) return state.byUid.get(uid);
    const index = Number(button.dataset.selectIndex || button.closest?.(".fl-match-row")?.dataset.index);
    return Number.isFinite(index) ? state.allMatches[index] : null;
  };

  const selectPick = (button) => {
    const match = findMatchFromButton(button);
    if (!match) return;
    const marketKey = button.dataset.selectMarket;
    const option = marketMap(match)[marketKey] || { label: button.dataset.selectLabel, value: button.dataset.selectValue };
    if (!option || isEmpty(option.value)) return;
    const uid = String(match._uid);
    const oldPick = state.selected.get(uid);
    state.couponCreated = false;
    if (oldPick?.marketKey === marketKey) state.selected.delete(uid);
    else state.selected.set(uid, { uid, marketKey, home: match.home, away: match.away, league: match.league, label: option.label, value: option.value });
    closeAllDetails();
    renderView();
  };

  const handleClick = (event) => {
    const odd = event.target.closest?.("[data-select-market]");
    if (odd) {
      event.preventDefault();
      event.stopPropagation();
      if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
      selectPick(odd);
      return;
    }
    const create = event.target.closest?.("[data-create-coupon]");
    if (create) { event.preventDefault(); state.couponCreated = state.selected.size > 0; renderSlip(); return; }
    const clear = event.target.closest?.("[data-clear-slip]");
    if (clear) { event.preventDefault(); state.selected.clear(); state.couponCreated = false; renderView(); return; }
    const modeButton = event.target.closest?.("[data-bulletin-mode]");
    if (modeButton) { event.preventDefault(); state.mode = modeButton.dataset.bulletinMode === "live" ? "live" : "all"; closeAllDetails(); renderView(); return; }
    const refresh = event.target.closest?.("[data-bulletin-refresh]");
    if (refresh) { event.preventDefault(); load(); return; }
    const remove = event.target.closest?.("[data-remove-pick]");
    if (remove) { event.preventDefault(); state.selected.delete(String(remove.dataset.removePick)); state.couponCreated = false; renderView(); return; }
    const detail = event.target.closest?.("[data-detail-uid]");
    if (!detail) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === "function") event.stopImmediatePropagation();
    const row = detail.closest(".fl-match-row");
    const match = state.byUid.get(String(detail.dataset.detailUid));
    if (!row || !match) return;
    const wasOpen = row.classList.contains("is-open") && row.nextElementSibling?.classList.contains("fl-extra");
    closeAllDetails();
    if (wasOpen) return;
    row.classList.add("is-open");
    detail.setAttribute("aria-expanded", "true");
    const extra = document.createElement("div");
    extra.className = "fl-extra";
    extra.innerHTML = `<div class="fl-extra-inner">${detailOdds(match)}</div>`;
    row.after(extra);
  };

  const handleInput = (event) => {
    if (event.target.matches?.(".fl-slip-stake")) { state.stake = event.target.value || ""; state.couponCreated = false; renderSlip(); return; }
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
