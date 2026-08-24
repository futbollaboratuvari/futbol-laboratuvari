const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data');

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function writeJson(file, value) {
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function clean(value) {
  return String(value || '').toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function team(match, side) {
  return String(match?.[side] || match?.[`${side}_team_name`] || (side === 'home' ? match?.ev_sahibi : match?.deplasman) || '').trim();
}

function pairKey(home, away) {
  return `${clean(home)}|${clean(away)}`;
}

function riskRank(value) {
  const text = clean(value);
  if (text.includes('yuksek')) return 3;
  if (text.includes('orta')) return 2;
  if (text.includes('belirsiz') || text.includes('veri yok')) return 2;
  if (text.includes('dusuk')) return 1;
  return 0;
}

function worstRisk(current, squad) {
  const currentRank = riskRank(current);
  const squadRank = riskRank(squad);
  const rank = Math.max(currentRank, squadRank);
  if (rank >= 3) return 'Yüksek';
  if (rank >= 2) return 'Orta';
  if (rank === 1) return 'Düşük';
  return current || squad || '';
}

function applyTeamStatus() {
  const fullPath = path.join(dataDir, 'full-bulletin.json');
  const full = readJson(fullPath, null);
  if (!full) {
    console.warn('Team status apply skipped: full-bulletin.json missing.');
    return { applied: 0 };
  }
  const status = readJson(path.join(dataDir, 'team-status-signals.json'), { matches: [] });
  const lookup = new Map();
  for (const row of status.matches || []) {
    lookup.set(pairKey(row.home_team, row.away_team), row);
  }

  let applied = 0;
  const applyToMatch = (match) => {
    const row = lookup.get(pairKey(team(match, 'home'), team(match, 'away')));
    if (!row) return match;
    applied += 1;
    const risk = worstRisk(match.risk_level || match.risk, row.squad_risk_level);
    const squadComment = row.robot_comment || '';
    const existingComment = String(match.robot_comment || match.robot_reason || '').trim();
    const combinedComment = [existingComment, squadComment ? `Kadro istihbaratı: ${squadComment}` : ''].filter(Boolean).join(' | ');
    return {
      ...match,
      risk_level: risk,
      squad_risk_level: row.squad_risk_level,
      home_squad_risk_level: row.home_squad_risk_level,
      away_squad_risk_level: row.away_squad_risk_level,
      team_status_verified_count: row.verified_team_count,
      home_status: row.home_status,
      away_status: row.away_status,
      squad_comment: squadComment,
      robot_comment: combinedComment || match.robot_comment,
      detail: {
        ...(match.detail || {}),
        risk,
        squad_risk_level: row.squad_risk_level,
        squad_comment: squadComment,
        team_status: { home: row.home_status, away: row.away_status }
      }
    };
  };

  for (const key of ['matches', 'live_matches', 'finished_matches', 'scheduled_matches']) {
    if (Array.isArray(full[key])) full[key] = full[key].map(applyToMatch);
  }
  full.team_status_applied_at = new Date().toISOString();
  full.team_status_applied_count = applied;
  writeJson(fullPath, full);
  console.log(`Team status applied to full bulletin: ${applied} matches.`);
  return { applied };
}

if (require.main === module) applyTeamStatus();
module.exports = { applyTeamStatus, worstRisk, riskRank, pairKey };
