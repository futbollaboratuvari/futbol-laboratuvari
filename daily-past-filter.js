(() => {
  const WIDGET_ID = "daily-matches-widget";
  const MATCH_LIVE_WINDOW_MINUTES = 130;

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

  const rowStartMinutes = (row) => parseMinutes(row.dataset.kickoff || row.querySelector(".daily-match-time")?.textContent);

  const statusText = (row) => String(row.querySelector(".daily-status-icon")?.getAttribute("title") || row.querySelector(".daily-status-icon")?.textContent || "").toLowerCase();

  const isFinishedStatus = (row) => {
    const status = statusText(row);
    return status.includes("tamam") || status.includes("bitti") || status.includes("finished") || status.includes("iptal") || status.includes("cancelled");
  };

  const scoreText = (row) => {
    const home = row.dataset.homeScore || row.dataset.homeGoals || "";
    const away = row.dataset.awayScore || row.dataset.awayGoals || "";
    if (home !== "" && away !== "") return `${home}-${away}`;
    const inline = row.dataset.score || row.querySelector("[data-live-score]")?.textContent || "";
    return String(inline || "").trim();
  };

  const liveMinute = (elapsed) => {
    if (elapsed < 45) return `${Math.max(1, elapsed)}'`;
    if (elapsed <= 60) return "İY";
    if (elapsed <= 105) return `${Math.min(90, elapsed - 15)}'`;
    return "90+'";
  };

  const markLive = (row, elapsed) => {
    row.classList.add("is-live");
    row.dataset.liveState = "1";
    const timeCell = row.querySelector(".daily-match-time");
    const statusIcon = row.querySelector(".daily-status-icon");
    const button = row.querySelector(".daily-detail-button");
    const score = scoreText(row);
    const minute = liveMinute(elapsed);
    if (timeCell) {
      timeCell.dataset.originalTime = timeCell.dataset.originalTime || timeCell.textContent.trim();
      timeCell.innerHTML = `<span style="display:grid;gap:2px;justify-items:center"><strong style="color:#ff4d4d;font-size:12px;letter-spacing:.06em">CANLI</strong><small style="color:#c8ffdd;font-size:11px">${minute}${score ? ` · ${score}` : " · Skor bekleniyor"}</small></span>`;
    }
    if (statusIcon) {
      statusIcon.textContent = "🔴";
      statusIcon.setAttribute("title", `Canlı · ${minute}${score ? ` · ${score}` : ""}`);
    }
    if (button) {
      button.setAttribute("aria-label", `Canlı maç. ${minute}${score ? ` skor ${score}` : " skor bekleniyor"}. Detaylı oranları aç.`);
      button.setAttribute("title", `Canlı · ${minute}${score ? ` · ${score}` : " · Skor bekleniyor"}`);
    }
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
    if (elapsed <= MATCH_LIVE_WINDOW_MINUTES) {
      markLive(row, elapsed);
      return false;
    }
    return true;
  };

  const updateBlock = (block) => {
    const rows = [...block.querySelectorAll(".daily-match-row")];
    const count = block.querySelector(".daily-league-count");
    if (count) count.textContent = `${rows.length} maç`;
    if (!rows.length) block.remove();
  };

  const updateTotal = (widget) => {
    const rows = widget.querySelectorAll(".daily-match-row").length;
    const liveRows = widget.querySelectorAll(".daily-match-row.is-live").length;
    const count = widget.querySelector("[data-daily-widget-count]");
    const list = widget.querySelector("[data-daily-widget-list]");
    if (count) count.textContent = liveRows ? `${rows} maç · ${liveRows} canlı` : `${rows} maç`;
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
    setInterval(apply, 60 * 1000);
    setTimeout(run, 500);
    setTimeout(run, 1500);
    setTimeout(run, 3000);
  }, { once: true });
})();
