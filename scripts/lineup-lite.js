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
    note: record.note || '',
    source_note: record.source_note || ''
  };
}

function compareTeams(home, away) {
  const diff = home.starting_11_strength - away.starting_11_strength;
  if (!home.starting_11_strength && !away.starting_11_strength) return 'İlk 11 kalite verisi yok.';
  if (diff >= 10) return `${home.team_name} ilk 11 kalite üstünlüğüne sahip.`;
  if (diff <= -10) return `${away.team_name} ilk 11 kalite üstünlüğüne sahip.`;
  return 'İlk 11 kalite farkı dengeli görünüyor.';
}

function buildLineupSignals() {
  const live = readJson(path.join(dataDir, 'live-matches.json'), { matches: [] }).matches || [];
  const analysis = readJson(path.join(dataDir, 'robot-analysis.json'), { matches: [] }).matches || [];
  const rows = live.length ? live : analysis;
  const db = readJson(path.join(dataDir, 'team-lineups-manual.json'), { teams: {} });
  const matches = rows.map((row) => {
    const t = teams(row);
    const home = buildTeamSummary(t.home, teamLineup(t.home, db));
    const away = buildTeamSummary(t.away, teamLineup(t.away, db));
    const qualityDiff = home.starting_11_strength - away.starting_11_strength;
    const risk = home.important_missing_count + away.important_missing_count >= 3 ? 'Yüksek' : home.important_missing_count + away.important_missing_count > 0 ? 'Orta' : 'Düşük';
    return {
      match_name: row.match_name || row.match || `${t.home} VS ${t.away}`,
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
    policy: 'Lineup and player ability data is filled by trusted manual import or approved source adapters.',
    matches
  };
  writeJson(path.join(dataDir, 'lineup-signals.json'), output);
  writeJson(path.join(dataDir, 'archive', `${todayTR()}-lineups.json`), output);
  console.log(`Lineup signals updated: ${matches.length} matches.`);
}

if (require.main === module) buildLineupSignals();
module.exports = { buildLineupSignals };
