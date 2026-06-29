const REPO = "futbollaboratuvari/futbol-laboratuvari";
const FILE_PATH = "data/usage-log.json";

async function readUsageFile() {
  const url = `https://raw.githubusercontent.com/${REPO}/main/${FILE_PATH}?ts=${Date.now()}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return { version: 1, records: [] };
  return response.json();
}

function helperRoute(req, res) {
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ ok: false, error: "not_found" }));
}

helperRoute.readUsageFile = readUsageFile;
helperRoute.REPO = REPO;
helperRoute.FILE_PATH = FILE_PATH;

module.exports = helperRoute;
