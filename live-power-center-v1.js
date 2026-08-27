(() => {
  const KEY = '__flLivePowerCenterV1';
  if (window[KEY]?.destroy) window[KEY].destroy();

  const state = { root: null, data: null, selectedId: '', timer: null, onClick: null };
  window[KEY] = state;

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const finite = (value) => {
    if (value === null || value === undefined || value === '' || value === '-') return null;
    const number = Number(String(value).replace('%', '').replace(',', '.'));
    return Number.isFinite(number) ? number : null;
  };
  const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));
  const pct = (value) => finite(value) === null ? '—' : `${Math.round(clamp(finite(value)))}%`;
  const n = (value, digits = 0) => finite(value) === null ? '—' : Number(finite(value)).toFixed(digits);

  function ensureStyle() {
    if (document.getElementById('fl-live-power-style')) return;
    const style = document.createElement('style');
    style.id = 'fl-live-power-style';
    style.textContent = `
      .flp{margin:26px clamp(10px,3vw,52px);border:1px solid rgba(105,214,255,.18);border-radius:20px;background:linear-gradient(145deg,#061722,#08131d 55%,#10162a);color:#f4fbff;overflow:hidden;box-shadow:0 18px 56px rgba(0,0,0,.22)}
      .flp-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-end;padding:20px 22px 12px}.flp-head p{margin:0;color:#7de7ff;font-size:11px;font-weight:950;letter-spacing:.12em;text-transform:uppercase}.flp-head h2{margin:5px 0 6px;font-size:clamp(23px,3vw,35px)}.flp-head span{display:block;max-width:760px;color:#a6b8c7;line-height:1.5}.flp-badge{padding:8px 11px;border-radius:999px;border:1px solid rgba(125,231,255,.25);color:#b9f3ff;font-size:11px;font-weight:900;white-space:nowrap}
      .flp-status{margin:0 22px 14px;padding:9px 11px;border-radius:10px;background:#0b2530;color:#a8cbd7;font-size:11px}.flp-status b{color:#dffbff}.flp-status[data-state=active]{background:#0b2b24;color:#aef5d1}
      .flp-layout{display:grid;grid-template-columns:300px minmax(0,1fr);gap:12px;padding:0 22px 22px}.flp-list,.flp-panel{border:1px solid rgba(255,255,255,.08);border-radius:15px;background:rgba(0,0,0,.16);padding:11px}.flp-list h3,.flp-panel h3{margin:0 0 9px;font-size:15px}.flp-match{display:block;width:100%;border:1px solid rgba(255,255,255,.08);border-radius:11px;background:#0b1f2b;color:#dff7ff;text-align:left;padding:10px;margin:7px 0;cursor:pointer}.flp-match:hover,.flp-match.on{border-color:rgba(125,231,255,.5);background:#0d2a37}.flp-match small{display:block;color:#718f9f;font-size:9px}.flp-match strong{display:block;margin:4px 0;font-size:12px}.flp-match span{display:flex;gap:6px;flex-wrap:wrap;color:#8eddf2;font-size:9px}.flp-empty{display:grid;place-items:center;min-height:230px;padding:24px;text-align:center;color:#7793a2;font-size:12px;line-height:1.55}
      .flp-topline{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:10px}.flp-topline small{color:#7893a4}.flp-topline h3{margin:2px 0 3px;font-size:20px}.flp-score{font-weight:950;color:#fff}.flp-current{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin:10px 0}.flp-current div{padding:9px;border-radius:10px;background:#0b2430}.flp-current span{display:block;color:#7893a4;font-size:9px}.flp-current b{display:block;margin-top:3px;color:#fff;font-size:17px}.flp-current small{display:block;color:#8ecfdf;font-size:8px}
      .flp-chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.flp-chart{border:1px solid rgba(255,255,255,.07);border-radius:12px;background:#071923;padding:9px}.flp-chart-head{display:flex;justify-content:space-between;gap:9px;align-items:center;margin-bottom:6px}.flp-chart-head b{font-size:12px}.flp-legend{display:flex;gap:8px;font-size:8px;color:#8ea5b2}.flp-legend i{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:3px}.flp-home-dot{background:#65e5a5}.flp-away-dot{background:#63bbff}.flp-chart svg{display:block;width:100%;height:auto}.flp-gridline{stroke:rgba(255,255,255,.08);stroke-width:1}.flp-axis{fill:#657e8d;font-size:9px}.flp-home-line{fill:none;stroke:#65e5a5;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}.flp-away-line{fill:none;stroke:#63bbff;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round}.flp-linkline{stroke-dasharray:4 4;opacity:.65}.flp-home-point{fill:#65e5a5}.flp-away-point{fill:#63bbff}
      .flp-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.flp-teamstats{padding:10px;border-radius:11px;background:#0a1e29}.flp-teamstats h4{margin:0 0 7px;font-size:11px}.flp-statrow{display:flex;justify-content:space-between;gap:8px;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:9px;color:#8199a8}.flp-statrow b{color:#fff}.flp-note{margin:10px 0 0;color:#6f8998;font-size:9px;line-height:1.5}.flp-note b{color:#aeeaff}
      .flp-coverage{margin:8px 0;padding:8px 10px;border-radius:9px;background:#0a202b;color:#8fb1c0;font-size:9px;line-height:1.45}.flp-coverage b{color:#dff8ff}
      @media(max-width:900px){.flp-layout{grid-template-columns:1fr}.flp-list{display:flex;gap:7px;overflow:auto}.flp-list h3{display:none}.flp-match{min-width:235px;margin:0}.flp-chart-grid{grid-template-columns:1fr}}
      @media(max-width:620px){.flp{margin:18px 8px;border-radius:15px}.flp-head{display:block;padding:16px 14px 10px}.flp-badge{display:inline-block;margin-top:8px}.flp-status{margin:0 14px 10px}.flp-layout{padding:0 14px 14px}.flp-current{grid-template-columns:1fr 1fr}.flp-stats{grid-template-columns:1fr}.flp-topline{display:block}.flp-score{margin-top:6px}}
    `;
    document.head.appendChild(style);
  }

  function ensureRoot() {
    let root = document.getElementById('live-power-center');
    if (!root) {
      root = document.createElement('section');
      root.id = 'live-power-center';
      const premium = document.getElementById('premium-analysis-panel');
      const robot = document.getElementById('robot-analizleri');
      if (premium?.parentNode) premium.parentNode.insertBefore(root, premium);
      else if (robot) robot.insertAdjacentElement('afterend', root);
      else (document.querySelector('main') || document.body).appendChild(root);
    }
    root.className = 'flp';
    state.root = root;
    return root;
  }

  function dataMatches() {
    const active = Array.isArray(state.data?.matches) ? state.data.matches : [];
    if (active.length) return active;
    return (Array.isArray(state.data?.recent_matches) ? state.data.recent_matches : []).slice(0, 4);
  }

  function lastSnapshot(match) {
    return match?.current || (Array.isArray(match?.snapshots) ? match.snapshots[match.snapshots.length - 1] : null);
  }

  function matchButton(match) {
    const snap = lastSnapshot(match) || {};
    const on = String(match.fixture_id) === state.selectedId ? ' on' : '';
    return `<button class="flp-match${on}" type="button" data-flp-id="${esc(match.fixture_id)}"><small>${esc(match.league || 'Lig')} · ${esc(match.status === 'live' ? 'CANLI' : 'Son kayıt')}</small><strong>${esc(match.home)} - ${esc(match.away)}</strong><span><em>${esc(snap.minute ?? '—')}'</em><em>Team ${esc(pct(snap.team_power?.home))}/${esc(pct(snap.team_power?.away))}</em><em>Goal ${esc(pct(snap.goal_power?.home))}/${esc(pct(snap.goal_power?.away))}</em></span></button>`;
  }

  function pointsFor(match, metric, side) {
    return (Array.isArray(match?.snapshots) ? match.snapshots : [])
      .map((row) => ({ minute: finite(row.minute), value: finite(row?.[metric]?.[side]) }))
      .filter((row) => row.minute !== null && row.value !== null);
  }

  function chartPath(points, width = 680, height = 210) {
    if (!points.length) return { path: '', circles: '' };
    const minMinute = Math.min(...points.map((p) => p.minute));
    const maxMinute = Math.max(...points.map((p) => p.minute));
    const x = (minute) => {
      if (maxMinute === minMinute) return width / 2;
      return 34 + ((minute - minMinute) / (maxMinute - minMinute)) * (width - 58);
    };
    const y = (value) => 16 + ((100 - clamp(value)) / 100) * (height - 42);
    const path = points.map((p, index) => `${index ? 'L' : 'M'}${x(p.minute).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
    const circles = points.map((p) => `<circle cx="${x(p.minute).toFixed(1)}" cy="${y(p.value).toFixed(1)}" r="3.3" data-minute="${esc(p.minute)}"></circle>`).join('');
    return { path, circles };
  }

  function chart(match, metric, title) {
    const home = pointsFor(match, metric, 'home');
    const away = pointsFor(match, metric, 'away');
    const hp = chartPath(home);
    const ap = chartPath(away);
    const allMinutes = [...home, ...away].map((p) => p.minute);
    const minMinute = allMinutes.length ? Math.min(...allMinutes) : 0;
    const maxMinute = allMinutes.length ? Math.max(...allMinutes) : 90;
    return `<div class="flp-chart"><div class="flp-chart-head"><b>${esc(title)}</b><span class="flp-legend"><span><i class="flp-home-dot"></i>${esc(match.home)}</span><span><i class="flp-away-dot"></i>${esc(match.away)}</span></span></div><svg viewBox="0 0 680 210" role="img" aria-label="${esc(title)} gözlem grafiği">
      <line class="flp-gridline" x1="34" y1="16" x2="656" y2="16"></line><line class="flp-gridline" x1="34" y1="91" x2="656" y2="91"></line><line class="flp-gridline" x1="34" y1="168" x2="656" y2="168"></line>
      <text class="flp-axis" x="5" y="20">100</text><text class="flp-axis" x="14" y="95">50</text><text class="flp-axis" x="20" y="172">0</text><text class="flp-axis" x="34" y="197">${esc(minMinute)}'</text><text class="flp-axis" x="625" y="197">${esc(maxMinute)}'</text>
      ${hp.path ? `<path class="flp-home-line flp-linkline" d="${hp.path}"></path><g class="flp-home-point">${hp.circles}</g>` : ''}${ap.path ? `<path class="flp-away-line flp-linkline" d="${ap.path}"></path><g class="flp-away-point">${ap.circles}</g>` : ''}
    </svg></div>`;
  }

  function statRows(stats) {
    const rows = [
      ['İsabetli şut', stats?.shots_on_goal], ['Toplam şut', stats?.total_shots], ['Ceza sahası içi', stats?.shots_inside_box],
      ['Korner', stats?.corners], ['Topa sahip olma', finite(stats?.possession) === null ? null : `${n(stats.possession)}%`],
      ['xG', finite(stats?.expected_goals) === null ? null : n(stats.expected_goals, 2)], ['İsabetli pas', stats?.accurate_passes], ['Toplam pas', stats?.total_passes],
    ];
    return rows.map(([label, value]) => `<div class="flp-statrow"><span>${esc(label)}</span><b>${esc(value ?? '—')}</b></div>`).join('');
  }

  function detail(match) {
    if (!match) return `<div class="flp-empty">Canlı doğrulanmış istatistik geldiğinde Team Power ve Goal Power grafikleri otomatik açılır.</div>`;
    const snap = lastSnapshot(match) || {};
    const status = match.status === 'live' ? 'CANLI' : 'SON KAYIT';
    const source = match.source || state.data?.source || 'ESPN canlı istatistikleri';
    const coverage = snap.data_coverage || {};
    const coverageLabels = { high: 'Yüksek', medium: 'Orta', limited: 'Sınırlı', unavailable: 'Veri bekleniyor' };
    const xgObserved = coverage.expected_goals_observed?.home || coverage.expected_goals_observed?.away;
    const coverageHtml = `<div class="flp-coverage"><b>Veri kapsamı: ${esc(coverageLabels[coverage.label] || 'Belirsiz')}</b> · İki takımda ortak ${esc(coverage.common_metric_count ?? '—')}/8 metrik. xG: ${esc(xgObserved ? 'kaynakta gözlendi' : 'doğrulanmış veri yok')}. Eksik alanlar sıfır kabul edilmez.</div>`;
    return `<div class="flp-topline"><div><small>${esc(match.league || 'Lig')} · ${esc(status)}</small><h3>${esc(match.home)} - ${esc(match.away)}</h3><div class="flp-score">${esc(snap.score?.home ?? '—')} - ${esc(snap.score?.away ?? '—')} · ${esc(snap.minute ?? '—')}'</div></div><small>Kaynak: ${esc(source)}</small></div>
      <div class="flp-current"><div><span>Team Power · Ev</span><b>${esc(pct(snap.team_power?.home))}</b><small>Maç içi güç payı</small></div><div><span>Team Power · Dep</span><b>${esc(pct(snap.team_power?.away))}</b><small>Maç içi güç payı</small></div><div><span>Goal Power · Ev</span><b>${esc(pct(snap.goal_power?.home))}</b><small>Gol tehdit yoğunluğu</small></div><div><span>Goal Power · Dep</span><b>${esc(pct(snap.goal_power?.away))}</b><small>Gol tehdit yoğunluğu</small></div></div>
      ${coverageHtml}
      <div class="flp-chart-grid">${chart(match, 'team_power', 'Team Power zaman serisi')}${chart(match, 'goal_power', 'Goal Power zaman serisi')}</div>
      <div class="flp-stats"><div class="flp-teamstats"><h4>${esc(match.home)} · ham canlı veriler</h4>${statRows(snap.stats?.home)}</div><div class="flp-teamstats"><h4>${esc(match.away)} · ham canlı veriler</h4>${statRows(snap.stats?.away)}</div></div>
      <p class="flp-note"><b>Önemli:</b> Noktalar yalnız ücretsiz veri kaynağından gerçekten gözlenen dakikalardır. Aradaki dakikalar ölçülmüş gibi gösterilmez; çizgiler yalnız gözlem noktalarını birbirine bağlar. Team Power sonuç olasılığı değildir. Goal Power da gol garantisi değil, yalnız o snapshotta kaynakta bulunan canlı hücum metriklerinden türetilen tehdit göstergesidir.</p>`;
  }

  function statusLabel(status, hasMatches) {
    if (status === 'ok' && hasMatches) return 'Aktif';
    if (status === 'no_live_matches') return 'Canlı maç bekleniyor';
    if (status === 'no_matching_verified_stats') return 'Doğrulanmış istatistik bekleniyor';
    if (status === 'provider_error') return 'Kaynak geçici hatası';
    return hasMatches ? 'Son doğrulanmış veri' : 'Veri bekleniyor';
  }

  function render() {
    const root = ensureRoot();
    const matches = dataMatches();
    if (!state.selectedId && matches[0]) state.selectedId = String(matches[0].fixture_id);
    let selected = matches.find((m) => String(m.fixture_id) === state.selectedId) || matches[0] || null;
    if (selected) state.selectedId = String(selected.fixture_id);
    const isActive = state.data?.status === 'ok' && (Array.isArray(state.data?.matches) ? state.data.matches.length : 0) > 0;
    const summary = state.data?.summary || {};
    const liveCount = summary.espn_live_event_count ?? summary.api_live_fixture_count ?? 0;
    const label = statusLabel(state.data?.status, matches.length > 0);
    root.innerHTML = `<div class="flp-head"><div><p>Canlı Güç Motoru</p><h2>Team Power + Goal Power</h2><span>Gerçek canlı maç istatistiklerini zaman içinde saklar; güç değişimini ve gol tehdidini sahte dakika üretmeden gösterir.</span></div><span class="flp-badge">Ücretsiz · Observed Live Data</span></div>
      <div class="flp-status" data-state="${isActive ? 'active' : 'waiting'}"><b>${esc(label)}</b> · ESPN canlı: ${esc(liveCount)} · Site eşleşmesi: ${esc(summary.matched_fixture_count ?? 0)} · Örneklenen: ${esc(summary.sampled_match_count ?? 0)}. ${esc(state.data?.message || '')}</div>
      <div class="flp-layout"><aside class="flp-list"><h3>Canlı maçlar</h3>${matches.length ? matches.map(matchButton).join('') : `<div class="flp-empty">Şu anda doğrulanmış canlı güç snapshotı yok.</div>`}</aside><div class="flp-panel">${detail(selected)}</div></div>`;
  }

  async function load() {
    try {
      const response = await fetch(`./data/live-power-series.json?t=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(String(response.status));
      state.data = await response.json();
      render();
    } catch (error) {
      ensureRoot().innerHTML = `<div class="flp-empty">Canlı güç veri dosyası şu an alınamadı. Diğer analiz alanları çalışmaya devam eder.</div>`;
      console.warn('[Futbol Laboratuvarı] live power load failed', error);
    }
  }

  function boot() {
    ensureStyle();
    ensureRoot().innerHTML = `<div class="flp-empty">Canlı güç verisi kontrol ediliyor…</div>`;
    load();
    state.onClick = (event) => {
      const button = event.target.closest('[data-flp-id]');
      if (!button || !state.root?.contains(button)) return;
      state.selectedId = String(button.getAttribute('data-flp-id') || '');
      render();
    };
    state.root.addEventListener('click', state.onClick);
    state.timer = window.setInterval(load, 120000);
  }

  state.destroy = () => {
    if (state.timer) window.clearInterval(state.timer);
    if (state.root && state.onClick) state.root.removeEventListener('click', state.onClick);
    state.root?.remove();
    document.getElementById('fl-live-power-style')?.remove();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();

