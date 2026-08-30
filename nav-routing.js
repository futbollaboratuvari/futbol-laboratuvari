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

  let membershipLoaded = false;
  let idleEnhancementsQueued = false;

  const loadMembership = () => {
    if (membershipLoaded) return;
    membershipLoaded = true;
    ensureScript("membership-payment-panel.js", "membership-payment-panel-script");
    ensureScript("bank-transfer-payment.js", "bank-transfer-payment-script");
    ensureScript("membership-bank-transfer-bridge.js", "membership-bank-transfer-bridge-script");
    ensureScript("membership-submit-guard.js", "membership-submit-guard-script");
  };

  const queueIdleEnhancements = () => {
    if (idleEnhancementsQueued) return;
    idleEnhancementsQueued = true;
    const load = () => ensureScript("guide-bot.js", "guide-bot-script");
    if ("requestIdleCallback" in window) window.requestIdleCallback(load, { timeout: 3500 });
    else window.setTimeout(load, 2200);
  };

  const removeHeaderAccessButtons = () => {
    const header = document.querySelector(".site-header");
    if (!header) return;
    header.querySelectorAll(".fl-access-actions, .fl-access-flow-note").forEach((element) => element.remove());
    header.querySelectorAll("button, a, div, span").forEach((element) => {
      const text = String(element.textContent || "").toLocaleLowerCase("tr-TR");
      if (text.includes("giriş yap") || text.includes("1 gün dene") || text.includes("1 gün ücretsiz dene")) {
        const container = element.closest(".fl-access-actions") || element;
        container.remove();
      }
    });
  };

  const startHeaderAccessGuard = () => {
    removeHeaderAccessButtons();
    if (window.__flHeaderAccessGuard === true) return;
    window.__flHeaderAccessGuard = true;
    const observer = new MutationObserver(removeHeaderAccessButtons);
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setInterval(removeHeaderAccessButtons, 5000);
  };

  const resolveHash = (hash) => hash === "#yaklasan-maclar" ? "#daily-matches-widget" : hash;
  const panelHashes = new Set(["#daily-matches-widget", "#robot-analizleri", "#membership-payment-panel", "#premium-analysis-panel"]);
  const parentPanelForHash = new Map([["#membership-code-access", "#premium-analysis-panel"]]);
  const headerOffset = () => (document.querySelector(".site-header")?.offsetHeight || 0) + 18;

  const goToSection = (hash, updateHistory = true) => {
    const targetHash = resolveHash(hash);
    const panelHash = parentPanelForHash.get(targetHash) || targetHash;
    if (panelHashes.has(panelHash)) {
      window.dispatchEvent(new CustomEvent("fl:open-panel", { detail: { id: panelHash.slice(1), scroll: true } }));
    }
    const target = document.querySelector(targetHash);
    if (!target) {
      if (targetHash === "#membership-payment-panel") {
        loadMembership();
        document.addEventListener("fl:membership-ready", () => goToSection(targetHash, updateHistory), { once: true });
      }
      return false;
    }
    const top = target.getBoundingClientRect().top + window.scrollY - headerOffset();
    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
    if (updateHistory) history.pushState(null, "", targetHash);
    document.querySelector(".nav-links")?.classList.remove("open");
    document.querySelector(".menu-toggle")?.setAttribute("aria-expanded", "false");
    return true;
  };

  const boot = () => {
    startHeaderAccessGuard();
    document.querySelectorAll('a[href$="#yaklasan-maclar"], a[href="#yaklasan-maclar"]').forEach((link) => link.setAttribute("href", "#daily-matches-widget"));
    ensureStylesheet("nav-position.css", "nav-position-style");
    ensureStylesheet("header-fixes.css", "header-fixes-style");
    ensureStylesheet("hero-vitrin.css", "hero-vitrin-style");
    ensureStylesheet("premium-analysis-v3.css", "premium-analysis-v3-style");
    ensureScript("panel-stabilizer.js", "panel-stabilizer-script");
    ensureScript("daily-matches-widget.js", "daily-matches-widget-script");
    ensureScript("server-membership-guard.js", "server-membership-guard-script");
    ensureScript("premium-analysis-v3-core.js", "premium-analysis-v3-core-script");
    ensureScript("premium-analysis-v3.js", "premium-analysis-v3-script");
    ensureScript("section-order.js", "section-order-script");
    ensureScript("hero-summary-sync.js", "hero-summary-sync-script");
    ensureScript("hero-vitrin.js", "hero-vitrin-script");
    ensureScript("site-human-language.js", "site-human-language-script");
    loadMembership();
    queueIdleEnhancements();

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
    if (event.target.closest?.('[data-target-panel="membership-payment-panel"]')) loadMembership();
    const link = event.target.closest?.('a[href*="#"]');
    if (!link) return;
    const url = new URL(link.getAttribute("href"), window.location.href);
    if (url.pathname !== window.location.pathname || !url.hash) return;
    event.preventDefault();
    goToSection(url.hash);
  }, true);

  window.addEventListener("fl:open-panel", (event) => {
    if (event.detail?.id === "membership-payment-panel") loadMembership();
  });

  boot();
  document.addEventListener("DOMContentLoaded", boot, { once: true });
  window.addEventListener("load", () => {
    boot();
    if (window.location.hash) setTimeout(() => goToSection(window.location.hash, false), 120);
  }, { once: true });
})();
