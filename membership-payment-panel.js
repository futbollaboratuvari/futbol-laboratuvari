(() => {
  const PLANS_URL = "./data/membership_plans.json";
  const PANEL_ID = "membership-payment-panel";

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
      .membership-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.membership-card{display:grid;gap:13px;padding:16px;border:1px solid rgba(255,255,255,.08);border-radius:18px;background:rgba(255,255,255,.04)}.membership-card.pro{border-color:rgba(57,255,136,.28);background:linear-gradient(180deg,rgba(57,255,136,.08),rgba(255,255,255,.035))}.membership-card h3{margin:0;color:#fff7d6;font-size:18px}.membership-price{color:#39ff88;font-size:22px;font-weight:950}.membership-list{display:grid;gap:8px;margin:0;padding:0;list-style:none}.membership-list li{display:flex;gap:8px;color:#d7e4f5;font-size:13px;line-height:1.45}.membership-list li::before{content:"✓";color:#39ff88;font-weight:950}.membership-pay{min-height:44px;border:0;border-radius:14px;background:linear-gradient(135deg,#ff9f1c,#39ff88);color:#07110c;font-weight:950;cursor:pointer}.membership-pay:hover{filter:brightness(1.06)}.membership-flow{margin-top:14px;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.membership-step{padding:12px;border:1px solid rgba(255,159,28,.18);border-radius:15px;background:rgba(0,0,0,.18)}.membership-step b{display:block;color:#ffe08a;margin-bottom:5px}.membership-step span{color:#aebbd0;font-size:12px;line-height:1.45}.membership-output{margin-top:14px;padding:14px;border:1px solid rgba(57,255,136,.2);border-radius:16px;background:rgba(57,255,136,.06);color:#c8ffdd;font-size:13px;line-height:1.55}.membership-output strong{color:#ffe08a}.membership-small{margin-top:10px;color:#aebbd0;font-size:12px;line-height:1.5}
      @media(max-width:900px){.membership-grid,.membership-flow{grid-template-columns:1fr}.membership-head{flex-direction:column}.membership-badge{width:max-content}}@media(max-width:560px){.membership-shell{margin:18px 14px 0;padding:14px}}
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
          <p class="membership-subtitle">Üye paketini seçer, ödeme sağlayıcısı üzerinden güvenli ödeme yapar, ödeme başarılı olunca özel analiz paneli açılır.</p>
        </div>
        <span class="membership-badge">💳 Premium Altyapı</span>
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
      <div class="membership-flow">
        <div class="membership-step"><b>1. Üyelik</b><span>Kullanıcı hesap oluşturur ve paket seçer.</span></div>
        <div class="membership-step"><b>2. Ödeme</b><span>PayTR veya iyzico ödeme sayfasına yönlenir.</span></div>
        <div class="membership-step"><b>3. Onay</b><span>Ödeme başarılı olursa üyelik aktif olur.</span></div>
        <div class="membership-step"><b>4. Panel</b><span>Premium özel maç analiz paneli açılır.</span></div>
      </div>
      <div class="membership-output" data-membership-output><strong>Durum:</strong> Ödeme sağlayıcı hesabı ve backend bağlantısı bekleniyor.</div>
      <p class="membership-small">Kart bilgisi sitede tutulmayacak. Ödeme sağlayıcısı ödeme alacak, onay mesajı backend'e gelecek, backend üyeliği aktif edecek.</p>
    `;

    shell.querySelectorAll("[data-plan]").forEach((button) => {
      button.addEventListener("click", () => {
        const plan = plans.find((item) => item.id === button.dataset.plan);
        const output = shell.querySelector("[data-membership-output]");
        localStorage.setItem("fl_selected_membership_plan", JSON.stringify(plan || {}));
        output.innerHTML = `<strong>Seçilen paket:</strong> ${esc(plan?.name || "-")}<br><strong>Sonraki adım:</strong> PayTR/iyzico üye işyeri hesabı açılıp ödeme linki veya API entegrasyonu bağlanacak.`;
      });
    });
  };

  const load = async () => {
    const plans = await readJson(PLANS_URL, []);
    render(Array.isArray(plans) ? plans : []);
  };

  window.addEventListener("load", load);
})();
