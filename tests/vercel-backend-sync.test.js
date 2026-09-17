"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
const ignoreScript = fs.readFileSync(path.join(root, "scripts", "vercel-ignore-build.js"), "utf8");
const apiSource = fs.readFileSync(path.join(root, "api", "pro-analysis.js"), "utf8");
const gitignore = fs.readFileSync(path.join(root, ".gitignore"), "utf8");

assert.equal(vercel.git?.deploymentEnabled?.main, true, "main backend deploy acik olmali");
assert.equal(vercel.git?.deploymentEnabled?.["*"], false, "main disi otomatik deploy kapali olmali");
assert.match(ignoreScript, /BACKEND_PREFIXES/);
assert.match(ignoreScript, /server-lib\//);
assert.doesNotMatch(ignoreScript, /Git-triggered Vercel deployment blocked/);
assert.match(apiSource, /readRemoteProIndex/);
assert.match(apiSource, /local_deployment_fallback/);
assert.match(gitignore, /data\/pro-analysis-index\.json/, "premium projection public repoya commit edilmemeli");

process.stdout.write("vercel-backend-sync.test.js OK\n");
