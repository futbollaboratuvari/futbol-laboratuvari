(() => {
  const WIDGET_ID = "daily-matches-widget";
  const FILTER_ID = "daily-past-filter-active";

  const istanbulParts = () => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date()).reduce((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});
    return {
      date: `${parts.year}-${parts.month}-${parts.day}`,
      minutes: Number(parts.hour) * 60 + Number(parts.minute),
    };
  };

  const parseDate = (text) => {
    const value = String(text || "").trim();
    const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    return match ? `${match[3]}-${match[2]}-${match[1]}` : "";
  };

  const parseMinutes = (text) => {
    const value = String(text || "").trim();
    const match = value.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    return Number(match[1]) * 60 + Number(match[2]);
  };

  const rowDate = (row, block) => {
    const rowDateText = row.querySelector(".daily-match-date")?.textContent;
    const blockDateText = block.querySelector(".daily-time-date")?.textContent;
    return parseDate(rowDateText) || parseDate(blockDateText);
  };

  const isPastRow = (row, block, now) => {
    const date = rowDate(row, block);
    const minutes = parseMinutes(row.querySelector(".daily-match-time")?.textContent);
    if (!date || minutes === null) return false;
    if (date < now.date) return true;
    if (date > now.date) return false;
    return minutes < now.minutes;
  };

  const updateBlock = (block) => {
    const rows = [...block.querySelectorAll(".daily-match-row")];
    const count = block.querySelector(".daily-league-count");
    if (count) count.textContent = `${rows.length} maç`;
    if (!rows.length) block.remove();
  };

  const updateTotal = (widget) => {
    const rows = widget.querySelectorAll(".daily-match-row").length;
    const count = widget.querySelector("[data-daily-widget-count]");
    const list = widget.querySelector("[data-daily-widget-list]");
    if (count) count.textContent = `${rows} maç`;
    if (list && rows === 0 && !list.querySelector(".daily-widget-empty")) {
      list.innerHTML = '<div class="daily-widget-empty">Bugünün kalan maçları hazırlanıyor.</div>';
    }
  };

  const apply = () => {
    const widget = document.getElementById(WIDGET_ID);
    if (!widget) return;
    widget.dataset[FILTER_ID] = "1";
    const now = istanbulParts();
    widget.querySelectorAll(".daily-league-block").forEach((block) => {
      block.querySelectorAll(".daily-match-row").forEach((row) => {
        if (isPastRow(row, block, now)) row.remove();
      });
      updateBlock(block);
    });
    updateTotal(widget);
  };

  const watch = () => {
    const widget = document.getElementById(WIDGET_ID);
    if (!widget || widget.dataset.pastFilterObserver === "1") return;
    widget.dataset.pastFilterObserver = "1";
    const observer = new MutationObserver(() => apply());
    observer.observe(widget, { childList: true, subtree: true });
  };

  const run = () => {
    apply();
    watch();
  };

  run();
  document.addEventListener("DOMContentLoaded", run, { once: true });
  window.addEventListener("load", () => {
    run();
    setTimeout(run, 500);
    setTimeout(run, 1500);
    setTimeout(run, 3000);
  }, { once: true });
})();
