const fs = require("fs");
const path = require("path");

const root = process.cwd();
const outDir = path.join(root, "public");

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
  "data/robot_match_archive.json"
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
}

try {
  require("./merge-bulletin-detail-fields");
} catch (error) {
  console.warn(`Bulten detay birlestirme atlandi: ${error.message}`);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const entry of fs.readdirSync(root)) {
  copyRecursive(path.join(root, entry), path.join(outDir, entry), entry);
}

console.log("Vercel public output hazırlandı.");