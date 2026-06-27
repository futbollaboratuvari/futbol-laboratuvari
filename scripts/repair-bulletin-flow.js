const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data');
const fullBulletinFile = path.join(dataDir, 'full-bulletin.json');
const cacheFile = path.join(dataDir, 'full-bulletin-cache.json');
const healthFile = path.join(dataDir, 'full-bulletin-health.json');

function readJson(file, fallback) {
  try {
    const text = fs.readFileSync(file, 'utf8').trim();
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function trToday() {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date()).reduce((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value;
    return acc;
  }, {});
  return `${p.year}-${p.month}-${p.day}`;
}

function countOdds(match) {
  const odds = match?.available_odds || match?.odds || {};
  return Object.values(odds).filter((v) => v !== null && v !== undefined && v !== '' && v !== '-').length;
}

function normalise(payload, sourceNote) {
  const matches = Array.isArray(payload?.matches) ? payload.matches : [];
  const liveMatches = Array.isArray(payload?.live_matches) ? payload.live_matches : [];
  const scheduled = matches.filter((m) => String(m.status || m.liveStatus || 'scheduled').toLowerCase() === 'scheduled');
  const live = liveMatches.filter((m) => String(m.status || m.liveStatus || '').toLowerCase() === 'live');
  const finished = [...matches, ...liveMatches].filter((m) => String(m.status || m.liveStatus || '').toLowerCase() === 'finished');
  return {
    ...payload,
    generated_at: new Date().toISOString(),
    timezone: payload?.timezone || 'Europe/Istanbul',
    source: sourceNote || payload?.source || 'Futbol Laboratuvarı bülten akışı',
    status: matches.length || liveMatches.length ? 'active' : 'waiting',
    message: matches.length || liveMatches.length ? '' : 'Tam iddaa bulteni icin guncel mac verisi henuz olusmadi.',
    match_count: matches.length,
    live_count: live.length,
    scheduled_count: scheduled.length,
    finished_count: finished.length,
    wide_market_odds_count: matches.reduce((sum, m) => sum + countOdds(m), 0),
    matches,
    live_matches: liveMatches
  };
}

function hasMatches(payload) {
  return Array.isArray(payload?.matches) && payload.matches.length > 0;
}

function usableForToday(payload) {
  const today = trToday();
  if (!hasMatches(payload)) return false;
  if (payload?.date_window?.main_day === today) return true;
  return payload.matches.some((m) => String(m.date || '').slice(0, 10) >= today);
}

function writeHealth(status, bulletin, notes) {
  const matches = Array.isArray(bulletin?.matches) ? bulletin.matches : [];
  const liveMatches = Array.isArray(bulletin?.live_matches) ? bulletin.live_matches : [];
  writeJson(healthFile, {
    generated_at: new Date().toISOString(),
    status,
    source_status: bulletin?.status || 'missing',
    full_bulletin_exists: Boolean(bulletin),
    match_count: matches.length,
    early_match_count: matches.filter((m) => /^0[0-7]:/.test(String(m.time || ''))).length,
    live_match_count: liveMatches.length,
    first_match: matches[0] || null,
    date_window: bulletin?.date_window || null,
    notes
  });
}

const current = readJson(fullBulletinFile, null);
const cached = readJson(cacheFile, null);

if (usableForToday(current)) {
  const fixed = normalise(current, current.source || 'Futbol Laboratuvarı bülten akışı');
  writeJson(fullBulletinFile, fixed);
  writeJson(cacheFile, fixed);
  writeHealth('pass', fixed, ['full-bulletin.json aktif veri uretti.', 'Bulten cache dosyasi guncellendi.']);
  console.log(`Bulletin flow OK. Matches: ${fixed.match_count}`);
} else if (usableForToday(cached)) {
  const fixed = normalise(cached, 'Son saglam futbol bulteni yedegi');
  fixed.repair_note = 'Ana kaynak bos dondugu icin bugunun son saglam bulten yedegi yayinda tutuldu.';
  writeJson(fullBulletinFile, fixed);
  writeHealth('pass', fixed, ['Ana kaynak bos dondu.', 'Son saglam bulten yedegi full-bulletin.json dosyasina geri yazildi.']);
  console.log(`Bulletin flow repaired from cache. Matches: ${fixed.match_count}`);
} else {
  const empty = normalise(current || {}, 'Tam bulten verisi bekleniyor');
  writeHealth('waiting', empty, ['full-bulletin.json henuz mac listesi uretmedi.', 'Kullanilabilir gunluk bulten yedegi bulunamadi.']);
  console.log('Bulletin flow waiting. No usable source or cache.');
}
