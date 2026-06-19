const robotPaths = {
  mainReport: "./outputs/bugunun_en_guclu_maclari.md",
  mackolikReport: "./outputs/mackolik_veri_cekme_raporu.md",
  successReport: "./outputs/basari_yuzdesi_raporu.md",
  rawPool: "./data/ham_mac_havuzu.json",
  predictionHistory: "./data/tahmin_gecmisi.json"
};

const robotDemo = {
  source: "Demo Mode",
  isDemo: true,
  matches: [
    {
      Mac: "Liverpool FC - AFC Bournemouth",
      Lig: "Premier League",
      Saat: "21:45",
      "En Guclu Market": "Ust 2.5",
      "Guc Skoru": "82",
      Confidence: "78",
      Risk: "orta",
      source: "Demo veri"
    },
    {
      Mac: "PSV - Utrecht",
      Lig: "Eredivisie",
      Saat: "20:30",
      "En Guclu Market": "KG Var",
      "Guc Skoru": "79",
      Confidence: "75",
      Risk: "orta",
      source: "Demo veri"
    },
    {
      Mac: "Malmo - Hammarby",
      Lig: "Allsvenskan",
      Saat: "19:00",
      "En Guclu Market": "Ust 2.5",
      "Guc Skoru": "76",
      Confidence: "73",
      Risk: "yuksek",
      source: "Demo veri"
    }
  ],
  singleCoupons: [],
  doubleCoupons: [],
  tripleCoupons: [],
  rawPool: { match_count: 0, matches: [] },
  history: { prediction_count: 0, predictions: [] },
  reports: {}
};

async function robotReadText(path) {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return { ok: true, data: await response.text(), error: null };
  } catch (error) {
    return { ok: false, data: "", error: error.message };
  }
}

async function robotReadJson(path) {
  const text = await robotReadText(path);
  if (!text.ok) return { ok: false, data: null, error: text.error };
  try {
    return { ok: true, data: JSON.parse(text.data), error: null };
  } catch (error) {
    return { ok: false, data: null, error: error.message };
  }
}

function robotClean(value) {
  return String(value || "").replace(/<br\s*\/?>/gi, " / ").trim();
}

function robotEscape(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function robotTable(markdown, heading) {
  const lines = markdown.split(/\r?\n/);
  const headIndex = lines.findIndex((line) => line.toLowerCase().includes(heading.toLowerCase()));
  if (headIndex < 0) return [];
  const tableStart = lines.findIndex((line, index) => index > headIndex && line.trim().startsWith("|"));
  if (tableStart < 0) return [];
  const headers = lines[tableStart].split("|").slice(1, -1).map(robotClean);
  const rows = [];
  for (let index = tableStart + 2; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line.startsWith("|")) break;
    const cells = line.split("|").slice(1, -1).map(robotClean);
    const row = {};
    headers.forEach((header, cellIndex) => row[header] = cells[cellIndex] || "");
    rows.push(row);
  }
  return rows;
}

function robotSource(markdown) {
  const lines = markdown.split(/\r?\n/);
  const index = lines.findIndex((line) => line.includes("Aktif Veri"));
  const sourceLine = lines.slice(index + 1, index + 6).find((line) => line.trim().startsWith("- "));
  return sourceLine ? sourceLine.replace("- ", "").trim() : "Robot verisi";
}

function robotSet(selector, value) {
  document.querySelectorAll(selector).forEach((item) => item.textContent = value);
}

function robotNumber(value) {
  const match = String(value || "").replace(",", ".").match(/\d+(\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function robotRiskClass(value) {
  const text = String(value || "").toLowerCase();
  if (text.includes("cok") || text.includes("çok") || text.includes("very")) return "risk-cok_yuksek";
  if (text.includes("yuksek") || text.includes("yüksek") || text.includes("high")) return "risk-yuksek";
  if (text.includes("orta") || text.includes("medium")) return "risk-medium";
  return "risk-low";
}

function robotTeams(row) {
  const match = row.Mac || row.match || row.match_name || "";
  const home = row.ev_sahibi || row.home_team_name || row.home_team || row.home || "";
  const away = row.deplasman || row.away_team_name || row.away_team || row.away || "";
  if (home || away) return { home: home || "-", away: away || "-", match: `${home || "-"} - ${away || "-"}` };
  const parts = String(match).split(/\s+-\s+|\s+vs\s+/i);
  return {
    home: parts[0] || "Ev sahibi",
    away: parts[1] || "Deplasman",
    match: match || "Veri bulunamadi"
  };
}

function robotTime(row) {
  if (row.Saat || row.saat || row.time) return row.Saat || row.saat || row.time;
  if (row.utc_date) return new Date(row.utc_date).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  return "-";
}

function robotMarket(row) {
  return row["En Guclu Market"] || row["En Güçlü Market"] || row.Market || row.market_name || row.market || "-";
}

function robotConfidence(row) {
  return row.Confidence || row.confidence_score || row.confidence || row["Guc Skoru"] || row["Güç Skoru"] || "-";
}

function robotAverageConfidence(rows) {
  const values = rows.map(robotConfidence).map(robotNumber).filter(Boolean);
  if (!values.length) return "-";
  return `${(values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)}%`;
}

function robotStrongestSignal(rows) {
  const best = rows.reduce((winner, row) => {
    const score = robotNumber(robotConfidence(row));
    return score > winner.score ? { score, market: robotMarket(row) } : winner;
  }, { score: -1, market: "-" });
  return best.market || "-";
}

function robotMatchCard(row, index, isDemo = false) {
  const teams = robotTeams(row);
  const league = row.Lig || row.competition_name || row.league || "-";
  const market = robotMarket(row);
  const confidence = robotConfidence(row);
  const risk = row.Risk || row.risk_level || "-";
  const power = row["Guc Skoru"] || row["Güç Skoru"] || row.Guc || row.guc_skoru || "-";
  const source = isDemo ? "Demo veri" : (row.source || "Robot");
  const status = row.status || row.result_status || "takipte";
  const time = robotTime(row);
  return `
    <article class="robot-live-card robot-match-card">
      <div class="robot-card-topline">
        <span class="robot-pill">#${index + 1} ${robotEscape(source)}</span>
        <span class="robot-pill ${robotRiskClass(risk)}">${robotEscape(risk)}</span>
      </div>
      <h3>${robotEscape(teams.match)}</h3>
      <div class="robot-teams">
        <strong>${robotEscape(teams.home)}</strong>
        <span>vs</span>
        <strong>${robotEscape(teams.away)}</strong>
      </div>
      <div class="robot-row"><span>Lig</span><strong>${robotEscape(league)}</strong></div>
      <div class="robot-row"><span>Saat</span><strong>${robotEscape(time)}</strong></div>
      <div class="robot-row"><span>Önerilen market</span><strong>${robotEscape(market)}</strong></div>
      <div class="robot-row"><span>Güven skoru</span><strong>${robotEscape(confidence)}</strong></div>
      <div class="robot-row"><span>Güç skoru</span><strong>${robotEscape(power)}</strong></div>
      <div class="robot-row"><span>Durum</span><strong>${robotEscape(status)}</strong></div>
      <p class="robot-note">Kısa analiz: ${robotEscape(market)} sinyali öne çıkıyor; bu kart karar destek amaçlıdır.</p>
    </article>
  `;
}

function robotCoupon(row) {
  const match = row.Mac || row.Maclar || "Kupon verisi yok";
  const market = row.Market || row.Marketler || "-";
  const score = row["Oneri Skoru"] || row["Kupon Skoru"] || row.Confidence || "-";
  const risk = row.Risk || "-";
  return `
    <article class="robot-live-card">
      <h3>${robotEscape(match)}</h3>
      <div class="robot-row"><span>Market</span><strong>${robotEscape(market)}</strong></div>
      <div class="robot-row"><span>Toplam güven</span><strong>${robotEscape(score)}</strong></div>
      <div class="robot-row"><span>Risk</span><strong><span class="robot-pill ${robotRiskClass(risk)}">${robotEscape(risk)}</span></strong></div>
      <p class="robot-note">Bu bir analizdir, bahis tavsiyesi değildir.</p>
    </article>
  `;
}

function robotFill(selector, rows, renderer, empty = "Veri bulunamadi.", isDemo = false) {
  const html = rows.length ? rows.map((row, index) => renderer(row, index, isDemo)).join("") : `<article class="robot-live-card">${robotEscape(empty)}</article>`;
  document.querySelectorAll(selector).forEach((item) => item.innerHTML = html);
}

function robotTableBody(selector, rows, cells, empty) {
  document.querySelectorAll(selector).forEach((body) => {
    body.innerHTML = rows.length
      ? rows.map((row) => `<tr>${cells.map((cell) => `<td>${robotEscape(cell(row))}</td>`).join("")}</tr>`).join("")
      : `<tr><td colspan="${cells.length}">${robotEscape(empty)}</td></tr>`;
  });
}

async function robotLoadState() {
  const [mainReport, mackolikReport, successReport, rawPool, history] = await Promise.all([
    robotReadText(robotPaths.mainReport),
    robotReadText(robotPaths.mackolikReport),
    robotReadText(robotPaths.successReport),
    robotReadJson(robotPaths.rawPool),
    robotReadJson(robotPaths.predictionHistory)
  ]);
  const markdown = mainReport.data || "";
  const matches = robotTable(markdown, "Skorlanan Maclar");
  const noUsableData = !matches.length && !rawPool.ok && !history.ok;
  if (noUsableData) return { ...robotDemo, reports: { mainReport, mackolikReport, successReport, rawPool, history } };
  return {
    source: matches.length ? robotSource(markdown) : "Demo Mode",
    isDemo: !matches.length,
    matches: matches.length ? matches : robotDemo.matches,
    singleCoupons: robotTable(markdown, "Tek Mac Onerileri"),
    doubleCoupons: robotTable(markdown, "2'li Kupon Onerileri"),
    tripleCoupons: robotTable(markdown, "3'lu Kupon Onerileri"),
    rawPool: rawPool.data || robotDemo.rawPool,
    history: history.data || robotDemo.history,
    reports: { mainReport, mackolikReport, successReport, rawPool, history }
  };
}

function robotRenderReports(state) {
  const reports = [
    ["Bugünün En Güçlü Maçları", state.reports.mainReport, robotPaths.mainReport],
    ["Maçkolik Veri Çekme", state.reports.mackolikReport, robotPaths.mackolikReport],
    ["Başarı Yüzdesi", state.reports.successReport, robotPaths.successReport],
    ["Ham Veri Havuzu", state.reports.rawPool, robotPaths.rawPool],
    ["Tahmin Geçmişi", state.reports.history, robotPaths.predictionHistory]
  ].map(([name, result, path]) => `
    <article class="robot-live-card">
      <span class="robot-pill">${result && result.ok ? "okundu" : "veri bulunamadi"}</span>
      <h3>${robotEscape(name)}</h3>
      <p class="robot-note">${robotEscape(result && result.error ? result.error : path)}</p>
    </article>
  `).join("");
  document.querySelectorAll("[data-report-status]").forEach((item) => item.innerHTML = reports);
}

async function robotBoot() {
  const state = await robotLoadState();
  const visibleMatches = state.matches || [];
  robotSet("[data-active-source]", state.source);
  robotSet("[data-match-count]", String(visibleMatches.length));
  robotSet("[data-average-confidence]", robotAverageConfidence(visibleMatches));
  robotSet("[data-strongest-signal]", robotStrongestSignal(visibleMatches));
  robotSet("[data-raw-count]", String(state.rawPool.match_count || state.rawPool.matches?.length || 0));
  robotSet("[data-prediction-count]", String(state.history.prediction_count || state.history.predictions?.length || 0));
  robotSet("[data-load-status]", state.isDemo ? "Demo veri" : "Robot verisi");
  robotSet("[data-success-state]", state.history.predictions?.some((item) => item.result_status !== "pending") ? "sonuçlandı" : "bekliyor");
  robotFill("[data-home-matches], [data-admin-matches]", visibleMatches, robotMatchCard, "Veri bulunamadi.", state.isDemo);
  robotFill("[data-coupons-single]", state.singleCoupons, robotCoupon);
  robotFill("[data-coupons-double]", state.doubleCoupons, robotCoupon);
  robotFill("[data-coupons-triple]", state.tripleCoupons, robotCoupon);
  robotTableBody("[data-raw-table]", (state.rawPool.matches || []).slice(0, 12), [
    (row) => `${row.home_team_name || row.home_team || "-"} - ${row.away_team_name || row.away_team || "-"}`,
    (row) => row.competition_name || row.league || "-",
    (row) => String(row.utc_date || row.date || "-").slice(0, 16),
    (row) => row.source || "unknown"
  ], "Ham veri bulunamadi.");
  robotTableBody("[data-prediction-table]", (state.history.predictions || []).slice(0, 12), [
    (row) => row.match || "-",
    (row) => row.market_name || row.market || "-",
    (row) => row.confidence_score || row.confidence || "-",
    (row) => row.result_status || "pending"
  ], "Tahmin geçmişi bulunamadi.");
  robotRenderReports(state);
}

robotBoot().catch((error) => {
  robotSet("[data-load-status]", "Hata");
  robotFill("[data-home-matches], [data-admin-matches]", [], () => "", `Veri yükleme hatası: ${error.message}`);
});
