(function attachCouponEligibility(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.FLCouponEligibility = api;
}(typeof globalThis !== "undefined" ? globalThis : this, () => {
  const INVALID_MARKET = /degerli market yok|oynama|secim yok|pas gec|gorus olusmadi/;
  const MIN_COUPON_ODD = 1.45;

  function finite(value) {
    if (value === undefined || value === null || value === "" || value === "-") return null;
    const number = Number(String(value).replace("%", "").replace(",", "."));
    return Number.isFinite(number) ? number : null;
  }

  function clean(value) {
    return String(value || "")
      .toLocaleLowerCase("tr-TR").replace(/ı/g, "i").normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  }

  function marketText(item) {
    return clean(item?.recommended_market || item?.market || item?.selection);
  }

  function validMarket(item) {
    const market = marketText(item);
    return Boolean(market) && !INVALID_MARKET.test(market);
  }

  function isSixPlusMarket(item) {
    const market = marketText(item);
    return /(^| )6 gol( |$)|6 plus|6 ve ustu|6 veya daha fazla|over 5 5|5 5 ust/.test(market);
  }

  function isHighGoalMarket(item) {
    const market = marketText(item);
    return isSixPlusMarket(item) || /3 5 ust|over 3 5/.test(market);
  }

  function hasAcceptableOdd(item) {
    const odd = finite(item?.estimated_odds ?? item?.odds ?? item?.odd);
    return odd === null || odd >= MIN_COUPON_ODD;
  }

  function hasBlockingRisk(item) {
    const risks = clean([
      item?.risk_level,
      item?.risk,
      item?.data_gap_risk,
      item?.squad_risk_level,
      item?.lineup_risk_level,
    ].filter(Boolean).join(" "));
    return /yuksek|high/.test(risks);
  }

  function valueThresholdForOdd(odd) {
    if (odd < 1.60) return { min_edge: 4, min_ev: 1.05, min_model_score: 72, band: "short" };
    if (odd < 2.00) return { min_edge: 2, min_ev: 1.03, min_model_score: 65, band: "medium" };
    if (odd < 3.00) return { min_edge: 1, min_ev: 1.02, min_model_score: 65, band: "value" };
    return { min_edge: 0.5, min_ev: 1.01, min_model_score: 65, band: "high" };
  }

  function valueQuality(item) {
    const odd = finite(item?.estimated_odds ?? item?.odds ?? item?.odd);
    const probability = finite(item?.estimated_probability);
    const marketProbability = finite(item?.market_probability);
    const providedEdge = finite(item?.edge_percent);
    const edge = providedEdge !== null
      ? providedEdge
      : probability !== null && marketProbability !== null ? probability - marketProbability : null;
    const modelScore = finite(item?.model_score ?? item?.analysis_score ?? item?.confidence_score);

    // Eski/yardımcı görünümlerde fiyat alanı taşınmıyorsa mevcut davranışı bozma.
    // Gerçek kupon akışında fiyat bulunduğunda aşağıdaki değer kapısı devreye girer.
    if (odd === null) {
      return {
        applicable: false,
        pass: true,
        band: "no_price_legacy",
        odd: null,
        edge,
        expected_value: null,
        reason: "Gerçek oran alanı yok; mevcut kupon davranışı korundu.",
      };
    }

    const expectedValue = probability !== null ? (probability / 100) * odd : null;
    const threshold = valueThresholdForOdd(odd);
    let pass = odd >= MIN_COUPON_ODD && modelScore !== null && modelScore >= threshold.min_model_score;
    let reason = "";

    if (!pass) {
      reason = odd < MIN_COUPON_ODD
        ? `Oran ${odd.toFixed(2)} minimum ${MIN_COUPON_ODD.toFixed(2)} eşiğinin altında.`
        : `Model gücü ${Math.round(modelScore || 0)}; ${threshold.band} oran bandı için minimum ${threshold.min_model_score}.`;
    } else if (edge !== null) {
      pass = edge >= threshold.min_edge;
      reason = pass
        ? `Edge ${edge.toFixed(1)} puan; ${threshold.band} oran bandı için minimum ${threshold.min_edge.toFixed(1)} puanı karşılıyor.`
        : `Edge ${edge.toFixed(1)} puan; ${threshold.band} oran bandı için gereken ${threshold.min_edge.toFixed(1)} puanın altında.`;
    } else if (expectedValue !== null) {
      pass = expectedValue >= threshold.min_ev;
      reason = pass
        ? `Beklenen değer ${expectedValue.toFixed(3)}; minimum ${threshold.min_ev.toFixed(2)} eşiğini karşılıyor.`
        : `Beklenen değer ${expectedValue.toFixed(3)}; minimum ${threshold.min_ev.toFixed(2)} eşiğinin altında.`;
    } else {
      pass = false;
      reason = "Gerçek oran var fakat edge veya model olasılığıyla değer doğrulaması yapılamadı.";
    }

    return {
      applicable: true,
      pass,
      band: threshold.band,
      odd,
      edge: edge === null ? null : Number(edge.toFixed(2)),
      expected_value: expectedValue === null ? null : Number(expectedValue.toFixed(4)),
      min_edge: threshold.min_edge,
      min_ev: threshold.min_ev,
      min_model_score: threshold.min_model_score,
      reason,
    };
  }

  function passesValueQuality(item) {
    return valueQuality(item).pass;
  }

  function meetsCouponCriteria(item) {
    const sixPlus = isSixPlusMarket(item);
    const highGoal = isHighGoalMarket(item);
    const modelScore = finite(item?.model_score ?? item?.analysis_score ?? item?.confidence_score);
    const completeness = finite(item?.data_completeness);
    const probability = finite(item?.estimated_probability);
    const edge = finite(item?.edge_percent);
    const odd = finite(item?.estimated_odds ?? item?.odds ?? item?.odd);

    const baseCriteria = Boolean(item?.independent_evidence)
      && modelScore >= (sixPlus ? 68 : 65)
      && completeness >= (sixPlus ? 55 : 45)
      && probability >= (sixPlus ? 15 : 42)
      && validMarket(item)
      && hasAcceptableOdd(item)
      && !hasBlockingRisk(item)
      && passesValueQuality(item);

    if (!baseCriteria) return false;

    // 3.5 Üst ve 6+ Gol seçenekleri sırf market mevcut diye kupona giremez.
    // Bağımsız model, piyasanın marjı temizlenmiş olasılığından en az 2 puan
    // daha yüksek olmalı. Böylece negatif edge yüksek-gol seçimleri elenir.
    if (highGoal && (edge === null || edge < 2)) return false;

    if (!sixPlus) return true;

    // 6+ Gol daha düşük gerçekleşme olasılıklı ve yüksek varyanslı olduğu için
    // ayrıca doğrudan fiyat eşiği uygulanır; tahmini oran üretilmez.
    return odd !== null && odd >= 3;
  }

  function isCouponEligible(item) {
    return Boolean(item?.include_in_coupon) && meetsCouponCriteria(item);
  }

  function isProReadyFallback(item) {
    return !isCouponEligible(item)
      && Boolean(item?.independent_evidence)
      && finite(item?.model_score ?? item?.analysis_score ?? item?.confidence_score) >= 60
      && finite(item?.data_completeness) >= 35
      && validMarket(item)
      && hasAcceptableOdd(item)
      && !hasBlockingRisk(item);
  }

  function isWatchView(item) {
    return validMarket(item)
      && finite(item?.model_score ?? item?.analysis_score ?? item?.confidence_score) !== null
      && finite(item?.data_completeness) !== null;
  }

  function rank(item) {
    const quality = valueQuality(item);
    const valueBoost = quality.applicable && quality.pass
      ? Math.max(0, (quality.edge || 0) * 12) + Math.max(0, ((quality.expected_value || 1) - 1) * 1000)
      : 0;
    return ((finite(item?.estimated_probability) || 0) * 100)
      + ((finite(item?.model_score ?? item?.analysis_score ?? item?.confidence_score) || 0) * 25)
      + ((finite(item?.data_completeness) || 0) * 15)
      + valueBoost;
  }

  function selectStrongestMatches(matches, limit = 6) {
    const rows = Array.isArray(matches) ? matches : [];
    const selected = new Set();
    const take = (predicate, insightTier) => rows
      .filter((item) => !selected.has(item) && predicate(item))
      .sort((a, b) => rank(b) - rank(a))
      .map((item) => {
        selected.add(item);
        return { ...item, insight_tier: insightTier };
      });

    return [
      ...take(isCouponEligible, "coupon"),
      ...take(isProReadyFallback, "pro_ready"),
      ...take(isWatchView, "watch"),
    ].slice(0, Math.max(0, Number(limit) || 0));
  }

  return {
    MIN_COUPON_ODD,
    clean,
    finite,
    hasAcceptableOdd,
    hasBlockingRisk,
    isCouponEligible,
    isHighGoalMarket,
    isProReadyFallback,
    isSixPlusMarket,
    isWatchView,
    meetsCouponCriteria,
    passesValueQuality,
    rank,
    selectStrongestMatches,
    validMarket,
    valueQuality,
    valueThresholdForOdd,
  };
}));
