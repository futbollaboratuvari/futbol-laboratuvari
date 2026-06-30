(() => {
  const KEY = "__flBulletinDetailAnalysisBridge";
  if (window[KEY]?.off) window[KEY].off();

  const INTENT_KEY = "fl_bulletin_analysis_intent";
  const app = { observer: null, timer: null };
  window[KEY] = app;

  const esc = (value) => String(value ?? "").replace(/[&<>\"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c]));
  const blank = (value) => { const text = String(value ?? "").trim(); return !text || text === "-" || text === "—" || /null|undefined/i.test(text); };
  const odd = (value) => {
    const number = Number(String(value ?? "").replace(",", ".").match(/\d+(\.\d+)?/)?.[0] || 0);
    return Number.isFinite(number) && number > 1 ? number.toFixed(2) : "";
  };
  const cleanKey = (value) => String(value || "").toLocaleLowerCase("tr-TR").replace(/ı/g, "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  const labelOf = (key) => ({
    ms1: "MS 1", msx: "MS X", ms2: "MS 2", under25: "2.5 Alt", over25: "2.5 Üst",
    bttsYes: "KG Var", bttsNo: "KG Yok", firstHalfBttsYes: "İlk yarı KG Var",
    firstHalfBttsNo: "İlk yarı KG Yok", secondHalfBttsYes: "İkinci yarı KG Var",
    secondHalfBttsNo: "İkinci yarı KG Yok", firstHalfKgVar: "İlk yarı KG Var",
    firstHalfKgYok: "İlk yarı KG Yok", secondHalfKgVar: "İkinci yarı KG Var",
    secondHalfKgYok: "İkinci yarı KG Yok", iyKgVar: "İlk yarı KG Var", iyKgYok: "İlk yarı KG Yok",
    iy2KgVar: "İkinci yarı KG Var", iy2KgYok: "İkinci yarı KG Yok", over35: "3.5 Üst", under35: "3.5 Alt"
  }[key] || String(key || "Market"));

  const widget = () => window.__flDailyWidget;
  const findMatch = (id) => {
    const state = widget();
    return [...(state?.bulletin || []), ...(state?.live || []), ...(state?.finished || [])].find((match) => String(match._id) === String(id));
  };

  const addMarket = (rows, seen, key, label, value, source) => {
    const valueText = odd(value);
    if (!valueText) return;
    const safeKey = String(key || label || "market");
    const seenKey = cleanKey(`${safeKey} ${label} ${valueText}`);
    if (seen.has(seenKey)) return;
    seen.add(seenKey);
    rows.push({ key: safeKey, label: label || labelOf(safeKey), value: valueText, source });
  };

  const marketsFor = (match) => {
    const rows = [];
    const seen = new Set();
    [
      ["firstHalfBttsYes", "İlk yarı KG Var"], ["firstHalfBttsNo", "İlk yarı KG Yok"],
      ["secondHalfBttsYes", "İkinci yarı KG Var"], ["secondHalfBttsNo", "İkinci yarı KG Yok"],
      ["over25", "Gol beklentisi 2.5 Üst"], ["under25", "Gol beklentisi 2.5 Alt"]
    ].forEach(([key, label]) => addMarket(rows, seen, key, label, match?.[key] ?? match?.available_odds?.[key] ?? match?.odds?.[key] ?? match?.raw_market_guess_odds?.[key], match?.oddsSource || match?.source));

    if (Array.isArray(match?.detail_markets)) {
      match.detail_markets.forEach((item, index) => addMarket(rows, seen, item?.key || `detail_${index}`, item?.label || item?.title || item?.market, item?.odd ?? item?.odds ?? item?.value, item?.source || match?.source));
    }
    Object.entries(match?.available_odds || match?.odds || {}).forEach(([key, value]) => addMarket(rows, seen, key, labelOf(key), value, match?.oddsSource || match?.source));
    return rows.slice(0, 24);
  };

  const injectStyles = () => {
    if (document.getElementById("fl-detail-bridge-style")) return;
    const style = document.createElement("style");
    style.id = "fl-detail-bridge-style";
    style.textContent = `.flw-detail-bridge-odd{width:100%;display:flex;justify-content:space-between;gap:8px;align-items:center;margin:4px 0;padding:6px 8px;border:1px solid #cbded6;border-radius:8px;background:#fff;color:#073d3b;font:inherit;font-weight:850;text-align:left;cursor:pointer}.flw-detail-bridge-odd strong{color:#006447}.flw-detail-bridge-odd:hover{background:#ffd400;border-color:#d1a900}.flw-detail-bridge-note{margin-top:6px;color:#59766f;font-size:11px}`;
    document.head.appendChild(style);
  };

  const enhance = () => {
    injectStyles();
    document.querySelectorAll("#daily-matches-widget .flw-row [data-toggle]").forEach((toggle) => {
      const id = toggle.dataset.toggle;
      const row = toggle.closest(".flw-row");
      const detail = row?.nextElementSibling;
      if (!detail?.classList?.contains("flw-detail-row") || detail.dataset.bridgeEnhanced === id) return;
      const match = findMatch(id);
      if (!match) return;
      const cards = detail.querySelectorAll(".flw-detail-card");
      const target = cards[2];
      if (!target) return;
      const markets = marketsFor(match);
      target.innerHTML = `<b>Gol ve Oran Detayları</b>${markets.length ? markets.map((market) => `<button type="button" class="flw-detail-bridge-odd" data-fl-detail-analysis="1" data-match-id="${esc(id)}" data-market-key="${esc(market.key)}" data-market-label="${esc(market.label)}" data-market-value="${esc(market.value)}"><span>${esc(market.label)}</span><strong>${esc(market.value)}</strong></button>`).join("") : `<div>Oran verisi bekleniyor</div>`}<div class="flw-detail-bridge-note">${esc(match.oddsSource || match.source || "Maçkolik veri akışı")} · Tıklanan oran özel analiz paneline aktarılır.</div>`;
      detail.dataset.bridgeEnhanced = id;
    });
  };

  const renderPremiumIntent = (payload) => {
    const panel = document.getElementById("premium-analysis-panel");
    if (!panel) return;
    const select = panel.querySelector("[data-single-match]");
    if (select) {
      Array.from(select.options).forEach((option) => {
        option.selected = cleanKey(option.textContent).includes(cleanKey(`${payload.home} ${payload.away}`)) || cleanKey(option.textContent).includes(cleanKey(`${payload.away} ${payload.home}`));
      });
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
    const marketButton = Array.from(panel.querySelectorAll("[data-single-market]")).find((button) => cleanKey(button.dataset.singleMarket) === cleanKey(payload.marketLabel));
    if (marketButton && !marketButton.disabled) marketButton.click();
    const analyze = panel.querySelector("[data-single-analyze]");
    if (analyze && !analyze.disabled && marketButton) analyze.click();
    const output = panel.querySelector("[data-single-output]");
    if (output && (!marketButton || marketButton.disabled)) {
      output.innerHTML = `<h4>Futbol Bülteni oranı özel analize aktarıldı</h4><article class="pa-analysis-card"><div class="pa-analysis-title"><span>${esc(payload.home)} - ${esc(payload.away)}</span><span>${esc(payload.time || "--:--")}</span></div><span class="pa-tag">Futbol Bülteni</span><div class="pa-row"><span>Lig</span><strong>${esc(payload.league || "Lig")}</strong></div><div class="pa-row"><span>Seçilen Market</span><strong>${esc(payload.marketLabel)}</strong></div><div class="pa-row"><span>Oran</span><strong>${esc(payload.odds)}</strong></div><p class="pa-reason">Seçim Futbol Bülteni detay bölümünden geldi. Robotun ek analiz alanları varsa bu maçın bülten verisi üzerinden okunur; oran yoksa eski oran gösterilmez.</p></article>`;
    }
  };

  const send = (button) => {
    const match = findMatch(button.dataset.matchId);
    if (!match || blank(button.dataset.marketValue)) return;
    const payload = {
      id: button.dataset.matchId,
      matchCode: match.matchCode || match.match_code || "",
      date: match.date,
      time: match.time,
      league: match.league,
      home: match.home,
      away: match.away,
      marketKey: button.dataset.marketKey,
      marketLabel: button.dataset.marketLabel,
      odds: button.dataset.marketValue,
      source: match.oddsSource || match.source || "Futbol Bülteni",
      createdAt: new Date().toISOString()
    };
    try { localStorage.setItem(INTENT_KEY, JSON.stringify(payload)); } catch {}
    document.dispatchEvent(new CustomEvent("fl:bulletin-odd-selected", { detail: payload }));
    const panel = document.getElementById("premium-analysis-panel");
    if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => renderPremiumIntent(payload), 350);
  };

  const schedule = () => {
    clearTimeout(app.timer);
    app.timer = setTimeout(enhance, 100);
  };

  app.click = (event) => {
    const button = event.target.closest("[data-fl-detail-analysis]");
    if (button) send(button);
  };
  app.off = () => {
    document.removeEventListener("click", app.click);
    app.observer?.disconnect();
    clearTimeout(app.timer);
  };

  document.addEventListener("click", app.click);
  document.addEventListener("fl:bulletin-odd-selected", (event) => setTimeout(() => renderPremiumIntent(event.detail), 350));
  app.observer = new MutationObserver(schedule);
  app.observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("load", schedule);
  document.addEventListener("DOMContentLoaded", schedule, { once: true });
  schedule();
})();
