const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data');
const MAX_TEAMS = Math.max(4, Number(process.env.TEAM_NEWS_MAX_TEAMS || 40));
const CONCURRENCY = Math.max(1, Math.min(6, Number(process.env.TEAM_NEWS_CONCURRENCY || 4)));
const REQUEST_TIMEOUT_MS = Math.max(3000, Number(process.env.TEAM_NEWS_TIMEOUT_MS || 9000));
const CACHE_HOURS = Math.max(1, Number(process.env.TEAM_NEWS_CACHE_HOURS || 6));

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

function decodeXml(value) {
  return String(value || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tagValue(block, tag) {
  const match = String(block || '').match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeXml(match[1]) : '';
}

function sourceValue(block) {
  const match = String(block || '').match(/<source(?:\s+url="([^"]+)")?[^>]*>([\s\S]*?)<\/source>/i);
  return match ? { url: decodeXml(match[1] || ''), name: decodeXml(match[2] || '') } : { url: '', name: '' };
}

function parseRss(xml) {
  const blocks = String(xml || '').match(/<item\b[\s\S]*?<\/item>/gi) || [];
  return blocks.map((block) => {
    const source = sourceValue(block);
    return {
      title: tagValue(block, 'title'),
      link: tagValue(block, 'link'),
      description: tagValue(block, 'description'),
      published_at: tagValue(block, 'pubDate'),
      source_name: source.name,
      source_url: source.url,
    };
  }).filter((item) => item.title && item.link);
}

const CATEGORY_RULES = {
  injury: /(injur(?:y|ed|ies)|ruled out|out injured|fitness doubt|hamstring|muscle injury|knee injury|ankle injury|sakat|sakatlik|lesion|lesionado|lesionados|baja|desfalque|contusao|machucado)/i,
  suspension: /(suspend(?:ed|sion)|ban(?:ned)?|red card ban|yellow card ban|red card|yellow card|cezali|kart cezasi|men cezasi|suspendido|sancionado|suspenso|expulso)/i,
  doubtful: /(doubtful|questionable|fitness test|late test|belirsiz|durumu belirsiz|supheli|duda|duvida)/i,
  transfer_in: /(signs?|signed|signing|joins?|joined|arrival|loan signing|transfer edildi|transfer etti|kadrosuna katti|anlasti|fichaje|refuerzo|contratacion|contratacao|reforco|nuevo jugador|novo jogador)/i,
  transfer_out: /(leaves?|left|depart(?:s|ed|ure)?|sold|loaned out|transfer oldu|ayrildi|veda etti|salida|traspaso|vendido|venda|deixa o clube|sai do clube)/i,
};

function classifyItem(item) {
  const text = clean(`${item.title || ''} ${item.description || ''}`);
  return Object.entries(CATEGORY_RULES).filter(([, regex]) => regex.test(text)).map(([key]) => key);
}

function itemAgeDays(item, now = Date.now()) {
  const time = Date.parse(item.published_at || '');
  return Number.isFinite(time) ? Math.max(0, (now - time) / 86400000) : 999;
}

function isRelevantToTeam(item, teamName) {
  const haystack = clean(`${item.title} ${item.description}`);
  const team = clean(teamName);
  if (!team || team.length < 3) return false;
  if (haystack.includes(team)) return true;
  const strongTokens = team.split(' ').filter((token) => token.length >= 5);
  return strongTokens.length > 0 && strongTokens.filter((token) => haystack.includes(token)).length >= Math.min(2, strongTokens.length);
}

function evidenceForTeam(teamName, items) {
  const now = Date.now();
  const seen = new Set();
  const evidence = [];
  for (const item of items || []) {
    if (!isRelevantToTeam(item, teamName)) continue;
    const categories = classifyItem(item);
    if (!categories.length) continue;
    const ageDays = itemAgeDays(item, now);
    const allowed = categories.some((category) => category.startsWith('transfer_') ? ageDays <= 120 : ageDays <= 28);
    if (!allowed) continue;
    const dedupeKey = clean(`${item.title}|${item.source_name}`);
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    evidence.push({
      ...item,
      categories,
      age_days: Number(ageDays.toFixed(1)),
      confidence: item.source_name ? 'medium' : 'low',
    });
    if (evidence.length >= 12) break;
  }
  return evidence;
}

function evidenceRisk(evidence) {
  let score = 0;
  for (const item of evidence || []) {
    const ageFactor = item.age_days <= 7 ? 1 : item.age_days <= 14 ? 0.75 : 0.5;
    if (item.categories.includes('suspension')) score += 5 * ageFactor;
    if (item.categories.includes('injury')) score += 4 * ageFactor;
    if (item.categories.includes('doubtful')) score += 2 * ageFactor;
    if (item.categories.includes('transfer_out')) score += 1 * ageFactor;
    if (item.categories.includes('transfer_in')) score -= 0.5 * ageFactor;
  }
  return Math.max(0, Number(score.toFixed(1)));
}

function teamsFromRows(rows) {
  const out = [];
  const seen = new Set();
  for (const row of rows || []) {
    const title = String(row.match_name || row.match || '');
    const parts = title.includes(' VS ') ? title.split(' VS ') : [];
    const candidates = [
      row.home || row.home_team_name || row.ev_sahibi || parts[0],
      row.away || row.away_team_name || row.deplasman || parts[1],
    ];
    for (const value of candidates) {
      const name = String(value || '').trim();
      const key = clean(name);
      if (!name || !key || seen.has(key)) continue;
      seen.add(key);
      out.push(name);
    }
  }
  return out;
}

function readUpcomingRows() {
  const full = readJson(path.join(dataDir, 'full-bulletin.json'), {});
  const analysis = readJson(path.join(dataDir, 'robot-analysis.json'), { matches: [] });
  const live = readJson(path.join(dataDir, 'live-matches.json'), { matches: [] });
  const rows = [];
  const seen = new Set();
  for (const sourceRows of [full.matches, full.scheduled_matches, analysis.matches, live.matches]) {
    for (const row of Array.isArray(sourceRows) ? sourceRows : []) {
      const home = row.home || row.home_team_name || row.ev_sahibi || '';
      const away = row.away || row.away_team_name || row.deplasman || '';
      const key = clean(`${home}|${away}|${row.match_name || row.match || ''}`);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      rows.push(row);
    }
  }
  return rows;
}

function googleNewsUrl(teamName) {
  const team = String(teamName || '').replace(/["()]/g, ' ').replace(/\s+/g, ' ').trim();
  const q = `(\"${team}\" OR ${team}) (football OR soccer OR futbol OR futebol) (injury OR injured OR suspended OR transfer OR signing OR sakat OR cezalı OR lesion OR lesionado OR suspendido OR fichaje OR refuerzo OR lesao OR desfalque OR suspenso OR contratacao OR reforco)`;
  return `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en&gl=US&ceid=US:en`;
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { 'user-agent': 'FutbolLaboratuvari/1.1 team-intelligence; public-rss-only' },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

async function collectTeam(teamName) {
  const url = googleNewsUrl(teamName);
  const checkedAt = new Date().toISOString();
  try {
    const xml = await fetchText(url);
    const evidence = evidenceForTeam(teamName, parseRss(xml));
    return {
      team_name: teamName,
      key: clean(teamName),
      checked_at: checkedAt,
      status: evidence.length ? 'public_news_found' : 'no_recent_public_news',
      auto_risk_score: evidenceRisk(evidence),
      evidence_count: evidence.length,
      injury_news: evidence.filter((item) => item.categories.includes('injury')),
      suspension_news: evidence.filter((item) => item.categories.includes('suspension')),
      doubtful_news: evidence.filter((item) => item.categories.includes('doubtful')),
      transfer_in_news: evidence.filter((item) => item.categories.includes('transfer_in')),
      transfer_out_news: evidence.filter((item) => item.categories.includes('transfer_out')),
      evidence,
      sources: [...new Set(evidence.map((item) => item.source_name).filter(Boolean))].slice(0, 8),
      query_url: url,
    };
  } catch (error) {
    return {
      team_name: teamName,
      key: clean(teamName),
      checked_at: checkedAt,
      status: 'source_error',
      auto_risk_score: 0,
      evidence_count: 0,
      evidence: [],
      injury_news: [], suspension_news: [], doubtful_news: [], transfer_in_news: [], transfer_out_news: [],
      sources: [],
      query_url: url,
      error: String(error?.message || error),
    };
  }
}

async function mapLimit(values, limit, fn) {
  const results = new Array(values.length);
  let index = 0;
  async function worker() {
    while (true) {
      const current = index++;
      if (current >= values.length) return;
      results[current] = await fn(values[current], current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, worker));
  return results;
}

function cacheRecord(teamName, cache) {
  return cache?.teams?.[teamName] || cache?.teams?.[clean(teamName)] || null;
}

function isFresh(record, now = Date.now()) {
  const checked = Date.parse(record?.checked_at || record?.generated_at || '');
  return Number.isFinite(checked) && now - checked < CACHE_HOURS * 3600000;
}

async function buildTeamNewsAuto() {
  if (process.env.TEAM_NEWS_DISABLED === '1') {
    console.log('Team news auto disabled by TEAM_NEWS_DISABLED=1.');
    return;
  }
  const rows = readUpcomingRows();
  const teamNames = teamsFromRows(rows);
  const previous = readJson(path.join(dataDir, 'team-status-auto.json'), { teams: {} });
  const now = Date.now();
  const staleTeams = teamNames.filter((name) => !isFresh(cacheRecord(name, previous), now));
  const batch = staleTeams.slice(0, MAX_TEAMS);
  const refreshed = await mapLimit(batch, CONCURRENCY, collectTeam);
  const refreshedByKey = new Map(refreshed.map((record) => [record.key, record]));
  const teams = {};
  for (const name of teamNames) {
    const key = clean(name);
    const record = refreshedByKey.get(key) || cacheRecord(name, previous) || {
      team_name: name,
      key,
      checked_at: null,
      status: 'pending_refresh',
      auto_risk_score: 0,
      evidence_count: 0,
      evidence: [],
      injury_news: [], suspension_news: [], doubtful_news: [], transfer_in_news: [], transfer_out_news: [],
      sources: [],
      query_url: googleNewsUrl(name),
    };
    teams[name] = record;
    teams[key] = record;
  }
  const currentRecords = teamNames.map((name) => teams[name]);
  const output = {
    generated_at: new Date().toISOString(),
    date: todayTR(),
    provider: 'Google News public RSS search (multilingual)',
    policy: 'Public RSS only. Headlines are evidence signals, not confirmed player status unless separately verified. No login/paywall bypass. Team records are cached to limit requests.',
    cache_hours: CACHE_HOURS,
    team_count: teamNames.length,
    refreshed_team_count: refreshed.length,
    pending_team_count: currentRecords.filter((row) => row.status === 'pending_refresh').length,
    public_news_found_count: currentRecords.filter((row) => row.status === 'public_news_found').length,
    source_error_count: currentRecords.filter((row) => row.status === 'source_error').length,
    teams,
  };
  writeJson(path.join(dataDir, 'team-status-auto.json'), output);
  writeJson(path.join(dataDir, 'archive', `${todayTR()}-team-status-auto.json`), output);
  console.log(`Team public-news intelligence updated: ${teamNames.length} tracked, ${refreshed.length} refreshed, ${output.public_news_found_count} with evidence, ${output.source_error_count} source errors.`);
}

if (require.main === module) {
  buildTeamNewsAuto().catch((error) => {
    console.error(`Team news auto failed: ${error?.stack || error}`);
    process.exitCode = 1;
  });
}

module.exports = { buildTeamNewsAuto, parseRss, classifyItem, evidenceForTeam, evidenceRisk, clean, teamsFromRows, isFresh };
