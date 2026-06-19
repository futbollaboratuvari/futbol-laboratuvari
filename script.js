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
};

const renderStaticEmptySections = () => {
  if (analysisList) analysisList.innerHTML = emptyBox("Maç bazlı canlı analiz bekleniyor. Eski sabit 12.06.2026 verileri kaldırıldı.");
  if (strongestPickCard) strongestPickCard.innerHTML = emptyBox("Günün seçimi canlı veri geldikten sonra otomatik üretilecek.");
  if (resultArchive) resultArchive.innerHTML = `<tr><td colspan="7">Canlı sonuç arşivi bekleniyor.</td></tr>`;
  if (successGrid) successGrid.innerHTML = `<article class="success-card reveal visible"><strong data-count="0">0</strong><span>Canlı performans bekleniyor</span><div class="spark"></div></article>`;
  if (databaseBody) databaseBody.innerHTML = `<tr><td colspan="10">Canlı veri görünümü bekleniyor. Eski sabit maç kayıtları gösterilmez.</td></tr>`;
  if (sporTotoGrid) sporTotoGrid.innerHTML = emptyBox("Spor Toto canlı bülteni bekleniyor.");
  if (sporTotoSummary) sporTotoSummary.innerHTML = `<span>Toplam: 0</span><span>Durum: Canlı veri bekleniyor</span>`;

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
  await loadFixtures();
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
