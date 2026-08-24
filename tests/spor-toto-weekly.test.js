const assert = require("assert");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const program = JSON.parse(fs.readFileSync(path.join(root, "data", "spor_toto_weekly_program.json"), "utf8"));
const bulletin = JSON.parse(fs.readFileSync(path.join(root, "data", "spor_toto_bulteni.json"), "utf8"));
const OPTIONS = ["1", "X", "2"];
const clean = (v) => String(v || "").toLocaleLowerCase("tr-TR").replace(/ı/g, "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const key = (m) => `${String(m.date || "").slice(0, 10)}|${clean(m.home)}|${clean(m.away)}`;

assert.strictEqual(program.match_count, 15, "weekly program match_count must be 15");
assert.strictEqual(program.matches.length, 15, "weekly program must contain 15 matches");
assert.strictEqual(new Set(program.matches.map(key)).size, 15, "weekly program must not contain duplicate matches");
assert.strictEqual(bulletin.matches.length, 15, "bulletin must always contain 15 weekly matches");
assert.ok(String(bulletin.engine_version || "").startsWith("spor-toto-weekly15"), "weekly15 engine must be active");

bulletin.matches.forEach((match, index) => {
  assert.strictEqual(match.no, index + 1, `match order ${index + 1}`);
  assert.strictEqual(key(match), key(program.matches[index]), `bulletin must preserve weekly order at ${index + 1}`);
  assert.notStrictEqual(String(match.decision || "").toLocaleLowerCase("tr-TR"), "bekleniyor", "legacy Bekleniyor decision forbidden");
  const publicDistribution = match.public_distribution;
  if (publicDistribution) {
    const publicSum = OPTIONS.reduce((sum, option) => sum + Number(publicDistribution[option] || 0), 0);
    assert.ok(Math.abs(publicSum - 100) <= 1, "public distribution should total about 100");
  }
  if (match.analysis_ready) {
    assert.ok(OPTIONS.includes(match.decision), "ready analysis must have 1/X/2 decision");
    assert.ok(Array.isArray(match.selected_options) && match.selected_options.length >= 1, "ready analysis must have selection");
    const sum = OPTIONS.reduce((total, option) => total + Number(match.probabilities?.[option] || 0), 0);
    assert.ok(Math.abs(sum - 100) <= 0.3, "model probabilities must total 100");
  } else {
    assert.strictEqual(match.decision, null, "waiting match must not invent decision");
    assert.deepStrictEqual(match.selected_options, [], "waiting match must have no model selection");
    OPTIONS.forEach((option) => assert.strictEqual(match.probabilities?.[option], null, "waiting match must not invent model probability"));
  }
});

assert.strictEqual(bulletin.match_count, 15);
assert.strictEqual(Number(bulletin.analysis_ready_count || 0) + Number(bulletin.analysis_waiting_count || 0), 15);
if (bulletin.analysis_ready_count < 15) {
  assert.strictEqual(Boolean(bulletin.coupon?.ready), false, "coupon must stay disabled until all 15 are model-ready");
  assert.strictEqual(Number(bulletin.coupon?.total_columns || 0), 0, "partial data must not create a coupon column count");
}
console.log(`Spor Toto weekly test PASS. Week=${bulletin.week_label}, matches=15, ready=${bulletin.analysis_ready_count}, waiting=${bulletin.analysis_waiting_count}.`);
