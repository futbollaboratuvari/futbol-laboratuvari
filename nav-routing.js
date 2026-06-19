// Site içi sekme yönlendirmeleri
// Ziyaretçi sekmeye bastığında ilgili bölüme yumuşak geçiş yapar.
(() => {
  const ensureStylesheet = (href, id) => {
    if (id && document.getElementById(id)) return;
    if ([...document.querySelectorAll('link[rel="stylesheet"]')].some((link) => String(link.getAttribute("href") || "").endsWith(href))) return;
    const styleLink = document.createElement("link");
    if (id) styleLink.id = id;
    styleLink.rel = "stylesheet";
    styleLink.href = href;
    document.head.appendChild(styleLink);
  };

  const ensureScript = (src, id) => {
    if (id && document.getElementById(id)) return;
    if ([...document.querySelectorAll("script[src]")].some((script) => String(script.getAttribute("src") || "").endsWith(src))) return;
    const script = document.createElement("script");
    if (id) script.id = id;
    script.src = src;
    script.defer = true;
    script.setAttribute("data-fl-dynamic-script", src);
    document.body.appendChild(script);
  };

  ensureStylesheet("nav-position.css", "nav-position-style");
  ensureStylesheet("header-fixes.css", "header-fixes-style");

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
    .robot-disclaimer {
      display: none !important;
    }
  `;
  if (!document.getElementById(cleanupStyle.id)) document.head.appendChild(cleanupStyle);

  ensureScript("daily-matches-widget.js", "daily-matches-widget-script");
  ensureScript("daily-toggle.js", "daily-toggle-script");
  ensureScript("fixtures-summary-panel.js", "fixtures-summary-panel-script");
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

  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".nav-links");
  const menuButton = document.querySelector(".menu-toggle");
  const internalLinks = [...document.querySelectorAll('a[href*="#"]')].filter((link) => {
    try {
      const url = new URL(link.getAttribute("href"), window.location.href);
      return url.pathname === window.location.pathname && Boolean(url.hash);
    } catch {
      return false;
    }
  });

  menuButton?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(Boolean(isOpen)));
  });

  const getHeaderOffset = () => (header?.offsetHeight || 0) + 18;

  const setActiveLink = (hash) => {
    document.querySelectorAll(".nav-links a").forEach((link) => {
      const url = new URL(link.getAttribute("href"), window.location.href);
      link.classList.toggle("active", url.hash === hash);
    });
  };

  const goToSection = (hash, updateHistory = true) => {
    const target = document.querySelector(hash);
    if (!target) return;

    const top = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });

    if (updateHistory) {
      history.pushState(null, "", hash);
    }

    setActiveLink(hash);
    nav?.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  };

  internalLinks.forEach((link) => {
    if (link.dataset.flNavReady === "1") return;
    link.dataset.flNavReady = "1";
    link.addEventListener("click", (event) => {
      const url = new URL(link.getAttribute("href"), window.location.href);
      const target = document.querySelector(url.hash);
      if (!target) return;
      event.preventDefault();
      goToSection(url.hash);
    });
  });

  const sections = [...document.querySelectorAll("main section[id]")];
  if (sections.length > 0) {
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
  }

  window.addEventListener("load", () => {
    if (window.location.hash && document.querySelector(window.location.hash)) {
      setTimeout(() => goToSection(window.location.hash, false), 80);
    } else {
      setActiveLink("#platform");
    }
  });
})();
