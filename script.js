const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-links");
const navLinks = [...document.querySelectorAll(".nav-links a")];
const analysisList = document.querySelector("#analysis-list");
const strongestPickCard = document.querySelector("#strongest-pick-card");
const resultArchive = document.querySelector("#result-archive");
const successGrid = document.querySelector("#success-grid");
const resultsDataStatus = document.querySelector("#results-data-status");
const databaseBody = document.querySelector("#analysis-database-body");
const fixturesList = document.querySelector("#fixtures-list");
const fixtureTabs = [...document.querySelectorAll(".fixture-tab")];

const RESULTS_SUMMARY_PATH = "./data/results-summary.json";
const RESULTS_CACHE_KEY = "fl_results_performance_last_good_v2";
const RESULTS_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

let fixtures = [];
let activeFixtureDay = "today";
let hasRenderedResults = false;
let renderedResultsTimestamp = 0;
let protectedProIndex = window.__flProtectedProIndex || null;
let protectedBulletinPayload = null;

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const getTurkeyDateKey = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const addDays = (dateKey, days) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days, 12));
  return date.toISOString().slice(0, 10);
};

const fixtureDateMap = () => {
  const today = getTurkeyDateKey();
  return {
    today,
    tomorrow: addDays(today, 1),
    next: addDays(today, 2),
  };
};

const fixtureStatusLabel = (status) => {
  const labels = {
    scheduled: "Planlandı",
    live: "Canlı",
    postponed: "Ertelendi",
    cancelled: "İptal",
    finished: "Tamamlandı",
  };
  return labels[status] || status || "Planlandı";
};

const emptyBox = (message) => `<div class="fixtures-empty">${escapeHtml(message)}</div>`;

const flSharedJsonRequests = window.__flSharedJsonRequests instanceof Map
  ? window.__flSharedJsonRequests
  : new Map();
window.__flSharedJsonRequests = flSharedJsonRequests;

const readJsonShared = (path, maxAge = 15 * 1000) => {
  const key = new URL(path, window.location.href).href;
  const current = flSharedJsonRequests.get(key);
  if (current && Date.now() - current.startedAt < maxAge) return current.promise;
  const promise = fetch(path, { cache: "no-cache" }).then(async (response) => {
    if (!response.ok) throw new Error(`${path} ${response.status}`);
    return response.json();
  });
  flSharedJsonRequests.set(key, { startedAt: Date.now(), promise });
  promise.catch(() => {
    if (flSharedJsonRequests.get(key)?.promise === promise) flSharedJsonRequests.delete(key);
  });
  return promise;
};
window.__flReadJsonShared = readJsonShared;

const readJson = async (path, fallback) => {
  try {
    return await readJsonShared(path);
  } catch (error) {
    return fallback;
  }
};

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const resultsRequestPath = (path, attempt = 0) => {
  const fiveMinuteBucket = Math.floor(Date.now() / (5 * 60 * 1000));
  const separator = String(path).includes("?") ? "&" : "?";
  return `${path}${separator}fl_data=${fiveMinuteBucket}-${attempt}`;
};

const readJsonWithRetry = async (path, attempts = 3, validate = null) => {
  let lastError = null;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const payload = await readJsonShared(resultsRequestPath(path, attempt), 0);
      if (validate && !validate(payload)) throw new Error(`${path} şeması geçersiz`);
      return payload;
    } catch (error) {
      lastError = error;
      if (attempt < attempts - 1) await wait(300 * (attempt + 1));
    }
  }
  throw lastError || new Error(`${path} yüklenemedi`);
};

const hasRealProSignals = (item) => {
  if (!item || typeof item !== "object") return false;
  const signals = item.pro_signals || item.signals || item.evidence || item.layers;
  const hasSignals = Array.isArray(signals) ? signals.length > 0 : Boolean(signals);
  const hasMarket = Boolean(item.market || item.prediction || item.decision);
  const hasScore = Boolean(item.score || item.confidence || item.confidence_score);
  return hasSignals && hasMarket && hasScore;
};

const normalizeScore = (item) => item.score || item.confidence || item.confidence_score || "-";
const normalizeRisk = (item) => item.risk || item.risk_level || "-";
const normalizeMarket = (item) => item.market || item.prediction || item.decision || "-";
const normalizeTitle = (item) => item.title || item.match || "PRO analiz";

const scoreNumber = (item) => {
  const number = Number(String(normalizeScore(item)).replace("%", "").replace(",", "."));
  return Number.isFinite(number) ? number : 0;
};

const isBlockedMarket = (item) => /değerli market yok|degerli market yok|güncel maç değil|guncel mac degil|oynama|filtered_no_value|filtered_old/i.test(
  `${normalizeMarket(item)} ${item.status || ""} ${item.decision || ""}`,
);

const isCandidateItem = (item) => {
  if (!hasRealProSignals(item) || isBlockedMarket(item)) return false;
  const decision = String(item.decision || "").toLocaleLowerCase("tr-TR");
  return item.include_in_coupon || decision.includes("kupon") || decision.includes("izleme") || scoreNumber(item) >= 50;
};

const getSignalsText = (item) => {
  const signals = item.pro_signals || item.signals || item.evidence || item.layers || [];
  if (Array.isArray(signals)) return signals.join("; ");
  return String(signals || "");
};

const proAnalysisCouponCard = (item) => `
  <article class="robot-live-card">
    <h3>${escapeHtml(normalizeTitle(item))}</h3>
    <div class="robot-row"><span>Seçenek</span><strong>${escapeHtml(normalizeMarket(item))}</strong></div>
    <div class="robot-row"><span>Model gücü</span><strong>${escapeHtml(normalizeScore(item))}</strong></div>
    <div class="robot-row"><span>Risk</span><strong>${escapeHtml(normalizeRisk(item))}</strong></div>
    <div class="robot-row"><span>Durum</span><strong>${escapeHtml(item.status || "takipte")}</strong></div>
    <p class="robot-note">Bu kart yalnızca PRO robotun ürettiği veri katmanları varsa gösterilir.</p>
  </article>
`;

const analysisCommentCard = (item, index) => `
  <article class="analysis-card reveal visible">
    <div class="meta-row"><span>PRO Robot #${index + 1}</span><span>${escapeHtml(item.status || "takipte")}</span></div>
    <h3>${escapeHtml(normalizeTitle(item))}</h3>
    <p>${escapeHtml(item.commentary || item.comment || item.analysis_note || "PRO robot yorumu bekleniyor.")}</p>
    <div class="robot-row"><span>Seçenek</span><strong>${escapeHtml(normalizeMarket(item))}</strong></div>
    <div class="robot-row"><span>Model gücü / Risk</span><strong>${escapeHtml(normalizeScore(item))} / ${escapeHtml(normalizeRisk(item))}</strong></div>
    <p class="robot-note">Veri dayanağı: ${escapeHtml(getSignalsText(item) || "PRO veri katmanları bekleniyor")}</p>
  </article>
`;

const protectedMatchTimestamp = (item) => {
  const date = String(item?.date || "").slice(0, 10);
  const time = String(item?.time || "").slice(0, 5);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return Number.NaN;
  return Date.parse(`${date}T${time}:00+03:00`);
};

const normalizeProtectedProMatch = (item) => {
  const signals = Array.isArray(item?.signals) ? item.signals.filter(Boolean).map(String) : [];
  const title = [item?.home, item?.away].filter(Boolean).join(" – ") || "PRO analiz";
  const commentary = signals.find((signal) => !/^(market|oran):/i.test(signal))
    || `${title} karşılaşması için korumalı PRO veri katmanları değerlendirildi.`;
  const status = item?.include_in_coupon === true
    ? "Kupona uygun"
    : String(item?.value_label || "İzleme");
  return {
    ...item,
    title,
    match: title,
    market: item?.recommended_market || "-",
    score: item?.model_score,
    risk: item?.risk_level || item?.data_gap_risk || "Belirsiz",
    status,
    decision: item?.include_in_coupon === true ? "Kupon Adayı" : "İzleme",
    commentary,
    pro_signals: signals,
  };
};

const protectedItemsFromIndex = (payload, now = Date.now()) => {
  const rawNow = Number(now);
  const nowMs = Number.isFinite(rawNow) ? rawNow : Date.now();
  return (Array.isArray(payload?.matches) ? payload.matches : [])
    .filter((item) => {
      const timestamp = protectedMatchTimestamp(item);
      return !Number.isFinite(timestamp) || timestamp > nowMs;
    })
    .map(normalizeProtectedProMatch)
    .filter(hasRealProSignals)
    .sort((left, right) => {
      const couponOrder = Number(right.include_in_coupon === true) - Number(left.include_in_coupon === true);
      return couponOrder || scoreNumber(right) - scoreNumber(left);
    });
};

window.__flProtectedAnalysisCenter = Object.freeze({ itemsFromIndex: protectedItemsFromIndex });

const resultOutcome = (value) => {
  const status = String(value || "").toLocaleLowerCase("tr-TR");
  if (["won", "kazandı", "kazandi", "doğru", "dogru"].includes(status)) return { key: "won", label: "Doğru" };
  if (["lost", "kaybetti", "yanlış", "yanlis"].includes(status)) return { key: "lost", label: "Yanlış" };
  if (["void", "iptal", "iade"].includes(status)) return { key: "pending", label: "İade" };
  return { key: "pending", label: "Bekliyor" };
};

const resultDateLabel = (value) => {
  const [year, month, day] = String(value || "").slice(0, 10).split("-");
  return year && month && day ? `${day}.${month}.${year}` : "-";
};

const normalizeCompletedResult = (item) => {
  const outcome = resultOutcome(item?.status || item?.result);
  return {
    date: item?.date || "",
    match: item?.match || item?.title || item?.match_name || "Maç",
    prediction: item?.prediction || item?.market || "-",
    odds: item?.odds || item?.estimated_odds || "-",
    score: item?.result_score || item?.score || item?.final_score || "-",
    confidence: item?.confidence || item?.confidence_score || "-",
    outcome,
  };
};

const performanceFromPayload = (payload) => {
  const completed = (Array.isArray(payload?.completed_items) ? payload.completed_items : []).map(normalizeCompletedResult);
  const fallbackWon = completed.filter((item) => item.outcome.key === "won").length;
  const fallbackLost = completed.filter((item) => item.outcome.key === "lost").length;
  const source = payload?.performance || {};
  const won = Number(source.won_count ?? fallbackWon) || 0;
  const lost = Number(source.lost_count ?? fallbackLost) || 0;
  const measured = Number(source.measured_count ?? (won + lost)) || 0;
  const pending = Number(source.pending_count ?? 0) || 0;
  const predictionCount = Number(source.prediction_count ?? (measured + pending)) || 0;
  const rateValue = source.success_rate === null || source.success_rate === undefined
    ? (measured ? Math.round((won / measured) * 100) : null)
    : Number(source.success_rate);
  return {
    predictionCount,
    measured,
    pending,
    won,
    lost,
    successRate: Number.isFinite(rateValue) ? Math.max(0, Math.min(100, Math.round(rateValue))) : null,
    groups: Array.isArray(source.groups) ? source.groups : [],
  };
};

const performanceCards = (payload) => {
  const summary = performanceFromPayload(payload);
  const overall = {
    value: summary.successRate === null ? "—" : summary.successRate,
    unit: summary.successRate === null ? "" : "%",
    label: "Genel başarı",
    detail: summary.measured ? `${summary.won} doğru · ${summary.lost} yanlış` : "Sonuç doğrulanınca hesaplanır",
    rate: summary.successRate,
    state: summary.measured ? "measured" : "waiting",
  };
  if (!summary.measured) {
    return [
      overall,
      { value: summary.predictionCount, unit: "", label: "Kaydedilen tahmin", detail: "Ölçüm havuzundaki toplam kayıt", rate: null, state: "neutral" },
      { value: summary.pending, unit: "", label: "Skor bekleyen", detail: "Final skor kaynağıyla eşleşecek", rate: null, state: "waiting" },
      { value: 0, unit: "", label: "Doğrulanan", detail: "Sahte yüzde gösterilmez", rate: null, state: "neutral" },
    ];
  }

  const groupCards = summary.groups.slice(0, 3).map((group) => ({
    value: Number(group.success_rate) || 0,
    unit: "%",
    label: group.label || "Tahmin grubu",
    detail: `${Number(group.won) || 0} doğru · ${Number(group.lost) || 0} yanlış`,
    rate: Number(group.success_rate) || 0,
    state: "measured",
  }));
  const fallbacks = [
    { value: summary.won, unit: "", label: "Doğru tahmin", detail: `${summary.measured} ölçüm içinde`, rate: null, state: "measured" },
    { value: summary.lost, unit: "", label: "Yanlış tahmin", detail: `${summary.measured} ölçüm içinde`, rate: null, state: "measured" },
    { value: summary.pending, unit: "", label: "Skor bekleyen", detail: "Henüz başarı oranına dahil değil", rate: null, state: "waiting" },
  ];
  return [overall, ...groupCards, ...fallbacks].slice(0, 4);
};

const resultArchiveRow = (raw) => {
  const item = normalizeCompletedResult(raw);
  return `<tr>
    <td>${escapeHtml(resultDateLabel(item.date))}</td>
    <td>${escapeHtml(item.match)}</td>
    <td>${escapeHtml(item.prediction)}</td>
    <td>${escapeHtml(item.odds)}</td>
    <td><strong class="result-score">${escapeHtml(item.score)}</strong></td>
    <td>${escapeHtml(item.confidence)}</td>
    <td><span class="status ${item.outcome.key}">${escapeHtml(item.outcome.label)}</span></td>
  </tr>`;
};

const performanceCard = (card) => {
  const width = Number.isFinite(card.rate) ? Math.max(0, Math.min(100, card.rate)) : 0;
  return `<article class="success-card reveal visible" data-state="${escapeHtml(card.state)}">
    <strong data-unit="${escapeHtml(card.unit)}">${escapeHtml(card.value)}</strong>
    <span>${escapeHtml(card.label)}</span>
    <small>${escapeHtml(card.detail)}</small>
    ${Number.isFinite(card.rate) ? `<div class="performance-bar" aria-hidden="true"><i style="width:${width}%"></i></div>` : ""}
  </article>`;
};

const renderResultsAndPerformance = (payload) => {
  const completed = Array.isArray(payload?.completed_items) ? payload.completed_items : [];
  const performance = performanceFromPayload(payload);
  if (resultArchive) {
    resultArchive.innerHTML = completed.length
      ? completed.slice(0, 30).map(resultArchiveRow).join("")
      : `<tr><td class="result-empty-cell" colspan="7"><div class="result-empty-state"><strong>Henüz doğrulanmış sonuç yok</strong><span>${escapeHtml(performance.pending)} tahmin final skorla eşleşmeyi bekliyor. Sonuç gelmeden başarı yüzdesi üretilmez.</span></div></td></tr>`;
  }
  if (successGrid) successGrid.innerHTML = performanceCards(payload).map(performanceCard).join("");
};

const hasResultsPayload = (payload) => Boolean(
  payload
  && typeof payload === "object"
  && payload.generated_at
  && Array.isArray(payload.completed_items)
  && payload.performance
  && typeof payload.performance === "object",
);

const compactResultsPayload = (payload) => ({
  generated_at: payload.generated_at,
  date: payload.date || "",
  timezone: payload.timezone || "Europe/Istanbul",
  source: payload.source || "Doğrulanmış sonuç akışı",
  completed_items: payload.completed_items.slice(0, 30),
  performance: payload.performance,
});

const resultsTimestamp = (payload) => {
  const value = Date.parse(payload?.generated_at || "");
  return Number.isFinite(value) ? value : 0;
};

const resultsUpdatedLabel = (payload) => {
  const timestamp = resultsTimestamp(payload);
  if (!timestamp) return "Güncel doğrulanmış sonuçlar gösteriliyor.";
  return `Son güncelleme: ${new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp))}`;
};

const setResultsDataStatus = (message, state = "loading") => {
  if (!resultsDataStatus) return;
  resultsDataStatus.textContent = message;
  resultsDataStatus.dataset.state = state;
};

const readCachedResults = () => {
  try {
    if (!window.localStorage) return null;
    const cached = JSON.parse(window.localStorage.getItem(RESULTS_CACHE_KEY) || "null");
    if (!cached || Date.now() - Number(cached.saved_at || 0) > RESULTS_CACHE_MAX_AGE) return null;
    return hasResultsPayload(cached.payload) ? cached.payload : null;
  } catch (error) {
    return null;
  }
};

const writeCachedResults = (payload) => {
  try {
    if (!window.localStorage) return;
    window.localStorage.setItem(RESULTS_CACHE_KEY, JSON.stringify({
      saved_at: Date.now(),
      payload: compactResultsPayload(payload),
    }));
  } catch (error) {
    // Depolama kapalıysa canlı veri yine normal biçimde gösterilir.
  }
};

const applyResultsPayload = (payload, source = "network") => {
  if (!hasResultsPayload(payload)) return false;
  const compact = compactResultsPayload(payload);
  const timestamp = resultsTimestamp(compact);
  if (hasRenderedResults && timestamp && timestamp < renderedResultsTimestamp) return true;
  renderResultsAndPerformance(compact);
  hasRenderedResults = true;
  renderedResultsTimestamp = Math.max(renderedResultsTimestamp, timestamp);
  if (source === "network") {
    writeCachedResults(compact);
    setResultsDataStatus(resultsUpdatedLabel(compact), "current");
  } else {
    setResultsDataStatus("Bağlantı yenileniyor; son doğrulanmış kayıtlar gösteriliyor.", "cached");
  }
  return true;
};

const renderResultsLoadingState = () => {
  if (resultArchive) {
    resultArchive.innerHTML = `<tr><td class="result-empty-cell" colspan="7"><div class="result-empty-state"><strong>Sonuçlar yükleniyor</strong><span>Son doğrulanmış skorlar getiriliyor.</span></div></td></tr>`;
  }
  if (successGrid) {
    successGrid.innerHTML = `<article class="success-card reveal visible" data-state="loading"><strong data-unit="">—</strong><span>Performans yükleniyor</span><small>Doğrulanmış ölçümler getiriliyor</small></article>`;
  }
  setResultsDataStatus("Doğrulanmış sonuçlar yükleniyor.", "loading");
};

const renderResultsUnavailableState = () => {
  if (resultArchive) {
    resultArchive.innerHTML = `<tr><td class="result-empty-cell" colspan="7"><div class="result-empty-state"><strong>Sonuç verisi yenilenemedi</strong><span>Sıfır değer gösterilmedi; bağlantı düzeldiğinde kayıtlar otomatik olarak geri gelir.</span></div></td></tr>`;
  }
  if (successGrid) {
    successGrid.innerHTML = `<article class="success-card reveal visible" data-state="waiting"><strong data-unit="">—</strong><span>Ölçüm korunuyor</span><small>Yanlış bir %0 değeri gösterilmiyor</small></article>`;
  }
  setResultsDataStatus("Veri bağlantısı geçici olarak yenilenemedi.", "error");
};

const loadResultsAndPerformance = async () => {
  try {
    const payload = await readJsonWithRetry(RESULTS_SUMMARY_PATH, 3, hasResultsPayload);
    applyResultsPayload(payload, "network");
    return true;
  } catch (error) {
    return false;
  }
};

const bulletinMatchCount = (payload) => {
  const directCount = Number(payload?.match_count ?? payload?.counts?.total ?? 0);
  if (Number.isFinite(directCount) && directCount > 0) return directCount;
  return Array.isArray(payload?.matches) ? payload.matches.length : 0;
};

const setSummary = (activeItems, source = "PRO analiz bekleniyor", bulletinPayload = null) => {
  const activeSource = document.querySelector("[data-active-source]");
  const predictionCount = document.querySelector("[data-prediction-count]");
  const matchCountEl = document.querySelector("[data-match-count]");
  const todayCount = document.querySelector("#today-count");
  const avgConfidence = document.querySelector("#avg-confidence");
  const topMarket = document.querySelector("#top-market");
  const matchCount = bulletinMatchCount(bulletinPayload);
  const hasBulletin = matchCount > 0;
  const effectiveSource = hasBulletin ? (bulletinPayload?.source || source || "Güncel bülten") : source;

  if (predictionCount) predictionCount.textContent = String(activeItems.length);
  if (activeSource) activeSource.textContent = effectiveSource;
  if (matchCountEl) matchCountEl.textContent = hasBulletin ? String(matchCount) : "-";
  if (todayCount) todayCount.textContent = hasBulletin ? `${matchCount} maç` : "Hazırlanıyor";
  if (avgConfidence) avgConfidence.textContent = activeItems.length ? "PRO analiz geldi" : (hasBulletin ? "Veri geldi" : "Veri bekleniyor");
  if (topMarket) topMarket.textContent = activeItems.length ? "Günün seçimi hazırlanıyor" : (hasBulletin ? "Analiz bekleniyor" : "Günün seçimi hazırlanıyor");

  document.querySelectorAll("[data-load-status]").forEach((item) => {
    item.textContent = activeItems.length ? "PRO robot analizi" : (hasBulletin ? "Güncel veri geldi" : "PRO analiz bekleniyor");
  });
};

const renderProAnalysisCenter = (payload, bulletinPayload = null) => {
  const visibleItems = (Array.isArray(payload?.active_items) ? payload.active_items : []).filter(hasRealProSignals);
  const candidateItems = visibleItems.filter(isCandidateItem);

  if (analysisList) {
    analysisList.innerHTML = visibleItems.length
      ? visibleItems.slice(0, 12).map(analysisCommentCard).join("")
      : emptyBox("Maç listesi geldi; maç bazlı PRO analiz çıktısı bekleniyor.");
  }

  if (strongestPickCard) {
    strongestPickCard.innerHTML = candidateItems[0]
      ? proAnalysisCouponCard(candidateItems[0])
      : emptyBox(visibleItems.length
        ? `${visibleItems.length} robot kaydı geldi ancak kupon/izleme eşiğini geçen güçlü aday yok.`
        : "Maç listesi geldi; günün seçimi PRO analiz çıktısı oluşunca gösterilecek.");
  }

  setSummary(visibleItems, payload?.source || "PRO analiz bekleniyor", bulletinPayload);
};

const loadProAnalysisCenter = async () => {
  const bulletinPayload = await readJson("./data/full-bulletin.json", {
    source: "Güncel bülten bekleniyor",
    match_count: 0,
    matches: [],
  });
  protectedBulletinPayload = bulletinPayload;
  if (protectedProIndex) {
    renderProtectedProAnalysisCenter(protectedProIndex);
    return;
  }
  setSummary([], bulletinPayload?.source || "Güncel bülten", bulletinPayload);
  if (analysisList) analysisList.innerHTML = emptyBox("Maç bazlı PRO değerlendirmeler üyelik doğrulamasından sonra Özel Analiz alanında açılır.");
  if (strongestPickCard) strongestPickCard.innerHTML = emptyBox("Korumalı günün seçimi için Özel Analiz alanında üyelik kodunu doğrula.");
};

const renderProtectedProAnalysisCenter = (payload) => {
  protectedProIndex = payload && typeof payload === "object" ? payload : null;
  if (!protectedProIndex) return;
  const activeItems = protectedItemsFromIndex(protectedProIndex);
  if (!activeItems.length) {
    if (analysisList) analysisList.innerHTML = emptyBox("Korumalı PRO veri açıldı; henüz başlamamış maç bulunamadı.");
    if (strongestPickCard) strongestPickCard.innerHTML = emptyBox("Korumalı PRO veri açıldı; günün seçimi için başlamamış maç bekleniyor.");
    setSummary([], protectedProIndex.source || "Korumalı PRO veri açık", protectedBulletinPayload);
    return;
  }
  renderProAnalysisCenter({
    active_items: activeItems,
    source: protectedProIndex.source || "Korumalı PRO veri",
  }, protectedBulletinPayload);
};

const clearProtectedProAnalysisCenter = () => {
  protectedProIndex = null;
  if (analysisList) analysisList.innerHTML = emptyBox("Maç bazlı PRO değerlendirmeler üyelik doğrulamasından sonra Özel Analiz alanında açılır.");
  if (strongestPickCard) strongestPickCard.innerHTML = emptyBox("Korumalı günün seçimi için Özel Analiz alanında üyelik kodunu doğrula.");
  setSummary([], protectedBulletinPayload?.source || "PRO analiz bekleniyor", protectedBulletinPayload);
};

window.addEventListener?.("fl:pro-analysis-ready", (event) => renderProtectedProAnalysisCenter(event.detail?.data));
window.addEventListener?.("fl:pro-analysis-cleared", clearProtectedProAnalysisCenter);

const renderFixtures = () => {
  if (!fixturesList || fixturesList.classList.contains("fixtures-summary-mode")) return;
  const dateKey = fixtureDateMap()[activeFixtureDay];
  const dailyFixtures = fixtures
    .filter((fixture) => fixture.date === dateKey)
    .sort((a, b) => `${a.time || ""}`.localeCompare(`${b.time || ""}`));

  if (dailyFixtures.length === 0) {
    fixturesList.innerHTML = emptyBox("Canlı veri bekleniyor. Günlük robot akışı çalıştığında bugünün maçları otomatik görünecek.");
    return;
  }

  fixturesList.innerHTML = dailyFixtures
    .map(
      (fixture) => `
        <article class="fixture-card">
          <time datetime="${escapeHtml(`${fixture.date}T${fixture.time || "00:00"}`)}">${escapeHtml(fixture.time || "--:--")}</time>
          <div class="fixture-league">${escapeHtml(fixture.league)}</div>
          <div class="fixture-teams">
            <div class="fixture-team"><span>Ev sahibi</span><b>${escapeHtml(fixture.home)}</b></div>
            <div class="fixture-team"><span>Deplasman</span><b>${escapeHtml(fixture.away)}</b></div>
          </div>
          <span class="status pending fixture-status">${escapeHtml(fixtureStatusLabel(fixture.status))}</span>
        </article>
      `,
    )
    .join("");
};

const loadFixtures = async () => {
  fixtures = await readJson("./data/fixtures.json", []);
  if (!Array.isArray(fixtures)) fixtures = [];
};

const renderStaticEmptySections = () => {
  if (analysisList) analysisList.innerHTML = emptyBox("Maç bazlı PRO değerlendirmeler üyelik doğrulamasından sonra Özel Analiz alanında açılır.");
  if (strongestPickCard) strongestPickCard.innerHTML = emptyBox("Korumalı günün seçimi için Özel Analiz alanında üyelik kodunu doğrula.");
  if (databaseBody) databaseBody.innerHTML = `<tr><td colspan="10">Canlı veri görünümü bekleniyor. Eski sabit maç kayıtları gösterilmez.</td></tr>`;
  setSummary([], "PRO analiz bekleniyor");
};

window.__flResultsPerformance = {
  normalizeCompletedResult,
  performanceCards,
  performanceFromPayload,
  resultOutcome,
  compactResultsPayload,
  hasResultsPayload,
};

const setupObservers = () => {
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );

    document.querySelectorAll(".reveal").forEach((item) => revealObserver.observe(item));
  } else {
    document.querySelectorAll(".reveal").forEach((item) => item.classList.add("visible"));
  }
};

const init = async () => {
  renderStaticEmptySections();
  const cachedResults = readCachedResults();
  if (cachedResults) applyResultsPayload(cachedResults, "cache");
  else renderResultsLoadingState();

  const tasks = [loadProAnalysisCenter(), loadResultsAndPerformance()];
  if (fixturesList) tasks.push(loadFixtures());
  await Promise.all(tasks);
  if (!hasRenderedResults) renderResultsUnavailableState();
  setupObservers();
};

fixtureTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    activeFixtureDay = tab.dataset.fixtureDay;
    fixtureTabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });
    renderFixtures();
  });
});

init();
