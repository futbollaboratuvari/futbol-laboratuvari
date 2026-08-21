(() => {
  if (window.__flBankMembershipBridgeReady) return;
  window.__flBankMembershipBridgeReady = true;

  const PANEL_ID = "membership-payment-panel";
  const SELECTED_PLAN_KEY = "fl_selected_membership_plan";
  const CUSTOMER_KEY = "fl_membership_customer_info";
  const BANK_SCRIPT_ID = "bank-transfer-payment-script";
  const API_BASE = "https://lnngvkitcwwgrljtjwsd.supabase.co/functions/v1/fl-bank-transfer";
  const VERSION = document.querySelector('meta[name="deploy-version"]')?.content?.trim() || "bank-transfer-live-v1";
  window.FL_VERIFY_CODE_URL = `${API_BASE}?action=verify-code`;

  let allowOriginalTrialClick = false;
  let timer = 0;
  const panel = () => document.getElementById(PANEL_ID);
  const digits = (value) => String(value || "").replace(/\D+/g, "");
  const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  const customerFromPanel = (root) => ({
    name: root?.querySelector('[data-customer-field="name"]')?.value?.trim() || "",
    email: root?.querySelector('[data-customer-field="email"]')?.value?.trim().toLowerCase() || "",
    phone: root?.querySelector('[data-customer-field="phone"]')?.value?.trim() || "",
  });

  const validate = (customer) => {
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
    root.querySelectorAll("[data-plan-card]").forEach((item) => item.classList.toggle("selected", item === card));
    root.querySelectorAll("[data-plan]").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    return selected;
  };

  const loadBankModule = () => {
    if (window.FLBankTransfer?.renderInto) return Promise.resolve(window.FLBankTransfer);
    return new Promise((resolve, reject) => {
      const existing = document.getElementById(BANK_SCRIPT_ID) || [...document.querySelectorAll("script[src]")].find((script) => String(script.src || "").includes("bank-transfer-payment.js"));
      const done = () => window.FLBankTransfer?.renderInto ? resolve(window.FLBankTransfer) : reject(new Error("Banka ödeme modülü yüklenemedi."));
      if (existing) {
        existing.addEventListener("load", done, { once: true });
        existing.addEventListener("error", () => reject(new Error("Banka ödeme modülü yüklenemedi.")), { once: true });
        setTimeout(() => { if (window.FLBankTransfer?.renderInto) done(); }, 0);
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

  async function openPayment(button) {
    const root = panel();
    if (!root) return;
    const output = root.querySelector("[data-membership-output]");
    if (!output) return;
    const customer = customerFromPanel(root);
    const errors = validate(customer);
    if (errors.length) {
      output.innerHTML = `<strong>Eksik veya hatalı bilgi:</strong> ${errors.join(", ")}. Ödeme talebi oluşturulmadı.`;
      return;
    }

    const selected = saveSelection(root, button, customer);
    output.innerHTML = `<strong>${selected.name || "Paket"} ödeme ekranı hazırlanıyor.</strong><br>IBAN ve FL ödeme kodu oluşmadan para göndermeyin.`;
    try {
      const bank = await loadBankModule();
      output.innerHTML = '<div data-fl-bank-checkout></div>';
      const host = output.querySelector("[data-fl-bank-checkout]");
      bank.renderInto(host, { planId: selected.id });
      const form = host.querySelector("[data-fl-bank-form]");
      const select = host.querySelector('[name="plan_id"]');
      const name = host.querySelector('[name="name"]');
      const email = host.querySelector('[name="email"]');
      const phone = host.querySelector('[name="phone"]');
      if (name) name.value = customer.name;
      if (email) email.value = customer.email;
      if (phone) phone.value = customer.phone;
      if (select && form) {
        select.value = selected.id;
        select.disabled = true;
        select.closest("label")?.setAttribute("hidden", "");
        const hidden = document.createElement("input");
        hidden.type = "hidden";
        hidden.name = "plan_id";
        hidden.value = selected.id;
        form.appendChild(hidden);
      }
      host.insertAdjacentHTML("afterbegin", '<div class="membership-bank-safety"><strong>Güvenli ödeme:</strong> Önce “Ödeme Talebi Oluştur” butonuna basın. IBAN, tutar ve FL-... açıklama kodu başarılı siparişten sonra gösterilir.</div>');
    } catch (error) {
      output.innerHTML = `<strong>Ödeme sistemi şu anda açılamadı.</strong><br>${String(error?.message || "Bağlantı hatası")}<br><strong>Sipariş kodu oluşmadan para göndermeyin.</strong>`;
    }
  }

  function startTrial(trialButton) {
    const root = panel();
    if (!root) return;
    const output = root.querySelector("[data-membership-output]");
    const customer = customerFromPanel(root);
    const errors = validate(customer);
    if (errors.length) {
      if (output) output.innerHTML = `<strong>Eksik veya hatalı bilgi:</strong> ${errors.join(", ")}. Deneme başlatılmadı.`;
      return;
    }
    const original = [...root.querySelectorAll(".membership-pay[data-plan]")].find((button) => button.dataset.plan === trialButton.dataset.bankTrial);
    if (!original) return;
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
    allowOriginalTrialClick = true;
    original.click();
    setTimeout(() => {
      const current = root.querySelector("[data-membership-output]");
      if (current && current.innerHTML.includes("PayTR")) {
        current.innerHTML = current.innerHTML.replace(/PayTR[^<]*Şimdilik üyelik kodu manuel verilecek\./, "Satın alma Havale / EFT / FAST ile yapılır.");
      }
    }, 20);
  }

  function addStyle() {
    if (document.getElementById("membership-bank-bridge-style")) return;
    const style = document.createElement("style");
    style.id = "membership-bank-bridge-style";
    style.textContent = `.membership-bank-actions{display:grid;gap:8px}.membership-trial-secondary{min-height:40px;border-radius:13px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.07);color:#f8fbff;font-weight:900;cursor:pointer}.membership-bank-safety{margin-bottom:12px;padding:12px 14px;border:1px solid rgba(255,224,138,.28);border-radius:14px;background:rgba(255,224,138,.08);color:#ffe08a;line-height:1.5;font-size:13px}`;
    document.head.appendChild(style);
  }

  function enhance() {
    addStyle();
    const root = panel();
    if (!root) return;
    const subtitle = root.querySelector(".membership-subtitle");
    if (subtitle) subtitle.textContent = "Paketini seç; Havale / EFT / FAST ödeme talebini oluştur. Banka onayından sonra üyelik kodun hazırlanır.";
    const title = root.querySelector(".membership-guide strong");
    const list = root.querySelector(".membership-guide ol");
    if (title) title.textContent = "Havale / EFT / FAST ile ödeme";
    if (list) list.innerHTML = "<li>Müşteri bilgilerini doldur.</li><li>Paketini seç.</li><li>Ödeme talebi oluştur.</li><li>Transfer açıklamasına yalnız verilen FL-... kodunu yaz.</li><li>Ödeme onaylanınca üyelik kodunu Özel Analiz panelinde kullan.</li>";
    const note = root.querySelector(".membership-customer-note");
    if (note) note.textContent = "Ödeme talebi oluşmadan para göndermeyin.";
    const small = root.querySelector(".membership-small");
    if (small) small.textContent = "Kart/PayTR kullanılmaz. Satın alma Havale / EFT / FAST ile yapılır.";

    root.querySelectorAll(".membership-pay[data-plan]").forEach((button) => {
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
  }

  const schedule = () => { clearTimeout(timer); timer = setTimeout(enhance, 40); };
  document.addEventListener("click", (event) => {
    const pay = event.target.closest?.(`#${PANEL_ID} .membership-pay[data-plan]`);
    if (pay) {
      if (allowOriginalTrialClick) { allowOriginalTrialClick = false; return; }
      event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation(); openPayment(pay); return;
    }
    const trial = event.target.closest?.(`#${PANEL_ID} [data-bank-trial]`);
    if (trial) { event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation(); startTrial(trial); }
  }, true);
  document.addEventListener("fl:runtime-ready", schedule);
  document.addEventListener("DOMContentLoaded", schedule, { once: true });
  window.addEventListener("load", schedule, { once: true });
  new MutationObserver((items) => {
    if (items.some((item) => [...item.addedNodes].some((node) => node.nodeType === 1 && (node.id === PANEL_ID || node.querySelector?.(`#${PANEL_ID}`))))) schedule();
  }).observe(document.documentElement, { childList: true, subtree: true });
  schedule();
})();
