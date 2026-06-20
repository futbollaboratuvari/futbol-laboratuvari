(() => {
  const DATA_URL = "./data/fixtures.json";
  const WIDGET_ID = "daily-matches-widget";
  let latestMatches = [];
  let pending = false;

  const normalize = (value) => String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  const parseDate = (text) => {
    const value = String(text || "").trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const match = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    return match ? `${match[3]}-${match[2]}-${match[1]}` : "";
  };

  const keyOf = (item) => [
    parseDate(item.date || item.tarih || item.utc_date),
    String(item.time || item.saat || "").trim(),
    normalize(item.home || item.home_team_name || item.ev_sahibi),
    normalize(item.away || item.away_team_name || item.deplasman),
  ].join("|");

  const rowKey = (row) => {
    const timeCell = row.querySelector(".daily-match-time");
    const date = parseDate(row.querySelector(".daily-match-date")?.textContent);
    const time = row.dataset.kickoff || timeCell?.dataset.originalTime || String(timeCell?.textContent || "").match(/\d{1,2}:\d{2}/)?.[0] || "";
    return [date, time.trim(), normalize(row.dataset.home), normalize(row.dataset.away)].join("|");
  };

  const statusOf = (match) => String(match?.status || match?.liveStatus || match?.durum || "scheduled").toLocaleLowerCase("tr-TR");

  const isLive = (match) => {
    const status = statusOf(match);
    return status === "live" || status === "canlı" || status === "canli" || status === "in_play" || status === "inplay" || status === "1h" || status === "2h" || status === "paused" || status === "ht";
  };

  const isFinished = (match) => {
    const status = statusOf(match);
    return status === "finished" || status === "bitti" || status === "tamamlandı" || status === "tamamlandi" || status === "full_time" || status === "ft" || status === "ms" || status === "cancelled" || status === "canceled" || status === "iptal";
  };

  const scoreOf = (match) => {
    const home = match?.homeScore ?? match?.home_score ?? match?.homeGoals ?? match?.home_goals;
    const away = match?.awayScore ?? match?.away_score ?? match?.awayGoals ?? match?.away_goals;
    if (home !== undefined && home !== null && home !== "" && away !== undefined && away !== null && away !== "") return `${home}-${away}`;
    return String(match?.score || match?.skor || match?.result_score || match?.result || "").trim();
  };

  const minuteOf = (match) => {
    const value = match?.minute ?? match?.elapsed ?? match?.matchMinute ?? match?.dakika;
    if (value === undefined || value === null || value === "") return "";
    const number = Number(value);
    if (!Number.isFinite(number)) return String(value);
    if (number >= 90) return "90+'";
    return `${Math.max(1, Math.round(number))}'`;
  };

  const injectStyle = () => {
    if (document.getElementById("daily-live-score-presenter-style")) return;
    const style = document.createElement("style");
    style.id = "daily-live-score-presenter-style";
    style.textContent = `
      .daily-match-row.is-live{background:rgba(255,77,77,.10)!important;box-shadow:inset 3px 0 0 rgba(255,77,77,.78)}
      .daily-live-line{display:grid;gap:2px;justify-items:center;line-height:1.05}
      .daily-live-label{color:#ff4d4d;font-size:12px;font-weight:950;letter-spacing:.06em}
      .daily-live-score{color:#c8ffdd;font-size:11px;font-weight:900;white-space:nowrap}
    `;
    document.head.appendChild(style);
  };

  const markLive = (row, match) => {
    const minute = minuteOf(match);
    const score = scoreOf(match);
    const timeCell = row.querySelector(".daily-match-time");
    const statusIcon = row.querySelector(".daily-status-icon");
    const button = row.querySelector(".daily-detail-button");
    const info = `${minute || "Canlı"}${score ? ` · ${score}` : " · Skor bekleniyor"}`;

    row.classList.add("is-live");
    row.dataset.liveState = "1";
    row.dataset.minute = String(match.minute ?? match.elapsed ?? match.matchMinute ?? "");
    row.dataset.homeScore = String(match.homeScore ?? match.home_score ?? match.homeGoals ?? match.home_goals ?? "");
    row.dataset.awayScore = String(match.awayScore ?? match.away_score ?? match.awayGoals ?? match.away_goals ?? "");
    row.dataset.score = score;

    if (timeCell) {
      timeCell.dataset.originalTime = timeCell.dataset.originalTime || String(match.time || timeCell.textContent || "").trim();
      timeCell.innerHTML = `<span class="daily-live-line"><strong class="daily-live-label">CANLI</strong><small class="daily-live-score">${info}</small></span>`;
    }
    if (statusIcon) {
      statusIcon.textContent = "🔴";
      statusIcon.setAttribute("title", `Canlı · ${info}`);
    }
    if (button) {
      button.setAttribute("aria-label", `Canlı maç. ${info}. Detaylı oranları aç.`);
      button.setAttribute("title", `Canlı · ${info}`);
    }
  };

  const clearLive = (row, match) => {
    const timeCell = row.querySelector(".daily-match-time");
    row.classList.remove("is-live");
    row.dataset.liveState = "0";
    if (timeCell && timeCell.dataset.originalTime) timeCell.textContent = timeCell.dataset.originalTime;
    if (timeCell && match?.time) timeCell.textContent = match.time;
  };

  const updateCounts = (widget) => {
    const rows = widget.querySelectorAll(".daily-match-row").length;
    const liveRows = widget.querySelectorAll(".daily-match-row.is-live").length;
    const count = widget.querySelector("[data-daily-widget-count]");
    if (count) count.textContent = liveRows ? `${rows} maç · ${liveRows} canlı` : `${rows} maç`;
    widget.querySelectorAll(".daily-league-block").forEach((block) => {
      const blockRows = block.querySelectorAll(".daily-match-row").length;
      const blockCount = block.querySelector(".daily-league-count");
      if (blockCount) blockCount.textContent = `${blockRows} maç`;
      if (!blockRows) block.remove();
    });
  };

  const apply = () => {
    const widget = document.getElementById(WIDGET_ID);
    if (!widget) return;
    injectStyle();
    const byKey = new Map(latestMatches.map((match) => [keyOf(match), match]));
    widget.querySelectorAll(".daily-match-row").forEach((row) => {
      const match = byKey.get(rowKey(row));
      if (!match) return;
      row.dataset.kickoff = match.time || row.dataset.kickoff || "";
      if (isFinished(match)) {
        row.remove();
        return;
      }
      if (isLive(match)) markLive(row, match);
      else clearLive(row, match);
    });
    updateCounts(widget);
  };

  const load = async () => {
    try {
      const response = await fetch(DATA_URL, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      latestMatches = Array.isArray(data) ? data : [];
      apply();
    } catch {
      apply();
    }
  };

  const scheduleApply = () => {
    if (pending) return;
    pending = true;
    setTimeout(() => {
      pending = false;
      apply();
    }, 80);
  };

  const watch = () => {
    const widget = document.getElementById(WIDGET_ID);
    if (!widget || widget.dataset.livePresenterObserver === "1") return;
    widget.dataset.livePresenterObserver = "1";
    new MutationObserver(scheduleApply).observe(widget, { childList: true, subtree: true });
  };

  const run = () => {
    load();
    watch();
  };

  run();
  document.addEventListener("DOMContentLoaded", run, { once: true });
  window.addEventListener("load", () => {
    run();
    setInterval(load, 60 * 1000);
    setTimeout(run, 600);
    setTimeout(run, 1800);
  }, { once: true });
})();
