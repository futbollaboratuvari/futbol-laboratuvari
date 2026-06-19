(() => {
  const PLANS_URL = "./data/membership_plans.json";
  const PANEL_ID = "membership-payment-panel";
  const PAYMENT_ENDPOINT = "/api/paytr/create-payment";

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
      .membership-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.membership-card{display:grid;gap:13px;padding:16px;border:1px solid rgba(255,255,255,.08);border-radius:18px;background:rgba(255,255,255,.04)}.membership-card.pro{border-color:rgba(57,255,136,.28);background:linear-gradient(180deg,rgba(57,255,136,.08),rgba(255,255,255,.035))}.membership-card h3{margin:0;color:#fff7d6;font-size:18px}.membership-price{color:#39ff88;font-size:22px;font-weight:950}.membership-list{display:grid;gap:8px;margin:0;padding:0;list-style:none}.membership-list li{display:flex;gap:8px;color:#d7e4f5;font-size:13px;line-height:1.45}.membership-list li::before{content:"✓";color:#39ff88;font-weight:950}.membership-pay{min-height:44px;border:0;border-radius:14px;background:linear-gradient(135deg,#ff9f1c,#39ff88);color:#07110c;font-weight:950;cursor:pointer}.membership-pay:hover{filter:brightness(1.06)}
      .membership-form{margin-top:14px;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.membership-field{display:grid;gap:7px;color:#aebbd0;font-size:12px;font-weight:850;text-transform:uppercase;letter-spacing:.05em}.membership-input{width:100%;min-height:44px;border:1px solid rgba(255,159,28,.22);border-radius:13px;background:rgba(0,0,0,.25);color:#f8fbff;padding:0 12px;font-weight:800;box-sizing:border-box}.membership-start{margin-top:10px;width:100%;min-height:46px;border:0;border-radius:14px;background:linear-gradient(135deg,#ff9f1c,#39ff88);color:#07110c;font-weight:950;cursor:pointer}.membership-start:disabled{opacity:.52;cursor:not-allowed}
      .membership-flow{margin-top:14px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.membership-step{padding:12px;border:1px solid rgba(255,159,28,.18);border-radius:15px;background:rgba(0,0,0,.18)}.membership-step b{display:block;color:#ffe08a;margin-bottom:5px}.membership-step span{color:#aebbd0;font-size:12px;line-height:1.45}.membership-output{margin-top:14px;padding:14px;border:1px solid rgba(57,255,136,.2);border-radius:16px;background:rgba(57,255,136,.06);color:#c8ffdd;font-size:13px;line-height:1.55}.membership-output strong{color:#ffe08a}.membership-small{margin-top:10px;color:#aebbd0;font-size:12px;line-height:1.5}.membership-error{color:#ffb4b4}.membership-ok{color:#39ff88}
      @media(max-width:900px){.membership-grid,.membership-flow,.membership-form{grid-template-columns:1fr}.membership-head{flex-direction:column}.membership-badge{width:max-content}}@media(max-width:560px){.membership-shell{margin:18px 14px 0;padding:14px}}
    `;
    document.head.appendChild(style);
  };

  const render = (plans) => {
    injectStyle();
    let shell = document.getElementById(PANEL_ID);
    if (!shell) {
      shell = document.createElement("section");
      shell.id = PANEL_ID;
      shell.className = "membership-shell";
      shell.setAttribute("aria-label", "Üyelik ve ödeme paneli");
      const target = document.getElementById("premium-analysis-panel") || document.querySelector("#kupon-merkezi") || document.querySelector("main");
      if (target && target.parentNode) target.parentNode.insertBefore(shell, target);
      else document.body.appendChild(shell);
    }

    shell.innerHTML = `
      <div class="membership-head">
        <div>
          <h2 class="membership-title">Üyelik & Ödeme</h2>
          <p class="membership-subtitle">Üye paketini seçer, kartla güvenli ödeme yapar, ödeme başarılı olunca özel analiz paneli açılır.</p>
        </div>
        <span class="membership-badge">💳 Kartla Ödeme</span>
      </div>
      <div class="membership-grid">
        ${plans.map((plan) => `
          <article class="membership-card ${plan.id === "pro" ? "pro" : ""}">
            <h3>${esc(plan.name)}</h3>
            <div class="membership-price">${esc(plan.price)}</div>
            <ul class="membership-list">${(plan.features || []).map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
            <button class="membership-pay" type="button" data-plan="${esc(plan.id)}">${esc(plan.cta || "Paketi Seç")}</button>
          </article>
        `).join("")}
      </div>
      <div class="membership-form">
        <label class="membership-field">Ad Soyad<input class="membership-input" data-member-name placeholder="Ad Soyad"></label>
        <label class="membership-field">E-posta<input class="membership-input" data-member-email placeholder="ornek@mail.com"></label>
        <label class="membership-field">Telefon<input class="membership-input" data-member-phone placeholder="05xx xxx xx xx"></label>
      </div>
      <button class="membership-start" type="button" data-payment-start disabled>Kartla Ödemeye Geç</button>
      <div class="membership-flow">
        <div class="membership-step"><b>1. Paket</b><span>Kullanıcı paket seçer.</span></div>
        <div class="membership-step"><b>2. Bilgi</b><span>Ad, e-posta ve telefon girer.</span></div>
        <div class="membership-step"><b>3. Kart</b><span>PayTR güvenli ödeme ekranı açılır.</span></div>
        <div class="membership-step"><b>4. Panel</b><span>Ödeme onaylanınca üyelik açılır.</span></div>
      </div>
      <div class="membership-output" data-membership-output><strong>Durum:</strong> Paket seç ve üye bilgilerini doldur.</div>
      <p class="membership-small">Kart bilgisi Futbol Laboratuvarı sitesinde tutulmaz. Ödeme PayTR güvenli ödeme ekranında yapılır.</p>
    `;

    let selectedPlan = null;
    const output = shell.querySelector("[data-membership-output]");
    const startButton = shell.querySelector("[data-payment-start]");

    const refreshButton = () => {
      const name = shell.querySelector("[data-member-name]")?.value.trim();
      const email = shell.querySelector("[data-member-email]")?.value.trim();
      const phone = shell.querySelector("[data-member-phone]")?.value.trim();
      startButton.disabled = !(selectedPlan && name && email && phone);
    };

    shell.querySelectorAll("[data-plan]").forEach((button) => {
      button.addEventListener("click", () => {
        selectedPlan = plans.find((item) => item.id === button.dataset.plan);
        localStorage.setItem("fl_selected_membership_plan", JSON.stringify(selectedPlan || {}));
        output.innerHTML = `<strong>Seçilen paket:</strong> ${esc(selectedPlan?.name || "-")}<br><strong>Sonraki adım:</strong> Üye bilgilerini doldur ve kartla ödemeye geç.`;
        refreshButton();
      });
    });

    shell.querySelectorAll("[data-member-name], [data-member-email], [data-member-phone]").forEach((input) => {
      input.addEventListener("input", refreshButton);
    });

    startButton.addEventListener("click", async () => {
      const request = {
        plan_id: selectedPlan?.id,
        name: shell.querySelector("[data-member-name]")?.value.trim(),
        email: shell.querySelector("[data-member-email]")?.value.trim(),
        phone: shell.querySelector("[data-member-phone]")?.value.trim(),
      };
      localStorage.setItem("fl_pending_payment_request", JSON.stringify({ ...request, created_at: new Date().toISOString() }));
      startButton.disabled = true;
      output.innerHTML = `<strong>Ödeme hazırlanıyor...</strong><br>PayTR güvenli ödeme ekranı açılacak.`;

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
      } catch (error) {
        output.innerHTML = `<strong class="membership-error">Ödeme şu anda başlatılamadı.</strong><br>${esc(error.message)}<br><small>PayTR bilgileri ve backend yayını tamamlanınca bu buton canlı çalışacak.</small>`;
        refreshButton();
      }
    });
  };

  const load = async () => {
    const plans = await readJson(PLANS_URL, []);
    render(Array.isArray(plans) ? plans : []);
  };

  window.addEventListener("load", load);
})();
