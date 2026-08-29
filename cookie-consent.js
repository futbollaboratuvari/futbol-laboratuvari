(() => {
  "use strict";
  if (window.__flCookieConsentReady) return;
  window.__flCookieConsentReady = true;

  const STORAGE_KEY = "fl_cookie_consent_v1";
  const ADS_CLIENT = "ca-pub-4488561171980540";

  const read = () => {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return value && value.version === 1 ? value : null;
    } catch { return null; }
  };

  const loadAds = () => {
    if (document.getElementById("fl-adsense-script")) return;
    const script = document.createElement("script");
    script.id = "fl-adsense-script";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADS_CLIENT)}`;
    document.head.appendChild(script);
  };

  const removeUi = () => {
    document.getElementById("fl-cookie-dialog")?.remove();
    document.getElementById("fl-cookie-backdrop")?.remove();
  };

  const save = (advertising) => {
    const adsWereLoaded = Boolean(document.getElementById("fl-adsense-script"));
    const value = { version: 1, necessary: true, advertising: Boolean(advertising), savedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    removeUi();
    if (value.advertising) loadAds();
    window.dispatchEvent(new CustomEvent("fl:cookie-consent", { detail: value }));
    if (!value.advertising && adsWereLoaded) window.location.reload();
  };

  const style = () => {
    if (document.getElementById("fl-cookie-style")) return;
    const node = document.createElement("style");
    node.id = "fl-cookie-style";
    node.textContent = `
      .fl-cookie-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.48);z-index:9997}.fl-cookie{position:fixed;z-index:9998;left:50%;bottom:18px;transform:translateX(-50%);width:min(720px,calc(100% - 24px));padding:18px;border:1px solid rgba(255,224,138,.35);border-radius:18px;background:#071226;color:#f8fbff;box-shadow:0 28px 90px rgba(0,0,0,.58);font-family:Arial,Helvetica,sans-serif}.fl-cookie h2{margin:0 0 8px;color:#ffe08a;font-size:20px}.fl-cookie p{margin:0;color:#c6d2e4;line-height:1.55;font-size:13px}.fl-cookie a{color:#9effc8}.fl-cookie-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:14px}.fl-cookie button{min-height:42px;padding:8px 11px;border:1px solid rgba(255,255,255,.18);border-radius:11px;background:#12223a;color:#fff;font-weight:900;cursor:pointer}.fl-cookie button:focus-visible{outline:3px solid #ffe08a;outline-offset:2px}.fl-cookie button[data-cookie-choice="accept"],.fl-cookie button[data-cookie-choice="reject"]{background:#123428;border-color:rgba(57,255,136,.4)}.fl-cookie-prefs{display:grid;gap:10px;margin-top:14px;padding:12px;border-radius:12px;background:rgba(255,255,255,.05)}.fl-cookie-prefs label{display:grid;grid-template-columns:20px 1fr;gap:8px;align-items:start;font-size:13px}.fl-cookie-prefs input{width:17px;height:17px}.fl-cookie-settings{position:fixed;z-index:9000;left:12px;bottom:12px;min-height:36px;padding:7px 10px;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:#071226;color:#c8ffdd;font-size:11px;font-weight:900;cursor:pointer}@media(max-width:560px){.fl-cookie-actions{grid-template-columns:1fr}.fl-cookie{bottom:8px}.fl-cookie-settings{bottom:8px}}
    `;
    document.head.appendChild(node);
  };

  const show = (preferences = false) => {
    removeUi();
    style();
    const current = read();
    const backdrop = document.createElement("div");
    backdrop.id = "fl-cookie-backdrop";
    backdrop.className = "fl-cookie-backdrop";
    const dialog = document.createElement("section");
    dialog.id = "fl-cookie-dialog";
    dialog.className = "fl-cookie";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "fl-cookie-title");
    dialog.innerHTML = `<h2 id="fl-cookie-title">Çerez tercihleri</h2><p>Zorunlu depolama site ve üyelik işlevleri için kullanılır. Reklam çerezleri yalnız açık onayınla yüklenir. Ayrıntılar için <a href="./cerez-politikasi.html">Çerez Politikası</a>'nı inceleyebilirsin.</p>
      <div class="fl-cookie-prefs"${preferences ? "" : " hidden"} data-cookie-prefs><label><input type="checkbox" checked disabled><span><strong>Zorunlu</strong><br>Site işlevleri ve tercih kaydı. Her zaman açık.</span></label><label><input type="checkbox" data-cookie-advertising${current?.advertising ? " checked" : ""}><span><strong>Reklam</strong><br>Google AdSense reklam gösterimi ve ölçümü.</span></label></div>
      <div class="fl-cookie-actions"><button type="button" data-cookie-choice="accept">Tümünü kabul et</button><button type="button" data-cookie-choice="reject">Tümünü reddet</button><button type="button" data-cookie-choice="preferences">Tercihleri yönet</button></div>`;
    document.body.append(backdrop, dialog);
    const prefs = dialog.querySelector("[data-cookie-prefs]");
    const preferencesButton = dialog.querySelector('[data-cookie-choice="preferences"]');
    dialog.addEventListener("click", (event) => {
      const choice = event.target.closest?.("[data-cookie-choice]")?.dataset.cookieChoice;
      if (choice === "accept") return save(true);
      if (choice === "reject") return save(false);
      if (choice === "preferences") {
        if (prefs.hidden) {
          prefs.hidden = false;
          preferencesButton.textContent = "Seçimi kaydet";
        } else {
          save(Boolean(dialog.querySelector("[data-cookie-advertising]")?.checked));
        }
      }
    });
    dialog.querySelector("button")?.focus();
  };

  const boot = () => {
    style();
    const settings = document.createElement("button");
    settings.type = "button";
    settings.className = "fl-cookie-settings";
    settings.textContent = "Çerez tercihleri";
    settings.addEventListener("click", () => show(true));
    document.body.appendChild(settings);
    const consent = read();
    if (!consent) show(false);
    else if (consent.advertising) loadAds();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();
