(() => {
  const styleId = "site-visible-fix-style";
  const ANALYTICS_ENDPOINT = "https://lnngvkitcwwgrljtjwsd.supabase.co/functions/v1/fl-site-analytics?action=view";

  const renameMenu = () => {
    document.querySelectorAll('a[href="#daily-matches-widget"], a[href$="#daily-matches-widget"]').forEach((link) => {
      if ((link.textContent || "").trim() === "Bugünün Maçları") link.textContent = "Futbol Bülteni";
    });
  };

  const ensureEditorialLink = () => {
    const nav = document.querySelector(".footer-legal-links");
    if (!nav || nav.querySelector('a[href="./bilgi-merkezi.html"]')) return;
    const link = document.createElement("a");
    link.href = "./bilgi-merkezi.html";
    link.textContent = "Bilgi Merkezi";
    nav.insertBefore(link, nav.firstChild);
  };

  const ensureEditorialHub = () => {
    const path = location.pathname || "/";
    if (!(path === "/" || path.endsWith("/index.html")) || document.getElementById("fl-editorial-hub")) return;
    const hero = document.querySelector("main .dashboard-hero");
    if (!hero) return;

    const section = document.createElement("section");
    section.id = "fl-editorial-hub";
    section.className = "section fl-editorial-hub";
    section.setAttribute("aria-labelledby", "fl-editorial-hub-title");
    section.innerHTML = `
      <div class="fl-editorial-hub-copy">
        <p class="eyebrow">Futbol Analiz Bilgi Merkezi</p>
        <h2 id="fl-editorial-hub-title">Veriyi nasıl yorumladığımızı açıkça gösteriyoruz</h2>
        <p>Maç yorumu yalnızca son skora dayanmaz. Form, fikstür zorluğu, gol eğilimi, oyun temposu, veri kalitesi ve belirsizlik birlikte değerlendirilir. Aşağıdaki özgün rehberler, Futbol Laboratuvarı analizlerinin hangi ölçütlerle ve hangi sınırlamalarla hazırlandığını ayrıntılı biçimde açıklar.</p>
      </div>
      <nav class="fl-editorial-hub-links" aria-label="Futbol analiz rehberleri">
        <a href="./bilgi-merkezi.html"><strong>Bilgi Merkezi</strong><span>Tüm öğretici içeriklere tek noktadan ulaş.</span></a>
        <a href="./futbol-analiz-metodolojisi.html"><strong>Analiz Metodolojisi</strong><span>Form, kadro, oyun dengesi ve veri kapsamını birlikte oku.</span></a>
        <a href="./form-ve-fikstur-okuma-rehberi.html"><strong>Form ve Fikstür</strong><span>Kısa dönem sonuçları rakip seviyesi ve saha koşullarıyla değerlendir.</span></a>
        <a href="./gol-ve-mac-temposu-rehberi.html"><strong>Gol ve Maç Temposu</strong><span>Skor ortalamasının ötesinde tempo ve hücum üretimini incele.</span></a>
      </nav>`;

    hero.insertAdjacentElement("afterend", section);
  };

  const cleanMarkets = () => {
    const allow = /maç sonucu|ms |hnd|handikap|skor|doğru|dogru|kg|gol|üst|alt|var|yok|1y|2y|iy\/ms|ilk yarı|ikinci yarı|tek|çift|korner|kart|şut/i;
    document.querySelectorAll("#daily-matches-widget .fl-extra .fl-extra-market").forEach((card) => {
      const label = card.querySelector("span")?.textContent || "";
      if (!allow.test(label)) card.remove();
    });
    document.querySelectorAll("#daily-matches-widget .fl-extra").forEach((box) => {
      if (!box.querySelector(".fl-extra-market") && !box.querySelector(".fl-widget-empty")) box.innerHTML = '<div class="fl-widget-empty">Bu maç için detay market verisi akışta yok.</div>';
    });
  };

  const randomId = () => {
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
  };

  const getStoredId = (storage, key) => {
    try {
      let value = storage.getItem(key);
      if (!value) {
        value = randomId();
        storage.setItem(key, value);
      }
      return value;
    } catch {
      return randomId();
    }
  };

  const sendSiteAnalytics = () => {
    if (window.__flAnalyticsSent) return;
    window.__flAnalyticsSent = true;

    const payload = {
      visitor_id: getStoredId(localStorage, "fl_analytics_visitor_v1"),
      session_id: getStoredId(sessionStorage, "fl_analytics_session_v1"),
      path: location.pathname || "/",
      referrer: document.referrer || "",
    };

    fetch(ANALYTICS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
      cache: "no-store",
      credentials: "omit",
      referrerPolicy: "strict-origin-when-cross-origin",
    }).catch(() => {});
  };

  document.addEventListener("click", (event) => {
    if (event.target.closest?.("#daily-matches-widget [data-detail-uid]")) setTimeout(cleanMarkets, 80);
  });

  const apply = () => {
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = ".reveal{opacity:1!important;transform:none!important;visibility:visible!important}.reveal.visible{opacity:1!important;transform:none!important}main,.section,.hero-content,.platform-summary,.footer{visibility:visible!important}.hero-media,.dashboard-hero::after,.dashboard-hero::before,.site-header::after{pointer-events:none!important}a,button,.site-header a,.site-header button,.nav-links,.nav-links a{pointer-events:auto!important}#daily-matches-widget.daily-widget-shell,#robot-analizleri .premium-coupon-center>div{max-height:none!important;overflow:visible!important}#daily-matches-widget .fl-extra-grid{grid-template-columns:repeat(auto-fit,minmax(170px,1fr))!important;gap:0!important;border:1px solid rgba(255,255,255,.14);border-radius:10px;overflow:hidden}#daily-matches-widget .fl-extra-market{border-radius:0!important;border:0!important;border-right:1px solid rgba(255,255,255,.12)!important;border-bottom:1px solid rgba(255,255,255,.12)!important;background:rgba(255,255,255,.08)!important}.fl-editorial-hub{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.35fr);gap:24px;align-items:start;padding-top:34px!important;padding-bottom:34px!important}.fl-editorial-hub-copy h2{margin:.35rem 0 .7rem}.fl-editorial-hub-copy p:last-child{max-width:760px;line-height:1.7}.fl-editorial-hub-links{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.fl-editorial-hub-links a{display:flex;flex-direction:column;gap:5px;padding:16px;border:1px solid rgba(255,255,255,.14);border-radius:14px;background:rgba(255,255,255,.06);text-decoration:none;color:inherit}.fl-editorial-hub-links a:hover{background:rgba(255,255,255,.1);transform:translateY(-1px)}.fl-editorial-hub-links strong{color:#fff}.fl-editorial-hub-links span{font-size:13px;line-height:1.5;color:#c9d8e6}@media(max-width:820px){.fl-editorial-hub{grid-template-columns:1fr}.fl-editorial-hub-links{grid-template-columns:1fr}}";
      document.head.appendChild(style);
    }
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
    renameMenu();
    ensureEditorialLink();
    ensureEditorialHub();
    cleanMarkets();
  };

  apply();
  sendSiteAnalytics();
  document.addEventListener("DOMContentLoaded", apply, { once: true });
  window.addEventListener("load", apply, { once: true });
  setTimeout(apply, 500);
})();