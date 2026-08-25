const assert = require('assert');
const news = require('../scripts/team-news-auto');
const status = require('../scripts/team-status-lite');
const apply = require('../scripts/team-status-apply');
const band = require('../scripts/band-lite');

const rss = `<?xml version="1.0"?><rss><channel>
<item><title><![CDATA[Example FC captain ruled out with knee injury - Sports Desk]]></title><link>https://example.com/a</link><pubDate>${new Date().toUTCString()}</pubDate><source url="https://example.com">Sports Desk</source><description>Example FC injury update</description></item>
<item><title><![CDATA[Example FC midfielder suspended after red card - Local News]]></title><link>https://example.com/b</link><pubDate>${new Date().toUTCString()}</pubDate><source url="https://local.test">Local News</source><description>Example FC suspension news</description></item>
<item><title><![CDATA[Example FC confirma lesión de su delantero - Diario Local]]></title><link>https://example.com/c</link><pubDate>${new Date().toUTCString()}</pubDate><source url="https://diario.test">Diario Local</source><description>El jugador queda de baja</description></item>
<item><title><![CDATA[Example FC anuncia novo reforço para a temporada - Futebol Hoje]]></title><link>https://example.com/d</link><pubDate>${new Date().toUTCString()}</pubDate><source url="https://futebol.test">Futebol Hoje</source><description>Contratação confirmada pelo clube</description></item>
</channel></rss>`;

const items = news.parseRss(rss);
assert.strictEqual(items.length, 4);
const evidence = news.evidenceForTeam('Example FC', items);
assert.strictEqual(evidence.length, 4);
assert(evidence.some((item) => item.categories.includes('injury')));
assert(evidence.some((item) => item.categories.includes('suspension')));
assert(evidence.some((item) => item.categories.includes('transfer_in')));
assert(news.evidenceRisk(evidence) >= 9);

const manual = { teams: { 'Example FC': { injured_players: ['Player A'], suspended_players: [], transfers_in: [], transfers_out: [], doubtful_players: [], source_note: 'Club statement' } } };
const auto = { teams: { 'Example FC': { status: 'public_news_found', auto_risk_score: 6, evidence, injury_news: evidence.filter((item) => item.categories.includes('injury')), suspension_news: evidence.filter((item) => item.categories.includes('suspension')), doubtful_news: [], transfer_in_news: evidence.filter((item) => item.categories.includes('transfer_in')), transfer_out_news: [], sources: ['Sports Desk', 'Local News', 'Diario Local', 'Futebol Hoje'] } } };
const merged = status.mergeTeamRecord('Example FC', manual, auto);
assert.strictEqual(merged.data_status, 'manual_plus_public_news');
assert.strictEqual(status.countRisk(merged), 'Orta');

const unknown = status.mergeTeamRecord('Unknown FC', { teams: {} }, { teams: {} });
assert.strictEqual(status.countRisk(unknown), 'Belirsiz');
assert.strictEqual(status.combineRisk('Düşük', 'Belirsiz'), 'Belirsiz');
assert.strictEqual(status.combineRisk('Belirsiz', 'Düşük'), 'Belirsiz');
assert.strictEqual(status.combineRisk('Orta', 'Belirsiz'), 'Belirsiz');
assert.strictEqual(status.combineRisk('Belirsiz', 'Orta'), 'Belirsiz');
assert.strictEqual(status.combineRisk('Yüksek', 'Belirsiz'), 'Belirsiz');
assert.strictEqual(status.combineRisk('Belirsiz', 'Yüksek'), 'Belirsiz');
assert.strictEqual(apply.worstRisk('Düşük', 'Yüksek'), 'Yüksek');
assert.strictEqual(apply.worstRisk('Düşük', 'Belirsiz'), 'Orta');

const unknownBand = band.labelFor(
  { band_extra: { squad_risk_level: 'Belirsiz', squad_verified_team_count: 1 } },
  { very_short: 1.3, short: 1.7, long: 3, min_score_very_short: 80, min_score_short: 70 }
);
assert.notStrictEqual(unknownBand.level, 'Düşük');
assert(unknownBand.notes.some((note) => note.includes('doğrulanamadı')));

assert.strictEqual(news.isFresh({ checked_at: new Date().toISOString() }), true);
assert.strictEqual(news.isFresh({ checked_at: '2020-01-01T00:00:00.000Z' }), false);

console.log('team-intelligence.test.js OK');
