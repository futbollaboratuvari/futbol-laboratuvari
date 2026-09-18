"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const INPUT_FILE = path.join(ROOT, "data", "live-power-series.json");
const OUTPUT_FILE = path.join(ROOT, "data", "live-match-analysis.json");
const VERSION = "live-match-analysis-robot-v1";
const MIN_MINUTE = 8;
const MAX_FRESH_MINUTES = 20;
const MIN_COVERAGE = 0.4;
const MIN_COMMON_METRICS = 3;

function readJson(file, fallback) {
  try {
    const text = fs.readFileSync(file, "utf8").trim();
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function finite(value) {
  if (value === null || value === undefined || value === "" || value === "-") return null;
  const number = Number(String(value).replace("%", "").replace(",", "."));
  return Number.isFinite(number) ? number : null;
}

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function currentSnapshot(match) {
  if (match?.current) return match.current;
  const rows = Array.isArray(match?.snapshots) ? match.snapshots : [];
  return rows.length ? rows[rows.length - 1] : null;
}

function minutesOld(value, nowMs = Date.now()) {
  const time = Date.parse(String(value || ""));
  if (!Number.isFinite(time)) return null;
  return Math.max(0, (nowMs - time) / 60000);
}

function metric(stats, key) {
  return finite(stats?.[key]);
}

function diff(home, away, key) {
  const h = metric(home, key);
  const a = metric(away, key);
  return h === null || a === null ? null : h - a;
}

function evidenceScore(match, snap) {
  const coverage = snap?.data_coverage || {};
  const ratio = finite(coverage.ratio) ?? 0;
  const common = finite(coverage.common_metric_count) ?? 0;
  const snapshots = Array.isArray(match?.snapshots) ? match.snapshots.length : 0;
  const momentumKnown = finite(snap?.momentum?.home) !== null && finite(snap?.momentum?.away) !== null;
  const xgKnown = metric(snap?.stats?.home, "expected_goals") !== null && metric(snap?.stats?.away, "expected_goals") !== null;
  return clamp(
    (ratio * 45)
    + (Math.min(common, 8) / 8 * 20)
    + (snapshots >= 2 ? 15 : 5)
    + (momentumKnown ? 10 : 0)
    + (xgKnown ? 10 : 0)
  );
}

function readiness(match, snap, nowMs = Date.now()) {
  if (!match || match.status !== "live") return { ok: false, reason: "match_not_live" };
  if (match.source_verified !== true) return { ok: false, reason: "source_not_verified" };
  if (!snap || snap.observed !== true || snap.interpolated === true) return { ok: false, reason: "snapshot_not_observed" };
  const minute = finite(snap.minute);
  if (minute === null || minute < MIN_MINUTE) return { ok: false, reason: "minute_too_early" };
  const age = minutesOld(snap.recorded_at, nowMs);
  if (age === null || age > MAX_FRESH_MINUTES) return { ok: false, reason: "snapshot_stale", freshness_minutes: age };
  const coverage = snap.data_coverage || {};
  const ratio = finite(coverage.ratio) ?? 0;
  const common = finite(coverage.common_metric_count) ?? 0;
  if (ratio < MIN_COVERAGE || common < MIN_COMMON_METRICS) return { ok: false, reason: "coverage_too_low" };
  if ([snap.team_power?.home, snap.team_power?.away, snap.goal_power?.home, snap.goal_power?.away].some((v) => finite(v) === null)) {
    return { ok: false, reason: "power_signal_missing" };
  }
  return { ok: true, freshness_minutes: age, minute };
}

function computeSignals(match, snap) {
  const minute = finite(snap.minute) ?? 0;
  const homeScore = finite(snap?.score?.home) ?? 0;
  const awayScore = finite(snap?.score?.away) ?? 0;
  const teamDiff = (finite(snap?.team_power?.home) ?? 0) - (finite(snap?.team_power?.away) ?? 0);
  const goalDiff = (finite(snap?.goal_power?.home) ?? 0) - (finite(snap?.goal_power?.away) ?? 0);
  const momentumHome = finite(snap?.momentum?.home);
  const momentumAway = finite(snap?.momentum?.away);
  const momentumDiff = momentumHome !== null && momentumAway !== null ? momentumHome - momentumAway : 0;
  const homeStats = snap?.stats?.home || {};
  const awayStats = snap?.stats?.away || {};
  const sotDiff = diff(homeStats, awayStats, "shots_on_goal") ?? 0;
  const shotDiff = diff(homeStats, awayStats, "total_shots") ?? 0;
  const cornerDiff = diff(homeStats, awayStats, "corners") ?? 0;
  const xgDiff = diff(homeStats, awayStats, "expected_goals") ?? 0;
  const scoreDiff = homeScore - awayScore;
  const scoreWeight = minute >= 70 ? 24 : minute >= 45 ? 16 : 9;

  const directionScore =
    (teamDiff * 0.38)
    + (goalDiff * 0.2)
    + (momentumDiff * 0.12)
    + (sotDiff * 4.2)
    + (shotDiff * 1.1)
    + (cornerDiff * 1.2)
    + (xgDiff * 12)
    + (scoreDiff * scoreWeight);

  const nextGoalScore =
    (teamDiff * 0.23)
    + (goalDiff * 0.5)
    + (momentumDiff * 0.17)
    + (sotDiff * 4.5)
    + (shotDiff * 0.9)
    + (xgDiff * 14);

  const totalGoalPower = (finite(snap?.goal_power?.home) ?? 0) + (finite(snap?.goal_power?.away) ?? 0);
  const maxGoalPower = Math.max(finite(snap?.goal_power?.home) ?? 0, finite(snap?.goal_power?.away) ?? 0);
  const maxMomentum = Math.max(momentumHome ?? 0, momentumAway ?? 0);
  const goalPressureScore = clamp((maxGoalPower * 0.62) + (totalGoalPower * 0.16) + (maxMomentum * 0.22));

  return {
    minute,
    homeScore,
    awayScore,
    teamDiff,
    goalDiff,
    momentumDiff,
    sotDiff,
    shotDiff,
    cornerDiff,
    xgDiff,
    directionScore,
    nextGoalScore,
    goalPressureScore,
  };
}

function resultLean(signals) {
  const s = signals.directionScore;
  if (s >= 18) return { code: "1", label: "Ev sahibi yönü", side: "home", strength: clamp(50 + Math.abs(s) * 0.9, 50, 90) };
  if (s <= -18) return { code: "2", label: "Deplasman yönü", side: "away", strength: clamp(50 + Math.abs(s) * 0.9, 50, 90) };
  if (signals.homeScore === signals.awayScore && signals.minute >= 55 && Math.abs(s) <= 10) {
    return { code: "X", label: "Beraberlik yönü", side: "draw", strength: clamp(68 - Math.abs(s), 50, 72) };
  }
  return { code: null, label: "Taraf için ayrışma yok", side: "neutral", strength: clamp(45 + (18 - Math.min(18, Math.abs(s))), 45, 60) };
}

function nextGoalLean(signals) {
  const s = signals.nextGoalScore;
  if (s >= 14) return { code: "HOME", label: "Sonraki gol eğilimi: Ev sahibi", side: "home", strength: clamp(52 + Math.abs(s), 52, 90) };
  if (s <= -14) return { code: "AWAY", label: "Sonraki gol eğilimi: Deplasman", side: "away", strength: clamp(52 + Math.abs(s), 52, 90) };
  return { code: null, label: "Sonraki gol için net ayrışma yok", side: "neutral", strength: clamp(45 + Math.max(0, 14 - Math.abs(s)), 45, 59) };
}

function goalPressure(signals) {
  const score = Math.round(signals.goalPressureScore);
  if (score >= 65) return { level: "high", label: "Gol baskısı yüksek", score };
  if (score >= 42) return { level: "medium", label: "Gol baskısı orta", score };
  return { level: "low", label: "Gol baskısı düşük", score };
}

function buildExplanation(match, snap, result, nextGoal, pressure) {
  const rows = [];
  const homePower = finite(snap?.team_power?.home);
  const awayPower = finite(snap?.team_power?.away);
  const homeGoal = finite(snap?.goal_power?.home);
  const awayGoal = finite(snap?.goal_power?.away);
  if (homePower !== null && awayPower !== null) rows.push(`Team Power: ${match.home} %${Math.round(homePower)} · ${match.away} %${Math.round(awayPower)}.`);
  if (homeGoal !== null && awayGoal !== null) rows.push(`Goal Power: ${match.home} %${Math.round(homeGoal)} · ${match.away} %${Math.round(awayGoal)}.`);
  rows.push(`Maç yönü: ${result.label}. ${nextGoal.label}. ${pressure.label}.`);
  if (snap?.data_coverage?.label) rows.push(`Canlı veri kapsamı: ${snap.data_coverage.label} (${snap.data_coverage.common_metric_count ?? 0}/8 ortak metrik).`);
  return rows;
}

function primaryPrediction(result, nextGoal, pressure, evidence) {
  const candidates = [];
  if (result.code) candidates.push({ type: "match_direction", label: result.label, strength: result.strength });
  if (nextGoal.code) candidates.push({ type: "next_goal", label: nextGoal.label, strength: nextGoal.strength });
  if (pressure.level === "high") candidates.push({ type: "goal_pressure", label: pressure.label, strength: pressure.score });
  if (!candidates.length) return { type: "watch", label: "Net canlı tahmin yok · izlemeye devam", confidence: Math.round(Math.min(59, evidence)) };
  candidates.sort((a, b) => b.strength - a.strength);
  const chosen = candidates[0];
  return {
    type: chosen.type,
    label: chosen.label,
    confidence: Math.round(clamp((chosen.strength * 0.72) + (evidence * 0.28), 50, 90)),
  };
}

function analyzeMatch(match, nowMs = Date.now()) {
  const snap = currentSnapshot(match);
  const ready = readiness(match, snap, nowMs);
  const base = {
    fixture_id: String(match?.fixture_id || ""),
    status: ready.ok ? "ready" : "insufficient_data",
    minute: finite(snap?.minute),
    score: snap?.score || null,
    home: match?.home || "",
    away: match?.away || "",
    league: match?.league || "",
    source_verified: match?.source_verified === true,
    snapshot_recorded_at: snap?.recorded_at || null,
    freshness_minutes: ready.freshness_minutes ?? minutesOld(snap?.recorded_at, nowMs),
    data_coverage: snap?.data_coverage || null,
    robot_version: VERSION,
    confidence_semantics: "Model güveni canlı sinyal tutarlılığıdır; sonuç olasılığı değildir.",
  };
  if (!ready.ok) {
    return {
      ...base,
      reason: ready.reason,
      primary_prediction: { type: "wait", label: "Veri yeterli değil · tahmin verilmedi", confidence: null },
      result_lean: null,
      next_goal_lean: null,
      goal_pressure: null,
      signals: [],
    };
  }

  const signals = computeSignals(match, snap);
  const result = resultLean(signals);
  const nextGoal = nextGoalLean(signals);
  const pressure = goalPressure(signals);
  const evidence = evidenceScore(match, snap);
  const primary = primaryPrediction(result, nextGoal, pressure, evidence);
  const risk = evidence >= 75 ? "Düşük veri riski" : evidence >= 58 ? "Orta veri riski" : "Yüksek veri riski";

  return {
    ...base,
    reason: null,
    evidence_score: Math.round(evidence),
    risk,
    primary_prediction: primary,
    result_lean: result,
    next_goal_lean: nextGoal,
    goal_pressure: pressure,
    signals: buildExplanation(match, snap, result, nextGoal, pressure),
    diagnostics: {
      team_power_diff: Number(signals.teamDiff.toFixed(2)),
      goal_power_diff: Number(signals.goalDiff.toFixed(2)),
      momentum_diff: Number(signals.momentumDiff.toFixed(2)),
      shots_on_goal_diff: Number(signals.sotDiff.toFixed(2)),
      total_shots_diff: Number(signals.shotDiff.toFixed(2)),
      corners_diff: Number(signals.cornerDiff.toFixed(2)),
      xg_diff: Number(signals.xgDiff.toFixed(3)),
      direction_score: Number(signals.directionScore.toFixed(2)),
      next_goal_score: Number(signals.nextGoalScore.toFixed(2)),
    },
  };
}

function buildPayload(series, now = new Date()) {
  const nowMs = now instanceof Date ? now.getTime() : Date.parse(String(now));
  const matches = Array.isArray(series?.matches) ? series.matches : [];
  const analyses = matches.map((match) => analyzeMatch(match, nowMs));
  const ready = analyses.filter((row) => row.status === "ready");
  return {
    schema_version: 1,
    generated_at: new Date(nowMs).toISOString(),
    timezone: "Europe/Istanbul",
    engine: "Futbol Laboratuvarı Canlı Maç Analiz Robotu",
    robot_version: VERSION,
    source: "data/live-power-series.json",
    source_generated_at: series?.generated_at || null,
    source_verified: series?.source_verified === true,
    policy: "Yalnız doğrulanmış, gözlenen ve taze canlı snapshotlardan analiz üretir; eksik veriyi sıfır saymaz, tahmin uydurmaz.",
    summary: {
      live_match_count: matches.length,
      ready_count: ready.length,
      waiting_count: analyses.length - ready.length,
      result_lean_count: ready.filter((row) => row.result_lean?.code).length,
      next_goal_lean_count: ready.filter((row) => row.next_goal_lean?.code).length,
      high_goal_pressure_count: ready.filter((row) => row.goal_pressure?.level === "high").length,
    },
    matches: analyses,
  };
}

function main() {
  const series = readJson(INPUT_FILE, { matches: [] });
  const payload = buildPayload(series, new Date());
  writeJson(OUTPUT_FILE, payload);
  console.log(JSON.stringify({
    version: payload.robot_version,
    live_match_count: payload.summary.live_match_count,
    ready_count: payload.summary.ready_count,
    result_lean_count: payload.summary.result_lean_count,
    next_goal_lean_count: payload.summary.next_goal_lean_count,
    high_goal_pressure_count: payload.summary.high_goal_pressure_count,
  }));
}

if (require.main === module) main();

module.exports = {
  VERSION,
  MIN_MINUTE,
  MAX_FRESH_MINUTES,
  MIN_COVERAGE,
  MIN_COMMON_METRICS,
  finite,
  currentSnapshot,
  minutesOld,
  evidenceScore,
  readiness,
  computeSignals,
  resultLean,
  nextGoalLean,
  goalPressure,
  primaryPrediction,
  analyzeMatch,
  buildPayload,
};
