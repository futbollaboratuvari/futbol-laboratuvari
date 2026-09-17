"use strict";

const VERSION = "market-specialist-gates-v2";

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function finite(value) {
  if (value === undefined || value === null || value === "" || value === "-") return null;
  const number = Number(String(value).replace("%", "").replace(",", "."));
  return Number.isFinite(number) ? number : null;
}

function clean(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9+/.]+/g, " ")
    .trim();
}

function classFor(score) {
  if (score >= 80) return "Ana kupon adayı";
  if (score >= 65) return "Orta risk kupon adayı";
  if (score >= 50) return "Sadece izleme";
  return "Oynama";
}

function canonicalMarket(value) {
  const text = clean(value);
  if (/^(kg var|btts yes)/.test(text)) return "KG Var";
  if (/^(kg yok|btts no)/.test(text)) return "KG Yok";
  if (/ilk yari.*kg var|1y.*kg var|first half.*btts yes/.test(text)) return "İlk Yarı KG Var";
  if (/ilk yari.*kg yok|1y.*kg yok|first half.*btts no/.test(text)) return "İlk Yarı KG Yok";
  if (/ikinci yari.*kg var|2y.*kg var|second half.*btts yes/.test(text)) return "İkinci Yarı KG Var";
  if (/ikinci yari.*kg yok|2y.*kg yok|second half.*btts no/.test(text)) return "İkinci Yarı KG Yok";
  if (/3[,.]?5.*ust|over\s*3[,.]?5/.test(text)) return "3.5 Üst";
  if (/2[,.]?5.*ust|over\s*2[,.]?5/.test(text)) return "2.5 Üst";
  if (/2[,.]?5.*alt|under\s*2[,.]?5/.test(text)) return "2.5 Alt";
  if (/6\s*\+\s*gol|6\s*plus|over\s*5[,.]?5/.test(text)) return "6+ Gol";
  if (/^(ms\s*)?1$|mac sonucu 1|ev sahibi/.test(text)) return "MS 1";
  if (/^(ms\s*)?2$|mac sonucu 2|deplasman/.test(text)) return "MS 2";
  if (/^(ms\s*)?x$|mac sonucu x|beraberlik/.test(text)) return "MS X";
  if (/^1\/2$/.test(text)) return "1/2";
  if (/^2\/1$/.test(text)) return "2/1";
  return String(value || "").trim();
}

function normalizedRisk(value) {
  const text = clean(value);
  if (text.includes("yuksek") || text.includes("high")) return "high";
  if (text.includes("orta") || text.includes("medium") || text.includes("belirsiz")) return "medium";
  if (text.includes("dusuk") || text.includes("low")) return "low";
  return "unknown";
}

function normalizedConflict(value) {
  const text = clean(value);
  if (text.includes("high") || text.includes("yuksek")) return "high";
  if (text.includes("medium") || text.includes("orta")) return "medium";
  if (text.includes("none") || text.includes("low") || text.includes("dusuk") || text.includes("yok")) return "low";
  return "unknown";
}

function normalizedDecision(value) {
  const text = clean(value);
  if (text.includes("block") || text.includes("engelle")) return "block";
  if (text.includes("downgrade") || text.includes("dusur")) return "downgrade";
  return "keep";
}

function decisionRank(value) {
  return value === "block" ? 2 : value === "downgrade" ? 1 : 0;
}

function strongestDecision(...values) {
  return values.reduce((best, value) => (decisionRank(value) > decisionRank(best) ? value : best), "keep");
}

function memoryFrom(item) {
  return item?.analysis_metrics?.memory
    || item?.metrics?.memory
    || item?.team_memory
    || null;
}

function averageRate(memory, key) {
  const home = memory?.home || {};
  const away = memory?.away || {};
  const homeCount = finite(home.count) || 0;
  const awayCount = finite(away.count) || 0;
  if (homeCount < 3 || awayCount < 3) return null;
  const left = finite(home[key]);
  const right = finite(away[key]);
  if (left === null || right === null) return null;
  return (left + right) / 2;
}

function formEdge(memory) {
  const home = memory?.home || {};
  const away = memory?.away || {};
  const homeCount = finite(home.count) || 0;
  const awayCount = finite(away.count) || 0;
  if (homeCount < 3 || awayCount < 3) return null;
  const homePpg = finite(home.pointsPerGame);
  const awayPpg = finite(away.pointsPerGame);
  if (homePpg === null || awayPpg === null) return null;
  return homePpg - awayPpg;
}

function genericAdjustment(item) {
  const market = canonicalMarket(item?.selection || item?.market || item?.recommended_market);
  const memory = memoryFrom(item);
  const reasons = [];
  let delta = 0;

  const bttsRate = averageRate(memory, "bttsRate");
  const over25Rate = averageRate(memory, "over25Rate");
  const over35Rate = averageRate(memory, "over35Rate");
  const ppgEdge = formEdge(memory);

  if (["KG Var", "İlk Yarı KG Var", "İkinci Yarı KG Var"].includes(market)
      && bttsRate !== null && bttsRate <= 40) {
    delta -= 3;
    reasons.push(`Takım hafızasında ortalama KG oranı yalnız %${Math.round(bttsRate)}; KG Var seçimiyle çelişiyor.`);
  }
  if (["KG Yok", "İlk Yarı KG Yok", "İkinci Yarı KG Yok"].includes(market)
      && bttsRate !== null && bttsRate >= 60) {
    delta -= 3;
    reasons.push(`Takım hafızasında ortalama KG oranı %${Math.round(bttsRate)}; KG Yok seçimiyle çelişiyor.`);
  }
  if (market === "2.5 Üst" && over25Rate !== null && over25Rate <= 40) {
    delta -= 3;
    reasons.push(`Takım hafızasında 2.5 Üst eğilimi düşük (%${Math.round(over25Rate)}).`);
  }
  if (market === "2.5 Alt" && over25Rate !== null && over25Rate >= 60) {
    delta -= 3;
    reasons.push(`Takım hafızasında 2.5 Üst eğilimi yüksek (%${Math.round(over25Rate)}); Alt seçimiyle çelişiyor.`);
  }
  if (market === "3.5 Üst" && over35Rate !== null && over35Rate <= 30) {
    delta -= 3;
    reasons.push(`Takım hafızasında 3.5 Üst eğilimi düşük (%${Math.round(over35Rate)}).`);
  }
  if (market === "MS 1" && ppgEdge !== null && ppgEdge <= -0.35) {
    delta -= 3;
    reasons.push(`Form hafızası deplasman lehine ${Math.abs(ppgEdge).toFixed(2)} PPG fark gösteriyor; MS 1 ile çelişiyor.`);
  }
  if (market === "MS 2" && ppgEdge !== null && ppgEdge >= 0.35) {
    delta -= 3;
    reasons.push(`Form hafızası ev sahibi lehine ${ppgEdge.toFixed(2)} PPG fark gösteriyor; MS 2 ile çelişiyor.`);
  }

  delta = clamp(delta, -4, 0);
  return {
    version: VERSION,
    market,
    delta,
    applied: delta < 0,
    decision: delta < 0 ? "downgrade" : "keep",
    mode: "contradiction_gate_only",
    reasons: reasons.length ? reasons : ["Market uzman kapısı ek bir çelişki bulmadı."],
  };
}

function applyGenericMarketGate(item) {
  if (!item || typeof item !== "object") return item;
  const adjustment = genericAdjustment(item);
  if (!adjustment.applied) {
    return {
      ...item,
      market_specialist: adjustment,
      analysis_metrics: {
        ...(item.analysis_metrics || {}),
        market_specialist: adjustment,
      },
    };
  }
  const originalScore = finite(item.model_score ?? item.analysis_score ?? item.score) || 0;
  const adjustedScore = clamp(Math.round(originalScore + adjustment.delta), 0, 100);
  const analysisClass = classFor(adjustedScore);
  const signal = `Market uzman freni: ${adjustment.reasons.join(" ")} Model gücü ${adjustment.delta} puan; olasılık yüzdesi değiştirilmedi.`;
  return {
    ...item,
    score: adjustedScore,
    model_score: adjustedScore,
    analysis_score: adjustedScore,
    confidence: `${adjustedScore}%`,
    trust_score: `${adjustedScore}/100`,
    tag: analysisClass,
    analysis_class: analysisClass,
    market_specialist: {
      ...adjustment,
      original_model_score: originalScore,
      adjusted_model_score: adjustedScore,
    },
    analysis_metrics: {
      ...(item.analysis_metrics || {}),
      market_specialist: {
        ...adjustment,
        original_model_score: originalScore,
        adjusted_model_score: adjustedScore,
      },
    },
    pro_signals: [signal, ...(Array.isArray(item.pro_signals) ? item.pro_signals : [])].slice(0, 12),
  };
}

function goalSupport(context, market) {
  const totalLambda = finite(context.totalLambda);
  const over35Rate = finite(context.over35Rate);
  const dataCompleteness = finite(context.dataCompleteness);
  const completeRange = context.completeRange === true;
  const checks = market === "6+ Gol"
    ? [
      { name: "Poisson", ok: totalLambda !== null && totalLambda >= 3.6 },
      { name: "3.5+ geçmiş eğilimi", ok: over35Rate !== null && over35Rate >= 45 },
      { name: "veri kapsamı", ok: dataCompleteness !== null && dataCompleteness >= 75 },
      { name: "gol aralığı fiyat seti", ok: completeRange },
    ]
    : [
      { name: "Poisson", ok: totalLambda !== null && totalLambda >= 3.0 },
      { name: "3.5+ geçmiş eğilimi", ok: over35Rate !== null && over35Rate >= 40 },
      { name: "veri kapsamı", ok: dataCompleteness !== null && dataCompleteness >= 65 },
      { name: "karşı/fiyat seti", ok: completeRange || context.completeRange === undefined },
    ];
  return {
    count: checks.filter((row) => row.ok).length,
    total: checks.length,
    checks,
    quality_score: Math.round((checks.filter((row) => row.ok).length / checks.length) * 100),
  };
}

function goalMarketAdjustment(context = {}) {
  const market = canonicalMarket(context.market);
  const totalLambda = finite(context.totalLambda);
  const over35Rate = finite(context.over35Rate);
  const dataCompleteness = finite(context.dataCompleteness);
  const completeRange = context.completeRange;
  const preMatchDecision = normalizedDecision(context.preMatchDecision);
  const sourceConflict = normalizedConflict(context.sourceConflict);
  const lineupRisk = normalizedRisk(context.lineupRisk);
  const squadRisk = normalizedRisk(context.squadRisk);
  const reasons = [];
  let delta = 0;
  let decision = "keep";

  if (!["3.5 Üst", "6+ Gol"].includes(market)) {
    return {
      version: VERSION,
      market,
      delta: 0,
      applied: false,
      decision: "keep",
      eligible: true,
      quality_score: 100,
      support_count: 0,
      support_total: 0,
      mode: "extreme_goal_market_gate_v2",
      reasons: ["Gol uzman kapısı uygulanmadı."],
    };
  }

  const support = goalSupport(context, market);

  if (preMatchDecision === "block") {
    decision = "block";
    reasons.push("Maç önü final kontrolü seçimi blokladı.");
  }
  if (sourceConflict === "high") {
    decision = "block";
    reasons.push("Kaynaklar arasında yüksek seviye çelişki var.");
  }
  if (lineupRisk === "high" || squadRisk === "high") {
    decision = "block";
    reasons.push("Kadro/ilk 11 riski yüksek.");
  }

  if (market === "3.5 Üst") {
    if (totalLambda !== null && totalLambda < 2.4) {
      decision = strongestDecision(decision, "block");
      reasons.push(`Poisson toplam gol beklentisi ${totalLambda.toFixed(2)}; 3.5 Üst için kritik derecede düşük.`);
    } else if (totalLambda !== null && totalLambda < 2.8) {
      decision = strongestDecision(decision, "downgrade");
      reasons.push(`Poisson toplam gol beklentisi ${totalLambda.toFixed(2)}; 3.5 Üst için zayıf.`);
    }
    if (over35Rate !== null && over35Rate < 35) {
      decision = strongestDecision(decision, "downgrade");
      reasons.push(`3.5 Üst geçmiş eğilimi yalnız %${Math.round(over35Rate)}.`);
    }
    if (dataCompleteness !== null && dataCompleteness < 55) {
      decision = strongestDecision(decision, "downgrade");
      reasons.push(`3.5 Üst için veri kapsamı düşük (%${Math.round(dataCompleteness)}).`);
    }
    if (support.count < 2) {
      decision = strongestDecision(decision, "downgrade");
      reasons.push(`3.5 Üst yalnız ${support.count}/${support.total} bağımsız destek koşulunu sağladı.`);
    }
  }

  if (market === "6+ Gol") {
    if (totalLambda === null || totalLambda < 3.0) {
      decision = strongestDecision(decision, "block");
      reasons.push(totalLambda === null
        ? "6+ Gol için bağımsız Poisson toplam gol beklentisi yok."
        : `Poisson toplam gol beklentisi ${totalLambda.toFixed(2)}; 6+ Gol için kritik derecede düşük.`);
    } else if (totalLambda < 3.6) {
      decision = strongestDecision(decision, "downgrade");
      reasons.push(`Poisson toplam gol beklentisi ${totalLambda.toFixed(2)}; 6+ Gol için sınırda.`);
    }
    if (over35Rate !== null && over35Rate < 40) {
      decision = strongestDecision(decision, "block");
      reasons.push(`3.5+ gol geçmiş eğilimi yalnız %${Math.round(over35Rate)}; 6+ Gol ile güçlü çelişki var.`);
    } else if (over35Rate !== null && over35Rate < 45) {
      decision = strongestDecision(decision, "downgrade");
      reasons.push(`3.5+ gol geçmiş eğilimi %${Math.round(over35Rate)}; 6+ Gol için sınırlı destek.`);
    }
    if (completeRange === false) {
      decision = strongestDecision(decision, "downgrade");
      reasons.push("Gol aralığı fiyat seti eksik; 6+ piyasa doğrulaması sınırlı.");
    }
    if (dataCompleteness !== null && dataCompleteness < 55) {
      decision = strongestDecision(decision, "block");
      reasons.push(`6+ Gol için veri kapsamı kritik derecede düşük (%${Math.round(dataCompleteness)}).`);
    } else if (dataCompleteness !== null && dataCompleteness < 75) {
      decision = strongestDecision(decision, "downgrade");
      reasons.push(`6+ Gol için veri kapsamı düşük (%${Math.round(dataCompleteness)}).`);
    }
    if (support.count < 2) {
      decision = strongestDecision(decision, "block");
      reasons.push(`6+ Gol yalnız ${support.count}/${support.total} bağımsız destek koşulunu sağladı; uzman seçim kapatıldı.`);
    } else if (support.count < 3) {
      decision = strongestDecision(decision, "downgrade");
      reasons.push(`6+ Gol yalnız ${support.count}/${support.total} bağımsız destek koşulunu sağladı.`);
    }
  }

  if (preMatchDecision === "downgrade") {
    decision = strongestDecision(decision, "downgrade");
    reasons.push("Maç önü final kontrolü ihtiyat düşümü verdi.");
  }
  if (sourceConflict === "medium") {
    decision = strongestDecision(decision, "downgrade");
    reasons.push("Kaynaklar arasında orta seviye çelişki var.");
  }
  if (lineupRisk === "medium" || squadRisk === "medium") {
    decision = strongestDecision(decision, "downgrade");
    reasons.push("Kadro/ilk 11 verisi tam güvenli değil.");
  }

  delta = decision === "block" ? -8 : decision === "downgrade" ? -4 : 0;
  return {
    version: VERSION,
    market,
    delta,
    applied: decision !== "keep",
    decision,
    eligible: decision !== "block",
    quality_score: support.quality_score,
    support_count: support.count,
    support_total: support.total,
    support_checks: support.checks,
    mode: "extreme_goal_market_gate_v2",
    reasons: reasons.length ? reasons : [`Gol uzman kapısı ${support.count}/${support.total} destek ile ek çelişki bulmadı.`],
  };
}

function applyGoalMarketGate(candidate, context = {}) {
  if (!candidate) return candidate;
  const adjustment = goalMarketAdjustment({ ...context, market: candidate.recommended_market || candidate.market });
  const originalScore = finite(candidate.model_score ?? candidate.analysis_score) || 0;
  const adjustedScore = clamp(Math.round(originalScore + adjustment.delta), 0, 100);
  const signals = [
    ...(Array.isArray(candidate.signals) ? candidate.signals : []),
    ...(adjustment.applied ? [`Market uzman kararı (${adjustment.decision}): ${adjustment.reasons.join(" ")}`] : []),
  ].slice(0, 10);
  return {
    ...candidate,
    model_score: adjustedScore,
    analysis_score: adjustedScore,
    confidence_score: `${adjustedScore}%`,
    specialist_decision: adjustment.decision,
    specialist_eligible: adjustment.eligible,
    specialist_quality_score: adjustment.quality_score,
    market_specialist: {
      ...adjustment,
      original_model_score: originalScore,
      adjusted_model_score: adjustedScore,
    },
    signals,
    robot_reason: signals.slice(0, 4).join(" | "),
  };
}

function htftAdjustment(context = {}) {
  const market = canonicalMarket(context.market);
  const firstHalfSource = String(context.firstHalfSource || "");
  const firstHalfVerified = context.firstHalfVerified === true
    || /detail_market_candidates|verified|official/i.test(firstHalfSource);
  const openness = finite(context.openness);
  const dataCompleteness = finite(context.dataCompleteness);
  const scenarioProbability = finite(context.scenarioProbability);
  const identityScore = finite(context.identityScore);
  const identitySource = String(context.identitySource || "");
  const oddsVerified = context.oddsVerified === true;
  const preMatchDecision = normalizedDecision(context.preMatchDecision);
  const sourceConflict = normalizedConflict(context.sourceConflict);
  const lineupRisk = normalizedRisk(context.lineupRisk);
  const squadRisk = normalizedRisk(context.squadRisk);
  const reasons = [];
  let decision = "keep";

  if (!["1/2", "2/1"].includes(market)) {
    return {
      version: VERSION,
      market,
      delta: 0,
      applied: false,
      decision: "keep",
      eligible: true,
      quality_score: 100,
      mode: "htft_reversal_gate_v2",
      reasons: ["İY/MS uzman kapısı uygulanmadı."],
    };
  }

  if (!oddsVerified) {
    decision = "block";
    reasons.push("Resmî İY/MS oranı doğrulanmadı.");
  }
  if (!firstHalfVerified || /derived/i.test(firstHalfSource)) {
    decision = strongestDecision(decision, "block");
    reasons.push("Gerçek ilk yarı yön oranı yok; türetilmiş ilk yarı sinyali uzman seçim olarak kullanılamaz.");
  }
  if (preMatchDecision === "block") {
    decision = strongestDecision(decision, "block");
    reasons.push("Maç önü final kontrolü seçimi blokladı.");
  }
  if (sourceConflict === "high") {
    decision = strongestDecision(decision, "block");
    reasons.push("Kaynaklar arasında yüksek seviye çelişki var.");
  }
  if (lineupRisk === "high" || squadRisk === "high") {
    decision = strongestDecision(decision, "block");
    reasons.push("Kadro/ilk 11 riski yüksek.");
  }
  if (dataCompleteness !== null && dataCompleteness < 45) {
    decision = strongestDecision(decision, "block");
    reasons.push(`İY/MS için veri kapsamı kritik derecede düşük (%${Math.round(dataCompleteness)}).`);
  }
  if (openness !== null && openness < 0.42) {
    decision = strongestDecision(decision, "block");
    reasons.push(`Açık oyun skoru ${(openness * 100).toFixed(0)}/100; ters sonuç senaryosu için kritik derecede zayıf.`);
  }
  if (scenarioProbability !== null && scenarioProbability < 2.5) {
    decision = strongestDecision(decision, "block");
    reasons.push(`Ters sonuç senaryo olasılığı yalnız %${scenarioProbability.toFixed(1)}.`);
  }

  if (openness !== null && openness < 0.55) {
    decision = strongestDecision(decision, "downgrade");
    reasons.push(`Açık oyun skoru ${(openness * 100).toFixed(0)}/100; ters sonuç için sınırlı destek.`);
  }
  if (dataCompleteness !== null && dataCompleteness < 65) {
    decision = strongestDecision(decision, "downgrade");
    reasons.push(`İY/MS için veri kapsamı sınırlı (%${Math.round(dataCompleteness)}).`);
  }
  if (scenarioProbability !== null && scenarioProbability < 3.5) {
    decision = strongestDecision(decision, "downgrade");
    reasons.push(`Ters sonuç senaryo olasılığı %${scenarioProbability.toFixed(1)}; uzman güveni düşürüldü.`);
  }
  if (/similarity/i.test(identitySource) && identityScore !== null && identityScore < 85) {
    decision = strongestDecision(decision, "downgrade");
    reasons.push(`Resmî maç eşleşmesi benzerlik ile %${Math.round(identityScore)} güven seviyesinde yapıldı.`);
  }
  if (preMatchDecision === "downgrade") {
    decision = strongestDecision(decision, "downgrade");
    reasons.push("Maç önü final kontrolü ihtiyat düşümü verdi.");
  }
  if (sourceConflict === "medium") {
    decision = strongestDecision(decision, "downgrade");
    reasons.push("Kaynaklar arasında orta seviye çelişki var.");
  }
  if (lineupRisk === "medium" || squadRisk === "medium") {
    decision = strongestDecision(decision, "downgrade");
    reasons.push("Kadro/ilk 11 verisi tam güvenli değil.");
  }

  const support = [
    oddsVerified,
    firstHalfVerified && !/derived/i.test(firstHalfSource),
    openness !== null && openness >= 0.55,
    dataCompleteness !== null && dataCompleteness >= 65,
    scenarioProbability !== null && scenarioProbability >= 3.5,
  ];
  const qualityScore = Math.round((support.filter(Boolean).length / support.length) * 100);
  const delta = decision === "block" ? -8 : decision === "downgrade" ? -4 : 0;
  return {
    version: VERSION,
    market,
    delta,
    applied: decision !== "keep",
    decision,
    eligible: decision !== "block",
    quality_score: qualityScore,
    mode: "htft_reversal_gate_v2",
    reasons: reasons.length ? reasons : ["İY/MS uzman kapısı doğrulanmış sinyallerde ek çelişki bulmadı."],
  };
}

module.exports = {
  VERSION,
  applyGenericMarketGate,
  applyGoalMarketGate,
  averageRate,
  canonicalMarket,
  genericAdjustment,
  goalMarketAdjustment,
  htftAdjustment,
  normalizedDecision,
  strongestDecision,
};
