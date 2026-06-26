# 2026-06-26 Ham Maç Metrik Zenginleştirme Kaydı

## Aşama

Sıradaki aşama başlatıldı: robotun ham maç verisine form, gol eğilimi, KG, üst, ilk yarı / ikinci yarı metriklerini ekleyip aday üretimini güçlendirmek.

## Tespit

Robot skor motoru şu alanları arıyor:

- `homeScoredLast10`
- `awayScoredLast10`
- `homeConcededLast10`
- `awayConcededLast10`
- `bttsPercent`
- `over25Percent`
- `over35Percent`
- `firstHalfGoalTrend`
- `secondHalfGoalTrend`
- `leagueGoalAverage`

Bu alanlar eksik olduğunda robot veri eksikliği cezası veriyor ve kupon/izleme adayı oluşmuyor.

## Yapılan İş

Yeni dosya eklendi:

- `scripts/enrich-fixture-metrics.js`

Bu dosya:

1. `data/fixtures.json` dosyasını okur.
2. `data/robot_match_archive.json` içindeki kalıcı maç arşivini kontrol eder.
3. Arşiv varsa takım ve lig profillerinden form/gol metrikleri üretir.
4. Arşiv yoksa oran sinyalinden geçici proxy metrik üretir.
5. Mevcut gerçek alanları ezmez; sadece boş alanları tamamlar.
6. `data/fixtures.json` dosyasını zenginleştirilmiş şekilde geri yazar.

## Eklenen Metrikler

- Son 10 maç gol attı/yedi sayıları
- KG Var yüzdesi
- 2.5 Üst yüzdesi
- 3.5 Üst yüzdesi
- İlk yarı gol eğilimi
- İkinci yarı gol eğilimi
- Lig gol ortalaması
- Metrik kaynağı ve kalite etiketi

## Bağlantı

`package.json` zinciri kırılmadan güncellendi.

Yeni komut:

- `enrich:metrics`: `node scripts/enrich-fixture-metrics.js`

Yeni `update:all` sırası:

1. `update-fixtures.js`
2. `enrich-fixture-metrics.js`
3. `update-analysis-report.js`
4. `export-high-value-json.js`
5. `ensure-live-json.js`
6. `sync-analysis-results.js`
7. `learning-result-sync.js`
8. `learning-output-check.js`

## Güvenlik Kuralı

Dosyalar silinmedi. Mevcut veriler ezilmedi. Zenginleştirme scripti yalnızca eksik metrik alanlarını tamamlar.

## Commitler

- Ham metrik zenginleştirme dosyası: `608e0bed5268615a59571a13f2a8772b0e4ceb4f`
- Paket zinciri bağlantısı: `10655e2af2f47788b3cfb729aee04adcbb1439cb`

## Sonraki Kontrol

Actions çalışınca kontrol edilecek:

- `data/fixtures.json` içine yeni metrikler yazıldı mı?
- `data/robot-analysis.json` içinde `coupon_candidate_count` veya `watch_candidate_count` yükseldi mi?
- `data/analiz_sonuclari.json` içinde kararlar sadece `Oynama` olarak mı kalıyor, yoksa `İzleme / Kupon Adayı` oluşuyor mu?
