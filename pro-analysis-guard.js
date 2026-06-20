const proAnalysisPaths = {
  history: "./data/analiz_sonuclari.json",
};

const proEscape = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const proEmptyCard = (message) => `<article class="robot-live-card">${proEscape(message)}</article>`;

async function proReadJson(path, fallback) {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${response.status}`);
    return await response.json();
  } catch (error) {
    return fallback;
  }
}

const hasRealProSignals = (item) => {
  if (!item || typeof item !== "object") return false;
  const signals = item.pro_signals || item.signals || item.evidence || item.layers;
  const hasSelection = Boolean(item.selection || item.option || item.market || item.prediction || item.decision);
  const hasScore = Boolean(item.score || item.confidence || item.confidence_score);
  return Boolean(hasSelection && hasScore && signals);
};

const proSelection = (item) => item.selection || item.option || item.market || item.prediction || item.decision || "-";

const renderCoupon = (item) => `
  <article class="robot-live-card">
    <h3>${proEscape(item.title || item.match || "PRO analiz")}</h3>
    <div class="robot-row"><span>Seçenek</span><strong>${proEscape(proSelection(item))}</strong></div>
    <div class="robot-row"><span>Güven</span><strong>${proEscape(item.score || item.confidence || item.confidence_score || "-")}</strong></div>
    <div class="robot-row"><span>Risk</span><strong>${proEscape(item.risk || item.risk_level || "-")}</strong></div>
    <div class="robot-row"><span>Durum</span><strong>${proEscape(item.status || "takipte")}</strong></div>
    <p class="robot-note">Bu kart yalnızca PRO robotun ürettiği veri katmanları varsa gösterilir.</p>
  </article>
`;

const renderComment = (item, index) => {
  const signals = item.pro_signals || item.signals || item.evidence || item.layers || [];
  const signalText = Array.isArray(signals) ? signals.join("; ") : String(signals);
  const comment = item.commentary || item.comment || item.analysis_note || "PRO robot yorumu bekleniyor.";
  return `
    <article class="analysis-card reveal visible">
      <div class="meta-row"><span>PRO Robot #${index + 1}</span><span>${proEscape(item.status || "takipte")}</span></div>
      <h3>${proEscape(item.title || item.match || "Maç analizi")}</h3>
      <p>${proEscape(comment)}</p>
      <div class="robot-row"><span>Seçenek</span><strong>${proEscape(proSelection(item))}</strong></div>
      <div class="robot-row"><span>Güven / Risk</span><strong>${proEscape(item.score || item.confidence || item.confidence_score || "-")} / ${proEscape(item.risk || item.risk_level || "-")}</strong></div>
      <p class="robot-note">Veri dayanağı: ${proEscape(signalText || "PRO veri katmanları bekleniyor")}</p>
    </article>
  `;
};

function groupByType(items) {
  return {
    single: items.filter((item) => String(item.type || "").toLowerCase().includes("tek") || String(item.type || "").toLowerCase().includes("single")),
    double: items.filter((item) => String(item.type || "").includes("2") || String(item.type || "").toLowerCase().includes("double")),
    triple: items.filter((item) => String(item.type || "").includes("3") || String(item.type || "").toLowerCase().includes("triple")),
  };
}

const isWaitingContent = (element) => {
  if (!element) return false;
  const text = String(element.textContent || "").toLowerCase();
  return !text.trim() || text.includes("bekleniyor") || text.includes("hazırlanıyor") || text.includes("yüzeysel");
};

const fillOnlyIfWaiting = (element, html) => {
  if (!element || !isWaitingContent(element)) return;
  element.innerHTML = html;
};

async function applyProAnalysisGuard() {
  const data = await proReadJson(proAnalysisPaths.history, { active_items: [], completed_items: [] });
  const activeItems = Array.isArray(data.active_items) ? data.active_items.filter(hasRealProSignals) : [];
  const completedItems = Array.isArray(data.completed_items) ? data.completed_items.filter(hasRealProSignals) : [];
  const grouped = groupByType(activeItems);

  const singleBox = document.querySelector("[data-coupons-single]");
  const doubleBox = document.querySelector("[data-coupons-double]");
  const tripleBox = document.querySelector("[data-coupons-triple]");
  const commentsBox = document.querySelector("#analysis-list");
  const completedBox = document.querySelector("[data-completed-coupons]");

  fillOnlyIfWaiting(singleBox, grouped.single.length ? grouped.single.map(renderCoupon).join("") : proEmptyCard("PRO robot tekli analiz verisi bekleniyor. Yüzeysel/uydurma analiz gösterilmez."));
  fillOnlyIfWaiting(doubleBox, grouped.double.length ? grouped.double.map(renderCoupon).join("") : proEmptyCard("PRO robot 2'li analiz verisi bekleniyor. Yüzeysel/uydurma analiz gösterilmez."));
  fillOnlyIfWaiting(tripleBox, grouped.triple.length ? grouped.triple.map(renderCoupon).join("") : proEmptyCard("PRO robot 3'lü analiz verisi bekleniyor. Yüzeysel/uydurma analiz gösterilmez."));

  fillOnlyIfWaiting(
    commentsBox,
    activeItems.length
      ? activeItems.map(renderComment).join("")
      : `<div class="fixtures-empty">Maç yorumları için PRO robot analizi bekleniyor. Form, istatistik, oran, haber/durum veya robot katmanı olmadan yorum üretilmez.</div>`,
  );

  fillOnlyIfWaiting(
    completedBox,
    completedItems.length
      ? completedItems.map(renderCoupon).join("")
      : proEmptyCard("Tamamlanan PRO analiz bekleniyor. Sonuç verisi gelince kazandı/kaybetti burada gösterilecek."),
  );

  if (activeItems.length) {
    document.querySelectorAll("[data-load-status]").forEach((item) => {
      if (String(item.textContent || "").toLowerCase().includes("bekleniyor")) item.textContent = "PRO robot analizi";
    });
  }
}

window.addEventListener("load", () => {
  setTimeout(applyProAnalysisGuard, 1400);
  setTimeout(applyProAnalysisGuard, 3000);
});
