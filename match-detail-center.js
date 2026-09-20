(() => {
  const DATA_URL = "./data/match-detail-center.json";
  const TABS = [
    ["summary", "Özet"],
    ["standings", "Puan Tablosu"],
    ["h2h", "Rekabet Geçmişi"],
    ["recent", "Son Maçlar"],
    ["squads", "Kadrolar"],
    ["discipline", "Korner & Kart"],
    ["referee", "Hakem"],
  ];
  const state = { data: null, loading: null, match: null, detail: null, tab: "summary", trigger: null };
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const clean = (value) => String(value ?? "").trim().toLocaleLowerCase("tr-TR").replace(/ı/g, "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  const pairKey = (row) => `${String(row?.date || "").slice(0, 10)}|${clean(row?.home)}|${clean(row?.away)}`;
  const textOr = (value, fallback = "Veri bekleniyor") => String(value ?? "").trim() || fallback;
  const numberOrDash = (value) => value === null || value === undefined || value === "" ? "—" : String(value);
  const formatDate = (value) => {
    const found = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    return found ? `${found[3]}.${found[2]}.${found[1]}` : textOr(value, "—");
  };
  const app = () => window.__flDailyWidget || {};
  const allMatches = () => [...(app().bulletin || []), ...(app().live || []), ...(app().finished || [])];
  const matchById = (id) => allMatches().find((match) => String(match._id) === String(id)) || null;

  const loadData = async () => {
    if (state.data) return state.data;
    if (!state.loading) state.loading = fetch(`${DATA_URL}?v=${Date.now()}`, { cache: "no-cache" })
      .then((response) => { if (!response.ok) throw new Error(String(response.status)); return response.json(); })
      .then((data) => { state.data = data; return data; })
      .catch(() => ({ matches: [] }))
      .finally(() => { state.loading = null; });
    return state.loading;
  };

  const findDetail = (match, root) => (root?.matches || []).find((detail) =>
    [detail.id, detail.matchCode, detail.match_code].filter(Boolean).some((id) => String(id) === String(match?._id))
    || pairKey(detail) === pairKey(match)
  ) || null;

  const fallbackDetail = (match) => {
    const context = match?.match_detail_context || match?.team_intelligence?.match_detail_context || {};
    return {
      id: match?._id,
      date: match?.date,
      time: match?.time,
      league: match?.league,
      home: match?.home,
      away: match?.away,
      summary: {
        status: match?.status,
        score: match?.score,
        prediction: match?.decision || match?.recommended_market || match?.best_market || match?.prediction,
        analysis: match?.robot_reason || match?.robot_comment || match?.detail?.analysis,
        confidence: match?.analysis_score ?? match?.confidence ?? match?.model_score,
        risk: match?.risk_level || match?.risk,
        goal_expectation: match?.goal_expectation || match?.gol_beklentisi,
        venue: match?.venue,
        source: match?.source,
      },
      standings: context.standings || { available: false },
      head_to_head: { available: Array.isArray(context.head_to_head) && context.head_to_head.length > 0, matches: context.head_to_head || [] },
      recent_matches: { available: Boolean(context.recent_form), home: context.recent_form?.home || [], away: context.recent_form?.away || [] },
      squads: {
        available: Boolean(match?.team_intelligence || match?.home_lineup || match?.away_lineup),
        home: match?.team_intelligence?.home_lineup || match?.home_lineup,
        away: match?.team_intelligence?.away_lineup || match?.away_lineup,
        squad_risk: match?.squad_risk_level,
        lineup_risk: match?.lineup_risk_level,
        matchup_analysis: match?.matchup_analysis,
      },
      corners_cards: context.discipline ? { available: true, home: context.discipline.home, away: context.discipline.away, current: { home: {}, away: {} } } : { available: false },
      referee: context.referee ? { available: true, details: context.referee } : { available: false },
      provenance: context.provenance || { sources: [match?.source].filter(Boolean) },
    };
  };

  const empty = (message) => `<div class="flmd-empty">${esc(message)}</div>`;
  const fact = (label, value) => `<div class="flmd-fact"><span>${esc(label)}</span><strong>${esc(textOr(value, "—"))}</strong></div>`;
  const sources = (detail) => `<p class="flmd-source">Kaynak: ${esc((detail?.provenance?.sources || []).join(" · ") || "Doğrulanmış veri akışı bekleniyor")} · Eksik veri tahmin edilmez.</p>`;
  const excerptCard = (title, value, detail) => value ? `<article class="flmd-card full"><h3>${esc(title)}</h3><p>${esc(value)}</p>${sources(detail)}</article>` : "";

  const summaryHtml = (detail) => {
    const row = detail.summary || {};
    return `<div class="flmd-grid">
      <article class="flmd-card full"><h3>Maç Özeti</h3><div class="flmd-facts">
        ${fact("Başlangıç", `${formatDate(detail.date)} · ${textOr(detail.time, "—")}`)}
        ${fact("Durum", row.status)}${fact("Skor", row.score)}${fact("Stadyum", row.venue)}
        ${fact("Robot Seçimi", row.prediction)}${fact("Model Gücü", row.confidence === null || row.confidence === undefined ? "—" : `%${row.confidence}`)}
        ${fact("Risk", row.risk)}${fact("Gol Beklentisi", row.goal_expectation)}
      </div></article>
      <article class="flmd-card full"><h3>Robot Yorumu</h3><p>${esc(textOr(row.analysis, "Bu maç için doğrulanmış robot yorumu henüz üretilmedi."))}</p></article>
      ${detail.source_excerpt ? excerptCard("Doğrulanmış Maç Kaynağı", detail.source_excerpt, detail) : sources(detail)}
    </div>`;
  };

  const standingRow = (team, row) => `<tr><td>${esc(team)}</td><td>${esc(numberOrDash(row?.rank))}</td><td>${esc(numberOrDash(row?.played))}</td><td>${esc(numberOrDash(row?.wins))}</td><td>${esc(numberOrDash(row?.draws))}</td><td>${esc(numberOrDash(row?.losses))}</td><td>${esc(numberOrDash(row?.goals_for))}-${esc(numberOrDash(row?.goals_against))}</td><td>${esc(numberOrDash(row?.points))}</td><td>${esc((row?.recent_form || []).join(" ") || "—")}</td></tr>`;
  const standingsHtml = (detail) => detail.standings?.available ? `<article class="flmd-card full"><h3>Puan Tablosu Karşılaştırması</h3><div class="flmd-table-wrap"><table class="flmd-table"><thead><tr><th>Takım</th><th>Sıra</th><th>O</th><th>G</th><th>B</th><th>M</th><th>Gol</th><th>Puan</th><th>Form</th></tr></thead><tbody>${standingRow(detail.home, detail.standings.home)}${standingRow(detail.away, detail.standings.away)}</tbody></table></div>${detail.standings.note ? `<p>${esc(detail.standings.note)}</p>` : ""}${sources(detail)}</article>` : (excerptCard("Puan Tablosu · Doğrulanmış Kaynak", detail.standings?.source_excerpt, detail) || empty("Bu lig için doğrulanmış puan tablosu verisi henüz bulunmuyor."));

  const h2hHtml = (detail) => detail.head_to_head?.available ? `<article class="flmd-card full"><h3>Son Rekabet Maçları</h3><ul class="flmd-list">${detail.head_to_head.matches.map((row) => `<li><span>${esc(formatDate(row.date))} · <strong>${esc(row.home)} - ${esc(row.away)}</strong></span><strong>${esc(row.score || "—")}</strong></li>`).join("")}</ul>${sources(detail)}</article>` : (excerptCard("Rekabet Geçmişi · Doğrulanmış Kaynak", detail.head_to_head?.source_excerpt, detail) || empty("Bu iki takım için doğrulanmış rekabet geçmişi henüz bulunmuyor."));

  const recentList = (team, rows) => `<article class="flmd-card"><h3>${esc(team)}</h3>${rows?.length ? `<ul class="flmd-list">${rows.map((row) => `<li><span class="flmd-result ${esc(String(row.result || "").toLowerCase())}">${esc(row.result || "—")}</span><span><strong>${esc(row.opponent || "Rakip")}</strong><br>${esc(formatDate(row.date))}</span><strong>${esc(row.score || "—")}</strong></li>`).join("")}</ul>` : `<p>Doğrulanmış son maç kaydı bekleniyor.</p>`}</article>`;
  const recentHtml = (detail) => detail.recent_matches?.available ? `<div class="flmd-grid">${recentList(detail.home, detail.recent_matches.home)}${recentList(detail.away, detail.recent_matches.away)}${sources(detail)}</div>` : (excerptCard("Son Maçlar · Doğrulanmış Kaynak", detail.recent_matches?.source_excerpt, detail) || empty("Takımların doğrulanmış son maç verisi henüz bulunmuyor."));

  const playerList = (title, players) => players?.length ? `<h4>${esc(title)}</h4><ul class="flmd-player-list">${players.map((player) => `<li><strong>${esc(player.name || player)}</strong>${player.position ? ` · ${esc(player.position)}` : ""}${player.reason ? `<br>${esc(player.reason)}` : ""}</li>`).join("")}</ul>` : "";
  const teamSquad = (team, row) => `<article class="flmd-card"><h3>${esc(team)}</h3><div class="flmd-facts">${fact("İlk 11", row?.lineup_confirmed ? "Doğrulandı" : "Bekleniyor")}${fact("Diziliş", row?.formation)}${fact("Teknik Direktör", row?.coach)}</div>${playerList("İlk 11", row?.starting_11)}${playerList("Sakat / Cezalı / Şüpheli", [...(row?.unavailable_players || []), ...(row?.injured_players || []), ...(row?.suspended_players || []), ...(row?.doubtful_players || [])])}</article>`;
  const squadsHtml = (detail) => detail.squads?.available ? `<div class="flmd-players">${teamSquad(detail.home, detail.squads.home)}${teamSquad(detail.away, detail.squads.away)}</div><div class="flmd-alert">Kadro riski: ${esc(textOr(detail.squads.squad_risk, "Belirsiz"))} · İlk 11 riski: ${esc(textOr(detail.squads.lineup_risk, "Belirsiz"))}</div>${sources(detail)}` : (excerptCard("Kadrolar · Doğrulanmış Kaynak", detail.squads?.source_excerpt, detail) || empty("Doğrulanmış kadro veya ilk 11 verisi henüz bulunmuyor."));

  const disciplineTeam = (team, row, current) => `<article class="flmd-card"><h3>${esc(team)}</h3><div class="flmd-facts">${fact("Ort. Korner", row?.average_corners)}${fact("Ort. Sarı Kart", row?.average_yellow_cards)}${fact("Ort. Kırmızı Kart", row?.average_red_cards)}${fact("Örneklem", row?.sample_size)}${fact("Bu Maç Korner", current?.corners)}${fact("Bu Maç Kart", current?.yellow_cards === null || current?.yellow_cards === undefined ? "—" : `${current.yellow_cards} sarı · ${current.red_cards ?? 0} kırmızı`)}</div></article>`;
  const disciplineHtml = (detail) => detail.corners_cards?.available ? `<div class="flmd-grid">${disciplineTeam(detail.home, detail.corners_cards.home, detail.corners_cards.current?.home)}${disciplineTeam(detail.away, detail.corners_cards.away, detail.corners_cards.current?.away)}${sources(detail)}</div>` : (excerptCard("Korner & Kart · Doğrulanmış Kaynak", detail.corners_cards?.source_excerpt, detail) || empty("Doğrulanmış korner ve kart verisi henüz bulunmuyor."));

  const refereeHtml = (detail) => detail.referee?.available ? `<article class="flmd-card full"><h3>Hakem Bilgisi</h3><div class="flmd-facts">${fact("Hakem", detail.referee.details?.name)}${fact("Ülke", detail.referee.details?.nationality)}${fact("Kaynak", detail.referee.details?.source)}</div>${sources(detail)}</article>` : (excerptCard("Hakem · Doğrulanmış Kaynak", detail.referee?.source_excerpt, detail) || empty("Bu maç için doğrulanmış hakem ataması henüz bulunmuyor."));

  const bodyHtml = (detail) => ({ summary: summaryHtml, standings: standingsHtml, h2h: h2hHtml, recent: recentHtml, squads: squadsHtml, discipline: disciplineHtml, referee: refereeHtml }[state.tab] || summaryHtml)(detail);

  const render = () => {
    const detail = state.detail || fallbackDetail(state.match || {});
    const old = document.querySelector(".flmd-backdrop");
    if (old) old.remove();
    const backdrop = document.createElement("div");
    backdrop.className = "flmd-backdrop";
    backdrop.innerHTML = `<section class="flmd-modal" role="dialog" aria-modal="true" aria-labelledby="flmd-title">
      <header class="flmd-head"><div><span class="flmd-kicker">MAÇ İSTATİSTİK MERKEZİ</span><h2 id="flmd-title">${esc(detail.home)} - ${esc(detail.away)}</h2><div class="flmd-meta"><span>${esc(detail.league || "Lig")}</span><span>${esc(formatDate(detail.date))} · ${esc(detail.time || "—")}</span></div></div><button type="button" class="flmd-close" data-flmd-close aria-label="Kapat">×</button></header>
      <div class="flmd-tabs" role="tablist" aria-label="Maç detay bölümleri">${TABS.map(([key, label]) => `<button type="button" class="flmd-tab" role="tab" data-flmd-tab="${key}" aria-selected="${state.tab === key}">${esc(label)}</button>`).join("")}</div>
      <div class="flmd-body" role="tabpanel">${bodyHtml(detail)}</div>
    </section>`;
    document.body.appendChild(backdrop);
    document.body.classList.add("flmd-lock");
    backdrop.querySelector("[data-flmd-close]")?.focus();
  };

  const close = () => {
    document.querySelector(".flmd-backdrop")?.remove();
    document.body.classList.remove("flmd-lock");
    state.trigger?.focus?.();
    state.match = null;
    state.detail = null;
  };

  const open = async (id, trigger) => {
    const match = matchById(id);
    if (!match) return;
    state.match = app().details?.get?.(id) || match;
    state.detail = fallbackDetail(state.match);
    state.tab = "summary";
    state.trigger = trigger || null;
    render();
    const root = await loadData();
    if (!state.match) return;
    state.detail = findDetail(state.match, root) || state.detail;
    render();
  };

  const enhance = () => {
    document.querySelectorAll("#daily-matches-widget .flw-detail-row").forEach((detailRow) => {
      if (detailRow.querySelector("[data-fl-match-detail]")) return;
      const row = detailRow.previousElementSibling;
      const id = row?.dataset?.rowToggle;
      const grid = detailRow.querySelector(".flw-detail-grid");
      if (!id || !grid) return;
      const wrap = document.createElement("div");
      wrap.className = "flmd-open-wrap";
      wrap.innerHTML = `<button type="button" class="flmd-open" data-fl-match-detail="${esc(id)}">Maç İstatistik Merkezini Aç</button>`;
      grid.appendChild(wrap);
    });
  };

  document.addEventListener("click", (event) => {
    const openButton = event.target.closest?.("[data-fl-match-detail]");
    if (openButton) { event.preventDefault(); open(openButton.dataset.flMatchDetail, openButton); return; }
    if (event.target.closest?.("[data-flmd-close]")) { close(); return; }
    const tab = event.target.closest?.("[data-flmd-tab]");
    if (tab) { state.tab = tab.dataset.flmdTab; render(); return; }
    if (event.target.classList?.contains("flmd-backdrop")) close();
  });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && document.querySelector(".flmd-backdrop")) close(); });
  new MutationObserver(enhance).observe(document.body, { childList: true, subtree: true });
  window.addEventListener("fl:bulletin-ready", () => setTimeout(enhance, 0));
  enhance();
  window.__flMatchDetailCenter = { close, open, tabs: TABS.map(([key]) => key) };
})();
