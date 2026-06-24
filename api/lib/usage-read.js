const REPO = "futbollaboratuvari/futbol-laboratuvari";
const FILE_PATH = "data/usage-log.json";

async function readUsageFile() {
  const url = `https://raw.githubusercontent.com/${REPO}/main/${FILE_PATH}?ts=${Date.now()}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return { version: 1, records: [] };
  return response.json();
}

module.exports = {
  readUsageFile,
  REPO,
  FILE_PATH
};
