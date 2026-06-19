// Site içi sekme yönlendirmeleri
// Ziyaretçi sekmeye bastığında ilgili bölüme yumuşak geçiş yapar.
(() => {
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
