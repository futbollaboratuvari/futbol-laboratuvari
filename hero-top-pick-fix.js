(() => {
  const DATA_URL = "./data/analiz_sonuclari.json";
  const STYLE_ID = "hero-top-pick-fix-style";

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const clean = (value, fallback = "-") => {
    const text = String(value ?? "").trim();
    return text && text !== "null" && text !== "undefined" ? text : fallback;
  };

  const numeric = (value) => {
    const number = Number(String(value ?? "").replace("%", "").replace(",", "."));
    return Number.isFinite(number) ? number : 0;
  };

  const normalizeSelection = (value) => {
    const text = clean(value, "-");
    return text
      .replace(/2\.5\s*Üst/gi, "2,5 Gol Üstü")
      .replace(/2\.5\s*Alt/gi, "2,5 Gol Altı")
      .replace(/KG\s*Var/gi, "Karşılıklı Gol Var")
      .replace(/KG\s*Yok/gi, "Karşılıklı Gol Yok");
  };

  const getScore = (item) => numeric(item?.confidence_score || item?.confidence || item?.score || item?.legs?.[0]?.confidence || item?.legs?.[0]?.lab_probability);
  const getOdds = (item) => numeric(item?.total_odds || item?.odds || item?.legs?.[0]?.odds);
  const getMatch = (item) => clean(item?.match || item?.fixture || item?.title || item?.legs?.[0]?.match, "Maç bilgisi bekleniyor");
  const getSelection = (item) => normalizeSelection(item?.selection || item?.option || item?.market || item?.prediction || item?.decision || item?.legs?.[0]?.selection);
  const getRisk = (item) => clean(item?.risk_level || item?.risk || item?.legs?.[0]?.risk, "Risk bekleniyor");

  const hasRealSignal = (item) => {
    if (!item || typeof item !== "object") return false;
    const selection = getSelection(item);
    const match = getMatch(item);
    const score = getScore(item);
    return selection !== "-" && match !== "Maç bilgisi bekleniyor" && score > 0;
  };

  const pickTopAnalysis = (items) =>
    [...items]
      .filter(hasRealSignal)
      .sort((a, b) => {
        const scoreDiff = getScore(b) - getScore(a);
        if (scoreDiff !== 0) return scoreDiff;
        return getOdds(b) - getOdds(a);
      })[0] || null;

  const injectStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .platform-summary .fl-top-pick-card {
        cursor: pointer;
      }

      .platform-summary .fl-top-pick-card span:first-child {
        color: #ffe08a;
        font-weight: 850;
      }

      .platform-summary #top-market.fl-top-pick {
        margin-top: 10px !important;
        color: #f8fbff !important;
        font-size: 16px !important;
        line-height: 1.28 !important;
      }

      .fl-top-pick .fl-top-match {
        display: block;
        color: #f8fbff;
        font-size: 15px;
        font-weight: 900;
        letter-spacing: 0;
      }

      .fl-top-pick .fl-top-selection {
        display: block;
        margin-top: 7px;
        color: #39ff88;
        font-size: clamp(22px, 2.4vw, 30px);
        font-weight: 1000;
        line-height: 1;
      }

      .fl-top-pick .fl-top-meta {
        display: block;
        margin-top: 7px;
        color: #aebbd0;
        font-size: 12px;
        font-weight: 750;
      }

      .platform-summary .fl-top-pick-card small {
        color: #c8ffdd;
      }
    `;
    document.head.appendChild(style);
  };

  const renderEmpty = () => {
    const top = document.querySelector("#top-market");
    if (!top) return;
    const card = top.closest("div");
    const label = card?.querySelector("span");
    const small = card?.querySelector("small");
    card?.classList.add("fl-top-pick-card");
    if (label) label.textContent = "Öne çıkan analiz";
    top.classList.add("fl-top-pick");
    top.innerHTML = `<span class="fl-top-match">PRO analiz bekleniyor</span><span class="fl-top-meta">Güncel veri gelince maç ve seçenek burada gösterilecek</span>`;
    if (small) small.textContent = "güncel veri bekleniyor";
  };

  const renderTop = (item) => {
    const top = document.querySelector("#top-market");
    if (!top) return;
    const card = top.closest("div");
    const label = card?.querySelector("span");
    const small = card?.querySelector("small");
    const score = getScore(item);
    const odds = clean(item?.total_odds || item?.odds || item?.legs?.[0]?.odds, "-");
    const risk = getRisk(item);

    card?.classList.add("fl-top-pick-card");
    card?.setAttribute("role", "button");
    card?.setAttribute("tabindex", "0");
    card?.setAttribute("title", "Kupon merkezindeki öne çıkan analize git");

    if (label) label.textContent = "Öne çıkan analiz";
    top.classList.add("fl-top-pick");
    top.innerHTML = `
      <span class="fl-top-match">${escapeHtml(getMatch(item))}</span>
      <span class="fl-top-selection">${escapeHtml(getSelection(item))}</span>
      <span class="fl-top-meta">Güven: ${escapeHtml(score ? `${score}/100` : "-")} · Risk: ${escapeHtml(risk)} · Oran: ${escapeHtml(odds)}</span>
    `;
    if (small) small.textContent = "kupon merkezinde incele";

    const goToCoupons = () => {
      const target = document.querySelector("#robot-analizleri");
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", "#robot-analizleri");
    };

    card?.addEventListener("click", goToCoupons, { once: false });
    card?.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        goToCoupons();
      }
    });
  };

  const run = async () => {
    injectStyle();
    try {
      const response = await fetch(DATA_URL, { cache: "no-store" });
      if (!response.ok) throw new Error(String(response.status));
      const payload = await response.json();
      const items = Array.isArray(payload?.active_items) ? payload.active_items : [];
      const top = pickTopAnalysis(items);
      if (top) renderTop(top);
      else renderEmpty();
    } catch {
      renderEmpty();
    }
  };

  window.addEventListener("load", () => {
    setTimeout(run, 500);
    setTimeout(run, 1600);
    setTimeout(run, 3300);
  });
})();
