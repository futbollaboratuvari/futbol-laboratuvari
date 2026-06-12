const analyses = [
  {
    id: "FL-001",
    date: "12.06.2026",
    league: "Victoria Premier League",
    time: "13:00",
    match: "Melbourne Knights - Moreland Zebras",
    prediction: "MS1",
    odds: 1.50,
    scorePrediction: "2-0",
    status: "Beklemede",
    resultScore: "-",
    note: "Ev sahibi formu ve kadro dengesi güçlü sinyal veriyor.",
    modules: {
      form: 82,
      squad: 78,
      odds: 74,
      coach: 70,
      last15: 67,
      psychology: 76,
    },
  },
  {
    id: "FL-002",
    date: "12.06.2026",
    league: "Dünya Kupası",
    time: "14:00",
    match: "Güney Kore - Çekya",
    prediction: "2.5 Alt",
    odds: 1.44,
    scorePrediction: "1-1",
    status: "Beklemede",
    resultScore: "-",
    note: "Tempo dengesi ve set savunmaları düşük skor tarafını destekliyor.",
    modules: {
      form: 70,
      squad: 72,
      odds: 69,
      coach: 66,
      last15: 64,
      psychology: 71,
    },
  },
  {
    id: "FL-003",
    date: "12.06.2026",
    league: "NPL NSW",
    time: "12:30",
    match: "Manly United - Sydney United 58",
    prediction: "KG Var",
    odds: 1.56,
    scorePrediction: "1-1",
    status: "Beklemede",
    resultScore: "-",
    note: "İki takımın maç sonu üretkenliği karşılıklı gol beklentisini artırıyor.",
    modules: {
      form: 67,
      squad: 65,
      odds: 68,
      coach: 62,
      last15: 75,
      psychology: 64,
    },
  },
];

const archive = [
  {
    date: "10.06.2026",
    match: "İtalya U21 - Polonya U21",
    prediction: "1.5 Üst",
    score: "2-1",
    confidence: 73,
    result: "Kazandı",
  },
  {
    date: "09.06.2026",
    match: "İspanya - Portekiz",
    prediction: "KG Var",
    score: "1-0",
    confidence: 66,
    result: "Kaybetti",
  },
  {
    date: "08.06.2026",
    match: "Norveç - İsveç",
    prediction: "MS1",
    score: "2-0",
    confidence: 71,
    result: "Kazandı",
  },
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

const getGeneralScore = (analysis) => {
  const values = Object.values(analysis.modules);
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const statusClass = (result) => {
  if (result === "Kazandı") return "won";
  if (result === "Kaybetti") return "lost";
  return "pending";
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
  resultArchive.innerHTML = archive
    .map(
      (item) => `
        <tr>
          <td>${item.date}</td>
          <td>${item.match}</td>
          <td>${item.prediction}</td>
          <td>${item.score}</td>
          <td>${item.confidence}</td>
          <td><span class="status ${statusClass(item.result)}">${item.result}</span></td>
        </tr>
      `,
    )
    .join("");
};

const renderSuccess = () => {
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

const hydrateSummary = () => {
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

const init = () => {
  analysisList.innerHTML = analyses.map(renderAnalysisCard).join("");
  renderStrongestPick();
  renderArchive();
  renderSuccess();
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

init();
