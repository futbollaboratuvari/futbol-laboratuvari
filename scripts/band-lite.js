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

function keyOf(name) {
  return String(name || '-').toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function readNumber(row, keys) {
  for (const key of keys) {
    const value = row?.[key] ?? row?.analysis?.[key] ?? row?.stats?.[key] ?? row?.band_extra?.[key];
    const number = Number(String(value || '').replace('%', '').replace(',', '.'));
    if (Number.isFinite(number) && String(value || '').trim() !== '') return number;
  }
  return null;
}

function readText(row, keys) {
  for (const key of keys) {
    const value = row?.[key] ?? row?.band_extra?.[key];
    if (value !== undefined && value !== null && value !== '') return String(value);
  }
  return '';
}

function byMatch(file) {
  const data = readJson(path.join(dataDir, file), { matches: [] });
  const out = {};
  for (const row of data.matches || []) out[keyOf(row.match_name || row.match)] = row;
  return out;
}

function mergeSignals(row, maps) {
  const key = keyOf(row.match_name || row.match || `${row.home || ''} VS ${row.away || ''}`);
  const status = maps.status[key] || {};
  const lineup = maps.lineup[key] || {};
  const homeAway = maps.homeAway[key] || {};
  const standing = maps.standing[key] || {};
  const league = maps.league[key] || {};
  return {
    ...row,
    band_extra: {
      squad_risk_level: status.squad_risk_level,
      lineup_risk_level: lineup.lineup_risk_level,
      home_edge: homeAway.home_edge,
      away_edge: homeAway.away_edge,
      momentum_difference: standing.momentum_difference,
      point_difference: standing.point_difference,
      goal_profile: league.goal_profile,
      high_scoring_watch: league.high_scoring_watch
    }
  };
}

function labelFor(row, bands) {
  const q = readNumber(row, ['odds', 'odd', 'price', 'oran']);
  const s = readNumber(row, ['analysis_score', 'score', 'confidence']);
  const missing = readNumber(row, ['data_missing_count']) || 0;
  const squad = readText(row, ['squad_risk_level', 'lineup_risk_level']).toLocaleLowerCase('tr-TR');
  const homeEdge = readNumber(row, ['home_edge']);
  const awayEdge = readNumber(row, ['away_edge']);
  const momentum = readNumber(row, ['momentum_difference']);
  const notes = [];
  let level = 'Düşük';

  if (q !== null && q <= bands.very_short && (s === null || s < bands.min_score_very_short)) {
    level = 'Yüksek';
    notes.push('Çok kısa bant, skor desteği güçlü değil.');
  } else if (q !== null && q <= bands.short && (s === null || s < bands.min_score_short)) {
    level = 'Orta';
    notes.push('Kısa bant, ek doğrulama gerekli.');
  }
  if (q !== null && q >= bands.long && missing >= 4) {
    level = level === 'Yüksek' ? 'Yüksek' : 'Orta';
    notes.push('Uzun bant ve veri eksiği birlikte görüldü.');
  }
  if (/yüksek|yuksek/.test(squad)) {
    level = 'Yüksek';
    notes.push('Kadro veya ilk 11 riski yüksek.');
  } else if (/orta/.test(squad) && level === 'Düşük') {
    level = 'Orta';
    notes.push('Kadro veya ilk 11 riski orta.');
  }
  if (q !== null && q <= bands.short && homeEdge !== null && awayEdge !== null && Math.abs(homeEdge - awayEdge) < 0.15) {
    level = level === 'Yüksek' ? 'Yüksek' : 'Orta';
    notes.push('Kısa bant var ama iç/dış saha farkı belirgin değil.');
  }
  if (q !== null && q <= bands.short && momentum !== null && Math.abs(momentum) < 3) {
    level = level === 'Yüksek' ? 'Yüksek' : 'Orta';
    notes.push('Kısa bant var ama momentum farkı zayıf.');
  }
  if (!notes.length) notes.push('Bant ile skor arasında belirgin çelişki yok.');
  return { q, s, level, notes };
}

function runBandLite() {
  const bands = readJson(path.join(dataDir, 'decision-bands.json'), { bands: {} }).bands || {};
  const maps = {
    status: byMatch('team-status-signals.json'),
    lineup: byMatch('lineup-signals.json'),
    homeAway: byMatch('home-away-performance.json'),
    standing: byMatch('standings-signals.json'),
    league: byMatch('league-expansion-signals.json')
  };
  const live = readJson(path.join(dataDir, 'live-matches.json'), { matches: [] }).matches || [];
  const analysis = readJson(path.join(dataDir, 'robot-analysis.json'), { matches: [] }).matches || [];
  const rows = live.length ? live : analysis;
  const matches = rows.map((row) => {
    const merged = mergeSignals(row, maps);
    return {
      match_name: row.match_name || row.match || '-',
      league: row.league || row.competition_name || '-',
      extra_used: merged.band_extra,
      band_check: labelFor(merged, bands)
    };
  });
  const output = {
    generated_at: new Date().toISOString(),
    match_count: matches.length,
    matches
  };
  writeJson(path.join(dataDir, 'band-signals.json'), output);
  console.log(`Band signals updated: ${matches.length}`);
}

if (require.main === module) runBandLite();
module.exports = { runBandLite, labelFor };