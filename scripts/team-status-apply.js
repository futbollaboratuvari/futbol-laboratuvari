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

function pairKey(home, away, date = '') {
  return `${String(date || '').slice(0, 10)}|${clean(home)}|${clean(away)}`;
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
    lookup.set(pairKey(row.home_team, row.away_team, row.date), row);
  }
  const lineups = readJson(path.join(dataDir, 'lineup-signals.json'), { matches: [] });
  const lineupLookup = new Map();
  for (const row of lineups.matches || []) {
    lineupLookup.set(pairKey(row.home_lineup?.team_name, row.away_lineup?.team_name, row.date), row);
  }

  let applied = 0;
  let lineupApplied = 0;
  const applyToMatch = (match) => {
    const date = match.date || match.tarih || '';
    const row = lookup.get(pairKey(team(match, 'home'), team(match, 'away'), date))
      || lookup.get(pairKey(team(match, 'home'), team(match, 'away')));
    const lineup = lineupLookup.get(pairKey(team(match, 'home'), team(match, 'away'), date))
      || lineupLookup.get(pairKey(team(match, 'home'), team(match, 'away')));
    if (!row && !lineup) return match;
    if (row) applied += 1;
    if (lineup) lineupApplied += 1;
    const squadRisk = row?.squad_risk_level || 'Belirsiz';
    const lineupRisk = lineup?.lineup_risk_level || 'Belirsiz';
    const risk = worstRisk(worstRisk(match.risk_level || match.risk, squadRisk), lineupRisk);
    const squadComment = row?.robot_comment || '';
    const lineupComment = lineup?.robot_comment || '';
    const existingComment = String(match.robot_comment || match.robot_reason || '').trim();
    const combinedComment = [
      existingComment,
      squadComment ? `Kadro istihbaratı: ${squadComment}` : '',
      lineupComment ? `İlk 11 analizi: ${lineupComment}` : '',
    ].filter(Boolean).join(' | ');
    const intelligence = {
      squad_risk_level: squadRisk,
      lineup_risk_level: lineupRisk,
      verified_team_count: row?.verified_team_count || 0,
      signal_team_count: row?.signal_team_count || 0,
      named_player_count: row?.named_player_count || 0,
      home_status: row?.home_status || null,
      away_status: row?.away_status || null,
      home_lineup: lineup?.home_lineup || null,
      away_lineup: lineup?.away_lineup || null,
      squad_comment: squadComment,
      lineup_comment: lineupComment,
    };
    return {
      ...match,
      risk_level: risk,
      squad_risk_level: squadRisk,
      lineup_risk_level: lineupRisk,
      home_squad_risk_level: row?.home_squad_risk_level || 'Belirsiz',
      away_squad_risk_level: row?.away_squad_risk_level || 'Belirsiz',
      team_status_verified_count: row?.verified_team_count || 0,
      named_player_count: row?.named_player_count || 0,
      home_status: row?.home_status || null,
      away_status: row?.away_status || null,
      home_lineup: lineup?.home_lineup || null,
      away_lineup: lineup?.away_lineup || null,
      team_intelligence: intelligence,
      squad_comment: squadComment,
      lineup_comment: lineupComment,
      robot_comment: combinedComment || match.robot_comment,
      detail: {
        ...(match.detail || {}),
        risk,
        squad_risk_level: squadRisk,
        lineup_risk_level: lineupRisk,
        squad_comment: squadComment,
        lineup_comment: lineupComment,
        team_status: { home: row?.home_status || null, away: row?.away_status || null },
        lineup: { home: lineup?.home_lineup || null, away: lineup?.away_lineup || null }
      }
    };
  };

  for (const key of ['matches', 'live_matches', 'finished_matches', 'scheduled_matches']) {
    if (Array.isArray(full[key])) full[key] = full[key].map(applyToMatch);
  }
  full.team_status_applied_at = new Date().toISOString();
  full.team_status_applied_count = applied;
  full.lineup_status_applied_count = lineupApplied;
  writeJson(fullPath, full);
  console.log(`Team status applied to full bulletin: squad=${applied}, lineup=${lineupApplied} matches.`);
  return { applied, lineupApplied };
}

if (require.main === module) applyTeamStatus();
module.exports = { applyTeamStatus, worstRisk, riskRank, pairKey };
