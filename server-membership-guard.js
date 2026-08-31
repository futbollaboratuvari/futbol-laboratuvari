(() => {
  if (window.__flServerMembershipGuardReady) return;
  window.__flServerMembershipGuardReady = true;

  const BASE = "https://lnngvkitcwwgrljtjwsd.supabase.co/functions/v1/fl-bank-transfer";
  const START_TRIAL_URL = `${BASE}?action=start-trial`;
  const CONSUME_URL = `${BASE}?action=consume-analysis`;
  const ACCESS_KEY = "fl_premium_beta_access";
  const CODE_KEY = "fl_premium_code_entered";
  const MEMBER_KEY = "fl_premium_membership";
  const CLIENT_KEY = "fl_premium_client_id";
  const TRIAL_KEY = "fl_premium_trial";
  let analyzeBypass = false;

  const getClientId = () => {
    let id = localStorage.getItem(CLIENT_KEY);
    if (!id) {
      id = crypto?.randomUUID?.() || `client-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(CLIENT_KEY, id);
    }
    return id;
  };

  const panel = () => document.getElementById("membership-payment-panel");
  const output = () => panel()?.querySelector("[data-membership-output]");
  const digits = (value) => String(value || "").replace(/\D+/g, "");
  const validEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const normalizeMembership = (value = {}) => {
    const membership = value && typeof value === "object" ? value : {};
    return {
      ...membership,
      planCode: String(membership.planCode ?? membership.plan_code ?? "").trim(),
      planName: String(membership.planName ?? membership.plan_name ?? "Üyelik").trim() || "Üyelik",
      remainingAnalysisCount: 9999,
      unlimited: true,
      expiresAt: membership.expiresAt ?? membership.expires_at ?? "",
      active: membership.active !== false,
    };
  };

  async function request(url, payload) {
    const response = await fetch(url, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.ok === false) {
      throw new Error(data.error || data.message || "İşlem tamamlanamadı.");
    }
    return data;
  }

  const customer = () => {
    const root = panel();
    return {
      name: root?.querySelector('[data-customer-field="name"]')?.value?.trim() || "",
      email: root?.querySelector('[data-customer-field="email"]')?.value?.trim().toLowerCase() || "",
      phone: root?.querySelector('[data-customer-field="phone"]')?.value?.trim() || "",
    };
  };

  const validateCustomer = (value) => {
    const errors = [];
    if (!value.name) errors.push("Ad Soyad");
    if (!value.email || !validEmail(value.email)) errors.push("geçerli E-posta");
    if (!value.phone || digits(value.phone).length < 10) errors.push("geçerli Telefon");
    return errors;
  };

  const saveServerTrial = (data, planId, info) => {
    const membership = normalizeMembership(data.membership);
    const expiresAt = Date.parse(membership.expiresAt || "") || (Date.now() + 86400000);
    localStorage.setItem(ACCESS_KEY, "1");
    localStorage.setItem(CODE_KEY, String(data.trial_code || ""));
    localStorage.setItem(MEMBER_KEY, JSON.stringify(membership));
    localStorage.setItem(TRIAL_KEY, JSON.stringify({
      planId,
      planName: membership.planName || "1 Günlük Deneme",
      customerName: info.name,
      customerEmail: info.email,
      customerPhone: info.phone,
      startedAt: Date.now(),
      expiresAt,
      serverControlled: true,
    }));
    localStorage.setItem("fl_premium_access_note", "trial");
    localStorage.setItem("fl_premium_access_level", membership.planCode || "trial");
  };

  async function startServerTrial(button) {
    const root = panel();
    const box = output();
    if (!root || !box) return;
    const info = customer();
    const errors = validateCustomer(info);
    if (errors.length) {
      box.innerHTML = `<strong>Eksik veya hatalı bilgi:</strong> ${esc(errors.join(", "))}. Deneme başlatılmadı.`;
      return;
    }
    const planId = button.dataset.bankTrial || "starter";
    button.disabled = true;
    box.innerHTML = "<strong>1 günlük ücretsiz deneme sunucuda kontrol ediliyor...</strong>";
    try {
      const data = await request(START_TRIAL_URL, {
        plan_id: planId,
        name: info.name,
        email: info.email,
        phone: info.phone,
        clientId: getClientId(),
      });
      saveServerTrial(data, planId, info);
      const member = normalizeMembership(data.membership);
      const end = member.expiresAt
        ? new Date(member.expiresAt).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })
        : "24 saat sonra";
      box.innerHTML = `<strong>${esc(member.planName || "1 Günlük Deneme")} aktif.</strong><br>` +
        `Bitiş: ${esc(end)}<br>Analiz kullanımı: <strong>Sınırsız</strong>` +
        (data.resumed ? "<br><small>Mevcut aktif denemen yeniden açıldı.</small>" : "<br><small>Deneme hakkın sunucuda kaydedildi.</small>");
      document.dispatchEvent(new CustomEvent("fl:trial-access-started", { detail: { membership: member, serverControlled: true } }));
    } catch (error) {
      box.innerHTML = `<strong>Deneme başlatılamadı.</strong><br>${esc(error.message)}`;
    } finally {
      button.disabled = false;
    }
  }

  const clearInvalidAccess = () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(MEMBER_KEY);
    localStorage.removeItem(CODE_KEY);
    localStorage.removeItem(TRIAL_KEY);
    localStorage.removeItem("fl_premium_access_note");
    localStorage.removeItem("fl_premium_access_level");
  };

  async function consumeOnServer(button) {
    const code = String(localStorage.getItem(CODE_KEY) || "").trim();
    const resultBox = document.querySelector("#premium-analysis-panel [data-pa-output]");
    if (!code) {
      if (document.querySelector("#premium-analysis-panel[data-pa3-root]")) {
        window.dispatchEvent(new CustomEvent("fl:premium-access-required", {
          detail: { message: "Analizi oluşturmak için üyelik kodunu gir veya üyelik seçeneklerini aç." }
        }));
      } else if (resultBox) {
        resultBox.innerHTML = "<h4>Üyelik doğrulaması gerekli</h4><p class=\"pa-small\">Kodunu yeniden doğrula veya 1 günlük denemeyi başlat.</p>";
      }
      return;
    }

    const oldText = button.textContent;
    button.disabled = true;
    button.textContent = "PRO veri ve üyelik kontrol ediliyor...";
    try {
      if (!window.FLProAnalysisAccess?.refresh) {
        throw new Error("Korumalı analiz modülü henüz hazır değil. Lütfen birkaç saniye sonra yeniden dene.");
      }
      await window.FLProAnalysisAccess.refresh(code);
      const data = await request(CONSUME_URL, { code, clientId: getClientId() });
      const membership = normalizeMembership(data.membership);
      localStorage.setItem(MEMBER_KEY, JSON.stringify(membership));
      localStorage.setItem(ACCESS_KEY, "1");

      analyzeBypass = true;
      button.disabled = false;
      button.textContent = oldText;
      button.click();
    } catch (error) {
      const message = String(error?.message || "Analiz başlatılamadı.");
      if (/süresi dol|aktif değil|geçersiz/i.test(message)) clearInvalidAccess();
      if (document.querySelector("#premium-analysis-panel[data-pa3-root]")) {
        window.dispatchEvent(new CustomEvent("fl:premium-access-error", { detail: { message } }));
      } else if (resultBox) {
        resultBox.innerHTML = `<h4>Analiz başlatılamadı</h4><p class="pa-small">${esc(message)}</p>`;
      }
      button.disabled = false;
      button.textContent = oldText;
    }
  }

  document.addEventListener("click", (event) => {
    const trial = event.target.closest?.("#membership-payment-panel [data-bank-trial]");
    if (trial) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      startServerTrial(trial);
      return;
    }

    // Üyelik köprüsü henüz butonu hazırlamadıysa eski yerel deneme akışının
    // çalışmasına izin verme. Bir sonraki tıklamada banka/deneme seçenekleri hazır olur.
    const earlyPlan = event.target.closest?.("#membership-payment-panel .membership-pay[data-plan]");
    if (earlyPlan && earlyPlan.dataset.bankBridgeEnhanced !== "1" && !window.__flBankMembershipBridgeReady) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      const box = output();
      if (box) box.innerHTML = "<strong>Üyelik seçenekleri hazırlanıyor.</strong><br>Lütfen Havale / EFT / FAST veya 1 Gün Ücretsiz Dene seçeneğini kullan.";
      return;
    }

    const analyze = event.target.closest?.("#premium-analysis-panel [data-pa-analyze]");
    if (!analyze) return;
    if (analyzeBypass) {
      analyzeBypass = false;
      return;
    }

    // Üyelik ve korumalı veri kontrolü asenkron sürerken kullanıcının seçtiği
    // analiz türünü kilitle. Böylece KG seçimi yeniden oynatılan tıklamada
    // varsayılan PRO Robot / taraf marketine dönemez.
    const activeType = document.querySelector('#premium-analysis-panel [data-pa3-type][aria-pressed="true"]')?.dataset.pa3Type
      || analyze.dataset.pa3CurrentType;
    if (activeType) analyze.dataset.pa3RequestedType = activeType;

    // Kullanıcı en az bir gerçek maç seçmiş olmalı.
    // Seçim yoksa mevcut panel kendi "En az 1 maç seç" uyarısını gösterebilir.
    const matchSelect = document.querySelector("#premium-analysis-panel [data-pa-match]");
    const hasSelection = Array.from(matchSelect?.selectedOptions || [])
      .some((option) => String(option.value || "") !== "");
    if (!hasSelection) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    consumeOnServer(analyze);
  }, true);
})();
