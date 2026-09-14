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

  function meetsCouponCriteria(item) {
    const sixPlus = isSixPlusMarket(item);
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
      && !hasBlockingRisk(item);

    if (!baseCriteria) return false;
    if (!sixPlus) return true;

    // 6+ Gol doğal olarak daha düşük gerçekleşme olasılıklı, yüksek varyanslı bir
    // seçenektir. Kupona ancak doğrudan fiyat + bağımsız gol modeli + pozitif edge
    // birlikte varsa girebilir; yalnız oran üzerinden asla açılmaz.
    return odd !== null && odd >= 3
      && edge !== null && edge >= 2;
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
    return ((finite(item?.estimated_probability) || 0) * 100)
      + ((finite(item?.model_score ?? item?.analysis_score ?? item?.confidence_score) || 0) * 25)
      + ((finite(item?.data_completeness) || 0) * 15);
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
    isProReadyFallback,
    isSixPlusMarket,
    isWatchView,
    meetsCouponCriteria,
    rank,
    selectStrongestMatches,
    validMarket,
  };
}));
