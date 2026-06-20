(() => {
  const PLANS_URL = "./data/membership_plans.json";
  const PANEL_ID = "membership-payment-panel";
  const PAYMENT_ENDPOINT = "/api/paytr/create-payment";
  const TRIAL_ENDPOINT = "/api/me/start-trial";

  const DEFAULT_PLANS = [
    {
      id: "starter",
      name: "Gold Paket",
      price: "149 TL / 3 Gün",
      duration_days: 3,
      duration_label: "3 Gün",
      trial_label: "1 Gün Ücretsiz Deneme",
      features: ["1 gün ücretsiz deneme", "Günlük kuponları görme", "Maç bülteni ve sonuçlar", "Paket süresince 10 özel analiz hakkı"],
      cta: "Gold Paketi Seç"
    },
    {
      id: "pro",
      name: "Diamond Paket",
      price: "299 TL / 2 Hafta",
      duration_days: 14,
      duration_label: "2 Hafta",
      trial_label: "1 Gün Ücretsiz Deneme",
      features: ["1 gün ücretsiz deneme", "Özel maç analizi paneli", "Seçenek seçerek analiz isteği", "Paket süresince 40 özel analiz hakkı"],
      cta: "Diamond Paketi Seç"
    },
    {
      id: "vip",
      name: "Premium Paket",
      price: "499 TL / 4 Hafta",
      duration_days: 28,
      duration_label: "4 Hafta",
      trial_label: "1 Gün Ücretsiz Deneme",
      features: ["1 gün ücretsiz deneme", "Tüm Diamond özellikleri", "Öncelikli analiz kuyruğu", "Paket süresince 120 özel analiz hakkı"],
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

  const injectStyle = () => {
    if (document.getElementById("membership-payment-style")) return;
    const style = document.createElement("style");
    style.id = "membership-payment-style";
    style.textContent = `
      .membership-shell{position:relative;z-index:3;margin:24px clamp(18px,6vw,90px) 0;padding:18px;border:1px solid rgba(57,255,136,.24);border-radius:24px;background:linear-gradient(135deg,rgba(57,255,136,.08),transparent 32%),linear-gradient(180deg,rgba(8,23,48,.96),rgba(3,8,23,.98));box-shadow:0 28px 76px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.05)}
      .membership-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:16px}.membership-title{margin:0;color:#ffe08a;font-size:clamp(21px,2.5vw,32px);line-height:1.1}.membership-subtitle{margin:7px 0 0;color:#aebbd0;font-size:13px;max-width:760px;line-height:1.55}.membership-badge{display:inline-flex;align-items:center;gap:8px;padding:9px 12px;border:1px solid rgba(255,159,28,.34);border-radius:999px;background:rgba(255,159,28,.12);color:#ffe08a;font-size:12px;font-weight:900;white-space:nowrap}
      .membership-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}.membership-card{position:relative;overflow:hidden;display:grid;gap:13px;padding:18px;border:1px solid rgba(255,255,255,.08);border-radius:22px;background:rgba(255,255,255,.04);box-shadow:0 18px 48px rgba(0,0,0,.22);transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.membership-card:hover{transform:translateY(-3px);box-shadow:0 24px 62px rgba(0,0,0,.32)}.membership-card::before{content:"";position:absolute;inset:0 0 auto 0;height:5px;background:rgba(255,255,255,.18)}.membership-card.starter{border-color:rgba(174,187,208,.22);background:linear-gradient(180deg,rgba(174,187,208,.08),rgba(255,255,255,.035))}.membership-card.starter::before{background:linear-gradient(90deg,#aebbd0,#f8fbff)}.membership-card.pro{border-color:rgba(57,255,136,.42);background:linear-gradient(180deg,rgba(57,255,136,.12),rgba(255,255,255,.04));transform:translateY(-4px)}.membership-card.pro::before{background:linear-gradient(90deg,#39ff88,#ff9f1c)}.membership-card.vip{border-color:rgba(255,159,28,.46);background:linear-gradient(135deg,rgba(255,159,28,.14),rgba(57,255,136,.06) 48%,rgba(255,255,255,.04))}.membership-card.vip::before{background:linear-gradient(90deg,#ff9f1c,#ffe08a,#39ff88)}.membership-tier{display:inline-flex;width:max-content;align-items:center;gap:7px;padding:7px 10px;border-radius:999px;font-size:11px;font-weight:950;letter-spacing:.05em;text-transform:uppercase}.starter .membership-tier{background:rgba(174,187,208,.14);border:1px solid rgba(174,187,208,.22);color:#d7e4f5}.pro .membership-tier{background:rgba(57,255,136,.14);border:1px solid rgba(57,255,136,.32);color:#c8ffdd}.vip .membership-tier{background:rgba(255,159,28,.14);border:1px solid rgba(255,159,28,.34);color:#ffe08a}.membership-card h3{margin:0;color:#fff7d6;font-size:20px}.membership-card.pro h3{font-size:22px}.membership-price{color:#39ff88;font-size:24px;font-weight:950}.vip .membership-price{color:#ffe08a}.membership-duration{color:#ffe08a;font-size:12px;font-weight:900}.membership-card-summary{min-height:38px;color:#aebbd0;font-size:12px;line-height:1.45}.membership-trial-label{display:inline-flex;width:max-content;padding:6px 9px;border-radius:999px;border:1px solid rgba(57,255,136,.28);background:rgba(57,255,136,.10);color:#c8ffdd;font-size:11px;font-weight:950}.membership-list{display:grid;gap:8px;margin:0;padding:0;list-style:none}.membership-list li{display:flex;gap:8px;color:#d7e4f5;font-size:13px;line-height:1.45}.membership-list li::before{content:"✓";color:#39ff88;font-weight:950}.vip .membership-list li::before{color:#ffe08a}.membership-pay{min-height:44px;border:0;border-radius:14px;background:linear-gradient(135deg,#ff9f1c,#39ff88);color:#07110c;font-weight:950;cursor:pointer}.starter .membership-pay{background:linear-gradient(135deg,#d7e4f5,#39ff88)}.pro .membership-pay{background:linear-gradient(135deg,#39ff88,#ff9f1c)}.vip .membership-pay{background:linear-gradient(135deg,#ff9f1c,#ffe08a)}.membership-pay:hover{filter:brightness(1.06)}
      .membership-form{margin-top:14px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.membership-field{display:grid;gap:7px;color:#aebbd0;font-size:12px;font-weight:850;text-transform:uppercase;letter-spacing:.05em}.membership-input{width:100%;min-height:44px;border:1px solid rgba(255,159,28,.22);border-radius:13px;background:rgba(0,0,0,.25);color:#f8fbff;padding:0 12px;font-weight:800;box-sizing:border-box}.membership-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}.membership-start,.membership-trial{width:100%;min-height:46px;border:0;border-radius:14px;color:#07110c;font-weight:950;cursor:pointer}.membership-start{background:linear-gradient(135deg,#ff9f1c,#39ff88)}.membership-trial{background:linear-gradient(135deg,#39ff88,#c8ffdd)}.membership-start:disabled,.membership-trial:disabled{opacity:.52;cursor:not-allowed}
      .membership-flow{margin-top:14px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.membership-step{padding:12px;border:1px solid rgba(255,159,28,.18);border-radius:15px;background:rgba(0,0,0,.18)}.membership-step b{display:block;color:#ffe08a;margin-bottom:5px}.membership-step span{color:#aebbd0;font-size:12px;line-height:1.45}.membership-output{margin-top:14px;padding:14px;border:1px solid rgba(57,255,136,.2);border-radius:16px;background:rgba(57,255,136,.06);color:#c8ffdd;font-size:13px;line-height:1.55}.membership-output strong{color:#ffe08a}.membership-small{margin-top:10px;color:#aebbd0;font-size:12px;line-height:1.5}.membership-error{color:#ffb4b4}.membership-ok{color:#39ff88}
      @media(max-width:900px){.membership-grid,.membership-flow,.membership-form,.membership-actions{grid-template-columns:1fr}.membership-card.pro{transform:none}.membership-head{flex-direction:column}.membership-badge{width:max-content}}@media(max-width:560px){.membership-shell{margin:18px 14px 0;padding:14px}}
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

  const planDurationText = (plan) => `${plan.trial_label || "1 Gün Ücretsiz Deneme"} + satın alınca ${plan.duration_label || `${plan.duration_days} gün`}`;

  const planTone = (plan) => {
    if (plan.id === "starter") return { className: "starter", badge: "Başlangıç", icon: "🌱", summary: "Denemek ve temel erişim için sade giriş paketi." };
    if (plan.id === "pro") return { className: "pro", badge: "En Popüler", icon: "⚡", summary: "Özel maç analizi için ana önerilen paket." };
    return { className: "vip", badge: "Premium", icon: "👑", summary: "En güçlü kullanım, öncelik ve geniş analiz hakkı." };
  };

  const memberRequest = (shell, selectedPlan) => ({
    plan_id: selectedPlan?.id,
    name: shell.querySelector("[data-member-name]")?.value.trim(),
    email: shell.querySelector("[data-member-email]")?.value.trim(),
    phone: shell.querySelector("[data-member-phone]")?.value.trim(),
  });

  const render = (plans) => {
    injectStyle();
    const shell = ensureShell();
    const visiblePlans = Array.isArray(plans) && plans.length ? plans : DEFAULT_PLANS;

    shell.innerHTML = `
      <div class="membership-head">
        <div>
          <h2 class="membership-title">Üyelik & Ödeme</h2>
          <p class="membership-subtitle">Gold, Diamond ve Premium paketler ayrı tasarımla sunulur. Her pakette 1 gün ücretsiz deneme vardır.</p>
        </div>
        <span class="membership-badge">💳 Kartla Ödeme + Deneme</span>
      </div>
      <div class="membership-grid">
        ${visiblePlans.map((plan) => {
          const tone = planTone(plan);
          return `
          <article class="membership-card ${tone.className}">
            <span class="membership-tier">${tone.icon} ${esc(tone.badge)}</span>
            <h3>${esc(plan.name)}</h3>
            <div class="membership-card-summary">${esc(tone.summary)}</div>
            <div class="membership-price">${esc(plan.price)}</div>
            <div class="membership-duration">${esc(planDurationText(plan))}</div>
            <span class="membership-trial-label">${esc(plan.trial_label || "1 Gün Ücretsiz Deneme")}</span>
            <ul class="membership-list">${(plan.features || []).map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
            <button class="membership-pay" type="button" data-plan="${esc(plan.id)}">${esc(plan.cta || "Paketi Seç")}</button>
          </article>`;
        }).join("")}
      </div>
      <div class="membership-form">
        <label class="membership-field">Ad Soyad<input class="membership-input" data-member-name placeholder="Ad Soyad"></label>
        <label class="membership-field">E-posta<input class="membership-input" data-member-email placeholder="ornek@mail.com"></label>
        <label class="membership-field">Telefon<input class="membership-input" data-member-phone placeholder="05xx xxx xx xx"></label>
      </div>
      <div class="membership-actions">
        <button class="membership-trial" type="button" data-trial-start disabled>1 Gün Ücretsiz Dene</button>
        <button class="membership-start" type="button" data-payment-start disabled>Kartla Satın Al</button>
      </div>
      <div class="membership-flow">
        <div class="membership-step"><b>1. Deneme</b><span>Üye 1 gün paketi test eder.</span></div>
        <div class="membership-step"><b>2. Süre Biter</b><span>Deneme dolunca erişim kapanır.</span></div>
        <div class="membership-step"><b>3. Satın Alma</b><span>Devam etmek için kartla ödeme yapar.</span></div>
        <div class="membership-step"><b>4. Üyelik</b><span>Satın alınan paket süresi kadar panel açılır.</span></div>
      </div>
      <div class="membership-output" data-membership-output><strong>Durum:</strong> Paket seç ve üye bilgilerini doldur.</div>
      <p class="membership-small">Deneme süresi her kullanıcı için tek seferliktir. Gerçek sistemde e-posta/telefon hesabı veritabanında kontrol edilecek.</p>
    `;

    let selectedPlan = null;
    const output = shell.querySelector("[data-membership-output]");
    const startButton = shell.querySelector("[data-payment-start]");
    const trialButton = shell.querySelector("[data-trial-start]");

    const refreshButton = () => {
      const request = memberRequest(shell, selectedPlan);
      const ready = Boolean(selectedPlan && request.name && request.email && request.phone);
      startButton.disabled = !ready;
      trialButton.disabled = !ready;
    };

    shell.querySelectorAll("[data-plan]").forEach((button) => {
      button.addEventListener("click", () => {
        selectedPlan = visiblePlans.find((item) => item.id === button.dataset.plan);
        localStorage.setItem("fl_selected_membership_plan", JSON.stringify(selectedPlan || {}));
        output.innerHTML = `<strong>Seçilen paket:</strong> ${esc(selectedPlan?.name || "-")}<br><strong>Süre:</strong> ${esc(planDurationText(selectedPlan || {}))}<br><strong>Sonraki adım:</strong> 1 gün dene veya kartla satın al.`;
        refreshButton();
      });
    });

    shell.querySelectorAll("[data-member-name], [data-member-email], [data-member-phone]").forEach((input) => {
      input.addEventListener("input", refreshButton);
    });

    trialButton.addEventListener("click", async () => {
      const request = memberRequest(shell, selectedPlan);
      localStorage.setItem("fl_pending_trial_request", JSON.stringify({ ...request, created_at: new Date().toISOString() }));
      trialButton.disabled = true;
      output.innerHTML = `<strong>Deneme talebi kaydediliyor...</strong><br>1 günlük deneme erişimi için bilgilerin alındı.`;
      try {
        const response = await fetch(TRIAL_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });
        const result = await response.json();
        if (!response.ok || !result.ok) throw new Error(result.error || "Deneme başlatılamadı.");
        localStorage.setItem("fl_trial_membership", JSON.stringify(result.membership));
        output.innerHTML = `<strong class="membership-ok">1 günlük deneme başladı.</strong><br>Deneme bitince paketi satın alman gerekecek.`;
      } catch {
        output.innerHTML = `<strong class="membership-ok">Deneme talebin kaydedildi.</strong><br>Şu an site GitHub Pages üzerinde çalıştığı için canlı üyelik servisi bağlı değil. Backend ve veritabanı yayına alınınca bu buton gerçek 1 günlük denemeyi otomatik başlatacak.`;
        refreshButton();
      }
    });

    startButton.addEventListener("click", async () => {
      const request = memberRequest(shell, selectedPlan);
      localStorage.setItem("fl_pending_payment_request", JSON.stringify({ ...request, created_at: new Date().toISOString() }));
      startButton.disabled = true;
      output.innerHTML = `<strong>Satın alma talebi kaydediliyor...</strong><br>PayTR ödeme bağlantısı için bilgiler hazırlandı.`;

      try {
        const response = await fetch(PAYMENT_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
        });
        const result = await response.json();
        if (!response.ok || !result.ok || !result.iframe_url) {
          throw new Error(result.error || "Ödeme başlatılamadı.");
        }
        localStorage.setItem("fl_last_payment_order", JSON.stringify(result));
        output.innerHTML = `<strong class="membership-ok">Ödeme ekranı açılıyor.</strong><br>Sipariş: ${esc(result.order_id)}`;
        window.location.href = result.iframe_url;
      } catch {
        output.innerHTML = `<strong class="membership-ok">Satın alma talebin kaydedildi.</strong><br>Şu an PayTR/backend bağlantısı canlı olmadığı için ödeme ekranı açılmadı. PayTR ve backend yayına alınınca bu buton doğrudan güvenli ödeme ekranına yönlendirecek.`;
        refreshButton();
      }
    });
  };

  const load = async () => {
    const plans = await readJson(PLANS_URL, DEFAULT_PLANS);
    render(Array.isArray(plans) && plans.length ? plans : DEFAULT_PLANS);
    document.dispatchEvent(new CustomEvent("fl:runtime-ready"));
  };

  const start = () => {
    load();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
