# 2026-06-27 Asama 1 Full Bulletin Veri Modeli

## Is

Tam iddaa bulteni icin analiz ve kupon sisteminden bagimsiz yeni veri modeli olusturuldu.

## Eklenen Dosya

- `data/full-bulletin.json`

## Amac

Bu dosya Nesine benzeri mac bulteni icin tek temiz veri kaynagi olacak.

## Icerik

Dosyada su ana alanlar var:

- `generated_at`
- `timezone`
- `source`
- `status`
- `message`
- `date_window`
- `match_count`
- `live_count`
- `scheduled_count`
- `finished_count`
- `matches`

Her mac icin hedef alanlar:

- `date`
- `time`
- `league`
- `home`
- `away`
- `matchCode`
- `status`
- `minute`
- `score`
- `odds.ms1`
- `odds.msx`
- `odds.ms2`
- `odds.under25`
- `odds.over25`
- `odds.bttsYes`
- `odds.bttsNo`

## Guvenlik

Mevcut site dosyalari degistirilmedi. Sadece yeni veri dosyasi eklendi.

## Commit

- `91f264159f5a82c813b9d7741814c11e224cf28d`
