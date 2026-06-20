(() => {
  if (window.__flMembershipFormHintReady) return;
  window.__flMembershipFormHintReady = true;

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
      .membership-input.invalid{border-color:rgba(255,85,85,.68)!important;box-shadow:0 0 0 2px rgba(255,85,85,.16)}
    `;
    document.head.appendChild(style);
  };

  const panel = () => document.getElementById(PANEL_ID);
  const selectedPlan = (root) => root?.querySelector(".membership-card.selected,[data-plan][aria-pressed='true']");
  const input = (root, selector) => root?.querySelector(selector);
  const valueOf = (root, selector) => input(root, selector)?.value?.trim() || "";
  const onlyDigits = (value) => String(value || "").split("").filter((char) => char >= "0" && char <= "9").join("");
  const validEmail = (value) => {
    const email = String(value || "").trim();
    const at = email.indexOf("@");
    const dot = email.lastIndexOf(".");
    return at > 0 && dot > at + 1 && dot < email.length - 1;
  };
  const validPhone = (value) => onlyDigits(value).length >= 10;

  const improveFields = (root) => {
    const name = input(root, "[data-member-name]");
    const email = input(root, "[data-member-email]");
    const phone = input(root, "[data-member-phone]");
    if (name) {
      name.required = true;
      name.autocomplete = "name";
      name.enterKeyHint = "next";
    }
    if (email) {
      email.type = "email";
      email.required = true;
      email.autocomplete = "email";
      email.inputMode = "email";
      email.enterKeyHint = "next";
    }
    if (phone) {
      phone.type = "tel";
      phone.required = true;
      phone.autocomplete = "tel";
      phone.inputMode = "tel";
      phone.enterKeyHint = "done";
      phone.maxLength = 18;
    }
  };

  const validation = (root) => {
    const missing = [];
    const invalid = [];
    const email = valueOf(root, "[data-member-email]");
    const phone = valueOf(root, "[data-member-phone]");
    const emailInput = input(root, "[data-member-email]");
    const phoneInput = input(root, "[data-member-phone]");

    if (!selectedPlan(root)) missing.push(labels.plan);
    if (!valueOf(root, "[data-member-name]")) missing.push(labels.name);
    if (!email) missing.push(labels.email);
    if (!phone) missing.push(labels.phone);

    const badEmail = Boolean(email && !validEmail(email));
    const badPhone = Boolean(phone && !validPhone(phone));
    if (badEmail) invalid.push("Geçerli e-posta yaz");
    if (badPhone) invalid.push("Telefon en az 10 rakam olmalı");

    emailInput?.classList.toggle("invalid", badEmail);
    phoneInput?.classList.toggle("invalid", badPhone);

    return { missing, invalid, ready: missing.length === 0 && invalid.length === 0 };
  };

  const setButtons = (root, ready) => {
    const trial = root.querySelector("[data-trial-start]");
    const payment = root.querySelector("[data-payment-start]");
    if (trial) trial.disabled = !ready;
    if (payment) payment.disabled = !ready;
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

  const renderMessage = (root, state, forced = false) => {
    const hint = ensureHint(root);
    setButtons(root, state.ready);
    hint.classList.toggle("ok", state.ready);
    const warnings = [...state.missing, ...state.invalid];
    if (warnings.length) {
      const prefix = forced ? "İşlem durduruldu" : "Devam etmek için kontrol et";
      hint.innerHTML = `<strong>${prefix}:</strong> ${warnings.join(", ")}. Bilgiler doğru olunca 1 Gün Ücretsiz Dene ve Kartla Satın Al butonları aktif olur.`;
      const output = root.querySelector("[data-membership-output]");
      if (forced && output) output.innerHTML = hint.innerHTML;
    } else {
      hint.innerHTML = `<strong>Hazır:</strong> Paket ve iletişim bilgileri doğru. Deneme veya satın alma adımına geçebilirsin.`;
    }
  };

  const updateHint = () => {
    addStyle();
    const root = panel();
    if (!root) return;
    improveFields(root);
    renderMessage(root, validation(root));
  };

  const schedule = () => window.setTimeout(updateHint, 30);

  document.addEventListener("click", (event) => {
    const panelRoot = panel();
    const submitButton = event.target.closest?.("#membership-payment-panel [data-trial-start], #membership-payment-panel [data-payment-start]");
    if (submitButton && panelRoot) {
      const state = validation(panelRoot);
      if (!state.ready) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        submitButton.disabled = true;
        renderMessage(panelRoot, state, true);
        return;
      }
    }
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
