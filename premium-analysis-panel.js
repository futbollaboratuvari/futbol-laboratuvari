(() => {
  const FIXTURES_URL = "./data/fixtures.json";
  const ARCHIVE_URL = "./data/robot_match_archive.json";
  const PANEL_ID = "premium-analysis-panel";

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const markets = [
    { key: "MS 1", label: "MS 1", icon: "🏠" },
    { key: "MS X", label: "MS X", icon: "➖" },
    { key: "MS 2", label: "MS 2", icon: "✈️" },
    { key: "2.5 Alt", label: "2.5 Alt", icon: "⬇️" },
    { key: "2.5 Üst", label: "2.5 Üst", icon: "⬆️" },
    { key: "KG Var", label: "KG Var", icon: "✅" },
    { key: "KG Yok", label: "KG Yok", icon: "🚫" },
    { key: "1Y KG Var", label: "1Y KG Var", icon: "✅" },
    { key: "1Y KG Yok", label: "1Y KG Yok", icon: "🚫" },
    { key: "2Y KG Var", label: "2Y KG Var", icon: "✅" },
    { key: "2Y KG Yok", label: "2Y KG Yok", icon: "🚫" },
    { key: "1Y/2Y KG Evet/Evet", label: "Evet/Evet", icon: "✅✅" },
    { key: "1Y/2Y KG Hayır/Hayır", label: "Hayır/Hayır", icon: "🚫🚫" },
    { key: "1Y/2Y KG Evet/Hayır", label: "Evet/Hayır", icon: "✅🚫" },
    { key: "1Y/2Y KG Hayır/Evet", label: "Hayır/Evet", icon: "🚫✅" },
    { key: "1Y KG %", label: "1Y KG %", icon: "%1" },
    { key: "2Y KG %", label: "2Y KG %", icon: "%2" },
    { key: "1Y KG % + 2Y KG %", label: "1Y KG % + 2Y KG %", icon: "%+" },
    { key: "İY 1", label: "İY 1", icon: "1️⃣" },
    { key: "İY X", label: "İY X", icon: "🔹" },
    { key: "İY 2", label: "İY 2", icon: "2️⃣" },
    { key: "2Y 1", label: "2Y 1", icon: "1️⃣" },
    { key: "2Y X", label: "2Y X", icon: "🔹" },
    { key: "2Y 2", label: "2Y 2", icon: "2️⃣" },
    { key: "İY/MS 1’den 1", label: "1’den 1", icon: "1/1" },
    { key: "İY/MS 1’den X", label: "1’den X", icon: "1/X" },
    { key: "İY/MS 1’den 2", label: "1’den 2", icon: "1/2" },
    { key: "İY/MS X’ten 1", label: "X’ten 1", icon: "X/1" },
    { key: "İY/MS X’ten X", label: "X’ten X", icon: "X/X" },
    { key: "İY/MS X’ten 2", label: "X’ten 2", icon: "X/2" },
    { key: "İY/MS 2’den 1", label: "2’den 1", icon: "2/1" },
    { key: "İY/MS 2’den X", label: "2’den X", icon: "2/X" },
    { key: "İY/MS 2’den 2", label: "2’den 2", icon: "2/2" }
  ];

  const iymsMarkets = markets.filter((market) => market.key.startsWith("İY/MS"));
  const comboKgMarkets = markets.filter((market) => market.key.startsWith("1Y/2Y KG"));
  const kgPercentMarkets = markets.filter((market) => market.key.includes("KG %"));
  const normalMarkets = markets.filter((market) => !market.key.startsWith("İY/MS") && !market.key.startsWith("1Y/2Y KG") && !market.key.includes("KG %"));

  const todayKey = () => new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

  const readJson = async (url, fallback) => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      return res.ok ? await res.json() : fallback;
    } catch {
      return fallback;
    }
  };

  const injectStyle = () => {
    if (document.getElementById("premium-analysis-style")) return;
    const style = document.createElement("style");
    style.id = "premium-analysis-style";
    style.textContent = `
      .premium-analysis-shell{position:relative;z-index:3;margin:24px clamp(18px,6vw,90px) 0;padding:18px;border:1px solid rgba(255,159,28,.28);border-radius:24px;background:linear-gradient(135deg,rgba(255,159,28,.10),transparent 32%),linear-gradient(180deg,rgba(8,23,48,.96),rgba(3,8,23,.98));box-shadow:0 28px 76px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.05)}
      .premium-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:16px}.premium-title{margin:0;color:#ffe08a;font-size:clamp(21px,2.5vw,32px);line-height:1.1}.premium-subtitle{margin:7px 0 0;color:#aebbd0;font-size:13px;max-width:760px;line-height:1.55}.premium-lock{display:inline-flex;align-items:center;gap:8px;padding:9px 12px;border:1px solid rgba(57,255,136,.32);border-radius:999px;background:rgba(57,255,136,.12);color:#c8ffdd;font-size:12px;font-weight:900;white-space:nowrap;cursor:pointer}
      .premium-grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(320px,.9fr);gap:14px}.premium-card{display:grid;gap:12px;padding:15px;border:1px solid rgba(255,255,255,.08);border-radius:18px;background:rgba(255,255,255,.04)}.premium-card h3{margin:0;color:#fff7d6;font-size:16px}.premium-label{display:grid;gap:7px;color:#aebbd0;font-size:12px;font-weight:850;text-transform:uppercase;letter-spacing:.05em}.premium-select,.premium-input{width:100%;min-height:44px;border:1px solid rgba(255,159,28,.22);border-radius:13px;background:rgba(0,0,0,.25);color:#f8fbff;padding:0 12px;font-weight:800}.premium-select[multiple]{min-height:210px;padding:10px}.premium-select option{padding:7px}.premium-multi-help{margin-top:-4px;color:#ffe08a;font-size:12px;line-height:1.45;text-transform:none;letter-spacing:0;font-weight:800}.premium-market-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}.premium-market{min-height:44px;border:1px solid rgba(255,159,28,.20);border-radius:13px;background:rgba(255,255,255,.045);color:#f8fbff;font-weight:900;cursor:pointer}.premium-market.active{border-color:rgba(57,255,136,.55);background:rgba(57,255,136,.16);color:#c8ffdd}.premium-market-group-title{margin-top:4px;color:#ffe08a;font-size:12px;font-weight:950;text-transform:uppercase;letter-spacing:.06em}.premium-action{min-height:46px;border:0;border-radius:14px;background:linear-gradient(135deg,#ff9f1c,#39ff88);color:#07110c;font-size:14px;font-weight:950;cursor:pointer}.premium-action:disabled{opacity:.48;cursor:not-allowed}.premium-note{margin:0;color:#c7d5e8;font-size:13px;line-height:1.55}.premium-output{display:grid;gap:12px}.premium-result{display:grid;gap:10px;padding:14px;border:1px solid rgba(57,255,136,.20);border-radius:16px;background:rgba(57,255,136,.06)}.premium-result h4{margin:0;color:#c8ffdd}.premium-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 10px;border-radius:12px;background:rgba(0,0,0,.18);color:#aebbd0;font-size:12px}.premium-row strong{color:#f8fbff}.premium-factor-list{display:grid;gap:8px}.premium-factor{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(255,255,255,.035);color:#d7e4f5;font-size:12px}.premium-gate{display:grid;gap:10px;padding:13px;border:1px dashed rgba(255,159,28,.32);border-radius:16px;background:rgba(255,159,28,.06)}.premium-gate-row{display:grid;grid-template-columns:1fr auto;gap:8px}.premium-small{color:#aebbd0;font-size:12px;line-height:1.5}.premium-status-ok{color:#39ff88;font-weight:950}.premium-status-wait{color:#ffe08a;font-weight:950}
      @media(max-width:900px){.premium-grid{grid-template-columns:1fr}.premium-market-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.premium-head{flex-direction:column}.premium-lock{width:max-content}}@media(max-width:560px){.premium-analysis-shell{margin:18px 14px 0;padding:14px}.premium-gate-row{grid-template-columns:1fr}.premium-market-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  };

  const ensureShell = () => {
    let shell = document.getElementById(PANEL_ID);
    if (!shell) {
      shell = document.createElement("section");
      shell.id = PANEL_ID;
      shell.className = "premium-analysis-shell";
      shell.setAttribute("aria-label", "Özel maç analizi");
    }
    const main = document.querySelector("main");
    if (main && shell.parentElement !== main) main.appendChild(shell);
    else if (!main && !shell.parentElement) document.body.appendChild(shell);
    return shell;
  };

  const isUnlocked = () => localStorage.getItem("fl_premium_beta_access") === "1";
  const unlock = () => false;

  const teamSummary = (archive, team) => {
    const item = archive?.team_index?.[team];
    if (!item) return "Arşiv verisi bekleniyor";
    const recent = Array.isArray(item.recent) ? item.recent.map((r) => r.result).join("-") : "-";
    return `${item.finished || 0} biten maç / G:${item.wins || 0} B:${item.draws || 0} M:${item.losses || 0} / Form: ${recent || "-"}`;
  };

  const fixtureTitle = (match) => `${match.time || "--:--"} | ${match.home || "Ev sahibi"} - ${match.away || "Deplasman"}`;
  const todayList = (fixtures) => fixtures.filter((m) => m.date === todayKey()).sort((a,b) => String(a.time || "99:99").localeCompare(String(b.time || "99:99")));
  const buildOptions = (fixtures) => {
    const list = todayList(fixtures);
    if (!list.length) return `<option value="">Bugünün maç listesi hazırlanıyor</option>`;
    return list.map((match, index) => `<option value="${index}">${esc(match.league || "Lig")} — ${esc(fixtureTitle(match))}</option>`).join("");
  };

  const selectedIndexes = (shell) => Array.from(shell.querySelector("[data-premium-match]")?.selectedOptions || [])
    .map((opt) => Number(opt.value))
    .filter((n) => Number.isInteger(n) && n >= 0);

  const marketButtons = (list, unlocked) => list.map((m) => `<button class="premium-market" type="button" data-market="${esc(m.key)}" ${unlocked ? "" : "disabled"}>${m.icon} ${esc(m.label)}</button>`).join("");

  const render = (fixtures, archive) => {
    injectStyle();
    const shell = ensureShell();
    const unlocked = isUnlocked();
    shell.innerHTML = `
      <div class="premium-head"><div><h2 class="premium-title">Özel Maç / Kupon Analizi</h2><p class="premium-subtitle">Üye kodunu aşağıdaki kod kutusuna yaz. Kod açılınca maç ve seçenek seçerek özel analiz oluşturabilirsin.</p></div><button class="premium-lock" type="button">🔐 Üye Kodunu Gir</button></div>
      <div class="premium-grid">
        <div class="premium-card">
          <h3>Maçlar ve Seçenek</h3>
          ${unlocked ? "" : `<div class="premium-gate"><strong class="premium-status-wait">Panel kilitli</strong><span class="premium-small">Paket aldıysan sana verilen kodu aşağıdaki kutuya yaz ve Kod ile Aç butonuna bas.</span><div class="premium-gate-row"><input class="premium-input" type="password" inputmode="text" autocomplete="one-time-code" placeholder="Üye / kurucu kodu" data-premium-code><button class="premium-action" type="button" data-premium-unlock>Kod ile Aç</button></div><span class="premium-small" data-premium-code-message>Kod girilmeden özel analiz paneli açılmaz.</span></div>`}
          <label class="premium-label">Maç Listesi<select class="premium-select" data-premium-match multiple size="8" ${unlocked ? "" : "disabled"}>${buildOptions(fixtures)}</select></label>
          <div class="premium-multi-help">Birden fazla maç seçmek için Ctrl tuşuna basılı tutarak seçim yap. Mobilde maçlara tek tek dokun.</div>
          <div class="premium-label">Seçenekler
            <div class="premium-market-group-title">Ana Marketler</div><div class="premium-market-grid">${marketButtons(normalMarkets, unlocked)}</div>
            <div class="premium-market-group-title">1.Yarı / 2.Yarı KG</div><div class="premium-market-grid">${marketButtons(comboKgMarkets, unlocked)}</div>
            <div class="premium-market-group-title">KG Yüzde Analizi</div><div class="premium-market-grid">${marketButtons(kgPercentMarkets, unlocked)}</div>
            <div class="premium-market-group-title">İY/MS Marketleri</div><div class="premium-market-grid">${marketButtons(iymsMarkets, unlocked)}</div>
          </div>
          <button class="premium-action" data-premium-analyze ${unlocked ? "" : "disabled"}>Kupon Analizi Başlat</button>
          <p class="premium-note">1 maç seçilirse tek maç analizi; 2 ve üzeri maç seçilirse kupon analizi oluşturulur.</p>
        </div>
        <div class="premium-card premium-output" data-premium-output><h3>Kupon Widget</h3><div class="premium-result"><h4>Hazır bekliyor</h4><p class="premium-note">Maçlar ve seçenek seçildiğinde kupon analizi burada oluşur.</p></div></div>
      </div>`;

    let selectedMarket = "";
    shell.querySelectorAll("[data-market]").forEach((button) => {
      button.addEventListener("click", () => {
        shell.querySelectorAll("[data-market]").forEach((b) => b.classList.remove("active"));
        button.classList.add("active");
        selectedMarket = button.dataset.market || "";
      });
    });

    const lockButton = shell.querySelector(".premium-lock");
    if (lockButton) {
      lockButton.addEventListener("click", () => {
        const input = shell.querySelector("[data-premium-code]");
        const gate = shell.querySelector(".premium-gate");
        if (gate) gate.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => input?.focus(), 250);
      });
    }

    const unlockButton = shell.querySelector("[data-premium-unlock]");
    if (unlockButton) {
      unlockButton.addEventListener("click", () => {
        if (unlock()) render(fixtures, archive);
      });
    }

    const analyzeButton = shell.querySelector("[data-premium-analyze]");
    if (analyzeButton) {
      analyzeButton.addEventListener("click", () => {
        const indexes = selectedIndexes(shell);
        const list = todayList(fixtures);
        const matches = indexes.map((index) => list[index]).filter(Boolean);
        const output = shell.querySelector("[data-premium-output]");
        if (!matches.length || !selectedMarket) {
          output.innerHTML = `<h3>Kupon Widget</h3><div class="premium-result"><h4>Eksik seçim</h4><p class="premium-note">En az 1 maç ve 1 seçenek seç.</p></div>`;
          return;
        }
        const request = { created_at: new Date().toISOString(), matches, market: selectedMarket, status: matches.length > 1 ? "coupon_analysis_ready" : "single_analysis_ready", source: "premium_member_panel" };
        localStorage.setItem("fl_last_premium_request", JSON.stringify(request));
        output.innerHTML = `<h3>Kupon Widget</h3><div class="premium-result"><h4>${matches.length} maç analiz kuyruğu hazır</h4><div class="premium-row"><span>Seçenek</span><strong>${esc(selectedMarket)}</strong></div><div class="premium-row"><span>Maç Sayısı</span><strong>${matches.length}</strong></div><div class="premium-factor-list">${matches.map((match, i) => `<span class="premium-factor">${i + 1}. ${esc(match.home)} - ${esc(match.away)} · ${esc(match.league || "Lig")}</span>`).join("")}<span class="premium-factor">🧠 Robot her maçı ayrı ayrı analiz edip kupon kartı oluşturacak.</span></div></div>`;
      });
    }
  };

  const boot = async () => {
    const [fixtures, archive] = await Promise.all([readJson(FIXTURES_URL, []), readJson(ARCHIVE_URL, { matches: [], team_index: {} })]);
    render(Array.isArray(fixtures) ? fixtures : [], archive || {});
  };

  window.addEventListener("load", boot);
})();