"use strict";

const fs = require('fs');
const path = require('path');
const { fetchIddaaBulletin, SOURCE_NAME } = require('./iddaa-data-source');

const ROOT = path.resolve(__dirname, '..');
const INPUT = path.join(ROOT, 'data', 'robot-analysis.json');
const OUTPUT = path.join(ROOT, 'data', 'high-odds-htft.json');
const MIN_REAL_ODDS = 11.75;

function number(value) {
  if (value === null || value === undefined || value === '' || value === '-') return null;
  const parsed = Number(String(value).replace(',', '.').replace('%', '').trim());
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function implied(odds) {
  const value = number(odds);
  return value && value > 1 ? 1 / value : null;
}

function normalizeThree(a, x, b) {
  const pa = implied(a);
  const px = implied(x);
  const pb = implied(b);
  if (!pa || !pb) return null;
  const safeX = px || 0.28;
  const total = pa + safeX + pb;
  return { one: pa / total, draw: safeX / total, two: pb / total };
}

function fold(value) {
  return String(value || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function selectionKey(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/[xX]/g, '0')
    .replace(/[-\\]/g, '/');
}

function officialHtFtOdds(event) {
  const groups = Array.isArray(event?.market_groups) ? event.market_groups : [];
  const market = groups.find((group) => {
    const token = fold(`${group?.title || ''} ${group?.description || ''}`);
    return token.includes('ilk yari') && token.includes('mac sonucu');
  });
  if (!market || !Array.isArray(market.outcomes)) return {};

  const result = {};
  for (const outcome of market.outcomes) {
    const key = selectionKey(outcome?.label);
    if (!['1/2', '2/1'].includes(key)) continue;
    const odd = number(outcome?.odd);
    if (odd && odd > 1) result[key] = odd;
  }
  return result;
}

function officialEventMap(bulletin) {
  const map = new Map();
  for (const event of Array.isArray(bulletin?.matches) ? bulletin.matches : []) {
    const id = String(event?.iddaa_event_id || event?.match_code || event?.matchCode || event?.id || '').trim();
    if (id) map.set(id, event);
  }
  return map;
}

function firstHalfMarket(item) {
  const candidates = Array.isArray(item.detail_market_candidates) ? item.detail_market_candidates : [];
  for (const candidate of candidates) {
    const market = String(candidate.market || '').toLocaleLowerCase('tr-TR');
    const values = candidate.values || {};
    if (!market.includes('ilk yarı') && !market.includes('ilk yari')) continue;
    const one = number(values.firstHalf1 ?? values.firstHalf1_guess ?? values.iy1 ?? values['1']);
    const draw = number(values.firstHalfX ?? values.firstHalfX_guess ?? values.iyx ?? values.x);
    const two = number(values.firstHalf2 ?? values.firstHalf2_guess ?? values.iy2 ?? values['2']);
    if (one && two) return { one, draw, two, source: 'detail_market_candidates' };
  }
  return null;
}

function fullTimeMarket(item) {
  const odds = item.available_odds || item.odds || {};
  const raw = item.raw_market_guess_odds || {};
  return {
    one: number(odds.ms1 ?? raw.ms1),
    draw: number(odds.msx ?? raw.msx),
    two: number(odds.ms2 ?? raw.ms2)
  };
}

function opennessScore(item) {
  const odds = item.available_odds || item.odds || {};
  const raw = item.raw_market_guess_odds || {};
  const over = implied(odds.over25 ?? raw.over25 ?? raw.over25_guess);
  const under = implied(odds.under25 ?? raw.under25 ?? raw.under25_guess);
  let overShare = 0.5;
  if (over && under) overShare = over / (over + under);

  const yes = implied(odds.bttsYes ?? raw.bttsYes ?? raw.bttsYes_guess);
  const no = implied(odds.bttsNo ?? raw.bttsNo ?? raw.bttsNo_guess);
  let bttsShare = 0.5;
  if (yes && no) bttsShare = yes / (yes + no);

  return clamp((overShare * 0.65) + (bttsShare * 0.35), 0.25, 0.78);
}

function collectMatches(data) {
  const pools = [data.matches, data.watchlist, data.coupon_candidates, data.predictions, data.items]
    .filter(Array.isArray)
    .flat();
  const seen = new Set();
  return pools.filter((item) => {
    const key = [item.match_code || item.matchCode || '', item.date || '', item.match_name || `${item.home || ''}-${item.away || ''}`].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function seniorLeagueFactor(item) {
  const text = `${item.league || ''} ${item.match_name || ''}`.toLocaleLowerCase('tr-TR');
  if (/u19|u20|u21|u23|youth|genç|genc|rezerv|reserve|friendly|hazırlık|hazirlik/.test(text)) return 0.9;
  return 1;
}

function reasonFor(item, market, ft, fh, openness, dataCompleteness, modelScore) {
  const direction = market === '1/2'
    ? 'İlk yarı ev sahibi yönü ile maç sonu deplasman yönü'
    : 'İlk yarı deplasman yönü ile maç sonu ev sahibi yönü';
  const openText = openness >= 0.56
    ? 'Gol/açık oyun sinyali ters sonuç senaryosunu destekliyor.'
    : 'Ters sonuç sinyali var; gol temposu nedeniyle risk seviyesi yüksek tutuldu.';
  const dataText = dataCompleteness >= 55
    ? `Veri kapsamı %${Math.round(dataCompleteness)}, ana model gücü %${Math.round(modelScore)}.`
    : `Veri kapsamı %${Math.round(dataCompleteness)} olduğu için seçim yüksek risk etiketiyle sunuluyor.`;
  return `${direction} aynı maçta birlikte güçleniyor. ${openText} ${dataText}`;
}

function analyzeMatch(item, targetDate, officialById) {
  const date = String(item.date || '').slice(0, 10);
  if (targetDate && date && date !== targetDate) return null;
  const status = String(item.status || 'scheduled').toLowerCase();
  if (status && !['scheduled', 'not_started', 'upcoming', 'fixture'].includes(status)) return null;

  const eventId = String(item.iddaa_event_id || item.match_code || item.matchCode || item.event_id || '').trim();
  if (!eventId) return null;
  const officialEvent = officialById.get(eventId);
  if (!officialEvent || String(officialEvent.status || 'scheduled').toLowerCase() === 'live') return null;
  if (date && officialEvent.date && String(officialEvent.date).slice(0, 10) !== date) return null;

  const realOdds = officialHtFtOdds(officialEvent);
  if (!Object.keys(realOdds).length) return null;

  const ftOdds = fullTimeMarket(item);
  if (!ftOdds.one || !ftOdds.two) return null;
  const ft = normalizeThree(ftOdds.one, ftOdds.draw, ftOdds.two);
  if (!ft) return null;

  const fhOdds = firstHalfMarket(item);
  let fh = fhOdds ? normalizeThree(fhOdds.one, fhOdds.draw, fhOdds.two) : null;
  const halfSource = fhOdds?.source || 'derived_from_full_time_direction';
  if (!fh) {
    const drawBoost = 0.41;
    const remaining = 1 - drawBoost;
    const sideTotal = ft.one + ft.two;
    fh = {
      one: remaining * (ft.one / sideTotal),
      draw: drawBoost,
      two: remaining * (ft.two / sideTotal)
    };
  }

  const openness = opennessScore(item);
  const dataCompleteness = clamp(number(item.data_completeness) ?? 35, 0, 100);
  const modelScore = clamp(number(item.model_score ?? item.analysis_score ?? item.confidence_score) ?? 45, 0, 100);
  const quality = clamp((dataCompleteness * 0.45 + modelScore * 0.55) / 100, 0.25, 0.9);
  const seniorFactor = seniorLeagueFactor(item);
  const reversalFactor = 0.5 + openness * 0.4;

  const scenarios = [
    { market: '1/2', joint: fh.one * ft.two },
    { market: '2/1', joint: fh.two * ft.one }
  ].map((scenario) => {
    const probability = clamp(scenario.joint * reversalFactor * seniorFactor, 0.018, 0.085);
    const balance = 1 - Math.abs(ft.one - ft.two);
    const signal = clamp(
      44 + balance * 13 + openness * 14 + quality * 13 + (scenario.joint * 35),
      48,
      82
    );
    return { ...scenario, probability, signal, bookmakerOdds: number(realOdds[scenario.market]) };
  }).filter((scenario) => scenario.bookmakerOdds && scenario.bookmakerOdds >= MIN_REAL_ODDS);

  if (!scenarios.length) return null;
  const best = scenarios.sort((a, b) => b.signal - a.signal || b.probability - a.probability)[0];
  const home = item.home || item.home_team || String(item.match_name || '').split(/\s+VS\s+|\s+-\s+/i)[0] || 'Ev Sahibi';
  const away = item.away || item.away_team || String(item.match_name || '').split(/\s+VS\s+|\s+-\s+/i)[1] || 'Deplasman';
  const matchName = item.match_name || `${home} - ${away}`;
  const bookmakerOdds = Number(best.bookmakerOdds.toFixed(2));

  return {
    match_code: item.match_code || item.matchCode || eventId,
    iddaa_event_id: eventId,
    date: date || targetDate,
    time: item.start_time || item.time || officialEvent.time || '-',
    league: item.league || officialEvent.league || '-',
    home,
    away,
    match_name: matchName,
    market: best.market,
    model_confidence: Math.round(best.signal),
    scenario_probability: Number((best.probability * 100).toFixed(1)),
    bookmaker_odds: bookmakerOdds,
    real_odds: bookmakerOdds,
    model_odds: bookmakerOdds,
    odds_source: officialEvent.oddsSource || officialEvent.source || SOURCE_NAME,
    odds_verified: true,
    risk_level: 'Yüksek',
    data_completeness: Math.round(dataCompleteness),
    source_model_score: Math.round(modelScore),
    first_half_signal_source: halfSource,
    reason: reasonFor(item, best.market, ft, fh, openness, dataCompleteness, modelScore)
  };
}

async function buildOutput(source, officialBulletin) {
  const targetDate = String(source.date || source.generated_at || new Date().toISOString()).slice(0, 10);
  const matches = collectMatches(source);
  const officialById = officialEventMap(officialBulletin);
  const analyzed = matches
    .map((item) => analyzeMatch(item, targetDate, officialById))
    .filter(Boolean)
    .sort((a, b) => b.model_confidence - a.model_confidence || b.scenario_probability - a.scenario_probability);

  const selected = [];
  const usedMatches = new Set();
  for (const candidate of analyzed) {
    const key = `${candidate.date}|${candidate.match_code || candidate.match_name}`;
    if (usedMatches.has(key)) continue;
    usedMatches.add(key);
    selected.push(candidate);
    if (selected.length === 3) break;
  }

  return {
    generated_at: new Date().toISOString(),
    date: targetDate,
    engine: 'Futbol Laboratuvarı Yüksek Oran İY/MS v2',
    source: 'data/robot-analysis.json + iddaa.com resmi futbol bülteni',
    odds_source: officialBulletin?.source || SOURCE_NAME,
    market_scope: ['1/2', '2/1'],
    scan_count: matches.filter((item) => !targetDate || !item.date || String(item.date).slice(0, 10) === targetDate).length,
    official_match_count: officialById.size,
    candidate_count: analyzed.length,
    selected_count: selected.length,
    target_card_count: 3,
    status: selected.length >= 2 ? 'ready' : 'insufficient_verified_odds',
    odds_label: 'Resmî İddaa İY/MS oranı',
    confidence_label: 'Model güveni bir sonuç olasılığı değil, senaryo sinyal gücüdür.',
    message: selected.length >= 2
      ? 'Günün 1/2 ve 2/1 ters sonuç adayları yalnız doğrulanmış resmî İddaa İY/MS oranlarıyla seçildi.'
      : 'Bugün en az iki adet doğrulanmış yüksek oranlı 1/2 veya 2/1 adayı bulunamadı; model oranı gösterilmedi.',
    picks: selected
  };
}

async function main() {
  if (!fs.existsSync(INPUT)) throw new Error(`Input bulunamadı: ${INPUT}`);
  const source = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
  const officialBulletin = await fetchIddaaBulletin({ includeMarkets: true, force: true });
  const output = await buildOutput(source, officialBulletin);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`High-odds HT/FT: ${output.scan_count} maç tarandı, ${output.selected_count} doğrulanmış kart üretildi (${output.date}).`);
}

module.exports = {
  MIN_REAL_ODDS,
  analyzeMatch,
  buildOutput,
  officialEventMap,
  officialHtFtOdds,
  selectionKey
};

if (require.main === module) {
  main().catch((error) => {
    console.error(`High-odds HT/FT üretimi başarısız: ${error.message}`);
    process.exitCode = 1;
  });
}
