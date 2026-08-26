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

function emptyRecord() {
  return {
    transfers_in: [],
    transfers_out: [],
    injured_players: [],
    suspended_players: [],
    doubtful_players: [],
    squad_note: '',
    source_note: '',
    evidence: [],
    auto_risk_score: 0,
    data_status: 'no_verified_data'
  };
}

function recordFor(teamName, db) {
  return db?.teams?.[teamName] || db?.teams?.[clean(teamName)] || null;
}

function uniqueList(...lists) {
  return [...new Set(lists.flat().filter(Boolean).map((value) => {
    if (typeof value === 'string') return value.trim();
    return String(value?.name || value?.player || '').trim();
  }).filter(Boolean))];
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

function evidenceSummary(evidence) {
  return (evidence || []).slice(0, 4).map((item) => ({
    title: item.title || '',
    link: item.link || '',
    source_name: item.source_name || '',
    published_at: item.published_at || '',
    categories: Array.isArray(item.categories) ? item.categories : [],
    age_days: item.age_days ?? null,
    confidence: item.confidence || 'low'
  }));
}

function mergeTeamRecord(teamName, manualDb, autoDb, playerDb = { teams: {} }) {
  const manual = recordFor(teamName, manualDb) || {};
  const auto = recordFor(teamName, autoDb) || {};
  const structured = recordFor(teamName, playerDb) || {};
  const manualHasAvailability = [manual.injured_players, manual.suspended_players, manual.doubtful_players]
    .some((list) => Array.isArray(list) && list.length) || Boolean(manual.squad_note);
  const manualHasData = [manual.transfers_in, manual.transfers_out, manual.injured_players, manual.suspended_players, manual.doubtful_players]
    .some((list) => Array.isArray(list) && list.length) || Boolean(manual.squad_note || manual.source_note);
  const evidence = evidenceSummary(auto.evidence || []);
  const autoHasData = evidence.length > 0;
  const structuredAvailabilityData = ['availability_checked', 'lineup_confirmed'].includes(structured.data_status)
    || Boolean(structured.availability_checked || structured.lineup_confirmed);
  const injuredDetails = uniquePlayers(structured.injured_players || []);
  const suspendedDetails = uniquePlayers(structured.suspended_players || []);
  const doubtfulDetails = uniquePlayers(structured.doubtful_players || []);
  const transferInDetails = uniquePlayers(structured.transfers_in || []);
  const transferOutDetails = uniquePlayers(structured.transfers_out || []);
  const structuredHasFacts = injuredDetails.length || suspendedDetails.length || doubtfulDetails.length || transferInDetails.length || transferOutDetails.length;
  const structuredHasData = structuredAvailabilityData || structuredHasFacts;
  const sourceParts = [];
  if (manual.source_note) sourceParts.push(`Manuel: ${manual.source_note}`);
  if (structuredHasData) sourceParts.push(`Yapılandırılmış API: ${(structured.sources || []).join(', ') || 'API-Football'}`);
  if (autoHasData) sourceParts.push(`Otomatik açık kaynak: ${(auto.sources || []).slice(0, 5).join(', ') || 'Google News RSS'}`);
  if (auto.status === 'source_error') sourceParts.push(`Otomatik kaynak hatası: ${auto.error || 'bilinmiyor'}`);

  let dataStatus = 'no_verified_data';
  if (manualHasData && structuredHasData && autoHasData) dataStatus = 'manual_api_plus_public_news';
  else if (manualHasData && structuredHasData) dataStatus = 'manual_plus_api';
  else if (structuredHasData && autoHasData) dataStatus = 'api_plus_public_news';
  else if (structuredHasData) dataStatus = structured.lineup_confirmed ? 'api_lineup_verified' : structured.availability_checked ? 'api_availability_verified' : 'api_player_facts_stale';
  else if (manualHasData) dataStatus = autoHasData ? 'manual_plus_public_news' : 'manual_verified';
  else if (autoHasData) dataStatus = 'public_news_signal';
  else if (auto.status === 'source_error') dataStatus = 'source_error';

  return {
    ...emptyRecord(),
    transfers_in: uniqueList(manual.transfers_in || [], transferInDetails),
    transfers_out: uniqueList(manual.transfers_out || [], transferOutDetails),
    injured_players: uniqueList(manual.injured_players || [], injuredDetails),
    suspended_players: uniqueList(manual.suspended_players || [], suspendedDetails),
    doubtful_players: uniqueList(manual.doubtful_players || [], doubtfulDetails),
    player_impacts: uniquePlayers(injuredDetails, suspendedDetails, doubtfulDetails),
    transfer_details: { in: transferInDetails, out: transferOutDetails },
    availability_checked: Boolean(structured.availability_checked),
    lineup_confirmed: Boolean(structured.lineup_confirmed),
    provider_team_id: structured.provider_team_id || null,
    squad_note: manual.squad_note || '',
    source_note: sourceParts.join(' | '),
    evidence,
    injury_news_count: (auto.injury_news || []).length,
    suspension_news_count: (auto.suspension_news || []).length,
    doubtful_news_count: (auto.doubtful_news || []).length,
    transfer_in_news_count: (auto.transfer_in_news || []).length,
    transfer_out_news_count: (auto.transfer_out_news || []).length,
    auto_risk_score: Number(auto.auto_risk_score || 0),
    verified_source_count: Number(manualHasAvailability) + Number(structuredAvailabilityData),
    structured_fact_source_count: Number(structuredHasData),
    data_status: dataStatus
  };
}

function hasVerifiedData(record) {
  return Number(record.verified_source_count || 0) > 0
    || Boolean(record.availability_checked || record.lineup_confirmed);
}

function countRisk(record) {
  let risk = 0;
  risk += (record.injured_players || []).length * 4;
  risk += (record.suspended_players || []).length * 5;
  risk += (record.doubtful_players || []).length * 2;
  risk += (record.transfers_out || []).length * 1;
  risk -= Math.min(3, (record.transfers_in || []).length);
  risk += Number(record.auto_risk_score || 0);
  const impactBonus = (record.player_impacts || []).reduce((sum, player) => {
    const base = player.status === 'suspension' ? 5 : player.status === 'doubtful' ? 2 : 4;
    return sum + Math.max(0, Number(player.impact_score || 0) - base);
  }, 0);
  risk += Math.min(6, impactBonus);
  if (!hasVerifiedData(record)) return risk > 0 ? (risk >= 12 ? 'Yüksek' : 'Orta') : 'Belirsiz';
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
  const highImpact = (record.player_impacts || []).filter((player) => player.impact_level === 'Yüksek').map((player) => player.name);
  if (highImpact.length) parts.push(`${teamName} yüksek etkili eksik: ${highImpact.join(', ')}`);
  if (record.lineup_confirmed) parts.push(`${teamName} ilk 11'i doğrulandı`);
  else if (record.availability_checked && !(record.injured_players || []).length && !(record.suspended_players || []).length && !(record.doubtful_players || []).length) parts.push(`${teamName} için sağlayıcı akışında doğrulanmış eksik görünmüyor`);
  if (record.squad_note) parts.push(`${teamName} not: ${record.squad_note}`);
  if (record.injury_news_count) parts.push(`${teamName} için ${record.injury_news_count} güncel sakatlık haberi sinyali bulundu`);
  if (record.suspension_news_count) parts.push(`${teamName} için ${record.suspension_news_count} ceza/men haberi sinyali bulundu`);
  if (record.doubtful_news_count) parts.push(`${teamName} için ${record.doubtful_news_count} belirsiz oyuncu haberi sinyali bulundu`);
  if (record.transfer_in_news_count || record.transfer_out_news_count) parts.push(`${teamName} transfer gündemi: +${record.transfer_in_news_count || 0} / -${record.transfer_out_news_count || 0} haber sinyali`);
  if (!parts.length) return `${teamName} için doğrulanmış kadro/transfer haberi bulunamadı; risksiz varsayılmadı.`;
  return parts.join(' | ');
}

function combineRisk(homeRisk, awayRisk) {
  if (homeRisk === 'Yüksek' || awayRisk === 'Yüksek') return 'Yüksek';
  if (homeRisk === 'Belirsiz' || awayRisk === 'Belirsiz') return 'Belirsiz';
  if (homeRisk === 'Orta' || awayRisk === 'Orta') return 'Orta';
  return 'Düşük';
}

function buildTeamStatusSignals() {
  const full = readJson(path.join(dataDir, 'full-bulletin.json'), { matches: [] }).matches || [];
  const analysis = readJson(path.join(dataDir, 'robot-analysis.json'), { matches: [] }).matches || [];
  const live = readJson(path.join(dataDir, 'live-matches.json'), { matches: [] }).matches || [];
  const rows = full.length ? full : (analysis.length ? analysis : live);
  const manualDb = readJson(path.join(dataDir, 'team-status-manual.json'), { teams: {} });
  const autoDb = readJson(path.join(dataDir, 'team-status-auto.json'), { teams: {} });
  const playerDb = readJson(path.join(dataDir, 'player-intelligence.json'), { teams: {} });
  const structuredByMatch = new Map((playerDb.matches || []).map((row) => [`${String(row.date || '').slice(0, 10)}|${clean(row.match_name || `${row.home} VS ${row.away}`)}`, row]));
  const matches = rows.map((row) => {
    const t = teams(row);
    const structuredMatch = structuredByMatch.get(`${String(row.date || row.tarih || '').slice(0, 10)}|${clean(row.match_name || row.match || `${t.home} VS ${t.away}`)}`);
    const matchPlayerDb = structuredMatch ? { teams: { [t.home]: structuredMatch.home_team, [t.away]: structuredMatch.away_team } } : playerDb;
    const homeRecord = mergeTeamRecord(t.home, manualDb, autoDb, matchPlayerDb);
    const awayRecord = mergeTeamRecord(t.away, manualDb, autoDb, matchPlayerDb);
    const homeRisk = countRisk(homeRecord);
    const awayRisk = countRisk(awayRecord);
    const overallRisk = combineRisk(homeRisk, awayRisk);
    return {
      match_name: row.match_name || row.match || `${t.home} VS ${t.away}`,
      date: String(row.date || row.tarih || '').slice(0, 10),
      league: row.league || row.competition_name || '-',
      start_time: row.start_time || row.time || '-',
      home_team: t.home,
      away_team: t.away,
      squad_risk_level: overallRisk,
      home_squad_risk_level: homeRisk,
      away_squad_risk_level: awayRisk,
      home_status: homeRecord,
      away_status: awayRecord,
      verified_team_count: [homeRecord, awayRecord].filter(hasVerifiedData).length,
      signal_team_count: [homeRecord, awayRecord].filter((record) => record.evidence.length || hasVerifiedData(record)).length,
      named_player_count: homeRecord.injured_players.length + homeRecord.suspended_players.length + homeRecord.doubtful_players.length
        + awayRecord.injured_players.length + awayRecord.suspended_players.length + awayRecord.doubtful_players.length,
      robot_comment: `${buildComment(t.home, homeRecord)} | ${buildComment(t.away, awayRecord)}`
    };
  });
  const output = {
    generated_at: new Date().toISOString(),
    date: todayTR(),
    match_count: matches.length,
    structured_source_status: playerDb.status || 'not_available',
    named_player_count: matches.reduce((sum, match) => sum + match.named_player_count, 0),
    policy: 'API-Football structured player facts, manual verification and public-news signals are kept distinct. Missing news is not treated as proof of a healthy squad.',
    matches
  };
  writeJson(path.join(dataDir, 'team-status-signals.json'), output);
  writeJson(path.join(dataDir, 'archive', `${todayTR()}-team-status.json`), output);
  console.log(`Team status signals updated: ${matches.length} matches.`);
}

if (require.main === module) buildTeamStatusSignals();
module.exports = { buildTeamStatusSignals, mergeTeamRecord, countRisk, combineRisk, buildComment, hasVerifiedData };
