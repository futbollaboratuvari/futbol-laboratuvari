"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (name) => JSON.parse(fs.readFileSync(path.join(root, "data", name), "utf8"));
const rows = (payload) => Array.isArray(payload?.matches) ? payload.matches : [];

const player = read("player-intelligence.json");
const status = read("team-status-signals.json");
const lineup = read("lineup-signals.json");
const band = read("band-signals.json");
const robot = read("robot-analysis.json");
const pro = read("pro-analysis-index.json");
const full = read("full-bulletin.json");

assert(Array.isArray(player.matches), "player-intelligence matches dizisi yok");
assert.equal(typeof player.status, "string", "player-intelligence kaynak durumu yok");
assert(rows(status).length > 0, "takım durum sinyali yok");
assert.equal(rows(lineup).length, rows(status).length, "ilk 11 ve takım durum maç kapsamı farklı");
assert.equal(rows(band).some((match) => !match.match_name || match.match_name === "-"), false, "bant maç anahtarı boş");
assert(rows(band).every((match) => match.extra_used && match.band_check), "bant içinde takım istihbaratı yok");
assert(rows(robot).length > 0, "robot analizi yok");
assert(rows(robot).every((match) => match.squad_risk_level && match.lineup_risk_level), "robot kadro riski alanları eksik");
assert(rows(robot).every((match) => match.team_intelligence?.adjustment), "robot puanında kadro ayarı kaydı eksik");
assert(rows(pro).every((match) => match.squad_risk_level && match.lineup_risk_level), "PRO indeksinde kadro alanları eksik");
assert(rows(full).every((match) => match.team_intelligence && match.home_status && match.away_status), "bülten detayında takım/futbolcu analizi eksik");

const highRiskRobot = rows(robot).filter((match) => /yüksek/i.test(`${match.squad_risk_level} ${match.lineup_risk_level}`));
assert(highRiskRobot.every((match) => match.include_in_coupon === false), "yüksek kadro riskli maç kupona girmiş");

console.log(`team-intelligence-integration.test.js OK: player=${rows(player).length}, status=${rows(status).length}, lineup=${rows(lineup).length}, band=${rows(band).length}, robot=${rows(robot).length}.`);
