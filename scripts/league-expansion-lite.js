const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data');

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function todayTR() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

function norm(value) {
  return String(value || '').toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

const countryWords = {
  turkey: ['turkiye', 'türkiye', 'super lig', 'süper lig', '1 lig', '2 lig', '3 lig', 'tff'],
  qatar: ['qatar', 'katar', 'stars league'],
  saudi_arabia: ['saudi', 'suudi', 'pro league', 'first division'],
  argentina: ['argentina', 'arjantin', 'primera division', 'primera nacional'],
  japan: ['japan', 'japonya', 'j1', 'j2', 'j3'],
  germany: ['germany', 'almanya', 'bundesliga', '3 liga'],
  england: ['england', 'ingiltere', 'premier league', 'championship', 'league one', 'league two'],
  spain: ['spain', 'ispanya', 'la liga', 'segunda', 'rfef'],
  italy: ['italy', 'italya', 'serie a', 'serie b', 'serie c'],
  france: ['france', 'fransa', 'ligue 1', 'ligue 2', 'national'],
  austria: ['austria', 'avusturya', 'austrian bundesliga'],
  australia: ['australia', 'avustralya', 'a league', 'npl']
};

function detectCountry(row, catalog) {
  const text = norm(`${row.league || row.competition_name || row.lig || ''} ${row.country || row.ulke || ''}`);
  for (const [key, words] of Object.entries(countryWords)) {
    if (words.some((word) => text.includes(word))) return key;
  }
  return catalog.countries?.[text] ? text : 'unknown';
}

function marketFocus(entry) {
  if (!entry) return ['veri_kontrol'];
  const focus = [];
  if (entry.high_scoring_watch) focus.push('KG Var', '2.5 Üst', '3.5 Üst');
  if ((entry.style_tags || []).includes('taktik') || (entry.style_tags || []).includes('kontrol')) focus.push('Alt risk kontrolü', 'İlk yarı tempo kontrolü');
  if ((entry.style_tags || []).includes('fizik')) focus.push('Kart/foul kontrolü');
  if ((entry.style_tags || []).includes('derbi_riski')) focus.push('Derbi risk kontrolü');
  return Array.from(new Set(focus.length ? focus : ['KG Var', '2.5 Üst']));
}

function buildLeagueExpansionSignals() {
  const catalog = readJson(path.join(dataDir, 'league-expansion-manual.json'), { countries: {} });
  const live = readJson(path.join(dataDir, 'live-matches.json'), { matches: [] }).matches || [];
  const analysis = readJson(path.join(dataDir, 'robot-analysis.json'), { matches: [] }).matches || [];
  const rows = live.length ? live : analysis;
  const matches = rows.map((row) => {
    const key = detectCountry(row, catalog);
    const entry = catalog.countries?.[key] || null;
    return {
      match_name: row.match_name || row.match || '-',
      league: row.league || row.competition_name || row.lig || '-',
      detected_country: key,
      country_name: entry?.country_name || 'Bilinmeyen',
      national_team: entry?.national_team || '-',
      upper_leagues: entry?.upper_leagues || [],
      lower_leagues: entry?.lower_leagues || [],
      major_clubs: entry?.major_clubs || [],
      goal_profile: entry?.goal_profile || 'unknown',
      high_scoring_watch: Boolean(entry?.high_scoring_watch),
      style_tags: entry?.style_tags || [],
      market_focus: marketFocus(entry),
      robot_note: entry?.robot_note || 'Lig genişleme kataloğunda kayıt yok.'
    };
  });
  const highScoringCountries = Object.values(catalog.countries || {})
    .filter((x) => x.high_scoring_watch)
    .map((x) => x.country_name);
  const output = {
    generated_at: new Date().toISOString(),
    date: todayTR(),
    country_count: Object.keys(catalog.countries || {}).length,
    match_count: matches.length,
    high_scoring_countries: highScoringCountries,
    countries: catalog.countries,
    matches
  };
  writeJson(path.join(dataDir, 'league-expansion-signals.json'), output);
  writeJson(path.join(dataDir, 'archive', `${todayTR()}-league-expansion.json`), output);
  console.log(`League expansion signals updated: ${matches.length} matches, ${highScoringCountries.length} high scoring country profiles.`);
}

if (require.main === module) buildLeagueExpansionSignals();
module.exports = { buildLeagueExpansionSignals, detectCountry, marketFocus };
