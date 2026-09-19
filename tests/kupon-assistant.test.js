"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "nesine-coupon-assistant.js");
const source = fs.readFileSync(file, "utf8");

assert.doesNotThrow(() => new Function(source), "Kupon Asistanı JavaScript sözdizimi bozuk");
assert.match(source, /ANALYSIS_URL\s*=\s*['"]\.\/data\/analiz_sonuclari\.json['"]/, "PRO analiz fallback kaynağı eksik");
assert.match(source, /Promise\.allSettled/, "günlük kupon ve PRO analiz kaynakları birlikte okunmalı");
assert.match(source, /manual_candidate:\s*true/, "manuel PRO aday işareti eksik");
assert.match(source, /isUpcomingCandidate/, "başlamış maç filtresi eksik");
assert.match(source, /cache:\s*['"]no-store['"]/, "güncel veri için no-store cache politikası eksik");
assert.match(source, /fl_nka=/, "Kupon Asistanı JSON cache-bust parametresi eksik");
assert.match(source, /Otomatik kupon uygunluğu oluşmadığında/, "manuel aday havuzu kullanıcı açıklaması eksik");
assert.doesNotMatch(source, /2026-07-03/, "eski sabit kaynak tarihi koda sızmamalı");

const indexSource = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const cacheSource = fs.readFileSync(path.join(__dirname, "..", "cache-version.js"), "utf8");
assert.match(indexSource, /deploy-version" content="20260919-kupon-htft-fresh-v1"/, "deploy version Kupon Asistanı düzeltmesini yayınlamalı");
assert.match(indexSource, /cache-version\.js\?v=20260919-kupon-htft-fresh-v1/, "cache loader URL sürümü güncel olmalı");
assert.match(indexSource, /nav-routing\.js\?v=20260919-kupon-htft-fresh-v1/, "Kupon Asistanı yükleyicisi cache-bust ile yenilenmeli");
assert.match(cacheSource, /const version = "20260919-kupon-htft-fresh-v1"/, "dinamik HTFT varlık sürümü güncel olmalı");

console.log("kupon-assistant.test.js: OK");
