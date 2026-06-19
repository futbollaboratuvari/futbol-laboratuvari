(() => {
  const DATA_URL = "./data/fixtures.json";
  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const todayKey = () => new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());

  const isFinished = (match) => {
    const status = String(match.status || "").toLowerCase();
    return status === "finished" || status === "tamamlandı" || status === "bitti" || Boolean(match.score || match.result || match.result_score);
  };

  const scoreOf = (match) => match.score || match.result || match.result_score || "-";

  const addStyle = () => {
    if (document.getElementById("match-results-style")) return;
    const style = document.createElement("style");
    style.id = "match-results-style";
    style.textContent = `
      .results-fab{position:fixed;right:18px;bottom:18px;z-index:80;display:inline-flex;align-items:center;gap:8px;padding:12px 14px;border:1px solid rgba(255,159,28,.36);border-radius:999px;background:linear-gradient(135deg,rgba(255,159,28,.95),rgba(57,255,136,.82));color:#07110c;font-weight:950;box-shadow:0 18px 44px rgba(0,0,0,.36);cursor:pointer}
      .results-panel{position:fixed;right:18px;bottom:76px;z-index:80;width:min(420px,calc(100vw - 28px));max-height:62vh;overflow:auto;display:none;border:1px solid rgba(255,159,28,.28);border-radius:18px;background:rgba(3,8,23,.97);box-shadow:0 24px 70px rgba(0,0,0,.48)}
      .results-panel.open{display:block}.results-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px;border-bottom:1px solid rgba(255,255,255,.08);color:#ffe08a;font-weight:950}.results-list{display:grid;gap:8px;padding:12px}.results-card{display:grid;gap:6px;padding:11px;border:1px solid rgba(255,255,255,.08);border-radius:13px;background:rgba(255,255,255,.04)}.results-league{color:#aebbd0;font-size:11px;font-weight:800;text-transform:uppercase}.results-match{display:flex;align-items:center;justify-content:space-between;gap:10px;color:#f8fbff;font-weight:850}.results-score{color:#39ff88;font-weight:950;white-space:nowrap}.results-empty{padding:14px;color:#aebbd0}
    `;
    document.head.appendChild(style);
  };

  const ensure = () => {
    let button = document.querySelector(".results-fab");
    let panel = document.querySelector(".results-panel");
    if (button && panel) return { button, panel };
    button = document.createElement("button");
    button.className = "results-fab";
    button.type = "button";
    button.innerHTML = "🏁 Maç Sonuçları";
    panel = document.createElement("aside");
    panel.className = "results-panel";
    panel.innerHTML = `<div class="results-head"><span>Bugünün Biten Maçları</span><span data-results-count>0</span></div><div class="results-list"><div class="results-empty">Henüz biten maç yok.</div></div>`;
    button.addEventListener("click", () => panel.classList.toggle("open"));
    document.body.appendChild(button);
    document.body.appendChild(panel);
    return { button, panel };
  };

  const render = (matches) => {
    addStyle();
    const { panel } = ensure();
    const today = todayKey();
    const finished = matches.filter((match) => match.date === today && isFinished(match));
    panel.querySelector("[data-results-count]").textContent = `${finished.length} maç`;
    const list = panel.querySelector(".results-list");
    if (!finished.length) {
      list.innerHTML = `<div class="results-empty">Henüz biten maç yok.</div>`;
      return;
    }
    list.innerHTML = finished.map((match) => `<article class="results-card"><div class="results-league">${esc(match.league || "Lig")}</div><div class="results-match"><span>${esc(match.home)} - ${esc(match.away)}</span><strong class="results-score">${esc(scoreOf(match))}</strong></div></article>`).join("");
  };

  const load = async () => {
    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      render(res.ok ? await res.json() : []);
    } catch { render([]); }
  };

  window.addEventListener("load", () => { load(); setInterval(load, 5 * 60 * 1000); });
})();
