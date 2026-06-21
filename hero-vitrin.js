(() => {
  const setText = (selector, value) => {
    document.querySelectorAll(selector).forEach((node) => {
      node.textContent = value;
    });
  };

  const ensureCredibility = () => {
    const content = document.querySelector(".dashboard-hero .hero-content");
    if (!content || document.querySelector(".fl-hero-credibility")) return;
    const block = document.createElement("div");
    block.className = "fl-hero-credibility";
    block.innerHTML = `
      <span><strong>1</strong> Maç formu ve son dönem gidişatı birlikte okunur.</span>
      <span><strong>2</strong> Gol eğilimi, risk seviyesi ve maç senaryosu ayrılır.</span>
      <span><strong>3</strong> Sonuçlar takip edilerek değerlendirme kalitesi ölçülür.</span>
    `;
    const actions = content.querySelector(".hero-actions");
    if (actions) actions.before(block);
    else content.appendChild(block);
  };

  const updateHero = () => {
    const hero = document.querySelector(".dashboard-hero");
    if (!hero) return;
    setText(".dashboard-hero .hero-brand-lockup span", "Maçlar | Gerekçeli Tahminler | Kuponlar");
    setText(".dashboard-hero .eyebrow", "Günlük maç değerlendirme merkezi");
    setText(".dashboard-hero h1", "Bugünün maçlarını daha bilinçli oku");

    const intro = hero.querySelector(".hero-content > p:not(.eyebrow)");
    if (intro) {
      intro.textContent = "Form durumu, gol eğilimi, oran hareketi ve maç hikayesi birlikte değerlendirilir. Amaç kesin sonuç vaat etmek değil, daha temiz ve gerekçeli maç yorumu sunmaktır.";
    }

    const proof = hero.querySelector(".hero-proof");
    if (proof) {
      proof.innerHTML = `
        <span>Günlük maç seçimi</span>
        <span>Gerekçeli tahmin</span>
        <span>Risk seviyesi</span>
        <span>Sonuç takibi</span>
      `;
    }

    const actions = hero.querySelector(".hero-actions");
    if (actions) {
      const buttons = actions.querySelectorAll("a");
      if (buttons[0]) buttons[0].textContent = "Kupon Merkezini Aç";
      if (buttons[1]) buttons[1].textContent = "Bugünün Maçlarını Gör";
      if (buttons[2]) buttons[2].textContent = "Özel Analiz Al";
    }

    const cards = hero.querySelectorAll(".platform-summary > div");
    if (cards[0]) {
      cards[0].querySelector("span").textContent = "Bugünün odağı";
      cards[0].querySelector("strong").textContent = "Hazırlanıyor";
      cards[0].querySelector("small").textContent = "Güncel liste oluşunca maç sayısı görünür";
    }
    if (cards[1]) {
      cards[1].querySelector("span").textContent = "Güven notu";
      cards[1].querySelector("strong").textContent = "Veri bekleniyor";
      cards[1].querySelector("small").textContent = "Net veri gelmeden sayı gösterilmez";
    }
    if (cards[2]) {
      cards[2].querySelector("span").textContent = "Öne çıkan seçim";
      cards[2].querySelector("strong").textContent = "Günün sinyali hazırlanıyor";
      cards[2].querySelector("small").textContent = "En güçlü seçenek güncel listeyle belirlenir";
    }

    ensureCredibility();
  };

  updateHero();
  document.addEventListener("DOMContentLoaded", updateHero, { once: true });
  window.addEventListener("load", () => {
    updateHero();
    setTimeout(updateHero, 500);
    setTimeout(updateHero, 1500);
  }, { once: true });
  document.addEventListener("fl:runtime-ready", () => setTimeout(updateHero, 120));
})();
