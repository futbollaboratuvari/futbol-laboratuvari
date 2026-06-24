const robotPaths = {
  liveMatches: "./data/live-matches.json",
  dailyCoupons: "./data/daily-coupons.json",
  robotAnalysis: "./data/robot-analysis.json",
  robotBridge: "./data/robot-engine-bridge.json",
  rawPool: "./data/ham_mac_havuzu.json",
  history: "./data/analiz_sonuclari.json",
  mainReport: "./outputs/bugunun_en_guclu_maclari.md",
  sourceReport: "./outputs/mackolik_veri_cekme_raporu.md",
  successReport: "./outputs/basari_yuzdesi_raporu.md"
};

const emptyMessage = "Bugün için güncel veri henüz oluşmadı.";

async function robotReadText(path) {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return { ok: true, data: await response.text(), error: null };
  } catch (error) {
    return { ok: false, data: "", error: error.message };
  }
}

async function robotReadJson(path, fallback) {
  const result = await robotReadText(path);
  if (!result.ok) return { ok: false, data: fallback, error: result.error };
  try {
    return { ok: true, data: JSON.parse(result.data), error: null };
  } catch (error) {
    return { ok: false, data: fallback, error: error.message };
  }
}

function robotEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function robotSet(selector, value) {
  document.querySelectorAll(selector).forEach((item) => item.textContent = value);
}

function robotNumber(value) {
  const match = String(value || "").replace(",", ".").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function robotRiskClass(value) {
  const text = String(value || "").toLocaleLowerCase("tr-TR");
  if (text.includes("yüksek") || text.includes("yuksek")) return "risk-yuksek";
  if (text.includes("orta")) return "risk-medium";
  return "risk-low";
}

function averageConfidence(matches) {
  const values = matches.map((item) => robotNumber(item.confidence_score || item.analysis_score)).filter(Boolean);
  if (!values.length) return "-";
  return `${Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)}%`;
}

function strongestMarket(matches) {
  const best = matches.reduce((winner, item) => {
    const score = robotNumber(item.confidence_score || item.analysis_score);
    return score > winner.score ? { score, label: item.recommended_market || "-" } : winner;
  }, { score: -1, label: "-" });
  return best.label;
}

function emptyCard(message = emptyMessage) {
  return `<article class="robot-live-card"><p class="robot-note">${robotEscape(message)}</p></article>`;
}

function valueOrDash(value) {
  return value === undefined || value === null || value === "" ? "-" : value;
}

function oddsLine(label, value) {
  const safe = valueOrDash(value);
  if (safe === "-") return "";
  return `<div class="robot-row"><span>${robotEscape(label)}</span><strong>${robotEscape(safe)}</strong></div>`;
}

function oddsBox(item) {
  const odds = item.available_odds || {};
  const guess = item.raw_market_guess_odds || {};
  const html = [
    oddsLine("MS 1", odds.ms1),
    oddsLine("MS X", odds.msx),
    oddsLine("MS 2", odds.ms2),
    oddsLine("KG Var", odds.bttsYes || guess.bttsYes_guess),
    oddsLine("KG Yok", odds.bttsNo || guess.bttsNo_guess),
    oddsLine("1Y KG Var", odds.firstHalfBttsYes || guess.firstHalfBttsYes_guess),
    oddsLine("1Y KG Yok", odds.firstHalfBttsNo || guess.firstHalfBttsNo_guess),
    oddsLine("2Y KG Var", odds.secondHalfBttsYes || guess.secondHalfBttsYes_guess),
    oddsLine("2Y KG Yok", odds.secondHalfBttsNo || guess.secondHalfBttsNo_guess),
    oddsLine("2.5 Üst", odds.over25 || guess.over25_guess),
    oddsLine("2.5 Alt", odds.under25 || guess.under25_guess),
    oddsLine("3.5 Üst", odds.over35 || guess.over35_guess),
    oddsLine("3.5 Alt", odds.under35 || guess.under35_guess),
  ].filter(Boolean).join("");

  if (!html) return `<p class="robot-note">Oran verisi bekleniyor.</p>`;
  return `
    <div class="robot-detail-box">
      <h4>Oranlar</h4>
      ${html}
    </div>
  `;
}

function detailCandidatesBox(item) {
  const candidates = Array.isArray(item.detail_market_candidates) ? item.detail_market_candidates.slice(0, 12) : [];
  if (!candidates.length) return "";
  const rows = candidates.map((candidate) => {
    const values = Object.entries(candidate.values || {})
      .map(([key, value]) => `${key}: ${value}`)
      .join(" | ");
    return `<div class="robot-row"><span>${robotEscape(candidate.market || candidate.market_code || "Detay")}</span><strong>${robotEscape(values || "-")}</strong></div>`;
  }).join("");
  return `
    <div class="robot-detail-box">
      <h4>Detay Oran Adayları</h4>
      ${rows}
    </div>
  `;
}

function matchCard(item, index) {
  return `
    <article class="robot-live-card robot-match-card">
      <div class="robot-card-topline">
        <span class="robot-pill">#${index + 1} Canlı Veri</span>
        <span class="robot-pill ${robotRiskClass(item.risk_level)}">${robotEscape(item.risk_level || "-")}</span>
      </div>
      <h3>${robotEscape(item.match_name || "Maç adı yok")}</h3>
      <div class="robot-row"><span>Lig</span><strong>${robotEscape(item.league || "-")}</strong></div>
      <div class="robot-row"><span>Saat</span><strong>${robotEscape(item.start_time || "-")}</strong></div>
      <div class="robot-row"><span>Öneri</span><strong>${robotEscape(item.recommended_market || "-")}</strong></div>
      <div class="robot-row"><span>Güven skoru</span><strong>${robotEscape(item.confidence_score || item.analysis_score || "-")}</strong></div>
      <div class="robot-row"><span>Risk seviyesi</span><strong>${robotEscape(item.risk_level || "-")}</strong></div>
      <div class="robot-row"><span>Değer etiketi</span><strong>${robotEscape(item.value_label || "-")}</strong></div>
      ${oddsBox(item)}
      ${detailCandidatesBox(item)}
      <p class="robot-note">${robotEscape(item.robot_comment || emptyMessage)}</p>
    </article>
  `;
}

function couponLeg(leg) {
  return `
    <div class="robot-row">
      <span>${robotEscape(leg.match_name || "Maç")}</span>
      <strong>${robotEscape(leg.recommended_market || "-")} / ${robotEscape(leg.estimated_odds || "-")}</strong>
    </div>
    ${oddsBox(leg)}
    <p class="robot-note">${robotEscape(leg.robot_reason || "Robot gerekçesi bekleniyor.")}</p>
  `;
}

function couponCard(coupon) {
  if (!coupon || !coupon.is_available) return emptyCard(coupon?.short_description || emptyMessage);
  const legs = Array.isArray(coupon.selected_matches) ? coupon.selected_matches : [];
  return `
    <article class="robot-live-card">
      <span class="robot-pill">${robotEscape(coupon.coupon_name || "Laboratuvar Kuponu")}</span>
      <h3>${robotEscape(coupon.coupon_name || "Kupon")}</h3>
      <div class="robot-row"><span>Toplam Oran</span><strong>${robotEscape(coupon.total_odds || "-")}</strong></div>
      <div class="robot-row"><span>Güven Skoru</span><strong>${robotEscape(coupon.average_confidence_score || "-")}</strong></div>
      <div class="robot-row"><span>Risk Seviyesi</span><strong><span class="robot-pill ${robotRiskClass(coupon.risk_level)}">${robotEscape(coupon.risk_level || "-")}</span></strong></div>
      <p class="robot-note">${robotEscape(coupon.short_description || "Robot açıklaması bekleniyor.")}</p>
      <p class="robot-note"><strong>Robotun Gerekçesi:</strong> ${robotEscape(coupon.robot_reason || "-")}</p>
      ${legs.map(couponLeg).join("")}
    </article>
  `;
}

function fill(selector, html) {
  document.querySelectorAll(selector).forEach((item) => item.innerHTML = html);
}

function tableBody(selector, rows, cells, empty) {
  document.querySelectorAll(selector).forEach((body) => {
    body.innerHTML = rows.length
      ? rows.map((row) => `<tr>${cells.map((cell) => `<td>${robotEscape(cell(row))}</td>`).join("")}</tr>`).join("")
      : `<tr><td colspan="${cells.length}">${robotEscape(empty)}</td></tr>`;
  });
}

function renderReports(reports) {
  const html = Object.entries(reports).map(([name, result]) => `
    <article class="robot-live-card">
      <span class="robot-pill">${result.ok ? "okundu" : "veri bekleniyor"}</span>
      <h3>${robotEscape(name)}</h3>
      <p class="robot-note">${robotEscape(result.error || result.path)}</p>
    </article>
  `).join("");
  fill("[data-report-status]", html);
}

async function robotLoadState() {
  const [live, coupons, analysis, bridge, raw, history, mainReport, sourceReport, successReport] = await Promise.all([
    robotReadJson(robotPaths.liveMatches, { matches: [], message: emptyMessage }),
    robotReadJson(robotPaths.dailyCoupons, { coupons: {}, message: emptyMessage }),
    robotReadJson(robotPaths.robotAnalysis, { matches: [], summary: {} }),
    robotReadJson(robotPaths.robotBridge, { status: "missing" }),
    robotReadJson(robotPaths.rawPool, { match_count: 0, matches: [] }),
    robotReadJson(robotPaths.history, { active_items: [], completed_items: [] }),
    robotReadText(robotPaths.mainReport),
    robotReadText(robotPaths.sourceReport),
    robotReadText(robotPaths.successReport)
  ]);

  return {
    live: live.data,
    coupons: coupons.data,
    analysis: analysis.data,
    bridge: bridge.data,
    raw: raw.data,
    history: history.data,
    reports: {
      "Bugünün En Güçlü Maçları": { ...mainReport, path: robotPaths.mainReport },
      "Veri Çekme Raporu": { ...sourceReport, path: robotPaths.sourceReport },
      "Başarı Yüzdesi": { ...successReport, path: robotPaths.successReport },
      "Canlı Maç JSON": { ...live, path: robotPaths.liveMatches },
      "Günlük Kupon JSON": { ...coupons, path: robotPaths.dailyCoupons },
      "Robot Analiz JSON": { ...analysis, path: robotPaths.robotAnalysis },
      "Robot Köprü JSON": { ...bridge, path: robotPaths.robotBridge }
    }
  };
}

async function robotBoot() {
  const state = await robotLoadState();
  const matches = Array.isArray(state.live.matches) ? state.live.matches : [];
  const analysisMatches = Array.isArray(state.analysis.matches) ? state.analysis.matches : [];
  const coupons = state.coupons.coupons || {};
  const historyItems = [
    ...(Array.isArray(state.history.active_items) ? state.history.active_items : []),
    ...(Array.isArray(state.history.predictions) ? state.history.predictions : []),
  ];
  const bridgeReady = state.bridge?.status === "ready";

  robotSet("[data-active-source]", state.live.source || state.coupons.source || state.bridge?.source_file || "Canlı veri bekleniyor");
  robotSet("[data-match-count]", String(matches.length || state.bridge?.match_count || 0));
  robotSet("[data-average-confidence]", averageConfidence(matches));
  robotSet("#avg-confidence", averageConfidence(matches));
  robotSet("[data-strongest-signal]", strongestMarket(matches));
  robotSet("#top-market", strongestMarket(matches));
  robotSet("[data-raw-count]", String(state.raw.match_count || state.raw.matches?.length || 0));
  robotSet("[data-prediction-count]", String(historyItems.length || analysisMatches.length));
  robotSet("[data-load-status]", matches.length ? "High Value Engine" : bridgeReady ? "Robot köprüsü hazır" : emptyMessage);
  robotSet("[data-success-state]", state.history.completed_items?.length ? "sonuçlandı" : "bekliyor");

  fill("[data-admin-matches]", matches.length ? matches.map(matchCard).join("") : emptyCard(state.live.message || emptyMessage));
  fill("[data-coupons-single]", [coupons.laboratory_today, coupons.balanced].map(couponCard).join(""));
  fill("[data-coupons-double]", couponCard(coupons.high_value));
  fill("[data-coupons-triple]", couponCard(coupons.risk_lab));

  tableBody("[data-raw-table]", (state.raw.matches || []).slice(0, 12), [
    (row) => `${row.home_team_name || row.home_team || "-"} - ${row.away_team_name || row.away_team || "-"}`,
    (row) => row.competition_name || row.league || "-",
    (row) => `${row.date || ""} ${row.time || ""}`.trim() || String(row.utc_date || "-").slice(0, 16),
    (row) => row.source || "unknown"
  ], emptyMessage);

  tableBody("[data-prediction-table]", analysisMatches, [
    (row) => row.match_name || "-",
    (row) => row.recommended_market || "-",
    (row) => row.confidence_score || row.analysis_score || "-",
    (row) => row.include_in_coupon ? "kupona uygun" : row.suitable_coupon_type || "izleme"
  ], emptyMessage);

  renderReports(state.reports);
}

robotBoot().catch((error) => {
  robotSet("[data-load-status]", "Hata");
  fill("[data-admin-matches]", emptyCard(`Veri yükleme hatası: ${error.message}`));
});
