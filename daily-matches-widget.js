(() => {
  const KEY = "__flDailyWidget";
  const PAGE_SIZE = 30;
  const OFFICIAL_API_ORIGIN = /(^|\.)vercel\.app$/i.test(window.location.hostname)
    ? ""
    : "https://futbol-laboratuvari.vercel.app";
  const officialApiUrl = (eventId = "") => `${OFFICIAL_API_ORIGIN}/api/iddaa-bulletin${eventId ? `?eventId=${encodeURIComponent(eventId)}` : ""}`;
  if (window[KEY]?.off) window[KEY].off();

  const app = {
    bulletin: [],
    live: [],
    finished: [],
    picks: new Map(),
    expanded: new Set(),
    details: new Map(),
    detailLoading: new Set(),
    detailErrors: new Map(),
    mode: "bulletin",
    q: "",
    league: "all",
    timer: null,
    window: null,
    dataWarning: "",
    suppressedUnverified: 0,
    lastUpdated: "",
    source: ""
    ,visibleLimit: PAGE_SIZE
  };
  window[KEY] = app;

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (v) => String(v ?? "").replace(/[&<>\"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
  const isBlank = (v) => { const t = String(v ?? "").trim(); return !t || t === "-" || t === "—" || /null|undefined/i.test(t); };
  const get = (m, k) => m?.[k] ?? m?.available_odds?.[k] ?? m?.odds?.[k] ?? m?.raw_market_guess_odds?.[k] ?? m?.oranlar?.[k];
  const pick = (m, keys) => { for (const k of keys) { const v = get(m, k); if (!isBlank(v)) return v; } return ""; };
  const n = (v) => Number(String(v ?? "").replace(",", ".").match(/\d+(\.\d+)?/)?.[0] || 0);
  const fmt = (v) => n(v) ? n(v).toFixed(2) : "—";
  const minuteOf = (time) => { const m = String(time || "").trim().match(/^(\d{1,2}):(\d{2})$/); return m ? Number(m[1]) * 60 + Number(m[2]) : null; };
  const isEarly = (m) => (minuteOf(m.time) ?? 9999) < 8 * 60;

  const statusToken = (value) => String(value || "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  const scheduledStatuses = new Set(["", "ns", "not_started", "scheduled", "fixture", "tbd", "time_to_be_defined", "bekliyor", "programda"]);
  const liveStatuses = new Set(["live", "canli", "inplay", "in_play", "1h", "first_half", "ht", "half_time", "2h", "second_half", "et", "extra_time", "bt", "break", "int", "interrupted", "susp", "suspended", "paused"]);
  const finishedStatuses = new Set(["ft", "aet", "pen", "finished", "ended", "complete", "completed", "fulltime", "full_time", "match_finished", "ms", "bitti", "sonuclandi", "tamamlandi"]);
  const postponedStatuses = new Set(["pst", "postponed", "ertelendi"]);
  const cancelledStatuses = new Set(["canc", "cancelled", "canceled", "iptal"]);

  const trNow = () => {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
    const bag = Object.fromEntries(parts.map((p) => [p.type, p.value]));
    const hour = Number(bag.hour === "24" ? "0" : bag.hour || 0);
    return { date: `${bag.year}-${bag.month}-${bag.day}`, minute: hour * 60 + Number(bag.minute || 0) };
  };

  const toIsoDate = (value) => {
    const text = String(value || "").trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0, 10);
    const dot = text.match(/\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/);
    return dot ? `${dot[3]}-${dot[2].padStart(2, "0")}-${dot[1].padStart(2, "0")}` : "";
  };

  const rawStatus = (m) => statusToken(m.status || m.liveStatus || m.result_status || m.fixture_status || "scheduled");

  const hasVerifiedScore = (m) => {
    const home = m.homeScore ?? m.home_score ?? m.homeGoals ?? m.home_goals;
    const away = m.awayScore ?? m.away_score ?? m.awayGoals ?? m.away_goals;
    if (!isBlank(home) && !isBlank(away)) return true;
    return /^\s*\d+\s*[-:]\s*\d+\s*$/.test(String(m.score || m.skor || m.result_score || ""));
  };

  const hasVerifiedStatus = (m) =>
    m.status_verified === true
    || m.provider_status_verified === true
    || m.live_status_verified === true
    || hasVerifiedScore(m);

  function classify(m) {
    const token = rawStatus(m);
    if (cancelledStatuses.has(token)) return { bucket: "finished", status: "cancelled", minute: null };
    if (postponedStatuses.has(token)) return { bucket: "finished", status: "postponed", minute: null };
    if (finishedStatuses.has(token)) return hasVerifiedStatus(m)
      ? { bucket: "finished", status: "finished", minute: null }
      : { bucket: "unverified", status: "unverified", minute: null };
    if (liveStatuses.has(token)) return hasVerifiedStatus(m)
      ? { bucket: "live", status: "live", minute: m.minute ?? m.elapsed ?? m.matchMinute ?? null }
      : { bucket: "unverified", status: "unverified", minute: null };
    if (scheduledStatuses.has(token)) return { bucket: "scheduled", status: "scheduled", minute: null };
    return { bucket: "unverified", status: "unverified", minute: null };
  }

  const scheduledStartHasPassed = (m) => {
    const date = toIsoDate(m.date || m.tarih || m.start_date || m.utc_date);
    const start = minuteOf(m.time || m.saat || m.start_time);
    if (!date || start === null) return false;
    const now = trNow();
    if (date < now.date) return true;
    if (date > now.date) return false;
    return start <= now.minute;
  };

  const scoreOf = (m) => {
    const home = m.homeScore ?? m.home_score ?? m.homeGoals ?? m.home_goals;
    const away = m.awayScore ?? m.away_score ?? m.awayGoals ?? m.away_goals;
    if (!isBlank(home) && !isBlank(away)) return `${home}-${away}`;
    return String(m.score || m.skor || m.result_score || m.result || "").trim();
  };

  const statusLabel = (m) => ({
    scheduled: "Başlamadı",
    live: "Canlı",
    finished: "Bitti",
    postponed: "Ertelendi",
    cancelled: "İptal",
    unverified: "Durum doğrulanmadı"
  }[m.status || m.liveStatus] || "Bekleniyor");

  const liveLabel = (m) => {
    const minute = m.minute ?? m.elapsed ?? m.matchMinute;
    const minuteText = Number.isFinite(Number(minute)) ? `${Math.max(1, Math.round(Number(minute)))}'` : "";
    const score = scoreOf(m);
    return `CANLI${minuteText ? ` ${minuteText}` : ""}${score ? ` · ${score}` : ""}`;
  };

  const markets = [
    ["ms1", "1", ["ms1", "one", "oneOdd", "odd1", "ms_1"]],
    ["msx", "X", ["msx", "draw", "drawOdd", "oddX", "ms_x"]],
    ["ms2", "2", ["ms2", "two", "twoOdd", "odd2", "ms_2"]],
    ["under25", "Alt", ["under25", "alt25", "alt_25", "under", "alt"]],
    ["over25", "Üst", ["over25", "ust25", "ust_25", "over", "ust"]],
    ["bttsYes", "Var", ["bttsYes", "kgVar", "kg_var", "bttsYes_guess", "varOdd"]],
    ["bttsNo", "Yok", ["bttsNo", "kgYok", "kg_yok", "bttsNo_guess", "yokOdd"]],
  ];
  const marketByKey = Object.fromEntries(markets.map(([key, label, keys]) => [key, { key, label, keys }]));

  const detailMarkets = [
    ["firstHalfBttsYes", "İlk Yarı KG Var", ["firstHalfBttsYes", "firstHalfKgVar", "firstHalfBttsYes_guess", "iyKgVar", "ilk_yari_kg_var"]],
    ["firstHalfBttsNo", "İlk Yarı KG Yok", ["firstHalfBttsNo", "firstHalfKgYok", "firstHalfBttsNo_guess", "iyKgYok", "ilk_yari_kg_yok"]],
    ["secondHalfBttsYes", "İkinci Yarı KG Var", ["secondHalfBttsYes", "secondHalfKgVar", "secondHalfBttsYes_guess", "iy2KgVar", "ikinci_yari_kg_var"]],
    ["secondHalfBttsNo", "İkinci Yarı KG Yok", ["secondHalfBttsNo", "secondHalfKgYok", "secondHalfBttsNo_guess", "iy2KgYok", "ikinci_yari_kg_yok"]],
    ["over25", "2.5 Üst", ["over25", "ust25", "ust_25", "over", "ust"]],
    ["under25", "2.5 Alt", ["under25", "alt25", "alt_25", "under", "alt"]],
    ["over35", "3.5 Üst", ["over35", "ust35", "ust_35", "over35_guess"]],
    ["under35", "3.5 Alt", ["under35", "alt35", "alt_35", "under35_guess"]],
    ["firstHalfOver15", "1. Yarı 1.5 Üst", ["firstHalfOver15", "iyOver15", "iyUst15", "ilk_yari_ust_15"]],
    ["firstHalfUnder15", "1. Yarı 1.5 Alt", ["firstHalfUnder15", "iyUnder15", "iyAlt15", "ilk_yari_alt_15"]],
    ["bttsYes", "KG Var", ["bttsYes", "kgVar", "kg_var", "bttsYes_guess", "varOdd"]],
    ["bttsNo", "KG Yok", ["bttsNo", "kgYok", "kg_yok", "bttsNo_guess", "yokOdd"]]
  ];
  const detailMarketByKey = Object.fromEntries(detailMarkets.map(([key, label, keys]) => [key, { key, label, keys }]));

  function splitTeams(x) {
    return String(x.match || x.match_name || "").split(/\s+-\s+|\s+VS\s+/i);
  }

  function norm(x, i, defaults = {}) {
    const sp = splitTeams(x);
    const date = toIsoDate(x.date || x.tarih || x.start_date || x.utc_date || defaults.date || "");
    const time = String(x.time || x.saat || x.start_time || defaults.time || "--:--").trim();
    const home = x.home || x.home_team_name || x.ev_sahibi || sp[0] || "Ev";
    const away = x.away || x.away_team_name || x.deplasman || sp[1] || "Dep";
    const base = {
      ...x,
      _id: String(x.matchCode || x.match_code || x.id || `${date}-${time}-${home}-${away}-${i}`),
      date,
      time,
      league: x.league || x.competition_name || x.lig || "Diğer",
      home,
      away,
      status: x.status || x.liveStatus || defaults.status || "scheduled",
      liveStatus: x.liveStatus || x.status || defaults.status || "scheduled",
    };
    const state = classify(base);
    return { ...base, _state: state.bucket, liveStatus: state.bucket, status: state.status, minute: base.minute ?? state.minute };
  }

  const priority = (m) => ({ finished: 4, live: 3, scheduled: 2, unverified: 1 }[classify(m).bucket] || 0);

  function unique(list) {
    const map = new Map();
    list.forEach((m) => {
      const key = [m.date, m.time, m.home, m.away].join("|").toLocaleLowerCase("tr-TR");
      const old = map.get(key);
      map.set(key, old && priority(old) > priority(m) ? old : { ...(old || {}), ...m });
    });
    return [...map.values()];
  }

  function displayRank(m) {
    const mainDay = app.window?.main_day;
    const nextDay = String(app.window?.includes_next_day_until || "").slice(0, 10);
    if (m.date === mainDay) return `0|${m.time}|${m.league}|${m.home}`;
    if (m.date === nextDay && isEarly(m)) return `1|${m.time}|${m.league}|${m.home}`;
    return `2|${m.date}|${m.time}|${m.league}|${m.home}`;
  }

  function sortMatches(list) {
    return [...list].sort((a, b) => displayRank(a).localeCompare(displayRank(b), "tr"));
  }

  async function readJson(url) {
    try {
      if (typeof window.__flReadJsonShared === "function") {
        return { ok: true, data: await window.__flReadJsonShared(url) };
      }
      const response = await fetch(url, { cache: "no-cache" });
      if (!response.ok) throw new Error(String(response.status));
      return { ok: true, data: await response.json() };
    } catch (error) {
      return { ok: false, data: null, error };
    }
  }

  function ingest(root, sourceName, defaultDate = "") {
    const out = [];
    const push = (items, status) => Array.isArray(items) && items.forEach((x, i) => {
      const item = norm({ ...x, source: x.source || sourceName }, i, { date: defaultDate, status });
      if (item.date && item.time !== "--:--" && item.home !== "Ev" && item.away !== "Dep") out.push(item);
    });
    push(root?.matches, "scheduled");
    push(root?.scheduled_matches, "scheduled");
    push(root?.live_matches, "live");
    push(root?.finished_matches, "finished");
    push(root?.results, "finished");
    return out;
  }

  const latestGeneratedAt = (...values) => values
    .filter(Boolean)
    .map((value) => ({ value, time: Date.parse(value) }))
    .filter((item) => Number.isFinite(item.time))
    .sort((a, b) => b.time - a.time)[0]?.value || "";

  const freshnessWarning = (generatedAt) => {
    const generated = Date.parse(generatedAt || "");
    if (!Number.isFinite(generated)) return "Veri güncelleme zamanı doğrulanamadı; canlı ve sonuç durumları yalnız sağlayıcı kanıtıyla gösterilir.";
    const ageMinutes = Math.max(0, Math.floor((Date.now() - generated) / 60000));
    if (ageMinutes < 30) return "";
    const age = ageMinutes >= 60 ? `${Math.floor(ageMinutes / 60)} sa ${ageMinutes % 60} dk` : `${ageMinutes} dk`;
    return `Veri ${age} önce güncellendi. Eski saat bilgisi canlı veya bitmiş maç üretmek için kullanılmaz.`;
  };

  async function load() {
    const [officialRes, fullRes, liveRes] = await Promise.all([
      readJson(officialApiUrl()),
      readJson("./data/full-bulletin.json"),
      readJson("./data/live-matches.json")
    ]);
    const officialHasMatches = officialRes.ok && Array.isArray(officialRes.data?.matches) && officialRes.data.matches.length > 0;
    const fullHasMatches = fullRes.ok && [
      ...(Array.isArray(fullRes.data?.matches) ? fullRes.data.matches : []),
      ...(Array.isArray(fullRes.data?.scheduled_matches) ? fullRes.data.scheduled_matches : [])
    ].length > 0;
    const twoDayRes = fullHasMatches
      ? { ok: true, data: null, skipped: true }
      : await readJson("./data/two-day-bulletin.json");
    const full = fullRes.data;
    const live = liveRes.data;
    const twoDay = twoDayRes.data;
    app.dataWarning = officialHasMatches
      ? ""
      : "Resmi iddaa akışı geçici olarak kullanılamadı; son geçerli bülten gösteriliyor.";

    if (!officialHasMatches && !fullRes.ok && !twoDayRes.ok && (app.bulletin.length || app.live.length || app.finished.length)) {
      draw();
      return;
    }

    app.window = officialHasMatches
      ? null
      : full?.date_window || (Array.isArray(twoDay?.days) ? { main_day: twoDay.days[0], includes_next_day_until: `${twoDay.days[1] || ""} 08:00` } : app.window) || null;
    app.lastUpdated = latestGeneratedAt(officialRes.data?.generated_at, full?.generated_at, twoDay?.generated_at, live?.generated_at) || app.lastUpdated || "";
    app.source = officialHasMatches
      ? officialRes.data.source || "iddaa.com resmi futbol bülteni"
      : full?.source || twoDay?.source || live?.source || "Son geçerli futbol bülteni";
    const liveRootDate = toIsoDate(live?.date || full?.date_window?.main_day || "");
    const staticMatches = unique([
      ...ingest(twoDay, "two-day-bulletin.json"),
      ...ingest(full, "full-bulletin.json"),
      ...ingest(live, "live-matches.json", liveRootDate)
    ]);
    const officialMatches = officialHasMatches
      ? ingest(officialRes.data, officialRes.data.source || "iddaa.com resmi futbol bülteni")
      : [];
    const all = officialHasMatches
      ? unique([...officialMatches, ...staticMatches.filter((match) => classify(match).bucket === "finished")])
      : staticMatches;

    const classified = all.map((m) => {
      const state = classify(m);
      return { ...m, _state: state.bucket, liveStatus: state.bucket, status: state.status, minute: m.minute ?? state.minute };
    });
    const expiredScheduled = classified.filter((m) => m._state === "scheduled" && scheduledStartHasPassed(m));
    const unverified = classified.filter((m) => m._state === "unverified");
    app.suppressedUnverified = expiredScheduled.length + unverified.length;
    const warnings = [app.dataWarning, freshnessWarning(app.lastUpdated)];
    if (app.suppressedUnverified) warnings.push(`${app.suppressedUnverified} kaydın canlı/sonuç durumu doğrulanamadığı için listeden çıkarıldı.`);
    app.dataWarning = warnings.filter(Boolean).join(" ");
    app.bulletin = sortMatches(classified.filter((m) => m._state === "scheduled" && !scheduledStartHasPassed(m)));
    app.live = sortMatches(classified.filter((m) => m._state === "live"));
    app.finished = sortMatches(classified.filter((m) => m._state === "finished"));
    window.__flPremiumBulletinMatches = app.bulletin;
    window.dispatchEvent(new CustomEvent("fl:bulletin-ready", {
      detail: { matches: app.bulletin, generatedAt: app.lastUpdated, source: app.source }
    }));
    draw();
  }

  function earlyCount() {
    const nextDay = String(app.window?.includes_next_day_until || "").slice(0, 10);
    return app.bulletin.filter((m) => m.date === nextDay && isEarly(m)).length;
  }

  const formatTimestamp = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? String(value || "")
      : date.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul", dateStyle: "short", timeStyle: "short" });
  };

  function ensureRoot() {
    let root = $("#daily-matches-widget");
    if (!root) {
      root = document.createElement("section");
      root.id = "daily-matches-widget";
      const anchor = $("#yaklasan-maclar") || $("main") || document.body;
      anchor.insertAdjacentElement(anchor.id === "yaklasan-maclar" ? "afterend" : "afterbegin", root);
    }
    root.className = "flw";
    const early = earlyCount();
    const warning = app.dataWarning ? `<div class="flw-warning">${esc(app.dataWarning)}</div>` : "";
    const updated = app.lastUpdated ? ` · <span>Güncelleme: ${esc(formatTimestamp(app.lastUpdated))}</span>` : "";
    const source = app.source ? ` · <span>Kaynak: ${esc(app.source)}</span>` : "";
    root.innerHTML = `
      <div class="flw-top"><h2>Futbol Bülteni</h2><div><span>${app.bulletin.length} başlamamış</span> · <span>${app.live.length} canlı</span> · <span>${app.finished.length} sonuç</span>${early ? ` · <span>${early} gece/erken maç</span>` : ""}${updated}${source}</div></div>
      ${warning}
      <div class="flw-tabs" role="group" aria-label="Bülten görünümü"><button type="button" data-mode="bulletin" aria-pressed="${app.mode === "bulletin"}" class="${app.mode === "bulletin" ? "on" : ""}">Tüm Bülten</button><button type="button" data-mode="live" aria-pressed="${app.mode === "live"}" class="${app.mode === "live" ? "on" : ""}">Canlı Karşılaşmalar</button><button type="button" data-mode="finished" aria-pressed="${app.mode === "finished"}" class="${app.mode === "finished" ? "on" : ""}">Biten Karşılaşmalar</button></div>
      <div class="flw-filter"><label class="flw-sr" for="flw-search">Maç veya lig ara</label><input id="flw-search" data-q value="${esc(app.q)}" placeholder="Maç veya lig ara"><label class="flw-sr" for="flw-league">Lig seç</label><select id="flw-league" data-league></select><button type="button" data-refresh>Yenile</button></div>
      <div class="flw-layout"><div class="flw-main"></div><aside class="flw-slip"></aside></div>`;
  }

  function style() {
    if ($("#flw-style")) return;
    const s = document.createElement("style");
    s.id = "flw-style";
    s.textContent = `.flw{margin:18px clamp(10px,3vw,52px);background:#073d3b;color:#fff;border:1px solid rgba(255,212,0,.28);font-family:inherit}.flw-sr{position:absolute!important;width:1px!important;height:1px!important;padding:0!important;margin:-1px!important;overflow:hidden!important;clip:rect(0,0,0,0)!important;white-space:nowrap!important;border:0!important}.flw-top{display:flex;justify-content:space-between;gap:12px;align-items:center;background:#ffd400;color:#073d3b;padding:12px 14px}.flw-top h2{margin:0;font-size:19px}.flw-warning{padding:8px 14px;background:#3b2107;color:#ffe2b8;font-size:12px;font-weight:850}.flw-tabs{display:flex;gap:8px;padding:10px 14px;background:#0f645e;flex-wrap:wrap}.flw-tabs button{border:1px solid rgba(255,212,0,.45);border-radius:999px;background:rgba(255,255,255,.08);color:#fff;font-weight:1000;padding:8px 12px;cursor:pointer}.flw-tabs button.on{background:#ffd400;color:#073d3b}.flw-filter{display:grid;grid-template-columns:1fr 220px 90px;gap:8px;padding:10px 14px;background:#062d2c}.flw-filter input,.flw-filter select,.flw-filter button{height:38px;border:0;border-radius:9px;padding:0 10px;font-weight:850}.flw-filter button,.flw-analyze,.flw-clear,.flw-remove,.flw-detail-toggle,.flw-more{background:#ffd400;color:#073d3b;cursor:pointer}.flw-layout{display:grid;grid-template-columns:minmax(0,1fr) 320px}.flw-main{padding:12px;overflow:auto}.flw-table{min-width:960px;background:#f7fff9;color:#062d2c;border-radius:12px;overflow:hidden}.flw-head,.flw-row{display:grid;grid-template-columns:76px 130px minmax(240px,1fr) repeat(7,58px) 86px}.flw-head{background:#0a504b;color:#fff7bd;font-size:11px;font-weight:1000}.flw-head span,.flw-row>*{padding:7px 6px;border-right:1px solid #cbded6;border-bottom:1px solid #cbded6}.flw-league{background:#d9efe3;color:#073d3b;padding:8px 11px;font-size:11px;font-weight:1000}.flw-row{font-size:11px;cursor:pointer;transition:background .15s ease}.flw-row:hover,.flw-row:focus,.flw-row.is-open{background:#e8f7ed;outline:none}.flw-row:focus{box-shadow:inset 0 0 0 2px #ffd400}.flw-time{font-weight:1000;color:#006447}.flw-live-time{color:#d01515}.flw-finished-time{color:#555}.flw-teams b{display:block}.flw-code{font-size:9px;color:#6a837d}.flw-empty{margin:13px;padding:19px 12px;border:1px dashed rgba(255,255,255,.25);border-radius:11px;text-align:center;color:#bfd6cf}.flw-odd{display:block;width:100%;min-height:30px;border-radius:8px;border:1px solid #bdd0ca;background:#fff;color:#073d3b;font-weight:950;cursor:pointer}.flw-odd.on,.flw-odd:hover{background:#ffd400}.flw-odd:disabled{cursor:not-allowed;color:#7c918b;background:#edf5f1}.flw-detail-toggle{border:0;border-radius:8px;font-weight:1000;padding:7px 4px;width:100%;font-size:10px}.flw-detail-row{padding:10px 12px;background:#fff;border-bottom:1px solid #cbded6}.flw-detail-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.flw-detail-card{border:1px solid #cbded6;border-radius:8px;padding:8px;background:#f7fff9;font-size:11px;line-height:1.45}.flw-detail-card b{display:block;color:#073d3b;margin-bottom:4px}.flw-detail-note{color:#59766f}.flw-detail-market{display:flex;justify-content:space-between;gap:8px;align-items:center;margin:5px 0}.flw-detail-market span{font-weight:850}.flw-detail-odd{width:auto;min-width:74px;padding:5px 8px}.flw-detail-all{grid-column:1/-1;padding:12px}.flw-detail-loading{padding:16px;border:1px dashed #91b4a9;border-radius:8px;color:#3e6e63}.flw-market-heading{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:10px}.flw-market-heading>b{margin:0}.flw-market-heading span{color:#59766f;font-weight:850}.flw-market-section{margin:12px 0}.flw-market-section h4{margin:0 0 7px;padding:7px 9px;border-radius:7px;background:#0a504b;color:#fff7bd}.flw-market-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.flw-market-block{border:1px solid #cbded6;border-radius:8px;background:#fff;padding:8px;min-width:0}.flw-market-title{display:flex;justify-content:space-between;gap:7px;align-items:flex-start;color:#073d3b;font-weight:1000;margin-bottom:7px}.flw-market-info{flex:0 0 20px;width:20px;height:20px;padding:0;border:0;border-radius:50%;background:#d9efe3;color:#073d3b;font-weight:1000;cursor:help}.flw-market-outcomes{display:grid;grid-template-columns:repeat(auto-fit,minmax(72px,1fr));gap:6px}.flw-market-outcome{display:flex;justify-content:space-between;align-items:center;gap:5px;padding:6px 8px}.flw-market-outcome span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.flw-market-outcome b{margin:0;color:inherit}.flw-more{display:block;min-height:40px;margin:12px auto 0;padding:7px 18px;border:0;border-radius:10px;font-weight:1000}.flw-slip{background:#092c2b;border-left:1px solid rgba(255,255,255,.14);padding:14px}.flw-slip h3{margin:0;color:#ffd400}.flw-card{margin-top:9px;padding:9px;border:1px solid rgba(255,255,255,.15);border-radius:10px;background:rgba(255,255,255,.05);font-size:11px}.flw-flex{display:flex;justify-content:space-between;gap:8px;align-items:center;color:#ffd400;font-weight:950}.flw-act{display:grid;gap:8px;margin-top:9px}.flw-analyze,.flw-clear,.flw-remove{border:0;border-radius:8px;font-weight:1000;padding:7px 9px}.flw-analysis{line-height:1.45;color:#dceee8}.flw-note{color:#a8c2ba;font-size:11px;margin-top:8px}@media(max-width:920px){.flw-filter{grid-template-columns:1fr}.flw-layout{display:block}.flw-slip{border-left:0}.flw-top{display:block}.flw-detail-grid,.flw-market-grid{grid-template-columns:1fr}.flw-table{min-width:900px}}`;
    document.head.appendChild(s);
  }

  function listForMode() {
    if (app.mode === "live") return app.live;
    if (app.mode === "finished") return app.finished;
    return app.bulletin;
  }

  function visible() {
    const base = listForMode();
    return base.filter((m) => (app.league === "all" || m.league === app.league) && (!app.q || `${m.home} ${m.away} ${m.league}`.toLocaleLowerCase("tr-TR").includes(app.q)));
  }

  function pickId(matchId, key) {
    return `${matchId}::${key}`;
  }

  function oddBtn(m, key, label, keys) {
    const value = pick(m, keys);
    if (isBlank(value)) return `<button class="flw-odd" disabled title="Oran verisi bekleniyor">—</button>`;
    const on = app.picks.has(pickId(m._id, key)) ? " on" : "";
    return `<button class="flw-odd${on}" data-pick="${esc(m._id)}" data-key="${esc(key)}" title="${esc(label)}" aria-label="${esc(`${m.home} - ${m.away}, ${label}, oran ${fmt(value)}`)}">${esc(fmt(value))}</button>`;
  }

  function detailOddBtn(m, key, label, keys) {
    const value = pick(m, keys);
    if (isBlank(value)) {
      return `<div class="flw-detail-market"><span>${esc(label)}</span><button class="flw-odd flw-detail-odd" disabled title="Oran verisi bekleniyor">Veri bekleniyor</button></div>`;
    }
    const on = app.picks.has(pickId(m._id, key)) ? " on" : "";
    return `<div class="flw-detail-market"><span>${esc(label)}</span><button class="flw-odd flw-detail-odd${on}" data-detail-pick="${esc(m._id)}" data-detail-key="${esc(key)}" title="${esc(label)}" aria-label="${esc(`${m.home} - ${m.away}, ${label}, oran ${fmt(value)}`)}">${esc(fmt(value))}</button></div>`;
  }

  function detailOddLine(m) {
    const lines = detailMarkets.map(([key, label, keys]) => detailOddBtn(m, key, label, keys));
    const oddsCount = Object.values(m.available_odds || m.odds || {}).filter((v) => !isBlank(v)).length;
    return `${lines.join("")}<div class="flw-detail-note">Oran kaynağı: ${esc(m.oddsSource || m.source || "Maçkolik veri akışı")}. ${oddsCount ? `${oddsCount} oran alanı bulundu.` : "Oran verisi bekleniyor."}</div>`;
  }

  function matchById(id) {
    return [...app.bulletin, ...app.live, ...app.finished].find((match) => match._id === id);
  }

  function detailedMatch(m) {
    return app.details.get(m._id) || m;
  }

  function dynamicOutcomeButton(m, market, outcome) {
    const key = `iddaa:${market.id}:${outcome.outcome_no ?? outcome.id}`;
    const on = app.picks.has(pickId(m._id, key)) ? " on" : "";
    return `<button type="button" class="flw-odd flw-market-outcome${on}" data-dynamic-pick="${esc(m._id)}" data-market-id="${esc(market.id)}" data-outcome-no="${esc(outcome.outcome_no ?? outcome.id)}" aria-label="${esc(`${m.home} - ${m.away}, ${market.title}, ${outcome.label}, oran ${fmt(outcome.odd)}`)}"><span>${esc(outcome.label)}</span><b>${esc(fmt(outcome.odd))}</b></button>`;
  }

  function allMarketsHtml(m) {
    if (app.detailLoading.has(m._id)) {
      return `<div class="flw-detail-card flw-detail-all"><b>Tüm İddaa Pazarları</b><div class="flw-detail-loading" role="status">Bu maça ait resmi pazarlar yükleniyor…</div></div>`;
    }
    const error = app.detailErrors.get(m._id);
    const detail = detailedMatch(m);
    const groups = Array.isArray(detail.market_groups) ? detail.market_groups.filter((market) => Array.isArray(market.outcomes) && market.outcomes.length) : [];
    if (!groups.length) {
      const message = error || "Resmi detay verisi bulunamadı; özet oranlar gösteriliyor.";
      return `<div class="flw-detail-card flw-detail-all"><b>Tüm İddaa Pazarları</b><div class="flw-detail-note">${esc(message)}</div></div>`;
    }
    const categories = new Map();
    groups.forEach((market) => {
      const category = market.category || "Diğer";
      if (!categories.has(category)) categories.set(category, []);
      categories.get(category).push(market);
    });
    const sections = [...categories.entries()].map(([category, marketsInCategory]) => `<section class="flw-market-section"><h4>${esc(category)}</h4><div class="flw-market-grid">${marketsInCategory.map((market) => `<article class="flw-market-block"><div class="flw-market-title"><span>${esc(market.title)}</span>${market.description ? `<button type="button" class="flw-market-info" title="${esc(market.description)}" aria-label="${esc(`${market.title} açıklaması`)}">i</button>` : ""}</div><div class="flw-market-outcomes">${market.outcomes.map((outcome) => dynamicOutcomeButton(m, market, outcome)).join("")}</div></article>`).join("")}</div></section>`).join("");
    return `<div class="flw-detail-card flw-detail-all"><div class="flw-market-heading"><b>Tüm İddaa Pazarları</b><span>${groups.length} pazar · ${groups.reduce((sum, market) => sum + market.outcomes.length, 0)} seçim</span></div>${sections}<div class="flw-detail-note">Her oran yalnız bu maçın resmi etkinlik kimliğinden alınmıştır.</div></div>`;
  }

  async function loadDetail(id) {
    const item = matchById(id);
    const eventId = String(item?.iddaa_event_id || "").trim();
    if (!item || app.details.has(id) || app.detailLoading.has(id) || !/^\d{1,12}$/.test(eventId)) return;
    app.detailLoading.add(id);
    app.detailErrors.delete(id);
    drawRows();
    const response = await readJson(officialApiUrl(eventId));
    if (response.ok && response.data?.match && String(response.data.match.iddaa_event_id) === eventId) {
      app.details.set(id, { ...item, ...response.data.match, _id: item._id });
    } else {
      app.detailErrors.set(id, "Resmi pazar ayrıntısı şu anda alınamadı. Yenile düğmesiyle tekrar deneyebilirsiniz.");
    }
    app.detailLoading.delete(id);
    drawRows();
  }

  function toggleRow(id) {
    const opening = !app.expanded.has(id);
    if (opening) app.expanded.add(id);
    else app.expanded.delete(id);
    drawRows();
    if (opening) loadDetail(id);
  }

  function analysisText(m) {
    const candidates = Array.isArray(m.raw_market_blocks) ? m.raw_market_blocks : [];
    const candidateText = candidates.slice(0, 2).map((b) => esc(b.guess || b.title || b.market || "Detay market")).join(", ");
    const prediction = m.best_market || m.en_guclu_market || m.prediction || m.tahmin || m.decision || "Tahmin verisi bekleniyor";
    return `<div>Tahmin bilgisi: <strong>${esc(prediction)}</strong></div><div>Analiz: ${candidateText || "Detay analizi için Maçkolik/robot verisi bekleniyor."}</div>`;
  }

  function playerNames(record, key) {
    return (Array.isArray(record?.[key]) ? record[key] : [])
      .map((player) => typeof player === "string" ? player : player?.name)
      .filter(Boolean);
  }

  function teamStatusHtml(teamName, status, lineup) {
    const parts = [];
    const injured = playerNames(status, "injured_players");
    const suspended = playerNames(status, "suspended_players");
    const doubtful = playerNames(status, "doubtful_players");
    const transfersIn = playerNames(status, "transfers_in");
    const transfersOut = playerNames(status, "transfers_out");
    if (injured.length) parts.push(`Sakat: ${injured.join(", ")}`);
    if (suspended.length) parts.push(`Cezalı: ${suspended.join(", ")}`);
    if (doubtful.length) parts.push(`Şüpheli: ${doubtful.join(", ")}`);
    if (transfersIn.length) parts.push(`Transfer girişi: ${transfersIn.join(", ")}`);
    if (transfersOut.length) parts.push(`Transfer çıkışı: ${transfersOut.join(", ")}`);
    if (!injured.length && status?.injury_news_count) parts.push(`${status.injury_news_count} sakatlık haber sinyali`);
    if (!suspended.length && status?.suspension_news_count) parts.push(`${status.suspension_news_count} ceza haber sinyali`);
    if (!doubtful.length && status?.doubtful_news_count) parts.push(`${status.doubtful_news_count} belirsizlik haber sinyali`);
    if (!transfersIn.length && !transfersOut.length && (status?.transfer_in_news_count || status?.transfer_out_news_count)) parts.push(`Transfer haber sinyali +${status.transfer_in_news_count || 0} / -${status.transfer_out_news_count || 0}`);
    if (lineup?.lineup_confirmed) parts.push(`İlk 11 doğrulandı${lineup.formation && lineup.formation !== "-" ? ` (${lineup.formation})` : ""}`);
    if (!parts.length && status?.availability_checked) parts.push("Sağlayıcı akışında isimli eksik yok");
    if (!parts.length) parts.push("Doğrulanmış oyuncu verisi bekleniyor");
    return `<div><strong>${esc(teamName)}:</strong> ${esc(parts.join(" · "))}</div>`;
  }

  function teamIntelligenceHtml(m) {
    const intel = m.team_intelligence || {};
    const homeStatus = intel.home_status || intel.team_status?.home || m.home_status;
    const awayStatus = intel.away_status || intel.team_status?.away || m.away_status;
    const homeLineup = intel.home_lineup || intel.lineup?.home || m.home_lineup;
    const awayLineup = intel.away_lineup || intel.lineup?.away || m.away_lineup;
    const squadRisk = intel.squad_risk_level || m.squad_risk_level || "Belirsiz";
    const lineupRisk = intel.lineup_risk_level || m.lineup_risk_level || "Belirsiz";
    return `${teamStatusHtml(m.home, homeStatus, homeLineup)}${teamStatusHtml(m.away, awayStatus, awayLineup)}<div class="flw-detail-note">Kadro riski: ${esc(squadRisk)} · İlk 11 riski: ${esc(lineupRisk)}. Veri yoksa takım risksiz sayılmaz.</div>`;
  }

  function detailHtml(m) {
    const detail = detailedMatch(m);
    const score = scoreOf(detail);
    return `<div class="flw-detail-row"><div class="flw-detail-grid">
      <div class="flw-detail-card"><b>Maç Bilgisi</b><div>${esc(detail.home)} - ${esc(detail.away)}</div><div>Lig: ${esc(detail.league)}</div><div>Başlama: ${esc(detail.date)} ${esc(detail.time)}</div><div>Durum: ${esc(statusLabel(detail))}${detail.minute ? ` · ${esc(detail.minute)}'` : ""}</div><div>Skor: ${esc(score || "Skor bekleniyor")}</div></div>
      <div class="flw-detail-card"><b>Analiz ve Tahmin</b>${analysisText(detail)}</div>
      <div class="flw-detail-card"><b>Özet Oranlar</b>${detailOddLine(detail)}</div>
      <div class="flw-detail-card"><b>Takım ve Futbolcu Analizi</b>${teamIntelligenceHtml(detail)}</div>
      <div class="flw-detail-card"><b>Kaynak</b><div>${esc(detail.source || "iddaa.com resmi futbol bülteni")}</div><div>Güncel veri zamanı: ${esc(detail.lastLiveUpdate || detail.last_update || app.lastUpdated || "Veri zamanı bekleniyor")}</div><div>Etkinlik kodu: ${esc(detail.iddaa_event_id || detail.matchCode || detail.match_code || detail._id)}</div></div>
      <div class="flw-detail-card"><b>Veri Notu</b><div>${esc(detail.raw_market_source_note || "Veri yoksa hatalı oran gösterilmez; resmi akışın güncellenmesi beklenir.")}</div></div>
      ${allMarketsHtml(m)}
    </div></div>`;
  }

  function drawRows() {
    const base = listForMode();
    const all = visible();
    const list = all.slice(0, app.visibleLimit);
    const sel = $("[data-league]");
    if (sel) {
      const leagues = [...new Set(base.map((m) => m.league).filter(Boolean))].sort((a, b) => a.localeCompare(b, "tr"));
      sel.innerHTML = `<option value="all">Tüm Ligler</option>${leagues.map((l) => `<option value="${esc(l)}" ${app.league === l ? "selected" : ""}>${esc(l)}</option>`).join("")}`;
    }
    const box = $(".flw-main");
    if (!box) return;
    if (!list.length) {
      const msg = app.mode === "live" ? "Şu anda canlı karşılaşma yok." : app.mode === "finished" ? "Biten karşılaşma verisi bekleniyor." : "Başlamamış bülten maçı yok.";
      box.innerHTML = `<div class="flw-empty">${msg}</div>`;
      return;
    }
    let html = `<div class="flw-table"><div class="flw-head"><span>Saat</span><span>Lig</span><span>Maç</span>${markets.map((m) => `<span>${esc(m[1])}</span>`).join("")}<span>Detay</span></div>`;
    let last = "";
    list.forEach((m) => {
      const group = `${m.date}|${m.league}`;
      if (group !== last) {
        last = group;
        const earlyLabel = isEarly(m) && m.date !== app.window?.main_day ? " · Gece/erken saat bloğu" : "";
        html += `<div class="flw-league">${esc(m.date)} · ${esc(m.league)}${earlyLabel}</div>`;
      }
      const timeText = app.mode === "live" ? liveLabel(m) : app.mode === "finished" ? `${m.time} · ${scoreOf(m) || statusLabel(m)}` : m.time;
      const timeClass = app.mode === "live" ? "flw-time flw-live-time" : app.mode === "finished" ? "flw-time flw-finished-time" : "flw-time";
      const open = app.expanded.has(m._id);
      html += `<div class="flw-row${open ? " is-open" : ""}" data-row-toggle="${esc(m._id)}" tabindex="0" aria-expanded="${open}" aria-label="${esc(`${m.home} - ${m.away} tüm bahis pazarlarını ${open ? "kapat" : "aç"}`)}"><div class="${timeClass}">${esc(timeText)}</div><div>${esc(m.league)}</div><div class="flw-teams"><b>${esc(m.home)} - ${esc(m.away)}</b><span class="flw-code">Durum: ${esc(statusLabel(m))} · Kod: ${esc(m.matchCode || m.match_code || m._id)}</span></div>${markets.map(([key, label, keys]) => `<div>${oddBtn(m, key, label, keys)}</div>`).join("")}<div><button type="button" class="flw-detail-toggle" data-toggle="${esc(m._id)}" aria-expanded="${open}">${open ? "Kapat" : "Tümünü Aç"}</button></div></div>${open ? detailHtml(m) : ""}`;
    });
    const remaining = all.length - list.length;
    box.innerHTML = html + `</div>${remaining > 0 ? `<button type="button" class="flw-more" data-more>Daha fazla göster (${remaining})</button>` : ""}`;
  }

  function marketSummary(p) {
    const odd = n(p.value);
    if (!odd) return "Geçerli oran olmadığı için ham piyasa olasılığı hesaplanamadı.";
    return `Ondalık oranın marj düzeltilmemiş karşılığı yaklaşık %${(100 / odd).toFixed(1)}'dir; model tahmini veya öneri değildir.`;
  }

  function drawSlip() {
    const slip = $(".flw-slip");
    if (!slip) return;
    const picks = [...app.picks.values()];
    const odds = picks.map((p) => n(p.value)).filter(Boolean);
    const total = odds.length === picks.length && odds.length ? odds.reduce((a, b) => a * b, 1) : 0;
    slip.innerHTML = `<h3>Kuponum</h3>${picks.length ? picks.map((p) => `<div class="flw-card"><b>${esc(p.home)} - ${esc(p.away)}</b><div class="flw-flex"><span>${esc(p.label)}</span><b>${esc(fmt(p.value))}</b><button class="flw-remove" data-remove="${esc(p.id)}">Sil</button></div></div>`).join("") + `<div class="flw-card"><div class="flw-flex"><span>Toplam Oran</span><b>${esc(fmt(total))}</b></div><div class="flw-act"><button class="flw-analyze" data-analyze>Analiz Et</button><button class="flw-clear" data-clear>Temizle</button></div></div><div data-analysis></div>` : `<div class="flw-empty">Orana tıklayınca seçim burada listelenir.</div><div class="flw-note">Bülten, canlı ve sonuç ayrımı otomatik korunur.</div>`}`;
  }

  function analyze() {
    const out = $("[data-analysis]");
    if (!out) return;
    const picks = [...app.picks.values()];
    if (!picks.length) return;
    const probabilities = picks.map((p) => n(p.value) > 1 ? 100 / n(p.value) : null);
    const combined = probabilities.every((value) => value !== null)
      ? probabilities.reduce((total, value) => total * (value / 100), 1) * 100
      : null;
    out.innerHTML = `<div class="flw-card flw-analysis"><b>Piyasa Oran Özeti</b><p>Birleşik ham piyasa karşılığı: ${combined === null ? "Hesaplanamadı" : `%${combined.toFixed(1)}`}. Bu değer bahis şirketi marjını içerir; başarı tahmini, model gücü veya oynama önerisi değildir.</p>${picks.map((p, i) => `<p><b>${esc(p.label)} · ${esc(fmt(p.value))}${probabilities[i] === null ? "" : ` · ham %${probabilities[i].toFixed(1)}`}</b><br>${esc(marketSummary(p))}</p>`).join("")}</div>`;
  }

  function draw() { ensureRoot(); style(); drawRows(); drawSlip(); }

  function select(id, key) {
    const item = [...app.bulletin, ...app.live].find((m) => m._id === id);
    const market = marketByKey[key];
    if (!item || !market) return;
    const value = pick(item, market.keys);
    if (isBlank(value)) return;
    const idKey = pickId(id, key);
    if (app.picks.has(idKey)) app.picks.delete(idKey);
    else app.picks.set(idKey, { id: idKey, matchId: id, key, label: market.label, value, home: item.home, away: item.away });
    drawRows();
    drawSlip();
  }

  function selectDetail(id, key) {
    const item = [...app.bulletin, ...app.live].find((m) => m._id === id);
    const market = detailMarketByKey[key];
    if (!item || !market) return;
    const value = pick(item, market.keys);
    if (isBlank(value)) return;
    const idKey = pickId(id, key);
    if (app.picks.has(idKey)) app.picks.delete(idKey);
    else app.picks.set(idKey, { id: idKey, matchId: id, key, label: market.label, value, home: item.home, away: item.away });
    drawRows();
    drawSlip();
  }

  function selectDynamic(id, marketId, outcomeNo) {
    const item = matchById(id);
    const detail = app.details.get(id);
    const market = Array.isArray(detail?.market_groups)
      ? detail.market_groups.find((candidate) => String(candidate.id) === String(marketId))
      : null;
    const outcome = market?.outcomes?.find((candidate) => String(candidate.outcome_no ?? candidate.id) === String(outcomeNo));
    if (!item || !market || !outcome || isBlank(outcome.odd)) return;
    const key = `iddaa:${market.id}:${outcome.outcome_no ?? outcome.id}`;
    const idKey = pickId(id, key);
    if (app.picks.has(idKey)) app.picks.delete(idKey);
    else app.picks.set(idKey, {
      id: idKey,
      matchId: id,
      key,
      label: `${market.title} · ${outcome.label}`,
      value: outcome.odd,
      home: item.home,
      away: item.away,
    });
    drawRows();
    drawSlip();
  }

  app.click = (e) => {
    const mode = e.target.closest("[data-mode]");
    if (mode) { app.mode = ["live", "finished"].includes(mode.dataset.mode) ? mode.dataset.mode : "bulletin"; app.league = "all"; app.visibleLimit = PAGE_SIZE; draw(); return; }
    if (e.target.closest("[data-more]")) { app.visibleLimit += PAGE_SIZE; drawRows(); return; }
    const dynamicPick = e.target.closest("[data-dynamic-pick]");
    if (dynamicPick) { selectDynamic(dynamicPick.dataset.dynamicPick, dynamicPick.dataset.marketId, dynamicPick.dataset.outcomeNo); return; }
    const detailPick = e.target.closest("[data-detail-pick]");
    if (detailPick) { selectDetail(detailPick.dataset.detailPick, detailPick.dataset.detailKey); return; }
    const p = e.target.closest("[data-pick]");
    if (p) { select(p.dataset.pick, p.dataset.key); return; }
    const rm = e.target.closest("[data-remove]");
    if (rm) { app.picks.delete(rm.dataset.remove); drawRows(); drawSlip(); return; }
    if (e.target.closest("[data-clear]")) { app.picks.clear(); drawRows(); drawSlip(); return; }
    if (e.target.closest("[data-analyze]")) { analyze(); return; }
    if (e.target.closest("[data-refresh]")) { app.details.clear(); app.detailErrors.clear(); load(); return; }
    const toggle = e.target.closest("[data-toggle]");
    if (toggle) { toggleRow(toggle.dataset.toggle); return; }
    const row = e.target.closest("[data-row-toggle]");
    if (row && !e.target.closest("button,input,select,a")) toggleRow(row.dataset.rowToggle);
  };
  app.keydown = (e) => {
    const row = e.target.closest?.("[data-row-toggle]");
    if (!row || e.target !== row || !["Enter", " "].includes(e.key)) return;
    e.preventDefault();
    toggleRow(row.dataset.rowToggle);
  };
  app.input = (e) => {
    if (e.target.matches("[data-q]")) { app.q = e.target.value.toLocaleLowerCase("tr-TR"); app.visibleLimit = PAGE_SIZE; drawRows(); }
    if (e.target.matches("[data-league]")) { app.league = e.target.value; app.visibleLimit = PAGE_SIZE; drawRows(); }
  };
  app.off = () => { document.removeEventListener("click", app.click); document.removeEventListener("keydown", app.keydown); document.removeEventListener("input", app.input); document.removeEventListener("change", app.input); clearInterval(app.timer); };

  document.addEventListener("click", app.click);
  document.addEventListener("keydown", app.keydown);
  document.addEventListener("input", app.input);
  document.addEventListener("change", app.input);
  draw();
  load();
  app.timer = setInterval(load, 60000);
})();
