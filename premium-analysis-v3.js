(() => {
  "use strict";

  if (window.__flPremiumAnalysisV3Ready) return;
  window.__flPremiumAnalysisV3Ready = true;

  const CORE = window.FLPremiumAnalysisCore;
  const ACCESS_KEY = "fl_premium_beta_access";
  const CODE_KEY = "fl_premium_code_entered";
  const MEMBER_KEY = "fl_premium_membership";
  const TRIAL_KEY = "fl_premium_trial";
  const HISTORY_KEY = "fl_premium_analysis_history";
  const LAST_KEY = "fl_last_premium_robot_analysis";
  const QUEUE_KEY = "fl_premium_robot_queue";
  const ANALYSIS_COUNT_KEY = "fl_premium_analysis_count";
  const SECURE_API_ORIGIN = /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname)
    || window.location.hostname.endsWith(".vercel.app")
    ? ""
    : "https://futbol-laboratuvari.vercel.app";
  const PAGE_SIZE = 12;
  const MAX_COUPON = 10;

  const state = {
    bulletin: [],
    matches: [],
    mode: "single",
    type: "robot",
    advancedMarket: "MS 1",
    selected: new Set(),
    search: "",
    date: "",
    visibleLimit: PAGE_SIZE,
    resultReady: false,
    loading: true,
    proMeta: null,
    proLoading: false,
  };

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const readJson = (key, fallback = {}) => {
    try {
      return JSON.parse(localStorage.getItem(key) || "") || fallback;
    } catch {
      return fallback;
    }
  };

  const writeJson = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  };

  const clearExpiredAccess = () => {
    const trial = readJson(TRIAL_KEY, null);
    const member = readJson(MEMBER_KEY, null);
    const expiresAt = Date.parse(member?.expiresAt || trial?.expiresAt || "");
    if (Number.isFinite(expiresAt) && expiresAt <= Date.now()) {
      [ACCESS_KEY, CODE_KEY, MEMBER_KEY, TRIAL_KEY, "fl_premium_access_note", "fl_premium_access_level"]
        .forEach((key) => localStorage.removeItem(key));
      return true;
    }
    return false;
  };

  const membershipState = () => {
    clearExpiredAccess();
    const membership = readJson(MEMBER_KEY, {});
    const activeFlag = localStorage.getItem(ACCESS_KEY) === "1";
    const planCode = String(membership.planCode || localStorage.getItem("fl_premium_access_level") || "");
    const remaining = Number(membership.remainingAnalysisCount);
    const unlimited = /founder|kurucu/i.test(`${planCode} ${membership.planName || ""}`) || remaining >= 9999;
    const active = activeFlag && (unlimited || !Number.isFinite(remaining) || remaining > 0);
    return { active, unlimited, remaining, membership };
  };

  const rightLabel = () => {
    const member = membershipState();
    if (!member.active) return member.remaining === 0 ? "Hak kalmadı" : "Üyelik gerekli";
    if (member.unlimited) return "Sınırsız analiz";
    if (Number.isFinite(member.remaining)) return `${Math.max(0, member.remaining)} analiz hakkı`;
    return "Üyelik aktif";
  };

  const formatDate = (value) => {
    const parsed = Date.parse(`${value}T12:00:00+03:00`);
    if (!Number.isFinite(parsed)) return value;
    return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", weekday: "short", timeZone: "Europe/Istanbul" })
      .format(new Date(parsed));
  };

  const oddText = (value) => Number.isFinite(Number(value)) && Number(value) > 1 ? Number(value).toFixed(2) : "—";
  const percentText = (value, digits = 0) => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value))
    ? `%${Number(value).toFixed(digits)}`
    : "Ölçülmedi";
  const signedPercentText = (value) => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value))
    ? `${Number(value) > 0 ? "+" : ""}${Number(value).toFixed(1)} puan`
    : "Ölçülmedi";
  const modelScoreValue = (value) => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value))
    ? Math.round(Number(value))
    : null;
  const modelScoreText = (value) => {
    const score = modelScoreValue(value);
    return score === null ? "Ölçülmedi" : `${score}/100`;
  };
  const root = () => document.querySelector("[data-pa3-root]");
  const query = (selector) => root()?.querySelector(selector) || null;

  const setMessage = (text, kind = "info") => {
    const node = query("[data-pa3-message]");
    if (!node) return;
    node.textContent = text || "";
    node.dataset.kind = kind;
  };

  const updateAccessView = () => {
    const badge = query("[data-pa3-rights]");
    if (!badge) return;
    const member = membershipState();
    badge.textContent = rightLabel();
    badge.dataset.state = member.active ? "active" : "locked";
    badge.setAttribute("aria-label", member.active ? `Üyelik aktif, ${rightLabel()}` : rightLabel());
  };

  const selectedMatches = () => state.matches.filter((match) => state.selected.has(match.id));
  const visibleMatches = () => CORE.filterMatches(state.matches, { query: state.search, date: state.date });

  const updateSteps = () => {
    const step = state.resultReady ? 3 : state.selected.size ? 2 : 1;
    root()?.querySelectorAll("[data-pa3-step]").forEach((node) => {
      const index = Number(node.dataset.pa3Step);
      node.classList.toggle("is-active", index === step);
      node.classList.toggle("is-done", index < step);
      node.setAttribute("aria-current", index === step ? "step" : "false");
    });
  };

  const syncHiddenSelect = () => {
    const select = query("[data-pa-match]");
    if (!select) return;
    select.innerHTML = state.matches.map((match) => {
      const selected = state.selected.has(match.id) ? " selected" : "";
      return `<option value="${esc(match.id)}"${selected}>${esc(`${match.league} — ${match.time} | ${match.home} - ${match.away}`)}</option>`;
    }).join("");
  };

  const updateSelectionSummary = () => {
    const count = query("[data-pa3-selected-count]");
    const caption = query("[data-pa3-selected-caption]");
    const analyze = query("[data-pa-analyze]");
    if (count) count.textContent = String(state.selected.size);
    if (caption) {
      caption.textContent = state.mode === "single"
        ? (state.selected.size ? "Maç seçildi" : "Bir maç seç")
        : `${state.selected.size}/${MAX_COUPON} maç seçildi`;
    }
    if (analyze) {
      analyze.disabled = state.loading || state.selected.size === 0;
      analyze.textContent = state.mode === "single" ? "Analizi Oluştur" : `Kuponu Analiz Et (${state.selected.size})`;
    }
    syncHiddenSelect();
    updateSteps();
  };

  const renderDates = () => {
    const select = query("[data-pa3-date]");
    if (!select) return;
    const dates = [...new Set(state.matches.map((match) => match.date).filter(Boolean))];
    if (!state.date || !dates.includes(state.date)) state.date = dates[0] || "";
    select.innerHTML = dates.length
      ? dates.map((date) => `<option value="${esc(date)}"${date === state.date ? " selected" : ""}>${esc(formatDate(date))}</option>`).join("") + `<option value="">Tüm yaklaşan maçlar</option>`
      : `<option value="">Tarih yok</option>`;
  };

  const matchCard = (match) => {
    const selected = state.selected.has(match.id);
    const code = match.matchCode ? `<span class="fl-pa3-match-code">#${esc(match.matchCode)}</span>` : "";
    const hasPro = Boolean(match.pro?.available);
    const quality = hasPro
      ? `${match.pro.dataQuality || "Sınırlı"} veri${Number.isFinite(match.pro.dataCompleteness) ? ` · %${Math.round(match.pro.dataCompleteness)}` : ""}`
      : "Piyasa verisi";
    const source = `<span class="fl-pa3-quality ${hasPro ? "is-pro" : "is-market"}">${hasPro ? "PRO" : "Piyasa"}</span>`;
    return `<button class="fl-pa3-match${selected ? " is-selected" : ""}" type="button" data-pa3-match-id="${esc(match.id)}" aria-pressed="${selected}">
      <span class="fl-pa3-match-time"><strong>${esc(match.time || "--:--")}</strong><small>${esc(formatDate(match.date))}</small></span>
      <span class="fl-pa3-match-main"><small>${esc(match.league || "Lig")}</small><strong>${esc(match.home)} <i>–</i> ${esc(match.away)}</strong></span>
      <span class="fl-pa3-match-meta">${source}${code}<small>${esc(quality)}</small><b aria-hidden="true">${selected ? "✓" : "+"}</b></span>
    </button>`;
  };

  const renderMatches = () => {
    const list = query("[data-pa3-match-list]");
    const total = query("[data-pa3-total]");
    const more = query("[data-pa3-more]");
    if (!list) return;
    const filtered = visibleMatches();
    const shown = filtered.slice(0, state.visibleLimit);
    if (total) total.textContent = state.loading ? "Maçlar yükleniyor" : `${filtered.length} yaklaşan maç`;
    list.setAttribute("aria-busy", String(state.loading));
    if (state.loading) {
      list.innerHTML = `<div class="fl-pa3-loading" role="status"><span></span><span></span><span></span><p>Güncel bülten hazırlanıyor…</p></div>`;
    } else if (!shown.length) {
      list.innerHTML = `<div class="fl-pa3-empty"><strong>Uygun maç bulunamadı</strong><p>Aramayı veya tarih filtresini değiştir. Başlamış ve tamamlanmış maçlar bu listede gösterilmez.</p></div>`;
    } else {
      list.innerHTML = shown.map(matchCard).join("");
    }
    if (more) {
      more.hidden = shown.length >= filtered.length;
      more.textContent = `Daha fazla göster (${filtered.length - shown.length})`;
    }
    updateSelectionSummary();
  };

  const setMode = (mode) => {
    state.mode = mode === "coupon" ? "coupon" : "single";
    if (state.mode === "single" && state.selected.size > 1) {
      state.selected = new Set([state.selected.values().next().value]);
    }
    state.resultReady = false;
    root()?.querySelectorAll("[data-pa3-mode]").forEach((button) => {
      const active = button.dataset.pa3Mode === state.mode;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const hint = query("[data-pa3-mode-hint]");
    if (hint) hint.textContent = state.mode === "single" ? "Tek karşılaşma için net ve gerekçeli sonuç." : `En fazla ${MAX_COUPON} maçla ortak risk görünümü.`;
    renderMatches();
  };

  const setType = (type) => {
    state.type = ["match", "goals", "advanced"].includes(type) ? type : "robot";
    state.resultReady = false;
    root()?.querySelectorAll("[data-pa3-type]").forEach((button) => {
      const active = button.dataset.pa3Type === state.type;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    const advanced = query("[data-pa3-advanced]");
    if (advanced) advanced.open = state.type === "advanced";
    updateSteps();
  };

  const toggleMatch = (id) => {
    if (!id) return;
    if (state.selected.has(id)) {
      state.selected.delete(id);
    } else if (state.mode === "single") {
      state.selected = new Set([id]);
    } else if (state.selected.size >= MAX_COUPON) {
      setMessage(`Kupon analizinde en fazla ${MAX_COUPON} maç seçebilirsin.`, "warning");
      return;
    } else {
      state.selected.add(id);
    }
    state.resultReady = false;
    setMessage(state.selected.size ? "Seçim hazır. Analiz türünü belirleyebilirsin." : "Önce maç seç.", "info");
    renderMatches();
  };

  const compactResult = (result) => ({
    at: new Date().toISOString(),
    mode: state.mode,
    type: state.type,
    match: `${result.match.home} - ${result.match.away}`,
    date: result.match.date,
    time: result.match.time,
    league: result.match.league,
    market: result.market,
    odd: result.odd,
    confidence: result.confidence,
    modelScore: result.modelScore,
    estimatedProbability: result.estimatedProbability,
    marketProbability: result.marketProbability,
    edgePercent: result.edgePercent,
    dataCompleteness: result.dataCompleteness,
    dataQuality: result.dataQuality,
    modelVersion: result.modelVersion,
    risk: result.risk,
    noPick: result.noPick,
    hasOpinion: result.hasOpinion,
    couponEligible: result.couponEligible,
    recommendationStatus: result.recommendationStatus,
    reasons: result.reasons,
  });

  const persistResults = (results) => {
    const compact = results.map(compactResult);
    const previous = readJson(HISTORY_KEY, []);
    writeJson(HISTORY_KEY, [...compact, ...(Array.isArray(previous) ? previous : [])].slice(0, 30));
    writeJson(LAST_KEY, compact.length === 1 ? compact[0] : { at: new Date().toISOString(), mode: "coupon", legs: compact });
    writeJson(QUEUE_KEY, compact);
  };

  const consumeLocalRight = () => {
    const member = membershipState();
    if (!member.active || member.unlimited || !Number.isFinite(member.remaining)) return;
    member.membership.remainingAnalysisCount = Math.max(0, member.remaining - 1);
    writeJson(MEMBER_KEY, member.membership);
  };

  const riskClass = (risk) => CORE.normalizeText(risk).includes("yuksek") ? "high" : CORE.normalizeText(risk).includes("dusuk") ? "low" : "medium";

  const detailsHtml = (result) => `<details class="fl-pa3-details"><summary>Veri detaylarını göster</summary><dl>${(result.details || []).map((item) => `<div><dt>${esc(item.label)}</dt><dd>${esc(item.value)}</dd></div>`).join("")}</dl></details>`;

  const validationHtml = (result) => {
    const calibration = result.calibration;
    if (!calibration) return `<div class="fl-pa3-validation"><strong>Doğrulama durumu</strong><span>Bu analiz türü için olasılık geçmişi henüz bağlanmadı.</span></div>`;
    const samples = Number(calibration.probability_sample_count || 0);
    const brier = calibration.brier_score === null || calibration.brier_score === undefined ? null : Number(calibration.brier_score);
    const historical = Number(calibration.measured_count || 0);
    return `<div class="fl-pa3-validation"><strong>Geçmiş doğrulama</strong><span>${historical ? `${esc(historical)} tamamlanan eski tahmin ölçüldü.` : "Tamamlanan sonuç örneği biriktiriliyor."} ${samples >= 30 && brier !== null && Number.isFinite(brier) ? `PRO olasılık Brier skoru ${esc(brier.toFixed(3))}.` : "PRO olasılık kalibrasyonu için yeni örnekler biriktiriliyor."}</span></div>`;
  };

  const teamStatusText = (teamName, status, lineup) => {
    if (!status && !lineup) return `${teamName}: kadro verisi bekleniyor`;
    const names = (key) => (Array.isArray(status?.[key]) ? status[key] : [])
      .map((player) => typeof player === "string" ? player : player?.name)
      .filter(Boolean);
    const parts = [];
    const injured = names("injured_players");
    const suspended = names("suspended_players");
    const doubtful = names("doubtful_players");
    const transfersIn = names("transfers_in");
    const transfersOut = names("transfers_out");
    if (injured.length) parts.push(`sakat: ${injured.join(", ")}`);
    if (suspended.length) parts.push(`cezalı: ${suspended.join(", ")}`);
    if (doubtful.length) parts.push(`şüpheli: ${doubtful.join(", ")}`);
    if (transfersIn.length) parts.push(`transfer girişi: ${transfersIn.join(", ")}`);
    if (transfersOut.length) parts.push(`transfer çıkışı: ${transfersOut.join(", ")}`);
    if (!injured.length && status?.injury_news_count) parts.push(`${status.injury_news_count} sakatlık haber sinyali`);
    if (!suspended.length && status?.suspension_news_count) parts.push(`${status.suspension_news_count} ceza haber sinyali`);
    if (!doubtful.length && status?.doubtful_news_count) parts.push(`${status.doubtful_news_count} belirsizlik haber sinyali`);
    if (!transfersIn.length && !transfersOut.length && (status?.transfer_in_news_count || status?.transfer_out_news_count)) parts.push(`transfer haber sinyali +${status.transfer_in_news_count || 0} / -${status.transfer_out_news_count || 0}`);
    if (lineup?.lineup_confirmed) parts.push(`ilk 11 doğrulandı${lineup.formation && lineup.formation !== "-" ? ` (${lineup.formation})` : ""}`);
    if (!parts.length && status?.availability_checked) parts.push("sağlayıcı akışında isimli eksik yok");
    if (!parts.length) parts.push("kadro verisi bekleniyor");
    return `${teamName}: ${parts.join(" · ")}`;
  };

  const teamIntelligenceHtml = (result) => {
    const intel = result.match?.teamIntelligence || result.match?.pro?.teamIntelligence;
    if (!intel) return `<div class="fl-pa3-validation"><strong>Kadro ve futbolcu analizi</strong><span>Doğrulanmış oyuncu verisi henüz eşleşmedi; düşük risk varsayılmadı.</span></div>`;
    const hasTeamDetail = intel.home_status || intel.away_status || intel.home_lineup || intel.away_lineup;
    if (!hasTeamDetail) {
      const verified = Number(intel.verified_team_count || 0);
      return `<div class="fl-pa3-validation"><strong>Kadro ve futbolcu analizi</strong><span>${verified ? `${esc(verified)}/2 takım için sağlayıcı kontrolü tamamlandı; isimli eksik kaydı yok.` : "Doğrulanmış oyuncu verisi henüz eşleşmedi; düşük risk varsayılmadı."}<br>Kadro riski: ${esc(intel.squad_risk_level || "Belirsiz")} · İlk 11 riski: ${esc(intel.lineup_risk_level || "Belirsiz")}</span></div>`;
    }
    const home = teamStatusText(result.match.home, intel.home_status, intel.home_lineup);
    const away = teamStatusText(result.match.away, intel.away_status, intel.away_lineup);
    return `<div class="fl-pa3-validation"><strong>Kadro ve futbolcu analizi</strong><span>${esc(home)}<br>${esc(away)}<br>Kadro riski: ${esc(intel.squad_risk_level || "Belirsiz")} · İlk 11 riski: ${esc(intel.lineup_risk_level || "Belirsiz")}</span></div>`;
  };

  const recommendationLabel = (result) => ({
    coupon: "Kupona uygun seçim",
    analysis: "Robot görüşü",
    watch: "İzleme görüşü",
    unavailable: "Kontrollü karar",
  }[result.recommendationStatus] || (result.noPick ? "Kontrollü karar" : "Öne çıkan seçim"));

  const recommendationNote = (result) => {
    if (result.recommendationStatus === "coupon") return `Kupon ölçütleri doğrulandı · Oran ${oddText(result.odd)}`;
    if (result.recommendationStatus === "analysis") return `Otomatik kupon adayı değil · Oran ${oddText(result.odd)}`;
    if (result.recommendationStatus === "watch") return `Kupon hesabına katılmaz · Oran ${oddText(result.odd)}`;
    if (!result.noPick) return `Oran ${oddText(result.odd)}`;
    return modelScoreValue(result.modelScore ?? result.confidence) === null
      ? "PRO veri kaydı bulunamadı"
      : "Güvenilir market görüşü oluşmadı";
  };

  const couponLegStatus = (leg) => ({
    coupon: "Kupona uygun",
    watch: "İzleme",
    unavailable: "Veri yetersiz",
  }[leg.recommendationStatus] || (leg.noPick ? "Kupona uygun değil" : "Kupona uygun"));

  const singleResultHtml = (result) => `<div class="fl-pa3-result-head">
      <span class="fl-pa3-kicker">3 · Sonuç</span>
      <span class="fl-pa3-risk is-${riskClass(result.risk)}">${esc(result.risk)} risk</span>
    </div>
    <p class="fl-pa3-result-match">${esc(result.match.league)} · ${esc(result.match.time)}</p>
    <h3>${esc(result.match.home)} <span>–</span> ${esc(result.match.away)}</h3>
    <div class="fl-pa3-pick${result.noPick || ["analysis", "watch", "unavailable"].includes(result.recommendationStatus) ? " is-no-pick" : ""}">
      <span>${esc(recommendationLabel(result))}</span>
      <strong>${esc(result.market)}</strong>
      <small>${esc(recommendationNote(result))}</small>
    </div>
    <div class="fl-pa3-confidence"><div><span>Model gücü <small>olasılık değildir</small></span><strong>${esc(modelScoreText(result.modelScore ?? result.confidence))}</strong></div><progress max="100" value="${esc(modelScoreValue(result.modelScore ?? result.confidence) ?? 0)}" aria-label="Model gücü ${esc(modelScoreText(result.modelScore ?? result.confidence))}">${esc(modelScoreText(result.modelScore ?? result.confidence))}</progress></div>
    <div class="fl-pa3-score-grid">
      <div><span>Tahmini olasılık</span><strong>${esc(percentText(result.estimatedProbability, 1))}</strong></div>
      <div><span>Piyasa olasılığı</span><strong>${esc(percentText(result.marketProbability, 1))}</strong></div>
      <div><span>Model–piyasa farkı</span><strong>${esc(signedPercentText(result.edgePercent))}</strong></div>
      <div><span>Veri kapsamı</span><strong>${esc(percentText(result.dataCompleteness))}</strong><small>${esc(result.dataQuality || "Sınırlı")}</small></div>
    </div>
    ${teamIntelligenceHtml(result)}
    <div class="fl-pa3-reasons"><h4>Neden?</h4><ol>${result.reasons.map((reason) => `<li>${esc(reason)}</li>`).join("")}</ol></div>
    ${validationHtml(result)}
    ${detailsHtml(result)}
    <p class="fl-pa3-disclaimer">Model gücü, sinyallerin tutarlılığını gösterir; kazanma olasılığı değildir. Tahmini olasılık da belirsizlik içerir ve kesin sonuç garantisi vermez.</p>
    <div class="fl-pa3-result-actions"><button type="button" data-pa3-copy>Sonucu Kopyala</button><button type="button" data-pa3-new>Yeni Analiz</button></div>`;

  const couponResultHtml = (coupon) => `<div class="fl-pa3-result-head">
      <span class="fl-pa3-kicker">3 · Kupon Sonucu</span>
      <span class="fl-pa3-risk is-${riskClass(coupon.risk)}">${esc(coupon.risk)} risk</span>
    </div>
    <h3>${coupon.legs.length} maçlık kupon görünümü</h3>
    <div class="fl-pa3-coupon-summary"><div><span>Ort. model gücü</span><strong>${esc(modelScoreText(coupon.averageModelScore))}</strong></div><div><span>Robot görüşü</span><strong>${esc(coupon.opinionCount)}/${esc(coupon.legs.length)}</strong></div><div><span>Kupona uygun</span><strong>${esc(coupon.pickedCount)}/${esc(coupon.legs.length)}</strong></div><div><span>Birleşik olasılık</span><strong>${esc(percentText(coupon.combinedProbability, 2))}</strong></div><div><span>Toplam oran</span><strong>${esc(oddText(coupon.totalOdd))}</strong></div></div>
    <div class="fl-pa3-coupon-legs">${coupon.legs.map((leg, index) => `<article class="${leg.noPick ? "is-no-pick" : ""}"><span>${index + 1}</span><div><strong>${esc(leg.match.home)} – ${esc(leg.match.away)}</strong><small>${esc(leg.market)} · ${esc(couponLegStatus(leg))} · Model ${esc(modelScoreText(leg.modelScore ?? leg.confidence))} · ${esc(percentText(leg.estimatedProbability, 1))} · Kadro ${esc(leg.match.pro?.squadRiskLevel || "Belirsiz")}</small></div><b>${esc(oddText(leg.odd))}</b></article>`).join("")}</div>
    <div class="fl-pa3-reasons"><h4>Kupon notu</h4><ol><li>Toplam oran ve birleşik olasılık yalnız bütün ayaklar kupona uygun olduğunda hesaplanır.</li><li>${esc(coupon.watchCount)} izleme görüşü marketiyle birlikte gösterildi fakat kupon hesabına katılmadı.</li><li>${esc(coupon.unavailableCount)} maçta güvenilir market görüşü oluşmadı; eksik veriyle tahmin uydurulmadı.</li></ol></div>
    <p class="fl-pa3-disclaimer">Model gücü olasılık değildir. Kupon olasılığı yaklaşık bir risk göstergesidir; bütçe ve süre sınırını koru.</p>
    <div class="fl-pa3-result-actions"><button type="button" data-pa3-copy>Sonucu Kopyala</button><button type="button" data-pa3-new>Yeni Analiz</button></div>`;

  const resultText = () => {
    const panel = query("[data-pa-output]");
    return panel?.innerText?.replace(/Sonucu Kopyala\s*Yeni Analiz/gi, "").trim() || "";
  };

  const copyResult = async () => {
    const text = resultText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Sonuç panoya kopyalandı.", "success");
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      setMessage("Sonuç panoya kopyalandı.", "success");
    }
  };

  const closeAccess = () => {
    const drawer = query("[data-pa3-access]");
    if (!drawer) return;
    drawer.hidden = true;
    drawer.setAttribute("aria-hidden", "true");
  };

  const openAccess = (message = "Analizi oluşturmak için üyelik kodunu gir.") => {
    const drawer = query("[data-pa3-access]");
    const status = query("[data-pa3-access-status]");
    if (!drawer) return;
    drawer.hidden = false;
    drawer.setAttribute("aria-hidden", "false");
    if (status) {
      status.textContent = message;
      status.dataset.kind = "info";
    }
    setTimeout(() => query("[data-pa3-code]")?.focus(), 30);
  };

  const handleAnalyze = () => {
    const matches = selectedMatches();
    if (!matches.length) {
      setMessage("Analiz için önce en az bir maç seç.", "warning");
      return;
    }
    if (!membershipState().active) {
      openAccess();
      return;
    }

    const output = query("[data-pa-output]");
    if (!output) return;
    const advanced = state.type === "advanced" ? state.advancedMarket : "";
    if (state.mode === "single") {
      const result = CORE.analyze(matches[0], state.type, advanced);
      output.innerHTML = singleResultHtml(result);
      persistResults([result]);
    } else {
      const coupon = CORE.analyzeCoupon(matches, state.type, advanced);
      output.innerHTML = couponResultHtml(coupon);
      persistResults(coupon.legs);
    }
    consumeLocalRight();
    updateAccessView();
    closeAccess();
    state.resultReady = true;
    updateSteps();
    const analysisCount = Number(readJson(ANALYSIS_COUNT_KEY, 0) || 0) + 1;
    writeJson(ANALYSIS_COUNT_KEY, analysisCount);
    setMessage(analysisCount > 0 && analysisCount % 3 === 0
      ? "Analiz hazır. Kısa bir ara verip bütçe ve süre sınırını yeniden kontrol et."
      : "Analiz hazırlandı. Risk, olasılık ve veri kapsamını birlikte değerlendir.", analysisCount % 3 === 0 ? "warning" : "success");
    document.dispatchEvent(new CustomEvent("fl:premium-analysis-complete", { detail: { mode: state.mode, count: matches.length } }));
    if (window.matchMedia("(max-width: 900px)").matches) output.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const activateCode = () => {
    const input = query("[data-pa3-code]");
    const status = query("[data-pa3-access-status]");
    const code = String(input?.value || "").trim().replace(/\s+/g, "").toLocaleUpperCase("tr-TR");
    if (code.length < 4) {
      if (status) {
        status.textContent = "Geçerli üyelik kodunu gir.";
        status.dataset.kind = "error";
      }
      input?.focus();
      return;
    }
    localStorage.setItem(CODE_KEY, code);
    if (status) {
      status.textContent = "Kod ve analiz hakkı güvenli biçimde kontrol ediliyor…";
      status.dataset.kind = "info";
    }
    const button = query("[data-pa-analyze]");
    if (button && !button.disabled) button.click();
  };

  const resetAnalysis = () => {
    state.resultReady = false;
    state.selected.clear();
    const output = query("[data-pa-output]");
    if (output) output.innerHTML = `<div class="fl-pa3-result-empty"><span>3</span><h3>Sonuç burada görünecek</h3><p>Öneriyle birlikte model gücü, tahmini olasılık, veri kapsamı, risk ve gerekçeler sunulur.</p></div>`;
    renderMatches();
    query("[data-pa3-match-list]")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  };

  const bind = () => {
    const shell = root();
    if (!shell || shell.dataset.pa3Bound === "1") return;
    shell.dataset.pa3Bound = "1";

    shell.addEventListener("click", (event) => {
      const mode = event.target.closest?.("[data-pa3-mode]");
      if (mode) return setMode(mode.dataset.pa3Mode);
      const type = event.target.closest?.("[data-pa3-type]");
      if (type) return setType(type.dataset.pa3Type);
      const match = event.target.closest?.("[data-pa3-match-id]");
      if (match) return toggleMatch(match.dataset.pa3MatchId);
      if (event.target.closest?.("[data-pa3-more]")) {
        state.visibleLimit += PAGE_SIZE;
        renderMatches();
        return;
      }
      if (event.target.closest?.("[data-pa3-unlock]")) return activateCode();
      if (event.target.closest?.("[data-pa3-access-close]")) return closeAccess();
      if (event.target.closest?.("[data-pa3-copy]")) return copyResult();
      if (event.target.closest?.("[data-pa3-new]")) return resetAnalysis();
      if (event.target.closest?.("[data-pa-analyze]")) return handleAnalyze();
    });

    shell.addEventListener("input", (event) => {
      if (event.target.matches("[data-pa3-search]")) {
        state.search = event.target.value;
        state.visibleLimit = PAGE_SIZE;
        renderMatches();
      }
    });

    shell.addEventListener("change", (event) => {
      if (event.target.matches("[data-pa3-date]")) {
        state.date = event.target.value;
        state.selected.clear();
        state.visibleLimit = PAGE_SIZE;
        state.resultReady = false;
        renderMatches();
      }
      if (event.target.matches("[data-pa3-advanced-market]")) {
        state.advancedMarket = event.target.value;
        setType("advanced");
      }
    });

    query("[data-pa3-code]")?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        activateCode();
      }
    });

    window.addEventListener("fl:premium-access-required", (event) => openAccess(event.detail?.message));
    window.addEventListener("fl:premium-access-error", (event) => {
      openAccess(event.detail?.message || "Üyelik kodu doğrulanamadı.");
      const status = query("[data-pa3-access-status]");
      if (status) status.dataset.kind = "error";
      updateAccessView();
    });
    document.addEventListener("fl:trial-access-started", async () => {
      updateAccessView();
      const code = String(localStorage.getItem(CODE_KEY) || "").trim();
      try {
        await refreshProtectedPro(code);
        closeAccess();
        setMessage("Deneme erişimi ve korumalı PRO verisi aktif. Seçimini analiz edebilirsin.", "success");
      } catch {
        openAccess("Deneme aktif ancak korumalı analiz verisi açılamadı. Lütfen yeniden dene.");
      }
    });
    window.addEventListener("storage", updateAccessView);
  };

  const fetchBulletin = async () => {
    const sharedMatches = () => Array.isArray(window.__flPremiumBulletinMatches)
      ? window.__flPremiumBulletinMatches
      : [];
    if (!sharedMatches().length) {
      await new Promise((resolve) => {
        let settled = false;
        const done = () => {
          if (settled) return;
          settled = true;
          window.removeEventListener("fl:bulletin-ready", done);
          resolve();
        };
        window.addEventListener("fl:bulletin-ready", done, { once: true });
        window.setTimeout(done, 5000);
      });
    }
    const shared = CORE.filterUpcoming(sharedMatches(), new Date());
    if (shared.length) return shared;

    const sources = ["./data/full-bulletin.json", "./data/two-day-bulletin.json"];
    for (const source of sources) {
      try {
        const data = typeof window.__flReadJsonShared === "function"
          ? await window.__flReadJsonShared(source)
          : await fetch(source, { cache: "no-cache" }).then((response) => {
            if (!response.ok) throw new Error(String(response.status));
            return response.json();
          });
        const matches = Array.isArray(data.matches) ? data.matches : Array.isArray(data.fixtures) ? data.fixtures : [];
        const upcoming = CORE.filterUpcoming(matches, new Date());
        if (upcoming.length) return upcoming;
      } catch {
        // Bir sonraki güvenli bülten kaynağı denenir.
      }
    }
    return [];
  };

  const clientId = () => {
    const key = "fl_premium_client_id";
    let id = localStorage.getItem(key);
    if (!id) {
      id = crypto?.randomUUID?.() || `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(key, id);
    }
    return id;
  };

  const fetchProIndex = async (code) => {
    const normalized = String(code || "").trim().replace(/\s+/g, "").toLocaleUpperCase("tr-TR");
    if (normalized.length < 4) throw new Error("Üyelik kodu gerekli.");
    const response = await fetch(`${SECURE_API_ORIGIN}/api/pro-analysis`, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: normalized, clientId: clientId() }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || payload.ok === false) {
      const messages = {
        membership_invalid_or_expired: "Üyelik kodu geçersiz veya süresi dolmuş.",
        too_many_attempts: "Çok fazla doğrulama denemesi yapıldı. Lütfen daha sonra tekrar dene.",
        protected_analysis_unavailable: "Korumalı analiz verisi şu anda alınamıyor.",
      };
      throw new Error(messages[payload.error] || "Korumalı analiz verisi açılamadı.");
    }
    const data = payload.data;
    if (!data || typeof data !== "object" || !Array.isArray(data.matches)) {
      throw new Error("Korumalı analiz verisi geçersiz.");
    }
    return data;
  };

  const applyProtectedPro = (proIndex) => {
    state.proMeta = proIndex;
    state.matches = CORE.filterUpcoming(CORE.mergeProAnalysis(state.bulletin, proIndex, new Date()), new Date());
    window.__flProtectedProIndex = proIndex;
    window.dispatchEvent(new CustomEvent("fl:pro-analysis-ready", { detail: { data: proIndex } }));
    updateProStatus();
    renderDates();
    renderMatches();
    return proIndex;
  };

  const refreshProtectedPro = async (code = localStorage.getItem(CODE_KEY)) => {
    if (state.proLoading) throw new Error("Korumalı analiz verisi hazırlanıyor.");
    state.proLoading = true;
    try {
      return applyProtectedPro(await fetchProIndex(code));
    } finally {
      state.proLoading = false;
    }
  };

  window.FLProAnalysisAccess = Object.freeze({ refresh: refreshProtectedPro });

  const updateProStatus = () => {
    const node = query("[data-pa3-pro-status]");
    if (!node) return;
    const matched = state.matches.filter((match) => match.pro?.available && match.pro?.fresh);
    const opinionCount = matched.filter((match) => CORE.marketKey(match.pro.recommendedMarket)
      && Number(match.pro.dataCompleteness || 0) >= 35).length;
    const couponCount = matched.filter((match) => match.pro.includeInCoupon === true).length;
    const generatedAt = Date.parse(state.proMeta?.generated_at || "");
    const time = Number.isFinite(generatedAt)
      ? new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" }).format(new Date(generatedAt))
      : "";
    node.textContent = matched.length
      ? `PRO veri: ${matched.length} maç · ${opinionCount} robot görüşü · ${couponCount} kupon adayı${time ? ` · ${time}` : ""}`
      : "PRO veri eşleşmesi bekleniyor; oran-only robot seçimi kapalı.";
    node.dataset.state = matched.length ? "ready" : "waiting";
  };

  const boot = async () => {
    if (!CORE || !root()) return;
    bind();
    updateAccessView();
    renderDates();
    renderMatches();
    const bulletin = await fetchBulletin();
    state.bulletin = bulletin;
    state.matches = CORE.filterUpcoming(CORE.mergeProAnalysis(bulletin, null, new Date()), new Date());
    state.loading = false;
    updateProStatus();
    renderDates();
    renderMatches();
    setMode("single");
    setType("robot");
    setMessage(state.matches.length
      ? "Başlamamış maçlardan birini seçerek ilerle."
      : "Güncel yaklaşan maç bulunamadı; bülten yenilendiğinde liste otomatik açılır.", state.matches.length ? "info" : "warning");

    const code = String(localStorage.getItem(CODE_KEY) || "").trim();
    if (membershipState().active && code) {
      try {
        await refreshProtectedPro(code);
        setMessage("Üyelik doğrulandı; korumalı PRO verisi hazır.", "success");
      } catch {
        clearExpiredAccess();
        updateAccessView();
      }
    }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
