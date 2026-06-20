const parseOdd = (value) => {
  if (value === undefined || value === null || value === "" || value === "-") return null;
  const number = Number(String(value).replace(",", "."));
  return Number.isFinite(number) && number > 1 ? number : null;
};

const formatOdd = (value) => {
  const odd = parseOdd(value);
  return odd ? odd.toFixed(2) : "-";
};

const formatPercent = (value) => `${Math.round(value)}%`;

const formatTurkeyDate = (date = new Date()) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const impliedProbability = (odd) => {
  const parsed = parseOdd(odd);
  if (!parsed) return 0;
  return Math.min(92, Math.max(5, (1 / parsed) * 100));
};

const oddValue = (fixture, keys) => {
  for (const key of keys) {
    const value = parseOdd(fixture?.[key] ?? fixture?.odds?.[key]);
    if (value) return value;
  }
  return null;
};

const safeTeam = (value, fallback) => String(value || fallback).trim();

const getTeams = (fixture) => ({
  home: safeTeam(fixture.home || fixture.home_team_name || fixture.ev_sahibi, "Ev sahibi"),
  away: safeTeam(fixture.away || fixture.away_team_name || fixture.deplasman, "Deplasman"),
});

const isCurrentFixture = (fixture) => {
  const date = String(fixture.date || fixture.tarih || fixture.utc_date || "").slice(0, 10);
  if (!date) return false;
  return date >= formatTurkeyDate();
};

const leagueSignal = (league = "") => {
  const text = String(league).toLowerCase();
  let goalBias = 0;
  let riskBias = 0;

  if (/irlanda|norveç|norvec|isveç|isvec|finlandiya|izlanda|danimarka|hazırlık|hazirlik|kupa|npl|u19|u20|u21|rezerv|youth/i.test(text)) {
    goalBias += 8;
    riskBias += 5;
  }

  if (/premier|championship|super|süper|1\.lig|grup|dünya|dunya/i.test(text)) {
    goalBias += 3;
  }

  if (/alt lig|ikinci|amatör|amator/i.test(text)) {
    riskBias += 6;
  }

  return { goalBias, riskBias };
};

const marketRules = {
  firstHalfBttsYes: {
    label: "İlk Yarı KG Var",
    keys: ["firstHalfBttsYes", "iyKgVar", "iy_kg_var", "first_half_btts_yes"],
    minOdd: 1.85,
    maxOdd: 5.50,
    boost: 15,
    riskAdd: 10,
    scores: ["1-1", "2-1"],
    signals: ["İlk yarı gol değişimi marketi", "Yüksek oran bölgesi kontrol edildi"],
  },
  secondHalfBttsYes: {
    label: "İkinci Yarı KG Var",
    keys: ["secondHalfBttsYes", "ikinciYariKgVar", "ikinci_yari_kg_var", "second_half_btts_yes"],
    minOdd: 1.75,
    maxOdd: 5.25,
    boost: 16,
    riskAdd: 8,
    scores: ["2-1", "2-2"],
    signals: ["İkinci yarı tempo marketi", "Maç sonu gol ihtimali kontrol edildi"],
  },
  kgVar: {
    label: "KG Var",
    keys: ["bttsYes", "kgVar", "varOdd", "var", "kg_var"],
    minOdd: 1.60,
    maxOdd: 3.80,
    boost: 14,
    riskAdd: 4,
    scores: ["1-1", "2-1", "2-2"],
    signals: ["İki takım gol ihtimali marketi", "Düşük oran filtresinden geçti"],
  },
  over25: {
    label: "2.5 Üst",
    keys: ["over25", "ust25", "over", "ust", "ust_25"],
    minOdd: 1.58,
    maxOdd: 3.20,
    boost: 13,
    riskAdd: 3,
    scores: ["2-1", "3-1", "2-2"],
    signals: ["Ana gol üst marketi", "Değer oran filtresinden geçti"],
  },
  over35: {
    label: "3.5 Üst",
    keys: ["over35", "ust35", "over3_5", "ust_35"],
    minOdd: 1.90,
    maxOdd: 5.80,
    boost: 14,
    riskAdd: 12,
    scores: ["3-1", "2-2", "3-2"],
    signals: ["Yüksek gol üst marketi", "Yüksek oran / yüksek risk dengesi kontrol edildi"],
  },
};

const riskFromScore = (score, odd, riskAdd, riskBias) => {
  const riskNumber = Math.max(0, Math.round((100 - score) + riskAdd + riskBias + (odd >= 3.5 ? 8 : 0)));
  if (riskNumber >= 56) return { risk: "Yüksek", riskNumber };
  if (riskNumber >= 38) return { risk: "Orta", riskNumber };
  return { risk: "Düşük", riskNumber };
};

const makeCandidate = (fixture, key, rule) => {
  const odd = oddValue(fixture, rule.keys);
  if (!odd) return null;
  if (odd < rule.minOdd || odd > rule.maxOdd) return null;

  const league = leagueSignal(fixture.league || fixture.competition_name || "");
  const implied = impliedProbability(odd);
  const valuePremium = Math.min(18, Math.max(0, (odd - rule.minOdd) * 7));
  let score = implied + rule.boost + league.goalBias + valuePremium;

  if (key === "over35" && league.goalBias < 4) score -= 4;
  if (key === "firstHalfBttsYes" && odd < 2.00) score -= 3;
  if (key === "secondHalfBttsYes" && odd < 1.90) score -= 2;

  score = Math.max(42, Math.min(88, Math.round(score)));
  if (score < 56) return null;

  const risk = riskFromScore(score, odd, rule.riskAdd, league.riskBias);
  const signals = [
    `Market: ${rule.label}`,
    `Oran: ${formatOdd(odd)}`,
    `Piyasa olasılığı: ${formatPercent(implied)}`,
    `Değer skoru: ${score}/100`,
    ...rule.signals,
  ];

  if (league.goalBias > 0) signals.push("Lig gol eğilimi pozitif sinyal verdi");
  if (odd < rule.minOdd) signals.push("Düşük oran filtresine takıldı");

  return {
    key,
    label: rule.label,
    odd,
    confidence: score,
    risk: risk.risk,
    riskNumber: risk.riskNumber,
    expected_scores: rule.scores,
    signals,
  };
};

const getCandidates = (fixture) => Object.entries(marketRules)
  .map(([key, rule]) => makeCandidate(fixture, key, rule))
  .filter(Boolean)
  .sort((a, b) => b.confidence - a.confidence || a.riskNumber - b.riskNumber || b.odd - a.odd);

const tagFor = (score, risk) => {
  if (risk === "Yüksek" && score < 68) return "Riskli Değer";
  if (score >= 76) return "Yüksek Değer";
  if (score >= 66) return "Değerli";
  return "Takip";
};

const expectedScoresFor = (selection, fallback = []) => {
  if (Array.isArray(fallback) && fallback.length) return fallback;
  const text = String(selection || "").toLowerCase();
  if (text.includes("ilk yarı") || text.includes("kg var")) return ["1-1", "2-1"];
  if (text.includes("3.5")) return ["3-1", "2-2"];
  if (text.includes("2.5")) return ["2-1", "3-1"];
  return ["2-1", "2-2"];
};

const scoreFixture = (fixture, index = 0) => {
  const { home, away } = getTeams(fixture);
  const match = `${home} VS ${away}`;

  if (!isCurrentFixture(fixture)) {
    return {
      ...fixture,
      home,
      away,
      match,
      market: "Güncel maç değil",
      selection: "Güncel maç değil",
      odds: "-",
      confidence: "-",
      lab_probability: "-",
      trust_score: "-",
      tag: "Elenmiş",
      expected_scores: [],
      score: 0,
      risk: "-",
      status: "filtered_old_fixture",
      hasOdds: false,
      pro_signals: ["Eski tarihli maç elendi"],
    };
  }

  const candidates = getCandidates(fixture);
  const best = candidates[0];

  if (!best) {
    return {
      ...fixture,
      home,
      away,
      match,
      market: "Değerli market yok",
      selection: "Değerli market yok",
      odds: "-",
      confidence: "-",
      lab_probability: "-",
      trust_score: "-",
      tag: "Elenmiş",
      expected_scores: [],
      score: 0,
      risk: "-",
      status: "filtered_no_value_market",
      hasOdds: false,
      pro_signals: ["Düşük oran veya eksik veri nedeniyle elendi", "Çifte şans kullanılmadı"],
    };
  }

  const rankBoost = Math.max(0, 3 - (index % 4));
  const score = Math.min(90, best.confidence + rankBoost);

  return {
    ...fixture,
    home,
    away,
    match,
    market: best.label,
    selection: best.label,
    odds: formatOdd(best.odd),
    confidence: formatPercent(score),
    lab_probability: formatPercent(score),
    trust_score: `${Math.max(50, Math.min(92, Math.round(score - 9)))}/100`,
    tag: tagFor(score, best.risk),
    expected_scores: expectedScoresFor(best.label, best.expected_scores),
    score,
    risk: best.risk,
    status: fixture.status || "scheduled",
    hasOdds: true,
    pro_signals: best.signals,
  };
};

const legFromItem = (item, number = 1) => ({
  number,
  home: item.home,
  away: item.away,
  match: item.match,
  date: item.date || "",
  time: item.time || "",
  league: item.league || item.competition_name || "",
  selection: item.selection || item.market,
  option: item.selection || item.market,
  odds: item.odds,
  lab_probability: item.lab_probability || item.confidence,
  confidence: item.confidence,
  trust_score: item.trust_score,
  risk: item.risk,
  tag: item.tag,
  expected_scores: item.expected_scores || [],
  signals: item.pro_signals || [],
});

const combinedOdds = (items) => {
  const product = items.reduce((acc, item) => {
    const odd = parseOdd(item.odds);
    return odd ? acc * odd : acc;
  }, 1);
  return product > 1 ? product.toFixed(2) : "-";
};

const combinedSignals = (items, limit = 6) => items.flatMap((item) => item.pro_signals || []).slice(0, limit);

const buildCouponAnalysis = (fixtures = []) => {
  const scored = fixtures.map(scoreFixture);
  const ranked = scored
    .filter((item) => item.hasOdds && item.score >= 56)
    .sort((a, b) => b.score - a.score || parseOdd(b.odds) - parseOdd(a.odds))
    .slice(0, 14);

  const singles = ranked.slice(0, 6).map((item) => ({
    match: item.match,
    market: item.market,
    odds: item.odds,
    confidence: item.confidence,
    score: item.score,
    risk: item.risk,
    tag: item.tag,
    expected_scores: item.expected_scores,
    signals: item.pro_signals,
    legs: [legFromItem(item, 1)],
  }));

  const doubles = [];
  const triples = [];
  const mediumPlus = ranked.filter((item) => parseOdd(item.odds) >= 1.60);

  for (let index = 0; index + 1 < mediumPlus.length && doubles.length < 3; index += 2) {
    const pair = [mediumPlus[index], mediumPlus[index + 1]];
    const avg = Math.round(pair.reduce((sum, item) => sum + item.score, 0) / pair.length);
    const totalOdd = parseOdd(combinedOdds(pair));
    if (!totalOdd || totalOdd < 2.40) continue;
    doubles.push({
      match: pair.map((item) => item.match).join(" + "),
      market: pair.map((item) => item.market).join(" + "),
      odds: totalOdd.toFixed(2),
      confidence: `${avg}%`,
      score: avg,
      risk: pair.some((item) => item.risk === "Yüksek") ? "Yüksek" : "Orta",
      tag: tagFor(avg, pair.some((item) => item.risk === "Yüksek") ? "Yüksek" : "Orta"),
      expected_scores: pair.flatMap((item) => item.expected_scores || []).slice(0, 4),
      signals: combinedSignals(pair, 5),
      legs: pair.map((item, legIndex) => legFromItem(item, legIndex + 1)),
    });
  }

  for (let index = 0; index + 2 < mediumPlus.length && triples.length < 2; index += 3) {
    const trio = [mediumPlus[index], mediumPlus[index + 1], mediumPlus[index + 2]];
    const avg = Math.round(trio.reduce((sum, item) => sum + item.score, 0) / trio.length);
    const totalOdd = parseOdd(combinedOdds(trio));
    if (!totalOdd || totalOdd < 3.20) continue;
    triples.push({
      match: trio.map((item) => item.match).join(" + "),
      market: trio.map((item) => item.market).join(" + "),
      odds: totalOdd.toFixed(2),
      confidence: `${avg}%`,
      score: avg,
      risk: "Yüksek",
      tag: tagFor(avg, "Yüksek"),
      expected_scores: trio.flatMap((item) => item.expected_scores || []).slice(0, 6),
      signals: combinedSignals(trio, 6),
      legs: trio.map((item, legIndex) => legFromItem(item, legIndex + 1)),
    });
  }

  return { scored, ranked, singles, doubles, triples };
};

module.exports = { scoreFixture, buildCouponAnalysis };
