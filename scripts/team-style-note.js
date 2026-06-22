const fs = require('fs');

const read = (p, f) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return f; } };
const write = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2) + '\n');
const clean = (x) => String(x || '').toLocaleLowerCase('tr-TR').replace(/ı/g, 'i').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();

const archive = read('data/robot_match_archive.json', { team_index: {} });
const raw = read('data/ham_mac_havuzu.json', {});
const teams = new Map(Object.values(archive.team_index || {}).map(t => [clean(t.team), t]));

const one = (name) => {
  const t = teams.get(clean(name));
  if (!t) return null;
  const dom = t.snapshots ? Math.round(((t.dominant_count || 0) / t.snapshots) * 100) : 0;
  return {
    dominance_rate: dom,
    avg_possession: t.avg_possession ?? null,
    avg_passes: t.avg_passes ?? null,
    avg_shots: t.avg_shots ?? null,
    avg_corners: t.avg_corners ?? null,
    avg_yellow_cards: t.avg_yellow_cards ?? null,
    avg_red_cards: t.avg_red_cards ?? null
  };
};

if (Array.isArray(raw.matches)) {
  raw.matches = raw.matches.map(m => {
    const homeName = m.home_team_name || m.home;
    const awayName = m.away_team_name || m.away;
    const home = one(homeName);
    const away = one(awayName);
    return { ...m, team_style_memory: { home, away } };
  });
  raw.team_style_memory_enabled = true;
  raw.team_style_memory_updated_at = new Date().toISOString();
}

write('data/ham_mac_havuzu.json', raw);
console.log('team style memory notes updated');
