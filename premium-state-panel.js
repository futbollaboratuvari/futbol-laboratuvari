(() => {
  const COUNT_KEY = "fl_premium_count";
  const HISTORY_KEY = "fl_premium_robot_queue";

  const safe = (v) => String(v ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");

  const count = () => {
    const n = Number(localStorage.getItem(COUNT_KEY));
    if (Number.isFinite(n)) return n;
    localStorage.setItem(COUNT_KEY, "20");
    return 20;
  };

  const rows = () => {
    try {
      const data = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      return Array.isArray(data) ? data.slice(0, 6) : [];
    } catch {
      return [];
    }
  };

  const style = () => {
    if (document.getElementById("premium-state-style")) return;
    const s = document.createElement("style");
    s.id = "premium-state-style";
    s.textContent = `.premium-state-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:0 0 14px}.premium-state-card{padding:12px;border:1px solid rgba(57,255,136,.18);border-radius:16px;background:rgba(57,255,136,.06)}.premium-state-card span{display:block;color:#8fa0b5;font-size:11px;font-weight:900;text-transform:uppercase}.premium-state-card strong{display:block;margin-top:5px;color:#f8fbff;font-size:18px}.premium-history-mini{margin-top:12px;padding:12px;border:1px solid rgba(255,255,255,.08);border-radius:16px;background:rgba(0,0,0,.16)}.premium-history-mini h4{margin:0 0 8px;color:#ffe08a;font-size:13px}.premium-history-mini div{padding:8px;border-radius:10px;background:rgba(255,255,255,.035);color:#d7e4f5;font-size:12px;margin-top:6px}@media(max-width:760px){.premium-state-grid{grid-template-columns:1fr}}`;
    document.head.appendChild(s);
  };

  const render = () => {
    style();
    const shell = document.getElementById("premium-analysis-panel");
    if (!shell) return;
    const head = shell.querySelector(".premium-head");
    if (head && !shell.querySelector(".premium-state-grid")) {
      head.insertAdjacentHTML("afterend", `<div class="premium-state-grid"><div class="premium-state-card"><span>Paket</span><strong>Kurucu Beta</strong></div><div class="premium-state-card"><span>Kalan Kullanım</span><strong>${count()}</strong></div><div class="premium-state-card"><span>Robot</span><strong>Premium</strong></div></div>`);
    }
    const out = shell.querySelector("[data-premium-output]");
    if (!out) return;
    out.querySelector(".premium-history-mini")?.remove();
    const list = rows();
    out.insertAdjacentHTML("beforeend", `<div class="premium-history-mini"><h4>Son Analizler</h4>${list.length ? list.map((x) => `<div><b>${safe(x?.match?.home)} - ${safe(x?.match?.away)}</b><br>${safe(x?.market)} ${x?.percent ? `· %${x.percent}` : ""}</div>`).join("") : `<div>Henüz analiz yok.</div>`}</div>`);
  };

  document.addEventListener("click", (e) => {
    if (!e.target.closest?.("#premium-analysis-panel [data-premium-analyze]")) return;
    const before = localStorage.getItem("fl_last_premium_robot_analysis") || "";
    setTimeout(() => {
      const after = localStorage.getItem("fl_last_premium_robot_analysis") || "";
      if (after && after !== before) localStorage.setItem(COUNT_KEY, String(Math.max(0, count() - 1)));
      render();
    }, 900);
  });

  window.addEventListener("load", () => {
    setTimeout(render, 1100);
    setInterval(render, 3000);
  });
})();
