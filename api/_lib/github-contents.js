const owner = "futbollaboratuvari";
const repo = "futbol-laboratuvari";

function decodeContent(value) {
  return Buffer.from(String(value || ""), "base64").toString("utf8");
}

function encodeContent(value) {
  return Buffer.from(value, "utf8").toString("base64");
}

function contentUrl(filePath, ref = "main") {
  const encodedPath = encodeURIComponent(filePath).replace(/%2F/g, "/");
  return `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(ref)}`;
}

async function githubJson(token, url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "futbol-laboratuvari-api",
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
}

async function readJsonFile(token, filePath) {
  const file = await githubJson(token, contentUrl(filePath));
  return {
    sha: file.sha,
    data: JSON.parse(decodeContent(file.content) || "{}")
  };
}

async function writeJsonFile(token, filePath, sha, data, message) {
  const encodedPath = encodeURIComponent(filePath).replace(/%2F/g, "/");
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}`;
  return githubJson(token, url, {
    method: "PUT",
    body: JSON.stringify({
      branch: "main",
      sha,
      message,
      content: encodeContent(`${JSON.stringify(data, null, 2)}\n`)
    })
  });
}

module.exports = {
  readJsonFile,
  writeJsonFile
};
