const paths = {
  mainReport: "./outputs/bugunun_en_guclu_maclari.md",
  mackolikReport: "./outputs/mackolik_veri_cekme_raporu.md",
  successReport: "./outputs/basari_yuzdesi_raporu.md",
  rawPool: "./data/ham_mac_havuzu.json",
  predictionHistory: "./data/tahmin_gecmisi.json"
};

const demoState = {
  demo: true,
  source: "Demo Mode",
  matches: [
    {
      "Mac": "Liverpool FC - AFC Bournemouth",
      "Lig": "Premier League",
      "En Guclu Market": "Ust 2.5",
      "Guc Skoru": "72.55",
      "Confidence": "19.5",
      "Risk": "52.78 (yuksek)"
    },
    {
      "Mac": "Brighton & Hove Albion FC - Fulham FC",
      "Lig": "Premier League",
      "En Guclu Market": "KG Var",
      "Guc Skoru": "50.22",
      "Confidence": "19.5",
      "Risk": "66.85 (yuksek)"
    }
  ],
  singleCoupons: [],
  doubleCoupons: [],
  tripleCoupons: [],
  rawPool: { match_count: 0, matches: [] },
  history: { prediction_count: 0, predictions: [] },
  reports: {}
};

async function readText(path) {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return { ok: true, data: await response.text(), error: null };
  } catch (error) {
    return { ok: false, data: "", error: error.message };
  }
}

async function readJson(path) {
  const text = await readText(path);
  if (!text.ok) return { ok: false, data: null, error: text.error };
  try {
    return { ok: true, data: JSON.parse(text.data), error: null };
  } catch (error) {
    return { ok: false, data: null, error: error.message };
  }
}

function cleanCell(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, " / ")
    .replace(/&amp;/g, "&")
    .trim();
}

function parseMarkdownTable(markdown, heading) {
  const lines = markdown.split(/\r?\n/);
  const headingIndex = lines.findIndex((line) => line.toLowerCase().includes(heading.toLowerCase()));
  if (headingIndex === -1) return [];

  const tableStart = lines.findIndex((line, index) => index > headingIndex && line.trim().startsWith("|"));
  if (tableStart === -1) return [];

  const header = lines[tableStart].split("|").slice(1, -1).map(cleanCell);
  const rows = [];
  for (let index = tableStart + 2; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line.startsWith("|")) break;
    const cells = line.split("|").slice(1, -1).map(cleanCell);
    const row = {};
    header.forEach((key, cellIndex) => {
      row[key] = cells[cellIndex] || "";
    });
    rows.push(row);
  }
  return rows;
}

function extractActiveSource(markdown) {
  if (!markdown) return "Demo Mode";
  const lines = markdown.split(/\r?\n/);
  const index = lines.findIndex((line) => line.includes("Aktif Veri"));
  if (index === -1) return "Demo Mode";
  const sourceLine = lines.slice(index + 1, index + 6).find((line) => line.trim().startsWith("- "));
  return sourceLine ? sourceLine.replace("- ", "").trim() : "Demo Mode";
}

function riskClass(value) {
  const text = String(value || "").toLowerCase();
  if (text.includes("cok") || text.includes("çok")) return "risk-cok_yuksek";
  if (text.includes("yuksek") || text.includes("yüksek")) return "risk-yuksek";
  if (text.includes("orta")) return "risk-medium";
  return "risk-low";
}

function setText(selector, value) {
  document.querySelectorAll(selector).forEach((element) => {
    element.textContent = value;
  });
}

function renderMatchCard(row, index) {
  const match = row.Mac || row.match || "Veri bulunamadı";
  const league = row.Lig || row.competition_name || row.league || "-";
  const market = row["En Guclu Market"] || row.Market || row.market_name || row.market || "-";
  const confidence = row.Confidence || row["Güven"] || row.confidence_score || row.confidence || "-";
  const risk = row.Risk || row.risk_level || "-";
  const power = row["Guc Skoru"] || row.Guc || row.guc_skoru || "-";
  const source = row.source || row.Kaynak || "Robot";
  const status = row.status || row.result_status || "takipte";
  const time = row.Saat || (row.utc_date ? new Date(row.utc_date).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : "-");

  return `
    <article class="match-card">
      <span class="pill">#${index + 1} ${source}</span>
      <h3>${match}</h3>
      <div class="meta-row"><span>Lig</span><strong>${league}</strong></div>
      <div class="meta-row"><span>Saat</span><strong>${time}</strong></div>
      <div class="score-row"><span>Market</span><strong>${market}</strong></div>
      <div class="score-row"><span>Güven</span><strong>${confidence}</strong></div>
      <div class="score-row"><span>Güç</span><strong>${power}</strong></div>
      <div class="meta-row"><span>Risk</span><strong><span class="pill ${riskClass(risk)}">${risk}</span></strong></div>
      <div class="meta-row"><span>Durum</span><strong>${status}</strong></div>
      <p class="disclaimer">Kısa analiz: ${market} sinyali öne çıkıyor; karar destek amaçlıdır.</p>
    </article>
  `;
}

function renderCouponCard(row) {
  const match = row.Mac || row.Maclar || "Kupon verisi yok";
  const market = row.Market || row.Marketler || "-";
  const score = row["Oneri Skoru"] || row["Kupon Skoru"] || row.Confidence || "-";
  const risk = row.Risk || "-";
  return `
    <article class="coupon-card">
      <h4>${match}</h4>
      <div class="meta-row"><span>Market</span><strong>${market}</strong></div>
      <div class="meta-row"><span>Toplam güven</span><strong>${score}</strong></div>
      <div class="meta-row"><span>Risk</span><strong><span class="pill ${riskClass(risk)}">${risk}</span></strong></div>
      <p class="disclaimer">Bu bir analizdir, bahis tavsiyesi değildir.</p>
    </article>
  `;
}

function fillList(selector, rows, renderer, emptyText = "Veri bulunamadı.") {
  const html = rows.length ? rows.map(renderer).join("") : `<article class="info-card muted">${emptyText}</article>`;
  document.querySelectorAll(selector).forEach((element) => {
    element.innerHTML = html;
  });
}

function renderTable(selector, rows, cells, emptyText) {
  document.querySelectorAll(selector).forEach((tbody) => {
    tbody.innerHTML = rows.length
      ? rows.map((row) => `<tr>${cells.map((cell) => `<td>${cell(row)}</td>`).join("")}</tr>`).join("")
      : `<tr><td colspan="${cells.length}">${emptyText}</td></tr>`;
  });
}

function reportCard(name, result, path) {
  const status = result && result.ok ? "okundu" : "veri bulunamadı";
  const detail = result && result.error ? result.error : path;
  return `
    <article class="report-card">
      <span class="pill">${status}</span>
      <h3>${name}</h3>
      <p class="muted">${detail}</p>
    </article>
  `;
}

async function loadState() {
  const [mainReport, mackolikReport, successReport, rawPool, history] = await Promise.all([
    readText(paths.mainReport),
    readText(paths.mackolikReport),
    readText(paths.successReport),
    readJson(paths.rawPool),
    readJson(paths.predictionHistory)
  ]);

  if (!mainReport.ok && !rawPool.ok && !history.ok) {
    return {
      ...demoState,
      reports: { mainReport, mackolikReport, successReport, rawPool, history }
    };
  }

  const markdown = mainReport.data || "";
  return {
    demo: !mainReport.ok,
    source: extractActiveSource(markdown),
    matches: parseMarkdownTable(markdown, "Skorlanan Maclar"),
    singleCoupons: parseMarkdownTable(markdown, "Tek Mac Onerileri"),
    doubleCoupons: parseMarkdownTable(markdown, "2'li Kupon Onerileri"),
    tripleCoupons: parseMarkdownTable(markdown, "3'lu Kupon Onerileri"),
    rawPool: rawPool.data || { match_count: 0, matches: [] },
    history: history.data || { prediction_count: 0, predictions: [] },
    reports: { mainReport, mackolikReport, successReport, rawPool, history }
  };
}

function renderShared(state) {
  setText("[data-active-source]", state.source);
  setText("[data-match-count]", String(state.matches.length || state.rawPool.match_count || 0));
  setText("[data-raw-count]", String(state.rawPool.match_count || state.rawPool.matches?.length || 0));
  setText("[data-prediction-count]", String(state.history.prediction_count || state.history.predictions?.length || 0));
  setText("[data-load-status]", state.demo ? "Demo veri" : "Robot verisi");
  setText("[data-success-state]", state.history.predictions?.some((item) => item.result_status !== "pending") ? "sonuçlandı" : "bekliyor");

  fillList("[data-coupons-single]", state.singleCoupons, renderCouponCard);
  fillList("[data-coupons-double]", state.doubleCoupons, renderCouponCard);
  fillList("[data-coupons-triple]", state.tripleCoupons, renderCouponCard);
}

function renderHome(state) {
  fillList("[data-home-matches]", state.matches, renderMatchCard);
}

function renderAdmin(state) {
  const rawRows = (state.rawPool.matches || []).slice(0, 12);
  const predictions = (state.history.predictions || []).slice(0, 12);
  const signals = [...state.matches].sort((a, b) => Number(b["Guc Skoru"] || 0) - Number(a["Guc Skoru"] || 0)).slice(0, 8);

  fillList("[data-admin-matches]", state.matches, renderMatchCard);
  fillList("[data-signals]", signals, (row, index) => `
    <article class="report-card">
      <span class="pill">Sinyal ${index + 1}</span>
      <h3>${row["En Guclu Market"] || row.Market || "-"}</h3>
      <p class="muted">${row.Mac || "-"}</p>
      <strong>${row["Guc Skoru"] || row.Guc || "-"}</strong>
    </article>
  `);

  renderTable("[data-raw-table]", rawRows, [
    (row) => `${row.home_team_name || row.home_team || "-"} - ${row.away_team_name || row.away_team || "-"}`,
    (row) => row.competition_name || row.league || "-",
    (row) => String(row.utc_date || row.date || "-").slice(0, 16),
    (row) => row.source || "unknown"
  ], "Ham veri bulunamadı.");

  renderTable("[data-prediction-table]", predictions, [
    (row) => row.match || "-",
    (row) => row.market_name || row.market || "-",
    (row) => row.confidence_score || row.confidence || "-",
    (row) => row.result_status || "pending"
  ], "Tahmin geçmişi bulunamadı.");

  const reports = [
    reportCard("Bugünün En Güçlü Maçları", state.reports.mainReport, paths.mainReport),
    reportCard("Maçkolik Veri Çekme", state.reports.mackolikReport, paths.mackolikReport),
    reportCard("Başarı Yüzdesi", state.reports.successReport, paths.successReport),
    reportCard("Ham Veri Havuzu", state.reports.rawPool, paths.rawPool),
    reportCard("Tahmin Geçmişi", state.reports.history, paths.predictionHistory)
  ].join("");
  document.querySelectorAll("[data-report-status]").forEach((element) => {
    element.innerHTML = reports;
  });
}

async function boot() {
  const state = await loadState();
  renderShared(state);
  if (document.body.dataset.page === "home") renderHome(state);
  if (document.body.dataset.page === "admin") renderAdmin(state);
}

boot().catch((error) => {
  setText("[data-load-status]", "Hata");
  fillList("[data-home-matches], [data-admin-matches]", [], () => "", `Veri yükleme hatası: ${error.message}`);
});
