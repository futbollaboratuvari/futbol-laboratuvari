const analyses = [
  {
    id: "FL-001",
    date: "12.06.2026",
    league: "Dünya Kupası",
    time: "14:00",
    match: "Güney Kore - Çekya",
    type: "Genel Analiz",
    prediction: "2.5 Alt",
    odds: 1.44,
    confidence: 69,
    scorePrediction: "1-1",
    resultScore: "-",
    status: "Beklemede",
    note: "Tempo dengesi ve set savunmaları düşük skor tarafını destekliyor.",
    modules: { form: 70, squad: 72, odds: 69, coach: 66, last15: 64, psychology: 71 },
  },
  {
    id: "FL-002",
    date: "12.06.2026",
    league: "NPL NSW",
    time: "12:30",
    match: "Manly United - Sydney United 58",
    type: "Genel Analiz",
    prediction: "KG Var",
    odds: 1.56,
    confidence: 67,
    scorePrediction: "1-1",
    resultScore: "-",
    status: "Beklemede",
    note: "İki takımın maç sonu üretkenliği karşılıklı gol beklentisini artırıyor.",
    modules: { form: 67, squad: 65, odds: 68, coach: 62, last15: 75, psychology: 64 },
  },
  {
    id: "FL-003",
    date: "12.06.2026",
    league: "Victoria Premier League",
    time: "13:00",
    match: "Melbourne Knights - Moreland Zebras",
    type: "Genel Analiz",
    prediction: "MS1",
    odds: 1.5,
    confidence: 75,
    scorePrediction: "2-0",
    resultScore: "-",
    status: "Beklemede",
    note: "Ev sahibi formu ve kadro dengesi güçlü sinyal veriyor.",
    modules: { form: 82, squad: 78, odds: 74, coach: 70, last15: 67, psychology: 76 },
  },
  {
    id: "FL-004",
    date: "12.06.2026",
    league: "İsveç Superettan",
    time: "20:00",
    match: "Helsingborg - Landskrona",
    type: "Genel Analiz",
    prediction: "KG Var",
    odds: 1.62,
    confidence: 64,
    scorePrediction: "1-1",
    resultScore: "-",
    status: "Beklemede",
    note: "Derbi dinamiği ve iki tarafın üretkenliği dengeli risk profili oluşturuyor.",
    modules: { form: 64, squad: 66, odds: 62, coach: 65, last15: 68, psychology: 63 },
  },
  {
    id: "FL-005",
    date: "12.06.2026",
    league: "Finlandiya Ykkönen",
    time: "18:30",
    match: "Tampere United - OLS Oulu",
    type: "Genel Analiz",
    prediction: "1.5 Üst",
    odds: 1.38,
    confidence: 66,
    scorePrediction: "2-1",
    resultScore: "-",
    status: "Beklemede",
    note: "Açık oyun temposu ve savunma kırılganlığı gol beklentisini yükseltiyor.",
    modules: { form: 65, squad: 63, odds: 67, coach: 64, last15: 71, psychology: 66 },
  },
  {
    id: "FL-006",
    date: "12.06.2026",
    league: "Vietnam V.League",
    time: "15:15",
    match: "Nam Dinh - TP Ho Chi Minh",
    type: "Genel Analiz",
    prediction: "MS1",
    odds: 1.65,
    confidence: 72,
    scorePrediction: "2-0",
    resultScore: "-",
    status: "Beklemede",
    note: "Ev sahibi kalite farkı ve iç saha baskısı galibiyet tarafını öne çıkarıyor.",
    modules: { form: 75, squad: 73, odds: 70, coach: 69, last15: 71, psychology: 74 },
  },
];

const sporTotoPicks = [
  ["Avustralya - Türkiye", 21, 31, 48, 4.35, 3.2, 2.05, "X2", "Sürpriz Adayı", "1-1"],
  ["Kanada - Bosna Hersek", 43, 30, 27, 2.05, 3.15, 3.55, "1X", "Çifte Şans", "1-1"],
  ["ABD - Paraguay", 46, 29, 25, 1.95, 3.25, 3.8, "1X", "Çifte Şans", "2-1"],
  ["Katar - İsviçre", 18, 25, 57, 5.1, 3.6, 1.62, "2", "Banko", "0-2"],
  ["Brezilya - Fas", 51, 28, 21, 1.72, 3.45, 4.4, "1X", "Çifte Şans", "2-1"],
  ["Haiti - İskoçya", 23, 30, 47, 4.1, 3.25, 1.9, "X2", "Sürpriz Adayı", "1-2"],
  ["Almanya - Curaçao", 78, 14, 8, 1.2, 6.3, 11, "1", "Banko", "3-0"],
  ["Hollanda - Japonya", 50, 29, 21, 1.78, 3.4, 4.5, "1X", "Çifte Şans", "2-1"],
  ["Fildişi Sahili - Ekvador", 32, 38, 30, 2.75, 2.95, 2.85, "X", "Beraberlik Adayı", "1-1"],
  ["İsveç - Tunus", 47, 31, 22, 1.88, 3.1, 4.2, "1X", "Çifte Şans", "1-0"],
  ["İspanya - Yeşil Burun Adaları", 74, 17, 9, 1.25, 5.7, 9.5, "1", "Banko", "3-0"],
  ["Belçika - Mısır", 49, 30, 21, 1.82, 3.25, 4.35, "1X", "Çifte Şans", "2-1"],
  ["Suudi Arabistan - Uruguay", 16, 23, 61, 5.8, 3.85, 1.55, "2", "Banko", "0-2"],
  ["İran - Yeni Zelanda", 45, 32, 23, 1.98, 3.05, 4.05, "1X", "Çifte Şans", "1-1"],
  ["Fransa - Senegal", 52, 28, 20, 1.68, 3.5, 4.8, "1X", "Çifte Şans", "2-1"],
].map(([match, one, draw, two, oneOdd, drawOdd, twoOdd, decision, className, score], index) => ({
  id: `ST-${String(index + 1).padStart(3, "0")}`,
  date: "12.06.2026",
  week: "Hafta 1",
  tournament: "Spor Toto 1-X-2",
  match,
  one,
  draw,
  two,
  oneOdd,
  drawOdd,
  twoOdd,
  decision,
  className,
  score,
  actual: "",
}));

const archive = [
  { date: "10.06.2026", match: "İtalya U21 - Polonya U21", prediction: "1.5 Üst", odds: 1.42, score: "2-1", confidence: 73, result: "Kazandı" },
  { date: "09.06.2026", match: "İspanya - Portekiz", prediction: "KG Var", odds: 1.58, score: "1-0", confidence: 66, result: "Kaybetti" },
  { date: "08.06.2026", match: "Norveç - İsveç", prediction: "MS1", odds: 1.74, score: "2-0", confidence: 71, result: "Kazandı" },
];

const successMarkets = [
  { label: "Genel", percent: 68, trend: [42, 58, 54, 63, 68] },
  { label: "Alt/Üst", percent: 74, trend: [52, 60, 66, 71, 74] },
  { label: "KG Var/Yok", percent: 61, trend: [44, 49, 58, 54, 61] },
  { label: "Maç Sonucu", percent: 57, trend: [38, 45, 48, 53, 57] },
];

const moduleLabels = {
  form: "Form Gücü",
  squad: "Kadro Kalitesi",
  odds: "Oran Analizi",
  coach: "Teknik Direktör Etkisi",
  last15: "Son 15 Dakika Analizi",
  psychology: "Psikolojik Dayanıklılık",
};

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

const getGeneralScore = (analysis) => {
  if (analysis.confidence) return analysis.confidence;
  const values = Object.values(analysis.modules);
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const statusClass = (result) => {
  if (result === "Kazandı") return "won";
  if (result === "Kaybetti") return "lost";
  return "pending";
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const getTurkeyDateKey = (date = new Date()) => {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
};

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

const renderFixtures = () => {
  if (!fixturesList) return;
  const dateKey = fixtureDateMap()[activeFixtureDay];
  const dailyFixtures = fixtures
    .filter((fixture) => fixture.date === dateKey)
    .sort((a, b) => `${a.time || ""}`.localeCompare(`${b.time || ""}`));

  if (dailyFixtures.length === 0) {
    fixturesList.innerHTML = `
      <div class="fixtures-empty">
        Bu gün için kayıtlı maç bulunamadı. Günlük veri dosyası güncellendiğinde liste otomatik dolacak.
      </div>
    `;
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
  if (!fixturesList) return;
  fixturesList.innerHTML = `<div class="fixtures-empty">Maç bülteni yükleniyor...</div>`;

  try {
    const response = await fetch("data/fixtures.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`fixtures.json ${response.status}`);
    const data = await response.json();
    fixtures = Array.isArray(data) ? data : [];
  } catch (error) {
    fixtures = [];
    fixturesList.innerHTML = `
      <div class="fixtures-empty">
        Maç bülteni şu anda okunamadı. data/fixtures.json dosyası kontrol edilmeli.
      </div>
    `;
    return;
  }

  renderFixtures();
};

const scoreLine = (label, value) => `
  <div class="score-line">
    <span>${label}</span>
    <div><i style="--value:${value}%"></i></div>
    <b>${value}</b>
  </div>
`;

const renderAnalysisCard = (analysis) => {
  const general = getGeneralScore(analysis);
  const moduleRows = Object.entries(analysis.modules)
    .map(([key, value]) => scoreLine(moduleLabels[key], value))
    .join("");

  return `
    <article class="analysis-card reveal">
      <div class="meta-row">
        <span>${analysis.league}</span>
        <span>${analysis.time}</span>
      </div>
      <div>
        <h3>${analysis.match}</h3>
        <p>${analysis.note}</p>
      </div>
      <div class="prediction-box">
        <span>Tahmin</span>
        <b>${analysis.prediction}</b>
      </div>
      <div class="score-stack">
        ${moduleRows}
        <div class="general-score">
          ${scoreLine("Genel Güven Skoru", general)}
        </div>
      </div>
      <div class="card-footer">
        <span>Oran ${analysis.odds.toFixed(2)}</span>
        <span>Skor ${analysis.scorePrediction}</span>
      </div>
    </article>
  `;
};

const renderStrongestPick = () => {
  if (!strongestPickCard || analyses.length === 0) return;
  const top = [...analyses].sort((a, b) => getGeneralScore(b) - getGeneralScore(a))[0];
  const general = getGeneralScore(top);
  strongestPickCard.innerHTML = `
    <div>
      <div class="pick-title">
        <span class="badge">${top.league}</span>
        <span class="badge">${top.time}</span>
      </div>
      <h3>${top.match}</h3>
      <p>${top.note}</p>
      <div class="summary-grid">
        <span>Tahmin: ${top.prediction}</span>
        <span>Oran: ${top.odds.toFixed(2)}</span>
        <span>Skor: ${top.scorePrediction}</span>
        <span>Kayıt: ${top.id}</span>
      </div>
      <div class="score-stack">
        ${scoreLine("Form Gücü", top.modules.form)}
        ${scoreLine("Kadro Kalitesi", top.modules.squad)}
        ${scoreLine("Oran Analizi", top.modules.odds)}
      </div>
    </div>
    <div class="confidence-ring" style="--percent:${general}%">
      <span>${general}</span>
    </div>
  `;
};

const renderArchive = () => {
  if (!resultArchive) return;
  resultArchive.innerHTML = archive
    .map(
      (item) => `
        <tr>
          <td>${item.date}</td>
          <td>${item.match}</td>
          <td>${item.prediction}</td>
          <td>${item.odds.toFixed(2)}</td>
          <td>${item.score}</td>
          <td>${item.confidence}</td>
          <td><span class="status ${statusClass(item.result)}">${item.result}</span></td>
        </tr>
      `,
    )
    .join("");
};

const renderSuccess = () => {
  if (!successGrid) return;
  successGrid.innerHTML = successMarkets
    .map(
      (market) => `
        <article class="success-card reveal">
          <strong data-count="${market.percent}">0</strong>
          <span>${market.label}</span>
          <div class="spark">
            ${market.trend.map((value) => `<i style="height:${value}%"></i>`).join("")}
          </div>
        </article>
      `,
    )
    .join("");
};

const renderAnalysisDatabase = () => {
  if (!databaseBody) return;
  databaseBody.innerHTML = analyses
    .map(
      (item) => `
        <tr>
          <td>${item.date}</td>
          <td>${item.league}</td>
          <td>${item.match}</td>
          <td>${item.type}</td>
          <td>${item.prediction}</td>
          <td>${item.odds.toFixed(2)}</td>
          <td>${getGeneralScore(item)}</td>
          <td>${item.scorePrediction}</td>
          <td>${item.resultScore}</td>
          <td><span class="status ${statusClass(item.status)}">${item.status}</span></td>
        </tr>
      `,
    )
    .join("");
};

const renderSporToto = () => {
  if (!sporTotoGrid) return;
  sporTotoGrid.innerHTML = sporTotoPicks
    .map(
      (pick) => `
        <article class="spor-card reveal">
          <div class="meta-row">
            <span>${pick.week}</span>
            <span>${pick.className}</span>
          </div>
          <h3>${pick.match}</h3>
          <div class="probability-grid">
            <span>1 <b>${pick.one}%</b><small>${pick.oneOdd.toFixed(2)}</small></span>
            <span>X <b>${pick.draw}%</b><small>${pick.drawOdd.toFixed(2)}</small></span>
            <span>2 <b>${pick.two}%</b><small>${pick.twoOdd.toFixed(2)}</small></span>
          </div>
          <div class="decision-row">
            <strong>${pick.decision}</strong>
            <span>Skor ${pick.score}</span>
          </div>
        </article>
      `,
    )
    .join("");

  if (!sporTotoSummary) return;
  const counts = sporTotoPicks.reduce((acc, pick) => {
    acc[pick.className] = (acc[pick.className] || 0) + 1;
    return acc;
  }, {});
  sporTotoSummary.innerHTML = `
    <span>Toplam: ${sporTotoPicks.length}</span>
    <span>Banko: ${counts.Banko || 0}</span>
    <span>Beraberlik Adayı: ${counts["Beraberlik Adayı"] || 0}</span>
    <span>Sürpriz Adayı: ${counts["Sürpriz Adayı"] || 0}</span>
    <span>Çifte Şans: ${counts["Çifte Şans"] || 0}</span>
  `;
};

const hydrateSummary = () => {
  if (analyses.length === 0) return;
  const avg = Math.round(
    analyses.reduce((sum, analysis) => sum + getGeneralScore(analysis), 0) / analyses.length,
  );
  const top = [...analyses].sort((a, b) => getGeneralScore(b) - getGeneralScore(a))[0];
  document.querySelector("#today-count").textContent = analyses.length;
  document.querySelector("#avg-confidence").textContent = avg;
  document.querySelector("#top-market").textContent = top.prediction;
};

const setupObservers = () => {
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

  const counterObserver = new IntersectionObserver(
    ([entry], currentObserver) => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll("[data-count]").forEach((counter) => {
        const target = Number(counter.dataset.count);
        let value = 0;
        const step = Math.max(1, Math.round(target / 34));
        const tick = () => {
          value = Math.min(target, value + step);
          counter.textContent = value;
          if (value < target) requestAnimationFrame(tick);
        };
        tick();
      });
      currentObserver.disconnect();
    },
    { threshold: 0.25 },
  );

  const stats = document.querySelector("#basari-takip");
  if (stats) counterObserver.observe(stats);
};

const init = async () => {
  if (analysisList) analysisList.innerHTML = analyses.map(renderAnalysisCard).join("");
  await loadFixtures();
  renderStrongestPick();
  renderArchive();
  renderSuccess();
  renderAnalysisDatabase();
  renderSporToto();
  hydrateSummary();
  setupObservers();
};

menuButton?.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
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
