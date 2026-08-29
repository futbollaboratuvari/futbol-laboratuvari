const fs = require("fs");
const path = require("path");

const root = process.cwd();
const outDir = path.join(root, "public");
let copiedFiles = 0;
let copiedBytes = 0;

const excludedRoots = new Set([
  ".agents",
  ".codex",
  ".git",
  ".github",
  ".vercel",
  "MEGA_HAFIZA_KAYITLAR",
  "api",
  "backend",
  "bu-klas-r-i-in-basit",
  "content",
  "futbol_laboratuvari",
  "node_modules",
  "public",
  "scripts",
  "server-lib",
  "supabase",
  "tests",
  "package.json",
  "package-lock.json",
  "vercel.json"
]);

const excludedRelativePaths = new Set([
  ".vercelignore",
  "assets/cem-kaplanoglu.png",
  "assets/fl-logo-premium.png",
  "assets/gallery-analiz-serisi.png",
  "assets/gallery-marka.png",
  "assets/gallery-spor-toto.png",
  "assets/gallery-yorum-kosesi.png",
  "data/archive",
  "data/detail-raw-signals.json",
  "data/analiz_sonuclari.json",
  "data/ham_mac_havuzu.json",
  "data/home-away-performance.json",
  "data/learning-memory.json",
  "data/longterm-match-archive.json",
  "data/membership-codes.json",
  "data/player-intelligence-cache.json",
  "data/pro-analysis-index.json",
  "data/robot-analysis.json",
  "data/robot_match_archive.json",
  "data/usage-log.json",
  "usage-log.html",
  "football-lab-hero.png"
]);

const excludedExtensions = new Set([
  ".avi",
  ".mkv",
  ".mov",
  ".mp4",
  ".webm"
]);

function normalizeRelativePath(value) {
  return value.split(path.sep).join("/");
}

function shouldExclude(relativePath) {
  const normalized = normalizeRelativePath(relativePath);
  const rootEntry = normalized.split("/")[0];
  return excludedRoots.has(rootEntry)
    || excludedRelativePaths.has(normalized)
    || Array.from(excludedRelativePaths).some((entry) => normalized.startsWith(`${entry}/`))
    || excludedExtensions.has(path.extname(normalized).toLowerCase());
}

function copyRecursive(source, target, relativePath) {
  if (shouldExclude(relativePath)) return;

  const stat = fs.statSync(source);

  if (stat.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(target, entry), path.join(relativePath, entry));
    }
    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  copiedFiles += 1;
  copiedBytes += stat.size;
}

try {
  require("./merge-bulletin-detail-fields");
} catch (error) {
  console.warn(`Bulten detay birlestirme atlandi: ${error.message}`);
}

try {
  require("./lineup-lite").buildLineupSignals();
} catch (error) {
  console.warn(`Ilk 11 sinyalleri yenilenemedi: ${error.message}`);
}

try {
  require("./team-status-apply").applyTeamStatus();
} catch (error) {
  console.warn(`Kadro istihbarati bultene uygulanamadi: ${error.message}`);
}

try {
  require("./band-lite").runBandLite();
} catch (error) {
  console.warn(`Bant sinyalleri yenilenemedi: ${error.message}`);
}

try {
  require("./build-pro-analysis-index").buildProAnalysisIndex();
} catch (error) {
  console.warn(`PRO analiz indeksi atlandi: ${error.message}`);
}

// Vercel büyük sonuç arşivini taşımaz. GitHub Actions'ın gerçek arşivden ürettiği
// küçük Spor Toto analiz cache'i ve varsa doğrulanmış market cache'i kullanılır.
require("./rebuild-spor-toto-bulletin").run();
require("./apply-spor-toto-archive-analysis").run();
require("./apply-spor-toto-weekly-market").run();
require("./finalize-spor-toto-pro").run();
require("../tests/spor-toto-archive.test");
require("../tests/spor-toto-market.test");
require("../tests/spor-toto-weekly.test");

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const entry of fs.readdirSync(root)) {
  copyRecursive(path.join(root, entry), path.join(outDir, entry), entry);
}

try {
  const sourceLive = path.join(root, "data", "live-matches.json");
  const publicLive = path.join(outDir, "data", "live-matches.json");
  if (fs.existsSync(sourceLive)) require("./sanitize-public-live").sanitizeFile(sourceLive, publicLive);
} catch (error) {
  throw new Error(`Canlı veri kamu görünümü güvenli hazırlanamadı: ${error.message}`);
}

console.log(`Vercel public output hazırlandı. Dosya: ${copiedFiles}. Boyut: ${(copiedBytes / 1024 / 1024).toFixed(2)} MB.`);
