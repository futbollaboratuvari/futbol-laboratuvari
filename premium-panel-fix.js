(() => {
  const PANEL_ID = "premium-analysis-panel";
  const ACCESS_KEY = "fl_premium_beta_access";
  const MEMBER_KEY = "fl_premium_membership";
  const BULLETIN_URL = "./data/full-bulletin.json";
  const FALLBACK_URL = "./data/two-day-bulletin.json";
  const LEGACY_LIST_KEY = "fl_multi_pick_list";
  const MARKETS = ["Robot Önerisi", "MS 1", "MS X", "MS 2", "2.5 Üst", "2.5 Alt", "KG Var", "KG Yok", "1Y KG Var", "2Y KG Var"];

  let cachedMatches = [];
  let selectedMarket = MARKETS[0];
  let renderBusy = false;

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const cleanKey = (value) => String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  const readMember = () => {
    try { return JSON.parse(localStorage.getItem(MEMBER_KEY) || "{}"); } catch { return {}; }
  };

  const isActive = () => localStorage.getItem(ACCESS_KEY) === "1";

  const readJson = async (url, fallback) => {
    try {
      const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}ts=${Date.now()}`, { cache: "no-store" });
      return res.ok ? await res.json() : fallback;
    } catch {
      return fallback;
    }
  };

  const toSortableMinutes = (date, time) => {
    const [year, month, day] = String(date || "").slice(0, 10).split("-").map(Number);
    const [hour, minute] = String(time || "00:00").split(":").map(Number);
    if (![year, month, day].every(Number.isFinite)) return 0;
    return Date.UTC(year, month - 1, day, Number.isFinite(hour) ? hour : 0, Number.isFinite(minute) ? minute : 0) / 60000;
  };

  const nowIstanbulMinutes = () => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    }).formatToParts(new Date()).reduce((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});
    return toSortableMinutes(`${parts.year}-${parts.month}-${parts.day}`, `${parts.hour}:${parts.minute}`);
  };

  const isUpcoming = (match) => {
    const status = cleanKey(`${match.status || ""} ${match.liveStatus || ""} ${match.flow_status || ""}`);
    if (/(live|canli|started|playing|ht|finished|ft|aet|pen|cancelled|canceled|canc|iptal|postponed|pst|ertelendi)/.test(status)) return false;
    return toSortableMinutes(match.date || match.tarih, match.time || match.saat || match.start_time) > nowIstanbulMinutes();
  };

  const dedupe = (matches) => {
    const seen = new Set();
    return matches.filter((match) => {
      const key = cleanKey(`${match.matchCode || match.mac_kodu || ""} ${match.date || match.tarih || ""} ${match.time || match.saat || match.start_time || ""} ${match.home || match.home_team_name || ""} ${match.away || match.away_team_name || ""}`);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const normalize = (match) => ({
    date: match.date || match.tarih || "",
    time: match.time || match.saat || match.start_time || "",
    league: match.league || match.competition_name || match.lig || "Lig",
    home: match.home || match.home_team_name || match.ev_sahibi || "Ev sahibi",
    away: match.away || match.away_team_name || match.deplasman || "Deplasman",
    decision: match.decision || match.suggested_option || match.recommended_market || "",
    score: match.analysis_score ?? match.confidence ?? "",
    risk: match.risk_level || "",
    reason: match.robot_reason || match.robot_comment || "Futbol Bülteni verisi üzerinden özel analiz için hazır.",
    odds: {
      ms1: match.ms1 ?? match.one ?? match.oneOdd ?? match.available_odds?.ms1 ?? match.odds?.ms1,
      msx: match.msx ?? match.draw ?? match.drawOdd ?? match.available_odds?.msx ?? match.odds?.msx,
      ms2: match.ms2 ?? match.two ?? match.twoOdd ?? match.available_odds?.ms2 ?? match.odds?.ms2,
      over25: match.over25 ?? match.ust25 ?? match.available_odds?.over25 ?? match.odds?.over25,
      under25: match.under25 ?? match.alt25 ?? match.available_odds?.under25 ?? match.odds?.under25,
      bttsYes: match.bttsYes ?? match.raw_market_guess_odds?.bttsYes_guess ?? match.available_odds?.bttsYes,
      bttsNo: match.bttsNo ?? match.raw_market_guess_odds?.bttsNo_guess ?? match.available_odds?.bttsNo
    }
  });

  const loadMatches = async () => {
    const [primary, fallback] = await Promise.all([
      readJson(BULLETIN_URL, { matches: [] }),
      readJson(FALLBACK_URL, { matches: [] })
    ]);
    const source = Array.isArray(primary.matches) && primary.matches.length ? primary.matches : (Array.isArray(fallback.matches) ? fallback.matches : []);
    cachedMatches = dedupe(source).filter(isUpcoming).map(normalize).sort((a, b) => String(a.time || "99:99").localeCompare(String(b.time || "99:99")));
    return cachedMatches;
  };

  const optionText = (match) => {
    const score = match.score !== "" && match.score !== null && match.score !== undefined ? ` · ${match.score}/100` : "";
    const market = match.decision ? ` · ${match.decision}` : "";
    return `${match.time || "--:--"} | ${match.home} - ${match.away} · ${match.league}${market}${score}`;
  };

  const optionHtml = (matches) => matches.length
    ? matches.map((match, index) => `<option value="${index}">${esc(optionText(match))}</option>`).join("")
    : `<option value="">Futbol Bülteni içinde başlamamış maç bulunamadı</option>`;

  const pickOdd = (match, market) => {
    const text = cleanKey(market);
    if (text.includes("ms 1")) return match.odds.ms1;
    if (text.includes("ms x")) return match.odds.msx;
    if (text.includes("ms 2")) return match.odds.ms2;
    if (text.includes("2 5 ust")) return match.odds.over25;
    if (text.includes("2 5 alt")) return match.odds.under25;
    if (text.includes("kg var")) return match.odds.bttsYes;
    if (text.includes("kg yok")) return match.odds.bttsNo;
    return "";
  };

  const oddsGrid = (match) => {
    const cells = [["MS 1", match.odds.ms1], ["MS X", match.odds.msx], ["MS 2", match.odds.ms2], ["2.5 Üst", match.odds.over25], ["2.5 Alt", match.odds.under25], ["KG Var", match.odds.bttsYes], ["KG Yok", match.odds.bttsNo]];
    return `<div class="pa-odds-grid">${cells.map(([label, value]) => `<span class="pa-odd">${esc(label)}<b>${esc(value || "Oran verisi bekleniyor")}</b></span>`).join("")}</div>`;
  };

  const renderResult = (selected) => {
    const rows = selected.map((match, index) => {
      const market = selectedMarket === MARKETS[0] ? (match.decision || "Robot önerisi bekleniyor") : selectedMarket;
      const odd = selectedMarket === MARKETS[0] ? "-" : (pickOdd(match, selectedMarket) || "Oran verisi bekleniyor");
      return `<article class="pa-analysis-card"><div class="pa-analysis-title"><span>${index + 1}. ${esc(match.home)} - ${esc(match.away)}</span><span>${esc(match.time || "--:--")}</span></div><span class="pa-tag">Futbol Bülteni</span><div class="pa-row"><span>Lig</span><strong>${esc(match.league)}</strong></div><div class="pa-row"><span>Seçilen Market</span><strong>${esc(market)}</strong></div><div class="pa-row"><span>Oran</span><strong>${esc(odd)}</strong></div><div class="pa-row"><span>Güven / Risk</span><strong>${esc(match.score || "-")} · ${esc(match.risk || "-")}</strong></div>${oddsGrid(match)}<p class="pa-reason">${esc(match.reason)}</p></article>`;
    }).join("");
    return `<h4>${selected.length} maçlık özel analiz hazır</h4><div class="pa-row"><span>Veri Kaynağı</span><strong>Futbol Bülteni</strong></div>${rows}`;
  };

  const renderPanel = async () => {
    if (renderBusy) return;
    renderBusy = true;
    try {
      localStorage.removeItem(LEGACY_LIST_KEY);
      const shell = document.getElementById(PANEL_ID);
      if (!shell) return;
      await loadMatches();
      const active = isActive();
      const member = readMember();
      shell.dataset.singleBulletinPanel = "1";
      shell.querySelector("[data-multi-tools]")?.remove();
      shell.innerHTML = `<div class="pa-head"><div><h2 class="pa-title">Özel Maç / Kupon Analizi</h2><p class="pa-sub">Bu panel tek bülten kullanır. Maç listesi doğrudan Futbol Bülteni dosyasından gelir; başlamış veya bitmiş maçlar burada gösterilmez.</p></div><div class="pa-badge">${active ? "Üyelik aktif" : "Üyelik kilitli"}</div></div><div class="pa-state"><div><span>Paket</span><strong>${active ? esc(member.planName || "Premium Üye") : "Ön İzleme"}</strong></div><div><span>Kalan Kullanım</span><strong>${active ? esc(member.remainingAnalysisCount ?? "Aktif") : "Kilitli"}</strong></div><div><span>Bülten Maçı</span><strong>${cachedMatches.length}</strong></div><div><span>Kaynak</span><strong>Futbol Bülteni</strong></div></div><div class="pa-grid"><div class="pa-card"><h3>Tek Bülten Listesi</h3><div class="pa-tool-row"><input class="pa-input" type="search" placeholder="Maç, lig veya takım ara" data-single-search ${active ? "" : "disabled"}><button class="pa-button secondary" type="button" data-single-clear ${active ? "" : "disabled"}>Temizle</button></div><span class="pa-filter-note" data-single-count>${cachedMatches.length} maç listeleniyor · 0 maç seçildi</span><label class="pa-small">Futbol Bülteni<select class="pa-select" data-single-match multiple size="10" ${active ? "" : "disabled"}>${optionHtml(cachedMatches)}</select></label><div class="pa-market-grid">${MARKETS.map((market, index) => `<button class="pa-market${index === 0 ? " active" : ""}" type="button" data-single-market="${esc(market)}" ${active ? "" : "disabled"}>${esc(market)}</button>`).join("")}</div><button class="pa-button" type="button" data-single-analyze ${active ? "" : "disabled"}>Özel Analizi Başlat</button></div><div class="pa-card"><h3>Özel Analiz Sonucu</h3><div class="pa-result" data-single-output><h4>Hazır bekliyor</h4><p class="pa-small">Futbol Bülteni’nden maç seçildiğinde sonuç burada oluşur.</p></div></div></div>`;

      const select = shell.querySelector("[data-single-match]");
      const search = shell.querySelector("[data-single-search]");
      const count = shell.querySelector("[data-single-count]");
      const output = shell.querySelector("[data-single-output]");

      const updateCount = () => {
        const selectedCount = Array.from(select?.selectedOptions || []).filter((o) => o.value !== "").length;
        if (count) count.textContent = `${select?.options?.length || 0} maç listeleniyor · ${selectedCount} maç seçildi`;
      };

      search?.addEventListener("input", () => {
        const term = cleanKey(search.value);
        const filtered = cachedMatches.filter((match) => !term || cleanKey(`${match.league} ${match.home} ${match.away}`).includes(term));
        if (select) select.innerHTML = optionHtml(filtered);
        updateCount();
      });

      shell.querySelector("[data-single-clear]")?.addEventListener("click", () => {
        if (search) search.value = "";
        if (select) select.innerHTML = optionHtml(cachedMatches);
        updateCount();
      });

      shell.querySelectorAll("[data-single-market]").forEach((button) => {
        button.addEventListener("click", () => {
          shell.querySelectorAll("[data-single-market]").forEach((item) => item.classList.remove("active"));
          button.classList.add("active");
          selectedMarket = button.dataset.singleMarket || MARKETS[0];
        });
      });

      select?.addEventListener("change", updateCount);
      shell.querySelector("[data-single-analyze]")?.addEventListener("click", () => {
        const selected = Array.from(select?.selectedOptions || []).map((option) => cachedMatches[Number(option.value)]).filter(Boolean);
        if (!selected.length) {
          output.innerHTML = `<h4>Eksik seçim</h4><p class="pa-small">Futbol Bülteni listesinden en az 1 maç seç.</p>`;
          return;
        }
        output.innerHTML = renderResult(selected);
      });
    } finally {
      renderBusy = false;
    }
  };

  const scheduleRender = () => setTimeout(renderPanel, 250);

  window.addEventListener("load", scheduleRender);
  document.addEventListener("DOMContentLoaded", scheduleRender, { once: true });
  document.addEventListener("fl:trial-access-started", scheduleRender);

  const observer = new MutationObserver(() => {
    const shell = document.getElementById(PANEL_ID);
    if (shell && shell.dataset.singleBulletinPanel !== "1") scheduleRender();
  });
  window.addEventListener("load", () => {
    const main = document.querySelector("main") || document.body;
    observer.observe(main, { childList: true, subtree: true });
    scheduleRender();
  });
})();