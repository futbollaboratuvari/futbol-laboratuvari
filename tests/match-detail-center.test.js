const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { attachRobotContext, buildMatchDetailCenter } = require("../scripts/build-match-detail-center");

const match = {
  date: "2026-09-20",
  time: "20:00",
  league: "Test Ligi",
  home: "Ev Takımı",
  away: "Deplasman Takımı",
  matchCode: "12345",
  status: "scheduled",
  source: "Doğrulanmış Bülten",
  recommended_market: "KG Var",
  analysis_score: 72,
  raw_market_guess_odds: { forbidden_guess: 9.99 },
};

const standings = {
  matches: [{
    date: match.date,
    home_team: match.home,
    away_team: match.away,
    home_standing: { team_name: match.home, rank: 2, played: 6, points: 13, wins: 4, draws: 1, losses: 1, goals_for: 12, goals_against: 5, recent_form: ["W", "W", "D"] },
    away_standing: { team_name: match.away, rank: 6, played: 6, points: 8, wins: 2, draws: 2, losses: 2, goals_for: 8, goals_against: 8, recent_form: ["L", "D", "W"] },
    point_difference: 5,
    robot_comment: "Ev takımı puan tablosunda önde.",
  }],
};

const lineups = {
  matches: [{
    date: match.date,
    home: match.home,
    away: match.away,
    home_lineup: { team_name: match.home, lineup_confirmed: true, formation: "4-3-3", starting_11: Array.from({ length: 11 }, (_, index) => ({ name: `Ev ${index + 1}` })) },
    away_lineup: { team_name: match.away, lineup_confirmed: false, starting_11: [] },
    lineup_risk_level: "Orta",
  }],
};

const statuses = {
  matches: [{
    date: match.date,
    home_team: match.home,
    away_team: match.away,
    squad_risk_level: "Düşük",
    home_status: { team_name: match.home, availability_checked: true, injured_players: [{ name: "Ev Sakat" }] },
    away_status: { team_name: match.away, availability_checked: true, suspended_players: [{ name: "Dep Cezalı" }] },
  }],
};

const archive = {
  matches: [
    { date: "2026-04-01", time: "20:00", league: "Test Ligi", home: match.home, away: match.away, status: "finished", score: "2-1", source: "verified", match_memory: { latest: { stats: { home_corners: 7, away_corners: 4, home_yellow_cards: 2, away_yellow_cards: 3, home_red_cards: 0, away_red_cards: 0 } } } },
    { date: "2026-02-01", time: "20:00", league: "Test Ligi", home: match.away, away: match.home, status: "finished", score: "0-0", source: "verified", match_memory: { latest: { stats: { home_corners: 3, away_corners: 5, home_yellow_cards: 1, away_yellow_cards: 2, home_red_cards: 0, away_red_cards: 0 } } } },
    { date: "2026-01-05", time: "20:00", league: "Başka Lig", home: match.home, away: "Başka Rakip", status: "finished", score: "3-0", source: "verified" },
  ],
};

const players = {
  source: "API-Football fixtures",
  matches: [{ date: match.date, home: match.home, away: match.away, referee: "Test Hakemi", referee_source: "API-Football fixtures" }],
};

const full = { matches: [{ ...match }], live_matches: [], finished_matches: [] };
const output = buildMatchDetailCenter({ full, standings, lineups, statuses, players, archive });
assert.strictEqual(output.match_count, 1);
const detail = output.matches[0];
assert.strictEqual(detail.id, "12345");
assert.strictEqual(detail.standings.available, true);
assert.strictEqual(detail.standings.home.rank, 2);
assert.strictEqual(detail.head_to_head.matches.length, 2, "H2H yalnız iki takımın karşılaşmalarını içermeli");
assert.strictEqual(detail.recent_matches.home.length, 3);
assert.strictEqual(detail.squads.home.starting_11.length, 11);
assert.strictEqual(detail.corners_cards.home.average_corners, 6);
assert.strictEqual(detail.referee.details.name, "Test Hakemi");
assert.ok(!JSON.stringify(detail).includes("forbidden_guess"), "Ham/tahmini oran alanı detay merkezine sızmamalı");

const attached = attachRobotContext({ matches: [{ ...match }] }, output);
assert.strictEqual(attached.applied, 1);
assert.strictEqual(attached.full.matches[0].team_intelligence.match_detail_context.standings.home.rank, 2);
assert.strictEqual(attached.full.matches[0].raw_market_guess_odds.forbidden_guess, 9.99, "Builder mevcut market alanlarını değiştirmemeli");
assert.strictEqual(attached.full.matches[0].match_detail_context.referee.name, "Test Hakemi");

const missing = buildMatchDetailCenter({ full: { matches: [{ ...match, matchCode: "999", home: "Verisiz A", away: "Verisiz B" }] } });
assert.strictEqual(missing.matches[0].standings.available, false);
assert.strictEqual(missing.matches[0].referee.available, false);
assert.strictEqual(missing.matches[0].corners_cards.available, false);

const root = path.join(__dirname, "..");
const ui = fs.readFileSync(path.join(root, "match-detail-center.js"), "utf8");
const css = fs.readFileSync(path.join(root, "match-detail-center.css"), "utf8");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
[
  "Özet", "Puan Tablosu", "Rekabet Geçmişi", "Son Maçlar", "Kadrolar", "Korner & Kart", "Hakem",
].forEach((label) => assert.ok(ui.includes(label), `${label} sekmesi eksik`));
assert.ok(ui.includes("data-fl-match-detail"));
assert.ok(ui.includes("role=\"dialog\""));
assert.ok(css.includes("@media(max-width:720px)"));
assert.ok(index.includes("match-detail-center.css?v=20260920-match-detail-center-v1"));
assert.ok(index.includes("match-detail-center.js?v=20260920-match-detail-center-v1"));

console.log("Match detail center tests passed.");


const externalDetail = buildMatchDetailCenter({
  full: { matches: [{ ...match, iddaa_event_id: "3144394" }] },
  standings: { matches: [] },
  lineups: { matches: [] },
  statuses: { matches: [] },
  players: { matches: [] },
  archive: { matches: [] },
  external: {
    source: "Nesine İstatistik",
    matches: [{
      id: "3144394",
      iddaa_event_id: "3144394",
      date: match.date,
      home: match.home,
      away: match.away,
      verified_identity: true,
      source: "Nesine İstatistik",
      source_url: "https://istatistik.nesine.com/p1/3144394",
      summary: { excerpt: "Doğrulanmış maç özeti" },
      standings: {
        structured_available: true,
        home: { team_name: match.home, rank: 1, played: 8, points: 19, wins: 6, draws: 1, losses: 1, goals_for: 18, goals_against: 7 },
        away: { team_name: match.away, rank: 8, played: 8, points: 8, wins: 2, draws: 2, losses: 4, goals_for: 9, goals_against: 14 },
        excerpt: "Puan Durumu doğrulanmış kaynak metni",
      },
      head_to_head: {
        structured_available: true,
        matches: [{ date: "2026-05-01", home: match.home, away: match.away, score: "2-1", source: "Nesine İstatistik" }],
        excerpt: "Rekabet geçmişi doğrulanmış kaynak metni",
      },
      recent_matches: { structured_available: false, home: [], away: [], excerpt: "Son 6 maç doğrulanmış kaynak metni" },
      squads: { structured_available: false, excerpt: "Kadro doğrulanmış kaynak metni" },
      corners_cards: { structured_available: false, excerpt: "Korner kart doğrulanmış kaynak metni" },
      referee: { structured_available: false, details: null, excerpt: "Hakem doğrulanmış kaynak metni" },
    }],
  },
}).matches[0];

assert.strictEqual(externalDetail.standings.home.points, 19, "verified external standings should override empty local standings");
assert.strictEqual(externalDetail.head_to_head.matches[0].score, "2-1", "verified external H2H should feed detail center");
assert.ok(externalDetail.recent_matches.source_excerpt.includes("Son 6 maç"), "verified source excerpt must survive for UI fallback");
assert.ok(externalDetail.provenance.sources.includes("Nesine İstatistik"), "external source provenance must be visible");
