const assert = require('assert');
const news = require('../scripts/team-news-auto');
const status = require('../scripts/team-status-lite');
const apply = require('../scripts/team-status-apply');

const rss = `<?xml version="1.0"?><rss><channel>
<item><title><![CDATA[Example FC captain ruled out with knee injury - Sports Desk]]></title><link>https://example.com/a</link><pubDate>${new Date().toUTCString()}</pubDate><source url="https://example.com">Sports Desk</source><description>Example FC injury update</description></item>
<item><title><![CDATA[Example FC midfielder suspended after red card - Local News]]></title><link>https://example.com/b</link><pubDate>${new Date().toUTCString()}</pubDate><source url="https://local.test">Local News</source><description>Example FC suspension news</description></item>
</channel></rss>`;

const items = news.parseRss(rss);
assert.strictEqual(items.length, 2);
const evidence = news.evidenceForTeam('Example FC', items);
assert.strictEqual(evidence.length, 2);
assert(evidence.some((item) => item.categories.includes('injury')));
assert(evidence.some((item) => item.categories.includes('suspension')));
assert(news.evidenceRisk(evidence) >= 9);

const manual = { teams: { 'Example FC': { injured_players: ['Player A'], suspended_players: [], transfers_in: [], transfers_out: [], doubtful_players: [], source_note: 'Club statement' } } };
const auto = { teams: { 'Example FC': { status: 'public_news_found', auto_risk_score: 6, evidence, injury_news: evidence.slice(0, 1), suspension_news: evidence.slice(1), doubtful_news: [], transfer_in_news: [], transfer_out_news: [], sources: ['Sports Desk', 'Local News'] } } };
const merged = status.mergeTeamRecord('Example FC', manual, auto);
assert.strictEqual(merged.data_status, 'manual_plus_public_news');
assert.strictEqual(status.countRisk(merged), 'Orta');

const unknown = status.mergeTeamRecord('Unknown FC', { teams: {} }, { teams: {} });
assert.strictEqual(status.countRisk(unknown), 'Belirsiz');
assert.strictEqual(status.combineRisk('Düşük', 'Belirsiz'), 'Belirsiz');
assert.strictEqual(apply.worstRisk('Düşük', 'Yüksek'), 'Yüksek');
assert.strictEqual(apply.worstRisk('Düşük', 'Belirsiz'), 'Orta');

console.log('team-intelligence.test.js OK');
