import { createClient } from "@supabase/supabase-js";
import {
  LIVE_LEARNING_VERSION,
  buildObservationRows,
  effectiveThreshold,
  finalDirection,
  profileSummary,
  scoreDeltaOutcome,
} from "./live-learning.mjs";

const VERSION = "fl-live-match-analysis-v2-learning";
const STATE_ID = "current";
const TOPIC = "live-match-analysis";
const MAX_MATCHES = 12;
const MAX_SNAPSHOTS = 12;
const MIN_MINUTE = 8;
const MAX_FRESH_MINUTES = 20;
const MIN_COVERAGE = 0.375;
const MIN_COMMON_METRICS = 3;
const SCOREBOARD_URL = "https://site.web.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard?limit=1000";
const TRUSTED = new Set([
  "https://futbollaboratuuvari.org",
  "https://www.futbollaboratuuvari.org",
]);

type Row = Record<string, any>;

const finite = (value: any) => {
  if (value === null || value === undefined || value === "" || value === "-") return null;
  const number = Number(String(value).replace("%", "").replace(",", "."));
  return Number.isFinite(number) ? number : null;
};
const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, value));
const nowIso = () => new Date().toISOString();

const headers = (req: Request) => {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": TRUSTED.has(origin) ? origin : "https://futbollaboratuuvari.org",
    "Access-Control-Allow-Headers": "content-type,apikey,x-client-info",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Cache-Control": "private, no-store, max-age=0",
    "Pragma": "no-cache",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
  };
};

const json = (req: Request, status: number, body: any) => new Response(JSON.stringify(body), {
  status,
  headers: { ...headers(req), "Content-Type": "application/json; charset=utf-8" },
});

function publishableKeys() {
  try {
    const parsed = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "{}");
    return Object.values(parsed).map(String).filter(Boolean);
  } catch {
    return [];
  }
}

function secretKey() {
  try {
    const parsed = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    return String(parsed.default || Object.values(parsed)[0] || "");
  } catch {
    return "";
  }
}

function authorized(req: Request) {
  const key = String(req.headers.get("apikey") || "");
  const legacy = String(Deno.env.get("SUPABASE_ANON_KEY") || "");
  return Boolean(key && (publishableKeys().includes(key) || key === legacy));
}

function originAllowed(req: Request) {
  const origin = req.headers.get("origin") || "";
  return !origin || TRUSTED.has(origin);
}

function cleanKey(value: any) {
  return String(value || "")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function statsMap(rows: any[]) {
  const map = new Map<string, any>();
  for (const row of Array.isArray(rows) ? rows : []) {
    const key = cleanKey(row?.name || row?.label || row?.abbreviation || row?.type);
    const value = row?.displayValue ?? row?.value;
    if (!key) continue;
    map.set(key, value);
    map.set(key.replace(/\s+/g, ""), value);
  }
  return map;
}

function firstStat(map: Map<string, any>, names: string[]) {
  for (const name of names) {
    const value = finite(map.get(cleanKey(name)));
    if (value !== null) return value;
    const squeezed = finite(map.get(cleanKey(name).replace(/\s+/g, "")));
    if (squeezed !== null) return squeezed;
  }
  return null;
}

function parseStats(rows: any[]) {
  const map = statsMap(rows);
  return {
    shots_on_goal: firstStat(map, ["shots on target", "shots on goal", "shotsontarget"]),
    total_shots: firstStat(map, ["total shots", "shots total", "shots"]),
    shots_inside_box: firstStat(map, ["shots inside box", "shots insidebox"]),
    blocked_shots: firstStat(map, ["blocked shots"]),
    corners: firstStat(map, ["corner kicks", "corners", "corner kick", "won corners", "woncorners"]),
    possession: firstStat(map, ["possession", "ball possession", "possessionpct"]),
    accurate_passes: firstStat(map, ["accurate passes", "passes accurate", "accuratepasses"]),
    total_passes: firstStat(map, ["total passes", "passes total", "passes"]),
    expected_goals: firstStat(map, ["expected goals", "expected goals xg", "xg"]),
    dangerous_attacks: firstStat(map, ["dangerous attacks"]),
  };
}

function competitors(event: Row) {
  return Array.isArray(event?.competitions?.[0]?.competitors) ? event.competitions[0].competitors : [];
}

function competitor(event: Row, side: "home" | "away") {
  const rows = competitors(event);
  return rows.find((row: Row) => row?.homeAway === side) || rows[side === "home" ? 0 : 1] || {};
}

function teamName(row: Row) {
  return String(row?.team?.displayName || row?.team?.shortDisplayName || row?.team?.name || "").trim();
}

function scoreOf(row: Row) {
  return finite(row?.score) ?? 0;
}

function eventMinute(event: Row) {
  const candidates = [
    event?.status?.displayClock,
    event?.competitions?.[0]?.status?.displayClock,
  ];
  for (const value of candidates) {
    const matched = String(value || "").match(/(\d{1,3})/);
    if (matched) return Number(matched[1]);
  }
  const period = finite(event?.status?.period ?? event?.competitions?.[0]?.status?.period);
  if (period === 1) return 45;
  if (period !== null && period >= 2) return 90;
  return null;
}

function isLive(event: Row) {
  const status = event?.status?.type || event?.competitions?.[0]?.status?.type || {};
  if (status.completed) return false;
  if (status.state === "in") return true;
  return /^STATUS_(IN_PROGRESS|HALFTIME|SECOND_HALF|FIRST_HALF|EXTRA_TIME|SHOOTOUT)/.test(String(status.name || ""));
}

const POWER_METRICS = [
  "shots_on_goal",
  "total_shots",
  "shots_inside_box",
  "blocked_shots",
  "corners",
  "possession",
  "expected_goals",
  "dangerous_attacks",
];

function coverage(home: Row, away: Row) {
  const homeMetrics = POWER_METRICS.filter((key) => finite(home?.[key]) !== null);
  const awayMetrics = POWER_METRICS.filter((key) => finite(away?.[key]) !== null);
  const common = homeMetrics.filter((key) => awayMetrics.includes(key));
  const ratio = common.length / POWER_METRICS.length;
  return {
    home_metric_count: homeMetrics.length,
    away_metric_count: awayMetrics.length,
    common_metric_count: common.length,
    common_metrics: common,
    missing_metrics: POWER_METRICS.filter((key) => !common.includes(key)),
    ratio: Number(ratio.toFixed(3)),
    label: ratio >= 0.75 ? "high" : ratio >= 0.4 ? "medium" : ratio > 0 ? "limited" : "unavailable",
    expected_goals_observed: {
      home: homeMetrics.includes("expected_goals"),
      away: awayMetrics.includes("expected_goals"),
    },
  };
}

function weighted(stats: Row, weights: Row, allowed: string[]) {
  let sum = 0;
  for (const [key, weight] of Object.entries(weights)) {
    if (!allowed.includes(key)) continue;
    const value = finite(stats?.[key]);
    if (value !== null) sum += value * Number(weight);
  }
  return sum;
}

function attackWeight(stats: Row, goals: number, allowed: string[]) {
  return weighted(stats, {
    shots_on_goal: 4.5,
    total_shots: 1.25,
    shots_inside_box: 1.8,
    blocked_shots: 0.35,
    corners: 1.1,
    possession: 0.05,
    expected_goals: 12,
    dangerous_attacks: 0.25,
  }, allowed) + goals * 7;
}

function goalThreat(stats: Row, minute: number, goals: number, allowed: string[]) {
  const weights = {
    shots_on_goal: 5,
    total_shots: 1.2,
    shots_inside_box: 2,
    corners: 1.2,
    expected_goals: 18,
    dangerous_attacks: 0.25,
  };
  const observed = Object.keys(weights).filter((key) => allowed.includes(key) && finite(stats?.[key]) !== null);
  if (!observed.length) return null;
  const raw = weighted(stats, weights, allowed) + goals * 5;
  return clamp(Math.round((raw / Math.max(10, minute)) * 32));
}

function delta(current: Row, previous: Row | undefined, key: string) {
  const c = finite(current?.[key]);
  const p = finite(previous?.[key]);
  if (c === null || p === null) return null;
  return Math.max(0, c - p);
}

function momentum(current: Row, previous: Row | undefined, minute: number, previousMinute: number | null, goals: number, oldGoals: number | null) {
  if (!previous || previousMinute === null) return null;
  const elapsed = Math.max(1, minute - previousMinute);
  const weightedDeltas = [
    ["shots_on_goal", 12],
    ["total_shots", 4],
    ["shots_inside_box", 6],
    ["corners", 4],
    ["expected_goals", 35],
    ["dangerous_attacks", 0.6],
  ].map(([key, weight]) => {
    const value = delta(current, previous, String(key));
    return value === null ? null : value * Number(weight);
  }).filter((value) => value !== null) as number[];
  if (oldGoals !== null) weightedDeltas.push(Math.max(0, goals - oldGoals) * 18);
  if (!weightedDeltas.length) return null;
  return clamp(Math.round((weightedDeltas.reduce((sum, value) => sum + value, 0) / elapsed) * 10));
}

function computePower(homeStats: Row, awayStats: Row, minute: number, homeGoals: number, awayGoals: number, previous: Row | null) {
  const dataCoverage = coverage(homeStats, awayStats);
  const allowed = dataCoverage.common_metrics;
  const homeRaw = attackWeight(homeStats, homeGoals, allowed);
  const awayRaw = attackWeight(awayStats, awayGoals, allowed);
  const total = homeRaw + awayRaw;
  const homeShare = total > 0 ? Math.round((homeRaw / total) * 100) : null;
  return {
    team_power: {
      home: homeShare,
      away: homeShare === null ? null : 100 - homeShare,
    },
    goal_power: {
      home: goalThreat(homeStats, minute, homeGoals, allowed),
      away: goalThreat(awayStats, minute, awayGoals, allowed),
    },
    momentum: {
      home: momentum(homeStats, previous?.stats?.home, minute, finite(previous?.minute), homeGoals, finite(previous?.score?.home)),
      away: momentum(awayStats, previous?.stats?.away, minute, finite(previous?.minute), awayGoals, finite(previous?.score?.away)),
    },
    data_coverage: dataCoverage,
  };
}

function diff(home: Row, away: Row, key: string) {
  const h = finite(home?.[key]);
  const a = finite(away?.[key]);
  return h === null || a === null ? 0 : h - a;
}

function evidenceScore(match: Row, snap: Row) {
  const ratio = finite(snap?.data_coverage?.ratio) ?? 0;
  const common = finite(snap?.data_coverage?.common_metric_count) ?? 0;
  const snapshotCount = Array.isArray(match?.snapshots) ? match.snapshots.length : 0;
  const momentumKnown = finite(snap?.momentum?.home) !== null && finite(snap?.momentum?.away) !== null;
  const xgKnown = finite(snap?.stats?.home?.expected_goals) !== null && finite(snap?.stats?.away?.expected_goals) !== null;
  return clamp((ratio * 45) + ((Math.min(common, 8) / 8) * 20) + (snapshotCount >= 2 ? 15 : 5) + (momentumKnown ? 10 : 0) + (xgKnown ? 10 : 0));
}

function analyze(match: Row, snap: Row, learningProfiles: Row = {}) {
  const minute = finite(snap?.minute) ?? 0;
  const ratio = finite(snap?.data_coverage?.ratio) ?? 0;
  const common = finite(snap?.data_coverage?.common_metric_count) ?? 0;
  if (minute < MIN_MINUTE) return { status: "insufficient_data", reason: "minute_too_early", primary_prediction: { type: "wait", label: "Veri yeterli değil · tahmin verilmedi", confidence: null } };
  if (ratio < MIN_COVERAGE || common < MIN_COMMON_METRICS) return { status: "insufficient_data", reason: "coverage_too_low", primary_prediction: { type: "wait", label: "Veri yeterli değil · tahmin verilmedi", confidence: null } };

  const homeStats = snap.stats?.home || {};
  const awayStats = snap.stats?.away || {};
  const homeScore = finite(snap?.score?.home) ?? 0;
  const awayScore = finite(snap?.score?.away) ?? 0;
  const teamDiff = (finite(snap?.team_power?.home) ?? 0) - (finite(snap?.team_power?.away) ?? 0);
  const goalDiff = (finite(snap?.goal_power?.home) ?? 0) - (finite(snap?.goal_power?.away) ?? 0);
  const momentumDiff = (finite(snap?.momentum?.home) ?? 0) - (finite(snap?.momentum?.away) ?? 0);
  const sotDiff = diff(homeStats, awayStats, "shots_on_goal");
  const shotDiff = diff(homeStats, awayStats, "total_shots");
  const cornerDiff = diff(homeStats, awayStats, "corners");
  const xgDiff = diff(homeStats, awayStats, "expected_goals");
  const scoreWeight = minute >= 70 ? 24 : minute >= 45 ? 16 : 9;
  const directionScore = (teamDiff * 0.38) + (goalDiff * 0.2) + (momentumDiff * 0.12) + (sotDiff * 4.2) + (shotDiff * 1.1) + (cornerDiff * 1.2) + (xgDiff * 12) + ((homeScore - awayScore) * scoreWeight);
  const nextGoalScore = (teamDiff * 0.23) + (goalDiff * 0.5) + (momentumDiff * 0.17) + (sotDiff * 4.5) + (shotDiff * 0.9) + (xgDiff * 14);
  const directionThreshold = effectiveThreshold("match_direction", learningProfiles?.match_direction) ?? 18;
  const nextGoalThreshold = effectiveThreshold("next_goal", learningProfiles?.next_goal) ?? 14;

  const resultLean = directionScore >= directionThreshold
    ? { code: "1", label: "Ev sahibi yönü", side: "home", strength: clamp(50 + Math.abs(directionScore) * 0.9, 50, 90) }
    : directionScore <= -directionThreshold
      ? { code: "2", label: "Deplasman yönü", side: "away", strength: clamp(50 + Math.abs(directionScore) * 0.9, 50, 90) }
      : homeScore === awayScore && minute >= 55 && Math.abs(directionScore) <= 10
        ? { code: "X", label: "Beraberlik yönü", side: "draw", strength: clamp(68 - Math.abs(directionScore), 50, 72) }
        : { code: null, label: "Taraf için ayrışma yok", side: "neutral", strength: 50 };

  const nextGoalLean = nextGoalScore >= nextGoalThreshold
    ? { code: "HOME", label: "Sonraki gol eğilimi: Ev sahibi", side: "home", strength: clamp(52 + Math.abs(nextGoalScore), 52, 90) }
    : nextGoalScore <= -nextGoalThreshold
      ? { code: "AWAY", label: "Sonraki gol eğilimi: Deplasman", side: "away", strength: clamp(52 + Math.abs(nextGoalScore), 52, 90) }
      : { code: null, label: "Sonraki gol için net ayrışma yok", side: "neutral", strength: 50 };

  const goalHome = finite(snap?.goal_power?.home) ?? 0;
  const goalAway = finite(snap?.goal_power?.away) ?? 0;
  const maxMomentum = Math.max(finite(snap?.momentum?.home) ?? 0, finite(snap?.momentum?.away) ?? 0);
  const pressureScore = Math.round(clamp((Math.max(goalHome, goalAway) * 0.62) + ((goalHome + goalAway) * 0.16) + (maxMomentum * 0.22)));
  const goalPressure = pressureScore >= 65
    ? { level: "high", label: "Gol baskısı yüksek", score: pressureScore }
    : pressureScore >= 42
      ? { level: "medium", label: "Gol baskısı orta", score: pressureScore }
      : { level: "low", label: "Gol baskısı düşük", score: pressureScore };

  const evidence = evidenceScore(match, snap);
  const candidates: any[] = [];
  if (resultLean.code) candidates.push({ type: "match_direction", label: resultLean.label, strength: resultLean.strength });
  if (nextGoalLean.code) candidates.push({ type: "next_goal", label: nextGoalLean.label, strength: nextGoalLean.strength });
  if (goalPressure.level === "high") candidates.push({ type: "goal_pressure", label: goalPressure.label, strength: goalPressure.score });
  candidates.sort((a, b) => b.strength - a.strength);
  const primary = candidates[0]
    ? { type: candidates[0].type, label: candidates[0].label, confidence: Math.round(clamp((candidates[0].strength * 0.72) + (evidence * 0.28), 50, 90)) }
    : { type: "watch", label: "Net canlı tahmin yok · izlemeye devam", confidence: Math.round(Math.min(59, evidence)) };

  const signals = [
    `Team Power: ${match.home} %${Math.round(finite(snap?.team_power?.home) ?? 0)} · ${match.away} %${Math.round(finite(snap?.team_power?.away) ?? 0)}.`,
    `Goal Power: ${match.home} %${Math.round(goalHome)} · ${match.away} %${Math.round(goalAway)}.`,
    `Maç yönü: ${resultLean.label}. ${nextGoalLean.label}. ${goalPressure.label}.`,
    `Canlı veri kapsamı: ${snap?.data_coverage?.label || "belirsiz"} (${common}/8 ortak metrik).`,
  ];

  return {
    status: "ready",
    evidence_score: Math.round(evidence),
    risk: evidence >= 75 ? "Düşük veri riski" : evidence >= 58 ? "Orta veri riski" : "Yüksek veri riski",
    primary_prediction: primary,
    result_lean: resultLean,
    next_goal_lean: nextGoalLean,
    goal_pressure: goalPressure,
    signals,
    confidence_semantics: "Model güveni canlı sinyal tutarlılığıdır; sonuç olasılığı değildir.",
    live_learning: {
      version: LIVE_LEARNING_VERSION,
      match_direction: profileSummary(learningProfiles?.match_direction, "match_direction"),
      next_goal: profileSummary(learningProfiles?.next_goal, "next_goal"),
    },
    diagnostics: {
      direction_score: Number(directionScore.toFixed(2)),
      next_goal_score: Number(nextGoalScore.toFixed(2)),
      direction_threshold: directionThreshold,
      next_goal_threshold: nextGoalThreshold,
      team_power_diff: Number(teamDiff.toFixed(2)),
      goal_power_diff: Number(goalDiff.toFixed(2)),
      momentum_diff: Number(momentumDiff.toFixed(2)),
    },
  };
}


function eventScore(event: Row) {
  const home = finite(competitor(event, "home")?.score);
  const away = finite(competitor(event, "away")?.score);
  return home === null || away === null ? null : { home, away };
}

function isFinished(event: Row) {
  const status = event?.status?.type || event?.competitions?.[0]?.status?.type || {};
  const name = String(status?.name || "");
  return status.completed === true
    && /^STATUS_(FULL_TIME|FINAL|FINAL_PEN|FINAL_AET|END_OF_EXTRA_TIME)$/.test(name);
}

async function loadLearningProfiles(admin: any) {
  const { data, error } = await admin.from("live_learning_profiles")
    .select("prediction_type,settled_count,won_count,lost_count,void_count,distinct_match_count,distinct_date_count,success_rate,wilson_low,wilson_high,learning_state,threshold_adjustment,updated_at");
  if (error) {
    console.warn("live_learning_profile_read", error.message);
    return {};
  }
  return Object.fromEntries((Array.isArray(data) ? data : []).map((row: Row) => [String(row.prediction_type), row]));
}

async function refreshLearningProfiles(admin: any) {
  const { error } = await admin.rpc("refresh_live_learning_profiles");
  if (error) {
    console.warn("live_learning_profile_refresh", error.message);
    return false;
  }
  return true;
}

async function resolveNextGoalPredictions(admin: any, fixtureId: string, previousScore: Row, currentScore: Row, resolvedAt: string) {
  const outcome = scoreDeltaOutcome(previousScore, currentScore);
  if (!outcome) return false;
  const resolution = String(outcome.resolution || "");
  const base = {
    resolved_at: resolvedAt,
    resolution_code: resolution,
    resolved_score_home: Number(currentScore.home),
    resolved_score_away: Number(currentScore.away),
    updated_at: resolvedAt,
  };

  if (resolution === "AMBIGUOUS") {
    const { error } = await admin.from("live_learning_observations")
      .update({ ...base, status: "void" })
      .eq("fixture_id", fixtureId)
      .eq("prediction_type", "next_goal")
      .eq("status", "pending");
    if (error) console.warn("live_learning_next_goal_void", error.message);
    return true;
  }

  const [won, lost] = await Promise.all([
    admin.from("live_learning_observations")
      .update({ ...base, status: "won" })
      .eq("fixture_id", fixtureId)
      .eq("prediction_type", "next_goal")
      .eq("status", "pending")
      .eq("predicted_code", resolution),
    admin.from("live_learning_observations")
      .update({ ...base, status: "lost" })
      .eq("fixture_id", fixtureId)
      .eq("prediction_type", "next_goal")
      .eq("status", "pending")
      .neq("predicted_code", resolution),
  ]);
  if (won.error) console.warn("live_learning_next_goal_won", won.error.message);
  if (lost.error) console.warn("live_learning_next_goal_lost", lost.error.message);
  return true;
}

async function settleFinishedLearning(admin: any, event: Row, previous: Row | null, resolvedAt: string) {
  const fixtureId = String(event?.id || event?.competitions?.[0]?.id || "").trim();
  const finalScore = eventScore(event);
  if (!fixtureId || !finalScore) return false;

  if (previous?.current?.score) {
    await resolveNextGoalPredictions(admin, fixtureId, previous.current.score, finalScore, resolvedAt);
  }

  const { error: voidError } = await admin.from("live_learning_observations")
    .update({
      status: "void",
      resolved_at: resolvedAt,
      resolution_code: "NO_OBSERVABLE_NEXT_GOAL_BEFORE_FINISH",
      resolved_score_home: Number(finalScore.home),
      resolved_score_away: Number(finalScore.away),
      updated_at: resolvedAt,
    })
    .eq("fixture_id", fixtureId)
    .eq("prediction_type", "next_goal")
    .eq("status", "pending");
  if (voidError) console.warn("live_learning_next_goal_finish_void", voidError.message);

  const direction = finalDirection(finalScore);
  if (!direction) return true;
  const base = {
    resolved_at: resolvedAt,
    resolution_code: direction,
    resolved_score_home: Number(finalScore.home),
    resolved_score_away: Number(finalScore.away),
    updated_at: resolvedAt,
  };
  const [won, lost] = await Promise.all([
    admin.from("live_learning_observations")
      .update({ ...base, status: "won" })
      .eq("fixture_id", fixtureId)
      .eq("prediction_type", "match_direction")
      .eq("status", "pending")
      .eq("predicted_code", direction),
    admin.from("live_learning_observations")
      .update({ ...base, status: "lost" })
      .eq("fixture_id", fixtureId)
      .eq("prediction_type", "match_direction")
      .eq("status", "pending")
      .neq("predicted_code", direction),
  ]);
  if (won.error) console.warn("live_learning_direction_won", won.error.message);
  if (lost.error) console.warn("live_learning_direction_lost", lost.error.message);
  return true;
}

async function persistLearningObservations(admin: any, matches: Row[], recordedAt: string) {
  const rows = matches.flatMap((match: Row) =>
    buildObservationRows(match, match.current, match.live_analysis, recordedAt)
  );
  if (!rows.length) return 0;
  const { error } = await admin.from("live_learning_observations")
    .upsert(rows, { onConflict: "observation_key", ignoreDuplicates: true });
  if (error) {
    console.warn("live_learning_observation_write", error.message);
    return 0;
  }
  return rows.length;
}

function mergeSnapshot(previous: Row[], snapshot: Row) {
  const rows = Array.isArray(previous) ? [...previous] : [];
  const last = rows[rows.length - 1];
  const sameMinute = last && Number(last.minute) === Number(snapshot.minute);
  if (sameMinute) rows[rows.length - 1] = snapshot;
  else rows.push(snapshot);
  return rows.slice(-MAX_SNAPSHOTS);
}

async function fetchScoreboard() {
  const response = await fetch(SCOREBOARD_URL, {
    headers: {
      Accept: "application/json",
      "User-Agent": "Mozilla/5.0 (compatible; FutbolLaboratuvari-LiveRealtime/1.0)",
      Referer: "https://www.espn.com/",
    },
    signal: AbortSignal.timeout(7000),
  });
  if (!response.ok) throw new Error(`scoreboard_http_${response.status}`);
  return response.json();
}

function buildSnapshot(event: Row, previous: Row | null, recordedAt: string) {
  const home = competitor(event, "home");
  const away = competitor(event, "away");
  const minute = eventMinute(event);
  if (minute === null) return null;
  const homeStats = parseStats(home?.statistics);
  const awayStats = parseStats(away?.statistics);
  const dataCoverage = coverage(homeStats, awayStats);
  if (dataCoverage.common_metric_count < 1) return null;
  const oldSnapshots = Array.isArray(previous?.snapshots) ? previous.snapshots : [];
  const oldSnapshot = oldSnapshots.length ? oldSnapshots[oldSnapshots.length - 1] : null;
  const power = computePower(homeStats, awayStats, minute, scoreOf(home), scoreOf(away), oldSnapshot);
  return {
    minute,
    recorded_at: recordedAt,
    observed: true,
    interpolated: false,
    score: { home: scoreOf(home), away: scoreOf(away) },
    ...power,
    stats: { home: homeStats, away: awayStats },
  };
}

async function collect(admin: any, previousPayload: Row) {
  const recordedAt = nowIso();
  const scoreboard = await fetchScoreboard();
  const allEvents = Array.isArray(scoreboard?.events) ? scoreboard.events : [];
  const events = allEvents.filter(isLive);
  const previousMap = new Map((Array.isArray(previousPayload?.matches) ? previousPayload.matches : []).map((row: Row) => [String(row.fixture_id), row]));

  let learningResolutionTouched = false;
  for (const event of allEvents) {
    const fixtureId = String(event?.id || event?.competitions?.[0]?.id || "").trim();
    const previous = previousMap.get(fixtureId) || null;
    if (!fixtureId || !previous) continue;

    if (isLive(event)) {
      const currentScore = eventScore(event);
      if (currentScore && previous?.current?.score) {
        const touched = await resolveNextGoalPredictions(admin, fixtureId, previous.current.score, currentScore, recordedAt);
        learningResolutionTouched = learningResolutionTouched || touched;
      }
    } else if (isFinished(event)) {
      const touched = await settleFinishedLearning(admin, event, previous, recordedAt);
      learningResolutionTouched = learningResolutionTouched || touched;
    }
  }

  if (learningResolutionTouched) await refreshLearningProfiles(admin);
  const learningProfiles = await loadLearningProfiles(admin);

  const candidates: Row[] = [];
  for (const event of events) {
    const homeRow = competitor(event, "home");
    const awayRow = competitor(event, "away");
    const home = teamName(homeRow);
    const away = teamName(awayRow);
    const fixtureId = String(event?.id || event?.competitions?.[0]?.id || "").trim();
    if (!fixtureId || !home || !away) continue;
    const previous = previousMap.get(fixtureId) || null;
    const snapshot = buildSnapshot(event, previous, recordedAt);
    if (!snapshot) continue;
    candidates.push({
      event,
      fixtureId,
      home,
      away,
      previous,
      snapshot,
      continuity: previous ? 1 : 0,
      coverage: finite(snapshot?.data_coverage?.ratio) ?? 0,
      common: finite(snapshot?.data_coverage?.common_metric_count) ?? 0,
    });
  }

  candidates.sort((a, b) => (b.continuity - a.continuity) || (b.common - a.common) || (b.coverage - a.coverage));
  const selected = candidates.slice(0, MAX_MATCHES);
  const matches = selected.map((item) => {
    const event = item.event;
    const oldSnapshots = Array.isArray(item.previous?.snapshots) ? item.previous.snapshots : [];
    const snapshots = mergeSnapshot(oldSnapshots, item.snapshot);
    const match: Row = {
      fixture_id: item.fixtureId,
      provider_event_id: item.fixtureId,
      status: "live",
      api_status: String(event?.status?.type?.name || event?.status?.type?.state || "LIVE"),
      date: String(event?.date || recordedAt).slice(0, 10),
      league: String(event?.league?.name || event?.competitions?.[0]?.name || ""),
      home: item.home,
      away: item.away,
      source: "ESPN Scoreboard embedded live statistics",
      source_verified: true,
      verification: {
        provider: "ESPN",
        provider_event_id: item.fixtureId,
        scoreboard_live: true,
        team_pair_present: true,
        cross_source_required: false,
      },
      snapshots,
      current: snapshots[snapshots.length - 1],
      updated_at: recordedAt,
      robot_version: VERSION,
    };
    match.live_analysis = analyze(match, match.current, learningProfiles);
    return match;
  });

  const learningObservationCount = await persistLearningObservations(admin, matches, recordedAt);
  const readyCount = matches.filter((row) => row.live_analysis?.status === "ready").length;
  const payload = {
    schema_version: 2,
    generated_at: recordedAt,
    timezone: "Europe/Istanbul",
    status: matches.length ? "ok" : (events.length ? "no_matching_verified_stats" : "no_live_matches"),
    source: "Supabase realtime collector · ESPN Scoreboard embedded live statistics",
    source_verified: true,
    collector_version: VERSION,
    sampling: {
      target_interval_seconds: 10,
      observed_points_only: true,
      interpolation_used: false,
      max_matches_per_run: MAX_MATCHES,
      max_snapshots_per_match: MAX_SNAPSHOTS,
      github_runtime_dependency: false,
    },
    learning: {
      version: LIVE_LEARNING_VERSION,
      observation_rows_considered: learningObservationCount,
      profile_refresh_triggered: learningResolutionTouched,
      profiles: {
        match_direction: profileSummary(learningProfiles?.match_direction, "match_direction"),
        next_goal: profileSummary(learningProfiles?.next_goal, "next_goal"),
      },
      policy: "Kalibrasyonda her fixture/sinyal türü için yalnız ilk settle edilmiş gözlem bağımsız örnek sayılır. 40 bağımsız sonuç + 20 farklı maç + 7 farklı gün oluşmadan eşik değişmez; sonra yalnız -1 boost veya +2 fren uygulanır.",
    },
    summary: {
      espn_live_event_count: events.length,
      sampled_match_count: matches.length,
      matched_fixture_count: matches.length,
      stats_success_count: matches.length,
      robot_ready_count: readyCount,
      robot_waiting_count: matches.length - readyCount,
    },
    message: matches.length
      ? "Canlı veriler Supabase üzerinde merkezi toplanıyor; Team Power, Goal Power ve Canlı Analiz Robotu yalnız gerçekten gözlenen snapshotlardan güncelleniyor."
      : (events.length ? "Canlı maçlar bulundu ancak yeterli ortak istatistik yok; tahmin uydurulmadı." : "Şu anda ESPN kaynağında canlı maç bulunmuyor."),
    matches,
  };

  const delta = {
    generated_at: recordedAt,
    status: payload.status,
    summary: payload.summary,
    message: payload.message,
    matches: matches.map((row) => ({
      fixture_id: row.fixture_id,
      status: row.status,
      api_status: row.api_status,
      date: row.date,
      league: row.league,
      home: row.home,
      away: row.away,
      source: row.source,
      source_verified: row.source_verified,
      current: row.current,
      live_analysis: row.live_analysis,
      updated_at: row.updated_at,
    })),
  };

  const { error } = await admin.from("live_match_state").upsert({
    id: STATE_ID,
    payload,
    broadcast_delta: delta,
    source_generated_at: recordedAt,
    collector_version: VERSION,
    updated_at: recordedAt,
  }, { onConflict: "id" });
  if (error) throw new Error(`state_upsert_${error.message}`);
  return payload;
}

Deno.serve(async (req: Request) => {
  if (!originAllowed(req)) return json(req, 403, { ok: false, error: "origin_not_allowed" });
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: headers(req) });
  if (!authorized(req)) return json(req, 401, { ok: false, error: "publishable_key_required" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const adminKey = secretKey();
  if (!supabaseUrl || !adminKey) return json(req, 503, { ok: false, error: "server_key_unavailable" });
  const admin = createClient(supabaseUrl, adminKey, { auth: { persistSession: false, autoRefreshToken: false } });

  const url = new URL(req.url);
  if (req.method === "GET") {
    const { data, error } = await admin.from("live_match_state")
      .select("payload,updated_at,collector_version,source_generated_at")
      .eq("id", STATE_ID)
      .maybeSingle();
    if (error) return json(req, 503, { ok: false, error: "state_unavailable" });
    if (url.searchParams.get("action") === "health") {
      const payload = data?.payload || {};
      return json(req, 200, {
        ok: true,
        service: "fl-live-match-analysis",
        version: VERSION,
        runtime: "supabase-edge",
        updated_at: data?.updated_at || null,
        source_generated_at: data?.source_generated_at || null,
        live_match_count: payload?.summary?.sampled_match_count || 0,
        robot_ready_count: payload?.summary?.robot_ready_count || 0,
        live_learning: payload?.learning || null,
        status: payload?.status || "empty",
      });
    }
    return json(req, 200, { ok: true, data: data?.payload || null, updated_at: data?.updated_at || null });
  }

  if (req.method !== "POST") return json(req, 405, { ok: false, error: "method_not_allowed" });
  if (req.headers.get("origin")) return json(req, 403, { ok: false, error: "collector_server_only" });

  const { data: claimed, error: claimError } = await admin.rpc("claim_live_collect_slot", { p_seconds: 7 });
  if (claimError) return json(req, 503, { ok: false, error: "collector_lock_unavailable" });
  if (!claimed) return json(req, 202, { ok: true, skipped: true, reason: "collector_slot_busy" });

  const { data: current } = await admin.from("live_match_state").select("payload").eq("id", STATE_ID).maybeSingle();
  try {
    const payload = await collect(admin, current?.payload || {});
    return json(req, 200, {
      ok: true,
      version: VERSION,
      generated_at: payload.generated_at,
      status: payload.status,
      summary: payload.summary,
    });
  } catch (error) {
    console.error("fl-live-match-analysis", error);
    return json(req, 503, { ok: false, error: String((error as Error)?.message || error).slice(0, 180) });
  }
});
