"use strict";

const assert = require("node:assert/strict");
const { selectAnalysisMatches, selectDailyMatches } = require("../scripts/export-high-value-json.js");

const test = (name, fn) => {
  try {
    fn();
    process.stdout.write(`✓ ${name}\n`);
  } catch (error) {
    process.stderr.write(`✗ ${name}\n`);
    throw error;
  }
};

test("günlük çıktılar yalnız bugünün maçlarını korur", () => {
  const fixtures = [
    { date: "2026-08-24", home: "Bugün", away: "A" },
    { date: "2026-08-25", home: "Yarın", away: "B" },
  ];
  assert.deepEqual(selectDailyMatches(fixtures, "2026-08-24").map((item) => item.home), ["Bugün"]);
});

test("PRO analiz penceresi yarınki maçları dışarıda bırakmaz", () => {
  const fixtures = [
    { date: "2026-08-23", home: "Dün", away: "A" },
    { date: "2026-08-24", home: "Bugün", away: "B" },
    { date: "2026-08-25", home: "Lanus", away: "Argentinos Jr" },
    { date: "2026-08-25", home: "Talleres", away: "Rosario Central" },
  ];
  assert.deepEqual(
    selectAnalysisMatches(fixtures, "2026-08-24").map((item) => item.home),
    ["Bugün", "Lanus", "Talleres"],
  );
});

process.stdout.write("High Value JSON tarih penceresi testleri tamamlandı.\n");
