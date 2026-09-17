"use strict";

const VERSION = "matchup-intelligence-v1";
const ZONES = ["goalkeeper", "defense", "midfield", "attack"];
const ZONE_LABELS = Object.freeze({
  goalkeeper: "Kaleci",
  defense: "Savunma",
  midfield: "Orta saha",
  attack: "Hücum",
  unknown: "Belirsiz mevki",
});

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function finite(value) {
  if (value === undefined || value === null || value === "" || value === "-") return null;
  const number = Number(String(value).replace(",", ".").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(number) ? number : null;
}

function clean(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function zoneForPosition(value) {
  const text = clean(value);
  if (!text || text === "-") return "unknown";
  if (/^(g|gk|goalkeeper|kaleci)$/.test(text) || /goalkeeper|kaleci/.test(text)) return "goalkeeper";
  if (/^(d|df|cb|lb|rb|lwb|rwb)$/.test(text) || /defen|stoper|bek|centre back|center back|full back/.test(text)) return "defense";
  if (/^(m|mf|cm|dm|am|cdm|cam|lm|rm)$/.test(text) || /midfield|orta saha|on numara|10 numara/.test(text)) return "midfield";
  if (/^(f|fw|st|cf|lw|rw|ss)$/.test(text) || /forward|striker|wing|kanat|forvet|santrfor|attacker/.test(text)) return "attack";
  return "unknown";
}

function ability(player) {
  if (!player || typeof player !== "object") return 0;
  const direct = finite(player.ability_score ?? player.rating ?? player.overall);
  const parts = ["attack", "defense", "passing", "pace", "finishing", "aerial", "set_piece", "form", "importance"]
    .map((key) => finite(player[key]))
    .filter((value) => value !== null && value > 0);
  if (direct !== null && direct > 0 && parts.length) {
    return Math.round((direct + (parts.reduce((sum, value) => sum + value, 0) / parts.length)) / 2);
  }
  if (direct !== null && direct > 0) return direct;
  return parts.length ? Math.round(parts.reduce((sum, value) => sum + value, 0) / parts.length) : 0;
}

function absenceImpact(player) {
  const score = finite(player?.impact_score ?? player?.importance);
  if (score !== null && score > 0) return score > 10 ? clamp(score / 10, 1, 10) : clamp(score, 1, 10);
  const level = clean(player?.impact_level);
  if (level.includes("yuksek")) return 8;
  if (level.includes("orta")) return 5;
  if (level.includes("dusuk")) return 2;
  return 3;
}

function emptyZone() {
  return {
    starter_count: 0,
    rated_starter_count: 0,
    strength: null,
    missing_count: 0,
    missing_impact: 0,
    high_impact_missing: 0,
  };
}

function summarizeTeam(summary = {}, record = {}) {
  const zones = Object.fromEntries([...ZONES, "unknown"].map((zone) => [zone, emptyZone()]));
  const starters = Array.isArray(record.starting_11) ? record.starting_11 : [];
  const unavailable = Array.isArray(summary.unavailable_players)
    ? summary.unavailable_players
    : Array.isArray(record.unavailable) ? record.unavailable : [];

  const ratingsByZone = Object.fromEntries(ZONES.map((zone) => [zone, []]));
  for (const player of starters) {
    const zone = zoneForPosition(player?.position ?? player?.pos);
    zones[zone].starter_count += 1;
    const score = ability(player);
    if (zone !== "unknown" && score > 0) {
      zones[zone].rated_starter_count += 1;
      ratingsByZone[zone].push(score);
    }
  }
  for (const zone of ZONES) {
    const ratings = ratingsByZone[zone];
    zones[zone].strength = ratings.length
      ? Math.round(ratings.reduce((sum, value) => sum + value, 0) / ratings.length)
      : null;
  }

  for (const player of unavailable) {
    const zone = zoneForPosition(player?.position ?? player?.pos);
    const impact = absenceImpact(player);
    zones[zone].missing_count += 1;
    zones[zone].missing_impact = Number((zones[zone].missing_impact + impact).toFixed(1));
    if (impact >= 7) zones[zone].high_impact_missing += 1;
  }

  const ratedStarterCount = ZONES.reduce((sum, zone) => sum + zones[zone].rated_starter_count, 0);
  const missingImpact = [...ZONES, "unknown"].reduce((sum, zone) => sum + zones[zone].missing_impact, 0);
  const highImpactMissing = [...ZONES, "unknown"].reduce((sum, zone) => sum + zones[zone].high_impact_missing, 0);
  return {
    team_name: String(summary.team_name || record.team_name || "Takım"),
    formation: String(summary.formation || record.formation || "-"),
    lineup_confirmed: Boolean(summary.lineup_confirmed || record.lineup_confirmed),
    availability_checked: Boolean(summary.availability_checked || record.availability_checked),
    starting_11_count: Number(summary.starting_11_count || starters.length || 0),
    rated_starter_count: ratedStarterCount,
    missing_count: unavailable.length,
    missing_impact: Number(missingImpact.toFixed(1)),
    high_impact_missing: highImpactMissing,
    zones,
  };
}

function compareZone(home, away, zone) {
  const homeZone = home.zones[zone];
  const awayZone = away.zones[zone];
  const strengthReady = homeZone.strength !== null && awayZone.strength !== null;
  if (strengthReady) {
    const difference = Number((homeZone.strength - awayZone.strength).toFixed(1));
    const edge = difference >= 7 ? "home" : difference <= -7 ? "away" : "balanced";
    return {
      zone,
      label: ZONE_LABELS[zone],
      edge,
      basis: "rated_lineup_strength",
      home_strength: homeZone.strength,
      away_strength: awayZone.strength,
      strength_difference: difference,
      home_missing_impact: homeZone.missing_impact,
      away_missing_impact: awayZone.missing_impact,
    };
  }

  if (home.availability_checked && away.availability_checked) {
    const availabilityDifference = Number((awayZone.missing_impact - homeZone.missing_impact).toFixed(1));
    if (Math.abs(availabilityDifference) >= 4) {
      return {
        zone,
        label: ZONE_LABELS[zone],
        edge: availabilityDifference > 0 ? "home" : "away",
        basis: "verified_availability",
        home_strength: null,
        away_strength: null,
        strength_difference: null,
        home_missing_impact: homeZone.missing_impact,
        away_missing_impact: awayZone.missing_impact,
      };
    }
  }

  return {
    zone,
    label: ZONE_LABELS[zone],
    edge: "unknown",
    basis: strengthReady ? "rated_lineup_strength" : "insufficient_quality_data",
    home_strength: homeZone.strength,
    away_strength: awayZone.strength,
    strength_difference: strengthReady ? Number((homeZone.strength - awayZone.strength).toFixed(1)) : null,
    home_missing_impact: homeZone.missing_impact,
    away_missing_impact: awayZone.missing_impact,
  };
}

function coverageScore(home, away) {
  let score = 0;
  if (home.lineup_confirmed && away.lineup_confirmed) score += 40;
  else if (home.lineup_confirmed || away.lineup_confirmed) score += 20;
  if (home.availability_checked && away.availability_checked) score += 30;
  else if (home.availability_checked || away.availability_checked) score += 15;
  const rated = home.rated_starter_count + away.rated_starter_count;
  score += Math.round(clamp(rated / 22, 0, 1) * 30);
  return clamp(score, 0, 100);
}

function contextEdge(home, away, comparisons) {
  const availabilityEdge = clamp(away.missing_impact - home.missing_impact, -12, 12);
  const ratedDiffs = comparisons
    .filter((row) => row.strength_difference !== null)
    .map((row) => row.strength_difference);
  const strengthEdge = ratedDiffs.length
    ? clamp(ratedDiffs.reduce((sum, value) => sum + value, 0) / ratedDiffs.length / 2, -8, 8)
    : 0;
  return Number(clamp((availabilityEdge * 0.7) + (strengthEdge * 0.3), -12, 12).toFixed(1));
}

function marketContext(home, away) {
  const defensiveMissing = home.zones.defense.missing_impact + home.zones.goalkeeper.missing_impact
    + away.zones.defense.missing_impact + away.zones.goalkeeper.missing_impact;
  const attackingMissing = home.zones.attack.missing_impact + home.zones.midfield.missing_impact
    + away.zones.attack.missing_impact + away.zones.midfield.missing_impact;
  const goalPressure = Number((defensiveMissing - (attackingMissing * 0.65)).toFixed(1));
  return {
    goal_pressure: goalPressure,
    defensive_missing_impact: Number(defensiveMissing.toFixed(1)),
    attacking_missing_impact: Number(attackingMissing.toFixed(1)),
    goals_note: goalPressure >= 5
      ? "Doğrulanmış savunma/kaleci eksikleri gol oynaklığını artırıyor."
      : goalPressure <= -5
        ? "Doğrulanmış hücum/yaratıcılık eksikleri gol beklentisini baskılıyor."
        : "Kadro eksikleri gol marketinde tek yönlü güçlü sinyal üretmiyor.",
    btts_note: goalPressure >= 5
      ? "Savunma eksikleri KG Var senaryosunu destekleyen bağlamsal sinyal üretiyor."
      : goalPressure <= -5
        ? "Hücum eksikleri KG Var senaryosunu zayıflatan bağlamsal sinyal üretiyor."
        : "KG için kadro kaynaklı belirgin yön oluşmadı.",
  };
}

function keySignals(home, away, comparisons, market) {
  const signals = [];
  for (const team of [home, away]) {
    for (const zone of ZONES) {
      const item = team.zones[zone];
      if (item.high_impact_missing > 0) {
        signals.push(`${team.team_name}: ${ZONE_LABELS[zone]} bölgesinde ${item.high_impact_missing} yüksek etkili eksik.`);
      } else if (item.missing_impact >= 7) {
        signals.push(`${team.team_name}: ${ZONE_LABELS[zone]} eksik yükü yüksek (${item.missing_impact.toFixed(1)}).`);
      }
    }
  }
  for (const row of comparisons) {
    if (row.edge === "home" || row.edge === "away") {
      const teamName = row.edge === "home" ? home.team_name : away.team_name;
      const reason = row.basis === "rated_lineup_strength" ? "doğrulanmış kalite verisinde" : "doğrulanmış eksik yükünde";
      signals.push(`${row.label}: ${teamName} ${reason} avantajlı.`);
    }
  }
  signals.push(market.goals_note);
  return [...new Set(signals)].slice(0, 6);
}

function buildMatchupAnalysis(homeSummary, awaySummary, homeRecord = {}, awayRecord = {}) {
  const home = summarizeTeam(homeSummary, homeRecord);
  const away = summarizeTeam(awaySummary, awayRecord);
  const comparisons = ZONES.map((zone) => compareZone(home, away, zone));
  const coverage = coverageScore(home, away);
  const edge = contextEdge(home, away, comparisons);
  const market = marketContext(home, away);
  return {
    version: VERSION,
    data_quality: coverage >= 85 ? "Yüksek" : coverage >= 65 ? "Orta" : coverage >= 35 ? "Sınırlı" : "Belirsiz",
    coverage_score: coverage,
    lineup_confirmed_both: Boolean(home.lineup_confirmed && away.lineup_confirmed),
    availability_checked_both: Boolean(home.availability_checked && away.availability_checked),
    home,
    away,
    position_comparison: comparisons,
    context_edge: edge,
    context_edge_side: edge >= 4 ? "home" : edge <= -4 ? "away" : "balanced",
    market_context: market,
    signals: keySignals(home, away, comparisons, market),
    policy: "Bu katman yalnız doğrulanmış kadro/ilk 11 verisini kullanır; kalite verisi yoksa oyuncu isminden güç uydurmaz ve maç olasılığını doğrudan değiştirmez.",
  };
}

function marketDirection(value) {
  const text = clean(value);
  if (/^(ms )?1$|mac sonucu 1|ev sahibi/.test(text) && !/gol/.test(text)) return "home";
  if (/^(ms )?2$|mac sonucu 2|deplasman/.test(text) && !/gol/.test(text)) return "away";
  if (/kg var|btts yes|karsilikli gol var/.test(text)) return "btts_yes";
  if (/kg yok|btts no|karsilikli gol yok/.test(text)) return "btts_no";
  if (/ust|over/.test(text)) return "over";
  if (/alt|under/.test(text)) return "under";
  return "other";
}

function adjustmentFor(item, analysis) {
  if (!analysis || analysis.coverage_score < 65) return { delta: 0, reason: "Kadro eşleşme verisi sınırlı; model skoru değiştirilmedi." };
  const direction = marketDirection(item?.selection || item?.market || item?.recommended_market);
  const edge = Number(analysis.context_edge || 0);
  const pressure = Number(analysis.market_context?.goal_pressure || 0);
  let delta = 0;
  let reason = "Kadro eşleşmesi market yönünde belirgin ek sinyal üretmedi.";

  if (direction === "home" && Math.abs(edge) >= 4) {
    delta = edge > 0 ? 1 : -4;
    reason = edge > 0 ? "Mevki/kadro eşleşmesi ev sahibi yönünü doğruluyor." : "Mevki/kadro eşleşmesi ev sahibi seçimiyle çelişiyor.";
  } else if (direction === "away" && Math.abs(edge) >= 4) {
    delta = edge < 0 ? 1 : -4;
    reason = edge < 0 ? "Mevki/kadro eşleşmesi deplasman yönünü doğruluyor." : "Mevki/kadro eşleşmesi deplasman seçimiyle çelişiyor.";
  } else if ((direction === "over" || direction === "btts_yes") && Math.abs(pressure) >= 5) {
    delta = pressure > 0 ? 1 : -3;
    reason = pressure > 0 ? "Savunma eksikleri gol yönündeki seçimi destekliyor." : "Hücum eksikleri gol yönündeki seçimle çelişiyor.";
  } else if ((direction === "under" || direction === "btts_no") && Math.abs(pressure) >= 5) {
    delta = pressure < 0 ? 1 : -3;
    reason = pressure < 0 ? "Hücum eksikleri düşük gol yönündeki seçimi destekliyor." : "Savunma eksikleri düşük gol yönündeki seçimle çelişiyor.";
  }
  return { delta, reason };
}

function applyMatchupContext(item, analysis = item?.team_intelligence?.matchup_analysis || item?.matchup_analysis) {
  if (!analysis || typeof analysis !== "object") return item;
  const { delta, reason } = adjustmentFor(item, analysis);
  const originalScore = Number(item?.model_score ?? item?.analysis_score ?? item?.score ?? 0);
  const adjustedScore = clamp(Math.round(originalScore + delta), 0, 100);
  const signal = `Kadro eşleşme katmanı: ${reason}${delta ? ` Model gücü ${delta > 0 ? "+" : ""}${delta} puan.` : ""} Olasılık yüzdesi değiştirilmedi.`;
  return {
    ...item,
    score: adjustedScore,
    model_score: adjustedScore,
    analysis_score: adjustedScore,
    confidence: `${adjustedScore}%`,
    trust_score: `${adjustedScore}/100`,
    matchup_analysis: analysis,
    team_intelligence: {
      ...(item.team_intelligence || {}),
      matchup_analysis: analysis,
      matchup_adjustment: {
        original_model_score: originalScore,
        delta,
        adjusted_model_score: adjustedScore,
        reason,
      },
    },
    pro_signals: [signal, ...(Array.isArray(item.pro_signals) ? item.pro_signals : [])].slice(0, 8),
  };
}

module.exports = {
  VERSION,
  ZONES,
  ZONE_LABELS,
  ability,
  absenceImpact,
  applyMatchupContext,
  buildMatchupAnalysis,
  marketDirection,
  summarizeTeam,
  zoneForPosition,
};
