const { spawnSync } = require("child_process");

if (process.env.VERCEL || process.env.SKIP_PLAYWRIGHT_INSTALL === "1") {
  console.log("Playwright browser install skipped for this environment.");
  process.exit(0);
}

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const result = spawnSync(command, ["playwright", "install", "chromium"], {
  stdio: "inherit",
  shell: false,
});

process.exit(result.status ?? 1);
