(() => {
  const PLANS_URL = "./data/membership_plans.json";
  const PANEL_ID = "membership-payment-panel";
  const SELECTED_PLAN_KEY = "fl_selected_membership_plan";
  const CUSTOMER_KEY = "fl_membership_customer_info";
  const PAYTR_CREATE_PAYMENT_URL = "https://futbol-laboratuvari.vercel.app/api/paytr/create-payment";

  const DEFAULT_PLANS = [
    {
      id: "starter",
      name: "Gold Paket",
      price: "149 TL / 3 Gün",
      duration_label: "3 Gün",
      trial_label: "1 Gün Ücretsiz Deneme",
      features: ["10 özel analiz hakkı", "Günlük kuponları görme", "Maç bülteni ve sonuçlar", "Özel Analiz paneli öncelikli erişim"],
      cta: "Gold Paketi Seç"
    },
    {
      id: "pro",
      name: "Diamond Paket",
      price: "299 TL / 2 Hafta",
      duration_label: "2 Hafta",
      trial_label: "1 Gün Ücretsiz Deneme",
      features: ["40 özel analiz hakkı", "Özel maç analizi paneli", "Seçenek seçerek analiz isteği", "Daha geniş analiz geçmişi"],
      cta: "Diamond Paketi Seç"
    },
    {
      id: "vip",
      name: "Premium Paket",
      price: "499 TL / 4 Hafta",
      duration_label: "4 Hafta",
      trial_label: "1 Gün Ücretsiz Deneme",
      features: ["120 özel analiz hakkı", "Tüm Diamond özellikleri", "Öncelikli analiz kuyruğu", "Yüksek oranlı özel analiz odağı"],
      cta: "Premium Paketi Seç"
    }
  ];

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const readJson = async (url, fallback) => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      return res.ok ? await res.json() : fallback;
    } catch {
      return fallback;
    }
  };

  const readSelected = () => {
    try {
      return JSON.parse(localStorage.getItem(SELECTED_PLAN_KEY) || "{}");
    } catch {
      return {};
    }
  };

  const readCustomer = () => {
    try {
      return JSON.parse(localStorage.getItem(CUSTOMER_KEY) || "{}");
    } catch {
      return {};
    }
  };

  const saveCustomerFromShell = (shell) => {
    const customer = {
      name: shell.querySelector('[data-customer-field="name"]')?.value?.trim() || "",
      email: shell.querySelector('[data-customer-field="email"]')?.value?.trim() || "",
      phone: shell.querySelector('[data-customer-field="phone"]')?.value?.trim() || ""
    };
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
    return customer;
  };

  const customerReady = (customer) => Boolean(customer?.name && customer?.email && customer?.phone);

  const planTone = (plan) => {
    if (plan.id === "starter") return { className: "starter", badge: "Başlangıç", icon: "🌱", summary: "Denemek ve temel özel analiz erişimi için giriş paketi." };
    if (plan.id === "pro") return { className: "pro", badge: "En Popüler", icon: "⚡", summary: "Özel maç analizi için ana önerilen paket." };
    return { className: "vip", badge: "Premium", icon: "👑", summary: "En güçlü kullanım, öncelik ve geniş analiz hakkı." };
  };

  const paymentBody = (plan, customer) => {
    const data = new URLSearchParams();
    data.set("plan_id", plan.id);
    data.set("name", customer.name);
    data.set("email", customer.email);
    data.set("phone", customer.phone);
    return data;
  };

  const startPayment = async (button, output, plan, customer) => {
    if (!plan) return;

    if (!customerReady(customer)) {
      output.innerHTML = `<strong>Eksik bilgi:</strong> Kartla satın almak için Ad Soyad, E-posta ve Telefon alanlarını doldur.`;
      return;
    }

    const oldText = button.textContent;
    button.disabled = true;
    button.textContent = "Ödeme açılıyor...";
    output.innerHTML = `<strong>Ödeme hazırlanıyor:</strong> ${esc(plan.name)} için PayTR ödeme ekranı açılacak.`;

    try {
      const response = await fetch(PAYTR_CREATE_PAYMENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
        body: paymentBody(plan, customer)
      });
      const result = await response.json();

      if (!response.ok || !result.ok || !result.iframe_url) {
        output.innerHTML = `<strong>Ödeme başlatılamadı:</strong> ${esc(result.error || "Bilinmeyen hata")}`;
        button.disabled = false;
        button.textContent = oldText;
        return;
      }

      output.innerHTML = `<strong>Ödeme ekranı açılıyor:</strong> ${esc(plan.name)} için PayTR sayfasına yönlendiriliyorsun.`;
      window.location.href = result.iframe_url;
    } catch (error) {
      output.innerHTML = `<strong>Ödeme bağlantısı kurulamadı:</strong> Lütfen tekrar dene.`;
      button.disabled = false;
      button.textContent = oldText;
    }
  };

  const injectStyle = () => {
    if (document.getElementById("membership-payment-style")) return;
    const style = document.createElement("style");
    style.id = "membership-payment-style";
    style.textContent = `
      .membership-shell{position:relative;z-index:3;margin:24px clamp(18px,6vw,90px) 0;padding:18px;border:1px solid rgba(57,255,136,.24);border-radius:24px;background:linear-gradient(135deg,rgba(57,255,136,.08),transparent 32%),linear-gradient(180deg,rgba(8,23,48,.96),rgba(3,8,23,.98));box-shadow:0 28px 76px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.05)}
      .membership-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:16px}.membership-title{margin:0;color:#ffe08a;font-size:clamp(21px,2.5vw,32px);line-height:1.1}.membership-subtitle{margin:7px 0 0;color:#aebbd0;font-size:13px;max-width:760px;line-height:1.55}.membership-badge{display:inline-flex;align-items:center;gap:8px;padding:9px 12px;border:1px solid rgba(255,159,28,.34);border-radius:999px;background:rgba(255,159,28,.12);color:#ffe08a;font-size:12px;font-weight:900;white-space:nowrap}
      .membership-guide{display:grid;gap:8px;margin:0 0 16px;padding:14px;border:1px solid rgba(57,255,136,.22);border-radius:16px;background:rgba(57,255,136,.07);color:#d7e4f5;font-size:13px;line-height:1.55}.membership-guide strong{color:#ffe08a}.membership-guide ol{margin:0;padding-left:19px}.membership-guide li{margin:3px 0}.membership-guide .membership-code-path{color:#c8ffdd;font-weight:950}
      .membership-customer{display:grid;gap:12px;margin:16px 0 0;padding:14px;border:1px solid rgba(255,159,28,.24);border-radius:16px;background:rgba(255,159,28,.07)}.membership-customer-title{color:#ffe08a;font-size:13px;font-weight:950}.membership-customer-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.membership-customer label{display:grid;gap:6px;color:#d7e4f5;font-size:12px;font-weight:900}.membership-customer input{min-height:40px;border-radius:12px;border:1px solid rgba(255,255,255,.12);background:rgba(2,8,23,.72);color:#fff;padding:0 12px;outline:none}.membership-customer input:focus{border-color:rgba(57,255,136,.55);box-shadow:0 0 0 2px rgba(57,255,136,.13)}.membership-customer-note{color:#aebbd0;font-size:12px;line-height:1.45}
      .membership-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.membership-card{position:relative;overflow:hidden;display:grid;gap:13px;padding:18px;border:1px solid rgba(255,255,255,.08);border-radius:22px;background:rgba(255,255,255,.04);box-shadow:0 18px 48px rgba(0,0,0,.22);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.membership-card:hover{transform:translateY(-3px);box-shadow:0 24px 62px rgba(0,0,0,.32)}.membership-card.selected{border-color:rgba(57,255,136,.78)!important;box-shadow:0 0 0 2px rgba(57,255,136,.22),0 24px 68px rgba(0,0,0,.34);transform:translateY(-5px)}.membership-card.selected::after{content:"Seçildi";position:absolute;right:14px;top:12px;padding:6px 9px;border-radius:999px;background:rgba(57,255,136,.18);border:1px solid rgba(57,255,136,.42);color:#c8ffdd;font-size:11px;font-weight:950}.membership-card::before{content:"";position:absolute;inset:0 0 auto 0;height:5px;background:rgba(255,255,255,.18)}.membership-card.starter::before{background:linear-gradient(90deg,#aebbd0,#f8fbff)}.membership-card.pro{border-color:rgba(57,255,136,.42);background:linear-gradient(180deg,rgba(57,255,136,.12),rgba(255,255,255,.04))}.membership-card.pro::before{background:linear-gradient(90deg,#39ff88,#ff9f1c)}.membership-card.vip{border-color:rgba(255,159,28,.46);background:linear-gradient(135deg,rgba(255,159,28,.14),rgba(57,255,136,.06) 48%,rgba(255,255,255,.04))}.membership-card.vip::before{background:linear-gradient(90deg,#ff9f1c,#ffe08a,#39ff88)}
      .membership-tier{display:inline-flex;width:max-content;align-items:center;gap:7px;padding:7px 10px;border-radius:999px;font-size:11px;font-weight:950;letter-spacing:.05em;text-transform:uppercase}.starter .membership-tier{background:rgba(174,187,208,.14);border:1px solid rgba(174,187,208,.22);color:#d7e4f5}.pro .membership-tier{background:rgba(57,255,136,.14);border:1px solid rgba(57,255,136,.32);color:#c8ffdd}.vip .membership-tier{background:rgba(255,159,28,.14);border:1px solid rgba(255,159,28,.34);color:#ffe08a}.membership-card h3{margin:0;color:#fff7d6;font-size:20px}.membership-price{color:#39ff88;font-size:24px;font-weight:950}.vip .membership-price{color:#ffe08a}.membership-duration{color:#ffe08a;font-size:12px;font-weight:900}.membership-card-summary{min-height:38px;color:#aebbd0;font-size:12px;line-height:1.45}.membership-trial-label{display:inline-flex;width:max-content;padding:6px 9px;border-radius:999px;border:1px solid rgba(57,255,136,.28);background:rgba(57,255,136,.10);color:#c8ffdd;font-size:11px;font-weight:950}.membership-list{display:grid;gap:8px;margin:0;padding:0;list-style:none}.membership-list li{display:flex;gap:8px;color:#d7e4f5;font-size:13px;line-height:1.45}.membership-list li::before{content:"✓";color:#39ff88;font-weight:950}.vip .membership-list li::before{color:#ffe08a}
      .membership-pay{min-height:44px;border:0;border-radius:14px;background:linear-gradient(135deg,#ff9f1c,#39ff88);color:#07110c;font-weight:950;cursor:pointer}.membership-pay:hover{filter:brightness(1.06)}.membership-pay:disabled{opacity:.65;cursor:wait}.membership-output{margin-top:14px;padding:14px;border:1px solid rgba(57,255,136,.2);border-radius:16px;background:rgba(57,255,136,.06);color:#c8ffdd;font-size:13px;line-height:1.55}.membership-output strong{color:#ffe08a}.membership-small{margin-top:10px;color:#aebbd0;font-size:12px;line-height:1.5}.membership-return{display:inline-flex;margin-top:10px;min-height:38px;align-items:center;justify-content:center;padding:0 13px;border-radius:12px;text-decoration:none;background:rgba(57,255,136,.12);border:1px solid rgba(57,255,136,.26);color:#c8ffdd;font-weight:950;font-size:12px}
      @media(max-width:900px){.membership-grid,.membership-customer-grid{grid-template-columns:1fr}.membership-head{flex-direction:column}.membership-badge{width:max-content}}@media(max-width:560px){.membership-shell{margin:18px 14px 0;padding:14px}}
    `;
    document.head.appendChild(style);
  };

  const ensureShell = () => {
    let shell = document.getElementById(PANEL_ID);
    if (!shell) {
      shell = document.createElement("section");
      shell.id = PANEL_ID;
      shell.className = "membership-shell";
      shell.setAttribute("aria-label", "Üyelik ve paket paneli");
    }
    const main = document.querySelector("main");
    if (main && shell.parentElement !== main) main.appendChild(shell);
    else if (!main && !shell.parentElement) document.body.appendChild(shell);
    return shell;
  };

  const render = (plans) => {
    injectStyle();
    const shell = ensureShell();
    const visiblePlans = Array.isArray(plans) && plans.length ? plans : DEFAULT_PLANS;
    const selected = readSelected();
    const customer = readCustomer();

    shell.innerHTML = `
      <div class="membership-head">
        <div>
          <h2 class="membership-title">Üyelik Paketleri</h2>
          <p class="membership-subtitle">Paketini seçtikten sonra sana verilen kodu Özel Analiz panelindeki kod kutusuna yazarsın. Kod kutusu, Özel Analiz alanındaki Ücretli Üye Alanı bölümündedir.</p>
        </div>
        <span class="membership-badge">🧠 Özel Analiz Paketi</span>
      </div>
      <div class="membership-guide" aria-label="Kod kullanım adımları">
        <strong>Kodunu nereye gireceksin?</strong>
        <ol>
          <li>Paketini seç.</li>
          <li>Aşağıdaki <span class="membership-code-path">Özel Analiz paneline dön</span> butonuna bas.</li>
          <li>Özel Analiz alanında <span class="membership-code-path">Ücretli Üye Alanı</span> yazısına tıkla.</li>
          <li>Açılan <span class="membership-code-path">Üye / kurucu kodu</span> kutusuna kodunu yaz.</li>
          <li><span class="membership-code-path">Kod ile Aç</span> butonuna bas.</li>
        </ol>
      </div>
      <div class="membership-grid">
        ${visiblePlans.map((plan) => {
          const tone = planTone(plan);
          const selectedClass = selected?.id === plan.id ? " selected" : "";
          return `
          <article class="membership-card ${tone.className}${selectedClass}" data-plan-card="${esc(plan.id)}">
            <span class="membership-tier">${tone.icon} ${esc(tone.badge)}</span>
            <h3>${esc(plan.name)}</h3>
            <div class="membership-card-summary">${esc(tone.summary)}</div>
            <div class="membership-price">${esc(plan.price)}</div>
            <div class="membership-duration">${esc(plan.duration_label || "Paket")}</div>
            <span class="membership-trial-label">${esc(plan.trial_label || "1 Gün Ücretsiz Deneme")}</span>
            <ul class="membership-list">${(plan.features || []).map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
            <button class="membership-pay" type="button" data-plan="${esc(plan.id)}" aria-pressed="${selected?.id === plan.id ? "true" : "false"}">Kartla Satın Al</button>
          </article>`;
        }).join("")}
      </div>
      <div class="membership-customer" aria-label="Müşteri bilgileri">
        <div class="membership-customer-title">Müşteri Bilgileri</div>
        <div class="membership-customer-grid">
          <label>Ad Soyad<input data-customer-field="name" type="text" placeholder="Ad Soyad" value="${esc(customer.name || "")}"></label>
          <label>E-posta<input data-customer-field="email" type="email" placeholder="ornek@mail.com" value="${esc(customer.email || "")}"></label>
          <label>Telefon<input data-customer-field="phone" type="tel" placeholder="05xx xxx xx xx" value="${esc(customer.phone || "")}"></label>
        </div>
        <div class="membership-customer-note">Devam etmek için müşteri bilgilerini doldur. Bilgiler paket seçimiyle birlikte saklanır ve ödeme bağlantısında kullanılacaktır.</div>
      </div>
      <div class="membership-output" data-membership-output><strong>Durum:</strong> ${selected?.name ? `${esc(selected.name)} seçildi.` : "Paket seç."}<br><strong>Müşteri:</strong> ${customerReady(customer) ? `${esc(customer.name)} / ${esc(customer.email)} / ${esc(customer.phone)}` : "Ad Soyad, E-posta ve Telefon bilgilerini doldur."}<br><strong>Kod girişi:</strong> Kodunu Özel Analiz panelindeki Üye / kurucu kodu kutusuna yaz.<br><a class="membership-return" href="#premium-analysis-panel">Özel Analiz paneline dön</a></div>
      <p class="membership-small">Bu alan paket seçimi ve Özel Analiz kod giriş akışı için kullanılacak.</p>
    `;

    const output = shell.querySelector("[data-membership-output]");
    shell.querySelectorAll("[data-customer-field]").forEach((input) => {
      input.addEventListener("input", () => saveCustomerFromShell(shell));
    });

    shell.querySelectorAll("[data-plan]").forEach((button) => {
      button.addEventListener("click", async () => {
        const selectedPlan = visiblePlans.find((item) => item.id === button.dataset.plan);
        const customerInfo = saveCustomerFromShell(shell);
        localStorage.setItem(SELECTED_PLAN_KEY, JSON.stringify(selectedPlan || {}));
        shell.querySelectorAll("[data-plan-card]").forEach((card) => card.classList.toggle("selected", card.dataset.planCard === button.dataset.plan));
        shell.querySelectorAll("[data-plan]").forEach((planButton) => planButton.setAttribute("aria-pressed", String(planButton === button)));
        document.dispatchEvent(new CustomEvent("fl:membership-plan-selected", { detail: { ...(selectedPlan || {}), customer: customerInfo } }));
        await startPayment(button, output, selectedPlan, customerInfo);
      });
    });
  };

  const load = async () => {
    const plans = await readJson(PLANS_URL, DEFAULT_PLANS);
    render(Array.isArray(plans) && plans.length ? plans : DEFAULT_PLANS);
    document.dispatchEvent(new CustomEvent("fl:runtime-ready"));
  };

  const start = () => load();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
