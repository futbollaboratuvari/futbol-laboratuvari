(() => {
  const PANEL_ID = "premium-analysis-panel";
  const ENHANCED = "data-pa-v2-enhanced";
  const groups = {
    robot: ["Robot Önerisi"],
    result: ["MS 1", "MS X", "MS 2"],
    goals: ["2.5 Üst", "2.5 Alt", "KG Var", "KG Yok"],
    halves: ["1Y KG Var", "2Y KG Var", "İY/MS 1/1", "İY/MS X/1", "İY/MS 2/2"]
  };

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

  const parseOption = (text) => {
    const [lead = "", ...details] = String(text || "").split(" · ");
    const [leagueTime = "", teams = ""] = lead.split(" | ");
    const divider = leagueTime.lastIndexOf(" — ");
    const singleBulletinFormat = divider === -1 && teams;
    return {
      league: singleBulletinFormat ? (details[0] || "Futbol Bülteni") : (divider > -1 ? leagueTime.slice(0, divider) : "Maç"),
      time: singleBulletinFormat ? leagueTime.trim() : (divider > -1 ? leagueTime.slice(divider + 3) : "--:--"),
      teams: teams || lead,
      market: singleBulletinFormat ? (details[1] || "Analiz bekleniyor") : (details[0] || "Analiz bekleniyor"),
      score: singleBulletinFormat ? (details[2] || "") : (details[1] || "")
    };
  };

  const addSteps = (panel) => {
    if (panel.querySelector(".pa-v2-steps")) return;
    const steps = document.createElement("div");
    steps.className = "pa-v2-steps";
    steps.setAttribute("aria-label", "Özel analiz adımları");
    steps.innerHTML = ["Maç", "Analiz", "Onay", "Sonuç"]
      .map((label, index) => `<span class="pa-v2-step${index === 0 ? " active" : ""}" data-pa-v2-step="${index + 1}"><i>${index + 1}</i>${label}</span>`)
      .join("");
    panel.querySelector(".pa-head")?.after(steps);
  };

  const setStep = (panel, step) => {
    panel.querySelectorAll("[data-pa-v2-step]").forEach((node) => {
      node.classList.toggle("active", Number(node.dataset.paV2Step) <= step);
    });
  };

  const syncCards = (select, list) => {
    const selected = new Set(Array.from(select.selectedOptions).map((option) => option.value));
    list.querySelectorAll("[data-pa-v2-option]").forEach((card) => {
      const active = selected.has(card.dataset.paV2Option);
      card.classList.toggle("selected", active);
      card.setAttribute("aria-pressed", String(active));
    });
  };

  const buildMatchCards = (panel) => {
    const select = panel.querySelector("[data-pa-match], [data-single-match]");
    if (!select || select.nextElementSibling?.classList.contains("pa-v2-match-list")) return;
    const list = document.createElement("div");
    list.className = "pa-v2-match-list";
    list.setAttribute("role", "group");
    list.setAttribute("aria-label", "Maç seçimi");

    const render = () => {
      const options = Array.from(select.options).filter((option) => option.value !== "");
      const visibleOptions = options.slice(0, 100);
      list.innerHTML = visibleOptions
        .map((option) => {
          const item = parseOption(option.textContent);
          return `<button class="pa-v2-match${option.selected ? " selected" : ""}" type="button" data-pa-v2-option="${esc(option.value)}" aria-pressed="${option.selected}" ${select.disabled ? "disabled" : ""}>
            <span class="pa-v2-match-main">
              <span class="pa-v2-match-kicker">${esc(item.league)} · ${esc(item.time)}</span>
              <span class="pa-v2-match-title">${esc(item.teams)}</span>
              <span class="pa-v2-match-meta"><span class="pa-v2-pill recommend">Robot: ${esc(item.market)}</span>${item.score ? `<span class="pa-v2-pill">Güven ${esc(item.score)}</span>` : ""}</span>
            </span><span class="pa-v2-check" aria-hidden="true">✓</span>
          </button>`;
        }).join("") || `<p class="pa-small">Filtreye uygun maç bulunamadı.</p>`;
      if (options.length > visibleOptions.length) {
        list.insertAdjacentHTML("beforeend", `<p class="pa-small">İlk 100 maç gösteriliyor. Aradığın maçı bulmak için arama alanını kullan.</p>`);
      }
    };

    render();
    select.after(list);
    list.addEventListener("click", (event) => {
      const card = event.target.closest("[data-pa-v2-option]");
      if (!card || card.disabled) return;
      const option = Array.from(select.options).find((item) => item.value === card.dataset.paV2Option);
      if (!option) return;
      option.selected = !option.selected;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      syncCards(select, list);
      setStep(panel, select.selectedOptions.length ? 2 : 1);
    });

    new MutationObserver(() => {
      render();
      syncCards(select, list);
    }).observe(select, { childList: true, attributes: true, subtree: true });

    panel.querySelector("[data-pa-top]")?.addEventListener("click", () => requestAnimationFrame(() => syncCards(select, list)));
  };

  const buildMarketGroups = (panel) => {
    const grid = panel.querySelector(".pa-market-grid");
    if (!grid) return;
    const marketName = (button) => button.dataset.paMarket || button.dataset.singleMarket || button.textContent.trim();
    const belongsTo = (name, key) => {
      if (key === "robot") return /robot|analiz sistemi önerisi/i.test(name);
      if (key === "result") return /^(MS|HND)/i.test(name) && !/(üst|ust|alt|gol|kg)/i.test(name);
      if (key === "goals") return /(üst|ust|alt|gol|kg|şut|sut)/i.test(name) && !/^(1Y|2Y|IY|İY)/i.test(name);
      return !belongsTo(name, "robot") && !belongsTo(name, "result") && !belongsTo(name, "goals");
    };
    const showGroup = (key) => {
      panel.dataset.paV2Group = key;
      grid.querySelectorAll(".pa-market").forEach((button) => { button.hidden = !belongsTo(marketName(button), key); });
      panel.querySelectorAll("[data-pa-v2-group]").forEach((button) => button.classList.toggle("active", button.dataset.paV2Group === key));
      setStep(panel, 2);
    };
    if (grid.previousElementSibling?.classList.contains("pa-v2-category-tabs")) {
      showGroup(panel.dataset.paV2Group || "robot");
      return;
    }
    const tabs = document.createElement("div");
    tabs.className = "pa-v2-category-tabs";
    tabs.innerHTML = [
      ["robot", "Robot Önerisi"], ["result", "Maç Sonucu"], ["goals", "Gol Analizi"], ["halves", "İlk Yarı / Kombine"]
    ].map(([key, label], index) => `<button type="button" class="pa-v2-category${index === 0 ? " active" : ""}" data-pa-v2-group="${key}">${label}</button>`).join("");
    grid.before(tabs);

    tabs.addEventListener("click", (event) => {
      const button = event.target.closest("[data-pa-v2-group]");
      if (button) showGroup(button.dataset.paV2Group);
    });
    showGroup("robot");
  };

  const addStickySummary = (panel) => {
    const analyze = panel.querySelector("[data-pa-analyze], [data-single-analyze]");
    if (!analyze || analyze.previousElementSibling?.classList.contains("pa-v2-selection-summary")) return;
    const summary = document.createElement("div");
    summary.className = "pa-v2-selection-summary";
    const update = () => {
      const selected = panel.querySelector("[data-pa-match], [data-single-match]")?.selectedOptions.length || 0;
      const remaining = panel.querySelectorAll(".pa-state strong")[1]?.textContent || "—";
      summary.innerHTML = `${selected} maç seçildi · <b>${esc(remaining)} hak kaldı</b>`;
    };
    analyze.before(summary);
    panel.querySelector("[data-pa-match], [data-single-match]")?.addEventListener("change", update);
    update();
    analyze.textContent = "Özel Analizi Oluştur";
    analyze.addEventListener("click", () => {
      setStep(panel, 4);
      requestAnimationFrame(() => panel.querySelector("[data-pa-output]")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    });
  };

  const enhance = (panel) => {
    if (!panel) return;
    panel.setAttribute(ENHANCED, "1");
    panel.classList.add("pa-v2");
    const title = panel.querySelector(".pa-title");
    if (title) title.textContent = "Özel Maç Analizi";
    addSteps(panel);
    buildMatchCards(panel);
    buildMarketGroups(panel);
    addStickySummary(panel);
  };

  const watch = () => {
    const root = document.body;
    const run = () => enhance(document.getElementById(PANEL_ID));
    run();
    new MutationObserver(() => run()).observe(root, { childList: true, subtree: true });
  };

  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", watch, { once: true }) : watch();
})();
