(() => {
  const FIXTURES_URL = "./data/fixtures.json";
  const ARCHIVE_URL = "./data/robot_match_archive.json";
  const PANEL_ID = "premium-analysis-panel";
  const ACCESS_KEY = "FL-BETA";

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
    { key: "İY 1", label: "İY 1", icon: "1️⃣" },
    { key: "İY X", label: "İY X", icon: "🔹" },
    { key: "İY 2", label: "İY 2", icon: "2️⃣" }
  ];

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
      .premium-head{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:16px}.premium-title{margin:0;color:#ffe08a;font-size:clamp(21px,2.5vw,32px);line-height:1.1}.premium-subtitle{margin:7px 0 0;color:#aebbd0;font-size:13px;max-width:760px;line-height:1.55}.premium-lock{display:inline-flex;align-items:center;gap:8px;padding:9px 12px;border:1px solid rgba(57,255,136,.32);border-radius:999px;background:rgba(57,255,136,.12);color:#c8ffdd;font-size:12px;font-weight:900;white-space:nowrap}
      .premium-grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(320px,.9fr);gap:14px}.premium-card{display:grid;gap:12px;padding:15px;border:1px solid rgba(255,255,255,.08);border-radius:18px;background:rgba(255,255,255,.04)}.premium-card h3{margin:0;color:#fff7d6;font-size:16px}.premium-label{display:grid;gap:7px;color:#aebbd0;font-size:12px;font-weight:850;text-transform:uppercase;letter-spacing:.05em}.premium-select,.premium-input{width:100%;min-height:44px;border:1px solid rgba(255,159,28,.22);border-radius:13px;background:rgba(0,0,0,.25);color:#f8fbff;padding:0 12px;font-weight:800}.premium-market-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}.premium-market{min-height:44px;border:1px solid rgba(255,159,28,.20);border-radius:13px;background:rgba(255,255,255,.045);color:#f8fbff;font-weight:900;cursor:pointer}.premium-market.active{border-color:rgba(57,255,136,.55);background:rgba(57,255,136,.16);color:#c8ffdd}.premium-action{min-height:46px;border:0;border-radius:14px;background:linear-gradient(135deg,#ff9f1c,#39ff88);color:#07110c;font-size:14px;font-weight:950;cursor:pointer}.premium-action:disabled{opacity:.48;cursor:not-allowed}.premium-note{margin:0;color:#c7d5e8;font-size:13px;line-height:1.55}.premium-output{display:grid;gap:12px}.premium-result{display:grid;gap:10px;padding:14px;border:1px solid rgba(57,255,136,.20);border-radius:16px;background:rgba(57,255,136,.06)}.premium-result h4{margin:0;color:#c8ffdd}.premium-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 10px;border-radius:12px;background:rgba(0,0,0,.18);color:#aebbd0;font-size:12px}.premium-row strong{color:#f8fbff}.premium-factor-list{display:grid;gap:8px}.premium-factor{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(255,255,255,.035);color:#d7e4f5;font-size:12px}.premium-gate{display:grid;gap:10px;padding:13px;border:1px dashed rgba(255,159,28,.32);border-radius:16px;background:rgba(255,159,28,.06)}.premium-gate-row{display:grid;grid-template-columns:1fr auto;gap:8px}.premium-small{color:#aebbd0;font-size:12px;line-height:1.5}.premium-status-ok{color:#39ff88;font-weight:950}.premium-status-wait{color:#ffe08a;font-weight:950}
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
  const unlock = (code) => {
    if (String(code || "").trim().toUpperCase() === ACCESS_KEY) {
      localStorage.setItem("fl_premium_beta_access", "1");
      return true;
    }
    return false;
  };

  const teamSummary = (archive, team) => {
    const item = archive?.team_index?.[team];
    if (!item) return "Arşiv verisi bekleniyor";
    const recent = Array.isArray(item.recent) ? item.recent.map((r) => r.result).join("-") : "-";
    return `${item.finished || 0} biten maç / G:${item.wins || 0} B:${item.draws || 0} M:${item.losses || 0} / Form: ${recent || "-"}`;
  };

  const fixtureTitle = (match) => `${match.time || "--:--"} | ${match.home || "Ev sahibi"} - ${match.away || "Deplasman"}`;

  const buildOptions = (fixtures) => {
    const today = todayKey();
    const list = fixtures.filter((m) => m.date === today).sort((a,b) => String(a.time || "99:99").localeCompare(String(b.time || "99:99")));
    if (!list.length) return `<option value="">Bugünün maç listesi hazırlanıyor</option>`;
    return `<option value="">Maç seç</option>` + list.map((match, index) => `<option value="${index}">${esc(match.league || "Lig")} — ${esc(fixtureTitle(match))}</option>`).join("");
  };

  const render = (fixtures, archive) => {
    injectStyle();
    const shell = ensureShell();

    const unlocked = isUnlocked();
    shell.innerHTML = `
      <div class="premium-head">
        <div>
          <h2 class="premium-title">Özel Maç Analizi</h2>
          <p class="premium-subtitle">Üyeler maç listesinden karşılaşma seçer, istediği seçeneği işaretler ve robot o maça özel analiz kuyruğu oluşturur.</p>
        </div>
        <span class="premium-lock">🔐 Ücretli Üye Alanı</span>
      </div>
      <div class="premium-grid">
        <div class="premium-card">
          <h3>Maç ve Seçenek</h3>
          ${unlocked ? "" : `<div class="premium-gate"><strong class="premium-status-wait">Panel kilitli</strong><span class="premium-small">Beta erişim kodu girilince seçim paneli açılır.</span><div class="premium-gate-row"><input class="premium-input" data-premium-code placeholder="Beta erişim kodu"><button class="premium-action" data-premium-unlock>Aç</button></div></div>`}
          <label class="premium-label">Maç Listesi<select class="premium-select" data-premium-match ${unlocked ? "" : "disabled"}>${buildOptions(fixtures)}</select></label>
          <div class="premium-label">Seçenekler<div class="premium-market-grid">${markets.map((m) => `<button class="premium-market" type="button" data-market="${esc(m.key)}" ${unlocked ? "" : "disabled"}>${m.icon} ${esc(m.label)}</button>`).join("")}</div></div>
          <button class="premium-action" data-premium-analyze ${unlocked ? "" : "disabled"}>Analiz Başlat</button>
          <p class="premium-note">Bu bölüm premium akışın çekirdeğidir. Seçim yapıldığında robot; maç arşivi, takım formu, oran alanları ve günlük veriyle analiz kuyruğu hazırlar.</p>
        </div>
        <div class="premium-card premium-output" data-premium-output>
          <h3>Analiz Durumu</h3>
          <div class="premium-result"><h4>Hazır bekliyor</h4><p class="premium-note">Maç ve seçenek seçildiğinde analiz özeti burada oluşur.</p></div>
        </div>
      </div>
    `;

    let selectedMarket = "";
    shell.querySelectorAll("[data-market]").forEach((button) => {
      button.addEventListener("click", () => {
        shell.querySelectorAll("[data-market]").forEach((b) => b.classList.remove("active"));
        button.classList.add("active");
        selectedMarket = button.dataset.market || "";
      });
    });

    const unlockButton = shell.querySelector("[data-premium-unlock]");
    if (unlockButton) {
      unlockButton.addEventListener("click", () => {
        const code = shell.querySelector("[data-premium-code]")?.value;
        if (unlock(code)) render(fixtures, archive);
        else shell.querySelector("[data-premium-code]").value = "";
      });
    }

    const analyzeButton = shell.querySelector("[data-premium-analyze]");
    if (analyzeButton) {
      analyzeButton.addEventListener("click", () => {
        const index = Number(shell.querySelector("[data-premium-match]")?.value);
        const todayFixtures = fixtures.filter((m) => m.date === todayKey()).sort((a,b) => String(a.time || "99:99").localeCompare(String(b.time || "99:99")));
        const match = todayFixtures[index];
        const output = shell.querySelector("[data-premium-output]");
        if (!match || !selectedMarket) {
          output.innerHTML = `<h3>Analiz Durumu</h3><div class="premium-result"><h4>Eksik seçim</h4><p class="premium-note">Maç ve seçenek seç.</p></div>`;
          return;
        }
        const request = {
          created_at: new Date().toISOString(),
          match,
          market: selectedMarket,
          status: "analysis_queue_ready",
          source: "premium_member_panel"
        };
        localStorage.setItem("fl_last_premium_request", JSON.stringify(request));
        output.innerHTML = `
          <h3>Analiz Durumu</h3>
          <div class="premium-result">
            <h4>Analiz kuyruğu hazır</h4>
            <div class="premium-row"><span>Maç</span><strong>${esc(match.home)} - ${esc(match.away)}</strong></div>
            <div class="premium-row"><span>Seçenek</span><strong>${esc(selectedMarket)}</strong></div>
            <div class="premium-row"><span>Lig</span><strong>${esc(match.league || "-")}</strong></div>
            <div class="premium-factor-list">
              <span class="premium-factor">📊 Ev sahibi formu: ${esc(teamSummary(archive, match.home))}</span>
              <span class="premium-factor">📈 Deplasman formu: ${esc(teamSummary(archive, match.away))}</span>
              <span class="premium-factor">🧠 Robot arşiv kontrolü: ${archive?.matches?.length || 0} maçlık hafıza</span>
              <span class="premium-factor">⚙️ Durum: <b class="premium-status-ok">Robot analiz isteği hazır</b></span>
            </div>
          </div>`;
      });
    }
  };

  const load = async () => {
    const fixtures = await readJson(FIXTURES_URL, []);
    const archive = await readJson(ARCHIVE_URL, { matches: [], team_index: {} });
    render(Array.isArray(fixtures) ? fixtures : [], archive);
    document.dispatchEvent(new CustomEvent("fl:runtime-ready"));
  };

  const start = () => {
    load();
    setInterval(load, 5 * 60 * 1000);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
