const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const TARGET_DIRS = [
  "data",
  "outputs",
  path.join("bu-klas-r-i-in-basit", "data"),
  path.join("bu-klas-r-i-in-basit", "outputs"),
];
const CONFLICT_MARKERS = ["<<<<<<<", "=======", ">>>>>>>"];
const TEXT_EXTENSIONS = new Set([".json", ".md", ".txt"]);

const walk = (dir) => {
  const fullDir = path.join(rootDir, dir);
  if (!fs.existsSync(fullDir)) return [];
  return fs.readdirSync(fullDir, { withFileTypes: true }).flatMap((entry) => {
    const relativePath = path.join(dir, entry.name);
    const fullPath = path.join(rootDir, relativePath);
    if (entry.isDirectory()) return walk(relativePath);
    if (!entry.isFile()) return [];
    return [relativePath];
  });
};

const readText = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), "utf8");

const problems = [];

for (const filePath of TARGET_DIRS.flatMap(walk)) {
  const ext = path.extname(filePath).toLowerCase();
  if (!TEXT_EXTENSIONS.has(ext)) continue;

  const text = readText(filePath);
  const marker = CONFLICT_MARKERS.find((item) => text.includes(item));
  if (marker) {
    problems.push(`${filePath}: conflict marker bulundu (${marker})`);
    continue;
  }

  if (ext === ".json") {
    try {
      JSON.parse(text || "null");
    } catch (error) {
      problems.push(`${filePath}: JSON parse hatası (${error.message})`);
    }
  }
}

if (problems.length) {
  console.error("Futbol Laboratuvarı veri kontrolü başarısız:");
  problems.forEach((problem) => console.error(`- ${problem}`));
  process.exit(1);
}

console.log("Futbol Laboratuvarı veri kontrolü başarılı: conflict marker ve bozuk JSON yok.");
