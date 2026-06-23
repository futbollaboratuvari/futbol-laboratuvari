#!/usr/bin/env node

const crypto = require("crypto");

const rawCode = process.argv.slice(2).join(" ").trim();

if (!rawCode) {
  console.error("Kullanım: node backend/tools/generate-code-hash.js KODUNUZ");
  process.exit(1);
}

const normalized = rawCode.toLocaleUpperCase("tr-TR");
const hash = crypto.createHash("sha256").update(normalized).digest("hex");

console.log("Kod:", rawCode);
console.log("Normalize:", normalized);
console.log("SHA256:", hash);
console.log("");
console.log("SQL örneği:");
console.log(`insert into public.membership_codes (code_hash, plan_code, plan_name, max_activations, max_analysis_count, note) values ('${hash}', 'premium', 'Premium Üye', 1, 20, 'Manuel oluşturuldu');`);
