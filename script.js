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

const renderFixtures = () => {
  if (!fixturesList) return;
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

const scoreFixtureForCoupon = (fixture, index = 0) => {
  const league = `${fixture.league || ""}`.toLowerCase();
  const teams = `${fixture.home || ""} ${fixture.away || ""}`.toLowerCase();
  const hour = Number(String(fixture.time || "00:00").slice(0, 2)) || 0;
  let score = 58;
  let market = "1X / Çifte Şans";
  let risk = "Orta";

  if (/irlanda|norveç|isveç|finlandiya|izlanda|danimarka|hollanda|belçika|hazırlık|kupa/i.test(league)) {
    score += 10;
    market = "2.5 Üst Adayı";
  }
  if (/premier|şampiyonluk|kupası|dünya|grup/i.test(league)) {
    score += 5;
    market = market === "1X / Çifte Şans" ? "KG Var Adayı" : market;
  }
  if (/ii|u19|u20|u21|youth|rezerv/i.test(teams)) {
    score += 4;
    market = "KG Var Adayı";
    risk = "Yüksek";
  }
  if (hour >= 20 && hour <= 23) score += 3;
  score += Math.max(0, 4 - (index % 5));
  score = Math.min(score, 78);
  if (score < 65) risk = "Yüksek";

  return { ...fixture, match: `${fixture.home} - ${fixture.away}`, market, score, confidence: `${score}%`, risk };
};

const couponCard = (title, market, score, risk, status = "takipte") => `
  <article class="robot-live-card">
    <h3>${escapeHtml(title)}</h3>
    <div class="robot-row"><span>Market</span><strong>${escapeHtml(market)}</strong></div>
    <div class="robot-row"><span>Robot güveni</span><strong>${escapeHtml(score)}</strong></div>
    <div class="robot-row"><span>Risk</span><strong>${escapeHtml(risk)}</strong></div>
    <div class="robot-row"><span>Durum</span><strong>${escapeHtml(status)}</strong></div>
    <p class="robot-note">Otomatik analizdir; kesin sonuç garantisi vermez.</p>
  </article>
`;

const renderCouponCenterFromFixtures = () => {
  const today = fixtureDateMap().today;
  const rows = fixtures
    .filter((fixture) => fixture.date === today)
    .map(scoreFixtureForCoupon)
    .sort((a, b) => b.score - a.score)
    .slice(0, 9);

  const singleBox = document.querySelector("[data-coupons-single]");
  const doubleBox = document.querySelector("[data-coupons-double]");
  const tripleBox = document.querySelector("[data-coupons-triple]");
  if (!singleBox || !doubleBox || !tripleBox) return;

  singleBox.innerHTML = rows.length
    ? rows.slice(0, 6).map((item) => couponCard(item.match, item.market, item.confidence, item.risk)).join("")
    : `<article class="robot-live-card">Tekli analiz bekleniyor.</article>`;

  const pairs = [];
  for (let index = 0; index + 1 < rows.length && pairs.length < 3; index += 2) {
    const pair = [rows[index], rows[index + 1]];
    const avg = Math.round(pair.reduce((sum, item) => sum + item.score, 0) / pair.length);
    pairs.push(couponCard(pair.map((item) => item.match).join(" + "), pair.map((item) => item.market).join(" + "), `${avg}%`, pair.some((item) => item.risk === "Yüksek") ? "Yüksek" : "Orta"));
  }
  doubleBox.innerHTML = pairs.length ? pairs.join("") : `<article class="robot-live-card">2'li analiz bekleniyor.</article>`;

  const triples = [];
  for (let index = 0; index + 2 < rows.length && triples.length < 2; index += 3) {
    const trio = [rows[index], rows[index + 1], rows[index + 2]];
    const avg = Math.round(trio.reduce((sum, item) => sum + item.score, 0) / trio.length);
    triples.push(couponCard(trio.map((item) => item.match).join(" + "), trio.map((item) => item.market).join(" + "), `${avg}%`, "Yüksek"));
  }
  tripleBox.innerHTML = triples.length ? triples.join("") : `<article class="robot-live-card">3'lü analiz bekleniyor.</article>`;

  const todayCount = document.querySelector("#today-count");
  const avgConfidence = document.querySelector("#avg-confidence");
  const topMarket = document.querySelector("#top-market");
  const avg = rows.length ? Math.round(rows.reduce((sum, item) => sum + item.score, 0) / rows.length) : 0;
  if (todayCount) todayCount.textContent = String(rows.length);
  if (avgConfidence) avgConfidence.textContent = rows.length ? `${avg}%` : "-";
  if (topMarket) topMarket.textContent = rows[0]?.market || "-";
};

const ensureCompletedCouponArea = () => {
  const hub = document.querySelector("#robot-analizleri");
  if (!hub || document.querySelector("[data-completed-coupons]")) return;
  const panel = document.createElement("div");
  panel.className = "robot-stack reveal visible";
  panel.innerHTML = `
    <div class="section-heading">
      <p class="eyebrow">Tamamlanan Analizler</p>
      <h2>Kazandı / Kaybetti Takibi</h2>
      <p>Sonuç verisi geldiğinde tamamlanan analizler burada ayrı listelenir.</p>
    </div>
    <div class="robot-stack" data-completed-coupons>
      <article class="robot-live-card">Tamamlanan analiz bekleniyor.</article>
    </div>
  `;
  hub.insertBefore(panel, hub.querySelector(".robot-disclaimer"));
};

const loadCompletedCouponArea = async () => {
  ensureCompletedCouponArea();
  const target = document.querySelector("[data-completed-coupons]");
  if (!target) return;
  try {
    const response = await fetch("./data/analiz_sonuclari.json", { cache: "no-store" });
    if (!response.ok) throw new Error("sonuç dosyası bekleniyor");
    const data = await response.json();
    const completed = Array.isArray(data.completed_items) ? data.completed_items : [];
    target.innerHTML = completed.length
      ? completed.map((item) => couponCard(item.title || item.match || "Analiz", item.market || "-", item.score || "-", item.risk || "-", item.status || "sonuçlandı")).join("")
      : `<article class="robot-live-card">Tamamlanan analiz bekleniyor. Maç sonuçları geldikçe kazandı/kaybetti burada görünecek.</article>`;
  } catch (error) {
    target.innerHTML = `<article class="robot-live-card">Tamamlanan analiz bekleniyor.</article>`;
  }
};

const loadFixtures = async () => {
  if (!fixturesList) return;
  fixturesList.innerHTML = emptyBox("Maç bülteni yükleniyor...");

  try {
    const response = await fetch("./data/fixtures.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`fixtures.json ${response.status}`);
    const data = await response.json();
    fixtures = Array.isArray(data) ? data : [];
  } catch (error) {
    fixtures = [];
  }

  renderFixtures();
  renderCouponCenterFromFixtures();
  setTimeout(renderCouponCenterFromFixtures, 900);
};

const renderSporToto = (payload) => {
  if (!sporTotoGrid) return;
  const matches = Array.isArray(payload?.matches) ? payload.matches : [];

  if (!matches.length) {
    sporTotoGrid.innerHTML = emptyBox("Haftalık Spor Toto bülteni bekleniyor.");
    if (sporTotoSummary) {
      sporTotoSummary.innerHTML = `<span>Toplam: 0</span><span>Durum: Canlı bülten bekleniyor</span>`;
    }
    return;
  }

  sporTotoGrid.innerHTML = matches
    .map(
      (pick, index) => `
        <article class="spor-card reveal visible">
          <div class="meta-row">
            <span>${escapeHtml(pick.week || payload.week_label || "Haftalık Bülten")}</span>
            <span>${escapeHtml(pick.className || "Spor Toto")}</span>
          </div>
          <h3>${escapeHtml(pick.match || `${pick.home || "Ev sahibi"} - ${pick.away || "Deplasman"}`)}</h3>
          <div class="probability-grid">
            <span>1 <b>${escapeHtml(pick.one ?? "-")}</b><small>${escapeHtml(pick.oneOdd ?? "-")}</small></span>
            <span>X <b>${escapeHtml(pick.draw ?? "-")}</b><small>${escapeHtml(pick.drawOdd ?? "-")}</small></span>
            <span>2 <b>${escapeHtml(pick.two ?? "-")}</b><small>${escapeHtml(pick.twoOdd ?? "-")}</small></span>
          </div>
          <div class="decision-row">
            <strong>${escapeHtml(pick.decision || "Bekleniyor")}</strong>
            <span>${escapeHtml(pick.score ? `Skor ${pick.score}` : `#${pick.no || index + 1}`)}</span>
          </div>
        </article>
      `,
    )
    .join("");

  if (sporTotoSummary) {
    sporTotoSummary.innerHTML = `
      <span>Hafta: ${escapeHtml(payload.week_label || "Güncel")}</span>
      <span>Toplam: ${matches.length}</span>
      <span>Kaynak: ${escapeHtml(payload.source || "Robot")}</span>
    `;
  }
};

const loadSporToto = async () => {
  if (!sporTotoGrid) return;
  try {
    const response = await fetch("./data/spor_toto_bulteni.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`spor_toto_bulteni.json ${response.status}`);
    renderSporToto(await response.json());
  } catch (error) {
    renderSporToto({ matches: [] });
  }
};

const renderStaticEmptySections = () => {
  if (analysisList) analysisList.innerHTML = emptyBox("Maç bazlı canlı analiz bekleniyor. Eski sabit 12.06.2026 verileri kaldırıldı.");
  if (strongestPickCard) strongestPickCard.innerHTML = emptyBox("Günün seçimi canlı veri geldikten sonra otomatik üretilecek.");
  if (resultArchive) resultArchive.innerHTML = `<tr><td colspan="7">Canlı sonuç arşivi bekleniyor.</td></tr>`;
  if (successGrid) successGrid.innerHTML = `<article class="success-card reveal visible"><strong data-count="0">0</strong><span>Canlı performans bekleniyor</span><div class="spark"></div></article>`;
  if (databaseBody) databaseBody.innerHTML = `<tr><td colspan="10">Canlı veri görünümü bekleniyor. Eski sabit maç kayıtları gösterilmez.</td></tr>`;
  renderSporToto({ matches: [] });
  ensureCompletedCouponArea();

  const todayCount = document.querySelector("#today-count");
  const avgConfidence = document.querySelector("#avg-confidence");
  const topMarket = document.querySelector("#top-market");
  if (todayCount) todayCount.textContent = "0";
  if (avgConfidence) avgConfidence.textContent = "-";
  if (topMarket) topMarket.textContent = "-";
};

const setupObservers = () => {
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("id");
          const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);
          if (!activeLink || !entry.isIntersecting) return;
          navLinks.forEach((link) => link.classList.remove("active"));
          activeLink.classList.add("active");
        });
      },
      { rootMargin: "-38% 0px -52% 0px", threshold: 0.1 },
    );

    document.querySelectorAll("section[id]").forEach((section) => sectionObserver.observe(section));

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
  await Promise.all([loadFixtures(), loadSporToto(), loadCompletedCouponArea()]);
  setupObservers();
};

menuButton?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(Boolean(isOpen)));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav?.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  });
});

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
