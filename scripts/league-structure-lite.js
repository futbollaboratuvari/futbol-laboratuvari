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

function detectCountry(row, countries) {
  const text = norm(`${row.league || row.competition_name || row.lig || ''} ${row.country || row.ulke || ''}`);
  const map = {
    japan: ['japan', 'japonya', 'j1', 'j2', 'j3'],
    germany: ['germany', 'almanya', 'bundesliga', '2 bundesliga', '3 liga'],
    italy: ['italy', 'italya', 'serie a', 'serie b', 'serie c'],
    england: ['england', 'ingiltere', 'premier league', 'championship', 'league one', 'league two'],
    france: ['france', 'fransa', 'ligue 1', 'ligue 2'],
    spain: ['spain', 'ispanya', 'la liga', 'segunda', 'rfef'],
    austria: ['austria', 'avusturya', 'austrian bundesliga', '2 liga'],
    australia: ['australia', 'avustralya', 'a league', 'npl']
  };
  for (const key of Object.keys(map)) {
    if (map[key].some((word) => text.includes(word))) return key;
  }
  return countries[text] ? text : 'unknown';
}

function tendencyScore(tendency) {
  if (tendency === 'yuksek') return 80;
  if (tendency === 'orta_yuksek') return 68;
  if (tendency === 'orta') return 55;
  if (tendency === 'dusuk') return 40;
  return 50;
}

function buildLeagueAdvice(structure) {
  if (!structure) return 'Lig yapısı henüz tanımlı değil. Veri riski yüksek.';
  const tags = structure.style_tags || [];
  const parts = [];
  if (tags.includes('tempo') || tags.includes('pres')) parts.push('tempo ve pres kontrol edilmeli');
  if (tags.includes('gollu')) parts.push('üst/KG marketleri öncelikli izlenebilir');
  if (tags.includes('taktik') || tags.includes('kontrol')) parts.push('düşük tempo ve kontrollü oyun riski var');
  if (tags.includes('fizik')) parts.push('kart/faul ve kadro yorgunluğu takip edilmeli');
  if (tags.includes('uzak_lig')) parts.push('veri tazeliği ve saat farkı kontrol edilmeli');
  return parts.length ? parts.join(' | ') : 'Lig karakteri için ek veri toplanmalı.';
}

function buildLeagueStructureSignals() {
  const manual = readJson(path.join(dataDir, 'league-structure-manual.json'), { countries: {} });
  const countries = manual.countries || {};
  const live = readJson(path.join(dataDir, 'live-matches.json'), { matches: [] }).matches || [];
  const analysis = readJson(path.join(dataDir, 'robot-analysis.json'), { matches: [] }).matches || [];
  const rows = live.length ? live : analysis;
  const matches = rows.map((row) => {
    const countryKey = detectCountry(row, countries);
    const structure = countries[countryKey] || null;
    const score = structure ? tendencyScore(structure.goal_tendency) : 50;
    return {
      match_name: row.match_name || row.match || '-',
      league: row.league || row.competition_name || row.lig || '-',
      detected_country: countryKey,
      country_name: structure?.country_name || 'Bilinmeyen',
      main_leagues: structure?.main_leagues || [],
      calendar_type: structure?.calendar_type || 'unknown',
      style_tags: structure?.style_tags || [],
      goal_tendency: structure?.goal_tendency || 'unknown',
      league_goal_tendency_score: score,
      risk_note: structure?.risk_note || 'Lig yapısı tanımlanmadı.',
      robot_comment: buildLeagueAdvice(structure)
    };
  });
  const output = {
    generated_at: new Date().toISOString(),
    date: todayTR(),
    country_count: Object.keys(countries).length,
    match_count: matches.length,
    countries,
    matches
  };
  writeJson(path.join(dataDir, 'league-structure-signals.json'), output);
  writeJson(path.join(dataDir, 'archive', `${todayTR()}-league-structure.json`), output);
  console.log(`League structure signals updated: ${matches.length} matches, ${Object.keys(countries).length} countries.`);
}

if (require.main === module) buildLeagueStructureSignals();
module.exports = { buildLeagueStructureSignals, detectCountry, tendencyScore };
