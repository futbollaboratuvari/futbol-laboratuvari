const assert = require('assert');
const {
  extractUidPart,
  extractLeagueId,
  parseCoreStats,
  competitionParts,
  parseSportsDbStats,
  scoreboardTeamStats,
  comparableStats,
  safeProviderError,
} = require('../scripts/update-live-power-series-v2');

assert.strictEqual(extractUidPart('s:600~l:710~e:677419', 'l'), '710');
assert.strictEqual(extractLeagueId({ uid: 's:600~l:710~e:677419' }), '710');
assert.strictEqual(extractLeagueId({ competitions: [{ uid: 's:600~l:770~e:1~c:1' }] }), '770');

const corePayload = {
  splits: {
    categories: [
      {
        name: 'general',
        stats: [
          { name: 'shotsOnTarget', value: 6, displayValue: '6' },
          { name: 'totalShots', value: 14, displayValue: '14' },
          { name: 'possessionPct', value: 61, displayValue: '61%' },
          { name: 'cornerKicks', value: 7, displayValue: '7' },
          { name: 'expectedGoals', value: 1.72, displayValue: '1.72' },
        ],
      },
    ],
  },
};
const parsed = parseCoreStats(corePayload);
assert.strictEqual(parsed.shots_on_goal, 6);
assert.strictEqual(parsed.total_shots, 14);
assert.strictEqual(parsed.possession, 61);
assert.strictEqual(parsed.corners, 7);
assert.strictEqual(parsed.expected_goals, 1.72);

const parts = competitionParts({
  id: '677419',
  uid: 's:600~l:710~e:677419',
  competitions: [{
    id: '677419',
    competitors: [
      { id: '176', homeAway: 'home', team: { id: '176' } },
      { id: '180', homeAway: 'away', team: { id: '180' } },
    ],
  }],
}, 'home');
assert.deepStrictEqual(
  { leagueId: parts.leagueId, eventId: parts.eventId, competitionId: parts.competitionId, teamId: parts.teamId },
  { leagueId: '710', eventId: '677419', competitionId: '677419', teamId: '176' },
);

const scoreboardStats = scoreboardTeamStats({
  competitions: [{ competitors: [
    { homeAway: 'home', statistics: [{ name: 'shotsOnTarget', displayValue: '2' }, { name: 'wonCorners', displayValue: '3' }] },
    { homeAway: 'away', statistics: [{ name: 'shotsOnTarget', displayValue: '0' }, { name: 'wonCorners', displayValue: '1' }] },
  ] }],
});
assert.strictEqual(scoreboardStats.home.shots_on_goal, 2);
assert.strictEqual(scoreboardStats.away.shots_on_goal, 0);
assert.strictEqual(scoreboardStats.home.corners, 3);
assert.strictEqual(scoreboardStats.home.expected_goals, null);
assert.strictEqual(comparableStats(scoreboardStats.home, scoreboardStats.away), true);

const sportsDbStats = parseSportsDbStats({ eventstats: [
  { strStat: 'Shots on Goal', intHome: '5', intAway: '2' },
  { strStat: 'Total Shots', intHome: '12', intAway: '7' },
  { strStat: 'Shots insidebox', intHome: '8', intAway: '3' },
  { strStat: 'Blocked Shots', intHome: '2', intAway: '1' },
] });
assert.strictEqual(sportsDbStats.home.shots_on_goal, 5);
assert.strictEqual(sportsDbStats.away.total_shots, 7);
assert.strictEqual(sportsDbStats.home.expected_goals, null);
assert.strictEqual(comparableStats(sportsDbStats.home, sportsDbStats.away), true);

const safeError = safeProviderError('summary', 'https://example.test/path', Object.assign(new Error('<HTML>Access Denied</HTML>'), { statusCode: 403 }));
assert.strictEqual(safeError, 'summary:example.test:http_403');
assert.strictEqual(safeError.includes('HTML'), false);

console.log('live-power-core.test.js OK');

