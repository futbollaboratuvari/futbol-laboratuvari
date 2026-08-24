const fs = require("fs");
const path = require("path");
const { buildMatchAnalysis, memoryFor, MODEL_VERSION } = require("./robot-exact-scoring");

const root = path.join(__dirname, "..");
const programPath = path.join(root, "data", "spor_toto_weekly_program.json");
const fixturesPath = path.join(root, "data", "fixtures.json");
const bulletinPath = path.join(root, "data", "spor_toto_bulteni.json");
const reportPath = path.join(root, "outputs", "spor-toto-bulletin-rebuild-report.md");
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
const n = (value) => {
  if (value === null || value === undefined || value === "" || value === "-") return null;
  const parsed = Number(String(value).replace("%", "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
};
const clean = (value) => String(value || "")
  .toLocaleLowerCase("tr-TR")
  .replace(/ı/g, "i")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/\b(a s|as|fk|fc|sk|spor kulubu|sportif faaliyetler|corendon|tumosan|arca|rams)\b/g, " ")
  .replace(/[^a-z0-9]+/g, " ")
  .replace(/\s+/g, " ")
  .trim();
const alias = (value) => clean(value)
  .replace(/paris saint germain/g, "paris sg")
  .replace(/paris st germain/g, "paris sg")
  .replace(/psg/g, "paris sg")
  .replace(/istanbul basaksehir/g, "basaksehir")
  .replace(/hamburger sv/g, "hamburg")
  .replace(/newcastle utd/g, "newcastle united")
  .replace(/atletico madrid/g, "a madrid")
  .replace(/konyaspor/g, "konya")
  .replace(/caykur rizespor/g, "rize")
  .replace(/alanyaspor/g, "alanya")
  .replace(/genclerbirligi/g, "genclerbirligi");
const tokens = (value) => new Set(alias(value).split(" ").filter((x) => x.length > 1));
const similarity = (a, b) => {
  const aa = alias(a); const bb = alias(b);
  if (!aa || !bb) return 0;
  if (aa === bb) return 1;
  if (aa.includes(bb) || bb.includes(aa)) return 0.88;
  const A = tokens(aa); const B = tokens(bb);
  const inter = [...A].filter((x) => B.has(x)).length;
  const union = new Set([...A, ...B]).size || 1;
  return inter / union;
};
const teams = (row) => ({
  home: row.home || row.home_team_name || row.ev_sahibi || "",
  away: row.away || row.away_team_name || row.deplasman || "",
});
const odds = (row) => ({
  "1": n(row.one ?? row.oneOdd ?? row.ms1 ?? row.odd1 ?? row.available_odds?.ms1),
  X: n(row.draw ?? row.drawOdd ?? row.msx ?? row.oddX ?? row.available_odds?.msx),
  "2": n(row.two ?? row.twoOdd ?? row.ms2 ?? row.odd2 ?? row.available_odds?.ms2),
});
const completeOdds = (row) => OPTIONS.every((option) => {
  const value = odds(row)[option];
  return Number.isFinite(value) && value > 1.01 && value < 100;
});
const normalized = (map) => {
  const values = OPTIONS.map((option) => Math.max(0, Number(map?.[option]) || 0));
  const total = values.reduce((a, b) => a + b, 0);
  if (!total) return { "1": null, X: null, "2": null };
  const result = {};
  OPTIONS.forEach((option, index) => { result[option] = Number(((values[index] / total) * 100).toFixed(1)); });
  const drift = Number((100 - OPTIONS.reduce((sum, option) => sum + result[option], 0)).toFixed(1));
  result[OPTIONS[0]] = Number((result[OPTIONS[0]] + drift).toFixed(1));
  return result;
};

function validateProgram(program) {
  if (!program || !Array.isArray(program.matches)) throw new Error("Spor Toto haftalık programı yok");
  if (program.matches.length !== 15 || Number(program.match_count) !== 15) throw new Error(`Spor Toto programı 15 maç olmalı; bulunan ${program.matches.length}`);
  const seen = new Set();
  program.matches.forEach((match, index) => {
    if (Number(match.no) !== index + 1) throw new Error(`Spor Toto maç sırası bozuk: ${match.no}`);
    if (!match.date || !match.time || !match.home || !match.away) throw new Error(`Spor Toto program satırı eksik: ${index + 1}`);
    const key = `${clean(match.home)}|${clean(match.away)}|${match.date}`;
    if (seen.has(key)) throw new Error(`Spor Toto tekrar maç: ${match.home}-${match.away}`);
    seen.add(key);
  });
  return true;
}

function findFixture(programMatch, fixtures) {
  let best = null;
  for (const fixture of fixtures) {
    const t = teams(fixture);
    const homeScore = similarity(programMatch.home, t.home);
    const awayScore = similarity(programMatch.away, t.away);
    if (homeScore < 0.45 || awayScore < 0.45) continue;
    const sameDate = String(fixture.date || "").slice(0, 10) === programMatch.date;
    const score = homeScore + awayScore + (sameDate ? 0.35 : 0);
    if (!best || score > best.score) best = { fixture, score };
  }
  return best && best.score >= 1.35 ? best.fixture : null;
}

function analyzeFixture(programMatch, fixture) {
  if (!fixture || !completeOdds(fixture)) return null;
  const matchOdds = odds(fixture);
  const rows = OPTIONS.map((option) => {
    const key = option === "1" ? "ms1" : option === "X" ? "msx" : "ms2";
    const odd = matchOdds[option];
    const analysis = buildMatchAnalysis(fixture, { key, odd, entry: { odd, source: "standard", key } });
    return { option, analysis };
  });
  const probabilities = normalized(Object.fromEntries(rows.map(({ option, analysis }) => [option, analysis.estimated_probability])));
  const marketProbabilities = normalized(Object.fromEntries(rows.map(({ option, analysis }) => [option, analysis.market_probability])));
  const ranked = [...OPTIONS].sort((a, b) => (probabilities[b] || 0) - (probabilities[a] || 0));
  const top = ranked[0]; const second = ranked[1];
  const topRow = rows.find((row) => row.option === top);
  const completeness = Math.round(rows.reduce((sum, row) => sum + Number(row.analysis.data_completeness || 0), 0) / rows.length);
  const confidence = Math.round(Math.max(0, Math.min(92, (Number(topRow.analysis.analysis_score || 0) * 0.72) + (completeness * 0.28))));
  const gap = Number(((probabilities[top] || 0) - (probabilities[second] || 0)).toFixed(1));
  const independent = Boolean(topRow.analysis.independent_evidence);
  let classification = "Kontrollü Tek";
  if (!independent || completeness < 35) classification = "Piyasa Bazlı Tek";
  else if ((probabilities[top] || 0) >= 58 && gap >= 14 && confidence >= 68) classification = "Banko Adayı";
  else if ((probabilities[top] || 0) < 45 || gap < 8) classification = "Çifte Şans Adayı";
  const risk = !independent || completeness < 35 ? "Yüksek" : confidence >= 72 && gap >= 16 ? "Düşük" : "Orta";
  const memory = memoryFor(fixture, { key: top === "1" ? "ms1" : top === "X" ? "msx" : "ms2" });
  return { probabilities, marketProbabilities, ranked, top, second, completeness, confidence, gap, independent, classification, risk, memory, matchOdds, analysis: topRow.analysis };
}

function outputMatch(programMatch, fixture) {
  const analyzed = analyzeFixture(programMatch, fixture);
  const publicDistribution = normalized(programMatch.public_distribution || {});
  if (!analyzed) {
    return {
      no: programMatch.no,
      week: null,
      date: programMatch.date,
      time: programMatch.time,
      league: programMatch.league || "Spor Toto",
      home: programMatch.home,
      away: programMatch.away,
      match: `${programMatch.home} - ${programMatch.away}`,
      status: fixture?.status || "scheduled",
      source: fixture?.source || "Haftalık Spor Toto programı",
      matchCode: fixture?.matchCode || fixture?.match_code || null,
      one: fixture ? odds(fixture)["1"] : null,
      draw: fixture ? odds(fixture).X : null,
      two: fixture ? odds(fixture)["2"] : null,
      oneOdd: fixture ? odds(fixture)["1"] : null,
      drawOdd: fixture ? odds(fixture).X : null,
      twoOdd: fixture ? odds(fixture)["2"] : null,
      probabilities: { "1": null, X: null, "2": null },
      market_probabilities: { "1": null, X: null, "2": null },
      public_distribution: publicDistribution,
      probability_basis: "awaiting_verified_1x2_data",
      analysis_ready: false,
      decision: null,
      selected_options: [],
      selection: null,
      coupon_role: "Analiz Verisi Bekleniyor",
      classification: "Analiz Verisi Bekleniyor",
      confidence: 0,
      confidence_score: 0,
      risk: "Veri Bekleniyor",
      risk_level: "Veri Bekleniyor",
      data_completeness: 0,
      probability_gap: null,
      column_multiplier: 0,
      reasons: [
        "Bu karşılaşma haftalık 15 maçlık Spor Toto programındadır.",
        "Futbol Laboratuvarı 1-X-2 oranı ve bağımsız veri doğrulanmadan model olasılığı veya tahmin üretmez.",
        `Halk/oynanma dağılımı bilgi amaçlıdır: 1 %${publicDistribution["1"] ?? "-"}, X %${publicDistribution.X ?? "-"}, 2 %${publicDistribution["2"] ?? "-"}.`
      ],
      model_version: MODEL_VERSION,
      score_type: "spor_toto_1x2",
      form: { home: { recent: [], sample: 0 }, away: { recent: [], sample: 0 } },
      h2h: [],
      squad: { available: false, home: [], away: [], note: "Doğrulanmış eksik/kadro verisi bulunmuyor." }
    };
  }
  const mh = analyzed.memory?.home || {}; const ma = analyzed.memory?.away || {};
  return {
    no: programMatch.no,
    week: null,
    date: programMatch.date,
    time: programMatch.time,
    league: programMatch.league || fixture.league || "Spor Toto",
    home: programMatch.home,
    away: programMatch.away,
    match: `${programMatch.home} - ${programMatch.away}`,
    status: fixture.status || fixture.liveStatus || "scheduled",
    source: fixture.source || "Futbol Laboratuvarı fixture akışı",
    matchCode: fixture.matchCode || fixture.match_code || null,
    one: analyzed.matchOdds["1"], draw: analyzed.matchOdds.X, two: analyzed.matchOdds["2"],
    oneOdd: analyzed.matchOdds["1"], drawOdd: analyzed.matchOdds.X, twoOdd: analyzed.matchOdds["2"],
    probabilities: analyzed.probabilities,
    market_probabilities: analyzed.marketProbabilities,
    public_distribution: publicDistribution,
    probability_basis: analyzed.independent ? "market_plus_independent" : "verified_market_baseline",
    analysis_ready: true,
    decision: analyzed.top,
    selected_options: [analyzed.top],
    selection: analyzed.top,
    coupon_role: analyzed.classification,
    classification: analyzed.classification,
    confidence: analyzed.confidence,
    confidence_score: analyzed.confidence,
    risk: analyzed.risk,
    risk_level: analyzed.risk,
    data_completeness: analyzed.completeness,
    probability_gap: analyzed.gap,
    column_multiplier: 1,
    reasons: [
      `PRO 13: ${analyzed.top} olasılığı %${analyzed.probabilities[analyzed.top].toFixed(1)}; ikinci seçenek %${analyzed.probabilities[analyzed.second].toFixed(1)}.`,
      analyzed.independent ? "Karar doğrulanmış piyasa verisi ve bağımsız sonuç hafızasıyla sınandı." : "Bağımsız sonuç hafızası sınırlı; karar doğrulanmış 1-X-2 piyasa tabanı olarak işaretlendi.",
      ...(Array.isArray(analyzed.analysis?.signals) ? analyzed.analysis.signals.slice(0, 2) : [])
    ],
    model_version: MODEL_VERSION,
    score_type: "spor_toto_1x2",
    independent_evidence: analyzed.independent,
    form: {
      home: { recent: [], sample: Number(mh.count || 0), wins: Number(mh.wins || 0), draws: Number(mh.draws || 0), losses: Number(mh.losses || 0), ppg: Number(mh.pointsPerGame || 0), goals_for_avg: Number(mh.goalsForAvg || 0), goals_against_avg: Number(mh.goalsAgainstAvg || 0) },
      away: { recent: [], sample: Number(ma.count || 0), wins: Number(ma.wins || 0), draws: Number(ma.draws || 0), losses: Number(ma.losses || 0), ppg: Number(ma.pointsPerGame || 0), goals_for_avg: Number(ma.goalsForAvg || 0), goals_against_avg: Number(ma.goalsAgainstAvg || 0) }
    },
    h2h: [],
    squad: { available: false, home: [], away: [], note: "Doğrulanmış eksik/kadro verisi bulunmuyor." }
  };
}

function validateBulletin(payload) {
  if (!payload || !Array.isArray(payload.matches) || payload.matches.length !== 15) throw new Error("Spor Toto bülteni tam 15 maç içermeli");
  payload.matches.forEach((match, index) => {
    if (Number(match.no) !== index + 1) throw new Error(`Spor Toto sıra hatası: ${match.no}`);
    if (!match.home || !match.away) throw new Error(`Spor Toto takım bilgisi eksik: ${index + 1}`);
    if (match.analysis_ready) {
      if (!OPTIONS.includes(match.decision)) throw new Error(`Hazır analizde geçersiz karar: ${match.match}`);
      const sum = OPTIONS.reduce((total, option) => total + Number(match.probabilities?.[option] || 0), 0);
      if (Math.abs(sum - 100) > 0.3) throw new Error(`Hazır analiz olasılık toplamı hatalı: ${match.match}`);
    } else if (match.decision !== null || OPTIONS.some((option) => match.probabilities?.[option] !== null)) {
      throw new Error(`Veri bekleyen maçta tahmin üretildi: ${match.match}`);
    }
  });
  return true;
}

function run() {
  const program = readJson(programPath, null);
  validateProgram(program);
  const fixtures = readJson(fixturesPath, []);
  const list = Array.isArray(fixtures) ? fixtures : [];
  const matches = program.matches.map((programMatch) => outputMatch(programMatch, findFixture(programMatch, list)));
  matches.forEach((match) => { match.week = program.week_label; });
  const ready = matches.filter((match) => match.analysis_ready);
  const output = {
    generated_at: new Date().toISOString(),
    timezone: "Europe/Istanbul",
    source: "Haftalık Spor Toto programı + Futbol Laboratuvarı PRO 13",
    official_game_format_verified: true,
    official_bulletin: false,
    program_verification_status: program.verification_status || "verified_seed",
    bulletin_note: "Spor Toto oyunu haftalık 15 maçtır. Bu liste haftalık program kaynaklarıyla çapraz doğrulanır; Futbol Laboratuvarı yalnız doğrulanmış kendi verisi geldiğinde model tahmini üretir.",
    engine_version: `spor-toto-weekly15-${MODEL_VERSION}`,
    season: program.season,
    week: program.week,
    week_label: program.week_label,
    program_start: program.program_start,
    program_end: program.program_end,
    match_count: 15,
    analysis_ready_count: ready.length,
    analysis_waiting_count: 15 - ready.length,
    source_match_count: list.length,
    verification_sources: program.sources || [],
    coupon: {
      ready: ready.length === 15,
      total_columns: ready.length === 15 ? 1 : 0,
      single_count: ready.length,
      double_count: 0,
      triple_count: 0,
      average_confidence: ready.length ? Math.round(ready.reduce((sum, match) => sum + Number(match.confidence || 0), 0) / ready.length) : 0,
      average_data_completeness: ready.length ? Math.round(ready.reduce((sum, match) => sum + Number(match.data_completeness || 0), 0) / ready.length) : 0,
      unit_stake: null,
      estimated_cost: null,
      note: ready.length === 15 ? "15 maçın tamamı analiz için hazır." : `${15 - ready.length} maç için doğrulanmış 1-X-2 veri bekleniyor; eksik veriyle kupon üretilmez.`
    },
    matches
  };
  validateBulletin(output);
  writeJson(bulletinPath, output);
  const report = [
    "# Spor Toto Haftalık 15 Maç Raporu",
    "",
    `- Güncelleme: ${output.generated_at}`,
    `- Hafta: ${output.week_label}`,
    `- Program: ${output.program_start} / ${output.program_end}`,
    `- Program maçı: ${output.match_count}`,
    `- Analize hazır: ${output.analysis_ready_count}`,
    `- Veri bekleyen: ${output.analysis_waiting_count}`,
    `- Motor: ${output.engine_version}`,
    "",
    ...matches.map((match) => `- ${match.no}. ${match.date} ${match.time} | ${match.home} - ${match.away} | ${match.analysis_ready ? `${match.decision} / güven ${match.confidence}` : "veri bekleniyor"}`)
  ].join("\n");
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${report}\n`, "utf8");
  console.log(`Spor Toto weekly 15 rebuilt. Week=${output.week_label}, matches=15, ready=${ready.length}, waiting=${15 - ready.length}.`);
  return output;
}

if (require.main === module) run();
module.exports = { run, validateProgram, validateBulletin, findFixture, similarity };
