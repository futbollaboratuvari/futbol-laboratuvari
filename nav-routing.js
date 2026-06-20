(() => {
  const VERSION = document.querySelector('meta[name="deploy-version"]')?.content?.trim()
    || "20260620-2145-live-repo-sync";
  const versioned = (src) => (src.includes("?") ? src : `${src}?v=${VERSION}`);

  const sameAsset = (value, src) => {
    try {
      return new URL(value || "", window.location.href).pathname.endsWith(src);
    } catch {
      return String(value || "").startsWith(src);
    }
  };

  const ensureScript = (src, id) => {
    if (id && document.getElementById(id)) return;
    if ([...document.querySelectorAll("script[src]")].some((script) => sameAsset(script.getAttribute("src"), src))) return;
    const script = document.createElement("script");
    if (id) script.id = id;
    script.src = versioned(src);
    script.async = false;
    script.addEventListener("load", () => document.dispatchEvent(new CustomEvent("fl:runtime-ready")), { once: true });
    document.body.appendChild(script);
  };

  const ensureStylesheet = (href, id) => {
    if (id && document.getElementById(id)) return;
    if ([...document.querySelectorAll('link[rel="stylesheet"]')].some((link) => sameAsset(link.getAttribute("href"), href))) return;
    const link = document.createElement("link");
    if (id) link.id = id;
    link.rel = "stylesheet";
    link.href = versioned(href);
    document.head.appendChild(link);
  };

  const resolveHash = (hash) => hash === "#yaklasan-maclar" ? "#daily-matches-widget" : hash;
  const panelHashes = new Set(["#daily-matches-widget", "#robot-analizleri", "#membership-payment-panel", "#premium-analysis-panel"]);
  const headerOffset = () => (document.querySelector(".site-header")?.offsetHeight || 0) + 18;

  const goToSection = (hash, updateHistory = true) => {
    const targetHash = resolveHash(hash);
    if (panelHashes.has(targetHash)) {
      window.dispatchEvent(new CustomEvent("fl:open-panel", { detail: { id: targetHash.slice(1), scroll: true } }));
    }
    const target = document.querySelector(targetHash);
    if (!target) return false;
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset();
    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
    if (updateHistory) history.pushState(null, "", targetHash);
    document.querySelector(".nav-links")?.classList.remove("open");
    document.querySelector(".menu-toggle")?.setAttribute("aria-expanded", "false");
    return true;
  };

  const boot = () => {
    document.querySelectorAll('a[href$="#yaklasan-maclar"], a[href="#yaklasan-maclar"]').forEach((link) => link.setAttribute("href", "#daily-matches-widget"));
    ensureStylesheet("nav-position.css", "nav-position-style");
    ensureStylesheet("header-fixes.css", "header-fixes-style");
    ensureScript("panel-stabilizer.js", "panel-stabilizer-script");
    ensureScript("daily-matches-widget.js", "daily-matches-widget-script");
    ensureScript("daily-toggle.js", "daily-toggle-script");
    ensureScript("match-results-widget.js", "match-results-widget-script");
    ensureScript("membership-payment-panel.js", "membership-payment-panel-script");
    ensureScript("membership-submit-guard.js", "membership-submit-guard-script");
    ensureScript("premium-analysis-panel.js", "premium-analysis-panel-script");
    ensureScript("section-order.js", "section-order-script");
    ensureScript("hero-summary-sync.js", "hero-summary-sync-script");

    const button = document.querySelector(".menu-toggle");
    const nav = document.querySelector(".nav-links");
    if (button && button.dataset.flMenuReady !== "1") {
      button.dataset.flMenuReady = "1";
      button.addEventListener("click", () => {
        const open = nav?.classList.toggle("open");
        button.setAttribute("aria-expanded", String(Boolean(open)));
      });
    }
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest?.('a[href*="#"]');
    if (!link) return;
    const url = new URL(link.getAttribute("href"), window.location.href);
    if (url.pathname !== window.location.pathname || !url.hash) return;
    event.preventDefault();
    goToSection(url.hash);
  }, true);

  boot();
  document.addEventListener("DOMContentLoaded", boot, { once: true });
  window.addEventListener("load", () => {
    boot();
    if (window.location.hash) setTimeout(() => goToSection(window.location.hash, false), 120);
  }, { once: true });
})();
