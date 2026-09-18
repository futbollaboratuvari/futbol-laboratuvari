"use strict";

const fs = require("fs");
const path = require("path");
const { collectCandidates } = require("./robot-specialists/shared");
const { runBttsSpecialist } = require("./robot-specialists/btts-specialist");
const { runGoalsSpecialist } = require("./robot-specialists/goals-specialist");
const { runHtftSpecialist } = require("./robot-specialists/htft-specialist");
const { runMatchResultSpecialist } = require("./robot-specialists/match-result-specialist");

const VERSION = "robot-specialist-orchestrator-v1";
const root = path.join(__dirname, "..");
const robotPath = path.join(root, "data", "robot-analysis.json");

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}

function writeJson(file, value) {
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function routeMatch(item) {
  const candidates = collectCandidates(item);
  const specialistOutputs = {
    btts: runBttsSpecialist(item, candidates),
    goals: runGoalsSpecialist(item, candidates),
    htft: runHtftSpecialist(item, candidates),
    match_result: runMatchResultSpecialist(item, candidates),
  };
  return {
    ...item,
    specialist_outputs: specialistOutputs,
    specialist_router_version: VERSION,
  };
}

function summarize(matches) {
  const summary = {
    match_count: matches.length,
    candidate_count: 0,
    eligible_count: 0,
    specialists: {},
  };
  for (const id of ["btts", "goals", "htft", "match_result"]) {
    let candidates = 0;
    let eligible = 0;
    let readyMatches = 0;
    for (const match of matches) {
      const result = match.specialist_outputs?.[id];
      candidates += Number(result?.candidate_count || 0);
      eligible += Number(result?.eligible_count || 0);
      if (result?.status === "ready") readyMatches += 1;
    }
    summary.specialists[id] = { candidate_count: candidates, eligible_count: eligible, ready_match_count: readyMatches };
    summary.candidate_count += candidates;
    summary.eligible_count += eligible;
  }
  return summary;
}

function runOrchestrator(payload) {
  if (!payload || !Array.isArray(payload.matches)) throw new Error("invalid_robot_analysis");
  const matches = payload.matches.map(routeMatch);
  return {
    ...payload,
    matches,
    specialist_orchestrator: {
      version: VERSION,
      generated_at: payload.generated_at || new Date().toISOString(),
      policy: "Ortak veri çekirdeği korunur; marketler ayrı uzman robotlara yönlendirilir; uzman katman ana olasılığı yükseltmez ve bloklanan adayı geri açmaz.",
      ...summarize(matches),
    },
  };
}

function main() {
  const payload = readJson(robotPath, null);
  const output = runOrchestrator(payload);
  writeJson(robotPath, output);
  console.log(JSON.stringify(output.specialist_orchestrator));
  return output;
}

if (require.main === module) main();

module.exports = { VERSION, main, routeMatch, runOrchestrator, summarize };
