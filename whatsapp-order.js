(() => {
  if (window.__flWhatsappOrderUiReady) return;
  window.__flWhatsappOrderUiReady = true;

  const BASE = "https://lnngvkitcwwgrljtjwsd.supabase.co/functions/v1/fl-whatsapp-order";
  const ORDER_RE = /^FL-\d{8}-[A-F0-9]{10}$/i;
  let configPromise = null;
  let timer = 0;

  const getConfig = () => {
    if (configPromise) return configPromise;
    configPromise = fetch(`${BASE}?action=public-config`, {
      method: "GET",
      mode: "cors",
      credentials: "omit",
      cache: "no-store",
    })
      .then((response) => response.ok ? response.json() : { ok: false, enabled: false })
      .then((data) => ({ enabled: data?.ok === true && data?.enabled === true }))
      .catch(() => ({ enabled: false }));
    return configPromise;
  };

  const injectStyle = () => {
    if (document.getElementById("fl-whatsapp-order-style")) return;
    const style = document.createElement("style");
    style.id = "fl-whatsapp-order-style";
    style.textContent = `
      .fl-whatsapp-float{position:fixed;right:18px;bottom:20px;z-index:9998;display:inline-flex;align-items:center;gap:9px;min-height:46px;padding:0 16px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:#16a34a;color:#fff;text-decoration:none;font:900 13px/1 system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;box-shadow:0 14px 36px rgba(0,0,0,.34)}
      .fl-whatsapp-float::before{content:"✆";font-size:18px}.fl-whatsapp-float:hover{filter:brightness(1.07)}
      .fl-whatsapp-order-actions{display:flex;flex-wrap:wrap;align-items:center;gap:10px;margin:12px 0;padding:12px;border:1px solid rgba(37,211,102,.28);border-radius:13px;background:rgba(37,211,102,.07)}
      .fl-whatsapp-order-link{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 14px;border-radius:11px;background:#16a34a;color:#fff!important;text-decoration:none;font-weight:950}
      .fl-whatsapp-order-help{margin:0;color:#c8ffdd;font-size:12px;line-height:1.5}
      @media(max-width:680px){.fl-whatsapp-float{right:12px;bottom:82px;padding:0 13px}.fl-whatsapp-order-actions{align-items:stretch;flex-direction:column}.fl-whatsapp-order-link{width:100%}}
    `;
    document.head.appendChild(style);
  };

  const addFloatingButton = async () => {
    const config = await getConfig();
    if (!config.enabled || document.getElementById("fl-whatsapp-order-float")) return;
    injectStyle();
    const link = document.createElement("a");
    link.id = "fl-whatsapp-order-float";
    link.className = "fl-whatsapp-float";
    link.href = `${BASE}?action=chat-link`;
    link.target = "_blank";
    link.rel = "noopener";
    link.setAttribute("aria-label", "WhatsApp sipariş hattını aç");
    link.textContent = "WhatsApp Sipariş";
    document.body.appendChild(link);
  };

  const findOrderCode = (box) => {
    const referenceButton = box.querySelector('[data-copy="reference"]');
    const value = referenceButton?.previousElementSibling?.textContent?.trim()?.toUpperCase() || "";
    return ORDER_RE.test(value) ? value : "";
  };

  const enhancePaymentOutputs = async () => {
    const config = await getConfig();
    if (!config.enabled) return;
    injectStyle();
    document.querySelectorAll(".fl-bank-output").forEach((box) => {
      const orderCode = findOrderCode(box);
      if (!orderCode) return;
      if (box.dataset.whatsappOrderCode === orderCode) return;
      box.dataset.whatsappOrderCode = orderCode;

      const wrap = document.createElement("div");
      wrap.className = "fl-whatsapp-order-actions";
      const link = document.createElement("a");
      link.className = "fl-whatsapp-order-link";
      link.href = `${BASE}?action=order-link&order_code=${encodeURIComponent(orderCode)}`;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "WhatsApp’tan Kodumu Al";
      const help = document.createElement("p");
      help.className = "fl-whatsapp-order-help";
      help.textContent = "Ödeme onaylandıktan sonra bu düğme sipariş kodunu WhatsApp’a hazır taşır. Bot üyelik kodunu yalnız siparişte kayıtlı telefon numarasına verir.";
      wrap.append(link, help);

      const receipt = box.querySelector(".fl-bank-receipt");
      if (receipt) box.insertBefore(wrap, receipt);
      else box.appendChild(wrap);
    });
  };

  const enhance = () => {
    addFloatingButton();
    enhancePaymentOutputs();
  };

  const schedule = () => {
    clearTimeout(timer);
    timer = window.setTimeout(enhance, 60);
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", schedule, { once: true });
  else schedule();
  window.addEventListener("load", schedule, { once: true });
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
})();
