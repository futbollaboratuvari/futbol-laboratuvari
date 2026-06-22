const fs = require('fs');
const out = 'data/daily-coupons.json';
const read = (file, fallback) => { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } };
const live = read('data/live-matches.json', { matches: [] });
const existing = read(out, { coupons: {} });
const n = v => { const x = Number(String(v ?? '').replace(',', '.')); return Number.isFinite(x) && x > 1 ? x : null; };
const pick = m => [['MS 1', m.oneOdd], ['MS X', m.drawOdd], ['MS 2', m.twoOdd]]
  .map(([name, val]) => ({ name, odd: n(val) }))
  .filter(x => x.odd)
  .sort((a, b) => b.odd - a.odd)[0] || null;
const matches = Array.isArray(live.matches) ? live.matches : [];
if (!matches.length) {
  existing.card_flow_note = 'Güncel maç listesi boş olduğu için mevcut kart verisi korundu.';
  existing.card_flow_checked_at = new Date().toISOString();
  fs.writeFileSync(out, JSON.stringify(existing, null, 2) + '\n');
  console.log('cards kept: no live matches');
  process.exit(0);
}
const rows = matches.map((m, i) => {
  const p = pick(m); if (!p) return null;
  return {
    no: i + 1,
    match_name: `${m.home || 'Ev sahibi'} VS ${m.away || 'Deplasman'}`,
    league: m.league || '-',
    start_time: m.time || '-',
    recommended_market: p.name,
    confidence_score: 'Seçim kullanıcıya ait',
    analysis_score: 0,
    risk_level: p.odd >= 2.50 ? 'Yüksek' : p.odd >= 1.80 ? 'Orta' : 'Düşük-Orta',
    estimated_odds: p.odd.toFixed(2),
    available_odds: { ms1: m.oneOdd || '-', msx: m.drawOdd || '-', ms2: m.twoOdd || '-' },
    value_label: 'Aday',
    robot_reason: 'Güncel maç ve oran bilgisi bulunduğu için kartta gösterilir. Son karar kullanıcıya bırakılır.'
  };
}).filter(Boolean);
if (!rows.length) {
  existing.card_flow_note = 'Oran bilgisi bulunamadığı için mevcut kart verisi korundu.';
  existing.card_flow_checked_at = new Date().toISOString();
  fs.writeFileSync(out, JSON.stringify(existing, null, 2) + '\n');
  console.log('cards kept: no odds');
  process.exit(0);
}
const byOdd = a => a.slice().sort((x, y) => n(y.estimated_odds) - n(x.estimated_odds));
const make = (type, name, list, count) => {
  const selected = (list.length ? list : rows).slice(0, count);
  const total = selected.reduce((a, x) => a * (n(x.estimated_odds) || 1), 1);
  return {
    coupon_name: name,
    coupon_type: type,
    selected_matches: selected,
    total_odds: selected.length ? total.toFixed(2) : '-',
    average_confidence_score: selected.length ? 'Seçim kullanıcıya ait' : '-',
    risk_level: selected.length ? (type === 'risk_lab' ? 'Yüksek' : type === 'high_value' ? 'Orta-Yüksek' : 'Düşük-Orta') : '-',
    short_description: selected.length ? 'Güncel listeden hazırlanan aday kartıdır.' : 'Bugün için uygun kupon adayı hazırlanıyor.',
    robot_reason: selected.length ? 'Kartlar bilgi amaçlıdır; son karar kullanıcıya bırakılır.' : 'Bugün için uygun kupon adayı hazırlanıyor.',
    is_available: Boolean(selected.length)
  };
};
const data = {
  generated_at: new Date().toISOString(),
  date: live.date,
  source: 'Güncel maç listesi',
  message: 'Kart verisi hazırlandı.',
  user_choice_mode: true,
  card_flow_ready: true,
  coupons: {
    laboratory_today: make('balanced', 'Dengeli Kupon', rows.filter(x => n(x.estimated_odds) <= 2.20), 3),
    balanced: make('balanced', 'Dengeli Kupon', rows.filter(x => n(x.estimated_odds) <= 2.20), 3),
    high_value: make('high_value', 'Yüksek Oranlı Kupon', byOdd(rows.filter(x => n(x.estimated_odds) >= 1.80)), 4),
    risk_lab: make('risk_lab', 'Riskli Kupon', byOdd(rows.filter(x => n(x.estimated_odds) >= 2.30)), 3)
  }
};
fs.writeFileSync(out, JSON.stringify(data, null, 2) + '\n');
console.log(`cards ready: ${rows.length}`);
