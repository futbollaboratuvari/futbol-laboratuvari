(() => {
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-create-coupon]").forEach((button) => {
      button.textContent = "Analiz Et";
    });
  });
})();
