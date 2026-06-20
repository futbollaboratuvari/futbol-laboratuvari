(() => {
  const panels = [
    { id: "daily-matches-widget", title: "Bugünün Maçları", text: "Günün maç listesi ve oran tablosu" },
    { id: "robot-analizleri", title: "Kupon Merkezi", text: "Tekli, 2'li ve 3'lü kupon alanı" },
    { id: "membership-payment-panel", title: "Üyelik", text: "Paket ve ödeme alanı" },
    { id: "premium-analysis-panel", title: "Özel Analiz", text: "Üyeye özel maç analizi" }
  ];

  const styleId = "fl-panel-stabilizer-style";
  const switcherId = "fl-panel-switcher";

  const addStyle = () => {
    if (document.getElementById(styleId)) return;
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      #fl-panel-switcher{position:relative;z-index:4;margin:22px clamp(16px,6vw,90px);padding:14px;border:1px solid rgba(246,200,95,.24);border-radius:22px;background:linear-gradient(135deg,rgba(246,200,95,.09),rgba(3,8,23,.92));box-shadow:0 18px 54px rgba(0,0,0,.28)}
      .fl-panel-switcher-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px;color:#f8fbff}
      .fl-panel-switcher-head strong{color:#ffe08a;font-size:18px}.fl-panel-switcher-head span{color:#aebbd0;font-size:13px}
      .fl-panel-buttons{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
      .fl-panel-button{min-height:48px;border:1px solid rgba(57,255,136,.22);border-radius:16px;background:rgba(255,255,255,.045);color:#f8fbff;font-weight:950;cursor:pointer;text-align:left;padding:10px 12px}
      .fl-panel-button small{display:block;margin-top:4px;color:#aebbd0;font-size:11px;font-weight:700}
      .fl-panel-button.active{border-color:rgba(57,255,136,.62);background:linear-gradient(135deg,rgba(57,255,136,.16),rgba(246,200,95,.08));color:#c8ffdd;box-shadow:0 0 26px rgba(57,255,136,.12)}
      .fl-stable-panel{scroll-margin-top:150px!important}
      .fl-stable-panel.fl-panel-closed{display:none!important}
      .fl-stable-panel.fl-panel-open{display:block!important;visibility:visible!important;opacity:1!important;transform:none!important}
      .fl-stub{margin:22px clamp(16px,6vw,90px);padding:18px;border:1px dashed rgba(154,236,255,.24);border-radius:18px;background:rgba(3,8,23,.62);color:#aebbd0}
      .fl-panel-skeleton{display:grid;gap:14px;margin:22px clamp(16px,6vw,90px);padding:20px;border:1px solid rgba(246,200,95,.24);border-radius:22px;background:linear-gradient(135deg,rgba(246,200,95,.08),rgba(3,8,23,.92));box-shadow:0 18px 54px rgba(0,0,0,.28)}
      .fl-panel-skeleton h2{margin:0;color:#ffe08a;font-size:clamp(20px,2vw,28px)}
      .fl-panel-skeleton p{margin:0;color:#aebbd0}.fl-panel-skeleton-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.fl-panel-skeleton-card{min-height:92px;padding:14px;border:1px solid rgba(255,255,255,.09);border-radius:16px;background:rgba(255,255,255,.04);color:#f8fbff}.fl-panel-skeleton-card strong{display:block;color:#c8ffdd;margin-bottom:6px}
      @media(max-width:860px){.fl-panel-buttons,.fl-panel-skeleton-grid{grid-template-columns:1fr 1fr}.fl-panel-switcher-head{display:grid}}
      @media(max-width:560px){.fl-panel-buttons,.fl-panel-skeleton-grid{grid-template-columns:1fr}#fl-panel-switcher,.fl-panel-skeleton{margin:16px 14px;padding:12px}}
    `;
    document.head.appendChild(style);
  };

  const main = () => document.querySelector("main") || document.body;
  const hero = () => document.querySelector("#platform") || document.querySelector(".dashboard-hero");

  const dailySkeleton = () => `<div class="daily-widget-head"><div><h2 class="daily-widget-title">Bugünün Maçları</h2><p class="daily-widget-subtitle" data-daily-widget-date>Bugünün maçları yükleniyor.</p></div><span class="daily-widget-count" data-daily-widget-count>0 maç</span></div><div class="daily-widget-list" data-daily-widget-list><div class="daily-widget-empty">Bugünün maçları hazırlanıyor.</div></div>`;
  const membershipSkeleton = () => `<div class="fl-panel-skeleton"><div><h2>Üyelik</h2><p>Paketler hazırlanıyor. Veriler yüklendiğinde Gold, Diamond ve Premium seçenekleri burada görünecek.</p></div><div class="fl-panel-skeleton-grid"><div class="fl-panel-skeleton-card"><strong>Gold</strong><span>Başlangıç paketi</span></div><div class="fl-panel-skeleton-card"><strong>Diamond</strong><span>Gelişmiş analiz</span></div><div class="fl-panel-skeleton-card"><strong>Premium</strong><span>Özel analiz paneli</span></div></div></div>`;
  const premiumSkeleton = () => `<div class="fl-panel-skeleton"><div><h2>Özel Analiz</h2><p>Üyeye özel maç analizi, güven seviyesi ve güçlü sinyaller bu alanda gösterilecek.</p></div><div class="fl-panel-skeleton-grid"><div class="fl-panel-skeleton-card"><strong>Form</strong><span>Takım gidişatı</span></div><div class="fl-panel-skeleton-card"><strong>Oran</strong><span>Risk ve değer</span></div><div class="fl-panel-skeleton-card"><strong>Güven</strong><span>Robot sinyali</span></div></div></div>`;

  const ensurePanel = (panel) => {
    let node = document.getElementById(panel.id);
    if (!node) {
      node = document.createElement("section");
      node.id = panel.id;
      if (panel.id === "daily-matches-widget") {
        node.className = "daily-widget-shell";
        node.setAttribute("aria-label", "Bugünün maçları");
        node.innerHTML = dailySkeleton();
      } else if (panel.id === "membership-payment-panel") {
        node.className = "membership-shell";
        node.setAttribute("aria-label", "Üyelik paneli");
        node.innerHTML = membershipSkeleton();
      } else if (panel.id === "premium-analysis-panel") {
        node.className = "premium-analysis-shell";
        node.setAttribute("aria-label", "Özel analiz paneli");
        node.innerHTML = premiumSkeleton();
      } else {
        node.className = "fl-stub";
        node.innerHTML = `<strong>${panel.title}</strong><p>${panel.text} hazırlanıyor.</p>`;
      }
      main().appendChild(node);
    }
    if (panel.id === "daily-matches-widget") {
      node.classList.add("daily-widget-shell");
      node.setAttribute("aria-label", "Bugünün maçları");
      if (!node.querySelector("[data-daily-widget-list]")) node.innerHTML = dailySkeleton();
      const title = node.querySelector(".daily-widget-title");
      if (title) title.textContent = "Bugünün Maçları";
    }
    if (panel.id === "membership-payment-panel") {
      node.classList.add("membership-shell");
      node.setAttribute("aria-label", "Üyelik paneli");
      if (!node.children.length) node.innerHTML = membershipSkeleton();
    }
    if (panel.id === "premium-analysis-panel") {
      node.classList.add("premium-analysis-shell");
      node.setAttribute("aria-label", "Özel analiz paneli");
      if (!node.children.length) node.innerHTML = premiumSkeleton();
    }
    node.classList.add("fl-stable-panel");
    return node;
  };

  const ensureSwitcher = () => {
    let switcher = document.getElementById(switcherId);
    if (switcher) return switcher;
    switcher = document.createElement("section");
    switcher.id = switcherId;
    switcher.setAttribute("aria-label", "Ana panel seçimi");
    switcher.innerHTML = `<div class="fl-panel-switcher-head"><div><strong>Canlı Veri Panelleri</strong><br><span>Paneller ayrı ayrı açılır. Böylece sayfa aşağı inerken gereksiz alanlar yük bindirmez.</span></div></div><div class="fl-panel-buttons"></div>`;
    const anchor = hero();
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(switcher, anchor.nextSibling);
    else main().prepend(switcher);
    const buttons = switcher.querySelector(".fl-panel-buttons");
    panels.forEach((panel) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "fl-panel-button";
      button.dataset.targetPanel = panel.id;
      button.innerHTML = `${panel.title}<small>${panel.text}</small>`;
      button.addEventListener("click", () => openPanel(panel.id, true));
      buttons.appendChild(button);
    });
    return switcher;
  };

  const openPanel = (id, scroll) => {
    panels.forEach((panel) => {
      const node = ensurePanel(panel);
      const active = panel.id === id;
      node.classList.toggle("fl-panel-open", active);
      node.classList.toggle("fl-panel-closed", !active);
    });
    document.querySelectorAll(".fl-panel-button").forEach((button) => {
      button.classList.toggle("active", button.dataset.targetPanel === id);
    });
    if (scroll) document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const placePanels = () => {
    const m = main();
    const switcher = ensureSwitcher();
    let ref = switcher.nextSibling;
    panels.forEach((panel) => {
      const node = ensurePanel(panel);
      if (node.parentNode === m) m.insertBefore(node, ref);
      ref = node.nextSibling;
    });
  };

  const boot = () => {
    addStyle();
    placePanels();
    const hashId = location.hash ? location.hash.slice(1) : "";
    const target = panels.some((panel) => panel.id === hashId) ? hashId : "daily-matches-widget";
    openPanel(target, false);
  };

  boot();
  document.addEventListener("DOMContentLoaded", boot, { once: true });
  window.addEventListener("load", boot, { once: true });
  document.addEventListener("fl:runtime-ready", () => placePanels());
  window.addEventListener("fl:open-panel", (event) => {
    const id = event.detail?.id;
    if (!panels.some((panel) => panel.id === id)) return;
    placePanels();
    openPanel(id, Boolean(event.detail?.scroll));
  });
  window.addEventListener("hashchange", () => {
    const id = location.hash ? location.hash.slice(1) : "";
    if (panels.some((panel) => panel.id === id)) openPanel(id, false);
  });
})();
