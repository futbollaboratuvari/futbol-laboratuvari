const OWNER = "futbollaboratuvari";
const REPO = "futbol-laboratuvari";
const ARCHIVE_PATH = "data/robot_match_archive.json";
const MAX_EVENTS = 500;

const token = () => process.env.GITHUB_LEARNING_TOKEN || process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";

const decode = (value) => Buffer.from(value || "", "base64").toString("utf8");
const encode = (value) => Buffer.from(value, "utf8").toString("base64");

const githubJson = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${options.auth}`,
      "Content-Type": "application/json",
      "User-Agent": "futbol-laboratuvari-learning-api",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data.message || `GitHub request failed with ${response.status}`;
    throw new Error(message);
  }
  return data;
};

const readArchive = async (auth) => {
  const path = encodeURIComponent(ARCHIVE_PATH).replace(/%2F/g, "/");
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}?ref=main`;
  const file = await githubJson(url, { auth });
  return { sha: file.sha, data: JSON.parse(decode(file.content) || "{}") };
};

const writeArchive = async (auth, sha, data) => {
  const path = encodeURIComponent(ARCHIVE_PATH).replace(/%2F/g, "/");
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
  return githubJson(url, {
    auth,
    method: "PUT",
    body: JSON.stringify({
      branch: "main",
      sha,
      message: "Update coupon learning feedback",
      content: encode(`${JSON.stringify(data, null, 2)}\n`)
    })
  });
};

const cleanText = (value, max = 120) => String(value || "").replace(/[<>]/g, "").slice(0, max);
const toNumber = (value) => {
  const found = String(value || "").replace(",", ".").match(/\d+(\.\d+)?/);
  return found ? Number(found[0]) : 0;
};

const normalizePick = (pick) => ({
  key: cleanText(pick.key, 40),
  label: cleanText(pick.label, 80),
  value: toNumber(pick.value),
  home: cleanText(pick.home, 80),
  away: cleanText(pick.away, 80),
  league: cleanText(pick.league, 80),
  date: cleanText(pick.date, 20),
  time: cleanText(pick.time, 10)
});

const updateFeedback = (feedback, picks) => {
  const model = feedback && typeof feedback === "object" ? feedback : { version: "coupon-feedback-v1", markets: {}, total_events: 0 };
  model.total_events = Number(model.total_events || 0) + 1;
  picks.forEach((pick) => {
    if (!pick.key) return;
    model.markets[pick.key] = model.markets[pick.key] || { label: pick.label, samples: 0, avg_odds: 0, interest_weight: 0 };
    const row = model.markets[pick.key];
    row.label = pick.label || row.label;
    row.samples += 1;
    row.avg_odds = Number((((row.avg_odds * (row.samples - 1)) + pick.value) / row.samples).toFixed(3));
    row.interest_weight = Math.max(-8, Math.min(12, Number((row.interest_weight + (pick.value >= 2.1 ? 0.5 : 0.2)).toFixed(2))));
    row.last_seen_at = new Date().toISOString();
  });
  model.updated_at = new Date().toISOString();
  return model;
};

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "method_not_allowed" });

  const auth = token();
  if (!auth) return res.status(503).json({ ok: false, error: "missing_github_learning_token" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const picks = Array.isArray(body.picks) ? body.picks.map(normalizePick).filter((pick) => pick.key && pick.value) : [];
    if (!picks.length) return res.status(400).json({ ok: false, error: "empty_picks" });

    const { sha, data } = await readArchive(auth);
    const event = {
      created_at: new Date().toISOString(),
      source: "daily-matches-widget-kuponum",
      avg_score: toNumber(body.avg_score),
      risk: cleanText(body.risk, 40),
      picks
    };

    data.coupon_learning_events = Array.isArray(data.coupon_learning_events) ? data.coupon_learning_events : [];
    data.coupon_learning_events.push(event);
    data.coupon_learning_events = data.coupon_learning_events.slice(-MAX_EVENTS);
    data.coupon_feedback_model = updateFeedback(data.coupon_feedback_model, picks);
    data.updated_by_coupon_learning = event.created_at;

    await writeArchive(auth, sha, data);

    return res.status(200).json({ ok: true, stored: picks.length, total_events: data.coupon_learning_events.length });
  } catch (error) {
    return res.status(500).json({ ok: false, error: "github_learning_update_failed", message: error.message });
  }
};
