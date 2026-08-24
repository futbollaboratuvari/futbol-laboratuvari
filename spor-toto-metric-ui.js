(() => {
  const DATA_URL = "./data/spor_toto_bulteni.json";
  let matches = [];

  const number = (value) => {
    const parsed = Number(String(value ?? "").replace("%", "").replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  };
  const metricText = (profile) => {
    const scored = number(profile?.scored_last10);
    const conceded = number(profile?.conceded_last10);
    if (scored === null && conceded === null) return "";
    return `Gol ${scored === null ? "—" : `%${scored.toFixed(0)}`} · Yedi ${conceded === null ? "—" : `%${conceded.toFixed(0)}`}`;
  };
  const applyDesktop = () => {
    document.querySelectorAll(".st-row[data-st-index]").forEach((row) => {
      const item = matches[Number(row.dataset.stIndex)];
      if (!item) return;
      const cells = row.querySelectorAll(".st-form > div");
      [item.form?.home, item.form?.away].forEach((profile, index) => {
        const value = metricText(profile);
        if (!value || !cells[index]?.querySelector(".st-form-empty")) return;
        cells[index].textContent = value;
        cells[index].classList.add("st-form-metric-live");
      });
    });
  };
  const applyMobile = () => {
    document.querySelectorAll(".st-mobile-card").forEach((card) => {
      const button = card.querySelector("[data-st-detail]");
      const item = button ? matches[Number(button.dataset.stDetail)] : null;
      if (!item) return;
      const rows = card.querySelectorAll(".st-mobile-form > span");
      [item.form?.home, item.form?.away].forEach((profile, index) => {
        const value = metricText(profile);
        if (!value || !rows[index]?.querySelector(".st-form-empty")) return;
        rows[index].textContent = `${index === 0 ? "Ev" : "Dep"} ${value}`;
        rows[index].classList.add("st-form-metric-live");
      });
    });
  };
  const apply = () => {
    applyDesktop();
    applyMobile();
  };
  const drawerPatch = (index) => {
    const item = matches[index];
    if (!item) return;
    window.setTimeout(() => {
      const sections = [...document.querySelectorAll("#st-pro-drawer .st-drawer-panel section")];
      const section = sections.find((node) => node.querySelector("h4")?.textContent.includes("Gerçek form"));
      if (!section) return;
      const paragraphs = section.querySelectorAll("p");
      [item.form?.home, item.form?.away].forEach((profile, i) => {
        if (!paragraphs[i] || number(profile?.sample)) return;
        const value = metricText(profile);
        if (value) paragraphs[i].textContent = `${i === 0 ? item.home : item.away}: ${value}; W/D/L arşiv örneği yok.`;
      });
    }, 0);
  };

  document.addEventListener("click", (event) => {
    const button = event.target.closest?.("[data-st-detail]");
    if (button) drawerPatch(Number(button.dataset.stDetail));
  }, true);

  const load = async () => {
    try {
      const response = await fetch(`${DATA_URL}?metric_ui=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) return;
      const payload = await response.json();
      matches = Array.isArray(payload?.matches) ? payload.matches : [];
      apply();
      window.setTimeout(apply, 1200);
      window.setTimeout(apply, 2800);
    } catch {}
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", load, { once: true });
  else load();
})();
