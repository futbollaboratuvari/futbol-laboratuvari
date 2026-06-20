(() => {
  const PANEL_ID = "membership-payment-panel";

  const root = () => document.getElementById(PANEL_ID);
  const value = (panel, selector) => panel?.querySelector(selector)?.value?.trim() || "";
  const selectedPlan = (panel) => panel?.querySelector(".membership-card.selected,[data-plan][aria-pressed='true']");
  const digits = (text) => String(text || "").split("").filter((char) => char >= "0" && char <= "9").join("");
  const emailReady = (text) => {
    const email = String(text || "").trim();
    const at = email.indexOf("@");
    const dot = email.lastIndexOf(".");
    return at > 0 && dot > at + 1 && dot < email.length - 1;
  };

  const warnings = (panel) => {
    const list = [];
    const email = value(panel, "[data-member-email]");
    const phone = value(panel, "[data-member-phone]");
    if (!selectedPlan(panel)) list.push("Paket seçimi");
    if (!value(panel, "[data-member-name]")) list.push("Ad Soyad");
    if (!email) list.push("E-posta");
    if (email && !emailReady(email)) list.push("Geçerli e-posta yaz");
    if (!phone) list.push("Telefon");
    if (phone && digits(phone).length < 10) list.push("Telefon en az 10 rakam olmalı");
    return list;
  };

  const showWarning = (panel, list) => {
    const message = `<strong>İşlem durduruldu:</strong> ${list.join(", ")}. Bilgileri tamamlayınca tekrar dene.`;
    const hint = panel.querySelector("[data-membership-missing-hint]");
    const output = panel.querySelector("[data-membership-output]");
    if (hint) {
      hint.classList.remove("ok");
      hint.innerHTML = message;
    }
    if (output) output.innerHTML = message;
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("#membership-payment-panel [data-trial-start], #membership-payment-panel [data-payment-start]");
    if (!button) return;
    const panel = root();
    const list = warnings(panel);
    if (!list.length) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    button.disabled = true;
    showWarning(panel, list);
  }, true);
})();
