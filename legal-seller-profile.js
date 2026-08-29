(() => {
  "use strict";
  const SECURE_API_ORIGIN = /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname)
    || window.location.hostname.endsWith(".vercel.app")
    ? ""
    : "https://futbol-laboratuvari.vercel.app";
  const labels = {
    legalName: "Satıcı unvanı",
    address: "Açık adres",
    taxId: "Vergi kimlik numarası",
    taxOffice: "Vergi dairesi",
    email: "E-posta",
    phone: "Telefon",
    mersis: "MERSİS numarası",
  };

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[char]));

  async function boot() {
    const targets = [...document.querySelectorAll("[data-seller-profile]")];
    if (!targets.length) return;
    try {
      const response = await fetch(`${SECURE_API_ORIGIN}/api/bank-order`, { cache: "no-store", mode: "cors", credentials: "omit" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.salesEnabled || !data.seller) throw new Error("seller_profile_incomplete");
      const rows = Object.entries(labels)
        .filter(([key]) => key !== "mersis" || data.seller[key])
        .map(([key, label]) => `<div><dt>${esc(label)}</dt><dd>${esc(data.seller[key])}</dd></div>`).join("");
      targets.forEach((target) => {
        target.innerHTML = `<dl class="seller-profile">${rows}</dl>`;
        target.dataset.state = "ready";
      });
    } catch {
      targets.forEach((target) => {
        target.innerHTML = "Satıcı unvanı, açık adres, vergi ve iletişim bilgileri yapılandırılana kadar ücretli sipariş alımı kapalıdır.";
        target.dataset.state = "blocked";
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
