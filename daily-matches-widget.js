(() => {
  const DATA_URL = "./data/fixtures.json";
  const WIDGET_ID = "daily-matches-widget";

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const pickOdd = (match, keys) => {
    for (const key of keys) {
      const value = match[key];
      if (value !== undefined && value !== null && value !== "") return value;
    }
    return "-";
  };

  const displayOdd = (value) => {
    const text = String(value ?? "").trim();
    return text && text !== "-" ? text : "—";
  };

  const hasOdd = (value) => {
    const text = String(value ?? "").trim();
    return Boolean(text && text !== "-" && text !== "—");
  };

  const mainOdds = (match) => ({
    one: pickOdd(match, ["one", "oneOdd", "ms1", "odd1"]),
    draw: pickOdd(match, ["draw", "drawOdd", "x", "msx", "oddX"]),
    two: pickOdd(match, ["two", "twoOdd", "ms2", "odd2"]),
    under25: pickOdd(match, ["under25", "alt25", "under", "alt"]),
    over25: pickOdd(match, ["over25", "ust25", "over", "ust"]),
    bttsYes: pickOdd(match, ["bttsYes", "kgVar", "varOdd", "var"]),
    bttsNo: pickOdd(match, ["bttsNo", "kgYok", "yokOdd", "yok"]),
  });

  const dataQuality = (odds) => {
    const values = Object.values(odds);
    const active = values.filter(hasOdd).length;
    if (active >= 6) return { active, total: values.length, label: "Tam Veri", className: "full" };
    if (active >= 3) return { active, total: values.length, label: "Kısmi Veri", className: "partial" };
    return { active, total: values.length, label: "Oran Bekleniyor", className: "waiting" };
  };

  const pickLogo = (match, side) => {
    const keys = side === "home"
      ? ["homeLogo", "home_logo", "home_team_logo", "homeCrest"]
      : ["awayLogo", "away_logo", "away_team_logo", "awayCrest"];
    for (const key of keys) {
      if (match[key]) return match[key];
    }
    return "";
  };

  const teamInitial = (name) => String(name || "?").trim().charAt(0).toUpperCase() || "?";

  const countryFlag = (league = "") => {
    const text = String(league).toLowerCase();
    if (text.includes("dünya")) return "🌍";
    if (text.includes("irlanda")) return "🇮🇪";
    if (text.includes("norveç")) return "🇳🇴";
    if (text.includes("kuveyt")) return "🇰🇼";
    if (text.includes("hazırlık")) return "🌐";
    if (text.includes("litvanya")) return "🇱🇹";
    if (text.includes("abd")) return "🇺🇸";
    if (text.includes("türkiye")) return "🇹🇷";
    return "⚽";
  };

  const todayKey = () =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

  const formatDate = (dateKey) => {
    if (!dateKey || !dateKey.includes("-")) return "Bugün";
    const [year, month, day] = dateKey.split("-");
    return `${day}.${month}.${year}`;
  };

  const normalizeTime = (match) => {
    const raw = String(match.time || "").trim();
    return /^\d{1,2}:\d{2}$/.test(raw) ? raw.padStart(5, "0") : "99:99";
  };

  const normalizeDate = (match) => {
    const raw = String(match.date || "").trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : "9999-99-99";
  };

  const compareByDateTime = (a, b) => {
    const dateCompare = normalizeDate(a).localeCompare(normalizeDate(b));
    if (dateCompare !== 0) return dateCompare;
    const timeCompare = normalizeTime(a).localeCompare(normalizeTime(b));
    if (timeCompare !== 0) return timeCompare;
    const leagueCompare = String(a.league || "").localeCompare(String(b.league || ""), "tr");
    if (leagueCompare !== 0) return leagueCompare;
    return `${a.home || ""} ${a.away || ""}`.localeCompare(`${b.home || ""} ${b.away || ""}`, "tr");
  };

  const statusLabel = (status) => {
    const labels = {
      scheduled: "Oynanacak",
      live: "Canlı",
      finished: "Tamamlandı",
      postponed: "Ertelendi",
      cancelled: "İptal",
    };
    return labels[status] || "Oynanacak";
  };

  const statusIcon = (status) => {
    const icons = {
      scheduled: "🕒",
      live: "🔴",
      finished: "✓",
      postponed: "⏸",
      cancelled: "×",
    };
    return icons[status] || "🕒";
  };

  const groupByDateTime = (matches) => {
    const groups = new Map();
    matches.forEach((match) => {
      const date = normalizeDate(match);
      const time = normalizeTime(match);
      const dateLabel = date === "9999-99-99" ? "Tarih Bekleniyor" : formatDate(date);
      const timeLabel = time === "99:99" ? "Saat Bekleniyor" : time;
      const key = `${date}|${time}`;
      if (!groups.has(key)) groups.set(key, { dateLabel, timeLabel, items: [] });
      groups.get(key).items.push(match);
    });
    return [...groups.values()].map((group) => ({
      ...group,
      items: group.items.sort((a, b) => {
        const leagueCompare = String(a.league || "").localeCompare(String(b.league || ""), "tr");
        if (leagueCompare !== 0) return leagueCompare;
        return `${a.home || ""} ${a.away || ""}`.localeCompare(`${b.home || ""} ${b.away || ""}`, "tr");
      }),
    }));
  };

  const injectStyle = () => {
    if (document.querySelector("#daily-matches-widget-style")) return;
    const style = document.createElement("style");
    style.id = "daily-matches-widget-style";
    style.textContent = `
      .daily-widget-shell{position:relative;z-index:3;margin:22px clamp(18px,6vw,90px) 0;padding:18px;border:1px solid rgba(255,159,28,.3);border-radius:22px;background:linear-gradient(135deg,rgba(255,159,28,.08),transparent 34%),linear-gradient(180deg,rgba(8,23,48,.96),rgba(3,8,23,.97));box-shadow:0 24px 70px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.05);box-sizing:border-box}
      .daily-widget-head{display:flex;align-items:flex-end;justify-content:space-between;gap:16px;margin-bottom:16px}.daily-widget-title{margin:0;color:#ffe08a;font-size:clamp(20px,2.2vw,30px);line-height:1.1}.daily-widget-subtitle{margin:6px 0 0;color:#aebbd0;font-size:13px}.daily-widget-count{display:inline-flex;align-items:center;gap:8px;padding:9px 12px;border:1px solid rgba(57,255,136,.34);border-radius:999px;background:rgba(57,255,136,.12);color:#c8ffdd;font-size:13px;font-weight:800;white-space:nowrap}.daily-widget-list{display:grid;gap:16px}.daily-league-block{overflow:hidden;border:1px solid rgba(255,159,28,.22);border-radius:18px;background:rgba(3,8,23,.6)}.daily-league-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;background:linear-gradient(90deg,rgba(255,159,28,.72),rgba(19,120,69,.62),rgba(3,8,23,.72));border-bottom:1px solid rgba(255,159,28,.28)}.daily-league-title{display:flex;align-items:center;gap:10px;min-width:0}.daily-league-flag{font-size:18px;line-height:1}.daily-league-name{color:#fff7d6;font-size:13px;font-weight:950;letter-spacing:.08em;text-transform:uppercase;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 0 rgba(0,0,0,.28)}.daily-time-date{display:inline-flex;align-items:center;margin-right:6px;padding:3px 7px;border:1px solid rgba(255,255,255,.16);border-radius:999px;background:rgba(3,8,23,.22);color:#c8ffdd;font-size:11px;font-weight:950;letter-spacing:.02em}.daily-league-count{color:#fff;font-size:12px;font-weight:900;white-space:nowrap}.daily-table-scroll{width:100%;overflow-x:auto;overscroll-behavior-x:contain}.daily-match-table{display:grid;width:100%;min-width:900px}.daily-match-header,.daily-match-row{display:grid;grid-template-columns:64px minmax(250px,1fr) repeat(7,minmax(52px,64px)) 92px;align-items:stretch}.daily-match-header{background:linear-gradient(180deg,rgba(35,48,49,.98),rgba(20,31,34,.98));color:#ffe08a;font-size:11px;font-weight:950;letter-spacing:.06em;text-transform:uppercase}.daily-match-header span,.daily-match-row>*{display:flex;align-items:center;min-height:44px;padding:9px 8px;border-right:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.07);box-sizing:border-box}.daily-match-header span:last-child,.daily-match-row>*:last-child{border-right:0}.daily-match-row:nth-child(odd){background:rgba(255,255,255,.03)}.daily-match-row:nth-child(even){background:rgba(255,159,28,.025)}.daily-match-row.is-open{background:rgba(255,159,28,.085)!important;box-shadow:inset 3px 0 0 rgba(57,255,136,.68)}.daily-match-time{justify-content:center;color:#39ff88;font-size:16px;font-weight:950}.daily-match-date{display:none}.daily-match-teams{display:grid;grid-template-columns:minmax(0,1fr) 20px minmax(0,1fr);gap:7px;color:#f8fbff;font-size:13px;font-weight:850;align-content:center}.daily-match-league{grid-column:1/-1;margin-top:2px;color:#aebbd0;font-size:10px;font-weight:850;letter-spacing:.06em;text-transform:uppercase;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.daily-team{display:flex;align-items:center;gap:7px;min-width:0}.daily-team-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.daily-team-logo{display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;width:24px;height:24px;border:1px solid rgba(255,159,28,.42);border-radius:999px;background:linear-gradient(180deg,rgba(255,159,28,.18),rgba(57,255,136,.08));color:#ffe08a;font-size:10px;font-weight:950;overflow:hidden}.daily-team-logo img{width:100%;height:100%;object-fit:contain}.daily-match-vs{justify-content:center;color:#aebbd0;font-size:12px;font-weight:900}.daily-odd{justify-content:center;background:rgba(255,255,255,.055);color:#fff;font-size:12px;font-weight:900;text-align:center}.daily-odd.is-empty{color:#738096;background:rgba(255,255,255,.025)}.daily-odd:hover{background:rgba(255,159,28,.18);color:#ffe08a}.daily-widget-status{justify-content:center;color:#ffe08a;font-size:11px;font-weight:800}.daily-detail-button{width:100%;min-height:34px;display:grid;grid-template-columns:24px 1fr 22px;align-items:center;gap:5px;border:1px solid rgba(255,159,28,.28);border-radius:999px;background:rgba(3,8,23,.74);color:#f8fbff;cursor:pointer;padding:5px 6px;box-shadow:inset 0 1px 0 rgba(255,255,255,.05)}.daily-detail-button:hover{border-color:rgba(57,255,136,.42);background:rgba(57,255,136,.08)}.daily-status-icon{display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:999px;border:1px solid rgba(255,159,28,.30);background:rgba(255,159,28,.12);font-size:12px;line-height:1}.daily-odds-badge{display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:24px;padding:0 6px;border-radius:999px;border:1px solid rgba(57,255,136,.30);background:rgba(57,255,136,.10);color:#c8ffdd;font-size:10px;font-weight:950;line-height:1;white-space:nowrap}.daily-chevron{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:999px;background:rgba(255,159,28,.16);color:#ffe08a;font-size:15px;line-height:1;transition:transform .18s ease,background .18s ease}.daily-detail-button[aria-expanded="true"] .daily-chevron{transform:rotate(180deg);background:rgba(57,255,136,.16);color:#c8ffdd}.daily-widget-empty{padding:18px;border:1px solid rgba(255,159,28,.18);border-radius:16px;background:rgba(3,8,23,.58);color:#aebbd0}
      @media(max-width:720px){.daily-widget-shell{margin:16px 12px 0;padding:12px;border-radius:18px}.daily-widget-head{align-items:flex-start;flex-direction:column}.daily-league-block{overflow:visible}.daily-time-date{width:max-content;margin:0 0 5px;padding:4px 8px}.daily-table-scroll{overflow:visible}.daily-match-table{min-width:0;gap:12px}.daily-match-header{display:none}.daily-match-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding:12px;border:1px solid rgba(255,159,28,.18);border-radius:16px;background:linear-gradient(135deg,rgba(57,255,136,.07),transparent 38%),rgba(3,8,23,.74);box-shadow:0 14px 32px rgba(0,0,0,.24)}.daily-match-row>*{min-height:auto;padding:0;border:0}.daily-match-time{grid-column:1/2;justify-content:flex-start;font-size:18px}.daily-match-date{display:flex;grid-column:2/-1;align-items:center;justify-content:flex-end;color:#c8ffdd;font-size:11px;font-weight:900}.daily-match-teams{grid-column:1/-1;grid-template-columns:1fr;gap:8px;font-size:13px}.daily-team{padding:8px 10px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(255,255,255,.045)}.daily-team-name{white-space:normal;line-height:1.25}.daily-match-vs{display:none}.daily-odd{display:grid;gap:3px;place-items:center;min-height:52px;padding:7px 5px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(255,255,255,.055);font-size:13px}.daily-odd::before{content:attr(data-label);color:#aebbd0;font-size:10px;font-weight:950;letter-spacing:.05em;text-transform:uppercase}.daily-widget-status{grid-column:1/-1}.daily-detail-button{min-height:42px;grid-template-columns:32px 1fr 32px}.daily-status-icon{width:28px;height:28px}.daily-odds-badge{height:28px;font-size:12px}.daily-chevron{width:28px;height:28px}}
      @media(max-width:420px){.daily-match-row{grid-template-columns:repeat(2,minmax(0,1fr))}.daily-match-time{grid-column:1/-1}.daily-match-date{grid-column:1/-1;justify-content:flex-start}.daily-odd{min-height:48px}.daily-widget-count{white-space:normal}}
    `;
    document.head.appendChild(style);
  };

  const ensureWidget = () => {
    let widget = document.querySelector(`#${WIDGET_ID}`);
    if (widget) {
      widget.classList.add("daily-widget-shell");
      widget.setAttribute("aria-label", "Bugünün maçları");
      if (!widget.querySelector("[data-daily-widget-list]")) {
        widget.innerHTML = `<div class="daily-widget-head"><div><h2 class="daily-widget-title">Bugünün Maçları</h2><p class="daily-widget-subtitle" data-daily-widget-date>Bugünün maçları yükleniyor.</p></div><span class="daily-widget-count" data-daily-widget-count>0 maç</span></div><div class="daily-widget-list" data-daily-widget-list><div class="daily-widget-empty">Bugünün maçları hazırlanıyor.</div></div>`;
      } else {
        const title = widget.querySelector(".daily-widget-title");
        if (title) title.textContent = "Bugünün Maçları";
        const empty = widget.querySelector(".daily-widget-empty");
        if (empty && empty.textContent.includes("Günlük")) empty.textContent = "Bugünün maçları hazırlanıyor.";
      }
      return widget;
    }
    widget = document.createElement("section");
    widget.id = WIDGET_ID;
    widget.className = "daily-widget-shell";
    widget.setAttribute("aria-label", "Bugünün maçları");
    widget.innerHTML = `<div class="daily-widget-head"><div><h2 class="daily-widget-title">Bugünün Maçları</h2><p class="daily-widget-subtitle" data-daily-widget-date>Bugünün maçları yükleniyor.</p></div><span class="daily-widget-count" data-daily-widget-count>0 maç</span></div><div class="daily-widget-list" data-daily-widget-list><div class="daily-widget-empty">Bugünün maçları hazırlanıyor.</div></div>`;
    const target = document.querySelector("#yaklasan-maclar") || document.querySelector("main");
    if (target && target.parentNode) target.parentNode.insertBefore(widget, target);
    else document.body.appendChild(widget);
    return widget;
  };

  const logoHtml = (match, side) => {
    const name = side === "home" ? match.home : match.away;
    const logo = pickLogo(match, side);
    if (logo) return `<span class="daily-team-logo"><img src="${escapeHtml(logo)}" alt="" loading="lazy"></span>`;
    return `<span class="daily-team-logo">${escapeHtml(teamInitial(name))}</span>`;
  };

  const oddCell = (label, value) => `<span class="daily-odd ${hasOdd(value) ? "" : "is-empty"}" data-label="${escapeHtml(label)}">${escapeHtml(displayOdd(value))}</span>`;

  const detailButton = (match, odds) => {
    const quality = dataQuality(odds);
    const status = statusLabel(match.status);
    return `<button class="daily-detail-button" type="button" aria-expanded="false" aria-label="${escapeHtml(status)}. Detaylı oranları aç." title="${escapeHtml(status)} · Detaylı Oranlar" data-daily-detail-toggle><span class="daily-status-icon" title="${escapeHtml(status)}" aria-hidden="true">${escapeHtml(statusIcon(match.status))}</span><span class="daily-odds-badge" title="${quality.active}/${quality.total} oran mevcut">${quality.active}/${quality.total}</span><span class="daily-chevron" aria-hidden="true">⌄</span></button>`;
  };

  const renderDateTimeGroup = ({ dateLabel, timeLabel, items }) => `<article class="daily-league-block"><div class="daily-league-head"><div class="daily-league-title"><span class="daily-league-flag">🕒</span><span class="daily-league-name"><span class="daily-time-date">${escapeHtml(dateLabel)}</span>${escapeHtml(timeLabel)} Maçları</span></div><span class="daily-league-count">${items.length} maç</span></div><div class="daily-table-scroll"><div class="daily-match-table"><div class="daily-match-header"><span>Saat</span><span>Maç</span><span>1</span><span>X</span><span>2</span><span>Alt</span><span>Üst</span><span>Var</span><span>Yok</span><span>Detay</span></div>${items.map((match) => { const odds = mainOdds(match); const rowDateLabel = formatDate(match.date); return `<div class="daily-match-row" data-home="${escapeHtml(match.home || "Ev sahibi")}" data-away="${escapeHtml(match.away || "Deplasman")}"><div class="daily-match-time">${escapeHtml(match.time || "--:--")}</div><div class="daily-match-date">${escapeHtml(rowDateLabel)}</div><div class="daily-match-teams"><small class="daily-match-league">${escapeHtml(match.league || "Diğer Maçlar")}</small><span class="daily-team">${logoHtml(match, "home")}<span class="daily-team-name">${escapeHtml(match.home || "Ev sahibi")}</span></span><span class="daily-match-vs">-</span><span class="daily-team">${logoHtml(match, "away")}<span class="daily-team-name">${escapeHtml(match.away || "Deplasman")}</span></span></div>${oddCell("1", odds.one)}${oddCell("X", odds.draw)}${oddCell("2", odds.two)}${oddCell("Alt", odds.under25)}${oddCell("Üst", odds.over25)}${oddCell("Var", odds.bttsYes)}${oddCell("Yok", odds.bttsNo)}<span class="daily-widget-status">${detailButton(match, odds)}</span></div>`; }).join("")}</div></div></article>`;

  const render = (matches) => {
    const widget = ensureWidget();
    const list = widget.querySelector("[data-daily-widget-list]");
    const count = widget.querySelector("[data-daily-widget-count]");
    const date = widget.querySelector("[data-daily-widget-date]");
    const today = todayKey();
    const todaysMatches = matches.filter((match) => match.date === today).sort(compareByDateTime);
    if (date) date.textContent = `${formatDate(today)} programı`;
    if (count) count.textContent = `${todaysMatches.length} maç`;
    if (!todaysMatches.length) {
      list.innerHTML = `<div class="daily-widget-empty">Bugünün maçları hazırlanıyor.</div>`;
      return;
    }
    list.innerHTML = groupByDateTime(todaysMatches).map(renderDateTimeGroup).join("");
  };

  const load = async () => {
    injectStyle();
    ensureWidget();
    try {
      const response = await fetch(DATA_URL, { cache: "no-store" });
      if (!response.ok) throw new Error(String(response.status));
      const data = await response.json();
      render(Array.isArray(data) ? data : []);
    } catch {
      render([]);
    }
  };

  window.addEventListener("load", () => {
    load();
    setInterval(load, 5 * 60 * 1000);
  });
})();
