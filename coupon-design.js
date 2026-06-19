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

  const hasData = (item) => {
    const choice = pick(item, ["selection", "option", "market", "prediction", "decision"], "");
    const score = pick(item, ["score", "confidence", "confidence_score"], "");
    const signals = item?.pro_signals || item?.signals || item?.evidence || item?.layers;
    return Boolean(choice && score && signals);
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

  const injectStyle = () => {
    if (document.getElementById("coupon-design-style")) return;
    const style = document.createElement("style");
    style.id = "coupon-design-style";
    style.textContent = `
      .coupon-card {
        position: relative;
        overflow: hidden;
        display: grid;
        gap: 14px;
        padding: 16px;
        border: 1px solid rgba(255,159,28,.24);
        border-radius: 18px;
        background:
          linear-gradient(135deg, rgba(255,159,28,.10), transparent 34%),
          linear-gradient(180deg, rgba(8,23,48,.94), rgba(3,8,23,.96));
        box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 20px 48px rgba(0,0,0,.30);
      }
      .coupon-card::before {
        content: "";
        position: absolute;
        inset: 0 0 auto;
        height: 3px;
        background: linear-gradient(90deg, #39ff88, #ff9f1c, transparent);
      }
      .coupon-card-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }
      .coupon-card h4 {
        margin: 0;
        color: #fff7d6;
        font-size: 16px;
        line-height: 1.25;
      }
      .coupon-badge {
        flex: 0 0 auto;
        padding: 7px 10px;
        border-radius: 999px;
        border: 1px solid rgba(57,255,136,.32);
        background: rgba(57,255,136,.12);
        color: #c8ffdd;
        font-size: 11px;
        font-weight: 900;
        white-space: nowrap;
      }
      .coupon-choice {
        display: grid;
        gap: 5px;
        padding: 12px;
        border: 1px solid rgba(255,159,28,.18);
        border-radius: 14px;
        background: rgba(255,255,255,.045);
      }
      .coupon-choice span,
      .coupon-metric span {
        color: #aebbd0;
        font-size: 11px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: .05em;
      }
      .coupon-choice strong {
        color: #ffe08a;
        font-size: 17px;
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
      .coupon-note {
        margin: 0;
        color: #c7d5e8;
        font-size: 13px;
        line-height: 1.55;
      }
      .coupon-empty {
        padding: 16px;
        border: 1px dashed rgba(255,159,28,.28);
        border-radius: 16px;
        background: rgba(3,8,23,.54);
        color: #aebbd0;
      }
      @media (max-width: 720px) {
        .coupon-metrics { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  };

  const renderCoupon = (item, type) => {
    const match = pick(item, ["title", "match", "fixture"], "Maç analizi");
    const choice = pick(item, ["selection", "option", "market", "prediction", "decision"], "-");
    const confidence = pick(item, ["score", "confidence", "confidence_score"], "-");
    const risk = pick(item, ["risk", "risk_level"], "-");
    const odds = pick(item, ["odds", "odd", "rate"], "-");
    const note = pick(item, ["commentary", "comment", "analysis_note", "note"], "Analiz notu hazırlanıyor.");

    return `
      <article class="coupon-card">
        <div class="coupon-card-head">
          <h4>${esc(match)}</h4>
          <span class="coupon-badge">${esc(titleByType[type])}</span>
        </div>
        <div class="coupon-choice"><span>Seçim</span><strong>${esc(choice)}</strong></div>
        <div class="coupon-metrics">
          <div class="coupon-metric"><span>Güven</span><strong>${esc(confidence)}</strong></div>
          <div class="coupon-metric"><span>Risk</span><strong>${esc(risk)}</strong></div>
          <div class="coupon-metric"><span>Oran</span><strong>${esc(odds)}</strong></div>
        </div>
        <p class="coupon-note">${esc(note)}</p>
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

    setBox("[data-coupons-single]", grouped.single.length ? grouped.single.map((item) => renderCoupon(item, "single")).join("") : `<div class="coupon-empty">${emptyText.single}</div>`);
    setBox("[data-coupons-double]", grouped.double.length ? grouped.double.map((item) => renderCoupon(item, "double")).join("") : `<div class="coupon-empty">${emptyText.double}</div>`);
    setBox("[data-coupons-triple]", grouped.triple.length ? grouped.triple.map((item) => renderCoupon(item, "triple")).join("") : `<div class="coupon-empty">${emptyText.triple}</div>`);
  };

  window.addEventListener("load", () => {
    setTimeout(apply, 900);
    setTimeout(apply, 2200);
    setInterval(apply, 5 * 60 * 1000);
  });
})();
