(() => {
  const DATA_PATH = './data/high-odds-htft.json';
  const ROOT_ID = 'high-odds-htft';
  const STYLE_ID = 'high-odds-htft-style';

  const escapeHtml = (value) => String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  async function readJson() {
    if (typeof window.__flReadJsonShared === 'function') {
      return window.__flReadJsonShared(DATA_PATH);
    }
    const response = await fetch(`${DATA_PATH}?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response.json();
  }

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${ROOT_ID} { position: relative; overflow: hidden; }
      #${ROOT_ID}::before { content: ''; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(circle at 10% 0%, rgba(83,255,137,.11), transparent 34%), radial-gradient(circle at 90% 100%, rgba(255,216,88,.08), transparent 30%); }
      #${ROOT_ID} .fl-htft-grid { position: relative; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
      #${ROOT_ID} .fl-htft-card { border: 1px solid rgba(107,255,154,.28); background: linear-gradient(145deg, rgba(8,24,28,.96), rgba(5,14,20,.98)); box-shadow: 0 18px 44px rgba(0,0,0,.22); }
      #${ROOT_ID} .fl-htft-card h3 { margin: 12px 0 6px; font-size: clamp(18px, 2vw, 24px); }
      #${ROOT_ID} .fl-htft-market { display: inline-flex; align-items: center; justify-content: center; min-width: 70px; min-height: 42px; padding: 8px 14px; border-radius: 12px; font-weight: 950; font-size: 22px; letter-spacing: .04em; color: #07130c; background: #7dff9e; box-shadow: 0 0 26px rgba(125,255,158,.22); }
      #${ROOT_ID} .fl-htft-odds { font-size: 24px; color: #ffe08a; }
      #${ROOT_ID} .fl-htft-meta { display: flex; flex-wrap: wrap; gap: 8px; margin: 10px 0 4px; }
      #${ROOT_ID} .fl-htft-meta span { border: 1px solid rgba(255,255,255,.1); border-radius: 999px; padding: 5px 9px; font-size: 12px; font-weight: 800; color: #d9f7e3; background: rgba(255,255,255,.035); }
      #${ROOT_ID} .fl-htft-note { margin-top: 12px; line-height: 1.55; color: #cfe3d7; }
      #${ROOT_ID} .fl-htft-warning { position: relative; margin-top: 14px; color: #a9c5b3; font-size: 12px; }
      #${ROOT_ID} .fl-htft-empty { grid-column: 1 / -1; }
      @media (max-width: 920px) { #${ROOT_ID} .fl-htft-grid { grid-template-columns: 1fr; } }
    `;
    document.head.appendChild(style);
  }

  function ensureSection() {
    let root = document.getElementById(ROOT_ID);
    if (root) return root;
    const anchor = document.getElementById('robot-analizleri');
    if (!anchor) return null;

    root = document.createElement('section');
    root.className = 'section robot-live-section';
    root.id = ROOT_ID;
    root.setAttribute('aria-labelledby', 'high-odds-htft-title');
    root.innerHTML = `
      <div class="section-heading reveal visible">
        <p class="eyebrow">Yüksek Oran · İY/MS Ters Sonuç Motoru</p>
        <h2 id="high-odds-htft-title">Günün 1/2 – 2/1 Özel Analizleri</h2>
        <p>Güncel maç havuzu her gün taranır; 1/2 ve 2/1 senaryoları arasından en güçlü 2–3 yüksek oran adayı öne çıkarılır.</p>
      </div>
      <div class="robot-live-status reveal visible" aria-live="polite">
        <span>Tarama: <strong data-htft-scan>Hazırlanıyor</strong></span>
        <span>Aday: <strong data-htft-candidates>-</strong></span>
        <span>Gösterilen: <strong data-htft-selected>-</strong></span>
        <span>Durum: <strong data-htft-status>Veri bekleniyor</strong></span>
      </div>
      <div class="fl-htft-grid" data-htft-cards></div>
      <p class="fl-htft-warning">1/2 ve 2/1 yüksek varyanslı marketlerdir. “Model güveni” sonuç olasılığı değildir; karttaki oran doğrulanmış resmî İddaa oranıdır.</p>
    `;
    anchor.insertAdjacentElement('afterend', root);
    return root;
  }

  function card(pick, index) {
    const officialOdds = pick.bookmaker_odds ?? pick.real_odds ?? pick.model_odds ?? '-';
    return `
      <article class="robot-live-card fl-htft-card">
        <div class="robot-card-topline">
          <span class="robot-pill">#${index + 1} Ters Sonuç Adayı</span>
          <span class="robot-pill risk-yuksek">Yüksek Risk</span>
        </div>
        <h3>${escapeHtml(pick.match_name || `${pick.home || ''} - ${pick.away || ''}`)}</h3>
        <div class="fl-htft-meta">
          <span>${escapeHtml(pick.league || '-')}</span>
          <span>${escapeHtml(pick.date || '-')} · ${escapeHtml(pick.time || '-')}</span>
        </div>
        <div class="robot-row"><span>İY/MS Seçimi</span><strong class="fl-htft-market">${escapeHtml(pick.market || '-')}</strong></div>
        <div class="robot-row"><span>Resmî İddaa Oranı</span><strong class="fl-htft-odds">${escapeHtml(officialOdds)}</strong></div>
        <div class="robot-row"><span>Model Güveni</span><strong>${escapeHtml(pick.model_confidence ?? '-')}%</strong></div>
        <div class="robot-row"><span>Senaryo Olasılığı</span><strong>${escapeHtml(pick.scenario_probability ?? '-')}%</strong></div>
        <div class="robot-row"><span>Veri Kapsamı</span><strong>${escapeHtml(pick.data_completeness ?? '-')}%</strong></div>
        <p class="fl-htft-note"><strong>Analiz:</strong> ${escapeHtml(pick.reason || 'Gerekçe hazırlanıyor.')}</p>
      </article>
    `;
  }

  function setText(root, selector, value) {
    const node = root.querySelector(selector);
    if (node) node.textContent = value;
  }

  function todayInIstanbul() {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Istanbul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).formatToParts(new Date());
    const bag = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${bag.year}-${bag.month}-${bag.day}`;
  }

  function render(root, data) {
    const picks = Array.isArray(data?.picks) ? data.picks.slice(0, 3) : [];
    const today = todayInIstanbul();
    const bulletinDate = String(data?.date || '').slice(0, 10);
    const futureBulletin = Boolean(bulletinDate && bulletinDate > today);
    setText(root, '[data-htft-scan]', `${Number(data?.scan_count || 0)} maç`);
    setText(root, '[data-htft-candidates]', String(Number(data?.candidate_count || 0)));
    setText(root, '[data-htft-selected]', String(picks.length));
    setText(root, '[data-htft-status]', data?.status === 'ready'
      ? futureBulletin ? 'Sıradaki bülten' : 'Güncel'
      : 'Yeterli aday bekleniyor');
    const title = root.querySelector('#high-odds-htft-title');
    if (title) title.textContent = futureBulletin
      ? 'Sıradaki 1/2 – 2/1 Özel Analizleri'
      : 'Günün 1/2 – 2/1 Özel Analizleri';

    const cards = root.querySelector('[data-htft-cards]');
    if (!cards) return;
    if (bulletinDate && bulletinDate < today) {
      setText(root, '[data-htft-candidates]', '0');
      setText(root, '[data-htft-selected]', '0');
      setText(root, '[data-htft-status]', 'Güncel veri bekleniyor');
      cards.innerHTML = '<article class="robot-live-card fl-htft-empty"><p class="robot-note">Bugünün 1/2 – 2/1 taraması yenileniyor.</p></article>';
      return;
    }
    if (picks.length) {
      cards.innerHTML = picks.map(card).join('');
      return;
    }
    cards.innerHTML = `<article class="robot-live-card fl-htft-empty"><p class="robot-note">${escapeHtml(data?.message || 'Bugün için yüksek oranlı 1/2 – 2/1 adayı henüz oluşmadı.')}</p></article>`;
  }

  async function boot() {
    ensureStyles();
    const root = ensureSection();
    if (!root) return;
    try {
      const data = await readJson();
      render(root, data);
    } catch (error) {
      setText(root, '[data-htft-status]', 'Veri bekleniyor');
      const cards = root.querySelector('[data-htft-cards]');
      if (cards) cards.innerHTML = '<article class="robot-live-card fl-htft-empty"><p class="robot-note">Günlük 1/2 – 2/1 taraması hazırlanıyor.</p></article>';
      console.warn('[HTFT] data load failed:', error.message);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setInterval(boot, 15 * 60 * 1000);
})();
