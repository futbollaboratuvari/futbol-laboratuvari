(() => {
  function member() { try { return JSON.parse(localStorage.getItem("fl_premium_membership") || "{}"); } catch { return {}; } }
  function trialActive() { try { return Number(JSON.parse(localStorage.getItem("fl_premium_trial") || "{}").expiresAt || 0) > Date.now(); } catch { return false; } }
  function active() {
    if (localStorage.getItem("fl_premium_beta_access") !== "1") return false;
    if (localStorage.getItem("fl_premium_access_note") === "trial" && !trialActive()) return false;
    const left = Number(member().remainingAnalysisCount);
    return !(Number.isFinite(left) && left <= 0);
  }

  function style() {
    if (document.getElementById("pa-usability-style")) return;
    const s = document.createElement("style");
    s.id = "pa-usability-style";
    s.textContent = `
      #premium-analysis-panel .pa-select[data-pa-match]{position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important;opacity:0!important}
      #premium-analysis-panel.pa-locked-addon .pa-row-list,#premium-analysis-panel.pa-locked-addon .pa-market-tools{display:none!important}
      .pa-member-lock-note{display:none;padding:10px;border:1px dashed rgba(255,159,28,.35);border-radius:13px;background:rgba(255,159,28,.08);color:#ffe08a;font-size:12px;font-weight:900;line-height:1.45}
      #premium-analysis-panel.pa-locked-addon .pa-member-lock-note{display:block}
      .pa-row-list{display:grid;gap:8px;max-height:360px;overflow:auto;padding:8px;border:1px solid rgba(255,159,28,.18);border-radius:15px;background:rgba(0,0,0,.18)}
      .pa-match-row{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:10px;border:1px solid rgba(255,255,255,.08);border-radius:13px;background:rgba(255,255,255,.04);cursor:pointer}
      .pa-match-row.active{border-color:rgba(57,255,136,.45);background:rgba(57,255,136,.10)}
      .pa-match-row input{accent-color:#39ff88}.pa-match-main{display:grid;gap:3px}.pa-match-main b{color:#fff7d6;font-size:13px}.pa-match-main span{color:#8fa0b5;font-size:11px}.pa-match-score{color:#c8ffdd;font-size:11px;font-weight:950}.pa-market-tools{display:grid;gap:8px}.pa-market-search{min-height:42px;border:1px solid rgba(57,255,136,.24);border-radius:13px;background:rgba(0,0,0,.24);color:#f8fbff;padding:0 12px;font-weight:850}.pa-market-active-note{color:#ffe08a;font-size:12px;font-weight:950}
    `;
    document.head.appendChild(s);
  }

  function splitOption(text) {
    const parts = String(text || "").split("|");
    const left = (parts[0] || "").trim();
    const right = (parts[1] || text || "").trim();
    const leftParts = left.split("—");
    return { league: (leftParts[0] || "Lig").trim(), time: (leftParts[1] || "--:--").trim(), match: right.split(" · ")[0] || right, extra: right.split(" · ").slice(1).join(" · ") };
  }

  function lockNote(select) {
    if (!select?.parentElement || select.parentElement.querySelector(".pa-member-lock-note")) return;
    const note = document.createElement("div");
    note.className = "pa-member-lock-note";
    note.textContent = "Satır maç seçimi, ek marketler ve özel analiz araçları sadece aktif üyelik veya deneme ile açılır.";
    select.parentElement.appendChild(note);
  }

  function buildRows(select) {
    document.querySelector("#premium-analysis-panel [data-pa-row-list]")?.remove();
    const box = document.createElement("div");
    box.className = "pa-row-list";
    box.dataset.paRowList = "1";
    Array.from(select.options || []).forEach((option) => {
      if (!option.value || !option.textContent || option.textContent.includes("bulunamadı")) return;
      const data = splitOption(option.textContent);
      const row = document.createElement("label");
      row.className = `pa-match-row${option.selected ? " active" : ""}`;
      row.innerHTML = `<input type="checkbox" ${option.selected ? "checked" : ""}><span class="pa-match-main"><b>${data.match}</b><span>${data.league} · ${data.time}</span></span><span class="pa-match-score">${data.extra || "Seç"}</span>`;
      row.querySelector("input").addEventListener("change", (event) => {
        if (!active()) { event.target.checked = false; return; }
        option.selected = event.target.checked;
        row.classList.toggle("active", option.selected);
        select.dispatchEvent(new Event("change", { bubbles: true }));
      });
      box.appendChild(row);
    });
    select.parentElement.appendChild(box);
  }

  function marketTools(grid) {
    if (!grid || grid.dataset.usabilityTools === "1") return;
    grid.dataset.usabilityTools = "1";
    const tools = document.createElement("div");
    tools.className = "pa-market-tools";
    tools.style.gridColumn = "1 / -1";
    tools.innerHTML = `<input class="pa-market-search" placeholder="Market ara: gol, MS, ust, alt, KG"><span class="pa-market-active-note">Seçili market: Robot Önerisi</span>`;
    grid.prepend(tools);
    const input = tools.querySelector("input");
    const note = tools.querySelector("span");
    input.addEventListener("input", () => {
      const term = input.value.toLowerCase();
      grid.querySelectorAll(".pa-market").forEach((btn) => { btn.style.display = !term || btn.textContent.toLowerCase().includes(term) ? "" : "none"; });
    });
    grid.addEventListener("click", (e) => {
      const btn = e.target.closest(".pa-market");
      if (btn) note.textContent = `Seçili market: ${btn.textContent.trim()}`;
    });
  }

  function gate(panel) {
    const locked = !active();
    panel?.classList.toggle("pa-locked-addon", locked);
    panel?.querySelectorAll(".pa-market").forEach((btn) => { btn.disabled = locked || btn.disabled; });
    panel?.querySelectorAll(".pa-match-row input").forEach((box) => { box.disabled = locked; });
    panel?.querySelectorAll(".pa-market-search").forEach((input) => { input.disabled = locked; });
  }

  function apply() {
    style();
    const panel = document.getElementById("premium-analysis-panel");
    const select = panel?.querySelector("[data-pa-match]");
    if (select && select.dataset.rowListReady !== "1") {
      select.dataset.rowListReady = "1";
      lockNote(select);
      if (active()) buildRows(select);
      new MutationObserver(() => { if (active()) buildRows(select); }).observe(select, { childList: true });
    }
    if (active() && select && !panel?.querySelector("[data-pa-row-list]")) buildRows(select);
    marketTools(panel?.querySelector(".pa-market-grid"));
    if (panel) gate(panel);
  }

  function boot() {
    apply();
    if (window.__paUsabilityReady) return;
    window.__paUsabilityReady = true;
    new MutationObserver(() => setTimeout(apply, 200)).observe(document.body, { childList: true, subtree: true });
    document.addEventListener("fl:trial-access-started", () => setTimeout(apply, 200));
  }

  window.addEventListener("load", () => setTimeout(boot, 700));
  document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 700), { once: true });
  document.addEventListener("fl:runtime-ready", () => setTimeout(boot, 700));
})();