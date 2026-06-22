const fs = require('fs');
const live = JSON.parse(fs.readFileSync('data/live-matches.json', 'utf8'));
const dailyPath = 'data/daily-coupons.json';
let daily = { coupons: {} };
try { daily = JSON.parse(fs.readFileSync(dailyPath, 'utf8')); } catch {}
const num = v => { const n = Number(String(v ?? '').replace(',', '.')); return Number.isFinite(n) && n > 1 ? n : null; };
const ready = c => c && c.is_available && Array.isArray(c.selected_matches) && c.selected_matches.length;
if (Object.values(daily.coupons || {}).some(ready)) process.exit(0);
const pick = m => {
  const opts = [ ['MS 1', m.oneOdd], ['MS X', m.drawOdd], ['MS 2', m.twoOdd] ]
    .map(([label, value]) => ({ label, odd: num(value) }))
    .filter(x => x.odd);
  const selected = opts.filter(x => x.odd >= 1.30 && x.odd <= 3.80).sort((a,b) => b.odd-a.odd)[0] || opts[0];
  return selected ? { label: selected.label, odd: selected.odd.toFixed(2) } : null;
};
const legs = (live.matches || []).map((m, i) => {
  const p = pick(m); if (!p) return null;
  return {
    no: i + 1,
    match_name: `${m.home || 'Ev sahibi'} VS ${m.away || 'Deplasman'}`,
    league: m.league || '-',
    start_time: m.time || '-',
    recommended_market: p.label,
    confidence_score: 'İzleme',
    analysis_score: 0,
    risk_level: Number(p.odd) >= 2.50 ? 'Yüksek' : 'Orta',
    estimated_odds: p.odd,
    available_odds: { ms1: m.oneOdd || '-', msx: m.drawOdd || '-', ms2: m.twoOdd || '-' },
    value_label: 'Aday',
    robot_reason: 'Güncel maç listesinde oran bilgisi olduğu için kupon merkezinde izleme adayı olarak gösterilir.'
  };
}).filter(Boolean);
const make = (type, name, rows) => {
  const selected = rows.filter(Boolean);
  const total = selected.reduce((a, x) => a * (num(x.estimated_odds) || 1), 1);
  return {
    coupon_name: name,
    coupon_type: type,
    selected_matches: selected,
    total_odds: selected.length ? total.toFixed(2) : '-',
    average_confidence_score: selected.length ? 'İzleme' : '-',
    risk_level: selected.length ? (type === 'risk_lab' ? 'Yüksek' : type === 'high_value' ? 'Orta-Yüksek' : 'Düşük-Orta') : '-',
    short_description: selected.length ? 'Güncel maç listesinden oluşturulan aday kartıdır.' : 'Bugün için uygun kupon adayı hazırlanıyor.',
    robot_reason: selected.length ? 'Kesin sonuç vaadi değildir; maç ve oran bilgisi kartlara aktarılmıştır.' : 'Bugün için uygun kupon adayı hazırlanıyor.',
    is_available: Boolean(selected.length)
  };
};
daily.generated_at = new Date().toISOString();
daily.message = legs.length ? 'Kupon merkezi aday kartları hazırlandı.' : 'Bugün için uygun kupon adayı hazırlanıyor.';
daily.coupons = {
  laboratory_today: make('balanced', 'Dengeli Kupon', legs.slice(0, 3)),
  balanced: make('balanced', 'Dengeli Kupon', legs.slice(0, 3)),
  high_value: make('high_value', 'Yüksek Oranlı Kupon', legs.slice(0, 4)),
  risk_lab: make('risk_lab', 'Riskli Kupon', legs.slice(0, 3))
};
daily.card_flow_ready = true;
fs.writeFileSync(dailyPath, JSON.stringify(daily, null, 2) + '\n');
console.log(`card flow ready: ${legs.length}`);
