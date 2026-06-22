(() => {
  const ACCESS_CODE = "";
  const FIX_ID = "premium-panel-fix-style";

  const clean = (value) => String(value || "").trim();
  const esc = (value) => clean(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const injectStyle = () => {
    if (document.getElementById(FIX_ID)) return;
    const style = document.createElement("style");
    style.id = FIX_ID;
    style.textContent = `
      #premium-analysis-panel .premium-select[data-premium-match]{display:none!important}
      .premium-match-searchbox{display:grid;gap:8px;margin-top:6px}
      .premium-match-searchbox input{min-height:42px;border:1px solid rgba(57,255,136,.26);border-radius:13px;background:rgba(2,9,24,.86);color:#f8fbff;padding:0 12px;font-weight:850;outline:none}
      .premium-match-searchbox input:focus{border-color:rgba(57,255,136,.62);box-shadow:0 0 0 3px rgba(57,255,136,.08)}
      .premium-match-scroll{display:grid;gap:8px;max-height:270px;overflow:auto;padding:4px 4px 4px 0}
      .premium-match-pick{width:100%;display:grid;grid-template-columns:58px minmax(0,1fr);gap:10px;text-align:left;border:1px solid rgba(255,255,255,.10);border-radius:13px;background:rgba(255,255,255,.045);color:#f8fbff;padding:10px;cursor:pointer}
      .premium-match-pick:hover,.premium-match-pick.active{border-color:rgba(57,255,136,.46);background:rgba(57,255,136,.11)}
      .premium-match-pick-time{color:#39ff88;font-weight:950}.premium-match-pick-main{font-weight:950;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.premium-match-pick-league{display:block;color:#8fa0b5;font-size:11px;font-weight:800;margin-top:4px}.premium-match-empty{padding:12px;border:1px dashed rgba(255,255,255,.14);border-radius:13px;color:#8fa0b5;text-align:center}
      #premium-analysis-panel .premium-card:first-child{align-content:start}
      #premium-analysis-panel .premium-output .premium-result{min-height:230px}
      #premium-analysis-panel .premium-market-group-title{margin-top:8px}
      @media(max-width:560px){.premium-match-pick{grid-template-columns:48px minmax(0,1fr)}.premium-match-scroll{max-height:230px}}
    `;
    document.head.appendChild(style);
  };

  const parseOption = (option) => {
    const text = clean(option.textContent);
    const parts = text.split("—").map(clean);
    const league = parts.length > 1 ? parts[0] : "Lig";
    const rest = parts.length > 1 ? parts.slice(1).join("—") : text;
    const sub = rest.split("|").map(clean);
    return {
      value: option.value,
      text,
      league,
      time: sub[0] || "--:--",
      teams: sub.slice(1).join(" | ") || rest
    };
  };

  const updateOutput = (item) => {
    const output = document.querySelector("#premium-analysis-panel [data-premium-output]");
    if (!output || !item) return;
    const activeMarket = document.querySelector("#premium-analysis-panel [data-market].active")?.dataset?.market || "Seçilmedi";
    output.innerHTML = `<h3>Analiz Durumu</h3><div class="premium-result"><h4>Seçim özeti</h4><div class="premium-row"><span>Maç</span><strong>${esc(item.teams)}</strong></div><div class="premium-row"><span>Saat</span><strong>${esc(item.time)}</strong></div><div class="premium-row"><span>Lig</span><strong>${esc(item.league)}</strong></div><div class="premium-row"><span>Market</span><strong>${esc(activeMarket)}</strong></div><p class="premium-note">Market seçip Analiz Başlat butonuna bas.</p></div>`;
  };

  const enhanceMatchSelect = () => {
    injectStyle();
    const select = document.querySelector("#premium-analysis-panel .premium-select[data-premium-match]");
    if (!select || select.dataset.enhanced === "1") return;
    select.dataset.enhanced = "1";

    const items = Array.from(select.options)
      .filter((option) => clean(option.value) !== "")
      .map(parseOption);

    const wrapper = document.createElement("div");
    wrapper.className = "premium-match-searchbox";
    wrapper.innerHTML = `<input type="search" placeholder="Takım, lig veya saat ara"><div class="premium-match-scroll"></div>`;
    select.parentNode.insertBefore(wrapper, select);

    const input = wrapper.querySelector("input");
    const list = wrapper.querySelector(".premium-match-scroll");

    const render = () => {
      const query = clean(input.value).toLocaleLowerCase("tr-TR");
      const filtered = items.filter((item) => !query || `${item.league} ${item.time} ${item.teams}`.toLocaleLowerCase("tr-TR").includes(query));
      if (!filtered.length) {
        list.innerHTML = `<div class="premium-match-empty">Aramana uygun maç bulunamadı.</div>`;
        return;
      }
      list.innerHTML = filtered.map((item) => `<button class="premium-match-pick ${select.value === item.value ? "active" : ""}" type="button" data-value="${esc(item.value)}"><span class="premium-match-pick-time">${esc(item.time)}</span><span><span class="premium-match-pick-main">${esc(item.teams)}</span><span class="premium-match-pick-league">${esc(item.league)}</span></span></button>`).join("");
      list.querySelectorAll("[data-value]").forEach((button) => {
        button.addEventListener("click", () => {
          select.value = button.dataset.value || "";
          select.dispatchEvent(new Event("change", { bubbles: true }));
          const item = items.find((candidate) => candidate.value === select.value);
          updateOutput(item);
          render();
        });
      });
    };

    input.addEventListener("input", render);
    render();
  };

  document.addEventListener("click", (event) => {
    const unlockButton = event.target.closest?.("[data-premium-unlock]");
    if (!unlockButton) return;
    const input = document.querySelector("[data-premium-code]");
    if (!ACCESS_CODE || clean(input?.value).toUpperCase() !== ACCESS_CODE) return;
    localStorage.setItem("fl_premium_beta_access", "1");
    window.location.hash = "#premium-analysis-panel";
    window.location.reload();
  }, true);

  document.addEventListener("click", (event) => {
    const market = event.target.closest?.("#premium-analysis-panel [data-market]");
    if (!market) return;
    const select = document.querySelector("#premium-analysis-panel .premium-select[data-premium-match]");
    const item = select ? Array.from(select.options).find((option) => option.value === select.value) : null;
    if (item) updateOutput(parseOption(item));
  });

  window.addEventListener("load", () => {
    setTimeout(enhanceMatchSelect, 450);
    setInterval(enhanceMatchSelect, 1500);
  });
})();
