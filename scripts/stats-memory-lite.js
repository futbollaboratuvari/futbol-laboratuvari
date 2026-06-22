const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const fixturesFile = path.join(root, 'data', 'fixtures.json');
const archiveFile = path.join(root, 'data', 'robot_match_archive.json');

const read = (file, fallback) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } };
const write = (file, data) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n'); };
const n = (v) => { const x = Number(String(v ?? '').replace('%', '').replace(',', '.')); return Number.isFinite(x) ? x : null; };
const pick = (m, keys) => { for (const k of keys) { const v = n(m[k] ?? m.stats?.[k] ?? m.statistics?.[k]); if (v !== null) return v; } return null; };
const key = (m) => [m.date, m.time, m.league, m.home, m.away].map(x => String(x || '').toLowerCase().trim()).join('|');
const score = (m) => {
  const h = n(m.homeScore ?? m.home_score ?? m.homeGoals ?? m.home_goals);
  const a = n(m.awayScore ?? m.away_score ?? m.awayGoals ?? m.away_goals);
  if (h !== null && a !== null) return `${h}-${a}`;
  const s = String(m.score || m.result || '').trim();
  return /\d+\D+\d+/.test(s) ? s.replace(/\s+/g, '') : '';
};
const leader = (s) => { const f = String(s || '').match(/(\d+)\D+(\d+)/); if (!f) return 'unknown'; const h = +f[1], a = +f[2]; return h > a ? 'home' : a > h ? 'away' : 'draw'; };
const stat = (m) => ({
  home_possession: pick(m, ['homePossession','home_possession','ev_topla_oynama']),
  away_possession: pick(m, ['awayPossession','away_possession','dep_topla_oynama']),
  home_passes: pick(m, ['homePasses','home_passes','ev_pas']),
  away_passes: pick(m, ['awayPasses','away_passes','dep_pas']),
  home_shots: pick(m, ['homeShots','home_shots','ev_sut']),
  away_shots: pick(m, ['awayShots','away_shots','dep_sut']),
  home_corners: pick(m, ['homeCorners','home_corners','ev_korner']),
  away_corners: pick(m, ['awayCorners','away_corners','dep_korner'])
});
const dominant = (s) => {
  let h = 0, a = 0;
  [['possession',1],['passes',1],['shots',2],['corners',1]].forEach(([k,w]) => { const x=s[`home_${k}`], y=s[`away_${k}`]; if (x===null||y===null) return; if (x>y) h+=w; if (y>x) a+=w; });
  return !h && !a ? 'unknown' : Math.abs(h-a)<=1 ? 'balanced' : h>a ? 'home' : 'away';
};

const fixtures = read(fixturesFile, []);
const archive = read(archiveFile, { matches: [], team_index: {} });
const map = new Map((archive.matches || []).map(m => [key(m), m]));
const now = new Date().toISOString();

(Array.isArray(fixtures) ? fixtures : []).forEach(m => {
  const old = map.get(key(m)) || {};
  const s = stat(m);
  const shot = { at: now, minute: n(m.minute ?? m.elapsed ?? m.matchMinute), status: m.status || m.liveStatus || 'scheduled', score: score(m), leader: leader(score(m)), dominant: dominant(s), stats: s };
  const memory = old.match_memory || { snapshots: [] };
  const last = memory.snapshots[memory.snapshots.length - 1];
  if (!last || last.minute !== shot.minute || last.score !== shot.score || last.dominant !== shot.dominant) memory.snapshots.push(shot);
  memory.snapshots = memory.snapshots.slice(-120);
  memory.latest = shot;
  map.set(key(m), { ...old, ...m, match_memory: memory, updated_at: now });
});

const teams = {};
for (const m of map.values()) {
  for (const side of ['home','away']) {
    const name = m[side]; if (!name) continue;
    teams[name] ||= { team: name, snapshots: 0, dominant_count: 0, possession_sum: 0, possession_count: 0, passes_sum: 0, passes_count: 0 };
    for (const x of m.match_memory?.snapshots || []) {
      teams[name].snapshots++;
      if (x.dominant === side) teams[name].dominant_count++;
      const p = x.stats?.[`${side}_possession`]; if (p !== null && p !== undefined) { teams[name].possession_sum += p; teams[name].possession_count++; }
      const pass = x.stats?.[`${side}_passes`]; if (pass !== null && pass !== undefined) { teams[name].passes_sum += pass; teams[name].passes_count++; }
    }
  }
}
Object.values(teams).forEach(t => { t.avg_possession = t.possession_count ? +(t.possession_sum/t.possession_count).toFixed(2) : null; t.avg_passes = t.passes_count ? +(t.passes_sum/t.passes_count).toFixed(2) : null; delete t.possession_sum; delete t.possession_count; delete t.passes_sum; delete t.passes_count; });
archive.generated_at = now;
archive.matches = [...map.values()];
archive.team_index = teams;
archive.stats_memory_summary = { matches: archive.matches.length, teams: Object.keys(teams).length };
write(archiveFile, archive);
console.log(`Stats memory updated: ${archive.matches.length} matches, ${Object.keys(teams).length} teams`);
