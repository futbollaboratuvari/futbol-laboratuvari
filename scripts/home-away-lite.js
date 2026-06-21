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

function scoreValue(row, keys) {
  for (const key of keys) {
    const value = row[key];
    const number = Number(String(value || '').replace(',', '.'));
    if (Number.isFinite(number) && String(value).trim() !== '') return number;
  }
  return null;
}

function result(row) {
  const homeGoals = scoreValue(row, ['home_score', 'home_goals', 'homeScore', 'ev_sahibi_gol']);
  const awayGoals = scoreValue(row, ['away_score', 'away_goals', 'awayScore', 'deplasman_gol']);
  if (homeGoals !== null && awayGoals !== null) return { homeGoals, awayGoals };
  const text = String(row.score || row.result || row.skor || '');
  const match = text.match(/(\d+)\s*[-:]\s*(\d+)/);
  if (match) return { homeGoals: Number(match[1]), awayGoals: Number(match[2]) };
  return null;
}

function emptyProfile(name) {
  return {
    team_name: name,
    home: { matches: 0, goals_for: 0, goals_against: 0, btts: 0, over25: 0, over35: 0, wins: 0, draws: 0, losses: 0 },
    away: { matches: 0, goals_for: 0, goals_against: 0, btts: 0, over25: 0, over35: 0, wins: 0, draws: 0, losses: 0 }
  };
}

function addGame(profile, side, gf, ga) {
  const p = profile[side];
  p.matches += 1;
  p.goals_for += gf;
  p.goals_against += ga;
  if (gf > 0 && ga > 0) p.btts += 1;
  if (gf + ga >= 3) p.over25 += 1;
  if (gf + ga >= 4) p.over35 += 1;
  if (gf > ga) p.wins += 1;
  else if (gf === ga) p.draws += 1;
  else p.losses += 1;
}

function pct(value, total) {
  return total ? Math.round((value / total) * 100) : 0;
}

function finalize(side) {
  return {
    matches: side.matches,
    avg_goals_for: side.matches ? Number((side.goals_for / side.matches).toFixed(2)) : 0,
    avg_goals_against: side.matches ? Number((side.goals_against / side.matches).toFixed(2)) : 0,
    btts_percent: pct(side.btts, side.matches),
    over25_percent: pct(side.over25, side.matches),
    over35_percent: pct(side.over35, side.matches),
    win_percent: pct(side.wins, side.matches),
    draw_percent: pct(side.draws, side.matches),
    loss_percent: pct(side.losses, side.matches)
  };
}

function buildHomeAwayProfiles() {
  const archive = readJson(path.join(dataDir, 'longterm-match-archive.json'), { matches_by_key: {} });
  const rows = Object.values(archive.matches_by_key || {});
  const profiles = {};
  for (const row of rows) {
    const r = result(row);
    if (!r) continue;
    const t = teams(row);
    const homeKey = clean(t.home);
    const awayKey = clean(t.away);
    if (!profiles[homeKey]) profiles[homeKey] = emptyProfile(t.home);
    if (!profiles[awayKey]) profiles[awayKey] = emptyProfile(t.away);
    addGame(profiles[homeKey], 'home', r.homeGoals, r.awayGoals);
    addGame(profiles[awayKey], 'away', r.awayGoals, r.homeGoals);
  }
  const finalProfiles = {};
  for (const [key, profile] of Object.entries(profiles)) {
    finalProfiles[key] = {
      team_name: profile.team_name,
      home_performance: finalize(profile.home),
      away_performance: finalize(profile.away)
    };
  }
  return finalProfiles;
}

function buildMatchSignals(profiles) {
  const live = readJson(path.join(dataDir, 'live-matches.json'), { matches: [] }).matches || [];
  const analysis = readJson(path.join(dataDir, 'robot-analysis.json'), { matches: [] }).matches || [];
  const rows = live.length ? live : analysis;
  return rows.map((row) => {
    const t = teams(row);
    const home = profiles[clean(t.home)]?.home_performance || finalize(emptyProfile(t.home).home);
    const away = profiles[clean(t.away)]?.away_performance || finalize(emptyProfile(t.away).away);
    const homeEdge = home.avg_goals_for - away.avg_goals_against;
    const awayEdge = away.avg_goals_for - home.avg_goals_against;
    const bttsTrend = Math.round((home.btts_percent + away.btts_percent) / 2);
    const over25Trend = Math.round((home.over25_percent + away.over25_percent) / 2);
    const comment = `Ev sahibi iç saha gol ortalaması ${home.avg_goals_for}, deplasman dış saha gol ortalaması ${away.avg_goals_for}. KG eğilimi ${bttsTrend}%, 2.5 üst eğilimi ${over25Trend}%.`;
    return {
      match_name: row.match_name || row.match || `${t.home} VS ${t.away}`,
      league: row.league || row.competition_name || '-',
      start_time: row.start_time || row.time || '-',
      home_team: t.home,
      away_team: t.away,
      home_performance: home,
      away_performance: away,
      home_edge: Number(homeEdge.toFixed(2)),
      away_edge: Number(awayEdge.toFixed(2)),
      btts_trend_percent: bttsTrend,
      over25_trend_percent: over25Trend,
      robot_comment: comment
    };
  });
}

function runHomeAwayLite() {
  const profiles = buildHomeAwayProfiles();
  const signals = buildMatchSignals(profiles);
  const output = {
    generated_at: new Date().toISOString(),
    date: todayTR(),
    profile_count: Object.keys(profiles).length,
    match_count: signals.length,
    profiles,
    matches: signals
  };
  writeJson(path.join(dataDir, 'home-away-performance.json'), output);
  writeJson(path.join(dataDir, 'archive', `${todayTR()}-home-away.json`), output);
  console.log(`Home away performance updated: ${Object.keys(profiles).length} teams, ${signals.length} matches.`);
}

if (require.main === module) runHomeAwayLite();
module.exports = { runHomeAwayLite, buildHomeAwayProfiles, buildMatchSignals };
