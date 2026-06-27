const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav-links");
const navLinks = [...document.querySelectorAll(".nav-links a")];
const analysisList = document.querySelector("#analysis-list");
const strongestPickCard = document.querySelector("#strongest-pick-card");
const resultArchive = document.querySelector("#result-archive");
const successGrid = document.querySelector("#success-grid");
const databaseBody = document.querySelector("#analysis-database-body");
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
      ? visibleItems.map(analysisCommentCard).join("")
      : emptyBox("Maç listesi geldi; maç bazlı PRO analiz çıktısı bekleniyor.");
  }

  if (strongestPickCard) {
    strongestPickCard.innerHTML = candidateItems[0]
      ? couponCard(candidateItems[0])
      : emptyBox(visibleItems.length
        ? `${visibleItems.length} robot kaydı geldi ancak kupon/izleme eşiğini geçen güçlü aday yok.`
        : "Maç listesi geldi; günün seçimi PRO analiz çıktısı oluşunca gösterilecek.");
  }

  setSummary(visibleItems, payload?.source || "PRO analiz bekleniyor", bulletinPayload);
};

const loadProAnalysisCenter = async () => {
  const [payload, bulletinPayload] = await Promise.all([
    readJson("./data/analiz_sonuclari.json", {
      source: "PRO analiz bekleniyor",
      active_items: [],
      completed_items: [],
    }),
    readJson("./data/full-bulletin.json", {
      source: "Güncel bülten bekleniyor",
      match_count: 0,
      matches: [],
    }),
  ]);
  renderProAnalysisCenter(payload, bulletinPayload);
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

const renderStaticEmptySections = () => {
  if (analysisList) analysisList.innerHTML = emptyBox("Maç bazlı PRO analiz bekleniyor. Eski sabit/uydurma veriler gösterilmez.");
  if (strongestPickCard) strongestPickCard.innerHTML = emptyBox("Günün seçimi gerçek PRO analiz geldikten sonra otomatik üretilecek.");
  if (resultArchive) resultArchive.innerHTML = `<tr><td colspan="7">Canlı sonuç arşivi bekleniyor.</td></tr>`;
  if (successGrid) successGrid.innerHTML = `<article class="success-card reveal visible"><strong data-count="0">0</strong><span>Canlı performans bekleniyor</span><div class="spark"></div></article>`;
  if (databaseBody) databaseBody.innerHTML = `<tr><td colspan="10">Canlı veri görünümü bekleniyor. Eski sabit maç kayıtları gösterilmez.</td></tr>`;
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

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav?.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

menuButton?.addEventListener("click", () => {
  const open = nav?.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
