# A8 Uygulama Paketi Raporu

Bu paket doğrudan repo dosyalarını kırmadan küçük parça mantığıyla güncellemek için hazırlandı.

## Hedef

1. 50 olan sert aday eşiğini 40'a indirmek.
2. 65+ ana aday olarak kalacak.
3. 40-64 arası maçları izleme havuzuna almak.
4. Seçenek listesini genişletmek.

## Değişecek dosyalar

- scripts/robot-exact-scoring.js
- scripts/robot-coupon-engine.js
- scripts/export-high-value-json.js

## Eklenen / genişleyen seçenekler

- KG Yok
- 1.5 Üst
- Ev Sahibi Gol Atar
- Deplasman Gol Atar

Mevcutlarla birlikte hedef liste:

- KG Var
- KG Yok
- 1.5 Üst
- 2.5 Üst
- 3.5 Üst
- İlk Yarı KG Var
- İkinci Yarı KG Var
- Ev Sahibi Gol Atar
- Deplasman Gol Atar

## Çalıştırma

Repo klasörü:

C:\Users\Arif\Documents\GitHub\futbol-laboratuvari

Komut:

powershell -ExecutionPolicy Bypass -File .\apply_a8_patch.ps1

## Test

Script otomatik şunları çalıştırır:

- node --check scripts/robot-exact-scoring.js
- node --check scripts/robot-coupon-engine.js
- node --check scripts/export-high-value-json.js
- node scripts/export-high-value-json.js
- data/robot-analysis.json summary kontrolü

## Not

GitHub yazma aracı bu oturumda commit atmayı engellediği için patch paketi yerel uygulanacak şekilde hazırlandı.
