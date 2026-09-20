const assert = require("assert");
const {
  candidateStatsId,
  pageContainsMatch,
  parseSource,
  primaryUrls,
  sectionExcerpt,
  htmlToLines,
} = require("../scripts/nesine-match-detail-source");
const { normalizeFixture } = require("../scripts/build-full-bulletin");

const match = {
  date: "2026-09-20",
  time: "20:00",
  home: "Ev Takımı",
  away: "Deplasman Takımı",
  league: "Test Ligi",
  iddaa_event_id: "3144394",
};

const html = `
<html><body>
<h1>Ev Takımı - Deplasman Takımı</h1>
<p>20 Eylül 2026</p>
<h3>Puan Durumu</h3>
<table>
<tr><th>#</th><th>Takım</th><th>O</th><th>G</th><th>B</th><th>M</th><th>AG</th><th>YG</th><th>AV</th><th>P</th><th>Form</th></tr>
<tr><td>2</td><td>Ev Takımı</td><td>6</td><td>4</td><td>1</td><td>1</td><td>12</td><td>5</td><td>7</td><td>13</td><td>GGMBG</td></tr>
<tr><td>6</td><td>Deplasman Takımı</td><td>6</td><td>2</td><td>2</td><td>2</td><td>8</td><td>8</td><td>0</td><td>8</td><td>MBGMB</td></tr>
</table>
<h3>Aralarındaki Son Karşılaşmalar</h3>
<table>
<tr><td>12.09.2026</td><td>Ev Takımı</td><td>2-1</td><td>Deplasman Takımı</td></tr>
<tr><td>03.05.2026</td><td>Deplasman Takımı</td><td>1-1</td><td>Ev Takımı</td></tr>
</table>
<h3>Son 6 Maç Formu</h3><p>Ev Takımı G G B M G · Deplasman Takımı M B G M B</p>
<h3>Sakat & Cezalı Listesi</h3><p>Ev Takımı: Oyuncu A cezalı · Deplasman Takımı: Oyuncu B sakat</p>
<h3>Korner & Kart</h3><p>Ev Takımı korner ortalaması 5.2 · sarı kart 2.1</p>
<h3>Hakem Bilgileri</h3><p>Test Hakemi · Türkiye</p>
</body></html>`;

const normalizedBulletinMatch = normalizeFixture({
  date: match.date,
  time: match.time,
  home: match.home,
  away: match.away,
  league: match.league,
  iddaa_event_id: "3144394",
  status: "scheduled",
  available_odds: {},
}, "Test");
assert.strictEqual(normalizedBulletinMatch.iddaa_event_id, "3144394", "full bulletin normalization must preserve official event id");
assert.strictEqual(normalizedBulletinMatch.nesine_stats_id, "3144394", "Nesine stats id must follow verified official event id");

assert.deepStrictEqual(
  primaryUrls("3144394"),
  [
    "https://istatistik.nesine.com/3144394/ozet",
    "https://istatistik.nesine.com/p1/3144394",
  ],
  "direct match detail route must be tried before legacy p1 fallback"
);
assert.strictEqual(candidateStatsId(match), "3144394", "explicit official id must be accepted");
assert.strictEqual(candidateStatsId({ ...match, iddaa_event_id: "", matchCode: "12345" }), "", "short bulletin code must not be treated as Nesine stats id");
assert.strictEqual(pageContainsMatch(html, match), true, "home and away identity should validate");
assert.strictEqual(pageContainsMatch(html, { ...match, away: "Başka Takım" }), false, "wrong opponent must fail identity validation");
const embeddedOnlyHtml = `<html><head><script id="__NEXT_DATA__" type="application/json">{"props":{"event":{"home":"Ev Tak\\u0131m\\u0131","away":"Deplasman Tak\\u0131m\\u0131"}}}</script></head><body><div id="__next"></div></body></html>`;
assert.strictEqual(pageContainsMatch(embeddedOnlyHtml, match), true, "embedded application payload should validate both teams");
assert.strictEqual(pageContainsMatch(embeddedOnlyHtml, { ...match, away: "Başka Takım" }), false, "embedded payload must still fail closed for wrong opponent");

const parsed = parseSource(html, match, "3144394");
assert.strictEqual(parsed.source_url, "https://istatistik.nesine.com/3144394/ozet", "provenance should use the direct verified summary route");
assert.strictEqual(parsed.verified_identity, true);
assert.strictEqual(parsed.standings.structured_available, true, "standings rows should be structured");
assert.strictEqual(parsed.standings.home.played, 6);
assert.strictEqual(parsed.standings.home.points, 13);
assert.strictEqual(parsed.standings.away.rank, 6);
assert.strictEqual(parsed.head_to_head.structured_available, true, "dated H2H table rows should be structured");
assert.strictEqual(parsed.head_to_head.matches.length, 2);
assert.ok(parsed.recent_matches.excerpt.includes("Son 6 Maç Formu"));
assert.ok(parsed.squads.excerpt.includes("Sakat"));
assert.ok(parsed.corners_cards.excerpt.includes("Korner"));
assert.ok(parsed.referee.excerpt.includes("Hakem"));

const lines = htmlToLines("<h3>Puan Durumu</h3><p>Data bulunamadı</p><h3>Son 6 Maç Formu</h3>");
assert.ok(sectionExcerpt(lines, "standings").includes("Data bulunamadı"));

console.log("Nesine match detail source tests passed.");
