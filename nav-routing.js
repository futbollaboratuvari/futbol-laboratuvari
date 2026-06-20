// Site içi tek sayfa yönlendirmeleri
// Tek yetkili router: menü, hero butonları ve dinamik paneller burada yönetilir.
(() => {
  const VERSION = "20260620-1845";
  let syntheticLoadTimer = null;
  let observerReady = false;

  const versioned = (src) => (src.includes("?") ? src : `${src}?v=${VERSION}`);

  const sameAsset = (attr, src) => {
    const value = String(attr || "");
    if (!value) return false;
    try {
      const url = new URL(value, window.location.href);
      return url.pathname.endsWith(src);
    } catch {
      return value === src || value.startsWith(`${src}?`);
    }
  };

  const scheduleSyntheticLoadForLateScripts = () => {
    if (document.readyState !== "complete") return;
    clearTimeout(syntheticLoadTimer);
    syntheticLoadTimer = setTimeout(() => {
      window.dispatchEvent(new Event("load"));
      document.dispatchEvent(new CustomEvent("fl:runtime-ready"));
    }, 120);
  };

  const ensureStylesheet = (href, id) => {
    if (id && document.getElementById(id)) return;
    if ([...document.querySelectorAll('link[rel="stylesheet"]')].some((link) => sameAsset(link.getAttribute("href"), href))) return;
    const styleLink = document.createElement("link");
    if (id) styleLink.id = id;
    styleLink.rel = "stylesheet";
    styleLink.href = versioned(href);
    document.head.appendChild(styleLink);
  };

  const ensureScript = (src, id) => {
    if (id && document.getElementById(id)) return;
    if ([...document.querySelectorAll("script[src]")].some((script) => sameAsset(script.getAttribute("src"), src) || script.dataset.flDynamicScript === src)) return;
    const script = document.createElement("script");
    if (id) script.id = id;
    script.src = versioned(src);
    script.async = false;
    script.setAttribute("data-fl-dynamic-script", src);
    script.addEventListener("load", scheduleSyntheticLoadForLateScripts, { once: true });
    document.body.appendChild(script);
  };

  const normalizeSamePageLinks = () => {
    document.querySelectorAll('a[href^="./index.html#"], a[href^="index.html#"], a[href^="/futbol-laboratuvari/index.html#"]').forEach((link) => {
      const href = String(link.getAttribute("href") || "");
      const hashIndex = href.indexOf("#");
      if (hashIndex >= 0) link.setAttribute("href", href.slice(hashIndex));
    });
  };

  const resolveHash = (hash) => {
    if (hash === "#yaklasan-maclar") return "#daily-matches-widget";
    return hash;
  };

  const retargetDailyLinks = () => {
    document.querySelectorAll('a[href$="#yaklasan-maclar"], a[href="#yaklasan-maclar"]').forEach((link) => {
      link.setAttribute("href", "#daily-matches-widget");
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
      .daily-matches-anchor,
      #live-control-center {
        display: none !important;
      }
      a, button, [role="button"], .hero-button, .nav-links a {
        pointer-events: auto !important;
      }
    `;
    document.head.appendChild(cleanupStyle);
  };

  const header = () => document.querySelector(".site-header");
  const nav = () => document.querySelector(".nav-links");
  const menuButton = () => document.querySelector(".menu-toggle");
  const getHeaderOffset = () => (header()?.offsetHeight || 0) + 18;

  const findTarget = (hash) => {
    const targetHash = resolveHash(hash);
    if (!targetHash || targetHash === "#") return null;
    return document.querySelector(targetHash);
  };

  const waitForTarget = (hash, timeout = 2200) =>
    new Promise((resolve) => {
      const existing = findTarget(hash);
      if (existing) {
        resolve(existing);
        return;
      }
      const started = Date.now();
      const timer = setInterval(() => {
        const target = findTarget(hash);
        if (target || Date.now() - started > timeout) {
          clearInterval(timer);
          resolve(target || null);
        }
      }, 90);
    });

  const setActiveLink = (hash) => {
    const activeHash = resolveHash(hash);
    document.querySelectorAll(".nav-links a").forEach((link) => {
      const url = new URL(link.getAttribute("href"), window.location.href);
      link.classList.toggle("active", resolveHash(url.hash) === activeHash);
    });
  };

  const goToSection = async (hash, updateHistory = true) => {
    const targetHash = resolveHash(hash);
    const target = await waitForTarget(targetHash);
    if (!target) return false;

    const top = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });

    if (updateHistory) history.pushState(null, "", targetHash);
    setActiveLink(targetHash);
    nav()?.classList.remove("open");
    menuButton()?.setAttribute("aria-expanded", "false");
    return true;
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

  const bindDelegatedNavigation = () => {
    if (document.documentElement.dataset.flDelegatedNavReady === "1") return;
    document.documentElement.dataset.flDelegatedNavReady = "1";
    document.addEventListener("click", async (event) => {
      const link = event.target.closest?.('a[href*="#"]');
      if (!link) return;
      let url;
      try {
        url = new URL(link.getAttribute("href"), window.location.href);
      } catch {
        return;
      }
      const current = window.location.pathname.replace(/\/index\.html$/, "/");
      const targetPath = url.pathname.replace(/\/index\.html$/, "/");
      if (targetPath !== current || !url.hash) return;
      const targetHash = resolveHash(url.hash);
      event.preventDefault();
      await goToSection(targetHash);
    }, true);
  };

  const observeSections = () => {
    if (observerReady) return;
    const sections = [...document.querySelectorAll("main section[id]")];
    if (!sections.length) return;
    observerReady = true;
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
    bindDelegatedNavigation();
    observeSections();
  };

  boot();
  document.addEventListener("DOMContentLoaded", boot);
  document.addEventListener("fl:runtime-ready", boot);
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
  setTimeout(boot, 3600);
})();
