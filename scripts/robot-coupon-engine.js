const scoreFixture = (fixture, index = 0) => {
  const league = `${fixture.league || ""}`.toLowerCase();
  const teams = `${fixture.home || ""} ${fixture.away || ""}`.toLowerCase();
  const hour = Number(String(fixture.time || "00:00").slice(0, 2)) || 0;
  let score = 58;
  let market = "1X / Çifte Şans";
  let risk = "Orta";

  if (/irlanda|norveç|isveç|finlandiya|izlanda|danimarka|hollanda|belçika|hazırlık|kupa/i.test(league)) {
    score += 10;
    market = "2.5 Üst Adayı";
  }

  if (/premier|şampiyonluk|kupası|dünya|grup/i.test(league)) {
    score += 5;
    market = market === "1X / Çifte Şans" ? "KG Var Adayı" : market;
  }

  if (/ii|u19|u20|u21|youth|rezerv/i.test(teams)) {
    score += 4;
    market = "KG Var Adayı";
    risk = "Yüksek";
  }

  if (hour >= 20 && hour <= 23) score += 3;
  score += Math.max(0, 4 - (index % 5));
  score = Math.min(score, 78);

  if (score < 65) risk = "Yüksek";

  return {
    ...fixture,
    match: `${fixture.home} - ${fixture.away}`,
    market,
    confidence: `${score}%`,
    score,
    risk,
  };
};

const buildCouponAnalysis = (fixtures = []) => {
  const ranked = fixtures.map(scoreFixture).sort((a, b) => b.score - a.score).slice(0, 9);
  const singles = ranked.slice(0, 6).map((item) => [item.match, item.market, item.confidence, item.risk]);
  const doubles = [];
  const triples = [];

  for (let index = 0; index + 1 < ranked.length && doubles.length < 3; index += 2) {
    const pair = [ranked[index], ranked[index + 1]];
    const avg = Math.round(pair.reduce((sum, item) => sum + item.score, 0) / pair.length);
    doubles.push([
      pair.map((item) => item.match).join(" + "),
      pair.map((item) => item.market).join(" + "),
      `${avg}%`,
      pair.some((item) => item.risk === "Yüksek") ? "Yüksek" : "Orta",
    ]);
  }

  for (let index = 0; index + 2 < ranked.length && triples.length < 2; index += 3) {
    const trio = [ranked[index], ranked[index + 1], ranked[index + 2]];
    const avg = Math.round(trio.reduce((sum, item) => sum + item.score, 0) / trio.length);
    triples.push([
      trio.map((item) => item.match).join(" + "),
      trio.map((item) => item.market).join(" + "),
      `${avg}%`,
      "Yüksek",
    ]);
  }

  return { ranked, singles, doubles, triples };
};

module.exports = { scoreFixture, buildCouponAnalysis };
