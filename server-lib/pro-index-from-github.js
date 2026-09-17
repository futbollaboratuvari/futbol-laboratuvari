"use strict";

const {
  buildCalibration,
  compactMatch,
  selectProMatches,
} = require("../scripts/build-pro-analysis-index");

const DEFAULT_ROBOT_URL = process.env.FL_PRO_ROBOT_URL
  || "https://raw.githubusercontent.com/futbollaboratuvari/futbol-laboratuvari/main/data/robot-analysis.json";
const DEFAULT_HISTORY_URL = process.env.FL_PRO_HISTORY_URL
  || "https://raw.githubusercontent.com/futbollaboratuvari/futbol-laboratuvari/main/data/analiz_sonuclari.json";
const FALLBACK_MODEL_VERSION = "pro13-btts-conditioned-v3";
const CACHE_KEY = "__FL_PRO_GITHUB_INDEX_CACHE_V1__";
const DEFAULT_CACHE_TTL_MS = 60 * 1000;
const MAX_ROBOT_BYTES = 4 * 1024 * 1024;
const MAX_HISTORY_BYTES = 2 * 1024 * 1024;

function cacheState() {
  globalThis[CACHE_KEY] = globalThis[CACHE_KEY] || {
    sourceKey: "",
    value: null,
    expiresAt: 0,
    promise: null,
  };
  return globalThis[CACHE_KEY];
}

function resetRemoteProIndexCache() {
  globalThis[CACHE_KEY] = {
    sourceKey: "",
    value: null,
    expiresAt: 0,
    promise: null,
  };
}

function finite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function validateRobotPayload(payload) {
  if (!payload || typeof payload !== "object" || !Array.isArray(payload.matches)) {
    throw new Error("invalid_remote_robot_analysis");
  }
  return payload;
}

function safeHistory(payload) {
  if (!payload || typeof payload !== "object") {
    return { completed_items: [], performance: {} };
  }
  return {
    ...payload,
    completed_items: Array.isArray(payload.completed_items) ? payload.completed_items : [],
    performance: payload.performance && typeof payload.performance === "object" ? payload.performance : {},
  };
}

async function fetchJson(url, options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const maxBytes = Number(options.maxBytes || MAX_ROBOT_BYTES);
  const timeoutMs = Number(options.timeoutMs || 6000);
  const requestOptions = {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "User-Agent": "futbol-laboratuvari-pro-runtime",
    },
  };
  if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
    requestOptions.signal = AbortSignal.timeout(timeoutMs);
  }

  const response = await fetchImpl(url, requestOptions);
  if (!response || !response.ok) {
    throw new Error(`remote_pro_http_${response?.status || "unknown"}`);
  }

  const declaredLength = Number(response.headers?.get?.("content-length") || 0);
  if (declaredLength && declaredLength > maxBytes) {
    throw new Error("remote_pro_payload_too_large");
  }

  const text = await response.text();
  if (!text || Buffer.byteLength(text, "utf8") > maxBytes) {
    throw new Error("remote_pro_payload_too_large");
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("remote_pro_invalid_json");
  }
}

function buildProIndexFromPayload(robotPayload, historyPayload = {}) {
  const robot = validateRobotPayload(robotPayload);
  const history = safeHistory(historyPayload);
  const sourceMatches = Array.isArray(robot.matches) ? robot.matches : [];
  const matches = selectProMatches(sourceMatches).map((item) => compactMatch(item, robot));
  const ready = matches.filter((item) => item.model_score >= 60
    && item.data_completeness >= 35
    && !/değerli market yok|degerli market yok|oynama/i.test(item.recommended_market));

  return {
    schema_version: 2,
    generated_at: robot.generated_at || new Date().toISOString(),
    date: robot.date || "",
    timezone: "Europe/Istanbul",
    engine: robot.engine || "Futbol Laboratuvarı PRO 13",
    model_version: robot.model_version || FALLBACK_MODEL_VERSION,
    score_semantics: "model_score is signal strength from 0 to 100; it is not an outcome probability",
    source: "github-main robot-analysis protected runtime projection",
    source_generated_at: robot.generated_at || null,
    summary: {
      match_count: matches.length,
      source_match_count: sourceMatches.length,
      pro_ready_count: ready.length,
      coupon_candidate_count: matches.filter((item) => item.include_in_coupon).length,
      matchup_verified_count: matches.filter((item) => Number(item.team_intelligence?.matchup_analysis?.coverage_score || 0) >= 65).length,
      average_data_completeness: matches.length
        ? Math.round(matches.reduce((sum, item) => sum + item.data_completeness, 0) / matches.length)
        : 0,
    },
    calibration: buildCalibration(history),
    matches,
  };
}

async function readRemoteProIndex(options = {}) {
  const robotUrl = String(options.robotUrl || DEFAULT_ROBOT_URL);
  const historyUrl = String(options.historyUrl || DEFAULT_HISTORY_URL);
  const fetchImpl = options.fetchImpl || fetch;
  const now = typeof options.now === "function" ? options.now : Date.now;
  const rawTtl = finite(options.cacheTtlMs ?? process.env.FL_PRO_REMOTE_CACHE_TTL_MS);
  const cacheTtlMs = rawTtl === null
    ? DEFAULT_CACHE_TTL_MS
    : Math.max(15000, Math.min(5 * 60 * 1000, rawTtl));
  const sourceKey = `${robotUrl}|${historyUrl}`;
  const cache = cacheState();
  const currentTime = Number(now());

  if (cache.sourceKey === sourceKey && cache.value && currentTime < cache.expiresAt) {
    return cache.value;
  }
  if (cache.sourceKey === sourceKey && cache.promise) {
    return cache.promise;
  }

  const promise = (async () => {
    const robot = validateRobotPayload(await fetchJson(robotUrl, {
      fetchImpl,
      maxBytes: MAX_ROBOT_BYTES,
      timeoutMs: 6000,
    }));

    let history = { completed_items: [], performance: {} };
    try {
      history = safeHistory(await fetchJson(historyUrl, {
        fetchImpl,
        maxBytes: MAX_HISTORY_BYTES,
        timeoutMs: 5000,
      }));
    } catch {
      // Kalibrasyon geçmişi geçici olarak okunamazsa güncel maç verisi yine de kullanılabilir.
    }

    return buildProIndexFromPayload(robot, history);
  })();

  cache.sourceKey = sourceKey;
  cache.promise = promise;
  try {
    const value = await promise;
    cache.value = value;
    cache.expiresAt = Number(now()) + cacheTtlMs;
    return value;
  } finally {
    cache.promise = null;
  }
}

module.exports = {
  DEFAULT_HISTORY_URL,
  DEFAULT_ROBOT_URL,
  buildProIndexFromPayload,
  fetchJson,
  readRemoteProIndex,
  resetRemoteProIndexCache,
  safeHistory,
  validateRobotPayload,
};
