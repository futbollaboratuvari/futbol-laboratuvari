"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { buildPool } = require("../scripts/build-coupon-assistant-pool");

const base = {
  status: "scheduled",
  league: "Test Lig",
  recommended_market: "KG Var",
  estimated_odds: 1.90,
  model_score: 70,
  edge_percent: 5,
  data_completeness: 60,
  estimated_probability: 56,
  risk_level: "Orta",
  source: "iddaa.com resmi futbol bülteni",
  robot_reason: "Doğrulanmış test gerekçesi",
};

const analysis = {
  generated_at: "2026-09-19T16:35:00.000Z",
  source: "Futbol Laboratuvarı PRO 13",
  active_items: [
    { ...base, match_name: "Alpha VS Beta", date: "2026-09-19", time: "20:30" },
    { ...base, match_name: "Başladı VS Bitti", date: "2026-09-19", time: "19:30" },
    { ...base, match_name: "Yarın VS Rakip", date: "2026-09-20", time: "01:00", estimated_odds: 2.20 },
    { ...base, match_name: "Kaynak VS Hatalı", date: "2026-09-19", time: "21:00", source: "belirsiz kaynak" },
    { ...base, match_name: "Model VS Düşük", date: "2026-09-19", time: "21:15", model_score: 53 },
    { ...base, match_name: "Kapsam VS Düşük", date: "2026-09-19", time: "21:30", data_completeness: 44 },
    { ...base, match_name: "Alpha VS Beta", date: "2026-09-19", time: "20:30", edge_percent: 1 },
  ],
};

const pool = buildPool(analysis, { now: "2026-09-19T16:40:00.000Z" });
assert.strictEqual(pool.date, "2026-09-19");
assert.strictEqual(pool.timezone, "Europe/Istanbul");
assert.strictEqual(pool.candidate_count, 2);
assert.deepStrictEqual(pool.items.map((item) => item.match_name).sort(), ["Alpha VS Beta", "Yarın VS Rakip"]);
assert.ok(pool.items.every((item) => /iddaa/i.test(item.source)));
assert.ok(pool.items.every((item) => item.status === "scheduled"));
assert.ok(pool.items.every((item) => Number(item.estimated_odds) > 1));
assert.ok(pool.items.every((item) => Number(item.model_score) >= 54));
assert.ok(pool.items.every((item) => Number(item.data_completeness) >= 45));
assert.ok(pool.items.every((item) => !("available_odds" in item)));
assert.ok(pool.items.every((item) => !("pro_signals" in item)));
assert.ok(pool.items.every((item) => !("signals" in item)));

const client = fs.readFileSync(path.join(__dirname, "..", "nesine-coupon-assistant.js"), "utf8");
const staticBuild = fs.readFileSync(path.join(__dirname, "..", "scripts", "vercel-build.js"), "utf8");
const writer = fs.readFileSync(path.join(__dirname, "..", ".github", "workflows", "update-fixtures.yml"), "utf8");
assert.match(client, /coupon-assistant-pool\.json/, "Kupon Asistanı küçük kamu havuzunu okumalı");
assert.doesNotMatch(client, /analiz_sonuclari\.json/, "Kupon Asistanı canlıda büyük analiz dosyasına bağlı olmamalı");
assert.match(staticBuild, /build-coupon-assistant-pool/, "Pages build kamu havuzunu üretmeli");
assert.match(writer, /build-coupon-assistant-pool\.js/, "Ana veri yazıcısı kamu havuzunu yenilemeli");

console.log("coupon-assistant-pool.test.js: OK");
