import { createClient } from "npm:@supabase/supabase-js@2.112.2";

const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const ROBOT_URL = "https://raw.githubusercontent.com/futbollaboratuvari/futbol-laboratuvari/main/data/robot-analysis.json";
const HISTORY_URL = "https://raw.githubusercontent.com/futbollaboratuvari/futbol-laboratuvari/main/data/analiz_sonuclari.json";
const MAX_ROBOT_BYTES = 12 * 1024 * 1024;
const MAX_HISTORY_BYTES = 2 * 1024 * 1024;
const CACHE_MS = 60 * 1000;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 20;
const TRUSTED = new Set([
  "https://futbollaboratuuvari.org",
  "https://www.futbollaboratuuvari.org",
]);
const enc = new TextEncoder();

type AnyRow = Record<string, any>;
type CacheState = { expiresAt: number; value: any | null; promise: Promise<any> | null };
const cache: CacheState = { expiresAt: 0, value: null, promise: null };
const rate = new Map<string, { startedAt: number; count: number }>();

const clean = (v: any) => String(v ?? "")
  .toLocaleLowerCase("tr-TR").replace(/ı/g, "i").normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

const finite = (v: any): number | null => {
  if (v === undefined || v === null || v === "" || v === "-") return null;
  const n = Number(String(v).replace("%", "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

const todayTR = () => new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit",
}).format(new Date());

const allowedOrigin = (req: Request) => {
  const value = req.headers.get("origin") || "";
  return !value || TRUSTED.has(value);
};

const headers = (req: Request) => {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": TRUSTED.has(origin) ? origin : "https://www.futbollaboratuuvari.org",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Cache-Control": "private, no-store, max-age=0",
    "Pragma": "no-cache",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
  };
};

const json = (req: Request, status: number, body: any) => new Response(JSON.stringify(body), {
  status,
  headers: { ...headers(req), "Content-Type": "application/json; charset=utf-8" },
});

async function sha(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(value));
  return [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function normCode(value: any) {
  return String(value ?? "").trim().replace(/\s+/g, "").toUpperCase();
}

function requestIp(req: Request) {
  return String(req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown")
    .split(",")[0].trim().slice(0, 80);
}

function rateLimited(req: Request) {
  const now = Date.now();
  const key = requestIp(req);
  const current = rate.get(key);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    rate.set(key, { startedAt: now, count: 1 });
    return false;
  }
  current.count += 1;
  return current.count > MAX_ATTEMPTS;
}

async function readJson(req: Request) {
  try { return await req.json(); } catch { return {}; }
}

async function fetchJson(url: string, maxBytes: number) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: { "Accept": "application/json", "User-Agent": "futbol-laboratuvari-pro-supabase" },
  });
  if (!response.ok) throw new Error(`source_http_${response.status}`);
  const declared = Number(response.headers.get("content-length") || 0);
  if (declared && declared > maxBytes) throw new Error("source_payload_too_large");
  const text = await response.text();
  if (!text || enc.encode(text).length > maxBytes) throw new Error("source_payload_too_large");
  return JSON.parse(text);
}

function teamsOf(item: AnyRow) {
  if (item.home && item.away) return { home: String(item.home).trim(), away: String(item.away).trim() };
  if (item.home_team_name && item.away_team_name) return { home: String(item.home_team_name).trim(), away: String(item.away_team_name).trim() };
  const parts = String(item.match_name || item.match || "").split(/\s+(?:vs\.?|v|-)\s+/i);
  return { home: String(parts[0] || "Ev sahibi").trim(), away: String(parts[1] || "Deplasman").trim() };
}

function matchId(item: AnyRow, date: string) {
  const teams = teamsOf(item);
  const code = String(item.match_code || item.matchCode || item.iddaa_event_id || "").trim();
  return code || [date, item.start_time || item.time, clean(teams.home), clean(teams.away)].filter(Boolean).join("-");
}

function compactMetrics(item: AnyRow) {
  const metrics = item.metrics || item.analysis_metrics || {};
  const poisson = metrics.poisson || item.poisson || {};
  const out: AnyRow = {};
  for (const key of [
    "homeScoredLast10", "awayScoredLast10", "homeConcededLast10", "awayConcededLast10",
    "bttsPercent", "over25Percent", "over35Percent", "firstHalfGoalTrend",
    "secondHalfGoalTrend", "leagueGoalAverage", "metric_quality",
  ]) {
    const value = metrics[key];
    if (value !== undefined && value !== null && value !== "") out[key] = value;
  }
  const homeLambda = finite(poisson.homeLambda ?? poisson.home_lambda);
  const awayLambda = finite(poisson.awayLambda ?? poisson.away_lambda);
  if (homeLambda !== null || awayLambda !== null) {
    out.poisson = { home_lambda: homeLambda, away_lambda: awayLambda, samples: finite(poisson.samples) };
  }
  return out;
}

function compactOption(item: AnyRow, source: string) {
  if (!item || typeof item !== "object") return null;
  if (String(item.odd_source_type || "") === "raw_market_guess_odds") return null;
  if (item.specialist_eligible === false || clean(item.specialist_decision || item.market_specialist?.decision) === "block") return null;
  const market = String(item.label || item.market || item.recommended_market || "").trim();
  const odd = finite(item.odd ?? item.odds ?? item.estimated_odds ?? item.bookmaker_odds ?? item.recommended_odd);
  const probability = finite(item.estimated_probability ?? item.scenario_probability);
  const score = finite(item.model_score ?? item.analysis_score ?? item.confidence ?? item.model_confidence);
  if (!market || odd === null || probability === null || score === null) return null;
  if (odd < 1.45) return null;
  return {
    market,
    odd,
    model_score: score,
    estimated_probability: probability,
    market_probability: finite(item.market_probability ?? item.implied_probability),
    edge_percent: finite(item.edge_percent),
    data_completeness: finite(item.data_completeness) || 0,
    risk_level: String(item.risk_level || item.risk || "Belirsiz"),
    independent_evidence: item.independent_evidence !== false,
    specialist_decision: String(item.specialist_decision || item.market_specialist?.decision || "keep"),
    specialist_eligible: item.specialist_eligible !== false,
    source,
    signals: (Array.isArray(item.signals) ? item.signals : item.robot_reason ? [item.robot_reason] : [])
      .map(String).filter(Boolean).slice(0, 4),
  };
}

function compactOptions(item: AnyRow) {
  const rows: any[] = [];
  const blockedSpecialistMarkets = new Set<string>();
  const marketKey = (option: AnyRow) => clean(
    option?.label || option?.market || option?.recommended_market || option?.selection || ""
  );

  // Specialist robot outputs are authoritative for their canonical market.
  // A blocked specialist market is recorded as a tombstone so the same market
  // cannot re-enter later from raw analysis_options, goal candidates or primary.
  const specialistOutputs = item.specialist_outputs && typeof item.specialist_outputs === "object"
    ? item.specialist_outputs
    : {};
  for (const [specialistId, bucket] of Object.entries(specialistOutputs)) {
    for (const option of Array.isArray((bucket as AnyRow)?.candidates) ? (bucket as AnyRow).candidates : []) {
      const key = marketKey(option);
      const decision = clean(option?.specialist_decision || option?.market_specialist?.decision || "keep");
      if (option?.specialist_eligible === false || decision === "block") {
        if (key) blockedSpecialistMarkets.add(key);
        continue;
      }
      const compact = compactOption(option, `specialist_${specialistId}`);
      if (compact) rows.push(compact);
    }
  }

  for (const option of Array.isArray(item.analysis_options) ? item.analysis_options : []) {
    if (blockedSpecialistMarkets.has(marketKey(option))) continue;
    const compact = compactOption(option, "robot_multi_market");
    if (compact) rows.push(compact);
  }
  for (const option of Array.isArray(item.goal_market_candidates) ? item.goal_market_candidates : []) {
    if (blockedSpecialistMarkets.has(marketKey(option))) continue;
    const compact = compactOption(option, "goal_market_specialist");
    if (compact) rows.push(compact);
  }
  const primaryInput = {
    market: item.recommended_market || item.market,
    odd: item.recommended_odd ?? item.estimated_odds ?? item.bookmaker_odds,
    model_score: item.model_score ?? item.analysis_score ?? item.confidence_score,
    estimated_probability: item.estimated_probability,
    market_probability: item.market_probability,
    edge_percent: item.edge_percent,
    data_completeness: item.data_completeness,
    risk_level: item.risk_level || item.risk,
    independent_evidence: item.independent_evidence,
    signals: item.signals || item.pro_signals,
  };
  const primary = blockedSpecialistMarkets.has(marketKey(primaryInput))
    ? null
    : compactOption(primaryInput, "primary");
  if (primary) rows.push(primary);

  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = clean(row.market);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  }).sort((a, b) => Number(b.model_score || 0) - Number(a.model_score || 0)
    || Number(b.estimated_probability || 0) - Number(a.estimated_probability || 0)).slice(0, 16);
}

function compactBtts(value: any) {
  if (!value || typeof value !== "object" || value.available !== true) return null;
  const outcome = (item: any) => item && typeof item === "object" ? {
    key: String(item.key || ""),
    label: String(item.label || ""),
    odd: finite(item.odd),
    model_score: finite(item.model_score),
    estimated_probability: finite(item.estimated_probability),
    market_probability: finite(item.market_probability),
    independent_probability: finite(item.independent_probability),
    edge_percent: finite(item.edge_percent),
    data_completeness: finite(item.data_completeness) || 0,
    independent_evidence: Boolean(item.independent_evidence),
    risk_level: String(item.risk_level || item.risk || "Yüksek"),
    signals: Array.isArray(item.signals) ? item.signals.map(String).filter(Boolean).slice(0, 5) : [],
  } : null;
  const yes = outcome(value.outcomes?.bttsYes);
  const no = outcome(value.outcomes?.bttsNo);
  if (!yes && !no) return null;
  return {
    available: true,
    pair_complete: Boolean(value.pair_complete && yes && no),
    trusted_odds: Boolean(value.trusted_odds),
    recommended_key: String(value.recommended_key || ""),
    recommended_market: String(value.recommended_market || "Görüş oluşmadı"),
    recommendation_status: String(value.recommendation_status || "insufficient_data"),
    outcomes: { bttsYes: yes, bttsNo: no },
  };
}

function compactMatch(item: AnyRow, parent: AnyRow) {
  const teams = teamsOf(item);
  const date = String(item.date || parent.date || "").slice(0, 10);
  const score = finite(item.model_score ?? item.analysis_score ?? item.confidence_score) || 0;
  const completeness = finite(item.data_completeness) || 0;
  const market = String(item.recommended_market || item.market || "Değerli market yok");
  const btts = compactBtts(item.btts_analysis || item.bttsAnalysis);
  const signals = (Array.isArray(item.signals) && item.signals.length ? item.signals
    : Array.isArray(item.pro_signals) && item.pro_signals.length ? item.pro_signals
    : item.robot_comment ? [item.robot_comment] : []).map(String).filter(Boolean).slice(0, 3);
  return {
    id: matchId(item, date),
    date,
    time: String(item.start_time || item.time || "").slice(0, 5),
    league: String(item.league || item.competition_name || "Lig"),
    home: teams.home,
    away: teams.away,
    match_code: String(item.match_code || item.matchCode || ""),
    recommended_market: market,
    recommended_odd: finite(item.recommended_odd ?? item.estimated_odds ?? item.bookmaker_odds),
    model_score: score,
    score_type: item.score_type || "signal_strength",
    estimated_probability: finite(item.estimated_probability),
    market_probability: finite(item.market_probability),
    edge_percent: finite(item.edge_percent),
    data_completeness: completeness,
    data_quality: String(item.data_quality || (!item.independent_evidence ? "Sınırlı" : completeness >= 70 ? "Yüksek" : completeness >= 45 ? "Orta" : "Sınırlı")),
    evidence_mode: String(item.evidence_mode || "market_baseline"),
    independent_evidence: Boolean(item.independent_evidence),
    probability_source: Array.isArray(item.probability_source) ? item.probability_source.slice(0, 4) : [],
    data_gap_risk: String(item.data_gap_risk || "Yüksek"),
    risk_level: String(item.risk_level || item.risk || "Yüksek"),
    squad_risk_level: String(item.squad_risk_level || item.team_intelligence?.squad_risk_level || "Belirsiz"),
    lineup_risk_level: String(item.lineup_risk_level || item.team_intelligence?.lineup_risk_level || "Belirsiz"),
    team_status_verified_count: Number(item.team_status_verified_count || item.team_intelligence?.squad_verified_team_count || 0),
    named_player_count: Number(item.named_player_count || item.team_intelligence?.named_player_count || 0),
    analysis_options: compactOptions(item),
    include_in_coupon: Boolean(item.include_in_coupon),
    value_label: String(item.value_label || "Piyasa ile Uyumlu"),
    metrics: compactMetrics(item),
    ...(btts ? { btts_analysis: btts } : {}),
    signals,
    model_version: String(item.model_version || parent.model_version || "pro13"),
  };
}

function statusOf(item: AnyRow) {
  const v = clean(item.status || item.result);
  if (["won", "kazandi", "dogru"].includes(v)) return "won";
  if (["lost", "kaybetti", "yanlis"].includes(v)) return "lost";
  return "pending";
}

function marketGroup(value: any) {
  const market = clean(value);
  if (/^ms |mac sonucu/.test(market)) return "match_result";
  if (/kg |btts|karsilikli gol/.test(market)) return "btts";
  if (/ust|alt|gol/.test(market)) return "goals";
  return "other";
}

function buildCalibration(history: AnyRow) {
  const completed = Array.isArray(history?.completed_items) ? history.completed_items : [];
  const settled = completed.filter((item: AnyRow) => ["won", "lost"].includes(statusOf(item)));
  const groups = new Map<string, any>();
  const probabilityRows: { probability: number; outcome: number }[] = [];
  for (const item of settled) {
    const key = item.market_group || marketGroup(item.market || item.prediction);
    const row = groups.get(key) || { key, measured: 0, won: 0, lost: 0, success_rate: null };
    row.measured += 1;
    if (statusOf(item) === "won") row.won += 1; else row.lost += 1;
    row.success_rate = Math.round((row.won / row.measured) * 100);
    groups.set(key, row);
    const p = finite(item.estimated_probability);
    if (p !== null && p >= 0 && p <= 100) probabilityRows.push({ probability: p / 100, outcome: statusOf(item) === "won" ? 1 : 0 });
  }
  const measured = settled.length;
  const won = settled.filter((item: AnyRow) => statusOf(item) === "won").length;
  const brier = probabilityRows.length
    ? probabilityRows.reduce((sum, item) => sum + ((item.probability - item.outcome) ** 2), 0) / probabilityRows.length
    : null;
  return {
    measured_count: measured,
    won_count: won,
    lost_count: measured - won,
    success_rate: measured ? Math.round((won / measured) * 100) : null,
    groups: [...groups.values()].sort((a, b) => b.measured - a.measured),
    probability_sample_count: probabilityRows.length,
    brier_score: brier === null ? null : Number(brier.toFixed(4)),
    calibration_status: probabilityRows.length >= 30 ? "measured" : "collecting_probability_history",
  };
}

function buildIndex(robot: AnyRow, history: AnyRow) {
  if (!robot || !Array.isArray(robot.matches)) throw new Error("invalid_robot_analysis");
  const today = todayTR();
  const blocked = /^(live|finished|ended|cancelled|canceled|postponed|suspended|abandoned|filtered_old_fixture)$/i;
  const source = robot.matches.filter((item: AnyRow) => {
    const date = String(item?.date || robot.date || "").slice(0, 10);
    return date >= today && !blocked.test(String(item?.status || "scheduled"));
  });
  const matches = source.map((item: AnyRow) => compactMatch(item, robot));
  const ready = matches.filter((item: AnyRow) => item.model_score >= 60
    && item.data_completeness >= 35
    && !/değerli market yok|degerli market yok|oynama/i.test(item.recommended_market));
  return {
    schema_version: 3,
    generated_at: robot.generated_at || new Date().toISOString(),
    date: robot.date || today,
    timezone: "Europe/Istanbul",
    engine: robot.engine || "Futbol Laboratuvarı PRO",
    model_version: robot.model_version || "pro13",
    score_semantics: "model_score is signal strength from 0 to 100; it is not an outcome probability",
    source: "github-main robot-analysis protected Supabase projection",
    runtime_source: "supabase_edge",
    summary: {
      match_count: matches.length,
      source_match_count: Number(robot.matches.length || 0),
      pro_ready_count: ready.length,
      coupon_candidate_count: matches.filter((item: AnyRow) => item.include_in_coupon).length,
      average_data_completeness: matches.length
        ? Math.round(matches.reduce((sum: number, item: AnyRow) => sum + Number(item.data_completeness || 0), 0) / matches.length)
        : 0,
      analysis_option_count: matches.reduce((sum: number, item: AnyRow) => sum + (Array.isArray(item.analysis_options) ? item.analysis_options.length : 0), 0),
    },
    calibration: buildCalibration(history || {}),
    matches,
  };
}

async function readLastGood() {
  const { data } = await db.from("pro_analysis_cache")
    .select("payload,source_generated_at,source_sha,updated_at")
    .eq("cache_key", "current")
    .maybeSingle();
  return data || null;
}

function hasCurrentMatches(value: any) {
  const today = todayTR();
  return Boolean(value && Array.isArray(value.matches)
    && value.matches.some((item: AnyRow) => String(item?.date || "").slice(0, 10) >= today));
}

async function saveLastGood(value: any) {
  const { error } = await db.from("pro_analysis_cache").upsert({
    cache_key: "current",
    payload: value,
    source_generated_at: value?.generated_at || null,
    source_sha: String(value?.generated_at || value?.date || ""),
    updated_at: new Date().toISOString(),
  }, { onConflict: "cache_key" });
  if (error) console.error("pro_analysis_cache_upsert", error.message);
}

async function loadIndex() {
  const now = Date.now();
  if (cache.value && now < cache.expiresAt) return cache.value;
  if (cache.promise) return cache.promise;

  cache.promise = (async () => {
    try {
      const robot = await fetchJson(ROBOT_URL, MAX_ROBOT_BYTES);
      let history: AnyRow = {};
      try { history = await fetchJson(HISTORY_URL, MAX_HISTORY_BYTES); } catch { history = {}; }
      const value = { ...buildIndex(robot, history), runtime_source: "github_main_fresh" };
      await saveLastGood(value);
      return value;
    } catch (freshError) {
      const stored = await readLastGood();
      if (stored?.payload && hasCurrentMatches(stored.payload)) {
        return {
          ...stored.payload,
          runtime_source: "supabase_last_good_cache",
          source_warning: "fresh_source_temporarily_unavailable",
          cache_updated_at: stored.updated_at || null,
        };
      }
      throw freshError;
    }
  })();

  try {
    const value = await cache.promise;
    cache.value = value;
    cache.expiresAt = Date.now() + CACHE_MS;
    return value;
  } finally {
    cache.promise = null;
  }
}

async function verifyMembership(code: string) {
  const hash = await sha(code);
  const { data: m, error } = await db.from("memberships")
    .select("code_label,plan_code,plan_name,remaining_analysis_count,active,expires_at")
    .eq("code_hash", hash).single();
  if (error || !m || !m.active) return { ok: false, reason: "membership_invalid_or_expired" };
  if (m.expires_at && new Date(m.expires_at).getTime() <= Date.now()) return { ok: false, reason: "membership_invalid_or_expired" };
  const founder = /founder|kurucu/i.test(`${m.plan_code || ""} ${m.plan_name || ""}`);
  if (!founder && Number(m.remaining_analysis_count) <= 0) return { ok: false, reason: "membership_rights_exhausted" };
  return {
    ok: true,
    membership: {
      planCode: m.plan_code,
      planName: m.plan_name,
      remainingAnalysisCount: m.remaining_analysis_count,
      expiresAt: m.expires_at,
      codeLabel: m.code_label,
      active: true,
    },
  };
}

Deno.serve(async (req: Request) => {
  if (!allowedOrigin(req)) return json(req, 403, { ok: false, error: "origin_not_allowed" });
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: headers(req) });

  const url = new URL(req.url);
  if (req.method === "GET" && url.searchParams.get("action") === "health") {
    try {
      const data = await loadIndex();
      const families = new Set<string>();
      for (const match of data.matches || []) {
        for (const option of match.analysis_options || []) {
          const token = clean(option.market);
          if (/ilk yari.*ikinci yari.*kg|iy kg.*2y kg/.test(token)) families.add("iy_2y_kg");
          else if (/ilk yari kg|1 yari kg/.test(token)) families.add("ilk_yari_kg");
          else if (/ikinci yari kg|2 yari kg/.test(token)) families.add("ikinci_yari_kg");
          else if (/6 gol|6 plus|6 ve ustu/.test(token)) families.add("6_plus");
          else if (/3 5 ust/.test(token)) families.add("3_5_ust");
          else if (/2 5 ust/.test(token)) families.add("2_5_ust");
          else if (/kg var|kg yok|btts/.test(token)) families.add("kg");
          else if (/^ms |mac sonucu/.test(token)) families.add("ms");
        }
      }
      return json(req, 200, {
        ok: true,
        service: "fl-pro-analysis",
        version: 1,
        runtime: "supabase-edge",
        source_date: data.date,
        generated_at: data.generated_at,
        match_count: data.summary?.match_count || 0,
        analysis_option_count: data.summary?.analysis_option_count || 0,
        market_families: [...families],
      });
    } catch (e) {
      return json(req, 503, { ok: false, service: "fl-pro-analysis", error: String((e as Error)?.message || e) });
    }
  }

  if (req.method !== "POST") return json(req, 405, { ok: false, error: "method_not_allowed" });
  if (rateLimited(req)) return json(req, 429, { ok: false, error: "too_many_attempts" });

  try {
    const body = await readJson(req);
    const code = normCode(body.code);
    if (code.length < 4 || code.length > 128) return json(req, 400, { ok: false, error: "membership_code_required" });
    const verified = await verifyMembership(code);
    if (!verified.ok) {
      const status = verified.reason === "membership_rights_exhausted" ? 403 : 401;
      return json(req, status, { ok: false, error: verified.reason });
    }
    const data = await loadIndex();
    return json(req, 200, { ok: true, membership: verified.membership, data });
  } catch (e) {
    console.error("fl-pro-analysis", e);
    return json(req, 503, { ok: false, error: "protected_analysis_unavailable" });
  }
});
