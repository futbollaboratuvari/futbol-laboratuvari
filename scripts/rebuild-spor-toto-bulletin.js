const fs = require("fs");
const path = require("path");
const { filterActiveBulletinMatches, countInactiveBulletinMatches } = require("./bulletin-active-filter");
const { buildMatchAnalysis, memoryFor, MODEL_VERSION } = require("./robot-exact-scoring");

const rootDir = path.join(__dirname, "..");
const fixturesPath = path.join(rootDir, "data", "fixtures.json");
const archivePath = path.join(rootDir, "data", "robot_match_archive.json");
const bulletinPath = path.join(rootDir, "data", "spor_toto_bulteni.json");
const reportPath = path.join(rootDir, "outputs", "spor-toto-bulletin-rebuild-report.md");
const MAX_MATCHES = 15;
const MAX_DOUBLES = 4;

const readJson = (filePath, fallback) => {
  try {
    const text = fs.readFileSync(filePath, "utf8").trim();
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
};

const writeText = (filePath, value) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, value, "utf8");
};

const trDate = (offset = 0) => {
  const now = new Date();
  const local = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Istanbul" }));
  local.setDate(local.getDate() + offset);
  const year = local.getFullYear();
  const month = String(local.getMonth() + 1).padStart(2, "0");
  const day = String(local.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const safeNumber = (value) => {
  if (value === undefined || value === null || value === "" || value === "-") return null;
  const number = Number(String(value).replace(",", "."));
  return Number.isFinite(number) ? number : null;
};

const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const cleanKey = (value) => String(value || "")
  .toLocaleLowerCase("tr-TR")
  .replace(/ı/g, "i")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .trim();

const teams = (fixture) => ({
  home: String(fixture.home || fixture.home_team_name || "").trim(),
  away: String(fixture.away || fixture.away_team_name || "").trim(),
});

const oddsFor = (fixture) => ({
  one: safeNumber(fixture.one ?? fixture.oneOdd ?? fixture.ms1 ?? fixture.odd1),
  draw: safeNumber(fixture.draw ?? fixture.drawOdd ?? fixture.msx ?? fixture.oddX),
  two: safeNumber(fixture.two ?? fixture.twoOdd ?? fixture.ms2 ?? fixture.odd2),
});

const isUsableOdd = (value) => Number.isFinite(value) && value > 1.01 && value < 100;
const hasCompleteOneXTwo = (fixture) => {
  const odds = oddsFor(fixture);
  return isUsableOdd(odds.one) && isUsableOdd(odds.draw) && isUsableOdd(odds.two);
};

const marketKey = { "1": "ms1", X: "msx", "2": "ms2" };
const optionOdd = (odds, option) => option === "1" ? odds.one : option === "X" ? odds.draw : odds.two;

const normalizeProbabilities = (rows) => {
  const known = rows.map((row) => Number(row.value)).filter(Number.isFinite);
  const total = known.reduce((sum, value) => sum + Math.max(0, value), 0);
  if (!total) return Object.fromEntries(rows.map((row) => [row.option, null]));
  return Object.fromEntries(rows.map((row) => [
    row.option,
    Number.isFinite(Number(row.value)) ? Number(((Math.max(0, Number(row.value)) / total) * 100).toFixed(1)) : null,
  ]));
};

const parseArchiveScore = (match) => {
  const homeScore = safeNumber(match?.homeScore ?? match?.home_score ?? match?.homeGoals ?? match?.home_goals);
  const awayScore = safeNumber(match?.awayScore ?? match?.away_score ?? match?.awayGoals ?? match?.away_goals);
  if (homeScore !== null && awayScore !== null) return { home: homeScore, away: awayScore };
  const found = String(match?.score || match?.result_score || match?.final_score || "").match(/(\d+)\D+(\d+)/);
  return found ? { home: Number(found[1]), away: Number(found[2]) } : null;
};

const archiveContext = (() => {
  const archive = readJson(archivePath, { matches: [], team_index: {} });
  const matches = Array.isArray(archive?.matches) ? archive.matches : [];
  const teamIndex = archive?.team_index && typeof archive.team_index === "object" ? archive.team_index : {};
  const indexedTeams = new Map();
  Object.values(teamIndex).forEach((entry) => {
    const key = cleanKey(entry?.team);
    if (key) indexedTeams.set(key, entry);
  });
  return { matches, indexedTeams };
})();

const recentForm = (teamName) => {
  const key = cleanKey(teamName);
  if (!key) return [];
  const indexed = archiveContext.indexedTeams.get(key);
  const recent = Array.isArray(indexed?.recent) ? indexed.recent.slice(-5) : [];
  if (recent.length) {
    return recent.map((row) => {
      const direct = String(row?.result || "").toUpperCase();
      if (["W", "D", "L"].includes(direct)) return direct;
      const score = parseArchiveScore(row);
      if (!score) return null;
      return score.home > score.away ? "W" : score.home === score.away ? "D" : "L";
    }).filter(Boolean);
  }

  return archiveContext.matches
    .filter((row) => [cleanKey(row?.home || row?.home_team_name), cleanKey(row?.away || row?.away_team_name)].includes(key))
    .slice(-5)
    .map((row) => {
      const score = parseArchiveScore(row);
      if (!score) return null;
      const isHome = cleanKey(row?.home || row?.home_team_name) === key;
      const gf = isHome ? score.home : score.away;
      const ga = isHome ? score.away : score.home;
      return gf > ga ? "W" : gf === ga ? "D" : "L";
    })
    .filter(Boolean);
};

const h2hFor = (home, away) => {
  const homeKey = cleanKey(home);
  const awayKey = cleanKey(away);
  if (!homeKey || !awayKey) return [];
  return archiveContext.matches
    .filter((row) => {
      const a = cleanKey(row?.home || row?.home_team_name);
      const b = cleanKey(row?.away || row?.away_team_name);
      return (a === homeKey && b === awayKey) || (a === awayKey && b === homeKey);
    })
    .slice(-5)
    .map((row) => ({
      date: String(row?.date || row?.tarih || "").slice(0, 10),
      home: row?.home || row?.home_team_name || "",
      away: row?.away || row?.away_team_name || "",
      score: (() => {
        const score = parseArchiveScore(row);
        return score ? `${score.home}-${score.away}` : String(row?.score || "-");
      })(),
    }));
};

const openingOddsFor = (fixture) => ({
  one: safeNumber(fixture.openingOne ?? fixture.oneOpen ?? fixture.openOne ?? fixture.open_ms1),
  draw: safeNumber(fixture.openingDraw ?? fixture.drawOpen ?? fixture.openDraw ?? fixture.open_msx),
  two: safeNumber(fixture.openingTwo ?? fixture.twoOpen ?? fixture.openTwo ?? fixture.open_ms2),
});

const squadFor = (fixture) => {
  const home = fixture.homeMissingPlayers ?? fixture.homeInjuries ?? fixture.home_absences ?? null;
  const away = fixture.awayMissingPlayers ?? fixture.awayInjuries ?? fixture.away_absences ?? null;
  const normalize = (value) => Array.isArray(value) ? value.map(String).filter(Boolean).slice(0, 8) : typeof value === "string" && value.trim() ? [value.trim()] : [];
  const homeRows = normalize(home);
  const awayRows = normalize(away);
  return {
    available: Boolean(homeRows.length || awayRows.length),
    home: homeRows,
    away: awayRows,
    note: homeRows.length || awayRows.length ? "Fixture kaynağındaki eksik/kadro verisi." : "Doğrulanmış eksik/kadro verisi bulunmuyor.",
  };
};

const analysisForOption = (fixture, option, odd) => {
  const key = marketKey[option];
  return buildMatchAnalysis(fixture, {
    key,
    odd,
    entry: { odd, source: "standard", key },
  });
};

const buildScoredMatch = (fixture) => {
  const odds = oddsFor(fixture);
  if (![odds.one, odds.draw, odds.two].every(isUsableOdd)) return null;
  const optionRows = ["1", "X", "2"].map((option) => {
    const odd = optionOdd(odds, option);
    const analysis = analysisForOption(fixture, option, odd);
    return { option, odd, analysis };
  });

  const modelProbabilities = normalizeProbabilities(optionRows.map((row) => ({
    option: row.option,
    value: row.analysis.estimated_probability,
  })));
  const marketProbabilities = normalizeProbabilities(optionRows.map((row) => ({
    option: row.option,
    value: row.analysis.market_probability ?? (100 / row.odd),
  })));

  const ranked = optionRows
    .map((row) => ({
      ...row,
      probability: modelProbabilities[row.option] ?? marketProbabilities[row.option] ?? 0,
      marketProbability: marketProbabilities[row.option] ?? 0,
      edge: Number(((modelProbabilities[row.option] ?? 0) - (marketProbabilities[row.option] ?? 0)).toFixed(1)),
    }))
    .sort((a, b) => b.probability - a.probability || b.analysis.analysis_score - a.analysis.analysis_score);

  const top = ranked[0];
  const second = ranked[1];
  const probabilityGap = Number((top.probability - second.probability).toFixed(1));
  const avgCompleteness = Math.round(optionRows.reduce((sum, row) => sum + Number(row.analysis.data_completeness || 0), 0) / 3);
  const confidence = Math.round(clamp((Number(top.analysis.analysis_score || 0) * 0.7) + (avgCompleteness * 0.3), 0, 92));
  const memory = memoryFor(fixture, { key: marketKey[top.option] });
  const t = teams(fixture);

  let classification = "Kontrollü Tek";
  let risk = "Orta";
  if (top.probability >= 56 && probabilityGap >= 13 && confidence >= 68 && avgCompleteness >= 50) {
    classification = "Banko Adayı";
    risk = avgCompleteness >= 65 ? "Düşük" : "Orta";
  } else if (top.probability < 44 || probabilityGap < 6 || confidence < 52) {
    classification = "Çifte Şans Adayı";
    risk = "Yüksek";
  } else if (top.odd >= 3.25 && top.edge >= 4) {
    classification = "Sürpriz Adayı";
    risk = "Yüksek";
  }
  if (avgCompleteness < 35 || !top.analysis.independent_evidence) risk = "Yüksek";

  const reasons = [
    `PRO 13: ${top.option} olasılığı %${top.probability.toFixed(1)}; ikinci seçenek %${second.probability.toFixed(1)}.`,
    `Model-piyasa farkı ${top.edge >= 0 ? "+" : ""}${top.edge.toFixed(1)} puan; veri kapsama ${avgCompleteness}/100.`,
    ...(Array.isArray(top.analysis.signals) ? top.analysis.signals.slice(0, 2) : []),
  ];

  return {
    fixture,
    home: t.home,
    away: t.away,
    odds,
    openingOdds: openingOddsFor(fixture),
    probabilities: modelProbabilities,
    marketProbabilities,
    ranked,
    primary: top.option,
    secondary: second.option,
    probabilityGap,
    confidence,
    dataCompleteness: avgCompleteness,
    classification,
    risk,
    reasons,
    memory,
    recentForm: { home: recentForm(t.home), away: recentForm(t.away) },
    h2h: h2hFor(t.home, t.away),
    squad: squadFor(fixture),
  };
};

const sortFixtures = (items) => [...items].sort((a, b) =>
  String(a.date || "").localeCompare(String(b.date || ""))
  || String(a.time || "99:99").localeCompare(String(b.time || "99:99"))
  || String(a.home || "").localeCompare(String(b.home || ""))
);

const selectBulletinMatches = (fixtures) => {
  const scored = fixtures.map(buildScoredMatch).filter(Boolean);
  const strongest = [...scored]
    .sort((a, b) => b.dataCompleteness - a.dataCompleteness
      || b.confidence - a.confidence
      || a.probabilityGap - b.probabilityGap
      || String(a.fixture.date || "").localeCompare(String(b.fixture.date || ""))
      || String(a.fixture.time || "99:99").localeCompare(String(b.fixture.time || "99:99")))
    .slice(0, MAX_MATCHES);
  return strongest.sort((a, b) =>
    String(a.fixture.date || "").localeCompare(String(b.fixture.date || ""))
    || String(a.fixture.time || "99:99").localeCompare(String(b.fixture.time || "99:99"))
    || String(a.home).localeCompare(String(b.home))
  );
};

const applyCouponCoverage = (matches) => {
  const doubleIndexes = matches
    .map((item, index) => ({
      index,
      uncertainty: (100 - item.confidence) + (12 - Math.min(12, item.probabilityGap)) * 2 + (item.risk === "Yüksek" ? 12 : 0),
      qualifies: item.classification === "Çifte Şans Adayı" || item.probabilityGap < 8 || item.confidence < 58,
    }))
    .filter((row) => row.qualifies)
    .sort((a, b) => b.uncertainty - a.uncertainty)
    .slice(0, MAX_DOUBLES)
    .map((row) => row.index);
  const doubleSet = new Set(doubleIndexes);

  return matches.map((item, index) => {
    const selectedOptions = doubleSet.has(index) ? [item.primary, item.secondary] : [item.primary];
    return {
      ...item,
      selectedOptions,
      selection: selectedOptions.join(""),
      columnMultiplier: selectedOptions.length,
      couponRole: selectedOptions.length === 2 ? "Çifte Şans" : item.classification,
    };
  });
};

const normalizeOutput = (item, index, weekLabel) => {
  const fixture = item.fixture;
  const memoryHome = item.memory?.home || {};
  const memoryAway = item.memory?.away || {};
  return {
    no: index + 1,
    week: weekLabel,
    date: fixture.date || "",
    time: fixture.time || "",
    league: fixture.league || fixture.competition_name || "Lig",
    home: item.home,
    away: item.away,
    match: `${item.home} - ${item.away}`,
    status: fixture.status || fixture.liveStatus || "scheduled",
    minute: fixture.minute ?? null,
    score: fixture.score || "-",
    source: fixture.source || "Maçkolik canlı robot",
    matchCode: fixture.matchCode || fixture.match_code || null,
    one: item.odds.one,
    draw: item.odds.draw,
    two: item.odds.two,
    oneOdd: item.odds.one,
    drawOdd: item.odds.draw,
    twoOdd: item.odds.two,
    opening_odds: item.openingOdds,
    probabilities: item.probabilities,
    market_probabilities: item.marketProbabilities,
    decision: item.primary,
    selected_options: item.selectedOptions,
    selection: item.selection,
    coupon_role: item.couponRole,
    classification: item.classification,
    confidence: item.confidence,
    confidence_score: item.confidence,
    risk: item.risk,
    risk_level: item.risk,
    data_completeness: item.dataCompleteness,
    probability_gap: item.probabilityGap,
    column_multiplier: item.columnMultiplier,
    reasons: item.reasons,
    model_version: MODEL_VERSION,
    score_type: "spor_toto_1x2",
    form: {
      home: {
        recent: item.recentForm.home,
        sample: Number(memoryHome.count || 0),
        wins: Number(memoryHome.wins || 0),
        draws: Number(memoryHome.draws || 0),
        losses: Number(memoryHome.losses || 0),
        ppg: Number(memoryHome.pointsPerGame || 0),
        goals_for_avg: Number(memoryHome.goalsForAvg || 0),
        goals_against_avg: Number(memoryHome.goalsAgainstAvg || 0),
      },
      away: {
        recent: item.recentForm.away,
        sample: Number(memoryAway.count || 0),
        wins: Number(memoryAway.wins || 0),
        draws: Number(memoryAway.draws || 0),
        losses: Number(memoryAway.losses || 0),
        ppg: Number(memoryAway.pointsPerGame || 0),
        goals_for_avg: Number(memoryAway.goalsForAvg || 0),
        goals_against_avg: Number(memoryAway.goalsAgainstAvg || 0),
      },
    },
    h2h: item.h2h,
    squad: item.squad,
  };
};

const validateBulletin = (bulletin) => {
  if (!bulletin || !Array.isArray(bulletin.matches)) throw new Error("Spor Toto bülteni geçersiz: matches yok");
  const invalid = bulletin.matches.filter((item) => !item.home || !item.away || !["1", "X", "2"].includes(item.decision));
  if (invalid.length) throw new Error(`Spor Toto bülteni geçersiz karar içeriyor: ${invalid.length}`);
  const badProbability = bulletin.matches.filter((item) => {
    const values = [item.probabilities?.["1"], item.probabilities?.X, item.probabilities?.["2"]].map(Number);
    const sum = values.reduce((a, b) => a + b, 0);
    return values.some((value) => !Number.isFinite(value)) || Math.abs(sum - 100) > 0.3;
  });
  if (badProbability.length) throw new Error(`Spor Toto olasılık toplamı hatalı: ${badProbability.length}`);
  return true;
};

const run = () => {
  const fixtures = readJson(fixturesPath, []);
  const sourceMatches = Array.isArray(fixtures) ? fixtures : [];
  const today = trDate(0);
  const tomorrow = trDate(1);
  const weekLabel = `${today} / ${trDate(6)}`;
  const sourceWindowMatches = sourceMatches.filter((fixture) => [today, tomorrow].includes(String(fixture.date || "").slice(0, 10)));
  const activeMatches = sortFixtures(filterActiveBulletinMatches(sourceWindowMatches));
  const eligibleMatches = activeMatches.filter(hasCompleteOneXTwo);
  const selected = applyCouponCoverage(selectBulletinMatches(eligibleMatches));
  const matches = selected.map((item, index) => normalizeOutput(item, index, weekLabel));
  const removedInactiveCount = countInactiveBulletinMatches(sourceWindowMatches);
  const totalColumns = matches.reduce((total, item) => total * Math.max(1, Number(item.column_multiplier || 1)), 1);
  const doubles = matches.filter((item) => Number(item.column_multiplier) === 2).length;
  const averageConfidence = matches.length ? Math.round(matches.reduce((sum, item) => sum + Number(item.confidence || 0), 0) / matches.length) : 0;
  const averageCompleteness = matches.length ? Math.round(matches.reduce((sum, item) => sum + Number(item.data_completeness || 0), 0) / matches.length) : 0;

  const bulletin = {
    generated_at: new Date().toISOString(),
    timezone: "Europe/Istanbul",
    source: "Futbol Laboratuvarı PRO 13 + Maçkolik 1-X-2 oranları + sonuç hafızası",
    official_bulletin: false,
    bulletin_note: "Bu alan resmî Spor Toto bülteni değildir; Futbol Laboratuvarı'nın güncel 15 maçlık 1-X-2 analiz çalışma listesidir.",
    engine_version: `spor-toto-pro-${MODEL_VERSION}`,
    week_label: weekLabel,
    total_source_matches: sourceWindowMatches.length,
    active_match_count: activeMatches.length,
    eligible_1x2_match_count: eligibleMatches.length,
    removed_finished_count: removedInactiveCount,
    removed_statuses: ["finished", "cancelled", "postponed"],
    match_count: matches.length,
    coupon: {
      total_columns: matches.length ? totalColumns : 0,
      single_count: matches.length - doubles,
      double_count: doubles,
      triple_count: 0,
      average_confidence: averageConfidence,
      average_data_completeness: averageCompleteness,
      unit_stake: null,
      estimated_cost: null,
      note: "Parasal maliyet için güncel resmî birim kolon bedeli ayrıca doğrulanmalıdır; sistem uydurma ücret göstermez.",
    },
    matches,
  };

  validateBulletin(bulletin);

  const rows = matches.map((match) =>
    `- ${match.no}. ${match.date} ${match.time || "--:--"} | ${match.home} - ${match.away} | ${match.selection} | Güven ${match.confidence}/100 | Risk ${match.risk} | Veri ${match.data_completeness}/100`
  ).join("\n");
  const report = `# Spor Toto PRO Bülten Raporu\n\n- Güncelleme: ${bulletin.generated_at}\n- Motor: ${bulletin.engine_version}\n- Ham bugün/yarın maç: ${sourceWindowMatches.length}\n- Aktif maç: ${activeMatches.length}\n- Tam 1-X-2 oranlı maç: ${eligibleMatches.length}\n- Analiz listesi: ${matches.length}\n- Çifte şans: ${doubles}\n- Toplam kolon: ${bulletin.coupon.total_columns}\n- Ortalama güven: ${averageConfidence}/100\n- Ortalama veri kapsama: ${averageCompleteness}/100\n- Not: ${bulletin.bulletin_note}\n\n${rows || "Uygun maç bekleniyor."}\n`;

  writeText(bulletinPath, `${JSON.stringify(bulletin, null, 2)}\n`);
  writeText(reportPath, report);
  console.log(`Spor Toto PRO rebuilt. Active=${activeMatches.length}, eligible=${eligibleMatches.length}, visible=${matches.length}, doubles=${doubles}, columns=${bulletin.coupon.total_columns}.`);
  return bulletin;
};

if (require.main === module) run();
module.exports = {
  run,
  buildScoredMatch,
  selectBulletinMatches,
  applyCouponCoverage,
  validateBulletin,
};
