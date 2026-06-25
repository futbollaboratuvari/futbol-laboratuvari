(() => {
  const PANEL_ID = "premium-analysis-panel";
  const FIXTURES_URL = "./data/fixtures.json";
  const LIVE_URL = "./data/live-matches.json";
  const ROBOT_URL = "./data/robot-analysis.json";
  const VERIFY_CODE_URL = window.FL_VERIFY_CODE_URL || "https://futbol-laboratuvari.vercel.app/api/verify-code";
  const ACCESS_KEY = "fl_premium_beta_access";
  const CODE_KEY = "fl_premium_code_entered";
  const MEMBER_KEY = "fl_premium_membership";
  const CLIENT_KEY = "fl_premium_client_id";
  const TRIAL_KEY = "fl_premium_trial";

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

  const getClientId = () => {
    let id = localStorage.getItem(CLIENT_KEY);
    if (!id) {
      id = (crypto?.randomUUID?.() || `client-${Date.now()}-${Math.random().toString(16).slice(2)}`);
      localStorage.setItem(CLIENT_KEY, id);
    }
    return id;
  };

  const readMembership = () => {
    try { return JSON.parse(localStorage.getItem(MEMBER_KEY) || "{}"); } catch { return {}; }
  };

  const writeMembership = (membership) => {
    localStorage.setItem(MEMBER_KEY, JSON.stringify(membership || {}));
  };

  const readTrial = () => {
    try { return JSON.parse(localStorage.getItem(TRIAL_KEY) || "{}"); } catch { return {}; }
  };

  const hasNoRights = () => {
    const remaining = Number(readMembership().remainingAnalysisCount);
    return Number.isFinite(remaining) && remaining <= 0;
  };

  const isTrialActive = () => Number(readTrial().expiresAt || 0) > Date.now();

  const clearTrialAccess = () => {
    if (localStorage.getItem("fl_premium_access_note") !== "trial") return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(MEMBER_KEY);
    localStorage.removeItem("fl_premium_access_note");
    localStorage.removeItem("fl_premium_access_level");
  };

  const isActive = () => {
    if (localStorage.getItem(ACCESS_KEY) !== "1") return false;
    if (localStorage.getItem("fl_premium_access_note") === "trial" && !isTrialActive()) {
      clearTrialAccess();
      return false;
    }
    return !hasNoRights();
  };

  const accessBadgeText = () => {
    if (!isActive()) return "🔒 Üyelik kilitli";
    if (localStorage.getItem("fl_premium_access_note") === "trial") return "✅ Deneme aktif";
    return "✅ Üyelik aktif";
  };

  const trialMessage = () => {
    if (localStorage.getItem("fl_premium_access_note") !== "trial") return "Üyelik backend tarafından doğrulandı.";
    const trial = readTrial();
    const member = readMembership();
    const end = Number(trial.expiresAt || 0);
    if (!end || end <= Date.now()) return "1 günlük deneme süresi doldu. Kod veya üyelik gerekir.";
    const text = new Date(end).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
    return `1 Günlük Deneme Aktif · Bitiş: ${text} · Kalan analiz hakkı: ${member.remainingAnalysisCount ?? "Aktif"}`;
  };

  const consumeAnalysisRight = () => {
    const member = readMembership();
    const remaining = Number(member.remainingAnalysisCount);
    if (!Number.isFinite(remaining)) return { ok: true, remaining: member.remainingAnalysisCount ?? "Aktif" };
    if (remaining <= 0) return { ok: false, remaining: 0, message: "Analiz hakkın bitti. Devam etmek için üyelik kodu veya yeni paket gerekir." };
    const nextRemaining = Math.max(0, remaining - 1);
    writeMembership({ ...member, remainingAnalysisCount: nextRemaining });
    return { ok: true, remaining: nextRemaining };
  };

  const readJson = async (url, fallback) => {
    try {
      const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}ts=${Date.now()}`, { cache: "no-store" });
      return res.ok ? await res.json() : fallback;
    } catch { return fallback; }
  };

  const readData = async () => {
    const [fixtures, live, robot] = await Promise.all([
      readJson(FIXTURES_URL, []),
      readJson(LIVE_URL, { matches: [], counts: {} }),
      readJson(ROBOT_URL, { matches: [], summary: {} })
    ]);
    return { fixtures: Array.isArray(fixtures) ? fixtures : [], live, robot };
  };

  const todayKey = () => new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

  const matchTitle = (match) => String(match.match_name || match.match || `${match.home || match.home_team_name || ""} ${match.away || match.away_team_name || ""}`).replace(/\bVS\b/gi, " ").trim();
  const pairKey = (match) => cleanKey(`${match.home || match.home_team_name || ""} ${match.away || match.away_team_name || ""}`);
  const reversePairKey = (match) => cleanKey(`${match.away || match.away_team_name || ""} ${match.home || match.home_team_name || ""}`);

  const robotMap = (robot) => {
    const map = new Map();
    for (const item of robot.matches || []) {
      const key = cleanKey(matchTitle(item));
      if (key) map.set(key, item);
    }
    return map;
  };

  const findRobot = (match, map) => map.get(pairKey(match)) || map.get(reversePairKey(match)) || null;

  const pick = (obj, keys) => {
    for (const key of keys) {
      const value = obj?.[key] ?? obj?.available_odds?.[key] ?? obj?.raw_market_guess_odds?.[key] ?? obj?.odds?.[key] ?? obj?.oranlar?.[key];
      if (value !== undefined && value !== null && value !== "" && value !== "-") return value;
    }
    return "";
  };

  const oddsForMarket = (match, market) => {
    const text = String(market || "").toLocaleLowerCase("tr-TR");
    if (/ms 1|maç sonucu 1|mac sonucu 1/.test(text)) return pick(match, ["ms1", "one", "oneOdd", "odd1"]);
    if (/ms x|maç sonucu x|mac sonucu x/.test(text)) return pick(match, ["msx", "draw", "drawOdd", "oddX"]);
    if (/ms 2|maç sonucu 2|mac sonucu 2/.test(text)) return pick(match, ["ms2", "two", "twoOdd", "odd2"]);
    if (/2\.5.*üst|2\.5.*ust/.test(text)) return pick(match, ["over25", "ust25", "over", "ust"]);
    if (/2\.5.*alt/.test(text)) return pick(match, ["under25", "alt25", "under", "alt"]);
    if (/3\.5.*üst|3\.5.*ust/.test(text)) return pick(match, ["over35", "ust35"]);
    if (/kg var/.test(text)) return pick(match, ["bttsYes", "kgVar", "kg_var", "varOdd", "var"]);
    if (/kg yok/.test(text)) return pick(match, ["bttsNo", "kgYok", "kg_yok", "yokOdd", "yok"]);
    if (/1y kg|ilk yarı kg|ilk yari kg/.test(text)) return pick(match, ["firstHalfBttsYes", "iyKgVar", "iy_kg_var"]);
    if (/2y kg|ikinci yarı kg|ikinci yari kg/.test(text)) return pick(match, ["secondHalfBttsYes", "ikinciYariKgVar", "ikinci_yari_kg_var"]);
    return "";
  };

  const normalizeMatch = (match, robotItem = null) => ({
    date: match.date || match.tarih || "",
    time: match.time || match.saat || match.start_time || "",
    league: match.league || match.competition_name || match.lig || robotItem?.league || "Lig",
    home: match.home || match.home_team_name || match.ev_sahibi || matchTitle(match).split(/\s+VS\s+/i)[0] || "Ev sahibi",
    away: match.away || match.away_team_name || match.deplasman || matchTitle(match).split(/\s+VS\s+/i)[1] || "Deplasman",
    status: match.status || match.liveStatus || "scheduled",
    score: match.score || "",
    matchCode: match.matchCode || match.mac_kodu || null,
    available_odds: {
      ms1: pick(match, ["ms1", "one", "oneOdd", "odd1"]) || pick(robotItem, ["ms1"]),
      msx: pick(match, ["msx", "draw", "drawOdd", "oddX"]) || pick(robotItem, ["msx"]),
      ms2: pick(match, ["ms2", "two", "twoOdd", "odd2"]) || pick(robotItem, ["ms2"]),
      over25: pick(match, ["over25", "ust25", "over", "ust"]) || pick(robotItem, ["over25"]),
      under25: pick(match, ["under25", "alt25", "under", "alt"]) || pick(robotItem, ["under25"]),
      bttsYes: pick(match, ["bttsYes", "kgVar", "kg_var", "varOdd", "var"]) || pick(robotItem, ["bttsYes"]),
      firstHalfBttsYes: pick(match, ["firstHalfBttsYes", "iyKgVar", "iy_kg_var"]) || pick(robotItem, ["firstHalfBttsYes"]),
      secondHalfBttsYes: pick(match, ["secondHalfBttsYes", "ikinciYariKgVar", "ikinci_yari_kg_var"]) || pick(robotItem, ["secondHalfBttsYes"])
    },
    robot: robotItem || null,
    recommended_market: robotItem?.recommended_market || robotItem?.market || robotItem?.selection || match.suggested_option || "",
    estimated_odds: robotItem?.estimated_odds || robotItem?.odds || match.suggested_odds || "",
    confidence_score: robotItem?.confidence_score || match.confidence || "",
    analysis_score: robotItem?.analysis_score ?? match.analysis_score ?? null,
    risk_level: robotItem?.risk_level || match.risk_level || "",
    decision: match.decision || robotItem?.decision || "",
    robot_reason: robotItem?.robot_comment || robotItem?.robot_reason || match.robot_reason || "",
    expected_scores: robotItem?.expected_scores || match.expected_scores || []
  });

  const todayMatches = (data) => {
    const today = todayKey();
    const liveMatches = Array.isArray(data.live?.matches) ? data.live.matches : [];
    const source = liveMatches.length ? liveMatches : data.fixtures;
    const map = robotMap(data.robot || {});
    return source
      .filter((m) => String(m.date || m.tarih || "").slice(0, 10) === today)
      .map((m) => normalizeMatch(m, findRobot(m, map)))
      .sort((a, b) => String(a.time || "99:99").localeCompare(String(b.time || "99:99")));
  };

  const isCouponCandidate = (match) => String(match.decision || "").includes("Kupon") || Number(match.analysis_score || 0) >= 65;

  const verifyCode = async (code) => {
    const cleanCode = String(code || "").trim();
    if (!cleanCode) return { ok: false, message: "Kod boş olamaz." };
    try {
      const res = await fetch(VERIFY_CODE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cleanCode, clientId: getClientId() })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) return { ok: false, message: data.message || "Kod hatalı veya backend bağlantısı yok." };
      localStorage.setItem(ACCESS_KEY, "1");
      localStorage.setItem(CODE_KEY, cleanCode);
      localStorage.setItem(MEMBER_KEY, JSON.stringify(data.membership || {}));
      localStorage.setItem("fl_premium_access_note", "backend_verified");
      localStorage.setItem("fl_premium_access_level", data.membership?.planCode || "premium");
      return { ok: true, message: data.message || "Kod kabul edildi. Üyelik aktif." };
    } catch {
      return { ok: false, message: "Backend bağlantısı kurulamadı. Vercel deploy tamamlanınca tekrar dene." };
    }
  };

  const style = () => {
    if (document.getElementById("premium-analysis-new-style")) return;
    const s = document.createElement("style");
    s.id = "premium-analysis-new-style";
    s.textContent = `
      #premium-analysis-panel{position:relative;z-index:3;margin:24px clamp(18px,6vw,90px) 0;padding:18px;border:1px solid rgba(255,159,28,.28);border-radius:24px;background:linear-gradient(180deg,rgba(8,23,48,.96),rgba(3,8,23,.98));box-shadow:0 28px 76px rgba(0,0,0,.38)}
      .pa-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;margin-bottom:14px}.pa-title{margin:0;color:#ffe08a;font-size:clamp(22px,2.5vw,34px)}.pa-sub{margin:7px 0 0;color:#aebbd0;font-size:13px;line-height:1.55}.pa-badge{padding:9px 12px;border:1px solid rgba(57,255,136,.32);border-radius:999px;background:rgba(57,255,136,.12);color:#c8ffdd;font-size:12px;font-weight:900;white-space:nowrap}
      .pa-state{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-bottom:14px}.pa-state div{padding:12px;border:1px solid rgba(57,255,136,.18);border-radius:16px;background:rgba(57,255,136,.06)}.pa-state span{display:block;color:#8fa0b5;font-size:11px;font-weight:900;text-transform:uppercase}.pa-state strong{display:block;margin-top:5px;color:#f8fbff;font-size:18px}
      .pa-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,.95fr);gap:14px}.pa-card{display:grid;gap:12px;padding:15px;border:1px solid rgba(255,255,255,.08);border-radius:18px;background:rgba(255,255,255,.04)}.pa-card h3{margin:0;color:#fff7d6;font-size:16px}
      .pa-code{display:grid;gap:10px;padding:13px;border:1px dashed rgba(255,159,28,.34);border-radius:16px;background:rgba(255,159,28,.07)}.pa-code-row,.pa-tool-row{display:grid;grid-template-columns:1fr auto;gap:8px}.pa-input,.pa-select{width:100%;min-height:46px;border:1px solid rgba(255,159,28,.24);border-radius:13px;background:rgba(0,0,0,.25);color:#f8fbff;padding:0 12px;font-weight:850}.pa-select[multiple]{min-height:260px;padding:10px}.pa-button{min-height:46px;border:0;border-radius:14px;background:linear-gradient(135deg,#ff9f1c,#39ff88);color:#07110c;font-size:14px;font-weight:950;cursor:pointer;padding:0 14px}.pa-button.secondary{background:rgba(255,255,255,.08);color:#f8fbff;border:1px solid rgba(255,255,255,.16)}.pa-small{color:#aebbd0;font-size:12px;line-height:1.5}.pa-message{display:block;color:#ffe08a;font-size:12px;font-weight:900;min-height:16px;line-height:1.55}
      .pa-check{display:flex;align-items:center;gap:8px;color:#d7e4f5;font-size:12px;font-weight:850}.pa-check input{accent-color:#39ff88}.pa-filter-note{color:#8fa0b5;font-size:11px;font-weight:850}.pa-market-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.pa-market{min-height:42px;border:1px solid rgba(255,159,28,.20);border-radius:13px;background:rgba(255,255,255,.045);color:#f8fbff;font-weight:900;cursor:pointer}.pa-market.active{border-color:rgba(57,255,136,.55);background:rgba(57,255,136,.16);color:#c8ffdd}.pa-market:disabled,.pa-button:disabled,.pa-select:disabled{opacity:.45;cursor:not-allowed}.pa-result{display:grid;gap:10px;padding:14px;border:1px solid rgba(57,255,136,.20);border-radius:16px;background:rgba(57,255,136,.06)}.pa-row{display:flex;justify-content:space-between;gap:12px;padding:8px 10px;border-radius:12px;background:rgba(0,0,0,.18);color:#aebbd0;font-size:12px}.pa-row strong{color:#f8fbff;text-align:right}.pa-analysis-card{display:grid;gap:8px;padding:12px;border:1px solid rgba(255,159,28,.22);border-radius:14px;background:rgba(2,8,23,.55)}.pa-analysis-title{display:flex;justify-content:space-between;gap:10px;color:#fff7d6;font-weight:950}.pa-tag{display:inline-flex;width:max-content;padding:5px 8px;border-radius:999px;border:1px solid rgba(57,255,136,.26);background:rgba(57,255,136,.1);color:#c8ffdd;font-size:11px;font-weight:950}.pa-reason{color:#aebbd0;font-size:12px;line-height:1.45}.pa-odds-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}.pa-odd{padding:7px;border-radius:10px;background:rgba(255,255,255,.055);color:#d7e4f5;font-size:11px}.pa-odd b{display:block;color:#fff;margin-top:3px}
      @media(max-width:900px){.pa-grid,.pa-state{grid-template-columns:1fr}.pa-market-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.pa-odds-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){#premium-analysis-panel{margin:18px 14px 0;padding:14px}.pa-code-row,.pa-tool-row{grid-template-columns:1fr}.pa-market-grid{grid-template-columns:1fr}.pa-head{display:grid}}
    `;
    document.head.appendChild(s);
  };

  const ensureShell = () => {
    let shell = document.getElementById(PANEL_ID);
    if (!shell) {
      shell = document.createElement("section");
      shell.id = PANEL_ID;
      document.querySelector("main")?.appendChild(shell) || document.body.appendChild(shell);
    }
    return shell;
  };

  const markets = ["Robot Önerisi", "MS 1", "MS X", "MS 2", "2.5 Üst", "2.5 Alt", "KG Var", "KG Yok", "1Y KG Var", "2Y KG Var", "İY/MS 1/1", "İY/MS X/1", "İY/MS 2/2"];

  const matchOptionText = (match) => {
    const score = match.analysis_score !== null && match.analysis_score !== undefined ? ` · ${match.analysis_score}/100` : "";
    const market = match.recommended_market ? ` · ${match.recommended_market}` : "";
    return `${match.league || "Lig"} — ${match.time || "--:--"} | ${match.home} - ${match.away}${market}${score}`;
  };

  const optionHtml = (list, indexes) => indexes.length
    ? indexes.map((i) => `<option value="${i}">${esc(matchOptionText(list[i]))}</option>`).join("")
    : `<option value="">Filtreye uygun maç bulunamadı</option>`;

  const oddsGrid = (match) => {
    const odds = match.available_odds || {};
    const cells = [["MS 1", odds.ms1], ["MS X", odds.msx], ["MS 2", odds.ms2], ["2.5 Üst", odds.over25], ["2.5 Alt", odds.under25], ["KG Var", odds.bttsYes], ["1Y KG", odds.firstHalfBttsYes], ["2Y KG", odds.secondHalfBttsYes]];
    return `<div class="pa-odds-grid">${cells.map(([label, value]) => `<span class="pa-odd">${esc(label)}<b>${esc(value || "—")}</b></span>`).join("")}</div>`;
  };

  const selectedMarketFor = (match, selectedMarket) => selectedMarket === "Robot Önerisi" ? (match.recommended_market || "Robot önerisi yok") : selectedMarket;
  const selectedOddFor = (match, selectedMarket) => selectedMarket === "Robot Önerisi" ? (match.estimated_odds || oddsForMarket(match, match.recommended_market) || "-") : (oddsForMarket(match, selectedMarket) || "-");

  const renderOutput = (selected, selectedMarket, usage) => {
    const legs = selected.map((match) => ({ match, market: selectedMarketFor(match, selectedMarket), odd: selectedOddFor(match, selectedMarket) }));
    const numericOdds = legs.map((leg) => Number(String(leg.odd).replace(",", "."))).filter((value) => Number.isFinite(value) && value > 1);
    const totalOdd = numericOdds.length === legs.length ? numericOdds.reduce((acc, value) => acc * value, 1).toFixed(2) : "-";
    const avgScore = Math.round(legs.reduce((acc, leg) => acc + Number(leg.match.analysis_score || 0), 0) / Math.max(legs.length, 1));
    return `
      <h4>${legs.length} maçlık özel analiz hazır</h4>
      <div class="pa-row"><span>Seçim Modu</span><strong>${esc(selectedMarket)}</strong></div>
      <div class="pa-row"><span>Toplam Oran</span><strong>${esc(totalOdd)}</strong></div>
      <div class="pa-row"><span>Ortalama Güven</span><strong>${esc(avgScore ? `${avgScore}%` : "-")}</strong></div>
      <div class="pa-row"><span>Kalan Hak</span><strong>${esc(usage.remaining)}</strong></div>
      ${legs.map((leg, index) => `
        <article class="pa-analysis-card">
          <div class="pa-analysis-title"><span>${index + 1}. ${esc(leg.match.home)} - ${esc(leg.match.away)}</span><span>${esc(leg.match.time || "--:--")}</span></div>
          <span class="pa-tag">${esc(leg.match.decision || leg.match.recommended_market || "Özel analiz")}</span>
          <div class="pa-row"><span>Seçilen Market</span><strong>${esc(leg.market)}</strong></div>
          <div class="pa-row"><span>Oran</span><strong>${esc(leg.odd)}</strong></div>
          <div class="pa-row"><span>Robot Önerisi</span><strong>${esc(leg.match.recommended_market || "Yok")}</strong></div>
          <div class="pa-row"><span>Güven / Risk</span><strong>${esc(leg.match.confidence_score || "-")} · ${esc(leg.match.risk_level || "-")}</strong></div>
          ${oddsGrid(leg.match)}
          <p class="pa-reason">${esc(leg.match.robot_reason || "Robot gerekçesi henüz oluşmadı. Canlı veri ve detaylı analiz çıktısı güncellendikçe bu alan dolacak.")}</p>
        </article>`).join("")}
    `;
  };

  const render = (data) => {
    style();
    const active = isActive();
    const member = readMembership();
    const shell = ensureShell();
    const list = todayMatches(data);
    const analyzedCount = list.filter((match) => match.analysis_score !== null && match.analysis_score !== undefined).length;
    const couponCount = list.filter(isCouponCandidate).length;
    shell.innerHTML = `
      <div class="pa-head"><div><h2 class="pa-title">Özel Maç / Kupon Analizi</h2><p class="pa-sub">Üye kodu veya deneme aktifse maç seç, robot önerisini ya da kendi marketini seç. Panel canlı veri, robot analizi, oran ve gerekçeyi birlikte gösterir.</p></div><div class="pa-badge">${accessBadgeText()}</div></div>
      <div class="pa-state"><div><span>Paket</span><strong>${active ? esc(member.planName || "Premium Üye") : "Ön İzleme"}</strong></div><div><span>Kalan Kullanım</span><strong>${active ? esc(member.remainingAnalysisCount ?? "Aktif") : "Kilitli"}</strong></div><div><span>Analizli Maç</span><strong>${analyzedCount}</strong></div><div><span>Kupon Adayı</span><strong>${couponCount}</strong></div></div>
      <div class="pa-grid">
        <div class="pa-card">
          <h3>Üye Kodu</h3>
          <div class="pa-code"><span class="pa-small">Kod aktif değilse özel analiz kilitli kalır. 1 günlük deneme aktifse ayrıca kod gerekmez.</span><div class="pa-code-row"><input class="pa-input" type="password" placeholder="Üye / kurucu kodu" data-pa-code><button class="pa-button" type="button" data-pa-unlock>Kod ile Aç</button></div><span class="pa-message" data-pa-message>${active ? esc(trialMessage()) : "Kod girilmeden veya deneme açılmadan özel analiz açılmaz."}</span></div>
          <h3>Maçlar ve Seçenek</h3>
          <div class="pa-tool-row"><input class="pa-input" type="search" placeholder="Maç, lig veya takım ara" data-pa-search ${active ? "" : "disabled"}><button class="pa-button secondary" type="button" data-pa-top ${active ? "" : "disabled"}>En güçlü 5</button></div>
          <label class="pa-check"><input type="checkbox" data-pa-only-coupon ${active ? "" : "disabled"}> Sadece kupon adaylarını göster</label>
          <span class="pa-filter-note" data-pa-count>${list.length} maç listeleniyor · 0 maç seçildi</span>
          <label class="pa-small">Maç Listesi<select class="pa-select" data-pa-match multiple size="9" ${active ? "" : "disabled"}>${list.length ? optionHtml(list, list.map((_, i) => i)) : `<option>Bugünün maç listesi hazırlanıyor</option>`}</select></label>
          <div class="pa-market-grid">${markets.map((market, index) => `<button class="pa-market${index === 0 ? " active" : ""}" type="button" data-pa-market="${esc(market)}" ${active ? "" : "disabled"}>${esc(market)}</button>`).join("")}</div>
          <button class="pa-button" type="button" data-pa-analyze ${active ? "" : "disabled"}>Özel Analizi Başlat</button>
        </div>
        <div class="pa-card"><h3>Özel Analiz Sonucu</h3><div class="pa-result" data-pa-output><h4>Hazır bekliyor</h4><p class="pa-small">Kod aktif olup maç seçildiğinde robot gerekçeli özel analiz burada oluşur.</p></div></div>
      </div>`;

    let selectedMarket = "Robot Önerisi";
    let visibleIndexes = list.map((_, i) => i);
    const select = shell.querySelector("[data-pa-match]");
    const search = shell.querySelector("[data-pa-search]");
    const onlyCoupon = shell.querySelector("[data-pa-only-coupon]");
    const count = shell.querySelector("[data-pa-count]");

    const updateCount = () => {
      const selectedCount = Array.from(select?.selectedOptions || []).filter((o) => o.value !== "").length;
      if (count) count.textContent = `${visibleIndexes.length} maç listeleniyor · ${selectedCount} maç seçildi`;
    };

    const refreshOptions = () => {
      const term = cleanKey(search?.value || "");
      visibleIndexes = list
        .map((match, index) => ({ match, index }))
        .filter(({ match }) => !onlyCoupon?.checked || isCouponCandidate(match))
        .filter(({ match }) => !term || cleanKey(`${match.league} ${match.home} ${match.away} ${match.recommended_market}`).includes(term))
        .map(({ index }) => index);
      if (select) select.innerHTML = optionHtml(list, visibleIndexes);
      updateCount();
    };

    search?.addEventListener("input", refreshOptions);
    onlyCoupon?.addEventListener("change", refreshOptions);
    select?.addEventListener("change", updateCount);
    shell.querySelector("[data-pa-top]")?.addEventListener("click", () => {
      const top = list
        .map((match, index) => ({ match, index }))
        .filter(({ match }) => visibleIndexes.includes(index))
        .sort((a, b) => Number(b.match.analysis_score || 0) - Number(a.match.analysis_score || 0))
        .slice(0, 5)
        .map(({ index }) => String(index));
      Array.from(select?.options || []).forEach((option) => { option.selected = top.includes(option.value); });
      updateCount();
    });

    shell.querySelectorAll("[data-pa-market]").forEach((button) => {
      button.addEventListener("click", () => {
        shell.querySelectorAll("[data-pa-market]").forEach((b) => b.classList.remove("active"));
        button.classList.add("active");
        selectedMarket = button.dataset.paMarket || "Robot Önerisi";
      });
    });

    shell.querySelector("[data-pa-unlock]")?.addEventListener("click", async () => {
      const input = shell.querySelector("[data-pa-code]");
      const button = shell.querySelector("[data-pa-unlock]");
      const msg = shell.querySelector("[data-pa-message]");
      button.disabled = true;
      if (msg) msg.textContent = "Kod backend ile kontrol ediliyor...";
      const result = await verifyCode(input?.value);
      if (!result.ok) {
        if (msg) msg.textContent = result.message;
        button.disabled = false;
        input?.focus();
        return;
      }
      if (msg) msg.textContent = result.message;
      setTimeout(() => refresh(), 450);
    });

    shell.querySelector("[data-pa-analyze]")?.addEventListener("click", () => {
      const selected = Array.from(select?.selectedOptions || []).map((o) => list[Number(o.value)]).filter(Boolean);
      const output = shell.querySelector("[data-pa-output]");
      if (!selected.length) {
        output.innerHTML = `<h4>Eksik seçim</h4><p class="pa-small">En az 1 maç seç.</p>`;
        return;
      }
      const usage = consumeAnalysisRight();
      if (!usage.ok) {
        output.innerHTML = `<h4>Analiz hakkı bitti</h4><p class="pa-small">${esc(usage.message)}</p>`;
        setTimeout(() => refresh(), 500);
        return;
      }
      output.innerHTML = renderOutput(selected, selectedMarket, usage);
      const stateCards = shell.querySelectorAll(".pa-state strong");
      if (stateCards[1]) stateCards[1].textContent = String(usage.remaining);
      const message = shell.querySelector("[data-pa-message]");
      if (message) message.textContent = trialMessage();
      if (Number(usage.remaining) <= 0) setTimeout(() => refresh(), 900);
    });
  };

  const refresh = async () => render(await readData());
  window.addEventListener("load", refresh);
  document.addEventListener("DOMContentLoaded", refresh, { once: true });
  document.addEventListener("fl:trial-access-started", refresh);
})();
