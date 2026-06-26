# 2026-06-26 Active Items Kontrol Sonucu

## Kontrol edilen dosya

- `data/analiz_sonuclari.json`

## Sonuç

`active_items` artık doluyor.

Kontrol edilen güncel durum:

- `generated_at`: `2026-06-26T03:15:44.672Z`
- `status`: `active`
- `fixture_count`: `55`
- `scored_match_count`: `55`
- `active_item_count`: `55`
- `coupon_candidate_count`: `0`
- `watch_candidate_count`: `0`

## Kanıt

Dosyada `active_items` dizisi açılıyor ve ilk kayıt `auto-1` olarak görünüyor.

İlk örnek kayıt:

- Maç: `Botev Plovdiv VS Arda Kardzhali`
- Seçenek: `Değerli market yok`
- Karar: `Oynama`
- Güven: `0%`
- Risk: `Yüksek`

## Teknik yorum

Köprü bağlantısı çalıştı. Robot analiz verisi artık `data/analiz_sonuclari.json` içine `active_items` olarak yazılıyor.

Ancak analiz kalitesi henüz yeterli değil:

- 55 aktif kayıt oluştu.
- Kupon adayı oluşmadı.
- İzleme adayı oluşmadı.
- İlk kayıt `Değerli market yok / Oynama / 0%` olarak geldi.

## Sıradaki aşama

`active_items` dolduğu için sonraki iş, bu kayıtların site kartlarında doğru görünmesini ve robotun neden kupon/izleme adayı üretmediğini kontrol etmektir.
