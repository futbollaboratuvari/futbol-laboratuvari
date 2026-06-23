const fs = require("fs");
const path = require("path");

const root = process.cwd();
const outDir = path.join(root, "public");

const excluded = new Set([
  ".git",
  ".github",
  ".vercel",
  "node_modules",
  "public",
  "api",
  "backend",
  "scripts",
  "package.json",
  "package-lock.json",
  "vercel.json"
]);

function copyRecursive(source, target) {
  const stat = fs.statSync(source);

  if (stat.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(target, entry));
    }
    return;
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const entry of fs.readdirSync(root)) {
  if (excluded.has(entry)) continue;
  copyRecursive(path.join(root, entry), path.join(outDir, entry));
}

console.log("Vercel public output hazırlandı.");
