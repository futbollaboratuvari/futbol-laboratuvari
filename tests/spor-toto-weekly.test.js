const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { parseTahmin, parseWinner, validate15, overlapCount, teamKey } = require("../scripts/sync-spor-toto-weekly-program");

const root = path.join(__dirname, "..");
const program = JSON.parse(fs.readFileSync(path.join(root, "data", "spor_toto_weekly_program.json"), "utf8"));
const bulletin = JSON.parse(fs.readFileSync(path.join(root, "data", "spor_toto_bulteni.json"), "utf8"));
const OPTIONS = ["1", "X", "2"];
const clean = (v) => String(v || "").toLocaleLowerCase("tr-TR").replace(/ı/g, "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const key = (m) => `${String(m.date || "").slice(0, 10)}|${clean(m.home)}|${clean(m.away)}`;

const sourceRows = [
  ["11 Eyl", "11.09.2026", "20:00", "Süper Lig", "Beşiktaş", "Erzurumspor FK", "Beşiktaş A.Ş.", "Erzurumspor FK", [90, 7, 3]],
  ["12 Eyl", "12.09.2026", "17:00", "Süper Lig", "Eyüpspor", "Çaykur Rizespor", "Eyüpspor", "Çaykur Rizespor A.Ş.", [22, 28, 50]],
  ["12 Eyl", "12.09.2026", "17:00", "Süper Lig", "Samsunspor", "Arca Çorum FK", "Samsunspor A.Ş.", "Çorum FK", [56, 24, 20]],
  ["12 Eyl", "12.09.2026", "20:00", "Süper Lig", "Corendon Alanyaspor", "Göztepe", "Alanyaspor", "Göztepe A.Ş.", [42, 30, 28]],
  ["12 Eyl", "12.09.2026", "20:00", "Süper Lig", "Tümosan Konyaspor", "Trabzonspor", "Konyaspor", "Trabzonspor A.Ş.", [15, 19, 66]],
  ["13 Eyl", "13.09.2026", "17:00", "Süper Lig", "Gençlerbirliği", "Kasımpaşa", "Gençlerbirliği", "Kasimpasa A.Ş.", [46, 29, 25]],
  ["13 Eyl", "13.09.2026", "20:00", "Süper Lig", "Amed Sportif Faaliyetler", "İstanbul Başakşehir", "Amed Sportif", "Başakşehir FK", [35, 28, 37]],
  ["13 Eyl", "13.09.2026", "20:00", "Süper Lig", "Galatasaray", "Kocaelispor", "Galatasaray A.Ş.", "Kocaelispor", [76, 17, 7]],
  ["14 Eyl", "14.09.2026", "20:00", "Süper Lig", "Gaziantep FK", "Fenerbahçe", "Gaziantep F.K. A.S.", "Fenerbahçe A.Ş.", [11, 16, 73]],
  ["12 Eyl", "12.09.2026", "16:30", "Bundesliga", "Augsburg", "Bayer Leverkusen", "Augsburg", "B. Leverkusen", [25, 22, 53]],
  ["11 Eyl", "11.09.2026", "21:45", "Ligue 1", "Rennes", "Marsilya", "Rennes", "Marsilya", [35, 29, 36]],
  ["12 Eyl", "12.09.2026", "17:00", "Premier League", "Chelsea", "Hull City", "Chelsea", "Hull City", [81, 12, 7]],
  ["13 Eyl", "13.09.2026", "18:30", "Premier League", "Manchester United", "Manchester City", "Man. Utd", "Man. City", [25, 26, 49]],
  ["13 Eyl", "13.09.2026", "17:15", "La Liga", "Levante", "Barcelona", "Levante", "Barcelona", [6, 9, 85]],
  ["12 Eyl", "12.09.2026", "19:00", "Serie A", "Lazio", "Milan", "Lazio", "AC Milan", [26, 30, 44]],
];
const tahminFixture = `<h1>Spor Toto · 5. Hafta 11 Eyl — 14 Eyl 2026</h1>${sourceRows.map((row) => `<h2>${row[3]}</h2><div>Takım ikonları VS ${row[0]} · ${row[2]}</div><h3>${row[4]} — ${row[5]}</h3>`).join("")}`;
const winnerFixture = `<h2>Spor Toto Programı</h2><div>Hafta 5</div><table><tbody>${sourceRows.map((row, index) => `<tr><td>${index + 1}</td><td><div><a>${row[6]} - ${row[7]}</a></div><div>${row[1]} ${row[2]}</div></td><td><span>%${row[8][0]}</span></td><td><span>%${row[8][1]}</span></td><td><span>%${row[8][2]}</span></td></tr>`).join("")}</tbody></table>`;
const parsedTahmin = parseTahmin(tahminFixture);
const parsedWinner = parseWinner(winnerFixture);
assert.strictEqual(parsedTahmin.week, 5, "Tahmin source week must parse");
assert.strictEqual(parsedWinner.week, 5, "Winner source week must parse");
assert.ok(validate15(parsedTahmin.matches), "Tahmin source must yield 15 matches");
assert.ok(validate15(parsedWinner.matches), "Winner source must yield 15 matches");
assert.strictEqual(overlapCount(parsedTahmin.matches, parsedWinner.matches), 15, "independent weekly sources must agree 15/15 despite aliases");
assert.strictEqual(teamKey("Manchester United"), teamKey("Man. Utd"), "Manchester alias must match");
assert.strictEqual(teamKey("Bayer Leverkusen"), teamKey("B. Leverkusen"), "Leverkusen alias must match");
assert.strictEqual(teamKey("Milan"), teamKey("AC Milan"), "Milan alias must match");
const fixtureUpdater = fs.readFileSync(path.join(root, "scripts", "update-fixtures.js"), "utf8");
assert.ok(!fixtureUpdater.includes("spor_toto_bulteni.json"), "general fixture updater must never overwrite the weekly Spor Toto bulletin");

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
