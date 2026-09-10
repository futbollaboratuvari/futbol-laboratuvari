const { execFileSync } = require("child_process");

const base = String(process.env.VERCEL_GIT_PREVIOUS_SHA || "").trim();
const head = String(process.env.VERCEL_GIT_COMMIT_SHA || "HEAD").trim();
const owner = String(process.env.VERCEL_GIT_REPO_OWNER || "futbollaboratuvari").trim();
const repo = String(process.env.VERCEL_GIT_REPO_SLUG || "futbol-laboratuvari").trim();

const GENERATED_PREFIXES = [
  "data/",
  "outputs/",
  "bu-klas-r-i-in-basit/data/",
  "bu-klas-r-i-in-basit/outputs/",
];

function isGeneratedPath(file) {
  return GENERATED_PREFIXES.some((prefix) => file.startsWith(prefix));
}

function continueBuild(reason) {
  console.log(`[vercel-ignore] build devam: ${reason}`);
  process.exit(1);
}

function ignoreBuild(changedFiles, source) {
  if (!changedFiles.length) continueBuild(`${source}: degisen dosya bulunamadi`);
  const githubDataOnly = changedFiles.every(isGeneratedPath);
  if (!githubDataOnly) {
    const codeFiles = changedFiles.filter((file) => !isGeneratedPath(file));
    continueBuild(`${source}: kod/yapi degisikligi var: ${codeFiles.slice(0, 12).join(", ")}`);
  }
  console.log(`[vercel-ignore] Vercel build atlandi; ${changedFiles.length} GitHub veri/rapor dosyasi degisti (${source}).`);
  process.exit(0);
}

async function main() {
  if (!/^[0-9a-f]{7,40}$/i.test(base) || !/^[0-9a-f]{7,40}$/i.test(head)) {
    continueBuild("gecerli onceki/mevcut deployment SHA bulunamadi");
  }

  try {
    const output = execFileSync("git", ["diff", "--name-only", base, head], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const changedFiles = output.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
    ignoreBuild(changedFiles, "local-git");
  } catch {
    // Vercel performs a shallow clone, so VERCEL_GIT_PREVIOUS_SHA may not be
    // present locally. The repository is public; use GitHub's compare API as
    // a read-only fallback and fail open if it cannot prove a data-only diff.
  }

  if (!owner || !repo || !/^[A-Za-z0-9_.-]+$/.test(owner) || !/^[A-Za-z0-9_.-]+$/.test(repo)) {
    continueBuild("GitHub repository bilgisi dogrulanamadi");
  }

  const url = `https://api.github.com/repos/${owner}/${repo}/compare/${base}...${head}`;
  let response;
  try {
    response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "futbol-laboratuvari-vercel-ignore",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      signal: AbortSignal.timeout(8000),
    });
  } catch (error) {
    continueBuild(`GitHub compare erisilemedi: ${error.message}`);
  }

  if (!response.ok) {
    continueBuild(`GitHub compare HTTP ${response.status}`);
  }

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    continueBuild(`GitHub compare JSON okunamadi: ${error.message}`);
  }

  if (!Array.isArray(payload.files) || !payload.files.length) {
    continueBuild("GitHub compare dosya listesi bos/gecersiz");
  }

  // GitHub Compare API file list is capped at 300. Never ignore a build when
  // the diff could be truncated, because an unseen code change may exist.
  if (payload.files.length >= 300) {
    continueBuild("GitHub compare dosya limiti doldu; guvenli tarafta build ediliyor");
  }

  const changedFiles = payload.files
    .map((file) => String(file?.filename || "").trim())
    .filter(Boolean);
  ignoreBuild(changedFiles, "github-compare");
}

main().catch((error) => continueBuild(`beklenmeyen hata: ${error.message}`));
