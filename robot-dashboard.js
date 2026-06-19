const robotPaths = {
  mainReport: "./outputs/bugunun_en_guclu_maclari.md",
  mackolikReport: "./outputs/mackolik_veri_cekme_raporu.md",
  successReport: "./outputs/basari_yuzdesi_raporu.md",
  rawPool: "./data/ham_mac_havuzu.json",
  predictionHistory: "./data/tahmin_gecmisi.json"
};

const robotDemo = {
  source: "Demo Mode",
  matches: [
    { Mac: "Liverpool FC - AFC Bournemouth", Lig: "Premier League", "En Guclu Market": "Ust 2.5", "Guc Skoru": "72.55", Confidence: "19.5", Risk: "52.78 (yuksek)" },
    { Mac: "Brighton & Hove Albion FC - Fulham FC", Lig: "Premier League", "En Guclu Market": "KG Var", "Guc Skoru": "50.22", Confidence: "19.5", Risk: "66.85 (yuksek)" }
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
  return sourceLine ? sourceLine.replace("- ", "").trim() : "Demo Mode";
}

function robotSet(selector, value) {
  document.querySelectorAll(selector).forEach((item) => item.textContent = value);
}

function robotRiskClass(value) {
  const text = String(value || "").toLowerCase();
  if (text.includes("cok") || text.includes("çok")) return "risk-cok_yuksek";
  if (text.includes("yuksek") || text.includes("yüksek")) return "risk-yuksek";
  if (text.includes("orta")) return "risk-medium";
  return "risk-low";
}

function robotMatchCard(row, index) {
  const match = row.Mac || row.match || "Veri bulunamadı";
  const league = row.Lig || row.competition_name || row.league || "-";
  const market = row["En Guclu Market"] || row.Market || row.market_name || row.market || "-";
  const confidence = row.Confidence || row.confidence_score || row.confidence || "-";
  const risk = row.Risk || row.risk_level || "-";
  const power = row["Guc Skoru"] || row.Guc || row.guc_skoru || "-";
  const source = row.source || "Robot";
  const status = row.status || row.result_status || "takipte";
  const time = row.utc_date ? new Date(row.utc_date).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : "-";
  return `
    <article class="robot-live-card">
      <span class="robot-pill">#${index + 1} ${source}</span>
      <h3>${match}</h3>
      <div class="robot-row"><span>Lig</span><strong>${league}</strong></div>
      <div class="robot-row"><span>Saat</span><strong>${time}</strong></div>
      <div class="robot-row"><span>Market</span><strong>${market}</strong></div>
      <div class="robot-row"><span>Güven</span><strong>${confidence}</strong></div>
      <div class="robot-row"><span>Güç</span><strong>${power}</strong></div>
      <div class="robot-row"><span>Risk</span><strong><span class="robot-pill ${robotRiskClass(risk)}">${risk}</span></strong></div>
      <div class="robot-row"><span>Durum</span><strong>${status}</strong></div>
      <p class="robot-disclaimer">Kısa analiz: ${market} sinyali öne çıkıyor; karar destek amaçlıdır.</p>
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
      <h3>${match}</h3>
      <div class="robot-row"><span>Market</span><strong>${market}</strong></div>
      <div class="robot-row"><span>Toplam güven</span><strong>${score}</strong></div>
      <div class="robot-row"><span>Risk</span><strong><span class="robot-pill ${robotRiskClass(risk)}">${risk}</span></strong></div>
      <p class="robot-disclaimer">Bu bir analizdir, bahis tavsiyesi değildir.</p>
    </article>
  `;
}

function robotFill(selector, rows, renderer, empty = "Veri bulunamadı.") {
  const html = rows.length ? rows.map(renderer).join("") : `<article class="robot-live-card">${empty}</article>`;
  document.querySelectorAll(selector).forEach((item) => item.innerHTML = html);
}

function robotTableBody(selector, rows, cells, empty) {
  document.querySelectorAll(selector).forEach((body) => {
    body.innerHTML = rows.length
      ? rows.map((row) => `<tr>${cells.map((cell) => `<td>${cell(row)}</td>`).join("")}</tr>`).join("")
      : `<tr><td colspan="${cells.length}">${empty}</td></tr>`;
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
  if (!mainReport.ok && !rawPool.ok && !history.ok) return { ...robotDemo, reports: { mainReport, mackolikReport, successReport, rawPool, history } };
  const markdown = mainReport.data || "";
  return {
    source: robotSource(markdown),
    matches: robotTable(markdown, "Skorlanan Maclar"),
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
      <span class="robot-pill">${result && result.ok ? "okundu" : "veri bulunamadı"}</span>
      <h3>${name}</h3>
      <p class="robot-disclaimer">${result && result.error ? result.error : path}</p>
    </article>
  `).join("");
  document.querySelectorAll("[data-report-status]").forEach((item) => item.innerHTML = reports);
}

async function robotBoot() {
  const state = await robotLoadState();
  robotSet("[data-active-source]", state.source);
  robotSet("[data-match-count]", String(state.matches.length || state.rawPool.match_count || 0));
  robotSet("[data-raw-count]", String(state.rawPool.match_count || state.rawPool.matches?.length || 0));
  robotSet("[data-prediction-count]", String(state.history.prediction_count || state.history.predictions?.length || 0));
  robotSet("[data-load-status]", state.matches.length ? "Robot verisi" : "Demo veri");
  robotSet("[data-success-state]", state.history.predictions?.some((item) => item.result_status !== "pending") ? "sonuçlandı" : "bekliyor");
  robotFill("[data-home-matches], [data-admin-matches]", state.matches, robotMatchCard);
  robotFill("[data-coupons-single]", state.singleCoupons, robotCoupon);
  robotFill("[data-coupons-double]", state.doubleCoupons, robotCoupon);
  robotFill("[data-coupons-triple]", state.tripleCoupons, robotCoupon);
  robotTableBody("[data-raw-table]", (state.rawPool.matches || []).slice(0, 12), [
    (row) => `${row.home_team_name || row.home_team || "-"} - ${row.away_team_name || row.away_team || "-"}`,
    (row) => row.competition_name || row.league || "-",
    (row) => String(row.utc_date || row.date || "-").slice(0, 16),
    (row) => row.source || "unknown"
  ], "Ham veri bulunamadı.");
  robotTableBody("[data-prediction-table]", (state.history.predictions || []).slice(0, 12), [
    (row) => row.match || "-",
    (row) => row.market_name || row.market || "-",
    (row) => row.confidence_score || row.confidence || "-",
    (row) => row.result_status || "pending"
  ], "Tahmin geçmişi bulunamadı.");
  robotRenderReports(state);
}

robotBoot().catch((error) => {
  robotSet("[data-load-status]", "Hata");
  robotFill("[data-home-matches], [data-admin-matches]", [], () => "", `Veri yükleme hatası: ${error.message}`);
});
