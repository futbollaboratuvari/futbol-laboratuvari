(() => {
  const version = "20260627-pro122-unified-v3";
  const resetKey = "fl_membership_full_reset_20260622_v9";

  if (localStorage.getItem(resetKey) !== "1") {
    [
      "fl_premium_beta_access",
      "fl_premium_access_note",
      "fl_premium_access_level",
      "fl_premium_code_entered",
      "fl_selected_membership_plan",
      "fl_premium_count",
      "fl_premium_count_plan",
      "fl_premium_robot_queue",
      "fl_last_premium_robot_analysis"
    ].forEach((key) => localStorage.removeItem(key));
    localStorage.setItem(resetKey, "1");
  }

  document.documentElement.dataset.flCacheVersion = version;

  const hasScript = (src) => [...document.querySelectorAll("script[src]")]
    .some((script) => String(script.getAttribute("src") || "").includes(src));

  const loadScript = (src, id) => {
    if (id && document.getElementById(id)) return;
    if (hasScript(src)) return;
    const script = document.createElement("script");
    if (id) script.id = id;
    script.src = `${src}?v=${version}`;
    script.async = false;
    document.body.appendChild(script);
  };

  const isEmpty = (value) => {
    const text = String(value ?? "").trim();
    return !text || text === "-" || text === "—" || text.toLowerCase() === "null" || text.toLowerCase() === "undefined";
  };

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const marketLabels = {
    ms1: "Maç Sonucu 1",
    msx: "Maç Sonucu X",
    ms2: "Maç Sonucu 2",
    oneOdd: "Maç Sonucu 1",
    drawOdd: "Maç Sonucu X",
    twoOdd: "Maç Sonucu 2",
    under25: "2.5 Alt",
    over25: "2.5 Üst",
    under35: "3.5 Alt",
    over35: "3.5 Üst",
    bttsYes: "KG Var",
    bttsNo: "KG Yok",
    firstHalfBttsYes: "İlk Yarı KG Var",
    secondHalfBttsYes: "İkinci Yarı KG Var"
  };

  const addMarket = (list, seen, label, value) => {
    if (isEmpty(value)) return;
    const key = `${label}|${value}`;
    if (seen.has(key)) return;
    seen.add(key);
    list.push({ label, value });
  };

  const objectMarkets = (list, seen, source) => {
    if (!source || typeof source !== "object" || Array.isArray(source)) return;
    Object.entries(marketLabels).forEach(([key, label]) => addMarket(list, seen, label, source[key]));
    Object.entries(source).forEach(([key, value]) => {
      if (marketLabels[key]) return;
      if (typeof value === "object") return;
      const label = String(key).replaceAll("_", " ").replaceAll("-", " ");
      addMarket(list, seen, label, value);
    });
  };

  const blockMarkets = (list, seen, blocks) => {
    if (!Array.isArray(blocks)) return;
    blocks.forEach((block) => {
      const title = block?.title || block?.name || block?.market || block?.label || "Detay Market";
      if (Array.isArray(block?.markets)) {
        block.markets.forEach((item) => addMarket(list, seen, item?.label || item?.name || title, item?.odd ?? item?.value ?? item?.oran));
      } else if (block && typeof block === "object") {
        Object.entries(block).forEach(([key, value]) => {
          if (["title", "name", "market", "label"].includes(key)) return;
          if (typeof value === "object") return;
          addMarket(list, seen, `${title} ${key}`, value);
        });
      }
    });
  };

  const detailMarketsFor = (match) => {
    const list = [];
    const seen = new Set();
    [match?.available_odds, match?.raw_market_guess_odds, match?.odds, match?.oranlar, match?.detay_oranlar, match?.detailOdds, match].forEach((source) => objectMarkets(list, seen, source));
    blockMarkets(list, seen, match?.raw_market_blocks);
    return list;
  };

  const repairDetailMarkets = (button) => {
    const widget = document.getElementById("daily-matches-widget");
    if (!widget || !button || !widget.contains(button)) return;
    const uid = String(button.dataset.detailUid || "");
    const match = (window.__dailyMatchesData || []).find((item) => String(item?._uid) === uid);
    const row = button.closest(".fl-match-row");
    const extra = row?.nextElementSibling?.classList?.contains("fl-extra") ? row.nextElementSibling : null;
    if (!match || !extra) return;
    const markets = detailMarketsFor(match);
    extra.innerHTML = markets.length
      ? `<div class="fl-extra-grid">${markets.map((m) => `<div class="fl-extra-market"><span>${esc(m.label)}</span><b>${esc(m.value)}</b></div>`).join("")}</div>`
      : `<div class="fl-widget-empty">Bu maç için detay market verisi akışta yok.</div>`;
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("#daily-matches-widget [data-detail-uid]");
    if (!button) return;
    setTimeout(() => repairDetailMarkets(button), 0);
  });

  loadScript("site-bulletin-active-guard.js", "site-bulletin-active-guard-script");
  loadScript("learning-visibility.js", "learning-visibility-script");
  loadScript("learning-output-visibility.js", "learning-output-visibility-script");
  loadScript("premium-analysis-extra-markets.js", "premium-analysis-extra-markets-script");
  loadScript("pro12-2-wide-market-engine.js", "pro122-wide-market-engine-script");
  loadScript("fl-pagination-slider.js", "fl-pagination-slider-script");
  loadScript("mobile-hero-panel-fix.js", "mobile-hero-panel-fix-script");
  loadScript("kupon-center-fallback.js", "kupon-center-fallback-script");
  loadScript("widget-navigation-buttons.js", "widget-navigation-buttons-script");
})();