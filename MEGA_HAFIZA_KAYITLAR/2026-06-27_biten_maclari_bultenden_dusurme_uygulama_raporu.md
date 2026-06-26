# Biten Maçları Bültenden Düşürme Uygulama Raporu

Tarih: 2026-06-27
Durum: Uygulandı
Amaç: Oynanmış/biten karşılaşmaların bülten ve canlı site görünümünden düşmesini sağlamak.

## Yapılan İşlem Özeti

Bülten akışında ortak aktif maç filtresi kuruldu ve ilgili dosyalar birbirine bağlandı.

Bültenden düşürülecek statüler:
- finished
- cancelled
- postponed

Bültende kalacak statüler:
- scheduled
- live
- status boş ise varsayılan scheduled kabul edilir

## Değiştirilen / Eklenen Dosyalar

### 1. scripts/bulletin-active-filter.js

Yeni ortak filtre dosyası oluşturuldu.

Görevleri:
- status/liveStatus değerini normalize eder.
- finished/cancelled/postponed maçları pasif sayar.
- aktif maç listesini döndürür.
- pasif/bültenden düşürülen maç sayısını hesaplar.

Commit:
0fb2539bc86e814848d3a2e783c31589a555a8b0

### 2. scripts/update-fixtures.js

Ana bülten üretici ortak filtreye bağlandı.

Yapılanlar:
- bulletin-active-filter.js require edildi.
- toSporTotoBulletin artık sadece aktif maçları data/spor_toto_bulteni.json içine yazar.
- fixtures.json ham ana veri olarak korunur.
- total_source_matches, active_match_count, removed_finished_count, removed_statuses alanları eklendi.
- outputs raporlarında aktif bülten maç sayısı ve düşürülen maç sayısı yazılır.

Commit:
e5bce04df7725092eafffb77ceb869e5d9a1fee3

### 3. scripts/two-day-bulletin-window.js

İki günlük bülten de ortak filtreye bağlandı.

Yapılanlar:
- bulletin-active-filter.js require edildi.
- bugün/yarın tarih filtresinden sonra aktif maç filtresi uygulandı.
- data/two-day-bulletin.json içine yalnızca aktif maçlar yazılır.
- removed_finished_count alanı eklendi.
- outputs/two-day-bulletin-report.md içine ham maç, aktif maç ve düşürülen maç sayısı yazılır.

Commit:
bff401c16d8295d82ec9c5f56516b338d8bac3eb

### 4. site-bulletin-active-guard.js

Canlı site tarafı için güvenlik filtresi eklendi.

Görevi:
- spor_toto_bulteni.json ve two-day-bulletin.json fetch edildiğinde matches listesini ikinci kez kontrol eder.
- finished/cancelled/postponed maçları tarayıcı tarafında da filtreler.
- Backend eski JSON verse bile site tarafında biten maçın görünmesini engeller.

Commit:
50f4d159326d9ce9377557bdbaca0c7d595c75e8

### 5. cache-version.js

Yeni site güvenlik filtresi canlı siteye yüklendi.

Yapılanlar:
- cache versiyonu 20260627-bulletin-active-filter-v1 olarak güncellendi.
- site-bulletin-active-guard.js loadScript zincirine eklendi.

Commit:
dee1540d77b985d9b8d8b8e53cc6bd57a3bdc78d

## Bağlantı Haritası

.github/workflows/stage-1-bulletin.yml
→ scripts/update-fixtures.js
→ scripts/bulletin-active-filter.js
→ data/spor_toto_bulteni.json
→ spor-toto-dashboard.js / site-bulletin-active-guard.js
→ Canlı site bülten görünümü

.github/workflows/stage-1-bulletin.yml
→ scripts/two-day-bulletin-window.js
→ scripts/bulletin-active-filter.js
→ data/two-day-bulletin.json
→ site-bulletin-active-guard.js
→ Canlı site iki günlük bülten görünümü

## Kırmadan Korunan Noktalar

- data/fixtures.json ham ana veri olarak korunur.
- Biten maçlar fixtures içinde kalabilir; sadece bülten görünümünden düşer.
- Ana workflow zinciri değiştirilmedi.
- Canlı veri / fixture / kart workflowları değiştirilmedi.
- Site tarafında eski JSON/cache ihtimaline karşı ek koruma kondu.

## Beklenen Sonuç

Bir maç status olarak finished, cancelled veya postponed olduğunda:

1. data/spor_toto_bulteni.json içine alınmaz.
2. data/two-day-bulletin.json içine alınmaz.
3. Eski JSON gelse bile site-bulletin-active-guard.js tarayıcı tarafında filtreler.
4. Canlı sitede bülten alanında biten karşılaşma görünmez.

## Not

Veri çıktıları workflow çalıştığında yenilenir. update-fixtures/live-data akışları 15 dakikalık döngüde, Stage 1 Bulletin Flow ise belirlenen Türkiye saatlerinde çalışır.
