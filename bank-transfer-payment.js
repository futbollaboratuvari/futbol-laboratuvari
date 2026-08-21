(() => {
  const BASE = "https://lnngvkitcwwgrljtjwsd.supabase.co/functions/v1/fl-bank-transfer";
  const API = {
    create: `${BASE}?action=create-order`,
    report: `${BASE}?action=report-payment`,
    status: `${BASE}?action=order-status`,
  };

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
  const formatIban = (value) => String(value || "").replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();
  const money = (kurus) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(Number(kurus || 0) / 100);

  async function request(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) throw new Error(data.error || data.message || "İşlem tamamlanamadı.");
    return data;
  }

  const createOrder = (payload) => request(API.create, { method: "POST", body: JSON.stringify(payload) });
  const reportPayment = (orderCode, email) => request(API.report, { method: "POST", body: JSON.stringify({ order_code: orderCode, email }) });
  const getStatus = (orderCode, email) => request(API.status, { method: "POST", body: JSON.stringify({ order_code: orderCode, email }) });

  async function copy(value, button) {
    try {
      await navigator.clipboard.writeText(String(value || ""));
      const old = button.textContent;
      button.textContent = "Kopyalandı";
      setTimeout(() => { button.textContent = old; }, 1200);
    } catch {}
  }

  function injectStyle() {
    if (document.getElementById("fl-bank-transfer-style")) return;
    const style = document.createElement("style");
    style.id = "fl-bank-transfer-style";
    style.textContent = `
      .fl-bank{max-width:820px;margin:16px auto 0;padding:18px;border:1px solid rgba(57,255,136,.28);border-radius:18px;background:#061126;color:#f8fbff;box-shadow:0 20px 55px rgba(0,0,0,.3)}
      .fl-bank h2,.fl-bank h3{color:#ffe08a;margin:0 0 10px}.fl-bank p{color:#aebbd0;line-height:1.55}.fl-bank-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.fl-bank label{display:grid;gap:6px;color:#d7e4f5;font-size:12px;font-weight:800}.fl-bank input,.fl-bank select{min-height:43px;border-radius:11px;border:1px solid rgba(255,255,255,.14);background:#020817;color:#fff;padding:0 12px}.fl-bank button{min-height:42px;border:0;border-radius:11px;padding:0 14px;background:linear-gradient(135deg,#ff9f1c,#39ff88);color:#06110d;font-weight:950;cursor:pointer}.fl-bank button:disabled{opacity:.55;cursor:not-allowed}.fl-bank button.secondary{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:#fff}.fl-bank-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}.fl-bank-output{margin-top:16px;padding:15px;border:1px solid rgba(57,255,136,.2);border-radius:15px;background:rgba(57,255,136,.06)}.fl-bank-row{display:grid;grid-template-columns:120px 1fr auto;gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.07)}.fl-bank-row:last-child{border-bottom:0}.fl-bank-key{color:#9fb0c7;font-size:12px;font-weight:900}.fl-bank-value{font-weight:900;word-break:break-word}.fl-bank-note{margin-top:12px;padding:12px;border-radius:12px;background:rgba(255,224,138,.08);color:#ffe08a;font-weight:800;line-height:1.5}.fl-bank-status{margin-top:12px;color:#c8ffdd;font-weight:900}.fl-bank-error{margin-top:12px;color:#ffd0d5;font-weight:900}.fl-bank-code{font-size:18px;letter-spacing:.04em;color:#39ff88}@media(max-width:680px){.fl-bank-grid,.fl-bank-row{grid-template-columns:1fr}.fl-bank-row button{width:max-content}}
    `;
    document.head.appendChild(style);
  }

  function renderInto(target, options = {}) {
    injectStyle();
    const root = typeof target === "string" ? document.querySelector(target) : target;
    if (!root) throw new Error("Banka transferi panel hedefi bulunamadı.");
    const initialPlan = options.planId || "pro";

    root.innerHTML = `
      <section class="fl-bank">
        <h2>Havale / EFT / FAST ile Ödeme</h2>
        <p>Ödeme talebi oluşturulduktan sonra IBAN, tutar ve benzersiz FL kodu gösterilir.</p>
        <form data-fl-bank-form>
          <div class="fl-bank-grid">
            <label>Paket<select name="plan_id"><option value="starter">Gold Paket</option><option value="pro">Diamond Paket</option><option value="vip">Premium Paket</option></select></label>
            <label>Ad Soyad<input name="name" autocomplete="name" required></label>
            <label>E-posta<input name="email" type="email" autocomplete="email" required></label>
            <label>Telefon<input name="phone" autocomplete="tel" required></label>
          </div>
          <div class="fl-bank-actions"><button type="submit" data-create>Ödeme Talebi Oluştur</button></div>
        </form>
        <div data-fl-bank-message></div>
      </section>`;

    const planSelect = root.querySelector('[name="plan_id"]');
    if (planSelect) planSelect.value = initialPlan;
    const form = root.querySelector("[data-fl-bank-form]");
    const message = root.querySelector("[data-fl-bank-message]");
    const createButton = root.querySelector("[data-create]");
    let activeOrder = null;

    async function showStatus() {
      if (!activeOrder) return;
      try {
        const data = await getStatus(activeOrder.order.order_code, activeOrder.email);
        const statusBox = message.querySelector("[data-status]");
        if (statusBox) statusBox.textContent = data.order.status === "paid" ? "Ödeme onaylandı. Üyeliğiniz hazır." : data.order.status === "payment_reported" ? "Ödeme bildirildi, banka kontrolü bekleniyor." : `Durum: ${data.order.status}`;
        if (data.order.status === "paid" && data.membership?.code) {
          const codeBox = message.querySelector("[data-membership]");
          if (codeBox) codeBox.innerHTML = `<div class="fl-bank-note">Üyelik kodunuz: <span class="fl-bank-code">${esc(data.membership.code)}</span> <button class="secondary" type="button" data-copy-code>Kopyala</button><br>Bu kodu Özel Analiz panelindeki üyelik kodu alanına girin.</div>`;
          message.querySelector("[data-copy-code]")?.addEventListener("click", (event) => copy(data.membership.code, event.currentTarget), { once: true });
        }
      } catch (error) {
        const statusBox = message.querySelector("[data-status]");
        if (statusBox) statusBox.textContent = error.message;
      }
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (createButton.disabled) return;
      createButton.disabled = true;
      message.innerHTML = `<div class="fl-bank-status">Sipariş oluşturuluyor...</div>`;
      const fields = Object.fromEntries(new FormData(form).entries());
      try {
        const data = await createOrder(fields);
        activeOrder = { ...data, email: String(fields.email || "").trim().toLowerCase() };
        message.innerHTML = `
          <div class="fl-bank-output">
            <h3>${esc(data.order.plan_name)} — ${esc(money(data.order.amount_kurus))}</h3>
            <div class="fl-bank-row"><span class="fl-bank-key">Banka</span><span class="fl-bank-value">${esc(data.bank.bank_name || "Banka hesabı")}</span></div>
            <div class="fl-bank-row"><span class="fl-bank-key">Alıcı</span><span class="fl-bank-value">${esc(data.bank.account_holder)}</span><button class="secondary" type="button" data-copy="holder">Kopyala</button></div>
            <div class="fl-bank-row"><span class="fl-bank-key">IBAN</span><span class="fl-bank-value">${esc(formatIban(data.bank.iban))}</span><button class="secondary" type="button" data-copy="iban">Kopyala</button></div>
            <div class="fl-bank-row"><span class="fl-bank-key">Tutar</span><span class="fl-bank-value">${esc(money(data.order.amount_kurus))}</span></div>
            <div class="fl-bank-row"><span class="fl-bank-key">Açıklama</span><span class="fl-bank-value fl-bank-code">${esc(data.order.payment_reference)}</span><button class="secondary" type="button" data-copy="reference">Kopyala</button></div>
            <div class="fl-bank-note">Transfer açıklamasına yalnız <strong>${esc(data.order.payment_reference)}</strong> yazın. Tutarı ve IBAN'ı değiştirmeyin.</div>
            <div class="fl-bank-actions"><button type="button" data-reported>Ödemeyi Yaptım</button><button class="secondary" type="button" data-check>Durumu Kontrol Et</button></div>
            <div class="fl-bank-status" data-status>Ödeme bekleniyor.</div><div data-membership></div>
          </div>`;
        message.querySelector('[data-copy="holder"]')?.addEventListener("click", (e) => copy(data.bank.account_holder, e.currentTarget));
        message.querySelector('[data-copy="iban"]')?.addEventListener("click", (e) => copy(data.bank.iban, e.currentTarget));
        message.querySelector('[data-copy="reference"]')?.addEventListener("click", (e) => copy(data.order.payment_reference, e.currentTarget));
        message.querySelector("[data-reported]")?.addEventListener("click", async () => {
          try {
            const result = await reportPayment(data.order.order_code, activeOrder.email);
            message.querySelector("[data-status]").textContent = result.message;
          } catch (error) {
            message.querySelector("[data-status]").textContent = error.message;
          }
        });
        message.querySelector("[data-check]")?.addEventListener("click", showStatus);
      } catch (error) {
        message.innerHTML = `<div class="fl-bank-error">${esc(error.message)}</div>`;
      } finally {
        createButton.disabled = false;
      }
    });
  }

  window.FLBankTransfer = { createOrder, reportPayment, getStatus, renderInto, apiBase: BASE };
})();
