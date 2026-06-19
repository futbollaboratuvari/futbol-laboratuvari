const emptyMessage = "Canlı veri bekleniyor. Eski sabit 12.06.2026 maç verileri kaldırıldı.";

const setEmpty = (selector, html) => {
  const element = document.querySelector(selector);
  if (element) element.innerHTML = html;
};

setEmpty("#analysis-list", `<div class="fixtures-empty">${emptyMessage}</div>`);
setEmpty("#strongest-pick-card", `<div class="fixtures-empty">Günün seçimi canlı robot verisi geldikten sonra üretilecek.</div>`);
setEmpty("#result-archive", `<tr><td colspan="7">Canlı sonuç arşivi bekleniyor.</td></tr>`);
setEmpty("#analysis-database-body", `<tr><td colspan="10">Canlı veri görünümü bekleniyor.</td></tr>`);
setEmpty("#spor-toto-grid", `<div class="fixtures-empty">Spor Toto canlı bülteni bekleniyor.</div>`);
setEmpty("#spor-toto-summary", `<span>Toplam: 0</span><span>Durum: Canlı veri bekleniyor</span>`);

const todayCount = document.querySelector("#today-count");
const avgConfidence = document.querySelector("#avg-confidence");
const topMarket = document.querySelector("#top-market");
if (todayCount) todayCount.textContent = "0";
if (avgConfidence) avgConfidence.textContent = "-";
if (topMarket) topMarket.textContent = "-";

document.querySelectorAll(".reveal").forEach((item) => item.classList.add("visible"));
