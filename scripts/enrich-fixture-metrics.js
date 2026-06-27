const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data');
const fixturesFile = path.join(dataDir, 'fixtures.json');
const archiveFile = path.join(dataDir, 'robot_match_archive.json');

function readJson(file, fallback) {
  try {
    const text = fs.readFileSync(file, 'utf8').trim();
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function cleanKey(value) {
  return String(value || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function parseOdd(value) {
  const number = Number(String(value ?? '').replace(',', '.'));
  return Number.isFinite(number) && number > 1 ? number : null;
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function pick(match, keys) {
  for (const key of keys) {
    const value = match?.[key]
      ?? match?.odds?.[key]
      ?? match?.oranlar?.[key]
      ?? match?.detay_oranlar?.[key]
      ?? match?.raw_market_guess_odds?.[key];
    const odd = parseOdd(value);
    if (odd) return odd;
  }
  return null;
}

function impliedPercent(yesOdd, noOdd, fallback = null) {
  const yes = parseOdd(yesOdd);
  const no = parseOdd(noOdd);
  if (yes && no) {
    const yesP = 1 / yes;
    const noP = 1 / no;
    return clamp((yesP / (yesP + noP)) * 100, 20, 80);
  }
  if (yes) return clamp(100 / yes, 25, 75);
  return fallback;
}

function scoreFromResult(match) {
  const raw = String(match.score || match.result || match.result_score || '').trim();
  const found = raw.match(/(\d+)\D+(\d+)/);
  if (!found) return null;
  return { home: Number(found[1]), away: Number(found[2]) };
}

function teamArchiveProfile(teamName, archiveRows) {
  const key = cleanKey(teamName);
  const rows = archiveRows
    .filter((row) => cleanKey(row.home || row.home_team_name) === key || cleanKey(row.away || row.away_team_name) === key)
    .slice(-10);

  let played = 0;
  let scored = 0;
  let conceded = 0;
  let btts = 0;
  let over25 = 0;
  let over35 = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;

  rows.forEach((row) => {
    const result = scoreFromResult(row);
    if (!result) return;
    const isHome = cleanKey(row.home || row.home_team_name) === key;
    const gf = isHome ? result.home : result.away;
    const ga = isHome ? result.away : result.home;
    played += 1;
    goalsFor += gf;
    goalsAgainst += ga;
    if (gf > 0) scored += 1;
    if (ga > 0) conceded += 1;
    if (gf > 0 && ga > 0) btts += 1;
    if (gf + ga >= 3) over25 += 1;
    if (gf + ga >= 4) over35 += 1;
  });

  return {
    played,
    scored,
    conceded,
    bttsPercent: played ? clamp((btts / played) * 100) : null,
    over25Percent: played ? clamp((over25 / played) * 100) : null,
    over35Percent: played ? clamp((over35 / played) * 100) : null,
    goalsForAvg: played ? Number((goalsFor / played).toFixed(2)) : null,
    goalsAgainstAvg: played ? Number((goalsAgainst / played).toFixed(2)) : null
  };
}

function leagueArchiveProfile(leagueName, archiveRows) {
  const key = cleanKey(leagueName);
  const rows = archiveRows.filter((row) => key && cleanKey(row.league || row.competition_name) === key).slice(-30);
  let played = 0;
  let goals = 0;
  let btts = 0;
  let over25 = 0;
  let over35 = 0;

  rows.forEach((row) => {
    const result = scoreFromResult(row);
    if (!result) return;
    const total = result.home + result.away;
    played += 1;
    goals += total;
    if (result.home > 0 && result.away > 0) btts += 1;
    if (total >= 3) over25 += 1;
    if (total >= 4) over35 += 1;
  });

  return {
    played,
    goalAverage: played ? Number((goals / played).toFixed(2)) : null,
    bttsPercent: played ? clamp((btts / played) * 100) : null,
    over25Percent: played ? clamp((over25 / played) * 100) : null,
    over35Percent: played ? clamp((over35 / played) * 100) : null
  };
}

function hasValue(match, key) {
  return match[key] !== undefined && match[key] !== null && match[key] !== '';
}

function withFallback(current, fallback) {
  return current !== null && current !== undefined ? current : fallback;
}

function collectWideOdds(match) {
  const source = {
    ...(match.available_odds || {}),
    ...(match.raw_market_guess_odds || {})
  };
  return Object.fromEntries(Object.entries(source).filter(([, value]) => parseOdd(value)));
}

function enrichFixture(match, archiveRows) {
  const home = match.home || match.home_team_name || '';
  const away = match.away || match.away_team_name || '';
  const league = match.league || match.competition_name || '';
  const homeProfile = teamArchiveProfile(home, archiveRows);
  const awayProfile = teamArchiveProfile(away, archiveRows);
  const leagueProfile = leagueArchiveProfile(league, archiveRows);

  const over25Odd = pick(match, ['over25', 'ust25', 'over', 'ust', 'ust_25', 'over25_guess']);
  const under25Odd = pick(match, ['under25', 'alt25', 'under', 'alt', 'alt_25', 'under25_guess']);
  const over35Odd = pick(match, ['over35', 'ust35', 'over3_5', 'ust_35', 'over35_guess']);
  const under35Odd = pick(match, ['under35', 'alt35', 'under3_5', 'alt_35', 'under35_guess']);
  const bttsYesOdd = pick(match, ['bttsYes', 'kgVar', 'kg_var', 'varOdd', 'var', 'bttsYes_guess']);
  const bttsNoOdd = pick(match, ['bttsNo', 'kgYok', 'kg_yok', 'yokOdd', 'yok', 'bttsNo_guess']);
  const firstHalfYesOdd = pick(match, ['firstHalfBttsYes', 'iyKgVar', 'iy_kg_var', 'first_half_btts_yes', 'firstHalfBttsYes_guess']);
  const firstHalfNoOdd = pick(match, ['firstHalfBttsNo', 'iyKgYok', 'iy_kg_yok', 'first_half_btts_no', 'firstHalfBttsNo_guess']);
  const secondHalfYesOdd = pick(match, ['secondHalfBttsYes', 'ikinciYariKgVar', 'ikinci_yari_kg_var', 'second_half_btts_yes', 'secondHalfBttsYes_guess']);
  const secondHalfNoOdd = pick(match, ['secondHalfBttsNo', 'ikinciYariKgYok', 'ikinci_yari_kg_yok', 'second_half_btts_no', 'secondHalfBttsNo_guess']);

  const bttsFromOdds = impliedPercent(bttsYesOdd, bttsNoOdd, null);
  const over25FromOdds = impliedPercent(over25Odd, under25Odd, null);
  const over35FromOdds = impliedPercent(over35Odd, under35Odd, over25FromOdds !== null ? Math.max(25, over25FromOdds - 18) : null);
  const firstHalfFromOdds = impliedPercent(firstHalfYesOdd, firstHalfNoOdd, bttsFromOdds !== null ? Math.max(35, bttsFromOdds - 14) : null);
  const secondHalfFromOdds = impliedPercent(secondHalfYesOdd, secondHalfNoOdd, bttsFromOdds !== null ? Math.min(75, bttsFromOdds + 6) : null);

  const archiveAvailable = homeProfile.played >= 3 && awayProfile.played >= 3;
  const average = (a, b, fallback) => (a !== null && b !== null ? Math.round((a + b) / 2) : fallback);
  const bttsPercent = withFallback(
    archiveAvailable ? average(homeProfile.bttsPercent, awayProfile.bttsPercent, bttsFromOdds) : null,
    withFallback(leagueProfile.bttsPercent, bttsFromOdds)
  );
  const over25Percent = withFallback(
    archiveAvailable ? average(homeProfile.over25Percent, awayProfile.over25Percent, over25FromOdds) : null,
    withFallback(leagueProfile.over25Percent, over25FromOdds)
  );
  const over35Percent = withFallback(
    archiveAvailable ? average(homeProfile.over35Percent, awayProfile.over35Percent, over35FromOdds) : null,
    withFallback(leagueProfile.over35Percent, over35FromOdds)
  );
  const leagueGoalAverage = withFallback(leagueProfile.goalAverage, over25Percent !== null ? Number((2.15 + (over25Percent / 100) * 1.15).toFixed(2)) : null);
  const firstHalfGoalTrend = firstHalfFromOdds !== null ? firstHalfFromOdds : (bttsPercent !== null ? Math.max(35, bttsPercent - 12) : null);
  const secondHalfGoalTrend = secondHalfFromOdds !== null ? secondHalfFromOdds : (bttsPercent !== null ? Math.min(78, bttsPercent + 6) : null);

  const proxyAttackCount = over25Percent !== null ? Math.max(3, Math.min(7, Math.round(over25Percent / 12))) : null;
  const proxyConcedeCount = bttsPercent !== null ? Math.max(3, Math.min(7, Math.round(bttsPercent / 12))) : null;

  const metricSource = archiveAvailable || leagueProfile.played >= 8
    ? 'archive_plus_odds'
    : 'odds_proxy_pending_form_archive';

  const enriched = { ...match };
  const setMetric = (key, value) => {
    if (!hasValue(enriched, key) && value !== null && value !== undefined) enriched[key] = value;
  };

  setMetric('homeScoredLast10', homeProfile.played ? homeProfile.scored : proxyAttackCount);
  setMetric('awayScoredLast10', awayProfile.played ? awayProfile.scored : proxyAttackCount);
  setMetric('homeConcededLast10', homeProfile.played ? homeProfile.conceded : proxyConcedeCount);
  setMetric('awayConcededLast10', awayProfile.played ? awayProfile.conceded : proxyConcedeCount);
  setMetric('bttsPercent', bttsPercent);
  setMetric('over25Percent', over25Percent);
  setMetric('over35Percent', over35Percent);
  setMetric('firstHalfGoalTrend', firstHalfGoalTrend);
  setMetric('secondHalfGoalTrend', secondHalfGoalTrend);
  setMetric('leagueGoalAverage', leagueGoalAverage);

  const wideOdds = collectWideOdds(enriched);
  enriched.available_odds = {
    ...(enriched.available_odds || {}),
    ...wideOdds
  };
  enriched.market_odds_inventory = Object.keys(enriched.available_odds || {});
  enriched.wide_market_odds_count = Object.keys(wideOdds).length;
  enriched.wide_market_learning_source = 'fixture_odds_inventory';
  enriched.metric_source = enriched.metric_source || metricSource;
  enriched.metric_quality = archiveAvailable ? 'medium' : 'proxy';
  enriched.metric_notes = enriched.metric_notes || [
    archiveAvailable
      ? 'Form metrikleri robot maç arşivi ve oran sinyaliyle zenginleştirildi.'
      : 'Kalıcı form arşivi henüz sınırlı; geçici metrikler oran sinyalinden üretildi.'
  ];
  if (Object.keys(wideOdds).length) enriched.metric_notes.push('Geniş market oran envanteri robot öğrenme verisine eklendi.');
  enriched.home_form_profile = enriched.home_form_profile || homeProfile;
  enriched.away_form_profile = enriched.away_form_profile || awayProfile;
  enriched.league_goal_profile = enriched.league_goal_profile || leagueProfile;

  return enriched;
}

function main() {
  const fixtures = readJson(fixturesFile, []);
  const archive = readJson(archiveFile, { matches: [] });
  const archiveRows = Array.isArray(archive.matches) ? archive.matches : [];
  const list = Array.isArray(fixtures) ? fixtures : [];
  const enriched = list.map((fixture) => enrichFixture(fixture, archiveRows));
  writeJson(fixturesFile, enriched);
  const proxyCount = enriched.filter((item) => item.metric_source === 'odds_proxy_pending_form_archive').length;
  const archiveCount = enriched.filter((item) => item.metric_source === 'archive_plus_odds').length;
  const wideCount = enriched.reduce((sum, item) => sum + Number(item.wide_market_odds_count || 0), 0);
  console.log(`Fixture metrics enriched. Total: ${enriched.length}. Archive: ${archiveCount}. Proxy: ${proxyCount}. Wide odds: ${wideCount}.`);
}

if (require.main === module) main();

module.exports = { enrichFixture, main };