"use strict";

const assert = require('assert');
const {
  analyzeMatch,
  buildOutput,
  officialEventMap,
  officialHtFtOdds
} = require('../scripts/generate-high-odds-htft');

const officialEvent = {
  iddaa_event_id: '10314',
  match_code: '10314',
  date: '2026-09-10',
  time: '20:00',
  status: 'scheduled',
  source: 'iddaa.com resmi futbol bülteni',
  market_groups: [
    {
      title: 'Maç Sonucu',
      outcomes: [{ label: '1', odd: 1.80 }, { label: '0', odd: 3.20 }, { label: '2', odd: 4.10 }]
    },
    {
      title: 'İlk Yarı / Maç Sonucu',
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
assert.ok([18.25, 22.5].includes(pick.bookmaker_odds));
assert.strictEqual(pick.model_odds, pick.bookmaker_odds, 'legacy display field must mirror official odds exactly');
assert.strictEqual(pick.real_odds, pick.bookmaker_odds);
assert.strictEqual(pick.odds_verified, true);
assert.match(pick.odds_source, /iddaa/i);
assert.notStrictEqual(pick.bookmaker_odds, 11.76, 'old reciprocal model odds must never be emitted');

const noOfficialMarket = new Map([['10314', { ...officialEvent, market_groups: [] }]]);
assert.strictEqual(analyzeMatch(item, '2026-09-10', noOfficialMarket), null, 'no official HT/FT market means no card');

(async () => {
  const output = await buildOutput({ date: '2026-09-10', matches: [item] }, {
    source: 'iddaa.com resmi futbol bülteni',
    matches: [officialEvent]
  });
  assert.strictEqual(output.odds_label, 'Resmî İddaa İY/MS oranı');
  assert.strictEqual(output.picks.length, 1);
  assert.strictEqual(output.picks[0].odds_verified, true);
  console.log('high-odds-htft.test.js: OK');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
