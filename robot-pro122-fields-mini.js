(() => {
  const esc = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const clamp = (value) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  const setText = (selector, value) => document.querySelectorAll(selector).forEach((el) => { el.textContent = value; });
  const best = (list) => [...(list || [])].sort((a, b) => Number(b.confidence || 0) - Number(a.confidence || 0))[0] || null;
  const card = (m) => `<article class="robot-card reveal visible"><div class="robot-card-head"><span>${esc(m.league)}</span><strong>${esc(m.time)}</strong></div><h3>${esc(m.name)}</h3><div class="robot-pick"><span>Seçenek</span><strong>${esc(m.option)}</strong></div><div class="robot-meta"><span>Oran: ${esc(m.odd)}</span><span>Güven: ${m.confidence || "-"}/100</span></div><p>${esc(m.reason)}</p></article>`;
  const empty = (text) => `<div class="fixtures-empty">${esc(text)}</div>`;
  const fill = (selector, html) => { const el = document.querySelector(selector); if (el) el.innerHTML = html; };
  const render = (state) => {
    const matches = state.matches || [];
    const top = best(matches);
    const avg = matches.length ? clamp(matches.reduce((sum, m) => sum + Number(m.confidence || 0), 0) / matches.length) : 0;
    document.documentElement.dataset.robotPro122FieldsMini = "active";
    setText("#today-count", matches.length ? `${matches.length} maç` : "0 maç");
    setText("#avg-confidence", avg ? `${avg}/100` : "Veri bekleniyor");
    setText("#top-market", top ? `${top.name} · ${top.option}` : "Günün seçimi hazırlanıyor");
    setText("[data-active-source]", matches.length ? "Robot + PRO 12.2" : "Veri bekleniyor");
    setText("[data-match-count]", String(matches.length));
    setText("[data-prediction-count]", String(matches.filter((m) => m.option && m.option !== "Veri bekleniyor").length));
    setText("[data-load-status]", matches.length ? "Alanlara aktarıldı" : "Maçlar hazırlanıyor");
    fill("#strongest-pick-card", top ? card(top) : empty("Günün seçimi güncel maç listesi oluştuktan sonra gösterilecek."));
    fill("#analysis-list", matches.length ? matches.slice(0, 10).map(card).join("") : empty("Maç yorumu için canlı veri bekleniyor."));
  };
  document.addEventListener("fl:robot-pro122-core", (event) => render(event.detail || {}));
  window.addEventListener("load", () => setTimeout(() => window.FL_ROBOT_PRO122_CORE?.refresh?.(), 1400), { once: true });
})();
