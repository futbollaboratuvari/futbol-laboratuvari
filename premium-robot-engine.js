(() => {
  const FIXTURES_URL = "./data/fixtures.json";
  const ARCHIVE_URL = "./data/robot_match_archive.json";
  const RESULT_KEY = "fl_last_premium_robot_analysis";
  const QUEUE_KEY = "fl_premium_robot_queue";

  const clean = (value) => String(value ?? "").trim();
  const esc = (value) => clean(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const empty = (value) => {
    const text = clean(value);
    return !text || text === "-" || text === "—" || text.toLowerCase() === "null";
  };

  const todayKey = () => new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

  const readJson = async (url, fallback) => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      return res.ok ? await res.json() : fallback;
    } catch {
      return fallback;
    }
  };

  const get = (match, key) => match?.[key]
    ?? match?.odds?.[key]
    ?? match?.oranlar?.[key]
    ?? match?.detay_oranlar?.[key]
    ?? match?.detailOdds?.[key]
    ?? match?.raw_market_guess_odds?.[key]
    ?? match?.analysis?.[key]
    ?? match?.stats?.[key];

  const pick = (match, keys) => {
    for (const key of keys) {
      const value = get(match, key);
      if (!empty(value)) return value;
    }
    return "";
  };

  const parseOdd = (value) => {
    const num = Number(String(value ?? "").replace(",", "."));
    return Number.isFinite(num) && num > 1 ? num : 0;
  };

  const implied = (odd) => {
    const value = parseOdd(odd);
    return value ? Math.max(1, Math.min(98, Math.round(100 / value))) : 0;
  };

  const grade = (percent) => {
    if (percent >= 64) return { label: "Güçlü", cls: "ok" };
    if (percent >= 55) return { label: "Orta", cls: "wait" };
    if (percent > 0) return { label: "Riskli", cls: "risk" };
    return { label: "Veri bekliyor", cls: "wait" };
  };

  const mapMarket = (market) => {
    const table = {
      "MS 1": ["ms1", "one", "odd1"],
      "MS X": ["msx", "draw", "oddX"],
      "MS 2": ["ms2", "two", "odd2"],
      "2.5 Alt": ["under25", "alt25", "under25_guess"],
      "2.5 Üst": ["over25", "ust25", "over25_guess"],
      "KG Var": ["bttsYes", "kgVar", "bttsYes_guess"],
      "KG Yok": ["bttsNo", "kgYok", "bttsNo_guess"],
      "1Y KG Var": ["firstHalfBttsYes", "iyKgVar", "firstHalfBttsYes_guess"],
      "1Y KG Yok": ["firstHalfBttsNo", "iyKgYok", "firstHalfBttsNo_guess"],
      "2Y KG Var": ["secondHalfBttsYes", "ikinciYariKgVar", "secondHalfBttsYes_guess"],
      "2Y KG Yok": ["secondHalfBttsNo", "ikinciYariKgYok", "secondHalfBttsNo_guess"],
      "1Y/2Y KG Evet/Evet": ["firstSecondBttsYesYes", "firstSecondBttsYesYes_guess"],
      "1Y/2Y KG Hayır/Hayır": ["firstSecondBttsNoNo", "firstSecondBttsNoNo_guess"],
      "1Y/2Y KG Evet/Hayır": ["firstSecondBttsYesNo", "firstSecondBttsYesNo_guess"],
      "1Y/2Y KG Hayır/Evet": ["firstSecondBttsNoYes", "firstSecondBttsNoYes_guess"],
      "1Y KG %": ["firstHalfBttsYes", "iyKgVar", "firstHalfBttsYes_guess"],
      "2Y KG %": ["secondHalfBttsYes", "ikinciYariKgVar", "secondHalfBttsYes_guess"],
      "1Y KG % + 2Y KG %": ["firstHalfBttsYes", "firstHalfBttsYes_guess", "secondHalfBttsYes", "secondHalfBttsYes_guess"],
      "İY 1": ["firstHalf1", "iy1", "firstHalf1_guess"],
      "İY X": ["firstHalfX", "iyX", "firstHalfX_guess"],
      "İY 2": ["firstHalf2", "iy2", "firstHalf2_guess"],
      "2Y 1": ["secondHalf1", "ikinciYari1", "secondHalf1_guess"],
      "2Y X": ["secondHalfX", "ikinciYariX", "secondHalfX_guess"],
      "2Y 2": ["secondHalf2", "ikinciYari2", "secondHalf2_guess"],
      "İY/MS 1’den 1": ["htFt11", "iyMs11", "htFt11_guess"],
      "İY/MS 1’den X": ["htFt1X", "iyMs1x", "htFt1X_guess"],
      "İY/MS 1’den 2": ["htFt12", "iyMs12", "htFt12_guess"],
      "İY/MS X’ten 1": ["htFtX1", "iyMsX1", "htFtX1_guess"],
      "İY/MS X’ten X": ["htFtXX", "iyMsXx", "htFtXX_guess"],
      "İY/MS X’ten 2": ["htFtX2", "iyMsX2", "htFtX2_guess"],
      "İY/MS 2’den 1": ["htFt21", "iyMs21", "htFt21_guess"],
      "İY/MS 2’den X": ["htFt2X", "iyMs2x", "htFt2X_guess"],
      "İY/MS 2’den 2": ["htFt22", "iyMs22", "htFt22_guess"]
    };
    return table[market] || [];
  };

  const todayFixtures = (fixtures) => fixtures
    .filter((m) => m.date === todayKey())
    .sort((a, b) => String(a.time || "99:99").localeCompare(String(b.time || "99:99")));

  const teamArchive = (archive, team) => archive?.team_index?.[team] || null;

  const formText = (item) => {
    if (!item) return "Arşiv verisi bekleniyor";
    const recent = Array.isArray(item.recent) ? item.recent.map((r) => r.result).join("-") : "-";
    return `${item.finished || 0} maç | G:${item.wins || 0} B:${item.draws || 0} M:${item.losses || 0} | Form:${recent || "-"}`;
  };

  const makeAnalysis = (match, market, archive) => {
    const keys = mapMarket(market);
    const odd = market === "1Y KG % + 2Y KG %" ? "" : pick(match, keys);
    const p1 = implied(pick(match, ["firstHalfBttsYes", "iyKgVar", "firstHalfBttsYes_guess"]));
    const p2 = implied(pick(match, ["secondHalfBttsYes", "ikinciYariKgVar", "secondHalfBttsYes_guess"]));
    const percent = market === "1Y KG %" ? p1
      : market === "2Y KG %" ? p2
      : market === "1Y KG % + 2Y KG %" ? Math.round(((p1 || 50) + (p2 || 50)) / 2)
      : implied(odd);
    const g = grade(percent);
    const home = teamArchive(archive, match.home);
    const away = teamArchive(archive, match.away);
    const isIyms = market.startsWith("İY/MS");
    const isCombo = market.startsWith("1Y/2Y KG");
    const isPercent = market.includes("KG %");
    const notes = [];
    notes.push(isIyms ? "İY/MS marketi yüksek riskli özel analiz grubudur; robot ilk yarı ve maç sonu yön değişimini birlikte değerlendirir." : "Robot seçilen marketi maç oranları ve arşiv verisiyle eşleştirdi.");
    if (isCombo) notes.push("1.Yarı / 2.Yarı KG kombinasyonu iki ayrı zaman diliminde gol var-yok davranışını birlikte kontrol eder.");
    if (isPercent) notes.push("KG yüzde analizi oranlardan gelen olasılığı yüzdesel gösterir; tek başına garanti değil, risk sinyalidir.");
    if (percent) notes.push(`Robot olasılık sinyali yaklaşık %${percent}. Seviye: ${g.label}.`);
    else notes.push("Bu market için net oran bulunamadı; robot arşiv ve maç bilgisiyle ön değerlendirme oluşturdu.");
    return { created_at: new Date().toISOString(), match, market, odd, percent, grade: g.label, home_form: formText(home), away_form: formText(away), notes, source: "premium_robot_engine" };
  };

  const buildCoupon = (analyses, market) => {
    const percents = analyses.map((x) => Number(x.percent || 0)).filter(Boolean);
    const avg = percents.length ? Math.round(percents.reduce((a, b) => a + b, 0) / percents.length) : 0;
    const odds = analyses.map((x) => parseOdd(x.odd)).filter(Boolean);
    const totalOdd = odds.length === analyses.length ? odds.reduce((a, b) => a * b, 1).toFixed(2) : "Veri yok";
    const g = grade(avg);
    return {
      created_at: new Date().toISOString(),
      coupon: true,
      match: { home: "Kupon", away: `${analyses.length} maç` },
      market,
      analyses,
      odd: totalOdd,
      percent: avg,
      grade: g.label,
      notes: [`${analyses.length} maç aynı market üzerinden kupon analizi olarak oluşturuldu.`, `Ortalama robot sinyali: ${avg ? `%${avg}` : "veri bekliyor"}.`, `Toplam oran: ${totalOdd}.`],
      source: "premium_coupon_engine"
    };
  };

  const saveQueue = (analysis) => {
    const old = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    const next = [analysis, ...old].slice(0, 20);
    localStorage.setItem(RESULT_KEY, JSON.stringify(analysis));
    localStorage.setItem(QUEUE_KEY, JSON.stringify(next));
  };

  const renderSingleOutput = (analysis) => `<h3>Robot Analizi</h3><div class="premium-result"><h4>${esc(analysis.grade)} sinyal</h4><div class="premium-row"><span>Maç</span><strong>${esc(analysis.match.home)} - ${esc(analysis.match.away)}</strong></div><div class="premium-row"><span>Market</span><strong>${esc(analysis.market)}</strong></div><div class="premium-row"><span>Oran</span><strong>${esc(analysis.odd || "Veri yok")}</strong></div><div class="premium-row"><span>Olasılık</span><strong>${analysis.percent ? `%${analysis.percent}` : "Veri bekliyor"}</strong></div><div class="premium-factor-list"><span class="premium-factor">📊 Ev sahibi: ${esc(analysis.home_form)}</span><span class="premium-factor">📈 Deplasman: ${esc(analysis.away_form)}</span>${analysis.notes.map((note) => `<span class="premium-factor">🧠 ${esc(note)}</span>`).join("")}</div></div>`;

  const renderCouponOutput = (coupon) => `<h3>Kupon Analizi</h3><div class="premium-result"><h4>${coupon.analyses.length} maçlık kupon</h4><div class="premium-row"><span>Market</span><strong>${esc(coupon.market)}</strong></div><div class="premium-row"><span>Toplam Oran</span><strong>${esc(coupon.odd)}</strong></div><div class="premium-row"><span>Ortalama Sinyal</span><strong>${coupon.percent ? `%${coupon.percent}` : "Veri bekliyor"}</strong></div><div class="premium-factor-list">${coupon.analyses.map((a, i) => `<span class="premium-factor">${i + 1}. ${esc(a.match.home)} - ${esc(a.match.away)} · ${esc(a.grade)} · ${a.percent ? `%${a.percent}` : "Veri"} · Oran: ${esc(a.odd || "Yok")}</span>`).join("")}${coupon.notes.map((note) => `<span class="premium-factor">🧠 ${esc(note)}</span>`).join("")}</div></div>`;

  const renderRobotOutput = (analysis) => {
    const output = document.querySelector("#premium-analysis-panel [data-premium-output]");
    if (!output) return;
    output.innerHTML = analysis.coupon ? renderCouponOutput(analysis) : renderSingleOutput(analysis);
  };

  const selectedIndexes = (select) => Array.from(select?.selectedOptions || [])
    .map((opt) => Number(opt.value))
    .filter((n) => Number.isInteger(n) && n >= 0);

  const runRobot = async () => {
    const select = document.querySelector("#premium-analysis-panel .premium-select[data-premium-match]");
    const marketButton = document.querySelector("#premium-analysis-panel [data-market].active");
    const market = marketButton?.dataset?.market || "";
    const indexes = selectedIndexes(select);
    if (!select || !market || !indexes.length) return false;
    const [fixtures, archive] = await Promise.all([readJson(FIXTURES_URL, []), readJson(ARCHIVE_URL, { matches: [], team_index: {} })]);
    const list = todayFixtures(Array.isArray(fixtures) ? fixtures : []);
    const matches = indexes.map((i) => list[i]).filter(Boolean).slice(0, 10);
    if (!matches.length) return false;
    const analyses = matches.map((match) => makeAnalysis(match, market, archive || {}));
    const result = analyses.length > 1 ? buildCoupon(analyses, market) : analyses[0];
    saveQueue(result);
    renderRobotOutput(result);
    return true;
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("#premium-analysis-panel [data-premium-analyze]");
    if (!button) return;
    setTimeout(runRobot, 60);
  });
})();
