(() => {
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
  const makeBox = () => {
    const panel = one("[data-slip-panel]");
    if (!panel) return;
    const items = readItems();
    if (!items.length) return;
    const nums = items.map((x) => n(x.value)).filter(Boolean);
    const total = nums.length === items.length && nums.length ? nums.reduce((a, b) => a * b, 1).toFixed(2) : "-";
    panel.querySelector(".fl-analysis-box")?.remove();
    const box = document.createElement("div");
    box.className = "fl-analysis-box";
    box.innerHTML = `<strong>Robot Analizi</strong><p class="fl-analysis-note">${items.length} secim incelendi. Toplam oran ${total}.</p>${items.map((x) => `<div class="fl-analysis-pick"><b>${clean(x.match)}</b><br>${clean(x.market)} ${clean(x.value)} - kisa yorum hazirlandi.</div>`).join("")}`;
    (one(".fl-slip-summary", panel) || panel).appendChild(box);
  };
  const install = () => {
    patchButtons();
    new MutationObserver(patchButtons).observe(document.documentElement, { childList: true, subtree: true });
    document.addEventListener("click", (e) => {
      if (!e.target.closest?.("[data-create-coupon], [data-analyze-selection]")) return;
      setTimeout(makeBox, 0);
    }, true);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", install, { once: true });
  else install();
})();
