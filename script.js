const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-links");
const navLinks = [...document.querySelectorAll(".nav-links a")];
const analysisList = document.querySelector("#analysis-list");
const strongestPickCard = document.querySelector("#strongest-pick-card");
const resultArchive = document.querySelector("#result-archive");
const successGrid = document.querySelector("#success-grid");
const databaseBody = document.querySelector("#analysis-database-body");
const sporTotoGrid = document.querySelector("#spor-toto-grid");
const sporTotoSummary = document.querySelector("#spor-toto-summary");
const fixturesList = document.querySelector("#fixtures-list");
const fixtureTabs = [...document.querySelectorAll(".fixture-tab")];

let fixtures = [];
let activeFixtureDay = "today";

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
const emptyCard = (message) => `<article class="robot-live-card">${escapeHtml(message)}</article>`;

const readJson = async (path, fallback) => {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${path} ${response.status}`);
    return await response.json();
  } catch (error) {
    return fallback;
  }
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

const getSignalsText = (item) => {
  const signals = item.pro_signals || item.signals || item.evidence || item.layers || [];
  if (Array.isArray(signals)) return signals.join("; ");
  return String(signals || "");
};

const couponCard = (item) => `
  <article class="robot-live-card">
    <h3>${escapeHtml(normalizeTitle(item))}</h3>
    <div class="robot-row"><span>Seçenek</span><strong>${escapeHtml(normalizeMarket(item))}</strong></div>
    <div class="robot-row"><span>PRO güveni</span><strong>${escapeHtml(normalizeScore(item))}</strong></div>
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
    <div class="robot-row"><span>Güven / Risk</span><strong>${escapeHtml(normalizeScore(item))} / ${escapeHtml(normalizeRisk(item))}</strong></div>
    <p class="robot-note">Veri dayanağı: ${escapeHtml(getSignalsText(item) || "PRO veri katmanları bekleniyor")}</p>
  </article>
`;

const ensureCompletedCouponArea = () => {
  const hub = document.querySelector("#robot-analizleri");
  if (!hub || document.querySelector("[data-completed-coupons]")) return;
  const panel = document.createElement("div");
  panel.className = "robot-stack reveal visible";
  panel.innerHTML = `
    <div class="section-heading">
      <p class="eyebrow">Tamamlanan Analizler</p>
      <h2>Kazandı / Kaybetti Takibi</h2>
      <p>Sonuç verisi geldiğinde tamamlanan PRO analizler burada ayrı listelenir.</p>
    </div>
    <div class="robot-stack" data-completed-coupons>
      ${emptyCard("Tamamlanan PRO analiz bekleniyor.")}
    </div>
  `;
  hub.insertBefore(panel, hub.querySelector(".robot-disclaimer"));
};

const setSummary = (activeItems, source = "PRO analiz bekleniyor") => {
  const todayCount = document.querySelector("#today-count");
  const avgConfidence = document.querySelector("#avg-confidence");
  const activeSource = document.querySelector("[data-active-source]");
  const predictionCount = document.querySelector("[data-prediction-count]");

  if (todayCount) todayCount.textContent = String(activeItems.length);
  if (predictionCount) predictionCount.textContent = String(activeItems.length);
  if (activeSource) activeSource.textContent = source;

  const numericScores = activeItems
    .map((item) => Number(String(normalizeScore(item)).replace("%", "")))
    .filter(Number.isFinite);
  const avg = numericScores.length ? Math.round(numericScores.reduce((sum, score) => sum + score, 0) / numericScores.length) : 0;

  if (avgConfidence) avgConfidence.textContent = avg ? `${avg}%` : "-";

  document.querySelectorAll("[data-load-status]").forEach((item) => {
    item.textContent = activeItems.length ? "PRO robot analizi" : "PRO analiz bekleniyor";
  });
};

const groupByType = (items) => ({
  single: items.filter((item) => String(item.type || "").toLowerCase().includes("tek") || String(item.type || "").toLowerCase().includes("single")),
  double: items.filter((item) => String(item.type || "").includes("2") || String(item.type || "").toLowerCase().includes("double")),
  triple: items.filter((item) => String(item.type || "").includes("3") || String(item.type || "").toLowerCase().includes("triple")),
});

const renderProAnalysisCenter = (payload) => {
  ensureCompletedCouponArea();

  const activeItems = (Array.isArray(payload?.active_items) ? payload.active_items : []).filter(hasRealProSignals);
  const completedItems = (Array.isArray(payload?.completed_items) ? payload.completed_items : []).filter(hasRealProSignals);
  const grouped = groupByType(activeItems);

  const singleBox = document.querySelector("[data-coupons-single]");
  const doubleBox = document.querySelector("[data-coupons-double]");
  const tripleBox = document.querySelector("[data-coupons-triple]");
  const completedBox = document.querySelector("[data-completed-coupons]");

  if (singleBox) singleBox.innerHTML = grouped.single.length ? grouped.single.map(couponCard).join("") : emptyCard("PRO robot tekli analiz verisi bekleniyor. Yüzeysel/uydurma analiz gösterilmez.");
  if (doubleBox) doubleBox.innerHTML = grouped.double.length ? grouped.double.map(couponCard).join("") : emptyCard("PRO robot 2'li analiz verisi bekleniyor. Yüzeysel/uydurma analiz gösterilmez.");
  if (tripleBox) tripleBox.innerHTML = grouped.triple.length ? grouped.triple.map(couponCard).join("") : emptyCard("PRO robot 3'lü analiz verisi bekleniyor. Yüzeysel/uydurma analiz gösterilmez.");
  if (completedBox) completedBox.innerHTML = completedItems.length ? completedItems.map(couponCard).join("") : emptyCard("Tamamlanan PRO analiz bekleniyor. Sonuç verisi gelince kazandı/kaybetti burada gösterilecek.");

  if (analysisList) {
    analysisList.innerHTML = activeItems.length
      ? activeItems.map(analysisCommentCard).join("")
      : emptyBox("Maç yorumları için PRO robot analizi bekleniyor. Form, istatistik, oran, haber/durum veya robot katmanı olmadan yorum üretilmez.");
  }

  if (strongestPickCard) {
    strongestPickCard.innerHTML = activeItems[0]
      ? couponCard(activeItems[0])
      : emptyBox("Günün seçimi yalnızca gerçek PRO analiz çıktısı geldikten sonra gösterilecek.");
  }

  setSummary(activeItems, payload?.source || "PRO analiz bekleniyor");
};

const loadProAnalysisCenter = async () => {
  const payload = await readJson("./data/analiz_sonuclari.json", {
    source: "PRO analiz bekleniyor",
    active_items: [],
    completed_items: [],
  });
  renderProAnalysisCenter(payload);
};

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

const renderSporToto = () => {
  // Spor Toto alanı artık yalnızca spor-toto-dashboard.js tarafından yönetilir.
};

const loadSporToto = async () => {
  // Eski Spor Toto kart renderı devre dışı. Yeni dashboard ayrı modülden yüklenir.
};

const renderStaticEmptySections = () => {
  if (analysisList) analysisList.innerHTML = emptyBox("Maç bazlı PRO analiz bekleniyor. Eski sabit/uydurma veriler gösterilmez.");
  if (strongestPickCard) strongestPickCard.innerHTML = emptyBox("Günün seçimi gerçek PRO analiz geldikten sonra otomatik üretilecek.");
  if (resultArchive) resultArchive.innerHTML = `<tr><td colspan="7">Canlı sonuç arşivi bekleniyor.</td></tr>`;
  if (successGrid) successGrid.innerHTML = `<article class="success-card reveal visible"><strong data-count="0">0</strong><span>Canlı performans bekleniyor</span><div class="spark"></div></article>`;
  if (databaseBody) databaseBody.innerHTML = `<tr><td colspan="10">Canlı veri görünümü bekleniyor. Eski sabit maç kayıtları gösterilmez.</td></tr>`;
  ensureCompletedCouponArea();
  setSummary([], "PRO analiz bekleniyor");
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
  await Promise.all([loadFixtures(), loadProAnalysisCenter()]);
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
