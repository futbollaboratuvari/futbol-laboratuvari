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

function clean(value) {
  return String(value || '').toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function teams(row) {
  const name = String(row.match_name || row.match || '');
  const parts = name.includes(' VS ') ? name.split(' VS ') : [];
  return {
    home: String(row.home || row.home_team_name || row.ev_sahibi || parts[0] || 'Home').trim(),
    away: String(row.away || row.away_team_name || row.deplasman || parts[1] || 'Away').trim()
  };
}

function emptyTeam() {
  return {
    formation: '',
    starting_11: [],
    substitutes: [],
    unavailable: [],
    note: '',
    source_note: ''
  };
}

function teamLineup(teamName, db) {
  return db.teams?.[teamName] || db.teams?.[clean(teamName)] || emptyTeam();
}

function uniquePlayers(...lists) {
  const map = new Map();
  for (const player of lists.flat().filter(Boolean)) {
    const row = typeof player === 'string' ? { name: player } : player;
    const key = String(row.id || clean(row.name || row.player));
    if (!key) continue;
    map.set(key, { ...(map.get(key) || {}), ...row, name: String(row.name || row.player || '').trim() });
  }
  return [...map.values()];
}

function structuredUnavailable(record) {
  return uniquePlayers(record?.injured_players || [], record?.suspended_players || [], record?.doubtful_players || [])
    .map((player) => ({
      ...player,
      importance: Number(player.importance || player.impact_score * 10 || 0),
    }));
}

function mergeLineupRecord(manual, structured) {
  const apiLineup = structured?.lineup || {};
  const manualStarting = Array.isArray(manual?.starting_11) ? manual.starting_11 : [];
  const manualBench = Array.isArray(manual?.substitutes) ? manual.substitutes : [];
  const starting = manualStarting.length ? manualStarting : (apiLineup.starting_11 || []);
  const substitutes = manualBench.length ? manualBench : (apiLineup.substitutes || []);
  const unavailable = uniquePlayers(manual?.unavailable || [], structuredUnavailable(structured));
  const availabilityChecked = Boolean(structured?.availability_checked) || unavailable.length > 0;
  const lineupConfirmed = Boolean(apiLineup.confirmed) || starting.length >= 11;
  return {
    ...emptyTeam(),
    formation: manual?.formation || apiLineup.formation || '',
    starting_11: starting,
    substitutes,
    unavailable,
    note: manual?.note || '',
    source_note: [manual?.source_note, ...(structured?.sources || [])].filter(Boolean).join(' | '),
    availability_checked: availabilityChecked,
    lineup_confirmed: lineupConfirmed,
    data_status: lineupConfirmed ? 'lineup_confirmed' : availabilityChecked ? 'availability_checked' : 'no_verified_data'
  };
}

function ability(player) {
  if (typeof player === 'number') return player;
  const base = Number(player.rating || player.overall || 0);
  const parts = ['attack', 'defense', 'passing', 'pace', 'finishing', 'aerial', 'set_piece', 'form', 'importance'];
  const vals = parts.map((key) => Number(player[key] || 0)).filter((x) => Number.isFinite(x) && x > 0);
  if (base > 0 && vals.length) return Math.round((base + vals.reduce((a, b) => a + b, 0) / vals.length) / 2);
  if (base > 0) return base;
  if (vals.length) return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  return 0;
}

function avg(list) {
  const values = (list || []).map(ability).filter((x) => Number.isFinite(x) && x > 0);
  return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
}

function topPlayers(list, count) {
  return (list || [])
    .map((p) => ({ name: p.name || p.player || 'Unknown', position: p.position || '-', ability_score: ability(p) }))
    .filter((player) => player.ability_score > 0)
    .sort((a, b) => b.ability_score - a.ability_score)
    .slice(0, count);
}

function strengthLabel(score) {
  if (score >= 80) return 'Çok Güçlü';
  if (score >= 70) return 'Güçlü';
  if (score >= 60) return 'Orta';
  if (score > 0) return 'Zayıf';
  return 'Veri Yok';
}

function buildTeamSummary(teamName, record) {
  const startScore = avg(record.starting_11);
  const benchScore = avg(record.substitutes);
  const unavailable = record.unavailable || [];
  const coreMissing = unavailable.filter((p) => Number(p.importance || p.rating || p.overall || 0) >= 70);
  return {
    team_name: teamName,
    formation: record.formation || '-',
    starting_11_count: (record.starting_11 || []).length,
    substitutes_count: (record.substitutes || []).length,
    starting_11_strength: startScore,
    bench_strength: benchScore,
    strength_label: strengthLabel(startScore),
    top_starting_players: topPlayers(record.starting_11, 3),
    top_bench_players: topPlayers(record.substitutes, 3),
    unavailable_players: unavailable,
    important_missing_count: coreMissing.length,
    data_available: Boolean(record.availability_checked || record.lineup_confirmed || unavailable.length || (record.starting_11 || []).length),
    availability_checked: Boolean(record.availability_checked),
    lineup_confirmed: Boolean(record.lineup_confirmed),
    data_status: record.data_status || 'no_verified_data',
    note: record.note || '',
    source_note: record.source_note || ''
  };
}

function compareTeams(home, away) {
  if (!home.lineup_confirmed || !away.lineup_confirmed) return 'İki takımın da doğrulanmış ilk 11 bilgisi henüz yok.';
  const diff = home.starting_11_strength - away.starting_11_strength;
  if (!home.starting_11_strength && !away.starting_11_strength) return 'İlk 11 kalite verisi yok.';
  if (diff >= 10) return `${home.team_name} ilk 11 kalite üstünlüğüne sahip.`;
  if (diff <= -10) return `${away.team_name} ilk 11 kalite üstünlüğüne sahip.`;
  return 'İlk 11 kalite farkı dengeli görünüyor.';
}

function lineupRisk(home, away) {
  const unavailable = [...(home.unavailable_players || []), ...(away.unavailable_players || [])];
  const highImpact = unavailable.filter((player) => Number(player.impact_score || 0) >= 7).length;
  const important = home.important_missing_count + away.important_missing_count;
  if (important >= 3 || highImpact >= 2) return 'Yüksek';
  if (!home.data_available || !away.data_available) return 'Belirsiz';
  if (important > 0 || unavailable.length > 0) return 'Orta';
  return 'Düşük';
}

function buildLineupSignals() {
  const full = readJson(path.join(dataDir, 'full-bulletin.json'), { matches: [] }).matches || [];
  const live = readJson(path.join(dataDir, 'live-matches.json'), { matches: [] }).matches || [];
  const analysis = readJson(path.join(dataDir, 'robot-analysis.json'), { matches: [] }).matches || [];
  const rows = full.length ? full : (analysis.length ? analysis : live);
  const db = readJson(path.join(dataDir, 'team-lineups-manual.json'), { teams: {} });
  const playerDb = readJson(path.join(dataDir, 'player-intelligence.json'), { matches: [] });
  const structuredByMatch = new Map((playerDb.matches || []).map((row) => [`${String(row.date || '').slice(0, 10)}|${clean(row.match_name || `${row.home} VS ${row.away}`)}`, row]));
  const matches = rows.map((row) => {
    const t = teams(row);
    const structuredMatch = structuredByMatch.get(`${String(row.date || row.tarih || '').slice(0, 10)}|${clean(row.match_name || row.match || `${t.home} VS ${t.away}`)}`) || {};
    const homeRecord = mergeLineupRecord(teamLineup(t.home, db), structuredMatch.home_team || playerDb.teams?.[t.home] || playerDb.teams?.[clean(t.home)]);
    const awayRecord = mergeLineupRecord(teamLineup(t.away, db), structuredMatch.away_team || playerDb.teams?.[t.away] || playerDb.teams?.[clean(t.away)]);
    const home = buildTeamSummary(t.home, homeRecord);
    const away = buildTeamSummary(t.away, awayRecord);
    const qualityDiff = home.starting_11_strength - away.starting_11_strength;
    const risk = lineupRisk(home, away);
    return {
      match_name: row.match_name || row.match || `${t.home} VS ${t.away}`,
      date: String(row.date || row.tarih || '').slice(0, 10),
      league: row.league || row.competition_name || '-',
      start_time: row.start_time || row.time || '-',
      home_lineup: home,
      away_lineup: away,
      lineup_quality_diff: qualityDiff,
      lineup_risk_level: risk,
      robot_comment: `${compareTeams(home, away)} Kadro eksikliği riski: ${risk}.`
    };
  });
  const output = {
    generated_at: new Date().toISOString(),
    date: todayTR(),
    match_count: matches.length,
    confirmed_lineup_match_count: matches.filter((match) => match.home_lineup.lineup_confirmed && match.away_lineup.lineup_confirmed).length,
    named_unavailable_player_count: matches.reduce((sum, match) => sum + match.home_lineup.unavailable_players.length + match.away_lineup.unavailable_players.length, 0),
    policy: 'Lineup and named player availability data comes from trusted manual import or API-Football. Missing data remains Belirsiz and is never converted to low risk.',
    matches
  };
  writeJson(path.join(dataDir, 'lineup-signals.json'), output);
  writeJson(path.join(dataDir, 'archive', `${todayTR()}-lineups.json`), output);
  console.log(`Lineup signals updated: ${matches.length} matches.`);
}

if (require.main === module) buildLineupSignals();
module.exports = { buildLineupSignals, buildTeamSummary, lineupRisk, mergeLineupRecord };
