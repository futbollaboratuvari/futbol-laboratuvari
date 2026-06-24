(() => {
  const PANEL_ID = "premium-analysis-panel";
  const FIXTURES_URL = "./data/fixtures.json";
  const VERIFY_CODE_URL = window.FL_VERIFY_CODE_URL || "https://futbol-laboratuvari.vercel.app/api/verify-code";
  const ACCESS_KEY = "fl_premium_beta_access";
  const CODE_KEY = "fl_premium_code_entered";
  const MEMBER_KEY = "fl_premium_membership";
  const CLIENT_KEY = "fl_premium_client_id";
  const TRIAL_KEY = "fl_premium_trial";

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const getClientId = () => {
    let id = localStorage.getItem(CLIENT_KEY);
    if (!id) {
      id = (crypto?.randomUUID?.() || `client-${Date.now()}-${Math.random().toString(16).slice(2)}`);
      localStorage.setItem(CLIENT_KEY, id);
    }
    return id;
  };

  const readMembership = () => {
    try {
      return JSON.parse(localStorage.getItem(MEMBER_KEY) || "{}");
    } catch {
      return {};
    }
  };

  const readTrial = () => {
    try {
      return JSON.parse(localStorage.getItem(TRIAL_KEY) || "{}");
    } catch {
      return {};
    }
  };

  const isTrialActive = () => {
    const trial = readTrial();
    return Number(trial.expiresAt || 0) > Date.now();
  };

  const clearTrialAccess = () => {
    if (localStorage.getItem("fl_premium_access_note") !== "trial") return;
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(MEMBER_KEY);
    localStorage.removeItem("fl_premium_access_note");
    localStorage.removeItem("fl_premium_access_level");
  };

  const isActive = () => {
    if (localStorage.getItem(ACCESS_KEY) !== "1") return false;
    if (localStorage.getItem("fl_premium_access_note") === "trial" && !isTrialActive()) {
      clearTrialAccess();
      return false;
    }
    return true;
  };

  const accessBadgeText = () => {
    if (!isActive()) return "🔒 Üyelik kilitli";
    if (localStorage.getItem("fl_premium_access_note") === "trial") return "✅ Deneme aktif";
    return "✅ Üyelik aktif";
  };

  const trialMessage = () => {
    if (localStorage.getItem("fl_premium_access_note") !== "trial") return "Üyelik backend tarafından doğrulandı.";
    const trial = readTrial();
    const member = readMembership();
    const end = Number(trial.expiresAt || 0);
    if (!end || end <= Date.now()) return "1 günlük deneme süresi doldu. Kod veya üyelik gerekir.";
    const text = new Date(end).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });
    const remaining = member.remainingAnalysisCount ?? "Aktif";
    return `1 Günlük Deneme Aktif · Bitiş: ${text} · Kalan analiz hakkı: ${remaining}`;
  };

  const readFixtures = async () => {
    try {
      const res = await fetch(FIXTURES_URL, { cache: "no-store" });
      return res.ok ? await res.json() : [];
    } catch {
      return [];
    }
  };

  const todayKey = () => new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

  const todayMatches = (fixtures) => fixtures
    .filter((m) => m.date === todayKey())
    .sort((a, b) => String(a.time || "99:99").localeCompare(String(b.time || "99:99")));

  const verifyCode = async (code) => {
    const cleanCode = String(code || "").trim();
    if (!cleanCode) return { ok: false, message: "Kod boş olamaz." };

    try {
      const res = await fetch(VERIFY_CODE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: cleanCode, clientId: getClientId() })
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        return { ok: false, message: data.message || "Kod hatalı veya backend bağlantısı yok." };
      }

      localStorage.setItem(ACCESS_KEY, "1");
      localStorage.setItem(CODE_KEY, cleanCode);
      localStorage.setItem(MEMBER_KEY, JSON.stringify(data.membership || {}));
      localStorage.setItem("fl_premium_access_note", "backend_verified");
      localStorage.setItem("fl_premium_access_level", data.membership?.planCode || "premium");
      return { ok: true, message: data.message || "Kod kabul edildi. Üyelik aktif." };
    } catch {
      return { ok: false, message: "Backend bağlantısı kurulamadı. Vercel deploy tamamlanınca tekrar dene." };
    }
  };

  const deactivateCode = () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(CODE_KEY);
    localStorage.removeItem(MEMBER_KEY);
    localStorage.removeItem("fl_premium_access_note");
    localStorage.removeItem("fl_premium_access_level");
    localStorage.removeItem(TRIAL_KEY);
  };

  const style = () => {
    if (document.getElementById("premium-analysis-new-style")) return;
    const s = document.createElement("style");
    s.id = "premium-analysis-new-style";
    s.textContent = `
      #premium-analysis-panel{position:relative;z-index:3;margin:24px clamp(18px,6vw,90px) 0;padding:18px;border:1px solid rgba(255,159,28,.28);border-radius:24px;background:linear-gradient(180deg,rgba(8,23,48,.96),rgba(3,8,23,.98));box-shadow:0 28px 76px rgba(0,0,0,.38)}
      .pa-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;margin-bottom:14px}.pa-title{margin:0;color:#ffe08a;font-size:clamp(22px,2.5vw,34px)}.pa-sub{margin:7px 0 0;color:#aebbd0;font-size:13px;line-height:1.55}.pa-badge{padding:9px 12px;border:1px solid rgba(57,255,136,.32);border-radius:999px;background:rgba(57,255,136,.12);color:#c8ffdd;font-size:12px;font-weight:900;white-space:nowrap}
      .pa-state{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:14px}.pa-state div{padding:12px;border:1px solid rgba(57,255,136,.18);border-radius:16px;background:rgba(57,255,136,.06)}.pa-state span{display:block;color:#8fa0b5;font-size:11px;font-weight:900;text-transform:uppercase}.pa-state strong{display:block;margin-top:5px;color:#f8fbff;font-size:18px}
      .pa-grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(320px,.9fr);gap:14px}.pa-card{display:grid;gap:12px;padding:15px;border:1px solid rgba(255,255,255,.08);border-radius:18px;background:rgba(255,255,255,.04)}.pa-card h3{margin:0;color:#fff7d6;font-size:16px}
      .pa-code{display:grid;gap:10px;padding:13px;border:1px dashed rgba(255,159,28,.34);border-radius:16px;background:rgba(255,159,28,.07)}.pa-code-row{display:grid;grid-template-columns:1fr auto;gap:8px}.pa-input,.pa-select{width:100%;min-height:46px;border:1px solid rgba(255,159,28,.24);border-radius:13px;background:rgba(0,0,0,.25);color:#f8fbff;padding:0 12px;font-weight:850}.pa-select[multiple]{min-height:220px;padding:10px}.pa-button{min-height:46px;border:0;border-radius:14px;background:linear-gradient(135deg,#ff9f1c,#39ff88);color:#07110c;font-size:14px;font-weight:950;cursor:pointer;padding:0 14px}.pa-button.secondary{background:rgba(255,255,255,.08);color:#f8fbff;border:1px solid rgba(255,255,255,.16)}.pa-small{color:#aebbd0;font-size:12px;line-height:1.5}.pa-message{display:block;color:#ffe08a;font-size:12px;font-weight:900;min-height:16px;line-height:1.55}
      .pa-market-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.pa-market{min-height:42px;border:1px solid rgba(255,159,28,.20);border-radius:13px;background:rgba(255,255,255,.045);color:#f8fbff;font-weight:900;cursor:pointer}.pa-market.active{border-color:rgba(57,255,136,.55);background:rgba(57,255,136,.16);color:#c8ffdd}.pa-market:disabled,.pa-button:disabled,.pa-select:disabled{opacity:.45;cursor:not-allowed}.pa-result{display:grid;gap:10px;padding:14px;border:1px solid rgba(57,255,136,.20);border-radius:16px;background:rgba(57,255,136,.06)}.pa-row{display:flex;justify-content:space-between;gap:12px;padding:8px 10px;border-radius:12px;background:rgba(0,0,0,.18);color:#aebbd0;font-size:12px}.pa-row strong{color:#f8fbff;text-align:right}
      @media(max-width:900px){.pa-grid,.pa-state{grid-template-columns:1fr}.pa-market-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:560px){#premium-analysis-panel{margin:18px 14px 0;padding:14px}.pa-code-row{grid-template-columns:1fr}.pa-market-grid{grid-template-columns:1fr}.pa-head{display:grid}}
    `;
    document.head.appendChild(s);
  };

  const ensureShell = () => {
    let shell = document.getElementById(PANEL_ID);
    if (!shell) {
      shell = document.createElement("section");
      shell.id = PANEL_ID;
      document.querySelector("main")?.appendChild(shell) || document.body.appendChild(shell);
    }
    return shell;
  };

  const markets = ["MS 1", "MS X", "MS 2", "2.5 Üst", "2.5 Alt", "KG Var", "KG Yok", "1Y KG Var", "2Y KG Var", "İY/MS 1/1", "İY/MS X/1", "İY/MS 2/2"];

  const render = (fixtures) => {
    style();
    const active = isActive();
    const member = readMembership();
    const shell = ensureShell();
    const list = todayMatches(fixtures);
    shell.innerHTML = `
      <div class="pa-head"><div><h2 class="pa-title">Özel Maç / Kupon Analizi</h2><p class="pa-sub">Üye kodunu aşağıdaki kutuya yaz. Kod backend tarafından doğrulanınca özel analiz açılır. Paket seçersen 1 günlük deneme de açılır.</p></div><div class="pa-badge">${accessBadgeText()}</div></div>
      <div class="pa-state"><div><span>Paket</span><strong>${active ? esc(member.planName || "Premium Üye") : "Ön İzleme"}</strong></div><div><span>Kalan Kullanım</span><strong>${active ? esc(member.remainingAnalysisCount ?? "Aktif") : "Kilitli"}</strong></div><div><span>Analiz Sistemi</span><strong>Premium</strong></div></div>
      <div class="pa-grid">
        <div class="pa-card">
          <h3>Üye Kodu</h3>
          <div class="pa-code"><span class="pa-small">Paket aldıysan sana verilen kodu buraya yaz ve Kod ile Aç butonuna bas. 1 günlük deneme aktifse ayrıca kod gerekmez.</span><div class="pa-code-row"><input class="pa-input" type="password" placeholder="Üye / kurucu kodu" data-pa-code><button class="pa-button" type="button" data-pa-unlock>Kod ile Aç</button></div><span class="pa-message" data-pa-message>${active ? esc(trialMessage()) : "Kod girilmeden veya deneme açılmadan özel analiz açılmaz."}</span></div>
          <h3>Maçlar ve Seçenek</h3>
          <label class="pa-small">Maç Listesi<select class="pa-select" data-pa-match multiple size="8" ${active ? "" : "disabled"}>${list.length ? list.map((m, i) => `<option value="${i}">${esc(m.league || "Lig")} — ${esc(m.time || "--:--")} | ${esc(m.home || "Ev sahibi")} - ${esc(m.away || "Deplasman")}</option>`).join("") : `<option>Bugünün maç listesi hazırlanıyor</option>`}</select></label>
          <div class="pa-market-grid">${markets.map((m) => `<button class="pa-market" type="button" data-pa-market="${esc(m)}" ${active ? "" : "disabled"}>${esc(m)}</button>`).join("")}</div>
          <button class="pa-button" type="button" data-pa-analyze ${active ? "" : "disabled"}>Kupon Analizi Başlat</button>
        </div>
        <div class="pa-card"><h3>Kupon Widget</h3><div class="pa-result" data-pa-output><h4>Hazır bekliyor</h4><p class="pa-small">Kod aktif olup maç ve seçenek seçildiğinde analiz burada oluşur.</p></div></div>
      </div>`;

    let selectedMarket = "";
    shell.querySelectorAll("[data-pa-market]").forEach((button) => {
      button.addEventListener("click", () => {
        shell.querySelectorAll("[data-pa-market]").forEach((b) => b.classList.remove("active"));
        button.classList.add("active");
        selectedMarket = button.dataset.paMarket || "";
      });
    });

    shell.querySelector("[data-pa-unlock]")?.addEventListener("click", async () => {
      const input = shell.querySelector("[data-pa-code]");
      const button = shell.querySelector("[data-pa-unlock]");
      const msg = shell.querySelector("[data-pa-message]");
      button.disabled = true;
      if (msg) msg.textContent = "Kod backend ile kontrol ediliyor...";
      const result = await verifyCode(input?.value);
      if (!result.ok) {
        if (msg) msg.textContent = result.message;
        button.disabled = false;
        input?.focus();
        return;
      }
      if (msg) msg.textContent = result.message;
      setTimeout(() => render(fixtures), 450);
    });

    shell.querySelector("[data-pa-analyze]")?.addEventListener("click", () => {
      const select = shell.querySelector("[data-pa-match]");
      const selected = Array.from(select?.selectedOptions || []).map((o) => list[Number(o.value)]).filter(Boolean);
      const output = shell.querySelector("[data-pa-output]");
      if (!selected.length || !selectedMarket) {
        output.innerHTML = `<h4>Eksik seçim</h4><p class="pa-small">En az 1 maç ve 1 seçenek seç.</p>`;
        return;
      }
      output.innerHTML = `<h4>${selected.length} maçlık analiz hazır</h4><div class="pa-row"><span>Seçenek</span><strong>${esc(selectedMarket)}</strong></div><div class="pa-row"><span>Maç Sayısı</span><strong>${selected.length}</strong></div>${selected.map((m, i) => `<div class="pa-row"><span>${i + 1}. Maç</span><strong>${esc(m.home)} - ${esc(m.away)}</strong></div>`).join("")}`;
    });
  };

  const refresh = async () => render(await readFixtures());
  window.addEventListener("load", refresh);
  document.addEventListener("fl:trial-access-started", refresh);
})();
