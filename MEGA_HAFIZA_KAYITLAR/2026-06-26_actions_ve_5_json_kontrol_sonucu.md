# 2026-06-26 Actions ve 5 JSON Kontrol Sonucu

## Kontrol Edilen Actions

Workflow dosyası güncel durumda:

- `.github/workflows/auto-relaxed-analysis.yml`
- Schedule: `*/30 * * * *`
- Manuel tetikleme: `workflow_dispatch`
- Çalışan komut: `npm run update:all`

Bilinen son eski run:

- Run ID: `28205609639`
- Workflow: `Auto relaxed analysis`
- Sonuç: `failure`
- Başarısız adım: `stefanzweifel/git-auto-commit-action@v5`
- O run eski komutları çalıştırmıştı: `robot-threshold-patch.js` ve `update-analysis-report.js`

## 5 JSON Dosyası Kontrol Sonucu

### 1. `data/fixtures.json`

- Durum: Kısmen dolu.
- İçerik var ama güncel canlı liste gibi davranmıyor.
- İlk görünen maç: `Botev Plovdiv - Arda Kardzhali`
- Tarih: `2026-06-26`
- Durum: `scheduled`
- Son canlı güncelleme: `2026-06-25T23:01:58.618Z`

### 2. `data/live-matches.json`

- Durum: Kısmen dolu.
- `generated_at`: `2026-06-26T01:35:53.914Z`
- Maç listesinde yine `Botev Plovdiv VS Arda Kardzhali` görünüyor.
- Öneri: `Değerli market yok`
- Güven skoru: `0%`

### 3. `data/robot-analysis.json`

- Durum: Dolmuş ama analiz üretimi zayıf.
- `generated_at`: `2026-06-26T01:35:53.917Z`
- `fixture_count`: `55`
- `scored_match_count`: `55`
- `coupon_candidate_count`: `0`
- `watch_candidate_count`: `0`
- İlk maçta öneri yine `Değerli market yok`, güven `0%`.

### 4. `data/daily-coupons.json`

- Durum: Dosya dolu ama kuponlar boş.
- `generated_at`: `2026-06-26T01:35:53.742Z`
- Dengeli / Yüksek Oranlı / Riskli kuponlarda `selected_matches: []`
- Tüm kuponlarda `is_available: false`
- Mesaj: `Bugün için güncel veri henüz oluşmadı.`

### 5. `data/analiz_sonuclari.json`

- Durum: Boş analiz.
- `generated_at`: `2026-06-25T23:01:59.011Z`
- `active_items: []`
- `completed_items: []`
- Kaynak: `Oranlı analiz bekleniyor`

## Net Sonuç

Actions dosyası artık doğru komuta bağlanmış görünüyor, fakat kontrol edilen JSON çıktıları gerçek canlı veri / tahmin akışını henüz sağlamıyor.

- Maç verisi sınırlı ve canlı maçları yakalamıyor.
- Robot analiz dosyası 55 maçı skorlamış gibi görünse de kupon adayı üretmemiş.
- Kupon dosyası boş kart üretiyor.
- `analiz_sonuclari.json` hâlâ boş.

## Sıradaki İş

Actions'ın yeni `npm run update:all` zinciriyle çalışıp çalışmadığı ayrıca takip edilecek. Sonra şu iki kırılma düzeltilecek:

1. Canlı maç kaynağı gerçek güncel maçları yakalayacak.
2. Robot analiz çıktısı `analiz_sonuclari.json` ve kupon dosyalarına dolu veri yazacak.
