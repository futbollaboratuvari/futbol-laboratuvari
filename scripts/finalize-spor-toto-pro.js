const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const file = path.join(root, "data", "spor_toto_bulteni.json");
const programFile = path.join(root, "data", "spor_toto_weekly_program.json");
const reportFile = path.join(root, "outputs", "spor-toto-bulletin-rebuild-report.md");
const OPTIONS = ["1", "X", "2"];
const MAX_DOUBLES = 4;

const readJson = (target, fallback) => { try { const text = fs.readFileSync(target, "utf8").trim(); return text ? JSON.parse(text) : fallback; } catch { return fallback; } };
const writeJson = (target, value) => { fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`, "utf8"); };
const clean = (value) => String(value || "").toLocaleLowerCase("tr-TR").replace(/ı/g, "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const programKey = (m) => `${String(m.date || "").slice(0, 10)}|${clean(m.home)}|${clean(m.away)}`;
const ranked = (match) => [...OPTIONS].sort((a, b) => Number(match.probabilities?.[b] || 0) - Number(match.probabilities?.[a] || 0));
const hasArchiveEvidence = (match) => {
  if (typeof match.archive_analysis?.ready === "boolean") return match.archive_analysis.ready;
  if (match.independent_evidence === true) return true;
  const home = match.form?.home || {}; const away = match.form?.away || {};
  const homeSample = Number(home.sample ?? home.count ?? 0);
  const awaySample = Number(away.sample ?? away.count ?? 0);
  const homeRecent = Array.isArray(home.recent) ? home.recent.length : 0;
  const awayRecent = Array.isArray(away.recent) ? away.recent.length : 0;
  return Math.min(homeSample, awaySample) >= 3
    || Math.min(homeRecent, awayRecent) >= 3
    || (Array.isArray(match.h2h) && match.h2h.length > 0);
};
const isDistributionOnly = (match) => /public_distribution|oynanma/i.test(String(match.probability_basis || match.evidence_mode || ""))
  && match.archive_analysis?.ready !== true;
const cleanForm = (profile, keep) => {
  const base = profile && typeof profile === "object" ? { ...profile } : { recent: [], sample: 0 };
  const sample = Number(base.sample ?? base.count ?? 0);
  base.sample = sample;
  base.count = sample;
  if (!keep) { delete base.scored_last10; delete base.conceded_last10; }
  return base;
};

function normalizeWaiting(match) {
  return {
    ...match,
    analysis_ready: false,
    probabilities: { "1": null, X: null, "2": null },
    market_probabilities: { "1": null, X: null, "2": null },
    probability_basis: "awaiting_verified_1x2_data",
    decision: null,
    selected_options: [],
    selection: null,
    coupon_role: "Analiz Verisi Bekleniyor",
    classification: "Analiz Verisi Bekleniyor",
    confidence: 0,
    confidence_score: 0,
    risk: "Veri Bekleniyor",
    risk_level: "Veri Bekleniyor",
    data_completeness: Number(match.data_completeness || 0),
    probability_gap: null,
    column_multiplier: 0,
    independent_evidence: false,
    evidence_mode: "waiting_verified_data",
    form: { home: cleanForm(match.form?.home, false), away: cleanForm(match.form?.away, false) },
  };
}

function normalizeReady(match) {
  const sum = OPTIONS.reduce((total, option) => total + Number(match.probabilities?.[option] || 0), 0);
  if (Math.abs(sum - 100) > 0.3) throw new Error(`Spor Toto olasılık toplamı hatalı: ${match.match}`);
  const order = ranked(match); const top = order[0]; const second = order[1];
  const topP = Number(match.probabilities[top]); const secondP = Number(match.probabilities[second]);
  const gap = Number((topP - secondP).toFixed(1));
  const archive = hasArchiveEvidence(match);
  const distributionOnly = isDistributionOnly(match);
  let confidence = Number(match.confidence || match.confidence_score || 0);
  let classification = String(match.classification || "Kontrollü Tek");
  let risk = String(match.risk || match.risk_level || "Yüksek");

  if (!archive) {
    if (distributionOnly) {
      confidence = Math.min(confidence || 52, 54);
      classification = topP < 45 || gap < 8 ? "Oynanma Dağılımı · Çifte Adayı" : "Oynanma Dağılımı Bazlı";
    } else {
      confidence = Math.min(confidence || 60, 60);
      classification = topP < 45 || gap < 8 ? "Çifte Şans Adayı" : "Piyasa Bazlı Tek";
    }
    risk = "Yüksek";
  }

  const reasons = [
    `PRO 13: ${top} olasılığı %${topP.toFixed(1)}; ikinci seçenek %${secondP.toFixed(1)}.`,
    archive
      ? "Doğrulanmış sonuç hafızası mevcut; haftalık 1-X-2 kararı gerçek geçmiş sonuçlarla sınandı."
      : distributionOnly
        ? "Takım arşiv örneği güven eşiğinin altında; çıktı yalnız gerçek haftalık oynanma dağılımı olarak işaretlendi."
        : "Doğrulanmış sonuç hafızası sınırlı; çıktı yalnız doğrulanmış 1-X-2 piyasa tabanı olarak işaretlendi.",
    ...(Array.isArray(match.reasons) ? match.reasons.filter((r) => !/proxy|PRO metrik profili/i.test(String(r))).slice(0, 2) : []),
  ];

  return {
    ...match,
    analysis_ready: true,
    decision: top,
    probability_gap: gap,
    confidence,
    confidence_score: confidence,
    classification,
    risk,
    risk_level: risk,
    independent_evidence: archive,
    evidence_mode: archive
      ? (match.evidence_mode || "archive_poisson_plus_public_distribution")
      : distributionOnly ? "cross_verified_public_distribution" : "verified_market_baseline",
    reasons,
    form: { home: cleanForm(match.form?.home, archive), away: cleanForm(match.form?.away, archive) },
  };
}

function applyCoverage(matches) {
  const candidates = matches.map((match, index) => {
    if (!match.analysis_ready) return null;
    const order = ranked(match); const topP = Number(match.probabilities[order[0]] || 0); const gap = Number(match.probability_gap || 0);
    const uncertainClass = /Çifte/.test(String(match.classification || ""));
    return { index, qualifies: uncertainClass || topP < 45 || gap < 8, uncertainty: (100 - Number(match.confidence || 0)) + Math.max(0, 10 - gap) * 3 };
  }).filter(Boolean).filter((r) => r.qualifies).sort((a, b) => b.uncertainty - a.uncertainty).slice(0, MAX_DOUBLES);
  const doubleSet = new Set(candidates.map((r) => r.index));
  return matches.map((match, index) => {
    if (!match.analysis_ready) return { ...match, selected_options: [], selection: null, column_multiplier: 0, coupon_role: "Analiz Verisi Bekleniyor" };
    const order = ranked(match);
    const selected = doubleSet.has(index) ? order.slice(0, 2).sort((a, b) => OPTIONS.indexOf(a) - OPTIONS.indexOf(b)) : [order[0]];
    return { ...match, selected_options: selected, selection: selected.join(""), column_multiplier: selected.length, coupon_role: selected.length === 2 ? "Çifte Şans" : match.classification };
  });
}

function validate(payload, program) {
  if (!Array.isArray(payload.matches) || payload.matches.length !== 15) throw new Error(`Spor Toto bülteni 15 maç olmalı; ${payload.matches?.length || 0}`);
  if (!Array.isArray(program?.matches) || program.matches.length !== 15) throw new Error("Haftalık program 15 maç değil");
  payload.matches.forEach((match, index) => {
    const expected = program.matches[index];
    if (Number(match.no) !== index + 1 || programKey(match) !== programKey(expected)) throw new Error(`Spor Toto program sırası/eşleşmesi bozuk: ${index + 1}`);
    if (String(match.decision || "").toLocaleLowerCase("tr-TR") === "bekleniyor") throw new Error(`Legacy Bekleniyor kararı yasak: ${match.match}`);
    if (match.analysis_ready) {
      if (!OPTIONS.includes(match.decision)) throw new Error(`Hazır maçta karar yok: ${match.match}`);
      if (!Array.isArray(match.selected_options) || !match.selected_options.length) throw new Error(`Hazır maçta seçim yok: ${match.match}`);
      const sum = OPTIONS.reduce((s, option) => s + Number(match.probabilities?.[option] || 0), 0);
      if (Math.abs(sum - 100) > 0.3) throw new Error(`Hazır maç olasılığı 100 değil: ${match.match}`);
    } else {
      if (match.decision !== null || (match.selected_options || []).length !== 0) throw new Error(`Veri bekleyen maç tahmin üretiyor: ${match.match}`);
      if (OPTIONS.some((option) => match.probabilities?.[option] !== null)) throw new Error(`Veri bekleyen maç model olasılığı üretiyor: ${match.match}`);
    }
  });
  return true;
}

function run() {
  try { require("./apply-spor-toto-archive-analysis").run(); }
  catch (error) { console.warn(`Spor Toto archive cache apply skipped: ${error.message}`); }
  try { require("./apply-spor-toto-weekly-market").run(); }
  catch (error) { console.warn(`Spor Toto market cache apply skipped: ${error.message}`); }

  const current = readJson(file, null); const program = readJson(programFile, null);
  if (!current) throw new Error("Spor Toto bülteni bulunamadı");
  const normalized = (current.matches || []).map((match) => match.analysis_ready ? normalizeReady(match) : normalizeWaiting(match));
  const matches = applyCoverage(normalized);
  const ready = matches.filter((m) => m.analysis_ready);
  const doubles = matches.filter((m) => m.analysis_ready && m.column_multiplier === 2).length;
  const allReady = ready.length === 15;
  const totalColumns = allReady ? matches.reduce((total, m) => total * Math.max(1, Number(m.column_multiplier || 1)), 1) : 0;
  const avg = (field) => ready.length ? Math.round(ready.reduce((s, m) => s + Number(m[field] || 0), 0) / ready.length) : 0;
  const distributionCount = ready.filter((m) => !m.independent_evidence && m.evidence_mode === "cross_verified_public_distribution").length;
  const marketCount = ready.filter((m) => !m.independent_evidence && m.evidence_mode !== "cross_verified_public_distribution").length;
  const output = {
    ...current,
    generated_at: new Date().toISOString(),
    source: "Haftalık 15 maç programı + Futbol Laboratuvarı PRO 13",
    engine_version: "spor-toto-weekly15-safe-pro13-v2",
    match_count: 15,
    analysis_ready_count: ready.length,
    analysis_waiting_count: 15 - ready.length,
    evidence_summary: {
      archive_backed_match_count: ready.filter((m) => m.independent_evidence).length,
      distribution_based_match_count: distributionCount,
      market_baseline_match_count: marketCount,
      waiting_match_count: 15 - ready.length,
    },
    coupon: {
      ...(current.coupon || {}), ready: allReady, total_columns: totalColumns,
      single_count: ready.filter((m) => m.column_multiplier === 1).length, double_count: doubles, triple_count: 0,
      average_confidence: avg("confidence"), average_data_completeness: avg("data_completeness"), unit_stake: null, estimated_cost: null,
      note: allReady ? "15 maçın tamamı analiz sinyaliyle kupon hesabına hazır; dağılım bazlı maçlar yüksek risk olarak işaretlenmiştir." : `${15 - ready.length} maç için doğrulanmış analiz verisi bekleniyor; eksik veriyle kupon/maliyet üretilmez.`
    },
    matches
  };
  validate(output, program); writeJson(file, output);
  fs.mkdirSync(path.dirname(reportFile), { recursive: true });
  fs.writeFileSync(reportFile, `# Spor Toto Haftalık 15 Güvenli Rapor\n\n- Güncelleme: ${output.generated_at}\n- Hafta: ${output.week_label}\n- Program maçı: 15\n- Analize hazır: ${ready.length}\n- Veri bekleyen: ${15 - ready.length}\n- Arşiv destekli: ${output.evidence_summary.archive_backed_match_count}\n- Oynanma dağılımı bazlı: ${distributionCount}\n- Piyasa tabanlı: ${marketCount}\n- Kupon hazır: ${allReady ? "evet" : "hayır"}\n- Toplam kolon: ${totalColumns}\n`, "utf8");
  console.log(`Spor Toto weekly 15 safe finalized. matches=15, ready=${ready.length}, waiting=${15 - ready.length}, archive=${output.evidence_summary.archive_backed_match_count}, distribution=${distributionCount}, doubles=${doubles}, couponReady=${allReady}.`);
  return output;
}

if (require.main === module) run();
module.exports = { run, validate, normalizeReady, normalizeWaiting, applyCoverage, hasArchiveEvidence, isDistributionOnly };
