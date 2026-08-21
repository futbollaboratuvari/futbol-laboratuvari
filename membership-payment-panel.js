(() => {
  const PLANS_URL = "./data/membership_plans.json";
  const PANEL_ID = "membership-payment-panel";
  const SELECTED_PLAN_KEY = "fl_selected_membership_plan";
  const CUSTOMER_KEY = "fl_membership_customer_info";
  const ACCESS_KEY = "fl_premium_beta_access";
  const MEMBER_KEY = "fl_premium_membership";
  const TRIAL_KEY = "fl_premium_trial";
  const TRIAL_MS = 24 * 60 * 60 * 1000;

  const DEFAULT_PLANS = [
    { id: "starter", name: "Gold Paket", price: "149 TL / 3 Gün", duration_label: "3 Gün", trial_label: "1 Gün Ücretsiz Deneme", features: ["10 özel analiz hakkı", "Günlük kuponları görme", "Maç bülteni ve sonuçlar", "Özel Analiz paneli öncelikli erişim"] },
    { id: "pro", name: "Diamond Paket", price: "299 TL / 2 Hafta", duration_label: "2 Hafta", trial_label: "1 Gün Ücretsiz Deneme", features: ["40 özel analiz hakkı", "Özel maç analizi paneli", "Seçenek seçerek analiz isteği", "Daha geniş analiz geçmişi"] },
    { id: "vip", name: "Premium Paket", price: "499 TL / 4 Hafta", duration_label: "4 Hafta", trial_label: "1 Gün Ücretsiz Deneme", features: ["120 özel analiz hakkı", "Tüm Diamond özellikleri", "Öncelikli analiz kuyruğu", "Yüksek oranlı özel analiz odağı"] }
  ];

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");

  const readJson = async (url, fallback) => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      return res.ok ? await res.json() : fallback;
    } catch {
      return fallback;
    }
  };

  const readStored = (key) => {
    try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
  };

  const trialCountForPlan = (plan) => plan?.id === "vip" ? 120 : plan?.id === "pro" ? 40 : 10;

  const activateTrial = (plan, customer) => {
    const startedAt = Date.now();
    const expiresAt = startedAt + TRIAL_MS;
    localStorage.setItem(TRIAL_KEY, JSON.stringify({ planId: plan.id, planName: plan.name, customerName: customer.name, customerEmail: customer.email, customerPhone: customer.phone, startedAt, expiresAt }));
    localStorage.setItem(ACCESS_KEY, "1");
    localStorage.setItem(MEMBER_KEY, JSON.stringify({ planCode: plan.id, planName: `${plan.name} Deneme`, remainingAnalysisCount: trialCountForPlan(plan), trial: true }));
    localStorage.setItem("fl_premium_access_note", "trial");
    localStorage.setItem("fl_premium_access_level", "trial");
    return expiresAt;
  };

  const injectStyle = () => {
    if (document.getElementById("membership-payment-style")) return;
    const style = document.createElement("style");
    style.id = "membership-payment-style";
    style.textContent = `
      .membership-shell{position:relative;z-index:3;margin:24px clamp(18px,6vw,90px) 0;padding:18px;border:1px solid rgba(57,255,136,.24);border-radius:24px;background:linear-gradient(180deg,rgba(8,23,48,.96),rgba(3,8,23,.98));box-shadow:0 28px 76px rgba(0,0,0,.38)}
      .membership-head{display:flex;justify-content:space-between;gap:18px;margin-bottom:16px}.membership-title{margin:0;color:#ffe08a;font-size:clamp(21px,2.5vw,32px)}.membership-subtitle,.membership-small,.membership-customer-note{color:#aebbd0;font-size:12px;line-height:1.5}.membership-badge{padding:9px 12px;border:1px solid rgba(255,159,28,.34);border-radius:999px;color:#ffe08a;background:rgba(255,159,28,.12);font-size:12px;font-weight:900;height:max-content}
      .membership-guide,.membership-customer{display:grid;gap:10px;margin:12px 0;padding:14px;border:1px solid rgba(57,255,136,.2);border-radius:16px;background:rgba(57,255,136,.06);color:#d7e4f5;font-size:13px}.membership-guide ol{margin:0;padding-left:19px}.membership-customer-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.membership-customer label{display:grid;gap:6px;color:#d7e4f5;font-size:12px;font-weight:900}.membership-customer input{min-height:40px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(2,8,23,.72);color:#fff;padding:0 12px}
      .membership-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.membership-card{display:grid;gap:12px;padding:18px;border:1px solid rgba(255,255,255,.09);border-radius:22px;background:rgba(255,255,255,.04)}.membership-card.selected{border-color:rgba(57,255,136,.75)}.membership-card h3{margin:0;color:#fff7d6;font-size:20px}.membership-price{color:#39ff88;font-size:24px;font-weight:950}.membership-duration{color:#ffe08a;font-size:12px;font-weight:900}.membership-trial-label{width:max-content;padding:6px 9px;border-radius:999px;background:rgba(57,255,136,.1);color:#c8ffdd;font-size:11px;font-weight:950}.membership-list{display:grid;gap:8px;margin:0;padding:0;list-style:none}.membership-list li{color:#d7e4f5;font-size:13px}.membership-list li::before{content:"✓ ";color:#39ff88;font-weight:950}.membership-pay{min-height:44px;border:0;border-radius:14px;background:linear-gradient(135deg,#ff9f1c,#39ff88);color:#07110c;font-weight:950;cursor:pointer}.membership-output{margin-top:14px;padding:14px;border:1px solid rgba(57,255,136,.2);border-radius:16px;background:rgba(57,255,136,.06);color:#c8ffdd;font-size:13px;line-height:1.55}
      @media(max-width:900px){.membership-grid,.membership-customer-grid{grid-template-columns:1fr}.membership-head{flex-direction:column}}@media(max-width:560px){.membership-shell{margin:18px 14px 0;padding:14px}}
    `;
    document.head.appendChild(style);
  };

  const ensureShell = () => {
    let shell = document.getElementById(PANEL_ID);
    if (!shell) {
      shell = document.createElement("section");
      shell.id = PANEL_ID;
      shell.className = "membership-shell";
      shell.setAttribute("aria-label", "Üyelik ve ödeme paneli");
    }
    const main = document.querySelector("main");
    if (main && shell.parentElement !== main) main.appendChild(shell);
    else if (!main && !shell.parentElement) document.body.appendChild(shell);
    return shell;
  };

  const startTrial = (shell, plan) => {
    const customer = {
      name: shell.querySelector('[data-customer-field="name"]')?.value?.trim() || "",
      email: shell.querySelector('[data-customer-field="email"]')?.value?.trim() || "",
      phone: shell.querySelector('[data-customer-field="phone"]')?.value?.trim() || ""
    };
    const output = shell.querySelector("[data-membership-output]");
    if (!customer.name || !customer.email || !customer.phone) {
      output.innerHTML = "<strong>Eksik bilgi:</strong> Ad Soyad, E-posta ve Telefon alanlarını doldurun.";
      return;
    }
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
    const expiresAt = activateTrial(plan, customer);
    output.innerHTML = `<strong>${esc(plan.name)} 1 günlük deneme aktif.</strong><br>Deneme bitişi: ${esc(new Date(expiresAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" }))}<br>Satın alma Havale / EFT / FAST ile yapılır.`;
    document.dispatchEvent(new CustomEvent("fl:trial-access-started", { detail: { plan, customer, expiresAt } }));
  };

  const render = (plans) => {
    injectStyle();
    const shell = ensureShell();
    const visiblePlans = Array.isArray(plans) && plans.length ? plans : DEFAULT_PLANS;
    const selected = readStored(SELECTED_PLAN_KEY);
    const customer = readStored(CUSTOMER_KEY);
    shell.innerHTML = `
      <div class="membership-head"><div><h2 class="membership-title">Üyelik Paketleri</h2><p class="membership-subtitle">Paketini seç; Havale / EFT / FAST ödeme talebini oluştur. Banka onayından sonra üyelik kodun hazırlanır.</p></div><span class="membership-badge">Güvenli banka transferi</span></div>
      <div class="membership-guide"><strong>Havale / EFT / FAST ile ödeme</strong><ol><li>Müşteri bilgilerini doldur.</li><li>Paketini seç.</li><li>Ödeme talebi oluştur.</li><li>Transfer açıklamasına yalnız verilen FL-... kodunu yaz.</li><li>Onay sonrası üyelik kodunu kullan.</li></ol></div>
      <div class="membership-customer"><strong>Müşteri Bilgileri</strong><div class="membership-customer-grid"><label>Ad Soyad<input data-customer-field="name" value="${esc(customer.name || "")}"></label><label>E-posta<input data-customer-field="email" type="email" value="${esc(customer.email || "")}"></label><label>Telefon<input data-customer-field="phone" value="${esc(customer.phone || "")}"></label></div><div class="membership-customer-note">Ödeme talebi oluşmadan para göndermeyin.</div></div>
      <div class="membership-grid">${visiblePlans.map((plan) => `<article class="membership-card${selected.id === plan.id ? " selected" : ""}" data-plan-card><span class="membership-trial-label">${esc(plan.trial_label || "1 Gün Ücretsiz Deneme")}</span><h3>${esc(plan.name)}</h3><div class="membership-price">${esc(plan.price || "")}</div><div class="membership-duration">${esc(plan.duration_label || "")}</div><ul class="membership-list">${(plan.features || []).map((f) => `<li>${esc(f)}</li>`).join("")}</ul><button type="button" class="membership-pay" data-plan="${esc(plan.id)}">Havale / EFT / FAST ile Öde</button></article>`).join("")}</div>
      <div class="membership-output" data-membership-output>Bir paket seçerek ödeme talebini başlatabilir veya 1 günlük ücretsiz denemeyi kullanabilirsiniz.</div>
      <div class="membership-small">Kartlı ödeme kullanılmaz. Satın alma Havale / EFT / FAST ile yapılır.</div>`;

    shell.querySelectorAll(".membership-pay[data-plan]").forEach((button) => {
      button.addEventListener("click", () => {
        const plan = visiblePlans.find((item) => item.id === button.dataset.plan);
        if (!plan) return;
        localStorage.setItem(SELECTED_PLAN_KEY, JSON.stringify({ id: plan.id, name: plan.name, price: plan.price || "" }));
        shell.querySelectorAll("[data-plan-card]").forEach((card) => card.classList.toggle("selected", card === button.closest("[data-plan-card]")));
        startTrial(shell, plan);
      });
    });
  };

  readJson(PLANS_URL, DEFAULT_PLANS).then((data) => render(Array.isArray(data) ? data : data?.plans || DEFAULT_PLANS));
})();
