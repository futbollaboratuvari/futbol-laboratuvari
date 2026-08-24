const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const file = path.join(root, "data", "spor_toto_bulteni.json");
const reportFile = path.join(root, "outputs", "spor-toto-bulletin-rebuild-report.md");
const MAX_DOUBLES = 4;

const read = (fallback) => { try { const text = fs.readFileSync(file, "utf8").trim(); return text ? JSON.parse(text) : fallback; } catch { return fallback; } };
const write = (value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
const n = (value) => { const parsed = Number(String(value ?? "").replace("%", "").replace(",", ".")); return Number.isFinite(parsed) ? parsed : 0; };
const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const order = ["1", "X", "2"];
const sortedOptions = (match) => [...order].sort((a, b) => n(match.probabilities?.[b]) - n(match.probabilities?.[a]));
const hasArchiveEvidence = (match) => {
  const home = match.form?.home || {};
  const away = match.form?.away || {};
  return n(home.sample) > 0 || n(away.sample) > 0
    || (Array.isArray(home.recent) && home.recent.length > 0)
    || (Array.isArray(away.recent) && away.recent.length > 0)
    || (Array.isArray(match.h2h) && match.h2h.length > 0);
};
const stripProxyMetrics = (profile, keep) => {
  if (!profile || typeof profile !== "object") return profile || {};
  if (keep) return profile;
  return { ...profile, scored_last10: null, conceded_last10: null };
};

const normalizeOne = (raw) => {
  const match = { ...raw };
  const ranked = sortedOptions(match);
  const top = ranked[0];
  const second = ranked[1];
  const topProbability = n(match.probabilities?.[top]);
  const secondProbability = n(match.probabilities?.[second]);
  const gap = Number((topProbability - secondProbability).toFixed(1));
  const independent = hasArchiveEvidence(match);
  const completeness = n(match.data_completeness);
  let confidence = n(match.confidence || match.confidence_score);
  let classification = match.classification || "Kontrollü Tek";
  let risk = match.risk || match.risk_level || "Yüksek";

  if (!independent) {
    confidence = Math.round(Math.min(confidence || 60, clamp((topProbability * 0.48) + (completeness * 0.30) + (Math.min(30, gap) * 0.16), 35, 60)));
    classification = topProbability < 45 || gap < 8 ? "Çifte Şans Adayı" : "Piyasa Bazlı Tek";
    risk = "Yüksek";
  }

  const reasons = [
    `PRO 13: ${top} olasılığı %${topProbability.toFixed(1)}; ikinci seçenek %${secondProbability.toFixed(1)}.`,
    `Veri kapsama ${completeness}/100; olasılık farkı ${gap.toFixed(1)} puan.`,
    independent
      ? "Bağımsız takım sonuç hafızası mevcut; karar piyasa ile birlikte sınandı."
      : "Bağımsız form/H2H örneği yok; karar piyasa tabanı olarak sınırlandı ve veri riski yüksek tutuldu.",
    ...(Array.isArray(match.reasons) ? match.reasons.filter((row) => !/PRO metrik profili|Bağımsız form\/H2H/i.test(String(row))).slice(0, 2) : []),
  ];

  const cleaned = { ...match };
  delete cleaned.metric_profile;
  cleaned.probability_gap = gap;
  cleaned.decision = top;
  cleaned.confidence = confidence;
  cleaned.confidence_score = confidence;
  cleaned.classification = classification;
  cleaned.risk = risk;
  cleaned.risk_level = risk;
  cleaned.independent_evidence = independent;
  cleaned.evidence_mode = independent ? "archive_plus_market" : "market_baseline";
  cleaned.reasons = reasons;
  cleaned.form = {
    home: stripProxyMetrics(match.form?.home, independent),
    away: stripProxyMetrics(match.form?.away, independent),
  };
  return cleaned;
};

const applyCoverage = (matches) => {
  const doubles = new Set(matches.map((match, index) => {
    const ranked = sortedOptions(match);
    const topProbability = n(match.probabilities?.[ranked[0]]);
    const gap = n(match.probability_gap);
    return {
      index,
      qualifies: match.classification === "Çifte Şans Adayı" || gap < 8 || topProbability < 45,
      uncertainty: (100 - n(match.confidence)) + Math.max(0, 10 - gap) * 3,
    };
  }).filter((row) => row.qualifies).sort((a, b) => b.uncertainty - a.uncertainty).slice(0, MAX_DOUBLES).map((row) => row.index));

  return matches.map((match, index) => {
    const ranked = sortedOptions(match);
    const selected = (doubles.has(index) ? ranked.slice(0, 2) : [ranked[0]])
      .sort((a, b) => order.indexOf(a) - order.indexOf(b));
    return {
      ...match,
      selected_options: selected,
      selection: selected.join(""),
      coupon_role: selected.length === 2 ? "Çifte Şans" : match.classification,
      column_multiplier: selected.length,
    };
  });
};

const validate = (payload) => {
  if (!Array.isArray(payload.matches)) throw new Error("Spor Toto matches dizisi yok");
  payload.matches.forEach((match) => {
    if (!order.includes(match.decision)) throw new Error(`Geçersiz karar: ${match.match || "?"}`);
    const sum = order.reduce((total, option) => total + n(match.probabilities?.[option]), 0);
    if (Math.abs(sum - 100) > 0.3) throw new Error(`Olasılık toplamı hatalı: ${match.match || "?"}`);
    if (!Array.isArray(match.selected_options) || !match.selected_options.length) throw new Error(`Seçim yok: ${match.match || "?"}`);
  });
};

const run = () => {
  const current = read({ matches: [] });
  const matches = applyCoverage((Array.isArray(current.matches) ? current.matches : []).map(normalizeOne));
  const doubles = matches.filter((match) => match.column_multiplier === 2).length;
  const columns = matches.length ? matches.reduce((total, match) => total * Math.max(1, n(match.column_multiplier)), 1) : 0;
  const average = (field) => matches.length ? Math.round(matches.reduce((sum, match) => sum + n(match[field]), 0) / matches.length) : 0;
  const archiveBacked = matches.filter((match) => match.independent_evidence).length;
  const output = {
    ...current,
    generated_at: new Date().toISOString(),
    source: "Futbol Laboratuvarı PRO 13 + Maçkolik 1-X-2 + doğrulanmış sonuç hafızası (varsa)",
    official_bulletin: false,
    bulletin_note: "Bu alan resmî Spor Toto bülteni değildir; Futbol Laboratuvarı'nın güncel 15 maçlık 1-X-2 analiz çalışma listesidir. Proxy form verisi gerçek form gibi gösterilmez.",
    engine_version: "spor-toto-pro-v2-safe-pro13",
    match_count: matches.length,
    evidence_summary: { archive_backed_match_count: archiveBacked, market_baseline_match_count: matches.length - archiveBacked },
    coupon: {
      ...(current.coupon || {}), total_columns: columns, single_count: matches.length - doubles, double_count: doubles, triple_count: 0,
      average_confidence: average("confidence"), average_data_completeness: average("data_completeness"), unit_stake: null, estimated_cost: null,
      note: "Güncel resmî birim kolon bedeli doğrulanmadan parasal maliyet gösterilmez.",
    },
    matches,
  };
  validate(output);
  write(output);
  fs.mkdirSync(path.dirname(reportFile), { recursive: true });
  fs.writeFileSync(reportFile, `# Spor Toto PRO Güvenli Rapor\n\n- Güncelleme: ${output.generated_at}\n- Maç: ${matches.length}\n- Arşiv destekli: ${archiveBacked}\n- Piyasa tabanlı: ${matches.length - archiveBacked}\n- Çifte şans: ${doubles}\n- Toplam kolon: ${columns}\n- Ortalama güven: ${output.coupon.average_confidence}/100\n- Ortalama veri: ${output.coupon.average_data_completeness}/100\n`, "utf8");
  console.log(`Spor Toto PRO safe finalized. Matches=${matches.length}, archive=${archiveBacked}, baseline=${matches.length - archiveBacked}, doubles=${doubles}, columns=${columns}.`);
  return output;
};

if (require.main === module) run();
module.exports = { run, validate, normalizeOne, applyCoverage };
