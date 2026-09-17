const { execFileSync } = require("child_process");

// GitHub Pages remains the production frontend publisher. Vercel is the
// protected API/backend runtime and should rebuild only when main changes can
// affect that runtime. Generated data is read from GitHub main at request time,
// so data-only commits must not create a deployment storm.
const ref = String(process.env.VERCEL_GIT_COMMIT_REF || "").trim();
if (ref && ref !== "main") {
  console.log(`[vercel-ignore] ${ref} backend production dali degil; build atlandi.`);
  process.exit(0);
}

const base = String(process.env.VERCEL_GIT_PREVIOUS_SHA || "").trim();
const head = String(process.env.VERCEL_GIT_COMMIT_SHA || "HEAD").trim();
const owner = String(process.env.VERCEL_GIT_REPO_OWNER || "futbollaboratuvari").trim();
const repo = String(process.env.VERCEL_GIT_REPO_SLUG || "futbol-laboratuvari").trim();

const BACKEND_PREFIXES = [
  "api/",
  "backend/",
  "server-lib/",
  "scripts/",
];
const BACKEND_FILES = new Set([
  ".vercelignore",
  "package.json",
  "package-lock.json",
  "pro-coupon-eligibility.js",
  "vercel.json",
]);

function isBackendRelevant(file) {
  if (BACKEND_FILES.has(file)) return true;
  return BACKEND_PREFIXES.some((prefix) => file.startsWith(prefix));
}

function continueBuild(reason) {
  console.log(`[vercel-ignore] backend build devam: ${reason}`);
  process.exit(1);
}

function ignoreBuild(changedFiles, source) {
  if (!changedFiles.length) continueBuild(`${source}: degisen dosya bulunamadi`);
  const backendFiles = changedFiles.filter(isBackendRelevant);
  if (backendFiles.length) {
    continueBuild(`${source}: backend degisikligi var: ${backendFiles.slice(0, 12).join(", ")}`);
  }
  console.log(`[vercel-ignore] build atlandi; ${changedFiles.length} degisiklik backend runtime'ini etkilemiyor (${source}).`);
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
    // Vercel shallow clone nedeniyle onceki SHA yerelde olmayabilir. Public
    // GitHub compare API salt okunur yedek olarak kullanilir. Kanit yoksa build
    // yapilarak guvenli tarafta kalinir.
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

  if (payload.files.length >= 300) {
    continueBuild("GitHub compare dosya limiti doldu; guvenli tarafta build ediliyor");
  }

  const changedFiles = payload.files
    .map((file) => String(file?.filename || "").trim())
    .filter(Boolean);
  ignoreBuild(changedFiles, "github-compare");
}

main().catch((error) => continueBuild(`beklenmeyen hata: ${error.message}`));
