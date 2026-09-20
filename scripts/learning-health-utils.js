"use strict";

function istanbulDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date).reduce((acc, part) => {
    if (part.type !== "literal") acc[part.type] = part.value;
    return acc;
  }, {});
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function predictionDate(item) {
  return String(item?.date || item?.tarih || item?.utc_date || "").slice(0, 10);
}

function stalePendingStats(predictions, now = new Date()) {
  const today = istanbulDate(now);
  const stale = (Array.isArray(predictions) ? predictions : []).filter((item) => {
    if (item?.status !== "pending") return false;
    const date = predictionDate(item);
    return Boolean(date && date < today);
  });

  const byDate = {};
  const byMarket = {};
  for (const item of stale) {
    const date = predictionDate(item);
    const market = String(item?.market || item?.selection || "Belirsiz");
    byDate[date] = (byDate[date] || 0) + 1;
    byMarket[market] = (byMarket[market] || 0) + 1;
  }

  const dates = Object.keys(byDate).sort();
  const topMarkets = Object.entries(byMarket)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "tr"))
    .slice(0, 8)
    .map(([market, count]) => ({ market, count }));

  return {
    today,
    stale_count: stale.length,
    oldest_date: dates[0] || null,
    newest_stale_date: dates[dates.length - 1] || null,
    by_date: byDate,
    top_markets: topMarkets,
    examples: stale.slice(0, 20).map((item) => ({
      id: item.id || null,
      date: predictionDate(item),
      match_name: item.match_name || item.match || null,
      market: item.market || item.selection || null,
      result_score: item.result_score || null,
    })),
  };
}

module.exports = { istanbulDate, predictionDate, stalePendingStats };
