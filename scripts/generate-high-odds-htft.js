"use strict";

const fs = require('fs');
const path = require('path');
const { fetchIddaaBulletin, SOURCE_NAME } = require('./iddaa-data-source');

const ROOT = path.resolve(__dirname, '..');
const INPUT = path.join(ROOT, 'data', 'robot-analysis.json');
const OUTPUT = path.join(ROOT, 'data', 'high-odds-htft.json');
const MIN_REAL_ODDS = 11.75;
const OFFICIAL_FETCH_TIMEOUT_MS = 20_000;
const OFFICIAL_FETCH_ATTEMPTS = 3;

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

function matchTeams(item) {
  const nameParts = String(item?.match_name || '')
    .split(/\s+VS\s+|\s+-\s+/i)
    .map((part) => part.trim());
  return {
    home: String(item?.home || item?.home_team || nameParts[0] || '').trim(),
    away: String(item?.away || item?.away_team || nameParts[1] || '').trim()
  };
}

function eventIdentityKey(item) {
  const date = String(item?.date || '').slice(0, 10);
  const { home, away } = matchTeams(item);
  if (!date || !home || !away) return '';
  return `${date}|${fold(home)}|${fold(away)}`;
}

function kickoffTime(item) {
  const value = String(item?.start_time || item?.time || '').trim();
  const match = value.match(/(?:^|T)(\d{2}:\d{2})/);
  return match ? match[1] : '';
}

function dateTimeIdentityKey(item) {
  const date = String(item?.date || '').slice(0, 10);
  const time = kickoffTime(item);
  return date && time ? `${date}|${time}` : '';
}

function teamSimilarity(left, right) {
  const a = fold(left).replace(/\s+/g, '');
  const b = fold(right).replace(/\s+/g, '');
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return 0;

  const pairs = new Map();
  for (let index = 0; index < a.length - 1; index += 1) {
    const pair = a.slice(index, index + 2);
    pairs.set(pair, (pairs.get(pair) || 0) + 1);
  }

  let overlap = 0;
  for (let index = 0; index < b.length - 1; index += 1) {
    const pair = b.slice(index, index + 2);
    const count = pairs.get(pair) || 0;
    if (!count) continue;
    overlap += 1;
    pairs.set(pair, count - 1);
  }
  return (2 * overlap) / ((a.length - 1) + (b.length - 1));
}

function officialHtFtOdds(event) {
  const groups = Array.isArray(event?.market_groups) ? event.market_groups : [];
  const market = groups.find((group) => {
    const token = fold(`${group?.title || ''} ${group?.description || ''}`);
    const outcomeKeys = new Set((Array.isArray(group?.outcomes) ? group.outcomes : [])
      .map((outcome) => selectionKey(outcome?.label)));
    const hasHtFtShape = ['1/1', '1/0', '1/2', '0/1', '0/0', '0/2', '2/1', '2/0', '2/2']
      .every((key) => outcomeKeys.has(key));
    const hasHtFtName = (token.includes('ilk yari') || /\b1 yari\b/.test(token))
      && token.includes('mac sonucu');
    return hasHtFtShape || hasHtFtName;
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
  const byIdentity = new Map();
  const byDateTime = new Map();
  for (const event of Array.isArray(bulletin?.matches) ? bulletin.matches : []) {
    const id = String(event?.iddaa_event_id || event?.match_code || event?.matchCode || event?.id || '').trim();
    if (id) map.set(id, event);

    const identity = eventIdentityKey(event);
    if (!identity) continue;
    const bucket = byIdentity.get(identity) || [];
    bucket.push(event);
    byIdentity.set(identity, bucket);

    const dateTime = dateTimeIdentityKey(event);
    if (!dateTime) continue;
    const timedBucket = byDateTime.get(dateTime) || [];
    timedBucket.push(event);
    byDateTime.set(dateTime, timedBucket);
  }
  Object.defineProperty(map, 'byIdentity', { value: byIdentity, enumerable: false });
  Object.defineProperty(map, 'byDateTime', { value: byDateTime, enumerable: false });
  return map;
}

function resolveOfficialEvent(item, officialById) {
  const identifiers = [
    { value: item?.iddaa_event_id, source: 'iddaa_event_id' },
    { value: item?.event_id, source: 'event_id' },
    { value: item?.match_code ?? item?.matchCode, source: 'shared_match_code' }
  ];
  const seen = new Set();
  for (const identifier of identifiers) {
    const id = String(identifier.value || '').trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const event = officialById.get(id);
    if (event) return { event, source: identifier.source };
  }

  const identity = eventIdentityKey(item);
  const candidates = identity && officialById.byIdentity instanceof Map
    ? officialById.byIdentity.get(identity) || []
    : [];
  if (candidates.length === 1) return { event: candidates[0], source: 'date_teams' };

  if (candidates.length > 1) {
    const time = kickoffTime(item);
    const sameTime = time ? candidates.filter((event) => kickoffTime(event) === time) : [];
    if (sameTime.length === 1) return { event: sameTime[0], source: 'date_teams_time' };
    return { event: null, source: 'ambiguous_date_teams' };
  }

  const dateTime = dateTimeIdentityKey(item);
  const timedCandidates = dateTime && officialById.byDateTime instanceof Map
    ? officialById.byDateTime.get(dateTime) || []
    : [];
  const itemTeams = matchTeams(item);
  const ranked = timedCandidates
    .map((event) => {
      const officialTeams = matchTeams(event);
      const homeScore = teamSimilarity(itemTeams.home, officialTeams.home);
      const awayScore = teamSimilarity(itemTeams.away, officialTeams.away);
      return { event, homeScore, awayScore, score: (homeScore + awayScore) / 2 };
    })
    .sort((left, right) => right.score - left.score);
  const best = ranked[0];
  const runnerUp = ranked[1];
  if (best && best.homeScore >= 0.55 && best.awayScore >= 0.55 && best.score >= 0.72) {
    if (!runnerUp || best.score - runnerUp.score >= 0.08) {
      return { event: best.event, source: 'date_time_team_similarity', score: best.score };
    }
    return { event: null, source: 'ambiguous_date_time_teams' };
  }

  return { event: null, source: 'unmatched' };
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

function analyzeMatch(item, targetDate, officialById, resolvedEvent) {
  const date = String(item.date || '').slice(0, 10);
  if (targetDate && date && date !== targetDate) return null;
  const status = String(item.status || 'scheduled').toLowerCase();
  if (status && !['scheduled', 'not_started', 'upcoming', 'fixture'].includes(status)) return null;

  const resolution = resolvedEvent || resolveOfficialEvent(item, officialById);
  const officialEvent = resolution.event;
  if (!officialEvent || String(officialEvent.status || 'scheduled').toLowerCase() === 'live') return null;
  if (date && officialEvent.date && String(officialEvent.date).slice(0, 10) !== date) return null;

  const officialEventId = String(
    officialEvent.iddaa_event_id || officialEvent.match_code || officialEvent.matchCode || officialEvent.id || ''
  ).trim();
  if (!officialEventId) return null;

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
  const itemTeams = matchTeams(item);
  const officialTeams = matchTeams(officialEvent);
  const home = itemTeams.home || officialTeams.home || 'Ev Sahibi';
  const away = itemTeams.away || officialTeams.away || 'Deplasman';
  const matchName = item.match_name || `${home} - ${away}`;
  const bookmakerOdds = Number(best.bookmakerOdds.toFixed(2));

  return {
    match_code: item.match_code || item.matchCode || officialEventId,
    iddaa_event_id: officialEventId,
    identity_match_source: resolution.source,
    identity_match_score: resolution.score ? Number((resolution.score * 100).toFixed(1)) : 100,
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

function dateInIstanbul(value) {
  const parsed = value ? new Date(value) : new Date();
  const safeDate = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(safeDate);
  const bag = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${bag.year}-${bag.month}-${bag.day}`;
}

function selectCandidates(analyzed) {
  const selected = [];
  const usedMatches = new Set();
  for (const candidate of analyzed) {
    const key = `${candidate.date}|${candidate.iddaa_event_id || candidate.match_code || candidate.match_name}`;
    if (usedMatches.has(key)) continue;
    usedMatches.add(key);
    selected.push(candidate);
    if (selected.length === 3) break;
  }
  return selected;
}

function analyzeDate(matches, targetDate, officialById) {
  const scanMatches = matches.filter((item) => !item.date || String(item.date).slice(0, 10) === targetDate);
  const scheduledScanMatches = scanMatches.filter((item) => {
    const status = String(item.status || 'scheduled').toLowerCase();
    return ['scheduled', 'not_started', 'upcoming', 'fixture'].includes(status);
  });
  const identityStats = {
    matched_by_id: 0,
    matched_by_date_teams: 0,
    matched_by_similarity: 0,
    ambiguous: 0,
    unmatched: 0
  };
  const analyzed = [];
  for (const item of scheduledScanMatches) {
    const resolution = resolveOfficialEvent(item, officialById);
    if (['iddaa_event_id', 'event_id', 'shared_match_code'].includes(resolution.source)) identityStats.matched_by_id += 1;
    else if (['date_teams', 'date_teams_time'].includes(resolution.source)) identityStats.matched_by_date_teams += 1;
    else if (resolution.source === 'date_time_team_similarity') identityStats.matched_by_similarity += 1;
    else if (resolution.source.startsWith('ambiguous_')) identityStats.ambiguous += 1;
    else identityStats.unmatched += 1;

    const candidate = analyzeMatch(item, targetDate, officialById, resolution);
    if (candidate) analyzed.push(candidate);
  }
  analyzed.sort((a, b) => b.model_confidence - a.model_confidence || b.scenario_probability - a.scenario_probability);

  const officialMatches = [...officialById.values()].filter((event) => {
    const date = String(event?.date || '').slice(0, 10);
    const status = String(event?.status || 'scheduled').toLowerCase();
    return (!date || date === targetDate) && status !== 'live';
  });
  const officialHtftMatchCount = officialMatches.filter((event) => Object.keys(officialHtFtOdds(event)).length).length;
  const officialHighOddsMatchCount = officialMatches.filter((event) => Object.values(officialHtFtOdds(event))
    .some((odd) => number(odd) >= MIN_REAL_ODDS)).length;
  const identityMatchCount = identityStats.matched_by_id
    + identityStats.matched_by_date_teams
    + identityStats.matched_by_similarity;

  return {
    targetDate,
    scanMatches,
    scheduledScanMatches,
    identityStats,
    analyzed,
    selected: selectCandidates(analyzed),
    officialHtftMatchCount,
    officialHighOddsMatchCount,
    identityMatchCount
  };
}

async function buildOutput(source, officialBulletin) {
  const matches = collectMatches(source);
  const officialById = officialEventMap(officialBulletin);
  const explicitDate = String(source.date || '').slice(0, 10);
  const requestedDate = /^\d{4}-\d{2}-\d{2}$/.test(explicitDate)
    ? explicitDate
    : dateInIstanbul(source.generated_at);
  const futureDates = [...new Set(matches
    .map((item) => String(item.date || '').slice(0, 10))
    .filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= requestedDate))]
    .sort();
  const evaluatedDates = [...new Set([requestedDate, ...futureDates])];
  const evaluations = evaluatedDates.map((date) => analyzeDate(matches, date, officialById));
  const readyEvaluation = evaluations.find((entry) => entry.selected.length >= 2);
  const bestEvaluation = evaluations.reduce((best, entry) => (
    !best || entry.selected.length > best.selected.length ? entry : best
  ), null);
  const evaluation = readyEvaluation || bestEvaluation || analyzeDate(matches, requestedDate, officialById);
  const {
    targetDate,
    scanMatches,
    scheduledScanMatches,
    identityStats,
    analyzed,
    selected,
    officialHtftMatchCount,
    officialHighOddsMatchCount,
    identityMatchCount
  } = evaluation;
  const dateFallbackUsed = targetDate !== requestedDate;

  return {
    generated_at: new Date().toISOString(),
    date: targetDate,
    requested_date: requestedDate,
    date_fallback_used: dateFallbackUsed,
    evaluated_dates: evaluatedDates,
    engine: 'Futbol Laboratuvarı Yüksek Oran İY/MS v3',
    source: 'data/robot-analysis.json + iddaa.com resmi futbol bülteni',
    odds_source: officialBulletin?.source || SOURCE_NAME,
    identity_policy: 'official_id_then_exact_teams_then_unique_time_and_team_similarity',
    market_scope: ['1/2', '2/1'],
    scan_count: scanMatches.length,
    scheduled_scan_count: scheduledScanMatches.length,
    official_match_count: officialById.size,
    official_htft_match_count: officialHtftMatchCount,
    official_high_odds_match_count: officialHighOddsMatchCount,
    identity_match_count: identityMatchCount,
    matched_by_official_id_count: identityStats.matched_by_id,
    matched_by_date_teams_count: identityStats.matched_by_date_teams,
    matched_by_date_time_similarity_count: identityStats.matched_by_similarity,
    ambiguous_identity_count: identityStats.ambiguous,
    unmatched_identity_count: identityStats.unmatched,
    candidate_count: analyzed.length,
    selected_count: selected.length,
    target_card_count: 3,
    status: selected.length >= 2
      ? 'ready'
      : officialHighOddsMatchCount >= 2 && scheduledScanMatches.length >= 2 && identityMatchCount === 0
        ? 'identity_mapping_failed'
        : 'insufficient_verified_odds',
    odds_label: 'Resmî İddaa İY/MS oranı',
    confidence_label: 'Model güveni bir sonuç olasılığı değil, senaryo sinyal gücüdür.',
    message: selected.length >= 2
      ? dateFallbackUsed
        ? 'Sıradaki 1/2 ve 2/1 ters sonuç adayları yalnız doğrulanmış resmî İddaa İY/MS oranlarıyla seçildi.'
        : 'Günün 1/2 ve 2/1 ters sonuç adayları yalnız doğrulanmış resmî İddaa İY/MS oranlarıyla seçildi.'
      : officialHighOddsMatchCount >= 2 && scheduledScanMatches.length >= 2 && identityMatchCount === 0
        ? 'Resmî maçlar robot havuzuyla eşleştirilemedi; veri hattı kontrol bekliyor.'
        : 'Bugün en az iki adet doğrulanmış yüksek oranlı 1/2 veya 2/1 adayı bulunamadı; model oranı gösterilmedi.',
    picks: selected
  };
}

async function fetchOfficialBulletinWithRetry() {
  let lastError;
  for (let attempt = 1; attempt <= OFFICIAL_FETCH_ATTEMPTS; attempt += 1) {
    try {
      return await fetchIddaaBulletin({
        includeMarkets: true,
        force: true,
        timeoutMs: OFFICIAL_FETCH_TIMEOUT_MS
      });
    } catch (error) {
      lastError = error;
      if (attempt === OFFICIAL_FETCH_ATTEMPTS) break;
      console.warn(`Resmî İddaa bülteni alınamadı (${attempt}/${OFFICIAL_FETCH_ATTEMPTS}); yeniden deneniyor.`);
      await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
    }
  }
  throw lastError;
}

async function main() {
  if (!fs.existsSync(INPUT)) throw new Error(`Input bulunamadı: ${INPUT}`);
  const source = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
  const officialBulletin = await fetchOfficialBulletinWithRetry();
  const output = await buildOutput(source, officialBulletin);
  fs.writeFileSync(OUTPUT, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`High-odds HT/FT: ${output.scan_count} maç tarandı, ${output.selected_count} doğrulanmış kart üretildi (${output.date}).`);
}

module.exports = {
  MIN_REAL_ODDS,
  analyzeMatch,
  buildOutput,
  eventIdentityKey,
  officialEventMap,
  officialHtFtOdds,
  resolveOfficialEvent,
  selectionKey
};

if (require.main === module) {
  main().catch((error) => {
    console.error(`High-odds HT/FT üretimi başarısız: ${error.message}`);
    process.exitCode = 1;
  });
}
