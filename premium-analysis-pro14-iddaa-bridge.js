(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) {
    let attempts = 0;
    const boot = () => {
      attempts += 1;
      if (root.FLPremiumAnalysisCore?.pro14MarketExpansionVersion) {
        api.install(root.FLPremiumAnalysisCore);
        return;
      }
      if (attempts < 20) root.setTimeout?.(boot, 25);
    };
    boot();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const VERSION = "pro14-iddaa-structured-market-bridge-v1";
  const EXTENDED_KEYS = new Set([
    "over15", "over35", "homeGoal", "awayGoal",
    "htft11", "htft1x", "htft12", "htftx1", "htftxx", "htftx2", "htft21", "htft2x", "htft22",
  ]);

  const normalizeText = (value) => String(value ?? "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  const numberOdd = (value) => {
    const parsed = Number(String(value ?? "").replace(",", "."));
    return Number.isFinite(parsed) && parsed > 1 ? parsed : null;
  };

  const canonicalMarket = (value) => {
    const text = normalizeText(value);
    const patterns = [
      ["htft11", /(?:iy ms|ilk yari mac sonucu|ht ft) 1 1/],
      ["htft1x", /(?:iy ms|ilk yari mac sonucu|ht ft) 1 x/],
      ["htft12", /(?:iy ms|ilk yari mac sonucu|ht ft) 1 2/],
      ["htftx1", /(?:iy ms|ilk yari mac sonucu|ht ft) x 1/],
      ["htftxx", /(?:iy ms|ilk yari mac sonucu|ht ft) x x/],
      ["htftx2", /(?:iy ms|ilk yari mac sonucu|ht ft) x 2/],
      ["htft21", /(?:iy ms|ilk yari mac sonucu|ht ft) 2 1/],
      ["htft2x", /(?:iy ms|ilk yari mac sonucu|ht ft) 2 x/],
      ["htft22", /(?:iy ms|ilk yari mac sonucu|ht ft) 2 2/],
    ];
    for (const [key, pattern] of patterns) if (pattern.test(text)) return key;
    if (/1 5.*ust|over 1 5|over15/.test(text)) return "over15";
    if (/3 5.*ust|over 3 5|over35/.test(text)) return "over35";
    if (/ev sahibi gol atar|home.*goal|home.*score/.test(text)) return "homeGoal";
    if (/deplasman gol atar|away.*goal|away.*score/.test(text)) return "awayGoal";
    return "";
  };

  const marketRows = (input) => {
    const raw = input?.source && typeof input.source === "object" ? input.source : input;
    const rows = [
      ...(Array.isArray(raw?.market_groups) ? raw.market_groups : []),
      ...(Array.isArray(raw?.raw_market_blocks) ? raw.raw_market_blocks : []),
    ];
    return rows.map((row) => ({
      title: String(row?.title || ""),
      special: String(row?.special_odd_value ?? "").replace(",", "."),
      outcomes: (Array.isArray(row?.outcomes) ? row.outcomes : Array.isArray(row?.markets) ? row.markets : [])
        .map((outcome) => ({
          label: String(outcome?.label ?? outcome?.name ?? outcome?.key ?? ""),
          odd: numberOdd(outcome?.odd),
        }))
        .filter((outcome) => outcome.odd !== null),
    })).filter((row) => row.outcomes.length);
  };

  const htftCode = (label) => {
    const folded = normalizeText(label).replace(/\bx\b/g, "0");
    const tokens = folded.match(/\b[012]\b/g);
    if (tokens?.length >= 2) return `${tokens[0]}${tokens[1]}`;
    const compact = folded.replace(/[^012]/g, "");
    return compact.length >= 2 ? compact.slice(0, 2) : "";
  };

  const findHtft = (rows) => rows
    .map((row) => ({ ...row, coded: row.outcomes.map((outcome) => ({ ...outcome, code: htftCode(outcome.label) })).filter((outcome) => outcome.code) }))
    .find((row) => {
      const title = normalizeText(row.title);
      const codeCount = new Set(row.coded.map((outcome) => outcome.code)).size;
      const titleLooksRight = (title.includes("ilk yari") || title.includes("devre") || title.includes("iy ms") || title.includes("ht ft"))
        && title.includes("mac sonucu");
      return codeCount >= 6 && (titleLooksRight || codeCount === 9);
    }) || null;

  const findThreeWay = (rows, half) => rows.find((row) => {
    const title = normalizeText(row.title);
    if (half) return (title.includes("ilk yari") || title.includes("1 yari") || title.includes("devre"))
      && (title.includes("sonucu") || title.includes("kim kazanir"))
      && !title.includes("mac sonucu");
    return (title === "mac sonucu" || title.includes("90 dakika mac sonucu")) && !title.includes("ilk yari");
  }) || null;

  const threeWayValues = (row) => {
    if (!row) return {};
    const values = {};
    row.outcomes.forEach((outcome) => {
      const label = normalizeText(outcome.label);
      if (/^(1|ev sahibi)$/.test(label)) values.home = outcome.odd;
      else if (/^(0|x|beraberlik)$/.test(label)) values.draw = outcome.odd;
      else if (/^(2|deplasman)$/.test(label)) values.away = outcome.odd;
    });
    return values;
  };

  const findGoalPair = (rows, key) => {
    const target = key === "over15" ? "1.5" : key === "over35" ? "3.5" : "";
    if (target) {
      const row = rows.find((item) => {
        const title = normalizeText(item.title);
        return title.includes("alt ust") && (item.special === target || title.includes(target.replace(".", " ")));
      });
      if (!row) return {};
      const result = {};
      row.outcomes.forEach((outcome) => {
        const label = normalizeText(outcome.label);
        if (label.includes("ust")) result.selected = outcome.odd;
        if (label.includes("alt")) result.opposite = outcome.odd;
      });
      return result;
    }

    const home = key === "homeGoal";
    const needle = home ? "ev sahibi" : "deplasman";
    const row = rows.find((item) => {
      const title = normalizeText(item.title);
      return title.includes(needle) && (title.includes("gol atar") || title.includes("gol"));
    });
    if (!row) return {};
    const result = {};
    row.outcomes.forEach((outcome) => {
      const label = normalizeText(outcome.label);
      if (/evet|var|atar/.test(label)) result.selected = outcome.odd;
      if (/hayir|yok|atmaz/.test(label)) result.opposite = outcome.odd;
    });
    return result;
  };

  const enrich = (input, advancedMarket) => {
    if (!input || typeof input !== "object") return input;
    const key = canonicalMarket(advancedMarket);
    if (!EXTENDED_KEYS.has(key)) return input;
    const rows = marketRows(input);
    if (!rows.length) return input;
    const output = { ...input };

    if (key.startsWith("htft")) {
      const htft = findHtft(rows);
      if (htft) {
        const codeMap = {
          "11": "htft11", "10": "htft1x", "12": "htft12",
          "01": "htftx1", "00": "htftxx", "02": "htftx2",
          "21": "htft21", "20": "htft2x", "22": "htft22",
        };
        htft.coded.forEach((outcome) => {
          const alias = codeMap[outcome.code];
          if (alias && numberOdd(output[alias]) === null) output[alias] = outcome.odd;
        });
      }
      const half = threeWayValues(findThreeWay(rows, true));
      const full = threeWayValues(findThreeWay(rows, false));
      if (numberOdd(output.firstHalf1) === null && half.home) output.firstHalf1 = half.home;
      if (numberOdd(output.firstHalfX) === null && half.draw) output.firstHalfX = half.draw;
      if (numberOdd(output.firstHalf2) === null && half.away) output.firstHalf2 = half.away;
      if (numberOdd(output.ms1) === null && full.home) output.ms1 = full.home;
      if (numberOdd(output.msx) === null && full.draw) output.msx = full.draw;
      if (numberOdd(output.ms2) === null && full.away) output.ms2 = full.away;
      return output;
    }

    const pair = findGoalPair(rows, key);
    const aliases = {
      over15: ["over15", "under15"],
      over35: ["over35", "under35"],
      homeGoal: ["homeGoalYes", "homeGoalNo"],
      awayGoal: ["awayGoalYes", "awayGoalNo"],
    }[key];
    if (aliases) {
      if (numberOdd(output[aliases[0]]) === null && pair.selected) output[aliases[0]] = pair.selected;
      if (numberOdd(output[aliases[1]]) === null && pair.opposite) output[aliases[1]] = pair.opposite;
    }
    return output;
  };

  const safeCoupon = (legs) => {
    const safeLegs = legs.map((leg) => ({
      ...leg,
      noPick: true,
      couponEligible: false,
      recommendationStatus: leg?.hasOpinion ? "watch" : "unavailable",
    }));
    const opinionCount = safeLegs.filter((leg) => leg?.hasOpinion).length;
    const scores = safeLegs.map((leg) => Number(leg?.modelScore)).filter(Number.isFinite);
    return {
      legs: safeLegs,
      pickedCount: 0,
      noPickCount: safeLegs.length,
      opinionCount,
      watchCount: safeLegs.filter((leg) => leg?.recommendationStatus === "watch").length,
      unavailableCount: safeLegs.length - opinionCount,
      averageConfidence: 0,
      averageModelScore: scores.length ? Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length) : null,
      averageDataCompleteness: 0,
      combinedProbability: null,
      totalOdd: null,
      risk: "Yüksek",
    };
  };

  const install = (core) => {
    if (!core || typeof core.analyze !== "function" || typeof core.analyzeCoupon !== "function") return false;
    if (core.__pro14IddaaBridgeInstalled) return true;
    const previousAnalyze = core.analyze.bind(core);
    const previousCoupon = core.analyzeCoupon.bind(core);

    core.analyze = (input, type = "robot", advancedMarket = "") => {
      const key = canonicalMarket(advancedMarket);
      if (type !== "advanced" || !EXTENDED_KEYS.has(key)) return previousAnalyze(input, type, advancedMarket);
      return previousAnalyze(enrich(input, advancedMarket), type, advancedMarket);
    };

    core.analyzeCoupon = (matches, type = "robot", advancedMarket = "") => {
      const key = canonicalMarket(advancedMarket);
      if (type !== "advanced" || !EXTENDED_KEYS.has(key)) return previousCoupon(matches, type, advancedMarket);
      const legs = (Array.isArray(matches) ? matches : []).map((match) => core.analyze(match, type, advancedMarket));
      return safeCoupon(legs);
    };

    Object.defineProperty(core, "__pro14IddaaBridgeInstalled", { value: true, configurable: false, enumerable: false });
    core.pro14IddaaBridgeVersion = VERSION;
    return true;
  };

  return Object.freeze({ VERSION, canonicalMarket, marketRows, enrich, install });
});
