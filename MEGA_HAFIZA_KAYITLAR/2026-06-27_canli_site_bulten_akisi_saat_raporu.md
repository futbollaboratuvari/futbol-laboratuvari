# Canlı Site Bülten Akışı Saat Raporu

Tarih: 2026-06-27
Konu: Canlı sitede bülten akışının otomatik hangi saatte başladığının kontrolü
İşlem türü: Sadece inceleme ve rapor kaydı

## Net Sonuç

Canlı sitedeki özel bülten akışı için ana otomatik başlangıç saati:

- 05:10 UTC
- Türkiye saati ile 08:10 Europe/Istanbul

Kanıt dosyası:
.github/workflows/stage-1-bulletin.yml

İlgili cron satırı:
cron: "10 5 * * *"

GitHub Actions schedule cron saatleri varsayılan olarak UTC kabul edilir. Bu nedenle 05:10 UTC, Türkiye saatiyle 08:10 olarak okunur.

## Çapraz Kontrol

Ayrıca canlı veri/fixture/card akışı için ayrı 15 dakikalık otomasyonlar vardır:

- .github/workflows/update-fixtures.yml
  cron: "*/15 * * * *"

- .github/workflows/live-data-trigger.yml
  cron: "*/15 * * * *"

- .github/workflows/card-flow.yml
  cron: "*/15 * * * *"

Bu dosyalar bültenin tek başlangıç saati değil, gün içi canlı veri yenileme döngüsünü gösterir.

## Script Kanıtı

Bülten akışında çalışan ana script:
scripts/update-fixtures.js

Bu script Maçkolik İddaa Programı kaynağını okur:
https://arsiv.mackolik.com/Iddaa-Programi

Script Europe/Istanbul zaman dilimini kullanır ve fixtures.json, ham_mac_havuzu.json, tahmin_gecmisi.json, spor_toto_bulteni.json dosyalarını üretir/günceller.

İki günlük bülten penceresi scripti:
scripts/two-day-bulletin-window.js

Bu script bugün ve yarın tarihli maçları data/two-day-bulletin.json içine taşır.

## Mevcut Veri Durumu

Kontrol sırasında mevcut kayıtlar:

- data/fixtures.json: boş liste []
- data/bulletin-health-status.json: status "empty"
- Kaynak: "Maçkolik canlı veri bekleniyor"
- data/two-day-bulletin.json: toplam maç 0

Bu durum, otomasyon saatlerinin tanımlı olduğunu ancak son kontrolde bülten verisinin canlı dolmadığını gösterir.

## Kısa Özet

- Ana bülten başlangıcı: 08:10 Türkiye saati
- Gün içi yenileme: 15 dakikada bir
- Mevcut veri durumu: boş / Maçkolik canlı veri bekleniyor
- Canlı site veya kod dosyalarında değişiklik yapılmadı; sadece mega hafıza kayıt dosyası oluşturuldu.
