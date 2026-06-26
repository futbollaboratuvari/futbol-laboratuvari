# 2026-06-26 Analiz Sonuçları Köprüsü Kaydı

## Aşama

Canlı veri kontrolünden sonra sıradaki aşama başlatıldı: robot analizlerinin siteye yansıması.

## Tespit

- `data/robot-analysis.json` içinde maçlar ve analiz alanları oluşuyordu.
- `data/analiz_sonuclari.json` içinde `active_items` boş kaldığı için ana sayfadaki Maç Yorumları ve Günün Seçimi alanları dolmuyordu.
- Site tarafındaki `script.js` aktif analizleri `data/analiz_sonuclari.json` dosyasından okuyordu.

## Yapılan İş

Yeni dosya eklendi:

- `scripts/sync-analysis-results.js`

Bu dosya:

1. `data/robot-analysis.json` dosyasını okur.
2. Gerekirse `data/live-matches.json` dosyasını yedek kaynak olarak kullanır.
3. Robot analizlerini `active_items` formatına dönüştürür.
4. `data/analiz_sonuclari.json` dosyasını siteye uygun biçimde doldurur.
5. `completed_items` geçmişini korur.

## Bağlantı

`package.json` içindeki komut zincirine eklendi:

- `export:live`
- `update:all`

Yeni zincirde `sync-analysis-results.js`, `ensure-live-json.js` sonrasında çalışır.

## Kural

Dosyalar kırılmadan bağlandı. Eski veri üretim dosyaları silinmedi. Yeni köprü dosyası mevcut çıktıları site formatına çevirir.

## Sıradaki Kontrol

Actions yeni zinciri çalıştırınca şu kontrol yapılacak:

- `data/analiz_sonuclari.json` içindeki `active_items` artık doluyor mu?
- Ana sayfadaki Maç Yorumları ve Günün Seçimi alanları robot analizinden besleniyor mu?
- Kupon kartları için `daily-coupons.json` hâlâ boşsa bir sonraki aşamada ayrı kupon fallback/aday seçme düzeltmesi yapılacak.
