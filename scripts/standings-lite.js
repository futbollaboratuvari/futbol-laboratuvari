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

function emptyStanding(teamName) {
  return {
    team_name: teamName,
    league: '',
    rank: null,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goals_for: 0,
    goals_against: 0,
    goal_difference: 0,
    points: 0,
    recent_form: [],
    source_note: ''
  };
}

function standingOf(teamName, db) {
  return db.teams?.[teamName] || db.teams?.[clean(teamName)] || emptyStanding(teamName);
}

function streak(form, code) {
  let count = 0;
  for (const item of form || []) {
    if (String(item).toUpperCase() === code) count += 1;
    else break;
  }
  return count;
}

function formScore(form) {
  let score = 0;
  for (const item of form || []) {
    const code = String(item).toUpperCase();
    if (code === 'W') score += 3;
    if (code === 'D') score += 1;
    if (code === 'L') score -= 2;
  }
  return score;
}

function ppg(row) {
  const played = Number(row.played || 0);
  const points = Number(row.points || 0);
  return played ? Number((points / played).toFixed(2)) : 0;
}

function momentum(row) {
  const winStreak = streak(row.recent_form, 'W');
  const lossStreak = streak(row.recent_form, 'L');
  const score = formScore(row.recent_form) + Math.min(10, Number(row.goal_difference || 0)) + Math.round(ppg(row) * 5);
  if (lossStreak >= 3) return { label: 'Kötü Seri', score, win_streak: winStreak, loss_streak: lossStreak };
  if (winStreak >= 3) return { label: 'Güçlü Seri', score, win_streak: winStreak, loss_streak: lossStreak };
  if (score >= 18) return { label: 'Pozitif Momentum', score, win_streak: winStreak, loss_streak: lossStreak };
  if (score <= 3) return { label: 'Negatif Momentum', score, win_streak: winStreak, loss_streak: lossStreak };
  return { label: 'Dengeli', score, win_streak: winStreak, loss_streak: lossStreak };
}

function buildTeamSummary(teamName, standing) {
  const gd = Number(standing.goal_difference ?? (Number(standing.goals_for || 0) - Number(standing.goals_against || 0)));
  const row = { ...standing, team_name: teamName, goal_difference: gd };
  return {
    team_name: teamName,
    league: row.league || '-',
    rank: row.rank,
    played: Number(row.played || 0),
    points: Number(row.points || 0),
    points_per_game: ppg(row),
    wins: Number(row.wins || 0),
    draws: Number(row.draws || 0),
    losses: Number(row.losses || 0),
    goals_for: Number(row.goals_for || 0),
    goals_against: Number(row.goals_against || 0),
    goal_difference: gd,
    recent_form: row.recent_form || [],
    momentum: momentum(row),
    source_note: row.source_note || ''
  };
}

function compareStandings(home, away) {
  const pointDiff = Number(home.points || 0) - Number(away.points || 0);
  const gdDiff = Number(home.goal_difference || 0) - Number(away.goal_difference || 0);
  const formDiff = Number(home.momentum?.score || 0) - Number(away.momentum?.score || 0);
  if (!home.played && !away.played) return 'Puan durumu verisi yok.';
  if (pointDiff >= 6 || formDiff >= 10) return `${home.team_name} puan/form avantajına sahip.`;
  if (pointDiff <= -6 || formDiff <= -10) return `${away.team_name} puan/form avantajına sahip.`;
  if (gdDiff >= 8) return `${home.team_name} averaj üstünlüğüne sahip.`;
  if (gdDiff <= -8) return `${away.team_name} averaj üstünlüğüne sahip.`;
  return 'Puan durumu ve form farkı dengeli.';
}

function buildStandingsSignals() {
  const live = readJson(path.join(dataDir, 'live-matches.json'), { matches: [] }).matches || [];
  const analysis = readJson(path.join(dataDir, 'robot-analysis.json'), { matches: [] }).matches || [];
  const rows = live.length ? live : analysis;
  const db = readJson(path.join(dataDir, 'team-standings-manual.json'), { teams: {} });
  const matches = rows.map((row) => {
    const t = teams(row);
    const home = buildTeamSummary(t.home, standingOf(t.home, db));
    const away = buildTeamSummary(t.away, standingOf(t.away, db));
    const momentumDiff = Number(home.momentum.score || 0) - Number(away.momentum.score || 0);
    const pointDiff = Number(home.points || 0) - Number(away.points || 0);
    return {
      match_name: row.match_name || row.match || `${t.home} VS ${t.away}`,
      league: row.league || row.competition_name || '-',
      start_time: row.start_time || row.time || '-',
      home_standing: home,
      away_standing: away,
      point_difference: pointDiff,
      momentum_difference: momentumDiff,
      robot_comment: compareStandings(home, away)
    };
  });
  const output = {
    generated_at: new Date().toISOString(),
    date: todayTR(),
    match_count: matches.length,
    policy: 'Standings and streak data is filled by trusted manual import or approved source adapters.',
    matches
  };
  writeJson(path.join(dataDir, 'standings-signals.json'), output);
  writeJson(path.join(dataDir, 'archive', `${todayTR()}-standings.json`), output);
  console.log(`Standings signals updated: ${matches.length} matches.`);
}

if (require.main === module) buildStandingsSignals();
module.exports = { buildStandingsSignals };
