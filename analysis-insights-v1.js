(() => {
  const KEY = "__flAnalysisInsightsV1";
  if (window[KEY]?.destroy) window[KEY].destroy();

  const state = { root: null, data: null, selectedId: "", onClick: null, onProtectedData: null, onKeydown: null };
  window[KEY] = state;
  let eligibility = window.FLCouponEligibility;

  function loadEligibility() {
    if (eligibility?.selectStrongestMatches) return Promise.resolve(eligibility);
    return new Promise((resolve, reject) => {
      const existing = document.getElementById("pro-coupon-eligibility-script");
      const complete = () => {
        eligibility = window.FLCouponEligibility;
        if (eligibility?.selectStrongestMatches) resolve(eligibility);
        else reject(new Error("Kupon uygunluk kuralları yüklenemedi."));
      };
      if (existing) {
        existing.addEventListener("load", complete, { once: true });
        existing.addEventListener("error", reject, { once: true });
        return;
      }
      const script = document.createElement("script");
      script.id = "pro-coupon-eligibility-script";
      script.src = `pro-coupon-eligibility.js?v=${encodeURIComponent(document.documentElement.dataset.flCacheVersion || "1")}`;
      script.addEventListener("load", complete, { once: true });
      script.addEventListener("error", reject, { once: true });
      document.head.appendChild(script);
    });
  }

  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[char]));
  const finite = (value) => {
    if (value === null || value === undefined || value === "" || value === "-") return null;
    const number = Number(String(value).replace("%", "").replace(",", "."));
    return Number.isFinite(number) ? number : null;
  };
  const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));
  const pct = (value) => finite(value) === null ? "—" : `${Math.round(clamp(finite(value)))}%`;
  const numText = (value, digits = 0) => finite(value) === null ? "—" : Number(finite(value)).toFixed(digits);
  const clean = (value) => String(value || "")
    .toLocaleLowerCase("tr-TR").replace(/ı/g, "i").normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

  function riskScore(value) {
    const token = clean(value);
    if (!token || /belirsiz|unknown|veri yok/.test(token)) return 45;
    if (/dusuk|low/.test(token)) return 90;
    if (/orta|medium/.test(token)) return 65;
    if (/yuksek|high/.test(token)) return 25;
    return 50;
  }

  function confidence(match) {
    const parts = [];
    const push = (key, label, value, weight, note = "") => {
      const n = finite(value);
      if (n === null) return;
      parts.push({ key, label, value: clamp(n), weight, note });
    };

    push("probability", "Tahmini olasılık", match.estimated_probability, 35, "PRO 13 sonuç olasılığı");
    push("data", "Veri kapsamı", match.data_completeness, 25, "Doğrulanmış veri doluluğu");
    push("signal", "Model sinyali", match.model_score, 20, "Sinyal gücü; olasılık değildir");

    const edge = finite(match.edge_percent);
    if (edge !== null) push("edge", "Piyasa farkı", 50 + (edge * 2.5), 10, `Edge ${edge >= 0 ? "+" : ""}${edge.toFixed(1)} puan`);
    push("squad", "Kadro güveni", riskScore(match.squad_risk_level), 5, `Kadro riski: ${match.squad_risk_level || "Belirsiz"}`);
    push("lineup", "İlk 11 güveni", riskScore(match.lineup_risk_level), 5, `İlk 11 riski: ${match.lineup_risk_level || "Belirsiz"}`);

    const totalWeight = parts.reduce((sum, part) => sum + part.weight, 0) || 1;
    const score = Math.round(parts.reduce((sum, part) => sum + (part.value * part.weight), 0) / totalWeight);
    return { score, parts };
  }

  function topMatches(data) {
    if (!eligibility?.selectStrongestMatches) return [];
    return eligibility.selectStrongestMatches(data?.matches, 10);
  }

  function tierLabel(match) {
    if (match.insight_tier === "coupon") return { text: "Kupon adayı", className: "is-coupon" };
    if (match.insight_tier === "pro_ready") return { text: "Doğrulanmış PRO görüşü · Kupon dışı", className: "is-pro" };
    return { text: "İzleme görüşü · Kupona uygun değil", className: "is-watch" };
  }

  function qualityLabel(score) {
    if (score >= 80) return "Çok güçlü";
    if (score >= 68) return "Güçlü";
    if (score >= 55) return "Dengeli";
    return "Temkinli";
  }

  function metricBar(label, value, note = "") {
    const n = finite(value);
    if (n === null) return "";
    return `<div class="flai-bar-row"><div><span>${esc(label)}</span><strong>${esc(pct(n))}</strong></div><i><b style="width:${clamp(n)}%"></b></i>${note ? `<small>${esc(note)}</small>` : ""}</div>`;
  }

  function rawBar(label, value, max, suffix = "") {
    const n = finite(value);
    if (n === null) return "";
    const width = max > 0 ? clamp((n / max) * 100) : 0;
    return `<div class="flai-bar-row flai-raw"><div><span>${esc(label)}</span><strong>${esc(`${numText(n, n % 1 ? 1 : 0)}${suffix}`)}</strong></div><i><b style="width:${width}%"></b></i></div>`;
  }

  function groupLabel(key) {
    return ({ match_result: "Maç sonucu", goals: "Gol marketleri", btts: "KG Var/Yok", other: "Diğer" }[key] || key || "Diğer");
  }

  function statsHtml(data) {
    const calibration = data?.calibration || {};
    const summary = data?.summary || {};
    const overall = finite(calibration.success_rate);
    const brier = finite(calibration.brier_score);
    const groups = (Array.isArray(calibration.groups) ? calibration.groups : []).slice(0, 4);
    return `<div class="flai-kpis">
      <article><span>Ölçülmüş tahmin</span><strong>${esc(calibration.measured_count ?? 0)}</strong><small>Sonuçlanmış kayıt</small></article>
      <article><span>Gerçek başarı</span><strong>${esc(overall === null ? "Veri birikiyor" : `${Math.round(overall)}%`)}</strong><small>${esc(calibration.won_count ?? 0)} doğru · ${esc(calibration.lost_count ?? 0)} yanlış</small></article>
      <article><span>Kalibrasyon</span><strong>${esc(brier === null ? "Toplanıyor" : `Brier ${brier.toFixed(3)}`)}</strong><small>${esc(calibration.probability_sample_count ?? 0)} olasılık örneği</small></article>
      <article><span>Bugün PRO hazır</span><strong>${esc(summary.pro_ready_count ?? 0)}</strong><small>${esc(summary.coupon_candidate_count ?? 0)} kupon adayı</small></article>
    </div>${groups.length ? `<div class="flai-groups">${groups.map((g) => `<span><b>${esc(groupLabel(g.key))}</b> ${esc(g.success_rate ?? "—")}% <small>${esc(g.measured ?? 0)} maç</small></span>`).join("")}</div>` : ""}`;
  }

  function pickCard(match, index) {
    const c = confidence(match);
    const probability = finite(match.estimated_probability);
    const odd = finite(match.recommended_odd);
    const edge = finite(match.edge_percent);
    const selected = state.selectedId === String(match.id) ? " is-open" : "";
    const tier = tierLabel(match);
    return `<article class="flai-pick${selected}" data-flai-id="${esc(match.id)}" tabindex="0" role="button" aria-expanded="${selected ? "true" : "false"}">
      <div class="flai-rank">${index + 1}</div>
      <div class="flai-pick-main"><small>${esc(match.league || "Lig")} · ${esc(match.time || "--:--")}</small><strong>${esc(match.home)} <em>vs</em> ${esc(match.away)}</strong><span>${esc(match.recommended_market)}</span></div>
      <div class="flai-score"><small>Bileşik değerlendirme</small><strong>${c.score}</strong><span>${esc(qualityLabel(c.score))}</span></div>
      <div class="flai-meta"><span>Olasılık <b>${esc(probability === null ? "—" : `${Math.round(probability)}%`)}</b></span><span>Veri <b>${esc(pct(match.data_completeness))}</b></span><span>Oran <b>${esc(odd === null ? "—" : odd.toFixed(2))}</b></span>${edge === null ? "" : `<span>Edge <b>${esc(`${edge >= 0 ? "+" : ""}${edge.toFixed(1)}`)}</b></span>`}</div>
      <span class="flai-tier ${tier.className}">${esc(tier.text)}</span>
    </article>`;
  }

  function specialMarketHtml(match) {
    const value = match?.special_market_analysis;
    const outcomes = Object.values(value?.outcomes || {}).filter((outcome) => outcome
      && outcome.official_market_complete && outcome.trusted_odds && outcome.independent_evidence
      && /^(model_analysis|watch)$/.test(String(outcome.recommendation_status || "")));
    if (!outcomes.length) {
      return `<p class="flai-muted">Resmî oran seti ve bağımsız yarı verisi eşiğini geçen yorum yok; sistem yorum uydurmadı.</p>`;
    }
    return `<div class="flai-special">${outcomes.map((outcome) => {
      const status = outcome.recommendation_status === "model_analysis" ? "Model görüşü" : "İzleme görüşü";
      const signals = Array.isArray(outcome.signals) ? outcome.signals.filter(Boolean).slice(0, 2) : [];
      return `<article><div><strong>${esc(outcome.label)}</strong><span>${esc(status)}</span></div><p>Oran <b>${esc(numText(outcome.odd, 2))}</b> · Olasılık <b>${esc(pct(outcome.estimated_probability))}</b> · Model <b>${esc(numText(outcome.model_score))}/100</b> · Veri <b>${esc(pct(outcome.data_completeness))}</b></p>${signals.length ? `<ul>${signals.map((signal) => `<li>${esc(signal)}</li>`).join("")}</ul>` : ""}</article>`;
    }).join("")}</div>`;
  }

  function detailHtml(match) {
    if (!match) return `<div class="flai-empty">Bir tahmine dokunarak ayrıntılı güven ve veri açıklamasını aç.</div>`;
    const c = confidence(match);
    const metrics = match.metrics || {};
    const signals = Array.isArray(match.signals) ? match.signals.filter(Boolean) : [];
    const tier = tierLabel(match);
    const rawValues = [metrics.homeScoredLast10, metrics.awayScoredLast10, metrics.homeConcededLast10, metrics.awayConcededLast10]
      .map(finite).filter((v) => v !== null);
    const rawMax = Math.max(1, ...rawValues);

    const componentBars = c.parts.map((part) => metricBar(part.label, part.value, part.note)).join("");
    const goalBars = [
      metricBar("KG Var eğilimi", metrics.bttsPercent),
      metricBar("2.5 Üst eğilimi", metrics.over25Percent),
      metricBar("3.5 Üst eğilimi", metrics.over35Percent),
      metricBar("İlk yarı gol eğilimi", metrics.firstHalfGoalTrend),
      metricBar("İkinci yarı gol eğilimi", metrics.secondHalfGoalTrend),
    ].filter(Boolean).join("");
    const teamBars = [
      rawBar(`${match.home} · son 10 gol`, metrics.homeScoredLast10, rawMax),
      rawBar(`${match.away} · son 10 gol`, metrics.awayScoredLast10, rawMax),
      rawBar(`${match.home} · son 10 yedi`, metrics.homeConcededLast10, rawMax),
      rawBar(`${match.away} · son 10 yedi`, metrics.awayConcededLast10, rawMax),
    ].filter(Boolean).join("");

    return `<div class="flai-detail-head"><div><small>${esc(tier.text)}</small><h3>${esc(match.home)} - ${esc(match.away)}</h3><p><b>${esc(match.recommended_market)}</b> · ${esc(match.data_quality || "Veri kalitesi belirtilmedi")}</p></div><div class="flai-big-score"><span>Bileşik değerlendirme</span><strong>${c.score}/100</strong><small>Sonuç olasılığı değildir</small></div></div>
      <div class="flai-detail-grid">
        <section><h4>AI neden bunu seçti?</h4>${signals.length ? `<ul>${signals.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>` : `<p class="flai-muted">Bu maç için açıklama sinyali henüz oluşmadı.</p>`}<div class="flai-riskline"><span>Kadro riski <b>${esc(match.squad_risk_level || "Belirsiz")}</b></span><span>İlk 11 riski <b>${esc(match.lineup_risk_level || "Belirsiz")}</b></span><span>İsimli oyuncu verisi <b>${esc(match.named_player_count ?? 0)}</b></span><span>Doğrulanmış takım <b>${esc(match.team_status_verified_count ?? 0)}/2</b></span></div></section>
        <section><h4>Güven bileşenleri</h4>${componentBars || `<p class="flai-muted">Bileşen verisi bekleniyor.</p>`}</section>
        <section><h4>Gol profili</h4>${goalBars || `<p class="flai-muted">Gol eğilim verisi bu maçta yeterli değil.</p>`}${finite(metrics.leagueGoalAverage) === null ? "" : `<p class="flai-note">Lig gol ortalaması: <b>${esc(numText(metrics.leagueGoalAverage, 2))}</b></p>`}</section>
        <section><h4>Takım güç dengesi</h4>${teamBars || `<p class="flai-muted">Son 10 maç takım üretim verisi bu eşleşmede henüz oluşmadı.</p>`}<p class="flai-note">Bu alan dakika dakika güç iddiası yapmaz; yalnız mevcut son-10 üretim/yeme verisini karşılaştırır.</p></section>
        <section class="flai-special-section"><h4>Yarı & İY/MS gerçek görüşleri</h4>${specialMarketHtml(match)}</section>
      </div>`;
  }

  function ensureStyle() {
    if (document.getElementById("flai-v1-style")) return;
    const style = document.createElement("style");
    style.id = "flai-v1-style";
    style.textContent = `
      .flai{margin:28px clamp(10px,3vw,52px);border:1px solid rgba(113,255,196,.18);border-radius:22px;background:linear-gradient(145deg,#071925,#08121c 56%,#10152b);color:#f4fbff;box-shadow:0 20px 60px rgba(0,0,0,.2);overflow:hidden}
      .flai-head{display:flex;justify-content:space-between;gap:18px;padding:22px 24px 14px;align-items:flex-end}.flai-head p{margin:0;color:#8fffcf;font-size:12px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}.flai-head h2{margin:5px 0 6px;font-size:clamp(24px,3vw,38px)}.flai-head>div>span{display:block;max-width:760px;color:#a9bac8;line-height:1.55}.flai-status{flex:0 0 auto;padding:8px 11px;border:1px solid rgba(143,255,207,.25);border-radius:999px;color:#bfffe2;font-size:12px;font-weight:900}
      .flai-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;padding:10px 24px}.flai-kpis article{padding:15px;border:1px solid rgba(255,255,255,.08);border-radius:15px;background:rgba(255,255,255,.035)}.flai-kpis span,.flai-kpis small{display:block;color:#8fa5b6;font-size:11px}.flai-kpis strong{display:block;margin:5px 0;font-size:24px;color:#fff}.flai-groups{display:flex;gap:8px;flex-wrap:wrap;padding:0 24px 18px}.flai-groups span{padding:7px 9px;border-radius:999px;background:#0e2a35;color:#d8fff0;font-size:11px}.flai-groups small{color:#7f9dab}
      .flai-body{display:grid;grid-template-columns:minmax(0,.9fr) minmax(360px,1.1fr);gap:14px;padding:0 24px 24px}.flai-list,.flai-detail{border:1px solid rgba(255,255,255,.08);border-radius:17px;background:rgba(0,0,0,.18);padding:12px}.flai-list-head{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:3px 3px 11px}.flai-list-head h3{margin:0;font-size:17px}.flai-list-head small{color:#7fa0b1}
      .flai-pick{position:relative;display:grid;grid-template-columns:34px minmax(0,1fr) 76px;gap:10px;align-items:center;padding:12px 10px 35px;margin:7px 0;border:1px solid rgba(255,255,255,.08);border-radius:13px;background:#0a1c28;cursor:pointer;transition:.18s ease}.flai-pick:hover,.flai-pick:focus,.flai-pick.is-open{outline:none;border-color:rgba(143,255,207,.58);transform:translateY(-1px);background:#0c2631}.flai-rank{display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:#122f3d;color:#8fffcf;font-weight:1000}.flai-pick-main small{display:block;color:#7893a4;font-size:10px}.flai-pick-main strong{display:block;margin:3px 0;color:#fff;font-size:13px}.flai-pick-main em{font-style:normal;color:#5f7d8c;font-size:10px}.flai-pick-main span{color:#8fffcf;font-size:12px;font-weight:900}.flai-score{text-align:right}.flai-score small,.flai-score span{display:block;color:#7893a4;font-size:9px}.flai-score strong{display:block;font-size:22px;color:#fff}.flai-meta{grid-column:2/4;display:flex;gap:6px;flex-wrap:wrap}.flai-meta span{padding:5px 7px;border-radius:7px;background:#102935;color:#91a9b6;font-size:9px}.flai-meta b{color:#fff}.flai-tier{position:absolute;left:54px;bottom:8px;padding:4px 7px;border-radius:999px;background:#132b37;color:#a9bdc8;font-size:8px;font-weight:1000}.flai-tier.is-coupon{background:#153c2c;color:#8fffcf}.flai-tier.is-pro{background:#18334b;color:#a9d7ff}.flai-tier.is-watch{background:#352d1b;color:#f2d58c}
      .flai-empty{display:grid;place-items:center;min-height:300px;text-align:center;color:#7893a4;padding:30px}.flai-detail-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding:5px 5px 12px}.flai-detail-head small{color:#7893a4}.flai-detail-head h3{margin:3px 0;font-size:20px}.flai-detail-head p{margin:0;color:#91a9b6;font-size:12px}.flai-detail-head p b{color:#8fffcf}.flai-big-score{min-width:118px;text-align:right}.flai-big-score span,.flai-big-score small{display:block;color:#7893a4;font-size:9px}.flai-big-score strong{display:block;color:#fff;font-size:24px}.flai-detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.flai-detail-grid section{padding:12px;border:1px solid rgba(255,255,255,.07);border-radius:13px;background:#091923}.flai-detail-grid h4{margin:0 0 9px;color:#eafff5;font-size:13px}.flai-detail-grid ul{margin:0;padding-left:17px;color:#b7cad5;font-size:11px;line-height:1.55}.flai-riskline{display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:10px}.flai-riskline span{padding:6px;border-radius:8px;background:#0e2733;color:#86a1b1;font-size:9px}.flai-riskline b{display:block;color:#fff;margin-top:2px}
      .flai-bar-row{margin:8px 0}.flai-bar-row>div{display:flex;justify-content:space-between;gap:8px;font-size:10px;color:#9eb3c0}.flai-bar-row strong{color:#fff}.flai-bar-row i{display:block;height:7px;margin-top:4px;border-radius:99px;background:#122c38;overflow:hidden}.flai-bar-row i b{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#47d9a0,#a7ffd7)}.flai-bar-row small{display:block;margin-top:3px;color:#647f8f;font-size:8px}.flai-raw i b{background:linear-gradient(90deg,#5ca8ff,#a38bff)}.flai-note,.flai-muted{color:#718c9c;font-size:9px;line-height:1.45}.flai-note b{color:#fff}.flai-foot{padding:0 24px 22px;color:#6f8999;font-size:10px;line-height:1.5}.flai-foot b{color:#9edfc6}
      .flai-special-section{grid-column:1/-1}.flai-special{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.flai-special article{padding:9px;border:1px solid rgba(143,255,207,.12);border-radius:10px;background:#0b202a}.flai-special article>div{display:flex;justify-content:space-between;gap:8px}.flai-special strong{font-size:11px;color:#fff}.flai-special span{font-size:8px;color:#8fffcf}.flai-special p{margin:6px 0;color:#8fa7b5;font-size:9px}.flai-special p b{color:#fff}.flai-special ul{margin:0;padding-left:14px;font-size:9px}
      @media(max-width:980px){.flai-kpis{grid-template-columns:1fr 1fr}.flai-body{grid-template-columns:1fr}.flai-detail-grid{grid-template-columns:1fr 1fr}}
      @media(max-width:620px){.flai{margin:18px 8px;border-radius:16px}.flai-head{display:block;padding:18px 14px 10px}.flai-status{display:inline-block;margin-top:10px}.flai-kpis{padding:8px 14px;gap:7px}.flai-kpis article{padding:11px}.flai-kpis strong{font-size:19px}.flai-groups{padding:0 14px 12px}.flai-body{padding:0 14px 14px}.flai-detail-grid,.flai-special{grid-template-columns:1fr}.flai-pick{grid-template-columns:30px minmax(0,1fr) 64px;padding:10px 8px}.flai-meta{grid-column:1/4}.flai-foot{padding:0 14px 16px}}
    `;
    document.head.appendChild(style);
  }

  function ensureRoot() {
    let root = document.getElementById("ai-guven-merkezi");
    if (!root) {
      root = document.createElement("section");
      root.id = "ai-guven-merkezi";
      const premium = document.getElementById("premium-analysis-panel");
      const robot = document.getElementById("robot-analizleri");
      if (premium?.parentNode) premium.parentNode.insertBefore(root, premium);
      else if (robot) robot.insertAdjacentElement("afterend", root);
      else (document.querySelector("main") || document.body).appendChild(root);
    }
    root.className = "flai";
    state.root = root;
    return root;
  }

  function render() {
    const root = ensureRoot();
    const data = state.data;
    const picks = topMatches(data);
    if (!state.selectedId && picks[0]) state.selectedId = String(picks[0].id);
    const selected = picks.find((m) => String(m.id) === state.selectedId) || picks[0] || null;
    if (selected) state.selectedId = String(selected.id);

    root.innerHTML = `<div class="flai-head"><div><p>AI Şeffaflık Merkezi</p><h2>Güven, başarı ve neden tek ekranda</h2><span>Robotun seçimini yalnız yüzdeyle değil; gerçek geçmiş performans, veri kapsamı, model sinyali, piyasa farkı ve kadro/ilk 11 riskiyle birlikte gösterir.</span></div><span class="flai-status">${esc(data?.engine || "PRO veri akışı")}</span></div>
      ${statsHtml(data)}
      <div class="flai-body"><div class="flai-list"><div class="flai-list-head"><h3>Günün en güçlü tahminleri</h3><small>${esc(picks.length)}/10 seçim</small></div>${picks.length ? picks.map(pickCard).join("") : `<div class="flai-empty">Bugün güven eşiğini geçen açıklanabilir PRO seçimi henüz oluşmadı.</div>`}</div><div class="flai-detail">${detailHtml(selected)}</div></div>
      <div class="flai-foot"><b>Bileşik değerlendirme puanı sonuç olasılığı değildir.</b> Tahmini olasılığı; veri kapsamı, model sinyali, piyasa farkı ve kadro/ilk 11 riskleriyle birlikte açıklama amacıyla sunar. Dakika dakika takım gücü verisi mevcut değilse sistem böyle bir grafik uydurmaz; yalnız mevcut gerçek metrikleri gösterir.</div>`;
  }

  function renderLocked() {
    const root = ensureRoot();
    root.innerHTML = `<div class="flai-head"><div><p>AI Şeffaflık Merkezi</p><h2>PRO veri üyelikle açılır</h2><span>Ücretli öneri, olasılık ve kupon uygunluğu yalnız geçerli üyelik doğrulamasından sonra yüklenir.</span></div><span class="flai-status">Korumalı</span></div><div class="flai-empty">Özel Analiz bölümünden üyelik kodunu doğruladığında şeffaflık verileri bu alanda açılır.</div>`;
  }

  async function boot() {
    ensureStyle();
    renderLocked();
    try {
      await loadEligibility();
      if (window.__flProtectedProIndex) {
        state.data = window.__flProtectedProIndex;
        render();
      }
      state.onProtectedData = (event) => {
        const data = event.detail?.data;
        if (!data || !Array.isArray(data.matches)) return;
        state.data = data;
        render();
      };
      window.addEventListener("fl:pro-analysis-ready", state.onProtectedData);
      state.onClick = (event) => {
        const card = event.target.closest("[data-flai-id]");
        if (!card || !state.root?.contains(card)) return;
        state.selectedId = String(card.getAttribute("data-flai-id") || "");
        render();
      };
      state.root.addEventListener("click", state.onClick);
      state.onKeydown = (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        const card = event.target.closest("[data-flai-id]");
        if (!card) return;
        event.preventDefault();
        state.selectedId = String(card.getAttribute("data-flai-id") || "");
        render();
      };
      state.root.addEventListener("keydown", state.onKeydown);
    } catch (error) {
      state.root.innerHTML = `<div class="flai-empty">AI güven merkezi verisi şu anda alınamadı. Mevcut maç/analiz ekranları çalışmaya devam eder.</div>`;
      console.warn("[Futbol Laboratuvarı] analysis insights load failed", error);
    }
  }

  state.destroy = () => {
    if (state.root && state.onClick) state.root.removeEventListener("click", state.onClick);
    if (state.root && state.onKeydown) state.root.removeEventListener("keydown", state.onKeydown);
    if (state.onProtectedData) window.removeEventListener("fl:pro-analysis-ready", state.onProtectedData);
    state.root?.remove();
    document.getElementById("flai-v1-style")?.remove();
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
})();

