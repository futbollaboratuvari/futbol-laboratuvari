"use strict";

const VERSION = "market-specialist-gates-v1";

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

function goalMarketAdjustment(context = {}) {
  const market = canonicalMarket(context.market);
  const totalLambda = finite(context.totalLambda);
  const over35Rate = finite(context.over35Rate);
  const dataCompleteness = finite(context.dataCompleteness);
  const completeRange = context.completeRange;
  const reasons = [];
  let delta = 0;

  if (market === "3.5 Üst") {
    if (totalLambda !== null && totalLambda < 2.7) {
      delta -= 3;
      reasons.push(`Poisson toplam gol beklentisi ${totalLambda.toFixed(2)}; 3.5 Üst için zayıf.`);
    }
    if (over35Rate !== null && over35Rate < 35) {
      delta -= 2;
      reasons.push(`3.5 Üst geçmiş eğilimi yalnız %${Math.round(over35Rate)}.`);
    }
  }

  if (market === "6+ Gol") {
    if (totalLambda !== null && totalLambda < 3.2) {
      delta -= 4;
      reasons.push(`Poisson toplam gol beklentisi ${totalLambda.toFixed(2)}; 6+ Gol için yeterince yüksek değil.`);
    }
    if (completeRange === false) {
      delta -= 1;
      reasons.push("Gol aralığı fiyat seti eksik; 6+ piyasa doğrulaması sınırlı.");
    }
    if (dataCompleteness !== null && dataCompleteness < 75) {
      delta -= 2;
      reasons.push(`6+ Gol için veri kapsamı düşük (%${Math.round(dataCompleteness)}).`);
    }
  }

  delta = clamp(delta, -4, 0);
  return {
    version: VERSION,
    market,
    delta,
    applied: delta < 0,
    mode: "extreme_goal_market_gate",
    reasons: reasons.length ? reasons : ["Gol marketi uzman kapısı ek bir çelişki bulmadı."],
  };
}

function applyGoalMarketGate(candidate, context = {}) {
  if (!candidate) return candidate;
  const adjustment = goalMarketAdjustment({ ...context, market: candidate.recommended_market || candidate.market });
  const originalScore = finite(candidate.model_score ?? candidate.analysis_score) || 0;
  const adjustedScore = clamp(Math.round(originalScore + adjustment.delta), 0, 100);
  const signals = [
    ...(Array.isArray(candidate.signals) ? candidate.signals : []),
    ...(adjustment.applied ? [`Market uzman freni: ${adjustment.reasons.join(" ")}`] : []),
  ].slice(0, 10);
  return {
    ...candidate,
    model_score: adjustedScore,
    analysis_score: adjustedScore,
    confidence_score: `${adjustedScore}%`,
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
  const openness = finite(context.openness);
  const dataCompleteness = finite(context.dataCompleteness);
  const reasons = [];
  let delta = 0;

  if (!["1/2", "2/1"].includes(market)) {
    return { version: VERSION, market, delta: 0, applied: false, mode: "htft_reversal_gate", reasons: ["İY/MS uzman kapısı uygulanmadı."] };
  }
  if (/derived/i.test(firstHalfSource)) {
    delta -= 3;
    reasons.push("Gerçek ilk yarı yön oranı yok; ilk yarı sinyali maç sonu yönünden türetildi.");
  }
  if (openness !== null && openness < 0.5) {
    delta -= 2;
    reasons.push(`Açık oyun skoru ${(openness * 100).toFixed(0)}/100; ters sonuç senaryosu için zayıf.`);
  }
  if (dataCompleteness !== null && dataCompleteness < 55) {
    delta -= 2;
    reasons.push(`İY/MS için veri kapsamı düşük (%${Math.round(dataCompleteness)}).`);
  }
  delta = clamp(delta, -4, 0);
  return {
    version: VERSION,
    market,
    delta,
    applied: delta < 0,
    mode: "htft_reversal_gate",
    reasons: reasons.length ? reasons : ["İY/MS uzman kapısı ek bir çelişki bulmadı."],
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
};
