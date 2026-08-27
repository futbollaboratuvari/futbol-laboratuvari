(function attachCouponEligibility(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.FLCouponEligibility = api;
}(typeof globalThis !== "undefined" ? globalThis : this, () => {
  const INVALID_MARKET = /degerli market yok|oynama|secim yok|pas gec|gorus olusmadi/;

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

  function validMarket(item) {
    const market = clean(item?.recommended_market || item?.market || item?.selection);
    return Boolean(market) && !INVALID_MARKET.test(market);
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
    return Boolean(item?.independent_evidence)
      && finite(item?.model_score ?? item?.analysis_score ?? item?.confidence_score) >= 65
      && finite(item?.data_completeness) >= 45
      && finite(item?.estimated_probability) >= 42
      && validMarket(item)
      && !hasBlockingRisk(item);
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
    clean,
    finite,
    hasBlockingRisk,
    isCouponEligible,
    isProReadyFallback,
    isWatchView,
    meetsCouponCriteria,
    rank,
    selectStrongestMatches,
    validMarket,
  };
}));

