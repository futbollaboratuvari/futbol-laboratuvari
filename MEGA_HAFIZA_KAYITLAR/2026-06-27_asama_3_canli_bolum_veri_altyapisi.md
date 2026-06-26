# 2026-06-27 Asama 3 Canli Bolum Veri Altyapisi

## Amac

Tam iddaa bulteni projesinde siradaki asama baslayan karsilasmalar icin canli bolum veri altyapisini kurmaktir.

Bu asamada site arayuzu degistirilmedi. Once veri dosyasi ve veri uretim scripti kuruldu.

## Eklenen Veri Dosyasi

- `data/live-now.json`

Bu dosya baslayan maclari ve yaklasan maclari tasiyacak.

Ana alanlar:

- `generated_at`
- `timezone`
- `source`
- `status`
- `message`
- `live_count`
- `upcoming_count`
- `matches`
- `upcoming_matches`

## Eklenen Script

- `scripts/build-live-now.js`

Bu scriptin gorevi:

1. `data/full-bulletin.json` dosyasini okur.
2. Yedek olarak `data/live-matches.json` dosyasini da okur.
3. Bugunun baslayan maclarini hesaplar.
4. Status `live` ise canli bolume alir.
5. Mac saati baslamis ve 130 dakikalik pencere icindeyse canli kabul eder.
6. 90 dakika icinde baslayacak maclari `upcoming_matches` alanina ekler.
7. Sonucu `data/live-now.json` dosyasina yazar.

## Paket Baglantisi

`package.json` icine yeni komut eklendi:

- `build:live`

Ayrica su zincirlere baglandi:

- `update:fixtures`
- `build:bulletin`
- `update:all`

## Guvenlik

- `index.html` degistirilmedi.
- Frontend dosyalari degistirilmedi.
- Mevcut analiz, kupon ve bulten dosyalari silinmedi.
- Canli bolum sadece yeni JSON dosyasi olarak hazirlandi.

## Commitler

- Canli bolum veri modeli: `97ba476aa5921a38ef17363ce950954e69b14148`
- Canli bolum scripti: `2cf18bc5e623ecea5f2f03a29a7bf93410a5995c`
- Paket zinciri baglantisi: `89fe0627a24eb3457283e608a93b64e668dba8df`

## Sonraki Adim

Actions calistiktan sonra kontrol edilecek dosya:

- `data/live-now.json`

Beklenen sonuc:

- Baslayan mac varsa `matches` dolacak.
- Baslayan mac yoksa `matches` bos kalacak, ama `upcoming_matches` yaklasan maclari gosterecek.

Aşama 4'e gecmeden once bu dosyanin dogru uretildigi kontrol edilecek.
