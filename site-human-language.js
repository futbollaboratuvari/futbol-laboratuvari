(() => {
  const replacements = [
    ["Bugünün odağı", "Bugün İncelenen Maç"],
    ["Güven notu", "Değerlendirme Durumu"],
    ["Öne çıkan seçim", "Öne Çıkan Aday"],
    ["Günün seçimi hazırlanıyor", "Aday hazırlanıyor"],
    ["En güçlü seçenek güncel listeyle belirlenir", "Bugünkü listede dikkat çeken seçenek"],
    ["Net veri gelmeden sayı gösterilmez", "Değerler düşükse izleme olarak görünür"],
    ["Güncel liste oluşunca maç sayısı görünür", "Güncel maç listesinde yer alan karşılaşmalar"],
    ["Canlı Veri Görünümü", "Güncel Maç Merkezi"],
    ["Canlı Veri Panelleri", "Güncel Maç Panelleri"],
    ["Robot veri akışı", "Güncel maç değerlendirmeleri"],
    ["Robot çıktıları, ham veri havuzu ve tahmin geçmişi GitHub üzerinde üretilen JSON/Markdown dosyalarından okunur. Eski sabit demo veriler gösterilmez.", "Günün maçları, kupon listeleri ve geçmiş değerlendirmeler güncel kayıtlarla hazırlanır. Eski ve yanıltıcı bilgiler gösterilmez."],
    ["Robotun ürettiği dengeli, yüksek oranlı ve riskli laboratuvar kuponları JSON verisiyle listelenir.", "Günün öne çıkan dengeli, yüksek oranlı ve riskli kupon seçenekleri sade şekilde listelenir."],
    ["Robotun Gerekçesi:", "Değerlendirme Notu:"],
    ["Robot gerekçesi bekleniyor.", "Değerlendirme notu hazırlanıyor."],
    ["Robot açıklaması bekleniyor.", "Açıklama hazırlanıyor."],
    ["Robot her maçı ayrı ayrı analiz edip kupon kartı oluşturacak.", "Her maç ayrı ayrı değerlendirilip kupon kartı hazırlanacak."],
    ["Günün seçimi canlı robot verisi geldikten sonra üretilecek.", "Günün seçimi güncel maç listesi hazırlandığında gösterilecek."],
    ["Canlı veri bekleniyor.", "Güncel liste hazırlanıyor."],
    ["Canlı veri bekleniyor", "Güncel liste hazırlanıyor"],
    ["Canlı veri", "Güncel liste"],
    ["Aktif Veri Kaynağı", "Güncel Liste"],
    ["Ham Maç Havuzu", "Maç Listesi"],
    ["Ham Veri Havuzu", "Maç Listesi"],
    ["Tahmin Geçmişi", "Geçmiş Değerlendirmeler"],
    ["API / Veri Kaynağı Durumu", "Güncel Durum"],
    ["Veri İzleme", "Maç Takibi"],
    ["Kartlar robot raporundan üretilir. Veri yoksa sistem eski maç göstermeden canlı veri bekler.", "Kartlar güncel maç değerlendirmelerine göre hazırlanır. Güncel liste yoksa eski maç gösterilmez."],
    ["JSON", "güncel kayıt"],
    ["API", "kaynak"],
    ["robot", "analiz sistemi"],
    ["Robot", "Analiz sistemi"],
    ["engine", "sistem"],
    ["Engine", "Sistem"]
  ];

  const skipTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT"]);
  const couponSelectors = ["[data-coupons-single]", "[data-coupons-double]", "[data-coupons-triple]"];
  const waitingText = "Bugün için uygun kupon adayı hazırlanıyor.";
  let candidateLoading = false;
  let fallbackLoading = false;

  const injectLiveBlinkCss = () => {
    if (document.querySelector("#fl-live-text-style")) return;
    const style = document.createElement("style");
    style.id = "fl-live-text-style";
    style.textContent = "@keyframes flLiveTextBlink{0%,100%{opacity:1}50%{opacity:.35}}.daily-status-icon,.daily-live-label{animation:flLiveTextBlink 1s ease-in-out infinite;font-weight:800}";
    document.head.appendChild(style);
  };

  const normalizeLiveStatusText = () => {
    document.querySelectorAll(".daily-status-icon").forEach((node) => {
      if ((node.textContent || "").trim() === "🔴") node.textContent = "CANLI";
    });
  };

  const humanizeText = (text) => replacements.reduce((value, [from, to]) => value.split(from).join(to), text);

  const humanizeNode = (node) => {
    if (!node) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const next = humanizeText(node.nodeValue || "");
      if (next !== node.nodeValue) node.nodeValue = next;
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE || skipTags.has(node.tagName)) return;
    node.childNodes.forEach(humanizeNode);
  };

  const humanizeAttributes = () => {
    document.querySelectorAll("input[placeholder], button[aria-label], a[aria-label], section[aria-label]").forEach((el) => {
      ["placeholder", "aria-label", "title"].forEach((attr) => {
        if (!el.hasAttribute(attr)) return;
        const value = el.getAttribute(attr);
        const next = humanizeText(value);
        if (next !== value) el.setAttribute(attr, next);
      });
    });
  };

  const normalizeHeroStatus = () => {
    const status = document.querySelector("#avg-confidence");
    if (!status) return;
    const text = (status.textContent || "").trim();
    if (!text || text === "-" || /veri bekleniyor|hazırlanıyor/i.test(text)) {
      status.textContent = "Düşük / İzleme";
    }
  };

  const normalizeHeroCandidate = async () => {
    const target = document.querySelector("#top-market");
    if (!target || candidateLoading) return;
    const current = (target.textContent || "").trim();
    if (current && current !== "-" && !/hazırlanıyor|değerli market yok/i.test(current)) return;
    candidateLoading = true;
    try {
      const response = await fetch("./data/daily-coupons.json", { cache: "no-store" });
      if (!response.ok) throw new Error("not ready");
      const data = await response.json();
      const coupons = data.coupons || {};
      const lists = [coupons.laboratory_today, coupons.balanced, coupons.high_value, coupons.risk_lab];
      const leg = lists.flatMap((coupon) => Array.isArray(coupon?.selected_matches) ? coupon.selected_matches : [])
        .find((item) => item?.match_name && item?.recommended_market);
      target.textContent = leg ? `${leg.match_name} - ${leg.recommended_market}` : "Aday hazırlanıyor";
    } catch {
      target.textContent = "Aday hazırlanıyor";
    } finally {
      candidateLoading = false;
    }
  };

  const safe = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
  const readJson = async (url, fallback) => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      return res.ok ? await res.json() : fallback;
    } catch {
      return fallback;
    }
  };
  const num = (value) => Number(String(value || "").replace(",", ".").match(/\d+(\.\d+)?/)?.[0] || 0);
  const odd = (value) => { const n = num(value); return n > 1 ? n : 0; };
  const title = (item) => item.match_name || item.match || item.title || `${item.home || ""} VS ${item.away || ""}`.trim() || "Maç";
  const market = (item) => item.recommended_market || item.suggested_option || item.market || item.prediction || "-";
  const score = (item) => num(item.confidence_score || item.confidence || item.score || item.analysis_score);
  const bestOdd = (item) => {
    const direct = odd(item.estimated_odds || item.odds || item.suggested_odds);
    if (direct) return direct;
    const odds = item.available_odds || {};
    return Math.max(odd(odds.ms1), odd(odds.msx), odd(odds.ms2), odd(odds.over25), odd(odds.bttsYes));
  };
  const blocked = (item) => /değerli market yok|degerli market yok|güncel maç değil|guncel mac degil|filtered_old/i.test(`${market(item)} ${item.status || ""}`);
  const row = (label, value) => value === undefined || value === null || value === "" || value === "-" ? "" : `<div class="robot-row"><span>${safe(label)}</span><strong>${safe(value)}</strong></div>`;
  const oddsBox = (item) => {
    const odds = item.available_odds || {};
    const guess = item.raw_market_guess_odds || {};
    const html = [row("MS 1", odds.ms1), row("MS X", odds.msx), row("MS 2", odds.ms2), row("KG Var", odds.bttsYes || guess.bttsYes_guess), row("2.5 Üst", odds.over25 || guess.over25_guess), row("2.5 Alt", odds.under25 || guess.under25_guess)].filter(Boolean).join("");
    return html ? `<div class="robot-detail-box"><h4>Oranlar</h4>${html}</div>` : "";
  };
  const fallbackCard = (name, legs, note) => {
    if (!legs.length) return `<article class="robot-live-card"><p class="robot-note">${safe(waitingText)}</p></article>`;
    const total = legs.reduce((acc, item) => acc * (bestOdd(item) || 1), 1).toFixed(2);
    const avg = Math.round(legs.reduce((acc, item) => acc + score(item), 0) / legs.length);
    return `<article class="robot-live-card"><span class="robot-pill">${safe(name)}</span><h3>${safe(name)}</h3><div class="robot-row"><span>Toplam Oran</span><strong>${safe(total)}</strong></div><div class="robot-row"><span>Güven Skoru</span><strong>${safe(avg + "%")}</strong></div><div class="robot-row"><span>Risk Seviyesi</span><strong>${safe(name.includes("Riskli") ? "Yüksek" : "Orta-Yüksek")}</strong></div><p class="robot-note">${safe(note)}</p>${legs.map((item) => `<div class="robot-row"><span>${safe(title(item))}</span><strong>${safe(market(item))} / ${safe(bestOdd(item) ? bestOdd(item).toFixed(2) : "-")}</strong></div>${oddsBox(item)}<p class="robot-note">${safe(item.robot_reason || item.robot_comment || item.commentary || "İzleme adayı; son karar kullanıcıya aittir.")}</p>`).join("")}</article>`;
  };

  const renderCouponFallback = async () => {
    if (fallbackLoading) return;
    fallbackLoading = true;
    try {
      const [live, history, daily] = await Promise.all([
        readJson("./data/live-matches.json", { matches: [], active_items: [], counts: {} }),
        readJson("./data/analiz_sonuclari.json", { active_items: [] }),
        readJson("./data/daily-coupons.json", { coupons: {} })
      ]);
      const hasOfficial = Object.values(daily.coupons || {}).some((item) => item?.is_available);
      const items = [...(live.matches || []), ...(live.active_items || []), ...(history.active_items || [])];
      const candidates = items.filter((item) => item && !blocked(item) && score(item) >= 40).sort((a, b) => score(b) - score(a) || bestOdd(b) - bestOdd(a));
      document.querySelectorAll("[data-match-count]").forEach((node) => { node.textContent = String(live.counts?.current_window || items.length || 0); });
      document.querySelectorAll("[data-prediction-count]").forEach((node) => { node.textContent = String(live.counts?.coupon_candidates || live.counts?.watch_candidates || candidates.length || 0); });
      document.querySelectorAll("[data-active-source]").forEach((node) => { node.textContent = live.source || history.source || daily.source || "Güncel maç akışı"; });
      document.querySelectorAll("[data-load-status]").forEach((node) => { node.textContent = items.length ? "Güncel maç akışı aktif" : "Liste hazırlanıyor"; });
      if (hasOfficial) return;
      const high = candidates.filter((item) => bestOdd(item) >= 2.2);
      const risk = candidates.filter((item) => /kg|üst|ilk yarı|ikinci yarı|3\.5/i.test(market(item)) || bestOdd(item) >= 2.5);
      const fill = (selector, html) => document.querySelectorAll(selector).forEach((node) => { node.innerHTML = html; });
      fill("[data-coupons-single]", fallbackCard("Dengeli İzleme Listesi", candidates.slice(0, 3), "Kesin kupon değil; analiz sisteminin izleme eşiğini geçen maçlar."));
      fill("[data-coupons-double]", fallbackCard("Yüksek Oran İzleme Listesi", (high.length ? high : candidates).slice(0, 4), "Oranı öne çıkan ama henüz kesin kupon seviyesine çıkmayan adaylar."));
      fill("[data-coupons-triple]", fallbackCard("Riskli Laboratuvar İzleme Listesi", (risk.length ? risk : candidates).slice(0, 3), "Yüksek oranlı ve riskli izleme adayları; son karar kullanıcıya aittir."));
    } finally {
      fallbackLoading = false;
    }
  };

  const injectPremiumMatchListCss = () => {
    if (document.getElementById("premium-match-list-polish-style")) return;
    const style = document.createElement("style");
    style.id = "premium-match-list-polish-style";
    style.textContent = `
      #premium-analysis-panel .pa-select[data-pa-match]{position:absolute!important;left:-9999px!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important}
      .pa-match-list-pro{display:grid;gap:8px;max-height:330px;overflow:auto;padding:8px;border:1px solid rgba(255,159,28,.22);border-radius:16px;background:rgba(2,8,23,.72)}
      .pa-match-row-pro{width:100%;display:grid;grid-template-columns:76px minmax(0,1fr) 118px;gap:9px;align-items:center;text-align:left;padding:10px;border:1px solid rgba(255,255,255,.10);border-radius:14px;background:rgba(255,255,255,.045);color:#d7e4f5;cursor:pointer}
      .pa-match-row-pro:hover{border-color:rgba(255,159,28,.40);background:rgba(255,159,28,.08)}.pa-match-row-pro.selected{border-color:rgba(57,255,136,.62);background:rgba(57,255,136,.13)}
      .pa-match-time-pro{font-weight:950;color:#ffe08a}.pa-match-main-pro{display:grid;gap:4px;min-width:0}.pa-match-league-pro{font-size:11px;color:#8fa0b5;font-weight:850}.pa-match-teams-pro{font-size:13px;color:#f8fbff;font-weight:950;white-space:normal;line-height:1.25}.pa-match-side-pro{display:grid;gap:4px;justify-items:end}.pa-match-market-pro,.pa-match-score-pro{font-size:11px;font-weight:900;border-radius:999px;padding:4px 7px;background:rgba(0,0,0,.22);color:#c8ffdd}.pa-match-score-pro{color:#fff7d6}
      @media(max-width:680px){.pa-match-row-pro{grid-template-columns:1fr}.pa-match-side-pro{justify-items:start;grid-template-columns:auto auto}.pa-match-time-pro{font-size:12px}}
    `;
    document.head.appendChild(style);
  };

  const parsePremiumOption = (text) => {
    const parts = String(text || "").split("|");
    const left = parts[0] || "";
    const right = parts.slice(1).join("|") || "";
    const leftParts = left.split("—");
    const league = (leftParts[0] || "Lig").trim();
    const time = (leftParts[1] || "--:--").trim();
    const detail = right.split("·").map((item) => item.trim()).filter(Boolean);
    return {
      league,
      time,
      teams: detail[0] || right.trim() || "Maç hazırlanıyor",
      market: detail[1] || "Analiz sistemi önerisi",
      score: detail[2] || "-"
    };
  };

  const polishPremiumMatchList = () => {
    injectPremiumMatchListCss();
    document.querySelectorAll("#premium-analysis-panel select[data-pa-match]").forEach((select) => {
      const label = select.closest("label");
      if (!label) return;
      let box = label.querySelector(".pa-match-list-pro");
      if (!box) {
        box = document.createElement("div");
        box.className = "pa-match-list-pro";
        select.insertAdjacentElement("afterend", box);
      }
      const options = Array.from(select.options || []).filter((option) => option.value !== "");
      const signature = options.map((option) => `${option.value}:${option.textContent}:${option.selected}`).join("||");
      if (box.dataset.signature === signature) return;
      box.dataset.signature = signature;
      box.innerHTML = options.length
        ? options.map((option) => {
          const data = parsePremiumOption(option.textContent);
          return `<button type="button" class="pa-match-row-pro${option.selected ? " selected" : ""}" data-pa-pro-value="${safe(option.value)}"><span class="pa-match-time-pro">${safe(data.time)}</span><span class="pa-match-main-pro"><span class="pa-match-league-pro">${safe(data.league)}</span><span class="pa-match-teams-pro">${safe(data.teams)}</span></span><span class="pa-match-side-pro"><span class="pa-match-market-pro">${safe(data.market)}</span><span class="pa-match-score-pro">${safe(data.score)}</span></span></button>`;
        }).join("")
        : `<div class="pa-filter-note">Filtreye uygun maç bulunamadı</div>`;
      box.querySelectorAll("[data-pa-pro-value]").forEach((button) => {
        button.addEventListener("click", () => {
          const option = Array.from(select.options || []).find((item) => item.value === button.dataset.paProValue);
          if (!option) return;
          option.selected = !option.selected;
          select.dispatchEvent(new Event("change", { bubbles: true }));
          polishPremiumMatchList();
        });
      });
    });
  };

  const isWaitingCard = (card) => /güncel veri henüz oluşmadı|uygun kupon adayı hazırlanıyor|güncel liste hazırlanıyor/i.test(card.textContent || "");
  const isRealCouponCard = (card) => /(Toplam Oran|Güven Skoru|Risk Seviyesi)/i.test(card.textContent || "") && !isWaitingCard(card);

  const cleanupCouponCards = () => {
    couponSelectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((container) => {
        const cards = Array.from(container.querySelectorAll(".robot-live-card"));
        if (!cards.length) return;
        const realCards = cards.filter(isRealCouponCard);
        if (realCards.length) {
          const html = realCards.map((card) => card.outerHTML).join("");
          if (container.innerHTML !== html) container.innerHTML = html;
          return;
        }
        if (cards.length > 1 || isWaitingCard(cards[0])) {
          const html = `<article class="robot-live-card"><p class="robot-note">${waitingText}</p></article>`;
          if (container.innerHTML !== html) container.innerHTML = html;
        }
      });
    });
  };

  const run = () => {
    injectLiveBlinkCss();
    humanizeNode(document.body);
    humanizeAttributes();
    normalizeHeroStatus();
    normalizeHeroCandidate();
    normalizeLiveStatusText();
    polishPremiumMatchList();
    renderCouponFallback().then(cleanupCouponCards);
  };

  run();
  document.addEventListener("DOMContentLoaded", run, { once: true });
  window.addEventListener("load", () => {
    run();
    setTimeout(run, 300);
    setTimeout(run, 1000);
    setTimeout(run, 2500);
  }, { once: true });

  if (window.MutationObserver) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach(humanizeNode);
        if (mutation.type === "characterData") humanizeNode(mutation.target);
      });
      injectLiveBlinkCss();
      humanizeAttributes();
      normalizeHeroStatus();
      normalizeHeroCandidate();
      normalizeLiveStatusText();
      polishPremiumMatchList();
      renderCouponFallback().then(cleanupCouponCards);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  }
})();
