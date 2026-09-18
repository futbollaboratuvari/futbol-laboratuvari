"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const premium = fs.readFileSync(path.join(root, "premium-analysis-v3.js"), "utf8");
const edge = fs.readFileSync(path.join(root, "supabase", "functions", "fl-pro-analysis", "index.ts"), "utf8");
const exportSource = fs.readFileSync(path.join(root, "scripts", "export-high-value-json.js"), "utf8");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

assert.match(premium, /supabase\.co\/functions\/v1\/fl-pro-analysis/);
assert.doesNotMatch(premium, /futbol-laboratuvari\.vercel\.app/);
assert.doesNotMatch(premium, /\/api\/pro-analysis/);

assert.match(edge, /from\("memberships"\)/);
assert.match(edge, /MAX_ROBOT_BYTES = 12 \* 1024 \* 1024/);
assert.match(edge, /runtime_source: "supabase_edge"/);
assert.match(edge, /source: "github-main robot-analysis protected Supabase projection"/);
assert.match(edge, /TRUSTED = new Set/);
assert.doesNotMatch(edge, /vercel\.app/);

assert.match(exportSource, /analysis_options:/);
assert.match(exportSource, /goal_market_candidates:/);
assert.doesNotMatch(packageJson.scripts.build, /vercel-backend-sync\.test\.js/);

console.log("pro-analysis-supabase-sync.test.js: OK");
