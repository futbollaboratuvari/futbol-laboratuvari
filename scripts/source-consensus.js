"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");
const statusPath = path.join(dataDir, "team-status-signals.json");
const lineupPath = path.join(dataDir, "lineup-signals.json");
const outputPath = path.join(dataDir, "team-source-consensus.json");

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function clean(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function pairKey(home, away, date = "") {
  return `${String(date || "").slice(0, 10)}|${clean(home)}|${clean(away)}`;
}

function ageHours(value, now = Date.now()) {
  const time = Date.parse(String(value || ""));
  return Number.isFinite(time) ? Math.max(0, (now - time) / 3600000) : Infinity;
}

function playerNames(list) {
  return new Set((Array.isArray(list) ? list : [])
    .map((item) => clean(typeof item === "string" ? item : item?.name || item?.player))
    .filter(Boolean));
}

function teamConsensus(status = {}, lineup = {}, meta = {}) {
  const namedUnavailable = [
    ...(status.injured_players || []),
    ...(status.suspended_players || []),
    ...(status.doubtful_players || []),
  ];
  const unavailableNames = playerNames(namedUnavailable);
  const starterNames = playerNames(lineup.starting_11 || []);
  const unavailableStarters = [...unavailableNames].filter((name) => starterNames.has(name));
  const publicSignalCount = Number(status.injury_news_count || 0)
    + Number(status.suspension_news_count || 0)
    + Number(status.doubtful_news_count || 0);

  const structuredVerified = Boolean(status.availability_checked || status.lineup_confirmed || lineup.availability_checked || lineup.lineup_confirmed);
  const lineupConfirmed = Boolean(status.lineup_confirmed || lineup.lineup_confirmed);
  const manualVerified = /manual|manuel/i.test(String(status.data_status || ""));
  const publicSignal = publicSignalCount > 0 || (status.evidence || []).length > 0;
  const sourceError = /source_error|kaynak hatasi|kaynak hatası/i.test(`${status.data_status || ""} ${status.source_note || ""}`);
  const statusAge = ageHours(meta.status_generated_at);
  const lineupAge = ageHours(meta.lineup_generated_at);
  const stale = Math.min(statusAge, lineupAge) > 12;

  let conflictLevel = "none";
  const conflictReasons = [];
  if (unavailableStarters.length) {
    conflictLevel = "high";
    conflictReasons.push(`Eksik listesinde görünen oyuncu doğrulanmış ilk 11'de: ${unavailableStarters.join(", ")}`);
  }
  const namedUnavailableCount = namedUnavailable.length;
  if (structuredVerified && namedUnavailableCount === 0 && publicSignalCount >= 2) {
    if (publicSignalCount >= 4) conflictLevel = "high";
    else if (conflictLevel !== "high") conflictLevel = "medium";
    conflictReasons.push(`Yapılandırılmış kaynak eksik göstermiyor fakat ${publicSignalCount} güncel açık kaynak eksik sinyali var.`);
  }

  let score = 0;
  if (structuredVerified) score += 40;
  if (lineupConfirmed) score += 35;
  if (manualVerified) score += 10;
  if (publicSignal) score += 10;
  if (statusAge <= 6 || lineupAge <= 6) score += 5;
  if (sourceError) score -= 15;
  if (stale) score -= 15;
  if (conflictLevel === "medium") score -= 25;
  if (conflictLevel === "high") score -= 45;
  score = Math.max(0, Math.min(100, Math.round(score)));

  let quality = "Belirsiz";
  if (score >= 80) quality = "Yüksek";
  else if (score >= 60) quality = "Orta";
  else if (score >= 40) quality = "Sınırlı";

  let brake = 0;
  if (conflictLevel === "high") brake = -4;
  else if (conflictLevel === "medium") brake = -2;
  else if (score < 40) brake = -3;
  else if (score < 60) brake = -1;

  return {
    confidence_score: score,
    quality,
    conflict_level: conflictLevel,
    conflict_reasons: conflictReasons,
    uncertainty_brake: brake,
    structured_verified: structuredVerified,
    lineup_confirmed: lineupConfirmed,
    manual_verified: manualVerified,
    public_signal: publicSignal,
    public_signal_count: publicSignalCount,
    source_error: sourceError,
    stale,
    named_unavailable_count: namedUnavailableCount,
    unavailable_starter_count: unavailableStarters.length,
  };
}

function combineMatchConsensus(home, away) {
  const rank = { none: 0, medium: 1, high: 2 };
  const conflict = rank[home.conflict_level] >= rank[away.conflict_level] ? home.conflict_level : away.conflict_level;
  const score = Math.min(home.confidence_score, away.confidence_score);
  const brake = Math.min(home.uncertainty_brake, away.uncertainty_brake, 0);
  let quality = "Belirsiz";
  if (score >= 80) quality = "Yüksek";
  else if (score >= 60) quality = "Orta";
  else if (score >= 40) quality = "Sınırlı";
  return {
    confidence_score: score,
    quality,
    conflict_level: conflict,
    uncertainty_brake: brake,
    uncertain: conflict !== "none" || score < 60,
  };
}

function buildConsensus(statusDb = {}, lineupDb = {}) {
  const lineupLookup = new Map((lineupDb.matches || []).map((row) => [
    pairKey(row.home_lineup?.team_name, row.away_lineup?.team_name, row.date), row,
  ]));
  const matches = (statusDb.matches || []).map((row) => {
    const key = pairKey(row.home_team, row.away_team, row.date);
    const lineup = lineupLookup.get(key) || {};
    const meta = {
      status_generated_at: statusDb.generated_at,
      lineup_generated_at: lineupDb.generated_at,
    };
    const home = teamConsensus(row.home_status || {}, lineup.home_lineup || {}, meta);
    const away = teamConsensus(row.away_status || {}, lineup.away_lineup || {}, meta);
    const match = combineMatchConsensus(home, away);
    return {
      match_name: row.match_name || `${row.home_team} VS ${row.away_team}`,
      date: row.date || "",
      league: row.league || "-",
      home_team: row.home_team,
      away_team: row.away_team,
      home,
      away,
      ...match,
      robot_note: match.uncertain
        ? `Kaynak uzlaşısı sınırlı: güven ${match.confidence_score}/100, çelişki ${match.conflict_level}.`
        : `Kaynak uzlaşısı güçlü: güven ${match.confidence_score}/100.`,
    };
  });
  return {
    schema_version: 1,
    generated_at: new Date().toISOString(),
    policy: "Kaynak uzlaşısı gerçeklik iddiası üretmez; yalnız yapılandırılmış veri, doğrulanmış ilk 11, manuel kayıt ve açık haber sinyalleri arasındaki tutarlılık/güncellik seviyesini ölçer.",
    match_count: matches.length,
    uncertain_match_count: matches.filter((row) => row.uncertain).length,
    conflict_match_count: matches.filter((row) => row.conflict_level !== "none").length,
    matches,
  };
}

function buildSourceConsensus() {
  const statusDb = readJson(statusPath, { matches: [] });
  const lineupDb = readJson(lineupPath, { matches: [] });
  const output = buildConsensus(statusDb, lineupDb);
  writeJson(outputPath, output);
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  writeJson(path.join(dataDir, "archive", `${date}-team-source-consensus.json`), output);
  console.log(`Team source consensus updated: ${output.match_count} matches, ${output.conflict_match_count} conflicts, ${output.uncertain_match_count} uncertain.`);
  return output;
}

if (require.main === module) buildSourceConsensus();
module.exports = { ageHours, buildConsensus, buildSourceConsensus, combineMatchConsensus, pairKey, teamConsensus };
