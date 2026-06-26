(() => {
  const SOURCE = "fl_pagination_slider";
  const CONFIGS = [
    { selector: "[data-coupons-single]", item: ":scope > article, :scope > div", mobile: 2, desktop: 3 },
    { selector: "[data-coupons-double]", item: ":scope > article, :scope > div", mobile: 2, desktop: 3 },
    { selector: "[data-coupons-triple]", item: ":scope > article, :scope > div", mobile: 2, desktop: 3 },
    { selector: "#analysis-list", item: ":scope > article, :scope > div", mobile: 3, desktop: 6 },
    { selector: "#spor-toto-grid", item: ":scope > article, :scope > div", mobile: 3, desktop: 6 },
    { selector: "#success-grid", item: ":scope > article, :scope > div", mobile: 3, desktop: 6 },
    { selector: "#analysis-database-body", item: ":scope > tr", mobile: 5, desktop: 10, table: true },
    { selector: "#result-archive", item: ":scope > tr", mobile: 5, desktop: 10, table: true },
    { selector: "[data-pro122-wide-markets] tbody", item: ":scope > tr", mobile: 5, desktop: 10, table: true }
  ];

  const state = new WeakMap();
  const isMobile = () => window.matchMedia("(max-width: 760px)").matches;
  const pageSize = (cfg) => isMobile() ? cfg.mobile : cfg.desktop;
  const queryItems = (box, cfg) => [...box.querySelectorAll(cfg.item)].filter((el) => !el.classList.contains("fl-pagination-controls"));

  const ensureStyle = () => {
    if (document.getElementById("fl-pagination-slider-style")) return;
    const style = document.createElement("style");
    style.id = "fl-pagination-slider-style";
    style.textContent = `
      .fl-page-hidden{display:none!important}
      .fl-pagination-controls{display:flex;align-items:center;justify-content:center;gap:8px;margin:14px 0 6px;flex-wrap:wrap}
      .fl-page-btn{border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.06);color:inherit;border-radius:999px;min-width:34px;height:34px;padding:0 10px;cursor:pointer;font-weight:700}
      .fl-page-btn.is-active{background:linear-gradient(135deg,rgba(74,222,128,.28),rgba(34,211,238,.24));border-color:rgba(74,222,128,.55)}
      .fl-page-btn:disabled{opacity:.42;cursor:not-allowed}
      .fl-page-hint{font-size:12px;opacity:.72;width:100%;text-align:center;margin-top:2px}
      @media(max-width:760px){.fl-pagination-controls{position:sticky;bottom:8px;z-index:5;backdrop-filter:blur(10px);background:rgba(5,10,20,.72);border-radius:999px;padding:8px}.fl-page-hint{display:block}}
    `;
    document.head.appendChild(style);
  };

  const controlTarget = (box, cfg) => cfg.table ? (box.closest("table") || box) : box;
  const getControls = (box, cfg) => {
    const target = controlTarget(box, cfg);
    let controls = target.nextElementSibling;
    if (!controls || !controls.classList?.contains("fl-pagination-controls")) {
      controls = document.createElement("div");
      controls.className = "fl-pagination-controls";
      target.insertAdjacentElement("afterend", controls);
    }
    return controls;
  };

  const showPage = (box, cfg, page) => {
    const items = queryItems(box, cfg);
    const size = pageSize(cfg);
    const pages = Math.max(1, Math.ceil(items.length / size));
    const safePage = Math.max(1, Math.min(page, pages));
    items.forEach((item, index) => {
      const visible = index >= (safePage - 1) * size && index < safePage * size;
      item.classList.toggle("fl-page-hidden", !visible);
    });
    state.set(box, { page: safePage, pages });
    renderControls(box, cfg, safePage, pages);
  };

  const pageWindow = (page, pages) => {
    if (pages <= 5) return Array.from({ length: pages }, (_, i) => i + 1);
    let start = Math.max(1, page - 2);
    let end = Math.min(pages, start + 4);
    start = Math.max(1, end - 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  function renderControls(box, cfg, page, pages) {
    const controls = getControls(box, cfg);
    if (pages <= 1) { controls.innerHTML = ""; return; }
    const button = (label, target, active = false, disabled = false) => `<button type="button" class="fl-page-btn${active ? " is-active" : ""}" data-fl-page="${target}" ${disabled ? "disabled" : ""}>${label}</button>`;
    controls.innerHTML = [
      button("‹", page - 1, false, page <= 1),
      ...pageWindow(page, pages).map((num) => button(String(num), num, num === page)),
      button("›", page + 1, false, page >= pages),
      `<span class="fl-page-hint">Mobilde saga/sola kaydir veya numaraya bas.</span>`
    ].join("");
    controls.querySelectorAll("[data-fl-page]").forEach((btn) => {
      btn.addEventListener("click", () => showPage(box, cfg, Number(btn.dataset.flPage || page)));
    });
  }

  const addSwipe = (box, cfg) => {
    if (box.dataset.flSwipeReady === "1") return;
    box.dataset.flSwipeReady = "1";
    let startX = 0;
    box.addEventListener("touchstart", (event) => { startX = event.touches?.[0]?.clientX || 0; }, { passive: true });
    box.addEventListener("touchend", (event) => {
      const endX = event.changedTouches?.[0]?.clientX || 0;
      const diff = endX - startX;
      if (Math.abs(diff) < 45) return;
      const current = state.get(box) || { page: 1, pages: 1 };
      showPage(box, cfg, diff < 0 ? current.page + 1 : current.page - 1);
    }, { passive: true });
  };

  const applyOne = (cfg) => {
    document.querySelectorAll(cfg.selector).forEach((box) => {
      const items = queryItems(box, cfg);
      if (!items.length) return;
      const current = state.get(box)?.page || 1;
      addSwipe(box, cfg);
      showPage(box, cfg, current);
    });
  };

  const applyAll = () => {
    ensureStyle();
    CONFIGS.forEach(applyOne);
    document.documentElement.dataset.flPaginationSlider = "active";
  };

  let timer = 0;
  const schedule = () => {
    clearTimeout(timer);
    timer = setTimeout(applyAll, 180);
  };

  document.addEventListener("DOMContentLoaded", schedule, { once: true });
  window.addEventListener("load", () => setTimeout(applyAll, 600), { once: true });
  document.addEventListener("fl:robot-pro122-core", () => setTimeout(applyAll, 300));
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("resize", schedule);
  window.FL_PAGINATION_SLIDER = { apply: applyAll, source: SOURCE };
})();
