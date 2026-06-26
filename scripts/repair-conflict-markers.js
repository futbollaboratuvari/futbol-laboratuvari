const fs = require("fs");
const path = require("path");

const rootDir = path.join(__dirname, "..");
const TARGET_DIRS = [
  "data",
  "outputs",
  path.join("bu-klas-r-i-in-basit", "data"),
  path.join("bu-klas-r-i-in-basit", "outputs"),
];
const TEXT_EXTENSIONS = new Set([".json", ".md", ".txt"]);
const CONFLICT_MARKERS = ["<<<<<<<", "=======", ">>>>>>>"];
const MAX_PASSES = 8;

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

const hasConflictMarker = (text) => CONFLICT_MARKERS.some((marker) => text.includes(marker));

const resolveConflictPass = (text) => {
  const lines = text.split(/\r?\n/);
  const output = [];
  let changed = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.startsWith("<<<<<<<")) {
      output.push(line);
      continue;
    }

    changed = true;
    const current = [];
    const incoming = [];
    let target = current;
    let closed = false;

    index += 1;
    for (; index < lines.length; index += 1) {
      const innerLine = lines[index];
      if (innerLine.startsWith("=======")) {
        target = incoming;
        continue;
      }
      if (innerLine.startsWith(">>>>>>>")) {
        closed = true;
        break;
      }
      target.push(innerLine);
    }

    const selected = incoming.length ? incoming : current;
    output.push(...selected);

    if (!closed) break;
  }

  return {
    text: output.join("\n"),
    changed,
  };
};

const resolveConflictMarkers = (text) => {
  let current = text;
  let passes = 0;
  while (hasConflictMarker(current) && passes < MAX_PASSES) {
    const result = resolveConflictPass(current);
    current = result.text;
    passes += 1;
    if (!result.changed) break;
  }
  return { text: current, passes };
};

const formatJsonIfValid = (text, filePath) => {
  if (path.extname(filePath).toLowerCase() !== ".json") return text;
  return `${JSON.stringify(JSON.parse(text), null, 2)}\n`;
};

const repairedFiles = [];
const failedFiles = [];

for (const relativePath of TARGET_DIRS.flatMap(walk)) {
  const ext = path.extname(relativePath).toLowerCase();
  if (!TEXT_EXTENSIONS.has(ext)) continue;

  const absolutePath = path.join(rootDir, relativePath);
  const original = fs.readFileSync(absolutePath, "utf8");
  if (!hasConflictMarker(original)) continue;

  const resolved = resolveConflictMarkers(original);
  if (hasConflictMarker(resolved.text)) {
    failedFiles.push(`${relativePath}: conflict marker temizlenemedi`);
    continue;
  }

  try {
    const finalText = formatJsonIfValid(resolved.text, relativePath);
    fs.writeFileSync(absolutePath, finalText, "utf8");
    repairedFiles.push(`${relativePath} (${resolved.passes} pass)`);
  } catch (error) {
    failedFiles.push(`${relativePath}: temizleme sonrası geçersiz dosya (${error.message})`);
  }
}

if (repairedFiles.length) {
  console.log("Conflict marker temizlenen dosyalar:");
  repairedFiles.forEach((file) => console.log(`- ${file}`));
} else {
  console.log("Conflict marker temizlenecek dosya bulunmadı.");
}

if (failedFiles.length) {
  console.error("Conflict marker temizleme başarısız:");
  failedFiles.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}
