# Workflow Tetikleme ve Bülten Kontrol Raporu

Tarih: 2026-06-27
Konu: Bülten yenileniyor mu, maçlar siteye düşüyor mu kontrolü

## Yapılan Kontrol

update-fixtures workflow tetikleme yolu kontrol edildi.

Kanıt:
.github/workflows/update-fixtures.yml içinde push tetikleyicisi vardır:
- branches: main
- paths: ops/main-run.txt

Bu nedenle ops/main-run.txt dosyası iki kez güncellendi:

1. 16 -> 17
Commit: 6f4fbc6cf9da210ce90be37241f6d8b823f602a2

2. 17 -> 18
Commit: 519789f773344490d6dd61f15c843376aef645d0

## Kontrol Sırasında Bulunan Kritik Durum

data/spor_toto_bulteni.json dosyasında Git conflict işaretleri vardı:
- <<<<<<< Updated upstream
- =======
- >>>>>>> Stashed changes

Bu durum JSON dosyasını bozduğu için canlı site bülten alanının sağlıklı okumasını engelleyebilirdi.

Dosya geçerli JSON olacak şekilde temizlendi.

Fix commit:
4a1d6191fd9ea2d0ad2f424b405cc9698fa8ee19

## Son Veri Durumu

Kontrol sonunda:

- data/fixtures.json: []
- data/spor_toto_bulteni.json: geçerli JSON, match_count 0, matches []
- data/two-day-bulletin.json: match_count / total_matches 0, matches []

Bu nedenle mevcut durumda canlı sitede bültene düşecek maç görünmüyor.

## Workflow Durumu

Trigger commitleri atıldı; update-fixtures.yml dosyası ops/main-run.txt değişikliğine göre çalışacak şekilde ayarlı.
Ancak son kontrol edilen veri dosyalarında maç listesi dolmadı.

Daha önceki otomatik update commit kayıtlarında Maçkolik kaynağından 27.06.2026 için çok sayıda maç okunabildiği fakat kaydedilen maç sayısının 0 kaldığı görülüyor. Bu nedenle sorun saat filtresinden çok veri kaydetme / parse sonrası kayıt zincirinde olabilir.

## Net Sonuç

- Workflow tetikleme dosyası çalıştırıldı.
- JSON conflict temizlendi.
- Bülten JSON geçerli hale getirildi.
- Fakat maçlar şu an bültene düşmedi.
- Site tarafında bülten yenilenmiş geçerli JSON okur ama matches boş olduğu için maç göstermez.

## Sonraki Teknik Odak

Maçların Maçkolik kaynağından okunup neden data/fixtures.json içine kaydedilmediği kontrol edilmeli.
Öncelikli dosyalar:
- scripts/update-fixtures.js
- scripts/import-robot-raw-pool.js
- data/fixtures.json
- outputs/mackolik_veri_cekme_raporu.md
