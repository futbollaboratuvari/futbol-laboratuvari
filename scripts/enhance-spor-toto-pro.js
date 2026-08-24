const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const bulletinFile = path.join(root, "data", "spor_toto_bulteni.json");
const fixturesFile = path.join(root, "data", "fixtures.json");
const proIndexFile = path.join(root, "data", "pro-analysis-index.json");
const reportFile = path.join(root, "outputs", "spor-toto-bulletin-rebuild-report.md");
const MAX_DOUBLES = 4;

const read = (file, fallback) => { try { const t = fs.readFileSync(file, "utf8").trim(); return t ? JSON.parse(t) : fallback; } catch { return fallback; } };
const write = (file, value) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8"); };
const n = (value) => { const x = Number(String(value ?? "").replace("%", "").replace(",", ".")); return Number.isFinite(x) ? x : null; };
const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const pct = (value) => { const x = n(value); return x === null ? null : clamp(x <= 10 ? x * 10 : x); };
const key = (value) => String(value || "").toLocaleLowerCase("tr-TR").replace(/ı/g, "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const normalize = (values) => { const total = ["1", "X", "2"].reduce((s, o) => s + Math.max(0, Number(values[o]) || 0), 0); return total ? Object.fromEntries(["1", "X", "2"].map((o) => [o, Number(((Math.max(0, Number(values[o]) || 0) / total) * 100).toFixed(1))])) : { "1": null, X: null, "2": null }; };
const mean = (values) => { const a = values.filter(Number.isFinite); return a.length ? a.reduce((s, v) => s + v, 0) / a.length : null; };

const fixtures = read(fixturesFile, []);
const fixtureByCode = new Map();
const fixtureByMatch = new Map();
(Array.isArray(fixtures) ? fixtures : []).forEach((f) => {
  const code = String(f.matchCode || f.match_code || "").trim();
  if (code) fixtureByCode.set(code, f);
  fixtureByMatch.set(`${String(f.date || "").slice(0, 10)}|${key(f.home || f.home_team_name)}|${key(f.away || f.away_team_name)}`, f);
});
const pro = read(proIndexFile, { matches: [] });
const proByCode = new Map();
const proByMatch = new Map();
(Array.isArray(pro.matches) ? pro.matches : []).forEach((m) => {
  const code = String(m.match_code || m.id || "").trim(); if (code) proByCode.set(code, m);
  proByMatch.set(`${String(m.date || "").slice(0, 10)}|${key(m.home)}|${key(m.away)}`, m);
});
const findRow = (mapCode, mapMatch, match) => {
  const code = String(match.matchCode || match.match_code || "").trim();
  return (code && mapCode.get(code)) || mapMatch.get(`${String(match.date || "").slice(0, 10)}|${key(match.home)}|${key(match.away)}`) || null;
};
const marketProb = (match) => {
  const odds = { "1": n(match.one ?? match.oneOdd), X: n(match.draw ?? match.drawOdd), "2": n(match.two ?? match.twoOdd) };
  if (Object.values(odds).some((odd) => !odd || odd <= 1)) return null;
  return normalize({ "1": 1 / odds["1"], X: 1 / odds.X, "2": 1 / odds["2"] });
};
const metricProfile = (metrics, market) => {
  if (!metrics || !market) return null;
  const homePower = mean([pct(metrics.homeScoredLast10), pct(metrics.awayConcededLast10)]);
  const awayPower = mean([pct(metrics.awayScoredLast10), pct(metrics.homeConcededLast10)]);
  if (homePower === null || awayPower === null) return null;
  const diff = clamp(homePower - awayPower, -70, 70);
  const drawShift = Math.abs(diff) <= 10 ? 4 : Math.abs(diff) <= 20 ? 2 : Math.abs(diff) >= 45 ? -3 : 0;
  const sideShift = clamp(diff * 0.14, -9, 9);
  return {
    probabilities: normalize({ "1": Math.max(2, market["1"] + sideShift - drawShift / 2), X: Math.max(8, market.X + drawShift), "2": Math.max(2, market["2"] - sideShift - drawShift / 2) }),
    homePower: Number(homePower.toFixed(1)), awayPower: Number(awayPower.toFixed(1)), source: "PRO metrik profili"
  };
};
const enhanceOne = (match) => {
  const fixture = findRow(fixtureByCode, fixtureByMatch, match) || {};
  const proRow = findRow(proByCode, proByMatch, match) || {};
  const metrics = proRow.metrics || {};
  const market = marketProb(match) || match.market_probabilities || match.probabilities;
  const profile = metricProfile(metrics, market);
  const base = match.probabilities || market;
  const probabilities = profile ? normalize(Object.fromEntries(["1", "X", "2"].map((o) => [o, (Number(base?.[o]) || Number(market?.[o]) || 0) * 0.72 + profile.probabilities[o] * 0.28]))) : normalize(base || market || {});
  const ranked = ["1", "X", "2"].map((option) => ({ option, probability: Number(probabilities[option] || 0), market: Number(market?.[option] || 0) })).sort((a, b) => b.probability - a.probability);
  const top = ranked[0], second = ranked[1];
  const gap = Number((top.probability - second.probability).toFixed(1));
  const completeness = Math.max(Number(match.data_completeness || 0), Number(proRow.data_completeness || 0));
  const oldConfidence = Number(match.confidence || match.confidence_score || 0);
  const confidence = Math.round(clamp(oldConfidence * 0.62 + completeness * 0.16 + top.probability * 0.14 + Math.min(30, gap) * 0.12 + (profile ? 6 : 0), 0, 92));
  const edge = Number((top.probability - Number(market?.[top.option] || 0)).toFixed(1));
  let classification = "Kontrollü Tek";
  if (top.probability >= 57 && gap >= 14 && confidence >= 62 && completeness >= 35) classification = "Banko Adayı";
  else if (top.probability < 44 || gap < 7 || confidence < 46) classification = "Çifte Şans Adayı";
  else if ((top.option === "1" ? n(match.one) : top.option === "X" ? n(match.draw) : n(match.two)) >= 3.25 && edge >= 4) classification = "Sürpriz Adayı";
  const independent = Boolean(match.independent_evidence || profile);
  const risk = !independent || completeness < 28 || top.probability < 42 || gap < 6 ? "Yüksek" : classification === "Banko Adayı" && completeness >= 55 && confidence >= 70 ? "Düşük" : "Orta";
  const form = match.form || { home: {}, away: {} };
  form.home = { ...(form.home || {}), scored_last10: pct(metrics.homeScoredLast10), conceded_last10: pct(metrics.homeConcededLast10) };
  form.away = { ...(form.away || {}), scored_last10: pct(metrics.awayScoredLast10), conceded_last10: pct(metrics.awayConcededLast10) };
  return {
    ...match, probabilities, market_probabilities: market, decision: top.option, confidence, confidence_score: confidence,
    data_completeness: completeness, probability_gap: gap, classification, risk, risk_level: risk, independent_evidence: independent,
    metric_profile: profile, form,
    reasons: [
      `PRO 13: ${top.option} olasılığı %${top.probability.toFixed(1)}; ikinci seçenek %${second.probability.toFixed(1)}.`,
      `Model-piyasa farkı ${edge >= 0 ? "+" : ""}${edge.toFixed(1)} puan; veri kapsama ${completeness}/100.`,
      ...(profile ? [`PRO metrik profili: ev güç ${profile.homePower}/100, deplasman güç ${profile.awayPower}/100.`] : []),
      ...(Array.isArray(match.reasons) ? match.reasons.slice(2, 4) : [])
    ]
  };
};
const applyCoverage = (matches) => {
  const doubles = new Set(matches.map((m, index) => ({ index, qualifies: m.classification === "Çifte Şans Adayı" || Number(m.probability_gap || 0) < 8 || Number(m.probabilities?.[m.decision] || 0) < 45, score: (100 - Number(m.confidence || 0)) + Math.max(0, 10 - Number(m.probability_gap || 0)) * 3 })).filter((r) => r.qualifies).sort((a, b) => b.score - a.score).slice(0, MAX_DOUBLES).map((r) => r.index));
  return matches.map((m, index) => {
    const ranked = ["1", "X", "2"].sort((a, b) => Number(m.probabilities?.[b] || 0) - Number(m.probabilities?.[a] || 0));
    const selected = (doubles.has(index) ? ranked.slice(0, 2) : [ranked[0]]).sort((a, b) => ["1", "X", "2"].indexOf(a) - ["1", "X", "2"].indexOf(b));
    return { ...m, selected_options: selected, selection: selected.join(""), coupon_role: selected.length === 2 ? "Çifte Şans" : m.classification, column_multiplier: selected.length };
  });
};
const validate = (payload) => {
  if (!Array.isArray(payload.matches)) throw new Error("Spor Toto matches yok");
  payload.matches.forEach((m) => {
    if (!["1", "X", "2"].includes(m.decision)) throw new Error(`Geçersiz karar: ${m.match}`);
    const sum = [m.probabilities?.["1"], m.probabilities?.X, m.probabilities?.["2"]].reduce((s, v) => s + Number(v || 0), 0);
    if (Math.abs(sum - 100) > 0.3) throw new Error(`Olasılık toplamı hatalı: ${m.match}`);
  });
};

const run = () => {
  const current = read(bulletinFile, { matches: [] });
  const matches = applyCoverage((Array.isArray(current.matches) ? current.matches : []).map(enhanceOne));
  const doubles = matches.filter((m) => m.column_multiplier === 2).length;
  const columns = matches.length ? matches.reduce((total, m) => total * Math.max(1, Number(m.column_multiplier || 1)), 1) : 0;
  const avg = (field) => matches.length ? Math.round(matches.reduce((sum, m) => sum + Number(m[field] || 0), 0) / matches.length) : 0;
  const output = {
    ...current, generated_at: new Date().toISOString(),
    source: "Futbol Laboratuvarı PRO 13 + Maçkolik 1-X-2 + doğrulanmış PRO veri katmanları",
    official_bulletin: false,
    bulletin_note: "Bu alan resmî Spor Toto bülteni değildir; Futbol Laboratuvarı'nın güncel 15 maçlık 1-X-2 analiz çalışma listesidir.",
    engine_version: "spor-toto-pro-v2-pro13",
    match_count: matches.length,
    coupon: { ...(current.coupon || {}), total_columns: columns, single_count: matches.length - doubles, double_count: doubles, triple_count: 0, average_confidence: avg("confidence"), average_data_completeness: avg("data_completeness"), unit_stake: null, estimated_cost: null, note: "Güncel resmî birim kolon bedeli doğrulanmadan parasal maliyet gösterilmez." },
    matches
  };
  validate(output);
  write(bulletinFile, output);
  const rows = matches.map((m) => `- ${m.no}. ${m.date} ${m.time} | ${m.home} - ${m.away} | ${m.selection} | ${m.probabilities[m.decision]}% | güven ${m.confidence}/100 | veri ${m.data_completeness}/100`).join("\n");
  fs.mkdirSync(path.dirname(reportFile), { recursive: true });
  fs.writeFileSync(reportFile, `# Spor Toto PRO v2 Raporu\n\n- Güncelleme: ${output.generated_at}\n- Gösterilen maç: ${matches.length}\n- Çifte şans: ${doubles}\n- Toplam kolon: ${columns}\n- Ortalama güven: ${output.coupon.average_confidence}/100\n- Ortalama veri: ${output.coupon.average_data_completeness}/100\n\n${rows || "Uygun maç bekleniyor."}\n`, "utf8");
  console.log(`Spor Toto PRO v2 enhanced. Matches=${matches.length}, doubles=${doubles}, columns=${columns}.`);
  return output;
};

if (require.main === module) run();
module.exports = { run, validate };
