(() => {
  const styleId = "site-visible-fix-style";
  const ANALYTICS_ENDPOINT = "https://lnngvkitcwwgrljtjwsd.supabase.co/functions/v1/fl-site-analytics?action=view";

  const renameMenu = () => {
    document.querySelectorAll('a[href="#daily-matches-widget"], a[href$="#daily-matches-widget"]').forEach((link) => {
      if ((link.textContent || "").trim() === "Bugünün Maçları") link.textContent = "Futbol Bülteni";
    });
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
      style.textContent = ".reveal{opacity:1!important;transform:none!important;visibility:visible!important}.reveal.visible{opacity:1!important;transform:none!important}main,.section,.hero-content,.platform-summary,.footer{visibility:visible!important}.hero-media,.dashboard-hero::after,.dashboard-hero::before,.site-header::after{pointer-events:none!important}a,button,.site-header a,.site-header button,.nav-links,.nav-links a{pointer-events:auto!important}#daily-matches-widget.daily-widget-shell,#robot-analizleri .premium-coupon-center>div{max-height:none!important;overflow:visible!important}#daily-matches-widget .fl-extra-grid{grid-template-columns:repeat(auto-fit,minmax(170px,1fr))!important;gap:0!important;border:1px solid rgba(255,255,255,.14);border-radius:10px;overflow:hidden}#daily-matches-widget .fl-extra-market{border-radius:0!important;border:0!important;border-right:1px solid rgba(255,255,255,.12)!important;border-bottom:1px solid rgba(255,255,255,.12)!important;background:rgba(255,255,255,.08)!important}";
      document.head.appendChild(style);
    }
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
    renameMenu();
    cleanMarkets();
  };

  apply();
  sendSiteAnalytics();
  document.addEventListener("DOMContentLoaded", apply, { once: true });
  window.addEventListener("load", apply, { once: true });
  setTimeout(apply, 500);
})();