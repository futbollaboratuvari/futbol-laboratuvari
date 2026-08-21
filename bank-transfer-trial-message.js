(() => {
  if (window.__flBankTrialMessageReady) return;
  window.__flBankTrialMessageReady = true;

  const formatDate = value => {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" }) : "";
  };

  document.addEventListener("fl:trial-access-started", event => {
    window.setTimeout(() => {
      const output = document.querySelector("#membership-payment-panel [data-membership-output]");
      if (!output) return;
      const planName = event.detail?.plan?.name || "Paket";
      const expiresAt = event.detail?.expiresAt;
      const expiry = expiresAt ? formatDate(expiresAt) : "";
      output.innerHTML = `<strong>${planName} 1 günlük deneme aktif.</strong>${expiry ? `<br>Deneme bitişi: ${expiry}` : ""}<br>Satın almak istediğinde Havale / EFT / FAST ödeme seçeneğini kullanabilirsin.<br><a class="membership-return" href="#premium-analysis-panel">Özel Analiz paneline dön</a>`;
    }, 0);
  });
})();
