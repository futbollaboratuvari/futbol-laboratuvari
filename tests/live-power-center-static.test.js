const fs = require("fs");
const path = require("path");
const assert = require("assert");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const index = read("index.html");
const cache = read("cache-version.js");
const nav = read("nav-routing.js");
const livePower = read("live-power-center-v1.js");
const payload = JSON.parse(read(path.join("data", "live-power-series.json")));
const analysisPayload = JSON.parse(read(path.join("data", "live-match-analysis.json")));

assert(index.includes('id="live-power-center"'), "index.html must contain permanent #live-power-center anchor");
assert(index.includes('id="live-power-center-v1-script"'), "index.html must directly load live-power-center-v1.js");
assert(index.includes("live-power-center-v1.js?v="), "live power direct script must be versioned");
assert(cache.includes('loadScript("live-power-center-v1.js", "live-power-center-v1-script")'), "cache loader must retain live power fallback");
assert(nav.includes('ensureScript("live-power-center-v1.js", "live-power-center-v1-script")'), "navigation runtime must retain live power fallback");
assert(livePower.includes("./data/live-power-series.json"), "live power UI must fetch live-power-series.json");
assert(livePower.includes("./data/live-match-analysis.json"), "live power UI must fetch live-match-analysis.json");
assert(livePower.includes("https://lnngvkitcwwgrljtjwsd.supabase.co"), "live power UI must use Supabase realtime project");
assert(livePower.includes("live_match_state"), "live power UI must read Supabase live_match_state");
assert(livePower.includes("live-match-analysis"), "live power UI must subscribe to live analysis topic");
assert(livePower.includes("@supabase/supabase-js@2.107.0"), "Supabase browser client must be version pinned");
assert(livePower.includes("loadStaticFallback"), "live power UI must retain static fallback");
assert.match(livePower, /status === 'SUBSCRIBED'[\s\S]*realtimeReady = true;[\s\S]*render\(\)/, "Realtime SUBSCRIBED state must render immediately");
assert.match(livePower, /CHANNEL_ERROR'[\s\S]*realtimeReady = false;[\s\S]*render\(\)/, "Realtime channel failure must render fallback state");
assert(livePower.includes("Team Power + Goal Power + Canlı Analiz Robotu"), "live analysis robot UI heading missing");
assert(livePower.includes("Canlı Maç Analiz Robotu"), "live analysis robot detail card missing");
assert(livePower.includes("state.root.id = 'live-power-center'"), "live power reload must preserve stable anchor");
assert(Array.isArray(payload.matches), "live-power-series.json matches must be an array");
assert.equal(analysisPayload.robot_version, "live-match-analysis-robot-v1", "live analysis robot version mismatch");
assert(Array.isArray(analysisPayload.matches), "live-match-analysis.json matches must be an array");

for (const match of payload.matches) {
  const snapshots = Array.isArray(match.snapshots) ? match.snapshots : [];
  for (const snap of snapshots) {
    assert(snap.team_power && typeof snap.team_power === "object", "snapshot team_power missing");
    assert(snap.goal_power && typeof snap.goal_power === "object", "snapshot goal_power missing");
  }
}

console.log("Live Power Center static regression checks passed.");
