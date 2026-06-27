const { Octokit } = require("@octokit/rest");

const OWNER = "futbollaboratuvari";
const REPO = "futbol-laboratuvari";
const ARCHIVE_PATH = "data/robot_match_archive.json";
const MAX_EVENTS = 500;

const token = () => process.env.GITHUB_LEARNING_TOKEN || process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";

const decode = (value) => Buffer.from(value || "", "base64").toString("utf8");
const encode = (value) => Buffer.from(value, "utf8").toString("base64");

const readArchive = async (octokit) => {
  const response = await octokit.repos.getContent({ owner: OWNER, repo: REPO, path: ARCHIVE_PATH, ref: "main" });
  const file = response.data;
  return { sha: file.sha, data: JSON.parse(decode(file.content) || "{}") };
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

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const picks = Array.isArray(body.picks) ? body.picks.map(normalizePick).filter((pick) => pick.key && pick.value) : [];
  if (!picks.length) return res.status(400).json({ ok: false, error: "empty_picks" });

  const octokit = new Octokit({ auth });
  const { sha, data } = await readArchive(octokit);
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

  await octokit.repos.createOrUpdateFileContents({
    owner: OWNER,
    repo: REPO,
    path: ARCHIVE_PATH,
    branch: "main",
    sha,
    message: "Update coupon learning feedback",
    content: encode(`${JSON.stringify(data, null, 2)}\n`)
  });

  return res.status(200).json({ ok: true, stored: picks.length, total_events: data.coupon_learning_events.length });
};
