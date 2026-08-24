const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const bulletinPath = path.join(root, "data", "spor_toto_bulteni.json");
const archiveAnalysisPath = path.join(root, "data", "spor_toto_archive_analysis.json");
const OPTIONS = ["1", "X", "2"];

const readJson = (file, fallback) => {
  try {
    const text = fs.readFileSync(file, "utf8").trim();
    return text ? JSON.parse(text) : fallback;
  } catch { return fallback; }
};
const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};
const clean = (value) => String(value || "").toLocaleLowerCase("tr-TR").replace(/ı/g, "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
const keyOf = (row) => `${String(row.date || "").slice(0, 10)}|${clean(row.home)}|${clean(row.away)}`;
const ranked = (probabilities) => [...OPTIONS].sort((a, b) => Number(probabilities?.[b] || 0) - Number(probabilities?.[a] || 0));
const normalizeProfile = (profile) => {
  const source = profile && typeof profile === "object" ? profile : {};
  const sample = Number(source.sample ?? source.count ?? 0);
  return {
    ...source,
    sample,
    count: sample,
    wins: Number(source.wins || 0),
    draws: Number(source.draws || 0),
    losses: Number(source.losses || 0),
    ppg: Number(source.ppg ?? source.pointsPerGame ?? 0),
    pointsPerGame: Number(source.pointsPerGame ?? source.ppg ?? 0),
    goals_for_avg: Number(source.goals_for_avg ?? source.goalsForAvg ?? 0),
    goals_against_avg: Number(source.goals_against_avg ?? source.goalsAgainstAvg ?? 0),
    goalsForAvg: Number(source.goalsForAvg ?? source.goals_for_avg ?? 0),
    goalsAgainstAvg: Number(source.goalsAgainstAvg ?? source.goals_against_avg ?? 0),
    recent: Array.isArray(source.recent) ? source.recent.slice(-5) : [],
  };
};

function applyOne(match, archiveRow) {
  if (!archiveRow?.probabilities) return match;
  const probabilities = archiveRow.probabilities;
  const sum = OPTIONS.reduce((total, option) => total + Number(probabilities?.[option] || 0), 0);
  if (Math.abs(sum - 100) > 0.3) return match;
  const order = ranked(probabilities);
  const top = order[0]; const second = order[1];
  const topP = Number(probabilities[top]); const secondP = Number(probabilities[second]);
  const gap = Number((topP - secondP).toFixed(1));
  const archiveBacked = Boolean(archiveRow.archive_ready);
  const homeForm = normalizeProfile(archiveRow.form?.home);
  const awayForm = normalizeProfile(archiveRow.form?.away);
  let classification;
  let risk;
  if (!archiveBacked) {
    classification = gap < 8 || topP < 45 ? "Oynanma Dağılımı · Çifte Adayı" : "Oynanma Dağılımı Bazlı";
    risk = "Yüksek";
  } else if (topP >= 59 && gap >= 15 && Number(archiveRow.confidence || 0) >= 68) {
    classification = "Banko Adayı";
    risk = Number(archiveRow.confidence || 0) >= 74 ? "Düşük" : "Orta";
  } else if (topP < 45 || gap < 8) {
    classification = "Çifte Şans Adayı";
    risk = "Yüksek";
  } else {
    classification = "Arşiv Destekli Tek";
    risk = "Orta";
  }
  const reasons = archiveBacked ? [
    `Gerçek sonuç arşivi: ev ${homeForm.sample}, deplasman ${awayForm.sample} maç örneği kullanıldı.`,
    `Poisson/form modeli ile haftalık oynanma dağılımı birlikte değerlendirildi; ${top} seçeneği %${topP.toFixed(1)} ile önde.`,
    Number.isFinite(Number(archiveRow.agreement_score)) ? `Arşiv modeli ile oynanma dağılımı uyumu %${Number(archiveRow.agreement_score).toFixed(1)}.` : "Arşiv ve dağılım birlikte değerlendirildi.",
  ] : [
    "Bu maçta takım arşiv örneği güven eşiğinin altında.",
    `Tahmin uydurulmadı; yalnız haftalık gerçek oynanma dağılımı kullanıldı: 1 %${Number(probabilities["1"]).toFixed(1)}, X %${Number(probabilities.X).toFixed(1)}, 2 %${Number(probabilities["2"]).toFixed(1)}.`,
    "Bu nedenle güven sınırlı ve risk yüksek tutuldu.",
  ];
  return {
    ...match,
    probabilities,
    probability_basis: archiveRow.probability_basis,
    analysis_ready: true,
    decision: top,
    selected_options: [top],
    selection: top,
    coupon_role: classification,
    classification,
    confidence: Number(archiveRow.confidence || 0),
    confidence_score: Number(archiveRow.confidence || 0),
    risk,
    risk_level: risk,
    data_completeness: Number(archiveRow.data_completeness || 0),
    probability_gap: gap,
    column_multiplier: 1,
    independent_evidence: archiveBacked,
    evidence_mode: archiveBacked ? "archive_poisson_plus_public_distribution" : "cross_verified_public_distribution",
    reasons,
    form: { home: homeForm, away: awayForm },
    h2h: Array.isArray(archiveRow.h2h) ? archiveRow.h2h : (match.h2h || []),
    archive_analysis: {
      ready: archiveBacked,
      generated_from_real_results: archiveBacked,
      canonical_home: archiveRow.canonical_home || null,
      canonical_away: archiveRow.canonical_away || null,
      archive_probabilities: archiveRow.archive_probabilities || null,
      public_distribution: archiveRow.public_distribution || null,
      poisson: archiveRow.poisson || null,
      agreement_score: archiveRow.agreement_score ?? null,
    },
  };
}

function run() {
  const bulletin = readJson(bulletinPath, null);
  const archiveAnalysis = readJson(archiveAnalysisPath, null);
  if (!bulletin || !Array.isArray(bulletin.matches) || bulletin.matches.length !== 15) throw new Error("Spor Toto bülteni yok veya 15 maç değil");
  if (!archiveAnalysis || !Array.isArray(archiveAnalysis.matches)) {
    console.log("Spor Toto archive analysis cache yok; mevcut bülten korunuyor.");
    return bulletin;
  }
  const map = new Map(archiveAnalysis.matches.map((row) => [keyOf(row), row]));
  const matches = bulletin.matches.map((match) => applyOne(match, map.get(keyOf(match))));
  const ready = matches.filter((match) => match.analysis_ready).length;
  const archiveReady = matches.filter((match) => match.archive_analysis?.ready).length;
  const output = {
    ...bulletin,
    generated_at: new Date().toISOString(),
    archive_enrichment: {
      source: archiveAnalysis.source || "Futbol Laboratuvarı sonuç arşivi",
      generated_at: archiveAnalysis.generated_at || null,
      archive_match_count: Number(archiveAnalysis.archive_match_count || 0),
      archive_ready_count: archiveReady,
      distribution_ready_count: Number(archiveAnalysis.public_distribution_count || 0),
      analysis_available_count: ready,
    },
    analysis_ready_count: ready,
    analysis_waiting_count: 15 - ready,
    matches,
  };
  writeJson(bulletinPath, output);
  console.log(`Spor Toto archive analysis applied. ready=${ready}/15, archiveBacked=${archiveReady}/15.`);
  return output;
}

if (require.main === module) run();
module.exports = { run, applyOne, normalizeProfile };
