// Site içi sekme yönlendirmeleri
// Ziyaretçi sekmeye bastığında ilgili bölüme yumuşak geçiş yapar.
(() => {
  const styleLink = document.createElement("link");
  styleLink.rel = "stylesheet";
  styleLink.href = "nav-position.css";
  document.head.appendChild(styleLink);

  const cleanupStyle = document.createElement("style");
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
  document.head.appendChild(cleanupStyle);

  const dailyMatchesScript = document.createElement("script");
  dailyMatchesScript.src = "daily-matches-widget.js";
  dailyMatchesScript.defer = true;
  document.body.appendChild(dailyMatchesScript);

  const dailyToggleScript = document.createElement("script");
  dailyToggleScript.src = "daily-toggle.js";
  dailyToggleScript.defer = true;
  document.body.appendChild(dailyToggleScript);

  const matchResultsScript = document.createElement("script");
  matchResultsScript.src = "match-results-widget.js";
  matchResultsScript.defer = true;
  document.body.appendChild(matchResultsScript);

  const membershipPaymentScript = document.createElement("script");
  membershipPaymentScript.src = "membership-payment-panel.js";
  membershipPaymentScript.defer = true;
  document.body.appendChild(membershipPaymentScript);

  const paymentGoldThemeScript = document.createElement("script");
  paymentGoldThemeScript.src = "payment-gold-theme.js";
  paymentGoldThemeScript.defer = true;
  document.body.appendChild(paymentGoldThemeScript);

  const premiumAnalysisScript = document.createElement("script");
  premiumAnalysisScript.src = "premium-analysis-panel.js";
  premiumAnalysisScript.defer = true;
  document.body.appendChild(premiumAnalysisScript);

  const couponDesignScript = document.createElement("script");
  couponDesignScript.src = "coupon-design.js";
  couponDesignScript.defer = true;
  document.body.appendChild(couponDesignScript);

  const proGuardScript = document.createElement("script");
  proGuardScript.src = "pro-analysis-guard.js";
  proGuardScript.defer = true;
  document.body.appendChild(proGuardScript);

  const visitorLanguageScript = document.createElement("script");
  visitorLanguageScript.src = "visitor-language.js";
  visitorLanguageScript.defer = true;
  document.body.appendChild(visitorLanguageScript);

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
