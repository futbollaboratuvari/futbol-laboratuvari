(() => {
  const CONTACT_EMAIL = "futbollaboratuvari.eu.org@gmail.com";
  const SECTION_ID = "iletisim-yasal-bilgiler";
  const STYLE_ID = "paytr-readiness-panel-style";

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const cards = [
    ["iletisim", "İletişim", "Destek ve bilgi talepleri için e-posta adresimiz: " + CONTACT_EMAIL],
    ["hizmet-aciklamasi", "Hizmet Açıklaması", "Futbol Laboratuvarı; futbol maçlarına ilişkin veri, yorum, analiz, maç bülteni ve özel analiz hakkı sunan dijital üyelik hizmetidir."],
    ["gizlilik-kvkk", "Gizlilik ve KVKK", "Ad soyad, e-posta ve telefon bilgileri üyelik, destek, ödeme takibi ve kullanıcı iletişimi amacıyla alınır. Kart bilgileri sitede saklanmaz."],
    ["iptal-iade", "İptal ve İade Koşulları", "Paketler dijital hizmet niteliğindedir. Teknik hata, mükerrer ödeme veya erişim sorunu yaşanırsa destek e-postası üzerinden değerlendirme yapılır."],
    ["kullanim-sartlari", "Kullanım Şartları", "Kullanıcılar site içeriklerini kişisel bilgi ve analiz amacıyla kullanır. İçerikler izinsiz kopyalanamaz, satılamaz veya ticari amaçla paylaşılamaz."],
    ["sorumluluk-reddi", "Sorumluluk Reddi", "Analiz ve yorumlar bilgilendirme amaçlıdır. Hiçbir içerik kesin sonuç, gelir veya kazanç garantisi vermez."]
  ];

  const injectStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .paytr-ready-section{position:relative;z-index:3;margin:28px clamp(18px,6vw,90px) 0;padding:20px;border:1px solid rgba(255,191,46,.26);border-radius:26px;background:linear-gradient(180deg,rgba(8,23,48,.96),rgba(3,8,23,.98));box-shadow:0 28px 76px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.05)}
      .paytr-ready-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:16px}.paytr-ready-kicker{display:inline-flex;padding:7px 10px;border:1px solid rgba(57,255,136,.32);border-radius:999px;background:rgba(57,255,136,.10);color:#c8ffdd;font-size:11px;font-weight:950;letter-spacing:.08em;text-transform:uppercase}.paytr-ready-title{margin:8px 0 0;color:#ffe08a;font-family:Georgia,"Times New Roman",serif;font-size:clamp(23px,2.6vw,34px);line-height:1.1}.paytr-ready-text{margin:8px 0 0;color:#aebbd0;max-width:820px;font-size:13px;line-height:1.6}.paytr-ready-email{display:inline-flex;align-items:center;justify-content:center;min-height:40px;padding:0 14px;border-radius:999px;border:1px solid rgba(255,191,46,.34);color:#fff7d6;background:rgba(255,191,46,.10);font-size:12px;font-weight:950;text-decoration:none;white-space:nowrap}
      .paytr-ready-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.paytr-ready-card{display:grid;gap:9px;min-height:145px;padding:15px;border:1px solid rgba(255,255,255,.09);border-radius:18px;background:rgba(255,255,255,.04)}.paytr-ready-card h3{margin:0;color:#f8fbff;font-size:16px}.paytr-ready-card p{margin:0;color:#aebbd0;font-size:12px;line-height:1.55}.paytr-ready-note{margin:14px 0 0;padding:12px;border:1px solid rgba(255,191,46,.18);border-radius:16px;background:rgba(255,191,46,.06);color:#d7e4f5;font-size:12px;line-height:1.55}
      .site-footer .paytr-footer-links{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-top:12px}.site-footer .paytr-footer-links a{color:#ffe08a;font-size:12px;font-weight:850;text-decoration:none}.site-footer .paytr-footer-contact{margin-top:10px;color:#aebbd0;font-size:12px}
      @media(max-width:1020px){.paytr-ready-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:640px){.paytr-ready-section{margin:20px 14px 0;padding:15px}.paytr-ready-grid{grid-template-columns:1fr}.paytr-ready-head{flex-direction:column}.paytr-ready-email{white-space:normal;text-align:center}}
    `;
    document.head.appendChild(style);
  };

  const ensureSection = () => {
    if (document.getElementById(SECTION_ID)) return;
    const section = document.createElement("section");
    section.id = SECTION_ID;
    section.className = "paytr-ready-section";
    section.setAttribute("aria-label", "İletişim ve yasal bilgiler");
    section.innerHTML = `
      <div class="paytr-ready-head">
        <div><span class="paytr-ready-kicker">PayTR Hazırlık</span><h2 class="paytr-ready-title">İletişim ve yasal bilgiler</h2><p class="paytr-ready-text">Üyelik, ödeme, destek, gizlilik ve iade süreçleri hakkında temel bilgiler.</p></div>
        <a class="paytr-ready-email" href="mailto:${esc(CONTACT_EMAIL)}">${esc(CONTACT_EMAIL)}</a>
      </div>
      <div class="paytr-ready-grid">
        ${cards.map(([id, title, text]) => `<article class="paytr-ready-card" id="${esc(id)}"><h3>${esc(title)}</h3><p>${esc(text)}</p></article>`).join("")}
      </div>
      <p class="paytr-ready-note">Şirket kuruluşu ve ödeme altyapısı tamamlandığında işletme unvanı, vergi bilgileri, adres ve sözleşme ayrıntıları bu alana eklenecektir.</p>
    `;
    const footer = document.querySelector(".site-footer") || document.querySelector("footer");
    const main = document.querySelector("main");
    if (footer && footer.parentNode) footer.parentNode.insertBefore(section, footer);
    else if (main) main.appendChild(section);
    else document.body.appendChild(section);
  };

  const enhanceFooter = () => {
    const footer = document.querySelector(".site-footer") || document.querySelector("footer");
    if (!footer || footer.dataset.paytrReady === "1") return;
    footer.dataset.paytrReady = "1";
    const links = document.createElement("div");
    links.className = "paytr-footer-links";
    links.innerHTML = cards.map(([id, title]) => `<a href="#${esc(id)}">${esc(title)}</a>`).join("");
    const contact = document.createElement("div");
    contact.className = "paytr-footer-contact";
    contact.innerHTML = `İletişim ve destek: <a href="mailto:${esc(CONTACT_EMAIL)}">${esc(CONTACT_EMAIL)}</a>`;
    footer.appendChild(links);
    footer.appendChild(contact);
  };

  window.addEventListener("load", () => {
    injectStyle();
    ensureSection();
    enhanceFooter();
  });
})();
