const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dataDir = path.join(root, 'data');
const robotDataDir = path.join(root, 'bu-klas-r-i-in-basit', 'data');

const siteFixturesPath = path.join(dataDir, 'fixtures.json');
const robotPoolPath = path.join(robotDataDir, 'ham_mac_havuzu.json');
const outPath = path.join(dataDir, 'detail-raw-signals.json');

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
}

function dotToIso(value) {
  const text = String(value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const match = text.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return text;
  return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`;
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

function keyOf(row) {
  return [
    dotToIso(row.date || row.tarih || row.utc_date),
    row.time || row.saat || '',
    clean(row.home || row.home_team_name || row.ev_sahibi),
    clean(row.away || row.away_team_name || row.deplasman)
  ].join('|');
}

function isCode(value) {
  return /^\d{4,5}$/.test(String(value || '').trim());
}

function asOdd(value) {
  const text = String(value || '').trim().replace(',', '.');
  if (!/^\d{1,3}\.\d{1,3}$/.test(text)) return null;
  const n = Number(text);
  return Number.isFinite(n) && n > 1 ? Number(n.toFixed(2)) : null;
}

/*
 * CRITICAL MARKET PROVENANCE RULE
 * -------------------------------
 * raw_cells only tells us that a numeric odds block exists. The number of
 * values (2, 3, 4, 9...) or the block position does NOT identify the market.
 * A two-way block may be BTTS, 2.5 O/U, 3.5 O/U, a half market, a team total,
 * etc. Mapping the same pair to every possible market creates false odds and
 * can make the PRO scorer recommend the wrong market.
 *
 * Therefore anonymous raw blocks are diagnostic-only. Market semantics must
 * come from explicitly named structured fields (odds/oranlar/detay_oranlar)
 * or another verified source. These helpers intentionally return no candidates.
 */
function twoWayCandidates() { return []; }
function threeWayCandidates() { return []; }
function fourWayCandidates() { return []; }
function nineWayCandidates() { return []; }
function candidatesForBlock() { return []; }

function namedBlock(_index, block) {
  return {
    ...block,
    guess: 'Belirsiz market',
    named_values: {},
    detail_market_candidates: [],
    market_identity_verified: false,
    market_identity_source: 'unlabeled_raw_block'
  };
}

function parseBlocks(cells = []) {
  const blocks = [];
  for (let i = 0; i < cells.length; i += 1) {
    if (!isCode(cells[i])) continue;
    const values = [];
    for (let j = i + 1; j < cells.length && !isCode(cells[j]); j += 1) {
      const odd = asOdd(cells[j]);
      if (odd) values.push(odd);
    }
    if (values.length) blocks.push({ market_code: String(cells[i]).trim(), values });
  }
  return blocks.map((block, index) => namedBlock(index, block));
}

function flattenGuesses(blocks = []) {
  const out = {};
  for (const block of blocks) {
    for (const [key, value] of Object.entries(block.named_values || {})) {
      if (out[key] === undefined) out[key] = value;
    }
  }
  return out;
}

function flattenCandidates(blocks = []) {
  return blocks.flatMap((block) => (block.detail_market_candidates || []).map((candidate) => ({
    market_code: block.market_code,
    market: candidate.market,
    values: candidate.values
  })));
}

function enrichFixtures() {
  const fixtures = readJson(siteFixturesPath, []);
  const pool = readJson(robotPoolPath, { matches: [] });
  const rawMap = new Map();

  for (const row of pool.matches || []) {
    const blocks = parseBlocks(row.raw_cells || []);
    if (!blocks.length) continue;
    rawMap.set(keyOf(row), {
      matchCode: row.mac_kodu || row.matchCode || null,
      raw_market_blocks: blocks,
      raw_market_guess_odds: flattenGuesses(blocks),
      detail_market_candidates: flattenCandidates(blocks),
      raw_market_block_count: blocks.length,
      raw_market_value_count: blocks.reduce((sum, block) => sum + block.values.length, 0)
    });
  }

  const enriched = fixtures.map((fixture) => {
    const details = rawMap.get(keyOf(fixture));
    if (!details) return fixture;
    return {
      ...fixture,
      raw_market_blocks: details.raw_market_blocks,
      raw_market_guess_odds: details.raw_market_guess_odds,
      detail_market_candidates: details.detail_market_candidates,
      raw_market_block_count: details.raw_market_block_count,
      raw_market_value_count: details.raw_market_value_count,
      raw_market_source: 'Robot ham veri hücreleri',
      raw_market_identity_status: 'unverified'
    };
  });

  const signals = enriched
    .filter((item) => Array.isArray(item.raw_market_blocks) && item.raw_market_blocks.length)
    .map((item) => ({
      match_name: `${item.home || item.home_team_name || item.ev_sahibi} VS ${item.away || item.away_team_name || item.deplasman}`,
      league: item.league || item.competition_name || item.lig || '-',
      date: item.date || item.tarih || item.utc_date || '-',
      time: item.time || item.saat || '-',
      raw_market_guess_odds: item.raw_market_guess_odds,
      detail_market_candidates: item.detail_market_candidates,
      raw_market_blocks: item.raw_market_blocks,
      raw_market_block_count: item.raw_market_block_count,
      raw_market_value_count: item.raw_market_value_count,
      raw_market_identity_status: item.raw_market_identity_status || 'unverified'
    }));

  writeJson(siteFixturesPath, enriched);
  writeJson(outPath, {
    generated_at: new Date().toISOString(),
    market_identity_policy: 'unlabeled_raw_blocks_are_diagnostic_only',
    match_count: signals.length,
    matches: signals
  });
  console.log(`Raw market blocks added safely: ${signals.length}; anonymous market guesses blocked.`);
}

if (require.main === module) enrichFixtures();
module.exports = {
  enrichFixtures,
  parseBlocks,
  namedBlock,
  candidatesForBlock,
  twoWayCandidates,
  threeWayCandidates,
  fourWayCandidates,
  nineWayCandidates,
  flattenGuesses,
  flattenCandidates
};
