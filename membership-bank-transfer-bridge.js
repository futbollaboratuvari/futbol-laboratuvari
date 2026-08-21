(() => {
  if (window.__flBankMembershipBridgeReady) return;
  window.__flBankMembershipBridgeReady = true;

  const PANEL_ID = "membership-payment-panel";
  const SELECTED_PLAN_KEY = "fl_selected_membership_plan";
  const CUSTOMER_KEY = "fl_membership_customer_info";
  const BANK_SCRIPT_ID = "bank-transfer-payment-script";
  const VERSION = document.querySelector('meta[name="deploy-version"]')?.content?.trim() || "bank-transfer-v1";
  let allowOriginalTrialClick = false;
  let enhanceTimer = 0;

  const panel = () => document.getElementById(PANEL_ID);
  const digits = value => String(value || "").replace(/\D+/g, "");
  const validEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  const customerFromPanel = root => ({
    name: root?.querySelector('[data-customer-field="name"]')?.value?.trim() || "",
    email: root?.querySelector('[data-customer-field="email"]')?.value?.trim().toLowerCase() || "",
    phone: root?.querySelector('[data-customer-field="phone"]')?.value?.trim() || "",
  });

  const validateCustomer = customer => {
    const errors = [];
    if (!customer.name) errors.push("Ad Soyad");
    if (!customer.email || !validEmail(customer.email)) errors.push("geçerli E-posta");
    if (!customer.phone || digits(customer.phone).length < 10) errors.push("geçerli Telefon");
    return errors;
  };

  const saveSelection = (root, button, customer) => {
    const card = button.closest("[data-plan-card]");
    const selected = {
      id: button.dataset.plan || "",
      name: card?.querySelector("h3")?.textContent?.trim() || "",
      price: card?.querySelector(".membership-price")?.textContent?.trim() || "",
    };
    localStorage.setItem(SELECTED_PLAN_KEY, JSON.stringify(selected));
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
    root.querySelectorAll("[data-plan-card]").forEach(item => item.classList.toggle("selected", item === card));
    root.querySelectorAll("[data-plan]").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    document.dispatchEvent(new CustomEvent("fl:membership-plan-selected", { detail: { ...selected, customer } }));
    return selected;
  };

  const loadBankModule = () => {
    if (window.FLBankTransfer?.renderInto) return Promise.resolve(window.FLBankTransfer);
    return new Promise((resolve, reject) => {
      const existing = document.getElementById(BANK_SCRIPT_ID)
        || [...document.querySelectorAll("script[src]")].find(script => String(script.getAttribute("src") || "").includes("bank-transfer-payment.js"));
      const done = () => window.FLBankTransfer?.renderInto
        ? resolve(window.FLBankTransfer)
        : reject(new Error("Banka ödeme modülü yüklenemedi."));
      if (existing) {
        if (window.FLBankTransfer?.renderInto) return done();
        existing.addEventListener("load", done, { once: true });
        existing.addEventListener("error", () => reject(new Error("Banka ödeme modülü yüklenemedi.")), { once: true });
        return;
      }
      const script = document.createElement("script");
      script.id = BANK_SCRIPT_ID;
      script.src = `bank-transfer-payment.js?v=${encodeURIComponent(VERSION)}`;
      script.async = false;
      script.addEventListener("load", done, { once: true });
      script.addEventListener("error", () => reject(new Error("Banka ödeme modülü yüklenemedi.")), { once: true });
      document.body.appendChild(script);
    });
  };

  const renderPayment = async button => {
    const root = panel();
    if (!root) return;
    const output = root.querySelector("[data-membership-output]");
    if (!output) return;

    const customer = customerFromPanel(root);
    const errors = validateCustomer(customer);
    if (errors.length) {
      output.innerHTML = `<strong>Eksik veya hatalı bilgi:</strong> ${errors.join(", ")}. Ödeme talebi oluşturulmadı.`;
      return;
    }

    const selected = saveSelection(root, button, customer);
    button.disabled = true;
    output.innerHTML = `<strong>${selected.name || "Paket"} ödeme ekranı hazırlanıyor.</strong><br>IBAN, tutar ve benzersiz ödeme açıklaması sunucudan gelmeden para göndermeyin.`;

    try {
      const bank = await loadBankModule();
      output.innerHTML = '<div data-fl-bank-checkout></div>';
      const host = output.querySelector("[data-fl-bank-checkout]");
      bank.renderInto(host, { planId: selected.id });

      const form = host.querySelector("[data-fl-bank-form]");
      const planSelect = host.querySelector('[name="plan_id"]');
      const nameInput = host.querySelector('[name="name"]');
      const emailInput = host.querySelector('[name="email"]');
      const phoneInput = host.querySelector('[name="phone"]');
      if (nameInput) nameInput.value = customer.name;
      if (emailInput) emailInput.value = customer.email;
      if (phoneInput) phoneInput.value = customer.phone;

      if (planSelect && form) {
        planSelect.value = selected.id;
        planSelect.disabled = true;
        const label = planSelect.closest("label");
        if (label) label.style.display = "none";
        const hidden = document.createElement("input");
        hidden.type = "hidden";
        hidden.name = "plan_id";
        hidden.value = selected.id;
        form.appendChild(hidden);
      }

      host.insertAdjacentHTML("afterbegin", '<div class="membership-bank-safety"><strong>Güvenli ödeme adımı:</strong> Para göndermeden önce aşağıdaki formdan “Ödeme Talebi Oluştur” butonuna basın. IBAN ve FL-... açıklama kodu yalnız başarılı siparişten sonra gösterilir.</div>');
      document.dispatchEvent(new CustomEvent("fl:bank-payment-opened", { detail: { planId: selected.id } }));
    } catch (error) {
      output.innerHTML = `<strong>Ödeme sistemi şu anda hazır değil.</strong><br>${String(error?.message || "Banka ödeme modülü açılamadı.")}<br><strong>Bu ekran sipariş kodu üretmeden para göndermeyin.</strong>`;
    } finally {
      button.disabled = false;
    }
  };

  const startOriginalTrial = trialButton => {
    const root = panel();
    if (!root) return;
    const output = root.querySelector("[data-membership-output]");
    const customer = customerFromPanel(root);
    const errors = validateCustomer(customer);
    if (errors.length) {
      if (output) output.innerHTML = `<strong>Eksik veya hatalı bilgi:</strong> ${errors.join(", ")}. Deneme başlatılmadı.`;
      return;
    }
    const original = [...root.querySelectorAll(".membership-pay[data-plan]")]
      .find(button => button.dataset.plan === trialButton.dataset.bankTrial);
    if (!original) return;
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
    allowOriginalTrialClick = true;
    original.click();
  };

  const addStyle = () => {
    if (document.getElementById("membership-bank-bridge-style")) return;
    const style = document.createElement("style");
    style.id = "membership-bank-bridge-style";
    style.textContent = `
      .membership-bank-actions{display:grid;grid-template-columns:1fr;gap:8px}
      .membership-trial-secondary{min-height:40px;border-radius:13px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.07);color:#f8fbff;font-weight:900;cursor:pointer}
      .membership-trial-secondary:hover{background:rgba(255,255,255,.11)}
      .membership-bank-safety{margin-bottom:12px;padding:12px 14px;border:1px solid rgba(255,224,138,.28);border-radius:14px;background:rgba(255,224,138,.08);color:#ffe08a;line-height:1.5;font-size:13px}
      .membership-bank-safety strong{color:#fff7d6}
    `;
    document.head.appendChild(style);
  };

  const enhancePanel = () => {
    addStyle();
    const root = panel();
    if (!root) return;

    const subtitle = root.querySelector(".membership-subtitle");
    if (subtitle) subtitle.textContent = "Paketini seç; Havale / EFT / FAST ödeme talebini oluştur. Ödeme banka hesabında onaylandığında üyelik kodun hazırlanır. 1 günlük deneme seçeneği ayrıca kullanılabilir.";

    const guide = root.querySelector(".membership-guide");
    const guideTitle = guide?.querySelector("strong");
    const guideList = guide?.querySelector("ol");
    if (guideTitle) guideTitle.textContent = "Havale / EFT / FAST ile ödeme";
    if (guideList) guideList.innerHTML = "<li>Müşteri bilgilerini doldur.</li><li>Paketini seç ve ödeme ekranını aç.</li><li>Ödeme talebi oluşturulduktan sonra IBAN, tutar ve FL-... açıklama kodunu kontrol et.</li><li>Transfer açıklamasına yalnız verilen FL-... kodunu yaz.</li><li>Banka kontrolü onaylanınca üyelik kodunu Özel Analiz panelinde kullan.</li>";

    const customerNote = root.querySelector(".membership-customer-note");
    if (customerNote) customerNote.textContent = "Bu bilgiler sipariş eşleştirmesi için kullanılır. Ödeme talebi oluşmadan para göndermeyin.";
    const small = root.querySelector(".membership-small");
    if (small) small.textContent = "Kart/PayTR kullanılmaz. Satın alma doğrudan Havale / EFT / FAST ile yapılır; 1 günlük deneme ayrı seçenektir.";

    root.querySelectorAll(".membership-pay[data-plan]").forEach(button => {
      if (button.dataset.bankBridgeEnhanced === "1") return;
      button.dataset.bankBridgeEnhanced = "1";
      button.textContent = "Havale / EFT / FAST ile Öde";
      const wrap = document.createElement("div");
      wrap.className = "membership-bank-actions";
      button.parentNode.insertBefore(wrap, button);
      wrap.appendChild(button);
      const trial = document.createElement("button");
      trial.type = "button";
      trial.className = "membership-trial-secondary";
      trial.dataset.bankTrial = button.dataset.plan || "";
      trial.textContent = "1 Gün Ücretsiz Dene";
      wrap.appendChild(trial);
    });
  };

  const scheduleEnhance = () => {
    clearTimeout(enhanceTimer);
    enhanceTimer = window.setTimeout(enhancePanel, 40);
  };

  document.addEventListener("click", event => {
    const bankButton = event.target.closest?.(`#${PANEL_ID} .membership-pay[data-plan]`);
    if (bankButton) {
      if (allowOriginalTrialClick) {
        allowOriginalTrialClick = false;
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      renderPayment(bankButton);
      return;
    }

    const trialButton = event.target.closest?.(`#${PANEL_ID} [data-bank-trial]`);
    if (trialButton) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      startOriginalTrial(trialButton);
    }
  }, true);

  document.addEventListener("fl:runtime-ready", scheduleEnhance);
  document.addEventListener("DOMContentLoaded", scheduleEnhance, { once: true });
  window.addEventListener("load", scheduleEnhance, { once: true });

  const observer = new MutationObserver(mutations => {
    if (mutations.some(item => [...item.addedNodes].some(node => node.nodeType === 1 && (node.id === PANEL_ID || node.querySelector?.(`#${PANEL_ID}`))))) {
      scheduleEnhance();
    }
  });
  if (document.documentElement) observer.observe(document.documentElement, { childList: true, subtree: true });
  scheduleEnhance();
})();
