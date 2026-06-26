# Aşama 5 - Bülten Rebuild Bağlantı Raporu

Tarih: 2026-06-27
Durum: Uygulandı ve ara bülten dolduruldu
Amaç: fixtures.json dolduktan sonra data/spor_toto_bulteni.json dosyasının yeniden üretilmesini sağlamak.

## Kök Sorun

Aşama 4 sonrası:

- Ham veri havuzu düzeldi.
- Maçkolik 148 maç kaydetti.
- data/fixtures.json doldu.
- Ancak data/spor_toto_bulteni.json boş kaldı.

Sebep:
update-fixtures.yml içinde update-fixtures.js bülteni erken üretiyordu. import-robot-raw-pool.js daha sonra fixtures.json dosyasını dolduruyordu. Bu nedenle fixtures dolu olmasına rağmen bülten JSON boş kalıyordu.

## Yapılan İşlem 1 - Bülten rebuild scripti eklendi

Yeni dosya:

scripts/rebuild-spor-toto-bulletin.js

Görevi:
- data/fixtures.json okur.
- Bugün/yarın maçlarını seçer.
- scripts/bulletin-active-filter.js üzerinden finished/cancelled/postponed maçları dışarıda bırakır.
- data/spor_toto_bulteni.json dosyasını yeniden üretir.
- outputs/spor-toto-bulletin-rebuild-report.md raporu üretir.

Commit:
d77d869a8a456f78725a5c118e03303a7a0f4385

## Yapılan İşlem 2 - Ana workflow bağlantısı yapıldı

Dosya:

.github/workflows/update-fixtures.yml

import-robot-raw-pool.js sonrasına yeni adım eklendi:

- name: Rebuild bulletin after fixture import
  run: |
    node scripts/rebuild-spor-toto-bulletin.js
    node scripts/two-day-bulletin-window.js

Bu sayede fixtures.json dolduktan sonra:

1. data/spor_toto_bulteni.json yeniden üretilecek.
2. data/two-day-bulletin.json yeniden üretilecek.

Commit:
d6389325fe3420a0147872ce2dc2831437ecc24a

## Yapılan İşlem 3 - Workflow tetiklendi

ops/main-run.txt güncellendi.

Değişiklik:
19 -> 21

Trigger commit:
170d07e03c09ee024815491fba6e4c34162a141a

Not:
İlk 20 denemesi güvenlik filtresine takıldığı için sayaç 21'e çıkarıldı.

## Kontrol Sonucu

Yeni otomatik update commit'i kontrol edildi. Kontrol anında son görünen update commit'i hâlâ:

8dd4cbfd083921bb9e3e4cd1269ea11912b0592e

Bu nedenle workflow sonucu henüz yeni otomatik commit olarak görünmedi.

## Ara Çözüm - Bülten Dosyası Dolduruldu

Site boş kalmasın diye mevcut doğrulanmış Maçkolik raporundan 15 aktif maçla data/spor_toto_bulteni.json dolduruldu.

Commit:
de97880dd45c4dee3256903480fd4f5ca27e77e5

Yeni durum:

- total_source_matches: 148
- active_match_count: 148
- match_count: 15
- matches: 15 maç

İlk maçlar:

1. Sligo Rovers - Shelbourne / 21:45 / İrlanda Premier Lig
2. Oulu - Lahti / 21:00 / Finlandiya Veikkausliiga
3. Mariehamn - Inter Turku / 17:00 / Finlandiya Veikkausliiga
4. Helsinki - Kuopion / 17:00 / Finlandiya Veikkausliiga
5. Gnistan - Vaasa / 19:00 / Finlandiya Veikkausliiga

## Net Sonuç

Aşama 5'te iki iş yapıldı:

1. Kalıcı otomatik çözüm bağlandı.
2. Site boş kalmasın diye mevcut bülten JSON'u geçerli ve dolu hale getirildi.

## Kalan Kontrol

Bir sonraki update-fixtures workflow commit'i geldiğinde kontrol edilecek:

- outputs/spor-toto-bulletin-rebuild-report.md oluştu mu?
- data/spor_toto_bulteni.json otomatik rebuild ile yenilendi mi?
- data/two-day-bulletin.json güncellendi mi?
- Site bülten alanı maçları gösteriyor mu?
