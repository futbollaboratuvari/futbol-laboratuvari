const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data');
const MAX_TEAMS = Math.max(4, Number(process.env.TEAM_NEWS_MAX_TEAMS || 30));
const CONCURRENCY = Math.max(1, Math.min(6, Number(process.env.TEAM_NEWS_CONCURRENCY || 4)));
const REQUEST_TIMEOUT_MS = Math.max(3000, Number(process.env.TEAM_NEWS_TIMEOUT_MS || 9000));

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
  injury: /\b(injur(?:y|ed|ies)|ruled out|out injured|fitness doubt|hamstring|muscle injury|knee injury|ankle injury|sakat|sakatlik|sakatlık|sakatlandi|sakatlandı)\b/i,
  suspension: /\b(suspend(?:ed|sion)|ban(?:ned)?|red card ban|yellow card ban|cezali|cezalı|kart cezasi|kart cezası|men cezası)\b/i,
  doubtful: /\b(doubtful|questionable|fitness test|late test|belirsiz|durumu belirsiz|şüpheli|supheli)\b/i,
  transfer_in: /\b(signs?|signed|signing|joins?|joined|arrival|loan signing|transfer edildi|transfer etti|kadrosuna katti|kadrosuna kattı|anlasti|anlaştı)\b/i,
  transfer_out: /\b(leaves?|left|depart(?:s|ed|ure)?|sold|loaned out|transfer oldu|ayrildi|ayrıldı|veda etti)\b/i,
};

function classifyItem(item) {
  const text = `${item.title || ''} ${item.description || ''}`;
  const categories = Object.entries(CATEGORY_RULES).filter(([, regex]) => regex.test(text)).map(([key]) => key);
  return categories;
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
      if (out.length >= MAX_TEAMS) return out;
    }
  }
  return out;
}

function readUpcomingRows() {
  const full = readJson(path.join(dataDir, 'full-bulletin.json'), {});
  const live = readJson(path.join(dataDir, 'live-matches.json'), { matches: [] });
  const analysis = readJson(path.join(dataDir, 'robot-analysis.json'), { matches: [] });
  const candidates = [full.matches, full.scheduled_matches, live.matches, analysis.matches];
  return candidates.find((rows) => Array.isArray(rows) && rows.length) || [];
}

function googleNewsUrl(teamName) {
  const q = `"${teamName}" football (injury OR injured OR suspended OR transfer OR signing OR sakat OR cezalı OR transfer)`;
  return `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en&gl=US&ceid=US:en`;
}

async function fetchText(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: { 'user-agent': 'FutbolLaboratuvari/1.0 team-intelligence; public-rss-only' },
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
  try {
    const xml = await fetchText(url);
    const evidence = evidenceForTeam(teamName, parseRss(xml));
    return {
      team_name: teamName,
      key: clean(teamName),
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

async function buildTeamNewsAuto() {
  const rows = readUpcomingRows();
  const teamNames = teamsFromRows(rows);
  if (process.env.TEAM_NEWS_DISABLED === '1') {
    console.log('Team news auto disabled by TEAM_NEWS_DISABLED=1.');
    return;
  }
  const records = await mapLimit(teamNames, CONCURRENCY, collectTeam);
  const teams = {};
  records.forEach((record) => { teams[record.team_name] = record; teams[record.key] = record; });
  const output = {
    generated_at: new Date().toISOString(),
    date: todayTR(),
    provider: 'Google News public RSS search',
    policy: 'Public RSS only. Headlines are evidence signals, not confirmed player status unless separately verified. No login/paywall bypass.',
    team_count: teamNames.length,
    source_error_count: records.filter((row) => row.status === 'source_error').length,
    teams,
  };
  writeJson(path.join(dataDir, 'team-status-auto.json'), output);
  writeJson(path.join(dataDir, 'archive', `${todayTR()}-team-status-auto.json`), output);
  console.log(`Team public-news intelligence updated: ${teamNames.length} teams, ${output.source_error_count} source errors.`);
}

if (require.main === module) {
  buildTeamNewsAuto().catch((error) => {
    console.error(`Team news auto failed: ${error?.stack || error}`);
    process.exitCode = 1;
  });
}

module.exports = { buildTeamNewsAuto, parseRss, classifyItem, evidenceForTeam, evidenceRisk, clean };
