(() => {
  const BASE = "https://lnngvkitcwwgrljtjwsd.supabase.co/functions/v1/fl-bank-transfer";
  const RECEIPT_BASE = "https://lnngvkitcwwgrljtjwsd.supabase.co/functions/v1/fl-bank-receipt";
  const API = {
    create: `${BASE}?action=create-order`,
    status: `${BASE}?action=order-status`,
    receipt: `${RECEIPT_BASE}?action=upload`,
  };

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
  const formatIban = (value) => String(value || "").replace(/\s+/g, "").replace(/(.{4})/g, "$1 ").trim();
  const money = (kurus) => new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(Number(kurus || 0) / 100);
  const digits = (value) => String(value || "").replace(/\D+/g, "");

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
  const getStatus = (orderCode, email) => request(API.status, { method: "POST", body: JSON.stringify({ order_code: orderCode, email }) });

  async function uploadReceipt(orderCode, emailAddress, file, invoice = {}) {
    if (!(file instanceof File)) throw new Error("Dekont görseli seçin.");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Dekont JPG, PNG veya WEBP olmalıdır.");
    if (file.size <= 0 || file.size > 8 * 1024 * 1024) throw new Error("Dekont en fazla 8 MB olabilir.");
    const form = new FormData();
    form.append("order_code", orderCode);
    form.append("email", emailAddress);
    form.append("receipt", file, file.name || "dekont.jpg");
    ["invoice_type", "invoice_name", "invoice_address", "tax_number", "tax_office"].forEach((key) => {
      form.append(key, String(invoice[key] || ""));
    });
    const response = await fetch(API.receipt, { method: "POST", mode: "cors", credentials: "omit", cache: "no-store", body: form });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) throw new Error(data.error || data.message || "Dekont yüklenemedi.");
    return data;
  }

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
      .fl-bank{max-width:860px;margin:16px auto 0;padding:18px;border:1px solid rgba(57,255,136,.28);border-radius:18px;background:#061126;color:#f8fbff;box-shadow:0 20px 55px rgba(0,0,0,.3)}
      .fl-bank h2,.fl-bank h3{color:#ffe08a;margin:0 0 10px}.fl-bank p{color:#aebbd0;line-height:1.55}.fl-bank-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.fl-bank label{display:grid;gap:6px;color:#d7e4f5;font-size:12px;font-weight:800}.fl-bank input,.fl-bank select,.fl-bank textarea{min-height:43px;border-radius:11px;border:1px solid rgba(255,255,255,.14);background:#020817;color:#fff;padding:0 12px}.fl-bank textarea{min-height:76px;padding:10px 12px;resize:vertical}.fl-bank input[type=file]{padding:10px;height:auto}.fl-bank button{min-height:42px;border:0;border-radius:11px;padding:0 14px;background:linear-gradient(135deg,#ff9f1c,#39ff88);color:#06110d;font-weight:950;cursor:pointer}.fl-bank button:disabled{opacity:.55;cursor:not-allowed}.fl-bank button.secondary{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:#fff}.fl-bank-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}.fl-bank-output{margin-top:16px;padding:15px;border:1px solid rgba(57,255,136,.2);border-radius:15px;background:rgba(57,255,136,.06)}.fl-bank-row{display:grid;grid-template-columns:120px 1fr auto;gap:10px;align-items:center;padding:9px 0;border-bottom:1px solid rgba(255,255,255,.07)}.fl-bank-row:last-child{border-bottom:0}.fl-bank-key{color:#9fb0c7;font-size:12px;font-weight:900}.fl-bank-value{font-weight:900;word-break:break-word}.fl-bank-note{margin-top:12px;padding:12px;border-radius:12px;background:rgba(255,224,138,.08);color:#ffe08a;font-weight:800;line-height:1.5}.fl-bank-status{margin-top:12px;color:#c8ffdd;font-weight:900}.fl-bank-error{margin-top:12px;color:#ffd0d5;font-weight:900}.fl-bank-code{font-size:18px;letter-spacing:.04em;color:#39ff88}.fl-bank-receipt,.fl-bank-invoice{margin-top:14px;padding:14px;border:1px solid rgba(255,224,138,.25);border-radius:14px;background:rgba(255,224,138,.05)}.fl-bank-receipt strong,.fl-bank-invoice strong{color:#ffe08a}.fl-bank-help{font-size:12px;color:#9fb0c7;line-height:1.5}.fl-bank-tax[hidden]{display:none!important}@media(max-width:680px){.fl-bank-grid,.fl-bank-row{grid-template-columns:1fr}.fl-bank-row button{width:max-content}}
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
        <p>Ödeme talebi oluşturulduktan sonra IBAN, tutar ve benzersiz FL kodu gösterilir. Transferden sonra dekont yüklenir; ödeme onaylandığında üyelik kodun bu ekranda görünür ve kayıtlı e-posta/telefon için bilgilendirme süreci başlatılır.</p>
        <form data-fl-bank-form>
          <div class="fl-bank-grid">
            <label>Paket<select name="plan_id"><option value="starter">Gold Paket</option><option value="pro">Diamond Paket</option><option value="vip">Premium Paket</option></select></label>
            <label>Ad Soyad<input name="name" autocomplete="name" required></label>
            <label>E-posta<input name="email" type="email" autocomplete="email" required></label>
            <label>Telefon<input name="phone" autocomplete="tel" required></label>
          </div>
          <div class="fl-bank-invoice">
            <strong>Fatura bilgileri</strong>
            <p class="fl-bank-help">Ödeme onaylandığında fatura kaydı oluşturulur. Bilgileri doğru girmen gerekir.</p>
            <div class="fl-bank-grid">
              <label>Fatura türü<select name="invoice_type" data-invoice-type><option value="individual">Bireysel</option><option value="business">Vergi mükellefi / Kurumsal</option></select></label>
              <label>Fatura adı / unvanı<input name="invoice_name" required></label>
              <label style="grid-column:1/-1">Fatura adresi<textarea name="invoice_address" required></textarea></label>
              <label class="fl-bank-tax" data-tax-field hidden>Vergi / T.C. No<input name="tax_number" inputmode="numeric" maxlength="11"></label>
              <label class="fl-bank-tax" data-tax-field hidden>Vergi dairesi<input name="tax_office"></label>
            </div>
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
    const invoiceType = root.querySelector("[data-invoice-type]");
    const invoiceName = root.querySelector('[name="invoice_name"]');
    const customerName = root.querySelector('[name="name"]');
    let activeOrder = null;

    const syncInvoiceFields = () => {
      if (invoiceName && !invoiceName.value.trim() && customerName?.value.trim()) invoiceName.value = customerName.value.trim();
      const business = invoiceType?.value === "business";
      root.querySelectorAll("[data-tax-field]").forEach((el) => el.hidden = !business);
      const taxNumber = root.querySelector('[name="tax_number"]');
      const taxOffice = root.querySelector('[name="tax_office"]');
      if (taxNumber) taxNumber.required = business;
      if (taxOffice) taxOffice.required = business;
    };
    invoiceType?.addEventListener("change", syncInvoiceFields);
    customerName?.addEventListener("input", syncInvoiceFields);
    syncInvoiceFields();

    async function showStatus() {
      if (!activeOrder) return;
      try {
        const data = await getStatus(activeOrder.order.order_code, activeOrder.email);
        const statusBox = message.querySelector("[data-status]");
        if (statusBox) {
          statusBox.textContent = data.order.status === "paid"
            ? "Ödemeniz onaylandı. Üyeliğiniz aktif; üyelik kodunuz aşağıdadır."
            : data.order.status === "payment_reported"
              ? "Dekontunuz alındı. Ödeme ve dekont kontrol ediliyor."
              : `Durum: ${data.order.status}`;
        }
        if (data.order.status === "paid" && data.membership?.code) {
          const codeBox = message.querySelector("[data-membership]");
          if (codeBox) codeBox.innerHTML = `<div class="fl-bank-note"><strong>Ödeme alındı ve üyeliğiniz açıldı.</strong><br>Üyelik kodunuz: <span class="fl-bank-code">${esc(data.membership.code)}</span> <button class="secondary" type="button" data-copy-code>Kopyala</button><br>Bu kodu Özel Analiz panelindeki Üye Kodu alanına girin. Ödeme onayı için e-posta/SMS bilgilendirmesi ayrıca işleme alınır; mesaj gecikse bile kodunuz burada geçerlidir. Fatura kaydınız yönetim sisteminde oluşturulur.</div>`;
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
      syncInvoiceFields();
      const fields = Object.fromEntries(new FormData(form).entries());
      if (!String(fields.invoice_name || "").trim() || !String(fields.invoice_address || "").trim()) {
        message.innerHTML = `<div class="fl-bank-error">Fatura adı/unvanı ve fatura adresi zorunludur.</div>`;
        return;
      }
      if (fields.invoice_type === "business") {
        const tax = digits(fields.tax_number);
        if (![10, 11].includes(tax.length) || !String(fields.tax_office || "").trim()) {
          message.innerHTML = `<div class="fl-bank-error">Kurumsal/vergi mükellefi faturası için 10 veya 11 haneli vergi/T.C. no ve vergi dairesi zorunludur.</div>`;
          return;
        }
      }

      createButton.disabled = true;
      message.innerHTML = `<div class="fl-bank-status">Sipariş oluşturuluyor...</div>`;
      try {
        const data = await createOrder(fields);
        activeOrder = {
          ...data,
          email: String(fields.email || "").trim().toLowerCase(),
          invoice: {
            invoice_type: fields.invoice_type || "individual",
            invoice_name: String(fields.invoice_name || "").trim(),
            invoice_address: String(fields.invoice_address || "").trim(),
            tax_number: digits(fields.tax_number || ""),
            tax_office: String(fields.tax_office || "").trim(),
          },
        };
        message.innerHTML = `
          <div class="fl-bank-output">
            <h3>${esc(data.order.plan_name)} — ${esc(money(data.order.amount_kurus))}</h3>
            <div class="fl-bank-row"><span class="fl-bank-key">Banka</span><span class="fl-bank-value">${esc(data.bank.bank_name || "Banka hesabı")}</span></div>
            <div class="fl-bank-row"><span class="fl-bank-key">Alıcı</span><span class="fl-bank-value">${esc(data.bank.account_holder)}</span><button class="secondary" type="button" data-copy="holder">Kopyala</button></div>
            <div class="fl-bank-row"><span class="fl-bank-key">IBAN</span><span class="fl-bank-value">${esc(formatIban(data.bank.iban))}</span><button class="secondary" type="button" data-copy="iban">Kopyala</button></div>
            <div class="fl-bank-row"><span class="fl-bank-key">Tutar</span><span class="fl-bank-value">${esc(money(data.order.amount_kurus))}</span></div>
            <div class="fl-bank-row"><span class="fl-bank-key">Açıklama</span><span class="fl-bank-value fl-bank-code">${esc(data.order.payment_reference)}</span><button class="secondary" type="button" data-copy="reference">Kopyala</button></div>
            <div class="fl-bank-note">Transfer açıklamasına yalnız <strong>${esc(data.order.payment_reference)}</strong> yazın. Tutarı ve IBAN'ı değiştirmeyin.</div>
            <div class="fl-bank-receipt">
              <strong>Ödemeden sonra dekont yükleyin</strong>
              <p style="margin:8px 0 10px">JPG, PNG veya WEBP · en fazla 8 MB. Dekont olmadan ödeme onaya gönderilmez. Yüklemeden sonra yönetim dekontu ve gerçek banka hareketini kontrol eder.</p>
              <input type="file" accept="image/jpeg,image/png,image/webp" data-receipt required>
              <div class="fl-bank-actions"><button type="button" data-upload>Dekontu Yükle ve Ödemeyi Bildir</button><button class="secondary" type="button" data-check>Durumu Kontrol Et</button></div>
            </div>
            <div class="fl-bank-status" data-status>Ödeme ve dekont bekleniyor.</div><div data-membership></div>
          </div>`;
        message.querySelector('[data-copy="holder"]')?.addEventListener("click", (e) => copy(data.bank.account_holder, e.currentTarget));
        message.querySelector('[data-copy="iban"]')?.addEventListener("click", (e) => copy(data.bank.iban, e.currentTarget));
        message.querySelector('[data-copy="reference"]')?.addEventListener("click", (e) => copy(data.order.payment_reference, e.currentTarget));
        message.querySelector("[data-upload]")?.addEventListener("click", async (event) => {
          const button = event.currentTarget;
          const file = message.querySelector("[data-receipt]")?.files?.[0];
          if (!file) { message.querySelector("[data-status]").textContent = "Önce dekont görselini seçin."; return; }
          button.disabled = true;
          message.querySelector("[data-status]").textContent = "Dekont ve fatura bilgileriniz güvenli alana yükleniyor...";
          try {
            const result = await uploadReceipt(data.order.order_code, activeOrder.email, file, activeOrder.invoice);
            message.querySelector("[data-status]").textContent = result.message || "Dekont alındı. Ödeme kontrol sırasına gönderildi.";
            const receiptInput = message.querySelector("[data-receipt]");
            if (receiptInput) receiptInput.disabled = true;
            button.textContent = "Dekont Alındı";
            await showStatus();
          } catch (error) {
            message.querySelector("[data-status]").textContent = error.message;
            button.disabled = false;
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

  window.FLBankTransfer = { createOrder, getStatus, uploadReceipt, renderInto, apiBase: BASE, receiptApiBase: RECEIPT_BASE };
})();