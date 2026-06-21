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

function twoWayCandidates(values) {
  if (values.length < 2) return [];
  const a = values[0];
  const b = values[1];
  return [
    { market: 'KG Var / Yok', values: { bttsYes_guess: a, bttsNo_guess: b } },
    { market: 'İlk Yarı KG Var / Yok', values: { firstHalfBttsYes_guess: a, firstHalfBttsNo_guess: b } },
    { market: 'İkinci Yarı KG Var / Yok', values: { secondHalfBttsYes_guess: a, secondHalfBttsNo_guess: b } },
    { market: '0.5 Alt / Üst', values: { under05_guess: a, over05_guess: b } },
    { market: '1.5 Alt / Üst', values: { under15_guess: a, over15_guess: b } },
    { market: '2.5 Alt / Üst', values: { under25_guess: a, over25_guess: b } },
    { market: '3.5 Alt / Üst', values: { under35_guess: a, over35_guess: b } },
    { market: '4.5 Alt / Üst', values: { under45_guess: a, over45_guess: b } },
    { market: 'İlk Yarı 0.5 Alt / Üst', values: { firstHalfUnder05_guess: a, firstHalfOver05_guess: b } },
    { market: 'İlk Yarı 1.5 Alt / Üst', values: { firstHalfUnder15_guess: a, firstHalfOver15_guess: b } },
    { market: 'İkinci Yarı 0.5 Alt / Üst', values: { secondHalfUnder05_guess: a, secondHalfOver05_guess: b } },
    { market: 'İkinci Yarı 1.5 Alt / Üst', values: { secondHalfUnder15_guess: a, secondHalfOver15_guess: b } },
    { market: 'Ev Sahibi 1.5 Alt / Üst', values: { homeUnder15_guess: a, homeOver15_guess: b } },
    { market: 'Deplasman 1.5 Alt / Üst', values: { awayUnder15_guess: a, awayOver15_guess: b } }
  ];
}

function threeWayCandidates(values) {
  if (values.length < 3) return [];
  const one = values[0];
  const draw = values[1];
  const two = values[2];
  return [
    { market: 'Maç Sonucu 1/X/2', values: { ms1: one, msx: draw, ms2: two } },
    { market: 'İlk Yarı 1/X/2', values: { firstHalf1_guess: one, firstHalfX_guess: draw, firstHalf2_guess: two } },
    { market: 'İkinci Yarı 1/X/2', values: { secondHalf1_guess: one, secondHalfX_guess: draw, secondHalf2_guess: two } },
    { market: 'Handikap 1/X/2', values: { handicap1_guess: one, handicapX_guess: draw, handicap2_guess: two } }
  ];
}

function fourWayCandidates(values) {
  if (values.length < 4) return [];
  return [
    {
      market: 'İY/2Y KG Kombinasyon',
      values: {
        firstSecondBttsYesYes_guess: values[0],
        firstSecondBttsYesNo_guess: values[1],
        firstSecondBttsNoYes_guess: values[2],
        firstSecondBttsNoNo_guess: values[3]
      }
    },
    {
      market: 'Gol Aralığı',
      values: {
        goalRange01_guess: values[0],
        goalRange23_guess: values[1],
        goalRange45_guess: values[2],
        goalRange6Plus_guess: values[3]
      }
    }
  ];
}

function nineWayCandidates(values) {
  if (values.length < 9) return [];
  return [{
    market: 'İlk Yarı / Maç Sonucu',
    values: {
      htFt11_guess: values[0], htFt1X_guess: values[1], htFt12_guess: values[2],
      htFtX1_guess: values[3], htFtXX_guess: values[4], htFtX2_guess: values[5],
      htFt21_guess: values[6], htFt2X_guess: values[7], htFt22_guess: values[8]
    }
  }];
}

function candidatesForBlock(values) {
  const list = [];
  if (values.length === 2) list.push(...twoWayCandidates(values));
  if (values.length === 3) list.push(...threeWayCandidates(values));
  if (values.length === 4) list.push(...fourWayCandidates(values));
  if (values.length >= 9) list.push(...nineWayCandidates(values));
  return list;
}

function namedBlock(index, block) {
  const values = block.values || [];
  const marketCandidates = candidatesForBlock(values);
  let primary = marketCandidates[0] || { market: 'Ham detay market', values: {} };

  if (index === 0 && values.length >= 3) primary = { market: 'Maç Sonucu 1/X/2', values: { ms1: values[0], msx: values[1], ms2: values[2] } };
  if (index === 1 && values.length >= 2) primary = { market: '2.5 Alt / Üst', values: { under25: values[0], over25: values[1] } };
  if (index === 2 && values.length >= 2) primary = { market: 'KG Var / Yok tahmini', values: { bttsYes_guess: values[0], bttsNo_guess: values[1] } };
  if (index === 3 && values.length >= 2) primary = { market: '3.5 Alt / Üst tahmini', values: { under35_guess: values[0], over35_guess: values[1] } };

  return {
    ...block,
    guess: primary.market,
    named_values: primary.values,
    detail_market_candidates: marketCandidates
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
    if (values.length) {
      blocks.push({ market_code: String(cells[i]).trim(), values });
    }
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
      raw_market_source: 'Robot ham veri hücreleri'
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
      raw_market_value_count: item.raw_market_value_count
    }));

  writeJson(siteFixturesPath, enriched);
  writeJson(outPath, {
    generated_at: new Date().toISOString(),
    match_count: signals.length,
    matches: signals
  });
  console.log(`Raw market blocks added: ${signals.length}`);
}

if (require.main === module) enrichFixtures();
module.exports = { enrichFixtures, parseBlocks, namedBlock, candidatesForBlock };