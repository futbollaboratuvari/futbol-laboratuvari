"use strict";

// Deterministic VM checks; these do not replace a real-browser smoke test.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const read = (name) => fs.readFileSync(path.join(__dirname, "..", name), "utf8");
const main = { innerHTML: "" };
const slip = { innerHTML: "" };
const handlers = {};
let injectedCss = "";
const windowMock = { location: { hostname: "localhost" } };
const source = read("daily-matches-widget.js");
const boot = "  draw();\n  load();\n  app.timer = setInterval(load, 60000);";
assert.ok(source.includes(boot), "widget boot hook must be present");
vm.runInNewContext(source.replace(boot, "  style();"), {
  window: windowMock,
  document: {
    querySelector: (selector) => selector === ".flw-main" ? main : selector === ".flw-slip" ? slip : null,
    addEventListener: (type, fn) => { handlers[type] = fn; },
    removeEventListener() {},
    createElement: () => ({ textContent: "" }),
    head: { appendChild: (element) => { injectedCss = element.textContent; } },
  },
  setInterval, clearInterval,
});
const app = windowMock.__flDailyWidget;
assert.match(injectedCss, /#daily-matches-widget \.flw-table\{background:#0b1b28/);
assert.match(injectedCss, /#daily-matches-widget \.flw-row\{background:#0b1b28/);
assert.match(injectedCss, /@media\(max-width:640px\)/);
assert.match(injectedCss, /#daily-matches-widget \.flw-table\{min-width:0/);
assert.match(injectedCss, /grid-template-columns:repeat\(7,minmax\(0,1fr\)\)/);
const match = {
  _id: "test-match", home: "Home", away: "Away", league: "Test League",
  date: "2099-01-01", time: "15:00", status: "scheduled",
  available_odds: { ms1: 2.1, over25: 1.8, under25: 2.0, bttsYes: 1.7, bttsNo: 2.2 },
};
app.bulletin = [match];
const eventFor = (selector, dataset) => ({
  target: { closest: (query) => query === selector ? { dataset } : null },
});
handlers.click(eventFor("[data-toggle]", { toggle: match._id }));
assert.equal(app.expanded.has(match._id), true);
assert.match(main.innerHTML, />Kapat<|>Kapat<\/button>/);
assert.match(main.innerHTML, /Özet Oranlar/);
assert.doesNotMatch(main.innerHTML, /<b>Maç Bilgisi<\/b>|<b>Analiz ve Tahmin<\/b>/);
assert.equal((main.innerHTML.match(/class="flw-detail-market"/g) || []).length, 4);
assert.doesNotMatch(main.innerHTML, />Veri bekleniyor</);
assert.match(main.innerHTML, /Tüm İddaa Pazarları/);
handlers.click(eventFor("[data-toggle]", { toggle: match._id }));
assert.equal(app.expanded.has(match._id), false);
assert.doesNotMatch(main.innerHTML, /class="flw-detail-row"/);
const row = { dataset: { rowToggle: match._id } };
row.closest = () => row;
let prevented = false;
handlers.keydown({ target: row, key: "Enter", preventDefault() { prevented = true; } });
assert.equal(prevented, true);
assert.equal(app.expanded.has(match._id), true);
handlers.click(eventFor("[data-pick]", { pick: match._id, key: "ms1" }));
assert.equal(app.picks.size, 1);
assert.match(slip.innerHTML, /Kuponum/);
assert.match(slip.innerHTML, /Analiz Et/);
handlers.click(eventFor("[data-pick]", { pick: match._id, key: "ms1" }));
assert.equal(app.picks.size, 0);

// The legacy bridge must target the summary, never the third/source card.
for (const modern of [true, false]) {
  const summary = { innerHTML: "original odds", querySelector: () => ({ textContent: "Özet Oranlar" }) };
  const sourceCard = { innerHTML: "source metadata", querySelector: () => ({ textContent: "Kaynak" }) };
  const marketsCard = { innerHTML: "all official markets", querySelector: () => ({ textContent: "Tüm İddaa Pazarları" }) };
  const detail = {
    dataset: {}, classList: { contains: (name) => name === "flw-detail-row" },
    querySelector: () => modern ? summary : null,
    querySelectorAll: () => [summary, marketsCard, sourceCard],
  };
  let scheduled;
  vm.runInNewContext(read("bulletin-detail-analysis-bridge.js"), {
    window: { __flDailyWidget: app, addEventListener() {} },
    document: {
      getElementById: () => ({}),
      querySelectorAll: () => [{ dataset: { toggle: match._id }, closest: () => ({ nextElementSibling: detail }) }],
      addEventListener() {}, body: {},
    },
    MutationObserver: class { observe() {} disconnect() {} },
    setTimeout: (fn) => { scheduled = fn; return 1; }, clearTimeout() {},
  });
  scheduled();
  assert.match(summary.innerHTML, /Gol ve Oran Detayları/);
  assert.equal(sourceCard.innerHTML, "source metadata");
  assert.equal(marketsCard.innerHTML, "all official markets");
  assert.equal(detail.dataset.bridgeEnhanced, match._id);
  const rendered = summary.innerHTML;
  scheduled();
  assert.equal(summary.innerHTML, rendered, "repeat enhancement must be idempotent");
}
console.log("PASS: toggle open/close, keyboard, removed cards, valid odds, coupon selection, bridge targets and idempotency (modern + legacy).");
