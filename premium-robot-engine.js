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
  const clamp = (value, min = 1, max = 99) => Math.max(min, Math.min(max, Math.round(Number(value) || 0)));

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
    ?? match?.available_odds?.[key]
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
    return value ? clamp(100 / value, 1, 98) : 0;
  };

  const grade = (score) => {
    if (score >= 70) return { label: "Çok Güçlü", cls: "ok" };
    if (score >= 62) return { label: "Güçlü", cls: "ok" };
    if (score >= 54) return { label: "Orta", cls: "wait" };
    if (score > 0) return { label: "Riskli", cls: "risk" };
    return { label: "Veri bekliyor", cls: "wait" };
  };

  const mapMarket = (market) => {
    const table = {
      "MS 1": ["ms1", "one", "odd1"], "MS X": ["msx", "draw", "oddX"], "MS 2": ["ms2", "two", "odd2"],
      "HND 1": ["hnd1", "handicap1", "handicapMs1"], "HND X": ["hndX", "handicapX", "handicapMsX"], "HND 2": ["hnd2", "handicap2", "handicapMs2"],
      "HND 0-1": ["hnd01", "handicap0_1"], "HND 1-0": ["hnd10", "handicap1_0"], "HND 2-0": ["hnd20", "handicap2_0"], "HND 0-2": ["hnd02", "handicap0_2"],
      "0.5 Alt": ["under05", "alt05", "under0_5"], "0.5 Ust": ["over05", "ust05", "over0_5"],
      "1.5 Alt": ["under15", "alt15", "under1_5"], "1.5 Ust": ["over15", "ust15", "over1_5"],
      "2.5 Alt": ["under25", "alt25", "under25_guess"], "2.5 Üst": ["over25", "ust25", "over25_guess"], "2.5 Ust": ["over25", "ust25", "over25_guess"],
      "3.5 Alt": ["under35", "alt35", "under3_5"], "3.5 Ust": ["over35", "ust35", "over3_5"],
      "4.5 Alt": ["under45", "alt45", "under4_5"], "4.5 Ust": ["over45", "ust45", "over4_5"],
      "KG Var": ["bttsYes", "kgVar", "bttsYes_guess"], "KG Yok": ["bttsNo", "kgYok", "bttsNo_guess"],
      "1Y KG Var": ["firstHalfBttsYes", "iyKgVar", "firstHalfBttsYes_guess"], "1Y KG Yok": ["firstHalfBttsNo", "iyKgYok", "firstHalfBttsNo_guess"],
      "2Y KG Var": ["secondHalfBttsYes", "ikinciYariKgVar", "secondHalfBttsYes_guess"], "2Y KG Yok": ["secondHalfBttsNo", "ikinciYariKgYok", "secondHalfBttsNo_guess"],
      "1Y/2Y KG Evet/Evet": ["firstSecondBttsYesYes", "firstSecondBttsYesYes_guess"], "1Y/2Y KG Evet/Hayir": ["firstSecondBttsYesNo", "firstSecondBttsYesNo_guess"], "1Y/2Y KG Hayir/Evet": ["firstSecondBttsNoYes", "firstSecondBttsNoYes_guess"], "1Y/2Y KG Hayir/Hayir": ["firstSecondBttsNoNo", "firstSecondBttsNoNo_guess"],
      "IY/MS 1/1": ["htFt11", "iyMs11", "htFt11_guess"], "IY/MS 1/X": ["htFt1X", "iyMs1X", "htFt1X_guess"], "IY/MS 1/2": ["htFt12", "iyMs12", "htFt12_guess"],
      "IY/MS X/1": ["htFtX1", "iyMsX1", "htFtX1_guess"], "IY/MS X/X": ["htFtXX", "iyMsXX", "htFtXX_guess"], "IY/MS X/2": ["htFtX2", "iyMsX2", "htFtX2_guess"],
      "IY/MS 2/1": ["htFt21", "iyMs21", "htFt21_guess"], "IY/MS 2/X": ["htFt2X", "iyMs2X", "htFt2X_guess"], "IY/MS 2/2": ["htFt22", "iyMs22", "htFt22_guess"],
      "MS 1 + 1.5 Alt": ["ms1Under15", "homeWinUnder15"], "MS X + 1.5 Alt": ["msxUnder15", "drawUnder15"], "MS 2 + 1.5 Alt": ["ms2Under15", "awayWinUnder15"],
      "MS 1 + 1.5 Ust": ["ms1Over15", "homeWinOver15"], "MS X + 1.5 Ust": ["msxOver15", "drawOver15"], "MS 2 + 1.5 Ust": ["ms2Over15", "awayWinOver15"],
      "MS 1 + 2.5 Alt": ["ms1Under25", "homeWinUnder25"], "MS X + 2.5 Alt": ["msxUnder25", "drawUnder25"], "MS 2 + 2.5 Alt": ["ms2Under25", "awayWinUnder25"],
      "MS 1 + 2.5 Ust": ["ms1Over25", "homeWinOver25"], "MS X + 2.5 Ust": ["msxOver25", "drawOver25"], "MS 2 + 2.5 Ust": ["ms2Over25", "awayWinOver25"],
      "MS 1 + 3.5 Alt": ["ms1Under35", "homeWinUnder35"], "MS X + 3.5 Alt": ["msxUnder35", "drawUnder35"], "MS 2 + 3.5 Alt": ["ms2Under35", "awayWinUnder35"],
      "MS 1 + 3.5 Ust": ["ms1Over35", "homeWinOver35"], "MS X + 3.5 Ust": ["msxOver35", "drawOver35"], "MS 2 + 3.5 Ust": ["ms2Over35", "awayWinOver35"],
      "MS 1 + 4.5 Alt": ["ms1Under45", "homeWinUnder45"], "MS X + 4.5 Alt": ["msxUnder45", "drawUnder45"], "MS 2 + 4.5 Alt": ["ms2Under45", "awayWinUnder45"],
      "MS 1 + 4.5 Ust": ["ms1Over45", "homeWinOver45"], "MS X + 4.5 Ust": ["msxOver45", "drawOver45"], "MS 2 + 4.5 Ust": ["ms2Over45", "awayWinOver45"],
      "MS 1 + KG Var": ["homeWinBtts", "ms1KgVar"], "MS X + KG Var": ["drawBtts", "msxKgVar"], "MS 2 + KG Var": ["awayWinBtts", "ms2KgVar"],
      "MS 1 + KG Yok": ["homeWinBttsNo", "ms1KgYok"], "MS X + KG Yok": ["drawBttsNo", "msxKgYok"], "MS 2 + KG Yok": ["awayWinBttsNo", "ms2KgYok"],
      "0-1 Gol": ["goals01", "goalRange01"], "2-3 Gol": ["goals23", "goalRange23"], "4-5 Gol": ["goals45", "goalRange45"], "6+ Gol": ["goals6plus", "goalRange6plus"],
      "Ilk Yari / Mac Skoru": ["halfTimeFullScore", "iyMacSkoru"], "1. Yari Skoru": ["firstHalfScore", "iySkoru"],
      "Dogru Skor 1-0": ["correctScore10", "score10"], "Dogru Skor 2-0": ["correctScore20", "score20"], "Dogru Skor 2-1": ["correctScore21", "score21"], "Dogru Skor 0-0": ["correctScore00", "score00"], "Dogru Skor 1-1": ["correctScore11", "score11"], "Dogru Skor 2-2": ["correctScore22", "score22"], "Dogru Skor 0-1": ["correctScore01", "score01"], "Dogru Skor 0-2": ["correctScore02", "score02"], "Dogru Skor 1-2": ["correctScore12", "score12"], "Dogru Skor Diger": ["correctScoreOther", "scoreOther"],
      "En Cok Gol 1. Yari": ["mostGoalsFirstHalf", "firstHalfMostGoals"], "En Cok Gol 2. Yari": ["mostGoalsSecondHalf", "secondHalfMostGoals"], "En Cok Gol Esit": ["mostGoalsEqual", "equalHalfGoals"],
      "Toplam Tek": ["totalOdd", "tek"], "Toplam Cift": ["totalEven", "cift"],
      "Korner 8.5 Ust": ["cornerOver85", "cornersOver85"], "Korner 9.5 Ust": ["cornerOver95", "cornersOver95"],
      "Kart 3.5 Ust": ["cardOver35", "cardsOver35"], "Kart 4.5 Ust": ["cardOver45", "cardsOver45"],
      "Takim Sut Ev 10+": ["homeShots10", "homeTeamShots10"], "Takim Sut Dep 10+": ["awayShots10", "awayTeamShots10"], "Toplam Sut 21+": ["totalShots21", "shots21Plus"], "Toplam Sut 25+": ["totalShots25", "shots25Plus"]
    };
    return table[market] || [];
  };

  const todayFixtures = (fixtures) => fixtures
    .filter((m) => m.date === todayKey())
    .sort((a, b) => String(a.time || "99:99").localeCompare(String(b.time || "99:99")));

  const teamArchive = (archive, team) => archive?.team_index?.[team] || null;

  const resultValue = (text) => {
    const value = String(text || "").toUpperCase();
    if (value.includes("W") || value.includes("G")) return 3;
    if (value.includes("D") || value.includes("B")) return 1;
    if (value.includes("L") || value.includes("M")) return 0;
    return 1;
  };

  const teamFormScore = (item) => {
    if (!item) return 50;
    const finished = Math.max(1, Number(item.finished || 0));
    const wins = Number(item.wins || 0);
    const draws = Number(item.draws || 0);
    const base = ((wins * 3 + draws) / (finished * 3)) * 100;
    const recent = Array.isArray(item.recent) ? item.recent.slice(0, 5) : [];
    const recentScore = recent.length ? (recent.reduce((sum, r) => sum + resultValue(r.result), 0) / (recent.length * 3)) * 100 : base;
    return clamp((base * 0.55) + (recentScore * 0.45), 30, 78);
  };

  const formText = (item) => {
    if (!item) return "Arşiv verisi bekleniyor";
    const recent = Array.isArray(item.recent) ? item.recent.map((r) => r.result).join("-") : "-";
    return `${item.finished || 0} maç | G:${item.wins || 0} B:${item.draws || 0} M:${item.losses || 0} | Form:${recent || "-"}`;
  };

  const marketPenalty = (market) => {
    if (/dogru skor|skoru|hnd/i.test(market)) return 15;
    if (/iy\/ms/i.test(market)) return 13;
    if (/1y\/2y kg/i.test(market)) return 8;
    if (/korner|kart|sut|şut/i.test(market)) return 7;
    if (/kg|gol|tek|cift|çift/i.test(market)) return 4;
    return 2;
  };

  const oddPenalty = (odd) => {
    const n = parseOdd(odd);
    if (!n) return 4;
    if (n >= 5) return 16;
    if (n >= 3.5) return 11;
    if (n >= 2.6) return 7;
    if (n >= 2.1) return 4;
    return 1;
  };

  const qualityScore = ({ market, odd, oddsPercent, homeScore, awayScore }) => {
    const archiveScore = (homeScore + awayScore) / 2;
    const oddsScore = oddsPercent || 48;
    const balanceBonus = Math.abs(homeScore - awayScore) <= 12 ? 3 : 0;
    const raw = (oddsScore * 0.48) + (archiveScore * 0.42) + 10 + balanceBonus - marketPenalty(market) - oddPenalty(odd);
    return clamp(raw, 1, 95);
  };

  const makeAnalysis = (match, market, archive) => {
    const keys = mapMarket(market);
    const odd = market === "1Y KG % + 2Y KG %" ? "" : pick(match, keys);
    const p1 = implied(pick(match, ["firstHalfBttsYes", "iyKgVar", "firstHalfBttsYes_guess"]));
    const p2 = implied(pick(match, ["secondHalfBttsYes", "ikinciYariKgVar", "secondHalfBttsYes_guess"]));
    const oddsPercent = market === "1Y KG %" ? p1
      : market === "2Y KG %" ? p2
      : market === "1Y KG % + 2Y KG %" ? Math.round(((p1 || 50) + (p2 || 50)) / 2)
      : implied(odd);
    const home = teamArchive(archive, match.home);
    const away = teamArchive(archive, match.away);
    const homeScore = teamFormScore(home);
    const awayScore = teamFormScore(away);
    const score = qualityScore({ market, odd, oddsPercent, homeScore, awayScore });
    const g = grade(score);
    const notes = [];
    notes.push("Robot seçilen marketi oran, arşiv, takım formu ve market risk sınıfı ile birlikte değerlendirdi.");
    if (/dogru skor|skoru/i.test(market)) notes.push("Skor marketleri yüksek risklidir; robot bunları kupon ana omurgası değil özel değer araması olarak okur.");
    if (/hnd/i.test(market)) notes.push("Handikap marketinde maç dengesi ve güç farkı birlikte kontrol edilir.");
    if (/iy\/ms/i.test(market)) notes.push("İY/MS marketi ilk yarı ve maç sonu yön değişimini birlikte değerlendirir.");
    if (/1y\/2y kg/i.test(market)) notes.push("1.Yarı / 2.Yarı KG kombinasyonu iki zaman dilimindeki gol davranışını birlikte kontrol eder.");
    if (parseOdd(odd) >= 3.5) notes.push("Yüksek oran tespit edildi: potansiyel değer var ama kupon riski yükselir.");
    notes.push(`Takım form puanları: ev ${homeScore}, deplasman ${awayScore}.`);
    notes.push(`Robot kalite skoru: %${score}. Seviye: ${g.label}.`);
    return { created_at: new Date().toISOString(), match, market, odd, odds_percent: oddsPercent, percent: score, grade: g.label, home_score: homeScore, away_score: awayScore, home_form: formText(home), away_form: formText(away), notes, source: "premium_robot_engine_video_markets_v3" };
  };

  const riskDistribution = (analyses) => analyses.reduce((acc, item) => {
    if (item.grade === "Çok Güçlü" || item.grade === "Güçlü") acc.strong += 1;
    else if (item.grade === "Orta") acc.medium += 1;
    else if (item.grade === "Riskli") acc.risky += 1;
    else acc.wait += 1;
    return acc;
  }, { strong: 0, medium: 0, risky: 0, wait: 0 });

  const couponRisk = (avg, d) => {
    if (d.risky >= 2 || avg < 54) return "Yüksek Risk";
    if (d.risky || d.medium >= 2 || avg < 62) return "Orta Risk";
    return "Dengeli Kupon";
  };

  const couponAdvice = (coupon) => {
    const risky = coupon.analyses.filter((x) => x.grade === "Riskli").sort((a, b) => (a.percent || 0) - (b.percent || 0));
    const best = [...coupon.analyses].sort((a, b) => (b.percent || 0) - (a.percent || 0))[0];
    const out = [];
    if (best) out.push(`En güçlü maç: ${best.match.home} - ${best.match.away} (%${best.percent || 0}).`);
    if (risky[0]) out.push(`Kuponu bozabilecek maç: ${risky[0].match.home} - ${risky[0].match.away}.`);
    if (!risky.length) out.push("Kuponda açık riskli maç yok; yine de oran değişimi takip edilmeli.");
    return out;
  };

  const buildCoupon = (analyses, market) => {
    const percents = analyses.map((x) => Number(x.percent || 0)).filter(Boolean);
    const avg = percents.length ? Math.round(percents.reduce((a, b) => a + b, 0) / percents.length) : 0;
    const odds = analyses.map((x) => parseOdd(x.odd)).filter(Boolean);
    const totalOdd = odds.length === analyses.length ? odds.reduce((a, b) => a * b, 1).toFixed(2) : "Veri yok";
    const g = grade(avg);
    const distribution = riskDistribution(analyses);
    const riskLevel = couponRisk(avg || 0, distribution);
    const advice = couponAdvice({ analyses, percent: avg, risk_level: riskLevel });
    return {
      created_at: new Date().toISOString(), coupon: true, match: { home: "Kupon", away: `${analyses.length} maç` }, market,
      analyses, odd: totalOdd, percent: avg, grade: g.label, risk_level: riskLevel, risk_distribution: distribution,
      notes: [`${analyses.length} maç aynı market üzerinden kupon analizi olarak oluşturuldu.`, `Ortalama robot kalite skoru: ${avg ? `%${avg}` : "veri bekliyor"}.`, `Toplam oran: ${totalOdd}.`, `Risk seviyesi: ${riskLevel}.`, ...advice],
      source: "premium_coupon_engine_video_markets_v3"
    };
  };

  const saveQueue = (analysis) => {
    const old = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
    const next = [analysis, ...old].slice(0, 20);
    localStorage.setItem(RESULT_KEY, JSON.stringify(analysis));
    localStorage.setItem(QUEUE_KEY, JSON.stringify(next));
  };

  const couponText = (coupon) => {
    if (!coupon?.coupon) return "";
    const rows = coupon.analyses.map((a, i) => `${i + 1}) ${a.match.home} - ${a.match.away} | ${a.market} | ${a.grade} | ${a.percent ? `%${a.percent}` : "Veri"} | Oran: ${a.odd || "Yok"}`);
    return [`Futbol Laboratuvarı Kupon Analizi`, `Market: ${coupon.market}`, `Maç Sayısı: ${coupon.analyses.length}`, `Toplam Oran: ${coupon.odd}`, `Ortalama Kalite: ${coupon.percent ? `%${coupon.percent}` : "Veri bekliyor"}`, `Risk: ${coupon.risk_level}`, ...rows].join("\n");
  };

  const renderSingleOutput = (analysis) => `<h3>Robot Analizi</h3><div class="premium-result"><h4>${esc(analysis.grade)} sinyal</h4><div class="premium-row"><span>Maç</span><strong>${esc(analysis.match.home)} - ${esc(analysis.match.away)}</strong></div><div class="premium-row"><span>Market</span><strong>${esc(analysis.market)}</strong></div><div class="premium-row"><span>Oran</span><strong>${esc(analysis.odd || "Veri yok")}</strong></div><div class="premium-row"><span>Kalite Skoru</span><strong>${analysis.percent ? `%${analysis.percent}` : "Veri bekliyor"}</strong></div><div class="premium-row"><span>Form</span><strong>Ev:${analysis.home_score} / Dep:${analysis.away_score}</strong></div><div class="premium-factor-list"><span class="premium-factor">📊 Ev sahibi: ${esc(analysis.home_form)}</span><span class="premium-factor">📈 Deplasman: ${esc(analysis.away_form)}</span>${analysis.notes.map((note) => `<span class="premium-factor">🧠 ${esc(note)}</span>`).join("")}</div></div>`;

  const renderCouponOutput = (coupon) => {
    const d = coupon.risk_distribution || { strong: 0, medium: 0, risky: 0, wait: 0 };
    return `<h3>Kupon Analizi</h3><div class="premium-result"><h4>${coupon.analyses.length} maçlık kupon</h4><div class="premium-row"><span>Market</span><strong>${esc(coupon.market)}</strong></div><div class="premium-row"><span>Toplam Oran</span><strong>${esc(coupon.odd)}</strong></div><div class="premium-row"><span>Ortalama Kalite</span><strong>${coupon.percent ? `%${coupon.percent}` : "Veri bekliyor"}</strong></div><div class="premium-row"><span>Risk</span><strong>${esc(coupon.risk_level || "-")}</strong></div><div class="premium-row"><span>Risk Dağılımı</span><strong>G:${d.strong} O:${d.medium} R:${d.risky} V:${d.wait}</strong></div><button class="premium-action" type="button" data-copy-coupon>Kuponu Kopyala</button><div class="premium-factor-list">${coupon.analyses.map((a, i) => `<span class="premium-factor">${i + 1}. ${esc(a.match.home)} - ${esc(a.match.away)} · ${esc(a.grade)} · ${a.percent ? `%${a.percent}` : "Veri"} · Oran: ${esc(a.odd || "Yok")}</span>`).join("")}${coupon.notes.map((note) => `<span class="premium-factor">🧠 ${esc(note)}</span>`).join("")}</div></div>`;
  };

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

  document.addEventListener("click", async (event) => {
    const copyButton = event.target.closest?.("#premium-analysis-panel [data-copy-coupon]");
    if (copyButton) {
      const coupon = JSON.parse(localStorage.getItem(RESULT_KEY) || "{}");
      const text = couponText(coupon);
      if (text && navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      copyButton.textContent = "Kupon Kopyalandı";
      return;
    }
    const button = event.target.closest?.("#premium-analysis-panel [data-premium-analyze]");
    if (!button) return;
    setTimeout(runRobot, 60);
  });
})();