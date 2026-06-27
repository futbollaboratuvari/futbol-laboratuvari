(() => {
  const version = "20260627-pro122-market-v2";
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

  const marketDefinitions = [
    ["Maç Sonucu 1", ["ms1", "one", "oneOdd", "odd1", "ms_1"]],
    ["Maç Sonucu X", ["msx", "draw", "drawOdd", "oddX", "x", "ms_x"]],
    ["Maç Sonucu 2", ["ms2", "two", "twoOdd", "odd2", "ms_2"]],
    ["1.5 Alt", ["under15", "alt15", "under1_5", "alt_15"]],
    ["1.5 Üst", ["over15", "ust15", "over1_5", "ust_15"]],
    ["2.5 Alt", ["under25", "alt25", "under", "alt", "under25_guess", "alt_25"]],
    ["2.5 Üst", ["over25", "ust25", "over", "ust", "over25_guess", "ust_25"]],
    ["3.5 Alt", ["under35", "alt35", "under3_5", "alt_35"]],
    ["3.5 Üst", ["over35", "ust35", "over3_5", "ust_35"]],
    ["4.5 Alt", ["under45", "alt45", "under4_5", "alt_45"]],
    ["4.5 Üst", ["over45", "ust45", "over4_5", "ust_45"]],
    ["KG Var", ["bttsYes", "kgVar", "kg_var", "varOdd", "var", "bttsYes_guess"]],
    ["KG Yok", ["bttsNo", "kgYok", "kg_yok", "yokOdd", "yok", "bttsNo_guess"]],
    ["İlk Yarı KG Var", ["firstHalfBttsYes", "iyKgVar", "iy_kg_var", "first_half_btts_yes"]],
    ["İkinci Yarı KG Var", ["secondHalfBttsYes", "ikinciYariKgVar", "ikinci_yari_kg_var", "second_half_btts_yes"]],
    ["İY/MS 1/1", ["htFt11", "iyMs11", "halfFull11"]],
    ["İY/MS X/1", ["htFtX1", "iyMsX1", "halfFullX1"]],
    ["İY/MS 2/2", ["htFt22", "iyMs22", "halfFull22"]],
    ["MS 1 + 2.5 Üst", ["homeWinOver25", "ms1Over25"]],
    ["MS X + 2.5 Üst", ["drawOver25", "msxOver25"]],
    ["MS 2 + 2.5 Üst", ["awayWinOver25", "ms2Over25"]],
    ["MS 1 + KG Var", ["homeWinBtts", "ms1KgVar"]],
    ["MS X + KG Var", ["drawBtts", "msxKgVar"]],
    ["MS 2 + KG Var", ["awayWinBtts", "ms2KgVar"]],
    ["0-1 Gol", ["goals01", "goalRange01"]],
    ["2-3 Gol", ["goals23", "goalRange23"]],
    ["4-5 Gol", ["goals45", "goalRange45", "goals46", "goalRange46"]],
    ["6+ Gol", ["goals6plus", "goalRange6plus"]],
    ["En Çok Gol 1. Yarı", ["mostGoalsFirstHalf", "firstHalfMostGoals"]],
    ["En Çok Gol 2. Yarı", ["mostGoalsSecondHalf", "secondHalfMostGoals"]],
    ["Tek", ["totalOdd", "tek"]],
    ["Çift", ["totalEven", "cift"]],
    ["Korner 8.5 Üst", ["cornerOver85", "cornersOver85"]],
    ["Korner 9.5 Üst", ["cornerOver95", "cornersOver95"]],
    ["Kart 3.5 Üst", ["cardOver35", "cardsOver35"]],
    ["Kart 4.5 Üst", ["cardOver45", "cardsOver45"]],
    ["Takım Şut Ev 10+", ["homeShots10", "homeTeamShots10"]],
    ["Takım Şut Dep 10+", ["awayShots10", "awayTeamShots10"]],
    ["Toplam Şut 21+", ["totalShots21", "shots21Plus"]]
  ];

  const addMarket = (list, seen, label, value) => {
    if (isEmpty(value)) return;
    const key = `${label}|${value}`;
    if (seen.has(key)) return;
    seen.add(key);
    list.push({ label, value });
  };

  const readFromSource = (source, keys) => {
    if (!source || typeof source !== "object" || Array.isArray(source)) return "";
    for (const key of keys) {
      const value = source[key];
      if (!isEmpty(value)) return value;
    }
    return "";
  };

  const objectMarkets = (list, seen, source) => {
    if (!source || typeof source !== "object" || Array.isArray(source)) return;
    marketDefinitions.forEach(([label, keys]) => addMarket(list, seen, label, readFromSource(source, keys)));
  };

  const blockMarkets = (list, seen, blocks) => {
    if (!Array.isArray(blocks)) return;
    blocks.forEach((block) => {
      const title = block?.title || block?.name || block?.market || block?.label || "Detay Market";
      if (Array.isArray(block?.markets)) block.markets.forEach((item) => addMarket(list, seen, item?.label || item?.name || title, item?.odd ?? item?.value ?? item?.oran));
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