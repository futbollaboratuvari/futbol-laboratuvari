"use strict";

const fs = require("node:fs");
const path = require("node:path");

const file = path.join(__dirname, "..", "data", "live-power-series.json");
const payload = JSON.parse(fs.readFileSync(file, "utf8"));
const active = Array.isArray(payload.matches) ? payload.matches : [];
const recent = Array.isArray(payload.recent_matches) ? payload.recent_matches : [];
const allSnapshots = [...active, ...recent].flatMap((match) => Array.isArray(match.snapshots) ? match.snapshots : []);
const metricFields = [
  "shots_on_goal", "total_shots", "shots_inside_box", "blocked_shots", "corners",
  "possession", "accurate_passes", "total_passes", "expected_goals", "dangerous_attacks",
];

if (!String(payload.source || "").startsWith("ESPN")) throw new Error("free source chain missing");
if (payload.sampling?.paid_api_required !== false) throw new Error("paid API flag invalid");
if (payload.status !== "provider_error" && payload.source_verified !== true) throw new Error("source not verified");
if (payload.status === "provider_error" && payload.source_verified !== false) throw new Error("provider error verification flag invalid");
if (payload.status === "ok" && active.length < 1) throw new Error("ok status without sampled match");
const sampled = active.filter((match) => match.status === "live" && match.updated_at === payload.generated_at);
if (payload.status !== "provider_error" && Number(payload.summary?.sampled_match_count || 0) !== sampled.length) {
  throw new Error("sampled match count mismatch");
}
if (allSnapshots.some((snapshot) => snapshot.observed !== true || snapshot.interpolated !== false)) {
  throw new Error("non-observed or interpolated live power point found");
}

for (const match of sampled) {
  const current = match.current;
  if (!current || current.observed !== true || current.interpolated !== false) throw new Error("active match current snapshot invalid");
  if (!current.data_coverage || Number(current.data_coverage.common_metric_count || 0) < 1) {
    throw new Error("active match data coverage missing");
  }
  for (const side of ["home", "away"]) {
    const stats = current.stats?.[side];
    if (!stats) throw new Error(`active match ${side} stats missing`);
    for (const key of metricFields) {
      const value = stats[key];
      if (value !== null && !Number.isFinite(Number(value))) throw new Error(`invalid ${side}.${key}`);
    }
  }
}

const unsafeError = (Array.isArray(payload.provider_errors) ? payload.provider_errors : [])
  .find((value) => !/^[a-z0-9_.:-]{1,140}$/i.test(String(value)));
if (unsafeError) throw new Error("unsafe provider error leaked into public JSON");

console.log("live-power-series.json OK");

