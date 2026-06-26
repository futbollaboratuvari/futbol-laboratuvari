const flCouponEmpty = "Bugün için kesin kupon adayı yok; robot izleme adaylarını gösteriyor.";

const flSafe = (value) => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const flReadJson = async (url, fallback) => {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(response.statusText);
    return await response.json();
  } catch {
    return fallback;
  }
};

const flNumber = (value) => {
  const found = String(value || "").replace(",", ".").match(/\d+(\.\d+)?/);
  return found ? Number(found[0]) : 0;
};

const flOdd = (value) => {
  const number = flNumber(value);
  return number > 1 ? number : 0;
};

const flBestOdd = (item) => {
  const direct = flOdd(item.estimated_odds || item.odds || item.suggested_odds);
  if (direct) return direct;
  const odds = item.available_odds || {};
  return Math.max(flOdd(odds.ms1), flOdd(odds.msx), flOdd(odds.ms2), flOdd(odds.over25), flOdd(odds.bttsYes));
};

const flTitle = (item) => item.match_name || item.match || item.title || `${item.home || ""} VS ${item.away || ""}`.trim() || "Maç";
const flMarket = (item) => item.recommended_market || item.suggested_option || item.market || item.prediction || "-";
const flScore = (item) => flNumber(item.confidence_score || item.confidence || item.score || item.analysis_score);
const flBlocked = (item) => /değerli market yok|degerli market yok|güncel maç değil|guncel mac degil|filtered_old/i.test(`${flMarket(item)} ${item.status || ""}`);

const flRow = (label, value) => value === undefined || value === null || value === "" || value === "-"
  ? ""
  : `<div class="robot-row"><span>${flSafe(label)}</span><strong>${flSafe(value)}</strong></div>`;

const flOdds = (item) => {
  const odds = item.available_odds || {};
  const guess = item.raw_market_guess_odds || {};
  const html = [
    flRow("MS 1", odds.ms1), flRow("MS X", odds.msx), flRow("MS 2", odds.ms2),
    flRow("KG Var", odds.bttsYes || guess.bttsYes_guess),
    flRow("2.5 Üst", odds.over25 || guess.over25_guess),
    flRow("2.5 Alt", odds.under25 || guess.under25_guess)
  ].filter(Boolean).join("");
  return html ? `<div class="robot-detail-box"><h4>Oranlar</h4>${html}</div>` : "";
};

const flCard = (name, legs, note) => {
  if (!legs.length) return `<article class="robot-live-card"><p class="robot-note">${flSafe(flCouponEmpty)}</p></article>`;
  const total = legs.reduce((acc, item) => acc * (flBestOdd(item) || 1), 1).toFixed(2);
  const avg = Math.round(legs.reduce((acc, item) => acc + flScore(item), 0) / legs.length);
  return `<article class="robot-live-card">
    <span class="robot-pill">${flSafe(name)}</span>
    <h3>${flSafe(name)}</h3>
    <div class="robot-row"><span>Toplam Oran</span><strong>${flSafe(total)}</strong></div>
    <div class="robot-row"><span>Ortalama Güven</span><strong>${flSafe(avg + "%")}</strong></div>
    <p class="robot-note">${flSafe(note)}</p>
    ${legs.map((item) => `<div class="robot-row"><span>${flSafe(flTitle(item))}</span><strong>${flSafe(flMarket(item))} / ${flSafe(flBestOdd(item) ? flBestOdd(item).toFixed(2) : "-")}</strong></div>${flOdds(item)}<p class="robot-note">${flSafe(item.robot_reason || item.robot_comment || item.commentary || "İzleme adayı; son karar kullanıcıya aittir.")}</p>`).join("")}
  </article>`;
};

const flFill = (selector, html) => document.querySelectorAll(selector).forEach((node) => { node.innerHTML = html; });
const flSet = (selector, value) => document.querySelectorAll(selector).forEach((node) => { node.textContent = value; });

async function flCouponCenterFallback() {
  const [live, history, daily] = await Promise.all([
    flReadJson("./data/live-matches.json", { matches: [], active_items: [], counts: {} }),
    flReadJson("./data/analiz_sonuclari.json", { active_items: [] }),
    flReadJson("./data/daily-coupons.json", { coupons: {} })
  ]);

  const hasOfficialCoupon = Object.values(daily.coupons || {}).some((item) => item && item.is_available);
  const allItems = [
    ...(Array.isArray(live.matches) ? live.matches : []),
    ...(Array.isArray(live.active_items) ? live.active_items : []),
    ...(Array.isArray(history.active_items) ? history.active_items : [])
  ];
  const candidates = allItems
    .filter((item) => item && !flBlocked(item) && flScore(item) >= 40)
    .sort((a, b) => flScore(b) - flScore(a) || flBestOdd(b) - flBestOdd(a));

  flSet("[data-match-count]", String(live.counts?.current_window || allItems.length || 0));
  flSet("[data-prediction-count]", String(live.counts?.coupon_candidates || live.counts?.watch_candidates || candidates.length || 0));
  flSet("[data-active-source]", live.source || history.source || daily.source || "Canlı veri akışı");
  flSet("[data-load-status]", allItems.length ? "Canlı veri akışı aktif" : "Veri bekleniyor");

  if (hasOfficialCoupon) return;

  const high = candidates.filter((item) => flBestOdd(item) >= 2.20);
  const risk = candidates.filter((item) => /kg|üst|ilk yarı|ikinci yarı|3\.5/i.test(flMarket(item)) || flBestOdd(item) >= 2.50);
  flFill("[data-coupons-single]", flCard("Dengeli İzleme Listesi", candidates.slice(0, 3), "Kesin kupon değil; robotun izleme eşiğini geçen maçlar."));
  flFill("[data-coupons-double]", flCard("Yüksek Oran İzleme Listesi", (high.length ? high : candidates).slice(0, 4), "Oranı öne çıkan ama henüz kesin kupon seviyesine çıkmayan adaylar."));
  flFill("[data-coupons-triple]", flCard("Riskli Laboratuvar İzleme Listesi", (risk.length ? risk : candidates).slice(0, 3), "Yüksek oranlı ve riskli izleme adayları; son karar kullanıcıya aittir."));
}

flCouponCenterFallback();
