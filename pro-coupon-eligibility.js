(function attachCouponEligibility(root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.FLCouponEligibility = api;
}(typeof globalThis !== "undefined" ? globalThis : this, () => {
  const INVALID_MARKET = /degerli market yok|oynama|secim yok|pas gec|gorus olusmadi/;
  const MIN_COUPON_ODD = 1.45;
  const EDGE_CONSISTENCY_TOLERANCE = 1.5;

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

  function isGoalBridgeGenerated(item) {
    return Boolean(item?.goal_market_bridge)
      || /^pro-goal-market-bridge-v\d+/i.test(String(item?.model_version || item?.goal_market_bridge_version || ""));
  }

  function hasAcceptableOdd(item) {
    const odd = finite(item?.estimated_odds ?? item?.odds ?? item?.odd);
    return odd !== null && odd >= MIN_COUPON_ODD;
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
    if (odd < 1.60) return { min_edge: 6, min_ev: 1.04, min_model_score: 70, band: "1.45-1.59" };
    if (odd < 1.90) return { min_edge: 4, min_ev: 1.03, min_model_score: 67, band: "1.60-1.89" };
    if (odd < 2.50) return { min_edge: 3, min_ev: 1.03, min_model_score: 65, band: "1.90-2.49" };
    if (odd < 3.50) return { min_edge: 4, min_ev: 1.04, min_model_score: 65, band: "2.50-3.49" };
    return { min_edge: 5, min_ev: 1.06, min_model_score: 68, band: "3.50+" };
  }

  function valueQuality(item) {
    const odd = finite(item?.estimated_odds ?? item?.odds ?? item?.odd);
    const probability = finite(item?.estimated_probability);
    const marketProbability = finite(item?.market_probability);
    const providedEdge = finite(item?.edge_percent);
    const modelScore = finite(item?.model_score ?? item?.analysis_score ?? item?.confidence_score);

    if (odd === null) {
      return { pass: false, band: "no_price", odd: null, reason: "Doğrulanmış oran yok; kupon için değer ölçülemedi." };
    }
    if (odd < MIN_COUPON_ODD) {
      return { pass: false, band: "below_floor", odd, reason: `Oran ${odd.toFixed(2)} minimum ${MIN_COUPON_ODD.toFixed(2)} eşiğinin altında.` };
    }
    if (probability === null || marketProbability === null) {
      return {
        pass: false,
        band: valueThresholdForOdd(odd).band,
        odd,
        estimated_probability: probability,
        market_probability: marketProbability,
        reason: "Model ve piyasa olasılığı birlikte doğrulanamadı; kupon değeri hesaplanmadı.",
      };
    }

    const threshold = valueThresholdForOdd(odd);
    const derivedEdge = probability - marketProbability;
    const edgeConsistencyGap = providedEdge === null ? 0 : Math.abs(providedEdge - derivedEdge);
    const goalBridgeGenerated = isGoalBridgeGenerated(item);
    const normalizeGoalBridgeEdge = goalBridgeGenerated
      && providedEdge !== null
      && edgeConsistencyGap > EDGE_CONSISTENCY_TOLERANCE;

    // Goal bridge v2 daha önce edge_percent alanında bağımsız gol modelinin
    // piyasa farkını taşıyordu; estimated_probability ise piyasa ile harmanlı
    // nihai olasılıktır. Value/EV hesabında tek kanonik edge, kullanıcıya
    // gösterilen nihai olasılık - piyasa olasılığıdır. Eski bridge adayını
    // burada normalize ederek hem çıktı hem kupon kararı aynı semantiği kullanır.
    if (normalizeGoalBridgeEdge && item && typeof item === "object") {
      item.edge_percent = Number(derivedEdge.toFixed(1));
      item.value_label = derivedEdge >= 7 ? "Yüksek Değer" : derivedEdge >= 3 ? "Değerli" : "Piyasa ile Uyumlu";
    }

    const canonicalProvidedEdge = normalizeGoalBridgeEdge ? derivedEdge : providedEdge;
    const effectiveEdge = canonicalProvidedEdge === null ? derivedEdge : Math.min(canonicalProvidedEdge, derivedEdge);
    const expectedValue = (probability / 100) * odd;

    if (!goalBridgeGenerated && providedEdge !== null && edgeConsistencyGap > EDGE_CONSISTENCY_TOLERANCE) {
      return {
        pass: false,
        band: threshold.band,
        odd,
        estimated_probability: probability,
        market_probability: marketProbability,
        provided_edge: Number(providedEdge.toFixed(2)),
        derived_edge: Number(derivedEdge.toFixed(2)),
        edge_consistency_gap: Number(edgeConsistencyGap.toFixed(2)),
        expected_value: Number(expectedValue.toFixed(4)),
        min_edge: threshold.min_edge,
        min_ev: threshold.min_ev,
        min_model_score: threshold.min_model_score,
        edge_normalized: false,
        reason: `Edge tutarsız: kayıt ${providedEdge.toFixed(1)}, olasılıklardan türeyen ${derivedEdge.toFixed(1)} puan.`,
      };
    }

    const scorePass = modelScore !== null && modelScore >= threshold.min_model_score;
    const edgePass = effectiveEdge >= threshold.min_edge;
    const evPass = expectedValue >= threshold.min_ev;
    const pass = scorePass && edgePass && evPass;
    const reasons = [];
    if (!scorePass) reasons.push(`model gücü ${Math.round(modelScore || 0)} < ${threshold.min_model_score}`);
    if (!edgePass) reasons.push(`edge ${effectiveEdge.toFixed(1)} < ${threshold.min_edge.toFixed(1)}`);
    if (!evPass) reasons.push(`beklenen değer ${expectedValue.toFixed(3)} < ${threshold.min_ev.toFixed(2)}`);

    return {
      pass,
      band: threshold.band,
      odd,
      estimated_probability: Number(probability.toFixed(2)),
      market_probability: Number(marketProbability.toFixed(2)),
      provided_edge: providedEdge === null ? null : Number(providedEdge.toFixed(2)),
      derived_edge: Number(derivedEdge.toFixed(2)),
      effective_edge: Number(effectiveEdge.toFixed(2)),
      edge_consistency_gap: Number(edgeConsistencyGap.toFixed(2)),
      edge_normalized: normalizeGoalBridgeEdge,
      expected_value: Number(expectedValue.toFixed(4)),
      min_edge: threshold.min_edge,
      min_ev: threshold.min_ev,
      min_model_score: threshold.min_model_score,
      reason: pass
        ? `${normalizeGoalBridgeEdge ? "Goal bridge edge nihai olasılığa normalize edildi. " : ""}Değer kapısı geçti: ${threshold.band} bandı, edge ${effectiveEdge.toFixed(1)}, EV ${expectedValue.toFixed(3)}.`
        : `${normalizeGoalBridgeEdge ? "Goal bridge edge nihai olasılığa normalize edildi. " : ""}Değer kapısı reddetti: ${reasons.join("; ")}.`,
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

    // valueQuality goal-bridge adaylarında edge'i bu noktadan önce kanonik
    // nihai olasılık farkına normalize eder. Yüksek gol güvenlik ağı da aynı
    // normalize edilmiş alanı okuyarak iki farklı edge semantiğini karıştırmaz.
    const edge = finite(item?.edge_percent);
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
    const valueBoost = quality.pass
      ? Math.max(0, Number(quality.effective_edge || 0) * 12)
        + Math.max(0, (Number(quality.expected_value || 1) - 1) * 1000)
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
    EDGE_CONSISTENCY_TOLERANCE,
    MIN_COUPON_ODD,
    clean,
    finite,
    hasAcceptableOdd,
    hasBlockingRisk,
    isCouponEligible,
    isGoalBridgeGenerated,
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
