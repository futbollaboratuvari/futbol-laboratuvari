"use strict";

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {
  analyzeMatch,
  buildOutput,
  officialEventMap,
  officialHtFtOdds,
  resolveOfficialEvent
} = require('../scripts/generate-high-odds-htft');

const officialEvent = {
  iddaa_event_id: '3123456',
  match_code: '3123456',
  date: '2026-09-10',
  time: '20:00',
  home: 'Ev',
  away: 'Dep',
  status: 'scheduled',
  source: 'iddaa.com resmi futbol bülteni',
  market_groups: [
    {
      title: 'Maç Sonucu',
      outcomes: [{ label: '1', odd: 1.80 }, { label: '0', odd: 3.20 }, { label: '2', odd: 4.10 }]
    },
    {
      title: '1. Yarı / Maç Sonucu',
      description: 'İlk yarı ve maç sonucu',
      outcomes: [
        { label: '1/1', odd: 3.75 },
        { label: '1 / 2', odd: 18.25 },
        { label: '2/1', odd: 22.50 },
        { label: '2/2', odd: 7.25 }
      ]
    }
  ]
};

assert.deepStrictEqual(officialHtFtOdds(officialEvent), { '1/2': 18.25, '2/1': 22.5 });
assert.deepStrictEqual(officialHtFtOdds({ market_groups: [{ title: 'Maç Sonucu', outcomes: [{ label: '1/2', odd: 99 }] }] }), {});

const item = {
  match_code: '10314',
  date: '2026-09-10',
  status: 'scheduled',
  home: 'Ev',
  away: 'Dep',
  available_odds: { ms1: 2.2, msx: 3.2, ms2: 3.0, over25: 1.8, under25: 2.0, bttsYes: 1.75, bttsNo: 2.05 },
  detail_market_candidates: [{ market: 'İlk Yarı Sonucu', values: { firstHalf1: 2.5, firstHalfX: 2.1, firstHalf2: 3.2 } }],
  data_completeness: 70,
  model_score: 75
};

const map = officialEventMap({ matches: [officialEvent] });
const pick = analyzeMatch(item, '2026-09-10', map);
assert.ok(pick, 'verified official HT/FT pick must be generated');
assert.strictEqual(pick.match_code, '10314', 'provider-local match code must be preserved');
assert.strictEqual(pick.iddaa_event_id, '3123456', 'resolved official Iddaa event id must be published');
assert.strictEqual(pick.identity_match_source, 'date_teams');
assert.ok([18.25, 22.5].includes(pick.bookmaker_odds));
assert.strictEqual(pick.model_odds, pick.bookmaker_odds, 'legacy display field must mirror official odds exactly');
assert.strictEqual(pick.real_odds, pick.bookmaker_odds);
assert.strictEqual(pick.odds_verified, true);
assert.match(pick.odds_source, /iddaa/i);
assert.notStrictEqual(pick.bookmaker_odds, 11.76, 'old reciprocal model odds must never be emitted');

const directItem = { ...item, iddaa_event_id: '3123456' };
const directResolution = resolveOfficialEvent(directItem, map);
assert.strictEqual(directResolution.event, officialEvent);
assert.strictEqual(directResolution.source, 'iddaa_event_id');

const fuzzyOfficialEvent = {
  ...officialEvent,
  iddaa_event_id: '3123459',
  match_code: '3123459',
  home: 'Richmond',
  away: 'Chattanooga Red Wolves SC',
  time: '01:00'
};
const fuzzyItem = {
  ...item,
  match_code: '67890',
  home: 'Richmond Kicke',
  away: 'Chattanooga Red',
  start_time: '01:00'
};
const fuzzyResolution = resolveOfficialEvent(fuzzyItem, officialEventMap({ matches: [fuzzyOfficialEvent] }));
assert.strictEqual(fuzzyResolution.event, fuzzyOfficialEvent);
assert.strictEqual(fuzzyResolution.source, 'date_time_team_similarity');
assert.ok(fuzzyResolution.score >= 0.72);

const unsafeFuzzyResolution = resolveOfficialEvent({
  ...item,
  home: 'Internacional',
  away: 'Real Cartagena',
  start_time: '02:00'
}, officialEventMap({
  matches: [{ ...officialEvent, home: 'CD Cortulua', away: 'Real Cartagena FC', time: '02:00' }]
}));
assert.strictEqual(unsafeFuzzyResolution.event, null, 'one similar team must not be enough to map an event');

const ambiguousMap = officialEventMap({
  matches: [officialEvent, { ...officialEvent, iddaa_event_id: '3123457', match_code: '3123457', time: '21:00' }]
});
assert.strictEqual(resolveOfficialEvent(item, ambiguousMap).event, null, 'ambiguous name/date identity must be rejected');

const noOfficialMarket = officialEventMap({ matches: [{ ...officialEvent, market_groups: [] }] });
assert.strictEqual(analyzeMatch(item, '2026-09-10', noOfficialMarket), null, 'no official HT/FT market means no card');

const secondOfficialEvent = {
  ...officialEvent,
  iddaa_event_id: '3123458',
  match_code: '3123458',
  home: 'Ev İki',
  away: 'Dep İki',
  time: '21:30'
};
const secondItem = {
  ...item,
  match_code: '54321',
  home: 'Ev İki',
  away: 'Dep İki',
  match_name: 'Ev İki VS Dep İki'
};

(async () => {
  const output = await buildOutput({ date: '2026-09-10', matches: [item, secondItem] }, {
    source: 'iddaa.com resmi futbol bülteni',
    matches: [officialEvent, secondOfficialEvent]
  });
  assert.strictEqual(output.odds_label, 'Resmî İddaa İY/MS oranı');
  assert.strictEqual(output.status, 'ready');
  assert.strictEqual(output.picks.length, 2);
  assert.strictEqual(output.identity_match_count, 2);
  assert.strictEqual(output.matched_by_date_teams_count, 2);
  assert.strictEqual(output.matched_by_date_time_similarity_count, 0);
  assert.strictEqual(output.matched_by_official_id_count, 0);
  assert.strictEqual(output.official_high_odds_match_count, 2);
  assert.ok(output.picks.every((entry) => entry.odds_verified === true));
  assert.deepStrictEqual(output.picks.map((entry) => entry.iddaa_event_id).sort(), ['3123456', '3123458']);

  const nextDate = '2026-09-11';
  const futureOutput = await buildOutput({
    date: '2026-09-10',
    matches: [
      { ...item, date: nextDate },
      { ...secondItem, date: nextDate }
    ]
  }, {
    source: 'iddaa.com resmi futbol bülteni',
    matches: [
      { ...officialEvent, date: nextDate },
      { ...secondOfficialEvent, date: nextDate }
    ]
  });
  assert.strictEqual(futureOutput.date, nextDate);
  assert.strictEqual(futureOutput.requested_date, '2026-09-10');
  assert.strictEqual(futureOutput.date_fallback_used, true);
  assert.strictEqual(futureOutput.status, 'ready');
  assert.strictEqual(futureOutput.selected_count, 2);

  const widget = fs.readFileSync(path.join(__dirname, '..', 'high-odds-htft-widget.js'), 'utf8');
  assert.match(widget, /Resmî İddaa Oranı/);
  assert.match(widget, /bulletinDate < today/);
  assert.doesNotMatch(widget, />Model Oranı</);
  const cacheLoader = fs.readFileSync(path.join(__dirname, '..', 'cache-version.js'), 'utf8');
  assert.match(cacheLoader, /loadScript\("high-odds-htft-widget\.js"/);
  assert.match(cacheLoader, /20260912-htft-official-v3/);
  console.log('high-odds-htft.test.js: OK');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
