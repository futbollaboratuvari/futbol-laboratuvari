"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dataDir = path.join(root, "data");
const outputPath = path.join(dataDir, "pre-match-final-check.json");

const readJson = (file, fallback) => {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
};

const writeJson = (file, value) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8");
};

function clean(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function matchName(row) {
  if (row?.match_name || row?.match) return String(row.match_name || row.match);
  const home = String(row?.home || row?.home_team_name || row?.ev_sahibi || "").trim();
  const away = String(row?.away || row?.away_team_name || row?.deplasman || "").trim();
  return home && away ? `${home} VS ${away}` : "-";
}

function teams(row) {
  const name = matchName(row);
  const parts = name.includes(" VS ") ? name.split(" VS ") : [];
  return {
    home: String(row?.home || row?.home_team_name || row?.ev_sahibi || parts[0] || "").trim(),
    away: String(row?.away || row?.away_team_name || row?.deplasman || parts[1] || "").trim(),
  };
}

function matchKey(row) {
  const date = String(row?.date || row?.tarih || row?.utc_date || "").slice(0, 10);
  return `${date}|${clean(matchName(row))}`;
}

function parseTimeText(value) {
  const match = String(value || "").trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function kickoffTimestamp(row) {
  const iso = String(row?.utc_date || row?.kickoff || row?.kickoff_at || "").trim();
  if (iso.includes("T")) {
    const parsed = Date.parse(iso);
    if (Number.isFinite(parsed)) return parsed;
  }
  const date = String(row?.date || row?.tarih || "").slice(0, 10);
  const time = parseTimeText(row?.start_time || row?.time || row?.saat);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !time) return null;
  const parsed = Date.parse(`${date}T${time}:00+03:00`);
  return Number.isFinite(parsed) ? parsed : null;
}

function minutesToKickoff(row, now = Date.now()) {
  const kickoff = kickoffTimestamp(row);
  return kickoff === null ? null : Number(((kickoff - now) / 60000).toFixed(1));
}

function checkpointFor(minutes) {
  if (!Number.isFinite(minutes) || minutes < 0 || minutes > 75) return null;
  if (minutes <= 15) return "T10";
  if (minutes <= 45) return "T30";
  return "T60";
}

function freshnessMinutes(value, now = Date.now()) {
  const parsed = Date.parse(String(value || ""));
  if (!Number.isFinite(parsed)) return null;
  return Math.max(0, Number(((now - parsed) / 60000).toFixed(1)));
}

function riskRank(value) {
  const text = clean(value);
  if (text.includes("yuksek")) return 3;
  if (text.includes("orta") || text.includes("belirsiz") || text.includes("sinirli")) return 2;
  if (text.includes("dusuk")) return 1;
  return 0;
}

function decisionRank(value) {
  if (value === "block") return 2;
  if (value === "downgrade") return 1;
  return 0;
}

function worstDecision(...values) {
  const rank = Math.max(...values.map(decisionRank), 0);
  return rank >= 2 ? "block" : rank === 1 ? "downgrade" : "keep";
}

const MARKET_ALIASES = {
  ms1: ["ms1", "one", "oneOdd", "odd1", "homeWin", "home_win"],
  msx: ["msx", "draw", "drawOdd", "oddX", "x", "draw_odd"],
  ms2: ["ms2", "two", "twoOdd", "odd2", "awayWin", "away_win"],
  over25: ["over25", "ust25", "over", "ust", "ust_25"],
  under25: ["under25", "alt25", "under", "alt", "alt_25"],
  over35: ["over35", "ust35", "over3_5", "ust_35"],
  under35: ["under35", "alt35", "under3_5", "alt_35"],
  bttsYes: ["bttsYes", "kgVar", "kg_var", "varOdd", "var"],
  bttsNo: ["bttsNo", "kgYok", "kg_yok", "yokOdd", "yok"],
  firstHalfBttsYes: ["firstHalfBttsYes", "iyKgVar", "iy_kg_var", "first_half_btts_yes"],
  firstHalfBttsNo: ["firstHalfBttsNo", "iyKgYok", "iy_kg_yok", "first_half_btts_no"],
  secondHalfBttsYes: ["secondHalfBttsYes", "ikinciYariKgVar", "ikinci_yari_kg_var", "second_half_btts_yes"],
  secondHalfBttsNo: ["secondHalfBttsNo", "ikinciYariKgYok", "ikinci_yari_kg_yok", "second_half_btts_no"],
  goals6plus: ["goals6plus", "goals6Plus", "sixPlus", "six_plus", "6plus", "6_plus"],
  htft11: ["htft11", "ht_ft_11", "iy_ms_11", "first_half_full_time_11"],
  htft12: ["htft12", "ht_ft_12", "iy_ms_12", "first_half_full_time_12"],
  htft21: ["htft21", "ht_ft_21", "iy_ms_21", "first_half_full_time_21"],
};

function canonicalMarketKey(value) {
  const text = clean(value);
  if (!text) return null;
  if (/^(ms )?1$|mac sonucu 1|home win/.test(text)) return "ms1";
  if (/^(ms )?x$|mac sonucu x|draw/.test(text)) return "msx";
  if (/^(ms )?2$|mac sonucu 2|away win/.test(text)) return "ms2";
  if (/2 5 ust|over 2 5/.test(text)) return "over25";
  if (/2 5 alt|under 2 5/.test(text)) return "under25";
  if (/3 5 ust|over 3 5/.test(text)) return "over35";
  if (/3 5 alt|under 3 5/.test(text)) return "under35";
  if (/ilk yari.*kg.*var|first half.*btts.*yes/.test(text)) return "firstHalfBttsYes";
  if (/ilk yari.*kg.*yok|first half.*btts.*no/.test(text)) return "firstHalfBttsNo";
  if (/ikinci yari.*kg.*var|second half.*btts.*yes/.test(text)) return "secondHalfBttsYes";
  if (/ikinci yari.*kg.*yok|second half.*btts.*no/.test(text)) return "secondHalfBttsNo";
  if (/kg var|btts yes|karsilikli gol var/.test(text)) return "bttsYes";
  if (/kg yok|btts no|karsilikli gol yok/.test(text)) return "bttsNo";
  if (/6 gol|6 plus|6 ve ustu|6 veya daha fazla|5 5 ust/.test(text)) return "goals6plus";
  if (/^1 1$|1\/1/.test(String(value || ""))) return "htft11";
  if (/^1 2$|1\/2/.test(String(value || ""))) return "htft12";
  if (/^2 1$|2\/1/.test(String(value || ""))) return "htft21";
  return null;
}

function parseOdd(value) {
  const number = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(number) && number > 1 && number < 100 ? Number(number.toFixed(2)) : null;
}

function verifiedMarketOdd(row, marketKey) {
  if (!marketKey || !MARKET_ALIASES[marketKey]) return null;
  const sources = [row, row?.odds, row?.oranlar, row?.detay_oranlar, row?.available_odds];
  for (const source of sources) {
    if (!source || typeof source !== "object") continue;
    for (const alias of MARKET_ALIASES[marketKey]) {
      const odd = parseOdd(source[alias]);
      if (odd !== null) return { odd, source: `verified_named_field:${alias}` };
    }
  }
  return null;
}

function lookupMap(data) {
  const map = new Map();
  for (const row of data?.matches || []) {
    map.set(matchKey(row), row);
    map.set(clean(matchName(row)), row);
  }
  return map;
}

function lookupRow(map, row) {
  return map.get(matchKey(row)) || map.get(clean(matchName(row))) || null;
}

function latestNewsAgeMinutes(row, teamNews, now) {
  const pair = teams(row);
  const records = [teamNews?.teams?.[pair.home], teamNews?.teams?.[clean(pair.home)], teamNews?.teams?.[pair.away], teamNews?.teams?.[clean(pair.away)]]
    .filter(Boolean);
  const ages = records.map((record) => freshnessMinutes(record.checked_at, now)).filter(Number.isFinite);
  return ages.length ? Math.max(...ages) : null;
}

function evaluateGeneral({ checkpoint, lineup, consensus, lineupAgeMinutes, newsAgeMinutes, previousSnapshot }) {
  if (!checkpoint) return { decision: "keep", score_penalty: 0, reasons: ["Son kontrol penceresi henüz başlamadı."] };
  const reasons = [];
  let decision = "keep";
  const lineupRisk = lineup?.lineup_risk_level || "Belirsiz";
  const conflict = String(consensus?.conflict_level || "none").toLowerCase();
  const confidence = Number(consensus?.confidence_score);
  const bothConfirmed = Boolean(lineup?.home_lineup?.lineup_confirmed && lineup?.away_lineup?.lineup_confirmed);

  if (riskRank(lineupRisk) >= 3) {
    decision = "block";
    reasons.push("Son kontrol: kadro/ilk 11 riski yüksek.");
  }
  if (conflict === "high") {
    decision = "block";
    reasons.push("Son kontrol: kadro kaynaklarında yüksek çelişki var.");
  } else if (conflict === "medium" && decision !== "block") {
    decision = "downgrade";
    reasons.push("Son kontrol: kadro kaynaklarında orta düzey çelişki var.");
  }
  if (Number.isFinite(confidence) && confidence < 40 && decision !== "block") {
    decision = "downgrade";
    reasons.push(`Son kontrol: kaynak güven puanı düşük (${confidence}/100).`);
  }

  if (checkpoint === "T10" && !bothConfirmed && decision !== "block") {
    decision = "downgrade";
    reasons.push("T10: iki takımın doğrulanmış ilk 11'i birlikte mevcut değil.");
  }
  const staleLimit = checkpoint === "T10" ? 20 : checkpoint === "T30" ? 40 : 75;
  if (Number.isFinite(lineupAgeMinutes) && lineupAgeMinutes > staleLimit && decision !== "block") {
    decision = "downgrade";
    reasons.push(`${checkpoint}: ilk 11/kadro sinyali ${Math.round(lineupAgeMinutes)} dakika eski.`);
  }
  if (checkpoint === "T10" && Number.isFinite(newsAgeMinutes) && newsAgeMinutes > 90 && !bothConfirmed && decision !== "block") {
    decision = "downgrade";
    reasons.push(`T10: açık haber bağlamı ${Math.round(newsAgeMinutes)} dakika eski; doğrulanmış ilk 11 yok.`);
  }

  const previousRisk = previousSnapshot?.lineup_risk_level;
  if (previousRisk && riskRank(lineupRisk) > riskRank(previousRisk)) {
    if (riskRank(lineupRisk) >= 3) decision = "block";
    else if (decision !== "block") decision = "downgrade";
    reasons.push(`Son kontrol: ilk 11 riski önceki kontrolden kötüleşti (${previousRisk} → ${lineupRisk}).`);
  }

  if (!reasons.length) reasons.push(`${checkpoint}: kadro/kaynak tarafında yeni olumsuz doğrulanmış sinyal yok.`);
  return { decision, score_penalty: decision === "block" ? 12 : decision === "downgrade" ? 4 : 0, reasons, both_lineups_confirmed: bothConfirmed };
}

function previousCheckpointSnapshot(existing, checkpoint) {
  if (!existing?.snapshots) return null;
  if (checkpoint === "T10") return existing.snapshots.T30 || existing.snapshots.T60 || null;
  if (checkpoint === "T30") return existing.snapshots.T60 || null;
  return null;
}

function evaluateMarket({ checkpoint, marketKey, currentOdd, previousSnapshot }) {
  if (!checkpoint || !marketKey || !currentOdd?.odd || !previousSnapshot?.tracked_market_key || previousSnapshot.tracked_market_key !== marketKey || !previousSnapshot?.odd) {
    return { decision: "keep", score_penalty: 0, severe_adverse: false, relative_odd_change_percent: null, reasons: ["Karşılaştırılabilir doğrulanmış market snapshot'ı yok."] };
  }
  const relative = Number((((currentOdd.odd - previousSnapshot.odd) / previousSnapshot.odd) * 100).toFixed(1));
  if (relative >= 12) {
    return { decision: "downgrade", score_penalty: 3, severe_adverse: true, relative_odd_change_percent: relative, reasons: [`Doğrulanmış ${marketKey} oranı önceki kontrolden %${relative.toFixed(1)} yükseldi; piyasa seçime karşı belirgin hareket etti.`] };
  }
  if (relative >= 8) {
    return { decision: "downgrade", score_penalty: 3, severe_adverse: false, relative_odd_change_percent: relative, reasons: [`Doğrulanmış ${marketKey} oranı önceki kontrolden %${relative.toFixed(1)} yükseldi; ek ihtiyat uygulandı.`] };
  }
  if (relative <= -8) {
    return { decision: "keep", score_penalty: 0, severe_adverse: false, relative_odd_change_percent: relative, reasons: [`Doğrulanmış ${marketKey} oranı %${Math.abs(relative).toFixed(1)} düştü; piyasa hareketi seçim aleyhine değil.`] };
  }
  return { decision: "keep", score_penalty: 0, severe_adverse: false, relative_odd_change_percent: relative, reasons: [`Doğrulanmış ${marketKey} oran hareketi sınırlı (%${relative.toFixed(1)}).`] };
}

function snapshotFor({ checkpoint, marketKey, market, currentOdd, lineup, consensus, now }) {
  return {
    checkpoint,
    captured_at: new Date(now).toISOString(),
    tracked_market: market || null,
    tracked_market_key: marketKey || null,
    odd: currentOdd?.odd || null,
    odd_source: currentOdd?.source || null,
    lineup_risk_level: lineup?.lineup_risk_level || "Belirsiz",
    both_lineups_confirmed: Boolean(lineup?.home_lineup?.lineup_confirmed && lineup?.away_lineup?.lineup_confirmed),
    source_conflict_level: consensus?.conflict_level || "none",
    source_confidence_score: Number.isFinite(Number(consensus?.confidence_score)) ? Number(consensus.confidence_score) : null,
  };
}

function buildFinalCheckForMatch(row, context) {
  const now = context.now ?? Date.now();
  const minutes = minutesToKickoff(row, now);
  const checkpoint = checkpointFor(minutes);
  const lineup = lookupRow(context.lineupMap, row) || {};
  const consensus = lookupRow(context.consensusMap, row) || {};
  const previousAnalysis = lookupRow(context.analysisMap, row) || {};
  const existing = lookupRow(context.previousMap, row) || {};
  const previousSnapshot = previousCheckpointSnapshot(existing, checkpoint);
  const trackedMarket = previousAnalysis.recommended_market || previousAnalysis.market || row.recommended_market || row.market || null;
  const marketKey = canonicalMarketKey(trackedMarket);
  const currentOdd = verifiedMarketOdd(row, marketKey);
  const lineupAgeMinutes = freshnessMinutes(context.lineupGeneratedAt, now);
  const consensusAgeMinutes = freshnessMinutes(context.consensusGeneratedAt, now);
  const newsAgeMinutes = latestNewsAgeMinutes(row, context.teamNews, now);
  const general = evaluateGeneral({ checkpoint, lineup, consensus, lineupAgeMinutes, newsAgeMinutes, previousSnapshot });
  const market = evaluateMarket({ checkpoint, marketKey, currentOdd, previousSnapshot });
  const combinedBlock = market.severe_adverse && general.decision === "downgrade";
  const decision = combinedBlock ? "block" : worstDecision(general.decision, market.decision);
  const snapshots = { ...(existing.snapshots || {}) };
  if (checkpoint && !snapshots[checkpoint]) {
    snapshots[checkpoint] = snapshotFor({ checkpoint, marketKey, market: trackedMarket, currentOdd, lineup, consensus, now });
  }
  const reasons = [...general.reasons, ...market.reasons];
  if (combinedBlock) reasons.push("Güçlü aleyhe oran hareketi ile kadro/kaynak belirsizliği aynı anda görüldü; kupon bloke edildi.");
  return {
    match_name: matchName(row),
    home: teams(row).home,
    away: teams(row).away,
    date: String(row.date || row.tarih || "").slice(0, 10),
    start_time: row.start_time || row.time || "-",
    minutes_to_kickoff: minutes,
    checkpoint: checkpoint || "not_due",
    active: Boolean(checkpoint),
    tracked_market: trackedMarket,
    tracked_market_key: marketKey,
    current_odd: currentOdd?.odd || null,
    current_odd_source: currentOdd?.source || null,
    lineup_risk_level: lineup?.lineup_risk_level || "Belirsiz",
    both_lineups_confirmed: general.both_lineups_confirmed ?? false,
    lineup_freshness_minutes: lineupAgeMinutes,
    consensus_freshness_minutes: consensusAgeMinutes,
    news_context_freshness_minutes: newsAgeMinutes,
    source_conflict_level: consensus?.conflict_level || "none",
    source_confidence_score: Number.isFinite(Number(consensus?.confidence_score)) ? Number(consensus.confidence_score) : null,
    general_decision: general.decision,
    market_decision: market.decision,
    decision,
    general_score_penalty: general.score_penalty,
    market_score_penalty: market.score_penalty,
    market_severe_adverse: market.severe_adverse,
    relative_odd_change_percent: market.relative_odd_change_percent,
    reasons,
    snapshots,
  };
}

function applyPreMatchFinalCheck(item, check) {
  if (!check?.active) return { ...item, pre_match_final_check: check || null };
  const itemMarketKey = canonicalMarketKey(item?.selection || item?.market || item?.recommended_market);
  const marketApplies = Boolean(itemMarketKey && check.tracked_market_key && itemMarketKey === check.tracked_market_key);
  let effectiveDecision = check.general_decision || "keep";
  let penalty = Number(check.general_score_penalty || 0);
  const reasons = [...(check.reasons || [])];
  if (marketApplies) {
    effectiveDecision = worstDecision(effectiveDecision, check.market_decision || "keep");
    penalty += Number(check.market_score_penalty || 0);
    if (check.market_severe_adverse && (check.general_decision === "downgrade" || check.general_decision === "block")) {
      effectiveDecision = "block";
      penalty = Math.max(penalty, 12);
    }
  }
  if (effectiveDecision === "block") penalty = Math.max(penalty, 12);
  else if (effectiveDecision === "downgrade") penalty = Math.max(penalty, 4);
  const originalScore = Number(item?.model_score ?? item?.analysis_score ?? item?.score ?? 0);
  const adjustedScore = Math.max(0, Math.round(originalScore - penalty));
  const originalCompleteness = Number(item?.data_completeness || 0);
  const completenessPenalty = effectiveDecision === "block" ? 8 : effectiveDecision === "downgrade" ? 3 : 0;
  const adjustedCompleteness = Math.max(0, originalCompleteness - completenessPenalty);
  const risk = effectiveDecision === "block" ? "Yüksek" : effectiveDecision === "downgrade" && riskRank(item?.risk) < 2 ? "Orta" : item?.risk;
  const effectiveCheck = {
    ...check,
    market_applies_to_current_selection: marketApplies,
    effective_decision: effectiveDecision,
    applied_score_penalty: penalty,
    original_model_score: originalScore,
    adjusted_model_score: adjustedScore,
  };
  const signal = check.active ? `Maç önü ${check.checkpoint} son kontrol: ${effectiveDecision === "block" ? "kupon bloke" : effectiveDecision === "downgrade" ? "güven düşürüldü" : "seçim korundu"}.` : "";
  return {
    ...item,
    score: adjustedScore,
    model_score: adjustedScore,
    analysis_score: adjustedScore,
    confidence: `${adjustedScore}%`,
    trust_score: `${adjustedScore}/100`,
    data_completeness: adjustedCompleteness,
    risk,
    data_gap_risk: effectiveDecision === "block" ? "Yüksek" : effectiveDecision === "downgrade" ? "Orta" : item?.data_gap_risk,
    pre_match_final_check: effectiveCheck,
    pro_signals: signal ? [signal, ...(Array.isArray(item?.pro_signals) ? item.pro_signals : [])] : item?.pro_signals,
  };
}

function runPreMatchFinalCheck(options = {}) {
  const now = options.now ?? Date.now();
  const fixtures = options.fixtures || readJson(path.join(dataDir, "fixtures.json"), []);
  const lineupDb = options.lineupDb || readJson(path.join(dataDir, "lineup-signals.json"), { matches: [] });
  const consensusDb = options.consensusDb || readJson(path.join(dataDir, "team-source-consensus.json"), { matches: [] });
  const analysisDb = options.analysisDb || readJson(path.join(dataDir, "robot-analysis.json"), { matches: [] });
  const teamNews = options.teamNews || readJson(path.join(dataDir, "team-status-auto.json"), { teams: {} });
  const previous = options.previous || readJson(outputPath, { matches: [] });
  const context = {
    now,
    lineupMap: lookupMap(lineupDb),
    consensusMap: lookupMap(consensusDb),
    analysisMap: lookupMap({ matches: [...(analysisDb.matches || []), ...(analysisDb.watchlist || [])] }),
    previousMap: lookupMap(previous),
    teamNews,
    lineupGeneratedAt: lineupDb.generated_at,
    consensusGeneratedAt: consensusDb.generated_at,
  };
  const matches = (Array.isArray(fixtures) ? fixtures : [])
    .filter((row) => !/live|finished|ended|cancel/i.test(String(row.status || "scheduled")))
    .map((row) => buildFinalCheckForMatch(row, context));
  const output = {
    schema_version: 1,
    version: "pre-match-final-check-v1",
    generated_at: new Date(now).toISOString(),
    policy: "T60/T30/T10 kontrolü yalnız doğrulanmış isimli market oranı, kadro/ilk 11 ve kaynak uzlaşısını kullanır. Tahmini raw market kullanılmaz. Olasılık yüzdesi doğrudan değiştirilmez; yalnız risk, model gücü ve kupon uygunluğu frenlenir.",
    active_match_count: matches.filter((row) => row.active).length,
    blocked_match_count: matches.filter((row) => row.decision === "block").length,
    downgraded_match_count: matches.filter((row) => row.decision === "downgrade").length,
    matches,
  };
  if (options.write !== false) writeJson(outputPath, output);
  return output;
}

if (require.main === module) {
  const output = runPreMatchFinalCheck();
  console.log(`Pre-match final check updated: active=${output.active_match_count}, downgrade=${output.downgraded_match_count}, block=${output.blocked_match_count}.`);
}

module.exports = {
  applyPreMatchFinalCheck,
  buildFinalCheckForMatch,
  canonicalMarketKey,
  checkpointFor,
  evaluateGeneral,
  evaluateMarket,
  freshnessMinutes,
  kickoffTimestamp,
  matchKey,
  minutesToKickoff,
  runPreMatchFinalCheck,
  verifiedMarketOdd,
  worstDecision,
};
