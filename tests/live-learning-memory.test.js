"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

(async () => {
  const moduleUrl = pathToFileURL(path.join(
    __dirname,
    "..",
    "supabase",
    "functions",
    "fl-live-match-analysis",
    "live-learning.mjs"
  )).href;
  const learning = await import(moduleUrl);

  const collecting = learning.evaluateLiveLearningProfile({
    prediction_type: "match_direction",
    settled_count: 20,
    won_count: 15,
    lost_count: 5,
    distinct_match_count: 12,
    distinct_date_count: 4,
  });
  assert.equal(collecting.learning_state, "collecting");
  assert.equal(collecting.threshold_adjustment, 0);
  assert.equal(learning.effectiveThreshold("match_direction", collecting), 18);

  const strong = learning.evaluateLiveLearningProfile({
    prediction_type: "match_direction",
    settled_count: 120,
    won_count: 84,
    lost_count: 36,
    distinct_match_count: 60,
    distinct_date_count: 12,
  });
  assert.equal(strong.learning_state, "boost");
  assert.equal(strong.threshold_adjustment, -1);
  assert.equal(learning.effectiveThreshold("match_direction", strong), 17);

  const weak = learning.evaluateLiveLearningProfile({
    prediction_type: "next_goal",
    settled_count: 100,
    won_count: 39,
    lost_count: 61,
    distinct_match_count: 55,
    distinct_date_count: 10,
  });
  assert.equal(weak.learning_state, "brake");
  assert.equal(weak.threshold_adjustment, 2);
  assert.equal(learning.effectiveThreshold("next_goal", weak), 16);

  assert.equal(learning.minuteBucket(62), 60);
  assert.equal(
    learning.observationKey("fixture-1", "next_goal", 62),
    "fixture-1:next_goal:60"
  );

  assert.deepEqual(
    learning.scoreDeltaOutcome({ home: 1, away: 0 }, { home: 2, away: 0 }),
    { resolution: "HOME", home_delta: 1, away_delta: 0 }
  );
  assert.deepEqual(
    learning.scoreDeltaOutcome({ home: 1, away: 0 }, { home: 1, away: 1 }),
    { resolution: "AWAY", home_delta: 0, away_delta: 1 }
  );
  assert.equal(
    learning.scoreDeltaOutcome({ home: 1, away: 0 }, { home: 1, away: 0 }),
    null
  );
  assert.equal(
    learning.scoreDeltaOutcome({ home: 0, away: 0 }, { home: 1, away: 1 }).resolution,
    "AMBIGUOUS"
  );

  assert.equal(learning.finalDirection({ home: 2, away: 1 }), "1");
  assert.equal(learning.finalDirection({ home: 1, away: 1 }), "X");
  assert.equal(learning.finalDirection({ home: 0, away: 2 }), "2");
  assert.equal(learning.finalDirection({ home: null, away: 2 }), null);

  const rows = learning.buildObservationRows(
    {
      fixture_id: "fixture-2",
      date: "2026-09-20",
      league: "Test Ligi",
      home: "Alpha",
      away: "Beta",
      collector_version: "collector-v1",
    },
    {
      minute: 63,
      score: { home: 1, away: 0 },
    },
    {
      status: "ready",
      evidence_score: 78,
      result_lean: { code: "1", strength: 73 },
      next_goal_lean: { code: "HOME", strength: 69 },
      diagnostics: { direction_score: 25, next_goal_score: 19 },
    },
    "2026-09-20T10:00:00.000Z"
  );
  assert.equal(rows.length, 2);
  assert.equal(rows[0].minute_bucket, 60);
  assert.equal(rows[0].status, "pending");
  assert.equal(rows[0].prediction_type, "match_direction");
  assert.equal(rows[1].prediction_type, "next_goal");

  const noSignalRows = learning.buildObservationRows(
    { fixture_id: "fixture-3" },
    { minute: 40, score: { home: 0, away: 0 } },
    { status: "ready", result_lean: { code: null }, next_goal_lean: { code: null } },
    "2026-09-20T10:00:00.000Z"
  );
  assert.equal(noSignalRows.length, 0);

  const sql = fs.readFileSync(
    path.join(__dirname, "..", "supabase", "sql", "live-learning-schema.sql"),
    "utf8"
  );
  assert.match(sql, /alter table public\.live_learning_observations enable row level security/i);
  assert.match(sql, /revoke all on table public\.live_learning_observations from public, anon, authenticated/i);
  assert.match(sql, /grant .* to service_role/i);
  assert.match(sql, /row_number\(\) over\s*\([\s\S]*partition by prediction_type, fixture_id/i);
  assert.match(sql, /where fixture_rank = 1/i);
  assert.match(sql, /security invoker/i);
  assert.doesNotMatch(sql, /security definer/i);

  console.log("live-learning-memory.test.js: OK");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
