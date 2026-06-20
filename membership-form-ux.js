(() => {
  const PANEL_ID = "membership-payment-panel";

  const enhance = () => {
    const root = document.getElementById(PANEL_ID);
    if (!root) return;

    const name = root.querySelector("[data-member-name]");
    const email = root.querySelector("[data-member-email]");
    const phone = root.querySelector("[data-member-phone]");

    if (name) {
      name.required = true;
      name.autocomplete = "name";
      name.enterKeyHint = "next";
    }

    if (email) {
      email.type = "email";
      email.required = true;
      email.autocomplete = "email";
      email.inputMode = "email";
      email.enterKeyHint = "next";
    }

    if (phone) {
      phone.type = "tel";
      phone.required = true;
      phone.autocomplete = "tel";
      phone.inputMode = "tel";
      phone.enterKeyHint = "done";
      phone.maxLength = 18;
    }
  };

  const schedule = () => window.setTimeout(enhance, 50);

  document.addEventListener("fl:runtime-ready", schedule);
  document.addEventListener("DOMContentLoaded", schedule, { once: true });
  window.addEventListener("load", schedule, { once: true });
  schedule();
})();
