(() => {
  const STATUS_URL = "./data/learning-output-status.json";
  const PANEL_ID = "learning-output-panel";

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const readJson = async (url, fallback) => {
    try {
      const res = await fetch(`${url}?ts=${Date.now()}`, { cache: "no-store" });
      return res.ok ? await res.json() : fallback;
    } catch {
      return fallback;
    }
  };

  const injectStyle = () => {
    if (document.getElementById("learning-output-visibility-style")) return;
    const style = document.createElement("style");
    style.id = "learning-output-visibility-style";
    style.textContent = `
      #learning-output-panel{margin-top:12px;padding:12px;border:1px solid rgba(255,159,28,.2);border-radius:16px;background:rgba(255,159,28,.06)}
      .lo-head{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:8px}.lo-title{margin:0;color:#ffe08a;font-size:14px;font-weight:950}.lo-status{padding:5px 8px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:#f8fbff;font-size:11px;font-weight:950}.lo-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px}.lo-cell{padding:8px;border-radius:11px;background:rgba(0,0,0,.16);color:#aebbd0;font-size:11px}.lo-cell b{display:block;margin-top:3px;color:#f8fbff;font-size:14px}.lo-note{margin-top:8px;color:#aebbd0;font-size:11px;line-height:1.45}@media(max-width:700px){.lo-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:420px){.lo-grid{grid-template-columns:1fr}.lo-head{display:grid}}
    `;
    document.head.appendChild(style);
  };

  const statusLabel = (status) => {
    if (status === "ready") return "Hazır";
    if (status === "waiting") return "Bekliyor";
    if (status === "warning") return "Kontrol gerekli";
    if (status === "bootstrap") return "İlk kurulum";
    return status || "Hazırlanıyor";
  };

  const render = async () => {
    injectStyle();
    const status = await readJson(STATUS_URL, { status: "hazırlanıyor", robot: {}, memory: {}, note: "Durum dosyası bekleniyor." });
    const parent = document.getElementById("learning-memory-panel") || document.querySelector("main") || document.body;
    let panel = document.getElementById(PANEL_ID);
    if (!panel) {
      panel = document.createElement("div");
      panel.id = PANEL_ID;
      parent.appendChild(panel);
    }
    panel.innerHTML = `
      <div class="lo-head"><h3 class="lo-title">Öğrenme Çıktı Kontrolü</h3><span class="lo-status">${esc(statusLabel(status.status))}</span></div>
      <div class="lo-grid">
        <div class="lo-cell">Robot Maç<b>${esc(status.robot?.match_count ?? 0)}</b></div>
        <div class="lo-cell">Öğrenme Etkisi<b>${esc(status.robot?.learning_adjusted_count ?? 0)}</b></div>
        <div class="lo-cell">Tahmin Hafızası<b>${esc(status.memory?.total_predictions ?? 0)}</b></div>
        <div class="lo-cell">Bekleyen<b>${esc(status.memory?.pending_predictions ?? 0)}</b></div>
      </div>
      <div class="lo-note">${esc(status.note || "Öğrenme çıktı durumu izleniyor.")}</div>
    `;
  };

  const boot = () => {
    render();
    if (window.__flLearningOutputVisibility) return;
    window.__flLearningOutputVisibility = true;
    window.setInterval(render, 60000);
    document.addEventListener("fl:runtime-ready", () => setTimeout(render, 300));
  };

  window.addEventListener("load", () => setTimeout(boot, 450));
  document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 450), { once: true });
})();
