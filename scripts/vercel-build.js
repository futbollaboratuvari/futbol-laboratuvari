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
  "data/longterm-match-archive.json",
  "data/robot_match_archive.json",
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
  require("./build-pro-analysis-index").buildProAnalysisIndex();
} catch (error) {
  console.warn(`PRO analiz indeksi atlandi: ${error.message}`);
}

const sportArchivePath = path.join(root, "data", "robot_match_archive.json");
const sportBulletinPath = path.join(root, "data", "spor_toto_bulteni.json");
const sportArchiveAvailable = fs.existsSync(sportArchivePath);
let committedSportTotoIsV2 = false;
try {
  const currentSportToto = JSON.parse(fs.readFileSync(sportBulletinPath, "utf8"));
  committedSportTotoIsV2 = String(currentSportToto?.engine_version || "").startsWith("spor-toto-pro-v2")
    && Array.isArray(currentSportToto?.matches);
} catch {}

try {
  if (sportArchiveAvailable || !committedSportTotoIsV2) {
    require("./rebuild-spor-toto-bulletin").run();
    require("./enhance-spor-toto-pro").run();
  } else {
    console.log("Spor Toto PRO v2 committed data preserved; full archive is not present in Vercel source.");
  }
} catch (error) {
  if (!committedSportTotoIsV2) throw error;
  console.warn(`Spor Toto PRO rebuild atlandi; doğrulanmış v2 çıktı korunuyor: ${error.message}`);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const entry of fs.readdirSync(root)) {
  copyRecursive(path.join(root, entry), path.join(outDir, entry), entry);
}

console.log(`Vercel public output hazırlandı. Dosya: ${copiedFiles}. Boyut: ${(copiedBytes / 1024 / 1024).toFixed(2)} MB.`);
