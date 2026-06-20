(() => {
  const PANEL_ID = "membership-payment-panel";
  const STYLE_ID = "membership-form-hint-style";

  const labels = {
    name: "Ad Soyad",
    email: "E-posta",
    phone: "Telefon",
    plan: "Paket seçimi"
  };

  const addStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .membership-missing-hint{margin-top:12px;padding:12px 14px;border:1px solid rgba(255,159,28,.26);border-radius:14px;background:rgba(255,159,28,.08);color:#ffe08a;font-size:13px;line-height:1.45}
      .membership-missing-hint strong{color:#fff7d6}.membership-missing-hint.ok{border-color:rgba(57,255,136,.28);background:rgba(57,255,136,.08);color:#c8ffdd}
    `;
    document.head.appendChild(style);
  };

  const panel = () => document.getElementById(PANEL_ID);
  const selectedPlan = (root) => root?.querySelector(".membership-card.selected,[data-plan][aria-pressed='true']");
  const valueOf = (root, selector) => root?.querySelector(selector)?.value?.trim() || "";

  const missingFields = (root) => {
    const missing = [];
    if (!selectedPlan(root)) missing.push(labels.plan);
    if (!valueOf(root, "[data-member-name]")) missing.push(labels.name);
    if (!valueOf(root, "[data-member-email]")) missing.push(labels.email);
    if (!valueOf(root, "[data-member-phone]")) missing.push(labels.phone);
    return missing;
  };

  const ensureHint = (root) => {
    let hint = root.querySelector("[data-membership-missing-hint]");
    if (!hint) {
      hint = document.createElement("div");
      hint.className = "membership-missing-hint";
      hint.dataset.membershipMissingHint = "";
      const output = root.querySelector("[data-membership-output]");
      if (output) output.insertAdjacentElement("beforebegin", hint);
      else root.appendChild(hint);
    }
    return hint;
  };

  const updateHint = () => {
    addStyle();
    const root = panel();
    if (!root) return;
    const hint = ensureHint(root);
    const missing = missingFields(root);
    hint.classList.toggle("ok", missing.length === 0);
    if (missing.length) {
      hint.innerHTML = `<strong>Devam etmek için eksik:</strong> ${missing.join(", ")}. Bu alanlar tamamlanınca 1 Gün Ücretsiz Dene ve Kartla Satın Al butonları aktif olur.`;
    } else {
      hint.innerHTML = `<strong>Hazır:</strong> Paket ve iletişim bilgileri tamamlandı. Deneme veya satın alma adımına geçebilirsin.`;
    }
  };

  const schedule = () => window.setTimeout(updateHint, 30);

  document.addEventListener("click", (event) => {
    if (event.target.closest?.("#membership-payment-panel [data-plan]")) schedule();
  }, true);
  document.addEventListener("input", (event) => {
    if (event.target.closest?.("#membership-payment-panel")) schedule();
  }, true);
  document.addEventListener("fl:runtime-ready", schedule);
  document.addEventListener("DOMContentLoaded", schedule, { once: true });
  window.addEventListener("load", schedule, { once: true });
  schedule();
})();
