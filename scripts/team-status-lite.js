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

function teamRecord(teamName, statusData) {
  return statusData.teams?.[teamName] || statusData.teams?.[clean(teamName)] || {
    transfers_in: [],
    transfers_out: [],
    injured_players: [],
    suspended_players: [],
    doubtful_players: [],
    squad_note: '',
    source_note: ''
  };
}

function countRisk(record) {
  let risk = 0;
  risk += (record.injured_players || []).length * 4;
  risk += (record.suspended_players || []).length * 5;
  risk += (record.doubtful_players || []).length * 2;
  risk += (record.transfers_out || []).length * 1;
  risk -= Math.min(3, (record.transfers_in || []).length);
  if (risk >= 12) return 'Yüksek';
  if (risk >= 5) return 'Orta';
  return 'Düşük';
}

function buildComment(teamName, record) {
  const parts = [];
  if ((record.transfers_in || []).length) parts.push(`${teamName} transfer girişi: ${(record.transfers_in || []).join(', ')}`);
  if ((record.transfers_out || []).length) parts.push(`${teamName} transfer çıkışı: ${(record.transfers_out || []).join(', ')}`);
  if ((record.injured_players || []).length) parts.push(`${teamName} sakat: ${(record.injured_players || []).join(', ')}`);
  if ((record.suspended_players || []).length) parts.push(`${teamName} cezalı: ${(record.suspended_players || []).join(', ')}`);
  if ((record.doubtful_players || []).length) parts.push(`${teamName} şüpheli: ${(record.doubtful_players || []).join(', ')}`);
  if (record.squad_note) parts.push(`${teamName} not: ${record.squad_note}`);
  return parts.length ? parts.join(' | ') : `${teamName} için kayıtlı kadro riski yok.`;
}

function buildTeamStatusSignals() {
  const live = readJson(path.join(dataDir, 'live-matches.json'), { matches: [] }).matches || [];
  const analysis = readJson(path.join(dataDir, 'robot-analysis.json'), { matches: [] }).matches || [];
  const rows = live.length ? live : analysis;
  const statusData = readJson(path.join(dataDir, 'team-status-manual.json'), { teams: {} });
  const matches = rows.map((row) => {
    const t = teams(row);
    const homeRecord = teamRecord(t.home, statusData);
    const awayRecord = teamRecord(t.away, statusData);
    const homeRisk = countRisk(homeRecord);
    const awayRisk = countRisk(awayRecord);
    const overallRisk = homeRisk === 'Yüksek' || awayRisk === 'Yüksek' ? 'Yüksek' : homeRisk === 'Orta' || awayRisk === 'Orta' ? 'Orta' : 'Düşük';
    return {
      match_name: row.match_name || row.match || `${t.home} VS ${t.away}`,
      league: row.league || row.competition_name || '-',
      start_time: row.start_time || row.time || '-',
      home_team: t.home,
      away_team: t.away,
      squad_risk_level: overallRisk,
      home_status: homeRecord,
      away_status: awayRecord,
      robot_comment: `${buildComment(t.home, homeRecord)} | ${buildComment(t.away, awayRecord)}`
    };
  });
  const output = {
    generated_at: new Date().toISOString(),
    date: todayTR(),
    match_count: matches.length,
    policy: 'Team status data is filled by trusted manual import or approved source adapters.',
    matches
  };
  writeJson(path.join(dataDir, 'team-status-signals.json'), output);
  writeJson(path.join(dataDir, 'archive', `${todayTR()}-team-status.json`), output);
  console.log(`Team status signals updated: ${matches.length} matches.`);
}

if (require.main === module) buildTeamStatusSignals();
module.exports = { buildTeamStatusSignals };
