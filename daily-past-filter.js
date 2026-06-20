(() => {
  const WIDGET_ID = "daily-matches-widget";
  const MATCH_LIVE_WINDOW_MINUTES = 130;
  let pending = false;

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

  const rowStartMinutes = (row) => {
    const timeCell = row.querySelector(".daily-match-time");
    return parseMinutes(row.dataset.kickoff || timeCell?.dataset.originalTime || timeCell?.textContent);
  };

  const statusText = (row) => String(row.querySelector(".daily-status-icon")?.getAttribute("title") || row.querySelector(".daily-status-icon")?.textContent || "").toLowerCase();

  const isFinishedStatus = (row) => {
    const status = statusText(row);
    return status.includes("tamam") || status.includes("bitti") || status.includes("finished") || status.includes("iptal") || status.includes("cancelled");
  };

  const shouldRemoveRow = (row, block, now) => {
    if (isFinishedStatus(row)) return true;
    const date = rowDate(row, block);
    const start = rowStartMinutes(row);
    if (!date || start === null) return false;
    if (date < now.date) return true;
    if (date > now.date) return false;
    const elapsed = now.minutes - start;
    if (elapsed < 0) return false;
    return elapsed > MATCH_LIVE_WINDOW_MINUTES;
  };

  const updateText = (node, value) => {
    if (node && node.textContent !== value) node.textContent = value;
  };

  const updateBlock = (block) => {
    const rows = [...block.querySelectorAll(".daily-match-row")];
    updateText(block.querySelector(".daily-league-count"), `${rows.length} maç`);
    if (!rows.length) block.remove();
  };

  const updateTotal = (widget) => {
    const rows = widget.querySelectorAll(".daily-match-row").length;
    const liveRows = widget.querySelectorAll(".daily-match-row.is-live").length;
    const count = widget.querySelector("[data-daily-widget-count]");
    updateText(count, liveRows ? `${rows} maç · ${liveRows} canlı` : `${rows} maç`);
    const list = widget.querySelector("[data-daily-widget-list]");
    if (list && rows === 0 && !list.querySelector(".daily-widget-empty")) {
      list.innerHTML = '<div class="daily-widget-empty">Bugünün kalan maçı yok.</div>';
    }
  };

  const apply = () => {
    const widget = document.getElementById(WIDGET_ID);
    if (!widget) return;
    const now = istanbulParts();
    widget.querySelectorAll(".daily-league-block").forEach((block) => {
      block.querySelectorAll(".daily-match-row").forEach((row) => {
        if (shouldRemoveRow(row, block, now)) row.remove();
      });
      updateBlock(block);
    });
    updateTotal(widget);
  };

  const scheduleApply = () => {
    if (pending) return;
    pending = true;
    setTimeout(() => {
      pending = false;
      apply();
    }, 120);
  };

  const watch = () => {
    const widget = document.getElementById(WIDGET_ID);
    if (!widget || widget.dataset.pastFilterObserver === "1") return;
    widget.dataset.pastFilterObserver = "1";
    new MutationObserver(scheduleApply).observe(widget, { childList: true, subtree: true });
  };

  const run = () => {
    apply();
    watch();
  };

  run();
  document.addEventListener("DOMContentLoaded", run, { once: true });
  window.addEventListener("load", () => {
    run();
    setInterval(apply, 60 * 1000);
    setTimeout(run, 500);
    setTimeout(run, 1500);
    setTimeout(run, 3000);
  }, { once: true });
})();
