(() => {
  const version = "20260627-wide-detail-select-v1";
  const resetKey = "fl_membership_full_reset_20260622_v9";

  if (localStorage.getItem(resetKey) !== "1") {
    ["fl_premium_beta_access", "fl_premium_access_note", "fl_premium_access_level", "fl_premium_code_entered", "fl_selected_membership_plan", "fl_premium_count", "fl_premium_count_plan", "fl_premium_robot_queue", "fl_last_premium_robot_analysis"].forEach((key) => localStorage.removeItem(key));
    localStorage.setItem(resetKey, "1");
  }

  document.documentElement.dataset.flCacheVersion = version;

  const hasScript = (src) => [...document.querySelectorAll("script[src]")].some((script) => String(script.getAttribute("src") || "").includes(src));
  const loadScript = (src, id) => { if (id && document.getElementById(id)) return; if (hasScript(src)) return; const script = document.createElement("script"); if (id) script.id = id; script.src = `${src}?v=${version}`; script.async = false; document.body.appendChild(script); };
  const isEmpty = (value) => { const text = String(value ?? "").trim(); return !text || text === "-" || text === "—" || text.toLowerCase() === "null" || text.toLowerCase() === "undefined"; };
  const esc = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const parseOdd = (value) => { const num = Number(String(value ?? "").replace(",", ".")); return Number.isFinite(num) && num > 0 ? num : 0; };
  const fmt = (value) => Number.isFinite(value) && value > 0 ? value.toFixed(2) : "—";
  const pct = (value) => Math.max(1, Math.min(99, Math.round(Number(value) || 0)));
  const implied = (odd) => odd ? 100 / odd : 0;

  const marketDefinitions = [];
  const addDef = (key, label, keys, group = "general") => marketDefinitions.push({ key, label, keys, group });
  addDef("ms1", "Maç Sonucu 1", ["ms1", "one", "oneOdd", "odd1", "ms_1"], "home");
  addDef("msx", "Maç Sonucu X", ["msx", "draw", "drawOdd", "oddX", "x", "ms_x"], "draw");
  addDef("ms2", "Maç Sonucu 2", ["ms2", "two", "twoOdd", "odd2", "ms_2"], "away");
  addDef("under25", "2.5 Alt", ["under25", "alt25", "under", "alt", "under25_guess", "alt_25"], "under");
  addDef("over25", "2.5 Üst", ["over25", "ust25", "over", "ust", "over25_guess", "ust_25"], "goal");
  addDef("bttsYes", "KG Var", ["bttsYes", "kgVar", "kg_var", "varOdd", "var", "bttsYes_guess"], "btts");
  addDef("bttsNo", "KG Yok", ["bttsNo", "kgYok", "kg_yok", "yokOdd", "yok", "bttsNo_guess"], "btts");
  [["hnd1", "HND 1"], ["hndX", "HND X"], ["hnd2", "HND 2"], ["hnd01", "HND 0-1"], ["hnd10", "HND 1-0"], ["hnd20", "HND 2-0"], ["hnd02", "HND 0-2"]].forEach(([key, label]) => addDef(key, label, [key, `${key}_guess`, key.replace("hnd", "handicap")], "hnd"));
  ["0.5", "1.5", "3.5", "4.5"].forEach((line) => { const key = line.replace(".", ""); addDef(`under${key}`, `${line} Alt`, [`under${key}`, `alt${key}`, `under${line[0]}_5`, `alt_${key}`], "under"); addDef(`over${key}`, `${line} Üst`, [`over${key}`, `ust${key}`, `over${line[0]}_5`, `ust_${key}`], "goal"); });
  ["1/1", "1/X", "1/2", "X/1", "X/X", "X/2", "2/1", "2/X", "2/2"].forEach((item) => addDef(`htFt${item.replace("/", "")}`, `İY/MS ${item}`, [`htFt${item.replace("/", "")}`, `iyMs${item.replace("/", "")}`, `halfFull${item.replace("/", "")}`], "combo"));
  ["1.5", "2.5", "3.5", "4.5"].forEach((line) => ["1", "X", "2"].forEach((result) => { const key = line.replace(".", ""); const prefix = result === "1" ? "homeWin" : result === "2" ? "awayWin" : "draw"; const ms = `ms${result.toLowerCase()}`; const group = result === "1" ? "home" : result === "2" ? "away" : "combo"; addDef(`${ms}Under${key}`, `MS ${result} + ${line} Alt`, [`${ms}Under${key}`, `${prefix}Under${key}`], group); addDef(`${ms}Over${key}`, `MS ${result} + ${line} Üst`, [`${ms}Over${key}`, `${prefix}Over${key}`], group); }));
  ["1", "X", "2"].forEach((result) => { const prefix = result === "1" ? "homeWin" : result === "2" ? "awayWin" : "draw"; const ms = `ms${result.toLowerCase()}`; const group = result === "1" ? "home" : result === "2" ? "away" : "combo"; addDef(`${ms}KgVar`, `MS ${result} + KG Var`, [`${ms}KgVar`, `${prefix}Btts`], group); addDef(`${ms}KgYok`, `MS ${result} + KG Yok`, [`${ms}KgYok`, `${prefix}BttsNo`], group); });
  [["goals01", "0-1 Gol"], ["goals23", "2-3 Gol"], ["goals45", "4-5 Gol"], ["goals6plus", "6+ Gol"], ["halfTimeFullScore", "İlk Yarı / Maç Skoru"], ["firstHalfScore", "1. Yarı Skoru"]].forEach(([key, label]) => addDef(key, label, [key, `${key}_guess`], key.includes("Score") ? "score" : "goalRange"));
  ["1-0", "2-0", "2-1", "0-0", "1-1", "2-2", "0-1", "0-2", "1-2", "Diğer"].forEach((score) => { const key = score.replace("-", "").replace("Diğer", "Other"); addDef(`correctScore${key}`, `Doğru Skor ${score}`, [`correctScore${key}`, `score${key}`], "score"); });
  [["YesYes", "Evet/Evet"], ["YesNo", "Evet/Hayır"], ["NoYes", "Hayır/Evet"], ["NoNo", "Hayır/Hayır"]].forEach(([key, label]) => addDef(`firstSecondBtts${key}`, `1Y/2Y KG ${label}`, [`firstSecondBtts${key}`, `firstSecondBtts${key}_guess`], "half"));
  [["mostGoalsFirstHalf", "En Çok Gol 1. Yarı", "half"], ["mostGoalsSecondHalf", "En Çok Gol 2. Yarı", "half"], ["mostGoalsEqual", "En Çok Gol Eşit", "half"], ["totalOdd", "Tek", "parity"], ["totalEven", "Çift", "parity"], ["cornerOver85", "Korner 8.5 Üst", "corner"], ["cornerOver95", "Korner 9.5 Üst", "corner"], ["cardOver35", "Kart 3.5 Üst", "card"], ["cardOver45", "Kart 4.5 Üst", "card"], ["homeShots10", "Takım Şut Ev 10+", "shot"], ["awayShots10", "Takım Şut Dep 10+", "shot"], ["totalShots21", "Toplam Şut 21+", "shot"], ["totalShots25", "Toplam Şut 25+", "shot"]].forEach(([key, label, group]) => addDef(key, label, [key, `${key}_guess`], group));

  const addMarket = (list, seen, def, value) => { if (isEmpty(value)) return; const seenKey = `${def.key}|${value}`; if (seen.has(seenKey)) return; seen.add(seenKey); list.push({ key: def.key, label: def.label, value, group: def.group }); };
  const readFromSource = (source, keys) => { if (!source || typeof source !== "object" || Array.isArray(source)) return ""; for (const key of keys) { const value = source[key]; if (!isEmpty(value)) return value; } return ""; };
  const objectMarkets = (list, seen, source) => { if (!source || typeof source !== "object" || Array.isArray(source)) return; marketDefinitions.forEach((def) => addMarket(list, seen, def, readFromSource(source, def.keys))); };
  const blockMarkets = (list, seen, blocks) => { if (!Array.isArray(blocks)) return; blocks.forEach((block) => { const title = block?.title || block?.name || block?.market || block?.label || "Detay Market"; if (Array.isArray(block?.markets)) block.markets.forEach((item, index) => addMarket(list, seen, { key: `block_${index}_${title}`, label: item?.label || item?.name || title, group: "block" }, item?.odd ?? item?.value ?? item?.oran)); }); };
  const detailMarketsFor = (match) => { const list = []; const seen = new Set(); [match?.available_odds, match?.raw_market_guess_odds, match?.odds, match?.oranlar, match?.detay_oranlar, match?.detailOdds, match].forEach((source) => objectMarkets(list, seen, source)); blockMarkets(list, seen, match?.raw_market_blocks); return list; };

  const wideStore = () => window.__flWideSlipSelections || (window.__flWideSlipSelections = new Map());
  const renderWideSlip = () => { const panel = document.querySelector("#daily-matches-widget [data-slip-panel]"); if (!panel) return; const picks = [...wideStore().values()]; const odds = picks.map((p) => parseOdd(p.value)).filter(Boolean); const total = odds.length === picks.length && odds.length ? odds.reduce((a, b) => a * b, 1) : null; panel.innerHTML = `<div class="fl-slip-head"><div class="fl-slip-title">Kuponum</div><span class="fl-slip-count">${picks.length} seçim</span></div>` + (picks.length ? `<div class="fl-slip-list">${picks.map((p) => `<div class="fl-slip-item"><div class="fl-slip-match">${esc(p.home)} - ${esc(p.away)}</div><div class="fl-slip-market"><span>${esc(p.label)}</span><b>${esc(p.value)}</b><button class="fl-slip-remove" type="button" data-wide-remove="${esc(p.uid)}">Sil</button></div></div>`).join("")}</div><div class="fl-slip-summary"><div class="fl-slip-row"><span>Toplam Oran</span><b>${esc(fmt(total))}</b></div><div class="fl-slip-actions"><button class="fl-slip-analyze" type="button" data-wide-analyze>Analiz Et</button><button class="fl-slip-clear" type="button" data-wide-clear>Temizle</button></div><div class="fl-slip-footer">Detay marketleri Pro 12.2 geniş market mantığıyla analiz edilir.</div></div>` : `<div class="fl-slip-empty">Detay marketine tıklayınca seçim burada görünür.</div>`); };
  const analyzeWideSlip = () => { const picks = [...wideStore().values()]; const panel = document.querySelector("#daily-matches-widget [data-slip-panel]"); if (!picks.length || !panel) return; const scores = picks.map((p) => { const odd = parseOdd(p.value); const base = p.group === "score" || p.group === "hnd" ? Math.max(32, implied(odd) - 6) : p.group === "corner" || p.group === "card" || p.group === "shot" ? Math.max(40, implied(odd) + 3) : Math.max(42, implied(odd) + 4); return pct(base + ((base - implied(odd)) * 0.38)); }); const avg = pct(scores.reduce((a, b) => a + b, 0) / scores.length); renderWideSlip(); panel.insertAdjacentHTML("beforeend", `<div class="fl-analysis-box"><strong>Robot Analizi</strong><div class="fl-analysis-source">Kaynak: Pro 12.2 geniş market robotu</div><div class="fl-slip-row"><span>Ortalama Skor</span><b>%${avg}</b></div><p class="fl-analysis-note">${picks.length} detay market seçimi tarandı. HND, İY/MS, skor, korner, kart ve şut marketleri yüksek risk sınıfıyla değerlendirildi.</p>${picks.map((p, i) => `<div class="fl-analysis-pick"><b>${esc(p.home)} - ${esc(p.away)}</b><br>${esc(p.label)} ${esc(p.value)} · Skor %${scores[i]}</div>`).join("")}</div>`); };

  const repairDetailMarkets = (button) => { const widget = document.getElementById("daily-matches-widget"); if (!widget || !button || !widget.contains(button)) return; const uid = String(button.dataset.detailUid || ""); const match = (window.__dailyMatchesData || []).find((item) => String(item?._uid) === uid); const row = button.closest(".fl-match-row"); const extra = row?.nextElementSibling?.classList?.contains("fl-extra") ? row.nextElementSibling : null; if (!match || !extra) return; const markets = detailMarketsFor(match); extra.innerHTML = markets.length ? `<div class="fl-extra-grid">${markets.map((m) => `<button class="fl-extra-market" type="button" data-wide-select="1" data-wide-uid="${esc(match._uid)}" data-wide-key="${esc(m.key)}" data-wide-label="${esc(m.label)}" data-wide-value="${esc(m.value)}" data-wide-group="${esc(m.group)}"><span>${esc(m.label)}</span><b>${esc(m.value)}</b></button>`).join("")}</div>` : `<div class="fl-widget-empty">Bu maç için detay market verisi akışta yok.</div>`; };

  document.addEventListener("click", (event) => {
    const detailButton = event.target.closest?.("#daily-matches-widget [data-detail-uid]");
    if (detailButton) setTimeout(() => repairDetailMarkets(detailButton), 0);
    const wideButton = event.target.closest?.("#daily-matches-widget [data-wide-select]");
    if (wideButton) { event.preventDefault(); const match = (window.__dailyMatchesData || []).find((item) => String(item?._uid) === String(wideButton.dataset.wideUid)); if (!match) return; wideStore().set(String(match._uid), { uid: String(match._uid), key: wideButton.dataset.wideKey, label: wideButton.dataset.wideLabel, value: wideButton.dataset.wideValue, group: wideButton.dataset.wideGroup, home: match.home, away: match.away }); renderWideSlip(); }
    const remove = event.target.closest?.("#daily-matches-widget [data-wide-remove]");
    if (remove) { event.preventDefault(); wideStore().delete(String(remove.dataset.wideRemove)); renderWideSlip(); }
    if (event.target.closest?.("#daily-matches-widget [data-wide-clear]")) { event.preventDefault(); wideStore().clear(); renderWideSlip(); }
    if (event.target.closest?.("#daily-matches-widget [data-wide-analyze]")) { event.preventDefault(); analyzeWideSlip(); }
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