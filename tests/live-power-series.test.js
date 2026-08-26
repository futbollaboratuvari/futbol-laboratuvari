const assert = require('assert');
const {
  normalizeName,
  nameSimilarity,
  parseTeamStats,
  computePower,
  mergeSnapshot,
} = require('../scripts/update-live-power-series');

assert.strictEqual(normalizeName('Real Madrid CF'), 'real madrid');
assert(nameSimilarity('Fenerbahçe', 'Fenerbahce SK') > 0.9);
assert(nameSimilarity('Manchester United', 'Manchester City') < 0.8);

const parsed = parseTeamStats({
  statistics: [
    { type: 'Shots on Goal', value: 5 },
    { type: 'Total Shots', value: 12 },
    { type: 'Shots insidebox', value: 8 },
    { type: 'Corner Kicks', value: 6 },
    { type: 'Ball Possession', value: '61%' },
    { type: 'expected_goals', value: '1.42' },
  ],
});
assert.strictEqual(parsed.shots_on_goal, 5);
assert.strictEqual(parsed.total_shots, 12);
assert.strictEqual(parsed.possession, 61);
assert.strictEqual(parsed.expected_goals, 1.42);

const home = {
  shots_on_goal: 6,
  total_shots: 14,
  shots_inside_box: 9,
  blocked_shots: 2,
  corners: 7,
  possession: 62,
  accurate_passes: 310,
  total_passes: 360,
  expected_goals: 1.7,
  dangerous_attacks: 0,
};
const away = {
  shots_on_goal: 2,
  total_shots: 6,
  shots_inside_box: 3,
  blocked_shots: 1,
  corners: 2,
  possession: 38,
  accurate_passes: 180,
  total_passes: 230,
  expected_goals: 0.55,
  dangerous_attacks: 0,
};
const first = computePower(home, away, 55, 1, 0, null);
assert(first.team_power.home > 60);
assert(first.team_power.away < 40);
assert(first.goal_power.home > first.goal_power.away);
assert.strictEqual(first.momentum.home, null);

const previousSnapshot = {
  minute: 45,
  score: { home: 0, away: 0 },
  stats: {
    home: { ...home, shots_on_goal: 3, total_shots: 9, shots_inside_box: 5, corners: 4, expected_goals: 1.0 },
    away: { ...away, shots_on_goal: 2, total_shots: 5, shots_inside_box: 2, corners: 2, expected_goals: 0.5 },
  },
};
const withMomentum = computePower(home, away, 55, 1, 0, previousSnapshot);
assert(withMomentum.momentum.home > withMomentum.momentum.away);

let series = mergeSnapshot([], { minute: 30, recorded_at: 'a' });
series = mergeSnapshot(series, { minute: 15, recorded_at: 'b' });
series = mergeSnapshot(series, { minute: 30, recorded_at: 'c' });
assert.deepStrictEqual(series.map((row) => row.minute), [15, 30]);
assert.strictEqual(series[1].recorded_at, 'c');

console.log('live-power-series.test.js OK');
