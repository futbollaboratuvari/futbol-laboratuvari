(() => {
  const KEY = "fl_selection_analysis_reports";
  const all = (s, r = document) => [...r.querySelectorAll(s)];
  const one = (s, r = document) => r.querySelector(s);
  const clean = (v) => String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  const n = (v) => {
    const f = String(v || "").replace(",", ".").match(/\d+(?:\.\d+)?/);
    return f ? Number(f[0]) : null;
  };
  const patchButtons = () => {
    all("[data-create-coupon]").forEach((b) => {
      b.textContent = "Analiz Et";
      b.setAttribute("data-analyze-selection", "1");
    });
  };
  const readItems = () => all("[data-slip-panel] .fl-slip-item").map((item) => ({
    match: one(".fl-slip-match", item)?.textContent?.trim() || "Mac",
    market: one(".fl-slip-market span", item)?.textContent?.trim() || "Secim",
    value: one(".fl-slip-market b", item)?.textContent?.trim() || ""
  }));
  const readSaved = () => {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(data) ? data.slice(0, 6) : [];
    } catch {
      return [];
    }
  };
  const writeSaved = (report) => {
    const next = [report, ...readSaved()].slice(0, 20);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  };
  const archiveRoot = () => {
    let root = one("#fl-selection-analysis-reports");
    if (root) return root;
    root = document.createElement("section");
    root.id = "fl-selection-analysis-reports";
    root.className = "fl-coupon-archive";
    const target = one("#kuponlar") || one("#kupon") || one("[data-coupon-section]") || one("#daily-matches-widget")?.parentElement || document.body;
    target.appendChild(root);
    return root;
  };
  const renderArchive = () => {
    const root = archiveRoot();
    const list = readSaved();
    root.innerHTML = `<div class="fl-archive-head"><strong>Robot Secim Analizleri</strong><span>${list.length} kayit</span></div>` +
      (list.length ? `<div class="fl-archive-list">${list.map((r) => `<article class="fl-archive-card"><div class="fl-archive-meta"><b>${clean(r.result)}</b><span>${clean(r.total)}</span></div><div class="fl-archive-picks">${r.items.map((x) => `<span>${clean(x.match)} - ${clean(x.market)} ${clean(x.value)}</span>`).join("")}</div><p>${clean(r.summary)}</p></article>`).join("")}</div>` : `<div class="fl-slip-empty">Henuz kayit yok.</div>`);
  };
  const makeBox = () => {
    const panel = one("[data-slip-panel]");
    if (!panel) return;
    const items = readItems();
    if (!items.length) return;
    const nums = items.map((x) => n(x.value)).filter(Boolean);
    const total = nums.length === items.length && nums.length ? nums.reduce((a, b) => a * b, 1).toFixed(2) : "-";
    const result = items.length >= 4 ? "Yuksek dikkat" : items.length >= 2 ? "Kontrollu analiz" : "Tek secim analizi";
    const summary = `${items.length} secim incelendi. Toplam oran ${total}. Sonuc: ${result}.`;
    const report = { id: String(Date.now()), items, total, result, summary };
    writeSaved(report);
    panel.querySelector(".fl-analysis-box")?.remove();
    const box = document.createElement("div");
    box.className = "fl-analysis-box";
    box.innerHTML = `<strong>Robot Analizi</strong><p class="fl-analysis-note">${clean(summary)}</p>${items.map((x) => `<div class="fl-analysis-pick"><b>${clean(x.match)}</b><br>${clean(x.market)} ${clean(x.value)} - kisa yorum hazirlandi.</div>`).join("")}`;
    (one(".fl-slip-summary", panel) || panel).appendChild(box);
    renderArchive();
  };
  const install = () => {
    patchButtons();
    renderArchive();
    new MutationObserver(patchButtons).observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener("click", (e) => {
      if (!e.target.closest?.("[data-create-coupon], [data-analyze-selection]")) return;
      setTimeout(makeBox, 0);
    }, true);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
