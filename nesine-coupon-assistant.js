(() => {
  const DATA_URL = './data/daily-coupons.json';
  const ROOT_ID = 'nesine-kupon-asistani';
  const CONFIG = {
    low: { label: 'Düşük Risk', legs: 2, minModel: 70, minEdge: 2 },
    balanced: { label: 'Dengeli', legs: 3, minModel: 64, minEdge: 0 },
    high: { label: 'Yüksek Risk', legs: 4, minModel: 54, minEdge: -2 }
  };

  const esc = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const num = (value) => {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const match = String(value ?? '').replace(',', '.').match(/-?\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : 0;
  };

  const legOdds = (leg) => {
    const direct = num(leg.estimated_odds);
    if (direct > 1) return direct;
    const market = String(leg.recommended_market || '').toLocaleLowerCase('tr-TR');
    const odds = leg.available_odds || {};
    const pairs = [
      ['kg var', odds.bttsYes], ['kg yok', odds.bttsNo],
      ['2.5 üst', odds.over25], ['2.5 alt', odds.under25],
      ['3.5 üst', odds.over35], ['3.5 alt', odds.under35],
      ['ms 1', odds.ms1], ['ms x', odds.msx], ['ms 2', odds.ms2]
    ];
    const found = pairs.find(([key]) => market.includes(key));
    return found ? num(found[1]) : 0;
  };

  const edgeOf = (leg, odds) => {
    const explicit = num(leg.edge_percent);
    if (explicit || String(leg.edge_percent ?? '').includes('0')) return explicit;
    const estimatedProbability = num(leg.estimated_probability);
    if (!estimatedProbability || odds <= 1) return 0;
    return estimatedProbability - (100 / odds);
  };

  const scoreLeg = (leg) => {
    const odds = legOdds(leg);
    const model = num(leg.model_score || leg.confidence_score || leg.analysis_score);
    const edge = edgeOf(leg, odds);
    const completeness = num(leg.data_completeness);
    return { ...leg, _odds: odds, _model: model, _edge: edge, _score: (edge * 2.2) + (model * 0.28) + (completeness * 0.08) };
  };

  const candidatePool = (payload) => {
    const coupons = payload?.coupons || {};
    const ordered = [coupons.balanced, coupons.high_value, coupons.risk_lab, coupons.laboratory_today].filter(Boolean);
    const seen = new Set();
    const pool = [];
    ordered.forEach((coupon) => {
      (Array.isArray(coupon.selected_matches) ? coupon.selected_matches : []).forEach((leg) => {
        const key = String(leg.match_name || '').trim().toLocaleLowerCase('tr-TR');
        if (!key || seen.has(key) || leg.include_in_coupon === false) return;
        const scored = scoreLeg(leg);
        if (scored._odds <= 1 || !scored.recommended_market) return;
        if (window.FLCouponEligibility?.isCouponEligible && !window.FLCouponEligibility.isCouponEligible(leg)) return;
        seen.add(key);
        pool.push(scored);
      });
    });
    return pool.sort((a, b) => b._score - a._score || b._model - a._model || b._edge - a._edge);
  };

  const buildCoupon = (payload, mode) => {
    const config = CONFIG[mode] || CONFIG.balanced;
    const pool = candidatePool(payload);
    let filtered = pool.filter((leg) => leg._model >= config.minModel && leg._edge >= config.minEdge);
    if (filtered.length < config.legs) filtered = pool.filter((leg) => leg._model >= Math.max(50, config.minModel - 8));
    const selected = filtered.slice(0, config.legs);
    const totalOdds = selected.reduce((product, leg) => product * leg._odds, 1);
    return {
      config,
      selected,
      totalOdds: selected.length ? totalOdds : 0,
      complete: selected.length === config.legs,
      generatedAt: payload?.generated_at || null,
      source: payload?.source || 'Futbol Laboratuvarı veri motoru'
    };
  };

  const formatPercent = (value) => `${Math.round(num(value) * 10) / 10}%`;
  const formatOdds = (value) => num(value).toFixed(2).replace('.', ',');

  const copyText = (coupon) => {
    const rows = [
      `Futbol Laboratuvarı - ${coupon.config.label} Kupon Asistanı`,
      ...coupon.selected.map((leg, index) => `${index + 1}. ${leg.match_name} | ${leg.recommended_market} | Oran ${formatOdds(leg._odds)} | Model ${formatPercent(leg._model)} | Edge ${formatPercent(leg._edge)}`),
      `Toplam oran: ${formatOdds(coupon.totalOdds)}`,
      'Not: Bu liste otomatik bahis oynamaz. Son seçim ve onay kullanıcıya aittir.'
    ];
    return rows.join('\n');
  };

  const renderCoupon = (root, coupon) => {
    const output = root.querySelector('[data-nka-output]');
    const copyButton = root.querySelector('[data-nka-copy]');
    if (!coupon.selected.length) {
      output.innerHTML = '<p class="nka-empty">Bugünkü doğrulanmış veride bu risk profiline uygun kupon adayı bulunamadı.</p>';
      copyButton.hidden = true;
      return;
    }
    const warning = coupon.complete ? '' : `<p class="nka-warning">İstenen ${coupon.config.legs} maç yerine kalite filtresini geçen ${coupon.selected.length} maç bulundu; sistem sırf sayıyı tamamlamak için zayıf seçim eklemedi.</p>`;
    output.innerHTML = `
      ${warning}
      <div class="nka-summary">
        <span><small>Profil</small><strong>${esc(coupon.config.label)}</strong></span>
        <span><small>Maç</small><strong>${coupon.selected.length}</strong></span>
        <span><small>Toplam Oran</small><strong>${formatOdds(coupon.totalOdds)}</strong></span>
      </div>
      <div class="nka-legs">
        ${coupon.selected.map((leg, index) => `
          <article class="nka-leg">
            <div class="nka-leg-head"><span>#${index + 1}</span><strong>${esc(leg.match_name)}</strong></div>
            <div class="nka-market">${esc(leg.recommended_market)}</div>
            <div class="nka-metrics">
              <span>Oran <strong>${formatOdds(leg._odds)}</strong></span>
              <span>Model <strong>${formatPercent(leg._model)}</strong></span>
              <span>Edge <strong>${formatPercent(leg._edge)}</strong></span>
            </div>
            <p>${esc(leg.robot_reason || 'Model gerekçesi günlük veri motorundan alınmıştır.')}</p>
          </article>`).join('')}
      </div>`;
    copyButton.hidden = false;
    copyButton.dataset.copyText = copyText(coupon);
  };

  async function loadData() {
    const response = await fetch(DATA_URL, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Veri okunamadı (${response.status})`);
    return response.json();
  }

  function createRoot() {
    if (document.getElementById(ROOT_ID)) return document.getElementById(ROOT_ID);
    const section = document.createElement('section');
    section.className = 'section nka-section';
    section.id = ROOT_ID;
    section.innerHTML = `
      <div class="section-heading reveal visible">
        <p class="eyebrow">Manuel Kupon Hazırlama</p>
        <h2>Kupon Asistanı</h2>
        <p>Futbol Laboratuvarı'nın doğrulanmış günlük seçimlerini risk profiline göre sıralar ve kopyalanabilir kupon listesi hazırlar.</p>
      </div>
      <div class="nka-panel">
        <div class="nka-controls">
          <label for="nka-risk">Risk profili</label>
          <select id="nka-risk" data-nka-risk>
            <option value="low">Düşük Risk · 2 maç</option>
            <option value="balanced" selected>Dengeli · 3 maç</option>
            <option value="high">Yüksek Risk · 4 maç</option>
          </select>
          <button type="button" data-nka-build>Kuponu Hazırla</button>
          <button type="button" class="nka-copy" data-nka-copy hidden>Listeyi Kopyala</button>
        </div>
        <div class="nka-status" data-nka-status>Günlük veri hazırlanıyor…</div>
        <div data-nka-output></div>
        <div class="nka-boundary"><strong>Manuel onay zorunlu:</strong> Bu asistan bahis hesabına giriş yapmaz, şifre saklamaz ve kuponu otomatik oynamaz. Bahis kayıp riski taşır; kesin sonuç garantisi yoktur.</div>
      </div>`;
    const anchor = document.getElementById('robot-analizleri');
    if (anchor?.parentNode) anchor.insertAdjacentElement('afterend', section);
    else document.querySelector('main')?.appendChild(section);
    return section;
  }

  function ensureNavLink() {
    if (document.querySelector('a[href="#nesine-kupon-asistani"]')) return;
    const navGroup = document.querySelector('.nav-featured-sections') || document.querySelector('.nav-links');
    if (!navGroup) return;
    const link = document.createElement('a');
    link.href = '#nesine-kupon-asistani';
    link.textContent = 'Kupon Asistanı';
    link.className = 'nka-nav-link';
    navGroup.appendChild(link);
  }

  async function boot() {
    ensureNavLink();
    const root = createRoot();
    if (!root || root.dataset.nkaReady === '1') return;
    root.dataset.nkaReady = '1';
    const status = root.querySelector('[data-nka-status]');
    let payload;
    try {
      payload = await loadData();
      status.textContent = `Kaynak: ${payload.source || 'günlük veri motoru'}${payload.date ? ` · ${payload.date}` : ''}`;
    } catch (error) {
      status.textContent = `Kupon verisi yüklenemedi: ${error.message}`;
      root.querySelector('[data-nka-build]').disabled = true;
      return;
    }

    const build = () => renderCoupon(root, buildCoupon(payload, root.querySelector('[data-nka-risk]').value));
    root.querySelector('[data-nka-build]').addEventListener('click', build);
    root.querySelector('[data-nka-risk]').addEventListener('change', build);
    root.querySelector('[data-nka-copy]').addEventListener('click', async (event) => {
      const button = event.currentTarget;
      const text = button.dataset.copyText || '';
      try {
        await navigator.clipboard.writeText(text);
        const previous = button.textContent;
        button.textContent = 'Kopyalandı';
        window.setTimeout(() => { button.textContent = previous; }, 1400);
      } catch {
        window.prompt('Kupon listesini kopyala:', text);
      }
    });
    build();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
