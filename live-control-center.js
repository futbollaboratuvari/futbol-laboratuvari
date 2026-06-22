(() => {
  const FIXTURES_URL = "./data/fixtures.json";
  const ANALYSIS_URL = "./data/analiz_sonuclari.json";
  const LIVE_URL = "./data/live-matches.json";
  const STYLE_ID = "live-control-center-style";
  const PANEL_ID = "live-control-center";

  const todayKey = () => new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const readJson = async (url, fallback) => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      return res.ok ? await res.json() : fallback;
    } catch {
      return fallback;
    }
  };

  const statusText = (match) => String(match?.status || match?.liveStatus || "scheduled").toLocaleLowerCase("tr-TR");
  const isLive = (match) => ["live", "canlı", "canli", "in_play", "inplay", "1h", "2h", "ht"].includes(statusText(match));
  const isDone = (match) => ["finished", "bitti", "tamamlandı", "tamamlandi", "full_time", "ft", "ms"].includes(statusText(match));

  const timeText = (value) => {
    if (!value) return "Bekleniyor";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Bekleniyor";
    return new Intl.DateTimeFormat("tr-TR", {
      timeZone: "Europe/Istanbul",
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const scoreText = (match) => {
    const home = match?.homeScore ?? match?.home_score ?? match?.homeGoals ?? match?.home_goals;
    const away = match?.awayScore ?? match?.away_score ?? match?.awayGoals ?? match?.away_goals;
    if (home !== undefined && home !== null && home !== "" && away !== undefined && away !== null && away !== "") return `${home}-${away}`;
    return match?.score || match?.result || "";
  };

  const minuteText = (match) => {
    const minute = Number(match?.minute ?? match?.elapsed ?? match?.matchMinute);
    if (!Number.isFinite(minute)) return "";
    return minute >= 90 ? "90+'" : `${Math.max(1, Math.round(minute))}'`;
  };

  const injectStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .live-control-center{position:relative;z-index:3;margin:24px clamp(18px,6vw,90px) 0;padding:18px;border:1px solid rgba(154,236,255,.24);border-radius:24px;background:linear-gradient(180deg,rgba(8,23,48,.94),rgba(3,8,23,.97));box-shadow:0 24px 70px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.05)}
      .live-control-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:14px}
      .live-control-kicker{display:inline-flex;padding:7px 10px;border:1px solid rgba(57,255,136,.34);border-radius:999px;background:rgba(57,255,136,.10);color:#c8ffdd;font-size:11px;font-weight:950;letter-spacing:.08em;text-transform:uppercase}
      .live-control-title{margin:8px 0 0;color:#e9fcff;font-family:Georgia,"Times New Roman",serif;font-size:clamp(21px,2.4vw,31px);line-height:1.1}
      .live-control-note{margin:7px 0 0;color:#aebbd0;font-size:13px;line-height:1.55}
      .live-control-updated{padding:8px 10px;border-radius:999px;background:rgba(255,255,255,.06);color:#dcecff;font-size:12px}
      .live-control-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
      .live-control-card{display:grid;gap:8px;min-height:126px;padding:14px;border:1px solid rgba(255,255,255,.09);border-radius:18px;background:rgba(255,255,255,.04)}
      .live-control-card strong{color:#f8fbff;font-size:24px;font-weight:950}.live-control-card span{color:#aebbd0;font-size:12px;line-height:1.45}.live-control-card b{width:max-content;padding:5px 8px;border-radius:999px;font-size:10px;letter-spacing:.07em;text-transform:uppercase}
      .live-ok{border-color:rgba(57,255,136,.24)}.live-ok b{color:#c8ffdd;background:rgba(57,255,136,.12)}.live-wait{border-color:rgba(255,185,46,.26)}.live-wait b{color:#ffe8a3;background:rgba(255,185,46,.13)}.live-info{border-color:rgba(154,236,255,.24)}.live-info b{color:#e9fcff;background:rgba(154,236,255,.12)}.live-on{border-color:rgba(255,77,77,.28)}.live-on b{color:#ffd0d0;background:rgba(255,77,77,.13)}
      .live-wide{grid-column:span 2}.live-match-name{color:#f8fbff;font-size:16px;font-weight:900}.live-chip-list{display:flex;flex-wrap:wrap;gap:7px}.live-chip-list em{font-style:normal;padding:6px 8px;border-radius:999px;background:rgba(154,236,255,.09);border:1px solid rgba(154,236,255,.18);color:#d8f7ff;font-size:11px;font-weight:800}
      @media(max-width:980px){.live-control-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.live-wide{grid-column:span 2}}@media(max-width:560px){.live-control-center{margin:18px 14px 0;padding:14px}.live-control-grid{grid-template-columns:1fr}.live-wide{grid-column:span 1}.live-control-head{flex-direction:column}}
    `;
    document.head.appendChild(style);
  };

  const ensurePanel = () => {
    let panel = document.getElementById(PANEL_ID);
    if (panel) return panel;
    panel = document.createElement("section");
    panel.id = PANEL_ID;
    panel.className = "live-control-center";
    panel.setAttribute("aria-label", "Canlı veri durumu");
    const target = document.getElementById("platform") || document.querySelector("main");
    if (target && target.parentNode) target.parentNode.insertBefore(panel, target.nextSibling);
    else document.body.appendChild(panel);
    return panel;
  };

  const render = async () => {
    injectStyle();
    const panel = ensurePanel();
    const [live, fixtures, analysis] = await Promise.all([
      readJson(LIVE_URL, null),
      readJson(FIXTURES_URL, []),
      readJson(ANALYSIS_URL, {}),
    ]);

    const today = todayKey();
    const list = live?.matches || (Array.isArray(fixtures) ? fixtures.filter((item) => item.date === today) : []);
    const liveCount = live?.counts?.live ?? list.filter(isLive).length;
    const finishedCount = live?.counts?.finished ?? list.filter(isDone).length;
    const scheduledCount = live?.counts?.scheduled ?? Math.max(0, list.length - liveCount - finishedCount);
    const analysisCount = (live?.counts?.active_analysis ?? (Array.isArray(analysis.active_items) ? analysis.active_items.length : 0)) + (live?.counts?.completed_analysis ?? (Array.isArray(analysis.completed_items) ? analysis.completed_items.length : 0));
    const next = live?.next_match || list.find((item) => !isDone(item)) || null;
    const focus = live?.focused_markets || analysis.focused_markets || [];
    const nextTitle = next ? `${next.home || next.home_team_name || "Ev sahibi"} - ${next.away || next.away_team_name || "Deplasman"}` : "Maç bekleniyor";
    const nextInfo = next ? `${next.time || "Saat bekleniyor"} · ${next.league || "Lig bilgisi hazırlanıyor"}` : "Güncel maçlar hazırlanıyor";
    const liveDetail = next && isLive(next) ? `${minuteText(next) || "Canlı"}${scoreText(next) ? ` · ${scoreText(next)}` : ""}` : nextInfo;

    panel.innerHTML = `
      <div class="live-control-head">
        <div>
          <span class="live-control-kicker">📡 Canlı Veri</span>
          <h2 class="live-control-title">Maç akışı ve öne çıkan seçenekler</h2>
          <p class="live-control-note">Güncel maçlar, canlı durumlar ve öne çıkan seçenekler tek bakışta gösterilir.</p>
        </div>
        <span class="live-control-updated">Son güncelleme: ${timeText(live?.generated_at || analysis.generated_at)}</span>
      </div>
      <div class="live-control-grid">
        <article class="live-control-card ${list.length ? "live-ok" : "live-wait"}"><b>${list.length ? "Aktif" : "Bekliyor"}</b><strong>${list.length}</strong><span>Bugünün maçları</span></article>
        <article class="live-control-card ${liveCount ? "live-on" : "live-info"}"><b>${liveCount ? "Canlı" : "Sakin"}</b><strong>${liveCount}</strong><span>Canlı oynanan maç</span></article>
        <article class="live-control-card ${scheduledCount ? "live-ok" : "live-wait"}"><b>${scheduledCount ? "Sırada" : "Bekliyor"}</b><strong>${scheduledCount}</strong><span>Başlayacak maç</span></article>
        <article class="live-control-card ${analysisCount ? "live-ok" : "live-wait"}"><b>${analysisCount ? "Hazır" : "Hazırlanıyor"}</b><strong>${analysisCount}</strong><span>Öne çıkan seçenek</span></article>
        <article class="live-control-card live-info live-wide"><b>${next && isLive(next) ? "Canlı maç" : "Sıradaki maç"}</b><strong class="live-match-name">${nextTitle}</strong><span>${liveDetail}</span></article>
        <article class="live-control-card live-info live-wide"><b>Takip edilen seçenekler</b><strong>${focus.length || 0}</strong><span>İlk yarı, ikinci yarı, İY/MS ve gol odaklı seçenekler takip edilir.</span><div class="live-chip-list">${focus.slice(0, 8).map((item) => `<em>${item}</em>`).join("")}</div></article>
      </div>
    `;
  };

  window.addEventListener("load", () => {
    render();
    setInterval(render, 60 * 1000);
  });
})();
