const fs = require("fs");
const path = require("path");

const TARGETS = [
  "bilgi-merkezi.html",
  "futbol-analiz-metodolojisi.html",
  "form-ve-fikstur-okuma-rehberi.html",
  "gol-ve-mac-temposu-rehberi.html"
];

const CONSENT_SCRIPT = '<script defer src="./cookie-consent.js?v=20260917-adsense-v2"></script>';

function injectEditorialAdsense(outDir) {
  const updated = [];

  for (const filename of TARGETS) {
    const filePath = path.join(outDir, filename);
    if (!fs.existsSync(filePath)) throw new Error(`AdSense hedef sayfası bulunamadı: ${filename}`);

    let html = fs.readFileSync(filePath, "utf8");
    if (!/cookie-consent\.js/i.test(html)) {
      if (!/<\/body>/i.test(html)) throw new Error(`${filename}: </body> bulunamadı`);
      html = html.replace(/<\/body>/i, `  ${CONSENT_SCRIPT}\n</body>`);
      fs.writeFileSync(filePath, html, "utf8");
      updated.push(filename);
    }

    const verified = fs.readFileSync(filePath, "utf8");
    if (!verified.includes("cookie-consent.js")) {
      throw new Error(`${filename}: AdSense/çerez yükleyicisi eklenemedi`);
    }
  }

  console.log(`Editorial AdSense loader hazır: ${TARGETS.length} sayfa${updated.length ? `, güncellendi: ${updated.join(", ")}` : ", değişiklik gerekmiyor"}.`);
}

module.exports = { injectEditorialAdsense };
