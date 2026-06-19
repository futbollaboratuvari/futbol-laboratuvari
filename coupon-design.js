(() => {
  const DATA_URL = "./data/analiz_sonuclari.json";

  const esc = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const pick = (item, keys, fallback = "-") => {
    for (const key of keys) {
      const value = item?.[key];
      if (value !== undefined && value !== null && value !== "") return value;
    }
    return fallback;
  };

  const cleanPercent = (value) => {
    const text = String(value ?? "").trim();
    const number = Number(text.replace("%", ""));
    return Number.isFinite(number) ? Math.max(0, Math.min(100, number)) : 0;
  };

  const splitMatch = (value = "") => {
    const text = String(value || "").replace(/\s+VS\s+/i, " VS ").trim();
    if (text.includes(" VS ")) {
      const [home, away] = text.split(" VS ");
      return { home: home?.trim() || "Ev sahibi", away: away?.trim() || "Deplasman" };
    }
    if (text.includes(" - ")) {
      const [home, away] = text.split(" - ");
      return { home: home?.trim() || "Ev sahibi", away: away?.trim() || "Deplasman" };
    }
    return { home: text || "Ev sahibi", away: "Deplasman" };
  };

  const normalizeType = (value) => {
    const text = String(value || "").toLowerCase();
    if (text.includes("3") || text.includes("triple")) return "triple";
    if (text.includes("2") || text.includes("double")) return "double";
    return "single";
  };

  const titleByType = {
    single: "Tekli Kuponlar",
    double: "2'li Kuponlar",
    triple: "3'lü Kuponlar",
  };

  const emptyText = {
    single: "Tekli kuponlar hazırlanıyor.",
    double: "2'li kuponlar hazırlanıyor.",
    triple: "3'lü kuponlar hazırlanıyor.",
  };

  const labelForType = {
    single: "Tekli Kupon",
    double: "2'li Kupon",
    triple: "3'lü Kupon",
  };

  const hasData = (item) => {
    const choice = pick(item, ["selection", "option", "market", "prediction", "decision"], "");
    const score = pick(item, ["score", "confidence", "confidence_score"], "");
    const signals = item?.pro_signals || item?.signals || item?.evidence || item?.layers || item?.legs;
    return Boolean(choice && score && signals);
  };

  const injectStyle = () => {
    if (document.getElementById("coupon-design-style")) return;
    const style = document.createElement("style");
    style.id = "coupon-design-style";
    style.textContent = `
      .coupon-card {
        position: relative;
        overflow: hidden;
        display: grid;
        gap: 12px;
        padding: 16px;
        border: 1px solid rgba(255, 191, 46, .34);
        border-radius: 20px;
        background:
          radial-gradient(circle at 12% 0%, rgba(57, 255, 136, .13), transparent 28%),
          radial-gradient(circle at 90% 8%, rgba(255, 191, 46, .12), transparent 30%),
          linear-gradient(180deg, rgba(6, 18, 36, .97), rgba(2, 7, 20, .98));
        box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 18px 44px rgba(0,0,0,.35);
      }
      .coupon-card::before {
        content: "";
        position: absolute;
        inset: 0 0 auto;
        height: 3px;
        background: linear-gradient(90deg, #39ff88, #ffbf2e, transparent);
      }
      .coupon-card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .coupon-index {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 42px;
        height: 30px;
        border-radius: 10px 4px 12px 4px;
        background: linear-gradient(180deg, #ffd25a, #f0a500);
        color: #061224;
        font-size: 15px;
        font-weight: 1000;
        letter-spacing: .04em;
        box-shadow: 0 10px 22px rgba(255, 191, 46, .22);
      }
      .coupon-badge {
        flex: 0 0 auto;
        padding: 8px 12px;
        border-radius: 999px;
        border: 1px solid rgba(57,255,136,.34);
        background: rgba(57,255,136,.11);
        color: #d5ffe5;
        font-size: 11px;
        font-weight: 900;
        white-space: nowrap;
      }
      .coupon-leg {
        position: relative;
        display: grid;
        gap: 9px;
        padding: 12px;
        border: 1px solid rgba(255,191,46,.22);
        border-radius: 16px;
        background: rgba(0, 0, 0, .18);
      }
      .coupon-leg-head {
        display: grid;
        grid-template-columns: auto 1fr auto;
        align-items: center;
        gap: 10px;
      }
      .coupon-leg-no {
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 9px;
        background: rgba(57, 255, 136, .18);
        border: 1px solid rgba(57, 255, 136, .36);
        color: #8dffb5;
        font-weight: 1000;
      }
      .coupon-match-block {
        display: grid;
        gap: 5px;
      }
      .coupon-match-row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        color: #f8fbff;
        font-weight: 1000;
        letter-spacing: .02em;
        line-height: 1.2;
      }
      .coupon-match-row .team {
        min-width: 0;
      }
      .vs-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 3px 8px;
        border-radius: 999px;
        border: 1px solid rgba(255,191,46,.48);
        background: rgba(255,191,46,.10);
        color: #ffbf2e;
        font-size: 11px;
        font-weight: 1000;
        box-shadow: 0 0 12px rgba(255,191,46,.12);
      }
      .coupon-time {
        color: #ffbf2e;
        font-size: 11px;
        font-weight: 800;
      }
      .coupon-pick-pill {
        justify-self: end;
        padding: 7px 11px;
        border-radius: 999px;
        border: 1px solid rgba(255,191,46,.36);
        background: rgba(255,191,46,.08);
        color: #f8fbff;
        font-size: 12px;
        font-weight: 900;
        white-space: nowrap;
      }
      .coupon-lab-strip {
        display: grid;
        grid-template-columns: 1fr 1.45fr 1fr;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 13px;
        background: rgba(2, 8, 22, .72);
      }
      .coupon-lab-cell {
        display: grid;
        gap: 3px;
        min-width: 0;
        padding: 9px 10px;
        border-right: 1px solid rgba(255,255,255,.07);
      }
      .coupon-lab-cell:last-child { border-right: 0; }
      .coupon-lab-cell span,
      .coupon-combo-label,
      .coupon-metric span,
      .coupon-analysis-title {
        color: #8dff8d;
        font-size: 10px;
        font-weight: 900;
        text-transform: uppercase;
        letter-spacing: .045em;
      }
      .coupon-lab-cell strong {
        color: #f8fbff;
        font-size: 15px;
        line-height: 1.05;
      }
      .coupon-lab-cell em {
        color: #8dff8d;
        font-style: normal;
        font-size: 14px;
        font-weight: 1000;
      }
      .coupon-prob-line {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .coupon-prob-line strong {
        min-width: 38px;
        font-size: 17px;
      }
      .coupon-prob-bar {
        position: relative;
        flex: 1;
        height: 8px;
        overflow: hidden;
        border-radius: 999px;
        background: rgba(255,255,255,.13);
        box-shadow: inset 0 0 0 1px rgba(255,255,255,.08);
      }
      .coupon-prob-bar i {
        display: block;
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #39ff88, #d7ff38, #ffbf2e);
      }
      .coupon-trust {
        display: flex;
        align-items: center;
        gap: 7px;
        flex-wrap: wrap;
      }
      .coupon-trust-shield {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        border: 2px solid #39ff88;
        border-radius: 10px 10px 12px 12px;
        color: #d7ff38;
        font-weight: 1000;
        background: rgba(57,255,136,.08);
      }
      .coupon-trust small {
        color: #f8fbff;
        font-weight: 800;
      }
      .coupon-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: max-content;
        max-width: 100%;
        padding: 3px 7px;
        border-radius: 7px;
        border: 1px solid rgba(255,191,46,.42);
        color: #ffd25a;
        background: rgba(255,191,46,.08);
        font-size: 10px;
        font-weight: 1000;
      }
      .coupon-tag-riskli,
      .coupon-tag-yüksek {
        color: #ff6b4a;
        border-color: rgba(255,107,74,.45);
        background: rgba(255,107,74,.08);
      }
      .coupon-combo {
        display: grid;
        grid-template-columns: 1fr auto;
        gap: 12px;
        align-items: center;
        padding: 12px;
        border: 1px solid rgba(255,191,46,.26);
        border-radius: 15px;
        background: rgba(255,255,255,.035);
      }
      .coupon-combo strong {
        display: block;
        margin-top: 4px;
        color: #f8fbff;
        font-size: 19px;
        line-height: 1.15;
      }
      .coupon-total-odd {
        min-width: 86px;
        text-align: right;
      }
      .coupon-total-odd span {
        display: block;
        color: #ffbf2e;
        font-size: 10px;
        font-weight: 900;
        text-transform: uppercase;
      }
      .coupon-total-odd strong {
        color: #ffbf2e;
        font-size: 24px;
      }
      .coupon-metrics {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
      }
      .coupon-metric {
        display: grid;
        gap: 4px;
        padding: 10px;
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 13px;
        background: rgba(0,0,0,.18);
      }
      .coupon-metric strong {
        color: #f8fbff;
        font-size: 14px;
      }
      .coupon-metric .good { color: #39ff88; }
      .coupon-metric .warn { color: #ffbf2e; }
      .coupon-metric .bad { color: #ff5e57; }
      .coupon-scores {
        color: #ffbf2e;
        font-weight: 1000;
      }
      .coupon-analysis {
        display: grid;
        gap: 6px;
        margin: 0;
        padding: 11px 12px;
        border: 1px solid rgba(255,255,255,.07);
        border-radius: 13px;
        background: rgba(0,0,0,.16);
      }
      .coupon-analysis ul {
        margin: 0;
        padding-left: 16px;
        color: #c7d5e8;
        font-size: 12px;
        line-height: 1.45;
      }
      .coupon-analysis li::marker { color: #ffbf2e; }
      .coupon-action {
        justify-self: center;
        min-width: 210px;
        border: 0;
        border-radius: 11px;
        padding: 11px 18px;
        background: linear-gradient(180deg, #ffd25a, #f0a500);
        color: #061224;
        font-weight: 1000;
        letter-spacing: .04em;
        box-shadow: 0 14px 32px rgba(255,191,46,.20);
      }
      .coupon-empty {
        padding: 16px;
        border: 1px dashed rgba(255,159,28,.28);
        border-radius: 16px;
        background: rgba(3,8,23,.54);
        color: #aebbd0;
      }
      @media (max-width: 980px) {
        .coupon-lab-strip { grid-template-columns: 1fr; }
        .coupon-lab-cell { border-right: 0; border-bottom: 1px solid rgba(255,255,255,.07); }
        .coupon-lab-cell:last-child { border-bottom: 0; }
      }
      @media (max-width: 720px) {
        .coupon-card { padding: 14px; }
        .coupon-leg-head { grid-template-columns: auto 1fr; }
        .coupon-pick-pill { grid-column: 1 / -1; justify-self: start; }
        .coupon-combo { grid-template-columns: 1fr; }
        .coupon-total-odd { text-align: left; }
        .coupon-metrics { grid-template-columns: 1fr; }
        .coupon-action { min-width: 0; width: 100%; }
      }
    `;
    document.head.appendChild(style);
  };

  const normalizeLegs = (item) => {
    if (Array.isArray(item?.legs) && item.legs.length) return item.legs;
    const { home, away } = splitMatch(pick(item, ["title", "match", "fixture"], "Maç analizi"));
    return [{
      number: 1,
      home,
      away,
      match: `${home} VS ${away}`,
      time: pick(item, ["time"], ""),
      selection: pick(item, ["selection", "option", "market", "prediction", "decision"], "-"),
      odds: pick(item, ["odds", "odd", "rate", "total_odds"], "-"),
      lab_probability: pick(item, ["lab_probability", "confidence", "confidence_score", "score"], "-"),
      trust_score: pick(item, ["trust_score", "confidence", "confidence_score"], "-"),
      risk: pick(item, ["risk", "risk_level"], "-"),
      tag: pick(item, ["tag"], "Değerli"),
      expected_scores: item.expected_scores || [],
      signals: item.pro_signals || item.signals || [],
    }];
  };

  const renderVsMatch = (home, away) => `
    <div class="coupon-match-row">
      <span class="team home">${esc(home)}</span>
      <span class="vs-badge">VS</span>
      <span class="team away">${esc(away)}</span>
    </div>
  `;

  const renderProbabilityBar = (value) => {
    const pct = cleanPercent(value);
    return `<span class="coupon-prob-bar"><i style="width:${pct}%"></i></span>`;
  };

  const trustNumber = (value) => {
    const text = String(value ?? "-");
    const number = text.match(/\d+/)?.[0];
    return number || "-";
  };

  const renderLeg = (leg, index) => {
    const matchParts = splitMatch(leg.match || `${leg.home || "Ev sahibi"} VS ${leg.away || "Deplasman"}`);
    const number = leg.number || index + 1;
    const selection = pick(leg, ["selection", "option", "market"], "-");
    const odds = pick(leg, ["odds", "odd", "rate"], "-");
    const probability = pick(leg, ["lab_probability", "confidence", "score"], "-");
    const trust = pick(leg, ["trust_score", "confidence"], "-");
    const tag = pick(leg, ["tag", "risk"], "Değerli");
    const time = pick(leg, ["time"], "");
    const tagClass = String(tag).toLowerCase().replaceAll(" ", "-");

    return `
      <section class="coupon-leg">
        <div class="coupon-leg-head">
          <span class="coupon-leg-no">${esc(number)}</span>
          <div class="coupon-match-block">
            ${renderVsMatch(matchParts.home, matchParts.away)}
            ${time ? `<span class="coupon-time">⏱ ${esc(time)}</span>` : ""}
          </div>
          <span class="coupon-pick-pill">${esc(selection)}</span>
        </div>
        <div class="coupon-lab-strip">
          <div class="coupon-lab-cell">
            <span>Seçenek</span>
            <strong>${esc(selection)}</strong>
            <em>${esc(odds)}</em>
          </div>
          <div class="coupon-lab-cell">
            <span>Laboratuvar Olasılık</span>
            <div class="coupon-prob-line"><strong>${esc(probability)}</strong>${renderProbabilityBar(probability)}</div>
          </div>
          <div class="coupon-lab-cell">
            <span>Güven</span>
            <div class="coupon-trust"><b class="coupon-trust-shield">${esc(trustNumber(trust))}</b><small>/100</small><i class="coupon-tag coupon-tag-${esc(tagClass)}">${esc(tag)}</i></div>
          </div>
        </div>
      </section>
    `;
  };

  const compactSignals = (item, legs) => {
    const raw = item.pro_signals || item.signals || item.evidence || item.layers || legs.flatMap((leg) => leg.signals || []);
    const list = Array.isArray(raw) ? raw : [raw].filter(Boolean);
    return list.length ? list.slice(0, 3) : ["Maç programı ve oran verisi üzerinden otomatik ön analiz üretildi.", "Seçenekler laboratuvar filtresinden geçirildi.", "Kesin sonuç garantisi vermez."];
  };

  const renderScores = (item, legs) => {
    const scores = item.expected_scores || legs.flatMap((leg) => leg.expected_scores || []);
    const unique = [...new Set(scores.filter(Boolean))].slice(0, 4);
    return unique.length ? unique.join(" / ") : "1-0 / 2-1";
  };

  const renderCoupon = (item, type, index) => {
    const legs = normalizeLegs(item);
    const choice = pick(item, ["selection", "option", "market", "prediction", "decision"], legs.map((leg) => pick(leg, ["selection", "option"], "-")).join(" + "));
    const confidence = pick(item, ["score", "confidence", "confidence_score"], "-");
    const risk = pick(item, ["risk", "risk_level"], "-");
    const odds = pick(item, ["total_odds", "odds", "odd", "rate"], "-");
    const signals = compactSignals(item, legs);
    const riskClass = String(risk).toLowerCase().includes("yük") ? "bad" : String(risk).toLowerCase().includes("orta") ? "warn" : "good";

    return `
      <article class="coupon-card">
        <div class="coupon-card-head">
          <span class="coupon-index">${String(index + 1).padStart(2, "0")}</span>
          <span class="coupon-badge">${esc(labelForType[type] || titleByType[type])}</span>
        </div>
        ${legs.map(renderLeg).join("")}
        <div class="coupon-combo">
          <div>
            <span class="coupon-combo-label">${type === "single" ? "Seçim" : "Kombinasyon"}</span>
            <strong>${esc(choice)}</strong>
          </div>
          <div class="coupon-total-odd"><span>Oran</span><strong>${esc(odds)}</strong></div>
        </div>
        <div class="coupon-metrics">
          <div class="coupon-metric"><span>Güven</span><strong class="good">${esc(confidence)}</strong></div>
          <div class="coupon-metric"><span>Risk</span><strong class="${riskClass}">${esc(risk)}</strong></div>
          <div class="coupon-metric"><span>Beklenen Skor</span><strong class="coupon-scores">${esc(renderScores(item, legs))}</strong></div>
        </div>
        <div class="coupon-analysis">
          <span class="coupon-analysis-title">Analiz</span>
          <ul>${signals.map((line) => `<li>${esc(line)}</li>`).join("")}</ul>
        </div>
        <button class="coupon-action" type="button">🎟 Kupona Ekle</button>
      </article>
    `;
  };

  const setBox = (selector, html) => {
    const box = document.querySelector(selector);
    if (box) box.innerHTML = html;
  };

  const apply = async () => {
    injectStyle();
    let data = { active_items: [] };
    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (res.ok) data = await res.json();
    } catch (error) {}

    const items = Array.isArray(data.active_items) ? data.active_items.filter(hasData) : [];
    const grouped = { single: [], double: [], triple: [] };
    items.forEach((item) => grouped[normalizeType(item.type)].push(item));

    setBox("[data-coupons-single]", grouped.single.length ? grouped.single.map((item, index) => renderCoupon(item, "single", index)).join("") : `<div class="coupon-empty">${emptyText.single}</div>`);
    setBox("[data-coupons-double]", grouped.double.length ? grouped.double.map((item, index) => renderCoupon(item, "double", index)).join("") : `<div class="coupon-empty">${emptyText.double}</div>`);
    setBox("[data-coupons-triple]", grouped.triple.length ? grouped.triple.map((item, index) => renderCoupon(item, "triple", index)).join("") : `<div class="coupon-empty">${emptyText.triple}</div>`);
  };

  window.addEventListener("load", () => {
    setTimeout(apply, 900);
    setTimeout(apply, 2200);
    setInterval(apply, 5 * 60 * 1000);
  });
})();
