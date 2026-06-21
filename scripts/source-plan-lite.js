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

function norm(value) {
  return String(value || '').toLocaleLowerCase('tr-TR');
}

function isTurkishContext(match) {
  const text = norm(`${match.match_name || match.match || ''} ${match.league || match.competition_name || ''}`);
  return /turkiye|türkiye|super lig|süper lig|1\. lig|2\. lig|3\. lig|ziraat|tff|fenerbahce|fenerbahçe|galatasaray|besiktas|beşiktaş|trabzonspor/.test(text);
}

function basePlanFor(match, sources) {
  const names = new Set(['Mackolik']);
  if (isTurkishContext(match)) {
    ['TRT Spor', 'beIN Sports Turkiye', 'NTV Spor', 'Fanatik', 'Fotomac', 'Ajansspor', 'Sporx'].forEach((name) => names.add(name));
  } else {
    ['NTV Spor', 'Sporx'].forEach((name) => names.add(name));
  }
  return sources.filter((source) => names.has(source.name)).map((source) => ({
    name: source.name,
    url: source.url,
    priority: source.priority,
    use_for: source.use_for,
    status: source.status
  })).sort((a, b) => a.priority - b.priority);
}

function matchName(row) {
  return row.match_name || row.match || `${row.home || row.home_team_name || 'Home'} VS ${row.away || row.away_team_name || 'Away'}`;
}

function buildSourcePlan() {
  const sources = readJson(path.join(dataDir, 'local-football-sources.json'), { sources: [] }).sources || [];
  const live = readJson(path.join(dataDir, 'live-matches.json'), { matches: [] }).matches || [];
  const analysis = readJson(path.join(dataDir, 'robot-analysis.json'), { matches: [] }).matches || [];
  const rows = live.length ? live : analysis;
  const plan = rows.slice(0, 200).map((row) => ({
    match_name: matchName(row),
    league: row.league || row.competition_name || '-',
    start_time: row.start_time || row.time || '-',
    recommended_market: row.recommended_market || row.market || row.selection || '-',
    data_gap_risk: row.data_gap_risk || '-',
    source_plan: basePlanFor(row, sources),
    reading_tasks: [
      'mac_programi_ve_skor_kontrolu',
      'takim_gundemi_kontrolu',
      'mac_onu_yorum_kontrolu',
      'risk_haberi_kontrolu'
    ]
  }));

  const output = {
    generated_at: new Date().toISOString(),
    date: todayTR(),
    source_count: sources.length,
    match_count: plan.length,
    policy: 'Only allowed public data, API, RSS or manual import. No login bypass.',
    plans: plan
  };
  writeJson(path.join(dataDir, 'source-reading-plan.json'), output);
  writeJson(path.join(dataDir, 'archive', `${todayTR()}-source-plan.json`), output);
  console.log(`Source reading plan updated: ${plan.length} matches, ${sources.length} sources.`);
}

if (require.main === module) buildSourcePlan();
module.exports = { buildSourcePlan };
