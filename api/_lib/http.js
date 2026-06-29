function allowPublicResponse(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
}

function json(res, statusCode, payload) {
  res.statusCode = statusCode;
  allowPublicResponse(res);
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function text(res, statusCode, payload) {
  res.statusCode = statusCode;
  allowPublicResponse(res);
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(payload);
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("application/json")) return JSON.parse(raw);
  if (contentType.includes("application/x-www-form-urlencoded")) return Object.fromEntries(new URLSearchParams(raw));
  try { return JSON.parse(raw); } catch { return Object.fromEntries(new URLSearchParams(raw)); }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} eksik`);
  return value;
}

function helperRoute(req, res) {
  json(res, 404, { ok: false, error: "not_found" });
}

helperRoute.json = json;
helperRoute.text = text;
helperRoute.readBody = readBody;
helperRoute.requireEnv = requireEnv;

module.exports = helperRoute;
