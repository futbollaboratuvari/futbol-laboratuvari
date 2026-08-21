const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data');

function todayTR() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function clean(value) {
  return String(value || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function scoreNumber(value) {
  const number = Number(String(value || '').replace('%', '').replace(',', '.'));
  return Number.isFinite(number) ? number : 0;
}

function useful(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}

function firstUseful(...values) {
  return values.find(useful);
}

function firstNumber(...values) {
  for (const value of values) {
    if (!useful(value)) continue;
    const number = Number(String(value).replace('%', '').replace(',', '.'));
    if (Number.isFinite(number)) return number;
  }
  return null;
}

function getTeams(row) {
  const matchName = String(row.match_name || row.match || '');
  const parts = matchName.includes(' VS ') ? matchName.split(' VS ') : [];
  return {
    home: String(row.home || row.home_team_name || row.ev_sahibi || parts[0] || 'Home').trim(),
    away: String(row.away || row.away_team_name || row.deplasman || parts[1] || 'Away').trim()
  };
}

function rowKey(row) {
  const teams = getTeams(row);
  return [
    String(row.date || row.tarih || row.utc_date || '').slice(0, 10),
    String(row.time || row.saat || row.start_time || '').trim(),
    clean(teams.home),
    clean(teams.away)
  ].join('|');
}

function collectRows() {
  const fixtures = readJson(path.join(dataDir, 'fixtures.json'), []);
  const live = readJson(path.join(dataDir, 'live-matches.json'), { matches: [] }).matches || [];
  const analysis = readJson(path.join(dataDir, 'robot-analysis.json'), { matches: [] }).matches || [];
  const raw = readJson(path.join(dataDir, 'ham_mac_havuzu.json'), { matches: [] }).matches || [];
  return [
    ...fixtures.map((x) => ({ ...x, row_source: 'fixtures' })),
    ...live.map((x) => ({ ...x, row_source: 'live' })),
    ...analysis.map((x) => ({ ...x, row_source: 'analysis' })),
    ...raw.map((x) => ({ ...x, row_source: 'raw' }))
  ].filter((x) => rowKey(x).replace(/\|/g, '').trim());
}

function compactArchiveRow(row, previous = {}, key = '') {
  const merged = { ...previous, ...row };
  const teams = getTeams(merged);
  const homeScore = firstNumber(
    row.home_score, row.home_goals, row.homeScore, row.ev_sahibi_gol,
    previous.home_score, previous.home_goals, previous.homeScore, previous.ev_sahibi_gol
  );
  const awayScore = firstNumber(
    row.away_score, row.away_goals, row.awayScore, row.deplasman_gol,
    previous.away_score, previous.away_goals, previous.awayScore, previous.deplasman_gol
  );
  const score = homeScore !== null && awayScore !== null
    ? `${homeScore}-${awayScore}`
    : firstUseful(row.score, row.result, row.skor, previous.score, previous.result, previous.skor, '');
  const previousSources = Array.isArray(previous.sources) ? previous.sources : [];
  const rowSources = Array.isArray(row.sources) ? row.sources : [];
  const sources = Array.from(new Set([
    ...previousSources,
    ...rowSources,
    row.row_source,
    row.source
  ].filter(useful)));

  return {
    archive_key: key || row.archive_key || previous.archive_key || rowKey(merged),
    match_name: firstUseful(row.match_name, row.match, previous.match_name, previous.match, `${teams.home} VS ${teams.away}`),
    home_team_name: teams.home,
    away_team_name: teams.away,
    league: firstUseful(row.league, row.competition_name, row.lig, previous.league, previous.competition_name, previous.lig, 'Unknown League'),
    date: String(firstUseful(row.date, row.tarih, row.utc_date, previous.date, previous.tarih, previous.utc_date, '')).slice(0, 10),
    time: firstUseful(row.time, row.saat, row.start_time, previous.time, previous.saat, previous.start_time, '-'),
    status: firstUseful(row.status, row.liveStatus, previous.status, previous.liveStatus, ''),
    home_score: homeScore,
    away_score: awayScore,
    score,
    analysis_score: firstNumber(row.analysis_score, row.confidence_score, previous.analysis_score, previous.confidence_score),
    recommended_market: firstUseful(
      row.recommended_market, row.suggested_option, row.market, row.selection,
      previous.recommended_market, previous.suggested_option, previous.market, previous.selection,
      '-'
    ),
    risk_level: firstUseful(row.risk_level, row.risk, previous.risk_level, previous.risk, '-'),
    value_label: firstUseful(row.value_label, previous.value_label, '-'),
    match_code: firstUseful(row.match_code, row.matchCode, previous.match_code, previous.matchCode, ''),
    last_seen_at: new Date().toISOString(),
    sources
  };
}

function buildArchive(oldArchive, rows) {
  const byKey = {};

  for (const [key, row] of Object.entries(oldArchive.matches_by_key || {})) {
    byKey[key] = compactArchiveRow(row, {}, key);
  }

  for (const row of rows) {
    const key = rowKey(row);
    byKey[key] = compactArchiveRow(row, byKey[key] || {}, key);
  }

  return {
    schema_version: 2,
    updated_at: new Date().toISOString(),
    match_count: Object.keys(byKey).length,
    matches_by_key: byKey
  };
}

function buildProfileSet(archive, mode) {
  const profiles = {};
  for (const row of Object.values(archive.matches_by_key || {})) {
    const names = mode === 'team' ? [row.home_team_name, row.away_team_name] : [row.league];
    for (const rawName of names) {
      const name = String(rawName || 'Unknown').trim();
      const key = clean(name);
      if (!profiles[key]) {
        profiles[key] = {
          name,
          seen_matches: 0,
          average_analysis_score: 0,
          recommended_markets: {},
          risk_levels: {},
          value_labels: {},
          last_seen_at: row.last_seen_at
        };
      }
      const profile = profiles[key];
      profile.seen_matches += 1;
      profile.average_analysis_score += scoreNumber(row.analysis_score);
      const market = row.recommended_market || '-';
      const risk = row.risk_level || '-';
      const value = row.value_label || '-';
      profile.recommended_markets[market] = (profile.recommended_markets[market] || 0) + 1;
      profile.risk_levels[risk] = (profile.risk_levels[risk] || 0) + 1;
      profile.value_labels[value] = (profile.value_labels[value] || 0) + 1;
      profile.last_seen_at = row.last_seen_at || profile.last_seen_at;
    }
  }
  for (const profile of Object.values(profiles)) {
    profile.average_analysis_score = profile.seen_matches ? Math.round(profile.average_analysis_score / profile.seen_matches) : 0;
  }
  return {
    updated_at: new Date().toISOString(),
    count: Object.keys(profiles).length,
    profiles
  };
}

function runProfileLite() {
  const rows = collectRows();
  const archivePath = path.join(dataDir, 'longterm-match-archive.json');
  const archive = buildArchive(readJson(archivePath, { matches_by_key: {} }), rows);
  const teamProfiles = buildProfileSet(archive, 'team');
  const leagueProfiles = buildProfileSet(archive, 'league');
  const index = {
    updated_at: new Date().toISOString(),
    date: todayTR(),
    totals: {
      ingested_now: rows.length,
      archived_matches: archive.match_count,
      tracked_teams: teamProfiles.count,
      tracked_leagues: leagueProfiles.count
    },
    files: {
      archive: 'data/longterm-match-archive.json',
      teams: 'data/team-profile-index.json',
      leagues: 'data/league-profile-index.json'
    }
  };
  writeJson(archivePath, archive);
  writeJson(path.join(dataDir, 'team-profile-index.json'), teamProfiles);
  writeJson(path.join(dataDir, 'league-profile-index.json'), leagueProfiles);
  writeJson(path.join(dataDir, 'profile-index.json'), index);
  writeJson(path.join(dataDir, 'archive', `${todayTR()}-profiles.json`), index);
  console.log(`Profile archive updated: ${archive.match_count} matches, ${teamProfiles.count} teams, ${leagueProfiles.count} leagues.`);
}

if (require.main === module) runProfileLite();
module.exports = { collectRows, compactArchiveRow, buildArchive, buildProfileSet, runProfileLite };
