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

const impliedProbability = (odd) => {
  const parsed = parseOdd(odd);
  if (!parsed) return 0;
  return Math.min(92, Math.max(5, (1 / parsed) * 100));
};

const oddValue = (fixture, keys) => {
  for (const key of keys) {
    const value = parseOdd(fixture?.[key]);
    if (value) return value;
  }
  return null;
};

const safeTeam = (value, fallback) => String(value || fallback).trim();

const getTeams = (fixture) => ({
  home: safeTeam(fixture.home || fixture.home_team_name || fixture.ev_sahibi, "Ev sahibi"),
  away: safeTeam(fixture.away || fixture.away_team_name || fixture.deplasman, "Deplasman"),
});

const leagueSignal = (league = "") => {
  const text = String(league).toLowerCase();
  let goalBias = 0;
  let drawBias = 0;
  let riskBias = 0;

  if (/irlanda|norveç|norvec|isveç|isvec|finlandiya|izlanda|danimarka|hazırlık|hazirlik|kupa|npl/i.test(text)) {
    goalBias += 7;
    riskBias += 4;
  }

  if (/dünya|dunya|grup|premier|şampiyonluk|sampiyonluk/i.test(text)) {
    goalBias += 3;
  }

  if (/1\.lig|alt lig|ikinci|u19|u20|u21|youth|rezerv/i.test(text)) {
    riskBias += 6;
  }

  if (/irlanda|norveç|norvec|kuveyt/i.test(text)) {
    drawBias += 3;
  }

  return { goalBias, drawBias, riskBias };
};

const favoriteQualitySignal = (odd) => {
  const parsed = parseOdd(odd);
  if (!parsed) return { label: "Oran yok", delta: 0, risk: 4 };
  if (parsed >= 1.3 && parsed <= 1.7) {
    return { label: "Düşük oran alarmı: favori kalite kontrolü gerekir", delta: -4, risk: 8 };
  }
  if (parsed < 1.3) {
    return { label: "Aşırı düşük oran: değer zayıf olabilir", delta: -7, risk: 10 };
  }
  return { label: "Oran normal bölgede", delta: 0, risk: 0 };
};

const makeCandidate = (fixture, key, label, odd, baseBoost = 0) => {
  if (!odd) return null;
  const league = leagueSignal(fixture.league || fixture.competition_name || "");
  const favorite = key.startsWith("ms") ? favoriteQualitySignal(odd) : { label: "", delta: 0, risk: 0 };
  let confidence = impliedProbability(odd) + baseBoost + favorite.delta;

  if (key === "over25") confidence += league.goalBias;
  if (key === "draw") confidence += league.drawBias;
  if (key === "under25" && league.goalBias >= 7) confidence -= 6;

  confidence = Math.max(18, Math.min(86, Math.round(confidence)));

  const riskNumber = Math.max(0, Math.round((100 - confidence) + league.riskBias + favorite.risk));
  const risk = riskNumber >= 48 ? "Yüksek" : riskNumber >= 34 ? "Orta" : "Düşük";

  const signals = [
    `Oran: ${formatOdd(odd)}`,
    `Piyasa olasılığı: ${formatPercent(impliedProbability(odd))}`,
  ];

  if (key === "over25" && league.goalBias > 0) signals.push("Lig gol eğilimi destekliyor");
  if (key === "under25" && league.goalBias > 0) signals.push("Lig gol eğilimi nedeniyle alt seçeneği temkinli");
  if (key === "draw" && league.drawBias > 0) signals.push("Lig beraberlik kontrolü aktif");
  if (favorite.label) signals.push(favorite.label);

  return {
    key,
    label,
    odd,
    confidence,
    risk,
    riskNumber,
    signals,
  };
};

const getCandidates = (fixture) => {
  const one = oddValue(fixture, ["one", "oneOdd", "ms1", "odd1"]);
  const draw = oddValue(fixture, ["draw", "drawOdd", "x", "msx", "oddX"]);
  const two = oddValue(fixture, ["two", "twoOdd", "ms2", "odd2"]);
  const under25 = oddValue(fixture, ["under25", "alt25", "under", "alt"]);
  const over25 = oddValue(fixture, ["over25", "ust25", "over", "ust"]);
  const kgVar = oddValue(fixture, ["bttsYes", "kgVar", "varOdd", "var"]);
  const kgYok = oddValue(fixture, ["bttsNo", "kgYok", "yokOdd", "yok"]);

  return [
    makeCandidate(fixture, "ms1", "MS 1", one, 0),
    makeCandidate(fixture, "draw", "MS X", draw, 2),
    makeCandidate(fixture, "ms2", "MS 2", two, 0),
    makeCandidate(fixture, "under25", "2.5 Alt", under25, 1),
    makeCandidate(fixture, "over25", "2.5 Üst", over25, 2),
    makeCandidate(fixture, "kgVar", "KG Var", kgVar, 2),
    makeCandidate(fixture, "kgYok", "KG Yok", kgYok, 1),
  ].filter(Boolean);
};

const tagFor = (score, risk) => {
  if (risk === "Yüksek" || score < 60) return "Riskli";
  if (score >= 75) return "Güçlü";
  return "Değerli";
};

const expectedScoresFor = (selection) => {
  const text = String(selection || "").toLowerCase();
  if (text.includes("üst") || text.includes("kg var")) return ["2-1", "2-2"];
  if (text.includes("alt") || text.includes("kg yok")) return ["1-0", "1-1"];
  if (text.includes("ms 1")) return ["1-0", "2-1"];
  if (text.includes("ms 2")) return ["0-1", "1-2"];
  if (text.includes("x")) return ["1-1", "0-0"];
  return ["1-0", "2-1"];
};

const scoreFixture = (fixture, index = 0) => {
  const candidates = getCandidates(fixture).sort((a, b) => b.confidence - a.confidence || a.riskNumber - b.riskNumber);
  const best = candidates[0];
  const { home, away } = getTeams(fixture);
  const match = `${home} VS ${away}`;

  if (!best) {
    return {
      ...fixture,
      home,
      away,
      match,
      market: "Analiz bekleniyor",
      selection: "Analiz bekleniyor",
      odds: "-",
      confidence: "-",
      lab_probability: "-",
      trust_score: "-",
      tag: "Beklemede",
      expected_scores: [],
      score: 0,
      risk: "-",
      status: "waiting_for_odds",
      hasOdds: false,
      pro_signals: ["Oran verisi bekleniyor"],
    };
  }

  const rankBoost = Math.max(0, 3 - (index % 4));
  const score = Math.min(88, best.confidence + rankBoost);

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
    trust_score: `${Math.max(45, Math.min(90, Math.round(score - 13)))}/100`,
    tag: tagFor(score, best.risk),
    expected_scores: expectedScoresFor(best.label),
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
    .filter((item) => item.hasOdds && item.score >= 45)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12);

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

  for (let index = 0; index + 1 < ranked.length && doubles.length < 3; index += 2) {
    const pair = [ranked[index], ranked[index + 1]];
    const avg = Math.round(pair.reduce((sum, item) => sum + item.score, 0) / pair.length);
    doubles.push({
      match: pair.map((item) => item.match).join(" + "),
      market: pair.map((item) => item.market).join(" + "),
      odds: combinedOdds(pair),
      confidence: `${avg}%`,
      score: avg,
      risk: pair.some((item) => item.risk === "Yüksek") ? "Yüksek" : "Orta",
      tag: tagFor(avg, pair.some((item) => item.risk === "Yüksek") ? "Yüksek" : "Orta"),
      expected_scores: pair.flatMap((item) => item.expected_scores || []).slice(0, 4),
      signals: combinedSignals(pair, 5),
      legs: pair.map((item, legIndex) => legFromItem(item, legIndex + 1)),
    });
  }

  for (let index = 0; index + 2 < ranked.length && triples.length < 2; index += 3) {
    const trio = [ranked[index], ranked[index + 1], ranked[index + 2]];
    const avg = Math.round(trio.reduce((sum, item) => sum + item.score, 0) / trio.length);
    triples.push({
      match: trio.map((item) => item.match).join(" + "),
      market: trio.map((item) => item.market).join(" + "),
      odds: combinedOdds(trio),
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
