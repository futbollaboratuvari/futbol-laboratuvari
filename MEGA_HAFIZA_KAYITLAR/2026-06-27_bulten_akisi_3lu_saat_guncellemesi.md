# Bülten Akışı 3'lü Saat Güncellemesi

Tarih: 2026-06-27
İşlem: Canlı site ana bülten akış saatleri Türkiye saatine göre güncellendi.

## Yapılan Değişiklik

Dosya:
.github/workflows/stage-1-bulletin.yml

Eski cron:
- 10 5 * * *

Yeni cron düzeni:
- 0 21 * * *  → Türkiye saati 00:00
- 0 5 * * *   → Türkiye saati 08:00
- 0 9 * * *   → Türkiye saati 12:00

## Neden UTC Yazıldı?

GitHub Actions schedule cron saatleri UTC çalışır.
Türkiye saati UTC+3 olduğu için dönüşüm şöyledir:

- Türkiye 00:00 = UTC 21:00
- Türkiye 08:00 = UTC 05:00
- Türkiye 12:00 = UTC 09:00

## Korunan Akış

Bülten workflow içindeki işlem zinciri bozulmadı:

1. node scripts/update-fixtures.js
2. node scripts/stage-1-bulletin-check.js
3. node scripts/two-day-bulletin-window.js
4. data ve outputs klasörlerini commit/push etme

## Not

Bu değişiklik yalnızca ana bülten akışının çalışma saatlerini günceller.
Canlı veri, fixture ve kart akışları 15 dakikalık ayrı workflow düzeninde kalır.

## Commit

Workflow güncelleme commit'i:
0bf89f7288a9d192161d2007f48e0403e343a260
