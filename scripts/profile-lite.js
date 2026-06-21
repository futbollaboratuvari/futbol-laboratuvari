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

function buildArchive(oldArchive, rows) {
  const byKey = { ...(oldArchive.matches_by_key || {}) };
  for (const row of rows) {
    const key = rowKey(row);
    const teams = getTeams(row);
    const previous = byKey[key] || {};
    byKey[key] = {
      ...previous,
      ...row,
      archive_key: key,
      match_name: row.match_name || row.match || `${teams.home} VS ${teams.away}`,
      home_team_name: teams.home,
      away_team_name: teams.away,
      league: row.league || row.competition_name || row.lig || 'Unknown League',
      date: String(row.date || row.tarih || row.utc_date || '').slice(0, 10),
      time: row.time || row.saat || row.start_time || '-',
      last_seen_at: new Date().toISOString(),
      sources: Array.from(new Set([...(previous.sources || []), row.row_source || row.source || 'unknown']))
    };
  }
  return {
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
      profile.average_analysis_score += scoreNumber(row.analysis_score || row.score || row.confidence_score);
      const market = row.recommended_market || row.suggested_option || row.market || row.selection || '-';
      const risk = row.risk_level || row.risk || '-';
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
module.exports = { collectRows, buildArchive, buildProfileSet, runProfileLite };
