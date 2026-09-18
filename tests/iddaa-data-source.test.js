"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const {
  normalizeBulletin,
  normalizeEvent,
} = require("../scripts/iddaa-data-source");
const iddaaApi = require("../api/iddaa-bulletin");

const config = {
  data: {
    m: {
      "4_4": { i: 1, n: "Maç Sonucu", d: "Maçın sonucu" },
      "4_14": { i: 2, n: "Alt/Üst {0}", d: "Toplam gol" },
      "4_131": { i: 3, n: "Karşılıklı Gol", d: "İki takım gol atar mı" },
      "4_321": { i: 4, n: "2. Yarı Sonucu", d: "İkinci yarı" },
      "4_401": { i: 5, n: "İlk Yarı Karşılıklı Gol", d: "İlk yarıda iki takım gol atar mı" },
      "4_402": { i: 6, n: "İkinci Yarı Karşılıklı Gol", d: "İkinci yarıda iki takım gol atar mı" },
      "4_403": { i: 7, n: "İlk Yarı / İkinci Yarı Karşılıklı Gol", d: "Devre bazlı KG kombinasyonu" },
      "4_405": { i: 8, n: "Toplam Gol Aralığı", d: "Gol aralığı" },
    },
  },
};

const competitions = { data: [{ i: 348, n: "Brezilya Serie A" }] };
const matchMarkets = (base) => [
  { i: base + 1, t: 4, st: 4, o: [{ no: 1, n: "1", odd: 1.88 }, { no: 2, n: "0", odd: 2.65 }, { no: 3, n: "2", odd: 3.88 }] },
  { i: base + 2, t: 4, st: 14, sov: "2.5", o: [{ no: 1, n: "Alt", odd: 1.24 }, { no: 2, n: "Üst", odd: 2.75 }] },
  { i: base + 3, t: 4, st: 131, o: [{ no: 1, n: "Var", odd: 2.27 }, { no: 2, n: "Yok", odd: 1.33 }] },
];

const events = {
  data: {
    version: 7,
    events: [
      { i: 1001, hn: "Corinthians", an: "Santos FC", ci: 348, d: 1788116400, bp: 1, m: matchMarkets(10) },
      { i: 1002, hn: "Valur", an: "Akranes", ci: 348, d: 1788202800, bp: 0, m: [{ i: 99, t: 4, st: 321, o: [{ no: 1, n: "1", odd: 2.1 }] }] },
    ],
    sc: {
      "1001": { t: 1788117432390, min: 16, ht: { r: 0 }, at: { r: 1 } },
    },
  },
};

const list = normalizeBulletin(events, config, competitions, { includeMarkets: false });
assert.strictEqual(list.length, 2, "all football events must be retained");
assert.strictEqual(list[0].source, "iddaa.com resmi futbol bülteni");
assert.strictEqual(list[0].status, "live");
assert.strictEqual(list[0].status_verified, true);
assert.strictEqual(list[0].minute, 16);
assert.strictEqual(list[0].score, "0-1");
assert.strictEqual(list[0].league, "Brezilya Serie A");
assert.strictEqual(list[0].available_odds.ms1, 1.88);
assert.strictEqual(list[0].available_odds.msx, 2.65);
assert.strictEqual(list[0].available_odds.ms2, 3.88);
assert.strictEqual(list[0].available_odds.under25, 1.24);
assert.strictEqual(list[0].available_odds.over25, 2.75);
assert.strictEqual(list[0].available_odds.bttsYes, 2.27);
assert.strictEqual(list[0].available_odds.bttsNo, 1.33);
assert.strictEqual(list[0].market_groups, undefined, "list response must stay compact");
assert.strictEqual(list[1].status, "scheduled");
assert.strictEqual(list[1].available_odds.ms1, undefined, "one match must never receive another match's odds");

const detail = normalizeEvent(events.data.events[0], {
  marketConfig: config,
  competitions,
  scoreByEvent: events.data.sc,
}, { includeMarkets: true });
assert.strictEqual(detail.market_groups.length, 3);
assert.strictEqual(detail.market_groups[1].title, "Alt/Üst 2.5");
assert.strictEqual(detail.market_groups[1].outcomes[1].label, "Üst");
assert.strictEqual(detail.raw_market_blocks.length, 3);
assert.ok(detail.market_groups.every((market) => market.id && market.outcomes.length));

const richEvent = normalizeEvent({
  i: 2001,
  hn: "Alpha",
  an: "Beta",
  ci: 348,
  d: 1788202800,
  bp: 0,
  m: [
    { i: 201, t: 4, st: 14, sov: "3.5", o: [{ no: 1, n: "Alt", odd: 1.70 }, { no: 2, n: "Üst", odd: 2.10 }] },
    { i: 202, t: 4, st: 401, o: [{ no: 1, n: "Var", odd: 2.45 }, { no: 2, n: "Yok", odd: 1.42 }] },
    { i: 203, t: 4, st: 402, o: [{ no: 1, n: "Var", odd: 2.05 }, { no: 2, n: "Yok", odd: 1.55 }] },
    { i: 204, t: 4, st: 403, o: [
      { no: 1, n: "Evet / Evet", odd: 9.50 },
      { no: 2, n: "Evet / Hayır", odd: 4.20 },
      { no: 3, n: "Hayır / Evet", odd: 3.60 },
      { no: 4, n: "Hayır / Hayır", odd: 1.55 },
    ] },
    { i: 205, t: 4, st: 405, o: [
      { no: 1, n: "0-1", odd: 3.20 },
      { no: 2, n: "2-3", odd: 1.75 },
      { no: 3, n: "4-5", odd: 3.80 },
      { no: 4, n: "6+ Gol", odd: 7.50 },
    ] },
  ],
}, { marketConfig: config, competitions, scoreByEvent: {} }, { includeMarkets: true });
assert.strictEqual(richEvent.available_odds.over35, 2.10);
assert.strictEqual(richEvent.available_odds.under35, 1.70);
assert.strictEqual(richEvent.available_odds.firstHalfBttsYes, 2.45);
assert.strictEqual(richEvent.available_odds.firstHalfBttsNo, 1.42);
assert.strictEqual(richEvent.available_odds.secondHalfBttsYes, 2.05);
assert.strictEqual(richEvent.available_odds.secondHalfBttsNo, 1.55);
assert.strictEqual(richEvent.available_odds.halfBttsYesYes, 9.50);
assert.strictEqual(richEvent.available_odds.halfBttsYesNo, 4.20);
assert.strictEqual(richEvent.available_odds.halfBttsNoYes, 3.60);
assert.strictEqual(richEvent.available_odds.halfBttsNoNo, 1.55);
assert.strictEqual(richEvent.available_odds.goals6plus, 7.50);

const ambiguousSixEvent = normalizeEvent({
  i: 2002,
  hn: "Alpha",
  an: "Beta",
  ci: 348,
  d: 1788202800,
  bp: 0,
  m: [
    { i: 206, t: 4, st: 405, o: [{ no: 1, n: "6", odd: 6.25 }] },
  ],
}, { marketConfig: config, competitions, scoreByEvent: {} }, { includeMarkets: true });
assert.strictEqual(
  ambiguousSixEvent.available_odds.goals6plus,
  undefined,
  "bare 6 outcome must not be treated as verified 6+",
);

const widget = fs.readFileSync(path.join(__dirname, "..", "daily-matches-widget.js"), "utf8");
assert.match(widget, /https:\/\/futbol-laboratuvari\.vercel\.app/, "GitHub Pages must use the production API origin");
assert.match(widget, /readJson\(officialApiUrl\(\)\)/, "widget must load the official feed");
assert.match(widget, /readJson\(officialApiUrl\(eventId\)\)/, "match detail must use the same official API bridge");
assert.match(widget, /data-row-toggle=/, "the complete match row must be clickable");
assert.match(widget, /data-dynamic-pick=/, "all detail outcomes must be selectable");
assert.match(widget, /Tüm İddaa Pazarları/, "the full market panel must be visible");

assert.strictEqual(iddaaApi.originAllowed("https://futbollaboratuuvari.org"), true);
assert.strictEqual(iddaaApi.originAllowed("https://www.futbollaboratuuvari.org"), true);
assert.strictEqual(iddaaApi.originAllowed("https://evil.example"), false);
const corsHeaders = {};
assert.strictEqual(iddaaApi.configureCors({ headers: { origin: "https://futbollaboratuuvari.org" } }, {
  setHeader(name, value) { corsHeaders[name] = value; },
}), true);
assert.strictEqual(corsHeaders["Access-Control-Allow-Origin"], "https://futbollaboratuuvari.org");

console.log("iddaa-data-source.test.js: OK");
