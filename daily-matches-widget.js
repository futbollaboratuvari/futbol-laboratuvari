(() => {
  const KEY = "__flDailyWidget";
  if (window[KEY]?.off) window[KEY].off();

  const LIVE_WINDOW_MINUTES = 130;
  const app = { bulletin: [], live: [], picks: new Map(), mode: "bulletin", q: "", league: "all", timer: null, window: null, dataWarning: "", lastUpdated: "" };
  window[KEY] = app;

  const $ = (s, r = document) => r.querySelector(s);
  const esc = (v) => String(v ?? "").replace(/[&<>\"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
  const isBlank = (v) => { const t = String(v ?? "").trim(); return !t || t === "-" || t === "—" || /null|undefined/i.test(t); };
  const get = (m, k) => m?.[k] ?? m?.available_odds?.[k] ?? m?.odds?.[k] ?? m?.raw_market_guess_odds?.[k];
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

  function classify(m) {
    const token = rawStatus(m);
    if (cancelledStatuses.has(token)) return { bucket: "cancelled", status: "cancelled", minute: null };
    if (postponedStatuses.has(token)) return { bucket: "postponed", status: "postponed", minute: null };
    if (finishedStatuses.has(token)) return { bucket: "finished", status: "finished", minute: m.minute ?? null };
    if (liveStatuses.has(token)) return { bucket: "live", status: "live", minute: m.minute ?? m.elapsed ?? m.matchMinute ?? null };

    const date = toIsoDate(m.date || m.tarih || m.start_date || m.utc_date);
    const start = minuteOf(m.time || m.saat || m.start_time);
    if (!date || start === null) return { bucket: scheduledStatuses.has(token) ? "scheduled" : "finished", status: scheduledStatuses.has(token) ? "scheduled" : "finished", minute: null };

    const now = trNow();
    if (date < now.date) return { bucket: "finished", status: "finished", minute: 90 };
    if (date > now.date) return { bucket: "scheduled", status: "scheduled", minute: null };

    const elapsed = now.minute - start;
    if (elapsed < 0) return { bucket: "scheduled", status: "scheduled", minute: null };
    if (elapsed <= LIVE_WINDOW_MINUTES) return { bucket: "live", status: "live", minute: Math.max(1, Math.min(90, elapsed > 60 ? elapsed - 15 : elapsed)) };
    return { bucket: "finished", status: "finished", minute: 90 };
  }

  const scoreOf = (m) => {
    const home = m.homeScore ?? m.home_score ?? m.homeGoals ?? m.home_goals;
    const away = m.awayScore ?? m.away_score ?? m.awayGoals ?? m.away_goals;
    if (!isBlank(home) && !isBlank(away)) return `${home}-${away}`;
    return String(m.score || m.skor || m.result_score || m.result || "").trim();
  };

  const liveLabel = (m) => {
    const minute = m.minute ?? m.elapsed ?? m.matchMinute;
    const minuteText = Number.isFinite(Number(minute)) ? `${Math.max(1, Math.round(Number(minute)))}'` : "";
    const score = scoreOf(m);
    return `CANLI${minuteText ? ` ${minuteText}` : ""}${score ? ` · ${score}` : ""}`;
  };

  const isBulletin = (m) => classify(m).bucket === "scheduled";
  const isLiveMatch = (m) => classify(m).bucket === "live";

  const markets = [
    ["ms1", "1", ["ms1", "one", "oneOdd", "odd1", "ms_1"]],
    ["msx", "X", ["msx", "draw", "drawOdd", "oddX", "ms_x"]],
    ["ms2", "2", ["ms2", "two", "twoOdd", "odd2", "ms_2"]],
    ["under25", "Alt", ["under25", "alt25", "alt_25", "under", "alt"]],
    ["over25", "Üst", ["over25", "ust25", "ust_25", "over", "ust"]],
    ["bttsYes", "Var", ["bttsYes", "kgVar", "kg_var", "bttsYes_guess"]],
    ["bttsNo", "Yok", ["bttsNo", "kgYok", "kg_yok", "bttsNo_guess"]],
  ];
  const marketByKey = Object.fromEntries(markets.map(([key, label, keys]) => [key, { key, label, keys }]));

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

  function unique(list) {
    const map = new Map();
    list.forEach((m) => map.set([m.date, m.time, m.home, m.away].join("|").toLocaleLowerCase("tr-TR"), m));
    return [...map.values()];
  }

  function displayRank(m) {
    const mainDay = app.window?.main_day;
    const nextDay = String(app.window?.includes_next_day_until || "").slice(0, 10);
    if (m.date === nextDay && isEarly(m)) return `0|${m.time}|${m.league}|${m.home}`;
    if (m.date === mainDay) return `1|${m.time}|${m.league}|${m.home}`;
    return `2|${m.date}|${m.time}|${m.league}|${m.home}`;
  }

  function sortMatches(list) {
    return [...list].sort((a, b) => displayRank(a).localeCompare(displayRank(b), "tr"));
  }

  async function readJson(url) {
    try {
      const r = await fetch(`${url}?v=${Date.now()}`, { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      return { ok: true, data: await r.json() };
    } catch (error) {
      return { ok: false, data: null, error };
    }
  }

  async function load() {
    const [fullRes, liveRes] = await Promise.all([readJson("./data/full-bulletin.json"), readJson("./data/live-matches.json")]);
    const full = fullRes.data;
    const live = liveRes.data;
    app.dataWarning = !fullRes.ok || !liveRes.ok ? "Veri akışı kesildi; son geçerli liste korunuyor." : "";

    if (!fullRes.ok && (app.bulletin.length || app.live.length)) {
      draw();
      return;
    }

    app.window = full?.date_window || app.window || null;
    app.lastUpdated = full?.generated_at || live?.generated_at || app.lastUpdated || "";
    const liveRootDate = toIsoDate(live?.date || full?.date_window?.main_day || "");
    const scheduled = Array.isArray(full?.matches) ? full.matches.map((x, i) => norm(x, i)) : [];
    const liveFromFull = Array.isArray(full?.live_matches) ? full.live_matches.map((x, i) => norm(x, i)) : [];
    const liveFromFile = Array.isArray(live?.matches) ? live.matches.map((x, i) => norm(x, i, { date: liveRootDate })) : [];
    const all = unique([...scheduled, ...liveFromFull, ...liveFromFile]);

    app.bulletin = sortMatches(all.filter(isBulletin));
    app.live = sortMatches(all.filter(isLiveMatch));
    draw();
  }

  function earlyCount() {
    const nextDay = String(app.window?.includes_next_day_until || "").slice(0, 10);
    return app.bulletin.filter((m) => m.date === nextDay && isEarly(m)).length;
  }

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
    const updated = app.lastUpdated ? ` · <span>Güncelleme: ${esc(app.lastUpdated)}</span>` : "";
    root.innerHTML = `
      <div class="flw-top"><h2>Futbol Bülteni</h2><div><span>${app.bulletin.length} başlamamış</span> · <span>${app.live.length} canlı</span>${early ? ` · <span>${early} gece/erken maç</span>` : ""}${updated}</div></div>
      ${warning}
      <div class="flw-tabs"><button data-mode="bulletin" class="${app.mode === "bulletin" ? "on" : ""}">Tüm Bülten</button><button data-mode="live" class="${app.mode === "live" ? "on" : ""}">Canlı Karşılaşmalar</button></div>
      <div class="flw-filter"><input data-q value="${esc(app.q)}" placeholder="Maç veya lig ara"><select data-league></select><button data-refresh>Yenile</button></div>
      <div class="flw-layout"><div class="flw-main"></div><aside class="flw-slip"></aside></div>`;
  }

  function style() {
    if ($("#flw-style")) return;
    const s = document.createElement("style");
    s.id = "flw-style";
    s.textContent = `.flw{margin:18px clamp(10px,3vw,52px);background:#073d3b;color:#fff;border:1px solid rgba(255,212,0,.28);font-family:inherit}.flw-top{display:flex;justify-content:space-between;gap:12px;align-items:center;background:#ffd400;color:#073d3b;padding:12px 14px}.flw-top h2{margin:0;font-size:19px}.flw-warning{padding:8px 14px;background:#3b2107;color:#ffe2b8;font-size:12px;font-weight:850}.flw-tabs{display:flex;gap:8px;padding:10px 14px;background:#0f645e}.flw-tabs button{border:1px solid rgba(255,212,0,.45);border-radius:999px;background:rgba(255,255,255,.08);color:#fff;font-weight:1000;padding:8px 12px;cursor:pointer}.flw-tabs button.on{background:#ffd400;color:#073d3b}.flw-filter{display:grid;grid-template-columns:1fr 220px 90px;gap:8px;padding:10px 14px;background:#062d2c}.flw-filter input,.flw-filter select,.flw-filter button{height:38px;border:0;border-radius:9px;padding:0 10px;font-weight:850}.flw-filter button,.flw-analyze,.flw-clear,.flw-remove{background:#ffd400;color:#073d3b;cursor:pointer}.flw-layout{display:grid;grid-template-columns:minmax(0,1fr) 320px}.flw-main{padding:12px;overflow:auto}.flw-table{min-width:880px;background:#f7fff9;color:#062d2c;border-radius:12px;overflow:hidden}.flw-head,.flw-row{display:grid;grid-template-columns:76px 130px minmax(240px,1fr) repeat(7,58px)}.flw-head{background:#0a504b;color:#fff7bd;font-size:11px;font-weight:1000}.flw-head span,.flw-row>*{padding:7px 6px;border-right:1px solid #cbded6;border-bottom:1px solid #cbded6}.flw-league{background:#d9efe3;color:#073d3b;padding:8px 11px;font-size:11px;font-weight:1000}.flw-row{font-size:11px}.flw-time{font-weight:1000;color:#006447}.flw-live-time{color:#d01515}.flw-teams b{display:block}.flw-code{font-size:9px;color:#6a837d}.flw-empty{margin:13px;padding:19px 12px;border:1px dashed rgba(255,255,255,.25);border-radius:11px;text-align:center;color:#bfd6cf}.flw-odd{display:block;width:100%;min-height:30px;border-radius:8px;border:1px solid #bdd0ca;background:#fff;color:#073d3b;font-weight:950;cursor:pointer}.flw-odd.on,.flw-odd:hover{background:#ffd400}.flw-slip{background:#092c2b;border-left:1px solid rgba(255,255,255,.14);padding:14px}.flw-slip h3{margin:0;color:#ffd400}.flw-card{margin-top:9px;padding:9px;border:1px solid rgba(255,255,255,.15);border-radius:10px;background:rgba(255,255,255,.05);font-size:11px}.flw-flex{display:flex;justify-content:space-between;gap:8px;align-items:center;color:#ffd400;font-weight:950}.flw-act{display:grid;gap:8px;margin-top:9px}.flw-analyze,.flw-clear,.flw-remove{border:0;border-radius:8px;font-weight:1000;padding:7px 9px}.flw-analysis{line-height:1.45;color:#dceee8}.flw-note{color:#a8c2ba;font-size:11px;margin-top:8px}@media(max-width:920px){.flw-filter{grid-template-columns:1fr}.flw-layout{display:block}.flw-slip{border-left:0}}`;
    document.head.appendChild(s);
  }

  function visible() {
    const base = app.mode === "live" ? app.live : app.bulletin;
    return base.filter((m) => (app.league === "all" || m.league === app.league) && (!app.q || `${m.home} ${m.away} ${m.league}`.toLocaleLowerCase("tr-TR").includes(app.q)));
  }

  function oddBtn(m, key, label, keys) {
    const value = pick(m, keys);
    if (isBlank(value)) return `<button class="flw-odd" disabled>—</button>`;
    const on = app.picks.get(m._id)?.key === key ? " on" : "";
    return `<button class="flw-odd${on}" data-pick="${esc(m._id)}" data-key="${esc(key)}" title="${esc(label)}">${esc(fmt(value))}</button>`;
  }

  function drawRows() {
    const base = app.mode === "live" ? app.live : app.bulletin;
    const list = visible();
    const sel = $("[data-league]");
    if (sel) {
      const leagues = [...new Set(base.map((m) => m.league).filter(Boolean))].sort((a, b) => a.localeCompare(b, "tr"));
      sel.innerHTML = `<option value="all">Tüm Ligler</option>${leagues.map((l) => `<option value="${esc(l)}" ${app.league === l ? "selected" : ""}>${esc(l)}</option>`).join("")}`;
    }
    const box = $(".flw-main");
    if (!box) return;
    if (!list.length) {
      box.innerHTML = `<div class="flw-empty">${app.mode === "live" ? "Şu anda canlı karşılaşma yok." : "Başlamamış bülten maçı yok."}</div>`;
      return;
    }
    let html = `<div class="flw-table"><div class="flw-head"><span>Saat</span><span>Lig</span><span>Maç</span>${markets.map((m) => `<span>${esc(m[1])}</span>`).join("")}</div>`;
    let last = "";
    list.forEach((m) => {
      const group = `${m.date}|${m.league}`;
      if (group !== last) {
        last = group;
        const earlyLabel = isEarly(m) && m.date !== app.window?.main_day ? " · Gece/erken saat bloğu" : "";
        html += `<div class="flw-league">${esc(m.date)} · ${esc(m.league)}${earlyLabel}</div>`;
      }
      const timeText = app.mode === "live" ? liveLabel(m) : m.time;
      const timeClass = app.mode === "live" ? "flw-time flw-live-time" : "flw-time";
      html += `<div class="flw-row"><div class="${timeClass}">${esc(timeText)}</div><div>${esc(m.league)}</div><div class="flw-teams"><b>${esc(m.home)} - ${esc(m.away)}</b><span class="flw-code">Kod: ${esc(m.matchCode || m.match_code || m._id)}</span></div>${markets.map(([key, label, keys]) => `<div>${oddBtn(m, key, label, keys)}</div>`).join("")}</div>`;
    });
    box.innerHTML = html + `</div>`;
  }

  function proComment(p) {
    const odd = n(p.value);
    if (odd >= 3.5) return "Pro 12.2: oran yüksek, risk de yüksek; tekli veya düşük stake daha uygun.";
    if (odd >= 2.1) return "Pro 12.2: dengeli oran; maç verisi destekliyorsa kupona aday.";
    if (odd > 0 && odd < 1.5) return "Pro 12.2: oran düşük, değer sınırlı; dikkatli değerlendir.";
    return "Pro 12.2: veri sınırlı; canlı akış ve oran hareketi beklenmeli.";
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
    const scores = picks.map((p) => Math.max(1, Math.min(99, Math.round((n(p.value) ? 100 / n(p.value) : 45) + 4))));
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const risk = avg >= 60 ? "Kontrollü oynanabilir" : avg >= 45 ? "Orta risk" : "Yüksek risk";
    out.innerHTML = `<div class="flw-card flw-analysis"><b>Pro 12.2 Kısa Yorum</b><p>Ortalama skor: %${avg} · ${esc(risk)}</p>${picks.map((p, i) => `<p><b>${esc(p.label)} · ${esc(fmt(p.value))} · %${scores[i]}</b><br>${esc(proComment(p))}</p>`).join("")}</div>`;
  }

  function draw() { ensureRoot(); style(); drawRows(); drawSlip(); }

  function select(id, key) {
    const item = [...app.bulletin, ...app.live].find((m) => m._id === id);
    const market = marketByKey[key];
    if (!item || !market) return;
    const value = pick(item, market.keys);
    if (isBlank(value)) return;
    if (app.picks.get(id)?.key === key) app.picks.delete(id);
    else app.picks.set(id, { id, key, label: market.label, value, home: item.home, away: item.away });
    drawRows();
    drawSlip();
  }

  app.click = (e) => {
    const mode = e.target.closest("[data-mode]");
    if (mode) { app.mode = mode.dataset.mode === "live" ? "live" : "bulletin"; app.league = "all"; draw(); return; }
    const p = e.target.closest("[data-pick]");
    if (p) { select(p.dataset.pick, p.dataset.key); return; }
    const rm = e.target.closest("[data-remove]");
    if (rm) { app.picks.delete(rm.dataset.remove); drawRows(); drawSlip(); return; }
    if (e.target.closest("[data-clear]")) { app.picks.clear(); drawRows(); drawSlip(); return; }
    if (e.target.closest("[data-analyze]")) { analyze(); return; }
    if (e.target.closest("[data-refresh]")) load();
  };
  app.input = (e) => {
    if (e.target.matches("[data-q]")) { app.q = e.target.value.toLocaleLowerCase("tr-TR"); drawRows(); }
    if (e.target.matches("[data-league]")) { app.league = e.target.value; drawRows(); }
  };
  app.off = () => { document.removeEventListener("click", app.click); document.removeEventListener("input", app.input); document.removeEventListener("change", app.input); clearInterval(app.timer); };

  document.addEventListener("click", app.click);
  document.addEventListener("input", app.input);
  document.addEventListener("change", app.input);
  draw();
  load();
  app.timer = setInterval(load, 60000);
})();
