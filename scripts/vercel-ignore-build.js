const { execFileSync } = require("child_process");

const base = String(process.env.VERCEL_GIT_PREVIOUS_SHA || "").trim();
const head = String(process.env.VERCEL_GIT_COMMIT_SHA || "HEAD").trim();

function continueBuild(reason) {
  console.log(`[vercel-ignore] build devam: ${reason}`);
  process.exit(1);
}

if (!/^[0-9a-f]{7,40}$/i.test(base)) {
  continueBuild("onceki basarili deployment SHA bulunamadi");
}

let changedFiles;
try {
  const output = execFileSync("git", ["diff", "--name-only", base, head], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  changedFiles = output.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
} catch (error) {
  continueBuild(`git diff okunamadi: ${error.message}`);
}

if (!changedFiles.length) {
  continueBuild("degisen dosya bulunamadi");
}

const githubDataOnly = changedFiles.every((file) =>
  file.startsWith("data/") || file.startsWith("outputs/")
);

if (githubDataOnly) {
  console.log(`[vercel-ignore] Vercel build atlandi; ${changedFiles.length} GitHub veri/rapor dosyasi degisti.`);
  process.exit(0);
}

console.log(`[vercel-ignore] Kod/yapi degisikligi var: ${changedFiles.join(", ")}`);
process.exit(1);
