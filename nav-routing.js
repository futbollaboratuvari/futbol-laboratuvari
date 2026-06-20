// Site içi tek sayfa yönlendirmeleri
// Eski özet paneller devre dışı bırakıldı; tek ana akış index.html + canlı bülten üzerinden ilerler.
(() => {
  const VERSION = "20260620-1810";

  const versioned = (src) => (src.includes("?") ? src : `${src}?v=${VERSION}`);

  const sameScript = (script, src) => {
    const attr = String(script.getAttribute("src") || "");
    if (!attr) return false;
    try {
      const url = new URL(attr, window.location.href);
      return url.pathname.endsWith(src) || script.dataset.flDynamicScript === src;
    } catch {
      return attr === src || attr.startsWith(`${src}?`) || script.dataset.flDynamicScript === src;
    }
  };

  const ensureStylesheet = (href, id) => {
    if (id && document.getElementById(id)) return;
    if ([...document.querySelectorAll('link[rel="stylesheet"]')].some((link) => String(link.getAttribute("href") || "").includes(href))) return;
    const styleLink = document.createElement("link");
    if (id) styleLink.id = id;
    styleLink.rel = "stylesheet";
    styleLink.href = versioned(href);
    document.head.appendChild(styleLink);
  };

  const ensureScript = (src, id) => {
    if (id && document.getElementById(id)) return;
    if ([...document.querySelectorAll("script[src]")].some((script) => sameScript(script, src))) return;
    const script = document.createElement("script");
    if (id) script.id = id;
    script.src = versioned(src);
    script.defer = true;
    script.setAttribute("data-fl-dynamic-script", src);
    document.body.appendChild(script);
  };

  const normalizeSamePageLinks = () => {
    document.querySelectorAll('a[href^="./index.html#"], a[href^="index.html#"], a[href^="/futbol-laboratuvari/index.html#"]').forEach((link) => {
      const href = String(link.getAttribute("href") || "");
      const hashIndex = href.indexOf("#");
      if (hashIndex >= 0) link.setAttribute("href", href.slice(hashIndex));
    });
  };

  const retargetDailyLinks = () => {
    document.querySelectorAll('a[href$="#yaklasan-maclar"], a[href="#yaklasan-maclar"]').forEach((link) => {
      const label = String(link.textContent || "").toLowerCase();
      if (label.includes("bugünün maç") || label.includes("maçlarını gör") || label.includes("maç bülteni")) {
        link.setAttribute("href", "#daily-matches-widget");
      }
    });
  };

  const prepareLinks = () => {
    normalizeSamePageLinks();
    retargetDailyLinks();
  };

  const ensureRuntimeAssets = () => {
    ensureStylesheet("nav-position.css", "nav-position-style");
    ensureStylesheet("header-fixes.css", "header-fixes-style");

    ensureScript("daily-matches-widget.js", "daily-matches-widget-script");
    ensureScript("daily-toggle.js", "daily-toggle-script");
    ensureScript("match-results-widget.js", "match-results-widget-script");
    ensureScript("membership-payment-panel.js", "membership-payment-panel-script");
    ensureScript("payment-gold-theme.js", "payment-gold-theme-script");
    ensureScript("payment-luxury-tiers.js", "payment-luxury-tiers-script");
    ensureScript("premium-analysis-panel.js", "premium-analysis-panel-script");
    ensureScript("coupon-design.js", "coupon-design-script");
    ensureScript("pro-analysis-guard.js", "pro-analysis-guard-script");
    ensureScript("visitor-language.js", "visitor-language-script");
    ensureScript("site-typography-system.js", "site-typography-system-script");
    ensureScript("panel-widget-system.js", "panel-widget-system-script");
    ensureScript("user-access-flow.js", "user-access-flow-script");
    ensureScript("live-control-center.js", "live-control-center-script");
    ensureScript("section-order.js", "section-order-script");
    ensureScript("spor-toto-dashboard.js", "spor-toto-dashboard-script");
    ensureScript("spor-toto-v3-fix.js", "spor-toto-v3-fix-script");
    ensureScript("hero-top-pick-fix.js", "hero-top-pick-fix-script");
  };

  const injectCleanupStyle = () => {
    if (document.getElementById("nav-routing-cleanup-style")) return;
    const cleanupStyle = document.createElement("style");
    cleanupStyle.id = "nav-routing-cleanup-style";
    cleanupStyle.textContent = `
      .dashboard-hero h1::after,
      .section-heading h2::after,
      .opinion-panel h2::after,
      .founder-copy h2::after,
      h1::after,
      h2::after {
        content: none !important;
        display: none !important;
        background: none !important;
        box-shadow: none !important;
      }
      h1, h2, h3 {
        text-decoration: none !important;
      }
      .robot-disclaimer,
      .daily-matches-anchor {
        display: none !important;
      }
    `;
    document.head.appendChild(cleanupStyle);
  };

  const header = () => document.querySelector(".site-header");
  const nav = () => document.querySelector(".nav-links");
  const menuButton = () => document.querySelector(".menu-toggle");

  const resolveHash = (hash) => {
    if (hash === "#yaklasan-maclar") return "#daily-matches-widget";
    return hash;
  };

  const getHeaderOffset = () => (header()?.offsetHeight || 0) + 18;

  const setActiveLink = (hash) => {
    const activeHash = resolveHash(hash);
    document.querySelectorAll(".nav-links a").forEach((link) => {
      const url = new URL(link.getAttribute("href"), window.location.href);
      link.classList.toggle("active", resolveHash(url.hash) === activeHash);
    });
  };

  const goToSection = (hash, updateHistory = true) => {
    const targetHash = resolveHash(hash);
    const target = document.querySelector(targetHash);
    if (!target) return;

    const top = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });

    if (updateHistory) {
      history.pushState(null, "", targetHash);
    }

    setActiveLink(targetHash);
    nav()?.classList.remove("open");
    menuButton()?.setAttribute("aria-expanded", "false");
  };

  const bindMenu = () => {
    const button = menuButton();
    if (!button || button.dataset.flMenuReady === "1") return;
    button.dataset.flMenuReady = "1";
    button.addEventListener("click", () => {
      const isOpen = nav()?.classList.toggle("open");
      button.setAttribute("aria-expanded", String(Boolean(isOpen)));
    });
  };

  const bindInternalLinks = () => {
    const internalLinks = [...document.querySelectorAll('a[href*="#"]')].filter((link) => {
      try {
        const url = new URL(link.getAttribute("href"), window.location.href);
        const current = window.location.pathname.replace(/\/index\.html$/, "/");
        const target = url.pathname.replace(/\/index\.html$/, "/");
        return target === current && Boolean(url.hash);
      } catch {
        return false;
      }
    });

    internalLinks.forEach((link) => {
      if (link.dataset.flNavReady === "1") return;
      link.dataset.flNavReady = "1";
      link.addEventListener("click", (event) => {
        const url = new URL(link.getAttribute("href"), window.location.href);
        const targetHash = resolveHash(url.hash);
        const target = document.querySelector(targetHash);
        if (!target) return;
        event.preventDefault();
        goToSection(targetHash);
      });
    });
  };

  const observeSections = () => {
    if (window.__flSectionObserverReady) return;
    const sections = [...document.querySelectorAll("main section[id]")];
    if (!sections.length) return;
    window.__flSectionObserverReady = true;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        setActiveLink(`#${visible.target.id}`);
      },
      {
        rootMargin: "-34% 0px -55% 0px",
        threshold: [0.12, 0.24, 0.36],
      },
    );
    sections.forEach((section) => observer.observe(section));
  };

  const boot = () => {
    prepareLinks();
    injectCleanupStyle();
    ensureRuntimeAssets();
    bindMenu();
    bindInternalLinks();
    observeSections();
  };

  boot();
  document.addEventListener("DOMContentLoaded", boot);
  window.addEventListener("load", () => {
    boot();
    const hash = resolveHash(window.location.hash);
    if (hash && document.querySelector(hash)) {
      setTimeout(() => goToSection(hash, false), 80);
    } else {
      setActiveLink("#platform");
    }
  });
  setTimeout(boot, 700);
  setTimeout(boot, 1800);
})();
