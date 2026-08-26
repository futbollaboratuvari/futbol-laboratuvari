const assert = require('assert');
const news = require('../scripts/team-news-auto');
const status = require('../scripts/team-status-lite');
const apply = require('../scripts/team-status-apply');
const band = require('../scripts/band-lite');
const lineup = require('../scripts/lineup-lite');
const player = require('../scripts/player-intelligence-api');
const exporter = require('../scripts/export-high-value-json');

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

const fixture = player.normalizeFixture({
  fixture: { id: 42, date: '2026-08-26T20:00:00+03:00', status: { short: 'NS' } },
  league: { name: 'Example League' },
  teams: { home: { id: 10, name: 'Example Football Club' }, away: { id: 20, name: 'Other FC' } }
});
assert.strictEqual(player.findApiFixture({ date: '2026-08-26', time: '20:00', home: 'Example FC', away: 'Other' }, [fixture]).fixture_id, 42);

const injured = player.normalizeInjury({
  fixture: { id: 42, date: '2026-08-26T20:00:00+03:00' },
  team: { id: 10, name: 'Example Football Club' },
  player: { id: 7, name: 'Player Seven', type: 'Suspended', reason: 'Red card' }
});
assert.strictEqual(injured.category, 'suspension');

const apiLineup = player.normalizeLineupTeam({
  team: { id: 10, name: 'Example Football Club' },
  formation: '4-3-3',
  startXI: Array.from({ length: 11 }, (_, index) => ({ player: { id: index + 1, name: `Starter ${index + 1}`, pos: index ? 'M' : 'G' } })),
  substitutes: [{ player: { id: 90, name: 'Bench One', pos: 'F' } }]
});
assert.strictEqual(apiLineup.confirmed, true);
assert.strictEqual(apiLineup.starting_11.length, 11);

const transferDate = new Date().toISOString().slice(0, 10);
const transfers = player.normalizeTransfers({ response: [{
  player: { id: 7, name: 'Player Seven' },
  transfers: [{ date: transferDate, type: 'Free', teams: { in: { id: 10, name: 'Example FC' }, out: { id: 30, name: 'Old FC' } } }]
}] }, 10);
assert.strictEqual(transfers[0].direction, 'in');

const structured = { teams: { 'Example FC': {
  data_status: 'lineup_confirmed', availability_checked: true, lineup_confirmed: true, sources: ['API-Football injuries'],
  injured_players: [{ id: 8, name: 'Player Eight', status: 'injury', impact_score: 8, impact_level: 'Yüksek' }],
  suspended_players: [{ id: 7, name: 'Player Seven', status: 'suspension', impact_score: 8, impact_level: 'Yüksek' }],
  doubtful_players: [], transfers_in: transfers, transfers_out: []
} } };
const structuredMerged = status.mergeTeamRecord('Example FC', { teams: {} }, { teams: {} }, structured);
assert.strictEqual(structuredMerged.injured_players[0], 'Player Eight');
assert.strictEqual(structuredMerged.suspended_players[0], 'Player Seven');
assert.strictEqual(status.hasVerifiedData(structuredMerged), true);
assert.strictEqual(status.countRisk(structuredMerged), 'Yüksek');

const mergedLineup = lineup.mergeLineupRecord({}, {
  availability_checked: true,
  sources: ['API-Football lineups'],
  injured_players: structured.teams['Example FC'].injured_players,
  lineup: { ...apiLineup, confirmed: true }
});
const homeSummary = lineup.buildTeamSummary('Example FC', mergedLineup);
const awaySummary = lineup.buildTeamSummary('Other FC', lineup.mergeLineupRecord({}, { availability_checked: true }));
assert.strictEqual(homeSummary.lineup_confirmed, true);
assert.strictEqual(homeSummary.unavailable_players[0].name, 'Player Eight');
assert.strictEqual(lineup.lineupRisk(homeSummary, awaySummary), 'Orta');
assert.strictEqual(lineup.lineupRisk(lineup.buildTeamSummary('No Data', {}), awaySummary), 'Belirsiz');

const unknown = status.mergeTeamRecord('Unknown FC', { teams: {} }, { teams: {} });
assert.strictEqual(status.countRisk(unknown), 'Belirsiz');
assert.strictEqual(status.combineRisk('Düşük', 'Belirsiz'), 'Belirsiz');
assert.strictEqual(status.combineRisk('Belirsiz', 'Düşük'), 'Belirsiz');
assert.strictEqual(status.combineRisk('Orta', 'Belirsiz'), 'Belirsiz');
assert.strictEqual(status.combineRisk('Belirsiz', 'Orta'), 'Belirsiz');
assert.strictEqual(status.combineRisk('Yüksek', 'Belirsiz'), 'Yüksek');
assert.strictEqual(status.combineRisk('Belirsiz', 'Yüksek'), 'Yüksek');
assert.strictEqual(apply.worstRisk('Düşük', 'Yüksek'), 'Yüksek');
assert.strictEqual(apply.worstRisk('Düşük', 'Belirsiz'), 'Orta');

const bands = { very_short: 1.3, short: 1.7, long: 3, min_score_very_short: 80, min_score_short: 70 };
const unknownBand = band.labelFor(
  { band_extra: { squad_risk_level: 'Belirsiz', squad_verified_team_count: 1 } },
  bands
);
assert.notStrictEqual(unknownBand.level, 'Düşük');
assert(unknownBand.notes.some((note) => note.includes('doğrulanamadı')));

const missingBand = band.labelFor({ band_extra: {} }, bands);
assert.notStrictEqual(missingBand.level, 'Düşük');
assert(missingBand.notes.some((note) => note.includes('doğrulanamadı')));

const mergedWithoutStatus = band.mergeSignals(
  { match_name: 'Missing Status FC VS No Data FC' },
  { status: {}, lineup: {}, homeAway: {}, standing: {}, league: {} }
);
assert.strictEqual(mergedWithoutStatus.band_extra.squad_risk_level, 'Belirsiz');
assert.strictEqual(mergedWithoutStatus.band_extra.squad_verified_team_count, 0);
assert.notStrictEqual(band.labelFor(mergedWithoutStatus, bands).level, 'Düşük');

assert.strictEqual(band.matchName({ home: 'Canonical Home', away: 'Canonical Away' }), 'Canonical Home VS Canonical Away');
const joinedBand = band.mergeSignals(
  { home: 'Canonical Home', away: 'Canonical Away' },
  {
    status: { 'canonical home vs canonical away': { squad_risk_level: 'Düşük', verified_team_count: 2, named_player_count: 1 } },
    lineup: { 'canonical home vs canonical away': { lineup_risk_level: 'Yüksek' } },
    homeAway: {}, standing: {}, league: {}
  }
);
assert.strictEqual(band.labelFor(joinedBand, bands).level, 'Yüksek');

const squadAdjusted = exporter.applyTeamIntelligence(
  { score: 75, model_score: 75, analysis_score: 75, data_completeness: 70, risk: 'Düşük', pro_signals: [] },
  { band_check: { level: 'Yüksek', notes: [] }, extra_used: { squad_risk_level: 'Yüksek', lineup_risk_level: 'Orta', squad_verified_team_count: 2, named_player_count: 2 } }
);
assert.strictEqual(squadAdjusted.model_score, 63);
assert.strictEqual(squadAdjusted.risk, 'Yüksek');
assert.strictEqual(squadAdjusted.team_intelligence.adjustment.penalty, 12);
assert(squadAdjusted.pro_signals[0].includes('kupon kapatıldı'));

assert.strictEqual(news.isFresh({ checked_at: new Date().toISOString() }), true);
assert.strictEqual(news.isFresh({ checked_at: '2020-01-01T00:00:00.000Z' }), false);

console.log('team-intelligence.test.js OK');
