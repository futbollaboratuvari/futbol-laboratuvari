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

function readNumber(row, keys) {
  for (const key of keys) {
    const value = row?.[key] ?? row?.analysis?.[key] ?? row?.stats?.[key];
    const number = Number(String(value || '').replace(',', '.'));
    if (Number.isFinite(number) && String(value || '').trim() !== '') return number;
  }
  return null;
}

function labelFor(row, bands) {
  const q = readNumber(row, ['odds', 'odd', 'price', 'oran']);
  const s = readNumber(row, ['analysis_score', 'score', 'confidence']);
  const missing = readNumber(row, ['data_missing_count']) || 0;
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
  if (!notes.length) notes.push('Bant ile skor arasında belirgin çelişki yok.');
  return { q, s, level, notes };
}

function runBandLite() {
  const bands = readJson(path.join(dataDir, 'decision-bands.json'), { bands: {} }).bands || {};
  const live = readJson(path.join(dataDir, 'live-matches.json'), { matches: [] }).matches || [];
  const analysis = readJson(path.join(dataDir, 'robot-analysis.json'), { matches: [] }).matches || [];
  const rows = live.length ? live : analysis;
  const matches = rows.map((row) => ({
    match_name: row.match_name || row.match || '-',
    league: row.league || row.competition_name || '-',
    band_check: labelFor(row, bands)
  }));
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
