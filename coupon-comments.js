const couponCommentState = {
  fixturesPath: "./data/fixtures.json",
  targetSelector: "#analysis-list",
};

const couponCommentEscape = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const couponCommentToday = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

const couponCommentScore = (fixture, index = 0) => {
  const league = `${fixture.league || ""}`.toLowerCase();
  const teams = `${fixture.home || ""} ${fixture.away || ""}`.toLowerCase();
  const hour = Number(String(fixture.time || "00:00").slice(0, 2)) || 0;
  let score = 58;
  let market = "1X / Çifte Şans";
  let risk = "Orta";
  const signals = [];

  if (/irlanda|norveç|isveç|finlandiya|izlanda|danimarka|hollanda|belçika|hazırlık|kupa/i.test(league)) {
    score += 10;
    market = "2.5 Üst Adayı";
    signals.push("lig karakteri gol/tempo ön elemesine uygun görünüyor");
  }

  if (/premier|şampiyonluk|kupası|dünya|grup/i.test(league)) {
    score += 5;
    market = market === "1X / Çifte Şans" ? "KG Var Adayı" : market;
    signals.push("maç tipi rekabet/puan baskısı açısından takip listesine alındı");
  }

  if (/ii|u19|u20|u21|youth|rezerv/i.test(teams)) {
    score += 4;
    market = "KG Var Adayı";
    risk = "Yüksek";
    signals.push("genç/rezerv takım ibaresi dalgalı oyun riski oluşturur");
  }

  if (hour >= 20 && hour <= 23) {
    score += 3;
    signals.push("akşam maç saati robot takip penceresinde");
  }

  score += Math.max(0, 4 - (index % 5));
  score = Math.min(score, 78);
  if (score < 65) risk = "Yüksek";

  return {
    ...fixture,
    match: `${fixture.home || "Ev sahibi"} - ${fixture.away || "Deplasman"}`,
    market,
    risk,
    score,
    confidence: `${score}%`,
    signals: signals.length ? signals : ["yorum yalnızca mevcut maç havuzu ve temel robot sinyallerine göre üretildi"],
  };
};

const couponCommentText = (item) => {
  const signalText = item.signals.join("; ");
  return `${item.league || "Lig bilgisi bekleniyor"} içinde ${item.time || "--:--"} saatli bu maç, Kupon Merkezi tarafından ${item.market} başlığıyla ön elemeden geçti. Robot güveni ${item.confidence}, risk seviyesi ${item.risk}. Bu yorum kesin tahmin değil; kaynak maç havuzu, lig etiketi, saat ve robot ön eleme sinyalleriyle oluşturulan veri bazlı maç notudur. Öne çıkan sinyal: ${signalText}.`;
};

const couponCommentCard = (item, index) => `
  <article class="analysis-card reveal visible">
    <div class="meta-row">
      <span>Kupon Merkezi #${index + 1}</span>
      <span>${couponCommentEscape(item.source || "Canlı veri")}</span>
    </div>
    <h3>${couponCommentEscape(item.match)}</h3>
    <p>${couponCommentEscape(couponCommentText(item))}</p>
    <div class="robot-row"><span>Lig</span><strong>${couponCommentEscape(item.league || "-")}</strong></div>
    <div class="robot-row"><span>Market</span><strong>${couponCommentEscape(item.market)}</strong></div>
    <div class="robot-row"><span>Güven / Risk</span><strong>${couponCommentEscape(item.confidence)} / ${couponCommentEscape(item.risk)}</strong></div>
    <p class="robot-note">Bu alan seçilen kupon maçlarından otomatik aktarılır; maç sonucu garantisi vermez.</p>
  </article>
`;

async function loadCouponComments() {
  const target = document.querySelector(couponCommentState.targetSelector);
  if (!target) return;

  try {
    const response = await fetch(couponCommentState.fixturesPath, { cache: "no-store" });
    if (!response.ok) throw new Error(`fixtures.json ${response.status}`);
    const fixtures = await response.json();
    const today = couponCommentToday();
    const selected = (Array.isArray(fixtures) ? fixtures : [])
      .filter((fixture) => fixture.date === today)
      .map(couponCommentScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, 9);

    target.innerHTML = selected.length
      ? selected.map(couponCommentCard).join("")
      : `<div class="fixtures-empty">Kupon Merkezi maç yorumu için canlı veri bekleniyor. Yeni kupon havuzu geldiğinde yorumlar otomatik eklenecek.</div>`;
  } catch (error) {
    target.innerHTML = `<div class="fixtures-empty">Maç yorumları canlı veri bekliyor.</div>`;
  }
}

loadCouponComments();
setTimeout(loadCouponComments, 1200);
