const fs = require("fs");
const path = require("path");
const { memoryFor, _internals, MODEL_VERSION } = require("./robot-exact-scoring");

const root = path.join(__dirname, "..");
const programPath = path.join(root, "data", "spor_toto_weekly_program.json");
const archivePath = path.join(root, "data", "robot_match_archive.json");
const outputPath = path.join(root, "data", "spor_toto_archive_analysis.json");
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
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const clean = (value) => String(value || "")
  .toLocaleLowerCase("tr-TR")
  .replace(/ı/g, "i")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .replace(/\s+/g, " ")
  .trim();
const normalize = (values) => {
  const nums = OPTIONS.map((option) => Math.max(0, Number(values?.[option]) || 0));
  const total = nums.reduce((a, b) => a + b, 0);
  if (!total) return null;
  const out = {};
  OPTIONS.forEach((option, index) => { out[option] = Number(((nums[index] / total) * 100).toFixed(1)); });
  out["1"] = Number((out["1"] + Number((100 - out["1"] - out.X - out["2"]).toFixed(1))).toFixed(1));
  return out;
};
const parseScore = (match) => {
  const home = Number(match?.homeScore ?? match?.home_score ?? match?.homeGoals ?? match?.home_goals);
  const away = Number(match?.awayScore ?? match?.away_score ?? match?.awayGoals ?? match?.away_goals);
  if (Number.isFinite(home) && Number.isFinite(away)) return { home, away };
  const found = String(match?.score || match?.result_score || "").match(/(\d+)\D+(\d+)/);
  return found ? { home: Number(found[1]), away: Number(found[2]) } : null;
};

const MANUAL_ALIASES = {
  "tümosan konyaspor": ["Konyaspor", "Konya"],
  "corendon alanyaspor": ["Alanyaspor", "Alanya"],
  "çaykur rizespor": ["Rizespor", "Rize", "Ç.Rizespor"],
  "başakşehir": ["Başakşehir", "Istanbul Basaksehir", "RAMS Başakşehir"],
  "amed": ["Amed", "Amed SK", "Amedspor"],
  "çorum fk": ["Çorum FK", "Çorum", "Arca Çorum FK"],
  "dortmund": ["Borussia Dortmund", "Dortmund"],
  "hamburg": ["Hamburg", "Hamburger SV"],
  "psg": ["Paris SG", "Paris Saint Germain", "PSG"],
  "paris sg": ["Paris SG", "Paris Saint Germain", "PSG"],
  "newcastle": ["Newcastle United", "Newcastle", "Newcastle Utd"],
  "atletico madrid": ["Atletico Madrid", "A. Madrid", "Atl. Madrid"],
  "inter": ["Inter", "Inter Milan", "Internazionale"],
};

function candidates(team) {
  const rows = [String(team || "").trim()];
  const stripped = String(team || "")
    .replace(/\b(Tümosan|Corendon|RAMS|Arca)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (stripped) rows.push(stripped);
  const key = clean(team);
  for (const [aliasKey, values] of Object.entries(MANUAL_ALIASES)) {
    if (key === clean(aliasKey) || key.includes(clean(aliasKey)) || clean(aliasKey).includes(key)) rows.push(...values);
  }
  return [...new Set(rows.filter(Boolean))];
}

function bestCanonical(team) {
  let best = { name: team, count: -1, profile: null };
  for (const name of candidates(team)) {
    const memory = memoryFor({ home: name, away: "__spor_toto_dummy__", league: "" }, { key: "ms1" });
    const count = Number(memory?.home?.count || 0);
    if (count > best.count) best = { name, count, profile: memory.home };
  }
  return best;
}

function resultCode(match, teamName) {
  const score = parseScore(match);
  if (!score) return null;
  const teamKey = clean(teamName);
  const homeKey = clean(match.home || match.home_team_name || match.ev_sahibi);
  const awayKey = clean(match.away || match.away_team_name || match.deplasman);
  if (teamKey !== homeKey && teamKey !== awayKey) return null;
  const gf = teamKey === homeKey ? score.home : score.away;
  const ga = teamKey === homeKey ? score.away : score.home;
  return gf > ga ? "W" : gf === ga ? "D" : "L";
}

function recentFor(archiveMatches, teamName, limit = 5) {
  const key = clean(teamName);
  return archiveMatches
    .filter((match) => clean(match.home || match.home_team_name || match.ev_sahibi) === key || clean(match.away || match.away_team_name || match.deplasman) === key)
    .map((match) => ({ match, code: resultCode(match, teamName) }))
    .filter((row) => row.code)
    .slice(-limit)
    .map((row) => row.code);
}

function h2hFor(archiveMatches, homeName, awayName, limit = 5) {
  const homeKey = clean(homeName); const awayKey = clean(awayName);
  return archiveMatches
    .filter((match) => {
      const h = clean(match.home || match.home_team_name || match.ev_sahibi);
      const a = clean(match.away || match.away_team_name || match.deplasman);
      return (h === homeKey && a === awayKey) || (h === awayKey && a === homeKey);
    })
    .map((match) => {
      const score = parseScore(match);
      if (!score) return null;
      return {
        date: String(match.date || match.tarih || match.utc_date || "").slice(0, 10),
        home: match.home || match.home_team_name || match.ev_sahibi || "",
        away: match.away || match.away_team_name || match.deplasman || "",
        score: `${score.home}-${score.away}`,
      };
    })
    .filter(Boolean)
    .slice(-limit);
}

function publicDistribution(match) {
  return normalize(match.public_distribution || {});
}

function blendArchivePublic(archiveProbabilities, publicProbabilities, reliability) {
  if (!archiveProbabilities) return publicProbabilities;
  if (!publicProbabilities) return archiveProbabilities;
  const archiveWeight = clamp(0.62 + (reliability * 0.18), 0.62, 0.8);
  const publicWeight = 1 - archiveWeight;
  return normalize(Object.fromEntries(OPTIONS.map((option) => [option, archiveProbabilities[option] * archiveWeight + publicProbabilities[option] * publicWeight])));
}

function buildOne(programMatch, archiveMatches) {
  const homeCanonical = bestCanonical(programMatch.home);
  const awayCanonical = bestCanonical(programMatch.away);
  const fixture = {
    date: programMatch.date,
    time: programMatch.time,
    league: programMatch.league || "Spor Toto",
    home: homeCanonical.name,
    away: awayCanonical.name,
  };
  const memory = memoryFor(fixture, { key: "ms1" });
  const poisson = _internals.poissonProbabilities(fixture, memory, { leagueGoalAverage: Number(memory?.league?.goalAverage || 0) });
  const archiveProbabilities = poisson ? normalize({ "1": poisson.probabilities.ms1, X: poisson.probabilities.msx, "2": poisson.probabilities.ms2 }) : null;
  const publicProbabilities = publicDistribution(programMatch);
  const minSample = Math.min(Number(memory?.home?.count || 0), Number(memory?.away?.count || 0));
  const archiveReady = Boolean(archiveProbabilities && minSample >= 3);
  const reliability = poisson ? Number(poisson.reliability || 0) : 0;
  const probabilities = archiveReady ? blendArchivePublic(archiveProbabilities, publicProbabilities, reliability) : publicProbabilities;
  const order = probabilities ? [...OPTIONS].sort((a, b) => probabilities[b] - probabilities[a]) : [];
  const gap = order.length >= 2 ? Number((probabilities[order[0]] - probabilities[order[1]]).toFixed(1)) : null;
  let agreement = null;
  if (archiveProbabilities && publicProbabilities) {
    agreement = Number((100 - OPTIONS.reduce((sum, option) => sum + Math.abs(archiveProbabilities[option] - publicProbabilities[option]), 0) / 2).toFixed(1));
  }
  const confidence = archiveReady
    ? Math.round(clamp(54 + Math.min(12, minSample) * 1.3 + Math.max(0, Number(agreement || 50) - 50) * 0.12 + Math.min(18, Number(gap || 0)) * 0.45, 56, 82))
    : probabilities ? Math.round(clamp(45 + Math.min(18, Number(gap || 0)) * 0.35, 45, 54)) : 0;
  const completeness = archiveReady
    ? Math.round(clamp(48 + Math.min(20, Number(memory.home.count || 0) + Number(memory.away.count || 0)) * 1.6 + (memory.league?.count ? 8 : 0), 52, 92))
    : probabilities ? 28 : 0;
  return {
    no: programMatch.no,
    date: programMatch.date,
    time: programMatch.time,
    league: programMatch.league || "Spor Toto",
    home: programMatch.home,
    away: programMatch.away,
    canonical_home: homeCanonical.name,
    canonical_away: awayCanonical.name,
    archive_ready: archiveReady,
    public_distribution_ready: Boolean(publicProbabilities),
    probabilities,
    archive_probabilities: archiveProbabilities,
    public_distribution: publicProbabilities,
    probability_basis: archiveReady ? "archive_poisson_plus_public_distribution" : publicProbabilities ? "cross_verified_public_distribution" : "waiting",
    confidence,
    data_completeness: completeness,
    probability_gap: gap,
    agreement_score: agreement,
    poisson: poisson ? { home_lambda: poisson.homeLambda, away_lambda: poisson.awayLambda, samples: poisson.samples, reliability: poisson.reliability } : null,
    form: {
      home: { ...memory.home, recent: recentFor(archiveMatches, homeCanonical.name, 5) },
      away: { ...memory.away, recent: recentFor(archiveMatches, awayCanonical.name, 5) },
    },
    h2h: h2hFor(archiveMatches, homeCanonical.name, awayCanonical.name, 5),
  };
}

function run() {
  const program = readJson(programPath, null);
  const archive = readJson(archivePath, null);
  if (!program || !Array.isArray(program.matches) || program.matches.length !== 15) throw new Error("Spor Toto haftalık programı 15 maç değil");
  if (!archive || !Array.isArray(archive.matches)) throw new Error("Robot sonuç arşivi okunamadı");
  const matches = program.matches.map((match) => buildOne(match, archive.matches));
  const output = {
    generated_at: new Date().toISOString(),
    timezone: "Europe/Istanbul",
    source: "Futbol Laboratuvarı gerçek sonuç arşivi + haftalık Spor Toto oynanma dağılımı",
    model_version: `${MODEL_VERSION}-weekly-archive`,
    week_label: program.week_label,
    archive_match_count: archive.matches.length,
    archive_ready_count: matches.filter((match) => match.archive_ready).length,
    public_distribution_count: matches.filter((match) => match.public_distribution_ready).length,
    analysis_available_count: matches.filter((match) => match.probabilities).length,
    matches,
  };
  writeJson(outputPath, output);
  console.log(`Spor Toto archive analysis: archive=${output.archive_ready_count}/15, distribution=${output.public_distribution_count}/15, available=${output.analysis_available_count}/15.`);
  return output;
}

if (require.main === module) run();
module.exports = { run, buildOne, blendArchivePublic, candidates };
