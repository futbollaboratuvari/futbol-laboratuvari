const assert = require('assert');
const {
  finite,
  normalizeName,
  nameSimilarity,
  parseTeamStatsFromRows,
  computePower,
  mergeSnapshot,
  espnEventTeams,
  isLiveEspnEvent,
  boxscoreTeams,
  extractMinute,
} = require('../scripts/update-live-power-series');

assert.strictEqual(finite('62%'), 62);
assert.strictEqual(finite(null), null);
assert.strictEqual(normalizeName('Fenerbahçe SK'), 'fenerbahce');
assert.ok(nameSimilarity('Paris Saint-Germain', 'Paris SG') >= 0.45);

const parsed = parseTeamStatsFromRows([
  { name: 'Shots on Target', displayValue: '5' },
  { name: 'Total Shots', displayValue: '11' },
  { name: 'Corner Kicks', displayValue: '6' },
  { name: 'Possession', displayValue: '57%' },
  { name: 'Expected Goals', displayValue: '1.42' },
]);
assert.strictEqual(parsed.shots_on_goal, 5);
assert.strictEqual(parsed.total_shots, 11);
assert.strictEqual(parsed.corners, 6);
assert.strictEqual(parsed.possession, 57);
assert.strictEqual(parsed.expected_goals, 1.42);

const event = {
  id: '401234567',
  status: { type: { state: 'in', name: 'STATUS_IN_PROGRESS' }, displayClock: "67'" },
  competitions: [{
    competitors: [
      { homeAway: 'home', score: '2', team: { displayName: 'Galatasaray' } },
      { homeAway: 'away', score: '1', team: { displayName: 'Fenerbahce' } },
    ],
  }],
};
const teams = espnEventTeams(event);
assert.strictEqual(teams.home, 'Galatasaray');
assert.strictEqual(teams.away, 'Fenerbahce');
assert.strictEqual(teams.homeScore, 2);
assert.strictEqual(teams.awayScore, 1);
assert.strictEqual(isLiveEspnEvent(event), true);
assert.strictEqual(extractMinute(event, {}), 67);

const ended = {
  status: { type: { completed: true, state: 'post', name: 'STATUS_FULL_TIME' } },
};
assert.strictEqual(isLiveEspnEvent(ended), false);

const summary = {
  boxscore: {
    teams: [
      {
        homeAway: 'home',
        statistics: [
          { name: 'shotsOnTarget', displayValue: '7' },
          { name: 'totalShots', displayValue: '15' },
          { name: 'possessionPct', displayValue: '61%' },
          { name: 'cornerKicks', displayValue: '8' },
        ],
      },
      {
        homeAway: 'away',
        statistics: [
          { name: 'shotsOnTarget', displayValue: '3' },
          { name: 'totalShots', displayValue: '8' },
          { name: 'possessionPct', displayValue: '39%' },
          { name: 'cornerKicks', displayValue: '2' },
        ],
      },
    ],
  },
};
const box = boxscoreTeams(summary);
assert.strictEqual(box.home.shots_on_goal, 7);
assert.strictEqual(box.away.total_shots, 8);
assert.strictEqual(box.home.possession, 61);
assert.strictEqual(box.away.corners, 2);

const first = computePower(
  { ...parsed, shots_inside_box: 5, blocked_shots: 1, accurate_passes: 200, total_passes: 250, dangerous_attacks: 0 },
  { ...parsed, shots_on_goal: 2, total_shots: 6, corners: 2, possession: 43, expected_goals: 0.55, shots_inside_box: 2, blocked_shots: 0, accurate_passes: 150, total_passes: 210, dangerous_attacks: 0 },
  60,
  1,
  0,
  null,
);
assert.ok(first.team_power.home > first.team_power.away);
assert.ok(first.goal_power.home > first.goal_power.away);
assert.strictEqual(first.momentum.home, null);

const previousSnapshot = {
  minute: 55,
  score: { home: 1, away: 0 },
  stats: {
    home: { shots_on_goal: 4, total_shots: 9, shots_inside_box: 4, corners: 4, expected_goals: 1.0, dangerous_attacks: 0 },
    away: { shots_on_goal: 2, total_shots: 6, shots_inside_box: 2, corners: 2, expected_goals: 0.55, dangerous_attacks: 0 },
  },
};
const second = computePower(
  { ...parsed, shots_inside_box: 5, blocked_shots: 1, accurate_passes: 200, total_passes: 250, dangerous_attacks: 0 },
  { ...parsed, shots_on_goal: 2, total_shots: 6, corners: 2, possession: 43, expected_goals: 0.55, shots_inside_box: 2, blocked_shots: 0, accurate_passes: 150, total_passes: 210, dangerous_attacks: 0 },
  60,
  1,
  0,
  previousSnapshot,
);
assert.ok(second.momentum.home >= 0);
assert.ok(second.momentum.away >= 0);

const snapshots = mergeSnapshot([
  { minute: 50, observed: true },
  { minute: 55, observed: true },
], { minute: 55, observed: true, marker: 'replace' });
assert.strictEqual(snapshots.length, 2);
assert.strictEqual(snapshots[1].marker, 'replace');

console.log('live-power-series.test.js OK');
